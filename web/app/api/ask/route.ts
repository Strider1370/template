// web/app/api/ask/route.ts — 되묻기 질문 '문구'를 자연스럽게 다듬는다 (OpenAI/ChatGPT)
// 어떤 슬롯을 물을지는 규칙엔진(nextBestQuestion)이 이미 정함 — AI는 그 질문을 따뜻한 한 문장으로
// rewrite만 한다. 혜택명·금액·자격을 새로 만들지 않는다. 키 없거나 실패하면 { ok:false } → 폴백 문구.

import { NextResponse } from 'next/server';
import { openaiChat } from '@/lib/llm';

const SYSTEM = `너는 한국 복지 안내 서비스의 질문 도우미다. 주어진 '확인하려는 항목' 문장을 사용자에게 더 자연스럽고 부드럽게 다듬어라.
규칙(중요):
- **묻는 대상을 절대 바꾸지 마라.** 소득을 물으면 소득만, 나이를 물으면 나이만, 자녀 월령을 물으면 그것만. 다른 것(직장 유무 등)으로 바꾸면 안 된다.
- 한 문장, 40자 내외, 물음표로 끝낸다.
- 자격을 단정하지 마라("해당됩니다" 금지). 정보를 확인하는 질문일 뿐.
- 혜택명·금액·새 조건을 지어내지 마라.
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

  const out = await openaiChat({
    system: SYSTEM,
    user: `확인하려는 항목: ${baseQuestion}`,
    maxTokens: 80,
    temperature: 0,
  });
  // 가드: 한 문장 질문만 (길이 제한 + 물음표). 아니면 폴백.
  if (!out || out.length > 120 || !out.includes('?')) {
    return NextResponse.json({ ok: false, reason: 'no_key_or_validation' });
  }
  return NextResponse.json({ ok: true, text: out });
}
