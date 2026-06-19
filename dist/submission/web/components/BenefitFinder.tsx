'use client';

import { useState } from 'react';
import { Heading, Body, Detail } from '@krds-ui/core';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';
import { HOUSEHOLD_LABELS, type HouseholdType, type Profile } from '@/lib/types';
import { requestParse } from '@/lib/ai';

const SIDO = Object.keys(SIGUNGU_BY_SIDO);
const HH_TYPES = Object.keys(HOUSEHOLD_LABELS) as HouseholdType[];
const DEMO_TEXT = '30대 부부, 8개월 아기, 서울 거주, 월 350만원';

const FIELD =
  'h-11 w-full rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function numOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function BenefitFinder({ onSubmit }: { onSubmit: (p: Profile) => void }) {
  const [text, setText] = useState('');
  const [types, setTypes] = useState<HouseholdType[]>([]);
  const [region, setRegion] = useState('');
  const [size, setSize] = useState('3');
  const [income, setIncome] = useState('');
  const [childMonths, setChildMonths] = useState('');
  const [age, setAge] = useState('');
  const [busy, setBusy] = useState(false);

  function toggleType(t: HouseholdType) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function profileFromForm(): Profile {
    return {
      householdTypes: types.length ? types : ['general'],
      region,
      monthlyIncome: numOrNull(income),
      householdSize: numOrNull(size) ?? 1,
      youngestChildAgeMonths: numOrNull(childMonths),
      applicantAge: numOrNull(age),
    };
  }

  async function handleSubmit() {
    setBusy(true);
    let profile = profileFromForm();
    // AI 자연어 파싱(있으면) → 폼 값 위에 병합. 실패/무키면 폼 값 그대로(폴백).
    if (text.trim()) {
      const parsed = await requestParse(text.trim());
      if (parsed) {
        profile = {
          householdTypes: parsed.householdTypes?.length
            ? parsed.householdTypes
            : profile.householdTypes,
          region: parsed.region || profile.region,
          monthlyIncome: parsed.monthlyIncome ?? profile.monthlyIncome,
          householdSize: parsed.householdSize ?? profile.householdSize,
          youngestChildAgeMonths:
            parsed.youngestChildAgeMonths ?? profile.youngestChildAgeMonths,
          applicantAge: parsed.applicantAge ?? profile.applicantAge,
        };
      }
    }
    setBusy(false);
    onSubmit(profile);
  }

  return (
    <section className="rounded-krds-lg border border-gray-10 bg-white p-5 md:p-6">
      <Heading size="s" color="gray-90">
        우리 가족 상황을 알려주세요
      </Heading>
      <Body size="m" color="gray-60" className="mt-1">
        로그인 없이, 한 줄로 적거나 아래 항목을 골라도 됩니다.
      </Body>

      {/* 자연어 입력 */}
      <div className="mt-4">
        <Detail size="s" color="gray-70" className="mb-1 block">
          자연어로 입력 (선택)
        </Detail>
        <textarea
          data-testid="nl-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder={`예: ${DEMO_TEXT}`}
          className="w-full rounded-krds border border-line bg-white p-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <button
          type="button"
          onClick={() => setText(DEMO_TEXT)}
          className="mt-1.5 text-label-s font-bold text-primary hover:underline"
        >
          예시로 채우기
        </button>
      </div>

      {/* 가구 상황 */}
      <div className="mt-4">
        <Detail size="s" color="gray-70" className="mb-1.5 block">
          가구 상황 (해당하는 것 모두)
        </Detail>
        <div className="flex flex-wrap gap-2">
          {HH_TYPES.map((t) => {
            const on = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-label-s font-bold ${
                  on
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-gray-70 hover:border-primary'
                }`}
              >
                {HOUSEHOLD_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 드롭다운/입력 */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            거주 지역
          </Detail>
          <select className={FIELD} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">선택(선택사항)</option>
            {SIDO.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            가구원 수
          </Detail>
          <select className={FIELD} value={size} onChange={(e) => setSize(e.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}명
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            월 소득 (만원)
          </Detail>
          <input
            className={FIELD}
            type="number"
            inputMode="numeric"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="예: 350"
          />
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            막내 자녀 월령 (개월, 없으면 비움)
          </Detail>
          <input
            className={FIELD}
            type="number"
            inputMode="numeric"
            value={childMonths}
            onChange={(e) => setChildMonths(e.target.value)}
            placeholder="예: 8"
          />
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">
            신청자 나이 (만, 선택)
          </Detail>
          <input
            className={FIELD}
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="예: 33"
          />
        </label>
      </div>

      <button
        type="button"
        data-testid="find-benefits"
        onClick={handleSubmit}
        disabled={busy}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-krds bg-primary px-6 text-title-s font-bold text-white hover:bg-primary-60 disabled:opacity-60 sm:w-auto"
      >
        {busy ? '찾는 중…' : '혜택 찾기'}
      </button>
    </section>
  );
}
