# presentation/ — 발표 덱 만들기 안내

해커톤 발표 자료를 만드는 곳.

**기본 방식 = 생성 파이프라인: Slidev(primary) + Notion 정적 HTML(백업).**
(워크플로우상 위치: `CLAUDE.md` 6·9단계. 상세 명세: `docs/CLAUDE_Notion_Slidev_Integration_Guide.md`, 이하 "Doc2".)

---

## B안 흐름 (반자동 — 현재 기본)

판단(슬라이드에 무엇을 담을지)은 **AI가 `presentation/deck.json` 을 직접 작성**한다.
생성기는 그 deck.json 을 받아 **렌더링만** 한다. 사람은 결과 HTML 위에서 **편집 오버레이**로
무엇을 고칠지 주소(`data-addr`)로 짚어, 다시 deck.json 을 수정한다.

```
AI 가 deck.json 작성 (계약 = generator/deck.schema.json)
  → node generator/validate-deck.mjs            # 스키마 핵심 규칙 검증 (PASS 필수)
  → npm run presentation:slidev  (= generate-slidev.mjs)   # deck.json → slides.md
  → node generator/validate-slides.mjs          # slides.md ↔ deck 슬라이드 수 일치
  → npm run presentation:static  (= generate-static-html.mjs)  # deck.json → output/static/presentation.html (단일 자기완결 HTML, 오프라인)
```

- 레퍼런스/테스트용 예시: `generator/example-deck.json` ("우리 동네 맞춤 재난 대비 가이드", 6장).
  새 주제 시작 시 `cp generator/example-deck.json deck.json` 후 내용을 갈아끼우면 된다.
- `generate-static-html` 은 `theme/notion/{tokens,typography,components}.css` + 편집 오버레이를
  **<style>/<script> 로 인라인**한다(외부 URL 없음, 인터넷 없이 시연 가능).
- 슬라이드별 `data-layout`(semanticLayout) · `data-duration` · `data-impl`(implementationStatus),
  슬롯별 `data-addr="slide-NN.content.<slot>"`, 이미지 `data-addr="slide-NN.assets.<slot>"` 가 붙는다.
- `implementationStatus` 가 `implemented` 가 아니면 mocked/fallback 배지 표시,
  `dropped`/`blocked` 슬라이드는 양쪽 출력에서 제외된다.

### 편집 모드 사용법 (사람용)

생성된 `output/static/presentation.html` 을 브라우저로 열고:

- 발표: `←/→`(또는 PageUp/Down) 으로 슬라이드 이동. 우하단 화살표 버튼도 동작.
- 편집: 주소 끝에 `?edit=1` 을 붙이거나 페이지에서 **`e` 키**로 토글. 우상단 패널에서 레이어 on/off·닫기.
  편집 모드는 발표 모드(`?edit` 없음)에선 완전히 비활성/비표시다.

편집 오버레이 5기능(모두 `ee-` 접두사로 격리):
1. **주소/번호 배지** — 모든 `[data-addr]` 에 순번 + 짧은 주소. 호버 시 아웃라인 + 툴팁(주소 / 크기 WxH / font-size / 넘침 여부). 클릭하면 **주소를 클립보드 복사**(토스트).
2. **가독성·오버플로우 경고** — 박스를 넘치거나(본문 기준) 폰트가 16px 미만이면 빨간 아웃라인 + ⚠.
3. **레이아웃·시간 배지** — 슬라이드 코너에 `<layout> · <duration>s · 누적 mm:ss`. 누적이 `meta.presentationMinutes*60`(없으면 `totalDurationSeconds`) 초과 시 빨강. 같은 layout 3연속이면 경고.
4. **자산 상태** — `placeholder` 자산은 주황 점선 + 라벨, 깨진 이미지(naturalWidth==0)는 빨강 "404".
5. **편집맵 내보내기** — 패널 버튼. 모든 `[data-addr]: 텍스트(또는 img src)` 를 한 줄씩 클립보드 복사(+ `edit-map.txt` 다운로드).

→ 고칠 곳의 **주소를 복사**해 `deck.json` 의 해당 경로(`slide-NN.content.<slot>` 등)를 수정하고 다시 렌더하면 된다. 발표자 노트는 화면에 안 보이며, 편집 모드에서 `data-addr="slide-NN.speakerNotes"` 로 존재한다.

AI가 슬라이드마다 HTML/CSS를 자유 생성하지 않는다. 대신:
사람이 만든 템플릿·토큰을 보존 → 스크립트를 Scene으로 분해 → **등록된 semantic layout** 선택 → 슬롯에 내용·자산 삽입 → 렌더러가 결과 생성.

---

## 기본 엔진: 생성 파이프라인 (권장)

```
presentation/script.md          ← 발표 스크립트 (사람이 작성)
  → scenes.json                 ← 장면 분해   (generate-scenes)
  → deck.json                   ← 슬라이드 계약(단일·엔진 공용) (select-layouts → 채움)
  → slides.md                   ← Slidev 마크다운 (generate-slidev)
  → output/slidev/              ← Slidev build (primary 출력)
  → output/static/presentation.html  ← 단일 HTML 백업 (generate-static-html, fallback)
  → output/captures/ + validation-report.md  ← 검증 (Stage 10)
```

- **Primary = Slidev**, **Fallback = Notion 정적 HTML**. 둘은 **같은 `deck.json`** 을 쓴다(엔진별 중복 작성 금지).
- `reveal`/`marp`는 **자동 기본 엔진이 아니다** — 수동/대체용(아래 "대체·수동 엔진").
- 엔진 우선순위: `generator/engine-registry.json`.

### 명령어 (루트 `package.json` 에 연결 예정 — Doc2 §16)
```bash
npm run presentation:scenes     # script.md → scenes.json
npm run presentation:layouts    # scenes.json + layout-registry → semanticLayout 배정
npm run presentation:slidev     # deck.json → slides.md
npm run presentation:static     # deck.json → output/static/presentation.html (백업)
npm run presentation:validate   # slides.md ↔ deck.json 일치 검증
npm run presentation:build      # scenes → layouts → slidev
npm run presentation:build-all  # build + static + validate + export-pdf
```
> ✅ `generate-slidev.mjs` / `generate-static-html.mjs` 는 **실동작**한다(B안). deck.json 이 없으면 안내만 내고 깔끔히 종료(exit 0).
> ✅ `validate-deck.mjs` / `validate-slides.mjs` 도 **실동작**한다(대상이 없으면 깔끔히 FAIL). validate-slides 는 per-slide frontmatter 를 인지해 슬라이드 수를 센다.
> ⚠️ `select-*` / `generate-scenes.mjs` 는 아직 스캐폴드다(A안 파이프라인용). B안에서는 deck.json 을 AI가 직접 쓰므로 불필요.
> 모든 스크립트는 `node generator/<file>.mjs` 로 직접 실행 가능.

### 디렉터리 구조 (Doc2 §6)
```
presentation/
├── AGENTS.md
├── script.md / scenes.json / deck.json / slides.md   # 파이프라인 산출물(실사용 때 생성)
│
├── generator/                  # 계약·레지스트리·생성기
│   ├── scenes.schema.json      # scenes.json JSON Schema
│   ├── deck.schema.json        # deck.json JSON Schema (Slidev+정적HTML 공용)
│   ├── layout-registry.json    # 16 semantic layout + role→layout 규칙(Doc2 §8·§10)
│   ├── engine-registry.json    # primary=slidev / fallback=notion-static-html
│   ├── generate-scenes.mjs     # script.md → scenes.json   (스켈레톤)
│   ├── select-layouts.mjs      # scene → semanticLayout 배정 (스켈레톤)
│   ├── generate-slidev.mjs     # deck.json → slides.md      (스켈레톤)
│   ├── generate-static-html.mjs# deck.json → 단일 HTML 백업 (스켈레톤)
│   ├── validate-deck.mjs       # deck.json 검증            (실동작)
│   ├── validate-slides.mjs     # slides.md ↔ deck 개수 검증 (실동작)
│   └── utils/
│
├── theme/
│   ├── notion/ tokens.css typography.css components.css theme.json  # propca 토큰 추출
│   └── slidev/ theme-entry.ts styles/ layouts/ components/
│
├── sources/                    # 원본 템플릿 보관(분석·추출 전용, 수정 금지)
│   ├── notion-original/ slidev-original/
│   ├── ASSET_LICENSES.md  provenance.json
│   └── reference-capture/  (※ 현재는 slidev/reference-capture/ 에 위치)
│
└── output/                     # 생성 결과(slidev/ static/ captures/)  ※ 실사용 때 생성
```

### 16 Semantic Layout (Doc2 §8)
`hero · problem-flow · contrast · insight-statement · product-overview · demo-fullscreen · demo-callout · architecture · before-after · big-number · card-grid · timeline · quote · limitation-guardrail · expansion-map · closing`
→ 각 layout은 `layout-registry.json`에서 `{ slidev, notion-html }` 렌더러와 슬롯으로 매핑된다. **등록 안 된 layout 임의 생성 금지.**

### 디자인 토큰
`theme/notion/tokens.css` (출처: `marp/themes/propca-notion-style.css`). 보라(`--notion-purple`) 시그니처 + 파스텔 로테이션 + navy hero, 12px radius. Slidev/정적 HTML 양쪽이 같은 변수를 참조한다.

### Hard Rules (Doc2 §17 요약)
- 원본 템플릿 덮어쓰기 금지 / 등록 안 된 layout 임의 생성 금지 / 기존 style·component 우선 재사용.
- `deck.json` 을 엔진별로 중복 작성 금지. 참고 캡처를 최종 슬라이드에 그대로 삽입 금지.
- 발표 스크립트를 슬라이드에 그대로 복사 금지. 슬라이드마다 새 CSS 생성 금지.
- 실제 앱 캡처가 있으면 목업보다 우선. 외부 URL 자산은 로컬 복사(오프라인 시연 가능해야 함).
- `reveal`/`marp` 를 자동 기본 엔진으로 선택 금지.

---

## 대체·수동 엔진 (자동 기본 아님 — 보존)

생성 파이프라인을 쓰지 않고 **직접 손으로** 덱을 만들 때의 기존 방식. 빠른 단발성/오프라인 백업에 유용.

```
presentation/
├── reveal/    # ① reveal.js — 단일 HTML, 빌드 없음 (안전빵)
├── marp/      # ② Marp — 마크다운 → 단일 HTML/PDF, Notion(propca) 스타일 테마
└── slidev/    # ③ Slidev — 마크다운+Vue, 빌드 SPA (파이프라인의 기본 엔진 소스이기도 함)
    └── reference-capture/   # 잘 만든 덱 벤치마킹 (레시피 + 캡처 도구)
```

| | **reveal/** | **marp/** | **slidev/** |
|---|---|---|---|
| 작성 | HTML 직접 | **마크다운** | 마크다운 + Vue/UnoCSS |
| 결과물 | 단일 HTML | **단일 HTML + PDF/PPTX** | 빌드된 정적 SPA |
| 빌드 | 없음(`file://`) | npm(`marp` CLI) | Node + npm |
| 오프라인 시연 | ✅ 벤더링 | ✅ 단일 파일 | △ 빌드본 |
| 디자인 | 직접 | **상(Notion 테마 내장)** | 상(레시피로) |
| 적합 | 가장 안전·빠름 | **마크다운+예쁨+단일파일 균형** | 디자인 최대치+npm 익숙 |

> 결론: 파이프라인이 막히거나 단발 백업이 필요하면 — 마크다운+예쁨+단일파일은 `marp/`, 빌드도 싫으면 `reveal/`, 디자인 최대치는 `slidev/`.

### ① reveal/ 쓰는 법
1. `reveal/index.template.html` → `index.html` 복사
2. `[대괄호]` placeholder 채우고, 스크린샷을 `reveal/shots/`에 넣어 `.shot-ph`를 `<img>`로 교체
3. `index.html` 더블클릭(브라우저). 조작: `←/→/Space` · `S` 노트 · `F` 전체화면
- 상세: `reveal/README.md`

### ② marp/ 쓰는 법
```bash
cd presentation/marp
npm install
npm run build    # slides.md → output/index.html (단일 HTML, 오프라인 OK)
npm run pdf      # PDF 백업 / npm run pptx / npm run watch
```
- `slides.md` 편집 (마크다운 + `<!-- _class: cover|section|end|big-number|pastel-blocks|… -->`).
- 스크린샷은 `marp/assets/`에 두고 `![w:1040](./assets/x.png)`. 테마·레이아웃·라이선스: `marp/README.md`.
- ※ `marp/themes/propca-notion-style.css`는 파이프라인 `theme/notion/` 토큰의 **출처**이기도 하다.

### ③ slidev/ 쓰는 법
```bash
cd presentation/slidev
npm install
npm run dev      # http://localhost:3030 (편집 → slides.md)
npm run build    # 정적 웹으로 export (발표 당일은 이걸로 시연)
npm run export   # PDF (백업)
```
- `slides.md` 편집. 디자인은 **reference-capture/RECIPE.md 레시피**대로.

### reference-capture/ — 벤치마킹 (slidev/ 안)
- `RECIPE.md`: 잘 만든 덱(BaizeAI KubeCon)의 재현 레시피 + 소스 링크 (Apache-2.0)
- `capture.mjs`: **다른 덱도** 캡처 → `node capture.mjs <Slidev덱URL>`
- 새 주제 1단계(브레인스토밍)에서 해외 사례 덱을 캡처해 레퍼런스로 쓰면 좋다.

---

## 슬라이드 구조 · 원칙 (엔진 공통)
구조(5분 / 8장 안팎): **타이틀 후크 → 문제(Before) → 솔루션 → 데모(2분+) → 킥(차별점) → 임팩트·공공가치 → 확장+팀**
- 데모 + 킥에 시간 80%. 프로그램 로직은 1장(Q&A 대비).
- 슬라이드 제목 = 한 문장 주장. 장당 메시지 1개. 폰트 크게.
- 킥(차별점)을 중심에 — 어느 해외 사례 메커니즘을 이식했는지(벤치마킹 서사) 함께.
- **라이브 데모는 GIF 백업 필수.** 실제 산출물 스크린샷이 주인공.
- 카피는 담백·팩트 위주 (슬로건·오글거리는 감성 표현 지양).
