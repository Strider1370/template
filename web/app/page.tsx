'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TextArea, Button } from '@krds-ui/core';
import { GuideCard, type GuideResult } from '@/components/GuideCard';

const SAMPLES: { label: string; text: string }[] = [
  {
    label: '지급명령서',
    text: `채권자 OO캐피탈 주식회사
채무자 김민우
위 당사자 간 대여금 청구 독촉사건에 관하여, 채무자는 채권자에게 금 3,200,000원 및 이에 대한 지연손해금을 지급하라.
채무자는 이 지급명령 정본을 송달받은 날부터 2주 이내에 이의신청을 할 수 있다.`,
  },
  {
    label: '이사·전입신고',
    text: '지난 주에 새 집으로 이사했는데 전입신고를 해야 한다고 들었어요. 뭐부터 어떻게 해야 하나요?',
  },
];

// 네이티브 앱(Capacitor)에서만: 분석 결과가 나오면 로컬 알림. 웹/PWA 는 동작 안 함.
function notifyAnalysisDone(firstStep?: string) {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (!cap?.isNativePlatform?.()) return;
  import('@capacitor/local-notifications')
    .then(async ({ LocalNotifications }) => {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now() % 100000,
            title: '첫걸음 분석 완료',
            body: firstStep ? `지금, 첫 걸음: ${firstStep}` : '받은 내용의 뜻·기한·첫 걸음 안내가 준비됐어요.',
          },
        ],
      });
    })
    .catch(() => {});
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function Home() {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GuideResult | null>(null);

  async function analyze() {
    if (!text.trim() && !image) {
      setError('받은 문서를 붙여넣거나, 상황을 적거나, 사진을 올려주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, image }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? '분석에 실패했습니다.');
      } else {
        const guide = data as GuideResult;
        setResult(guide);
        notifyAnalysisDone(guide.guide?.firstStep);
      }
    } catch {
      setError('네트워크 오류로 분석하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일 재선택도 인식되게
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setImage(url);
      setText(''); // 사진 첨부 시 입력창 비우기 — 텍스트가 같이 전송돼 결과가 섞이는 버그 방지
      setResult(null);
      setError(null);
    } catch {
      setError('이미지를 읽지 못했습니다.');
    }
  }

  // 입력·사진·결과 모두 초기화(새로 시작).
  function reset() {
    setText('');
    setImage(null);
    setResult(null);
    setError(null);
  }

  return (
    <>
      {/* Hero — 주제 맞춤 배너(GPT 생성) + 스크림으로 텍스트 가독성 */}
      <section className="relative overflow-hidden bg-hero-fade">
        <Image
          src="/hero-banner.png"
          alt=""
          aria-hidden
          fill
          priority
          unoptimized
          className="object-cover object-right"
        />
        {/* 좌측 텍스트 가독성 스크림 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(246,248,252,.97), rgba(246,248,252,.86) 42%, rgba(246,248,252,.30) 100%)',
          }}
        />
        {/* 하단을 페이지 배경으로 블렌드 */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to bottom, rgba(246,248,252,0), rgba(246,248,252,1))' }}
        />
        <div className="relative mx-auto max-w-container px-4 pb-5 pt-6 md:pb-16 md:pt-20">
          <h1 className="break-keep text-heading-m font-bold leading-tight tracking-tight text-gray-90 md:text-display-m">
            어려운 행정, <span className="text-primary">쉬운 첫 걸음</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-body-m text-gray-70 md:mt-3 md:text-heading-s md:font-normal">
            문서·고지서·지원금·민원까지 — 무슨 뜻이고 당장 뭘 하면 되는지, 공식 출처와 함께.
          </p>
        </div>
      </section>

      {/* 입력 카드 */}
      <section id="how" className="mx-auto max-w-container px-4">
        <div className="mt-3 rounded-krds-xl border border-gray-20 bg-white p-5 shadow-card md:mt-6 md:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2" id="examples">
            <span className="text-label-s text-gray-50">예시로 해보기:</span>
            {SAMPLES.map((s) => (
              <Button
                key={s.label}
                variant="secondary"
                size="small"
                onClick={() => {
                  setText(s.text);
                  setImage(null);
                  setResult(null);
                }}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {image ? (
            /* 사진 첨부 시 — 입력창을 사진 미리보기로 대체(첨부 사실을 크게 보여줌) */
            <div className="overflow-hidden rounded-krds border border-gray-30 bg-gray-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="첨부한 사진 미리보기" className="max-h-72 w-full bg-gray-10 object-contain" />
              <div className="flex items-center justify-between gap-2 border-t border-gray-20 bg-white px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-body-m font-bold text-success-60">
                  <span aria-hidden>✓</span> 사진 첨부됨
                </span>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="rounded-krds px-3 py-1.5 text-label-m font-bold text-gray-70 hover:bg-gray-10"
                >
                  사진 빼기
                </button>
              </div>
            </div>
          ) : (
            <TextArea
              id="doc-input"
              title="받은 문서를 붙여넣거나, 상황을 적어보세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="예) 법원에서 지급명령서를 받았는데 무슨 뜻인지 모르겠어요…"
            />
          )}

          <div className="mt-4 flex flex-nowrap items-center gap-2">
            <label className="inline-flex flex-none cursor-pointer items-center gap-1 rounded-krds border border-gray-40 bg-white px-3 py-2.5 text-label-m font-bold text-gray-80 hover:bg-gray-5">
              <span aria-hidden>📷</span> {image ? '사진 바꾸기' : '사진으로 올리기'}
              <input type="file" accept="image/*" capture="environment" onChange={onPickImage} className="hidden" />
            </label>

            {/* 초기화는 텍스트 입력 상태에서만 — 사진 첨부 시엔 '사진 빼기'가 그 역할 */}
            {!image && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex flex-none items-center rounded-krds border border-gray-40 bg-white px-3 py-2.5 text-label-m font-bold text-gray-70 hover:bg-gray-5"
              >
                초기화
              </button>
            )}

            <div className="ml-auto flex-none">
              <Button
                variant="primary"
                size="medium"
                onClick={analyze}
                disabled={loading}
                {...({ 'data-testid': 'analyze' } as Record<string, string>)}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    분석 중…
                  </span>
                ) : (
                  '분석하기 →'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p data-testid="error" className="mt-3 text-label-m font-medium text-danger-60">
              {error}
            </p>
          )}
        </div>

        {/* 결과 */}
        {result && (
          <div className="mt-6 animate-fade-up pb-4">
            <GuideCard result={result} />
            <p className="mt-3 px-1 text-detail-s text-gray-50">
              이 안내는 이해를 돕는 보조 도구이며 법률 자문이 아닙니다. 실제 신청·제출은 정부24 또는 관할 기관에서 진행하세요.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
