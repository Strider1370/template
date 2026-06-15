import Image from 'next/image';
import { Display, Heading, Title, Body, Detail } from '@krds-ui/core';
import { GuideApp } from '@/components/GuideApp';

const HERO_INCLUDES = [
  '재난 유형별 행동요령',
  '가까운 대피소·무더위/한파쉼터',
  '실시간 기상특보·긴급재난문자',
  '우리 가족 맞춤 준비물',
];

const FEATURES = [
  {
    title: '지역·가족 맞춤 진단',
    desc: '거주 지역과 가족 구성만 입력하면, 흩어진 재난 정보를 내 상황에 맞게 한 번에 모아 드립니다.',
    icon: (
      <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
  {
    title: '재난 유형별 행동요령',
    desc: '지진·호우·폭염·한파·화재·태풍 등 유형별 핵심 행동요령을 심각도와 함께 카드로 안내합니다.',
    icon: (
      <path d="M9 5h9a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h0 M9 5a2 2 0 0 1 4 0 M8.5 11h7 M8.5 15h7" />
    ),
  },
  {
    title: '대피소·실시간 경보',
    desc: '가까운 대피 시설을 지도로 확인하고, 기상특보·재난문자 등 실시간 경보를 함께 제공합니다.',
    icon: <path d="M12 3a6 6 0 0 0-6 6c0 4-2 6-2 6h16s-2-2-2-6a6 6 0 0 0-6-6Z M10 20a2 2 0 0 0 4 0" />,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-5">
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-cover bg-center md:block"
          style={{ backgroundImage: "url('/hero-neighborhood.png')" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-primary-5 md:bg-transparent md:bg-gradient-to-r md:from-primary-5/82 md:via-primary-5/52 md:to-white/10"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-white/10 md:bg-white/10"
        />
        <div className="relative mx-auto grid max-w-container gap-6 px-4 py-7 md:gap-10 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* 좌: 카피 + CTA */}
          <div>
            <Detail size="l" weight="bold" color="primary-70" className="!text-detail-m md:!text-detail-l">
              우리 동네 맞춤 재난 대비
            </Detail>
            <Display size="s" color="gray-90" className="mt-2 !text-heading-m md:mt-3 md:!text-display-m">
              우리 가족에게 꼭 맞는
              <br />
              재난 대비 가이드
            </Display>
            <Body size="l" color="gray-70" className="mt-3 max-w-[18rem] !text-body-s md:mt-4 md:max-w-xl md:!text-body-l">
              지역과 가족 구성에 맞춰 행동요령과 가까운 대피소를 안내합니다.
            </Body>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 md:mt-7">
              <a
                href="#guide"
                className="inline-flex h-11 w-full items-center justify-center rounded-krds bg-primary px-5 text-label-m font-bold text-white shadow-sm transition hover:bg-primary-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto md:h-12 md:px-6 md:text-label-l"
              >
                맞춤 가이드 시작하기
              </a>
              <a
                href="#shelter"
                className="inline-flex h-9 w-full items-center justify-center rounded-krds bg-white/70 px-4 text-label-m font-bold text-primary underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto md:h-12 md:border md:border-primary md:bg-white/85 md:px-6 md:text-label-l md:no-underline md:shadow-sm md:hover:bg-primary-5"
              >
                대피소 먼저 찾기
              </a>
            </div>
          </div>

          {/* 우: 포함 정보 패널 */}
          <div className="hidden rounded-krds-lg border border-primary-10 bg-white p-5 shadow-sm md:block md:p-8">
            <div className="flex items-center justify-between">
              <Title size="s" color="gray-90">
                이 가이드에 담기는 정보
              </Title>
              <Image
                src="/gov/gov-emblem-mark.svg"
                alt=""
                aria-hidden
                width={36}
                height={36}
                className="h-9 w-9 opacity-80"
                unoptimized
              />
            </div>
            <ul className="mt-5 space-y-3">
              {HERO_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="mt-0.5 h-5 w-5 flex-none text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5 9-11" />
                  </svg>
                  <Body size="m" color="gray-80">
                    {item}
                  </Body>
                </li>
              ))}
            </ul>
            <Detail size="s" color="gray-50" className="mt-5 block">
              공공데이터(행정안전부·기상청·공공데이터포털) 기반으로 제공됩니다.
            </Detail>
          </div>
        </div>
      </section>

      <GuideApp />

      {/* 주요 기능 */}
      <section className="mx-auto max-w-container px-4 py-14">
        <Heading size="s" color="gray-90">
          이렇게 도와드려요
        </Heading>
        <Body size="m" color="gray-60" className="mt-2">
          복잡한 재난 정보를 우리 동네·우리 가족 기준으로 정리해 드립니다.
        </Body>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-krds-lg border border-gray-10 bg-white p-6"
            >
              <span className="grid h-12 w-12 place-items-center rounded-krds bg-primary-5 text-primary">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {f.icon}
                </svg>
              </span>
              <Title size="s" color="gray-90" className="mt-4 block">
                {f.title}
              </Title>
              <Body size="s" color="gray-70" className="mt-2">
                {f.desc}
              </Body>
            </article>
          ))}
        </div>
      </section>

      <section id="data" className="mx-auto max-w-container px-4 pb-6">
        <div className="border-t border-gray-10 py-6">
          <Title size="s" color="gray-90">
            데이터 안내
          </Title>
          <Body size="s" color="gray-60" className="mt-2">
            대피소 정보는 공공데이터 기반 정적 데이터로 제공되며, 실시간 경보와
            기상특보는 향후 API 연동 예정입니다.
          </Body>
        </div>
      </section>
    </>
  );
}
