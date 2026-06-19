// web/lib/types.ts — 공유 타입 (Data Agent 소유)
// 자격 판정은 결정론적 규칙엔진이 한다. AI는 입력 구조화 + 확정 텍스트 다듬기만.

/** 가구 유형 (자격 규칙의 핵심 분기) */
export type HouseholdType =
  | 'infant' // 영유아 가구
  | 'youth' // 청년(1인 등)
  | 'senior' // 노년
  | 'single_parent' // 한부모
  | 'multi_child' // 다자녀
  | 'general'; // 일반

export const HOUSEHOLD_LABELS: Record<HouseholdType, string> = {
  infant: '영유아 가구',
  youth: '청년',
  senior: '노년',
  single_parent: '한부모',
  multi_child: '다자녀',
  general: '일반 가구',
};

/** 사용자 입력에서 구조화된 프로필. AI parse 또는 드롭다운 폴백이 채운다. */
export interface Profile {
  householdTypes: HouseholdType[]; // 복수 가능 (예: 영유아 + 다자녀)
  region: string; // 시/도 (regions.ts 키). 빈 문자열 허용
  monthlyIncome: number | null; // 가구 월 소득 (만원). null = 미입력
  householdSize: number; // 가구원 수
  youngestChildAgeMonths: number | null; // 막내 자녀 월령. null = 자녀 없음
  applicantAge: number | null; // 신청자(대표) 나이. null = 미입력
}

/** 자격 규칙 하나 — 결정론적으로 평가 가능한 술어 */
export interface EligibilityRule {
  key: string; // 사람이 읽는 조건 이름 (예: "막내 자녀 만 2세 미만")
  test: (p: Profile, ctx: RuleContext) => boolean;
  /** 충족/미충족 시 사용자에게 보일 한 줄 (값 주입 — 사실은 여기서 확정) */
  explain: (p: Profile, ctx: RuleContext) => string;
}

/** 규칙 평가에 쓰는 보조 컨텍스트 (기준중위소득 등) */
export interface RuleContext {
  medianIncome: number; // 해당 가구원수의 월 기준중위소득 (만원)
  incomeRatio: number | null; // monthlyIncome / medianIncome * 100 (%) — null이면 소득 미입력
}

/** 큐레이션 혜택 (fixture). sampleData=true (전수 아님, 예시). */
export interface Benefit {
  id: string;
  name: string; // 정식 명칭
  agency: string; // 소관
  summary: string; // 한 줄 요약
  amount: string | null; // 금액 표현 (확정 텍스트, 지어내지 않음). 없으면 null
  rules: EligibilityRule[]; // 모두 충족해야 '해당'
  applyChannel: string; // 신청처 (예: 복지로, 정부24, 주민센터)
  applyHowOneLine: string; // 한 줄 신청법
  applyUrl: string; // 신청/안내 링크
  source: string; // 근거 출처 (복지로 등)
  sampleData: true; // 항상 예시 데이터임을 표시
}

/** 매칭 결과 한 건 */
export interface MatchResult {
  benefit: Benefit;
  met: string[]; // 충족된 조건 설명 (✓ 체크리스트로 렌더)
  /** 규칙엔진이 확정한 근거 문장 (AI explain의 입력 = rewrite 대상). 사실은 여기서 고정. */
  factualBasis: string;
}

/** explain rewrite 결과 (AI 또는 폴백 템플릿) */
export interface Explanation {
  text: string;
  source: 'ai' | 'fallback'; // 어디서 왔는지 (투명성)
}
