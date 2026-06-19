# 템플릿 개선 구현 계획 (단계 멈춤·비동기 에이전트·전수 데이터·OpenAI 연동)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 해커톤 워크플로우 템플릿에 단계 경계 멈춤(엔진 가드+지침), 비동기 서브에이전트 운영, 전수 데이터 방향성, OpenAI 기본 LLM 스캐폴드 + 복지 전수 데이터 파이프라인을 추가하고, 배너 이미지 생성 가능성을 문서화한다.

**Architecture:** 워크플로우 엔진(Node ESM 스크립트 + state.yaml)에 `awaiting_direction` 상태와 `complete`/`next` 분리를 추가한다. 운영 방식 변경(비동기 에이전트·전수 데이터)은 CLAUDE.md/docs 지침으로 강제한다. web에는 provider 추상화 LLM 헬퍼(OpenAI 기본·fixture 폴백)와 복지 혜택 API 전수 적재 스크립트를 더한다. 배너 이미지는 설계 문서만 작성한다.

**Tech Stack:** Node.js ESM, js-yaml, Next.js 14 + TypeScript, OpenAI SDK, data.go.kr 공공서비스(혜택) API(15113968).

**참고 문서:**
- 설계 spec: `docs/superpowers/specs/2026-06-20-template-enhancements-design.md`
- 데이터 가이드: `docs/welfare-benefit-dataset-prep.md`
- 엔진 구조: `workflow/lib.mjs`, `workflow/scripts/*.mjs`

**검증 환경 메모:** 이 저장소엔 테스트 러너가 없다. 엔진 작업은 *state.yaml 백업 → 명령 실행 → state 검증 → 복원* 으로 기능 검증한다. 모든 명령은 저장소 루트(`C:/Users/Jond Doe/Desktop/hackathon/template`)에서 Bash(Git Bash)로 실행한다. 커밋은 `template-enhancements` 브랜치에 쌓는다.

---

## File Structure

| 파일 | 책임 | 작업 |
|---|---|---|
| `workflow/lib.mjs` | 상태 상수·state IO | Modify (VALID_STATUS에 `awaiting_direction`) |
| `workflow/scripts/complete-stage.mjs` | 현재 단계 마감 → **정지** | Modify (자동 전환 제거) |
| `workflow/scripts/next-stage.mjs` | 다음 단계로 전환 전담 | Create |
| `workflow/scripts/resume.mjs` | 복원 안내 | Modify (`awaiting_direction` 분기) |
| `package.json` (루트) | 스크립트 등록 | Modify (`workflow:next`) |
| `CLAUDE.md` | 라우터/운영 지침 | Modify (단계 멈춤·비동기·전수 방향성) |
| `README.md` | 사람용 설명 | Modify (절차·키표) |
| `workflow/templates/agent-task.yaml` | 서브에이전트 계약 | Modify (백그라운드 규약) |
| `docs/AI_Hackathon_Operating_System.md` | 기획/구현 품질 기준 | Modify (전수 모집단 원칙) |
| `docs/banner-image-generation-design.md` | 배너 이미지 검토 | Create |
| `web/lib/llm/{types,openai,fixture,index}.ts` | provider 추상화 LLM | Create |
| `web/app/api/llm/route.ts` | 서버사이드 LLM 호출 | Create |
| `web/package.json` | openai 의존성 | Modify |
| `README.md` 키표 / `docs/kit-assets.md` | OpenAI 기준 갱신 | Modify |
| `data/welfare/benefits/{fetch.mjs,normalize.mjs,schema/benefit.schema.json,README.md}` | 혜택 전수 적재 | Create |
| `.gitignore` | 전수 full 처리 | Modify |

---

## Task 1: 단계 경계 멈춤 — `awaiting_direction` + `complete`/`next` 분리

**Files:**
- Modify: `workflow/lib.mjs` (VALID_STATUS)
- Modify: `workflow/scripts/complete-stage.mjs` (자동 전환 → 정지)
- Create: `workflow/scripts/next-stage.mjs`
- Modify: `workflow/scripts/resume.mjs`
- Modify: `package.json` (루트, `workflow:next`)

- [ ] **Step 1: `VALID_STATUS`에 `awaiting_direction` 추가**

`workflow/lib.mjs:12-14`를 다음으로 교체:

```js
export const VALID_STATUS = [
  "not_started", "in_progress", "blocked", "awaiting_approval",
  "awaiting_direction", "gate_failed", "completed",
];
```

- [ ] **Step 2: `complete-stage.mjs`를 "마감 후 정지"로 변경**

`workflow/scripts/complete-stage.mjs`의 88번째 줄 이후(`// 마지막 단계인가?`부터 파일 끝까지)를 다음으로 교체:

```js
  // 마지막 단계인가?
  if (isLastStage(stage)) {
    state.current.status = "completed";
    writeState(state);
    console.log("\n🎉 워크플로우 완료 — 마지막 단계까지 끝났습니다.");
    console.log("");
    process.exit(0);
  }

  // 자동 전환하지 않는다. awaiting_direction 으로 멈추고 사용자 확인을 기다린다.
  state.current.status = "awaiting_direction";
  writeState(state);

  const nxt = getStage(stage.number + 1);
  console.log(`\n[workflow:complete] Stage ${stage.number} (${stage.id}) 마감 — 다음 단계로 자동 전환하지 않습니다.`);
  console.log("상태 : awaiting_direction (사용자 방향 결정 대기)");
  console.log("\n반드시 사용자에게 다음을 확인하세요:");
  console.log("  ① 이 단계 결과 요약");
  console.log(`  ② 다음 단계 미리보기 : Stage ${nxt.number} (${nxt.id}) — ${nxt.budgetMinutes}분`);
  console.log("  ③ '그대로 진행' vs '수정 후 진행'");
  console.log("\n사용자가 진행을 택하면 : node workflow/scripts/next-stage.mjs");
  console.log("");
} catch (err) {
  console.error("complete-stage 실패:", err.message);
  process.exit(1);
}
```

> 참고: `getStage`는 이미 상단에서 import 되어 있다(`import { ..., getStage } from "../lib.mjs"`). 추가 import 불필요.

- [ ] **Step 3: `next-stage.mjs` 생성 (전환 전담)**

`workflow/scripts/next-stage.mjs` 새 파일:

```js
// workflow/scripts/next-stage.mjs — awaiting_direction 에서만 다음 단계로 전환.
// 사용: node workflow/scripts/next-stage.mjs
// (complete-stage 는 더 이상 자동 전환하지 않는다. 사용자 확인 후 이 스크립트로 진행.)
import { readState, writeState, getStage } from "../lib.mjs";
import {
  gateForStage,
  requiredReadsForStage,
  currentStage,
} from "./_common.mjs";

try {
  const state = readState();
  const stage = currentStage(state);
  if (!stage) {
    console.error("current 단계를 stages.yaml 에서 찾지 못했습니다.");
    process.exit(1);
  }

  // 가드: awaiting_direction 이 아니면 전환 거부
  if (state.current.status !== "awaiting_direction") {
    console.error(
      `\n[workflow:next] 거부 — current.status=${state.current.status} (awaiting_direction 아님).\n` +
        `먼저 현재 단계를 마감하세요: node workflow/scripts/complete-stage.mjs\n` +
        `그 뒤 사용자 확인을 거쳐 이 스크립트로 다음 단계로 진행합니다.`
    );
    process.exit(1);
  }

  const nxt = getStage(stage.number + 1);
  if (!nxt) {
    console.error("다음 단계가 없습니다(마지막 단계). 전환할 대상이 없습니다.");
    process.exit(1);
  }

  state.current.stageNumber = nxt.number;
  state.current.stageId = nxt.id;
  state.current.status = "not_started";
  state.current.startedAt = null;
  state.current.budgetMinutes = nxt.budgetMinutes;

  state.requiredReads = requiredReadsForStage(nxt);
  state.nextGate = gateForStage(nxt);
  state.humanApproval = {
    required: !!nxt.humanApproval,
    status: nxt.humanApproval ? "pending" : "not_required",
    decisionFile: null,
  };

  writeState(state);

  console.log(`\n[workflow:next] → Stage ${nxt.number} (${nxt.id}) — ${nxt.budgetMinutes}분`);
  console.log("먼저 읽어라:");
  for (const r of state.requiredReads) console.log(`  - ${r}`);
  console.log("\n시작하려면 : node workflow/scripts/start-stage.mjs");
  if (nxt.humanApproval) {
    console.log("\n⚠ 이 단계는 사용자 승인이 필요합니다. 게이트 통과 후 approve-stage 로 승인받으세요.");
  }
  console.log("");
} catch (err) {
  console.error("next-stage 실패:", err.message);
  process.exit(1);
}
```

- [ ] **Step 4: `resume.mjs`에 `awaiting_direction` 분기 추가**

`workflow/scripts/resume.mjs:30-31`의 `awaiting_approval` 분기 바로 뒤에 분기를 추가한다. 기존:

```js
  } else if (c.status === "awaiting_approval") {
    console.log(`  ${step++}. status=awaiting_approval — 사용자 승인 후 approve-stage 실행.`);
  } else {
```

를 다음으로 교체:

```js
  } else if (c.status === "awaiting_approval") {
    console.log(`  ${step++}. status=awaiting_approval — 사용자 승인 후 approve-stage 실행.`);
  } else if (c.status === "awaiting_direction") {
    console.log(`  ${step++}. status=awaiting_direction — 단계는 마감됨. 사용자에게 진행/수정을 확인한 뒤`);
    console.log(`     다음 단계로 전환: node workflow/scripts/next-stage.mjs (확인 전 실행 금지).`);
  } else {
```

- [ ] **Step 5: 루트 `package.json`에 `workflow:next` 등록**

`package.json:11`의 `"workflow:complete"` 줄 바로 뒤에 추가:

```json
    "workflow:complete": "node workflow/scripts/complete-stage.mjs",
    "workflow:next": "node workflow/scripts/next-stage.mjs",
```

- [ ] **Step 6: 기능 검증 — state 백업 후 전이 시나리오 실행**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
cp workflow/state.yaml workflow/state.yaml.testbak
# intake 단계를 시작 → 마감 → 전환 시나리오
node workflow/scripts/start-stage.mjs intake >/dev/null
node workflow/scripts/complete-stage.mjs
echo "=== complete 후 상태 ==="; grep -E "stageId:|status:" workflow/state.yaml | head -4
node workflow/scripts/next-stage.mjs
echo "=== next 후 상태 ==="; grep -E "stageId:|status:" workflow/state.yaml | head -4
```
Expected:
- `complete 후`: `stageId: intake`, `status: awaiting_direction` (전환 안 됨)
- `next 후`: `stageId: research`, `status: not_started`

- [ ] **Step 7: 가드 검증 — awaiting_direction 아닐 때 next 거부**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
node workflow/scripts/next-stage.mjs; echo "exit=$?"
```
Expected: "거부 — current.status=not_started ..." 메시지 + `exit=1`

- [ ] **Step 8: state 복원**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
mv workflow/state.yaml.testbak workflow/state.yaml
node workflow/scripts/status.mjs | grep -E "현재 단계|상태"
```
Expected: 원래의 `Stage 0 (intake)` / `not_started`로 복원됨

- [ ] **Step 9: CLAUDE.md 지침 갱신 (작업 순서 9)**

`CLAUDE.md`의 작업 순서 9번 항목을 찾아(현재: "Gate 통과 시 **Handoff 자동 생성**...후 `npm run workflow:complete`.") 다음으로 교체:

```markdown
9. Gate 통과 시 **Handoff 자동 생성**(`npm run workflow:handoff`) 후 '완료 내용 다듬기 + 결정/위험' 1~2줄만 보강하고 `npm run workflow:complete`. **complete는 자동으로 다음 단계로 넘어가지 않고 `awaiting_direction`에서 멈춘다.** 이때 반드시 사용자에게 ① 이 단계 결과 요약 ② 다음 단계 미리보기 ③ '그대로 진행 vs 수정 후 진행'을 묻는다. 사용자가 진행을 택하기 전에는 `npm run workflow:next`를 실행하지 않는다. (02·11 승인 단계와 별개로 **모든** 단계 경계에 적용.)
```

- [ ] **Step 10: 커밋**

```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git add workflow/lib.mjs workflow/scripts/complete-stage.mjs workflow/scripts/next-stage.mjs workflow/scripts/resume.mjs package.json CLAUDE.md
git commit -m "feat(engine): 단계 경계 멈춤 — awaiting_direction + complete/next 분리"
```

---

## Task 2: 비동기 서브에이전트 운영 지침

**Files:**
- Modify: `CLAUDE.md` (작업 순서 6)
- Modify: `workflow/templates/agent-task.yaml`

- [ ] **Step 1: 현재 agent-task 템플릿 확인**

Run: `cat "C:/Users/Jond Doe/Desktop/hackathon/template/workflow/templates/agent-task.yaml"`
Expected: 서브에이전트 작업 계약 구조 확인 (필드 파악 후 Step 3에서 정확히 보강)

- [ ] **Step 2: CLAUDE.md 작업 순서 6번 교체**

`CLAUDE.md`의 "6. 필요한 **서브에이전트를 병렬** 실행한다 (작업 계약 = `workflow/templates/agent-task.yaml`)." 를 다음으로 교체:

```markdown
6. 필요한 **서브에이전트를 백그라운드로 병렬** 실행한다 (작업 계약 = `workflow/templates/agent-task.yaml`). 띄운 직후 사용자에게 "조사/작업이 백그라운드로 도는 중이며 그동안 다른 질문·작업이 가능하다"고 알리고, **메인은 대기 상태로 멈추지 말고 사용자와 대화를 유지한다.** 결과가 도착하면 통합한다. (통합 직전 누락 보고서가 없는지 확인.)
```

- [ ] **Step 3: agent-task.yaml에 백그라운드 규약 주석 추가**

`workflow/templates/agent-task.yaml` 파일 상단(첫 주석 블록 뒤)에 다음 주석을 추가:

```yaml
# 실행 규약:
# - 메인은 이 작업을 백그라운드로 띄운다(run_in_background). 메인은 대기하지 않고 사용자와 대화를 이어간다.
# - 각 서브에이전트는 자기 보고서 파일(읽기 쉬운 md 1개)을 남긴다. 경로는 작업별로 지정한다.
# - 메인은 모든 보고서 도착 후에만 통합한다. 통합 전 누락 여부를 점검한다.
```

- [ ] **Step 4: 내용 검증**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
grep -n "백그라운드" CLAUDE.md workflow/templates/agent-task.yaml
```
Expected: CLAUDE.md 6번 항목과 agent-task.yaml 양쪽에서 "백그라운드" 매칭

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git add CLAUDE.md workflow/templates/agent-task.yaml
git commit -m "docs(engine): 비동기 서브에이전트 운영 지침 — 백그라운드 실행 + 메인 대화 유지"
```

---

## Task 3: 전수 데이터 방향성 지침

**Files:**
- Modify: `docs/AI_Hackathon_Operating_System.md`
- Modify: `CLAUDE.md` (금지 사항)

- [ ] **Step 1: 삽입 지점 확인**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
grep -n "^## \|^### " docs/AI_Hackathon_Operating_System.md | head -40
```
Expected: 데이터/구현 현실성 또는 품질 기준 관련 섹션 헤딩 목록 확인 (가장 가까운 섹션 끝에 Step 2 블록 삽입)

- [ ] **Step 2: 전수 모집단 원칙 블록 추가**

`docs/AI_Hackathon_Operating_System.md`에서 데이터/구현 관련 섹션(Step 1에서 확인)의 끝에 다음 블록을 추가:

```markdown
### 데이터 모집단 원칙 — 전수 우선

실사용 가능한 데모는 "검색·필터·매칭의 모집단이 전수(전체 카탈로그)"여야 한다.

- 데이터는 **전수**를 기본 모집단으로 적재한다. "예시 N개"는 **화면 표시 개수**일 뿐, 검색·필터·매칭의 대상은 전체여야 한다.
- 모집단을 샘플 몇 개로 줄여 구현하지 말 것 — 그건 실사용이 아니라 시연용 껍데기가 된다.
- 시간이 부족하면 데이터를 줄이지 말고 **보여줄 화면 수(기능 범위)** 를 줄인다.
- 규칙 가드: 전수 *데이터*의 사전 적재는 허용되나, 완성형 *미션 답안 서비스*는 당일 조립한다.
```

- [ ] **Step 3: CLAUDE.md 금지 사항에 한 줄 추가**

`CLAUDE.md`의 "## 공통 금지 사항" 목록 끝에 다음 항목을 추가:

```markdown
- 데이터 모집단을 예시 몇 개로 축소해 구현하지 마라. 모집단은 전수, 표시는 일부다. (시간 부족 시 데이터가 아니라 화면 수를 줄여라.)
```

- [ ] **Step 4: 내용 검증**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
grep -n "전수" docs/AI_Hackathon_Operating_System.md CLAUDE.md
```
Expected: 두 파일 모두에서 "전수" 원칙 매칭

- [ ] **Step 5: 커밋**

```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git add docs/AI_Hackathon_Operating_System.md CLAUDE.md
git commit -m "docs: 전수 데이터 모집단 원칙 추가 (실사용 데모 방향성)"
```

---

## Task 4: 배너 이미지 생성 검토 문서

**Files:**
- Create: `docs/banner-image-generation-design.md`

- [ ] **Step 1: 검토 문서 작성**

`docs/banner-image-generation-design.md` 새 파일:

```markdown
# web 상단 배너 — OpenAI 이미지 생성 검토 (구현 보류)

> 상태: 검토·설계만. 실제 구현은 별도 작업. (`docs/superpowers/specs/2026-06-20-template-enhancements-design.md` §5)

## 1. 가능성

OpenAI 이미지 생성 API(`gpt-image-1`)로 주제 배너 이미지를 생성할 수 있다.
- 입력: 주제·톤·키워드 프롬프트 (예: "폭염 대비 공공 안내, KRDS 톤, 차분한 블루 계열, 텍스트 없음")
- 출력: PNG (원하는 해상도/가로비)

## 2. Header 배너 슬롯

현재 `web/components/Header.tsx`는 정부 Masthead + 엠블럼 + 서비스명 + GNB만 있고 이미지 배너가 없다.
배너를 넣는다면 두 위치가 후보다.
- (a) `app/page.tsx`의 Hero 섹션 배경 이미지 — 주제별 인상 전달에 적합.
- (b) Header GNB 아래 띠 — 항상 노출되나 공간이 좁다.
권고: **(a) Hero 배경**. 접근성을 위해 텍스트는 이미지가 아닌 DOM 텍스트로 유지하고, 이미지는 대비를 해치지 않는 오버레이와 함께 쓴다.

## 3. 생성 시점 — 빌드타임 vs 런타임

| 방식 | 장점 | 단점 |
|---|---|---|
| 빌드타임 스크립트 → `web/public/banner.png` 저장 | 런타임 비용·지연 없음, 캐시 단순 | 주제 바뀌면 재생성 필요 |
| 런타임 API route 생성 | 동적·유연 | 이미지당 과금·수초 지연·키 노출 관리 |

권고: **빌드타임 생성 + 정적 폴백**. `scripts/generate-banner.mjs`가 `OPENAI_API_KEY`로 생성해
`web/public/banner.png`에 저장하고, 키/생성 실패 시 저장소 기본 배너로 폴백.

## 4. 비용·제약

- 이미지당 과금(모델·해상도에 따라 다름). 빌드타임 1회 생성이면 비용 통제 쉬움.
- 생성 지연 수초 — 런타임이면 첫 로드 체감 저하.
- 이미지 내 텍스트 렌더 품질 한계 → 텍스트는 DOM으로.
- 접근성: 충분한 대비, 의미 없는 장식이면 `alt=""`.

## 5. 규칙

- 생성물의 도구·용도를 `SOURCE_LOG`(AI Usage Summary)에 기록한다.
- KRDS 톤·접근성(대비/색)을 따른다. 생성 이미지가 정부 식별 요소를 침범하지 않게 한다.

## 6. 결론

빌드타임 생성 + 정적 폴백 구조가 비용·안정성·접근성 측면에서 가장 안전하다.
실제 구현 시: `scripts/generate-banner.mjs` + Hero 배경 슬롯 + 기본 폴백 이미지 + SOURCE_LOG 기록.
```

- [ ] **Step 2: 검증**

Run: `test -f "C:/Users/Jond Doe/Desktop/hackathon/template/docs/banner-image-generation-design.md" && echo OK`
Expected: `OK`

- [ ] **Step 3: 커밋**

```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git add docs/banner-image-generation-design.md
git commit -m "docs: web 배너 OpenAI 이미지 생성 검토 문서 (구현 보류)"
```

---

## Task 5: OpenAI LLM 스캐폴드 (provider 추상화)

**Files:**
- Create: `web/lib/llm/types.ts`
- Create: `web/lib/llm/openai.ts`
- Create: `web/lib/llm/fixture.ts`
- Create: `web/lib/llm/index.ts`
- Create: `web/app/api/llm/route.ts`
- Modify: `web/package.json` (openai 의존성)

- [ ] **Step 1: provider 인터페이스 정의 (`types.ts`)**

`web/lib/llm/types.ts`:

```ts
// LLM provider 추상화 — OpenAI 기본, fixture 폴백. provider 교체 가능.
export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmCompleteOptions = {
  temperature?: number;
  maxTokens?: number;
};

export type LlmResult = {
  text: string;
  provider: string; // 실제 응답을 만든 provider 이름 ("openai" | "fixture" | ...)
};

export interface LlmProvider {
  readonly name: string;
  complete(messages: LlmMessage[], opts?: LlmCompleteOptions): Promise<LlmResult>;
}
```

- [ ] **Step 2: fixture provider (`fixture.ts`)**

`web/lib/llm/fixture.ts`:

```ts
import type { LlmProvider, LlmMessage, LlmResult } from "./types";

// 키가 없거나 provider 호출이 불가할 때 쓰는 결정적 폴백.
// 실제 LLM처럼 단언하지 않도록, 폴백임을 분명히 한다.
export class FixtureProvider implements LlmProvider {
  readonly name = "fixture";
  async complete(messages: LlmMessage[]): Promise<LlmResult> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const echo = lastUser?.content?.slice(0, 200) ?? "";
    return {
      text: `[fixture 응답 — LLM 키 없음] 입력 요약: ${echo}`,
      provider: this.name,
    };
  }
}
```

- [ ] **Step 3: OpenAI provider (`openai.ts`)**

`web/lib/llm/openai.ts`:

```ts
import OpenAI from "openai";
import type { LlmProvider, LlmMessage, LlmCompleteOptions, LlmResult } from "./types";

// 기본 provider. OPENAI_API_KEY 가 있을 때만 생성된다(index.ts 가 판단).
export class OpenAiProvider implements LlmProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = process.env.OPENAI_MODEL ?? "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(messages: LlmMessage[], opts: LlmCompleteOptions = {}): Promise<LlmResult> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens,
    });
    return {
      text: res.choices[0]?.message?.content ?? "",
      provider: this.name,
    };
  }
}
```

- [ ] **Step 4: provider 선택자 (`index.ts`)**

`web/lib/llm/index.ts`:

```ts
import type { LlmProvider } from "./types";
import { OpenAiProvider } from "./openai";
import { FixtureProvider } from "./fixture";

export * from "./types";

// env 로 provider 를 고른다. 기본 openai. 키가 없으면 fixture 로 폴백.
// LLM_PROVIDER=fixture 로 강제 폴백 가능.
export function getLlmProvider(): LlmProvider {
  const choice = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  const key = process.env.OPENAI_API_KEY;

  if (choice === "fixture") return new FixtureProvider();
  if (choice === "openai") {
    if (!key) return new FixtureProvider(); // 키 없으면 폴백
    return new OpenAiProvider(key);
  }
  // 알 수 없는 provider → 안전하게 폴백
  return new FixtureProvider();
}
```

- [ ] **Step 5: 서버사이드 API route (`route.ts`)**

`web/app/api/llm/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getLlmProvider, type LlmMessage } from "@/lib/llm";

export const runtime = "nodejs";

// 서버사이드에서만 LLM 키 사용. 클라이언트는 이 라우트로만 호출한다.
export async function POST(req: Request) {
  let body: { messages?: LlmMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages[] required" }, { status: 400 });
  }
  const provider = getLlmProvider();
  const result = await provider.complete(messages);
  return NextResponse.json(result);
}
```

- [ ] **Step 6: openai 의존성 추가**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template/web"
npm install openai
```
Expected: `added N packages`, `web/package.json`의 dependencies에 `openai` 추가됨

- [ ] **Step 7: 타입체크/빌드 검증**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
npm --prefix web run build 2>&1 | tail -20
```
Expected: 빌드 성공(에러 없음). `app/api/llm` route가 빌드 출력에 포함.

- [ ] **Step 8: 런타임 스모크 — fixture 폴백 (키 없이)**

Run (별도 터미널에서 dev 서버를 띄운 뒤):
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
npm --prefix web run dev &
sleep 8
curl -s -X POST http://localhost:3000/api/llm -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"안녕"}]}'
echo
kill %1 2>/dev/null
```
Expected: `{"text":"[fixture 응답 — LLM 키 없음] 입력 요약: 안녕","provider":"fixture"}` (키가 없으므로 fixture)

> dev 서버 백그라운드 실행이 불편하면 Step 7의 build 통과를 하드 게이트로 삼고 이 스모크는 수동 확인으로 대체 가능.

- [ ] **Step 9: 키표/문서 OpenAI 기준 갱신**

`README.md` §1의 키 표에서 "LLM API 키" 행을 다음으로 교체:

```markdown
| OpenAI API 키 (`OPENAI_API_KEY`) | 앱이 런타임에 LLM을 호출할 때. 기본 provider는 OpenAI(ChatGPT). 없으면 fixture로 폴백. `LLM_PROVIDER`로 교체 가능 |
```

그리고 `docs/kit-assets.md`에 LLM 키/provider 언급이 있으면 OpenAI 기준으로 맞춘다(없으면 생략).

- [ ] **Step 10: 커밋**

```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git add web/lib/llm web/app/api/llm web/package.json web/package-lock.json README.md docs/kit-assets.md
git commit -m "feat(web): OpenAI 기본 LLM 스캐폴드 (provider 추상화 + fixture 폴백 + API route)"
```

---

## Task 6: 복지 혜택 전수 데이터 파이프라인

**Files:**
- Create: `data/welfare/benefits/schema/benefit.schema.json`
- Create: `data/welfare/benefits/fetch.mjs`
- Create: `data/welfare/benefits/normalize.mjs`
- Create: `data/welfare/benefits/README.md`
- Modify: `.gitignore`

> 전제: data.go.kr 공공서비스(혜택) 정보 API(15113968) 서비스키를 `web/.env.local`의
> `DATA_GO_KR_KEY`에 둔다(채팅에 노출 금지). 표준 스키마는 `docs/welfare-benefit-dataset-prep.md` §2의 `Benefit` 타입을 따른다.

- [ ] **Step 1: 표준 스키마 파일**

`data/welfare/benefits/schema/benefit.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Benefit",
  "type": "object",
  "required": ["id", "title", "provider", "sourceName", "sourceUrl", "asOf"],
  "properties": {
    "id": { "type": "string" },
    "title": { "type": "string" },
    "provider": { "type": "string" },
    "category": { "type": "string" },
    "targetText": { "type": "string" },
    "targetTags": { "type": "array", "items": { "type": "string" } },
    "regionTags": { "type": "array", "items": { "type": "string" } },
    "lifeEventTags": { "type": "array", "items": { "type": "string" } },
    "eligibilityText": { "type": "string" },
    "supportText": { "type": "string" },
    "applicationText": { "type": "string" },
    "deadlineText": { "type": "string" },
    "onlineUrl": { "type": "string" },
    "contactText": { "type": "string" },
    "sourceName": { "type": "string" },
    "sourceUrl": { "type": "string" },
    "license": { "type": "string" },
    "asOf": { "type": "string" }
  }
}
```

- [ ] **Step 2: 전수 fetch 스크립트**

`data/welfare/benefits/fetch.mjs`:

```js
// data/welfare/benefits/fetch.mjs
// 행정안전부_대한민국 공공서비스(혜택) 정보 API(15113968) 전수 호출 → raw/ 저장.
// 키: web/.env.local 의 DATA_GO_KR_KEY (채팅에 노출 금지).
// 사용: node data/welfare/benefits/fetch.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, "raw", "public-service-benefits.json");

// web/.env.local 에서 DATA_GO_KR_KEY 로드 (의존성 없이 직접 파싱)
function loadKey() {
  if (process.env.DATA_GO_KR_KEY) return process.env.DATA_GO_KR_KEY;
  const envPath = join(HERE, "..", "..", "..", "web", ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*DATA_GO_KR_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

// 실제 엔드포인트/파라미터는 활용신청 후 받은 명세에 맞춘다.
// 아래는 공공서비스 목록 조회의 일반형(서비스명/파라미터는 명세로 확정).
const BASE = process.env.DATA_GO_KR_BENEFITS_URL
  ?? "https://api.odcloud.kr/api/15113968/v1/uddi"; // TODO: 명세의 실제 경로로 확정

async function fetchPage(key, page, perPage) {
  const url = `${BASE}?page=${page}&perPage=${perPage}&serviceKey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} @ page ${page}`);
  return res.json();
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error("DATA_GO_KR_KEY 없음 — web/.env.local 에 키를 넣으세요(채팅에 노출 금지).");
    process.exit(1);
  }
  const perPage = 1000;
  let page = 1;
  const all = [];
  // 전수: totalCount 까지 페이지네이션
  // 첫 페이지로 totalCount 파악 후 끝까지 반복
  // (응답 필드명은 명세에 따라 data/totalCount 등으로 다를 수 있음)
  while (true) {
    const body = await fetchPage(key, page, perPage);
    const rows = body.data ?? body.items ?? [];
    all.push(...rows);
    const total = body.totalCount ?? body.matchCount ?? all.length;
    console.log(`page ${page}: +${rows.length} (누적 ${all.length} / 총 ${total})`);
    if (rows.length === 0 || all.length >= total) break;
    page++;
  }
  mkdirSync(dirname(RAW), { recursive: true });
  writeFileSync(RAW, JSON.stringify({ retrievedAt: new Date().toISOString(), count: all.length, data: all }, null, 2));
  console.log(`\n전수 저장: ${RAW} (${all.length}건)`);
}

main().catch((e) => { console.error("fetch 실패:", e.message); process.exit(1); });
```

> 주의: `BASE` 경로와 응답 필드명은 활용신청 후 받은 **실제 명세**로 확정해야 한다(주석의 TODO). 명세 확인 전에는 전수 적재가 실패할 수 있으므로, 키 투입 시점에 명세를 함께 반영한다.

- [ ] **Step 3: 정규화 스크립트**

`data/welfare/benefits/normalize.mjs`:

```js
// data/welfare/benefits/normalize.mjs
// raw/public-service-benefits.json → 표준 Benefit[] → normalized/benefits.full.json
// 사용: node data/welfare/benefits/normalize.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, "raw", "public-service-benefits.json");
const OUT = join(HERE, "normalized", "benefits.full.json");

const str = (v) => (v == null ? "" : String(v).trim());
const tags = (v) => str(v).split(/[,/;]/).map((s) => s.trim()).filter(Boolean);

// 원본 필드명은 명세에 맞춰 매핑한다(아래 키는 흔한 후보; 명세 확인 후 확정).
function toBenefit(row, i) {
  return {
    id: str(row.servId ?? row.SVC_ID ?? row.id ?? `benefit-${i}`),
    title: str(row.servNm ?? row.SVC_NM ?? row.title),
    provider: str(row.jurMnofNm ?? row.provider ?? "행정안전부"),
    category: str(row.servDgst ?? row.category),
    targetText: str(row.sprtTrgtCn ?? row.targetText),
    targetTags: tags(row.trgterIndvdlArray ?? row.targetTags),
    regionTags: tags(row.ctpvNm ?? row.regionTags),
    lifeEventTags: tags(row.lifeArray ?? row.lifeEventTags),
    eligibilityText: str(row.slctCritCn ?? row.eligibilityText),
    supportText: str(row.alwServCn ?? row.supportText),
    applicationText: str(row.aplyMtdCn ?? row.applicationText),
    deadlineText: str(row.enfcBgngYmd ?? row.deadlineText) || undefined,
    onlineUrl: str(row.servDtlLink ?? row.onlineUrl) || undefined,
    contactText: str(row.rprsCtadr ?? row.contactText) || undefined,
    sourceName: "행정안전부_대한민국 공공서비스(혜택) 정보",
    sourceUrl: "https://www.data.go.kr/data/15113968/openapi.do",
    license: "이용허락범위 제한 없음",
    asOf: new Date().toISOString().slice(0, 10),
  };
}

function main() {
  if (!existsSync(RAW)) {
    console.error(`raw 없음: ${RAW} — 먼저 fetch.mjs 를 실행하세요.`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(RAW, "utf8"));
  const rows = raw.data ?? raw.items ?? [];
  const benefits = rows.map(toBenefit);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(benefits, null, 2));
  console.log(`정규화 완료: ${OUT} (${benefits.length}건)`);
}

main();
```

- [ ] **Step 4: 폴더 README + .gitignore**

`data/welfare/benefits/README.md`:

```markdown
# 복지 혜택 전수 데이터

행정안전부_대한민국 공공서비스(혜택) 정보 API(15113968) 전수 적재.

## 절차
1. `web/.env.local` 에 `DATA_GO_KR_KEY=<서비스키>` (커밋 금지).
2. 활용신청 후 받은 명세로 `fetch.mjs` 의 `BASE`·응답 필드, `normalize.mjs` 의 매핑을 확정.
3. `node data/welfare/benefits/fetch.mjs` → `raw/public-service-benefits.json` (전수).
4. `node data/welfare/benefits/normalize.mjs` → `normalized/benefits.full.json` (표준 Benefit[]).
5. 앱에서 쓰려면 `normalized/benefits.full.json` 을 `web/public/data/welfare/` 로 복사.

## 출처
- https://www.data.go.kr/data/15113968/openapi.do (이용허락범위 제한 없음)
- 전수 데이터는 공개 데이터의 사전 준비로 허용됨. 완성형 미션 답안 서비스는 당일 조립.
```

`.gitignore`에 다음 추가(전수 raw는 재생성 가능하므로 로컬만; 정규화 full은 크기 보고 결정 — 기본은 무시):

```gitignore
# 복지 혜택 전수 데이터 (재생성 가능, 용량 큼 — 로컬만)
data/welfare/benefits/raw/
data/welfare/benefits/normalized/benefits.full.json
```

- [ ] **Step 5: 정규화 기능 검증 (샘플 raw로)**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
mkdir -p data/welfare/benefits/raw
cat > data/welfare/benefits/raw/public-service-benefits.json <<'JSON'
{ "count": 1, "data": [ { "servId": "S1", "servNm": "청년 월세 지원", "jurMnofNm": "국토부", "sprtTrgtCn": "만 19~34세", "ctpvNm": "서울,경기" } ] }
JSON
node data/welfare/benefits/normalize.mjs
node -e "const b=require('./data/welfare/benefits/normalized/benefits.full.json'); console.log(JSON.stringify(b[0],null,2)); if(b[0].id!=='S1'||b[0].title!=='청년 월세 지원'||!Array.isArray(b[0].regionTags)) {console.error('FAIL'); process.exit(1)} else console.log('PASS')"
```
Expected: 정규화된 Benefit 객체 출력 + 마지막 줄 `PASS` (id=S1, title=청년 월세 지원, regionTags=["서울","경기"])

- [ ] **Step 6: 검증용 샘플 정리**

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
rm -rf data/welfare/benefits/raw data/welfare/benefits/normalized
```
Expected: 검증 산물 제거(.gitignore로 어차피 추적 안 됨)

- [ ] **Step 7: 커밋 (스크립트·스키마·README만, 데이터 산물 제외)**

```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
git add data/welfare/benefits/fetch.mjs data/welfare/benefits/normalize.mjs data/welfare/benefits/schema/benefit.schema.json data/welfare/benefits/README.md .gitignore
git commit -m "feat(data): 복지 혜택 전수 적재 파이프라인 (fetch + normalize + 표준 스키마)"
```

- [ ] **Step 8: (키 투입 후) 전수 적재 — 사용자 협의 단계**

> 이 단계는 사용자가 `web/.env.local`에 `DATA_GO_KR_KEY`를 넣고, 활용신청 명세로 `fetch.mjs`의 `BASE`/필드를 확정한 뒤 실행한다.

Run:
```bash
cd "C:/Users/Jond Doe/Desktop/hackathon/template"
node data/welfare/benefits/fetch.mjs
node data/welfare/benefits/normalize.mjs
ls -lh data/welfare/benefits/normalized/benefits.full.json
```
Expected: 전수 건수 출력 + `benefits.full.json` 생성. **크기 확인 후** 저장소 커밋 여부를 사용자와 결정(기본: gitignore 유지, 로컬/web public 복사로 사용).

---

## Self-Review (작성자 점검 결과)

**Spec coverage:**
- §1 단계 멈춤 → Task 1 ✓
- §2 비동기 에이전트 → Task 2 ✓
- §3 전수 방향성 → Task 3 ✓
- §4-A OpenAI 스캐폴드 → Task 5 ✓
- §4-B 복지 전수 데이터 → Task 6 ✓
- §5 배너 검토 → Task 4 ✓
- §6 구현 순서 → Task 1→2→3→4→5→6 순서 일치 ✓
- §7 비범위(멀티 프로바이더·배너 구현·완성형 서비스) → 계획에 포함 안 함 ✓

**Placeholder scan:** fetch.mjs의 `BASE`/필드 매핑 TODO는 "외부 명세에 의존"하는 본질적 미확정이며, Step 8에서 사용자 키·명세 투입 시 확정하도록 명시함(임의 플레이스홀더 아님).

**Type consistency:** `LlmProvider.complete()` 시그니처가 fixture/openai/route/index에서 일치. `Benefit` 필드가 schema/normalize에서 일치. `awaiting_direction` 문자열이 lib/complete/next/resume에서 일치.
