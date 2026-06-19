# 한국 공공 서비스 해커톤 스타터 키트

4시간 AI 해커톤에서 주제를 받자마자 "돌아가는 데모 + 발표"까지 뽑아내려고 만든 출발점.

크게 두 덩어리.

- **워크플로우 엔진** (`workflow/` + `CLAUDE.md`) — AI와 단계를 끊어가며 일함
- **키트 자산** — Next.js+KRDS 스택, 공공데이터, 발표 생성기. 매번 새로 안 만들어도 됨

---

## 1. 세팅

이 저장소는 독립된 npm 프로젝트 3개 — 루트, `web/`, `presentation/slidev/`. 각각 한 번씩 `npm install`.

폰트·KRDS 토큰·발표 테마는 이미 들어있어서 따로 받을 게 없음. 스크립트는 윈도우·맥·리눅스 어디서나 그대로 돌아감(OS 전용 구문·하드코딩 경로 없음).

**필수 도구**

| 도구 | 요건 |
|---|---|
| Node.js | ≥ 18.18 (권장 20+) |
| Git | 클론·커밋 |
| 브라우저 | Chromium 계열(Chrome/Edge) — 발표·편집 오버레이 |

**설치 (3곳)**

| 위치 | 명령 | 용도 |
|---|---|---|
| 루트 | `npm install` | 워크플로우 엔진 도구 |
| `web/` | `npm install` | Next.js + KRDS 앱 |
| `presentation/slidev/` | `npm install` | 슬라이드 렌더·프리뷰 |

설치하고 `npm run workflow:status`로 지금 단계 확인.

**키 (`.env.local`에만 두고, 커밋 금지)**

| 키 | 언제 필요 |
|---|---|
| 카카오맵 JS 키 | 지도 쓸 때. 도메인 등록까지 해야 해서 대회 전에 미리 |
| data.go.kr 서비스키 | 공공 API 쓸 때. 활용신청도 미리 |
| LLM API 키 | 앱이 런타임에 LLM 부를 때(없으면 fixture로 대체) |

자동 캡처(`npm run presentation:capture`)를 쓰려면 Playwright+Chromium이 따로 필요함.

```bash
npm i -g playwright && npx playwright install chromium
```

안 깔아도 그냥 건너뛰니까 발표엔 지장 없음. 그리고 `data.go.kr`이나 일부 CDN이 막힌 환경이 있어서, 데이터는 항상 fixture(샘플 JSON) 폴백을 깔고 감.

---

## 2. 워크플로우, 한눈에

전 과정을 13단계로 쪼갬. 각 단계가 하는 건 딱 네 가지.

> 현재 단계 지침만 읽기 → 그 단계 일만 하기 → Gate(검증) 통과 → 다음

앞 단계를 미리 당겨와 한 번에 다 하려 들지 않음. 그게 4시간 해커톤이 제일 흔하게 무너지는 지점이라서.

"지금 몇 단계인지"는 사람이 외울 필요 없음. `workflow/state.yaml`이 들고 있고, `CLAUDE.md`(라우터)가 AI를 현재 단계 문서로 보냄.

시간이 모자라면 단계를 건너뛰지 않음. 대신 **만들 기능을 줄임.**

단계마다 채워지는 계약 문서는 역할이 딱 나뉨(같은 내용 중복 금지).

| 파일 | 내용 | 생성 |
|---|---|---|
| `concept.md` | 방향 — 한 문장 피치·Wow·마지막 문장 | Stage 02 |
| `spec.md` | 데모 약속 — 시나리오·Wow Moment | Stage 03 |
| `plan.md` | 구현 체크리스트 — 작업분해·폴백·파일 소유권 | Stage 04 |
| `implementation/manifest.json` | 실제로 만든 기능 — 발표는 이 범위만 말함 | Stage 05 |

---

## 3. 단계별로 무슨 일이 일어나나 (예시 주제)

예시 주제 하나 깔고 봄: **"동네별 폭염 행동 가이드"** (대상: 독거노인·야외근로자).

각 단계의 입력 → 작업 → 결과물.

| # | 단계 | 입력 | 핵심 작업 | 결과물 | Gate |
|---|---|---|---|---|---|
| 00 | intake | 주제·마감·발표시간 | 주제·제약 등록, 키트·네트워크 점검 | `state.yaml` 초기화 | 체크리스트 |
| 01 | 리서치 | 주제 | 서브에이전트 병렬 탐색(아래 3.1) | `research/*.md` + 통합 | 체크리스트 |
| 02 | 인사이트 선택 | 리서치 | 후보 뽑고 방향 합의(아래 3.1) | `concept.md` | 체크리스트 · **승인** |
| 03 | spec | concept | 데모 시나리오 확정(위치 허용 → 위험도 → 행동 3단계 → 가까운 쉼터), Wow Moment 명시 | `spec.md` | **실행** |
| 04 | plan | spec | 작업 쪼개기(지도·위치판정·가이드생성·쉼터매칭), 폴백·소유권 정하기 | `plan.md` | 체크리스트 |
| 05 | 구현 | plan | 기능 구현(독립 파일이면 병렬, 작으면 혼자). 만든 것만 manifest에 기록 | `web/` 코드 · `manifest.json` | **실행(build)** |
| 06 | 통합 | 05 결과 | 합치고 깨진 데 수정 | 돌아가는 앱 | 체크리스트 |
| 07 | 데모 검증 | 앱 | 시나리오대로 실제로 도는지 확인 + 화면 캡처 | 시나리오 통과 · `output/captures/` | **실행(demo)** |
| 08 | 스크립트 | concept·manifest·캡처 | 발표 대본(시간 배분, 데모+킥 ≥50%) + 예상 Q&A | `script.md` · `qna.md` | 체크리스트 |
| 09 | 발표 생성 | script | `deck.json` 쓰고(16 레이아웃에서 선택) → Slidev·Notion 렌더 | `deck.json` · `slides.md` · `presentation.html` | **실행(generation)** |
| 10 | 발표 검증 | 슬라이드 | 캡처 보고 넘침·작은 글씨·시간 점검 → `contentScale` 조정 | 캡처 · `validation-report.md` | **실행(visual)** |
| 11 | 리허설 | 발표물 | 시간 맞춰 돌려보고 최종 점검 | 확정 발표물 | 체크리스트 · **승인** |
| 12 | 패키지 | 전체 | 제출물 정리(출처·라이선스 기록) | 제출 패키지 | 체크리스트 |

- **승인 단계(02·11)** — AI가 멋대로 정하지 않고 멈춰서 사용자 승인을 받음. 승인 전엔 확정 파일을 안 만듦.
- **실행 Gate(03·05·07·09·10)** — 진짜 코드로 검사. 나머지는 "필요한 파일 있나 + 자가점검" 체크리스트.
- **한 단계 도는 법** — 지침 읽기 → (필요하면 서브에이전트 병렬) → 결과 합치기 → `npm run gate:<stage>` → `npm run workflow:handoff` → `npm run workflow:complete`. 막히면 `npm run workflow:fail "<사유>"`. 새 세션은 `npm run workflow:resume`로 이어감.

### 3.1 기획이 제일 중요함 (Stage 01·02)

기능 하나 더 붙인다고 기억에 남지 않음. **문제를 남들과 다르게 보는 것**, 그게 차별화를 만듦. 그래서 리서치·인사이트 두 단계에 특히 공을 들임. (자세한 기준은 `docs/AI_Hackathon_Operating_System.md` §4–5.)

**Stage 01 — 병렬 리서치**

5개 트랙을 서브에이전트가 동시에 파고, 각자 보고서를 남김. 메인이 그걸 합침.

넓게 훑을수록 좋은 인사이트가 나오니까, 이 단계만큼은 혼자 좁게 안 파고 병렬로 감.

| 트랙 | 보는 것 | 결과물 |
|---|---|---|
| A 사용자 문제·JTBD | 사용자·상황·지금 방식이 왜 실패하나·그 비용 | `research/jtbd.md` |
| B 국내 사례 | 이미 있는 기능·공공/민간 차이·사용자 마찰·규제·겹칠 위험 | `research/domestic.md` |
| C 해외 사례 | 실제 사례 3개 이상 + 가져올 수 있는 메커니즘 | `research/overseas.md` |
| D 데이터·구현 현실성 | 쓸 수 있는 데이터·4시간 안에 되나 | `research/feasibility.md` |
| E 심사위원 관점·차별화 | 다들 할 법한 접근·화려하지만 약한 방향·우리 차별점 | `research/judge-review.md` |
| 통합 | 위를 합쳐 결정용 요약 | `research/integrated-findings.md` |

서브에이전트 보고서는 사용자가 직접 열어보게 파일로 남기고, 메인은 합친 요약을 말로 풀어 설명함. (파일만 던지고 끝내지 않음.)

**Stage 02 — 인사이트 고르기 (사용자 승인)**

리서치에서 인사이트 후보를 **5개 이상** 뽑아 평가하고, 쓸 만한 방향 2–3개로 추려 사용자한테 보여줌. 승인된 것만 `concept.md`(북극성)로 확정. 승인 전엔 확정 안 함.

좋은 인사이트는 이런 흐름을 탐.

```text
흔한 전제 → 실제 현실 → 둘 사이 모순 → 관점 재정의
```

폭염 주제로 예를 들면,

```text
전제   : 폭염엔 경보·정보를 더 많이 보내야 한다
현실   : 정보는 이미 넘치는데 독거노인·야외근로자는 정작 안 움직인다
모순   : 같은 경보가 모두를 똑같이 움직이게 하진 못한다
재정의 : 폭염은 '정보 부족'이 아니라 '취약계층이 행동으로 옮기느냐'의 문제다
```

이 재정의 한 줄이 나머지를 다 바꿈 — 타깃, 솔루션, 데모 장면, 발표 메시지까지.

반대로 "AI로 더 편하게", "정보 한곳에 모으기", "맞춤형 서비스" 이런 건 인사이트가 아님. 그냥 솔루션이거나 효과.

후보는 7가지로 따짐 — 새로움·설득력·근거·AI 연결성·시연 가능성·4시간 안에 되나·위험한 전제 없나.

---

## 4. 발표

### 4.1 발표 순서 (실제로 말하는 순서)

심사위원은 30초 안에 판단하고, 우리 발표를 굳이 이해하려 애쓰지 않음. 그래서 **결론부터 던짐.** 결과를 먼저 보여주고, 그다음 문제·인사이트로 "왜 이게 맞는지"를 받쳐주고, 데모로 진짜 된다는 걸 보이고, 마지막 한 문장으로 닫음.

설명을 차곡차곡 쌓아 결론에 도달하는 구조는 안 씀. (`docs/AI_Hackathon_Operating_System.md` §7 기준.)

| 순서 | 비트 | 슬라이드(semantic) |
|---|---|---|
| 1 | **Answer First** — 누구에게 무엇을 어떻게 해결하는지 한 문장 | hero |
| 2 | Problem — 사용자·상황·지금 방식의 실패·그 비용 | problem-flow |
| 3 | Insight — 문제를 다르게 보는 관점 | insight-statement / contrast |
| 4 | Solution — 핵심 기능 | product-overview |
| 5 | **Demo (+ Wow Moment)** — 진짜 돌아간다는 증거 | demo-callout / demo-fullscreen |
| 6 | Mechanism — 어떻게 동작하나 | architecture |
| 7 | Impact — 효과(숫자·전후) | big-number / before-after |
| 8 | Limitation / Guardrail — 한계와 안전장치 | limitation-guardrail |
| 9 | Expansion — 확장 방향(선택) | expansion-map |
| 10 | **Closing** — 기억에 남을 한 문장 | closing |

**시간 배분 (5분 기준):** Answer+Problem 40–50초 · Insight+Solution 40–50초 · **Demo+Wow 최소 2분** · Mechanism 20–30초 · Impact+Guardrail 30–40초 · Closing 15–20초.

원칙 몇 개.

- **결론부터** — 첫 30초에 "왜 필요한지"가 와닿아야 함.
- **데모에 절반 이상** — 결국 "진짜 돌아간다"가 제일 센 설득. Wow 장면은 화면으로 확인되는 거라야 함.
- **만든 것만** — `manifest.json`에 implemented(또는 허용된 mocked/fallback)로 없는 기능은 단정적으로 말하지 않음.
- **한 문장으로 닫기** — Closing은 `concept.md`의 마지막 문장 그대로 씀.

이 10개 비트가 16개 레이아웃과 짝이 맞아서, `deck.json`은 비트에 맞는 레이아웃만 골라 씀.

**생성 예시 (실제 Slidev 출력)**

<img src="docs/images/slide-contrast.png" width="640" alt="contrast 레이아웃">

*문제 vs 해법 비교 — `contrast`. 색 패널로 대비를 보여줌.*

<img src="docs/images/slide-cards.png" width="640" alt="product-overview 레이아웃">

*핵심 기능 — `product-overview`. 카드가 높이를 채워서 화면이 꽉 참.*

<img src="docs/images/slide-edit-overlay.png" width="640" alt="편집 오버레이">

*`?edit=1` 편집 모드 — 칸마다 주소·번호가 뜸. "이 칸(`slide-07.content.callout.0`) 고쳐줘" 하면 그 자리만 고침. placeholder·⚠ 같은 경고도 같이 표시. 발표할 땐 다 사라짐.*

### 4.2 발표는 이렇게 만듦 (Stage 08–10)

- **08 스크립트** — 위 순서대로 대본·시간 배분·예상 Q&A를 먼저 확정. 슬라이드는 이 대본을 그림으로 옮긴 것뿐임.
- **09 생성 — "무엇을 담을지"와 "어떻게 그릴지"를 나눔.**
  - `deck.json` 한 파일만 AI가 씀 → 무엇을 담을지(판단)
  - 렌더는 스크립트가 자동 → 어떻게 그릴지(변환)
  - 같은 `deck.json`에서 결과물 두 개가 한 번에 나옴:
    - **Slidev** — 기본 발표 매체. 라이브 렌더·글로우 배경·클릭 단계.
    - **Notion HTML** — 백업. 파일 하나라 오프라인·네트워크 막힌 데서도 열림.
  - 소스가 하나라 발표물을 두 번 만들 일이 없음.
- **사람이 고칠 땐 편집 오버레이** — 발표 주소 뒤에 `?edit=1`만 붙이면 칸마다 주소·번호가 뜸(위 이미지). 주소로 칸을 짚으면 `deck.json`의 그 필드만 고쳐 다시 그림. Slidev·Notion이 같은 주소를 씀.
- **10 검증 — 캡처 떠서 눈으로 맞춤** — 슬라이드를 PNG로 떠서 글자 넘침·너무 작은 글씨·발표 시간을 보고, `contentScale`(0.5–2)로 키우거나 줄임.

| 명령 | 동작 |
|---|---|
| `npm run presentation:build` | deck 검증 → Slidev·Notion 동시 생성 → 정합 검증 (한 번에) |
| `npm run presentation:capture` | 슬라이드 PNG 캡처(기본 Slidev, 폴백 Notion) |
| `cd presentation/slidev && npm run build` | 발표용 Slidev 빌드 |

---

## 5. 폴더 구조

```
CLAUDE.md          AI용 라우터 — 작업 시작 시 먼저 읽음
concept/spec/plan.md, PROGRESS.md   계약서(단계 결과물)

workflow/          워크플로우 엔진
  state.yaml         지금 단계/상태(머신이 읽는 현재 위치)
  stages.yaml        단계 ↔ 지침파일·Gate 매핑
  stages/00..12.md   단계별 상세 지침
  gates/             Gate 검증 스크립트 + cross-review
  scripts/           상태 전환 도구(status/start/complete/handoff/resume/fail)
  templates/, contracts/, history/, decisions/

presentation/      발표 생성
  deck.json          발표 단일 계약(AI가 작성)
  generator/         deck.json → Slidev/Notion 렌더러·검증·캡처
  slidev/            Slidev 프로젝트(global-top.vue = 편집 오버레이)
  theme/             Notion 정적 HTML 테마 + 편집 오버레이
  output/            렌더 결과물

web/                Next.js + KRDS 스캐폴드
data/               공공데이터(경계·대피소) + data-sources.md
design/krds/        KRDS 디자인 토큰·엠블럼
docs/               운영 지침 문서 + images/
research/           Stage 01 리서치 보고서
examples/           참고 완성본
implementation/     manifest.json(실제 만든 기능)
```

---

## 6. 키트 자산

| 묶음 | 내용 |
|---|---|
| 웹 스택 | `web/` — Next.js 14 + React 18 + TS + Tailwind + KRDS (`install`+`build` 통과) |
| 공공데이터 | `data/` — 전국 시도/시군구 경계, 시도→시군구 매핑, 민방위 대피소 약 17,000곳 |
| 디자인 | `design/krds/` — KRDS 공식 토큰(CSS/JSON/Figma) + 정부 엠블럼 |
| 재사용 코드 | 카카오맵 컴포넌트, 위치/거리 유틸, 공공 CSV 변환 스크립트 |
| 참고 완성본 | `examples/disaster-guide/` — 연습 결과물 소스 |
| 운영 지침 | `docs/` — 기획 품질 기준, 발표 생성 가이드, 엔진 구조, 도메인 데이터 준비 |

재사용법은 `docs/kit-assets.md`에 정리돼 있음 (KRDS 함정, 카카오 키, `data.go.kr` 막힘 대응까지).

주제가 공공·지역이랑 상관없으면 워크플로우 + `web/` 스캐폴드 + 발표 파이프라인만 떼서 쓰고, KRDS·공공데이터는 빼면 됨.

---

## 7. 지킬 것 (자주 하는 실수)

- 현재 단계 밖 일을 미리 당겨 하지 않기. 한 번에 다 하려 들지 않기.
- Gate 안 돌리고 완료 처리하지 않기. 실패를 성공으로 적지 않기.
- 승인 단계(02·11)에서 멋대로 고르지 않기.
- `manifest.json`에 없는 기능을 발표에서 단정하지 않기. 근거 없는 숫자 만들지 않기. mocked/fallback을 실시간인 척하지 않기.
- 시간 모자라면 단계 빼지 말고 기능 범위를 줄이기.
- 메인 전용 파일은 서브에이전트가 못 건드림 — `state.yaml`·`stages.yaml`·`spec.md`·`plan.md`·`PROGRESS.md`·`README.md`·루트 `package.json`·공통 설정/Schema.

---

## 8. 라이선스 / 출처

KRDS 이용약관 · `@krds-ui/core`(Apache-2.0) · 공공데이터포털. 발표 엔진은 BaizeAI/talks(Apache-2.0)의 카드 디자인을 가져옴.

자세한 출처는 `design/krds/SOURCE.md`, `data/data-sources.md`, `presentation/sources/`.
