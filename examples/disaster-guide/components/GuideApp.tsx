'use client';

import { useState, useEffect } from 'react';
import {
  Heading,
  Title,
  Body,
  Label,
  Detail,
  Chip,
  Button,
  Badge,
} from '@krds-ui/core';
import {
  SIDO,
  FAMILY_OPTIONS,
  DISASTER_TYPES,
  type DisasterType,
} from '@/lib/data';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';
import {
  loadShelters,
  shelterCenter,
  sortSheltersByDistance,
  formatDistance,
  districtOptions as buildDistrictOptions,
  SHELTER_TYPE_LABEL,
  SHELTER_TYPE_COLOR,
  type Coordinates,
  type Shelter,
  type ShelterWithDistance,
} from '@/lib/shelters';
import { KakaoMap } from '@/components/KakaoMap';

// 재난 심각도 → KRDS Badge 매핑
const severityBadge: Record<
  DisasterType['severity'],
  { variant: 'danger' | 'warning' | 'primary'; label: string }
> = {
  danger: { variant: 'danger', label: '위험' },
  warning: { variant: 'warning', label: '주의' },
  info: { variant: 'primary', label: '안내' },
};

function hasDistance(shelter: Shelter): shelter is ShelterWithDistance {
  return (
    'distanceMeters' in shelter &&
    typeof shelter.distanceMeters === 'number'
  );
}

export function GuideApp() {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [district, setDistrict] = useState('');
  const [family, setFamily] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleFamily = (id: string) =>
    setFamily((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [districtSourceShelters, setDistrictSourceShelters] = useState<
    Shelter[]
  >([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [sheltersLoading, setSheltersLoading] = useState(false);
  const [selectedShelterIds, setSelectedShelterIds] = useState<string[]>([]);
  const [shelterPage, setShelterPage] = useState(1);
  const [openDisasterId, setOpenDisasterId] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<
    'actions' | 'family' | 'shelters'
  >('actions');
  const [isMobile, setIsMobile] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'ready' | 'denied' | 'unsupported' | 'error'
  >('idle');

  const region = sido ? `${sido} ${sigungu} ${district}`.trim() : '';
  const familyLabels = FAMILY_OPTIONS.filter((f) => family.includes(f.id));
  const sigunguList = sido ? SIGUNGU_BY_SIDO[sido] ?? [] : [];
  const districtList = buildDistrictOptions(districtSourceShelters, sigungu);

  useEffect(() => {
    setSigungu('');
    setDistrict('');
    setDistrictSourceShelters([]);
  }, [sido]);

  useEffect(() => {
    setDistrict('');
    setDistrictSourceShelters([]);
    if (!sido || !sigungu) return;
    let cancelled = false;
    setDistrictLoading(true);
    loadShelters(sido, sigungu)
      .then((list) => {
        if (!cancelled) setDistrictSourceShelters(list);
      })
      .finally(() => {
        if (!cancelled) setDistrictLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sido, sigungu]);

  // 제출 후 선택 지역 대피소를 비동기 로드 (시/도별 JSON fetch)
  useEffect(() => {
    if (!submitted || !sido) {
      setShelters([]);
      setSelectedShelterIds([]);
      return;
    }
    let cancelled = false;
    setSheltersLoading(true);
    loadShelters(sido, sigungu, district)
      .then((list) => {
        if (!cancelled) {
          setShelters(list);
          setSelectedShelterIds([]);
          setShelterPage(1);
          setActiveResultTab('actions');
        }
      })
      .finally(() => {
        if (!cancelled) setSheltersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submitted, sido, sigungu, district]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus('ready');
      },
      (error) => {
        setLocationStatus(error.code === 1 ? 'denied' : 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const toggleShelterSelection = (id: string) => {
    setSelectedShelterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const MAX_MAP = 80; // 지도 마커 상한 (성능·가독성)
  const PAGE_SIZE = 24;
  const MOBILE_PAGE_SIZE = 8;
  const pageSize = isMobile ? MOBILE_PAGE_SIZE : PAGE_SIZE;
  const visibleShelters = userLocation
    ? sortSheltersByDistance(shelters, userLocation)
    : shelters;
  const selectedShelters = visibleShelters.filter((s) =>
    selectedShelterIds.includes(s.id),
  );
  const mapShelters =
    selectedShelters.length > 0
      ? selectedShelters
      : visibleShelters.slice(0, MAX_MAP);
  const totalPages = Math.max(1, Math.ceil(visibleShelters.length / pageSize));
  const currentPage = Math.min(shelterPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const listShelters = visibleShelters.slice(pageStart, pageStart + pageSize);
  const paginationPages = isMobile
    ? Array.from(
        {
          length: Math.min(3, totalPages),
        },
        (_, i) => Math.min(Math.max(1, currentPage - 1), Math.max(1, totalPages - 2)) + i,
      )
    : Array.from({ length: totalPages }, (_, i) => i + 1);
  const mapCenter =
    selectedShelters.length > 0
      ? shelterCenter(selectedShelters)
      : userLocation ?? shelterCenter(mapShelters);

  useEffect(() => {
    setShelterPage(1);
  }, [userLocation, isMobile]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // 지역 입력 필드 공통 스타일 (select·input 높이/테두리/포커스 정렬용, KRDS 토큰 기반)
  const fieldClass =
    'h-12 w-full rounded-krds border border-gray-30 bg-white px-4 text-body-m text-gray-90 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-20';

  return (
    <div className="mx-auto max-w-container px-4">
      {/* 입력(진단) 카드 */}
      <section id="guide" className="py-6 md:py-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="rounded-krds-lg border border-gray-10 bg-white p-4 shadow-sm md:p-8"
        >
          {/* 카드 헤더 */}
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid h-11 w-11 flex-none place-items-center rounded-krds bg-primary-5 text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <div>
              <Title size="xl" color="gray-90" className="font-bold">
                내 정보 입력
              </Title>
              <Body size="s" color="gray-60" className="mt-1">
                거주 지역과 가족 구성을 입력하면 맞춤 가이드를 보여드립니다.
              </Body>
            </div>
          </div>

          {/* 거주 지역 */}
          <fieldset className="mt-7">
            <legend className="mb-2">
              <Label size="m" color="gray-90">
                거주 지역
              </Label>
            </legend>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sido">
                  <Detail size="s" color="gray-70">
                    시/도
                  </Detail>
                </label>
                {/* KRDS Select(0.6.0)은 비제어형(value/onChange 미노출)이라 선택값을
                    폼 상태로 끌어올 수 없어, KRDS 토큰을 입힌 native select를 사용한다
                    (KRDS 셋업 가이드 4항: 컴포넌트가 커버 못 하는 부분은 토큰 마크업). */}
                <select
                  id="sido"
                  value={sido}
                  onChange={(e) => setSido(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">시/도를 선택하세요</option>
                  {SIDO.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sigungu">
                  <Detail size="s" color="gray-70">
                    시/군/구
                  </Detail>
                </label>
                <select
                  id="sigungu"
                  value={sigungu}
                  onChange={(e) => {
                    setSigungu(e.target.value);
                    setDistrict('');
                  }}
                  disabled={!sido || sigunguList.length === 0}
                  className={fieldClass}
                >
                  <option value="">
                    {sido ? '전체 시/군/구' : '시/도를 먼저 선택하세요'}
                  </option>
                  {sigunguList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="district">
                  <Detail size="s" color="gray-70">
                    구/읍/면/동
                  </Detail>
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!sigungu || districtLoading || districtList.length === 0}
                  className={fieldClass}
                >
                  <option value="">
                    {!sigungu
                      ? '시/군/구를 먼저 선택하세요'
                      : districtLoading
                        ? '하위 지역 확인 중...'
                        : districtList.length > 0
                        ? '전체 하위 지역'
                        : '하위 지역 없음'}
                  </option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* 가족 구성 */}
          <fieldset className="mt-7">
            <legend className="mb-3 flex items-center gap-2">
              <Label size="m" color="gray-90">
                가족 구성
              </Label>
              <Detail size="s" color="gray-50">
                중복 선택 가능
              </Detail>
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {FAMILY_OPTIONS.map((f) => (
                <Chip
                  key={f.id}
                  id={f.id}
                  label={f.label}
                  checked={family.includes(f.id)}
                  onChange={() => toggleFamily(f.id)}
                  size="lg"
                />
              ))}
            </div>
          </fieldset>

          {/* CTA */}
          <div className="mt-6 flex flex-col gap-3 border-t border-gray-10 pt-5 sm:flex-row sm:items-center sm:justify-between md:mt-8 md:pt-6">
            <Detail size="s" color="gray-50">
              입력 정보는 저장되지 않으며 맞춤 안내에만 사용됩니다.
            </Detail>
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={!sido}
              className="w-full sm:w-auto sm:px-10"
            >
              맞춤 가이드 보기
            </Button>
          </div>
        </form>
      </section>

      {/* 결과 */}
      {submitted && (
        <section className="pb-4" aria-live="polite">
          <div className="rounded-krds-lg bg-primary-5 p-4 md:p-5">
            <Detail size="s" color="primary-70">
              맞춤 결과
            </Detail>
            <Heading size="s" color="gray-90" className="mt-1">
              {region || '선택한 지역'}
              {familyLabels.length > 0 && (
                <span className="text-body-m text-gray-60">
                  {' '}
                  · {familyLabels.map((f) => f.label).join(', ')} 동반 가구
                </span>
              )}
            </Heading>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-label-s font-bold text-primary shadow-sm">
                대피소 {sheltersLoading ? '확인 중' : `${shelters.length}곳`}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-label-s font-bold text-gray-70 shadow-sm">
                재난 행동요령 {DISASTER_TYPES.length}종
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-label-s font-bold text-gray-70 shadow-sm">
                가족 맞춤 {familyLabels.length > 0 ? `${familyLabels.length}개` : '선택 전'}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-krds-lg border border-primary-10 bg-white p-1.5 shadow-sm md:hidden">
            <div className="grid grid-cols-3 gap-1 rounded-krds bg-primary-5 p-1">
            {[
              ['actions', '행동요령'],
              ['family', '가족 맞춤'],
              ['shelters', '대피소'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setActiveResultTab(id as 'actions' | 'family' | 'shelters')
                }
                className={`h-10 rounded-krds text-label-s font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  activeResultTab === id
                    ? 'bg-white text-primary shadow-sm ring-1 ring-primary-10'
                    : 'text-gray-70 hover:bg-white/60'
                }`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>

          <div
            className={`${
              activeResultTab === 'actions' ? 'block' : 'hidden'
            } md:block`}
          >
            {/* 재난 유형별 행동요령 카드 */}
            <Heading size="m" color="gray-90" className="mt-7 md:mt-8">
              재난 유형별 행동요령
            </Heading>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
              {DISASTER_TYPES.map((d) => {
                const badge = severityBadge[d.severity];
                const open = openDisasterId === d.id;
                return (
                  <article
                    key={d.id}
                    className={`flex min-h-[152px] flex-col rounded-krds-lg border bg-white p-4 transition hover:shadow-md md:min-h-[168px] md:p-5 ${
                      open ? 'border-primary shadow-sm' : 'border-gray-10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="text-2xl">
                        {d.icon}
                      </span>
                      <Heading size="s" color="gray-90">
                        {d.name}
                      </Heading>
                      <span className="ml-auto">
                        <Badge
                          label={badge.label}
                          variant={badge.variant}
                          size="small"
                        />
                      </span>
                    </div>
                    <Body size="s" color="gray-70" className="mt-3">
                      {d.summary}
                    </Body>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenDisasterId(open ? null : d.id)}
                      className="mt-auto inline-flex items-center gap-1 pt-4 text-label-m font-bold text-gray-90 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      행동요령 요약 {open ? '닫기' : '보기'}
                      <span aria-hidden>{open ? '↑' : '→'}</span>
                    </button>
                  </article>
                );
              })}
            </div>
            {openDisasterId && (
              <div className="mt-4 rounded-krds-lg border border-primary-10 bg-primary-5 p-4 md:p-5">
                {DISASTER_TYPES.filter((d) => d.id === openDisasterId).map((d) => (
                  <div key={d.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Heading size="s" color="gray-90">
                        {d.icon} {d.name} 행동요령
                      </Heading>
                      <Detail size="s" color="primary-70" className="font-bold">
                        {d.sourceLabel}
                      </Detail>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {d.steps.map((step) => (
                        <section
                          key={step.title}
                          className="rounded-krds border border-gray-10 bg-white p-3 md:p-4"
                        >
                          <Label size="m" color="gray-90">
                            {step.title}
                          </Label>
                          <ol className="mt-3 space-y-2">
                            {step.items.map((item, index) => (
                              <li key={item} className="flex gap-2.5">
                                <span
                                  aria-hidden
                                  className="mt-0.5 text-label-s font-bold text-primary"
                                >
                                  {index + 1}.
                                </span>
                                <Detail size="s" color="gray-70">
                                  {item}
                                </Detail>
                              </li>
                            ))}
                          </ol>
                        </section>
                      ))}
                    </div>
                    <a
                      href="https://www.safekorea.go.kr/safekorea-kor/acts/nacts/nationalActionTips.do?menuSn=4"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-label-s font-bold text-primary hover:underline"
                    >
                      국민안전24 행동요령 전체 보기
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 우리 가족 맞춤 안내 */}
          <div
            className={`mt-7 rounded-krds-lg border border-gray-10 bg-white p-4 md:mt-8 md:block md:p-6 ${
              activeResultTab === 'family' ? 'block' : 'hidden'
            }`}
          >
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <Heading size="s" color="gray-90">
                  우리 가족 맞춤 안내
                </Heading>
                <Body size="s" color="gray-60" className="mt-1">
                  선택한 가족 구성에 맞춰 대피 전 챙길 것과 이동 시 주의할
                  점을 정리했습니다.
                </Body>
              </div>
              {familyLabels.length > 0 && (
                <span className="rounded-full bg-primary-5 px-3 py-1 text-label-s font-bold text-primary">
                  {familyLabels.length}개 유형 선택
                </span>
              )}
            </div>
            {familyLabels.length === 0 ? (
              <Body size="s" color="gray-60" className="mt-3">
                가족 구성을 선택하면 맞춤 준비물·대피 팁이 표시됩니다.
              </Body>
            ) : (
              <ul className="mt-5 grid gap-3 md:grid-cols-2 md:gap-4">
                {familyLabels.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-krds-lg border border-primary-10 bg-primary-5/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="flex-none text-2xl leading-none"
                      >
                        {f.icon}
                      </span>
                      <div>
                        <Label size="m" color="gray-90">
                          {f.label}
                        </Label>
                        <Detail
                          size="s"
                          color="primary-70"
                          className="mt-1 block font-bold"
                        >
                          {f.hint}
                        </Detail>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {f.checklist.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span
                            aria-hidden
                            className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gray-50"
                          >
                          </span>
                          <Detail size="s" color="gray-70">
                            {item}
                          </Detail>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 가까운 대피소 (카카오맵 + 목록) */}
          <div
            id="shelter"
            className={`mt-4 rounded-krds-lg border border-gray-10 bg-white p-4 md:block md:p-5 ${
              activeResultTab === 'shelters' ? 'block' : 'hidden'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Heading size="s" color="gray-90">
                  가까운 대피소
                </Heading>
                <Detail size="s" color="gray-50" className="mt-1 block">
                  {region || '선택 지역'} ·{' '}
                  {sheltersLoading ? '불러오는 중…' : `${shelters.length}곳`}
                  {userLocation && ' · 현재 위치 가까운 순'}
                  {selectedShelters.length > 0 &&
                    ` · 선택 ${selectedShelters.length}곳만 지도 표시`}
                </Detail>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-none sm:flex sm:flex-wrap">
                {selectedShelterIds.length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={() => setSelectedShelterIds([])}
                  >
                    선택 초기화
                  </Button>
                )}
                <Button
                  type="button"
                  variant={userLocation ? 'secondary' : 'primary'}
                  size="medium"
                  onClick={requestCurrentLocation}
                  disabled={locationStatus === 'loading'}
                >
                  {locationStatus === 'loading'
                    ? '위치 확인 중…'
                    : userLocation
                      ? '현재 위치 다시 확인'
                      : '현재 위치로 가까운 순'}
                </Button>
              </div>
            </div>

            {locationStatus !== 'idle' && locationStatus !== 'loading' && (
              <Detail size="s" color="gray-60" className="mt-2 block">
                {locationStatus === 'ready' &&
                  '현재 위치 기준 직선거리 가까운 순으로 정렬했습니다.'}
                {locationStatus === 'denied' &&
                  '위치 권한이 거부되어 지역 목록 순서로 표시합니다.'}
                {locationStatus === 'unsupported' &&
                  '이 브라우저에서는 현재 위치 확인을 지원하지 않습니다.'}
                {locationStatus === 'error' &&
                  '현재 위치를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'}
              </Detail>
            )}

            {/* 범례 */}
            <div className="mt-3 flex flex-wrap gap-4">
              {(['earthquake', 'civildefense'] as const).map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: SHELTER_TYPE_COLOR[t] }}
                  />
                  <Detail size="s" color="gray-70">
                    {SHELTER_TYPE_LABEL[t]}
                  </Detail>
                </span>
              ))}
            </div>
            <Detail size="s" color="gray-60" className="mt-2 block">
              목록에서 대피소를 선택하면 선택한 위치만 지도에 표시됩니다.
              지도 숫자 표시는 가까이 모여 있는 대피소 수입니다.
            </Detail>

            <div className="mt-3">
              <KakaoMap
                shelters={mapShelters}
                center={mapCenter}
                userLocation={userLocation}
              />
            </div>

            {sheltersLoading ? (
              <Body size="s" color="gray-60" className="mt-4">
                대피소 정보를 불러오는 중입니다…
              </Body>
            ) : shelters.length === 0 ? (
              <Body size="s" color="gray-60" className="mt-4">
                선택하신 지역의 대피소 데이터가 없습니다. 시/군/구를 바꿔
                다시 시도해 보세요.
              </Body>
            ) : (
              <>
                <ul className="mt-4 grid gap-2 md:grid-cols-2">
                  {listShelters.map((s) => {
                    const selected = selectedShelterIds.includes(s.id);
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleShelterSelection(s.id)}
                          className={`flex h-full w-full items-start gap-2.5 rounded-krds border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                            selected
                              ? 'border-primary bg-primary-5 ring-2 ring-primary-20'
                              : 'border-gray-10 bg-white hover:border-primary-20 hover:bg-gray-5'
                          }`}
                        >
                          <span
                            aria-hidden
                            className="mt-1 h-2.5 w-2.5 flex-none rounded-full"
                            style={{ backgroundColor: SHELTER_TYPE_COLOR[s.type] }}
                          />
                          <span>
                            <Body size="s" color="gray-90">
                              <b>{s.name}</b>
                            </Body>
                            <Detail
                              size="s"
                              color="gray-50"
                              className="mt-0.5 block"
                            >
                              {SHELTER_TYPE_LABEL[s.type]} · {s.address}
                            </Detail>
                            {hasDistance(s) && (
                              <Detail
                                size="s"
                                color="primary-70"
                                className="mt-1 block"
                              >
                                현재 위치에서 약 {formatDistance(s.distanceMeters)}
                              </Detail>
                            )}
                            {selected && (
                              <Detail
                                size="s"
                                color="primary-70"
                                className="mt-1 block font-bold"
                              >
                                선택됨 · 지도에 표시 중
                              </Detail>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Detail size="s" color="gray-50">
                    전체 {visibleShelters.length}곳 중 {pageStart + 1}-
                    {Math.min(pageStart + listShelters.length, visibleShelters.length)}
                    번째를 표시하고 있습니다.
                  </Detail>
                  {totalPages > 1 && (
                    <nav
                      aria-label="대피소 목록 페이지"
                      className="flex flex-wrap items-center gap-1"
                    >
                      <button
                        type="button"
                        onClick={() => setShelterPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 rounded-krds border border-gray-20 px-2.5 text-label-s font-bold text-gray-70 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 md:h-9 md:px-3"
                      >
                        이전
                      </button>
                      {paginationPages.map((page) => (
                          <button
                            key={page}
                            type="button"
                            aria-current={page === currentPage ? 'page' : undefined}
                            onClick={() => setShelterPage(page)}
                            className={`h-8 min-w-8 rounded-krds border px-2.5 text-label-s font-bold transition md:h-9 md:min-w-9 md:px-3 ${
                              page === currentPage
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-20 bg-white text-gray-70 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {page}
                          </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setShelterPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 rounded-krds border border-gray-20 px-2.5 text-label-s font-bold text-gray-70 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 md:h-9 md:px-3"
                      >
                        다음
                      </button>
                    </nav>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
