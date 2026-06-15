import Image from 'next/image';
import { Masthead } from '@krds-ui/core';

const UTILITY_LINKS = [
  { label: '국민재난안전포털', href: 'https://www.safekorea.go.kr' },
  { label: '안전디딤돌', href: '#' },
  { label: '첫 화면', href: '/' },
  { label: 'English', href: '#' },
];

const GNB_ITEMS = [
  { label: '맞춤 진단', href: '#guide' },
  { label: '대피소 찾기', href: '#shelter' },
  { label: '행동요령', href: '#guide' },
  { label: '실시간 경보', href: '#alert' },
  { label: '가족별 준비', href: '#guide' },
  { label: '데이터 안내', href: '#data' },
];

function HeaderIcon({ type }: { type: 'search' | 'login' | 'user' | 'bag' }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    login: (
      <>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
      </>
    ),
    user: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M18 8v6" />
        <path d="M15 11h6" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  );
}

export function Header() {
  return (
    <header className="border-b border-gray-20 bg-white">
      <Masthead />

      <div className="border-b border-gray-10">
        <div className="mx-auto flex max-w-container justify-end px-4 py-2 md:py-3">
          <nav
            aria-label="연계 서비스"
            className="hidden items-center gap-4 whitespace-nowrap text-detail-m text-gray-70 md:flex"
          >
            {UTILITY_LINKS.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center hover:text-primary"
              >
                {index > 0 && (
                  <span
                    aria-hidden
                    className="mr-4 h-3.5 w-px bg-gray-20"
                  />
                )}
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mx-auto flex min-h-14 max-w-container items-center justify-between gap-3 px-4 py-2.5 md:min-h-24 md:gap-6 md:py-5">
          <a href="/" className="flex min-w-0 items-center gap-2.5 md:gap-4">
            <Image
              src="/gov/gov-emblem-mark.svg"
              alt=""
              aria-hidden
              width={64}
              height={64}
              className="h-9 w-9 flex-none md:h-16 md:w-16"
              priority
              unoptimized
            />
            <span className="min-w-0">
              <span className="block text-label-s text-gray-60 md:text-label-m">
                행정안전부
              </span>
              <span className="block text-title-m font-bold text-gray-90 md:hidden">
                재난 대비 가이드
              </span>
              <span className="hidden truncate text-heading-m font-bold text-gray-90 md:block">
                우리 동네 재난 대비 가이드
              </span>
            </span>
          </a>

          <nav
            aria-label="사용자 메뉴"
            className="hidden items-center gap-7 text-label-m font-bold text-gray-90 lg:flex"
          >
            <a href="#guide" className="flex items-center gap-1.5 hover:text-primary">
              <HeaderIcon type="search" />
              통합검색
            </a>
            <a href="#guide" className="flex items-center gap-1.5 hover:text-primary">
              <HeaderIcon type="login" />
              로그인
            </a>
            <a href="#guide" className="flex items-center gap-1.5 hover:text-primary">
              <HeaderIcon type="user" />
              회원가입
            </a>
            <a href="#shelter" className="flex items-center gap-1.5 hover:text-primary">
              <HeaderIcon type="bag" />
              비상가방
            </a>
          </nav>
        </div>
      </div>

      <nav aria-label="주요 메뉴" className="border-b border-gray-10">
        <div className="mx-auto flex max-w-container gap-1 overflow-x-auto px-4 py-1 [scrollbar-width:none] md:py-0 [&::-webkit-scrollbar]:hidden">
          {GNB_ITEMS.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex h-10 flex-none items-center rounded-krds px-2.5 text-label-m font-bold text-gray-80 hover:text-primary md:h-16 md:gap-2 md:rounded-none md:px-5 md:text-title-s md:hover:bg-primary-5 ${
                index > 2 ? 'hidden md:flex' : ''
              }`}
            >
              {item.label}
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="hidden h-4 w-4 md:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
