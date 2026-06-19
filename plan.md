# plan.md — 구현 계획

> **Stage 04 산출물.** spec.md를 *어떻게 만드는가*로 분해. 각 작업에 폴백 미리 확정.
> 파일 소유권 확정본은 `workflow/decisions/file-ownership.yaml`. Stage 05 Agent Task 계약은 §7.

## 1. 기술 스택 결정
- **`web/` 스캐폴드 그대로** (Next.js 14 App Router + React 18 + TS + Tailwind 3 + `@krds-ui/core`). install·build 통과 확인됨 → init 생략.
- **새 의존성 0.** Anthropic 호출은 SDK 대신 **서버 라우트에서 `fetch`로 직접 호출** → `web/package.json` 변경 불필요(병렬 빌드 충돌 방지).
- **단일 페이지 + 클라이언트 상태** (`web/app/page.tsx`를 `"use client"`). 입력(주차 슬라이더/지역)이 바뀌면 **클라이언트에서 즉시 재정렬** → Wow(라이브 재정렬+손실경고)가 네트워크 없이 동작.

## 2. 작업 분해 + 구현 순서
> 데모 핵심 경로(spec §8의 1→3)를 **먼저 끝까지** 연결. 곁가지(지도·실 AI)는 그 다음.

| # | 작업 | 산출물 | 담당 | 폴백 (시간 내 안 되면) |
|---|---|---|---|---|
| 1 | **제도 데이터셋 + 시간축/정렬 로직** (크리티컬 패스) | `web/public/data/benefits/benefits.json`, `web/lib/timeline.ts`, `web/lib/benefits.ts` | Data | 제도 6건 → 절벽 4건으로 축소. 로직은 순수함수라 폴백 불필요 |
| 2 | **입력 폼 + 결과 타임라인 화면** (Wow) | `web/app/page.tsx`, `web/components/InputForm.tsx`, `BenefitTimeline.tsx`, `BenefitCard.tsx`, `DeadlineWarning.tsx` | UI | 지역 셀렉터는 `regions.ts` 재사용. 슬라이더 안 되면 주차 입력 number로 |
| 3 | **AI 브리핑 + 자격 Q&A**(본질 1장면) | `web/app/api/ask/route.ts`, `web/lib/ai.ts`, `web/public/data/ai-fixtures/qa.json` | AI | 키 없으면 규칙 기반 브리핑 + **사전생성 Q&A fixture로 항상 표시(cut 금지)** |
| 4 | (곁가지) 가까운 시설 지도 | `web/components/FacilityMap.tsx`(기존 `KakaoMap.tsx` 래핑), `web/app/api/places/route.ts` | AI(프록시)+UI(표시) | 카카오 REST 키 없으면 고정 `facilities/*.json` 목록 + 지도 fallback |

**순서**: 1(데이터/로직) → 2(화면, 핵심 경로 완성) → 3(AI, 본질 장면) → 4(지도, 가산점). 1·2·3은 계약 고정 후 **병렬 가능**.
- **빌드 순서(중요)**: `web/lib/benefits.ts` 타입은 Data Agent 소유 → ui/ai의 통합 `npm run web:build` 검증은 **Data의 타입 확정(체크포인트1) 이후**에 한다. (잠금계약에 타입 전문이 있어 작성은 병렬 가능하나, 통합 빌드는 data 선행.) 디스패치 시 강제.
- **곁가지 컷 라인(시간 부족 시 자르는 순서)**: ① 작업4 지도(FacilityMap, ui 핵심 60분에서 분리·1순위 컷) → ② 보조 제도 2건(6→절벽 4건) → ③ 주차 슬라이더를 number 입력으로. 핵심 경로(입력→정렬→Wow)와 AI 본질 장면은 **컷 금지**.

### 잠금 계약 (병렬 빌드가 어긋나지 않도록 — 모든 에이전트가 읽음)
- **`Benefit` 타입(`web/lib/benefits.ts`)** — feasibility §7 스키마 기준:
  ```ts
  type Phase = "pregnancy" | "near_due" | "after_birth" | "infant";
  type Anchor = "pregnancy_week" | "due_date" | "birth";
  interface Benefit {
    id: string; name: string; category: "현금성"|"의료비"|"서비스"|"현물";
    phase: Phase;
    window: { anchor: Anchor; startOffsetDays: number|null; endOffsetDays: number|null;
              pregnancyWeekFrom: number|null; pregnancyWeekTo: number|null;
              deadlineOffsetDays: number|null; }; // deadlineOffsetDays = 소급/마감 절벽(있으면 손실경고)
    amount: { type: "lump"|"monthly"|"voucher"|"in_kind"; value: number|null; unit: "KRW"; note: string; verified: boolean; };
    eligibility: { summary: string; incomeLimit: string|null; conditions: string[]; };
    apply: { channels: string[]; url: string; deadlineNote: string; };
    regionVaries: boolean; source: string; priorityScore: number;
  }
  // status(t) → "now" | "soon" | "past"; deadlineDday(t) → number|null
  ```
- **testid 계약** (plan = spec §9·demo의 **상위집합**): 검증 필수 = `timeline-badge`·`benefit-timeline`·`benefits-now`·`deadline-warning`·`ai-answer`(+ `.benefit-card` class). plan 전용 추가(구현 편의) = `benefits-soon`·`ask-input`. 필수 5종은 spec §9·demo와 글자까지 동일해야 함.
- **AI fixture 형태**(`ai-fixtures/qa.json`): `[{ q: string, matchKeywords: string[], answerBenefitIds: string[], answer: string }]` — 키 없을 때 키워드 매칭으로 답.
- **AI API 계약**: `POST /api/ask { weeks:number, region:string, question?:string }` → `{ answer:string, benefitIds:string[], source:"llm"|"fallback" }`.

## 3. 데이터 연결 계획 (실시간 → 정적 폴백)
| 데이터 | 출처 | 실시간/정적 | 폴백(정적 백업) | 확보 상태 |
|---|---|---|---|---|
| 정부 지원 제도 6건 | `research/verified-figures.md`(정부 1차출처 검증) | **정적(고정 JSON)** | 해당 없음(원래 정적) | 검증 완료 → 제작만 |
| 시간축 정렬 | 입력값 계산 | 정적(순수함수) | — | — |
| AI 브리핑/Q&A | Anthropic API(fetch) | 실시간 | **규칙 브리핑 + qa.json fixture** | 키는 사용자 준비 |
| 가까운 시설 | 카카오 로컬 REST(`/api/places` 프록시) | 실시간 | **고정 `facilities/<시도>.json`** | 키는 사용자 준비 |
| 지역(시도/시군구) | `web/lib/regions.ts` | 정적 | — | **재사용(있음)** |

> ⚠️ `data.go.kr`/`safetydata.go.kr` 403 → 새 공공데이터 안 받음. 제도 데이터는 검증된 고정 JSON으로 충분.
> ⚠️ **데이터셋 정정 필수**: 아동수당 **9세 미만**(0~107개월)+비수도권 월3만원 / 다태아 진료비 **태아당 100만원**(쌍둥이 ≈200만원). `verified-figures.md`가 단일 진실.

## 4. 파일 소유권 (Ownership)
### 메인 에이전트 전용 (서브에이전트 수정 금지)
- `workflow/state.yaml`, `workflow/stages.yaml`, `spec.md`, `plan.md`, `concept.md`, `PROGRESS.md`, `README.md`
- 루트 `package.json`, **`web/package.json`**(의존성 변경 차단), `web/tailwind.config.ts`
- `web/app/layout.tsx`, `web/app/globals.css` (공통 레이아웃/스타일)
- `web/components/Header.tsx`, `web/components/Footer.tsx`, `web/components/KakaoMap.tsx`, `web/lib/regions.ts`, `web/lib/shelters.ts` (재사용 자산 — **읽기 전용**, 새로 만들지 말 것)

### 에이전트별 소유 경로
| Agent | 쓰기 허용(write) | 읽기(read) | 쓰기 금지 |
|---|---|---|---|
| Data | `web/lib/benefits.ts`, `web/lib/timeline.ts`, `web/public/data/benefits/`, `web/public/data/facilities/` | spec.md, plan.md, research/verified-figures.md, research/feasibility.md | 메인 전용·UI/AI 경로 |
| UI | `web/app/page.tsx`, `web/components/InputForm.tsx`, `web/components/BenefitTimeline.tsx`, `web/components/BenefitCard.tsx`, `web/components/DeadlineWarning.tsx`, `web/components/FacilityMap.tsx` | spec.md, plan.md, demo/demo.scenario.yaml, web/lib/benefits.ts(타입), web/lib/regions.ts, web/components/KakaoMap.tsx | 메인 전용·lib 로직·api |
| AI | `web/app/api/ask/route.ts`, `web/app/api/places/route.ts`, `web/lib/ai.ts`, `web/public/data/ai-fixtures/` | spec.md, plan.md, web/lib/benefits.ts(타입), research/verified-figures.md | 메인 전용·UI/Data 경로 |

→ 경로 교집합 0. 공유는 **읽기 전용 계약**(benefits.ts 타입, testid, fixture 형태)으로만.

## 5. 사용자 사전 준비 체크리스트 (사람이 할 일)
- [ ] **카카오 JS 키** 발급 + 도메인 등록(localhost:3000) → `web/.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_KEY` (지도 표시용)
- [ ] **카카오 REST 키** 발급 → `web/.env.local`의 `KAKAO_REST_API_KEY` (서버 전용, `NEXT_PUBLIC_` 금지 — 로컬 키워드 검색용)
- [ ] **`ANTHROPIC_API_KEY`** → `web/.env.local` (AI 브리핑/Q&A용. 없으면 규칙+fixture 폴백)
- [ ] 공공데이터 다운로드: **불필요**(제도 데이터는 검증된 고정 JSON). data.go.kr 403이라 어차피 자동 불가.
- [ ] `web/.env.local.example`에 위 3개 키 키명 추가(메인이 작성) → 사용자가 `.env.local`로 복사
> 키 **셋 다 없어도** 데모 핵심 경로(입력→정렬→Wow)와 AI 본질 장면(fixture)은 동작.

## 6. 체크포인트 계획
(git repo 아님 → 커밋 대신 "동작 상태" 기준 진행. git init 시 아래 지점에서 커밋)
- 체크포인트 1: Data 로직+데이터셋 완성, `npm run web:build` 통과. **(ui/ai 통합 빌드의 선행조건 — 타입 확정)**
- 체크포인트 2: 핵심 경로(입력→정렬→Wow 라이브 재정렬+손실경고) 화면 동작.
- 체크포인트 3: AI 본질 장면(fixture 폴백 포함) 동작 + 통합 빌드 통과.

## 7. Stage 05 Agent Task 계약 (병렬 빌드 입력)
```yaml
# Data Agent
taskId: build-benefits-data
agentRole: data-agent
read: [spec.md, plan.md, research/verified-figures.md, research/feasibility.md]
write: [web/lib/benefits.ts, web/lib/timeline.ts, web/public/data/benefits/, web/public/data/facilities/]
doNotWrite: [메인 전용 전체, web/app/, web/components/, web/lib/ai.ts]
deadlineMinutes: 40
completionCriteria:
  - benefits.json 6건(절벽 4 + 보조 2) — 금액/창/소급 모두 verified-figures.md 값, 정정 2건 반영.
  - timeline.ts: 예정일/주차 → D-day·아기월령 정규화. benefits.ts: status(t)·deadlineDday(t) 순수함수 + 단위테스트 스모크.
  - facilities/서울 등 2~3개 지역 폴백 JSON(Shelter 타입).
  - tsc 타입 오류 0.

# UI Agent
taskId: build-result-ui
agentRole: ui-agent
read: [spec.md, plan.md, demo/demo.scenario.yaml, web/lib/benefits.ts, web/lib/regions.ts]
write: [web/app/page.tsx, web/components/InputForm.tsx, web/components/BenefitTimeline.tsx, web/components/BenefitCard.tsx, web/components/DeadlineWarning.tsx, web/components/FacilityMap.tsx]
doNotWrite: [메인 전용 전체, web/lib/, web/app/api/]
deadlineMinutes: 60
completionCriteria:
  - 입력 폼(주차 슬라이더+지역) → 결과 타임라인. testid 계약대로 data-testid 부여.
  - 슬라이더 변경 시 클라이언트 재정렬 + deadline-warning 점등(텍스트 'D-'+'소멸/마감').
  - KRDS 스타일(함정 주의: Badge는 label prop, Select는 native). fixture 데이터로 정상 렌더.
  - npm run web:build 통과.

# AI Agent
taskId: build-ai-layer
agentRole: ai-agent
read: [spec.md, plan.md, web/lib/benefits.ts, research/verified-figures.md]
write: [web/app/api/ask/route.ts, web/app/api/places/route.ts, web/lib/ai.ts, web/public/data/ai-fixtures/]
doNotWrite: [메인 전용 전체, web/app/page.tsx, web/components/, web/lib/benefits.ts]
deadlineMinutes: 50
completionCriteria:
  - POST /api/ask: 제도 JSON 컨텍스트 주입 + Anthropic fetch 호출(claude-api 스킬 참조, 모델 claude-haiku-4-5 또는 sonnet). system="데이터셋 제도만 근거, 없으면 모른다, 금액은 JSON값 인용".
  - 키 없으면(또는 **5초 타임아웃/실패 시**) 규칙 브리핑 + qa.json fixture로 동일 응답(본질 장면 cut 금지).
  - /api/places: 카카오 KakaoAK 헤더 서버 프록시, 실패 시 facilities/*.json 폴백.
  - 데이터셋 밖 수치 생성 0. npm run web:build 통과.
```
