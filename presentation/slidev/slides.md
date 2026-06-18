---
# Engine ported from BaizeAI/talks (Apache-2.0) — glow background + fade transitions + v-click reveals.
# See presentation/sources/ASSET_LICENSES.md
# theme 키 생략 = Slidev 기본 테마 (BaizeAI 와 동일 — heading 크기/레이아웃을 기본 테마가 제공).
layout: center
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
title: "우리 동네 맞춤 재난 대비 가이드"
lang: ko
lineNumbers: false
mdc: true
clicks: 0
glowSeed: 284
glow: full
---
<div class="flex flex-col items-center justify-center text-center">

<div class="text-cyan-300 tracking-widest text-sm font-semibold uppercase opacity-90">공공 재난 대비</div>

# 우리 동네 맞춤 재난 대비 가이드

<div class="mt-4 max-w-3xl opacity-80 text-lg">내 위치 기준으로, 지금 무엇을 해야 하는지 한 화면에</div>
</div>

<div v-click class="mt-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80">행정안전부 공개데이터 기반 · 오프라인 동작</div></div>

<!--
안녕하세요. 저희는 동네 단위로 개인화된 재난 대비 가이드를 만들었습니다. 핵심은 '내 위치 기준으로 지금 당장 할 일'을 한 화면에 보여주는 것입니다.
-->

---
class: px-14 py-10
title: "재난 정보는 많지만, 내게 맞는 정보는 없다"
glowSeed: 285
glow: left
---

# 재난 정보는 많지만, 내게 맞는 정보는 없다

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div border="2 solid red-800" bg="red-800/20" rounded-lg overflow-hidden>
    <div bg="red-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-red-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>기존 방식</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1>
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>전국 단위 일반 공지</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>수십 페이지 PDF 매뉴얼</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:close text-red-300 text-xl shrink-0 />
        <span text-lg>내 동네 대피소는 직접 검색</span>
      </div>
    </div>
  </div>
  <div v-click border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:idea text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>우리 접근</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1>
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>내 위치 기준 자동 필터링</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>지금 할 일 3가지로 압축</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>가까운 대피소 즉시 안내</span>
      </div>
    </div>
  </div>
</div>

<!--
재난 정보 자체는 충분히 공개돼 있습니다. 문제는 '내게 맞는 형태'가 아니라는 점입니다. 왼쪽이 기존 방식, 오른쪽이 저희가 제안하는 방식입니다.
-->

---
class: px-14 py-10
title: "위치를 누르면 우리 동네 가이드가 즉시 생성됩니다"
glowSeed: 286
glow: right
---

# 위치를 누르면 우리 동네 가이드가 즉시 생성됩니다

<div mt-6 grid grid-cols-2 gap-8 items-center>

<div>

<div border="2 solid white/10" bg="white/5" backdrop-blur-sm rounded-xl grid place-items-center text-center class="h-[55vh]">
  <div><div i-carbon:image text-6xl opacity-40 mx-auto /><div opacity-60 mt-2>데모 화면</div><div text-xs opacity-40 mt-2 break-all>../output/captures/demo-main.png</div></div>
</div>

</div>

<div grid gap-3>

<v-clicks>

<div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-cyan-300 text-xl shrink-0 /><span font-medium text-lg>현재 위치 기준 위험 유형 자동 판별</span></div>
</div>

<div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-amber-300 text-xl shrink-0 /><span font-medium text-lg>가장 가까운 대피소 3곳과 경로</span></div>
</div>

<div border="2 solid white/5" bg="white/5" backdrop-blur-sm rounded-lg px-5 py-3>
<div flex items-center gap-2><div i-carbon:checkmark text-green-300 text-xl shrink-0 /><span font-medium text-lg>지금 준비할 비상물품 체크리스트</span></div>
</div>

</v-clicks>

</div>

</div>

<div opacity-50 text-xs>실제 앱 화면 캡처 (서울 관악구 시연)</div>

<!--
직접 보여드리겠습니다. 위치 버튼 하나만 누르면, 해당 동네에서 발생 가능성이 높은 재난 유형을 판별하고 가장 가까운 대피소 3곳과 비상물품 체크리스트를 만들어 줍니다. 라이브 데모가 막히면 이 캡처로 대체합니다.
-->

---
layout: center
title: "대피소 탐색에 걸리던 시간"
glowSeed: 287
glow: center
---

<div class="text-center">

<div class="opacity-70 tracking-wide">대피소 탐색에 걸리던 시간</div>

<div v-click class="my-3 text-7xl font-extrabold text-cyan-300 leading-none">8분 → 5초</div>

<div class="mt-4 opacity-55 text-sm max-w-xl mx-auto">수동 검색 평균 대비 (내부 시연 측정, 표본 12회)</div>

</div>

<!--
효과는 명확합니다. 사람이 직접 검색하면 평균 8분 정도 걸리던 대피소 탐색이, 위치 기반 자동화로 5초 수준으로 줄었습니다. 내부 시연 측정값이며 표본은 12회입니다.
-->

---
class: px-14 py-10
title: "한계와 안전장치"
glowSeed: 288
glow: bottom
---

<div class="absolute top-4 right-6 text-xs px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200">MOCKED</div>

# 한계와 안전장치

<div mt-8 grid grid-cols-2 gap-6 items-start>
  <div border="2 solid amber-800" bg="amber-800/20" rounded-lg overflow-hidden>
    <div bg="amber-800/40" px-5 py-3 flex items-center>
      <div i-carbon:warning-alt text-amber-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>한계</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1>
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>대피소 데이터는 공개 갱신 주기에 의존</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>실시간 재난 경보 연동은 미구현(mocked)</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:dot-mark text-amber-300 text-xl shrink-0 />
        <span text-lg>위치 권한 거부 시 수동 지역 선택 필요</span>
      </div>
    </div>
  </div>
  <div v-click border="2 solid green-800" bg="green-800/20" rounded-lg overflow-hidden>
    <div bg="green-800/40" px-5 py-3 flex items-center>
      <div i-carbon:shield-checkmark text-green-300 text-2xl mr-2 shrink-0 />
      <span font-bold text-xl>안전장치</span>
    </div>
    <div px-5 py-4 flex flex-col gap-1>
      <div flex items-center gap-2 py-1>
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>데이터 출처·갱신일 화면에 명시</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>오프라인 캐시로 통신 두절에도 동작</span>
      </div>
      <div flex items-center gap-2 py-1>
        <div i-carbon:checkmark text-green-300 text-xl shrink-0 />
        <span text-lg>추정치는 '내부 측정' 라벨로 구분 표기</span>
      </div>
    </div>
  </div>
</div>

<!--
한계도 분명히 말씀드립니다. 실시간 경보 연동은 아직 목업 단계입니다. 대신 출처와 갱신일을 명시하고, 오프라인 캐시로 통신이 끊겨도 동작하도록 안전장치를 뒀습니다.
-->

---
layout: center
title: "동네 단위로, 모두가 대비된 도시"
glowSeed: 289
glow: top
---

<div class="text-center">

# 동네 단위로, 모두가 대비된 도시

<div class="opacity-70 mt-3 max-w-2xl mx-auto">다음 단계: 실시간 경보 연동과 전국 대피소 커버리지</div>

</div>

<div v-click class="mt-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-cyan-100"><span class="i-carbon:play" /> 데모 체험: localhost:5173</div></div>

<div class="mt-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm opacity-80"><span class="i-carbon:logo-github" /> 팀 동네방재 · junn1370@gmail.com</div></div>

<!--
정리하겠습니다. 저희 목표는 동네 단위로 모두가 대비된 도시입니다. 다음 단계로 실시간 경보 연동과 전국 대피소 커버리지를 계획하고 있습니다. 감사합니다.
-->
