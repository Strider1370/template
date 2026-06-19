// web/app/api/ask/route.ts — 되묻기 질문 '문구'를 자연스럽게 다듬는다 (AI Agent 소유)
// 어떤 슬롯을 물을지는 규칙엔진(nextBestQuestion)이 이미 정함 — AI는 그 질문을 따뜻한 한 문장으로
// rewrite만 한다. 혜택명·금액·자격을 새로 만들지 않는다. 키 없거나 실패하면 { ok:false } → 폴백 문구.

import { NextResponse } from 'next/server';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const SYSTEM = `너는 한국 복지 안내 서비스의 질문 도우미다. 주어진 '확인하려는 항목'을 사용자에게 자연스럽고 부드럽게 되묻는 한국어 질문 한 문장으로 만들어라.
규칙:
- 한 문장, 40자 내외, 물음표로 끝낸다.
- 자격을 단정하지 마라("해당됩니다" 금지). 그냥 정보를 확인하는 질문.
- 혜택명·금액·새로운 조건을 지어내지 마라. 주어진 항목만 물어라.
- 질문만 출력(설명·따옴표 없이).`;

export async function POST(req: Request) {
  let baseQuestion = '';
  try {
    ({ baseQuestion } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' });
  }
  if (!baseQuestion || !baseQuestion.trim()) {
    return NextResponse.json({ ok: false, reason: 'empty' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: 'no_key' });

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
        max_tokens: 120,
        system: SYSTEM,
        messages: [{ role: 'user', content: `확인하려는 항목: ${baseQuestion}` }],
      }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, reason: 'api_error' });
    const data = await res.json();
    const out: string = (data?.content?.[0]?.text ?? '').trim();
    // 가드: 한 문장 질문만 (길이 제한 + 물음표). 아니면 폴백.
    if (!out || out.length > 120 || !out.includes('?')) {
      return NextResponse.json({ ok: false, reason: 'validation_failed' });
    }
    return NextResponse.json({ ok: true, text: out });
  } catch {
    return NextResponse.json({ ok: false, reason: 'exception' });
  }
}
