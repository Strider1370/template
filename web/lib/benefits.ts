// web/lib/benefits.ts — 큐레이션 혜택 fixture + 자격 규칙 (Data Agent 소유)
//
// ⚠️ 예시 데이터(sampleData). 전국 전수가 아니라 대표 혜택 큐레이션.
// 자격요건은 단순화한 임계값(데모용). 실제 확정/지급은 행정기관 심사.
// 출처: 복지로(bokjiro.go.kr)·정부24 공개 제도 정보 기반.
// 금액·조건 등 '사실'은 이 파일에서 확정한다 — AI는 이 값만 다듬어 설명한다(생성 금지).

import type { Benefit, Profile, RuleContext } from './types';

/** 2024 기준중위소득 (월, 만원 단위 근사). 가구원수별. */
const MEDIAN_INCOME_BY_SIZE: Record<number, number> = {
  1: 223,
  2: 368,
  3: 471,
  4: 573,
  5: 670,
  6: 762,
};

/** 가구원수 → 월 기준중위소득(만원). 표 밖이면 6인 기준 + 인당 가산 근사. */
export function medianIncomeFor(householdSize: number): number {
  const size = Math.max(1, householdSize || 1);
  if (MEDIAN_INCOME_BY_SIZE[size]) return MEDIAN_INCOME_BY_SIZE[size];
  return MEDIAN_INCOME_BY_SIZE[6] + (size - 6) * 92;
}

/** 프로필 → 규칙 평가 컨텍스트 */
export function buildContext(p: Profile): RuleContext {
  const medianIncome = medianIncomeFor(p.householdSize);
  const incomeRatio =
    p.monthlyIncome == null ? null : Math.round((p.monthlyIncome / medianIncome) * 100);
  return { medianIncome, incomeRatio };
}

// ── 자격 규칙 헬퍼 (결정론적 술어) ───────────────────────────────

const childYoungerThanMonths = (months: number, ageLabel: string) => ({
  key: `막내 자녀 ${ageLabel}`,
  slots: ['youngestChildAgeMonths'] as (keyof Profile)[],
  test: (p: Profile) =>
    p.youngestChildAgeMonths != null && p.youngestChildAgeMonths <= months,
  explain: (p: Profile) =>
    p.youngestChildAgeMonths != null
      ? `막내 자녀가 ${p.youngestChildAgeMonths}개월로 ${ageLabel} 조건을 충족`
      : `${ageLabel} 자녀가 있어야 함`,
});

const incomeAtMost = (ratioPct: number) => ({
  key: `기준중위소득 ${ratioPct}% 이하`,
  slots: ['monthlyIncome'] as (keyof Profile)[],
  test: (_p: Profile, ctx: RuleContext) =>
    ctx.incomeRatio != null && ctx.incomeRatio <= ratioPct,
  explain: (_p: Profile, ctx: RuleContext) =>
    ctx.incomeRatio != null
      ? `가구 소득이 기준중위소득의 약 ${ctx.incomeRatio}%로 ${ratioPct}% 이하 조건 충족`
      : `기준중위소득 ${ratioPct}% 이하여야 함`,
});

const ageBetween = (min: number, max: number) => ({
  key: `신청자 나이 만 ${min}~${max}세`,
  slots: ['applicantAge'] as (keyof Profile)[],
  test: (p: Profile) =>
    p.applicantAge != null && p.applicantAge >= min && p.applicantAge <= max,
  explain: (p: Profile) =>
    p.applicantAge != null
      ? `신청자 나이가 만 ${p.applicantAge}세로 ${min}~${max}세 조건 충족`
      : `만 ${min}~${max}세여야 함`,
});

const ageAtLeast = (min: number) => ({
  key: `신청자 만 ${min}세 이상`,
  slots: ['applicantAge'] as (keyof Profile)[],
  test: (p: Profile) => p.applicantAge != null && p.applicantAge >= min,
  explain: (p: Profile) =>
    p.applicantAge != null
      ? `신청자 나이가 만 ${p.applicantAge}세로 ${min}세 이상 조건 충족`
      : `만 ${min}세 이상이어야 함`,
});

const hasHouseholdType = (type: Profile['householdTypes'][number], label: string) => ({
  key: label,
  slots: ['householdTypes'] as (keyof Profile)[],
  test: (p: Profile) => p.householdTypes.includes(type),
  explain: () => `${label}에 해당`,
});

const childrenAtLeast = (n: number) => ({
  key: `자녀 ${n}명 이상(다자녀)`,
  slots: ['householdTypes'] as (keyof Profile)[],
  test: (p: Profile) => p.householdTypes.includes('multi_child'),
  explain: () => `다자녀 가구(자녀 ${n}명 이상)에 해당`,
});

// ── 혜택 fixture (대표 10건) ──────────────────────────────────────

export const BENEFITS: Benefit[] = [
  {
    id: 'parental-allowance',
    name: '부모급여',
    agency: '보건복지부',
    summary: '만 0~1세 영아를 키우는 가구에 매월 현금 지원.',
    amount: '만 0세 월 100만원 / 만 1세 월 50만원',
    rules: [childYoungerThanMonths(23, '만 2세 미만')],
    applyChannel: '복지로 또는 주민센터',
    applyHowOneLine: '출생일 포함 60일 이내 복지로 온라인 또는 주민센터 방문 신청.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(부모급여)',
    sampleData: true,
  },
  {
    id: 'first-meet-voucher',
    name: '첫만남이용권',
    agency: '보건복지부',
    summary: '출생 아동에게 바우처(국민행복카드) 일시 지급.',
    amount: '첫째 200만원 / 둘째 이상 300만원 (바우처)',
    rules: [childYoungerThanMonths(11, '만 1세 미만(출생아)')],
    applyChannel: '복지로 또는 주민센터',
    applyHowOneLine: '출생신고와 함께 복지로/주민센터에서 신청, 국민행복카드로 지급.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(첫만남이용권)',
    sampleData: true,
  },
  {
    id: 'child-allowance',
    name: '아동수당',
    agency: '보건복지부',
    summary: '만 8세 미만 아동에게 매월 현금 지원(소득 무관).',
    amount: '월 10만원',
    rules: [childYoungerThanMonths(95, '만 8세 미만')],
    applyChannel: '복지로 또는 주민센터',
    applyHowOneLine: '복지로 온라인 또는 주민센터에서 보호자가 신청.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(아동수당)',
    sampleData: true,
  },
  {
    id: 'diaper-formula',
    name: '기저귀·조제분유 지원',
    agency: '보건복지부',
    summary: '영아 양육 가구에 기저귀·조제분유 구입 비용 바우처.',
    amount: '기저귀 월 9만원 상당 (해당 시 조제분유 추가)',
    rules: [childYoungerThanMonths(23, '만 2세 미만'), incomeAtMost(80)],
    applyChannel: '복지로 또는 보건소',
    applyHowOneLine: '복지로/보건소에서 소득 확인 후 국민행복카드 바우처로 지급.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(기저귀·조제분유)',
    sampleData: true,
  },
  {
    id: 'youth-rent',
    name: '청년월세 특별지원',
    agency: '국토교통부',
    summary: '무주택 청년 1인 가구의 월세 일부를 한시 지원.',
    amount: '월 최대 20만원 (최대 12개월)',
    rules: [ageBetween(19, 34), hasHouseholdType('youth', '청년 가구'), incomeAtMost(60)],
    applyChannel: '복지로 또는 정부24',
    applyHowOneLine: '복지로에서 무주택·소득요건 확인 후 온라인 신청.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(청년월세 특별지원)',
    sampleData: true,
  },
  {
    id: 'basic-pension',
    name: '기초연금',
    agency: '보건복지부',
    summary: '만 65세 이상 어르신 중 소득 하위 70%에 매월 지원.',
    amount: '월 최대 약 34만원 (단독가구 기준)',
    rules: [ageAtLeast(65), hasHouseholdType('senior', '노년 가구'), incomeAtMost(70)],
    applyChannel: '복지로 또는 국민연금공단',
    applyHowOneLine: '복지로/국민연금공단에서 소득인정액 확인 후 신청.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(기초연금)',
    sampleData: true,
  },
  {
    id: 'energy-voucher',
    name: '에너지바우처',
    agency: '산업통상자원부',
    summary: '저소득 취약가구의 냉·난방 에너지 비용 지원.',
    amount: '가구원수별 연간 차등 (예: 여름·겨울 합산)',
    rules: [incomeAtMost(50)],
    applyChannel: '주민센터 또는 복지로',
    applyHowOneLine: '주민센터 방문 또는 복지로에서 수급자격 확인 후 신청.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(에너지바우처)',
    sampleData: true,
  },
  {
    id: 'single-parent',
    name: '한부모가족 아동양육비',
    agency: '여성가족부',
    summary: '한부모가족의 만 18세 미만 자녀 양육비 지원.',
    amount: '자녀 1인당 월 21만원',
    rules: [hasHouseholdType('single_parent', '한부모가족'), incomeAtMost(63)],
    applyChannel: '복지로 또는 주민센터',
    applyHowOneLine: '복지로/주민센터에서 한부모가족 증명 후 신청.',
    applyUrl: 'https://www.bokjiro.go.kr',
    source: '복지로 복지서비스정보(한부모가족 지원)',
    sampleData: true,
  },
  {
    id: 'multi-child-care',
    name: '다자녀 아이돌봄 우선지원',
    agency: '여성가족부',
    summary: '다자녀 가구에 아이돌봄서비스 우선·추가 지원.',
    amount: '돌봄 이용요금 정부지원 비율 상향',
    rules: [childrenAtLeast(2)],
    applyChannel: '아이돌봄 누리집 또는 주민센터',
    applyHowOneLine: '아이돌봄서비스 신청 시 다자녀 가구 우선 적용.',
    applyUrl: 'https://www.idolbom.go.kr',
    source: '복지로 복지서비스정보(아이돌봄서비스)',
    sampleData: true,
  },
  {
    id: 'eitc',
    name: '근로장려금',
    agency: '국세청',
    summary: '일하는 저소득 가구의 근로를 장려하는 현금 지원.',
    amount: '가구유형별 연간 차등 (홑벌이·맞벌이 등)',
    rules: [incomeAtMost(85)],
    applyChannel: '국세청 홈택스',
    applyHowOneLine: '홈택스/손택스에서 신청기간에 가구·소득·재산 요건 확인 후 신청.',
    applyUrl: 'https://www.hometax.go.kr',
    source: '복지로 복지서비스정보(근로장려금)',
    sampleData: true,
  },
];
