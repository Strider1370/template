# presentation/ — 발표 덱 만들기 안내

해커톤 발표 자료를 만드는 곳.

**기본 방식 = 생성 파이프라인: Slidev(primary) + Notion 정적 HTML(백업).**
(워크플로우상 위치: `CLAUDE.md` 6·9단계. 상세 명세: `docs/CLAUDE_Notion_Slidev_Integration_Guide.md`, 이하 "Doc2".)

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
> ⚠️ 현재 `generator/`의 `generate-*` / `select-*` 는 **스캐폴드(스켈레톤)**다. 실행하면 "아직 미구현(스캐폴드) — Stage 09 첫 실사용 때 완성" 안내를 내고 깔끔히 종료한다. 핵심 생성 로직은 첫 실사용 때 다듬는다.
> ✅ `validate-deck.mjs` / `validate-slides.mjs` 는 **실동작**한다(대상이 없으면 깔끔히 FAIL).
> 스켈레톤이라도 `node generator/<file>.mjs` 로 직접 실행 가능.

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
- 채워진 예시: `reveal/example-disaster-guide.html`, 상세: `reveal/README.md`

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
