'use client';

import { useEffect, useRef, useState } from 'react';
import { Body, Detail } from '@krds-ui/core';
import {
  type Shelter,
  type Coordinates,
  SHELTER_TYPE_LABEL,
  SHELTER_TYPE_COLOR,
} from '@/lib/shelters';

// 카카오맵 SDK는 전역 window.kakao 에 주입된다.
declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
let kakaoSdkPromise: Promise<any> | null = null;

/** 카카오맵 JS SDK를 1회만 로드 (autoload=false → maps.load 콜백으로 준비) */
function loadKakaoSdk(): Promise<any> {
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'));
    if (window.kakao?.maps?.Map) return resolve(window.kakao);

    let settled = false;
    const timer = window.setTimeout(
      () => fail(new Error('Kakao SDK load timeout')),
      12000,
    );
    const finish = (kakao: any) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(kakao);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      kakaoSdkPromise = null;
      reject(error);
    };
    const ready = () => {
      if (!window.kakao?.maps?.load) {
        fail(new Error('Kakao maps object is unavailable'));
        return;
      }
      window.kakao.maps.load(() => finish(window.kakao));
    };
    const existing = document.getElementById(
      'kakao-map-sdk',
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.kakao?.maps?.load) {
        ready();
        return;
      }
      existing.addEventListener('load', ready, { once: true });
      existing.addEventListener(
        'error',
        () => fail(new Error('SDK load failed')),
        { once: true },
      );
      return;
    }
    const script = document.createElement('script');
    script.id = 'kakao-map-sdk';
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=clusterer`;
    script.onload = ready;
    script.onerror = () => fail(new Error('SDK load failed'));
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// 유형별 색상 핀 (SVG data URI)
function pinImage(kakao: any, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20 28"><path d="M10 0C4.48 0 0 4.48 0 10c0 6.79 10 18 10 18s10-11.21 10-18C20 4.48 15.52 0 10 0z" fill="${color}"/><circle cx="10" cy="10" r="4" fill="#fff"/></svg>`;
  return new kakao.maps.MarkerImage(
    `data:image/svg+xml,${encodeURIComponent(svg)}`,
    new kakao.maps.Size(20, 28),
    { offset: new kakao.maps.Point(10, 28) },
  );
}

type Props = {
  shelters: Shelter[];
  center: Coordinates;
  userLocation?: Coordinates | null;
};

export function KakaoMap({ shelters, center, userLocation }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'nokey' | 'error'>(
    KAKAO_KEY ? 'loading' : 'nokey',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const mapHeightStyle = { height: 'min(520px, 58vh)', minHeight: '360px' };

  useEffect(() => {
    if (!KAKAO_KEY) {
      setStatus('nokey');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setErrorMessage('');
    loadKakaoSdk()
      .then((kakao) => {
        if (cancelled || !ref.current) return;
        const map = new kakao.maps.Map(ref.current, {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 6,
        });
        const bounds = new kakao.maps.LatLngBounds();
        let hasBounds = false;
        const info = new kakao.maps.InfoWindow({ removable: true });
        const markers: any[] = [];

        if (userLocation) {
          const here = new kakao.maps.LatLng(userLocation.lat, userLocation.lng);
          new kakao.maps.CustomOverlay({
            map,
            position: here,
            content:
              '<div style="padding:5px 9px;border-radius:999px;background:#e71825;color:#fff;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.22)">현재 위치</div>',
            yAnchor: 1.6,
          });
          bounds.extend(here);
          hasBounds = true;
        }

        shelters.forEach((s) => {
          const pos = new kakao.maps.LatLng(s.lat, s.lng);
          const marker = new kakao.maps.Marker({
            position: pos,
            title: s.name,
            image: pinImage(kakao, SHELTER_TYPE_COLOR[s.type]),
          });
          markers.push(marker);
          bounds.extend(pos);
          hasBounds = true;
          kakao.maps.event.addListener(marker, 'click', () => {
            info.setContent(
              `<div style="padding:8px 10px;font-size:13px;line-height:1.5;max-width:220px">
                <b>${escapeHtml(s.name)}</b><br/>
                <span style="color:${SHELTER_TYPE_COLOR[s.type]}">${SHELTER_TYPE_LABEL[s.type]}</span><br/>
                <span style="color:#666">${escapeHtml(s.address)}</span>
              </div>`,
            );
            info.open(map, marker);
          });
        });
        if (kakao.maps.MarkerClusterer && markers.length > 0) {
          new kakao.maps.MarkerClusterer({
            map,
            markers,
            averageCenter: true,
            minLevel: 5,
            gridSize: 56,
            calculator: [10, 30, 60],
            styles: [
              {
                width: '34px',
                height: '34px',
                background: 'rgba(37, 110, 244, .9)',
                border: '2px solid #fff',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: '700',
                lineHeight: '31px',
                boxShadow: '0 2px 8px rgba(0,0,0,.25)',
              },
              {
                width: '42px',
                height: '42px',
                background: 'rgba(0, 138, 30, .9)',
                border: '2px solid #fff',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: '700',
                lineHeight: '39px',
                boxShadow: '0 2px 8px rgba(0,0,0,.25)',
              },
              {
                width: '50px',
                height: '50px',
                background: 'rgba(231, 24, 37, .9)',
                border: '2px solid #fff',
                borderRadius: '50%',
                color: '#fff',
                textAlign: 'center',
                fontWeight: '700',
                lineHeight: '47px',
                boxShadow: '0 2px 8px rgba(0,0,0,.25)',
              },
            ],
          });
        } else {
          markers.forEach((marker) => marker.setMap(map));
        }
        if (hasBounds) map.setBounds(bounds);
        setStatus('ready');
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : '');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shelters, center.lat, center.lng, userLocation]);

  // 키가 없거나 로드 실패 → 지도 자리에 안내 (목록은 상위에서 항상 노출)
  if (status === 'nokey' || status === 'error') {
    return (
      <div
        className="grid place-items-center rounded-krds border border-dashed border-gray-30 bg-gray-5 px-4 text-center"
        style={mapHeightStyle}
      >
        <div>
          <Body size="s" color="gray-70">
            {status === 'error'
              ? '지도를 불러오지 못했습니다.'
              : '카카오맵 키가 설정되면 지도가 표시됩니다.'}
          </Body>
          <Detail size="s" color="gray-50" className="mt-1 block">
            아래 목록에서 가까운 대피소 위치를 확인하세요.
            {status === 'nokey' && ' (env: NEXT_PUBLIC_KAKAO_MAP_KEY)'}
          </Detail>
          {status === 'error' && errorMessage && (
            <Detail size="s" color="gray-50" className="mt-1 block">
              원인: {errorMessage}
            </Detail>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={mapHeightStyle}>
      <div
        ref={ref}
        className="h-full w-full rounded-krds bg-gray-5"
        style={mapHeightStyle}
      />
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center rounded-krds bg-gray-5/60">
          <Detail size="s" color="gray-50">
            지도를 불러오는 중…
          </Detail>
        </div>
      )}
    </div>
  );
}
