# Stage 02 — Insight Selection (인사이트 선택)

## 1. 목적
리서치를 관점(Insight)으로 압축하고, 데모로 보여줄 최종 방향 2~3개를 후보화한다. **사용자 승인을 받은 뒤에만** 방향을 확정한다.

## 2. 시작 조건
- Stage 01 Gate 통과, `research/integrated-findings.md` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `research/integrated-findings.md`, `research/judge-review.md`, `research/overseas.md`
- guidance: `docs/AI_Hackathon_Operating_System.md` §5 "Stage 02 — Insight 선택"(5.1~5.4) 및 §8 "Stage 02 Review". 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 트랙 원문 전체(integrated-findings로 충분), spec/plan/발표 docs, 타 단계 history.

## 5. 필수 입력
- `research/integrated-findings.md`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 각 후보를 Common Assumption → Observed Reality → Tension → Reframing 구조로 정리한다.
- Insight 후보 ≥5개 도출, 각각 AI Leverage(AI가 본질적으로 필요한가)를 평가한다.
- 최종 방향 2~3개로 좁혀 `workflow/decisions/insight-candidates.md`에 기록한다.
- **사용자에게 `AskUserQuestion`으로 방향을 제시하고 승인을 받는다.**
- 승인 후에만 `workflow/decisions/selected-direction.md`를 생성한다.

## 7. 병렬 서브에이전트 구성
- 없음(판단 집약 단계). 필요 시 후보별 비판 검토만 reviewer 1개 병렬.

## 8. 각 서브에이전트의 작업 계약
- (선택) reviewer: `read`=[insight-candidates.md, judge-review.md], `write`=리뷰 코멘트(별도 임시 파일), `doNotWrite`=selected-direction.md. 완료: 약한 Insight/약한 AI 필요성 지적.

## 9. 생성해야 하는 산출물
- 승인 전: `workflow/decisions/insight-candidates.md` (후보 ≥5, 방향 2~3).
- 승인 후: `workflow/decisions/selected-direction.md` (확정 방향 + 근거 + 데모 윤곽).

## 10. 파일 소유권
- 메인 전용: 두 decision 파일 모두.

## 11. 제한 시간
- 10분. 초과 시 후보 수는 유지하되 서술을 압축.

## 12. 완료 조건
- insight-candidates.md 존재(후보 ≥5), 사용자 승인 완료, selected-direction.md 존재.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:insight`
- 분류: **checklist**. 후보 파일 + (승인 시) selected-direction 존재 + 체크리스트 출력.

## 14. LLM Review Gate
- `npm run cross-review -- workflow/decisions/insight-candidates.md` (Codex 우선 → 클로드 폴백).
- 검토: Insight가 수사에 그치지 않는가, AI 필요성이 실재하는가, 차별점이 데모로 보일 수 있는가.

## 15. 사용자 승인 여부
- **`humanApproval: true`.** 승인 전까지 멈춘다. 승인 전 `selected-direction.md`를 만들지 않는다. 임의 선택 금지 — 사용자 의도 우선.

## 16. 실패 시 폴백
- 후보가 약하면 Stage 01 핵심 트랙만 재실행 요청. 시간 부족 시 방향을 2개로 축소(생략 X).

## 17. 다음 단계에 전달할 정보
- `workflow/decisions/selected-direction.md` (Stage 03 spec의 토대).

## 18. 금지 사항
- 승인 없이 방향 확정/확정 파일 생성 금지.
- spec 작성 선행 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-02-insight-selection.md`. "사용자 결정" 항목에 승인 내용 + decision 파일 경로 명시.
