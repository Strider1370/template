import Image from 'next/image';
import { Masthead } from '@krds-ui/core';

// 범용 헤더 스켈레톤 — 새 주제에 맞게 서비스명/메뉴만 교체하면 됩니다.
// (정부 식별 Masthead + 엠블럼 + GNB).

const SERVICE_NAME = '첫걸음';
const GNB_ITEMS = [
  { label: '홈', href: '/' },
  { label: '이용 방법', href: '#how' },
  { label: '예시 문서', href: '#examples' },
];

export function Header() {
  return (
    <header className="relative z-10 border-b border-gray-30 bg-white shadow-soft">
      {/* 정부 식별 Masthead — 데스크톱만. 모바일은 앱 셸처럼 군더더기 제거. */}
      <div className="hidden md:block">
        <Masthead />
      </div>

      <div className="mx-auto flex min-h-14 max-w-container items-center justify-between gap-3 px-4 py-2.5 md:min-h-20 md:py-4">
        <a href="/" className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <Image
            src="/gov/gov-emblem-mark.svg"
            alt=""
            aria-hidden
            width={48}
            height={48}
            className="h-9 w-9 flex-none md:h-12 md:w-12"
            priority
            unoptimized
          />
          <span className="min-w-0">
            <span className="block text-label-s text-gray-60 md:text-label-m">
              행정 안내 도우미
            </span>
            <span className="block truncate text-title-m font-bold text-gray-90 md:text-heading-s">
              {SERVICE_NAME}
            </span>
          </span>
        </a>
      </div>

      <nav aria-label="주요 메뉴" className="hidden border-t border-gray-10 md:block">
        <div className="mx-auto flex max-w-container gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GNB_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex h-12 flex-none items-center rounded-krds px-3 text-label-m font-bold text-gray-80 hover:text-primary md:h-14 md:px-5 md:text-title-s md:hover:bg-primary-5"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
