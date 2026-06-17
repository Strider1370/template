#!/usr/bin/env node
/**
 * generate-static-html.mjs — deck.json → presentation/output/static/presentation.html
 *
 * 단일 자기완결 HTML 백업(인터넷 불필요). Doc2 §12.
 *  - meta → <head>(title/lang/16:9). theme/notion CSS 3개 + edit-overlay CSS 를 <style> 인라인.
 *  - 슬라이드: <section class="slide <notion-html클래스>" data-slide-id data-layout
 *      data-duration data-impl> + 슬롯마다 data-addr.
 *  - speakerNotes 는 화면 비표시(.ee-notes hidden) — 편집모드 토글로 확인.
 *  - 최소 뷰어(←/→) + 편집 오버레이(?edit=1 또는 'e') 인라인.
 *  - 입력 없으면 안내 후 exit 0 (throw 금지).
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const deckPath = resolve(presentationRoot, "deck.json");
const registryPath = resolve(__dirname, "layout-registry.json");
const themeDir = resolve(presentationRoot, "theme");
const notionDir = resolve(themeDir, "notion");
const outDir = resolve(presentationRoot, "output", "static");
const outPath = resolve(outDir, "presentation.html");

const BANNER = "[generate-static-html]";

if (!existsSync(deckPath)) {
  console.log(BANNER + " 입력 없음: " + deckPath);
  console.log("  deck.json 을 생성한 뒤 다시 실행하세요. (예: cp generator/example-deck.json deck.json)");
  process.exit(0);
}

const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const layoutById = new Map(registry.layouts.map((l) => [l.semanticId, l]));

// ---- helpers -------------------------------------------------------------
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readCss(p) {
  try {
    // tokens.css 가 @import 되므로 인라인 시 @import 줄은 제거(이미 합쳐 인라인하므로).
    return readFileSync(p, "utf8").replace(/@import\s+url\([^)]*\);?/g, "");
  } catch {
    return "";
  }
}

function readFileSafe(p) {
  try { return readFileSync(p, "utf8"); } catch { return ""; }
}

// 자산 값 정규화: {src,status} 또는 문자열(=> status real)
function normAsset(v) {
  if (v == null) return null;
  if (typeof v === "string") return { src: v, status: "real" };
  if (typeof v === "object" && v.src) return { src: v.src, status: v.status || "real" };
  return null;
}

const slideAddr = (id) => id;
const slotAddr = (id, slot) => id + ".content." + slot;

// 슬롯 한 개를 렌더. 배열이면 <ul>, 문자열이면 적절 태그.
function renderSlot(id, slot, value, tag) {
  if (value == null) return "";
  const addr = ' data-addr="' + esc(slotAddr(id, slot)) + '"';
  if (Array.isArray(value)) {
    const items = value
      .map((v) => "<li>" + esc(typeof v === "object" ? JSON.stringify(v) : v) + "</li>")
      .join("");
    return '<ul class="ee-slot ee-slot-' + esc(slot) + '"' + addr + ">" + items + "</ul>";
  }
  if (typeof value === "object") {
    return '<div class="ee-slot ee-slot-' + esc(slot) + '"' + addr + ">" + esc(JSON.stringify(value)) + "</div>";
  }
  const t = tag || "div";
  return "<" + t + ' class="ee-slot ee-slot-' + esc(slot) + '"' + addr + ">" + esc(value) + "</" + t + ">";
}

function renderImage(id, slotName, asset) {
  const a = normAsset(asset);
  if (!a) return "";
  return (
    '<img class="ee-img" data-addr="' + esc(id + ".assets." + slotName) + '"' +
    ' data-asset-status="' + esc(a.status) + '"' +
    ' src="' + esc(a.src) + '" alt="">'
  );
}

// 슬라이드 1장 → <section>
function renderSlide(s) {
  const layout = layoutById.get(s.semanticLayout);
  const cls = (layout && layout.renderers["notion-html"]) || "default";
  const dur = s.durationSeconds || 0;
  const impl = s.implementationStatus || "implemented";
  const content = s.content || {};
  const assets = s.assets || {};

  // implementation 배지
  let implBadge = "";
  if (impl === "mocked" || impl === "fallback") {
    implBadge = '<div class="ee-impl-badge ee-impl-' + esc(impl) + '">' + esc(impl.toUpperCase()) + "</div>";
  }

  // 슬롯 본문: layout-registry 슬롯 순서대로, content 에 있는 것만 렌더.
  const slotNames = (layout && layout.slots) || Object.keys(content);
  const tagMap = { title: "h1", subtitle: "h2", eyebrow: "div", label: "div", number: "div", quote: "blockquote" };
  const parts = [];
  for (const name of slotNames) {
    if (content[name] == null) continue;
    parts.push(renderSlot(s.id, name, content[name], tagMap[name]));
  }
  // content 에 있으나 슬롯목록 밖 키도 보존
  for (const name of Object.keys(content)) {
    if (slotNames.includes(name)) continue;
    parts.push(renderSlot(s.id, name, content[name], tagMap[name]));
  }

  // 이미지 자산
  const imgParts = [];
  for (const name of Object.keys(assets)) {
    const html = renderImage(s.id, name, assets[name]);
    if (html) imgParts.push(html);
  }

  const notes = s.speakerNotes
    ? '<div class="ee-notes" hidden data-addr="' + esc(s.id + ".speakerNotes") + '">' + esc(s.speakerNotes) + "</div>"
    : "";

  return (
    '<section class="slide ' + esc(cls) + '"' +
    ' data-addr="' + esc(slideAddr(s.id)) + '"' +
    ' data-slide-id="' + esc(s.id) + '"' +
    ' data-layout="' + esc(s.semanticLayout) + '"' +
    ' data-duration="' + dur + '"' +
    ' data-impl="' + esc(impl) + '">' +
    '<div class="notion-root slide-inner">' +
    implBadge +
    parts.join("\n") +
    (imgParts.length ? '<div class="ee-assets">' + imgParts.join("\n") + "</div>" : "") +
    "</div>" +
    notes +
    "</section>"
  );
}

// dropped/blocked 제외
const visibleSlides = (deck.slides || []).filter(
  (s) => s.implementationStatus !== "dropped" && s.implementationStatus !== "blocked"
);

const meta = deck.meta || {};
const lang = meta.language || "ko";
const title = meta.title || "Presentation";
const presentationSeconds =
  (meta.presentationMinutes ? meta.presentationMinutes * 60 : 0) || meta.totalDurationSeconds || 0;

// CSS 인라인
const cssTokens = readCss(resolve(notionDir, "tokens.css"));
const cssType = readCss(resolve(notionDir, "typography.css"));
const cssComp = readCss(resolve(notionDir, "components.css"));
const cssEdit = readCss(resolve(themeDir, "edit-overlay.css"));
const jsEdit = readFileSafe(resolve(themeDir, "edit-overlay.js"));

// 최소 뷰어/레이아웃용 베이스 CSS (슬라이드별 CSS 아님 — 전역 1회).
const baseCss = `
  html,body{margin:0;padding:0;background:var(--notion-navy-deep,#070f24);}
  *{box-sizing:border-box;}
  .deck{position:relative;}
  .slide{
    position:relative;display:none;width:100vw;height:100vh;
    aspect-ratio:16/9;background:var(--notion-canvas,#fff);
    overflow:hidden;
  }
  .slide.ee-active{display:block;}
  .slide-inner{
    height:100%;width:100%;
    padding:var(--notion-slide-pad-y,72px) var(--notion-slide-pad-x,88px);
    display:flex;flex-direction:column;gap:var(--notion-space-3,18px);
    justify-content:center;
  }
  .slide.cover .slide-inner{background:var(--notion-navy,#0a1530);color:#fff;}
  .slide.cover h1,.slide.cover h2{color:#fff;}
  .slide.end .slide-inner{background:var(--notion-navy,#0a1530);color:#fff;}
  .slide.end h1,.slide.end h2{color:#fff;}
  .slide.big-number .slide-inner{align-items:center;text-align:center;}
  .slide.big-number .ee-slot-number{
    font-family:var(--notion-font-mono);font-size:var(--notion-fs-big-number,200pt);
    font-weight:800;color:var(--notion-purple,#5645d4);line-height:1;letter-spacing:-.05em;
  }
  .ee-slot-eyebrow{font-family:var(--notion-font-mono);font-size:13pt;
    letter-spacing:.08em;text-transform:uppercase;color:var(--notion-purple,#5645d4);}
  .ee-assets{display:flex;gap:var(--notion-space-3,18px);flex-wrap:wrap;margin-top:var(--notion-space-2,12px);}
  .ee-img{max-width:48%;max-height:46vh;border-radius:var(--notion-radius-lg,12px);
    border:1px solid var(--notion-hairline,#e5e3df);object-fit:cover;}
  .ee-impl-badge{align-self:flex-start;font-family:var(--notion-font-mono);font-size:11pt;
    font-weight:700;padding:3px 10px;border-radius:var(--notion-radius-pill,999px);}
  .ee-impl-mocked{background:var(--notion-warning,#f59e0b);color:#fff;}
  .ee-impl-fallback{background:var(--notion-orange,#dd5b00);color:#fff;}
  ul.ee-slot{margin:0;padding-left:1.2em;}
  /* 인쇄/스크롤 fallback */
  @media print{ .slide{display:block !important;page-break-after:always;height:100vh;} }
`;

const navCss = `
  .ee-nav{position:fixed;bottom:14px;right:16px;z-index:100;display:flex;gap:8px;
    font-family:-apple-system,sans-serif;}
  .ee-nav button{background:rgba(10,21,48,.8);color:#fff;border:none;border-radius:8px;
    padding:6px 12px;font-size:14px;cursor:pointer;}
  .ee-nav .ee-page{color:#fff;align-self:center;font-size:13px;
    background:rgba(10,21,48,.6);padding:6px 10px;border-radius:8px;}
`;

const viewerJs = `
(function(){
  var slides=[].slice.call(document.querySelectorAll('.slide'));
  var i=0; var pageEl=document.getElementById('ee-page');
  function show(n){
    if(n<0)n=0; if(n>slides.length-1)n=slides.length-1; i=n;
    slides.forEach(function(s,k){s.classList.toggle('ee-active',k===i);});
    if(pageEl)pageEl.textContent=(i+1)+' / '+slides.length;
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='PageDown'){show(i+1);}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){show(i-1);}
  });
  var prev=document.getElementById('ee-prev'),next=document.getElementById('ee-next');
  if(prev)prev.addEventListener('click',function(){show(i-1);});
  if(next)next.addEventListener('click',function(){show(i+1);});
  show(0);
})();
`;

const html = `<!DOCTYPE html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="aspect-ratio" content="${esc(meta.aspectRatio || "16:9")}">
<title>${esc(title)}</title>
<style>
/* ---- notion tokens ---- */
${cssTokens}
/* ---- notion typography ---- */
${cssType}
/* ---- notion components ---- */
${cssComp}
/* ---- base viewer/layout ---- */
${baseCss}
${navCss}
/* ---- edit overlay ---- */
${cssEdit}
</style>
</head>
<body class="notion-root">
<div class="deck">
${visibleSlides.map(renderSlide).join("\n")}
</div>

<div class="ee-nav">
  <button id="ee-prev" aria-label="이전">←</button>
  <span class="ee-page" id="ee-page"></span>
  <button id="ee-next" aria-label="다음">→</button>
</div>

<script>
window.__EE_META = ${JSON.stringify({
  presentationSeconds,
  totalDurationSeconds: meta.totalDurationSeconds || 0,
  layouts: visibleSlides.map((s) => s.semanticLayout),
})};
</script>
<script>${viewerJs}</script>
<!-- edit overlay -->
<script>${jsEdit}</script>
</body>
</html>
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, html, "utf8");
console.log(BANNER + " 생성 완료: " + outPath);
console.log("  슬라이드 " + visibleSlides.length + "장 (전체 " + (deck.slides || []).length + "장, dropped/blocked 제외).");
console.log("  발표: 브라우저로 열고 ←/→ 로 이동. 편집: ?edit=1 또는 'e' 키.");
process.exit(0);
