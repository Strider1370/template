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
