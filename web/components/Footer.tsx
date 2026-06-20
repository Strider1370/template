import Image from 'next/image';
import { Label, Detail } from '@krds-ui/core';

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
          첫걸음 — 받은 행정문서, 쉬운 말과 첫 걸음으로
        </Label>
        <Detail size="s" color="gray-50" className="mt-4 block">
          이 서비스는 행정 문서 이해를 돕는 보조 도구이며 법률 자문이 아닙니다.
          실제 신청·제출은 정부24 또는 관할 기관에서 진행하세요. 안내는 표기된 공식 출처(기준일 포함)에 근거합니다.
        </Detail>
      </div>
    </footer>
  );
}
