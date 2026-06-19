---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
theme: none
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: "임신·출산 지원의 시계"
lang: ko
lineNumbers: false
mdc: true
clicks: 0
glowSeed: 284
glow: full
---
<div class="flex flex-col items-center justify-center text-center">

<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90">임산부·신생아 원스톱 지원</div>

# 임신·출산 지원의 시계

<div class="mt-4 max-w-3xl opacity-80 text-lg">지금 받아야 하는 지원을, 시간순으로</div>
</div>

<div v-click class="mt-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80">정부 1차출처 검증 데이터 · 키 없이도 동작</div></div>

<!--
여러분, 첫 아이 가진 임산부가 제일 많이 듣는 말이 뭔지 아세요? '그거 기한 지나셨어요.' 지원이 없어서가 아니라, 언제 신청할지를 몰라서 놓치는 겁니다. 저희는 주차·예정일·사는 동네만 넣으면 지금 받을 것부터 순서대로 보여주고, 놓치면 사라질 돈을 D-day로 알려줍니다.
-->

---
layout: center
title: "지원이 없어서가 아니라, '언제'를 몰라서 놓친다"
glowSeed: 285
glow: left
---

## <span class="i-carbon:warning-alt text-amber-300" /> 지원이 없어서가 아니라, '언제'를 몰라서 놓친다

<div class="mt-6 grid gap-3 max-w-3xl mx-auto w-full">

<v-clicks>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">정보는 정부24·복지로·아이사랑에 이미 넘친다</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">부모급여·첫만남이용권은 출생 60일 안에 신청해야 출생월부터 소급</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">산모·신생아 건강관리는 출산예정 40일 전~출산 30일 후, 좁은 신청 창</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">며칠을 놓치면 수십만 원이 그대로 사라진다</div>
</div>

</v-clicks>

</div>

<!--
실제로요. 부모급여랑 첫만남이용권은 출생 60일 안에 신청 안 하면 소급분이 날아가요. 산모·신생아 건강관리는 출산 40일 전부터 30일 후까지, 딱 그 사이에만 됩니다. 정보가 없어서가 아니에요. 정부24, 복지로, 아이사랑, 정보는 넘쳐요. 근데 내가 지금 뭘 해야 하는지는 아무도 안 알려줍니다.
-->

---
layout: center
title: "정보 부족 문제가 아니라, 타이밍 문제다"
glowSeed: 286
glow: right
---

## 정보 부족 문제가 아니라, 타이밍 문제다

<div class="opacity-80 text-center mb-5">정부24는 신청 창구, 우리는 시간축 내비게이션</div>

<div class="mt-2 grid grid-cols-2 gap-6 items-start">

<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ">
<div class="text-sm font-bold tracking-wide text-red-300/90 mb-3">정부24 = 신청 창구</div>
<div class="space-y-2 text-left opacity-90">
<div>· 무엇을 신청할지는 사용자가 알아야 함</div>
<div>· 임신용·출산용으로 분절</div>
<div>· 시간 순서·마감 개념이 없음</div>
</div>
</div>

<div v-click><div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ring-1 ring-cyan-400/20">
<div class="text-sm font-bold tracking-wide text-cyan-300 mb-3">우리 = 시간축 내비게이션</div>
<div class="space-y-2 text-left">
<div>· '지금 신청 → 곧 열림' 시간순 정렬</div>
<div>· 마감 임박은 D-day 손실 경고</div>
<div>· 거주지 자동 매칭</div>
</div>
</div></div>

</div>

<!--
그래서 문제를 다시 봤습니다. 이건 정보의 문제가 아니라 타이밍의 문제다. 정부24가 신청 창구라면, 저희는 언제 어디로 가야 하는지 알려주는 내비게이션입니다.
-->

---
layout: center
title: "세 가지만 넣으면 됩니다"
glowSeed: 287
glow: center
---

## 세 가지만 넣으면 됩니다

<div class="mt-6 grid grid-cols-3 gap-5">

<v-clicks>

<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center">
  <div class="i-carbon:checkmark-outline text-4xl text-cyan-300 mx-auto" />
  <div class="mt-3 font-medium">임신 주차 또는 출산예정일</div>
  
</div>

<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center">
  <div class="i-carbon:checkmark-outline text-4xl text-cyan-300 mx-auto" />
  <div class="mt-3 font-medium">거주지 (시도·시군구)</div>
  
</div>

<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 text-center">
  <div class="i-carbon:checkmark-outline text-4xl text-cyan-300 mx-auto" />
  <div class="mt-3 font-medium">→ 받을 수 있는 지원이 시간순으로 정렬되고, 마감이 임박한 건 손실로 경고</div>
  
</div>

</v-clicks>

</div>

<!--
주차, 예정일, 사는 동네. 이 세 가지만 넣으면 끝이에요. 지금 받을 수 있는 것부터 순서대로 뜨고, 마감이 코앞인 건 빨간 불로 경고합니다.
-->

---
layout: center
title: "입력하면 '지금 받을 수 있는 지원'이 뜬다"
glowSeed: 288
glow: bottom
---

## 입력하면 '지금 받을 수 있는 지원'이 뜬다

<div class="mt-4 grid grid-cols-2 gap-6 items-center">

<div>

![데모 화면](../output/captures/demo-initial.png){.rounded-xl .shadow-2xl .mx-auto}

</div>

<div class="grid gap-3">

<v-clicks>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">임신 28주 · 서울 강동구 입력</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">임신·출산 진료비 바우처가 '지금 받을 수 있어요'에 노출</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">시간축 배지로 현재 시점(D-84) 표시</div>
</div>

</v-clicks>

</div>

</div>

<div class="opacity-50 text-xs text-center">실제 앱 캡처 — 임신 28주 시점</div>

<!--
자, 직접 보시죠. 임신 28주, 서울 강동구 넣었습니다. 지금 신청할 수 있는 게 바로 뜨죠.
-->

---
layout: center
title: "출산 직후로 옮기면 — 눈앞에서 재정렬되고 경고가 켜진다"
glowSeed: 289
glow: top
---

## 출산 직후로 옮기면 — 눈앞에서 재정렬되고 경고가 켜진다

<div class="mt-4">

![데모 화면](../output/captures/demo-wow.png){.rounded-xl .shadow-2xl .mx-auto}

</div>

<div class="opacity-60 text-sm mt-3 text-center">'지금 받을 수 있어요' 2건 → 5건 · 빨간 경고: 지나면 200만원이 사라진다</div>

<!--
자, 출산이 코앞이라고 해볼게요. 주차를 쭉 당기면 — 보세요, 카드가 확 바뀌죠? 첫만남, 부모급여가 '지금 신청하세요'로 올라오고, 여기 빨간 불, 지금 안 하면 200만원 날아갑니다. 받을 혜택을 나열하는 게 아니라, 안 움직이면 잃는 돈을 콕 집어주는 거예요. 라이브가 막히면 이 캡처랑 demo.webm으로 대체합니다.
-->

---
layout: center
title: "복잡한 상황은 AI가 데이터 안에서만 답한다"
glowSeed: 290
glow: full
---

<div class="absolute top-4 right-6 text-xs px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200">FALLBACK</div>

## 복잡한 상황은 AI가 데이터 안에서만 답한다

<div class="mt-4 grid grid-cols-2 gap-6 items-center">

<div>

![데모 화면](../output/captures/demo-ai.png){.rounded-xl .shadow-2xl .mx-auto}

</div>

<div class="grid gap-3">

<v-clicks>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">'쌍둥이인데 고위험이고 3개월 전 이사 왔어요'</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">다태아 진료비 = 태아당 100만원(쌍둥이 ≈ 200만원)</div>
</div>

<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left ">
  <div class="font-medium">고위험 임산부 의료비 = 소득 무관 300만원 한도</div>
</div>

</v-clicks>

</div>

</div>

<div class="opacity-50 text-xs text-center">검증된 제도 데이터 기반 · 데이터셋 밖 수치는 만들지 않음</div>

<!--
좀 복잡한 경우는요? 제가 직접 물어봤어요. 쌍둥이인데 고위험이고 3개월 전에 이사 왔다. AI가 검증된 제도 데이터 안에서만 답합니다. 쌍둥이면 진료비가 태아당 100만원씩 약 200만원, 고위험은 소득 상관없이 300만원까지. 데이터에 없는 건 지어내지 않아요.
-->

---
layout: center
title: "검증된 해외 메커니즘을 한국 제도에 이식"
glowSeed: 291
glow: left
---

## 검증된 해외 메커니즘을 한국 제도에 이식

<div class="mt-6 grid gap-3 max-w-3xl mx-auto w-full">

<div v-click class="flex items-center gap-4">
  <div class="shrink-0 w-9 h-9 grid place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 font-bold">1</div>
  <div class="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left">
    <div class="font-medium">영국 Sure Start — 신청 기한을 1급 정보로 노출</div>
  </div>
</div>

<div v-click class="flex items-center gap-4">
  <div class="shrink-0 w-9 h-9 grid place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 font-bold">2</div>
  <div class="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left">
    <div class="font-medium">호주 Services Australia — 출산 전 사전신청(시간축 분리)</div>
  </div>
</div>

<div v-click class="flex items-center gap-4">
  <div class="shrink-0 w-9 h-9 grid place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 font-bold">3</div>
  <div class="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-5 py-3 text-left">
    <div class="font-medium">에스토니아 — 출생 시 능동(proactive) 안내</div>
  </div>
</div>

</div>

<div v-click class="mt-6 flex justify-center"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-cyan-100"><span class="i-carbon:arrow-right text-cyan-300" /> <b>결과:</b> 기능을 베낀 게 아니라 '원리'를 이식 — 시간축 + 마감 손실 경고</div></div>

<!--
이 방식, 저희가 처음 만든 게 아닙니다. 영국, 호주, 에스토니아가 이미 검증한 방식이에요. 기능을 베낀 게 아니라, 그 원리를 한국 제도에 맞게 가져왔습니다.
-->

---
layout: center
title: "정직한 한계와 안전장치"
glowSeed: 292
glow: right
---

## 정직한 한계와 안전장치

<div class="mt-6 grid grid-cols-2 gap-6 items-start">

<div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ">
<div class="flex items-center gap-2 text-amber-300 font-bold mb-3"><span class="i-carbon:warning-alt" /> 한계</div>
<div class="space-y-2 text-left opacity-90">
<div>· AI 실시간 LLM은 키 연동 시 활성(현재 검증 답변 폴백)</div>
<div>· 가까운 시설 지도는 키 없어 고정 목록 폴백</div>
<div>· 데모 범위 = 절벽 제도 4건 + 보조 2건</div>
</div>
</div>

<div v-click><div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 ring-1 ring-green-400/20">
<div class="flex items-center gap-2 text-green-300 font-bold mb-3"><span class="i-carbon:shield-checkmark" /> 안전장치</div>
<div class="space-y-2 text-left">
<div>· 모든 수치 정부 1차출처 검증 · 기준일 표기</div>
<div>· 자격 안내까지 — 실제 신청은 공식 창구 링크</div>
<div>· 데이터셋 밖은 '모른다'로 답(환각 차단)</div>
</div>
</div></div>

</div>

<!--
한계도 솔직히 말씀드릴게요. AI 실시간 호출이랑 지도는 키 연동 전이라 지금은 폴백으로 돕니다. 대신 화면 숫자는 전부 정부 공식 자료로 확인했고, 신청은 공식 창구로 연결하고, 데이터에 없으면 모른다고 답합니다.
-->

---
layout: center
title: "받을 수 있는 지원이 아니라, 지금 받아야 하는 지원을 알려줍니다"
glowSeed: 314
glow: center
---

<div class="text-center">

# 받을 수 있는 지원이 아니라, 지금 받아야 하는 지원을 알려줍니다

<div class="opacity-70 mt-3 max-w-2xl mx-auto">다음 단계: 실 API 연동 · 지자체 데이터 확장</div>

</div>

<div v-click class="mt-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-cyan-100"><span class="i-carbon:play" /> 데모 체험: localhost:3000</div></div>

<div class="mt-4 flex flex-wrap gap-2 justify-center"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">임산부·신생아</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">시간축 내비게이션</div><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-xs opacity-75">KRDS</div></div>

<div class="mt-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80"><span class="i-carbon:logo-github" /> junn1370@gmail.com</div></div>

<!--
정리합니다. 받을 수 있는 지원이 아니라, 지금 받아야 하는 지원을 알려줍니다. 감사합니다.
-->
