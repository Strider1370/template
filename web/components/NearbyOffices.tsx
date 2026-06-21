'use client';

import { useEffect, useRef, useState } from 'react';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';
import { searchKeywords } from '@/lib/offices';

// 위치 기반 "내 주변 OO 찾기". 현재 위치(geolocation) 또는 지역 선택 → 카카오 장소검색.
// 키/권한/네트워크 실패 시 폴백(안내 문구). 관할이 거리와 무관한 케이스에선 렌더되지 않는다(상위에서 locationApplies로 제어).

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
let sdkPromise: Promise<any> | null = null;

function loadKakao(): Promise<any> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'));
    if (window.kakao?.maps?.services) return resolve(window.kakao);
    const done = () => window.kakao.maps.load(() => resolve(window.kakao));
    const existing = document.getElementById('kakao-sdk-services') as HTMLScriptElement | null;
    if (existing) {
      if (window.kakao?.maps?.load) return done();
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener('error', () => reject(new Error('SDK load failed')), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.id = 'kakao-sdk-services';
    s.async = true;
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;
    s.onload = done;
    s.onerror = () => reject(new Error('SDK load failed'));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

type Place = {
  name: string;
  address: string;
  distance?: string;
  url: string;
  lat: number;
  lng: number;
};

export function NearbyOffices({ officeCategory }: { officeCategory: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'denied' | 'error'>('idle');
  const [places, setPlaces] = useState<Place[]>([]);
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const candidates = searchKeywords(officeCategory); // 1차 후보 + 대체어
  const label = officeCategory || '관공서';
  const kakaoRef = useRef<any>(null);
  const renderRef = useRef<{ center: { lat: number; lng: number }; showHere: boolean } | null>(null);
  const [selected, setSelected] = useState<number | null>(null); // 목록에서 고른 관서(있으면 그것만 표시)

  // 지도 div는 status==='ready'일 때만 마운트되므로, 마운트된 뒤(이 effect)에 그린다.
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !kakaoRef.current || !renderRef.current) return;
    const one = selected != null ? places[selected] : null;
    const shown = one ? [one] : places;
    const center = one ? { lat: one.lat, lng: one.lng } : renderRef.current.center;
    renderMap(kakaoRef.current, center, shown, renderRef.current.showHere && selected == null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, places, selected]);

  // 분석 결과가 뜨면(=이 컴포넌트 마운트) 현재 위치 검색을 자동 실행한다.
  useEffect(() => {
    useMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMap(kakao: any, center: { lat: number; lng: number }, list: Place[], showHere: boolean) {
    if (!mapRef.current) return;
    mapRef.current.innerHTML = ''; // 이전 지도/오버레이(라벨) 잔존 제거 후 새로 그린다.
    const esc = (s: string) =>
      String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: list.length <= 1 ? 4 : 6,
    });
    const bounds = new kakao.maps.LatLngBounds();
    const info = new kakao.maps.InfoWindow({ removable: true, zIndex: 4 });

    if (showHere) {
      const here = new kakao.maps.LatLng(center.lat, center.lng);
      new kakao.maps.CustomOverlay({
        map,
        position: here,
        content:
          '<div style="padding:4px 8px;border-radius:999px;background:#e71825;color:#fff;font-size:11px;font-weight:700">현재 위치</div>',
        yAnchor: 1.6,
      });
      bounds.extend(here);
    }

    list.forEach((p) => {
      const pos = new kakao.maps.LatLng(p.lat, p.lng);
      const marker = new kakao.maps.Marker({ map, position: pos, title: p.name });
      bounds.extend(pos);
      // 마커 위 항상 보이는 이름 라벨(아이콘만으론 구별 안 되는 문제 해결).
      new kakao.maps.CustomOverlay({
        map,
        position: pos,
        yAnchor: 2.2,
        content: `<div style="padding:2px 6px;border-radius:6px;background:#fff;border:1px solid #cbd5e1;font-size:11px;font-weight:700;color:#1f2937;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.15)">${esc(p.name)}</div>`,
      });
      const openInfo = () => {
        info.setContent(
          `<div style="padding:7px 10px;font-size:12px;line-height:1.45;max-width:220px"><b>${esc(p.name)}</b><br/><span style="color:#666">${esc(p.address)}</span></div>`,
        );
        info.open(map, marker);
      };
      kakao.maps.event.addListener(marker, 'click', openInfo);
      if (list.length === 1) openInfo(); // 목록에서 고른 단일 관서면 자동으로 펼침
    });

    if (list.length > 0 || showHere) map.setBounds(bounds);
    setTimeout(() => {
      map.relayout();
      if (list.length > 0 || showHere) map.setBounds(bounds);
    }, 100);
  }

  // keywordSearch를 Promise로 감싸 후보를 순차로 시도(1차 실패 시 대체어).
  function runSearch(
    kakao: any,
    places: any,
    q: string,
    options: Record<string, unknown>,
  ): Promise<any[]> {
    return new Promise((resolve) => {
      places.keywordSearch(
        q,
        (data: any[], st: string) => resolve(st === kakao.maps.services.Status.OK ? data : []),
        options,
      );
    });
  }

  async function search(opts: { coord?: { lat: number; lng: number }; region?: string }) {
    if (!KAKAO_KEY) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const kakao = await loadKakao();
      const places = new kakao.maps.services.Places();
      const options: Record<string, unknown> = { size: 5 };
      if (opts.coord) {
        options.location = new kakao.maps.LatLng(opts.coord.lat, opts.coord.lng);
        options.radius = 20000; // 카카오 최대 20km (군 단위는 관청이 멀어 5km로는 0건)
        options.sort = 'distance';
      }
      // 후보 키워드를 순서대로 시도 → 첫 결과가 나오면 채택(시군구청→구청→시청→군청 식).
      let data: any[] = [];
      for (const kw of candidates) {
        const q = opts.region ? `${opts.region} ${kw}` : kw;
        data = await runSearch(kakao, places, q, options);
        if (data.length) break;
      }
      // 좌표 검색인데 20km 내 0건이면 → 반경 제거하고 전국에서 가장 가까운 관청(농촌 거리 대응).
      if (!data.length && opts.coord) {
        delete options.radius;
        for (const kw of candidates) {
          data = await runSearch(kakao, places, kw, options);
          if (data.length) break;
        }
      }
      if (!data.length) {
        setStatus('error');
        return;
      }
      const list: Place[] = data.slice(0, 5).map((d) => ({
        name: d.place_name,
        address: d.road_address_name || d.address_name,
        distance: d.distance ? `${(Number(d.distance) / 1000).toFixed(1)}km` : undefined,
        url: d.place_url,
        lat: Number(d.y),
        lng: Number(d.x),
      }));
      kakaoRef.current = kakao;
      renderRef.current = {
        center: opts.coord ?? { lat: list[0].lat, lng: list[0].lng },
        showHere: Boolean(opts.coord),
      };
      setSelected(null);
      setPlaces(list);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  function useMyLocation() {
    setStatus('loading');
    // 네이티브 앱(Capacitor)에서는 navigator.geolocation 이 http(비보안 출처)라 막힌다.
    // → Capacitor Geolocation 플러그인(네이티브 위치)으로 우회. 웹/PWA 는 기존 navigator 그대로.
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) {
      import('@capacitor/geolocation')
        .then(({ Geolocation }) => Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 }))
        .then((pos) => search({ coord: { lat: pos.coords.latitude, lng: pos.coords.longitude } }))
        .catch(() => setStatus('denied'));
      return;
    }
    if (!navigator.geolocation) {
      setStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => search({ coord: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      () => setStatus('denied'),
      { timeout: 8000 },
    );
  }

  const sidoList = Object.keys(SIGUNGU_BY_SIDO);

  return (
    <div data-testid="nearby-offices" className="rounded-krds-lg border border-gray-20 bg-gray-5 p-4">
      <div className="flex items-center gap-2 text-label-s font-bold text-gray-60">
        <svg className="h-[18px] w-[18px] flex-none text-gray-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14" />
        </svg>
        <span>내 주변 {label} 찾기</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="use-location"
          onClick={useMyLocation}
          className="inline-flex items-center gap-1.5 rounded-krds bg-primary px-3 py-1.5 text-label-m font-bold text-white hover:bg-primary-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          현재 위치로 찾기
        </button>
        <span className="text-label-s text-gray-50">또는 지역 선택:</span>
        <select
          value={sido}
          onChange={(e) => {
            setSido(e.target.value);
            setSigungu('');
          }}
          className="rounded-krds border border-gray-30 bg-white px-2 py-1.5 text-label-m"
        >
          <option value="">시/도</option>
          {sidoList.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {sido && (
          <select
            value={sigungu}
            onChange={(e) => {
              setSigungu(e.target.value);
              if (e.target.value) search({ region: `${sido} ${e.target.value}` });
            }}
            className="rounded-krds border border-gray-30 bg-white px-2 py-1.5 text-label-m"
          >
            <option value="">시/군/구</option>
            {(SIGUNGU_BY_SIDO[sido] ?? []).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}
      </div>

      {status === 'loading' && <p className="mt-3 text-label-m text-gray-60">찾는 중…</p>}
      {status === 'denied' && (
        <p className="mt-3 text-label-m text-gray-70">위치 권한이 없어요. 위에서 지역을 선택해 찾아보세요.</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-label-m text-gray-70">
          {KAKAO_KEY ? '검색 결과를 불러오지 못했어요. 지역을 바꿔 다시 시도하세요.' : '지도 키가 없어 주변 검색을 건너뜁니다(관할 안내·공식 링크를 이용하세요).'}
        </p>
      )}

      {status === 'ready' && (
        <div className="mt-3">
          {selected != null && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mb-2 rounded-krds border border-gray-30 bg-white px-2.5 py-1 text-label-s text-gray-70 hover:bg-gray-10"
            >
              ← 전체 {places.length}곳 보기
            </button>
          )}
          <div ref={mapRef} className="h-56 w-full rounded-krds bg-gray-5" style={{ minHeight: 224 }} />
          <p className="mt-2 text-label-s text-gray-50">목록을 누르면 해당 관서만 지도에 표시됩니다.</p>
          <ul className="mt-2 space-y-2">
            {places.map((p, i) => (
              <li
                key={i}
                onClick={() => setSelected(i)}
                className={`flex cursor-pointer items-start justify-between gap-3 rounded-krds border px-3 py-2 ${
                  selected === i ? 'border-primary bg-primary-5' : 'border-gray-20 hover:bg-gray-5'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-body-m font-bold text-gray-90">{p.name}</div>
                  <div className="truncate text-label-s text-gray-60">{p.address}</div>
                </div>
                <div className="flex flex-none items-center gap-2">
                  {p.distance && <span className="text-label-s text-primary-60">{p.distance}</span>}
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-krds border border-gray-30 px-2 py-1 text-label-s text-gray-70 hover:bg-gray-10"
                  >
                    지도
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
