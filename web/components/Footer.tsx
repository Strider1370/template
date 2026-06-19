import Image from 'next/image';
import { Label, Body, Detail } from '@krds-ui/core';

// 범용 푸터 스켈레톤 — 서비스명/문구만 교체하세요.
export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-10 bg-gray-5">
      <div className="mx-auto max-w-container px-4 py-10">
        <Image
          src="/gov/gov-emblem-horizontal.svg"
          alt="대한민국정부"
          width={120}
          height={30}
          className="h-6 w-auto"
          unoptimized
        />
        <Label size="m" color="gray-90" className="mt-4 block">
          우리 가족 맞춤 정부 혜택 찾기
        </Label>
        <Detail size="s" color="gray-50" className="mt-4 block">
          해커톤 프로토타입(KRDS 기반)입니다. 혜택 정보는 복지로 등 공개 제도를 바탕으로 한 예시
          데이터이며, 결과는 참고용 추정입니다. 실제 자격·지급은 해당 기관 심사로 확정됩니다.
        </Detail>
      </div>
    </footer>
  );
}
