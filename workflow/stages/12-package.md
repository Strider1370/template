# Stage 12 — Package (제출 패키지)

## 1. 목적
최종 제출물을 `dist/submission/`으로 패키징한다. Slidev PDF export와 sources.md 생성을 포함해 제출에 필요한 모든 산출물을 한곳에 모은다.

## 2. 시작 조건
- Stage 11 Gate 통과 + 사용자 최종 승인, 확정 발표자료 + 데모 스크린샷 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `research/sources.json`, `presentation/output/`, `presentation/qna.md`, `spec.md`, 데모 스크린샷 경로
- guidance: 없음.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, 사고기준/생성 상세 규칙, 타 단계 history.

## 5. 필수 입력
- 확정 발표자료, 데모 스크린샷, `spec.md`, `sources.json`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- Slidev PDF export 실행 → `presentation.pdf` 생성(존재·페이지 수 확인).
- `research/sources.json` → `sources.md` 변환(출처 목록).
- 정적 발표 HTML을 `presentation.html`로 정리.
- `dist/submission/`에 산출물 복사·구성, `README.md`(실행법) 작성.

## 7. 병렬 서브에이전트 구성
- 없음(패키징 집약).

## 8. 각 서브에이전트의 작업 계약
- 해당 없음.

## 9. 생성해야 하는 산출물
- `dist/submission/`: `web/`, `presentation.html`, `presentation.pdf`, `demo/`(단계별 스크린샷+Wow), `README.md`, `qna.md`, `sources.md`, `spec.md`. **(기본: 배포 URL `https://projectamo.co.kr`을 README에 명시 + `app.apk`(서버 빌드) 포함.** 배포·빌드 절차 `docs/deploy-runbook.md`, 결정 `workflow/decisions/deployment-target.md`.)

## 10. 파일 소유권
- 메인 전용: `dist/submission/`, `sources.md`, `README.md`.

## 11. 제한 시간
- 5분. 초과 시 필수 항목(web/, presentation.html, pdf, demo 스크린샷, README, spec, sources) 우선.

## 12. 완료 조건
- `dist/submission/`에 필수 산출물 모두 존재, presentation.pdf 페이지 수 > 0, sources.md 생성.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:package`
- 분류: **checklist**. dist/submission 필수 파일 존재 + pdf 페이지/sources.md 확인 체크리스트 출력 → 자가점검.

## 14. LLM Review Gate
- `npm run cross-review -- dist/submission/README.md` (Codex 우선 → 클로드 폴백).
- 검토: 패키지 누락 없는가, README로 재현 가능한가, sources가 주장과 연결되는가.

## 15. 사용자 승인 여부
- `humanApproval: false`. (발표 승인은 Stage 11에서 받음.)

## 16. 실패 시 폴백
- PDF export 실패 시 정적 HTML + 슬라이드 캡처 PDF로 대체. 필수 항목 우선.
- Slidev export 실패 시 `npm run presentation:capture && npm run presentation:pdf`로 캡처 기반 PDF 생성(`presentation/output/presentation.pdf`).

## 17. 다음 단계에 전달할 정보
- 없음(최종 단계). `dist/submission/`이 제출물. push는 여기서 마지막에 한 번.

## 18. 금지 사항
- 미검증 산출물 포함 금지.
- API 키·개인정보를 패키지/README에 노출 금지(.env 제외, env.example만).

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-12-package.md`.
