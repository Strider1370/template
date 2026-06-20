'use client';

import { useMemo, useState } from 'react';
import { Detail, Body } from '@krds-ui/core';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';

// ─────────────────────────────────────────────────────────────
// 사용자 정보 입력 블록 (재사용 부품).
// 공공 서비스에서 거의 항상 쓰이는 "지역 + 사용자 정보" 입력을 한 덩어리로 제공한다.
// 자체 상태를 가지며, 값이 바뀌면 onChange 로 알린다(선택).
//
// 주제에 맞게 필드를 교체/추가하세요(연령·가구원수·관심분야는 예시 필드일 뿐).
// 필요 없으면 이 블록을 안 가져오면 그만 — 어떤 화면 구조에도 종속되지 않는다.
// ─────────────────────────────────────────────────────────────

export type UserInfo = {
  sido: string;
  sigungu: string;
  age: string;
  household: string;
  interest: string;
};

const SIDO = Object.keys(SIGUNGU_BY_SIDO);
const INTEREST_OPTIONS = ['복지·혜택', '안전·재난', '주거', '교육·돌봄', '일자리', '건강·의료'];

const FIELD_CLASS =
  'h-11 w-full rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-gray-5 disabled:text-gray-40';

const EMPTY: UserInfo = { sido: '', sigungu: '', age: '', household: '', interest: '' };

export function UserInfoForm({ onChange }: { onChange?: (value: UserInfo) => void }) {
  const [v, setV] = useState<UserInfo>(EMPTY);
  const sigunguList = useMemo(() => (v.sido ? SIGUNGU_BY_SIDO[v.sido] ?? [] : []), [v.sido]);

  function set(patch: Partial<UserInfo>) {
    setV((prev) => {
      const next = { ...prev, ...patch };
      onChange?.(next);
      return next;
    });
  }

  return (
    <div className="space-y-4 rounded-krds-lg border border-gray-10 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">시 / 도</Detail>
          <select className={FIELD_CLASS} value={v.sido} onChange={(e) => set({ sido: e.target.value, sigungu: '' })}>
            <option value="">선택하세요</option>
            {SIDO.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">시 / 군 / 구</Detail>
          <select className={FIELD_CLASS} value={v.sigungu} onChange={(e) => set({ sigungu: e.target.value })} disabled={!v.sido}>
            <option value="">{v.sido ? '선택하세요' : '시/도 먼저 선택'}</option>
            {sigunguList.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>

        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">연령</Detail>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            placeholder="예: 34"
            className={FIELD_CLASS}
            value={v.age}
            onChange={(e) => set({ age: e.target.value })}
          />
        </label>

        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">가구원 수</Detail>
          <select className={FIELD_CLASS} value={v.household} onChange={(e) => set({ household: e.target.value })}>
            <option value="">선택하세요</option>
            {['1', '2', '3', '4', '5+'].map((n) => <option key={n} value={n}>{n}인</option>)}
          </select>
        </label>
      </div>

      <label className="block">
        <Detail size="s" color="gray-70" className="mb-1 block">관심 분야</Detail>
        <select className={FIELD_CLASS} value={v.interest} onChange={(e) => set({ interest: e.target.value })}>
          <option value="">선택하세요</option>
          {INTEREST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>

      {(v.sido || v.age || v.household || v.interest) && (
        <div aria-live="polite" className="rounded-krds border border-primary-10 bg-primary-5 p-3">
          <Body size="s" color="gray-80">
            입력 요약:{' '}
            <strong className="text-primary">
              {[v.sido && `${v.sido} ${v.sigungu}`.trim(), v.age && `${v.age}세`, v.household && `${v.household}인 가구`, v.interest]
                .filter(Boolean)
                .join(' · ') || '아직 없음'}
            </strong>
          </Body>
        </div>
      )}
    </div>
  );
}
