<!-- Handoff 보고서. Stage 07 완료. -->
# Stage 07 완료 보고 — demo-validation

## 단계
07 · demo-validation (데모 검증)

## 시작 시각 / 종료 시각 / 사용 시간
- 시작: 2026-06-18T11:~Z
- 종료: 근사
- 사용: 예산 15분 내

## 완료한 내용
- 루트에 Playwright + chromium(headless shell) 설치.
- `demo/run-demo.mjs` 작성 — demo.scenario.yaml 핵심 경로를 **2회 연속 완주**, Wow assertion, 영상·스크린샷 캡처.
- 2회 모두 `allPass=true` (EXIT 0). 교차검토 권고 2건(검증 강건화) 반영 후 재실행도 2회 PASS.

## 생성·수정한 파일
- `demo/run-demo.mjs` (Playwright 검증 스크립트)
- `demo/01-initial.png`, `demo/02-wow-deadline.png`, `demo/03-ai-answer.png` (스크린샷)
- `demo/demo.webm` (데모 영상 202KB)
- 루트 `package.json` (devDep: playwright)

## 검증 결과 (2회 연속, 동일)
- badge: "임신 28주 · D-84" → 슬라이더 출산직후 → "출산 후 0개월 · D+7"
- **재정렬**: benefits-now 카드 2 → 5건 (reSorted ✓)
- **손실경고 점등**: deadline-warning 0 → 3건, "D-53 지나면 200만원 소멸 위험"/"100만원 소멸"/"D-23 신청 마감" (warnOk ✓ — D-숫자 + 소멸/마감 토큰)
- **AI 본질 장면**: 교차케이스 질문 → 다태아 진료비 태아당100·고위험 90%/300만원 응답 (aiOk ✓ — 제도명 포함)

## Gate 결과
- `npm run gate:demo` (enforced) → **PASS** (scenario + 스크린샷 3 + demo.webm).
- LLM Review: `cross-review -- demo/` → 클로드 리뷰어, 조건부 PASS. 판정: 데모가 Wow를 실제 증명, 실패 은폐 없음, manifest(AI=fallback) 정직. 권고 2건 반영:
  1. warnOk를 `.first()` → "토큰 만족 요소 1개 이상"(allInnerTexts.some)으로 — 날짜/정렬 변동에도 견고.
  2. aiOk에 데이터셋 제도명 포함 검사 추가(계약 수준).

## 사용자 결정
- humanApproval 아님.

## 적용한 폴백
- 교차검토: Codex 미사용 → 클로드 리뷰어 폴백.
- AI는 키 없이 fixture/규칙 폴백으로 응답(manifest fallback과 일치). 라이브 백업으로 demo.webm 확보.

## 남아 있는 위험
- demo.webm/스크린샷은 라이브 실패 대비 백업으로 확정 — 발표 시 라이브가 불안하면 영상 사용.
- 경고 텍스트 배지에 "D-53 D-53"처럼 D-day가 배지+문장에 중복 표기(경미한 표시 디테일, 동작·assertion 무관).
- dev 서버 가동 중 프로덕션 빌드 금지(유지).

## 확정된 계약 (Stage 08/09가 읽음)
- 데모에서 **실제로 보인 것**: 입력→타임라인 정렬→Wow(재정렬+손실경고)→AI 본질 장면(폴백). 발표는 이 범위만 확정 주장.
- 증빙 자산: `demo/02-wow-deadline.png`(Wow), `demo/03-ai-answer.png`(AI), `demo/demo.webm`.

## 다음 단계가 읽어야 할 파일
- `demo/`(영상·스크린샷), `implementation/manifest.json`, `spec.md`, `concept.md`, `presentation/draft-outline.md`
- `workflow/stages/08-script.md`, guidance: docs/AI_Hackathon_Operating_System.md §7·§8 Stage 08, docs/CLAUDE_Notion_Slidev_Integration_Guide.md §3 Stage 08

## 다음 단계에서 하지 말아야 할 것
- 데모에서 안 보인(미구현·fallback) 동작을 발표에서 완전구현으로 단언 금지.
- dev 서버 가동 중 프로덕션 빌드 금지.
