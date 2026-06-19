// POST /api/places — 카카오 로컬 키워드 검색 서버 프록시 (AI Agent 소유).
//
// 요청 { query:string, sido?:string }  (query = 검색 키워드, 예: "서울 보건소")
//   → 응답 { places: Shelter[], source:"kakao"|"fallback" }
//
// process.env.KAKAO_REST_API_KEY 로 카카오 로컬 키워드 검색 호출(서버 전용, NEXT_PUBLIC_ 금지).
// 키 없음/실패 → web/public/data/facilities/<시도>.json 폴백(Data Agent가 만듦, 없으면 빈 배열 graceful).

import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import type { Shelter } from '@/lib/shelters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KAKAO_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const TIMEOUT_MS = 5000;
const FACILITIES_DIR = path.join(process.cwd(), 'public', 'data', 'facilities');

type PlacesResponse = { places: Shelter[]; source: 'kakao' | 'fallback' };

/** facilities/<시도>.json 폴백 로드. 없으면 빈 배열(graceful). */
async function loadFacilityFallback(sido: string | null): Promise<Shelter[]> {
  if (!sido) return [];
  try {
    const file = path.join(FACILITIES_DIR, `${sido}.json`);
    const raw = await fs.readFile(file, 'utf-8');
    const data = JSON.parse(raw) as Shelter[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** 카카오 로컬 keyword 검색 응답 1건 → Shelter 형태로 매핑. */
function mapKakaoDoc(doc: {
  id?: string;
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
  region_1depth_name?: string;
  region_2depth_name?: string;
  x?: string; // 경도(lng)
  y?: string; // 위도(lat)
}): Shelter {
  return {
    id: doc.id ?? `${doc.x ?? ''}-${doc.y ?? ''}`,
    type: 'civildefense', // Shelter 타입 재사용(시설 마커용) — 의미상 "시설"
    name: doc.place_name ?? '',
    address: doc.road_address_name || doc.address_name || '',
    sido: doc.region_1depth_name ?? '',
    sigungu: doc.region_2depth_name ?? '',
    lat: Number(doc.y ?? 0),
    lng: Number(doc.x ?? 0),
  };
}

export async function POST(req: Request): Promise<Response> {
  let payload: { query?: unknown; sido?: unknown } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    // 파싱 실패해도 폴백 시도
  }
  const query = typeof payload.query === 'string' ? payload.query.trim() : '';
  const sido = typeof payload.sido === 'string' ? payload.sido : null;

  const apiKey = process.env.KAKAO_REST_API_KEY;

  // 키 있고 검색어 있으면 카카오 시도
  if (apiKey && query) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const url = `${KAKAO_URL}?query=${encodeURIComponent(query)}&size=15`;
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${apiKey}` },
        signal: controller.signal,
      });
      if (res.ok) {
        const data = (await res.json()) as { documents?: unknown[] };
        const docs = Array.isArray(data.documents) ? data.documents : [];
        const places = docs.map((d) => mapKakaoDoc(d as Parameters<typeof mapKakaoDoc>[0]));
        const body: PlacesResponse = { places, source: 'kakao' };
        return NextResponse.json(body);
      }
    } catch {
      // 실패 → 폴백으로
    } finally {
      clearTimeout(timer);
    }
  }

  // 폴백: 고정 facilities/<시도>.json (없으면 빈 배열)
  const places = await loadFacilityFallback(sido);
  const body: PlacesResponse = { places, source: 'fallback' };
  return NextResponse.json(body);
}
