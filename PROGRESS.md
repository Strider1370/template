# PROGRESS.md — 진행 상황 (세션 인수인계용)

> 사람용 요약. 머신 상태는 `workflow/state.yaml`(우선). 새 세션은 `npm run workflow:resume` 먼저.

## 현재 단계
<!-- workflow/state.yaml 의 current 와 일치시킨다. -->
엔진 구축 완료 — **run 모드 Stage 00(intake) 대기**. 새 해커톤 주제 받으면 시작.

## 주제
미정.

## 완료된 것
- [x] 스타터 키트 셋업 (스택/데이터/디자인 자산)
- [x] `web/` 스캐폴드 `npm install` + `npm run build` 통과 확인
- [x] **단계 기반 워크플로우 엔진 구축** (모놀리식 CLAUDE.md → 13단계 상태머신)
  - `workflow/` : state.yaml · stages.yaml · 13단계 지침 · Gate 13종(+cross-review) · 상태전환 스크립트 6종 · 계약 스키마 · 템플릿
  - `docs/` : 운영지침 3문서 + kit-assets.md(키트 지식 보존)
  - 산출물 템플릿 업그레이드: spec.md(16헤딩) · plan.md(파일소유권) · demo.scenario · manifest · research
  - 발표 파이프라인 스캐폴드: Slidev primary + Notion 정적 HTML 백업

## 진행 중
- (엔진 구축 마무리: 스모크 테스트 → run 모드 전환)

## 막힌 부분 / 다음 액션
- 새 주제가 정해지면: `npm run workflow:status` → Stage 00 지침대로 시작.
- 교차검토는 기본 클로드 리뷰어 폴백(이 환경은 OpenAI 차단). 로컬 실행 + Codex 플러그인 설치 시 Codex 활성.

## 폴백 발동 여부
- 교차검토: Codex 자동 → (이 환경) 클로드 리뷰어 폴백.
