// web/lib/realtime.ts — ① 실시간 후보 카탈로그 (보조금24/gov24, 약 10,957건)
//
// 정직성: 이건 '정밀 자격 판정'이 아니라 보조금24 카탈로그에서 프로필 키워드로 추린
// **잠재 적격 후보**다(선정기준은 산문이라 자동 판정 불가 — 원문 링크로 확인 유도).
// 무키/미승인/실패 시 SAMPLE_CATALOG 폴백.

import type { HouseholdType, Profile } from './types';

export interface CandidatePolicy {
  id: string;
  name: string;
  agency: string; // 소관기관명
  summary: string; // 서비스목적요약
  field: string; // 서비스분야
  target: string; // 지원대상(산문, 축약)
  applyMethod: string; // 신청방법
  link: string; // 상세조회URL
  source: 'live' | 'sample';
}

/** 프로필 → 보조금24 '지원대상' LIKE 검색 키워드 (최대 3개). */
export function profileKeywords(profile: Profile): string[] {
  const kw: string[] = [];
  const byType: Partial<Record<HouseholdType, string>> = {
    infant: '영유아',
    youth: '청년',
    senior: '노인',
    single_parent: '한부모',
    multi_child: '다자녀',
  };
  for (const t of profile.householdTypes) {
    const k = byType[t];
    if (k) kw.push(k);
  }
  // 영유아 가구가 아니어도 어린 자녀가 있으면 '영유아'
  if (!kw.includes('영유아') && profile.youngestChildAgeMonths != null && profile.youngestChildAgeMonths <= 71) {
    kw.push('영유아');
  }
  // 소득이 낮으면 '저소득'
  if (profile.monthlyIncome != null) {
    const median = 471; // 3인 가구 근사 (참고용)
    if (profile.monthlyIncome <= median * 0.6) kw.push('저소득');
  }
  // 아무 단서도 없으면 폭넓게
  if (kw.length === 0) kw.push('가구');
  return [...new Set(kw)].slice(0, 3);
}

/** 폴백 샘플 카탈로그 (실시간 미연동 시) — 보조금24 실제 제도 예시, '샘플' 표시. */
export const SAMPLE_CATALOG: Omit<CandidatePolicy, 'source'>[] = [
  {
    id: 'sample-1',
    name: '가정양육수당 지원',
    agency: '보건복지부',
    summary: '어린이집·유치원 등을 이용하지 않는 영유아 가정에 양육수당 지원.',
    field: '보육·교육',
    target: '어린이집 등을 이용하지 않는 취학 전 영유아',
    applyMethod: '복지로 또는 주민센터',
    link: 'https://www.gov.kr/portal/rcvfvrSvc/main',
  },
  {
    id: 'sample-2',
    name: '청년월세 한시 특별지원',
    agency: '국토교통부',
    summary: '무주택 청년의 월세를 한시적으로 지원.',
    field: '주거·자립',
    target: '만 19~34세 무주택 청년',
    applyMethod: '복지로 또는 정부24',
    link: 'https://www.gov.kr/portal/rcvfvrSvc/main',
  },
  {
    id: 'sample-3',
    name: '기초연금',
    agency: '보건복지부',
    summary: '만 65세 이상 소득 하위 70% 어르신에게 매월 지급.',
    field: '생활안정',
    target: '만 65세 이상, 소득인정액 하위 70%',
    applyMethod: '복지로 또는 국민연금공단',
    link: 'https://www.gov.kr/portal/rcvfvrSvc/main',
  },
  {
    id: 'sample-4',
    name: '한부모가족 아동양육비',
    agency: '여성가족부',
    summary: '한부모가족의 만 18세 미만 자녀 양육비 지원.',
    field: '생활안정',
    target: '소득기준 이하 한부모가족',
    applyMethod: '복지로 또는 주민센터',
    link: 'https://www.gov.kr/portal/rcvfvrSvc/main',
  },
  {
    id: 'sample-5',
    name: '에너지바우처',
    agency: '산업통상자원부',
    summary: '저소득 취약가구의 냉·난방 에너지 비용 지원.',
    field: '생활안정',
    target: '저소득 + 노인·영유아·장애인 등',
    applyMethod: '주민센터 또는 복지로',
    link: 'https://www.gov.kr/portal/rcvfvrSvc/main',
  },
];
