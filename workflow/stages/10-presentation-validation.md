# Stage 10 — Presentation Validation (발표자료 검증)

## 1. 목적
생성된 발표자료의 시각·시간 결함을 잡는다: overflow, 깨진 자산, 레이아웃 반복, 데모 화면 크기, 발표 시간. 캡처와 검증 보고서를 남긴다.

## 2. 시작 조건
- Stage 09 Gate 통과, `presentation/slides.md` + `presentation/output/` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `presentation/slides.md`, `presentation/output/`, `presentation/script.md`(시간 기준)
- guidance: `docs/CLAUDE_Notion_Slidev_Integration_Guide.md` §13 "캡처 레퍼런스 활용", §14 "Stage 10 검증 기준"(14.1~14.3). 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, 사고기준 섹션, 무관한 구현/생성 세부.

## 5. 필수 입력
- Stage 09 발표 산출물. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 슬라이드를 캡처해 검사: 텍스트 overflow, 깨진 자산(이미지/폰트/아이콘), 동일 레이아웃 단조 반복, 데모 화면이 너무 작지 않은지.
- 발표 시간(분량) 확인.
- `presentation/output/captures/`에 캡처, `presentation/output/validation-report.md`에 결함 목록 + 통과 여부 기록.

## 7. 병렬 서브에이전트 구성
- 없음(검증 집약). 캡처 분담이 크면 보조 1개.

## 8. 각 서브에이전트의 작업 계약
- (선택) capture-agent: `read`=[output 경로], `write`=`presentation/output/captures/`만, 완료: 전 슬라이드 캡처.

## 9. 생성해야 하는 산출물
- `presentation/output/captures/` (슬라이드별 캡처)
- `presentation/output/validation-report.md` (결함 + 통과 여부)

## 10. 파일 소유권
- 메인/검증 에이전트: `presentation/output/` 하위.

## 11. 제한 시간
- 10분. 초과 시 데모+킥 슬라이드 위주로 검사(나머지는 빠른 스캔). 단계 생략 X.

## 12. 완료 조건
- 전 슬라이드 캡처, validation-report.md에 overflow/자산/레이아웃/데모크기/시간 항목 점검 완료, 치명 결함 0.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:presentation-visual`
- 분류: **enforced**. 캡처 존재 + overflow/깨진 자산 등 자동 검사 + validation-report 존재를 실제 검사.

## 14. LLM Review Gate
- `npm run cross-review -- presentation/output/validation-report.md` (Codex 우선 → 클로드 폴백).
- 검토: 결함이 누락 없이 잡혔는가, 데모 화면 가독성, 발표 시간 적정성.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 결함 슬라이드는 텍스트 축약/레이아웃 교체로 빠르게 수정(Stage 09 재진입 최소화). 시간 초과 시 슬라이드 병합/삭제(데모+킥 보존).

## 17. 다음 단계에 전달할 정보
- 검증 통과한 `presentation/output/`, validation-report (Stage 11 리허설 입력).

## 18. 금지 사항
- 결함을 보고 없이 통과 처리 금지.
- 전면 재디자인 금지(목표는 결함 수정).

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-10-presentation-validation.md`.
