// timeline.ts — 임신·출산 시간축 정규화 (순수 함수)
//
// 임신 280일(40주) 기준. 출산예정일(due date) ↔ 임신 주차(weeks)를 상호 변환하고,
// 오늘(new Date()) 기준 D-day와 아기 월령(months)을 계산한다.
// Data Agent 소유. UI/AI는 이 함수들을 import 해서 쓴다(새 유틸 만들지 말 것).
//
// 모든 날짜 입력은 'YYYY-MM-DD'(로컬), 내부 비교는 자정 정규화한 ms로 한다.

export const PREGNANCY_DAYS = 280; // 40주 = 280일 (임신 기간 기준)
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type TimelineCtx = {
  /** 임신 주차 (0~42). 출산 후면 음수가 아니라 weeks=40+ 로 두고 monthsOld로 표현 */
  weeks: number;
  /** 출산예정일 또는 실제 출산일 'YYYY-MM-DD' (없을 수 있음) */
  dueDate: string | null;
  /** 오늘 기준 출산예정일까지 남은 일수 (지났으면 음수). dueDate 없으면 weeks로 추정 */
  dueDday: number;
  /** 아기 월령(개월). 아직 출생 전이면 null */
  monthsOld: number | null;
  /** true면 출산 후(예정일을 지났거나 weeks>=40 으로 추정) */
  born: boolean;
};

/** 'YYYY-MM-DD'를 로컬 자정 기준 Date로 파싱. 잘못된 형식이면 null */
export function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  // 존재하지 않는 날짜(예: 02-30) 방어
  if (
    date.getFullYear() !== Number(y) ||
    date.getMonth() !== Number(mo) - 1 ||
    date.getDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

/** Date를 'YYYY-MM-DD'로 포맷 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

/** 오늘 자정(로컬) Date. 테스트를 위해 now 주입 가능 */
function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** a와 b(자정 정규화) 사이의 일수 차 = b - a (정수, 일) */
function daysBetween(a: Date, b: Date): number {
  const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((b0.getTime() - a0.getTime()) / MS_PER_DAY);
}

/**
 * 출산예정일 → 오늘 기준 임신 주차(0~42 클램프).
 * 임신 시작 = dueDate - 280일. weeks = floor((오늘 - 시작) / 7).
 */
export function weeksFromDueDate(dueDate: string, now: Date = new Date()): number {
  const due = parseDate(dueDate);
  if (!due) return 0;
  const start = new Date(due.getTime() - PREGNANCY_DAYS * MS_PER_DAY);
  const elapsed = daysBetween(start, startOfToday(now));
  const weeks = Math.floor(elapsed / 7);
  return Math.max(0, Math.min(42, weeks));
}

/**
 * 임신 주차 → 추정 출산예정일('YYYY-MM-DD').
 * 오늘이 weeks*7일째라고 보고, 남은 (280 - weeks*7)일 뒤를 예정일로 추정.
 */
export function dueDateFromWeeks(weeks: number, now: Date = new Date()): string {
  const w = Math.max(0, Math.min(42, weeks));
  const remainingDays = PREGNANCY_DAYS - w * 7;
  const today = startOfToday(now);
  const due = new Date(today.getTime() + remainingDays * MS_PER_DAY);
  return formatDate(due);
}

/**
 * 출산예정일까지 남은 일수(D-day). 오늘이 예정일이면 0, 지났으면 음수.
 * dueDate 없으면 weeks로 추정해 (280 - weeks*7) 반환.
 */
export function dueDday(
  input: { dueDate?: string | null; weeks?: number | null },
  now: Date = new Date(),
): number {
  const due = parseDate(input.dueDate ?? null);
  if (due) return daysBetween(startOfToday(now), due);
  const w = Math.max(0, Math.min(42, input.weeks ?? 0));
  return PREGNANCY_DAYS - w * 7;
}

/**
 * 아기 월령(개월). 출생일(=예정일을 출산일로 간주) 기준.
 * 출생 전이면 null. 평균 그레고리력 월(30.44일)로 나눈 정수.
 */
export function monthsOld(
  input: { dueDate?: string | null; weeks?: number | null },
  now: Date = new Date(),
): number | null {
  const due = parseDate(input.dueDate ?? null);
  let birth: Date | null = null;
  if (due) {
    birth = due;
  } else if ((input.weeks ?? 0) >= 40) {
    // 주차만 있고 40주 이상이면 (weeks-40)*7일 전에 태어났다고 추정
    const today = startOfToday(now);
    const daysSinceBirth = ((input.weeks as number) - 40) * 7;
    birth = new Date(today.getTime() - daysSinceBirth * MS_PER_DAY);
  }
  if (!birth) return null;
  const elapsedDays = daysBetween(birth, startOfToday(now));
  if (elapsedDays < 0) return null; // 아직 출생 전
  return Math.floor(elapsedDays / 30.44);
}

/**
 * 입력(출산예정일 또는 주차, 한쪽만 줘도 됨)을 정규화한 TimelineCtx로.
 * weeks·dueDate 둘 다 비면 weeks=0으로 본다.
 */
export function buildTimeline(
  input: { dueDate?: string | null; weeks?: number | null },
  now: Date = new Date(),
): TimelineCtx {
  const due = parseDate(input.dueDate ?? null);
  let weeks: number;
  let dueDate: string | null;

  if (due) {
    dueDate = formatDate(due);
    weeks = weeksFromDueDate(dueDate, now);
  } else {
    weeks = Math.max(0, Math.min(42, input.weeks ?? 0));
    dueDate = dueDateFromWeeks(weeks, now);
  }

  const dd = dueDday({ dueDate, weeks }, now);
  const months = monthsOld({ dueDate, weeks }, now);
  const born = dd <= 0 || weeks >= 40;

  return { weeks, dueDate, dueDday: dd, monthsOld: months, born };
}

// ── 인라인 스모크 (예시 입력 → 기대 출력) ──────────────────────────────
// (오늘 = 2026-06-18 가정)
//   weeksFromDueDate('2026-12-25', new Date(2026,5,18))  → 12 (임신 12주차)
//   dueDateFromWeeks(8, new Date(2026,5,18))             → '2027-01-28' (오늘 + 남은 224일)
//   dueDday({weeks:8}, ...)                              → 224  (280 - 56)
//   monthsOld({dueDate:'2026-04-18'}, new Date(2026,5,18)) → 2  (약 2개월)
