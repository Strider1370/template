// web/app/api/parse/route.ts — 자연어 입력 → 구조화 프로필 (OpenAI/ChatGPT)
// 키 없거나 실패하면 { ok:false } → 클라이언트가 드롭다운 폴백으로 전환.

import { NextResponse } from 'next/server';
import { openaiChat } from '@/lib/llm';
import type { HouseholdType } from '@/lib/types';

const SYSTEM = `너는 한국 복지 안내 서비스의 입력 파서다. 사용자가 자유롭게 쓴 가족 상황을 구조화 JSON으로만 변환한다.
반드시 아래 형식의 JSON 객체 하나만 출력한다:
{
  "householdTypes": ["infant"|"youth"|"senior"|"single_parent"|"multi_child"|"general", ...],
  "region": "시/도 이름 또는 빈 문자열",
  "district": "시/군/구 이름 또는 빈 문자열",
  "monthlyIncome": 숫자(만원 단위) 또는 null,
  "householdSize": 숫자,
  "youngestChildAgeMonths": 숫자(개월) 또는 null,
  "applicantAge": 숫자(만나이) 또는 null
}
규칙:
- householdTypes 는 반드시 위 영문 코드만 사용. 영유아/아기→infant, **나이가 만19~34세이면 youth**(1인이면 더 확실), **만65세 이상이면 senior**, 한부모→single_parent. 자녀·청년·노년 어디에도 안 들어가면 general.
- multi_child(다자녀)는 **자녀가 2명 이상이라고 명시된 경우에만** 추가. 아기 1명·자녀 1명이면 절대 넣지 마라.
- monthlyIncome: **월 소득**을 '만원' 단위 숫자로. "월 350만원"·"월소득 350"→350. **연봉/연소득이면 12로 나눠 월로 환산**(예: "연봉 4000만원"→333, "연 6000"→500). 원 단위 금지. 없으면 null.
- region: 시/도·도시 언급이 있으면 그 이름(예: "서울 사는"→"서울", "부산"→"부산"). 없으면 "".
- district: 시/군/구 언급이 있으면 그 이름(예: "강서구"→"강서구", "수원시"→"수원시"). 없으면 "".
- youngestChildAgeMonths: "N개월 아기"→N, "N살/세 아이"→N*12. 자녀 언급 없으면 null.
- householdSize: "부부"→2, "혼자/1인"→1, 자녀 수 합산. 모르면 1.
- applicantAge: "30대"→30, "26살"→26. 없으면 null.
- 자격 판정은 하지 말고 입력 사실만 구조화.

예시 입력: "26살 혼자 사는 청년, 월 180만원, 부산 해운대구"
예시 출력: {"householdTypes":["youth"],"region":"부산","district":"해운대구","monthlyIncome":180,"householdSize":1,"youngestChildAgeMonths":null,"applicantAge":26}`;

const VALID: HouseholdType[] = ['infant', 'youth', 'senior', 'single_parent', 'multi_child', 'general'];

// 한국어 단서 → 가구유형 보정 (LLM이 코드 외 값을 줄 때 대비)
function normalizeTypes(arr: unknown, text: string): HouseholdType[] {
  const out = new Set<HouseholdType>();
  if (Array.isArray(arr)) for (const v of arr) if (VALID.includes(v as HouseholdType)) out.add(v as HouseholdType);
  const t = text;
  if (/영유아|아기|영아|유아|출산|신생아/.test(t)) out.add('infant');
  if (/청년/.test(t)) out.add('youth');
  if (/노인|어르신|65세|기초연금/.test(t)) out.add('senior');
  if (/한부모|미혼모|미혼부/.test(t)) out.add('single_parent');
  if (/다자녀|세\s*자녀|아이 ?셋|자녀 ?[3-9]/.test(t)) out.add('multi_child');
  if (out.size > 1) out.delete('general'); // 구체 유형이 있으면 중복 'general' 제거
  return [...out];
}

// 원 단위로 오면 만원으로 환산 (예: 3500000 → 350)
function normIncome(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return v >= 100000 ? Math.round(v / 10000) : Math.round(v);
}

export async function POST(req: Request) {
  let text = '';
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_request' });
  }
  if (!text || !text.trim()) return NextResponse.json({ ok: false, reason: 'empty' });

  const raw = await openaiChat({ system: SYSTEM, user: text, json: true, maxTokens: 300, temperature: 0 });
  if (!raw) return NextResponse.json({ ok: false, reason: 'no_key_or_error' });

  try {
    const jsonStr = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
    const p = JSON.parse(jsonStr);
    const profile = {
      householdTypes: normalizeTypes(p.householdTypes, text),
      region: typeof p.region === 'string' ? p.region : '',
      district: typeof p.district === 'string' ? p.district : '',
      monthlyIncome: normIncome(p.monthlyIncome),
      householdSize: Number.isFinite(p.householdSize) ? Number(p.householdSize) : 1,
      youngestChildAgeMonths:
        typeof p.youngestChildAgeMonths === 'number' ? p.youngestChildAgeMonths : null,
      applicantAge: typeof p.applicantAge === 'number' ? p.applicantAge : null,
    };
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ ok: false, reason: 'parse_failed' });
  }
}
