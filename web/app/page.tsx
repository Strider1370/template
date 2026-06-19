'use client';

import { useState } from 'react';
import { Display, Heading, Body, Badge } from '@krds-ui/core';
import { BenefitFinder } from '@/components/BenefitFinder';
import { ParsedProfile } from '@/components/ParsedProfile';
import { BenefitCard } from '@/components/BenefitCard';
import { FollowUpQuestion } from '@/components/FollowUpQuestion';
import { matchBenefits, nextBestQuestion } from '@/lib/eligibility';
import { fallbackExplanation, requestExplain } from '@/lib/ai';
import type { Explanation, MatchResult, Profile } from '@/lib/types';

interface Card {
  result: MatchResult;
  explanation: Explanation;
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [searched, setSearched] = useState(false);
  // 사용자가 "건너뛰기" 한 슬롯 — 다시 묻지 않는다.
  const [skipped, setSkipped] = useState<string[]>([]);

  function runMatch(p: Profile) {
    setProfile(p);
    setSearched(true);

    const results = matchBenefits(p);
    // Wow 불변식: 즉시 폴백 설명으로 카드를 그린다(AI 없어도 완결).
    setCards(results.map((result) => ({ result, explanation: fallbackExplanation(result) })));

    // 키가 있으면 AI 설명으로 비차단 업그레이드.
    results.forEach(async (result, i) => {
      const explanation = await requestExplain(result);
      setCards((prev) =>
        prev.map((c, j) => (j === i && c.result.benefit.id === result.benefit.id ? { ...c, explanation } : c)),
      );
    });
  }

  function handleSubmit(p: Profile) {
    setSkipped([]); // 새 검색이면 건너뛴 슬롯 초기화
    runMatch(p);
  }

  // 적응형 되묻기: 다음 질문은 규칙엔진이 고른다(LLM 아님). 건너뛴 슬롯은 제외.
  const rawQuestion = searched && profile ? nextBestQuestion(profile) : null;
  const followUp = rawQuestion && !skipped.includes(rawQuestion.slot as string) ? rawQuestion : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-primary-5">
        <div className="mx-auto max-w-container px-4 py-10 md:py-14">
          <Badge label="로그인 없이 30초" variant="primary" size="small" />
          <Display
            size="s"
            color="gray-90"
            className="mt-3 !text-heading-l md:!text-display-s"
          >
            우리 가족 맞춤 정부 혜택 찾기
          </Display>
          <Body size="l" color="gray-70" className="mt-3 max-w-2xl">
            받을 수 있는 혜택을 나열만 하지 않습니다. <strong>왜 당신 가족이 해당되는지</strong>를
            함께 보여드려요.
          </Body>
        </div>
      </section>

      <div className="mx-auto max-w-container px-4 py-8">
        {/* 예시 데이터 라벨 + 면책 (상시) */}
        <div
          data-testid="sample-data-label"
          className="mb-5 rounded-krds border border-warning-20 bg-warning-5 p-3"
        >
          <Body size="s" color="gray-70">
            ⚠️ <strong>예시 데이터</strong>입니다(전체 혜택이 아닌 대표 {''}
            예시). 결과는 참고용 추정이며, 실제 자격·지급은 해당 기관 심사로 확정됩니다.
          </Body>
        </div>

        {/* 입력 */}
        <BenefitFinder onSubmit={handleSubmit} />

        {/* 결과 */}
        {searched && profile && (
          <section id="results" className="mt-8 space-y-5">
            <ParsedProfile profile={profile} />

            {/* 적응형 되묻기 — 규칙엔진이 고른 다음 질문 1개 (있을 때만) */}
            {followUp && (
              <FollowUpQuestion
                question={followUp}
                onAnswer={(patch) => runMatch({ ...profile, ...patch })}
                onSkip={() => setSkipped((s) => [...s, followUp.slot as string])}
              />
            )}

            <Heading size="s" color="gray-90">
              해당될 수 있는 혜택 {cards.length}건을 찾았어요
            </Heading>

            {cards.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {cards.map((c) => (
                  <BenefitCard
                    key={c.result.benefit.id}
                    result={c.result}
                    explanation={c.explanation}
                  />
                ))}
              </div>
            ) : (
              <Body size="m" color="gray-60">
                입력하신 조건으로는 예시 혜택 중 해당되는 항목을 찾지 못했어요. 가구 상황·소득·자녀
                정보를 더 입력해 보세요.
              </Body>
            )}
          </section>
        )}
      </div>
    </>
  );
}
