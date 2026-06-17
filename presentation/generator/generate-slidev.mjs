#!/usr/bin/env node
/**
 * generate-slidev.mjs — deck.json → presentation/slides.md (Slidev)
 *
 * Doc2 §11.
 *  - headmatter(맨 앞 --- ... ---): theme, title, lang, aspectRatio(16:9).
 *  - 슬라이드 구분자 '---'. 각 슬라이드는 semanticLayout→renderers.slidev 로
 *    engineLayout 을 정해 슬라이드 frontmatter 'layout:' 에 사용.
 *  - content 슬롯 → 마크다운 본문. assets → ![alt](경로).
 *  - speakerNotes → Slidev 발표자 노트(슬라이드 끝 <!-- ... -->) 로 반드시 포함.
 *  - implementationStatus != implemented → 배지 텍스트. dropped/blocked 제외.
 *
 * 슬라이드 구분 규약(= validate-slides.mjs 와 일치):
 *  - 파일 맨 앞 headmatter 1블록.
 *  - 슬라이드 사이는 "빈 줄 + '---' + 빈 줄" 의 구분자만 사용.
 *  - 슬라이드별 frontmatter 는 그 구분자 바로 다음에 'layout: ...' 한 줄로만 쓰고
 *    별도의 '---' 로 닫지 않는다(Slidev 는 구분자 직후 YAML 헤더를 슬라이드 메타로 인식).
 *    → 슬라이드 수 = 구분자 수(headmatter 제외) + 1 로 안정적으로 셀 수 있다.
 *
 * 입력 없으면 안내 후 exit 0 (throw 금지).
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const deckPath = resolve(presentationRoot, "deck.json");
const registryPath = resolve(__dirname, "layout-registry.json");
const outPath = resolve(presentationRoot, "slides.md");

const BANNER = "[generate-slidev]";

if (!existsSync(deckPath)) {
  console.log(BANNER + " 입력 없음: " + deckPath);
  console.log("  deck.json 을 생성한 뒤 다시 실행하세요. (예: cp generator/example-deck.json deck.json)");
  process.exit(0);
}

const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const layoutById = new Map(registry.layouts.map((l) => [l.semanticId, l]));

const meta = deck.meta || {};

function asLines(v) {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x)));
  return [String(v)];
}

// content 슬롯 → 마크다운
function renderContent(content, slotNames) {
  const lines = [];
  const seen = new Set();
  const emit = (name) => {
    if (content[name] == null || seen.has(name)) return;
    seen.add(name);
    const v = content[name];
    if (name === "title") { lines.push("# " + v, ""); return; }
    if (name === "subtitle" || name === "eyebrow") { lines.push("**" + asLines(v).join(" ") + "**", ""); return; }
    if (name === "number") { lines.push("# " + v, ""); return; }
    if (name === "quote") { lines.push("> " + asLines(v).join(" "), ""); return; }
    if (Array.isArray(v)) {
      lines.push("**" + name + "**", "");
      for (const item of asLines(v)) lines.push("- " + item);
      lines.push("");
      return;
    }
    lines.push(asLines(v).join(" "), "");
  };
  for (const name of slotNames) emit(name);
  for (const name of Object.keys(content)) emit(name); // 슬롯 밖 키 보존
  return lines;
}

function renderAssets(assets) {
  const lines = [];
  for (const key of Object.keys(assets)) {
    let v = assets[key];
    let src, status = "real";
    if (typeof v === "string") src = v;
    else if (v && typeof v === "object") { src = v.src; status = v.status || "real"; }
    if (!src) continue;
    const note = status !== "real" ? " <!-- " + status + " -->" : "";
    lines.push("![" + key + "](" + src + ")" + note);
  }
  if (lines.length) lines.push("");
  return lines;
}

const visibleSlides = (deck.slides || []).filter(
  (s) => s.implementationStatus !== "dropped" && s.implementationStatus !== "blocked"
);

// ---- headmatter ----
const head = [
  "---",
  "theme: " + (meta.theme || "default"),
  "title: " + JSON.stringify(meta.title || "Presentation"),
  "lang: " + (meta.language || "ko"),
  "aspectRatio: " + JSON.stringify(meta.aspectRatio || "16:9"),
  "---",
  "",
];

const blocks = [];
visibleSlides.forEach((s, idx) => {
  const layout = layoutById.get(s.semanticLayout);
  const engineLayout = s.engineLayout || (layout && layout.renderers.slidev) || "default";
  const slotNames = (layout && layout.slots) || Object.keys(s.content || {});

  const body = [];
  // 첫 슬라이드는 headmatter 가 곧 그 슬라이드의 frontmatter — layout 도 headmatter 에 못 넣었으니
  // 별도 구분자 블록으로 표현. 일관성을 위해 모든 슬라이드를 구분자+layout 으로 처리.
  if (idx > 0) {
    body.push("---");
    body.push("layout: " + engineLayout);
    body.push("---");
    body.push("");
  } else {
    // 첫 슬라이드: headmatter 직후. layout 을 주석으로 명시(슬라이드 수 셈에 영향 없음).
    body.push("<!-- layout: " + engineLayout + " -->");
    body.push("");
  }

  const impl = s.implementationStatus || "implemented";
  if (impl === "mocked" || impl === "fallback") {
    body.push("`" + impl.toUpperCase() + "`", "");
  }

  body.push(...renderContent(s.content || {}, slotNames));
  if (s.assets) body.push(...renderAssets(s.assets));

  if (s.speakerNotes) {
    body.push("<!--");
    body.push(s.speakerNotes);
    body.push("-->");
  }
  blocks.push(body.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
});

const md = head.join("\n") + blocks.join("\n");

writeFileSync(outPath, md, "utf8");
console.log(BANNER + " 생성 완료: " + outPath);
console.log("  슬라이드 " + visibleSlides.length + "장 (전체 " + (deck.slides || []).length + "장, dropped/blocked 제외).");
process.exit(0);
