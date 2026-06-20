import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '첫걸음 — 받은 행정문서, 쉬운 말과 첫 걸음으로',
  description:
    '지급명령·과태료·전입신고처럼 막막한 행정 문서나 상황을 넣으면, 쉬운 말 뜻·기한·당장 할 첫 걸음·관할을 공식 출처와 함께 안내합니다.',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  appleWebApp: { capable: true, title: '첫걸음', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#256ef4',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans text-body-m text-gray-90">
        <Header />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
