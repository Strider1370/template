# Claude Code 작업 지시서 v1.2
## 단계 기반 LLM 해커톤 워크플로우 엔진 구축
## P0·P1 정합성 보강판

---

# 0. 이 작업의 목적

현재 저장소의 `CLAUDE.md`는 해커톤 전체 워크플로우를 설명하고 있지만, 지침과 단계가 많아질수록 LLM이 다음 문제를 일으킬 수 있다.

- 앞 단계의 원칙을 잊음
- 현재 단계와 무관한 작업을 먼저 수행함
- 필수 산출물을 누락함
- Gate를 통과하지 않고 다음 단계로 넘어감
- 새 세션에서 현재 상태를 잘못 판단함
- 서브에이전트의 결과를 통합하지 않고 진행함
- 구현, 검증, 발표 준비 중 일부를 생략함

이 문제를 막기 위해 전체 프로젝트를 **단계 기반 상태 머신**으로 재구성한다.

핵심 원칙:

```text
짧은 공통 지침
+
현재 상태 파일
+
단계별 Just-in-Time 지침
+
입출력 계약
+
자동 Gate
+
단계별 Handoff
```

최종적으로 Claude는 다음 순서로만 동작해야 한다.

```text
상태 확인
→ 현재 단계 지침 읽기
→ 필요한 서브에이전트 병렬 실행
→ 산출물 통합
→ Gate 검증
→ Handoff 기록
→ 다음 단계 진입
```


## 0.1 운영 모드

이 문서는 두 모드를 명확히 구분한다.

```text
bootstrap
→ 워크플로우 엔진, 단계 문서, Gate, 템플릿, 발표 파이프라인을 저장소에 설치·수정

run
→ 특정 해커톤 주제를 Stage 00~12로 실행

maintenance
→ 기존 워크플로우 엔진의 버그 수정, 규칙 보완, 템플릿 추가
```

`workflow/state.yaml`에 반드시 다음 필드를 둔다.

```yaml
workflowMode: run
```

규칙:

- `bootstrap`일 때만 이 문서의 구현 Phase 1~6을 수행한다.
- `run`일 때는 엔진을 다시 만들지 않고 현재 Stage를 실행한다.
- `maintenance`일 때는 지정된 구성요소만 수정하고 해커톤 Stage를 자동 진행하지 않는다.

---

# 1. 절대 원칙

Claude Code는 다음 규칙을 반드시 지킨다.

1. 작업 시작 시 `workflow/state.yaml`을 가장 먼저 읽는다.
2. 현재 단계의 상세 지침과 `stages.yaml.guidance`에 명시된 전문 지침 섹션만 읽는다.
3. 현재 단계 외의 작업을 미리 수행하지 않는다.
4. 단계별 필수 입력이 없으면 작업을 시작하지 않는다.
5. 단계별 필수 산출물이 없으면 Gate를 통과시키지 않는다.
6. Gate를 실제로 실행하지 않고 성공으로 기록하지 않는다.
7. Gate 실패 시 다음 단계로 이동하지 않는다.
8. 사용자 승인이 필요한 단계는 승인 전까지 멈춘다.
9. 각 단계가 끝나면 Handoff 보고서를 남긴다.
10. `state.yaml` 갱신은 메인 에이전트만 수행한다.
11. 공통 파일은 메인 에이전트만 수정한다.
12. 서브에이전트는 할당된 경로만 수정한다.
13. 시간 부족 시 단계를 생략하지 말고 기능 범위를 줄인다.
14. 발표와 검증을 구현 완료 후로 미루지 말고, Stage 05에서 초안·placeholder를 병렬 준비하고 Stage 08~10에서 최종화한다.
15. 새 세션은 이전 대화를 추측하지 말고 상태 파일과 Handoff로 복원한다.

---

# 2. 목표 저장소 구조

다음 구조를 생성하거나 정리한다.

```text
.
├── CLAUDE.md
├── README.md
├── spec.md
├── plan.md
├── PROGRESS.md
│
├── workflow/
│   ├── README.md
│   ├── state.yaml
│   ├── stages.yaml
│   │
│   ├── stages/
│   │   ├── 00-intake.md
│   │   ├── 01-parallel-research.md
│   │   ├── 02-insight-selection.md
│   │   ├── 03-spec.md
│   │   ├── 04-implementation-plan.md
│   │   ├── 05-parallel-build.md
│   │   ├── 06-integration.md
│   │   ├── 07-demo-validation.md
│   │   ├── 08-script.md
│   │   ├── 09-presentation-generation.md
│   │   ├── 10-presentation-validation.md
│   │   ├── 11-rehearsal.md
│   │   └── 12-package.md
│   │
│   ├── scripts/
│   │   ├── status.mjs
│   │   ├── start-stage.mjs
│   │   ├── complete-stage.mjs
│   │   ├── resume.mjs
│   │   ├── approve-stage.mjs
│   │   └── fail-stage.mjs
│   │
│   ├── gates/
│   │   ├── validate-intake.mjs
│   │   ├── validate-research.mjs
│   │   ├── validate-insight.mjs
│   │   ├── validate-spec.mjs
│   │   ├── validate-plan.mjs
│   │   ├── validate-build.mjs
│   │   ├── validate-integration.mjs
│   │   ├── validate-demo.mjs
│   │   ├── validate-script.mjs
│   │   ├── validate-presentation.mjs
│   │   ├── validate-rehearsal.mjs
│   │   └── validate-package.mjs
│   │
│   ├── templates/
│   │   ├── stage-instruction.md
│   │   ├── agent-task.yaml
│   │   ├── stage-report.md
│   │   ├── decision-record.md
│   │   └── gate-report.md
│   │
│   ├── contracts/
│   │   ├── research-output.schema.json
│   │   ├── stage-state.schema.json
│   │   ├── agent-task.schema.json
│   │   └── handoff.schema.json
│   │
│   ├── history/
│   │   └── .gitkeep
│   │
│   └── decisions/
│       └── .gitkeep
│
├── research/
│   ├── overseas.md
│   ├── domestic.md
│   ├── jtbd.md
│   ├── feasibility.md
│   ├── judge-review.md
│   ├── integrated-findings.md
│   └── sources.json
│
├── implementation/
│   └── manifest.json
│
├── demo/
├── presentation/
├── scripts/
└── web/
```

---

# 3. `CLAUDE.md`의 역할 변경

`CLAUDE.md`는 모든 상세 지침을 담는 문서가 아니라 **워크플로우 라우터**로 축소한다.

다음 내용을 포함한다.

```md
# Claude 실행 규칙

이 저장소는 단계 기반 워크플로우로 운영된다.

작업을 시작할 때 반드시 다음 순서를 따른다.

1. `workflow/state.yaml`을 읽는다.
2. `current.stageId`와 `current.status`를 확인한다.
3. `workflow/stages.yaml`에서 해당 단계의 지침 파일과 Gate 명령을 찾는다.
4. 현재 단계 지침 파일을 읽는다.
5. 지침이 요구하는 입력 파일만 읽는다.
6. 필요한 서브에이전트를 병렬 실행한다.
7. 산출물을 통합한다.
8. 지정된 Gate를 실제로 실행한다.
9. Gate 통과 시 Handoff를 작성하고 `state.yaml`을 갱신한다.
10. Gate 실패 시 다음 단계로 이동하지 않고 실패 원인과 폴백을 보고한다.

## 공통 금지 사항

- 현재 단계 외의 작업을 선행하지 마라.
- 전체 워크플로우를 한 번에 실행하려 하지 마라.
- Gate 실행 없이 단계를 완료 처리하지 마라.
- 공통 파일을 서브에이전트가 수정하게 하지 마라.
- 사용자 승인 단계에서 임의로 선택하지 마라.
- 실패를 숨기거나 성공으로 기록하지 마라.

## 메인 에이전트 전용 파일

- `workflow/state.yaml`
- `workflow/stages.yaml`
- `spec.md`
- `plan.md`
- `PROGRESS.md`
- `README.md`
- 루트 `package.json`
- 공통 설정 및 Schema

## 세션 종료 전

- 현재 단계와 상태를 `state.yaml`에 기록한다.
- 완료·미완료·막힌 내용을 `PROGRESS.md`에 기록한다.
- 해당 단계 Handoff를 `workflow/history/`에 저장한다.
```

기존의 상세 철학, 리서치 규칙, 구현 규칙, 발표 규칙은 단계별 문서로 이동한다.

---

# 4. `workflow/state.yaml`

다음 구조를 사용한다.

```yaml
workflowVersion: 1
workflowMode: run

project:
  name: ""
  topic: ""
  startedAt: null
  deadlineMinutes: 240
  presentationMinutes: 5

current:
  stageNumber: 0
  stageId: intake
  status: not_started
  startedAt: null
  budgetMinutes: 5

completedStages: []

requiredReads:
  - workflow/stages/00-intake.md

activeAgents: []

blockedBy: []

nextGate:
  command: npm run gate:intake
  report: workflow/history/stage-00-gate.md

humanApproval:
  required: false
  status: not_required
  decisionFile: null

lastHandoff: null

lastSuccessfulCheckpoint:
  stageNumber: null
  stageId: null
  commit: null

contextPolicy:
  maxPrimaryFiles: 5
  useHandoffBeforeHistory: true
  doNotRead:
    - unrelated stage reports
    - full chat history
    - raw research not referenced by current task

lastUpdatedAt: null
```

허용 상태:

```text
not_started
in_progress
blocked
awaiting_approval
gate_failed
completed
```

다음 단계로 넘어갈 수 있는 유일한 조건:

```text
Mechanical Gate 통과
→ LLM Review Gate 통과
→ 사용자 승인 필요 시 awaiting_approval
→ 사용자 승인 및 decision 파일 기록
→ Final Gate 통과
→ Handoff 작성
→ state.yaml 갱신
```

사용자 승인 전에는 확정 파일을 만들지 않는다.

예:

```text
insight-candidates.md
proposed-direction.md
selected-direction.md  # 승인 후 생성
```

---

# 5. `workflow/stages.yaml`

전체 단계, 시간 예산, 지침 파일, Gate를 중앙에서 관리한다.

```yaml
workflowVersion: 1

stages:
  - number: 0
    id: intake
    instruction: workflow/stages/00-intake.md
    guidance: []
    budgetMinutes: 5
    gate: npm run gate:intake
    humanApproval: false

  - number: 1
    id: parallel-research
    instruction: workflow/stages/01-parallel-research.md
    guidance:
      - file: docs/AI_Hackathon_Operating_System.md
        sections:
          - "4. Stage 01"
          - "8. Stage 01 Review"
    budgetMinutes: 20
    gate: npm run gate:research
    humanApproval: false

  - number: 2
    id: insight-selection
    instruction: workflow/stages/02-insight-selection.md
    guidance:
      - file: docs/AI_Hackathon_Operating_System.md
        sections:
          - "5. Stage 02"
          - "8. Stage 02 Review"
    budgetMinutes: 10
    gate: npm run gate:insight
    humanApproval: true

  - number: 3
    id: spec
    instruction: workflow/stages/03-spec.md
    guidance:
      - file: docs/AI_Hackathon_Operating_System.md
        sections:
          - "6. Stage 03"
          - "8. Stage 03 Review"
    budgetMinutes: 10
    gate: npm run gate:spec
    humanApproval: false

  - number: 4
    id: implementation-plan
    instruction: workflow/stages/04-implementation-plan.md
    guidance: []
    budgetMinutes: 10
    gate: npm run gate:plan
    humanApproval: false

  - number: 5
    id: parallel-build
    instruction: workflow/stages/05-parallel-build.md
    guidance:
      - file: docs/CLAUDE_Notion_Slidev_Integration_Guide.md
        sections:
          - "3. Stage 05"
          - "15. Stage 05 Presentation Agent"
    budgetMinutes: 85
    gate: npm run gate:build
    humanApproval: false

  - number: 6
    id: integration
    instruction: workflow/stages/06-integration.md
    guidance: []
    budgetMinutes: 20
    gate: npm run gate:integration
    humanApproval: false

  - number: 7
    id: demo-validation
    instruction: workflow/stages/07-demo-validation.md
    guidance: []
    budgetMinutes: 15
    gate: npm run gate:demo
    humanApproval: false

  - number: 8
    id: script
    instruction: workflow/stages/08-script.md
    guidance:
      - file: docs/AI_Hackathon_Operating_System.md
        sections:
          - "7. Stage 08"
          - "8. Stage 08 Review"
      - file: docs/CLAUDE_Notion_Slidev_Integration_Guide.md
        sections:
          - "3. Stage 08"
    budgetMinutes: 10
    gate: npm run gate:script
    humanApproval: false

  - number: 9
    id: presentation-generation
    instruction: workflow/stages/09-presentation-generation.md
    guidance:
      - file: docs/CLAUDE_Notion_Slidev_Integration_Guide.md
        sections:
          - "8. 공통 Semantic Layout"
          - "9. 중간 데이터 계약"
          - "10. 레이아웃 선택"
          - "11. Slidev 생성 규칙"
          - "12. Notion Static HTML 생성 규칙"
    budgetMinutes: 20
    gate: npm run gate:presentation-generation
    humanApproval: false

  - number: 10
    id: presentation-validation
    instruction: workflow/stages/10-presentation-validation.md
    guidance:
      - file: docs/CLAUDE_Notion_Slidev_Integration_Guide.md
        sections:
          - "13. 캡처 레퍼런스 활용"
          - "14. Stage 10 검증 기준"
    budgetMinutes: 10
    gate: npm run gate:presentation-visual
    humanApproval: false

  - number: 11
    id: rehearsal
    instruction: workflow/stages/11-rehearsal.md
    guidance:
      - file: docs/AI_Hackathon_Operating_System.md
        sections:
          - "8. Stage 11 Review"
      - file: docs/CLAUDE_Notion_Slidev_Integration_Guide.md
        sections:
          - "3. Stage 11"
    budgetMinutes: 10
    gate: npm run gate:rehearsal
    humanApproval: true

  - number: 12
    id: package
    instruction: workflow/stages/12-package.md
    guidance: []
    budgetMinutes: 5
    gate: npm run gate:package
    humanApproval: false

bufferMinutes: 10
```

Stage 예산 합계는 230분이며, 별도 예비 시간 10분을 확보한다. 시간 초과 시 Stage를 생략하지 말고 기능 범위를 축소한다.

---

# 6. 단계 문서 공통 형식

모든 `workflow/stages/*.md`는 아래 템플릿을 따른다.

```md
# Stage XX — 단계명

## 1. 목적
## 2. 시작 조건
## 3. 이번 단계에서 반드시 읽을 파일
## 4. 이번 단계에서 읽지 않아도 되는 파일
## 5. 필수 입력
## 6. 메인 에이전트의 역할
## 7. 병렬 서브에이전트 구성
## 8. 각 서브에이전트의 작업 계약
## 9. 생성해야 하는 산출물
## 10. 파일 소유권
## 11. 제한 시간
## 12. 완료 조건
## 13. 기계적 Gate
## 14. LLM Review Gate
## 15. 사용자 승인 여부
## 16. 실패 시 폴백
## 17. 다음 단계에 전달할 정보
## 18. 금지 사항
## 19. 단계 완료 보고 형식
```

---

# 7. 단계별 핵심 요건

## Stage 00 — Intake

- 주제, 제한 조건, 발표 시간, 구현 시간, 사용 기술, 필수 조건 기록
- 저장소 자산 확인
- `workflow/decisions/intake.yaml` 생성

## Stage 01 — Parallel Research

리서치 시작 시 `research/sources.json`을 생성하고 모든 출처를 구조화한다.

각 출처 항목:

```json
{
  "id": "source-01",
  "title": "",
  "url": "",
  "publisher": "",
  "accessedAt": "",
  "usedFor": [],
  "claim": ""
}
```

필수 병렬 트랙:

```text
A. 사용자 문제 및 JTBD
B. 국내 유사 사례
C. 해외 사례 및 메커니즘
D. 데이터와 구현 현실성
E. 심사위원 관점 및 차별화
```

해외 사례는 최소 3개 이상 조사하고 출처와 확인 시점을 기록한다.

필수 산출물:

```text
research/overseas.md
research/domestic.md
research/jtbd.md
research/feasibility.md
research/judge-review.md
research/integrated-findings.md
```

## Stage 02 — Insight Selection

- Common Assumption
- Observed Reality
- Tension
- Insight 후보 최소 5개
- AI Leverage 평가
- 최종 방향 2~3개
- 사용자 승인 필수

## Stage 03 — Spec

이 단계에서는 실제 화면 존재 여부를 검증하지 않는다.

검증 대상:

- Wow Moment가 화면에서 검증 가능한 형태로 정의되었는가
- 대응 selector 또는 assertion 계획이 있는가
- 구현 후 Stage 07에서 실제 화면과 assertion을 검증할 수 있는가

필수 산출물:

```text
spec.md
demo/demo.scenario.yaml
```

필수 내용:

- Answer First
- Problem
- Insight
- JTBD
- AI Leverage
- Differentiation
- Solution
- Demo Scenario
- Wow Moment
- Impact
- Credibility
- Limitation
- Guardrail
- Closing Message
- 범위 밖
- 4시간 현실성

## Stage 04 — Implementation Plan

- `plan.md`
- `workflow/decisions/file-ownership.yaml`
- Agent Task 계약
- 외부 연동 폴백
- 파일 충돌 방지

## Stage 05 — Parallel Build

기본 Agent:

```text
UI Agent
Data Agent
AI Agent
Demo Agent
Presentation Agent
```

Presentation Agent는 구현 완료를 기다리지 않고 다음을 병렬 작성한다.

- Problem
- Insight
- Solution
- Closing
- 데모 placeholder
- 발표 구조 초안

## Stage 06 — Integration

- 병렬 작업 통합
- 앱 빌드
- 핵심 데모 경로 연결
- fixture mode 확인
- `spec.md`와 구현 차이 기록
- 실제 구현 상태를 `implementation/manifest.json`에 구조화

`implementation/manifest.json`은 각 기능의 상태를 다음 중 하나로 기록한다.

```text
implemented
mocked
fallback
dropped
blocked
```

Stage 08과 Stage 09는 이 파일을 필수 입력으로 사용한다.

## Stage 07 — Demo Validation

- 데모 2회 연속 완주
- Wow Moment assertion
- 스크린샷
- 영상 또는 GIF
- 실패 로그 및 폴백 기록

## Stage 08 — Script

- 실제 구현 상태 기반 5분 스크립트
- 구현되지 않은 기능 금지
- 데모와 킥에 최소 50% 시간
- Q&A 초안

## Stage 09 — Presentation Generation

- `script.md → scenes.json → deck.json → slides.md`
- 기존 Slidev layout 우선
- Notion 스타일 토큰 적용
- 실제 앱 캡처 삽입
- speaker notes 포함
- Slidev + 정적 HTML 생성

## Stage 10 — Presentation Validation

- overflow
- 깨진 자산
- 레이아웃 반복
- 데모 화면 크기
- 발표 시간
- 캡처 및 검증 보고서

## Stage 11 — Rehearsal

- 실제 낭독 시간
- 라이브 데모 전환
- 영상 폴백
- Q&A
- 사용자 최종 승인

## Stage 12 — Package

`research/sources.json`을 기반으로 `sources.md`를 생성한다.

Slidev PDF export를 실행하고 `presentation.pdf` 존재와 페이지 수를 검증한다.

최종 제출 패키지 생성:

```text
dist/submission/
├── web/
├── presentation.html
├── presentation.pdf
├── demo/                    # 단계별 스크린샷 + Wow 캡처 (영상 대신)
├── README.md
├── qna.md
├── sources.md
└── spec.md
```

---

# 8. 서브에이전트 작업 계약

서브에이전트에게 전체 지침을 전달하지 않는다.

```yaml
taskId: implement-result-screen
stage: parallel-build
agentRole: ui-agent

objective:
  result screen을 구현하고 fixture 데이터로 정상 렌더링한다.

read:
  - spec.md
  - plan.md
  - contracts/result-schema.json

write:
  - web/app/result/
  - web/components/result/

doNotWrite:
  - spec.md
  - plan.md
  - package.json
  - presentation/
  - workflow/state.yaml

deadlineMinutes: 25

completionCriteria:
  - fixture 결과가 표시된다.
  - 핵심 Wow Moment가 화면에 보인다.
  - 타입 오류가 없다.
  - npm run build가 통과한다.

reportFormat:
  - completed
  - changedFiles
  - verification
  - blockers
  - fallbackUsed
  - decisionsNeeded
```

---

# 9. Gate 구조

각 단계 Gate는 세 층으로 구성한다.

## Mechanical Gate

- 파일 존재
- 필수 섹션
- JSON/YAML Schema
- 빌드
- 테스트
- 자산 경로
- 시간 합계
- overflow

## LLM Review Gate

작성자와 다른 Agent가 검토한다.

- Insight가 수사인가
- AI 필요성이 약한가
- 데모와 차별점이 연결되는가
- 구현과 발표가 일치하는가
- 범위가 과도한가

## Human Gate

- 최종 방향
- 큰 범위 축소
- 최종 발표 승인

---

# 10. 실패 복구와 부분 재실행

- 각 Stage 산출물은 가능하면 임시 경로에서 먼저 생성한다.
- Gate 통과 후 확정 경로로 이동한다.
- Gate 실패 시 해당 Stage만 재실행한다.
- 이전 완료 Stage는 임의로 수정하지 않는다.
- 확정 계약 변경이 필요하면 명시적으로 rollback을 요청한다.
- `state.yaml.lastSuccessfulCheckpoint`에 Stage와 commit SHA를 기록한다.

예:

```text
workflow/tmp/stage-09/
→ Gate 통과
→ presentation/
```

# 11. Handoff 보고서

각 단계 완료 후 다음 파일을 생성한다.

```text
workflow/history/stage-XX-<stage-id>.md
```

형식:

```md
# Stage XX 완료 보고

## 단계
## 시작 시각 / 종료 시각
## 사용 시간
## 완료한 내용
## 생성·수정한 파일
## 서브에이전트 실행 결과
## Gate 결과
## 사용자 결정
## 적용한 폴백
## 남아 있는 위험
## 확정된 계약
## 다음 단계가 읽어야 할 파일
## 다음 단계에서 하지 말아야 할 것
```

---

# 12. 자동 명령어

루트 `package.json`에 다음 명령을 추가한다.

```json
{
  "scripts": {
    "workflow:status": "node workflow/scripts/status.mjs",
    "workflow:start": "node workflow/scripts/start-stage.mjs",
    "workflow:complete": "node workflow/scripts/complete-stage.mjs",
    "workflow:resume": "node workflow/scripts/resume.mjs",
    "workflow:approve": "node workflow/scripts/approve-stage.mjs",
    "workflow:fail": "node workflow/scripts/fail-stage.mjs",

    "gate:intake": "node workflow/gates/validate-intake.mjs",
    "gate:research": "node workflow/gates/validate-research.mjs",
    "gate:insight": "node workflow/gates/validate-insight.mjs",
    "gate:spec": "node workflow/gates/validate-spec.mjs",
    "gate:plan": "node workflow/gates/validate-plan.mjs",
    "gate:build": "node workflow/gates/validate-build.mjs",
    "gate:integration": "node workflow/gates/validate-integration.mjs",
    "gate:demo": "node workflow/gates/validate-demo.mjs",
    "gate:script": "node workflow/gates/validate-script.mjs",
    "gate:presentation-generation": "node workflow/gates/validate-presentation-generation.mjs",
    "gate:presentation-visual": "node workflow/gates/validate-presentation-visual.mjs",
    "gate:rehearsal": "node workflow/gates/validate-rehearsal.mjs",
    "gate:package": "node workflow/gates/validate-package.mjs"
  }
}
```

---

# 13. 구현 Phase

## Phase 1 — 상태 머신 기반 구조

- `workflow/` 생성
- `state.yaml`
- `stages.yaml`
- 공통 템플릿
- 상태 Schema
- `CLAUDE.md` 라우터화

## Phase 2 — 단계 문서

- 00~12 단계 문서 작성
- 기존 긴 지침을 적절한 단계로 이동

## Phase 3 — Gate 기본 구현

- 파일·필드 존재 검사
- Schema 검사
- 명령 실행 검사
- Gate 보고서 생성

## Phase 4 — Agent 작업 계약

- Agent Task 템플릿
- 파일 소유권
- 완료 보고 템플릿
- 병렬 작업 지침

## Phase 5 — 상태 전환 자동화

- stage 시작
- Gate 실행
- Handoff 생성
- 다음 stage 전환
- Human Gate 대기

## Phase 6 — 기존 파이프라인 통합

- 해외 리서치
- 병렬 구현
- 데모 검증
- Notion + Slidev 발표 생성
- 패키징

---

# 14. Claude Code 최종 작업 지시

현재 저장소를 분석한 후 다음 순서로 작업하라.

1. 기존 `CLAUDE.md`, `spec.md`, `plan.md`, `PROGRESS.md`, `presentation/` 구조를 분석한다.
2. 기존 지침을 공통 규칙과 단계별 규칙으로 분류한다.
3. 삭제하지 말고 어느 문서로 이동할지 매핑표를 먼저 작성한다.
4. `workflow/` 상태 머신 구조를 만든다.
5. `CLAUDE.md`를 라우터 중심으로 축소한다.
6. Stage 00~12 지침 문서를 작성한다.
7. `state.yaml`, `stages.yaml`, Schema를 만든다.
8. Mechanical Gate의 최소 구현을 만든다.
9. Handoff 및 Agent Task 템플릿을 만든다.
10. 상태 전환 스크립트를 만든다.
11. 해외 리서치, 병렬 구현, 데모, 발표 생성 지침을 각 단계에 연결한다.
12. Notion + Slidev 관련 지침은 Stage 05·08·09·10·11에서 `stages.yaml.guidance.sections`로 지정된 섹션만 읽도록 연결한다.
13. 샘플 프로젝트 상태를 Stage 00부터 Stage 03까지 실제로 실행해 본다.
14. Gate 실패와 Human Gate 대기 상황을 테스트한다.
15. README와 운영 문서를 갱신한다.
16. 각 Phase 완료 후 체크포인트 커밋을 남긴다.

작업 시작 전에 반드시 다음을 먼저 보고하라.

- 현재 긴 지침의 분해 계획
- 생성할 단계 목록
- 단계별 입력과 출력
- 사용자 승인 지점
- 자동 Gate와 LLM Review Gate 구분
- 공통 파일 소유권
- 서브에이전트 역할
- 예상 변경 파일
- 마이그레이션 중 보존할 기존 파일

사용자 확인 없이 기존 지침이나 템플릿을 삭제하지 마라.

---


---

# P1 운영 안정성 규칙

## 개인정보와 API 키

- `.env`를 커밋하지 않는다.
- `env.example`을 제공한다.
- 실제 개인정보 대신 가상 페르소나와 익명 fixture를 사용한다.
- API 키를 로그·스크린샷·발표자료에 노출하지 않는다.
- 외부 LLM에 전송되는 데이터 범위를 명시한다.

## 자산 출처와 라이선스

다음을 유지한다.

```text
presentation/sources/ASSET_LICENSES.md
presentation/sources/provenance.json
```

외부 폰트·아이콘·이미지·Slidev 템플릿의 배포 가능 여부를 확인한다.

## Claim–Source 연결

주요 문제 주장과 수치는 출처 ID와 연결한다.

```json
{
  "claimId": "problem-01",
  "claim": "",
  "sources": ["source-03"],
  "usedIn": ["spec.problem", "slide-02"]
}
```

## CSS 우선순위

```text
1. Slidev engine base
2. 기존 Slidev template base
3. Notion design tokens
4. Notion component adaptation
5. project-specific overrides
6. emergency text-fit overrides
```

슬라이드별 inline style과 `!important` 남용으로 충돌을 해결하지 않는다.

## 컨텍스트 예산

- 현재 Stage의 instruction과 guidance section만 읽는다.
- Handoff를 전체 history보다 우선한다.
- 서브에이전트는 최대 5개의 주요 입력 파일만 받는다.
- 관련 없는 리서치 원문과 이전 대화 전체를 넘기지 않는다.

# 15. 최종 성공 기준

- Claude는 작업 시작 시 현재 단계를 정확히 식별한다.
- 현재 단계의 지침만 읽는다.
- 각 단계의 필수 산출물이 계약으로 정의되어 있다.
- Gate 실패 시 다음 단계로 이동하지 않는다.
- 사용자 승인 단계에서 자동으로 멈춘다.
- 서브에이전트는 제한된 파일만 수정한다.
- 단계별 Handoff가 남는다.
- 새 세션에서 작업을 정확히 이어갈 수 있다.
- 해외 리서치, 병렬 구현, 데모 검증, 발표 생성이 누락되지 않는다.
- 시간 부족 시 단계를 생략하지 않고 기능 범위를 줄인다.
- 최종적으로 Stage 12에서 제출 패키지가 생성된다.
