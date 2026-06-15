import Image from 'next/image';
import { Label, Body, Detail } from '@krds-ui/core';

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
          우리 동네 재난 대비 가이드
        </Label>
        <Body size="s" color="gray-60" className="mt-2">
          재난 발생 시에는 즉시 119 또는 행정안전부 안전신문고로 신고하세요.
        </Body>
        <Detail size="s" color="gray-50" className="mt-4 block">
          본 서비스는 KRDS(대한민국 디지털정부 디자인시스템) 기반으로 제작된
          해커톤 프로토타입입니다. 데이터 출처: 공공데이터포털·행정안전부.
          정부상징: 대한민국정부 공식 상징(Wikimedia Commons).
        </Detail>
      </div>
    </footer>
  );
}
