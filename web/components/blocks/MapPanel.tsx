'use client';

import { KakaoMap } from '@/components/KakaoMap';
import type { Shelter, Coordinates } from '@/lib/shelters';
import { Detail } from '@krds-ui/core';

// ─────────────────────────────────────────────────────────────
// 지도 패널 블록 (재사용 부품) — KakaoMap 을 감싼 얇은 래퍼.
// 기본은 빈 POI + 서울 중심. 주제 데이터로 points(POI)·center 를 넘기면 그걸 표시한다.
// 카카오 키(NEXT_PUBLIC_KAKAO_MAP_KEY)가 없으면 KakaoMap 이 안내 패널로 폴백한다.
//
// 필요 없으면 이 블록을 안 가져오면 그만 — 어떤 화면 구조에도 종속되지 않는다.
// ─────────────────────────────────────────────────────────────

const DEFAULT_CENTER: Coordinates = { lat: 37.5665, lng: 126.978 }; // 서울시청

export function MapPanel({
  points = [],
  center = DEFAULT_CENTER,
  note = true,
}: {
  points?: Shelter[];
  center?: Coordinates;
  note?: boolean;
}) {
  return (
    <div>
      <KakaoMap shelters={points} center={center} />
      {note && (
        <Detail size="s" color="gray-50" className="mt-2 block">
          지도 = `web/components/KakaoMap.tsx` 재사용. POI(points)·center 를 주제 데이터로 연결하세요.
          키는 `web/.env.local` 의 `NEXT_PUBLIC_KAKAO_MAP_KEY`.
        </Detail>
      )}
    </div>
  );
}
