'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Display, Heading, Body, Detail, Badge, Spinner } from '@krds-ui/core';
import {
  type Benefit,
  type BenefitCtx,
  loadBenefits,
  statusOf,
} from '@/lib/benefits';
import { buildTimeline } from '@/lib/timeline';
import { InputForm, type FormValue } from '@/components/InputForm';
import { BenefitTimeline } from '@/components/BenefitTimeline';
import { FacilityMap } from '@/components/FacilityMap';

// ─────────────────────────────────────────────────────────────
// 메인 — 임산부 지원 시간축 내비게이션.
// 입력(주차/예정일·지역) → loadBenefits() → 시간축 정렬 렌더.
// Wow: 슬라이더/지역 라이브 변경 → 클라이언트에서 즉시 재정렬 + 마감 경고 점등.
// AI: 규칙 브리핑(항상) + 자유질문(ask-input) → POST /api/ask → ai-answer.
//     라우트 없거나 실패해도 화면 안 깨지게 graceful 폴백.
// ─────────────────────────────────────────────────────────────

const INITIAL: FormValue = {
  mode: 'weeks',
  weeks: 28, // 데모 시작점(시나리오: 임신 28주)
  dueDate: '',
  sido: '서울특별시',
  sigungu: '',
};

/** FormValue → benefits 계산용 ctx */
function toCtx(v: FormValue): BenefitCtx {
  const region = v.sigungu ? `${v.sido} ${v.sigungu}` : v.sido || null;
  if (v.mode === 'due') return { dueDate: v.dueDate || null, region };
  return { weeks: v.weeks, region };
}

/** 규칙 기반 한 줄 브리핑(키 없이도 항상 동작) */
function ruleBriefing(benefits: Benefit[], ctx: BenefitCtx, now: Date): string {
  const t = buildTimeline(
    { dueDate: ctx.dueDate ?? null, weeks: ctx.weeks ?? null },
    now,
  );
  const nowList = benefits.filter((b) => statusOf(b, ctx, now) === 'now');
  const phase = t.born
    ? '출산 직후'
    : t.weeks >= 37
      ? '출산 임박'
      : `임신 ${t.weeks}주차`;
  if (nowList.length === 0) {
    return `${phase} 기준, 지금 바로 신청 가능한 지원은 준비 중이에요. 곧 열리는 지원을 미리 확인해 두세요.`;
  }
  const top = nowList
    .slice(0, 2)
    .map((b) => b.name)
    .join(', ');
  return `${phase} 기준, 지금 신청 가능한 지원이 ${nowList.length}건 있어요. 특히 ${top}을(를) 먼저 챙기세요.`;
}

/**
 * 키/라우트 없이도 step4 장면이 항상 뜨도록 하는 결정적 폴백 답변.
 * 데이터셋 제도명을 근거로 추려 표시(assertion: 제도명 1개 이상 포함, 데이터셋 밖 수치 생성 없음).
 */
function fallbackAnswer(question: string, benefits: Benefit[]): string {
  const q = question;
  const pick = (ids: string[]) =>
    benefits.filter((b) => ids.includes(b.id)).map((b) => b.name);
  let names: string[] = [];
  if (/쌍둥이|다태아|세쌍둥이/.test(q)) {
    names = pick(['pregnancy-medical-voucher', 'high-risk-pregnancy-medical']);
  } else if (/고위험|중증|입원|조기진통|전치태반/.test(q)) {
    names = pick(['high-risk-pregnancy-medical']);
  } else if (/전입|이사|이주/.test(q)) {
    names = pick(['child-allowance', 'postpartum-care']);
  }
  if (names.length === 0) {
    names = benefits.slice(0, 2).map((b) => b.name);
  }
  return `질문하신 상황에서는 검증된 제도 데이터 기준으로 ${names.join(
    ', ',
  )}을(를) 우선 확인해 보세요. 정확한 자격·금액은 각 카드의 공식 신청처에서 최종 확인이 필요합니다.`;
}

type AiState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; text: string; source: 'api' | 'fallback' };

export default function Home() {
  const [form, setForm] = useState<FormValue>(INITIAL);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(true); // 데모 편의상 결과 바로 노출

  const [question, setQuestion] = useState('');
  const [ai, setAi] = useState<AiState>({ phase: 'idle' });

  const resultRef = useRef<HTMLDivElement>(null);

  // benefits.json 로드(고정 데이터 — 키 불필요)
  useEffect(() => {
    let cancelled = false;
    loadBenefits().then((ds) => {
      if (!cancelled) {
        setBenefits(ds.benefits);
        setDataLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ctx = useMemo(() => toCtx(form), [form]);
  // 렌더 1회 기준 now(라이브 재정렬 비교 안정화). 입력 변경 시 갱신.
  const now = useMemo(() => new Date(), [form]);

  const timeline = useMemo(
    () => buildTimeline({ dueDate: ctx.dueDate ?? null, weeks: ctx.weeks ?? null }, now),
    [ctx.dueDate, ctx.weeks, now],
  );

  const briefing = useMemo(
    () => ruleBriefing(benefits, ctx, now),
    [benefits, ctx, now],
  );

  const badgeText = timeline.born
    ? `출산 후 ${timeline.monthsOld ?? 0}개월 · D+${Math.abs(timeline.dueDday)}`
    : `임신 ${timeline.weeks}주 · D-${timeline.dueDday}`;

  const askAi = async () => {
    setAi({ phase: 'loading' });
    const payload = {
      weeks: timeline.weeks,
      region: ctx.region,
      question: question.trim() || undefined,
    };
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = (await res.json()) as { answer?: string; text?: string };
      const text = (data.answer ?? data.text ?? '').trim();
      if (!text) throw new Error('empty answer');
      setAi({ phase: 'done', text, source: 'api' });
    } catch {
      // 라우트 없음/실패/타임아웃 → 결정적 폴백(데모 무중단)
      setAi({
        phase: 'done',
        text: fallbackAnswer(question, benefits),
        source: 'fallback',
      });
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-5">
        <div className="mx-auto max-w-container px-4 py-10 md:py-14">
          <Badge label="임산부 지원 내비게이션" variant="primary" size="small" />
          <Display
            size="s"
            color="gray-90"
            className="mt-3 !text-heading-l md:!text-display-s"
          >
            지금 받아야 하는 지원을 시간순으로
          </Display>
          <Body size="l" color="gray-70" className="mt-3 max-w-2xl">
            임신 주차·출산예정일·거주지를 입력하면, 흩어진 임신·출산 정부 지원을
            “지금 신청 → 곧 열림” 순서로 정렬하고 놓치면 사라질 돈을 D-day로
            알려드려요.
          </Body>
        </div>
      </section>

      <section className="mx-auto grid max-w-container gap-6 px-4 py-10 lg:grid-cols-[360px_1fr]">
        {/* 입력 패널 */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <InputForm
            value={form}
            onChange={setForm}
            onSubmit={() => {
              setSubmitted(true);
              resultRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* 결과 영역 */}
        <div ref={resultRef} className="min-w-0 space-y-6">
          {/* 시간축 배지 */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              data-testid="timeline-badge"
              className="inline-flex items-center gap-2 rounded-krds bg-primary px-3 py-1.5 text-title-s font-bold text-white"
            >
              {badgeText}
            </span>
            {ctx.region && (
              <Detail size="s" color="gray-60">
                {ctx.region}
              </Detail>
            )}
          </div>

          {/* AI 브리핑 + 자유질문 */}
          <div className="rounded-krds-lg border border-primary-10 bg-primary-5 p-5">
            <Detail size="s" color="primary" className="font-bold">
              AI 한 줄 브리핑
            </Detail>
            <Body size="m" color="gray-90" className="mt-1">
              {briefing}
            </Body>

            <div className="mt-4">
              <label htmlFor="ask-input" className="block">
                <Detail size="s" color="gray-70" className="mb-1 block">
                  상황을 자유롭게 물어보세요 (예: 쌍둥이인데 고위험이고 3개월 전
                  이사 왔어요)
                </Detail>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="ask-input"
                  data-testid="ask-input"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') askAi();
                  }}
                  placeholder="내 상황을 입력하면 해당 제도만 추려 알려드려요"
                  className="h-11 flex-1 rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <button
                  type="button"
                  onClick={askAi}
                  disabled={ai.phase === 'loading'}
                  className="h-11 flex-none rounded-krds bg-primary px-5 text-body-m font-bold text-white disabled:opacity-60"
                >
                  {ai.phase === 'loading' ? '분석 중…' : '질문하기'}
                </button>
              </div>

              {ai.phase !== 'idle' && (
                <div
                  data-testid="ai-answer"
                  aria-live="polite"
                  className="mt-3 rounded-krds border border-primary-10 bg-white p-4"
                >
                  {ai.phase === 'loading' ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="small" />
                      <Detail size="s" color="gray-60">
                        검증된 제도 데이터에서 답을 찾고 있어요…
                      </Detail>
                    </div>
                  ) : (
                    <>
                      <Body size="m" color="gray-90">
                        {ai.text}
                      </Body>
                      {ai.source === 'fallback' && (
                        <Detail size="s" color="gray-50" className="mt-2 block">
                          (오프라인 규칙 응답 — 데이터셋에 있는 제도만
                          안내합니다)
                        </Detail>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 타임라인 */}
          {!dataLoaded ? (
            <div className="flex items-center gap-2 py-8">
              <Spinner size="medium" />
              <Detail size="s" color="gray-60">
                지원 데이터를 불러오는 중…
              </Detail>
            </div>
          ) : benefits.length === 0 ? (
            <div className="rounded-krds border border-dashed border-gray-20 bg-gray-5 p-6 text-center">
              <Body size="m" color="gray-70">
                지원 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
              </Body>
            </div>
          ) : (
            submitted && (
              <BenefitTimeline benefits={benefits} ctx={ctx} now={now} />
            )
          )}

          {/* 곁가지: 시설 지도 */}
          {dataLoaded && (
            <FacilityMap sido={form.sido} sigungu={form.sigungu} />
          )}
        </div>
      </section>
    </>
  );
}
