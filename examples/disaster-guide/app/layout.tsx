import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '우리 동네 맞춤 재난 대비 가이드',
  description:
    '거주 지역과 가족 구성을 입력하면 지역·재난 유형별 맞춤 행동요령과 대피 정보를 안내합니다.',
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
