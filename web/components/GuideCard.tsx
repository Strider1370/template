import { SourceBadge, type SourceItem } from '@/components/SourceBadge';
import { NearbyOffices } from '@/components/NearbyOffices';

export type GuideResult = {
  guide: {
    summary: string;
    deadline: string;
    firstStep: string;
    steps?: string[];
    jurisdiction: string;
    channel?: string;
    locationApplies?: boolean;
    officeCategory?: string;
  };
  sources: SourceItem[];
  actionUrl?: string;
  needsConfirmation: boolean;
};

// 라인 아이콘 (stroke, currentColor) — 이모지 대신 깔끔한 SVG.
const ic = 'h-[18px] w-[18px] flex-none';
const IconCheck = () => (
  <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconAlert = () => (
  <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);
const IconClock = () => (
  <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const IconPin = () => (
  <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconArrow = () => (
  <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const IconExternal = () => (
  <svg className="h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export function GuideCard({ result }: { result: GuideResult }) {
  const { guide, sources, actionUrl, needsConfirmation } = result;
  const steps = guide.steps ?? [];

  return (
    <article
      data-testid="guide-card"
      className="overflow-hidden rounded-krds-xl border border-gray-20 bg-white shadow-card"
    >
      {/* 신뢰 등급 — 절제된 상단 스트립 */}
      {needsConfirmation ? (
        <div
          data-testid="trust-unverified"
          className="flex items-center gap-2 border-b border-gray-10 bg-gray-5 px-5 py-2.5 text-label-s text-gray-70"
        >
          <span className="text-warning-60">
            <IconAlert />
          </span>
          <span>
            <strong className="font-bold text-gray-80">AI 일반 안내</strong> · 공식 출처 미확인 — 기한·금액은 정부24에서 확인하세요
          </span>
        </div>
      ) : (
        <div
          data-testid="trust-verified"
          className="flex items-center gap-2 border-b border-gray-10 bg-gray-5 px-5 py-2.5 text-label-s text-gray-70"
        >
          <span className="text-success-60">
            <IconCheck />
          </span>
          <span>
            <strong className="font-bold text-gray-80">공식 출처로 확인된 안내</strong> · 아래 근거에 기반합니다
          </span>
        </div>
      )}

      <div className="p-5 md:p-6">
        {/* 요약 — 리드 문단 */}
        <p className="text-body-l leading-relaxed text-gray-80">{guide.summary || '—'}</p>

        {/* 기한 · 관할 — 정의형 메타 행 */}
        <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-gray-10 pt-5 sm:grid-cols-2">
          <div className="flex gap-3">
            <span className="mt-0.5 text-gray-40">
              <IconClock />
            </span>
            <div>
              <dt className="text-label-s text-gray-50">기한</dt>
              <dd className="mt-0.5 text-title-s font-bold text-gray-90">
                {guide.deadline || '특별한 법정 기한 없음'}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 text-gray-40">
              <IconPin />
            </span>
            <div>
              <dt className="text-label-s text-gray-50">어디로 (관할)</dt>
              <dd className="mt-0.5 text-body-m font-bold text-gray-90">
                {guide.jurisdiction || '공식 안내에서 확인'}
              </dd>
              {guide.channel && <dd className="mt-0.5 text-label-s text-gray-50">{guide.channel}</dd>}
            </div>
          </div>
        </dl>

        {/* 당장 첫 걸음 — 초점 블록 */}
        <div
          data-testid="step-first-action"
          className="mt-5 flex items-start gap-3 rounded-krds-lg border-l-4 border-primary bg-primary-5 p-4"
        >
          <span className="mt-0.5 text-primary">
            <IconArrow />
          </span>
          <div>
            <div className="text-label-s font-bold text-primary-60">지금, 첫 걸음</div>
            <div className="mt-1 text-body-l font-bold text-gray-90">{guide.firstStep || '—'}</div>
          </div>
        </div>

        {/* 위치 찾기 */}
        <div className="mt-5">
          <NearbyOffices officeCategory={guide.officeCategory || ''} />
        </div>

        {/* 전체 경로 — 세로 스텝퍼 */}
        {steps.length > 0 && (
          <div className="mt-5 border-t border-gray-10 pt-5" data-testid="full-path">
            <div className="text-label-s font-bold text-gray-50">전체 경로 · {steps.length}단계</div>
            <ol className="mt-3">
              {steps.map((s, i) => (
                <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < steps.length - 1 && (
                    <span aria-hidden className="absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-px bg-gray-20" />
                  )}
                  <span
                    className={`z-10 grid h-6 w-6 flex-none place-items-center rounded-full text-[11px] font-bold ${
                      i === 0 ? 'bg-primary text-white' : 'bg-white text-gray-60 ring-1 ring-gray-30'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`pt-0.5 text-body-m ${i === 0 ? 'font-bold text-gray-90' : 'text-gray-70'}`}>
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 처리하러 가기 */}
        {actionUrl && (
          <a
            data-testid="action-cta"
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-krds-lg bg-primary px-4 py-3.5 text-title-s font-bold text-white shadow-soft hover:bg-primary-60 active:translate-y-px"
          >
            공식 안내에서 처리·확인하기 <IconExternal />
          </a>
        )}

        {/* 근거 출처 */}
        <div className="mt-5 border-t border-gray-10 pt-4">
          <div className="text-label-s text-gray-50">근거 출처</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.length > 0 ? (
              sources.map((s) => <SourceBadge key={s.id} source={s} />)
            ) : (
              <a
                data-testid="source-badge"
                href="https://www.gov.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-30 bg-white px-3 py-1 text-label-s text-gray-70 hover:bg-gray-5"
              >
                공식 확인: 정부24
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
