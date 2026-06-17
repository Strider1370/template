---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
theme: none
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: 우리 동네 맞춤 재난 대비 가이드
lineNumbers: false
mdc: true
clicks: 0
glowSeed: 229
glow: full
---

<div class="flex flex-col items-center justify-center text-center">

<div class="text-blue-300 tracking-widest text-sm opacity-80">2026 AI 해커톤 · 팀 OO</div>

# 우리 동네 맞춤 <span class="text-cyan-300">재난 대비 가이드</span>

<div class="mt-4 max-w-2xl opacity-80">
거주 지역·가족 구성만 입력하면 — 우리 가족에 꼭 맞는<br>행동요령과 가까운 대피 정보를 <b>한 화면에</b>
</div>

</div>

---
layout: center
glowSeed: 71
glow: left
---

## <span class="i-carbon:warning-alt text-red-400" /> 문제

<v-clicks>

<div class="mt-4 rounded-xl border border-white/15 bg-white/5 backdrop-blur px-5 py-3">
행동요령·대피소·쉼터·경보가 <span class="text-red-300">출처가 제각각</span>
</div>

<div class="mt-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur px-5 py-3">
안내가 '평균 국민' 기준 — 영유아·노인·장애인 맞춤은 직접 찾아야
</div>

<div class="mt-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur px-5 py-3">
정작 재난 순간엔 <b>검색할 여유가 없다</b>
</div>

</v-clicks>

<div v-click class="mt-8 flex items-end gap-3">
  <span class="text-7xl font-extrabold text-red-400">4곳+</span>
  <span class="opacity-60 mb-2">행동요령·대피소·쉼터·경보가 흩어진 출처 수</span>
</div>

---
layout: center
glowSeed: 142
glow: right
---

## <span class="i-carbon:checkmark-outline text-green-400" /> 솔루션

<div class="opacity-80"><span class="text-cyan-300 font-bold">지역 + 가족 구성</span> 두 입력으로 흩어진 정보를 맞춤형 한 화면에</div>

<div class="mt-6 grid grid-cols-3 gap-5">

<div v-click class="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-5 text-center">
  <div class="i-ph:first-aid-kit-duotone text-5xl text-green-300 mx-auto" />
  <div class="mt-3 text-sm">재난 유형별 행동요령<br><span class="opacity-60">(심각도 배지)</span></div>
</div>

<div v-click class="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-5 text-center">
  <div class="i-ph:users-three-duotone text-5xl text-green-300 mx-auto" />
  <div class="mt-3 text-sm">우리 가족 맞춤<br><span class="opacity-60">준비물·대피법</span></div>
</div>

<div v-click class="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-5 text-center">
  <div class="i-ph:map-pin-duotone text-5xl text-green-300 mx-auto" />
  <div class="mt-3 text-sm">가까운 대피소<br><span class="opacity-60">지도 + 거리순 목록</span></div>
</div>

</div>

---
layout: center
class: text-center
glowSeed: 205
glow: center
---

<div class="text-cyan-300 font-bold tracking-widest">차별점</div>

# '평균 국민'이 아니라<br><span class="text-cyan-300">우리 가족</span> 기준

<div v-click class="mt-6 mx-auto max-w-2xl rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-6 opacity-90">
가족 구성을 고르면 준비물·대피법·복약·동반대피가 자동 재구성.<br>
미국 <span class="text-cyan-200">Ready.gov 'Make a Plan'</span>을 한국 대피소 데이터와 결합.
</div>

---
layout: center
class: text-center
glowSeed: 17
glow: bottom
---

# 우리 동네 맞춤 재난 대비 가이드

<div class="opacity-70 mt-2">우리 가족 기준의 재난 대비, 한 화면에서.</div>

<div v-click class="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-5 py-2 text-sm opacity-80">
  <span class="i-carbon:logo-github" /> 팀 OO · github.com/OO
</div>
