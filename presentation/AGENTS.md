# presentation/ — 발표 덱 만들기 안내

해커톤 발표 자료(HTML 슬라이드)를 만드는 곳. **세 엔진 중 하나를 골라** 쓴다.
(워크플로우상 위치: `CLAUDE.md` 6·9단계 — 구현 도는 동안 초안, 마지막에 보강.)

```
presentation/
├── reveal/    # ① reveal.js — 단일 HTML, 빌드 없음 (안전빵)
├── marp/      # ② Marp — 마크다운 → 단일 HTML/PDF, Notion 스타일 테마
└── slidev/    # ③ Slidev — 마크다운+Vue, 빌드 SPA (디자인 천장 높음)
    └── reference-capture/   # 잘 만든 덱 벤치마킹 (레시피 + 캡처 도구)
```

## 어떤 엔진을 고를까

| | **reveal/** | **marp/** | **slidev/** |
|---|---|---|---|
| 작성 | HTML 직접 | **마크다운** | 마크다운 + Vue/UnoCSS |
| 결과물 | 단일 HTML | **단일 HTML + PDF/PPTX** | 빌드된 정적 SPA |
| 빌드 | 없음(`file://`) | npm(`marp` CLI) | Node + npm |
| 오프라인 시연 | ✅ 벤더링 | ✅ 단일 파일 | △ 빌드본 |
| 디자인 | 직접 | **상(Notion 테마 내장)** | 상(레시피로) |
| 적합 | 가장 안전·빠름 | **마크다운+예쁨+단일파일 균형** | 디자인 최대치+npm 익숙 |

> 결론: **마크다운으로 빠르게 + 예쁘게 + 단일 파일**을 원하면 `marp/`(추천). 빌드도 싫으면 `reveal/`. 디자인 최대치+모션이면 `slidev/`.

## ① reveal/ 쓰는 법
1. `reveal/index.template.html` → `index.html` 복사
2. `[대괄호]` placeholder 채우고, 스크린샷을 `reveal/shots/`에 넣어 `.shot-ph`를 `<img>`로 교체
3. `index.html` 더블클릭(브라우저). 조작: `←/→/Space` · `S` 노트 · `F` 전체화면
- 채워진 예시: `reveal/example-disaster-guide.html`, 상세: `reveal/README.md`

## ② marp/ 쓰는 법
```bash
cd presentation/marp
npm install
npm run build    # slides.md → output/index.html (단일 HTML, 오프라인 OK)
npm run pdf      # PDF 백업 / npm run pptx / npm run watch
```
- `slides.md` 편집 (마크다운 + `<!-- _class: cover|section|end|big-number|pastel-blocks|… -->`).
- 스크린샷은 `marp/assets/`에 두고 `![w:1040](./assets/x.png)`. 테마·레이아웃·라이선스: `marp/README.md`.

## ③ slidev/ 쓰는 법
```bash
cd presentation/slidev
npm install
npm run dev      # http://localhost:3030 (편집 → slides.md)
npm run build    # 정적 웹으로 export (발표 당일은 이걸로 시연)
npm run export   # PDF (백업)
```
- `slides.md` 편집. 디자인은 **reference-capture/RECIPE.md 레시피**대로 (다크+DM Sans+UnoCSS+아이콘+`delay` 스태거+커스텀 CSS).

## reference-capture/ — 벤치마킹 (slidev/ 안)
- `RECIPE.md`: 잘 만든 덱(BaizeAI KubeCon)의 재현 레시피 + 소스 링크 (Apache-2.0)
- `shots/`: 그 덱 슬라이드별 스크린샷 (로컬, .gitignore)
- `capture.mjs`: **다른 덱도** 캡처 → `node capture.mjs <Slidev덱URL>`
- 새 주제 1단계(브레인스토밍)에서 해외 사례 덱을 캡처해 레퍼런스로 쓰면 좋다.

## 슬라이드 구조 · 원칙 (엔진 공통)
구조(5분 / 8장 안팎): **타이틀 후크 → 문제(Before) → 솔루션 → 데모(2분+) → 킥(차별점) → 임팩트·공공가치 → 확장+팀**
- 데모 + 킥에 시간 80%. 프로그램 로직은 1장(Q&A 대비).
- 슬라이드 제목 = 한 문장 주장. 장당 메시지 1개. 폰트 크게.
- 킥(차별점)을 중심에 — 어느 해외 사례 메커니즘을 이식했는지(벤치마킹 서사) 함께.
- **라이브 데모는 GIF 백업 필수.** 실제 산출물 스크린샷이 주인공.
- 카피는 담백·팩트 위주 (슬로건·오글거리는 감성 표현 지양).
