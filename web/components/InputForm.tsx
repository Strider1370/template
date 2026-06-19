'use client';

import { useMemo } from 'react';
import { Heading, Body, Detail, Button } from '@krds-ui/core';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';

// InputForm — 입력 패널.
//  - 모드 토글: 임신 주차 슬라이더(0~42) / 출산예정일(date)
//  - 거주지: 시/도·시군구 (regions.ts, KRDS 토큰 입힌 native <select>)
//  - 값 변경은 onChange로 상위에 즉시 전달 → 라이브 재정렬(Wow).
//  - AI 질문 입력(data-testid="ask-input")은 결과 영역(page.tsx)에 둔다(spec).

const SIDO = Object.keys(SIGUNGU_BY_SIDO);

const SELECT_CLASS =
  'h-11 w-full rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-gray-5 disabled:text-gray-40';

export type InputMode = 'weeks' | 'due';

export type FormValue = {
  mode: InputMode;
  weeks: number;
  dueDate: string;
  sido: string;
  sigungu: string;
};

type Props = {
  value: FormValue;
  onChange: (next: FormValue) => void;
  /** "내 지원금 보기" — 결과 영역으로 스크롤/표시 트리거(선택) */
  onSubmit?: () => void;
};

function weekLabel(weeks: number): string {
  if (weeks >= 40) return `출산 전후 (${weeks}주)`;
  return `임신 ${weeks}주차`;
}

export function InputForm({ value, onChange, onSubmit }: Props) {
  const sigunguList = useMemo(
    () => (value.sido ? SIGUNGU_BY_SIDO[value.sido] ?? [] : []),
    [value.sido],
  );

  const set = (patch: Partial<FormValue>) => onChange({ ...value, ...patch });

  return (
    <div className="rounded-krds-lg border border-gray-10 bg-white p-5 shadow-sm md:p-6">
      <Heading size="s" color="gray-90" className="!mb-0 font-bold">
        내 상황 입력
      </Heading>
      <Body size="s" color="gray-60" className="mt-1">
        주차를 움직이거나 지역을 바꾸면 결과가 실시간으로 다시 정렬돼요.
      </Body>

      {/* 모드 토글 */}
      <div
        className="mt-4 inline-flex rounded-krds border border-gray-20 p-0.5"
        role="tablist"
        aria-label="입력 방식"
      >
        {(['weeks', 'due'] as InputMode[]).map((m) => {
          const active = value.mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => set({ mode: m })}
              className={`rounded-[4px] px-3 py-1.5 text-detail-m font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-gray-60 hover:text-gray-90'
              }`}
            >
              {m === 'weeks' ? '임신 주차' : '출산예정일'}
            </button>
          );
        })}
      </div>

      {/* 임신 주차 슬라이더 */}
      {value.mode === 'weeks' ? (
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <Detail size="s" color="gray-70" className="block">
              임신 주차 (0~42주)
            </Detail>
            <Body size="m" className="font-bold text-primary">
              {weekLabel(value.weeks)}
            </Body>
          </div>
          <input
            type="range"
            min={0}
            max={42}
            step={1}
            value={value.weeks}
            data-testid="weeks-slider"
            onChange={(e) => set({ weeks: Number(e.target.value) })}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-10 accent-primary"
            aria-label="임신 주차 슬라이더"
          />
          <div className="mt-1 flex justify-between">
            <Detail size="s" color="gray-40">
              초기
            </Detail>
            <Detail size="s" color="gray-40">
              출산 직후
            </Detail>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Detail size="s" color="gray-70" className="mb-1 block">
            출산예정일
          </Detail>
          <input
            type="date"
            value={value.dueDate}
            data-testid="due-date"
            onChange={(e) => set({ dueDate: e.target.value })}
            className={SELECT_CLASS}
            aria-label="출산예정일"
          />
        </div>
      )}

      {/* 거주지 */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            시 / 도
          </Detail>
          <select
            className={SELECT_CLASS}
            value={value.sido}
            data-testid="region-sido"
            onChange={(e) => set({ sido: e.target.value, sigungu: '' })}
          >
            <option value="">선택하세요</option>
            {SIDO.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            시 / 군 / 구
          </Detail>
          <select
            className={SELECT_CLASS}
            value={value.sigungu}
            data-testid="region-sigungu"
            disabled={!value.sido}
            onChange={(e) => set({ sigungu: e.target.value })}
          >
            <option value="">
              {value.sido ? '선택하세요' : '시/도 먼저 선택'}
            </option>
            {sigunguList.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      {onSubmit && (
        <Button
          variant="primary"
          size="large"
          onClick={onSubmit}
          className="mt-5 w-full"
        >
          내 지원금 보기
        </Button>
      )}
    </div>
  );
}
