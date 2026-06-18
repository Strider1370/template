#!/usr/bin/env node
/**
 * generate-slidev.mjs — deck.json → presentation/slidev/slides.md (Slidev)
 *
 * BaizeAI/talks(Apache-2.0) 카드 언어로 렌더한다:
 *  - 다크 + glow 배경(theme:none, colorSchema:dark, transition:fade-out, global-bottom.vue).
 *  - 반투명 프로스트 카드(border-white/10 + bg-white/5 + backdrop-blur) + 아이콘 헤더.
 *  - <v-clicks> 스태거 등장 + 중앙 대형 타이틀 + 하단 콜아웃 필.
 *  - 16개 semanticLayout 각각에 전용 카드 템플릿을 매핑(layout-registry.json).
 *
 * 출력 경로:
 *  - presentation/slidev/slides.md 에 직접 쓴다. slidev build 는 프로젝트 디렉터리
 *    안의 slides.md 를 읽어야 uno.config.ts / global-bottom.vue / public/ 을 해석한다.
 *    (이미지 자산의 상대경로 ../output/... 도 이 위치 기준으로 맞는다.)
 *
 * 슬라이드 구분 규약(= validate-slides.mjs 와 일치):
 *  - 파일 맨 앞 headmatter 1블록(= 첫 슬라이드 frontmatter).
 *  - 이후 슬라이드는 "빈 줄 + '---' + per-slide frontmatter(빈 줄 없이) + '---' + 빈 줄".
 *  - per-slide frontmatter 안에는 빈 줄을 넣지 않는다(검증기가 빈 줄을 종료로 본다).
 *
 * 그 외:
 *  - speakerNotes → 슬라이드 끝 <!-- ... --> 발표자 노트.
 *  - implementationStatus(mocked/fallback) → 배지. dropped/blocked 슬라이드는 제외.
 *  - 모든 슬라이드에 nav 표시용 title: 부여(없으면 "undefined" 로 떠서).
 *  - 입력(deck.json) 없으면 안내 후 exit 0 (throw 금지).
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const presentationRoot = resolve(__dirname, "..");
const slidevDir = resolve(presentationRoot, "slidev");
const deckPath = resolve(presentationRoot, "deck.json");
const registryPath = resolve(__dirname, "layout-registry.json");
const outPath = resolve(slidevDir, "slides.md");

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

// ---- 고정 라벨(i18n 최소) ----
const EN = meta.language === "en";
const L = EN
  ? { insight: "INSIGHT", edge: "EDGE", problem: "PROBLEM", solution: "SOLUTION",
      limits: "Limitations", guards: "Safeguards", before: "Before", after: "After",
      result: "Result", demo: "Demo screen" }
  : { insight: "인사이트", edge: "차별점", problem: "문제", solution: "솔루션",
      limits: "한계", guards: "안전장치", before: "기존", after: "개선",
      result: "결과", demo: "데모 화면" };

// ---- 작은 유틸 ----
const asArr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
function toText(v) {
  if (Array.isArray(v)) return v.map(toText).join(" ");
  if (v && typeof v === "object") return String(v.title || v.label || v.name || v.text || "");
  return String(v ?? "");
}
function stripInline(s) {
  return String(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*`_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function itemParts(it) {
  if (it && typeof it === "object") {
    return {
      title: it.title || it.label || it.name || it.text || "",
      desc: it.desc || it.description || it.detail || it.subtitle || it.note || "",
      icon: it.icon || null,
    };
  }
  return { title: String(it ?? ""), desc: "", icon: null };
}

// ---- 카드 빌더 ----
function frost(inner, cls = "") {
  return `<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ${cls}">\n${inner}\n</div>`;
}
function pill(text, cls = "") {
  return `<div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm ${cls}">${text}</div>`;
}
function header(icon, color, title) {
  return `## <span class="${icon} ${color}" /> ${title}`;
}
function itemRow(it, accent = "") {
  const { title, desc } = itemParts(it);
  const d = desc ? `\n  <div class="text-sm opacity-70 mt-1">${desc}</div>` : "";
  return `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ${accent}">\n  <div class="font-medium">${title}</div>${d}\n</div>`;
}
// 여러 카드를 <v-clicks> 로 감싸 스태거 등장(블록 사이 빈 줄 필수).
function clickList(items, accent = "") {
  if (!items.length) return "";
  const rows = items.map((it) => itemRow(it, accent)).join("\n\n");
  return `<v-clicks>\n\n${rows}\n\n</v-clicks>`;
}
function bullets(items) {
  return asArr(items).map((it) => "- " + toText(it)).join("\n");
}
function colsFor(n) {
  return n <= 2 ? 2 : n === 4 ? 2 : 3;
}

// 이미지: 실파일 존재 + status:real 일 때만 렌더, 아니면 플레이스홀더 박스.
function imageBlock(assets, label) {
  const a = assets && (assets.image || assets.main || assets.screenshot || assets.primary);
  let src = null, status = "real";
  if (typeof a === "string") src = a;
  else if (a && typeof a === "object") { src = a.src; status = a.status || "real"; }
  if (src && status === "real" && existsSync(resolve(slidevDir, src))) {
    return `![${label}](${src}){.rounded-xl .shadow-2xl .mx-auto}`;
  }
  const cap = src ? `<div class="text-xs opacity-40 mt-2 break-all">${src}</div>` : "";
  return `<div class="rounded-xl border border-dashed border-white/20 bg-white/5 backdrop-blur grid place-items-center h-[42vh] text-center">
  <div><div class="i-carbon:image text-5xl opacity-40 mx-auto" /><div class="opacity-60 mt-2 text-sm">${label}</div>${cap}</div>
</div>`;
}

// ---- 레이아웃별 렌더러 (semanticId → body string) ----
const renderers = {
  hero(c) {
    const eyebrow = c.eyebrow ? `<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90">${toText(c.eyebrow)}</div>` : "";
    const subtitle = c.subtitle ? `<div class="mt-4 max-w-3xl opacity-80 text-lg">${toText(c.subtitle)}</div>` : "";
    const footnote = c.footnote ? `\n\n<div v-click class="mt-8">${pill(toText(c.footnote), "opacity-80")}</div>` : "";
    return `<div class="flex flex-col items-center justify-center text-center">

${eyebrow}

# ${toText(c.title)}

${subtitle}
</div>${footnote}`;
  },

  "problem-flow"(c) {
    return `${header("i-carbon:warning-alt", "text-amber-300", toText(c.title) || L.problem)}

<div class="mt-6 grid gap-3 max-w-3xl mx-auto w-full">

${clickList(asArr(c.items), "")}

</div>`;
  },

  contrast(c) {
    const lead = c.lead ? `<div class="opacity-80 text-center mb-5">${toText(c.lead)}</div>\n\n` : "";
    const left = frost(
      `<div class="text-sm font-bold tracking-wide text-red-300/90 mb-3">${toText(c.leftLabel) || L.before}</div>\n<div class="space-y-2 text-left opacity-90">\n${asArr(c.left).map((x) => `<div>· ${toText(x)}</div>`).join("\n")}\n</div>`
    );
    const right = `<div v-click>${frost(
      `<div class="text-sm font-bold tracking-wide text-cyan-300 mb-3">${toText(c.rightLabel) || L.after}</div>\n<div class="space-y-2 text-left">\n${asArr(c.right).map((x) => `<div>· ${toText(x)}</div>`).join("\n")}\n</div>`,
      "ring-1 ring-cyan-400/20"
    )}</div>`;
    return `## ${toText(c.title)}

${lead}<div class="mt-2 grid grid-cols-2 gap-6 items-start">

${left}

${right}

</div>`;
  },

  "insight-statement"(c) {
    const sub = c.subtitle
      ? `\n\n<div v-click class="mt-8 mx-auto max-w-2xl">${frost(`<div class="opacity-90">${toText(c.subtitle)}</div>`)}</div>`
      : "";
    return `<div class="text-center">

<div class="text-cyan-300 font-bold tracking-widest text-sm">${L.insight}</div>

# ${toText(c.title)}

</div>${sub}`;
  },

  "product-overview"(c) {
    const feats = asArr(c.features);
    const n = colsFor(feats.length);
    const cards = feats
      .map((f) => {
        const { title, desc, icon } = itemParts(f);
        const ic = icon || "i-carbon:checkmark-outline";
        const d = desc ? `<div class="mt-2 text-sm opacity-60">${desc}</div>` : "";
        return `<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center">
  <div class="${ic} text-4xl text-cyan-300 mx-auto" />
  <div class="mt-3 font-medium">${title}</div>
  ${d}
</div>`;
      })
      .join("\n\n");
    return `## ${toText(c.title) || L.solution}

<div class="mt-6 grid grid-cols-${n} gap-5">

<v-clicks>

${cards}

</v-clicks>

</div>`;
  },

  "demo-fullscreen"(c, s) {
    const sub = c.subtitle ? `<div class="opacity-60 text-sm mt-3 text-center">${toText(c.subtitle)}</div>` : "";
    return `## ${toText(c.title)}

<div class="mt-4">

${imageBlock(s.assets, L.demo)}

</div>

${sub}`;
  },

  "demo-callout"(c, s) {
    const callouts = clickList(asArr(c.callout), "");
    const points = c.points ? `\n\n<div class="mt-4 text-sm opacity-70">\n${bullets(c.points)}\n</div>` : "";
    const caption = c.caption ? `\n\n<div class="opacity-50 text-xs text-center">${toText(c.caption)}</div>` : "";
    return `## ${toText(c.title)}

<div class="mt-4 grid grid-cols-2 gap-6 items-center">

<div>

${imageBlock(s.assets, L.demo)}

</div>

<div class="grid gap-3">

${callouts}

</div>

</div>${points}${caption}`;
  },

  architecture(c) {
    const steps = asArr(c.steps);
    const rows = steps
      .map((st, i) => {
        const { title, desc } = itemParts(st);
        const d = desc ? `\n    <div class="text-sm opacity-70">${desc}</div>` : "";
        return `<div v-click class="flex items-center gap-4">
  <div class="shrink-0 w-9 h-9 grid place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 font-bold">${i + 1}</div>
  <div class="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left">
    <div class="font-medium">${title}</div>${d}
  </div>
</div>`;
      })
      .join("\n\n");
    const result = c.result
      ? `\n\n<div v-click class="mt-6 flex justify-center">${pill(`<span class="i-carbon:arrow-right text-cyan-300" /> <b>${L.result}:</b> ${toText(c.result)}`, "text-cyan-100")}</div>`
      : "";
    return `## ${toText(c.title)}

<div class="mt-6 grid gap-3 max-w-3xl mx-auto w-full">

${rows}

</div>${result}`;
  },

  "before-after"(c) {
    const before = frost(
      `<div class="text-sm font-bold text-red-300/90 mb-2">${toText(c.beforeLabel) || L.before}</div>\n<div class="opacity-85">${toText(c.beforeCaption)}</div>`
    );
    const after = `<div v-click>${frost(
      `<div class="text-sm font-bold text-cyan-300 mb-2">${toText(c.afterLabel) || L.after}</div>\n<div>${toText(c.afterCaption)}</div>`,
      "ring-1 ring-cyan-400/20"
    )}</div>`;
    return `## ${toText(c.title)}

<div class="mt-8 grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

${before}

<div class="i-carbon:arrow-right text-3xl opacity-50 mx-auto" />

${after}

</div>`;
  },

  "big-number"(c) {
    const label = c.label ? `<div class="opacity-70 tracking-wide">${toText(c.label)}</div>` : "";
    const caption = c.caption ? `<div class="mt-4 opacity-55 text-sm max-w-xl mx-auto">${toText(c.caption)}</div>` : "";
    return `<div class="text-center">

${label}

<div v-click class="my-3 text-7xl font-extrabold text-cyan-300 leading-none">${toText(c.number)}</div>

${caption}

</div>`;
  },

  "card-grid"(c) {
    const cards = asArr(c.cards);
    const n = colsFor(cards.length);
    return `## ${toText(c.title)}

<div class="mt-6 grid grid-cols-${n} gap-4">

${clickList(cards, "")}

</div>`;
  },

  timeline(c) {
    const steps = asArr(c.steps);
    const rows = steps
      .map((st, i) => {
        const { title, desc } = itemParts(st);
        const d = desc ? `\n    <div class="text-sm opacity-70">${desc}</div>` : "";
        return `<div v-click class="flex items-start gap-4">
  <div class="shrink-0 w-8 h-8 grid place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-sm font-bold">${i + 1}</div>
  <div class="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left">
    <div class="font-medium">${title}</div>${d}
  </div>
</div>`;
      })
      .join("\n\n");
    return `## ${toText(c.title)}

<div class="mt-6 grid gap-3 max-w-3xl mx-auto w-full">

${rows}

</div>`;
  },

  quote(c) {
    return `<div class="text-center max-w-3xl mx-auto">

<div class="text-6xl text-cyan-300/30 leading-none">&ldquo;</div>

<blockquote class="text-2xl font-medium leading-relaxed">${toText(c.quote)}</blockquote>

<div class="mt-6 opacity-70">— ${toText(c.attribution)}</div>

</div>`;
  },

  "limitation-guardrail"(c) {
    const limits = frost(
      `<div class="flex items-center gap-2 text-amber-300 font-bold mb-3"><span class="i-carbon:warning-alt" /> ${L.limits}</div>\n<div class="space-y-2 text-left opacity-90">\n${asArr(c.limitations).map((x) => `<div>· ${toText(x)}</div>`).join("\n")}\n</div>`
    );
    const guards = `<div v-click>${frost(
      `<div class="flex items-center gap-2 text-green-300 font-bold mb-3"><span class="i-carbon:shield-checkmark" /> ${L.guards}</div>\n<div class="space-y-2 text-left">\n${asArr(c.guardrails).map((x) => `<div>· ${toText(x)}</div>`).join("\n")}\n</div>`,
      "ring-1 ring-green-400/20"
    )}</div>`;
    return `## ${toText(c.title)}

<div class="mt-6 grid grid-cols-2 gap-6 items-start">

${limits}

${guards}

</div>`;
  },

  "expansion-map"(c) {
    const tiers = asArr(c.tiers);
    const n = colsFor(tiers.length);
    const cards = tiers
      .map((t) => {
        const { title, desc } = itemParts(t);
        const items = t && typeof t === "object" && Array.isArray(t.items)
          ? `\n  <div class="mt-3 space-y-1 text-sm opacity-75 text-left">\n${t.items.map((x) => `  <div>· ${toText(x)}</div>`).join("\n")}\n  </div>`
          : desc ? `\n  <div class="mt-2 text-sm opacity-70">${desc}</div>` : "";
        return `<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center">
  <div class="text-cyan-300 font-bold">${title}</div>${items}
</div>`;
      })
      .join("\n\n");
    return `## ${toText(c.title)}

<div class="mt-6 grid grid-cols-${n} gap-5">

<v-clicks>

${cards}

</v-clicks>

</div>`;
  },

  closing(c) {
    const subtitle = c.subtitle ? `<div class="opacity-70 mt-3 max-w-2xl mx-auto">${toText(c.subtitle)}</div>` : "";
    const cta = c.cta ? `\n\n<div v-click class="mt-8">${pill(`<span class="i-carbon:play" /> ${toText(c.cta)}`, "text-cyan-100")}</div>` : "";
    const tags = c.tags ? `\n\n<div class="mt-4 flex flex-wrap gap-2 justify-center">${asArr(c.tags).map((t) => pill(toText(t), "text-xs opacity-75")).join("")}</div>` : "";
    const foot = [c.team, c.contact].filter(Boolean).map(toText).join(" · ");
    const contact = foot ? `\n\n<div class="mt-8">${pill(`<span class="i-carbon:logo-github" /> ${foot}`, "opacity-80")}</div>` : "";
    return `<div class="text-center">

# ${toText(c.title)}

${subtitle}

</div>${cta}${tags}${contact}`;
  },
};

// 미등록/누락 레이아웃 폴백: 슬롯을 카드/리스트로 일반 렌더.
function fallbackRender(c) {
  const lines = [];
  if (c.title) lines.push("## " + toText(c.title), "");
  for (const [k, v] of Object.entries(c)) {
    if (k === "title") continue;
    if (Array.isArray(v)) {
      lines.push(`<div class="mt-3 grid gap-2 max-w-3xl mx-auto w-full">`, "", clickList(v, ""), "", "</div>");
    } else {
      lines.push(`<div class="opacity-85">${toText(v)}</div>`, "");
    }
  }
  return lines.join("\n");
}

// ---- glow 배분(슬라이드마다 다르게) ----
// 글로우 분포 — 구석(top-left/top-right/bottom-right)은 글로우가 한쪽에 몰려 나머지가
// 검게 보이므로 제외. 화면에 넓게 퍼지는 분포만 순환한다.
const GLOWS = ["full", "left", "right", "center", "bottom", "top"];
function glowFor(idx) {
  return idx === 0 ? "full" : GLOWS[idx % GLOWS.length];
}
function seedFor(s, idx) {
  const base = String(s.id || s.sceneId || idx);
  let h = 7;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return h % 360;
}
function deriveTitle(s) {
  const c = s.content || {};
  const raw = c.title || c.label || c.quote || c.number || c.eyebrow || meta.title || "Slide";
  const t = stripInline(toText(raw)).slice(0, 60);
  return t || "Slide";
}

// ---- 렌더 본체 ----
const visibleSlides = (deck.slides || []).filter(
  (s) => s.implementationStatus !== "dropped" && s.implementationStatus !== "blocked"
);

const head = [
  "---",
  "# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.",
  "# See presentation/sources/ASSET_LICENSES.md",
  "theme: none",
  "layout: center",
  "highlighter: shiki",
  "css: unocss",
  "colorSchema: dark",
  "transition: fade-out",
  "title: " + JSON.stringify(meta.title || "Presentation"),
  "lang: " + (meta.language || "ko"),
  "lineNumbers: false",
  "mdc: true",
  "clicks: 0",
  "glowSeed: " + (visibleSlides.length ? seedFor(visibleSlides[0], 0) : 229),
  "glow: full",
  "---",
  "",
];

const blocks = [];
visibleSlides.forEach((s, idx) => {
  const content = s.content || {};
  const renderer = renderers[s.semanticLayout] || (layoutById.has(s.semanticLayout) ? renderers[layoutById.get(s.semanticLayout).semanticId] : null);

  const body = [];
  if (idx > 0) {
    body.push("---");
    body.push("layout: center");
    body.push("title: " + JSON.stringify(deriveTitle(s)));
    body.push("glowSeed: " + seedFor(s, idx));
    body.push("glow: " + glowFor(idx));
    body.push("---");
    body.push("");
  }

  const impl = s.implementationStatus || "implemented";
  if (impl === "mocked" || impl === "fallback") {
    body.push(`<div class="absolute top-4 right-6 text-xs px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200">${impl.toUpperCase()}</div>`, "");
  }

  const rendered = renderer ? renderer(content, s) : fallbackRender(content);
  body.push(rendered, "");

  if (s.speakerNotes) {
    body.push("<!--");
    body.push(String(s.speakerNotes));
    body.push("-->");
  }

  blocks.push(body.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
});

const md = head.join("\n") + blocks.join("\n");

writeFileSync(outPath, md, "utf8");
console.log(BANNER + " 생성 완료: " + outPath);
console.log("  슬라이드 " + visibleSlides.length + "장 (전체 " + (deck.slides || []).length + "장, dropped/blocked 제외).");
process.exit(0);
