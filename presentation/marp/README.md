# presentation/marp/ — Marp (Notion 스타일)

마크다운으로 작성 → **단일 HTML로 export(오프라인 안전)** + PDF/PPTX 백업. 디자인은 Notion 스타일 테마.
reveal(직접 HTML)·slidev(빌드 SPA)의 중간 — **빠른 마크다운 작성 + 단일 파일 결과**가 강점.

## 쓰는 법
```bash
cd presentation/marp
npm install
npm run build     # slides.md → output/index.html (단일 HTML)
npm run pdf       # PDF 백업
npm run pptx      # PPTX 백업
npm run watch     # 편집하며 미리보기
```
- `slides.md` 편집 (마크다운 + `<!-- _class: ... -->` 레이아웃 지시).
- 스크린샷은 `assets/`에 넣고 `![w:1040](./assets/home.png)`로 삽입.
- 빌드 결과 `output/index.html`을 브라우저로 열면 됨(오프라인 OK).

## 테마 & 레이아웃
- 테마: `themes/propca-notion-style.css` (`/* @theme propca-notion-style */`)
- 자주 쓰는 레이아웃(`<!-- _class: X -->`): `cover` · `section` · `end` · `big-number` · `pastel-blocks` · `database-rows` · `timeline` · `toggle-list` · `compare` · `before-after` · `qa` · `thanks-contact`
- 인라인 헬퍼(마크다운 안 raw HTML, `--html` 필요): `<div class="callout info|success|example|warn|danger">`, `<span class="tag green|sky|rose|purple|yellow">`, `chip`, `kbd`, `figure`
- 전체 레이아웃 목록·예제 마크업: 원본 레포 참고 → https://github.com/procpalee/Marp_Templates

## 출처 / 라이선스 ⚠️
- 테마 출처: **github.com/procpalee/Marp_Templates** (propca-notion-style). 브랜드 토큰은 awesome-design-md(MIT) 참조.
- **원저자 라이선스 미명시** → 해커톤 참고/사용 용도. 재배포·상업 사용 전 작성자에게 확인 권장.
- **ProcPA 로고 참조는 제거**했음(테마 CSS의 `url(...)` → `none`). 팀/기관 로고가 필요하면 CSS의 cover/header `background`를 교체.
