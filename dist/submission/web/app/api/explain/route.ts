// web/app/api/explain/route.ts — 규칙엔진 확정 텍스트 → 자연스러운 한 줄 설명 (AI Agent 소유)
// AI는 '다듬기(rewrite)'만. 새 사실(혜택명·금액·조건) 생성 금지.
// 출력은 화이트리스트 검증을 통과해야 ok:true. 실패 시 ok:false → 클라이언트 폴백 템플릿.

import { NextResponse } from 'next/server';
import { validateExplanation } from '@/lib/ai';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

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

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: 'no_key' });

  // 화이트리스트 = 확정 사실 토큰
  const whitelist = [benefitName, ...met, ...(amount ? [amount] : [])];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system: SYSTEM,
        messages: [{ role: 'user', content: `확정된 사실: ${factualBasis}` }],
      }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, reason: 'api_error' });
    const data = await res.json();
    const out: string = (data?.content?.[0]?.text ?? '').trim();

    // 환각 가드: 새 숫자가 섞이면 거부 → 폴백
    if (!validateExplanation(out, whitelist)) {
      return NextResponse.json({ ok: false, reason: 'validation_failed' });
    }
    return NextResponse.json({ ok: true, text: out });
  } catch {
    return NextResponse.json({ ok: false, reason: 'exception' });
  }
}
