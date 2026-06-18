#!/usr/bin/env node
/**
 * generate-slidev.mjs — deck.json → presentation/slidev/slides.md (Slidev)
 *
 * BaizeAI/talks(Apache-2.0) 카드 언어로 렌더한다:
 *  - 기본 테마 + 다크 + glow 배경(colorSchema:dark, transition:fade-out, global-bottom.vue).
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
      result: "Result", demo: "Demo screen", flow: "How it works" }
  : { insight: "인사이트", edge: "차별점", problem: "문제", solution: "솔루션",
      limits: "한계", guards: "안전장치", before: "기존", after: "개선",
      result: "결과", demo: "데모 화면", flow: "동작 흐름" };

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
  return `# <span class="${icon} ${color}" /> ${title}`;
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

// 가운데 정렬로 두는 레이아웃(타이틀/숫자/인용/마무리). 그 외 본문 슬라이드는 위 정렬(큰 제목).
const CENTERED = new Set(["hero", "insight-statement", "big-number", "quote", "closing"]);

// ---- BaizeAI 색깔 패널 언어 (compare 슬라이드 그대로) ----
// 색 테두리(border 2 solid X-800) + 틴트 배경(bg X-800/20) + 헤더 바(X-800/40) + 아이콘 항목.
// 마크업은 빈 줄 없이 하나의 HTML 트리로 낸다(=BaizeAI 방식, MDC 재진입 방지).
function panelItem(it, iconCls, iconColor) {
  const { title, desc } = itemParts(it);
  if (desc) {
    return `      <div flex items-start gap-2 py-1>
        <div ${iconCls} text-${iconColor}-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>${title}</div><div text-sm opacity-80>${desc}</div></div>
      </div>`;
  }
  return `      <div flex items-center gap-2 py-1>
        <div ${iconCls} text-${iconColor}-300 text-xl shrink-0 />
        <span text-lg>${title}</span>
      </div>`;
}
function colorPanel({ color, headIcon, head, items, itemIcon, itemColor, vclick }) {
  const rows = asArr(items).map((it) => panelItem(it, itemIcon, itemColor || color)).join("\n");
  const vc = vclick ? " v-click" : "";
  return `  <div${vc} border="2 solid ${color}-800" bg="${color}-800/20" rounded-lg overflow-hidden>
    <div bg="${color}-800/40" px-5 py-3 flex items-center>
      <div ${headIcon} text-${color}-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>${head}</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
${rows}
    </div>
  </div>`;
}
// 본문 제목(h1) + 선택적 서브타이틀. 기본 테마가 h1 을 크게 렌더한다.
function titleH1(title, sub) {
  const s = sub ? `\n\n<div text-xl opacity-70 mt-1>${toText(sub)}</div>` : "";
  return `# ${toText(title)}${s}`;
}

// ---- BaizeAI 카드 그리드/스텝 (127·1766·1303 소스 그대로) ----
const ACCENTS = ["cyan", "amber", "green", "sky", "purple", "rose"];
const HUES = ["sky", "purple", "indigo", "emerald", "rose", "amber"];

// 중립 카드(127): white/5 + 헤더바(white/10)+아이콘 + 본문(하위 items or desc).
function neutralCard(card, idx) {
  const { title, desc, icon } = itemParts(card);
  const accent = ACCENTS[idx % ACCENTS.length];
  const ic = icon || "i-carbon:dot-mark";
  let body;
  if (card && typeof card === "object" && Array.isArray(card.items)) {
    body = card.items.map((x) => {
      const p = itemParts(x);
      const d = p.desc ? `<div text-xs opacity-70>${p.desc}</div>` : "";
      return `      <div><div text-sm font-medium>${p.title}</div>${d}</div>`;
    }).join("\n");
  } else {
    body = `      <div text-sm opacity-80>${desc || ""}</div>`;
  }
  return `  <div border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div ${ic} text-${accent}-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>${title}</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
${body}
    </div>
  </div>`;
}

// 다색 카드(1766): tier/색 구분. items 를 dot 행으로.
function coloredCard(card, idx) {
  const { title, desc } = itemParts(card);
  const color = HUES[idx % HUES.length];
  const list = card && typeof card === "object" && Array.isArray(card.items) ? card.items : null;
  const body = list
    ? list.map((x) => `      <div flex items-center gap-2 py-1><div i-carbon:dot-mark text-${color}-300 shrink-0 /><span text-sm>${toText(x)}</span></div>`).join("\n")
    : `      <div text-sm opacity-80>${desc || ""}</div>`;
  return `  <div border="2 solid ${color}-800" bg="${color}-800/20" rounded-lg overflow-hidden h-full>
    <div bg="${color}-800/40" px-4 py-2 flex items-center justify-center>
      <span font-bold text-lg>${title}</span>
    </div>
    <div px-4 py-4 flex flex-col gap-1>
${body}
    </div>
  </div>`;
}

// v-clicks 스태거 카드 그리드(블록 사이 빈 줄 필수 = BaizeAI 127 방식). h-75 고정높이로 꽉 채움.
function cardGrid(cards, render, { cols, height = "h-75" } = {}) {
  const list = asArr(cards);
  const n = cols || colsFor(list.length);
  const inner = list.map((c, i) => render(c, i)).join("\n\n");
  return `<div mt-6 grid grid-cols-${n} gap-4 ${height}>

<v-clicks>

${inner}

</v-clicks>

</div>`;
}

// 스텝 패널(1303): 색깔 패널 + 헤더 + 스텝 행(번호 or dot).
function stepPanel({ color, head, headIcon, steps, numbered }) {
  const rows = asArr(steps).map((st, i) => {
    const { title, desc } = itemParts(st);
    const marker = numbered
      ? `<div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="${color}-800/60" text-${color}-100 text-sm font-bold>${i + 1}</div>`
      : `<div i-carbon:dot-mark text-${color}-300 text-xl shrink-0 />`;
    const d = desc ? `<div text-sm opacity-70>${desc}</div>` : "";
    return `      <div flex items-center gap-3 py-1>${marker}<div><div font-medium text-lg>${title}</div>${d}</div></div>`;
  }).join("\n");
  return `  <div border="2 solid ${color}-800" bg="${color}-800/20" rounded-lg overflow-hidden>
    <div bg="${color}-800/40" px-5 py-3 flex items-center>
      <div ${headIcon} text-${color}-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>${head}</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
${rows}
    </div>
  </div>`;
}

// 하단 결론 콜아웃 바(127): white/5 + idea 아이콘 + 문장.
function calloutBar(icon, text) {
  return `<div v-click mt-6 flex justify-center>
  <div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-3>
    <div ${icon} text-yellow-300 text-2xl shrink-0 />
    <span text-lg>${text}</span>
  </div>
</div>`;
}

// 데모 callout 한 줄(white/5 행).
function calloutRow(it, idx) {
  const { title, desc } = itemParts(it);
  const accent = ACCENTS[idx % ACCENTS.length];
  const d = desc ? `<div text-sm opacity-70 mt-1 pl-7>${desc}</div>` : "";
  return `<div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-${accent}-300 text-xl shrink-0 /><span font-medium text-lg>${title}</span></div>${d}
</div>`;
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
  // 실제 스크린샷이 없을 때의 자리 표시. BaizeAI 엔 데모 스크린샷 패턴이 없어 white/5 중립 패널로 일관성만 맞춘 추정 스타일.
  const cap = src ? `<div text-xs opacity-40 mt-2 break-all>${src}</div>` : "";
  return `<div border="2 solid white/10" bg="white/5" backdrop-blur-sm rounded-xl grid place-items-center text-center class="h-[55vh]">
  <div><div i-carbon:image text-6xl opacity-40 mx-auto /><div opacity-60 mt-2>${label}</div>${cap}</div>
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
    const panel = colorPanel({
      color: "amber", headIcon: "i-carbon:warning-alt", head: L.problem,
      items: c.items, itemIcon: "i-carbon:warning-alt", itemColor: "amber",
    });
    return `${titleH1(c.title)}

<div mt-8>
${panel}
</div>`;
  },

  contrast(c) {
    const left = colorPanel({
      color: "red", headIcon: "i-carbon:warning-alt", head: toText(c.leftLabel) || L.before,
      items: c.left, itemIcon: "i-carbon:close", itemColor: "red",
    });
    const right = colorPanel({
      color: "green", headIcon: "i-carbon:idea", head: toText(c.rightLabel) || L.after,
      items: c.right, itemIcon: "i-carbon:checkmark", itemColor: "green", vclick: true,
    });
    return `${titleH1(c.title, c.lead)}

<div mt-8 grid grid-cols-2 gap-6 items-start>
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
    return `${titleH1(toText(c.title) || L.solution)}

${cardGrid(c.features, neutralCard)}`;
  },

  "demo-fullscreen"(c, s) {
    const sub = c.subtitle ? `\n\n<div opacity-60 mt-3>${toText(c.subtitle)}</div>` : "";
    return `${titleH1(c.title)}

<div mt-4>

${imageBlock(s.assets, L.demo)}

</div>${sub}`;
  },

  "demo-callout"(c, s) {
    const rows = asArr(c.callout).map((it, i) => calloutRow(it, i)).join("\n\n");
    const callouts = rows ? `<v-clicks>\n\n${rows}\n\n</v-clicks>` : "";
    const points = c.points ? `\n\n<div mt-4 text-sm opacity-70>\n${bullets(c.points)}\n</div>` : "";
    const caption = c.caption ? `\n\n<div opacity-50 text-xs>${toText(c.caption)}</div>` : "";
    return `${titleH1(c.title)}

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

${imageBlock(s.assets, L.demo)}

</div>

<div grid gap-3>

${callouts}

</div>

</div>${points}${caption}`;
  },

  architecture(c) {
    const panel = stepPanel({
      color: "blue", head: L.flow, headIcon: "i-carbon:flow",
      steps: c.steps, numbered: true,
    });
    const result = c.result ? "\n\n" + calloutBar("i-carbon:idea", `<b>${L.result}:</b> ${toText(c.result)}`) : "";
    return `${titleH1(c.title)}

<div mt-8>
${panel}
</div>${result}`;
  },

  "before-after"(c) {
    const before = `  <div border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center><div i-carbon:close-outline text-red-300 text-2xl mr-2 /><span font-bold text-xl>${toText(c.beforeLabel) || L.before}</span></div>
    <div px-5 py-4 text-lg opacity-90>${toText(c.beforeCaption)}</div>
  </div>`;
    const after = `  <div v-click border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center><div i-carbon:checkmark-outline text-green-300 text-2xl mr-2 /><span font-bold text-xl>${toText(c.afterLabel) || L.after}</span></div>
    <div px-5 py-4 text-lg>${toText(c.afterCaption)}</div>
  </div>`;
    return `${titleH1(c.title)}

<div mt-8 grid gap-4 items-center class="grid-cols-[1fr_auto_1fr]">
${before}
  <div i-carbon:arrow-right text-4xl opacity-50 mx-auto />
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
    return `${titleH1(c.title)}

${cardGrid(c.cards, neutralCard)}`;
  },

  timeline(c) {
    const panel = stepPanel({
      color: "indigo", head: L.flow, headIcon: "i-carbon:roadmap",
      steps: c.steps, numbered: true,
    });
    return `${titleH1(c.title)}

<div mt-8>
${panel}
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
    const limits = colorPanel({
      color: "amber", headIcon: "i-carbon:warning-alt", head: L.limits,
      items: c.limitations, itemIcon: "i-carbon:dot-mark", itemColor: "amber",
    });
    const guards = colorPanel({
      color: "green", headIcon: "i-carbon:shield-checkmark", head: L.guards,
      items: c.guardrails, itemIcon: "i-carbon:checkmark", itemColor: "green", vclick: true,
    });
    return `${titleH1(c.title)}

<div mt-8 grid grid-cols-2 gap-6 items-start>
${limits}
${guards}
</div>`;
  },

  "expansion-map"(c) {
    return `${titleH1(c.title)}

${cardGrid(c.tiers, coloredCard)}`;
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
  if (c.title) lines.push("# " + toText(c.title), "");
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
  "# theme 키 생략 = Slidev 기본 테마 (BaizeAI 와 동일 — heading 크기/레이아웃을 기본 테마가 제공).",
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

  const centered = CENTERED.has(s.semanticLayout);
  const body = [];
  if (idx > 0) {
    body.push("---");
    // 타이틀/숫자/인용/마무리는 가운데 정렬, 본문 슬라이드는 기본(위 정렬)+여백으로 큰 제목.
    if (centered) body.push("layout: center");
    else body.push("class: px-14 py-10");
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
  // per-slide contentScale(0.5~2, 미지정=1): 본문 블록 전체를 zoom 으로 확대/축소(프레임 여백은 고정).
  // 미지정/1 이면 래퍼 없이 그대로 — 기본 출력은 변화 0. (Notion 폴백은 글자만 calc 로 배율)
  const scaleRaw = typeof s.contentScale === "number" ? s.contentScale : 1;
  const scale = Math.min(2, Math.max(0.5, scaleRaw));
  const scaled = scale !== 1 ? `<div style="zoom:${scale}">\n\n${rendered}\n\n</div>` : rendered;
  body.push(scaled, "");

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
