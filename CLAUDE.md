# CLAUDE.md — 해커톤 워크플로우 라우터

> 새 세션 AI는 **이 파일을 먼저 읽는다.** 이 저장소는 **단계 기반 워크플로우 엔진**으로 운영된다.
> 이 파일은 라우터다 — 상세 지침은 단계별 문서(`workflow/stages/`)와 운영 지침(`docs/`)에 있고,
> 현재 위치는 항상 `workflow/state.yaml`이 말한다.
>
> 한국 공공 서비스용 **4시간 AI 해커톤 스타터 키트**. 목표: "데모가 확실히 돌아가는" 결과물.

---

## 작업 시작 시 반드시 이 순서로

1. **`workflow/state.yaml`을 읽는다.** (`npm run workflow:status` 로 요약 가능)
2. `current.stageId` 와 `current.status` 를 확인한다.
3. `workflow/stages.yaml` 에서 그 단계의 **지침 파일**과 **guidance 섹션**, **Gate 명령**을 찾는다.
4. **현재 단계 지침 파일**(`workflow/stages/NN-*.md`)을 읽는다.
5. 지침의 "3. 반드시 읽을 파일"에 명시된 입력 + `guidance` 섹션만 읽는다. (그 외는 읽지 않는다)
6. 필요한 **서브에이전트를 병렬** 실행한다 (작업 계약 = `workflow/templates/agent-task.yaml`).
7. 산출물을 통합한다.
8. 지정된 **Gate를 실제로 실행**한다 (`npm run gate:<stage>`). LLM Review는 `npm run cross-review -- <대상>`.
9. Gate 통과 시 **Handoff**(`workflow/templates/stage-report.md` → `workflow/history/stage-NN-<id>.md`)를 쓰고 `npm run workflow:complete`.
10. Gate 실패 시 다음 단계로 가지 말고 실패 원인과 폴백을 보고한다 (`npm run workflow:fail "<사유>"`).

새 세션 복원: **`npm run workflow:resume`** → 현재 단계와 다음 행동을 알려준다. 이전 대화를 추측하지 말고 `state.yaml` + 최신 Handoff로 복원한다.

## 13단계 한눈에 (총 230분 + 버퍼 10)
`00 intake → 01 리서치 → 02 인사이트선택˙승인 → 03 spec → 04 plan → 05 병렬구현 → 06 통합 → 07 데모검증 → 08 스크립트 → 09 발표생성 → 10 발표검증 → 11 리허설˙승인 → 12 패키지`
- **사용자 승인 단계: 02, 11** — 승인 전 멈추고, 승인 전엔 확정 파일을 만들지 않는다.
- **실행 게이트(실로직): spec · build · demo · presentation-generation · presentation-visual.** 나머지는 체크리스트(필수파일 존재 + 자가점검).
- **교차검토(LLM Review)**: `cross-review` = Codex 플러그인 가능하면 사용 → 불가하면 별도 클로드 리뷰어 서브에이전트로 폴백.

## 운영 모드 (`state.yaml.workflowMode`)
- `run` — 해커톤 주제를 Stage 00~12로 실행 (기본).
- `bootstrap` — 엔진/템플릿/단계문서 자체를 설치·수정.
- `maintenance` — 엔진 일부만 수정, 해커톤 단계 자동 진행 금지.

## 공통 금지 사항
- 현재 단계 밖의 작업을 미리 하지 마라. 전체 워크플로우를 한 번에 실행하려 하지 마라.
- Gate를 실제로 실행하지 않고 완료 처리하지 마라. 실패를 숨기거나 성공으로 기록하지 마라.
- 사용자 승인 단계에서 임의로 선택하지 마라.
- 공통 파일을 서브에이전트가 수정하게 하지 마라.
- 구현되지 않은 기능(`implementation/manifest.json` 기준)을 발표에 넣지 마라. 근거 없는 수치를 만들지 마라.
- 시간 부족 시 단계를 생략하지 말고 **기능 범위를 줄여라**.

## 메인 에이전트 전용 파일 (서브에이전트 수정 금지)
`workflow/state.yaml` · `workflow/stages.yaml` · `spec.md` · `plan.md` · `PROGRESS.md` · `README.md` · 루트 `package.json` · 공통 설정/Schema.

## 핵심 산출물 (계약서 — 항상 최신 유지)
| 파일 | 내용 |
|------|------|
| `workflow/state.yaml` | 현재 단계/상태 (머신) |
| `PROGRESS.md` | 현재/완료/막힌 부분 (사람용 요약) |
| `spec.md` | 스펙 — Stage 03 산출물 (데모 시나리오·Wow Moment 포함) |
| `plan.md` | 구현 계획 — Stage 04 산출물 (작업분해·폴백·파일 소유권) |
| `workflow/history/` | 단계별 Handoff (세션 인수인계) |

## 키트 자산 (처음부터 만들지 마라)
검증된 `web/` 스캐폴드, 전국 지역·지도·대피소 데이터, KRDS 디자인, 재사용 코드/스크립트가 이미 있다.
**무엇이 있고 어떻게 재사용하는지 → `docs/kit-assets.md`** (KRDS 함정·카카오키·403 차단 대응 포함). 주로 Stage 00·05에서 참조.
> 주제가 공공/지역 기반이 아니면 KRDS·공공데이터 자산은 떼어내고 `web/` 스캐폴드 + 워크플로우만 쓴다.

## 운영 지침 문서 (`docs/`, Just-in-Time)
지정된 Stage에서 `stages.yaml.guidance`가 가리키는 섹션만 읽는다 — 전체를 미리 읽지 마라.
- `docs/AI_Hackathon_Operating_System.md` — 기획·판단 품질 기준 (문제정의·Insight·JTBD·AI Leverage·차별화·발표 내러티브).
- `docs/CLAUDE_Notion_Slidev_Integration_Guide.md` — 발표자료 생성(Slidev primary + Notion 정적 HTML 백업).
- `docs/CLAUDE_Stage_Based_Workflow_Engine_Guide.md` — 엔진 구조 자체 (bootstrap/maintenance 시 참조).

## 세션 종료 전
- 현재 단계/상태를 `state.yaml`에 기록 (`workflow:*` 스크립트 사용).
- 완료·미완료·막힌 내용을 `PROGRESS.md`에 기록.
- 해당 단계 Handoff를 `workflow/history/`에 저장.
- 작동하는 상태가 됐을 때마다 체크포인트 커밋(매 변경마다가 아니라).
