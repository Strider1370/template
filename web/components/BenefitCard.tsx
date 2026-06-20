'use client';

import { Title, Body, Detail, Badge } from '@krds-ui/core';
import type { Explanation, MatchResult } from '@/lib/types';

// 혜택 카드: ✓충족 체크리스트 + "왜?" 배지 + 근거 설명 + 신청 동선.
// 차별점("왜 당신이")을 텍스트가 아니라 시각적 체크리스트로 0.5초에 보이게.

export function BenefitCard({
  result,
  explanation,
}: {
  result: MatchResult;
  explanation: Explanation;
}) {
  const { benefit, met } = result;

  return (
    <article
      data-testid="benefit-card"
      className="flex flex-col rounded-krds-lg border border-gray-10 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Title size="s" color="gray-90" className="block truncate">
            {benefit.name}
          </Title>
          <Detail size="s" color="gray-50" className="mt-0.5 block">
            {benefit.agency}
          </Detail>
        </div>
        <Badge label="왜?" variant="primary" size="small" />
      </div>

      <Body size="m" color="gray-70" className="mt-2">
        {benefit.summary}
      </Body>
      {benefit.amount && (
        <Body size="m" color="primary" className="mt-1 font-bold">
          {benefit.amount}
        </Body>
      )}

      {/* 왜 해당되나요 — 시각적 충족 체크리스트 */}
      <div
        data-testid="eligibility-checklist"
        className="mt-4 rounded-krds bg-primary-5 p-3"
      >
        <Detail size="s" color="primary" className="mb-1.5 block font-bold">
          왜 해당되나요?
        </Detail>
        <ul className="space-y-1">
          {met.map((m, i) => (
            <li key={i} className="flex items-start gap-1.5 text-body-s text-gray-80">
              <span aria-hidden className="mt-0.5 font-bold text-success">
                ✓
              </span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI(또는 폴백)가 다듬은 한 줄 설명 */}
      <Body
        data-testid="why-explanation"
        size="m"
        color="gray-80"
        className="mt-3 italic"
      >
        {explanation.text}
      </Body>

      {/* 신청 동선 */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-10 pt-3">
        <a
          data-testid="apply-cta"
          href={benefit.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-krds bg-primary px-4 text-label-m font-bold text-white hover:bg-primary-60"
        >
          신청하러 가기 ({benefit.applyChannel})
        </a>
      </div>
      <Detail size="s" color="gray-50" className="mt-2 block">
        {benefit.applyHowOneLine}
      </Detail>
    </article>
  );
}
