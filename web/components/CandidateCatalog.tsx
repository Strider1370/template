'use client';

import { Title, Body, Detail } from '@krds-ui/core';
import type { PoliciesResult } from '@/lib/ai';

// KRDS Badge 의 variant 색 맵 의존을 피해 안전한 span 칩으로 표시.
function Chip({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'primary' | 'gray' }) {
  const cls =
    tone === 'primary'
      ? 'bg-primary-5 text-primary border-primary-10'
      : 'bg-gray-5 text-gray-60 border-gray-10';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-label-s font-bold ${cls}`}>
      {children}
    </span>
  );
}

// ① 실시간 후보 카탈로그(보조금24 약 10,957건에서 키워드로 추림).
// 정직성: 정밀 자격 판정이 아니라 '잠재 적격 후보' — 원문 링크로 확인 유도. live/sample 배지로 출처 구분.

export function CandidateCatalog({ data }: { data: PoliciesResult | null }) {
  if (!data || data.candidates.length === 0) return null;
  const live = data.source === 'live';
  const snapshot = data.source === 'snapshot';

  return (
    <section className="mt-8 rounded-krds-lg border border-gray-10 bg-gray-5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Title size="s" color="gray-90">
          더 찾아보기 — 잠재 적격 후보
        </Title>
        <Chip tone={live ? 'primary' : 'gray'}>
          {live ? '실시간 · 보조금24' : snapshot ? '전수 캐시 · 보조금24 스냅샷' : '샘플(미연동)'}
        </Chip>
      </div>
      <Body size="s" color="gray-60" className="mt-1">
        {live ? (
          <>
            보조금24 카탈로그{data.total ? ` 약 ${data.total.toLocaleString()}건` : ''} 중 입력 조건과 관련된
            혜택을 추렸어요. <strong>정밀 자격 판정이 아니라 후보</strong>이며, 선정기준은 각 링크에서
            확인하세요.
          </>
        ) : snapshot ? (
          <>
            실시간 API 대신 <strong>보조금24 전수 스냅샷(캐시)</strong>에서 입력 조건과 관련된 혜택을 추렸어요.
            실데이터지만 캐시 시점 기준이며, <strong>정밀 자격 판정이 아니라 후보</strong>예요. 선정기준은 각
            링크에서 확인하세요.
          </>
        ) : (
          <>
            실시간 연동(보조금24 API) 전이라 <strong>샘플 후보</strong>를 보여드려요. API 키 승인 시 실데이터로
            전환됩니다.
          </>
        )}
      </Body>

      <ul data-testid="candidate-list" className="mt-4 grid gap-3 md:grid-cols-2">
        {data.candidates.map((c) => (
          <li
            key={c.id}
            data-testid="candidate-item"
            className="rounded-krds border border-gray-10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <Body size="m" color="gray-90" className="font-bold">
                {c.name}
              </Body>
              {c.field && <Chip>{c.field}</Chip>}
            </div>
            {c.summary && (
              <Body size="s" color="gray-70" className="mt-1">
                {c.summary}
              </Body>
            )}
            {c.target && (
              <Detail size="s" color="gray-50" className="mt-1 block">
                지원대상: {c.target}
              </Detail>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-krds border border-primary px-3 text-label-s font-bold text-primary hover:bg-primary-5"
              >
                자세히 / 신청 ({c.agency || '안내'})
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
