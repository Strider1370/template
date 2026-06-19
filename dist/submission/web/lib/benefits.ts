// benefits.ts — 제도 데이터 타입(단일 출처) + 정렬/상태 순수 함수.
//
// `Benefit` 인터페이스는 plan.md §2 "잠금 계약"을 그대로 선언한다 — UI/AI가 이걸 import.
// 데이터 값은 web/public/data/benefits/benefits.json (verified-figures.md 1차출처 검증).
// Data Agent 소유.

import { buildTimeline, type TimelineCtx } from './timeline';

// ── 잠금 계약 타입 (plan.md §2 전문) ─────────────────────────────────
export type Phase = 'pregnancy' | 'near_due' | 'after_birth' | 'infant';
export type Anchor = 'pregnancy_week' | 'due_date' | 'birth';

export interface Benefit {
  id: string;
  name: string;
  category: '현금성' | '의료비' | '서비스' | '현물';
  phase: Phase;
  window: {
    anchor: Anchor;
    startOffsetDays: number | null;
    endOffsetDays: number | null;
    pregnancyWeekFrom: number | null;
    pregnancyWeekTo: number | null;
    deadlineOffsetDays: number | null;
  }; // deadlineOffsetDays = 소급/마감 절벽(있으면 손실경고)
  amount: {
    type: 'lump' | 'monthly' | 'voucher' | 'in_kind';
    value: number | null;
    unit: 'KRW';
    note: string;
    verified: boolean;
  };
  eligibility: { summary: string; incomeLimit: string | null; conditions: string[] };
  apply: { channels: string[]; url: string; deadlineNote: string };
  regionVaries: boolean;
  source: string;
  priorityScore: number;
}

export interface BenefitsDataset {
  version: string;
  disclaimer: string;
  benefits: Benefit[];
}

/** 정렬·상태 계산용 컨텍스트. weeks/dueDate 중 한쪽만 줘도 timeline이 채운다. */
export type BenefitCtx = {
  weeks?: number | null;
  dueDate?: string | null;
  region?: string | null;
};

export type BenefitStatus = 'now' | 'soon' | 'past';

// ── 데이터 로드 ──────────────────────────────────────────────────────
const DATA_URL = '/data/benefits/benefits.json';

/** benefits.json 로드. 실패 시 빈 데이터셋. */
export async function loadBenefits(): Promise<BenefitsDataset> {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) return { version: '0', disclaimer: '', benefits: [] };
    return (await res.json()) as BenefitsDataset;
  } catch {
    return { version: '0', disclaimer: '', benefits: [] };
  }
}

// ── 내부: ctx → 정규화 타임라인 ──────────────────────────────────────
function resolve(ctx: BenefitCtx, now: Date = new Date()): TimelineCtx {
  return buildTimeline({ dueDate: ctx.dueDate ?? null, weeks: ctx.weeks ?? null }, now);
}

/**
 * 제도의 신청 창이 지금(t) 기준으로 어디에 있는지.
 *  - "now"  = 지금 신청 가능 (창이 열려 있음)
 *  - "soon" = 아직 안 열림 (미래에 열림)
 *  - "past" = 창이 닫힘/마감 지남
 *
 * 판정 기준(우선순위 단순화 — 데모용):
 *  1) pregnancyWeek 범위가 있으면 임신 주차로 판정.
 *  2) 그 외엔 출산 전/후(born)와 deadline·endOffset 로 판정.
 */
export function statusOf(b: Benefit, ctx: BenefitCtx, now: Date = new Date()): BenefitStatus {
  const t = resolve(ctx, now);

  // 1) 임신 주차 창 (예: 산모·신생아는 예정일 40일전부터 → near_due, 진료비는 임신 전기간)
  const { pregnancyWeekFrom, pregnancyWeekTo } = b.window;
  if (pregnancyWeekFrom != null || pregnancyWeekTo != null) {
    const from = pregnancyWeekFrom ?? 0;
    const to = pregnancyWeekTo ?? 42;
    if (t.weeks < from) return 'soon';
    if (t.weeks > to) return 'past';
    return 'now';
  }

  // 2) phase 기반 (출산 전/후)
  switch (b.phase) {
    case 'pregnancy':
    case 'near_due': {
      // 예정일까지 남은 창. startOffsetDays(예정일 기준 음수, 예: -40)부터 열림.
      if (t.born) {
        // 출산 후: endOffsetDays(출산 후 +N일) 안이면 still now, 지나면 past
        const end = b.window.endOffsetDays;
        if (end != null) {
          const sinceBirth = -t.dueDday; // 예정일 지난 일수
          return sinceBirth <= end ? 'now' : 'past';
        }
        return 'past';
      }
      // 출산 전: startOffsetDays(예정일 기준)부터 열림
      const start = b.window.startOffsetDays;
      if (start != null) {
        // 예: start = -40 → 예정일 40일 전부터. dueDday <= 40 이면 열림
        return t.dueDday <= -start ? 'now' : 'soon';
      }
      return 'now'; // 창 제한 없으면 임신 중 항상 now
    }
    case 'after_birth':
    case 'infant': {
      if (!t.born) return 'soon'; // 아직 출산 전 → 곧 열림
      // 출산 후: deadlineOffsetDays(소급 마감)·endOffsetDays로 판정
      const sinceBirth = -t.dueDday; // 예정일(출산일)로부터 지난 일수
      const end = b.window.endOffsetDays;
      if (end != null && sinceBirth > end) return 'past';
      return 'now';
    }
    default:
      return 'now';
  }
}

/**
 * 소급/마감 절벽까지 남은 일수.
 *  - 절벽 없음(deadlineOffsetDays == null) → null
 *  - 출산 후 D = deadlineOffsetDays - (출산일로부터 지난 일수). 음수면 이미 지남.
 *  - 출산 전(아직 출생 안 함) → 절벽은 출생 기준이라 아직 카운트다운 전: null
 *    (단 near_due 신청창 마감처럼 출산 전 창이면 endOffset 기준으로 남은 일수 반환)
 */
export function deadlineDday(b: Benefit, ctx: BenefitCtx, now: Date = new Date()): number | null {
  const t = resolve(ctx, now);
  const { deadlineOffsetDays, endOffsetDays } = b.window;

  // birth 기준 소급 마감
  if (deadlineOffsetDays != null && (b.phase === 'after_birth' || b.phase === 'infant')) {
    if (!t.born) {
      // 아직 출생 전: 출생 기준 소급 마감은 출생 후에만 의미 → 카운트다운 표시 안 함.
      return null;
    }
    const sinceBirth = -t.dueDday;
    return deadlineOffsetDays - sinceBirth;
  }

  // 출산 전 신청창 마감 (산모·신생아: 출산 후 +30일까지가 마감, near_due)
  if ((b.phase === 'near_due' || b.phase === 'pregnancy') && endOffsetDays != null) {
    // 마감 = 예정일 + endOffsetDays. dueDday(예정일까지) + endOffsetDays = 마감까지 남은 일수
    return t.dueDday + endOffsetDays;
  }

  // 고위험 의료비: 분만일 + endOffsetDays(예: 180) 이내 신청
  if (b.phase === 'pregnancy' && deadlineOffsetDays != null) {
    if (!t.born) return t.dueDday + deadlineOffsetDays;
    return deadlineOffsetDays - -t.dueDday;
  }

  return null;
}

const STATUS_ORDER: Record<BenefitStatus, number> = { now: 0, soon: 1, past: 2 };

/**
 * 정렬: now 우선 → priorityScore 내림차순 → (동점) id.
 * status는 ctx 기준으로 매 호출 계산(라이브 재정렬용).
 */
export function sortBenefits(list: Benefit[], ctx: BenefitCtx, now: Date = new Date()): Benefit[] {
  return [...list].sort((a, b) => {
    const sa = STATUS_ORDER[statusOf(a, ctx, now)];
    const sb = STATUS_ORDER[statusOf(b, ctx, now)];
    if (sa !== sb) return sa - sb;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.id.localeCompare(b.id);
  });
}

// ── 인라인 스모크 (예시 입력 → 기대 출력) ──────────────────────────────
//  ctx = { weeks: 8 } (임신 8주, 출산 전)
//    statusOf(부모급여, ctx)        → 'soon'  (출산 후 제도라 아직 안 열림)
//    statusOf(산모신생아, ctx)      → 'soon'  (예정일 40일 전부터 열림 → 8주는 이름)
//  ctx = { dueDate: '2026-05-01' } (오늘 2026-06-18 → 출산 후 48일)
//    statusOf(첫만남이용권, ctx)    → 'now'   (출생 60일 이내)
//    deadlineDday(첫만남, ctx)      → 12      (60 - 48, D-12 소급 마감)
//    deadlineDday(부모급여, ctx)    → 12      (동일 60일 소급)
