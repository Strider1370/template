# 한국 공공 서비스 해커톤 스타터 키트

> **4시간 AI 해커톤**에서 새 주제를 받자마자 "데모가 확실히 돌아가는" 결과물 + 발표까지 만들기 위한 출발점.
> 두 가지가 한 묶음으로 들어있다 — ① AI 에이전트와 함께 일하는 **단계 기반 워크플로우 엔진**, ② 매번 새로 만들 필요 없는 **검증된 키트 자산**(Next.js+KRDS 스택, 공공데이터, 발표 생성 파이프라인).

이 문서는 **처음 보는 사람이 이 저장소가 무엇이고 어떻게 굴러가는지** 이해하도록 쓴 안내서다. 깊은 운영 지침은 `CLAUDE.md`(AI용 라우터)와 `docs/`에 있고, 여기서는 큰 그림과 사용법을 설명한다.

---

## 1. 왜 "워크플로우 엔진"인가 (핵심 발상)

4시간 동안 AI와 같이 개발하면 **길을 잃기 쉽다.** 한 번에 전부 하려다 데모도 발표도 어정쩡해지는 게 흔한 실패다. 이 키트의 해법은 단순하다:

- 전 과정을 **13개 단계(Stage)로 쪼갠다.** 각 단계는 "**현재 단계 지침만 읽고 → 그 단계 작업만 하고 → Gate(검증)를 실제로 통과하고 → 다음으로**"만 진행한다. 미리 앞 단계를 당겨오지 않는다.
- **현재 위치는 항상 `workflow/state.yaml`이 말해준다.** 사람이 기억하거나 추측할 필요가 없다. 새 세션 AI도 이 파일을 읽고 이어간다.
- **`CLAUDE.md`가 라우터다.** AI는 작업 시작 시 이 파일을 먼저 읽고, `state.yaml`이 가리키는 현재 단계 문서로 이동한다.

즉 이 저장소는 단순한 코드 모음이 아니라 **"무엇을 언제 할지 강제하는 작은 엔진"**이다. 시간이 부족하면 단계를 건너뛰는 게 아니라 **기능 범위를 줄인다** — 데모와 발표 품질은 끝까지 지킨다.

---

## 2. 전체 그림

```
CLAUDE.md  ──(라우터: 먼저 읽음)
   │
   ├─▶ workflow/state.yaml   ← "지금 몇 단계 / 무슨 상태인가" (머신이 읽는 현재 위치)
   │
   ├─▶ workflow/stages.yaml  ← 각 단계의 지침파일·읽을 섹션·Gate 명령 매핑
   │
   └─▶ workflow/stages/NN-*.md  ← 현재 단계의 상세 지침(이것만 읽음)

작업하며 채워지는 "계약서"(항상 최신 유지):
  concept.md   북극성 — 한 문장 피치·Wow·마지막 문장 (Stage 02 산출물, 03·05·08의 기준선)
  spec.md      데모 약속 — 시나리오·Wow Moment (Stage 03)
  plan.md      구현 체크리스트 — 작업분해·폴백·파일 소유권 (Stage 04)
  implementation/manifest.json   실제로 만든 기능(발표는 이걸 기준으로만 말함)
  PROGRESS.md  사람용 요약 — "현재 / 다음 / 막힘"
  workflow/history/   단계별 Handoff(세션 인수인계 기록)
```

각 문서는 **역할이 다르다(중복 금지):** `concept`=불변 방향 · `spec`=데모 약속 · `plan`=구현 체크리스트 · `manifest`=실제 만든 것. 같은 사실을 여러 파일에 늘여 쓰지 않는다.

---

## 3. 13단계 워크플로우 (총 230분 + 버퍼 10)

```
00 intake → 01 리서치 → 02 인사이트선택·승인 → 03 spec → 04 plan
→ 05 병렬구현 → 06 통합 → 07 데모검증 → 08 스크립트 → 09 발표생성
→ 10 발표검증 → 11 리허설·승인 → 12 패키지
```

| # | 단계 | 하는 일 | 주요 산출물 | Gate 종류 |
|---|---|---|---|---|
| 00 | intake | 주제·제약 파악, 환경 점검 | state 초기화 | 체크리스트 |
| 01 | 리서치 | **병렬 서브에이전트**로 탐색(폭=품질) | `research/` 보고서 | 체크리스트 |
| 02 | 인사이트 선택 | 브레인스토밍 → 방향 확정 | **`concept.md`** | 체크리스트 · **🙋 사용자 승인** |
| 03 | spec | 데모 시나리오·Wow Moment | `spec.md` | **실행(enforced)** |
| 04 | plan | 작업분해·폴백·파일 소유권 | `plan.md` | 체크리스트 |
| 05 | 병렬 구현 | 기능 구현(범위 맞춰 병렬) | `web/` 코드 · manifest | **실행(build)** |
| 06 | 통합 | 합치고 깨진 곳 수정 | 통합된 앱 | 체크리스트 |
| 07 | 데모 검증 | 데모가 실제로 도는지 확인 | 시나리오 + 스크린샷 | **실행(demo)** |
| 08 | 스크립트 | 발표 대본·Q&A | `presentation/script.md` | 체크리스트 |
| 09 | 발표 생성 | `deck.json` → 슬라이드 렌더 | Slidev + Notion HTML | **실행(generation)** |
| 10 | 발표 검증 | 캡처 보고 시각 결함 점검 | 캡처 + 리포트 | **실행(visual)** |
| 11 | 리허설 | 시간 맞춰 리허설 | 최종 점검 | 체크리스트 · **🙋 사용자 승인** |
| 12 | 패키지 | 제출물 정리(출처·라이선스) | 제출 패키지 | 체크리스트 |

- **🙋 사용자 승인 단계(02·11):** AI가 임의로 정하지 않고 **멈춰서** 사람의 승인을 받는다. 승인 전엔 확정 파일을 만들지 않는다.
- **실행 Gate(실제 로직으로 검사):** spec · build · demo · presentation-generation · presentation-visual. 나머지는 "필수 파일 존재 + 자가점검" 체크리스트.
- **교차검토(LLM Review):** `npm run cross-review -- <대상>` — 다른 AI 리뷰어가 산출물을 본다.

---

## 4. 어떻게 사용하나 (실전 루프)

### 시작
```bash
npm install                 # 루트 = 워크플로우 도구(의존성 거의 없음)
npm run workflow:status     # 지금 몇 단계인지 요약
```

### 한 단계 도는 법 (매 단계 반복)
1. **`CLAUDE.md` 읽기** → `state.yaml`의 `current.stageId` 확인
2. **현재 단계 문서**(`workflow/stages/NN-*.md`)와 그 안에서 "반드시 읽을 파일"만 읽기 (그 외엔 읽지 않는다 — 컨텍스트 절약)
3. 필요하면 **서브에이전트 병렬 실행**(작업 계약 = `workflow/templates/agent-task.yaml`)
4. 산출물 통합 → **Gate 실제 실행**: `npm run gate:<stage>`
5. 통과 시 **Handoff 자동 생성**: `npm run workflow:handoff` (시간·파일·커밋·게이트를 기계가 채움) → 사람은 "결정/위험" 1~2줄만 보강 → `npm run workflow:complete`
6. 실패 시 다음으로 가지 말고 원인·폴백 보고: `npm run workflow:fail "<사유>"`

### 새 세션 복원
```bash
npm run workflow:resume     # 현재 단계 + 다음 행동을 알려줌
```
이전 대화를 추측하지 말고 **`state.yaml` + 최신 Handoff**로 복원한다.

### 워크플로우 명령어 한눈에
| 명령 | 용도 |
|---|---|
| `npm run workflow:status` | 현재 단계/상태 요약 |
| `npm run workflow:start` | 단계 시작(상태 전환) |
| `npm run workflow:handoff` | Handoff 자동 생성 |
| `npm run workflow:complete` | 단계 완료 처리 |
| `npm run workflow:approve` | 승인 단계 승인 기록 |
| `npm run workflow:fail "<사유>"` | 단계 실패 기록 |
| `npm run workflow:resume` | 새 세션 복원 |
| `npm run gate:<stage>` | 해당 단계 Gate 실행 |
| `npm run cross-review -- <대상>` | LLM 교차검토 |

### 운영 모드 (`state.yaml.workflowMode`)
- `run` — 해커톤 주제를 Stage 00~12로 실행 (**기본**)
- `bootstrap` — 엔진/템플릿/단계문서 자체를 설치·수정
- `maintenance` — 엔진 일부만 수정, 해커톤 단계 자동 진행 금지

---

## 5. 발표 생성 파이프라인 (Stage 08~10)

발표는 **`presentation/deck.json` 한 파일**에서 두 엔진으로 동시에 렌더된다.

```
script.md ─▶ deck.json(판단=AI가 직접 작성) ─┬─▶ Slidev  (기본 = 실제 발표 매체)
                                              └─▶ Notion 정적 HTML (오프라인 백업)
```

- **엔진:** Slidev가 **기본**(`meta.engine=slidev`), Notion 단일 HTML이 폴백. 실제 발표는 `slidev` 프리뷰(localhost)로 한다.
- **레이아웃:** BaizeAI/talks(Apache-2.0)의 카드 언어를 이식한 **16개 semantic 레이아웃**(hero·contrast·card-grid·architecture·big-number·closing 등). AI는 `semanticLayout`을 16개 중에서만 고른다(임의 생성 금지).
- **편집 오버레이 (사람이 손쉽게 수정):** Slidev·Notion 둘 다 URL에 **`?edit=1`**(또는 `e` 키)를 붙이면 켜진다 — 칸마다 번호·주소(`slide-04.content.callout`) 배지, 클릭=주소복사, 가독성/오버플로우 경고, 자산상태, 편집맵 내보내기. **주소 규약을 두 엔진이 공유**하므로, "그 주소 칸을 고쳐줘"라고 지목하면 `deck.json`의 그 필드만 고치고 다시 렌더한다. 발표 모드(쿼리 없음)에선 완전히 비활성.
- **크기 조정:** 슬라이드별 `contentScale`(0.5~2)로 본문을 키우거나 줄인다(여백 많으면 키우고, 넘치면 줄인다).

### 발표 명령어
| 명령 | 용도 |
|---|---|
| `npm run presentation:build` | deck 검증 → Slidev + Notion 동시 생성 → 정합 검증 (한 번에) |
| `npm run presentation:slidev` | `deck.json` → `slidev/slides.md` |
| `npm run presentation:static` | `deck.json` → Notion 단일 HTML |
| `npm run presentation:capture` | 슬라이드별 PNG 캡처(기본 Slidev, 폴백 Notion) |
| `cd presentation/slidev && npm run build` | 실제 발표용 Slidev 빌드(라이브) |

> 상세는 `workflow/stages/09-*.md`·`10-*.md` 와 `docs/CLAUDE_Notion_Slidev_Integration_Guide.md`.

---

## 6. 키트 자산 (처음부터 만들지 마라)

| 묶음 | 내용 |
|---|---|
| **웹 스택** | `web/` — Next.js 14 + React 18 + TS + Tailwind + KRDS, 셋업 완료(`install`+`build` 통과) |
| **공공데이터** | `data/` — 전국 시도/시군구 경계, 시도→시군구 매핑, 민방위 대피소 약 17,000곳 |
| **디자인** | `design/krds/` — KRDS 공식 토큰(CSS/JSON/Figma) + 정부 엠블럼 |
| **재사용 코드** | 카카오맵 컴포넌트, 위치/거리 유틸, 공공 CSV 변환 스크립트 |
| **참고 완성본** | `examples/disaster-guide/` — 연습 결과물(재난 대비 가이드) 소스 |
| **운영 지침** | `docs/` — 기획 품질 기준 · 발표 생성 가이드 · 엔진 구조 · 도메인 데이터 준비 가이드 |

**무엇이 있고 어떻게 재사용하는지 → `docs/kit-assets.md`** (KRDS 함정·카카오키·`data.go.kr` 차단 대응 포함).

> 주제가 공공/지역 기반이 **아니면**: `CLAUDE.md` 워크플로우 + `web/` 스캐폴드 + 발표 파이프라인만 가져가고, KRDS·공공데이터 묶음은 떼어내면 된다.

### 빠른 시작 (웹)
```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # 빌드 검증
```

---

## 7. 저장소 구조 (어디에 뭐가 있나)

```
CLAUDE.md            ★ AI용 라우터 — 작업 시작 시 먼저 읽음
README.md            이 문서(사람용 안내)
concept.md / spec.md / plan.md / PROGRESS.md   계약서(단계 산출물, 항상 최신)

workflow/            ── 워크플로우 엔진 ──
  state.yaml         현재 단계/상태(머신이 읽는 현재 위치)
  stages.yaml        단계↔지침파일·Gate 매핑
  stages/00..12.md   단계별 상세 지침
  gates/             Gate 검증 스크립트(validate-*.mjs) + cross-review
  scripts/           상태 전환 도구(status/start/complete/handoff/resume/...)
  templates/         작업계약·보고서·결정기록 템플릿
  contracts/         JSON 스키마(agent-task·handoff·state·research)
  history/           단계별 Handoff(인수인계)

presentation/        ── 발표 생성 ──
  deck.json          발표 단일 계약(AI가 작성)
  generator/         deck.json → Slidev/Notion 렌더러 + 검증·캡처
  slidev/            Slidev 프로젝트(global-top.vue 편집 오버레이 포함)
  theme/             Notion 정적 HTML 테마 + 편집 오버레이
  output/            렌더 산출물(빌드 결과)

web/                 Next.js + KRDS 스캐폴드
data/                공공데이터(경계·대피소) + data-sources.md
design/krds/         KRDS 디자인 토큰·엠블럼
docs/                운영 지침 문서
examples/            참고 완성본
implementation/      manifest.json(실제 만든 기능)
```

---

## 8. 꼭 지킬 운영 원칙 (함정 방지)

- **현재 단계 밖의 작업을 미리 하지 마라.** 전체 워크플로우를 한 번에 실행하려 하지 마라.
- **Gate를 실제로 실행하지 않고 완료 처리하지 마라.** 실패를 숨기거나 성공으로 기록하지 마라.
- **사용자 승인 단계(02·11)에서 임의로 선택하지 마라.** 멈추고 물어본다.
- **구현되지 않은 기능을 발표에 넣지 마라**(`implementation/manifest.json` 기준). 근거 없는 수치를 만들지 마라. mocked/fallback을 실시간처럼 표현하지 마라.
- **시간 부족 시 단계를 생략하지 말고 기능 범위를 줄여라.**
- **메인 에이전트 전용 파일**(서브에이전트 수정 금지): `workflow/state.yaml` · `workflow/stages.yaml` · `spec.md` · `plan.md` · `PROGRESS.md` · `README.md` · 루트 `package.json` · 공통 설정/Schema.

### 사람과의 소통 원칙 (보고·승인 요청 시)
결론만 던지지 말고 **무엇을·왜·어떤 선택지가 있고·트레이드오프는 무엇인지**를 초보자에게 설명하듯 풀어 쓴다. 새 제안 앞엔 배경 1~2문장을 붙여, 이전 맥락을 몰라도 이해되게 한다. (단, 기계적 실행 로그까지 장황히 늘이라는 뜻은 아니다 — **판단·결정·보고의 언어**를 쉽게.)

---

## 9. 사전 준비 (대회 전 권장)

- **카카오맵 JS 키** 발급 + 도메인 등록 (지도 쓸 경우 — 당일엔 늦다)
- 필요할 법한 **공공데이터 미리 신청** — `data/data-sources.md` 참고 (`data.go.kr` 차단 환경 대비)
- 복지·혜택 주제 가능성이 있으면 `docs/welfare-benefit-dataset-prep.md`의 데이터 후보·스키마 미리 확인
- 키(`.env.local`)는 저장소에 커밋하지 않는다

---

## 10. 라이선스 / 출처

KRDS 이용약관 · `@krds-ui/core`(Apache-2.0) · 공공데이터포털 · 발표 엔진은 BaizeAI/talks(Apache-2.0) 카드 언어 이식.
상세는 `design/krds/SOURCE.md`, `data/data-sources.md`, `presentation/sources/`.
