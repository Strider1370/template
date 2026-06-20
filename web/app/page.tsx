'use client';

import Image from 'next/image';
import { Display, Title, Heading, Body, Badge } from '@krds-ui/core';
import { UserInfoForm } from '@/components/blocks/UserInfoForm';
import { MapPanel } from '@/components/blocks/MapPanel';

// ─────────────────────────────────────────────────────────────
// 이 홈은 "조립 예시"다. 주제가 정해지면 이 파일을 새로 짜라.
// 아래 폼+지도 배치에 종속되지 마라 — 그저 부품을 어떻게 쓰는지 보여줄 뿐이다.
//
// 공통 블록(재사용 부품) — 필요한 것만 골라 import, 필요 없으면 빼라:
//   - 입력 폼: `@/components/blocks/UserInfoForm`
//   - 지도   : `@/components/blocks/MapPanel` (POI·center 를 주제 데이터로 연결)
//   - 그 외  : `@/components/KakaoMap`, `@/lib/regions`, `@/lib/shelters` 등
// ─────────────────────────────────────────────────────────────

const NEXT_STEPS = [
  ['spec.md', '데모 시나리오부터 작성 — "최종 데모에서 정확히 무엇을 보여줄지"'],
  ['plan.md', '작업 분해 + 기능별 폴백(안 되면 하드코딩) 정의'],
  ['이 화면 새로 짜기', 'app/page.tsx 를 주제에 맞게 재구성 (필요한 블록만 import) · Header/Footer · layout.tsx metadata'],
  ['데이터 연결', 'data/ 자산 + public/data/ + 당일 받은 공공데이터'],
  ['PROGRESS.md', '단계마다 현재 상태/막힌 부분 갱신 (세션 인수인계)'],
];

export default function Home() {
  return (
    <>
      {/* Hero (배경 배너 + 왼쪽 스크림). 배너는 주제 맞춤 자동 생성:
          npm run generate-banner -- --topic "<주제>"  (없으면 기본 청사 사진) */}
      <section className="relative overflow-hidden bg-primary-5">
        <Image src="/hero-banner.png" alt="" aria-hidden fill priority unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-5 via-primary-5/85 to-primary-5/20" />
        <div className="relative mx-auto max-w-container px-4 py-12 md:py-16">
          <Badge label="KRDS 스타터 키트" variant="primary" size="small" />
          <Display size="s" color="gray-90" className="mt-3 !text-heading-l md:!text-display-s">
            한국 공공 서비스 해커톤 스타터
          </Display>
          <Body size="l" color="gray-70" className="mt-3 max-w-xl">
            Next.js + KRDS + 한국 지역·지도 데이터가 미리 셋업돼 있습니다.
            새 주제를 받으면 이 화면부터 교체하세요.
          </Body>
        </div>
      </section>

      {/* 조립 예시: 공통 부품(UserInfoForm + MapPanel)을 가져다 배치한 것뿐. 주제에 맞게 새로 짜세요. */}
      <section id="section-1" className="mx-auto max-w-container px-4 py-12">
        <Heading size="s" color="gray-90">사용자 정보 입력 (조립 예시)</Heading>
        <Body size="m" color="gray-60" className="mt-2">
          지역·사용자 정보·지도는 자주 쓰이는 <strong>부품</strong>입니다(`web/components/blocks/`).
          이 배치는 예시일 뿐 — 주제가 정해지면 이 화면을 새로 짜고, 필요한 부품만 가져다 쓰세요.
        </Body>

        <div className="mt-4 rounded-krds border border-dashed border-gray-30 bg-gray-5 px-4 py-3">
          <Body size="s" color="gray-70">
            ⚠ 이 레이아웃에 종속되지 마세요. 부품은 그대로 두고 <code>app/page.tsx</code>만 주제에 맞게 갈아끼우면 됩니다.
          </Body>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <UserInfoForm />
          <MapPanel />
        </div>
      </section>

      {/* 다음 단계 안내 */}
      <section id="section-2" className="mx-auto max-w-container px-4 pb-16">
        <div className="rounded-krds-lg border border-gray-10 bg-gray-5 p-6 md:p-8">
          <Title size="m" color="gray-90">다음 단계 (CLAUDE.md 워크플로우)</Title>
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
