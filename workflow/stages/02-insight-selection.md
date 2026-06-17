# Stage 02 — Insight Selection (인사이트 선택 + 기획 확정)

## 1. 목적
리서치를 관점(Insight)으로 압축하고, **사용자와 발산→수렴**으로 최종 방향·차별점(킥)을 고른 뒤,
깐깐한 심사위원 레드팀을 통과시키고, **사용자 승인 후** 프로젝트의 북극성 `concept.md`(한 장짜리 척추)를 받아적는다.
이 단계의 결과물(특히 `concept.md`)이 이후 구현·발표 전체를 관통하는 기준선이 된다.

## 2. 시작 조건
- Stage 01 Gate 통과, `research/integrated-findings.md` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `research/integrated-findings.md`, `research/judge-review.md`, `research/overseas.md`
- guidance: `docs/AI_Hackathon_Operating_System.md` §5 "Stage 02 — Insight 선택"(5.1~5.4) 및 §8 "Stage 02 Review". 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 트랙 원문 전체(integrated-findings로 충분), spec/plan/발표 docs, 타 단계 history.

## 5. 필수 입력
- `research/integrated-findings.md`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할 — 5비트 흐름
> 핵심 원칙: **AI는 발산기·정리기·서기이고, 판단(선택·취향)은 사용자 것.** AI가 혼자 확정하지 않는다.

1. **(a) 발산 — 사용자와 주거니받거니.** Insight·아이디어 후보를 ≥5개 던지고, 사용자의 반응·반박·"이 방향 더 파봐"를 받아 넓힌다. (한 번에 수렴하지 말 것)
2. **(b) 수렴 — 구조화.** 살아남은 후보를 Common Assumption → Observed Reality → Tension → Reframing 구조로 정리하고, 각각 **AI Leverage**(AI가 본질적으로 필요한가)와 **킥(차별점)을 독립 항목**으로 평가. 최종 방향 2~3개로 좁혀 `workflow/decisions/insight-candidates.md`에 기록.
3. **(c) 레드팀 — 승인 *전* 적대적 검증.** `npm run cross-review -- workflow/decisions/insight-candidates.md` 를 **"깐깐한 심사위원" 역할**로 돌린다(Codex 우선 → 클로드 리뷰어 폴백). 공격 관점: "흔한 OO앱 아닌가 / AI가 왜 필요한가 / 차별점을 데모로 보일 수 있나 / 기억에 남을 한 문장이 있나". 버티지 못하면 (a)로 되돌린다.
4. **(d) 사용자 승인 🙋.** `AskUserQuestion`으로 방향을 제시하고 승인을 받는다. 승인 전엔 멈춘다(`awaiting_approval`).
5. **(e) 받아적기.** 승인 후에만 `workflow/decisions/selected-direction.md` + **`concept.md`**(루트, 한 장 북극성)를 생성한다. concept.md의 판단 항목(킥·페르소나·마지막 문장)은 **사용자가 정한 것을 받아적고**, 사용자가 읽고 수정·확정한다.

## 7. 병렬 서브에이전트 구성
- 없음(판단 집약 단계). (c) 레드팀은 cross-review(별도 리뷰어)로 수행.

## 8. 각 서브에이전트의 작업 계약
- (레드팀 리뷰어) `read`=[insight-candidates.md, judge-review.md], `write`=리뷰 코멘트(임시 파일), `doNotWrite`=selected-direction.md·concept.md. 완료: 약한 Insight/약한 AI 필요성/데모로 안 보이는 차별점 지적.

## 9. 생성해야 하는 산출물
- 승인 전: `workflow/decisions/insight-candidates.md` (후보 ≥5, 방향 2~3, 각 킥·AI Leverage).
- 승인 후: `workflow/decisions/selected-direction.md` (확정 방향 + 근거 + 데모 윤곽).
- 승인 후: **`concept.md`** (루트) — 북극성 척추. 필수 헤딩(정확히):
  `## 한 문장 피치` · `## 핵심 페르소나` · `## 킥` · `## Wow Moment` · `## 기억에 남을 마지막 문장` · `## 안 하는 것`
  (템플릿: 루트 `concept.md` 참조)

## 10. 파일 소유권
- 메인 전용: 두 decision 파일 + `concept.md`. (서브에이전트 수정 금지)

## 11. 제한 시간
- 15분. 초과 시 발산 폭은 유지하되 서술을 압축. concept.md 6항목은 반드시 채운다.

## 12. 완료 조건
- insight-candidates.md 존재(후보 ≥5), 레드팀 cross-review 1회 수행, 사용자 승인 완료, selected-direction.md + concept.md(6헤딩) 존재.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:insight`
- 분류: **enforced**. 검사: insight-candidates.md 존재 + 후보 헤딩 ≥5 + selected-direction.md 존재 + **concept.md 존재 및 6개 척추 헤딩 모두 존재**. 하나라도 없으면 FAIL.

## 14. LLM Review Gate
- 위 (c) 레드팀이 곧 LLM Review Gate다: `npm run cross-review -- workflow/decisions/insight-candidates.md`.
- 검토: Insight가 수사에 그치지 않는가, AI 필요성이 실재하는가, 차별점이 데모로 보이는가, 기억에 남을 한 문장이 있는가.

## 15. 사용자 승인 여부
- **`humanApproval: true`.** 승인 전까지 멈춘다. 승인 전 `selected-direction.md`·`concept.md`를 만들지 않는다. 임의 선택 금지 — 사용자 의도 우선.

## 16. 실패 시 폴백
- 레드팀에서 무너지면 (a) 발산으로 복귀(필요 시 Stage 01 핵심 트랙만 재실행). 시간 부족 시 방향을 2개로 축소(생략 X).

## 17. 다음 단계에 전달할 정보
- `concept.md`(북극성 — Stage 03·05·08이 반드시 읽음), `workflow/decisions/selected-direction.md` (Stage 03 spec의 토대).

## 18. 금지 사항
- 승인 없이 방향 확정/확정 파일·concept.md 생성 금지.
- concept.md의 판단(킥·마지막 문장)을 AI가 독단으로 정하기 금지(사용자 결정을 받아적기).
- spec 작성 선행 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-02-insight-selection.md`. "사용자 결정" 항목에 승인 내용 + decision 파일 경로 + concept.md 확정 여부 명시.
