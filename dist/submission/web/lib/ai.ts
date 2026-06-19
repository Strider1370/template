// ai.ts — AI 호출/폴백 로직 (AI Agent 소유).
//
// 본질 장면(규칙으로 못 푸는 교차 케이스를 자연어로 물으면 검증된 제도 데이터 안에서만 답)을
// 키 없이도 항상 돌리기 위한 "규칙 기반 브리핑 + qa.json fixture 키워드 매칭" 폴백을 담는다.
// route.ts는 LLM(fetch) 호출만 하고, 실패/타임아웃/키없음이면 이 모듈의 함수로 동일 형태 응답을 만든다.
//
// ⚠️ 데이터셋(benefits.json) 밖 수치는 절대 만들지 않는다 — 폴백도 제도 JSON 값/answer fixture만 인용.

import type { Benefit } from './benefits';

// ── 공통 응답 계약 (POST /api/ask 응답 형태) ──────────────────────────
export type AskResponse = {
  answer: string;
  benefitIds: string[];
  source: 'llm' | 'fallback';
};

// ── AI fixtures 형태 (qa.json) ───────────────────────────────────────
export type QaFixture = {
  q: string;
  matchKeywords: string[];
  answerBenefitIds: string[];
  answer: string;
};

const PREGNANCY_TOTAL_WEEKS = 40;

/** 주차 기반 단계 라벨 (브리핑 문구용). */
function phaseLabel(weeks: number): string {
  if (weeks >= PREGNANCY_TOTAL_WEEKS) return '출산 후';
  if (weeks >= 32) return '출산 임박(임신 후기)';
  if (weeks >= 16) return '임신 중기';
  if (weeks >= 1) return '임신 초기';
  return '임신 준비/확인';
}

/**
 * 규칙 기반 브리핑 — 입력(주차/지역)만으로 "지금 무엇을 해야 하는지" 한 문단.
 * benefits 목록이 주어지면 그 안의 검증된 제도명만 인용(환각 차단). 수치는 만들지 않는다.
 */
export function ruleBriefing(
  weeks: number,
  region: string | null | undefined,
  benefits: Benefit[],
): string {
  const where = region ? `${region} 거주 기준으로 ` : '';
  const phase = phaseLabel(weeks);
  const names = benefits.slice(0, 4).map((b) => b.name);
  const list =
    names.length > 0
      ? `지금 챙겨볼 제도는 ${names.join(', ')}입니다.`
      : '입력하신 시기에 맞는 제도를 시간순으로 정리해 드렸습니다.';
  return (
    `${where}임신 ${weeks}주차(${phase}) 기준으로 안내드립니다. ${list} ` +
    `각 카드의 신청 창과 마감(D-day)을 확인하시고, 마감 임박 제도부터 신청하세요. ` +
    `정확한 금액·자격은 각 제도 카드와 공식 신청처에서 확인하실 수 있습니다.`
  );
}

/**
 * 질문 키워드를 fixture와 매칭. 가장 많이 겹치는 fixture를 반환(없으면 null).
 * 본질 교차 케이스("쌍둥이/다태아 + 고위험 + 전입")를 키 없이도 답하기 위한 핵심.
 */
export function matchFixture(
  question: string | null | undefined,
  fixtures: QaFixture[],
): QaFixture | null {
  if (!question) return null;
  const q = question.toLowerCase();
  let best: QaFixture | null = null;
  let bestScore = 0;
  for (const fx of fixtures) {
    let score = 0;
    for (const kw of fx.matchKeywords) {
      if (kw && q.includes(kw.toLowerCase())) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = fx;
    }
  }
  return bestScore > 0 ? best : null;
}

/**
 * 폴백 응답 조립(키 없음/실패/타임아웃 시). 항상 source:"fallback".
 *  1) 질문이 있으면 fixture 키워드 매칭 → 매칭되면 fixture.answer + answerBenefitIds.
 *  2) 매칭 안 되거나 질문 없으면 규칙 브리핑 + 현재 시기 제도 id.
 */
export function fallbackAnswer(
  params: { weeks: number; region?: string | null; question?: string | null },
  benefits: Benefit[],
  fixtures: QaFixture[],
): AskResponse {
  const matched = matchFixture(params.question, fixtures);
  if (matched) {
    return {
      answer: matched.answer,
      benefitIds: matched.answerBenefitIds,
      source: 'fallback',
    };
  }
  return {
    answer: ruleBriefing(params.weeks, params.region, benefits),
    benefitIds: benefits.slice(0, 4).map((b) => b.id),
    source: 'fallback',
  };
}

// ── Anthropic Messages API (fetch 직접 호출) ─────────────────────────
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 700;
const TIMEOUT_MS = 5000;

const SYSTEM_BASE =
  '너는 한국 임신·출산 정부지원 안내자다. 아래 JSON에 있는 제도만 근거로 답하고, ' +
  '없는 내용은 모른다고 답하라. 금액/자격/기한은 JSON 값 그대로 인용. 추측 금지. ' +
  '답변은 한국어 평이체 한 문단으로, 사용자의 상황(주차·지역·질문)에 맞는 제도만 추려서 안내하라.';

/**
 * LLM 호출. 성공 시 answer 텍스트 반환, 실패/타임아웃/키없음이면 null(→ 호출부가 폴백).
 * 제도 JSON 전체를 system에 컨텍스트로 주입한다(데이터셋 밖 수치 생성 차단).
 */
export async function callLlm(
  params: { weeks: number; region?: string | null; question?: string | null },
  benefitsJson: string,
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null; // 키 없으면 즉시 폴백 (런타임 키 의존 0)

  const userParts: string[] = [`임신 주차: ${params.weeks}주`];
  if (params.region) userParts.push(`거주지: ${params.region}`);
  userParts.push(
    params.question
      ? `질문: ${params.question}`
      : '질문: 지금 내 상황에서 무엇을 신청해야 하나요? 시간순으로 알려주세요.',
  );

  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: `${SYSTEM_BASE}\n\n=== 제도 데이터(JSON) ===\n${benefitsJson}`,
    messages: [{ role: 'user', content: userParts.join('\n') }],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return extractText(data);
  } catch {
    return null; // 타임아웃(abort) 포함 모든 실패 → 폴백
  } finally {
    clearTimeout(timer);
  }
}

/** Messages API 응답에서 첫 text 블록 추출. 형식이 다르면 null. */
function extractText(data: unknown): string | null {
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    const blocks = (data as { content: Array<{ type?: string; text?: string }> }).content;
    const textBlock = blocks.find((b) => b?.type === 'text' && typeof b.text === 'string');
    if (textBlock?.text) return textBlock.text;
  }
  return null;
}
