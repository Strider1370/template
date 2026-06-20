// 대피소 데이터 로더
//
// 실데이터: public/data/shelters/<type>/<시도>.json (시/도별 분할, 앱은 선택 지역만 fetch)
//   - civildefense(민방위 대피시설): 전국민방위대피시설 표준 CSV → scripts/build-shelters.mjs 변환
//   - earthquake(지진 옥외대피장소): safetydata.go.kr DSSP-IF-10943 API → (serviceKey 발급 후 생성)
//   파일이 없으면(예: earthquake 미생성) 해당 유형은 빈 배열로 처리한다.

export type ShelterType = 'earthquake' | 'civildefense';

export type Shelter = {
  id: string;
  type: ShelterType;
  name: string;
  address: string;
  sido: string;
  sigungu: string;
  lat: number;
  lng: number;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type ShelterWithDistance = Shelter & {
  distanceMeters: number;
};

export const SHELTER_TYPE_LABEL: Record<ShelterType, string> = {
  earthquake: '지진 옥외대피장소',
  civildefense: '민방위 대피시설',
};

// 지도 마커 색상 (카카오맵 커스텀 마커 + 목록 뱃지 공용)
export const SHELTER_TYPE_COLOR: Record<ShelterType, string> = {
  earthquake: '#008a1e', // success green — 옥외(야외) 집결지
  civildefense: '#256ef4', // primary blue — 지하 대피시설
};

const TYPES: ShelterType[] = ['earthquake', 'civildefense'];

/** 선택 지역(시/도, 선택적 시/군/구)의 대피소를 유형별 JSON에서 불러와 병합 */
export async function loadShelters(
  sido: string,
  sigungu?: string,
  district?: string,
): Promise<Shelter[]> {
  if (!sido) return [];
  const lists = await Promise.all(
    TYPES.map(async (t) => {
      try {
        const res = await fetch(
          `/data/shelters/${t}/${encodeURIComponent(sido)}.json`,
        );
        if (!res.ok) return [] as Shelter[];
        return (await res.json()) as Shelter[];
      } catch {
        return [] as Shelter[];
      }
    }),
  );
  let all = lists.flat();
  if (sigungu) {
    const narrowed = all.filter((s) => s.sigungu === sigungu);
    if (narrowed.length > 0) all = narrowed;
  }
  if (district) {
    const narrowed = all.filter((s) => shelterDistrict(s) === district);
    if (narrowed.length > 0) all = narrowed;
  }
  return all;
}

export function sigunguOptions(shelters: Shelter[]): string[] {
  return [...new Set(shelters.map((s) => s.sigungu).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, 'ko'),
  );
}

export function districtOptions(shelters: Shelter[], sigungu: string): string[] {
  if (!sigungu) return [];
  return [
    ...new Set(
      shelters
        .filter((s) => s.sigungu === sigungu)
        .map(shelterDistrict)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, 'ko'));
}

export function shelterDistrict(shelter: Shelter): string {
  const fullPrefix = `${shelter.sido} ${shelter.sigungu} `;
  const localPrefix = `${shelter.sigungu} `;
  const rest = shelter.address.startsWith(fullPrefix)
    ? shelter.address.slice(fullPrefix.length)
    : shelter.address.startsWith(localPrefix)
      ? shelter.address.slice(localPrefix.length)
      : '';
  if (!rest) return '';
  const next = rest.trim().split(/\s+/)[0] ?? '';
  const cleaned = next.replace(/[,(].*$/, '');
  return /.+(구|읍|면|동|가|리)$/.test(cleaned) ? cleaned : '';
}

/** 지도 중심 좌표 (대피소 평균, 없으면 서울시청) */
export function shelterCenter(list: Shelter[]): { lat: number; lng: number } {
  if (list.length === 0) return { lat: 37.5663, lng: 126.9779 };
  const lat = list.reduce((a, s) => a + s.lat, 0) / list.length;
  const lng = list.reduce((a, s) => a + s.lng, 0) / list.length;
  return { lat, lng };
}

/** 두 좌표 사이의 직선거리(m). 대피소 정렬용이며 실제 이동 경로 거리는 아니다. */
export function distanceMeters(a: Coordinates, b: Coordinates): number {
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function sortSheltersByDistance(
  shelters: Shelter[],
  origin: Coordinates,
): ShelterWithDistance[] {
  return shelters
    .map((s) => ({
      ...s,
      distanceMeters: distanceMeters(origin, { lat: s.lat, lng: s.lng }),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)}km`;
}
