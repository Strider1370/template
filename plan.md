# plan.md — 구현 계획

> **Stage 04 산출물.** `spec.md`를 **어떻게 만드는가**로 분해한다.
> 각 작업마다 **폴백을 미리 정한다**(디버그 중 즉흥 결정 금지).
> 함께 확정할 계약: `workflow/decisions/file-ownership.yaml`(파일 소유권), Agent Task 계약.
> (작성 후 빈 안내 주석은 지우고 실제 내용으로 채울 것.)

## 1. 기술 스택 결정
<!-- 기본은 web/ 스캐폴드(Next 14 + KRDS, install·build 통과 확인됨). 바꿀 거면 이유와 함께. -->
<!-- 데모를 가장 빨리 띄울 수 있는 선택을 우선. 새 의존성은 최소화. -->

## 2. 작업 분해 + 구현 순서
> 데모 시나리오(spec §8)의 핵심 경로를 **먼저 끝까지** 연결한다. 곁가지는 그 다음.
> 각 작업은 Stage 05에서 하나의 서브에이전트(또는 메인)가 맡는다. 소유 파일은 §4와 일치시킬 것.

| # | 작업 | 산출물(파일/화면) | 담당(Agent) | 폴백 (시간 내 안 되면) |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## 3. 데이터 연결 계획 (실시간 → 정적 폴백)
<!--
어떤 데이터를, 언제, 어떻게 쓰는가. 표로.
원칙: 실시간 API는 실패 가능성이 크므로 반드시 정적 백업(fixture/JSON)으로 fallback 경로를 둔다.
정적 자산을 먼저 쓰고, 없는 것만 새로 받는다. data.go.kr/safetydata.go.kr 은 이 환경에서 403 → 사람이 직접 다운로드.
새 공공 CSV는 web/scripts/build-shelters.mjs 패턴으로 가공.
-->
| 데이터 | 출처 | 실시간/정적 | 폴백(정적 백업) | 확보 상태 |
|---|---|---|---|---|
|  |  |  |  |  |

## 4. 파일 소유권 (Ownership)
> Stage 05 병렬 빌드에서 **파일 충돌을 막는 계약**이다. 확정본은 `workflow/decisions/file-ownership.yaml`에 둔다.
> 규칙: 한 파일은 한 주체만 쓴다. 메인 전용 파일은 서브에이전트가 절대 수정하지 않는다.

### 메인 에이전트 전용 (서브에이전트 수정 금지)
<!-- 공통/계약 파일. 충돌 시 데모 전체가 깨진다. -->
- `workflow/state.yaml`, `workflow/stages.yaml`
- `spec.md`, `plan.md`, `PROGRESS.md`, `README.md`
- 루트 `package.json`, 공통 설정·Schema
- `web/app/layout.tsx`, `web/app/globals.css`, `web/tailwind.config.ts` (공통 스타일/레이아웃)

### 에이전트별 소유 경로
<!-- 각 서브에이전트는 아래 자기 경로만 쓴다(write). 그 외는 읽기만(read). -->
| Agent | 쓰기 허용 경로(write) | 읽기(read) | 쓰기 금지(doNotWrite) |
|---|---|---|---|
| UI Agent |  | spec.md, plan.md | 메인 전용 전체 |
| Data Agent |  | spec.md, plan.md | 메인 전용 전체 |
| AI Agent |  | spec.md, plan.md | 메인 전용 전체 |
| Demo Agent | `demo/` | spec.md, demo/demo.scenario.yaml | 메인 전용 전체 |
| Presentation Agent | `presentation/` | spec.md | 메인 전용 전체 |

## 5. 사용자 사전 준비 체크리스트 (사람이 할 일)
> 키 발급·계정·다운로드는 당일에 늦다. 미리. 기준: `data/data-sources.md`.
- [ ] 카카오맵 JS 키 발급 + 도메인 등록(localhost:3000) → `web/.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_KEY` (지도 쓸 경우)
- [ ] 필요한 공공데이터 다운로드/신청 (data.go.kr 403 차단 → 브라우저로 직접)
- [ ] 외부 LLM/API 키 발급 + `.env` 설정 (`.env`는 커밋 금지, `env.example`만 커밋)
- [ ] (기타)

## 6. 체크포인트 계획
<!--
"데모가 한 단계 더 돌아갈 때마다" 로컬 git 커밋(매 변경마다 X). AI가 망쳤을 때 되돌릴 안전장치.
어느 지점에서 커밋할지 미리 정한다. 예: 핵심 경로 연결 직후 / Wow Moment 화면 동작 직후 / 통합 빌드 통과 직후.
state.yaml.lastSuccessfulCheckpoint 에 Stage·commit SHA 기록. push는 마지막에 한 번.
-->
- 체크포인트 1:
- 체크포인트 2:
