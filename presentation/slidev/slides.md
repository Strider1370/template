---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
# theme 키 생략 = Slidev 기본 테마 (BaizeAI 와 동일 — heading 크기/레이아웃을 기본 테마가 제공).
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: "우리 가족 맞춤 정부 혜택 찾기"
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

<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90" data-addr="slide-01.content.eyebrow">로그인 없이 30초</div>

<h1 data-addr="slide-01.content.title">우리 가족 맞춤 정부 혜택 찾기</h1>

<div class="mt-4 max-w-3xl opacity-80 text-lg" data-addr="slide-01.content.subtitle">가족 상황을 한 줄로 말하면, 받을 수 있는 혜택과 '왜 당신 가족이 해당되는지'를 AI가 설명합니다.</div>
</div>

<div v-click class="mt-8" data-addr="slide-01.content.footnote"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80">예시 데이터 기반 데모</div></div>

<!--
정부 혜택, 받을 수 있는데 몰라서 못 받는 분들 많습니다. 가족 상황을 한 줄로 말하면 로그인 없이 30초 만에 받을 수 있는 혜택과 '왜 당신이 해당되는지'를 AI가 설명해줍니다.
-->

---
class: px-14 py-10
title: "받을 수 있는데, 몰라서 못 받습니다"
glowSeed: 285
glow: left
slideId: "slide-02"
semanticLayout: "problem-flow"
durationSeconds: 35
impl: "implemented"
---

<h1 data-addr="slide-02.content.title">받을 수 있는데, 몰라서 못 받습니다</h1>

<div mt-8>
  <div data-addr="slide-02.content.items" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>문제</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-02.content.items.0">
        <div i-carbon:warning-alt text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>신청주의 사각지대</div><div text-sm opacity-80>내가 찾아 신청해야 줍니다. 제도는 많은데(맞춤 안내 대상만 128종) 내 가족 맞춤 전체를 보기 어렵습니다.</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-02.content.items.1">
        <div i-carbon:warning-alt text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>로그인 장벽</div><div text-sm opacity-80>정확히 알려면 본인인증·정보연계 동의가 먼저. 가장 도움이 필요한 분이 첫 화면에서 이탈합니다.</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-02.content.items.2">
        <div i-carbon:warning-alt text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>자기검열</div><div text-sm opacity-80>'기준이 엄격해 난 안 될 것 같다'며 시도조차 안 합니다.</div></div>
      </div>
    </div>
  </div>
</div>

<!--
한국 복지는 신청주의입니다. 제도는 128종이나 되는데 정작 내 가족이 뭘 받는지 보기 어렵고, 로그인 장벽에서 이탈하고, '난 안 될 것 같다'며 포기합니다. 8개월 아기 키우는 박지은 씨처럼요.
-->

---
layout: center
title: "'무엇을'이 아니라 '왜 당신이'"
glowSeed: 286
glow: right
slideId: "slide-03"
semanticLayout: "insight-statement"
durationSeconds: 30
impl: "implemented"
---

<div class="text-center">

<div class="text-cyan-300 font-bold tracking-widest text-sm">인사이트</div>

<h1 data-addr="slide-03.content.title">'무엇을'이 아니라 '왜 당신이'</h1>

</div>

<div v-click class="mt-8 mx-auto max-w-2xl"><div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ">
<div class="opacity-90" data-addr="slide-03.content.subtitle">정보·목록은 이미 넘칩니다. 핵심은 '왜 당신이 해당되는가'입니다. 그리고 AI의 자리는 자격 판정이 아니라 — 막연한 말을 알아듣고 규칙의 결과를 사람 말로 풀어주는 '통역사'입니다.</div>
</div></div>

<!--
정보는 넘치는데 행동으로 안 이어집니다. 복지 안내의 핵심은 무엇을 받나가 아니라 왜 당신이 해당되는가입니다. AI는 판정을 하면 거짓 안내가 나니, 통역사 역할만 맡깁니다.
-->

---
class: px-14 py-10
title: "한 줄 입력 → 규칙 매칭 → '왜?' 증명"
glowSeed: 287
glow: center
slideId: "slide-04"
semanticLayout: "architecture"
durationSeconds: 25
impl: "implemented"
---

<h1 data-addr="slide-04.content.title">한 줄 입력 → 규칙 매칭 → '왜?' 증명</h1>

<div mt-8>
  <div data-addr="slide-04.content.steps" border="2 solid blue-800" bg="blue-800/20" rounded-lg overflow-hidden>
    <div bg="blue-800/40" px-5 py-3 flex items-center>
      <div i-carbon:flow text-blue-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>동작 흐름</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-3 py-1 data-addr="slide-04.content.steps.0"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>1</div><div><div font-medium text-lg>입력 (로그인 없음)</div><div text-sm opacity-70>자연어 한 줄 또는 드롭다운</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-04.content.steps.1"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>2</div><div><div font-medium text-lg>AI 구조화</div><div text-sm opacity-70>가구유형·소득구간·지역으로 정리</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-04.content.steps.2"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>3</div><div><div font-medium text-lg>규칙 엔진 매칭</div><div text-sm opacity-70>결정론적 — 자격 판정은 AI가 아니라 규칙이</div></div></div>
      <div flex items-center gap-3 py-1 data-addr="slide-04.content.steps.3"><div w-6 h-6 shrink-0 grid place-items-center rounded-full bg="blue-800/60" text-blue-100 text-sm font-bold>4</div><div><div font-medium text-lg>카드로 증명</div><div text-sm opacity-70>충족 체크리스트 + AI가 다듬은 설명 + 신청 동선</div></div></div>
    </div>
  </div>
</div>

<div v-click mt-6 flex justify-center>
  <div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-3>
    <div i-carbon:idea text-yellow-300 text-2xl shrink-0 />
    <span text-lg><b>결과:</b> 자격 판정은 규칙이, 설명은 AI가 — 거짓 안내 없음</span>
  </div>
</div>

<!--
자연어 한 줄을 입력하면 AI가 구조화하고, 규칙 엔진이 결정론적으로 매칭합니다. 판정은 AI가 아니라 규칙이 합니다. 그리고 혜택마다 왜 해당되는지를 보여줍니다.
-->

---
class: px-14 py-10
title: "로그인 없이 30초, '왜 당신인지'까지"
glowSeed: 288
glow: bottom
slideId: "slide-05"
semanticLayout: "demo-callout"
durationSeconds: 120
impl: "implemented"
---

<div style="zoom:0.8">

<h1 data-addr="slide-05.content.title">로그인 없이 30초, '왜 당신인지'까지</h1>

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

<img src="../assets/screenshots/run1-step2-results.png" alt="데모 화면" class="rounded-xl shadow-2xl mx-auto" data-addr="slide-05.assets.image" data-asset-status="real">

</div>

<div grid gap-3>

<v-clicks>

<div data-addr="slide-05.content.callout.0" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-cyan-300 text-xl shrink-0 /><span font-medium text-lg>'이렇게 이해했어요' 칩</span></div><div text-sm opacity-70 mt-1 pl-7>영유아·서울·3명·월350·막내 8개월</div>
</div>

<div data-addr="slide-05.content.callout.1" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-amber-300 text-xl shrink-0 /><span font-medium text-lg>해당될 수 있는 혜택 5건</span></div><div text-sm opacity-70 mt-1 pl-7>'놓쳤다'가 아니라 '해당될 수 있는'</div>
</div>

<div data-addr="slide-05.content.callout.2" border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-green-300 text-xl shrink-0 /><span font-medium text-lg>카드마다 ✓근거 + '왜?' 설명</span></div><div text-sm opacity-70 mt-1 pl-7>부모급여: 막내 8개월 → 만 2세 미만 충족</div>
</div>

</v-clicks>

</div>

</div>

<div mt-4 text-sm opacity-70 data-addr="slide-05.content.points">
- 로그인 화면이 한 번도 안 나옴
- '예시 데이터' 라벨 상시
- 카드마다 신청 동선까지
</div>

</div>

<!--
지금부터 실제 화면입니다. (라이브 실패 시 단계별 스크린샷으로 동일 설명.) 박지은 씨 상황을 입력하면 — 로그인 없이 — '이렇게 이해했어요' 칩이 뜨고 혜택 5건이 나옵니다. 부모급여 카드를 보면 왜 해당되는지 체크리스트와 사람 말 설명이 즉시 뜹니다. 카드마다 신청하러 가기까지 이어집니다.
-->

---
class: px-14 py-10
title: "이미 있다고요? 결정적 차이 둘"
glowSeed: 289
glow: top
slideId: "slide-06"
semanticLayout: "contrast"
durationSeconds: 30
impl: "implemented"
---

<h1 data-addr="slide-06.content.title">이미 있다고요? 결정적 차이 둘</h1>

<div text-xl opacity-70 mt-1 data-addr="slide-06.content.lead">복지로·보조금24 대비</div>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-06.content.left" border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-red-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>기존 (복지로·보조금24)</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-06.content.left.0">
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>로그인·본인인증·정보연계 동의 전제</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-06.content.left.1">
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>'무엇을' 목록만 제공</span>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-06.content.right" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:idea text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>우리</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1 data-addr="slide-06.content.right.0">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>로그인 0회</span>
      </div>
      <div flex items-center gap-2 py-1 data-addr="slide-06.content.right.1">
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>'왜 당신이 해당되는지'까지</span>
      </div>
    </div>
  </div>
</div>

<!--
복지로에 이미 있잖아요? 차이는 둘입니다. 기존은 로그인·정보연계 동의가 전제이고 목록만 줍니다. 우리는 로그인 0회로 왜 당신인지까지 보여줍니다. 미국 ACCESS NYC·영국 Turn2us에서 벤치마킹한 메커니즘입니다.
-->

---
class: px-14 py-10
title: "마찰을 없애고, 확신을 더합니다"
glowSeed: 290
glow: full
slideId: "slide-07"
semanticLayout: "card-grid"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-07.content.title">마찰을 없애고, 확신을 더합니다</h1>

<div mt-6 grid grid-cols-3 gap-4 h-75>

<v-clicks>

  <div data-addr="slide-07.content.cards.0" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-cyan-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>진입 마찰 ↓</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>로그인·정보연계 동의 제거</div>
    </div>
  </div>

  <div data-addr="slide-07.content.cards.1" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-amber-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>포기 ↓</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>'왜 해당되는지' 근거로 자기검열 완화</div>
    </div>
  </div>

  <div data-addr="slide-07.content.cards.2" border="2 solid white/5" rounded-lg overflow-hidden bg="white/5" backdrop-blur-sm h-full>
    <div flex items-center bg="white/10" backdrop-blur px-3 py-2>
      <div i-carbon:dot-mark text-green-300 text-xl mr-2 shrink-0 />
      <div font-semibold text-lg>진입 속도 ↑</div>
    </div>
    <div px-4 py-3 flex flex-col gap-2>
      <div text-sm opacity-80>자연어 한 줄로 시작</div>
    </div>
  </div>

</v-clicks>

</div>

<!--
효과는 방향성으로 말씀드립니다. 진입 마찰을 줄이고, 왜를 보여줘 포기를 줄이고, 자연어로 진입을 빠르게 합니다. 구체 수치는 데모 단계라 주장하지 않습니다.
-->

---
class: px-14 py-10
title: "참고용 추정 — 책임은 분명히"
glowSeed: 291
glow: left
slideId: "slide-08"
semanticLayout: "limitation-guardrail"
durationSeconds: 20
impl: "implemented"
---

<h1 data-addr="slide-08.content.title">참고용 추정 — 책임은 분명히</h1>

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div data-addr="slide-08.content.limitations" border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>한계</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-08.content.limitations.0">
        <div i-carbon:dot-mark text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>예시 데이터 8~10건</div><div text-sm opacity-80>전국 전수가 아니라 대표 예시, 화면에 명시</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-08.content.limitations.1">
        <div i-carbon:dot-mark text-amber-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>단순화한 자격 임계값</div><div text-sm opacity-80>복잡한 소득 환산 등은 데모용으로 단순화</div></div>
      </div>
    </div>
  </div>
  <div v-click data-addr="slide-08.content.guardrails" border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:shield-checkmark text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>안전장치</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-start gap-2 py-1 data-addr="slide-08.content.guardrails.0">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>자격 판정은 규칙 엔진</div><div text-sm opacity-80>AI는 사실 생성 안 함 · 환각 숫자 자동 차단</div></div>
      </div>
      <div flex items-start gap-2 py-1 data-addr="slide-08.content.guardrails.1">
        <div i-carbon:checkmark text-green-300 text-xl mt-1 shrink-0 />
        <div><div font-bold>확정은 기관 심사</div><div text-sm opacity-80>신청 전 공식 채널에서 재확인</div></div>
      </div>
    </div>
  </div>
</div>

<!--
정직하게 말씀드립니다. 예시 데이터이고 자격은 단순화했습니다. 대신 판정은 규칙 엔진이 하고 AI는 사실을 못 만들게 막았으며, 최종 확정은 기관 심사입니다. 그래서 자격 판정을 AI에 맡기지 않았습니다.
-->

---
layout: center
title: "정부는 '받을 수 있다'고만 합니다. 우리는 '왜 당신인지'를 보여줍니다."
glowSeed: 292
glow: right
slideId: "slide-09"
semanticLayout: "closing"
durationSeconds: 20
impl: "implemented"
---

<div class="text-center">

<h1 data-addr="slide-09.content.title">정부는 '받을 수 있다'고만 합니다. 우리는 '왜 당신인지'를 보여줍니다.</h1>

<div class="opacity-70 mt-3 max-w-2xl mx-auto" data-addr="slide-09.content.subtitle">우리 가족 맞춤 정부 혜택 찾기</div>

</div>

<div class="mt-4 flex flex-wrap gap-2 justify-center" data-addr="slide-09.content.tags"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">무로그인</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">근거 가시화</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">AI 통역사</div></div>

<!--
정부는 받을 수 있다고만 합니다. 우리는 왜 당신인지를 보여줍니다. 감사합니다.
-->
