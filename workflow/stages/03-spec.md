# Stage 03 — Spec (스펙 확정)

## 1. 목적
확정 방향을 `spec.md`로 명문화하고, 데모 시나리오와 Wow Moment를 화면 검증 가능한 형태(selector/assertion 계획)로 정의한다. 이 단계는 화면 존재를 검증하지 않는다(그건 Stage 07).

## 2. 시작 조건
- Stage 02 Gate 통과 + 사용자 승인, `selected-direction.md` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- **`concept.md`(북극성 — 스펙은 이걸 풀어쓸 뿐 배신 금지)**, `workflow/decisions/selected-direction.md`, `research/integrated-findings.md`, `research/feasibility.md`
- guidance: `docs/AI_Hackathon_Operating_System.md` §6 "Stage 03 — Spec 확정"(6.1~6.11) 및 §8 "Stage 03 Review". 이 섹션만.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 트랙 원문 전체, 발표/구현 docs, 타 단계 history.

## 5. 필수 입력
- `selected-direction.md`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- `spec.md`는 `concept.md`의 한 문장 피치·킥·Wow Moment·마지막 문장을 **풀어쓴다**(무뎌뜨리거나 바꾸지 않는다). 충돌하면 concept.md가 우선.
- `spec.md`를 아래 16헤딩 **정확히 그대로** 작성한다.
- `demo/demo.scenario.yaml`을 작성한다(스텝별 화면·selector·assertion 계획 포함).
- "4시간 현실성" 헤딩에서 범위가 과한지 판정하고, 과하면 범위 밖으로 옮긴다.

spec.md 16헤딩(정확히):
`## 1. Answer First` · `## 2. Problem` · `## 3. 최종 Insight` · `## 4. JTBD` · `## 5. AI Leverage` · `## 6. Differentiation` · `## 7. Solution` · `## 8. 데모 시나리오` · `## 9. Wow Moment` · `## 10. Impact` · `## 11. Credibility` · `## 12. Limitation` · `## 13. Guardrail` · `## 14. Closing Message` · `## 15. 범위 밖` · `## 16. 4시간 현실성`

## 7. 병렬 서브에이전트 구성
- 없음(메인 작성). 교차검토는 Stage 14 Gate에서.

## 8. 각 서브에이전트의 작업 계약
- 해당 없음.

## 9. 생성해야 하는 산출물
- `spec.md` (위 16헤딩)
- `demo/demo.scenario.yaml` (steps[]: action, screen, selector, assertion)

## 10. 파일 소유권
- 메인 전용: `spec.md`, `demo/demo.scenario.yaml`.

## 11. 제한 시간
- 10분. 초과 시 헤딩은 모두 채우되 서술을 압축. Wow Moment의 selector/assertion 계획은 반드시 남긴다.

## 12. 완료 조건
- spec.md에 16헤딩 모두 존재, demo.scenario.yaml의 각 스텝에 화면·assertion 계획 존재, Wow Moment가 화면 검증 가능 형태.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:spec`
- 분류: **enforced**. 16헤딩 존재·순서, demo.scenario.yaml 파싱·필수 키, Wow Moment selector/assertion 계획 유무를 실제 검사한다.

## 14. LLM Review Gate
- `npm run cross-review -- spec.md` (Codex 우선 → 클로드 폴백).
- 검토: Insight가 수사인가, AI 필요성이 약한가, 데모↔차별점 연결, 범위 과도, Wow Moment의 검증 가능성.

## 15. 사용자 승인 여부
- `humanApproval: false`.

## 16. 실패 시 폴백
- 4시간 초과로 판정되면 기능을 범위 밖으로 이동(단계 생략 X). Wow Moment 1개로 집중.

## 17. 다음 단계에 전달할 정보
- `spec.md`, `demo/demo.scenario.yaml` (Stage 04 계획, Stage 07 데모검증 입력).

## 18. 금지 사항
- 16헤딩 변경·누락 금지.
- 구현/발표 선행 금지.
- 화면 존재를 여기서 검증하지 마라.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-03-spec.md`.
