---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
# theme 키 생략 = Slidev 기본 테마 (BaizeAI 와 동일 — heading 크기/레이아웃을 기본 테마가 제공).
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: "첫걸음 — 어려운 행정, 쉬운 첫 걸음"
lang: ko
lineNumbers: false
mdc: true
clicks: 0
glowSeed: 284
glow: full
slideId: "slide-01"
semanticLayout: "hero"
durationSeconds: 25
impl: "implemented"
---
<div class="flex flex-col items-center justify-center text-center">

<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90" data-addr="slide-01.content.eyebrow">행정 안내 도우미 · 첫걸음</div>

<h1 data-addr="slide-01.content.title">어려운 행정, 쉬운 첫 걸음</h1>

<div class="mt-4 max-w-3xl opacity-80 text-lg" data-addr="slide-01.content.subtitle">받은 문서나 막막한 상황을 넣으면 — 무슨 뜻인지·언제까지·당장 뭘 하면 되는지를, 공식 출처와 함께</div>
</div>

<div v-click class="mt-8" data-addr="slide-01.content.footnote"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80">문서·고지서·지원금·민원까지</div></div>

<!--
행정은 평생 몇 번 안 합니다. 그런데 막상 닥치면 겁부터 납니다. 첫걸음은 받은 문서·상황을 쉬운 말과 당장 할 첫 걸음으로, 공식 출처와 함께 바꿔줍니다.
-->

---
class: px-14 py-10
title: "정보가 없어서가 아니라, 막막함과 불신"
glowSeed: 285
glow: left
slideId: "slide-02"
semanticLayout: "problem-flow"
durationSeconds: 30
impl: "implemented"
---

<h1 data-addr="slide-02.content.title">정보가 없어서가 아니라, 막막함과 불신</h1>

<div mt-8>
  <div data-addr="slide-02.content.items" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>문제</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.items.0">
        <div i-carbon:warning-alt text-amber-300 text-xl shrink-0 />
        <span text-lg>27살 민우 씨, 법원에서 '지급명령'을 받는다</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.items.1">
        <div i-carbon:warning-alt text-amber-300 text-xl shrink-0 />
        <span text-lg>'송달·이의신청·청구이의' — 무슨 말인지 모른다</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.items.2">
        <div i-carbon:warning-alt text-amber-300 text-xl shrink-0 />
        <span text-lg>2주 안에 대응 안 하면 확정되는 것도 모른다</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-02.content.items.3">
        <div i-carbon:warning-alt text-amber-300 text-xl shrink-0 />
        <span text-lg>검색하면 블로그가 쏟아지는데, '내가 뭘 해야 하는지'와 '이게 맞는지'는 안 나온다</span>
      </div>
    </div>
  </div>
</div>

<!--
정부24도 있습니다. 문제는 정보 부족이 아니라 첫 걸음 앞의 막막함과, 뭐가 맞는지 모르는 불신입니다.
-->

---
class: px-14 py-10
title: "관점을 뒤집다 — '받는 방향'"
glowSeed: 286
glow: right
slideId: "slide-03"
semanticLayout: "contrast"
durationSeconds: 32
impl: "implemented"
---

<h1 data-addr="slide-03.content.title">관점을 뒤집다 — '받는 방향'</h1>

<div text-xl opacity-70 mt-1 data-addr="slide-03.content.lead">쉬운 말 · 당장 첫 걸음 · 출처, 셋을 한 화면에.</div>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-03.content.left" border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-red-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>정부24</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-03.content.left.0">
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>내가 '신청할 것'을 돕는다 (미는 방향, 용어 아는 사람용)</span>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-03.content.right" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:idea text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>첫걸음</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-03.content.right.0">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>내가 '받은 것'에서 출발한다 (받는 방향, 용어 모르는 사람용)</span>
      </div>
    </div>
  </div>
</div>

<!--
정부24는 신청을 돕습니다. 우리는 받은 문서에서 출발합니다. 그리고 쉬운 말·첫 걸음·출처를 한 화면에 묶었습니다 — 정부24도 ChatGPT도 안 하는 조합입니다.
-->

---
class: px-14 py-10
title: "받은 문서 → 첫 걸음 (폰 앱 라이브)"
glowSeed: 287
glow: center
slideId: "slide-04"
semanticLayout: "demo-callout"
durationSeconds: 123
impl: "implemented"
---

<h1 data-addr="slide-04.content.title">받은 문서 → 첫 걸음 (폰 앱 라이브)</h1>

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

<img src="/assets/wow-guide-card.png" alt="데모 화면" class="rounded-xl shadow-2xl mx-auto max-h-[48vh] w-auto object-contain" data-addr="slide-04.assets.image" data-asset-status="real">

</div>

<div grid gap-3>

<v-clicks>

<div data-addr="slide-04.content.callout.0" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-cyan-300 text-xl shrink-0 /><span font-medium text-lg>폰 앱에서 사진을 찍어 올리면 — 3초 만에 [뜻·기한·첫걸음·관할·출처] 카드로.</span></div>
</div>

</v-clicks>

</div>

</div>

<div mt-4 text-sm opacity-70 data-addr="slide-04.content.points">
- 기한 '2주 이내' · 첫 걸음 '그 법원에 이의신청서 제출'
- 각 안내에 출처 배지 — 법제처·법원 진짜 공식 링크 (AI 환각 아님, 검증된 출처만)
- 즉석 입력(건강보험 체납)도 같은 엔진 — 대본 아님
</div>

<!--
말로 설명하는 대신 폰 앱에서 직접 보여드립니다. 지급명령을 찍어 올리거나 붙여넣고 분석 → 카드. 핵심은 출처 배지(진짜 공식 링크)입니다. 즉석 입력으로 대본이 아님을 보입니다. 라이브가 흔들리면 이 캡처(run1-03-wow.png)로 진행.
-->

---
layout: center
title: "공식 출처로 검증되는 공공·복지 서비스"
glowSeed: 288
glow: bottom
slideId: "slide-05"
semanticLayout: "big-number"
durationSeconds: 15
impl: "implemented"
---

<div class="text-center">

<div class="opacity-70 tracking-wide" data-addr="slide-05.content.label">공식 출처로 검증되는 공공·복지 서비스</div>

<div v-click class="my-3 text-7xl font-extrabold text-cyan-300 leading-none" data-addr="slide-05.content.number">약 1.6만</div>

<div class="mt-4 opacity-55 text-sm max-w-xl mx-auto" data-addr="slide-05.content.caption">정부24·복지로 공개 데이터를 근거로, 지원금·복지·민원까지 진짜 공식 URL로 인용</div>

</div>

<!--
무서운 문서뿐 아니라 약 1만6천 건의 공공·복지 서비스에 대해서도 공식 출처로 안내합니다.
-->

---
class: px-14 py-10
title: "웹이 아니라, 폰에 설치되는 앱"
glowSeed: 292
glow: top
slideId: "slide-09"
semanticLayout: "demo-callout"
durationSeconds: 18
impl: "implemented"
---

<h1 data-addr="slide-09.content.title">웹이 아니라, 폰에 설치되는 앱</h1>

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

<img src="/assets/app-home.png" alt="데모 화면" class="rounded-xl shadow-2xl mx-auto max-h-[48vh] w-auto object-contain" data-addr="slide-09.assets.image" data-asset-status="real">

</div>

<div grid gap-3>

<v-clicks>

<div data-addr="slide-09.content.callout.0" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-cyan-300 text-xl shrink-0 /><span font-medium text-lg>PWA 계획을 넘어 — 실제 네이티브 APK로 동작 (시연용 빌드)</span></div>
</div>

<div data-addr="slide-09.content.callout.1" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-amber-300 text-xl shrink-0 /><span font-medium text-lg>사진 찍어 올리면 분석 → 결과 알림</span></div>
</div>

<div data-addr="slide-09.content.callout.2" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-green-300 text-xl shrink-0 /><span font-medium text-lg>위치는 관할(주소·사건) 기준 — 맞는 곳만</span></div>
</div>

<div data-addr="slide-09.content.callout.3" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-sky-300 text-xl shrink-0 /><span font-medium text-lg>입력 우선 모바일 UI · 한 손 사용</span></div>
</div>

</v-clicks>

</div>

</div>

<!--
그리고 이건 웹페이지가 아니라 폰에 설치되는 네이티브 앱입니다(시연용 디버그 빌드). 사진 입력·결과 알림·관할 기준 위치까지 — 모바일 온램프 컨셉을 실제 앱으로 구현했습니다.
-->

---
class: px-14 py-10
title: "똑똑함이 아니라 정직함"
glowSeed: 289
glow: full
slideId: "slide-06"
semanticLayout: "architecture"
durationSeconds: 25
impl: "implemented"
---

<h1 data-addr="slide-06.content.title">똑똑함이 아니라 정직함</h1>

<div mt-8>
  <div data-addr="slide-06.content.steps" border="2 solid blue-800" bg="blue-800/20" rounded-lg overflow-hidden>
    <div bg="blue-800/40" px-5 py-3 flex items-center>
      <div i-carbon:flow text-blue-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>동작 흐름</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-3 py-1 data-addr="slide-06.content.steps.0"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>1</div><div><div font-medium text-lg>멀티모달 AI가 받은 임의 문서를 해독</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-06.content.steps.1"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>2</div><div><div font-medium text-lg>시민의 말을 행정 개념으로 옮김 (검색·규칙 불가)</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-06.content.steps.2"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>3</div><div><div font-medium text-lg>답은 검증된 출처에서만 인용, 처리처·관할은 결정적 규칙으로 보정 (환각·오분류 차단)</div></div></div>
    </div>
  </div>
</div>

<div v-click mt-6 flex justify-center>
  <div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-3>
    <div i-carbon:idea text-yellow-300 text-2xl shrink-0 />
    <span text-lg><b>결과:</b> 그럴듯한 답이 아니라, 믿을 수 있는 안내</span>
  </div>
</div>

<!--
AI가 꼭 필요한 두 가지 — 임의 문서 해독, 시민 언어 변환. 단 출처는 검증된 코퍼스 안에서만 인용하고, 처리 채널·관할 기관은 결정적 규칙으로 보정해(예: 자동차세→시군구청+위택스) AI가 틀려도 엉뚱한 안내를 구조적으로 막습니다.
-->

---
class: px-14 py-10
title: "정직한 범위"
glowSeed: 290
glow: left
slideId: "slide-07"
semanticLayout: "limitation-guardrail"
durationSeconds: 22
impl: "implemented"
---

<h1 data-addr="slide-07.content.title">정직한 범위</h1>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-07.content.limitations" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>한계</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-07.content.limitations.0">
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>첫 걸음까지만 — 실제 신청·제출은 정부24로 핸드오프</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-07.content.limitations.1">
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>법률 자문이 아님 (이해를 돕는 보조 도구)</span>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-07.content.guardrails" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:shield-checkmark text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>안전장치</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-07.content.guardrails.0">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>근거 없으면 단정하지 않고 '공식 확인 필요'</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-07.content.guardrails.1">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>출처는 화이트리스트에서만 — 환각 URL 차단 (데모 검증)</span>
      </div>
    </div>
  </div>
</div>

<!--
정직합니다. 첫 걸음까지만 책임지고, 모르면 모른다고 말합니다.
-->

---
layout: center
title: "정부24는 '신청 버튼'을 줍니다."
glowSeed: 291
glow: right
slideId: "slide-08"
semanticLayout: "closing"
durationSeconds: 10
impl: "implemented"
---

<div class="text-center">

<h1 data-addr="slide-08.content.title">정부24는 '신청 버튼'을 줍니다.</h1>

<div class="opacity-70 mt-3 max-w-2xl mx-auto" data-addr="slide-08.content.subtitle">우리는, 그 버튼이 어디 있는지조차 모르는 사람을 — 거기까지 데려다줍니다.</div>

</div>

<div v-click class="mt-8" data-addr="slide-08.content.cta"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-cyan-100"><span class="i-carbon:play" /> 첫걸음 — 어려운 행정, 쉬운 첫 걸음</div></div>

<div class="mt-4 flex flex-wrap gap-2 justify-center" data-addr="slide-08.content.tags"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">쉬운 말</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">당장 첫 걸음</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">공식 출처</div></div>

<div class="mt-8" data-addr="slide-08.content.contact"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80"><span class="i-carbon:logo-github" /> 데모: 지급명령·전입신고·자동차세 + 폰 네이티브 앱 + 즉석 입력</div></div>

<!--
오프닝과 수렴하는 마지막 문장입니다(concept.md 그대로).
-->
