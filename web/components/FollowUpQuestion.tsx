'use client';

import { useEffect, useState } from 'react';
import { Title, Body, Detail } from '@krds-ui/core';
import { HOUSEHOLD_LABELS, type HouseholdType, type Profile } from '@/lib/types';
import type { NextQuestion } from '@/lib/eligibility';
import { requestQuestion } from '@/lib/ai';

// 적응형 되묻기 한 칸. 다음 질문(슬롯)은 규칙엔진(nextBestQuestion)이 정한다.
// 정직성: "해당된다"고 단정하지 않고 "이것만 확인하면 해당될 수 있어요"(조건부).

const FIELD =
  'h-11 w-40 rounded-krds border border-line bg-white px-3 text-body-m text-gray-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

type Meta =
  | { kind: 'number'; q: string; ph: string; unit: string }
  | { kind: 'household'; q: string };

const META: Record<string, Meta> = {
  youngestChildAgeMonths: { kind: 'number', q: '막내 자녀가 몇 개월인가요?', ph: '예: 8', unit: '개월' },
  applicantAge: { kind: 'number', q: '신청자(대표)는 만 몇 세인가요?', ph: '예: 33', unit: '세' },
  monthlyIncome: { kind: 'number', q: '가구 월 소득이 대략 얼마인가요?', ph: '예: 350', unit: '만원' },
  householdTypes: { kind: 'household', q: '혹시 아래에 해당하는 가구가 있나요?' },
};

const HH_TYPES = (Object.keys(HOUSEHOLD_LABELS) as HouseholdType[]).filter((t) => t !== 'general');

export function FollowUpQuestion({
  question,
  onAnswer,
  onSkip,
}: {
  question: NextQuestion;
  onAnswer: (patch: Partial<Profile>) => void;
  onSkip: () => void;
}) {
  const meta = META[question.slot as string];
  const [num, setNum] = useState('');
  const [types, setTypes] = useState<HouseholdType[]>([]);
  // 질문 문구: 규칙엔진이 고른 항목(meta.q)을 AI가 자연스럽게 다듬음. 키 없거나 실패 시 기본 문구.
  const [aiText, setAiText] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setAiText(null);
    if (meta) requestQuestion(meta.q).then((t) => { if (alive) setAiText(t); });
    return () => { alive = false; };
  }, [meta?.q]);
  if (!meta) return null;

  function toggle(t: HouseholdType) {
    setTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  }

  function submit() {
    if (meta.kind === 'number') {
      const n = parseInt(num, 10);
      if (!Number.isFinite(n)) return;
      onAnswer({ [question.slot]: n } as Partial<Profile>);
    } else {
      if (!types.length) return;
      onAnswer({ householdTypes: types });
    }
  }

  const preview = question.unlockableBenefits.slice(0, 4).join(', ');

  return (
    <div
      data-testid="follow-up"
      className="rounded-krds-lg border border-primary-20 bg-primary-5 p-5"
    >
      <Detail size="s" color="primary" className="mb-1 block font-bold">
        한 가지만 더 확인하면 더 정확해져요
      </Detail>
      <Title size="s" color="gray-90">
        {aiText ?? meta.q}
      </Title>
      <Body size="s" color="gray-60" className="mt-1">
        이게 맞으면 <strong>{preview}</strong>
        {question.unlockableBenefits.length > 4 ? ' 등' : ''}이(가) 후보로 열릴 수 있어요. (단정 아님 ·
        최종 자격은 기관 심사)
      </Body>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {meta.kind === 'number' ? (
          <>
            <input
              data-testid="follow-up-input"
              className={FIELD}
              type="number"
              inputMode="numeric"
              value={num}
              onChange={(e) => setNum(e.target.value)}
              placeholder={meta.ph}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
            <span className="text-body-m text-gray-60">{meta.unit}</span>
          </>
        ) : (
          HH_TYPES.map((t) => {
            const on = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-label-s font-bold ${
                  on ? 'border-primary bg-primary text-white' : 'border-line bg-white text-gray-70 hover:border-primary'
                }`}
              >
                {HOUSEHOLD_LABELS[t]}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          data-testid="follow-up-submit"
          onClick={submit}
          className="inline-flex h-10 items-center rounded-krds bg-primary px-5 text-label-m font-bold text-white hover:bg-primary-60"
        >
          확인
        </button>
        <button
          type="button"
          data-testid="follow-up-skip"
          onClick={onSkip}
          className="text-label-m text-gray-50 hover:text-gray-70 hover:underline"
        >
          모르겠어요 / 건너뛰기
        </button>
      </div>
    </div>
  );
}
