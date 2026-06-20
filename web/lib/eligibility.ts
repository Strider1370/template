// web/lib/eligibility.ts — 결정론적 자격 매칭 엔진 (Data Agent 소유)
//
// 자격 '판정'은 전적으로 여기(순수 함수)에서 한다. AI는 일절 관여하지 않는다.
// 각 혜택의 모든 규칙을 통과하면 '해당', 충족 조건(met)과 확정 근거(factualBasis)를 반환.

import { BENEFITS, buildContext } from './benefits';
import type { MatchResult, Profile } from './types';

/**
 * 프로필 → 해당되는 혜택 목록(결정론적).
 * @returns 해당되는 MatchResult 배열 (met: 충족 조건 설명, factualBasis: AI rewrite 입력)
 */
export function matchBenefits(profile: Profile): MatchResult[] {
  const ctx = buildContext(profile);
  const results: MatchResult[] = [];

  for (const benefit of BENEFITS) {
    const allMet = benefit.rules.every((r) => r.test(profile, ctx));
    if (!allMet) continue;

    const met = benefit.rules.map((r) => r.explain(profile, ctx));
    const amountPart = benefit.amount ? ` 지원 내용: ${benefit.amount}.` : '';
    const factualBasis =
      `'${benefit.name}'(${benefit.agency}) 해당. 충족 조건: ${met.join('; ')}.${amountPart}`;

    results.push({ benefit, met, factualBasis });
  }

  return results;
}

/** 화이트리스트(환각 가드용): 한 혜택 설명에 등장해도 되는 '사실' 토큰들. */
export function factWhitelist(result: MatchResult): string[] {
  const b = result.benefit;
  const tokens = [b.name, b.agency, ...result.met];
  if (b.amount) tokens.push(b.amount);
  return tokens;
}

// ── 적응형 되묻기: 다음에 물어볼 입력 슬롯 선택 (정보이득 근사, LLM 없음) ──
//
// "사람들은 자기 조건이 어떤 정책에 해당하는지 몰라서 못 받는다" → 미입력 때문에
// (하드 탈락이 아니라) 후보에서 빠진 혜택을 가장 많이 '열어줄' 질문 1개를 규칙엔진이 고른다.
// 질문 선택·판정은 전적으로 규칙엔진이 한다(AI는 문구만 다듬을 수 있음 — 별도).

/** 되물을 후보 슬롯 (우선순위 순 — 소득은 이탈 방지로 뒤). */
const QUESTION_SLOTS: (keyof Profile)[] = [
  'youngestChildAgeMonths',
  'applicantAge',
  'householdTypes',
  'monthlyIncome',
];

/** 해당 슬롯이 '미입력'인가 (householdTypes 는 비었거나 'general'만이면 미지정으로 본다). */
function isUnanswered(profile: Profile, slot: keyof Profile): boolean {
  if (slot === 'householdTypes') {
    const arr = profile.householdTypes;
    return arr.length === 0 || (arr.length === 1 && arr[0] === 'general');
  }
  return profile[slot] == null;
}

export interface NextQuestion {
  slot: keyof Profile;
  /** 규칙엔진이 산출한 이유 (사람이 읽음). */
  reason: string;
  /** 이 슬롯을 알면 '후보로 열릴 수 있는' 혜택명들 (정직성: 단정 아님, 조건부). */
  unlockableBenefits: string[];
}

/**
 * 미응답 슬롯 중, 그 값을 알면 '미입력 때문에 막혔던' 후보 혜택을 가장 많이 여는 슬롯을 고른다.
 * 후보가 없으면 null. (자격 판정·질문 선택 모두 결정론적 — 환각 없음)
 */
export function nextBestQuestion(profile: Profile): NextQuestion | null {
  const ctx = buildContext(profile);
  const unanswered = new Set<keyof Profile>(
    QUESTION_SLOTS.filter((s) => isUnanswered(profile, s)),
  );
  if (unanswered.size === 0) return null;

  // 슬롯 → (그 슬롯을 알면 열릴 수 있는 혜택명 집합)
  const opens = new Map<keyof Profile, Set<string>>();
  for (const b of BENEFITS) {
    const failing = b.rules.filter((r) => !r.test(profile, ctx));
    if (failing.length === 0) continue; // 이미 매칭됨

    // 모든 실패 규칙이 '미입력 때문'이어야(= 하드 탈락 아님) 잠재 후보로 본다.
    const allSoft = failing.every(
      (r) => (r.slots ?? []).length > 0 && (r.slots ?? []).every((s) => unanswered.has(s)),
    );
    if (!allSoft) continue;

    for (const r of failing) {
      for (const s of r.slots ?? []) {
        if (!unanswered.has(s)) continue;
        if (!opens.has(s)) opens.set(s, new Set());
        opens.get(s)!.add(b.name);
      }
    }
  }
  if (opens.size === 0) return null;

  // 가장 많은 후보를 여는 슬롯 (동률이면 QUESTION_SLOTS 우선순위 — 소득은 뒤).
  let best: keyof Profile | null = null;
  for (const s of QUESTION_SLOTS) {
    if (!opens.has(s)) continue;
    if (best === null || opens.get(s)!.size > opens.get(best)!.size) best = s;
  }
  if (best === null) return null;

  const names = [...opens.get(best)!];
  return {
    slot: best,
    reason: `이 정보를 확인하면 해당될 수 있는 혜택 ${names.length}건이 더 정확해져요`,
    unlockableBenefits: names,
  };
}
