'use client';

import { useEffect, useState } from 'react';
import { Heading, Body, Detail, Button } from '@krds-ui/core';
import { KakaoMap } from './KakaoMap';
import {
  type Shelter,
  type Coordinates,
  shelterCenter,
} from '@/lib/shelters';

// FacilityMap — "가까운 보건소/육아 시설" 곁가지(시간 부족 시 1순위 컷).
//  - /data/facilities/<시도>.json 로드 → KakaoMap(Shelter 계약)으로 변환해 래핑.
//  - 시설 JSON의 type은 한국어 라벨이므로, 지도 색상용 ShelterType('civildefense')로
//    매핑하고 원본 라벨은 별도 보관해 목록에 표시한다(KakaoMap 미수정).
//  - 카카오 키 없으면 KakaoMap 자체 fallback(목록은 항상 노출).

type Facility = {
  id: string;
  type: string; // '보건소' | '육아종합지원센터' | '산후조리원' ...
  name: string;
  address: string;
  sido: string;
  sigungu: string;
  lat: number;
  lng: number;
};

// 지도 마커(Shelter 계약) + 표시용 한국어 라벨
type MappedShelter = Shelter & { facilityLabel: string };

function toShelter(f: Facility): MappedShelter {
  return {
    id: f.id,
    type: 'civildefense', // KakaoMap 색상 인덱스 안전값(primary blue)
    name: f.name,
    address: f.address,
    sido: f.sido,
    sigungu: f.sigungu,
    lat: f.lat,
    lng: f.lng,
    facilityLabel: f.type,
  };
}

async function loadFacilities(sido: string): Promise<Facility[]> {
  if (!sido) return [];
  try {
    const res = await fetch(`/data/facilities/${encodeURIComponent(sido)}.json`);
    if (!res.ok) return [];
    return (await res.json()) as Facility[];
  } catch {
    return [];
  }
}

type Props = {
  sido: string;
  sigungu?: string;
};

export function FacilityMap({ sido, sigungu }: Props) {
  const [open, setOpen] = useState(false);
  const [facilities, setFacilities] = useState<MappedShelter[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || !sido) return;
    let cancelled = false;
    setLoaded(false);
    loadFacilities(sido).then((list) => {
      if (cancelled) return;
      let mapped = list.map(toShelter);
      if (sigungu) {
        const narrowed = mapped.filter((m) => m.sigungu === sigungu);
        if (narrowed.length > 0) mapped = narrowed;
      }
      setFacilities(mapped);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, sido, sigungu]);

  const center: Coordinates = shelterCenter(facilities);

  return (
    <section className="rounded-krds-lg border border-gray-10 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Heading size="s" color="gray-90" className="!mb-0 font-bold">
            가까운 보건소·육아 시설
          </Heading>
          <Body size="s" color="gray-60" className="mt-1">
            방문 신청이 필요한 지원은 가까운 시설에서 확인하세요.
          </Body>
        </div>
        <Button
          variant={open ? 'secondary' : 'primary'}
          size="medium"
          onClick={() => setOpen((v) => !v)}
          disabled={!sido}
        >
          {open ? '닫기' : '가까운 보건소 보기'}
        </Button>
      </div>

      {!sido && (
        <Detail size="s" color="gray-50" className="mt-3 block">
          거주지(시/도)를 먼저 선택하면 시설을 안내해 드려요.
        </Detail>
      )}

      {open && sido && (
        <div className="mt-4 space-y-4">
          <KakaoMap shelters={facilities} center={center} />
          {loaded && facilities.length === 0 ? (
            <Detail size="s" color="gray-50" className="block">
              이 지역의 시설 데이터가 아직 없어요.
            </Detail>
          ) : (
            <ul className="space-y-2">
              {facilities.map((f) => (
                <li
                  key={f.id}
                  className="rounded-krds border border-gray-10 px-3 py-2"
                >
                  <div className="flex items-baseline gap-2">
                    <Body size="m" color="gray-90" className="font-bold">
                      {f.name}
                    </Body>
                    <Detail size="s" color="primary">
                      {f.facilityLabel}
                    </Detail>
                  </div>
                  <Detail size="s" color="gray-60" className="mt-0.5 block">
                    {f.address}
                  </Detail>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
