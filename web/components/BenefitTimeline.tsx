'use client';

import { useMemo } from 'react';
import { Heading, Body, Detail } from '@krds-ui/core';
import {
  type Benefit,
  type BenefitCtx,
  type BenefitStatus,
  sortBenefits,
  statusOf,
} from '@/lib/benefits';
import { BenefitCard } from './BenefitCard';

// BenefitTimeline — 정렬된 제도를 "지금/곧/종료" 그룹으로 시간순 렌더.
//
// data-testid 계약(spec §9 / demo.scenario):
//   benefit-timeline (컨테이너) · benefits-now (지금 그룹) · benefits-soon (곧 그룹)
// ctx가 바뀌면 sortBenefits/statusOf를 다시 계산 → 라이브 재정렬(Wow).

type Props = {
  benefits: Benefit[];
  ctx: BenefitCtx;
  /** 모든 상태/정렬을 동일 기준으로 계산하기 위한 now 주입(선택) */
  now?: Date;
};

export function BenefitTimeline({ benefits, ctx, now }: Props) {
  // ctx(주차/지역)·benefits가 바뀔 때마다 재정렬 → 라이브 재정렬의 핵심
  const grouped = useMemo(() => {
    const ref = now ?? new Date();
    const sorted = sortBenefits(benefits, ctx, ref);
    const buckets: Record<BenefitStatus, Benefit[]> = {
      now: [],
      soon: [],
      past: [],
    };
    for (const b of sorted) buckets[statusOf(b, ctx, ref)].push(b);
    return buckets;
    // ctx 객체는 매 렌더 새로 만들어질 수 있어 원시값으로 의존성 고정
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benefits, ctx.weeks, ctx.dueDate, ctx.region, now]);

  const ref = now ?? new Date();

  return (
    <div data-testid="benefit-timeline" className="space-y-8">
      <Group
        testid="benefits-now"
        title="지금 받을 수 있어요"
        caption="신청 창이 열려 있어요. 지금 바로 진행하세요."
        accent="text-success"
        benefits={grouped.now}
        ctx={ctx}
        status="now"
        now={ref}
        emptyText="지금 신청 가능한 지원이 아직 없어요. 아래 '곧 받게 돼요'를 확인하세요."
      />
      <Group
        testid="benefits-soon"
        title="곧 받게 돼요"
        caption="아직 신청 창이 열리지 않았어요. 시점이 되면 알 수 있게 미리 확인하세요."
        accent="text-primary"
        benefits={grouped.soon}
        ctx={ctx}
        status="soon"
        now={ref}
        emptyText="곧 열릴 예정인 지원이 없어요."
      />
      {grouped.past.length > 0 && (
        <Group
          testid="benefits-past"
          title="신청 창이 지났어요"
          caption="신청 기한이 지난 지원이에요. 일부는 사후 구제가 가능할 수 있어요."
          accent="text-gray-50"
          benefits={grouped.past}
          ctx={ctx}
          status="past"
          now={ref}
          emptyText=""
        />
      )}
    </div>
  );
}

type GroupProps = {
  testid: string;
  title: string;
  caption: string;
  accent: string;
  benefits: Benefit[];
  ctx: BenefitCtx;
  status: BenefitStatus;
  now: Date;
  emptyText: string;
};

function Group({
  testid,
  title,
  caption,
  accent,
  benefits,
  ctx,
  status,
  now,
  emptyText,
}: GroupProps) {
  return (
    <section data-testid={testid}>
      <div className="flex items-baseline gap-2">
        <Heading size="s" className={`!mb-0 font-bold ${accent}`}>
          {title}
        </Heading>
        <Detail size="s" color="gray-50">
          {benefits.length}건
        </Detail>
      </div>
      <Body size="s" color="gray-60" className="mt-1">
        {caption}
      </Body>

      {benefits.length > 0 ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {benefits.map((b) => (
            <BenefitCard
              key={b.id}
              benefit={b}
              ctx={ctx}
              status={status}
              now={now}
            />
          ))}
        </div>
      ) : emptyText ? (
        <div className="mt-3 rounded-krds border border-dashed border-gray-20 bg-gray-5 px-4 py-6 text-center">
          <Detail size="s" color="gray-50">
            {emptyText}
          </Detail>
        </div>
      ) : null}
    </section>
  );
}
