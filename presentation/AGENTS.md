# presentation/ — 발표 덱 만들기 안내

해커톤 발표 자료(HTML 슬라이드)를 만드는 곳. **두 엔진 중 하나를 골라** 쓴다.
(워크플로우상 위치: `CLAUDE.md` 6·9단계 — 구현 도는 동안 초안, 마지막에 보강.)

```
presentation/
├── reveal/    # ① reveal.js — 단일 HTML, 빌드 없음 (안전빵)
└── slidev/    # ② Slidev — 마크다운+Vue, 빌드 필요 (디자인 천장 높음)
    └── reference-capture/   # 잘 만든 덱 벤치마킹 (레시피 + 캡처 도구)
```

## 어떤 엔진을 고를까

| | **reveal/** (단일 HTML) | **slidev/** (Slidev) |
|---|---|---|
| 작성 | HTML 직접 | 마크다운(.md) + 약간의 Vue/UnoCSS |
| 빌드 | 없음 — 파일 더블클릭(`file://`) | Node + npm 필요 (dev 서버/빌드) |
| 디자인 천장 | 중상 (CSS 직접 깎는 만큼) | **상** (reference-capture의 KubeCon 덱처럼) |
| 오프라인 시연 | **가장 안전** (벤더링됨) | `npm run build` 정적본으로 시연 |
| 적합 | 빠르고 안전하게 / npm 부담될 때 | 팀이 npm 익숙 + 디자인 임팩트 원할 때 |

> 결론: **확신 없으면 reveal/** (무조건 돈다). **디자인으로 승부 + npm 익숙하면 slidev/**.

## ① reveal/ 쓰는 법
1. `reveal/index.template.html` → `index.html` 복사
2. `[대괄호]` placeholder 채우고, 스크린샷을 `reveal/shots/`에 넣어 `.shot-ph`를 `<img>`로 교체
3. `index.html` 더블클릭(브라우저). 조작: `←/→/Space` · `S` 노트 · `F` 전체화면
- 채워진 예시: `reveal/example-disaster-guide.html`, 상세: `reveal/README.md`

## ② slidev/ 쓰는 법
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
