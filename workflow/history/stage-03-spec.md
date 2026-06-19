<!-- Handoff 보고서 (자동 생성: npm run workflow:handoff). 기계가 채운 부분 + <!-- 직접 채우기 --> 2~3곳만 사람이 보강. -->
# Stage 03 완료 보고 — spec

## 단계
Stage 3 — spec

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-19T08:57:55.541Z
- 종료: 2026-06-19T09:02:25.439Z
- 사용: 4.5분 (예산 10분)

## 완료한 내용
- concept을 풀어쓴 spec.md(16헤딩) 작성 + demo/demo.scenario.yaml(3스텝 + Wow, selector/assertion).
- enforced 게이트 PASS, 교차검토 5관점 PASS(조건부 통과).
- 리뷰 보강 반영: §9에 parsed-profile 검증 추가, §11 fixture 전제 선제방어, §16 폴백 Wow 불변식.

## 생성·수정한 파일
- concept.md
- demo/demo.scenario.yaml
- spec.md
- workflow/decisions/insight-candidates.md
- workflow/decisions/selected-direction.md
- workflow/history/stage-02-insight-selection.md
- workflow/state.yaml

## 서브에이전트 실행 결과
- 메인 단독 작성 + 교차검토자 1명(spec.md ↔ concept/scenario 정합 검토) → 조건부 통과, 제언 3건 전부 반영.

## Gate 결과
- 명령: npm run gate:spec
- 결과: PASS (enforced — 16헤딩·순서, demo.scenario.yaml 파싱, Wow selector/assertion) + 교차검토 5관점 PASS
- 리포트: workflow/history/stage-03-gate.md

## 사용자 결정
승인 불필요

## 적용한 폴백
<!-- 직접 채우기: 없으면 "없음". -->
-

## 남아 있는 위험
- LLM 2지점(구조화·rewrite)의 환각 가드(폴백)·사전캐시를 Stage 05가 실제로 구현해야 데모가 안전. 미구현 시 당일 LLM 실패로 데모 붕괴.
- fixture 8~10건의 자격 규칙·신청링크 품질이 신뢰를 좌우. 출처(복지로 실제 제도)에 근거.

## 확정된 계약
- spec.md 16헤딩·demo.scenario.yaml·data-testid 9종(nl-input, find-benefits, parsed-profile, benefit-card, eligibility-checklist, why-explanation, apply-cta, sample-data-label, login(부정)) 확정 — Stage 05 구현·Stage 07 검증의 기준.
- Wow 불변식: 입력경로·LLM생사 무관하게 parsed-profile/benefit-card/eligibility-checklist/why-explanation 항상 렌더.

## 다음 단계가 읽어야 할 파일
- spec.md, demo/demo.scenario.yaml, concept.md, research/feasibility.md, docs/kit-assets.md
- workflow/stages/04-*.md

## 다음 단계에서 하지 말아야 할 것
- 16헤딩·testid 계약 변경 금지. 범위 밖(§15) 기능을 plan에 넣지 말 것.
- 자격 판정/사실 생성을 LLM에 위임하는 설계 금지.

## 체크포인트
- HEAD: 5a50b22
