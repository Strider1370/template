<!-- Handoff 보고서. Stage 08 완료. -->
# Stage 08 완료 보고 — script

## 단계
08 · script (발표 스크립트)

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-18T11:38Z
- 종료: 근사 / 예산 10분 내

## 완료한 내용
- `presentation/script.md`(5분, 시간배분 명시) + `presentation/qna.md` 작성.
- 내러티브 척추 = concept.md. 첫 문장=한 문장 피치, 데모=Wow, Closing=concept 마지막 문장 글자까지 일치.
- manifest 기준 정직성: implemented(타임라인·Wow·데이터셋)만 확정 주장, AI/지도 fallback 과장 없음.

## 생성·수정한 파일
- `presentation/script.md`, `presentation/qna.md`

## Gate 결과
- `npm run gate:script` (checklist) → **PASS** (script.md + qna.md 존재 + 체크리스트).
- LLM Review: `cross-review -- presentation/script.md` → 클로드 리뷰어, **PASS**(조건부 아님). 5개 항목 전부 통과(구현↔발표 일치, 근거없는 숫자 0, 데모+킥 ≥2분, 문장규칙·마지막문장 일치, 낮은수준 질문 선제해소). 선택 보강 2건 반영.

## 교차검토 반영
- ③ Wow 내레이션의 "D-53" 하드코딩 → "곧 마감, 지나면 200만원 사라진다(화면엔 실시간 D-day 표시)"로 완화(라이브 날짜 변동 리스크↓). 200만원(첫만남 첫째)은 검증값 유지.
- qna 산모신생아 소득기준에 "현행 안내 기준" 단서 추가(2026 지침 PDF 미열람=partial 반영).

## 시간 배분 (5:00)
Answer First+Problem 0:45 / Insight+Solution 0:45 / **Demo+Wow 2:10** / Mechanism 0:25 / Impact+Guardrail 0:35 / Closing 0:20. 데모+킥(메커니즘 포함) ≥50%.

## 사용자 결정
- humanApproval 아님. (사용자가 "발표 단계로 진행" 선택 — 프로그램 범위 확대 없이 현재 데모로 발표.)

## 적용한 폴백
- 교차검토: Codex 미사용 → 클로드 리뷰어 폴백.
- 라이브 데모 실패 대비: demo.webm 백업 전제로 서술.

## 남아 있는 위험
- 라이브 D-day는 발표 시점 날짜에 따라 변동 → 스크립트는 수치 비단정 표현으로 완화, demo.webm 백업.
- AI는 키 없이 폴백 동작 — 발표에서 "실시간 LLM" 단언 금지(스크립트·qna에 명시).

## 확정된 계약 (Stage 09가 읽음)
- 슬라이드 데모 주장은 manifest와 일치(implemented만). Closing = concept 마지막 문장.
- 슬라이드 흐름은 script.md ①~⑥ + draft-outline.md(10장) 기준.

## 다음 단계가 읽어야 할 파일
- `presentation/script.md`, `presentation/qna.md`, `presentation/draft-outline.md`, `presentation/draft-layout-plan.json`
- `implementation/manifest.json`, `demo/`(캡처), `concept.md`
- `workflow/stages/09-presentation-generation.md`, guidance: docs/CLAUDE_Notion_Slidev_Integration_Guide.md §8~12

## 다음 단계에서 하지 말아야 할 것
- 미구현/fallback 기능을 슬라이드에서 완전구현처럼 표현 금지.
- Closing 문장 변경 금지(concept 일치).
