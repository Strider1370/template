# 템플릿 수정 지침 (main 브랜치 적용용)

> **목적:** 해커톤 워크플로우를 1회 완주("우리 가족 맞춤 정부 혜택 찾기")하며 발견한 **템플릿 자체의 버그·취약점**을 정리한 자립형 패치 지침서.
> **적용 대상:** 원본 템플릿이 있는 **`main` 브랜치** (이 문서는 작업 브랜치에서 작성됨 — main에는 아직 아래 수정이 없음).
> **사용법:** 새 세션에서 main 체크아웃 후, 아래 수정을 순서대로 적용하고 각 "검증"을 돌린다. 코드의 `before`는 현재 main 상태와 일치해야 한다(다르면 버전 차이이므로 주변 문맥 기준으로 반영).
>
> 우선순위: **A1·B1(필수, OOTB 깨짐) > B2·B3(반복 위험) > C1(환경 대응)**.

---

## A1. 정적 HTML 렌더러가 `{title, desc}` 객체를 못 풀어 `[object Object]` 출력 ★필수

**증상:** deck.json의 슬롯을 `{ "title": "...", "desc": "..." }` 객체로 채우면(자연스러운 형태), Notion 정적 HTML에서 `[object Object]` 또는 `{"title":"..."}` 원본이 그대로 노출됨. (contrast 좌우 항목, demo-callout callout 등)

**원인:** `presentation/generator/generate-static-html.mjs`
- `itemText()`가 객체에서 `title`/`name` 키를 보지 않음(`text/body/label/heading`만).
- `demo-callout` 렌더러가 callout **배열**을 `leaf()`에 통째로 넘겨 `String(array)` → `[object Object],[object Object]`.

**수정 1 — `itemText` 키 목록 (파일 내 약 86행):**
```js
// before
  for (const k of keys || ["text", "body", "label", "heading"]) {
    if (v[k] != null) return String(v[k]);
  }
// after
  for (const k of keys || ["title", "text", "body", "label", "heading", "name"]) {
    if (v[k] != null) return String(v[k]);
  }
```

**수정 2 — `demo-callout` 렌더러의 callout 배열 처리 (파일 내 약 210행, `"demo-callout"(id, c, assets)` 함수):**
```js
// before
    let text = "";
    if (c.callout != null) text += leaf(slotAddr(id, "callout"), c.callout, "div", "callout");
    if (Array.isArray(c.points)) {
// after
    let text = "";
    if (Array.isArray(c.callout)) {
      text += c.callout
        .map((it, i) => {
          const desc = it && typeof it === "object" && it.desc != null
            ? '<div class="callout-desc">' + esc(it.desc) + "</div>" : "";
          return '<div class="callout"' + addrAttr(subAddr(id, "callout", i)) + ">" +
            esc(itemText(it)) + desc + "</div>";
        })
        .join("");
    } else if (c.callout != null) {
      text += leaf(slotAddr(id, "callout"), c.callout, "div", "callout");
    }
    if (Array.isArray(c.points)) {
```

**검증:** deck.json의 contrast/demo-callout 슬롯을 `{title,desc}` 배열로 둔 뒤 `npm run presentation:static` → `presentation/output/static/presentation.html`에 `[object Object]`가 없어야 함.

> (참고) 같은 이유로 problem-flow/architecture/limitation-guardrail/card-grid의 정적 렌더는 `desc`를 생략하고 제목만 표시한다(비치명, Slidev 기본 매체는 풀 렌더). 백업 품질을 높이려면 각 렌더러에 desc 출력을 추가할 수 있으나 선택사항.

---

## B1. `presentation:capture`가 전역 playwright만 찾아 OOTB로 깨짐 ★필수

**증상:** `npm run presentation:capture` 실행 시 "Playwright 모듈을 찾지 못했습니다(전역 설치 필요). 캡처를 건너뜁니다." → 캡처가 안 됨. (Stage 09·10의 contentScale 튜닝·시각 검증이 막힘)

**원인:** `presentation/generator/capture.mjs`의 `loadPlaywright()`가 **전역 `playwright`**만 탐색. 그런데 키트는 `presentation/slidev`에 **`playwright-chromium`을 로컬로** 설치한다(slidev devDependency). 즉 도구는 있는데 못 찾음.

**수정 — `loadPlaywright()` 함수 전체 교체 (약 36~49행):**
```js
// 로컬(presentation/slidev) playwright-chromium 우선 → 전역 playwright 폴백.
function loadPlaywright() {
  const candidates = [resolve(slidevDir, "node_modules")]; // 키트 로컬 설치 우선
  try {
    const root = execSync("npm root -g", { encoding: "utf8" }).trim();
    if (root) candidates.push(root);
  } catch { /* ignore */ }
  if (process.platform === "linux") candidates.push("/opt/node22/lib/node_modules");
  for (const base of candidates) {
    for (const pkg of ["playwright", "playwright-chromium"]) {
      try { return createRequire(resolve(base, "_.js"))(pkg); } catch { /* next */ }
    }
  }
  try { return createRequire(import.meta.url)("playwright"); } catch { /* next */ }
  try { return createRequire(import.meta.url)("playwright-chromium"); } catch { return null; }
}
```
> `playwright-chromium`은 `playwright`와 동일한 `chromium` API를 노출하므로 `playwright.chromium.launch()`가 그대로 동작한다. 이 수정 하나로 capture.mjs의 **Slidev 빌드→캡처 경로 전체**가 살아난다(빌드 기반이라 dev 마운트 이슈와 무관).

**검증:** `cd presentation/slidev && npm install` 후 루트에서 `npm run presentation:capture` → `presentation/output/captures/NN-<layout>.png`가 생성돼야 함.
> 주의: 빌드 SPA가 Google Fonts CDN을 기다리며 `networkidle`이 지연될 수 있다. 막히면 capture.mjs의 `waitUntil: "networkidle"`을 `"load"`로 바꾼다.

---

## B2. `next build`가 실행 중인 `next dev`의 `.next`를 깨뜨림 ★권장

**증상:** dev 서버(`npm run web:dev`, 미리보기)가 떠 있는 채로 `npm run gate:build`(= `next build`)를 돌리면, 이후 dev가 `Cannot find module './XYZ.js'` 500 에러. (Stage 05 빌드게이트·07 데모·12 패키지가 dev와 겹칠 때 반복 발생)

**원인:** `next build`와 `next dev`가 같은 `.next` 디렉터리를 공유 → 빌드가 dev 청크를 덮어씀.

**수정(권장) — `web/next.config.mjs`를 phase 기반 distDir로:**
```js
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => ({
  // build 는 .next-build, dev 는 .next 로 분리 → 동시 사용 시 충돌 없음.
  distDir: phase === PHASE_PRODUCTION_BUILD ? '.next-build' : '.next',
});
```
그리고 `.gitignore`에 `.next-build` 추가(이미 `.next`는 무시 중):
```
web/.next-build/
```
> 주의: 이 키트는 `next start`(프로덕션 서브)를 쓰지 않고 dev로 시연한다. 만약 `next start`를 도입하면 distDir 정합을 다시 맞춰야 한다.

**대안(가벼움):** config는 두고, `gate:build`(`workflow/gates/validate-build.mjs`) 출력에 "⚠ dev 서버가 떠 있으면 먼저 종료하세요(.next 충돌)" 경고 1줄 추가.

**검증:** `npm run web:dev` 띄운 상태에서 `npm run gate:build` → 빌드 성공 후에도 dev(localhost:3000)가 200으로 살아있어야 함.

---

## B3. Slidev 네이티브 PDF export 실패 → 캡처 기반 PDF 폴백을 정식 스크립트로 ★권장

**증상:** Stage 12에서 `cd presentation/slidev && npm run export`가 내부 dev 서버를 띄워 `[data-slidev-no="1"]`를 기다리다 30s 타임아웃(헤드리스/제한 환경의 dev 마운트 이슈). PDF가 안 나옴.

**원인:** `slidev export`가 dev 렌더에 의존. (제한 환경에서 Slidev dev 클라이언트 마운트가 불안정 — C1 참조)

**수정 — 캡처 PNG를 chromium print-to-PDF로 묶는 폴백 스크립트 추가.**

신규 파일 `presentation/generator/make-pdf.mjs`:
```js
// presentation/generator/make-pdf.mjs — 슬라이드 캡처(PNG)들을 묶어 PDF 생성.
// Slidev export가 dev 마운트 이슈로 실패할 때의 폴백(Stage 12 §16).
// 실행: node presentation/generator/make-pdf.mjs  (먼저 presentation:capture 로 캡처 생성)
import { chromium } from '../slidev/node_modules/playwright-chromium/index.mjs';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const capDir = resolve('presentation/output/captures');
const out = resolve('presentation/output/presentation.pdf');

const pngs = readdirSync(capDir).filter((f) => /\.png$/i.test(f)).sort();
if (!pngs.length) { console.error('캡처 없음 — 먼저 npm run presentation:capture'); process.exit(1); }

const slides = pngs.map((f) => {
  const b64 = readFileSync(resolve(capDir, f)).toString('base64');
  return `<div class="page"><img src="data:image/png;base64,${b64}"></div>`;
}).join('\n');

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  .page { width:1280px; height:720px; page-break-after:always; display:flex; align-items:center; justify-content:center; background:#fff; }
  .page img { max-width:100%; max-height:100%; }
</style></head><body>${slides}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({ path: out, width: '1280px', height: '720px', printBackground: true });
await browser.close();
console.log(`[make-pdf] ${pngs.length}페이지 → ${out}`);
```

루트 `package.json`의 `scripts`에 추가:
```json
"presentation:pdf": "node presentation/generator/make-pdf.mjs",
```

**Stage 12 문서(`workflow/stages/12-package.md`) §16 폴백에 한 줄 보강:** "Slidev export 실패 시 `npm run presentation:capture && npm run presentation:pdf`로 캡처 기반 PDF 생성."

**검증:** `npm run presentation:capture && npm run presentation:pdf` → `presentation/output/presentation.pdf`(페이지 수 = 슬라이드 수) 생성.

---

## C1. 제한/헤드리스 환경에서 Slidev *dev* 검은 화면·글자 깨짐 → 빌드+정적 서빙 권장 ★환경 대응

**증상:** `npm run dev`(slidev)를 미리보기/헤드리스 브라우저로 열면 `#app`이 안 채워져 **검은 화면**, 그리고 charset이 `windows-1252`로 잡혀 **탭 제목·본문이 깨짐**(UTF-8 meta 미선언 + 클라이언트 미마운트). **빌드본(`slidev build`)은 정상**(UTF-8, 정상 마운트).

**원인:** Slidev dev(Vite SPA)가 일부 제한 환경 브라우저에서 클라이언트 마운트 실패. dev index.html은 `<meta charset="slidev:entry">` 마커만 있어 미마운트 시 charset이 기본값(windows-1252)으로 떨어짐.

**대응(코드 수정 아님, 운영 권장):**
1. **발표·캡처는 `slidev build` 결과물을 정적 서빙**한다(이게 안정적, UTF-8 보장).
2. 신규 헬퍼 `presentation/serve-static.mjs`(무의존 정적 서버, UTF-8 강제 + SPA 폴백):
```js
// presentation/serve-static.mjs — 무의존 정적 파일 서버 (UTF-8 charset 강제 + SPA 폴백).
// 사용: node presentation/serve-static.mjs <root-dir> <port> [spa]
//   예) node presentation/serve-static.mjs presentation/slidev/dist 3030 spa
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, join, extname, normalize } from 'node:path';

const root = resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 3032);
const spa = process.argv[4] === 'spa';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
};
async function tryFile(p) {
  try { const s = await stat(p); if (s.isFile()) return p; if (s.isDirectory()) return tryFile(join(p, 'index.html')); } catch {}
  return null;
}
createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const safe = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  let file = await tryFile(join(root, safe));
  if (!file && spa) file = await tryFile(join(root, 'index.html'));
  if (!file) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('404'); }
  const body = await readFile(file);
  res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
  res.end(body);
}).listen(port, () => console.log(`[serve-static] ${root} -> http://localhost:${port}/ (spa=${spa})`));
```
3. **사용 흐름:** `cd presentation/slidev && npm run build` → 루트에서 `node presentation/serve-static.mjs presentation/slidev/dist 3030 spa` → http://localhost:3030/ (다크 테마 정상).
4. (선택) `.claude/launch.json`에 미리보기 설정 추가:
```json
{ "name": "slidev", "runtimeExecutable": "node", "runtimeArgs": ["presentation/serve-static.mjs", "presentation/slidev/dist", "3030", "spa"], "port": 3030 },
{ "name": "notion", "runtimeExecutable": "node", "runtimeArgs": ["presentation/serve-static.mjs", "presentation/output", "3033"], "port": 3033 }
```
5. **문서 보강:** `docs/CLAUDE_Notion_Slidev_Integration_Guide.md`(또는 `run` 스킬)에 "헤드리스/미리보기 환경에선 `slidev dev` 대신 빌드+serve-static 권장" 1~2줄.

---

## 부록: 코드 아님 — 운영 메모(템플릿 무관, 참고)
- **PowerShell heredoc + 작은따옴표:** git 커밋 메시지를 `@'...'@`로 줄 때 본문에 `'…'`(작은따옴표)가 있으면 인자가 쪼개질 수 있음 → 메시지에서 작은따옴표를 피하거나 다른 방식 사용.
- **데모 게이트 스크린샷 위치:** `gate:demo`는 `demo/` 직속 또는 `presentation/assets/screenshots`에서만 png를 찾음(하위폴더 미탐색). 캡처 저장 위치를 거기에 맞출 것. (원하면 `validate-demo.mjs`를 재귀 탐색으로 바꾸는 것도 가능.)

---

## 적용 체크리스트 (main에서)
- [ ] A1: generate-static-html.mjs 2곳 수정 → presentation:static 검증
- [ ] B1: capture.mjs loadPlaywright 교체 → presentation:capture 검증
- [ ] B2: web/next.config.mjs phase distDir + .gitignore → dev+build 동시 검증
- [ ] B3: make-pdf.mjs 추가 + package.json presentation:pdf + 12단계 문서 보강 → pdf 검증
- [ ] C1: serve-static.mjs 추가 + launch.json/문서 보강
- [ ] 전부 후: `npm run web:build` · `npm run presentation:build` 정상 확인 후 커밋
