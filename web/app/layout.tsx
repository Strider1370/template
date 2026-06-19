import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: '우리 가족 맞춤 정부 혜택 찾기',
  description:
    '가족 상황을 한 줄로 입력하면, 로그인 없이 받을 수 있는 정부 혜택과 "왜 당신이 해당되는지"를 함께 안내합니다. (예시 데이터 기반 데모)',
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
