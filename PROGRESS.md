# PROGRESS.md — 진행 상황 (세션 인수인계용)

> 사람용 요약. 머신 상태는 `workflow/state.yaml`(우선). 새 세션은 `npm run workflow:resume` 먼저.

## 현재 단계
<!-- workflow/state.yaml 의 current 와 일치시킨다. -->
**🎉 전체 완료 (Stage 00~12).** 최종 제출물 = `dist/submission/`. 모든 게이트 PASS, 단계별 교차검토 반영.

## 주제
**임산부·신생아 원스톱 지원** — "임신·출산 지원의 시계". 임신 주차·예정일·거주지 입력 → 지원을 "지금→곧" 시간순 정렬 + 마감 손실 경고(D-day).
데이터 전략 = 혼합(고정 JSON + 카카오 로컬), 시간 = 기본(240분/발표 5분), 스택 = 키트 기본(Next.js+KRDS).
마지막 문장: "받을 수 있는 지원이 아니라, 지금 받아야 하는 지원을 알려줍니다."

## 완료된 것
- [x] 워크플로우 엔진 셋업 + 루트 `js-yaml` 설치
- [x] **Stage 00 intake** — intake.yaml, gate PASS, 교차검토 반영
- [x] **Stage 01 parallel-research** — 5트랙 병렬, 해외 8사례, sources.json 41건, integrated-findings, gate PASS
- [x] **Stage 02 insight-selection** — 후보 6, 방향 A 확정, 레드팀 조건부통과, **concept.md 6헤딩 승인**, gate PASS(enforced)
- [x] **Stage 03 spec** — spec.md 16헤딩 + demo.scenario.yaml, gate PASS(enforced), 교차검토 반영. **숫자 검증 병렬 완료**(verified-figures.md), 정정 2건 반영
- [x] **Stage 04 implementation-plan** — plan.md + file-ownership.yaml(충돌0), Agent Task 계약 3종(Data/UI/AI), gate PASS, 교차검토 반영
- [x] **Stage 05 parallel-build** — Data/UI/AI/Presentation 병렬 구현, gate:build PASS, **브라우저 end-to-end 검증**(Wow 재정렬+손실경고, AI 본질 장면). 통합 정정 2건(qa.json id, deadline 출산前 null)
- [x] **Stage 06 integration** — implementation/manifest.json(기능7, Wow=implemented·AI/지도=fallback), gate PASS, 정직성 교차검토 통과
- [x] **Stage 07 demo-validation** — Playwright 설치, demo/run-demo.mjs로 **2회 연속 완주+Wow assertion PASS**, demo.webm+스크린샷3, gate:demo PASS(enforced)
- [x] **Stage 08 script** — 발표 스크립트+Q&A, gate PASS, 교차검토 PASS (Stage 11에서 구어체 재작성)
- [x] **Stage 09 presentation-generation** — deck.json(10장)+slides.md+정적HTML, gate PASS(enforced), 교차검토 PASS
- [x] **Stage 10 presentation-validation** — 슬라이드 캡처 검증, Wow 슬라이드 풀스크린 보강, gate PASS(enforced)
- [x] **Stage 11 rehearsal** — 대본 구어체화+deck speakerNotes 동기화, **사용자 최종 승인**, gate PASS
- [x] **Stage 12 package** — `dist/submission/`(web·HTML·PDF·webm·README·sources·spec·qna), gate PASS, 교차검토 PASS(비밀노출0)

## 진행 중
- 없음 — **13단계 전체 완료**. 최종 제출물 `dist/submission/`.

## 막힌 부분 / 다음 액션
- 다음: `npm run workflow:start` → Stage 06 integration.
- ⚠️ **dev 서버 가동 중 프로덕션 빌드 금지**(web/.next 충돌로 하이드레이션 깨짐 — 이번에 발생·복구). 검증은 dev preview로만. (메모리: dev-prod-next-cache-collision)
- 카카오/Anthropic 키 미설정 → 폴백 동작. 실 API 시연 원하면 사용자 키 필요.
- 다음 사용자 승인 게이트: **Stage 11 (리허설)**.

## 폴백 발동 여부
- 교차검토: Codex 자동 → (이 환경) 클로드 리뷰어 폴백.
