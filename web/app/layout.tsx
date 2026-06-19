import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// TODO: 새 주제에 맞게 title/description 교체
export const metadata: Metadata = {
  title: '공공 서비스 스타터 (KRDS)',
  description: '한국 공공 서비스용 해커톤 스타터 키트. 새 주제를 여기에 구현하세요.',
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
