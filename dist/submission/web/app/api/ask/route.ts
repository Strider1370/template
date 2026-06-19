// POST /api/ask — 자연어 자격 Q&A + 개인화 브리핑 (AI Agent 소유).
//
// 계약: 요청 { weeks:number, region?:string, question?:string }
//       → 응답 { answer:string, benefitIds:string[], source:"llm"|"fallback" }
//
// 서버에서 benefits.json을 fs로 읽어 제도 JSON 전체를 LLM 컨텍스트로 주입한다.
// Anthropic 키 없음 / fetch 실패 / 5초 타임아웃 → 규칙 브리핑 + qa.json fixture 폴백(본질 장면 cut 금지).
// 데이터셋 밖 수치 생성 0(환각 차단).

import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import type { Benefit, BenefitsDataset } from '@/lib/benefits';
import { callLlm, fallbackAnswer, type AskResponse, type QaFixture } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const BENEFITS_PATH = path.join(PUBLIC_DIR, 'data', 'benefits', 'benefits.json');
const FIXTURES_PATH = path.join(PUBLIC_DIR, 'data', 'ai-fixtures', 'qa.json');

/** benefits.json을 fs로 읽음. 없거나 깨지면 빈 배열(graceful). */
async function loadBenefits(): Promise<{ benefits: Benefit[]; raw: string }> {
  try {
    const raw = await fs.readFile(BENEFITS_PATH, 'utf-8');
    const data = JSON.parse(raw) as BenefitsDataset;
    return { benefits: Array.isArray(data.benefits) ? data.benefits : [], raw };
  } catch {
    return { benefits: [], raw: '{"benefits":[]}' };
  }
}

/** qa.json fixture를 fs로 읽음. 없거나 깨지면 빈 배열(graceful). */
async function loadFixtures(): Promise<QaFixture[]> {
  try {
    const raw = await fs.readFile(FIXTURES_PATH, 'utf-8');
    const data = JSON.parse(raw) as QaFixture[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function clampWeeks(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(42, Math.round(n)));
}

export async function POST(req: Request): Promise<Response> {
  let payload: { weeks?: unknown; region?: unknown; question?: unknown } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    // 본문 파싱 실패해도 폴백으로 답이 나오도록 진행
  }

  const weeks = clampWeeks(payload.weeks);
  const region = typeof payload.region === 'string' ? payload.region : null;
  const question = typeof payload.question === 'string' ? payload.question : null;

  const [{ benefits, raw }, fixtures] = await Promise.all([loadBenefits(), loadFixtures()]);
  const params = { weeks, region, question };

  // 1) LLM 시도 (키 없음/실패/5초 타임아웃이면 null)
  const llmText = await callLlm(params, raw);
  if (llmText) {
    const matched = fixtures.find((fx) =>
      fx.matchKeywords.some((kw) => (question ?? '').toLowerCase().includes(kw.toLowerCase())),
    );
    const res: AskResponse = {
      answer: llmText,
      // LLM 답변의 근거 카드: fixture 매칭이 있으면 그 id, 없으면 현재 시기 상위 제도.
      benefitIds: matched ? matched.answerBenefitIds : benefits.slice(0, 4).map((b) => b.id),
      source: 'llm',
    };
    return NextResponse.json(res);
  }

  // 2) 폴백 (항상 답이 나옴 — 본질 장면 보장, 런타임 키 의존 0)
  const res = fallbackAnswer(params, benefits, fixtures);
  return NextResponse.json(res);
}
