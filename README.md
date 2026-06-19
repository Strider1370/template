# 한국 공공 서비스 해커톤 스타터 키트

4시간 AI 해커톤에서 주제를 받은 즉시 "데모가 도는 결과물 + 발표"까지 만들기 위한 출발점. 구성은 두 가지다 — ① AI와 단계별로 일하는 **워크플로우 엔진**(`workflow/` + `CLAUDE.md` 라우터), ② 매번 새로 만들지 않는 **키트 자산**(Next.js+KRDS 스택, 공공데이터, 발표 생성 파이프라인).

---

## 1. 세팅

독립된 npm 프로젝트가 3개다. 각각 설치한다. 폰트·KRDS 토큰·발표 테마는 저장소에 포함되어 추가 다운로드가 없다. 모든 스크립트는 Windows·macOS·Linux 공용이다(OS 전용 셸 구문·하드코딩 경로 없음).

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

설치 후 `npm run workflow:status`로 현재 단계를 확인한다.

**키 (`.env.local`에만, 커밋 금지)**

| 키 | 필요 시점 |
|---|---|
| 카카오맵 JS 키 | 지도 사용 시. 도메인 등록 필요 — 대회 전 발급 |
| data.go.kr 서비스키 | 공공 API 사용 시. 활용신청 — 대회 전 신청 |
| LLM API 키 | 앱이 런타임에 LLM 호출 시(없으면 fixture 폴백) |

선택: 슬라이드 자동 캡처(`npm run presentation:capture`)는 Playwright+Chromium이 필요하다(`npm i -g playwright && npx playwright install chromium`). 없으면 오류 없이 건너뛴다. 일부 환경은 `data.go.kr`·일부 CDN이 차단되므로 데이터는 fixture 폴백을 전제한다.

---

## 2. 워크플로우 개념

전 과정을 13단계로 분할한다. 각 단계는 "**현재 단계 지침만 읽고 → 그 단계 작업만 하고 → Gate(검증) 통과 → 다음**"으로만 진행한다. 앞 단계를 미리 당겨오지 않는다. 현재 위치는 `workflow/state.yaml`이 기록하고, `CLAUDE.md`가 라우터로서 AI를 현재 단계 문서(`workflow/stages/NN-*.md`)로 보낸다. 시간이 부족하면 단계를 생략하지 않고 **기능 범위를 줄인다**.

계약 문서는 역할이 분리되어 있다(중복 금지).

| 파일 | 내용 | 생성 |
|---|---|---|
| `concept.md` | 방향 — 한 문장 피치·Wow·마지막 문장 | Stage 02 |
| `spec.md` | 데모 약속 — 시나리오·Wow Moment | Stage 03 |
| `plan.md` | 구현 체크리스트 — 작업분해·폴백·파일 소유권 | Stage 04 |
| `implementation/manifest.json` | 실제 만든 기능 — 발표는 이 범위만 말한다 | Stage 05 |

---

## 3. 단계별 진행 (예시 주제 적용)

가정 주제: **"동네별 폭염 행동 가이드"** (대상: 독거노인·야외근로자). 각 단계의 입력 → 작업 → 산출물은 다음과 같다.

| # | 단계 | 입력 | 핵심 작업 | 산출물 | Gate |
|---|---|---|---|---|---|
| 00 | intake | 주제·마감·발표시간 | 주제·제약 등록, 키트 자산·네트워크 점검 | `state.yaml` 초기화 | 체크리스트 |
| 01 | 리서치 | 주제 | 병렬 서브에이전트로 탐색 — 폭염 피해·통계 / 기존 서비스(재난문자 등) 한계 / 가용 공공데이터 | `research/*.md` + 통합 요약 | 체크리스트 |
| 02 | 인사이트 선택 | 리서치 | 인사이트 후보 도출 → 사용자와 방향 합의 | `concept.md` (피치 = "내 위치 기준 폭염 행동을 한 화면에") | 체크리스트 · **승인** |
| 03 | spec | concept | 데모 시나리오 확정(위치 허용 → 위험도 표시 → 행동 3단계 → 가까운 쉼터), Wow Moment 명시 | `spec.md` | **실행** |
| 04 | plan | spec | 작업 분해(지도·위치판정·가이드생성·쉼터매칭), 폴백·파일 소유권 정의 | `plan.md` | 체크리스트 |
| 05 | 구현 | plan | 기능 구현(독립 파일이면 병렬, 작으면 단독). 만든 것만 manifest에 기록 | `web/` 코드 · `manifest.json` | **실행(build)** |
| 06 | 통합 | 05 산출 | 합치고 깨진 곳 수정 | 동작하는 앱 | 체크리스트 |
| 07 | 데모 검증 | 앱 | 시나리오대로 실제 동작 확인 + 화면 캡처 | 시나리오 통과 · `output/captures/` | **실행(demo)** |
| 08 | 스크립트 | concept·manifest·캡처 | 발표 대본(시간 배분, 데모+킥 ≥50%) + 예상 Q&A 작성 | `script.md` · `qna.md` | 체크리스트 |
| 09 | 발표 생성 | script | `deck.json` 작성(16 레이아웃에서 선택) → Slidev·Notion 렌더 | `deck.json` · `slides.md` · `presentation.html` | **실행(generation)** |
| 10 | 발표 검증 | 슬라이드 | 캡처 보고 overflow·작은 글씨·발표 시간 점검 → `contentScale` 조정 | 캡처 · `validation-report.md` | **실행(visual)** |
| 11 | 리허설 | 발표물 | 시간 맞춰 리허설, 최종 점검 | 확정 발표물 | 체크리스트 · **승인** |
| 12 | 패키지 | 전체 | 제출물 정리(출처·라이선스 기록) | 제출 패키지 | 체크리스트 |

- **승인 단계(02·11):** AI가 임의로 결정하지 않고 멈춰 사용자 승인을 받는다. 승인 전에는 확정 파일을 만들지 않는다.
- **실행 Gate(03·05·07·09·10):** 실제 로직으로 검사한다. 나머지는 필수 파일 존재 + 자가점검 체크리스트다.
- **한 단계 도는 절차:** 지침 읽기 → (필요 시 병렬 서브에이전트) → 산출물 통합 → `npm run gate:<stage>` → `npm run workflow:handoff` → `npm run workflow:complete`. 실패 시 `npm run workflow:fail "<사유>"`. 새 세션은 `npm run workflow:resume`로 복원한다(이전 대화 추측 금지, `state.yaml` + 최신 Handoff로 복원).

---

## 4. 발표

### 4.1 발표 순서 (말하는 순서)

심사위원은 30초 안에 판단하고, 발표를 이해하려고 노력하지 않는다. 따라서 **결과(Answer)를 먼저 던지고**, 그 뒤에 문제·인사이트로 정당화하며, 데모로 작동을 증명하고, 한 문장으로 닫는다. 설명을 쌓아 결론에 도달하는 구조는 쓰지 않는다. 권장 흐름(`docs/AI_Hackathon_Operating_System.md` §7):

| 순서 | 비트 | 슬라이드(semantic) |
|---|---|---|
| 1 | **Answer First** — 누구에게 무엇을 어떻게 해결하는지 한 문장 | hero |
| 2 | Problem — 사용자·상황·현재 방식의 실패·실패 비용 | problem-flow |
| 3 | Insight — 문제를 다르게 보는 관점(reframe) | insight-statement / contrast |
| 4 | Solution — 핵심 기능 | product-overview |
| 5 | **Demo (+ Wow Moment)** — 실제 작동 증거 | demo-callout / demo-fullscreen |
| 6 | Mechanism — 어떻게 동작하는가 | architecture |
| 7 | Impact — 효과(수치·전후) | big-number / before-after |
| 8 | Limitation / Guardrail — 한계와 안전장치 | limitation-guardrail |
| 9 | Expansion — 확장 방향(선택) | expansion-map |
| 10 | **Closing** — 기억에 남을 한 문장 | closing |

**시간 배분(5분 기준):** Answer+Problem 40–50초 · Insight+Solution 40–50초 · **Demo+Wow 최소 2분** · Mechanism 20–30초 · Impact+Guardrail 30–40초 · Closing 15–20초.

원칙:
- **결과 먼저.** 첫 30초에 "왜 필요한지"가 이해되어야 한다.
- **데모에 시간의 절반 이상.** 작동 증거가 설득의 핵심이다. Wow Moment는 화면에서 검증 가능한 형태여야 한다.
- **만든 것만 말한다.** `manifest.json`에서 implemented(또는 허용된 mocked/fallback)가 아닌 기능은 확정적으로 주장하지 않는다.
- **한 문장으로 닫는다.** Closing은 `concept.md`의 마지막 문장을 쓴다.

이 10개 비트가 16개 semantic 레이아웃과 매핑되므로, `deck.json`은 각 비트에 맞는 레이아웃만 고른다.

### 4.2 발표 제작 (Stage 08–10)

- **08 스크립트:** 위 순서대로 대본과 시간 배분, 예상 Q&A를 확정한다. 슬라이드는 이 대본을 시각화한 것일 뿐이다.
- **09 생성 — 판단과 변환을 분리한다.** AI는 `deck.json` 한 파일만 작성하고(무엇을 담을지 = 판단), 렌더는 스크립트가 처리한다(변환). 같은 `deck.json`에서 두 매체가 나온다 — **Slidev(기본 발표 매체, 라이브·글로우·클릭 단계)** 와 **Notion 정적 HTML(백업, 단일 파일이라 오프라인·네트워크 차단에서도 열림)**. 한 소스로 양쪽을 내므로 두 번 만들지 않는다.
- **사람 수정 = 편집 오버레이.** 발표 URL에 `?edit=1`을 붙이면 칸마다 주소(`slide-04.content.callout`)·번호 배지, 가독성 경고, 자산 상태가 표시된다. 주소로 칸을 지목하면 `deck.json`의 그 필드만 고쳐 다시 렌더한다. Slidev·Notion이 같은 주소 규약을 쓴다. 발표 모드(쿼리 없음)에서는 비활성이다.
- **10 검증 — 캡처를 보고 맞춘다.** 슬라이드 PNG를 떠서 넘침·작은 글씨·발표 시간을 점검하고 `contentScale`(0.5–2)로 조정한다.

| 명령 | 동작 |
|---|---|
| `npm run presentation:build` | deck 검증 → Slidev·Notion 동시 생성 → 정합 검증 (한 번에) |
| `npm run presentation:capture` | 슬라이드 PNG 캡처(기본 Slidev, 폴백 Notion) |
| `cd presentation/slidev && npm run build` | 발표용 Slidev 빌드 |

---

## 5. 저장소 구조

```
CLAUDE.md          AI용 라우터 — 작업 시작 시 먼저 읽음
concept/spec/plan.md, PROGRESS.md   계약서(단계 산출물)

workflow/          워크플로우 엔진
  state.yaml         현재 단계/상태(머신이 읽는 현재 위치)
  stages.yaml        단계 ↔ 지침파일·Gate 매핑
  stages/00..12.md   단계별 상세 지침
  gates/             Gate 검증 스크립트 + cross-review
  scripts/           상태 전환 도구(status/start/complete/handoff/resume/fail)
  templates/, contracts/, history/

presentation/      발표 생성
  deck.json          발표 단일 계약(AI가 작성)
  generator/         deck.json → Slidev/Notion 렌더러·검증·캡처
  slidev/            Slidev 프로젝트(global-top.vue = 편집 오버레이)
  theme/             Notion 정적 HTML 테마 + 편집 오버레이
  output/            렌더 산출물

web/                Next.js + KRDS 스캐폴드
data/               공공데이터(경계·대피소) + data-sources.md
design/krds/        KRDS 디자인 토큰·엠블럼
docs/               운영 지침 문서
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

재사용 방법은 `docs/kit-assets.md` 참조(KRDS 함정·카카오키·`data.go.kr` 차단 대응 포함). 주제가 공공/지역 기반이 아니면 워크플로우 + `web/` 스캐폴드 + 발표 파이프라인만 쓰고 KRDS·공공데이터 묶음은 떼어낸다.

---

## 7. 운영 원칙

- 현재 단계 밖의 작업을 미리 하지 않는다. 전체를 한 번에 실행하려 하지 않는다.
- Gate를 실제로 실행하지 않고 완료 처리하지 않는다. 실패를 성공으로 기록하지 않는다.
- 승인 단계(02·11)에서 임의로 선택하지 않는다.
- `manifest.json`에 없는 기능을 발표에 넣지 않는다. 근거 없는 수치를 만들지 않는다. mocked/fallback을 실시간처럼 표현하지 않는다.
- 시간이 부족하면 단계를 생략하지 않고 기능 범위를 줄인다.
- 메인 전용 파일(서브에이전트 수정 금지): `state.yaml` · `stages.yaml` · `spec.md` · `plan.md` · `PROGRESS.md` · `README.md` · 루트 `package.json` · 공통 설정/Schema.

---

## 8. 라이선스 / 출처

KRDS 이용약관 · `@krds-ui/core`(Apache-2.0) · 공공데이터포털 · 발표 엔진은 BaizeAI/talks(Apache-2.0) 카드 언어 이식. 상세는 `design/krds/SOURCE.md`, `data/data-sources.md`, `presentation/sources/`.
