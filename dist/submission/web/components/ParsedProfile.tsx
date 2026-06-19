'use client';

import { Detail } from '@krds-ui/core';
import { HOUSEHOLD_LABELS, type Profile } from '@/lib/types';

// AI(또는 드롭다운 폴백)가 알아들은 입력을 '구조화 칩'으로 보여준다.
// Wow 불변식: 입력 경로와 무관하게 항상 렌더된다.

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-5 px-3 py-1 text-label-s font-bold text-primary">
      {children}
    </span>
  );
}

export function ParsedProfile({ profile }: { profile: Profile }) {
  const chips: string[] = [];
  for (const t of profile.householdTypes) chips.push(HOUSEHOLD_LABELS[t]);
  if (profile.region) chips.push(profile.region);
  if (profile.householdSize) chips.push(`가구원 ${profile.householdSize}명`);
  if (profile.monthlyIncome != null) chips.push(`월 ${profile.monthlyIncome}만원`);
  if (profile.youngestChildAgeMonths != null)
    chips.push(`막내 ${profile.youngestChildAgeMonths}개월`);
  if (profile.applicantAge != null) chips.push(`만 ${profile.applicantAge}세`);

  return (
    <div data-testid="parsed-profile" className="rounded-krds border border-primary-10 bg-white p-4">
      <Detail size="s" color="gray-60" className="mb-2 block">
        입력하신 내용을 이렇게 이해했어요
      </Detail>
      <div className="flex flex-wrap gap-2">
        {chips.length > 0 ? (
          chips.map((c, i) => <Chip key={i}>{c}</Chip>)
        ) : (
          <Chip>입력 정보 없음</Chip>
        )}
      </div>
    </div>
  );
}
