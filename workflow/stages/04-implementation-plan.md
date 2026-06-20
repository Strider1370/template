# Stage 04 — Implementation Plan (구현 계획)

## 1. 목적
spec를 작업으로 분해하고, 병렬 빌드를 위한 파일 소유권·서브에이전트 Agent Task 계약·외부연동 폴백을 미리 확정한다. 사용자 사전준비(API 키 등)를 안내한다.

## 2. 시작 조건
- Stage 03 Gate 통과, `spec.md` + `demo/demo.scenario.yaml` 존재.

## 3. 이번 단계에서 반드시 읽을 파일
- `spec.md`, `demo/demo.scenario.yaml`, `research/feasibility.md`, `workflow/decisions/intake.yaml`(사용 가능 자산), `workflow/templates/agent-task.yaml`
- `CLAUDE.md`의 "사전 준비된 자산" 표(재사용 판단).
- guidance: 없음.

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 트랙 원문, 발표 docs, 타 단계 history.

## 5. 필수 입력
- `spec.md`, `demo.scenario.yaml`. 없으면 시작하지 않는다.

## 6. 메인 에이전트의 역할
- `plan.md` 작성: 작업 분해 + 구현 순서 + 기능별 폴백("시간 내 안 되면 → 하드코딩/더미").
- `workflow/decisions/file-ownership.yaml` 작성: 에이전트별 write 경로(충돌 0).
- 각 빌드 에이전트의 Agent Task 계약 초안 작성(`agent-task.yaml` 형식).
- 재사용 자산 매핑(`web/` 스캐폴드, `regions.ts`, `shelters.ts`, `KakaoMap.tsx`, 대피소 JSON). 같은 걸 새로 만들지 않게 명시.
- 사용자 사전준비 안내: 카카오맵 키·공공데이터(`data/data-sources.md` 기준, data.go.kr/safetydata.go.kr는 403 차단 → 사람이 직접 다운로드).
- **모바일/APK 계획**: 모바일 반응형은 기본 작업으로 잡고, (모바일 주제면) 위치·알림을 작업에 포함한다. **APK 패키징(Capacitor)은 리스크 큰 작업**으로 보고 **반드시 폴백(미러링/프레임)** 을 함께 계획한다(환경·시간·기기검증 변수). 상세 `docs/mobile-webview-target.md`.

## 7. 병렬 서브에이전트 구성
- 없음(계획 집약). 교차검토는 Gate에서.

## 8. 각 서브에이전트의 작업 계약
- 이 단계의 산출물 자체가 "다음 단계 서브에이전트 계약"이다. 각 계약은 `read`(≤5)/`write`/`doNotWrite`/`deadlineMinutes`/`completionCriteria`/`reportFormat`을 포함.

## 9. 생성해야 하는 산출물
- `plan.md` (작업 분해 + 순서 + 기능별 폴백)
- `workflow/decisions/file-ownership.yaml` (에이전트별 쓰기 경로)
- (plan.md 내부 또는 별도) Stage 05 Agent Task 계약 묶음

## 10. 파일 소유권
- 메인 전용: `plan.md`, `workflow/decisions/file-ownership.yaml`.

## 11. 제한 시간
- 10분. 초과 시 작업 분해 입자만 거칠게(폴백·소유권은 반드시 확정).

## 12. 완료 조건
- plan.md 존재, 모든 기능에 폴백 명시, file-ownership.yaml에 경로 충돌 없음, 사용자 사전준비 안내 완료.

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:plan`
- 분류: **checklist**. plan.md + file-ownership.yaml 존재 + 폴백/소유권 항목 체크리스트 출력 → 자가점검.

## 14. LLM Review Gate
- `npm run cross-review -- plan.md` (Codex 우선 → 클로드 폴백).
- 검토: 데모 핵심경로를 커버하는가, 범위 과도, 파일 충돌, 폴백 누락, 자산 중복 제작.

## 15. 사용자 승인 여부
- `humanApproval: false`. (단, API 키 등 사전준비는 사용자에게 안내.)

## 16. 실패 시 폴백
- 외부 연동이 불확실하면 fixture/하드코딩 경로를 기본 계획으로 채택. 작업이 많으면 데모 핵심경로 외 작업을 후순위로(생략 X, 범위 축소).

## 17. 다음 단계에 전달할 정보
- `plan.md`, `file-ownership.yaml`, Agent Task 계약 (Stage 05 병렬 빌드 입력).

## 18. 금지 사항
- 폴백 없는 외부연동 의존 금지.
- 데모에 안 보이는 것(인증·설정)에 작업 배정 금지.
- 구현 선행 금지.

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` → `workflow/history/stage-04-implementation-plan.md`.
