// web/app/api/parse/route.ts — 자연어 입력 → 구조화 프로필 (AI Agent 소유)
// 키 없거나 실패하면 { ok:false } → 클라이언트가 드롭다운 폴백으로 전환.

import { NextResponse } from 'next/server';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const SYSTEM = `너는 한국 복지 안내 서비스의 입력 파서다. 사용자가 자유롭게 쓴 가족 상황을 구조화 JSON으로만 변환한다.
반드시 아래 형식의 JSON 하나만 출력한다(설명·코드블록 금지):
{
  "householdTypes": ["infant"|"youth"|"senior"|"single_parent"|"multi_child"|"general", ...],
  "region": "시/도 이름 또는 빈 문자열",
  "monthlyIncome": 숫자(만원) 또는 null,
  "householdSize": 숫자,
  "youngestChildAgeMonths": 숫자(개월) 또는 null,
  "applicantAge": 숫자(만나이) 또는 null
}
규칙: 영유아(만2세 미만 자녀)면 infant, 만19~34세 1인이면 youth, 만65세 이상이면 senior, 한부모면 single_parent, 자녀 2명 이상이면 multi_child. 모르면 합리적 기본값. 자격 판정은 하지 말고 입력 사실만 구조화.`;

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: 'no_key' });

  let text = '';
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' });
  }
  if (!text || !text.trim()) return NextResponse.json({ ok: false, reason: 'empty' });

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
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: 'user', content: text }],
      }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, reason: 'api_error' });
    const data = await res.json();
    const raw: string = data?.content?.[0]?.text ?? '';
    const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
    const profile = JSON.parse(jsonStr);
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ ok: false, reason: 'parse_failed' });
  }
}
