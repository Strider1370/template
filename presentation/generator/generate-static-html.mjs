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
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const deckPath = resolve(presentationRoot, "deck.json");
const registryPath = resolve(__dirname, "layout-registry.json");
const themeDir = resolve(presentationRoot, "theme");
const notionDir = resolve(themeDir, "notion");
const outDir = resolve(presentationRoot, "output", "static");
const outPath = resolve(outDir, "presentation.html");

const repoRoot = resolve(presentationRoot, "..");

// 자산 자동 배치: src 를 여러 후보 위치에서 찾아 output/static/assets/ 로 복사하고 상대경로를 돌려준다.
function placeAsset(src) {
  if (!src) return null;
  for (const base of [outDir, presentationRoot, repoRoot]) {
    const abs = resolve(base, src);
    if (existsSync(abs)) {
      const name = basename(src);
      try {
        mkdirSync(resolve(outDir, "assets"), { recursive: true });
        copyFileSync(abs, resolve(outDir, "assets", name));
        return "assets/" + name;
      } catch {
        return src;
      }
    }
  }
  return src;
}

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
// 중첩 주소: slide-NN.content.<slot>.<key|index>
const subAddr = (id, slot, key) => id + ".content." + slot + "." + key;

const addrAttr = (addr) => ' data-addr="' + esc(addr) + '"';

// 편집 가능한 단순 텍스트 노드. tag/className/extra 속성 조립.
function leaf(addr, value, tag, className) {
  const t = tag || "div";
  const cls = className ? ' class="' + esc(className) + '"' : "";
  return "<" + t + cls + addrAttr(addr) + ">" + esc(value) + "</" + t + ">";
}

// 배열 항목을 문자열로 정규화(객체면 text/body/label 키 우선).
function itemText(v, keys) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  for (const k of keys || ["title", "text", "body", "label", "heading", "name"]) {
    if (v[k] != null) return String(v[k]);
  }
  return JSON.stringify(v);
}

// generic 폴백(기존 동작): 슬롯 세로 나열.
function renderSlotGeneric(id, slot, value, tag) {
  if (value == null) return "";
  const addr = addrAttr(slotAddr(id, slot));
  if (Array.isArray(value)) {
    const items = value
      .map((v) => "<li>" + esc(itemText(v)) + "</li>")
      .join("");
    return '<ul class="ee-slot ee-slot-' + esc(slot) + '"' + addr + ">" + items + "</ul>";
  }
  if (typeof value === "object") {
    return '<div class="ee-slot ee-slot-' + esc(slot) + '"' + addr + ">" + esc(JSON.stringify(value)) + "</div>";
  }
  const t = tag || "div";
  return "<" + t + ' class="ee-slot ee-slot-' + esc(slot) + '"' + addr + ">" + esc(value) + "</" + t + ">";
}

function renderImageRaw(id, slotName, asset, className) {
  const a = normAsset(asset);
  if (!a) return "";
  const finalSrc = placeAsset(a.src) || a.src;
  return (
    '<img class="' + esc(className || "ee-img") + '" data-addr="' + esc(id + ".assets." + slotName) + '"' +
    ' data-asset-status="' + esc(a.status) + '"' +
    ' src="' + esc(finalSrc) + '" alt="">'
  );
}

// 슬라이드 제목(full-width 공통 헤더).
function titleEl(id, content) {
  return content.title != null ? leaf(slotAddr(id, "title"), content.title, "h1", "slide-title") : "";
}

// ---- 레이아웃별 내부구조 렌더러 ------------------------------------------
// 각 함수는 { title, body } 를 반환한다.
//  - title : 제목성 요소(slide-title / hero·banner·end 의 h1 등). .slide-inner 직속(상단 고정).
//  - body  : 나머지 본문. renderSlide 가 <div class="slide-body"> 로 감싸 남은 공간을 채운다.
// content/assets 펼침 + data-addr 유지.
const LAYOUT_RENDERERS = {
  // 1) hero → cover (풀블리드/중앙: title 도 body 안에 두어 함께 중앙정렬)
  hero(id, c) {
    let h = "";
    if (c.eyebrow != null) h += leaf(slotAddr(id, "eyebrow"), c.eyebrow, "div", "ee-slot ee-slot-eyebrow");
    if (c.title != null) h += leaf(slotAddr(id, "title"), c.title, "h1");
    if (c.subtitle != null) h += leaf(slotAddr(id, "subtitle"), c.subtitle, "h2");
    if (c.footnote != null) h += leaf(slotAddr(id, "footnote"), c.footnote, "div", "ee-slot ee-slot-footnote");
    return { title: "", body: h };
  },

  // 2) problem-flow → icon-list
  "problem-flow"(id, c) {
    const items = Array.isArray(c.items) ? c.items : [];
    const lis = items
      .map((it, i) => {
        const addr = subAddr(id, "items", i);
        if (it && typeof it === "object" && (it.label != null || it.text != null)) {
          const label = it.label != null ? '<span class="li-label">' + esc(it.label) + "</span>" : "";
          return "<li" + addrAttr(addr) + ">" + label + "<span>" + esc(it.text != null ? it.text : "") + "</span></li>";
        }
        return "<li" + addrAttr(addr) + "><span>" + esc(itemText(it)) + "</span></li>";
      })
      .join("");
    return { title: titleEl(id, c), body: '<ul class="flow-list">' + lis + "</ul>" };
  },

  // 3) contrast → compare
  contrast(id, c) {
    let b = "";
    if (c.lead != null) b += leaf(slotAddr(id, "lead"), c.lead, "p", "compare-lead");
    const col = (label, labelSlot, body, bodySlot) => {
      let inner = "";
      if (label != null) inner += leaf(slotAddr(id, labelSlot), label, "div", "col-label");
      if (Array.isArray(body)) {
        inner += "<ul>" + body.map((v, i) => "<li" + addrAttr(subAddr(id, bodySlot, i)) + ">" + esc(itemText(v)) + "</li>").join("") + "</ul>";
      } else if (body != null) {
        inner += leaf(slotAddr(id, bodySlot), body, "p");
      }
      return '<div class="col">' + inner + "</div>";
    };
    b += col(c.leftLabel, "leftLabel", c.left, "left");
    b += '<div class="vs">VS</div>';
    b += col(c.rightLabel, "rightLabel", c.right, "right");
    return { title: titleEl(id, c), body: b };
  },

  // 4) insight-statement → yellow-banner (풀블리드/중앙)
  "insight-statement"(id, c) {
    let h = "";
    if (c.title != null) h += leaf(slotAddr(id, "title"), c.title, "h1");
    if (c.subtitle != null) h += leaf(slotAddr(id, "subtitle"), c.subtitle, "h2");
    return { title: "", body: h };
  },

  // 5) product-overview → block-features
  "product-overview"(id, c) {
    const feats = Array.isArray(c.features) ? c.features : [];
    const blocks = feats
      .map((f, i) => {
        const o = f && typeof f === "object" ? f : { heading: itemText(f) };
        const ico = o.icon != null ? esc(o.icon) : String(i + 1);
        const head = o.heading != null ? leaf(subAddr(id, "features", i + ".heading"), o.heading, "h3") : "";
        const body = o.body != null ? leaf(subAddr(id, "features", i + ".body"), o.body, "p") : "";
        return '<div class="block"><div class="ico">' + ico + "</div>" + head + body + "</div>";
      })
      .join("");
    return { title: titleEl(id, c), body: '<div class="blocks">' + blocks + "</div>" };
  },

  // 6) demo-fullscreen → bg-full (풀블리드/중앙, 이미지는 .slide-inner 배경으로)
  "demo-fullscreen"(id, c) {
    let h = "";
    if (c.title != null) h += leaf(slotAddr(id, "title"), c.title, "h1");
    if (c.subtitle != null) h += leaf(slotAddr(id, "subtitle"), c.subtitle, "h2");
    return { title: "", body: h };
  },

  // 7) demo-callout → split (좌 이미지 / 우 콜아웃+포인트)
  "demo-callout"(id, c, assets) {
    const media = '<div class="col col-media">' + renderImageRaw(id, "image", assets.image, "ee-img") + "</div>";
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
      text += "<ul>" + c.points.map((p, i) => "<li" + addrAttr(subAddr(id, "points", i)) + ">" + esc(itemText(p)) + "</li>").join("") + "</ul>";
    }
    return { title: titleEl(id, c), body: media + '<div class="col col-text">' + text + "</div>" };
  },

  // 8) architecture → steps-result
  architecture(id, c) {
    const steps = Array.isArray(c.steps) ? c.steps : [];
    const cells = steps
      .map((st, i) => {
        const o = st && typeof st === "object" ? st : { body: itemText(st) };
        const num = o.num != null ? esc(o.num) : "STEP " + (i + 1);
        const body = o.body != null ? esc(o.body) : esc(itemText(o));
        return '<div><div class="num">' + num + '</div><div class="body"' + addrAttr(subAddr(id, "steps", i)) + ">" + body + "</div></div>";
      })
      .join("");
    let b = '<div class="steps">' + cells + "</div>";
    if (c.result != null) b += leaf(slotAddr(id, "result"), c.result, "div", "result");
    return { title: titleEl(id, c), body: b };
  },

  // 9) before-after → before-after (이미지 인라인)
  "before-after"(id, c, assets) {
    const col = (labelKey, label, imgSlot, capKey, cap) => {
      let inner = "";
      if (label != null) inner += leaf(slotAddr(id, labelKey), label, "h3");
      inner += renderImageRaw(id, imgSlot, assets[imgSlot], "");
      if (cap != null) inner += leaf(slotAddr(id, capKey), cap, "p", "ba-caption");
      return '<div class="ba-col">' + inner + "</div>";
    };
    const b = '<div class="ba-row">' +
      col("beforeLabel", c.beforeLabel, "beforeImage", "beforeCaption", c.beforeCaption) +
      '<div class="ba-arrow">→</div>' +
      col("afterLabel", c.afterLabel, "afterImage", "afterCaption", c.afterCaption) +
      "</div>";
    return { title: titleEl(id, c), body: b };
  },

  // 10) big-number (풀블리드/중앙)
  "big-number"(id, c) {
    let h = "";
    if (c.label != null) h += leaf(slotAddr(id, "label"), c.label, "div", "ee-slot ee-slot-label");
    if (c.number != null) h += leaf(slotAddr(id, "number"), c.number, "div", "ee-slot ee-slot-number");
    if (c.caption != null) h += leaf(slotAddr(id, "caption"), c.caption, "p", "ee-slot ee-slot-caption");
    return { title: "", body: h };
  },

  // 11) card-grid → pastel-blocks
  "card-grid"(id, c) {
    const cards = (Array.isArray(c.cards) ? c.cards : []).slice(0, 6);
    const blocks = cards
      .map((cd, i) => {
        const o = cd && typeof cd === "object" ? cd : { heading: itemText(cd) };
        const head = o.heading != null ? leaf(subAddr(id, "cards", i + ".heading"), o.heading, "h3") : "";
        const body = o.body != null ? leaf(subAddr(id, "cards", i + ".body"), o.body, "p") : "";
        return "<div>" + head + body + "</div>";
      })
      .join("");
    return { title: titleEl(id, c), body: '<div class="blocks">' + blocks + "</div>" };
  },

  // 12) timeline (가로 번호)
  timeline(id, c) {
    const steps = Array.isArray(c.steps) ? c.steps : [];
    const lis = steps
      .map((st, i) => {
        const o = st && typeof st === "object" ? st : { body: itemText(st) };
        const head = o.heading != null ? '<span class="ts-heading">' + esc(o.heading) + "</span>" : "";
        const body = o.body != null ? esc(o.body) : esc(itemText(o));
        return "<li" + addrAttr(subAddr(id, "steps", i)) + ">" + head + body + "</li>";
      })
      .join("");
    return { title: titleEl(id, c), body: "<ol>" + lis + "</ol>" };
  },

  // 13) quote → hero-quote (풀블리드/중앙)
  quote(id, c) {
    let h = "<blockquote>";
    if (c.quote != null) h += leaf(slotAddr(id, "quote"), c.quote, "p", "quote-text");
    if (c.attribution != null) h += leaf(slotAddr(id, "attribution"), c.attribution, "p", "quote-attr");
    h += "</blockquote>";
    return { title: "", body: h };
  },

  // 14) limitation-guardrail → cols-2 + callout
  "limitation-guardrail"(id, c) {
    const col = (slot, items, label, extraCls) => {
      const callouts = (Array.isArray(items) ? items : [])
        .map((it, i) => leaf(subAddr(id, slot, i), itemText(it), "div", "callout"))
        .join("");
      return '<div class="lg-col ' + extraCls + '"><h3>' + esc(label) + "</h3>" + callouts + "</div>";
    };
    const b = '<div class="cols-2">' +
      col("limitations", c.limitations, "한계", "limitations") +
      col("guardrails", c.guardrails, "안전장치", "guardrails") +
      "</div>";
    return { title: titleEl(id, c), body: b };
  },

  // 15) expansion-map → roadmap
  "expansion-map"(id, c) {
    const tiers = Array.isArray(c.tiers) ? c.tiers : [];
    const cells = tiers
      .map((t, i) => {
        const o = t && typeof t === "object" ? t : { heading: itemText(t) };
        const cls = o.featured ? "tier featured" : "tier";
        let inner = "";
        if (o.phase != null) inner += leaf(subAddr(id, "tiers", i + ".phase"), o.phase, "div", "phase-detail");
        if (o.heading != null) inner += leaf(subAddr(id, "tiers", i + ".heading"), o.heading, "h3");
        if (o.body != null) inner += leaf(subAddr(id, "tiers", i + ".body"), o.body, "p");
        if (Array.isArray(o.items)) {
          inner += "<ul>" + o.items.map((it, j) => "<li" + addrAttr(subAddr(id, "tiers", i + ".items." + j)) + ">" + esc(itemText(it)) + "</li>").join("") + "</ul>";
        }
        return '<div class="' + cls + '">' + inner + "</div>";
      })
      .join("");
    return { title: titleEl(id, c), body: '<div class="tiers">' + cells + "</div>" };
  },

  // 16) closing → end (풀블리드/중앙)
  closing(id, c) {
    let h = "";
    if (c.title != null) h += leaf(slotAddr(id, "title"), c.title, "h1");
    if (c.subtitle != null) h += leaf(slotAddr(id, "subtitle"), c.subtitle, "h2");
    if (c.cta != null) h += leaf(slotAddr(id, "cta"), c.cta, "div", "end-cta");
    if (Array.isArray(c.tags)) {
      h += '<ul class="end-tags">' + c.tags.map((t, i) => "<li" + addrAttr(subAddr(id, "tags", i)) + ">" + esc(itemText(t)) + "</li>").join("") + "</ul>";
    }
    if (c.contact != null) h += leaf(slotAddr(id, "contact"), c.contact, "p", "end-contact");
    return { title: "", body: h };
  },
};

// 슬라이드 1장 → <section> (래퍼·data-*·notes·뷰어·edit overlay 유지)
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

  // 본문: 레이아웃별 렌더러가 있으면 그 고유 구조, 없으면 generic 폴백.
  // 렌더러는 { title, body } 를 반환한다. title(제목성 요소)은 .slide-inner 직속(상단 고정),
  // body 는 <div class="slide-body"> 로 감싸 남은 공간을 채운다.
  const renderer = LAYOUT_RENDERERS[s.semanticLayout];
  let titleHtml = "";
  let bodyHtml = "";
  if (renderer) {
    const out = renderer(s.id, content, assets);
    titleHtml = out.title || "";
    bodyHtml = out.body || "";
  } else {
    const slotNames = (layout && layout.slots) || Object.keys(content);
    const tagMap = { title: "h1", subtitle: "h2", eyebrow: "div", label: "div", number: "div", quote: "blockquote" };
    const parts = [];
    // title 슬롯은 제목성 요소로 분리(있으면 .slide-title 로 상단 고정).
    if (content.title != null) {
      titleHtml = leaf(slotAddr(s.id, "title"), content.title, "h1", "slide-title");
    }
    for (const name of slotNames) {
      if (name === "title") continue;
      if (content[name] == null) continue;
      parts.push(renderSlotGeneric(s.id, name, content[name], tagMap[name]));
    }
    for (const name of Object.keys(content)) {
      if (name === "title" || slotNames.includes(name)) continue;
      parts.push(renderSlotGeneric(s.id, name, content[name], tagMap[name]));
    }
    bodyHtml = parts.join("\n");
  }
  const slideBody = bodyHtml ? '<div class="slide-body">' + bodyHtml + "</div>" : "";

  // 이미지 자산: 렌더러가 직접 인라인하지 않은 경우에만 하단 묶음으로.
  // (인라인하더라도 편집 오버레이용으로 모든 asset 의 data-addr 노드는 유지해야 하므로
  //  ee-assets 블록을 항상 출력하되, 인라인 레이아웃은 CSS 로 숨긴다.)
  const imgParts = [];
  for (const name of Object.keys(assets)) {
    const html = renderImageRaw(s.id, name, assets[name], "ee-img");
    if (html) imgParts.push(html);
  }
  const assetsBlock = imgParts.length ? '<div class="ee-assets">' + imgParts.join("\n") + "</div>" : "";

  // demo-fullscreen: 첫 이미지를 .slide-inner 배경으로.
  let innerStyle = "";
  if (s.semanticLayout === "demo-fullscreen") {
    const a = normAsset(assets.image || assets[Object.keys(assets)[0]]);
    if (a) innerStyle = ' style="background-image:url(\'' + esc(a.src) + "')\"";
  }

  const notes = s.speakerNotes
    ? '<div class="ee-notes" hidden data-addr="' + esc(s.id + ".speakerNotes") + '">' + esc(s.speakerNotes) + "</div>"
    : "";

  // per-slide 콘텐츠 배율 노브. 미지정/1 이면 시각 변화 0 (CSS calc 의 기본값 1).
  // --slide-scale 는 section 에 주입(콘텐츠 font-size 만 calc 로 곱함). 프레임/간격은 불변.
  const scaleRaw = typeof s.contentScale === "number" ? s.contentScale : 1;
  const scale = Math.min(2, Math.max(0.5, scaleRaw));
  const scaleStyle = scale !== 1 ? ' style="--slide-scale:' + scale + '"' : "";

  return (
    '<section class="slide ' + esc(cls) + '"' +
    ' data-addr="' + esc(slideAddr(s.id)) + '"' +
    ' data-slide-id="' + esc(s.id) + '"' +
    ' data-layout="' + esc(s.semanticLayout) + '"' +
    ' data-duration="' + dur + '"' +
    ' data-impl="' + esc(impl) + '"' +
    scaleStyle + ">" +
    '<div class="notion-root slide-inner"' + innerStyle + ">" +
    implBadge +
    titleHtml +
    slideBody +
    assetsBlock +
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
    font-family:var(--notion-font-mono);font-size:calc(var(--notion-fs-big-number,200pt) * var(--slide-scale, 1));
    font-weight:800;color:var(--notion-purple,#5645d4);line-height:1;letter-spacing:-.05em;
  }
  .ee-slot-eyebrow{font-family:var(--notion-font-mono);font-size:calc(13pt * var(--slide-scale, 1));
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
