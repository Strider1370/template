'use client';

import { useMemo, useState } from 'react';
import { Heading, Body, Detail } from '@krds-ui/core';
import { SIGUNGU_BY_SIDO } from '@/lib/regions';
import { HOUSEHOLD_LABELS, type HouseholdType, type Profile } from '@/lib/types';
import { requestParse } from '@/lib/ai';

const SIDO = Object.keys(SIGUNGU_BY_SIDO);
const HH_TYPES = Object.keys(HOUSEHOLD_LABELS) as HouseholdType[];
const DEMO_TEXT = '8개월 아기 키우는 서울 강서구 사는 30대 부부, 월소득 350만원';

const FIELD =
  'h-11 w-full rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
// 단위 토글·단위 라벨과 함께 쓰는 숫자 입력칸 — 남은 칸 폭을 채워 다른 칸과 정렬(일관성)
const NUMFIELD =
  'h-11 min-w-0 flex-1 rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function numOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function matchSido(s: string): string {
  if (!s) return '';
  return SIDO.find((k) => k === s || k.includes(s) || s.includes(k)) || '';
}

// 작은 세그먼트 토글 (월/연, 개월/세, 있음/없음)
function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <span className="inline-flex h-11 flex-none overflow-hidden rounded-krds border border-line">
      {options.map((o, i) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={on}
            className={`min-w-[3rem] px-4 text-body-m font-bold ${i > 0 ? 'border-l border-line' : ''} ${
              on ? 'bg-primary text-white' : 'bg-white text-gray-60 hover:bg-primary-5 hover:text-primary'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </span>
  );
}

export function BenefitFinder({ onSubmit }: { onSubmit: (p: Profile) => void }) {
  const [text, setText] = useState('');
  const [types, setTypes] = useState<HouseholdType[]>([]);
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');
  const [size, setSize] = useState('');
  const [incomeUnit, setIncomeUnit] = useState<'month' | 'year'>('month');
  const [income, setIncome] = useState('');
  const [hasChild, setHasChild] = useState<'' | 'yes' | 'no'>('');
  const [childAge, setChildAge] = useState('');
  const [childAgeUnit, setChildAgeUnit] = useState<'month' | 'year'>('month');
  const [childCount, setChildCount] = useState('');
  const [age, setAge] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<{ kind: 'ok' | 'fail'; msg: string } | null>(null);

  const sigunguList = useMemo(() => (sido ? SIGUNGU_BY_SIDO[sido] ?? [] : []), [sido]);

  function toggleType(t: HouseholdType) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function resetForm() {
    setTypes([]); setSido(''); setSigungu(''); setSize('');
    setIncomeUnit('month'); setIncome('');
    setHasChild(''); setChildAge(''); setChildAgeUnit('month'); setChildCount('');
    setAge('');
  }

  // ① 자연어 → AI가 아래 폼을 '문장 기준으로 새로' 채움 (이전 값은 초기화 → 혼선 방지)
  async function handleAiFill() {
    if (!text.trim()) return;
    setAiBusy(true);
    setAiNote(null);
    const parsed = await requestParse(text.trim());
    setAiBusy(false);
    if (!parsed) {
      setAiNote({ kind: 'fail', msg: 'AI 자동 입력을 쓸 수 없어요. 아래에서 직접 골라주세요.' });
      return;
    }
    resetForm();
    if (parsed.householdTypes?.length) setTypes(parsed.householdTypes);
    if (parsed.region) {
      const matched = matchSido(parsed.region);
      if (matched) {
        setSido(matched);
        const list = SIGUNGU_BY_SIDO[matched] ?? [];
        if (parsed.district && list.includes(parsed.district)) setSigungu(parsed.district);
      }
    }
    if (parsed.householdSize != null) setSize(String(parsed.householdSize));
    if (parsed.monthlyIncome != null) { setIncomeUnit('month'); setIncome(String(parsed.monthlyIncome)); }
    if (parsed.youngestChildAgeMonths != null) {
      setHasChild('yes'); setChildAgeUnit('month'); setChildAge(String(parsed.youngestChildAgeMonths));
    }
    if (parsed.applicantAge != null) setAge(String(parsed.applicantAge));
    setAiNote({ kind: 'ok', msg: 'AI가 아래 입력을 채웠어요. 맞는지 확인하고 고쳐주세요.' });
  }

  // ② 현재 폼 → Profile (월 소득·개월로 정규화). 자녀 '없음/미선택'이면 자녀 정보 비움.
  function handleSubmit() {
    const incomeRaw = numOrNull(income);
    const monthlyIncome =
      incomeRaw == null ? null : incomeUnit === 'year' ? Math.round(incomeRaw / 12) : incomeRaw;

    const childAgeNum = numOrNull(childAge);
    const youngestChildAgeMonths =
      hasChild === 'yes' && childAgeNum != null
        ? childAgeUnit === 'year' ? childAgeNum * 12 : childAgeNum
        : null;

    const finalTypes = new Set<HouseholdType>(types);
    if (hasChild === 'yes' && (numOrNull(childCount) ?? 0) >= 2) finalTypes.add('multi_child');

    onSubmit({
      householdTypes: finalTypes.size ? [...finalTypes] : ['general'],
      region: sido,
      district: sigungu || undefined,
      monthlyIncome,
      householdSize: numOrNull(size) ?? 1,
      youngestChildAgeMonths,
      applicantAge: numOrNull(age),
    });
  }

  return (
    <section className="rounded-krds-lg border border-gray-10 bg-white p-5 md:p-6">
      <Heading size="s" color="gray-90">
        우리 가족 상황을 알려주세요
      </Heading>
      <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-label-s text-gray-50">
        <li>① 가족 상황 입력 (말로 또는 직접)</li>
        <li>② AI가 이해 + 규칙으로 매칭</li>
        <li>③ 받을 수 있는 혜택 + “왜”까지</li>
      </ol>

      {/* ① 자연어 (AI 자동 입력) */}
      <div className="mt-5 rounded-krds border border-primary-10 bg-primary-5 p-4">
        <Detail size="s" color="primary" className="mb-1 block font-bold">
          ① 한 문장으로 — AI가 아래 칸을 채워드려요 (로그인 없음)
        </Detail>
        <textarea
          data-testid="nl-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder={`예: ${DEMO_TEXT}`}
          className="w-full rounded-krds border border-line bg-white p-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="ai-fill"
            onClick={handleAiFill}
            disabled={aiBusy || !text.trim()}
            className="inline-flex h-10 items-center rounded-krds bg-primary px-4 text-label-m font-bold text-white hover:bg-primary-60 disabled:opacity-50"
          >
            {aiBusy ? 'AI가 읽는 중…' : '✨ AI로 입력 채우기'}
          </button>
          <button type="button" onClick={() => setText(DEMO_TEXT)} className="text-label-s font-bold text-primary hover:underline">
            예시 문장
          </button>
        </div>
        {aiNote && (
          <Body size="s" color={aiNote.kind === 'ok' ? 'primary' : 'gray-60'} className="mt-2">
            {aiNote.kind === 'ok' ? '✓ ' : '· '}
            {aiNote.msg}
          </Body>
        )}
      </div>

      {/* ② 직접 선택 / 수정 — 모두 선택 항목 */}
      <Detail size="s" color="gray-50" className="mt-5 block">
        ② 또는 직접 선택하세요 · 모두 선택 항목, 아는 것만 채우면 돼요
      </Detail>

      <div className="mt-2">
        <Detail size="s" color="gray-70" className="mb-1.5 block">
          가구 상황 (해당 모두)
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
                  on ? 'border-primary bg-primary text-white' : 'border-line bg-white text-gray-70 hover:border-primary'
                }`}
              >
                {HOUSEHOLD_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">거주 지역 — 시/도 (선택)</Detail>
          <select className={FIELD} value={sido} onChange={(e) => { setSido(e.target.value); setSigungu(''); }}>
            <option value="">선택</option>
            {SIDO.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">시/군/구 (선택)</Detail>
          <select className={FIELD} value={sigungu} onChange={(e) => setSigungu(e.target.value)} disabled={!sido}>
            <option value="">{sido ? '선택' : '시/도 먼저'}</option>
            {sigunguList.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">가구원 수 (선택)</Detail>
          <select className={FIELD} value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">선택</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}명</option>)}
          </select>
        </label>
        <div className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">가구 소득 (선택 · 모르면 비움)</Detail>
          <div className="flex items-center gap-2">
            <Seg value={incomeUnit} onChange={setIncomeUnit} options={[{ v: 'month', label: '월' }, { v: 'year', label: '연' }]} />
            <input className={NUMFIELD} type="number" inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="350" />
            <span className="flex-none text-body-m text-gray-60">만원</span>
          </div>
          <Detail size="s" color="gray-50" className="mt-1 block">연봉이면 ‘연’ 선택 — 자동으로 월로 환산해 매칭</Detail>
        </div>
        <div className="block">
          <Detail size="s" color="gray-70" className="mb-1 block">신청자 나이 (선택 · 청년·노년 혜택)</Detail>
          <div className="flex items-center gap-2">
            <input className={NUMFIELD} type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="33" />
            <span className="flex-none text-body-m text-gray-60">세</span>
          </div>
        </div>
      </div>

      {/* 자녀 — 조건부 (있음일 때만 나이/수 노출) */}
      <div className="mt-4 border-t border-gray-10 pt-4">
        <div className="flex items-center gap-3">
          <Detail size="s" color="gray-70">자녀가 있나요?</Detail>
          <Seg value={hasChild === '' ? 'no' : hasChild} onChange={setHasChild} options={[{ v: 'yes', label: '있음' }, { v: 'no', label: '없음' }]} />
        </div>
        {hasChild === 'yes' && (
          <div className="mt-3 grid gap-4 rounded-krds bg-gray-5 p-3 sm:grid-cols-2">
            <div className="block">
              <Detail size="s" color="gray-70" className="mb-1 block">막내 나이</Detail>
              <div className="flex items-center gap-2">
                <input className={NUMFIELD} type="number" inputMode="numeric" value={childAge} onChange={(e) => setChildAge(e.target.value)} placeholder="8" />
                <Seg value={childAgeUnit} onChange={setChildAgeUnit} options={[{ v: 'month', label: '개월' }, { v: 'year', label: '세' }]} />
              </div>
            </div>
            <label className="block">
              <Detail size="s" color="gray-70" className="mb-1 block">자녀 수 (선택)</Detail>
              <select className={FIELD} value={childCount} onChange={(e) => setChildCount(e.target.value)}>
                <option value="">선택</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}명</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      <button
        type="button"
        data-testid="find-benefits"
        onClick={handleSubmit}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-krds bg-primary px-6 text-title-s font-bold text-white hover:bg-primary-60 sm:w-auto"
      >
        혜택 찾기
      </button>
    </section>
  );
}
