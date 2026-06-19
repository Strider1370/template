'use client';

import { Badge, Detail } from '@krds-ui/core';

// DeadlineWarning — 마감/소급 손실 경고 배지.
//
// Wow Moment 핵심: deadlineDday(b, ctx)가 임박(기본 ≤30일)이면 빨갛게 점등.
// assertion 계약(spec §9·demo.scenario step3):
//   data-testid="deadline-warning" 이 visible이고, 텍스트에 'D-' 와 '소멸'(또는 '마감')을 포함.
// → loss 문구는 반드시 'D-{n} 지나면 … 소멸/마감' 형태로 렌더한다.

const WON_PER_MAN = 10000;

/** 원 → "○○만원" (없으면 빈 문자열) */
function formatMan(value: number | null): string {
  if (value == null || value <= 0) return '';
  const man = Math.round(value / WON_PER_MAN);
  if (man >= 10000) return `${(man / 10000).toLocaleString('ko-KR')}억원`;
  return `${man.toLocaleString('ko-KR')}만원`;
}

type Props = {
  /** deadlineDday() 결과(남은 일수). null이면 절벽 없음 → 렌더 안 함 */
  dday: number | null;
  /** 손실 위험 금액(원). 소급/소멸 금액 표기에 사용 */
  amountValue: number | null;
  /** 마감 성격: 'lapse' = 소급분 소멸 / 'window' = 신청창 마감 */
  kind?: 'lapse' | 'window';
  /**
   * 임박 임계값(일). 기본 60.
   * 핵심 절벽 제도(첫만남이용권·부모급여)의 소급 마감이 출생일 +60일이므로,
   * 슬라이더를 '출산 직후'로 당기는 순간(born) 경고가 점등하도록 60으로 둔다.
   */
  threshold?: number;
};

/** dday가 threshold 이하(이미 지난 음수 포함)일 때만 경고를 띄운다. */
export function isImminent(dday: number | null, threshold = 60): boolean {
  return dday != null && dday <= threshold;
}

export function DeadlineWarning({
  dday,
  amountValue,
  kind = 'lapse',
  threshold = 60,
}: Props) {
  if (!isImminent(dday, threshold)) return null;

  const d = dday as number;
  const passed = d < 0;
  const man = formatMan(amountValue);
  const lossWord = kind === 'window' ? '신청 마감' : '소급분 소멸';

  // 'D-' 와 '소멸'/'마감' 토큰 보장 (assertion)
  const ddayLabel = passed ? `D+${Math.abs(d)}` : `D-${d}`;
  const headline =
    kind === 'window'
      ? passed
        ? `신청 창 마감됨 (${ddayLabel})`
        : `D-${d} 지나면 신청 마감`
      : passed
        ? `소급 기한 경과 (${ddayLabel})`
        : man
          ? `D-${d} 지나면 ${man} 소멸 위험`
          : `D-${d} 지나면 소급분 소멸`;

  return (
    <div
      data-testid="deadline-warning"
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-krds border border-danger bg-danger-5 px-3 py-2"
    >
      <Badge label={ddayLabel} variant="danger" size="small" />
      <div className="min-w-0">
        <Detail size="s" className="block font-bold text-danger">
          {headline}
        </Detail>
        <Detail size="s" color="gray-70" className="mt-0.5 block">
          기한 내 신청하지 않으면 받을 수 있던 {lossWord} 위험이 있어요.
        </Detail>
      </div>
    </div>
  );
}
