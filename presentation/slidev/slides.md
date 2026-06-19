---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
# theme 키 생략 = Slidev 기본 테마 (BaizeAI 와 동일 — heading 크기/레이아웃을 기본 테마가 제공).
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: "샘플 발표 (레이아웃 데모)"
lang: ko
lineNumbers: false
mdc: true
clicks: 0
glowSeed: 284
glow: full
slideId: "slide-01"
semanticLayout: "hero"
durationSeconds: 30
impl: "implemented"
---
<div class="flex flex-col items-center justify-center text-center">

<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90" data-addr="slide-01.content.eyebrow">프로젝트 분야</div>

<h1 data-addr="slide-01.content.title">한 줄 결론을 여기에</h1>

<div class="mt-4 max-w-3xl opacity-80 text-lg" data-addr="slide-01.content.subtitle">누구에게 · 무엇을 · 어떻게 해결하는지 한 문장으로</div>
</div>

<div v-click class="mt-8" data-addr="slide-01.content.footnote"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80">근거·데이터 출처를 여기에</div></div>

<!--
발표 첫 문장입니다. 결론(결과)부터 한 문장으로 말합니다. (이 파일은 레이아웃 데모용 placeholder이며, 새 주제로 내용을 갈아끼웁니다.)
-->

---
class: px-14 py-10
title: "기존 방식 vs 우리 접근"
glowSeed: 285
glow: left
slideId: "slide-02"
semanticLayout: "contrast"
durationSeconds: 50
impl: "implemented"
---

<h1 data-addr="slide-02.content.title">기존 방식 vs 우리 접근</h1>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-02.content.left" border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-red-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>기존 방식</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.left.0">
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>기존 한계 1</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.left.1">
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>기존 한계 2</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.left.2">
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>기존 한계 3</span>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-02.content.right" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:idea text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>우리 접근</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.right.0">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>개선점 1</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.right.1">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>개선점 2</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.right.2">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>개선점 3</span>
      </div>
    </div>
  </div>
</div>

<!--
문제를 다르게 보는 관점을 좌우 대비로 보여줍니다.
-->

---
class: px-14 py-10
title: "핵심 데모 장면"
glowSeed: 286
glow: right
slideId: "slide-03"
semanticLayout: "demo-callout"
durationSeconds: 90
impl: "implemented"
---

<h1 data-addr="slide-03.content.title">핵심 데모 장면</h1>

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

<div border="2 solid white/10" bg="white/5" backdrop-blur-sm rounded-xl grid place-items-center text-center class="h-[55vh]" data-addr="slide-03.assets.image" data-asset-status="placeholder">
  <div><div i-carbon:image text-6xl opacity-40 mx-auto /><div opacity-60 mt-2>데모 화면</div><div text-xs opacity-40 mt-2 break-all>../output/captures/demo-main.png</div></div>
</div>

</div>

<div grid gap-3>

<v-clicks>

<div data-addr="slide-03.content.callout.0" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-cyan-300 text-xl shrink-0 /><span font-medium text-lg>데모 포인트 1</span></div>
</div>

<div data-addr="slide-03.content.callout.1" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-amber-300 text-xl shrink-0 /><span font-medium text-lg>데모 포인트 2</span></div>
</div>

<div data-addr="slide-03.content.callout.2" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-green-300 text-xl shrink-0 /><span font-medium text-lg>데모 포인트 3</span></div>
</div>

</v-clicks>

</div>

</div>

<div opacity-50 text-xs data-addr="slide-03.content.caption">데모 화면 캡처 자리</div>

<!--
실제 동작을 보여주는 부분입니다. 발표 시간의 절반 이상을 여기에 씁니다.
-->

---
layout: center
title: "핵심 지표"
glowSeed: 287
glow: center
slideId: "slide-04"
semanticLayout: "big-number"
durationSeconds: 40
impl: "implemented"
---

<div class="text-center">

<div class="opacity-70 tracking-wide" data-addr="slide-04.content.label">핵심 지표</div>

<div v-click class="my-3 text-7xl font-extrabold text-cyan-300 leading-none" data-addr="slide-04.content.number">00 → 00</div>

<div class="mt-4 opacity-55 text-sm max-w-xl mx-auto" data-addr="slide-04.content.caption">측정 근거를 여기에 (표본·기준 명시)</div>

</div>

<!--
효과를 숫자 하나로 보여줍니다. 근거를 함께 말합니다.
-->

---
class: px-14 py-10
title: "한계와 안전장치"
glowSeed: 288
glow: bottom
slideId: "slide-05"
semanticLayout: "limitation-guardrail"
durationSeconds: 50
impl: "mocked"
---

<div class="absolute top-4 right-6 text-xs px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200">MOCKED</div>

<h1 data-addr="slide-05.content.title">한계와 안전장치</h1>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-05.content.limitations" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>한계</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-05.content.limitations.0">
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>한계 1</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-05.content.limitations.1">
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>한계 2 (미구현/mocked)</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-05.content.limitations.2">
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>한계 3</span>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-05.content.guardrails" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:shield-checkmark text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>안전장치</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-05.content.guardrails.0">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>안전장치 1</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-05.content.guardrails.1">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>안전장치 2</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-05.content.guardrails.2">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>안전장치 3</span>
      </div>
    </div>
  </div>
</div>

<!--
한계를 솔직히 말하고, 그에 대한 안전장치를 제시합니다.
-->

---
layout: center
title: "기억에 남을 마지막 문장"
glowSeed: 289
glow: top
slideId: "slide-06"
semanticLayout: "closing"
durationSeconds: 40
impl: "implemented"
---

<div class="text-center">

<h1 data-addr="slide-06.content.title">기억에 남을 마지막 문장</h1>

<div class="opacity-70 mt-3 max-w-2xl mx-auto" data-addr="slide-06.content.subtitle">다음 단계를 여기에</div>

</div>

<div v-click class="mt-8" data-addr="slide-06.content.cta"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-cyan-100"><span class="i-carbon:play" /> 데모 주소를 여기에</div></div>

<div class="mt-8" data-addr="slide-06.content.contact"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80"><span class="i-carbon:logo-github" /> 팀 이름 · 연락처</div></div>

<!--
마지막 한 문장으로 닫습니다.
-->
