'use client';

import { useMemo, useState } from 'react';
import { Display, Heading, Title, Body, Detail, Badge } from '@krds-ui/core';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';

// ─────────────────────────────────────────────────────────────
// 범용 스켈레톤 페이지.
// 이 파일을 새 주제의 메인 화면으로 교체하세요.
// 아래 지역 선택 데모는 (1) 스택이 실제로 동작함을 보여주고
// (2) regions.ts 재사용 패턴의 출발점입니다. 필요 없으면 지우세요.
// ─────────────────────────────────────────────────────────────

const SIDO = Object.keys(SIGUNGU_BY_SIDO);

const NEXT_STEPS = [
  ['spec.md', '데모 시나리오부터 작성 — "최종 데모에서 정확히 무엇을 보여줄지"'],
  ['plan.md', '작업 분해 + 기능별 폴백(안 되면 하드코딩) 정의'],
  ['이 화면 교체', 'app/page.tsx · components/Header,Footer · layout.tsx metadata'],
  ['데이터 연결', 'data/ 자산 + public/data/ + 당일 받은 공공데이터'],
  ['PROGRESS.md', '단계마다 현재 상태/막힌 부분 갱신 (세션 인수인계)'],
];

const SELECT_CLASS =
  'h-11 w-full rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-gray-5 disabled:text-gray-40';

export default function Home() {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');

  const sigunguList = useMemo(
    () => (sido ? SIGUNGU_BY_SIDO[sido] ?? [] : []),
    [sido],
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-5">
        <div className="mx-auto max-w-container px-4 py-12 md:py-16">
          <Badge label="KRDS 스타터 키트" variant="primary" size="small" />
          <Display
            size="s"
            color="gray-90"
            className="mt-3 !text-heading-l md:!text-display-s"
          >
            한국 공공 서비스 해커톤 스타터
          </Display>
          <Body size="l" color="gray-70" className="mt-3 max-w-xl">
            Next.js + KRDS + 한국 지역·지도 데이터가 미리 셋업돼 있습니다.
            새 주제를 받으면 이 화면부터 교체하세요.
          </Body>
        </div>
      </section>

      {/* 지역 선택 데모 (regions.ts 재사용 패턴) */}
      <section id="section-1" className="mx-auto max-w-container px-4 py-12">
        <Heading size="s" color="gray-90">
          지역 선택 데모
        </Heading>
        <Body size="m" color="gray-60" className="mt-2">
          전국 시/도·시/군/구 데이터가 들어있습니다. 스택이 정상 동작하는지
          확인용이며, 위치 기반 서비스의 출발점으로 쓰세요.
        </Body>

        <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-2">
          <label className="block">
            <Detail size="s" color="gray-70" className="mb-1 block">
              시 / 도
            </Detail>
            <select
              className={SELECT_CLASS}
              value={sido}
              onChange={(e) => {
                setSido(e.target.value);
                setSigungu('');
              }}
            >
              <option value="">선택하세요</option>
              {SIDO.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <Detail size="s" color="gray-70" className="mb-1 block">
              시 / 군 / 구
            </Detail>
            <select
              className={SELECT_CLASS}
              value={sigungu}
              onChange={(e) => setSigungu(e.target.value)}
              disabled={!sido}
            >
              <option value="">{sido ? '선택하세요' : '시/도 먼저 선택'}</option>
              {sigunguList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sido && (
          <div
            aria-live="polite"
            className="mt-4 rounded-krds border border-primary-10 bg-white p-4"
          >
            <Body size="m" color="gray-80">
              선택한 지역:{' '}
              <strong className="text-primary">
                {sido} {sigungu}
              </strong>
            </Body>
          </div>
        )}
      </section>

      {/* 다음 단계 안내 */}
      <section id="section-2" className="mx-auto max-w-container px-4 pb-16">
        <div className="rounded-krds-lg border border-gray-10 bg-gray-5 p-6 md:p-8">
          <Title size="m" color="gray-90">
            다음 단계 (CLAUDE.md 워크플로우)
          </Title>
          <ol className="mt-4 space-y-3">
            {NEXT_STEPS.map(([k, v], i) => (
              <li key={k} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-primary text-label-s font-bold text-white">
                  {i + 1}
                </span>
                <Body size="m" color="gray-80">
                  <strong className="text-gray-90">{k}</strong> — {v}
                </Body>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
