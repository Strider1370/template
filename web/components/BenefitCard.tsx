'use client';

import { Badge, Title, Body, Detail, Link } from '@krds-ui/core';
import {
  type Benefit,
  type BenefitCtx,
  type BenefitStatus,
  deadlineDday,
} from '@/lib/benefits';
import { DeadlineWarning } from './DeadlineWarning';

// BenefitCard — 제도 1건 카드. 제도명·금액·신청처 링크 + (임박 시) DeadlineWarning.
// class "benefit-card" 부여(demo assertion: .benefit-card 개수/구성 비교).

const WON_PER_MAN = 10000;

function formatAmount(b: Benefit): string {
  const { type, value } = b.amount;
  if (value == null || value <= 0) return '지원 (금액 상이)';
  const man = Math.round(value / WON_PER_MAN);
  const won =
    man >= 10000
      ? `${(man / 10000).toLocaleString('ko-KR')}억원`
      : `${man.toLocaleString('ko-KR')}만원`;
  switch (type) {
    case 'monthly':
      return `월 ${won}`;
    case 'voucher':
      return `바우처 ${won}`;
    case 'lump':
      return `최대 ${won}`;
    default:
      return won;
  }
}

const STATUS_BADGE: Record<
  BenefitStatus,
  { label: string; variant: 'primary' | 'default' | 'success' }
> = {
  now: { label: '지금 신청 가능', variant: 'success' },
  soon: { label: '곧 열려요', variant: 'primary' },
  past: { label: '신청 창 종료', variant: 'default' },
};

// after_birth/infant 소급 마감은 '소급분 소멸', near_due 신청창은 '신청 마감'.
function warningKind(b: Benefit): 'lapse' | 'window' {
  if (b.phase === 'near_due' || b.phase === 'pregnancy') {
    return b.window.deadlineOffsetDays != null ? 'lapse' : 'window';
  }
  return 'lapse';
}

type Props = {
  benefit: Benefit;
  ctx: BenefitCtx;
  status: BenefitStatus;
  /** now를 상위에서 주입(라이브 재계산 시 동일 기준 유지) */
  now?: Date;
};

export function BenefitCard({ benefit, ctx, status, now }: Props) {
  const dday = deadlineDday(benefit, ctx, now ?? new Date());
  const badge = STATUS_BADGE[status];

  return (
    <article className="benefit-card rounded-krds border border-gray-10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Title size="s" color="gray-90" className="min-w-0">
          {benefit.name}
        </Title>
        <Badge label={badge.label} variant={badge.variant} size="small" />
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Body size="l" className="font-bold text-primary">
          {formatAmount(benefit)}
        </Body>
        <Detail size="s" color="gray-50">
          {benefit.category}
        </Detail>
      </div>

      <Detail size="s" color="gray-70" className="mt-2 block">
        {benefit.eligibility.summary}
      </Detail>

      <DeadlineWarning
        dday={dday}
        amountValue={benefit.amount.value}
        kind={warningKind(benefit)}
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          href={benefit.apply.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link-m font-medium text-primary"
        >
          공식 신청처 바로가기 →
        </Link>
        {benefit.regionVaries && (
          <Detail size="s" color="gray-50">
            지자체별 추가지원 상이
          </Detail>
        )}
      </div>
    </article>
  );
}
