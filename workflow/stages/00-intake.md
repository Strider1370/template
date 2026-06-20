# Stage 00 — Intake (주제 접수)

## 1. 목적
해커톤 주제와 제약을 구조화해 기록하고, 재사용 가능한 레포 자산을 확인한다. 이후 모든 단계의 기준점이 되는 `intake.yaml`을 만든다.

## 2. 시작 조건
- `workflow/state.yaml`의 `current.stageId == intake`, `status == in_progress`.
- 사용자로부터 주제(또는 주제 후보)가 전달됐다.

## 3. 이번 단계에서 반드시 읽을 파일
- `workflow/state.yaml` (현재 상태)
- `CLAUDE.md` (공통 운영 규칙)
- `docs/kit-assets.md` (있으면 — 레포 자산 목록). 없으면 `web/lib/regions.ts`, `web/lib/shelters.ts`, `web/components/KakaoMap.tsx`, `web/public/data/`, `data/boundaries/`, `data/data-sources.md`의 존재만 확인.
- guidance: 없음 (stages.yaml.guidance == []).

## 4. 이번 단계에서 읽지 않아도 되는 파일
- 리서치 원문, 이전 세션의 전체 대화, 타 단계의 history 리포트, docs/의 상세 사고기준 섹션. 컨텍스트 예산: 관련 없는 자료는 읽지 않는다.

## 5. 필수 입력
- 주제(topic). 없으면 `AskUserQuestion`으로 받기 전까지 작업을 시작하지 않는다.

## 6. 메인 에이전트의 역할
- 사용자에게 다음을 확인한다(모르면 질문): 주제, 제한 조건, 발표 시간(기본 5분), 구현 시간(기본 240분), 사용/금지 기술, 필수 조건(공공데이터 의무 등).
- **(가벼운 초기 발산 — 비차단)** 주제를 받은 직후, 이 주제에서 풀어볼 만한 각도·방향 2~3개를 **초보자에게 설명하듯** 짧게 던져 사용자의 첫 반응·선호를 듣고 `intake.notes`에 메모한다. **여기서 방향을 확정하지 않는다** — 본격 발산·수렴·승인은 Stage 02다. (사용자가 바로 넘어가자고 하면 그대로 진행. 이 단계는 멈추는 단계가 아니다.)
- 레포 자산 중 이 주제에 쓸 수 있는 것을 표시한다 (지역/지도/대피소 데이터/KRDS 등).
- `workflow/decisions/intake.yaml`을 직접 작성한다. (메인 전용 파일)
- `workflow/state.yaml`의 `project.topic` 등을 갱신한다.

## 7. 병렬 서브에이전트 구성
- 없음. 메인이 직접 수행한다. (단순 기록 단계)

## 8. 각 서브에이전트의 작업 계약
- 해당 없음.

## 9. 생성해야 하는 산출물
- `workflow/decisions/intake.yaml` — 필드: `topic`, `constraints`, `presentationMinutes`, `implementationMinutes`, `techStack`, `mandatory`, `usableAssets`, `notes`.

## 10. 파일 소유권
- 메인 전용: `workflow/decisions/intake.yaml`, `workflow/state.yaml`.
- 서브에이전트 쓰기 경로: 없음.

## 11. 제한 시간
- 5분. 초과 시 자산 조사 깊이를 줄이되 단계를 생략하지 않는다.

## 12. 완료 조건
- `intake.yaml`이 존재하고 위 필드가 비어 있지 않다.
- 사용 가능한 레포 자산이 1줄 이상 기록됐다(없으면 "없음" 명시).

## 13. 기계적 Gate (Mechanical)
- 명령: `npm run gate:intake`
- 분류: **checklist** (gatePolicy.checklist). `intake.yaml` 존재 + 필수 필드 채워짐을 확인하고 체크리스트를 출력 → 에이전트/사람 자가점검.

## 14. LLM Review Gate
- `npm run cross-review -- workflow/decisions/intake.yaml` (Codex 우선 → 클로드 리뷰어 폴백).
- 검토 포인트: 주제·제약이 명확한가, 시간/필수조건 누락이 없는가.

## 15. 사용자 승인 여부
- `humanApproval: false`. 멈추지 않는다.

## 16. 실패 시 폴백
- 자산 조사가 불확실하면 "있으면 참조" 수준으로만 기록하고 진행. 단계는 생략하지 않는다.

## 17. 다음 단계에 전달할 정보
- `intake.yaml` (Stage 01 리서치 트랙의 입력).
- 사용 가능한 자산 목록(Stage 04 계획에서 재사용 판단에 쓰임).

## 18. 금지 사항
- 주제 없이 시작하지 마라.
- 아직 리서치/스펙을 미리 작성하지 마라(현재 단계 외 선행 금지).

## 19. 단계 완료 보고 형식
- `workflow/templates/stage-report.md` 양식으로 Handoff 작성 → `workflow/history/stage-00-intake.md`.
