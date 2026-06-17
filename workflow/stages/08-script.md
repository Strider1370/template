# Stage 08 — Script (발표 스크립트)

## 1. 목적
실제 구현 상태(manifest)에 기반한 5분 발표 스크립트와 Q&A 초안을 작성한다. 데모와 킥(차별점)에 시간의 50% 이상을 배분한다.

## 2. 시작 조건
- Stage 07 Gate 통과, 데모 검증 산출물 + `implementation/manifest.json` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `spec.md`(1·8·9·14 헤딩 중심), `implementation/manifest.json`, Stage 07 검증 결과, `presentation/draft-outline.md`(Stage 05 초안)
- guidance: `docs/AI_Hackathon_Operating_System.md` §7 "Stage 08"(7.1~7.3) 및 §8 "Stage 08 Review"; `docs/CLAUDE_Notion_Slidev_Integration_Guide.md` §3 "Stage 08 — 발표 스크립트". 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, Slidev 생성 상세 규칙(§8~12은 Stage 09), 무관한 구현 세부.

## 5. 필수 입력
- `implementation/manifest.json`(정직성 기준), 데모 검증 결과. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- `presentation/script.md`(5분) 작성: Answer First → 문제 → Insight/킥 → 데모 → Closing. 데모+킥 ≥50%, 프로그램 로직은 1장 분량.
- **manifest에서 implemented/mocked가 아닌 기능은 발표에 넣지 않는다.** 라이브 데모는 GIF 백업 전제로 서술.
- `presentation/qna.md`(예상 질문 + 답변) 작성: 차별점·AI 필요성·구현 한계·데이터 출처 대비.

## 7. 병렬 서브에이전트 구성
- 없음(작성 집약). 교차검토는 Gate.

## 8. 각 서브에이전트의 작업 계약
- 해당 없음.

## 9. 생성해야 하는 산출물
- `presentation/script.md` (5분 스크립트, 시간 배분 명시)
- `presentation/qna.md` (예상 Q&A)

## 10. 파일 소유권
- 메인 전용: `presentation/script.md`, `presentation/qna.md`.

## 11. 제한 시간
- 10분. 초과 시 데모+킥 단락을 우선 완성, 부가 설명 압축.

## 12. 완료 조건
- script.md 존재(5분, 데모+킥 ≥50%, 미구현 기능 0), qna.md 존재.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:script`
- 분류: **checklist**. script.md + qna.md 존재 + 시간배분/미구현 언급 체크리스트 출력 → 자가점검.

## 14. LLM Review Gate
- `npm run cross-review -- presentation/script.md` (Codex 우선 → 클로드 폴백). manifest와 대조.
- 검토: 구현과 발표 일치(미구현 과장 없음), 데모/킥 시간 비중, 발표 문장 규칙, 차별점 부각.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 5분 초과 시 부가 슬라이드 단락 삭제(데모+킥 보존). 검증 안 된 기능은 "방향"으로만 언급하거나 제거.

## 17. 다음 단계에 전달할 정보
- `presentation/script.md`, `presentation/qna.md` (Stage 09 발표자료 생성 입력).

## 18. 금지 사항
- 미구현/미검증 기능을 사실처럼 발표 금지.
- 데모·킥 시간을 로직 설명에 뺏기기 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-08-script.md`.
