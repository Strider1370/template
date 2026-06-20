// web/app/api/explain/route.ts — 규칙엔진 확정 텍스트 → 자연스러운 한 줄 설명 (OpenAI/ChatGPT)
// AI는 '다듬기(rewrite)'만. 새 사실(혜택명·금액·조건) 생성 금지.
// 출력은 화이트리스트 검증 통과해야 ok:true. 실패 시 ok:false → 클라이언트 폴백 템플릿.

import { NextResponse } from 'next/server';
import { openaiChat } from '@/lib/llm';
import { validateExplanation } from '@/lib/ai';

const SYSTEM = `너는 한국 복지 안내의 설명 도우미다. 아래 '확정된 사실'을 따뜻하고 이해하기 쉬운 한국어 한 문장으로 다듬어라.
엄격한 규칙:
- 주어진 사실 외에 새로운 혜택명·금액·숫자·조건을 절대 만들지 마라.
- 자격을 단정하거나 보장하지 마라("받을 수 있어요" 정도의 안내 톤).
- 한 문장, 60자 내외. 설명·코드블록 없이 문장만 출력.`;

export async function POST(req: Request) {
  let body: { factualBasis?: string; benefitName?: string; met?: string[]; amount?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' });
  }
  const { factualBasis, benefitName, met = [], amount } = body;
  if (!factualBasis || !benefitName) {
    return NextResponse.json({ ok: false, reason: 'empty' });
  }

  const out = await openaiChat({
    system: SYSTEM,
    user: `확정된 사실: ${factualBasis}`,
    maxTokens: 150,
  });
  if (!out) return NextResponse.json({ ok: false, reason: 'no_key_or_error' });

  // 환각 가드: 새 숫자가 섞이면 거부 → 폴백
  const whitelist = [benefitName, ...met, ...(amount ? [amount] : [])];
  if (!validateExplanation(out, whitelist)) {
    return NextResponse.json({ ok: false, reason: 'validation_failed' });
  }
  return NextResponse.json({ ok: true, text: out });
}
