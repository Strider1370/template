---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
# theme 키 생략 = Slidev 기본 테마 (BaizeAI 와 동일 — heading 크기/레이아웃을 기본 테마가 제공).
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: "레이아웃 갤러리 (16종)"
lang: ko
lineNumbers: false
mdc: true
clicks: 0
glowSeed: 284
glow: full
slideId: "slide-01"
semanticLayout: "hero"
durationSeconds: 20
impl: "implemented"
---
<div class="flex flex-col items-center justify-center text-center">

<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90" data-addr="slide-01.content.eyebrow">EYEBROW</div>

<h1 data-addr="slide-01.content.title">hero</h1>

<div class="mt-4 max-w-3xl opacity-80 text-lg" data-addr="slide-01.content.subtitle">부제목 — 한 줄 설명</div>
</div>

<div v-click class="mt-8" data-addr="slide-01.content.footnote"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80">각주 / 태그</div></div>

<!--
레이아웃 [hero] — 슬롯: eyebrow, title, subtitle, footnote
-->

---
class: px-14 py-10
title: "problem-flow"
glowSeed: 285
glow: left
slideId: "slide-02"
semanticLayout: "problem-flow"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-02.content.title">problem-flow</h1>

<div mt-8>
  <div data-addr="slide-02.content.items" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>문제</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-02.content.items.0">
        <div i-carbon:warning-alt text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>items 항목 1</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-02.content.items.1">
        <div i-carbon:warning-alt text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>items 항목 2</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-02.content.items.2">
        <div i-carbon:warning-alt text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>items 항목 3</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
    </div>
  </div>
</div>

<!--
레이아웃 [problem-flow] — 슬롯: title, items
-->

---
class: px-14 py-10
title: "contrast"
glowSeed: 286
glow: right
slideId: "slide-03"
semanticLayout: "contrast"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-03.content.title">contrast</h1>

<div text-xl opacity-70 mt-1 data-addr="slide-03.content.lead">리드 문장 (대비/맥락)</div>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-03.content.left" border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-red-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>기존</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-03.content.left.0">
        <div i-carbon:close text-red-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>left 항목 1</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-03.content.left.1">
        <div i-carbon:close text-red-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>left 항목 2</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-03.content.left.2">
        <div i-carbon:close text-red-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>left 항목 3</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-03.content.right" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:idea text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>개선</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-03.content.right.0">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>right 항목 1</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-03.content.right.1">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>right 항목 2</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-03.content.right.2">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>right 항목 3</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
    </div>
  </div>
</div>

<!--
레이아웃 [contrast] — 슬롯: title, lead, leftLabel, left, rightLabel, right
-->

---
layout: center
title: "insight-statement"
glowSeed: 287
glow: center
slideId: "slide-04"
semanticLayout: "insight-statement"
durationSeconds: 20
impl: "implemented"
---

<div class="text-center">

<div class="text-cyan-300 font-bold tracking-widest text-sm">인사이트</div>

<h1 data-addr="slide-04.content.title">insight-statement</h1>

</div>

<div v-click class="mt-8 mx-auto max-w-2xl"><div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ">
<div class="opacity-90" data-addr="slide-04.content.subtitle">부제목 — 한 줄 설명</div>
</div></div>

<!--
레이아웃 [insight-statement] — 슬롯: title, subtitle
-->

---
class: px-14 py-10
title: "product-overview"
glowSeed: 288
glow: bottom
slideId: "slide-05"
semanticLayout: "product-overview"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-05.content.title">product-overview</h1>

<div mt-6 grid grid-cols-3 gap-4 h-75>

<v-clicks>

  <div data-addr="slide-05.content.features.0" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-cyan-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>features 항목 1</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

  <div data-addr="slide-05.content.features.1" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-amber-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>features 항목 2</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

  <div data-addr="slide-05.content.features.2" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-green-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>features 항목 3</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

</v-clicks>

</div>

<!--
레이아웃 [product-overview] — 슬롯: title, features
-->

---
class: px-14 py-10
title: "demo-fullscreen"
glowSeed: 289
glow: top
slideId: "slide-06"
semanticLayout: "demo-fullscreen"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-06.content.title">demo-fullscreen</h1>

<div mt-4>

<div border="2 solid white/10" bg="white/5" backdrop-blur-sm rounded-xl grid place-items-center text-center class="h-[55vh]" data-addr="slide-06.assets.image" data-asset-status="placeholder">
  <div><div i-carbon:image text-6xl opacity-40 mx-auto /><div opacity-60 mt-2>데모 화면</div></div>
</div>

</div>

<div opacity-60 mt-3 data-addr="slide-06.content.subtitle">부제목 — 한 줄 설명</div>

<!--
레이아웃 [demo-fullscreen] — 슬롯: title, subtitle
-->

---
class: px-14 py-10
title: "demo-callout"
glowSeed: 290
glow: full
slideId: "slide-07"
semanticLayout: "demo-callout"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-07.content.title">demo-callout</h1>

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

<div border="2 solid white/10" bg="white/5" backdrop-blur-sm rounded-xl grid place-items-center text-center class="h-[55vh]" data-addr="slide-07.assets.image" data-asset-status="placeholder">
  <div><div i-carbon:image text-6xl opacity-40 mx-auto /><div opacity-60 mt-2>데모 화면</div></div>
</div>

</div>

<div grid gap-3>

<v-clicks>

<div data-addr="slide-07.content.callout.0" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-cyan-300 text-xl shrink-0 /><span font-medium text-lg>callout 항목 1</span></div><div text-sm opacity-70 mt-1 pl-7>샘플 설명 텍스트</div>
</div>

<div data-addr="slide-07.content.callout.1" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-amber-300 text-xl shrink-0 /><span font-medium text-lg>callout 항목 2</span></div><div text-sm opacity-70 mt-1 pl-7>샘플 설명 텍스트</div>
</div>

<div data-addr="slide-07.content.callout.2" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-green-300 text-xl shrink-0 /><span font-medium text-lg>callout 항목 3</span></div><div text-sm opacity-70 mt-1 pl-7>샘플 설명 텍스트</div>
</div>

</v-clicks>

</div>

</div>

<div mt-4 text-sm opacity-70 data-addr="slide-07.content.points">
- points 항목 1
- points 항목 2
- points 항목 3
</div>

<!--
레이아웃 [demo-callout] — 슬롯: title, callout, points
-->

---
class: px-14 py-10
title: "architecture"
glowSeed: 291
glow: left
slideId: "slide-08"
semanticLayout: "architecture"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-08.content.title">architecture</h1>

<div mt-8>
  <div data-addr="slide-08.content.steps" border="2 solid blue-800" bg="blue-800/20" rounded-lg overflow-hidden>
    <div bg="blue-800/40" px-5 py-3 flex items-center>
      <div i-carbon:flow text-blue-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>동작 흐름</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-3 py-1 data-addr="slide-08.content.steps.0"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>1</div><div><div font-medium text-lg>steps 항목 1</div><div text-sm opacity-70>샘플 설명 텍스트</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-08.content.steps.1"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>2</div><div><div font-medium text-lg>steps 항목 2</div><div text-sm opacity-70>샘플 설명 텍스트</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-08.content.steps.2"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>3</div><div><div font-medium text-lg>steps 항목 3</div><div text-sm opacity-70>샘플 설명 텍스트</div></div></div>
    </div>
  </div>
</div>

<div v-click mt-6 flex justify-center>
  <div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-3>
    <div i-carbon:idea text-yellow-300 text-2xl shrink-0 />
    <span text-lg><b>결과:</b> 핵심 결과 한 줄</span>
  </div>
</div>

<!--
레이아웃 [architecture] — 슬롯: title, steps, result
-->

---
class: px-14 py-10
title: "before-after"
glowSeed: 292
glow: right
slideId: "slide-09"
semanticLayout: "before-after"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-09.content.title">before-after</h1>

<div mt-8 grid gap-4 items-center class="grid-cols-[1fr_auto_1fr]">
  <div data-addr="slide-09.content.beforeCaption" border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center><div i-carbon:close-outline text-red-300 text-2xl mr-2 /><span font-bold text-xl>기존</span></div>
    <div px-5 py-4 text-lg opacity-90>기존 상태 설명</div>
  </div>
  <div i-carbon:arrow-right text-4xl opacity-50 mx-auto />
  <div v-click data-addr="slide-09.content.afterCaption" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center><div i-carbon:checkmark-outline text-green-300 text-2xl mr-2 /><span font-bold text-xl>개선</span></div>
    <div px-5 py-4 text-lg>개선된 상태 설명</div>
  </div>
</div>

<!--
레이아웃 [before-after] — 슬롯: title, beforeLabel, afterLabel, beforeCaption, afterCaption
-->

---
layout: center
title: "big-number"
glowSeed: 314
glow: center
slideId: "slide-10"
semanticLayout: "big-number"
durationSeconds: 20
impl: "implemented"
---

<div class="text-center">

<div class="opacity-70 tracking-wide" data-addr="slide-10.content.label">big-number</div>

<div v-click class="my-3 text-7xl font-extrabold text-cyan-300 leading-none" data-addr="slide-10.content.number">3분</div>

<div class="mt-4 opacity-55 text-sm max-w-xl mx-auto" data-addr="slide-10.content.caption">보조 설명 캡션</div>

</div>

<!--
레이아웃 [big-number] — 슬롯: label, number, caption
-->

---
class: px-14 py-10
title: "card-grid"
glowSeed: 315
glow: bottom
slideId: "slide-11"
semanticLayout: "card-grid"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-11.content.title">card-grid</h1>

<div mt-6 grid grid-cols-3 gap-4 h-75>

<v-clicks>

  <div data-addr="slide-11.content.cards.0" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-cyan-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>cards 항목 1</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

  <div data-addr="slide-11.content.cards.1" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-amber-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>cards 항목 2</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

  <div data-addr="slide-11.content.cards.2" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-green-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>cards 항목 3</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

</v-clicks>

</div>

<!--
레이아웃 [card-grid] — 슬롯: title, cards
-->

---
class: px-14 py-10
title: "timeline"
glowSeed: 316
glow: top
slideId: "slide-12"
semanticLayout: "timeline"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-12.content.title">timeline</h1>

<div mt-8>
  <div data-addr="slide-12.content.steps" border="2 solid indigo-800" bg="indigo-800/20" rounded-lg overflow-hidden>
    <div bg="indigo-800/40" px-5 py-3 flex items-center>
      <div i-carbon:roadmap text-indigo-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>동작 흐름</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-3 py-1 data-addr="slide-12.content.steps.0"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="indigo-800/60" text-indigo-100 text-sm font-bold>1</div><div><div font-medium text-lg>steps 항목 1</div><div text-sm opacity-70>샘플 설명 텍스트</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-12.content.steps.1"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="indigo-800/60" text-indigo-100 text-sm font-bold>2</div><div><div font-medium text-lg>steps 항목 2</div><div text-sm opacity-70>샘플 설명 텍스트</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-12.content.steps.2"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="indigo-800/60" text-indigo-100 text-sm font-bold>3</div><div><div font-medium text-lg>steps 항목 3</div><div text-sm opacity-70>샘플 설명 텍스트</div></div></div>
    </div>
  </div>
</div>

<!--
레이아웃 [timeline] — 슬롯: title, steps
-->

---
layout: center
title: "기억에 남을 한 문장."
glowSeed: 317
glow: full
slideId: "slide-13"
semanticLayout: "quote"
durationSeconds: 20
impl: "implemented"
---

<div class="text-center max-w-3xl mx-auto">

<div class="text-6xl text-cyan-300/30 leading-none">&ldquo;</div>

<blockquote class="text-2xl font-medium leading-relaxed" data-addr="slide-13.content.quote">기억에 남을 한 문장.</blockquote>

<div class="mt-6 opacity-70" data-addr="slide-13.content.attribution">— quote</div>

</div>

<!--
레이아웃 [quote] — 슬롯: quote, attribution
-->

---
class: px-14 py-10
title: "limitation-guardrail"
glowSeed: 318
glow: left
slideId: "slide-14"
semanticLayout: "limitation-guardrail"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-14.content.title">limitation-guardrail</h1>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-14.content.limitations" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>한계</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-14.content.limitations.0">
        <div i-carbon:dot-mark text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>limitations 항목 1</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-14.content.limitations.1">
        <div i-carbon:dot-mark text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>limitations 항목 2</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-14.content.limitations.2">
        <div i-carbon:dot-mark text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>limitations 항목 3</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-14.content.guardrails" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:shield-checkmark text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>안전장치</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-14.content.guardrails.0">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>guardrails 항목 1</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-14.content.guardrails.1">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>guardrails 항목 2</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-14.content.guardrails.2">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>guardrails 항목 3</div><div text-sm opacity-80>샘플 설명 텍스트</div></div>
      </div>
    </div>
  </div>
</div>

<!--
레이아웃 [limitation-guardrail] — 슬롯: title, limitations, guardrails
-->

---
class: px-14 py-10
title: "expansion-map"
glowSeed: 319
glow: right
slideId: "slide-15"
semanticLayout: "expansion-map"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-15.content.title">expansion-map</h1>

<div mt-6 grid grid-cols-3 gap-4 h-75>

<v-clicks>

  <div data-addr="slide-15.content.tiers.0" border="2 solid sky-800" bg="sky-800/20" rounded-lg overflow-hidden h-full>
    <div bg="sky-800/40" px-4 py-2 flex items-center justify-center>
      <span font-bold text-lg>tiers 항목 1</span>
    </div>
    <div px-4 py-4 flex flex-col gap-1>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

  <div data-addr="slide-15.content.tiers.1" border="2 solid purple-800" bg="purple-800/20" rounded-lg overflow-hidden h-full>
    <div bg="purple-800/40" px-4 py-2 flex items-center justify-center>
      <span font-bold text-lg>tiers 항목 2</span>
    </div>
    <div px-4 py-4 flex flex-col gap-1>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

  <div data-addr="slide-15.content.tiers.2" border="2 solid indigo-800" bg="indigo-800/20" rounded-lg overflow-hidden h-full>
    <div bg="indigo-800/40" px-4 py-2 flex items-center justify-center>
      <span font-bold text-lg>tiers 항목 3</span>
    </div>
    <div px-4 py-4 flex flex-col gap-1>
      <div text-sm opacity-80>샘플 설명 텍스트</div>
    </div>
  </div>

</v-clicks>

</div>

<!--
레이아웃 [expansion-map] — 슬롯: title, tiers
-->

---
layout: center
title: "closing"
glowSeed: 320
glow: center
slideId: "slide-16"
semanticLayout: "closing"
durationSeconds: 20
impl: "implemented"
---

<div class="text-center">

<h1 data-addr="slide-16.content.title">closing</h1>

<div class="opacity-70 mt-3 max-w-2xl mx-auto" data-addr="slide-16.content.subtitle">부제목 — 한 줄 설명</div>

</div>

<div v-click class="mt-8" data-addr="slide-16.content.cta"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-cyan-100"><span class="i-carbon:play" /> 데모 보기</div></div>

<div class="mt-4 flex flex-wrap gap-2 justify-center" data-addr="slide-16.content.tags"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">태그1</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">태그2</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">태그3</div></div>

<div class="mt-8" data-addr="slide-16.content.contact"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80"><span class="i-carbon:logo-github" /> github.com/team</div></div>

<!--
레이아웃 [closing] — 슬롯: title, subtitle, cta, tags, contact
-->
