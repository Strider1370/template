# presentation/ — 발표 덱 (reveal.js)

해커톤 발표용 슬라이드. **reveal.js를 레포에 벤더링**(`vendor/reveal/`)해 인터넷 없이도 시연이 안정적이다.

## 쓰는 법
1. `index.template.html` → `index.html` 로 복사
2. `[대괄호]` placeholder를 실제 내용으로 교체
3. 스크린샷/GIF를 `shots/` 에 넣고, `.shot-ph` div를 `<img class="shot" src="shots/xxx.png" alt="">` 로 교체
4. `index.html` 을 브라우저로 열기

조작: `←/→/Space` 이동 · `S` 발표자 노트 · `F` 전체화면 · `ESC` 개요 · `B` 화면 끄기

## 구조 (5분 / 8장)
후크 → 문제(Before) → 솔루션 → 데모(2분+) → **킥(차별점)** → 임팩트·공공가치 → 확장+팀

> **진짜 자산은 이 구조다.** 더 좋은 레퍼런스/테마가 있으면 `<link ... id="theme">`만 교체하거나, 구조만 지키고 통째로 갈아끼워도 된다. reveal.js 기본 테마: white/black/league/moon/serif/night/solarized (vendor에 white·black 포함, 더 필요하면 `dist/theme/`에 받아 추가).

## 원칙 (리서치 종합)
- 슬라이드 제목 = 한 문장 주장 (YC) · 장당 메시지 1개 · 폰트 크게 (Kawasaki)
- 5분 중 2분+ 를 작동 데모에 · Before→After 스토리
- **라이브 데모는 GIF 백업 필수** (네트워크·버그 대비) · 첫 15초 훅 · 리허설로 5분 엄수

출처: reveal.js, YC 피치덱 가이드, Devpost 해커톤 데모, Guy Kawasaki 10/20/30, 국내 해커톤 수상 후기 등.
