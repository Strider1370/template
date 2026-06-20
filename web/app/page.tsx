'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Display, Heading, Title, Body, Detail, Badge } from '@krds-ui/core';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';
import { KakaoMap } from '@/components/KakaoMap';

// ─────────────────────────────────────────────────────────────
// 범용 스켈레톤 페이지.
// 주제와 무관하게 거의 항상 쓰이는 3종을 미리 깔아둔다: ① 사용자 정보 입력 ② 지역 선택 ③ 지도.
// 주제가 나오면 이 폼의 필드/지도 데이터를 주제에 맞게 "교체"하세요(이 화면 자체를 갈아끼움).
//   - 입력 필드: 아래 USER FORM 의 연령·가구원수·관심분야를 주제 항목으로 교체.
//   - 지도: KakaoMap 에 shelters(POI) + center 를 주제 데이터로 연결(지금은 빈 목록 + 서울 기본 중심).
//   - 지역→좌표: regions.ts 는 '이름'만 가짐. 시군구 중심 좌표가 필요하면 좌표표를 붙여 center 를 갱신.
// ─────────────────────────────────────────────────────────────

const SIDO = Object.keys(SIGUNGU_BY_SIDO);

// 지도 기본 중심(서울시청). 주제 데이터(선택 지역/POI)에 맞게 갱신하세요.
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

// 관심 분야 예시(범용 공공 카테고리) — 주제에 맞게 교체.
const INTEREST_OPTIONS = ['복지·혜택', '안전·재난', '주거', '교육·돌봄', '일자리', '건강·의료'];

const FIELD_CLASS =
  'h-11 w-full rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-gray-5 disabled:text-gray-40';

const NEXT_STEPS = [
  ['spec.md', '데모 시나리오부터 작성 — "최종 데모에서 정확히 무엇을 보여줄지"'],
  ['plan.md', '작업 분해 + 기능별 폴백(안 되면 하드코딩) 정의'],
  ['이 화면 교체', 'app/page.tsx 입력 필드·지도 데이터 · components/Header,Footer · layout.tsx metadata'],
  ['데이터 연결', 'data/ 자산 + public/data/ + 당일 받은 공공데이터'],
  ['PROGRESS.md', '단계마다 현재 상태/막힌 부분 갱신 (세션 인수인계)'],
];

export default function Home() {
  // 사용자 정보(범용 필드 — 주제에 맞게 교체)
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [age, setAge] = useState('');
  const [household, setHousehold] = useState('');
  const [interest, setInterest] = useState('');

  const sigunguList = useMemo(
    () => (sido ? SIGUNGU_BY_SIDO[sido] ?? [] : []),
    [sido],
  );

  return (
    <>
      {/* Hero (배경 배너 + 왼쪽 스크림). 배너는 주제 맞춤 자동 생성:
          npm run generate-banner -- --topic "<주제>"  (없으면 기본 청사 사진) */}
      <section className="relative overflow-hidden bg-primary-5">
        <Image
          src="/hero-banner.png"
          alt=""
          aria-hidden
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-5 via-primary-5/85 to-primary-5/20" />
        <div className="relative mx-auto max-w-container px-4 py-12 md:py-16">
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

      {/* 기본 입력 패널: 사용자 정보(지역 포함) + 지도 — 주제 무관 공통 3종 스캐폴드 */}
      <section id="section-1" className="mx-auto max-w-container px-4 py-12">
        <Heading size="s" color="gray-90">
          사용자 정보 입력
        </Heading>
        <Body size="m" color="gray-60" className="mt-2">
          지역·사용자 정보·지도는 공공 서비스에서 거의 항상 쓰이는 기본 패널입니다.
          주제가 정해지면 아래 필드와 지도 데이터를 주제에 맞게 교체하세요.
        </Body>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 입력 폼 (USER FORM) */}
          <div className="space-y-4 rounded-krds-lg border border-gray-10 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <Detail size="s" color="gray-70" className="mb-1 block">시 / 도</Detail>
                <select
                  className={FIELD_CLASS}
                  value={sido}
                  onChange={(e) => { setSido(e.target.value); setSigungu(''); }}
                >
                  <option value="">선택하세요</option>
                  {SIDO.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label className="block">
                <Detail size="s" color="gray-70" className="mb-1 block">시 / 군 / 구</Detail>
                <select
                  className={FIELD_CLASS}
                  value={sigungu}
                  onChange={(e) => setSigungu(e.target.value)}
                  disabled={!sido}
                >
                  <option value="">{sido ? '선택하세요' : '시/도 먼저 선택'}</option>
                  {sigunguList.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>

              <label className="block">
                <Detail size="s" color="gray-70" className="mb-1 block">연령</Detail>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  placeholder="예: 34"
                  className={FIELD_CLASS}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </label>

              <label className="block">
                <Detail size="s" color="gray-70" className="mb-1 block">가구원 수</Detail>
                <select className={FIELD_CLASS} value={household} onChange={(e) => setHousehold(e.target.value)}>
                  <option value="">선택하세요</option>
                  {['1', '2', '3', '4', '5+'].map((n) => <option key={n} value={n}>{n}인</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <Detail size="s" color="gray-70" className="mb-1 block">관심 분야</Detail>
              <select className={FIELD_CLASS} value={interest} onChange={(e) => setInterest(e.target.value)}>
                <option value="">선택하세요</option>
                {INTEREST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            {(sido || age || household || interest) && (
              <div aria-live="polite" className="rounded-krds border border-primary-10 bg-primary-5 p-3">
                <Body size="s" color="gray-80">
                  입력 요약:{' '}
                  <strong className="text-primary">
                    {[sido && `${sido} ${sigungu}`.trim(), age && `${age}세`, household && `${household}인 가구`, interest]
                      .filter(Boolean)
                      .join(' · ') || '아직 없음'}
                  </strong>
                </Body>
              </div>
            )}
          </div>

          {/* 오른쪽: 지도 패널 (KakaoMap 재사용 — 키 없으면 안내 패널로 폴백) */}
          <div>
            <KakaoMap shelters={[]} center={DEFAULT_CENTER} />
            <Detail size="s" color="gray-50" className="mt-2 block">
              지도는 `web/components/KakaoMap.tsx` 재사용. POI(shelters)·center 를 주제 데이터로 연결하세요.
              카카오맵 키는 `web/.env.local` 의 `NEXT_PUBLIC_KAKAO_MAP_KEY`.
            </Detail>
          </div>
        </div>
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
