// web/lib/ai.ts — AI 통역 레이어 + 폴백 (AI Agent 소유)
//
// 원칙: AI는 (1) 자연어 입력 구조화 (2) 규칙엔진이 확정한 텍스트 다듬기(rewrite)만.
// 자격 판정·사실(혜택명·금액) 생성은 절대 안 한다. 키 없거나 실패하면 폴백으로 100% 동작.

import type { Explanation, MatchResult, Profile } from './types';
import explainCache from './explain-cache.json';

// ── 폴백 설명 (AI 없이도 항상 동작) ──────────────────────────────
/**
 * 규칙엔진 결과로부터 설명 문장 생성. 사전 작성 캐시(사실 기반)를 우선 쓰고,
 * 없으면 met 조건으로 템플릿 생성. 둘 다 fixture 사실만 — 지어내지 않는다.
 */
export function fallbackExplanation(result: MatchResult): Explanation {
  const cached = (explainCache as Record<string, string>)[result.benefit.id];
  if (cached) return { text: cached, source: 'fallback' };

  const why = result.met.join(', ');
  const amount = result.benefit.amount ? ` (${result.benefit.amount})` : '';
  return {
    text: `${result.benefit.name}: ${why} 조건을 충족해 해당됩니다${amount}.`,
    source: 'fallback',
  };
}

// ── 환각 가드: AI 설명이 fixture 사실만 쓰는지 검증 ──────────────
/** 텍스트에서 숫자/금액 토큰 추출 (예: "100만원", "65", "80%") */
export function extractNumberTokens(text: string): string[] {
  const matches = text.match(/\d[\d,]*\s*(만원|원|%|세|개월|명|만)?/g) ?? [];
  return matches.map((m) => m.replace(/\s+/g, ''));
}

const bareNumber = (t: string) => t.replace(/[^\d]/g, '');

/**
 * AI 설명 검증: 출력의 모든 숫자가 화이트리스트(확정 사실)의 숫자 집합에
 * **정확히** 존재해야 통과. 새 숫자/금액을 지어내면 false → 호출부가 폴백으로 대체.
 * (substring 아닌 정확 일치 — "200"이 "20"을 통과시키는 허점 방지.)
 */
export function validateExplanation(text: string, whitelist: string[]): boolean {
  if (!text || !text.trim()) return false;
  if (text.length > 120) return false; // 한 문장 제약 — 환각 장문 방지

  const allowed = new Set(
    whitelist.flatMap((w) => extractNumberTokens(w).map(bareNumber)).filter(Boolean),
  );
  const tokens = extractNumberTokens(text).map(bareNumber).filter(Boolean);
  for (const t of tokens) {
    if (!allowed.has(t)) return false; // 화이트리스트에 없는 숫자 = 환각 → 거부
  }
  return true;
}

// ── 클라이언트 호출 헬퍼 (타임아웃 + 폴백) ───────────────────────
const TIMEOUT_MS = 8000;

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 자연어 → 구조화 프로필. 실패/무키 시 null (UI는 드롭다운 폴백). */
export async function requestParse(text: string): Promise<Partial<Profile> | null> {
  const data = await postJson<{ ok: boolean; profile?: Partial<Profile> }>(
    '/api/parse',
    { text },
  );
  if (!data?.ok || !data.profile) return null;
  return data.profile;
}

/** 확정 텍스트를 자연스러운 설명으로 rewrite. 실패/검증실패 시 폴백 템플릿. */
export async function requestExplain(result: MatchResult): Promise<Explanation> {
  const data = await postJson<{ ok: boolean; text?: string }>('/api/explain', {
    factualBasis: result.factualBasis,
    benefitName: result.benefit.name,
    met: result.met,
    amount: result.benefit.amount,
  });
  if (data?.ok && data.text) {
    return { text: data.text, source: 'ai' };
  }
  return fallbackExplanation(result);
}
