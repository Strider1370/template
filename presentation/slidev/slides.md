---
theme: default
colorSchema: dark
highlighter: shiki
transition: fade-out
fonts:
  sans: Noto Sans KR
  weights: '400,600,800'
title: 우리 동네 맞춤 재난 대비 가이드
layout: cover
---

# 우리 동네 맞춤 <span class="text-blue-400">재난 대비 가이드</span>

거주 지역·가족 구성만 입력하면 — 우리 가족에 꼭 맞는<br>행동요령과 가까운 대피 정보를 **한 화면에**

<div class="abs-br m-6 text-sm opacity-50">2026 AI 해커톤 · 팀 OO</div>

---
layout: default
---

## <carbon-warning-alt class="inline text-red-400" /> 문제

<v-clicks>

- 행동요령·대피소·쉼터·경보가 <span class="text-red-400">출처가 제각각</span> <carbon-data-share class="inline opacity-50" />
- 안내가 '평균 국민' 기준 — 영유아·노인·장애인 맞춤은 직접 찾아야
- 정작 재난 순간엔 **검색할 여유가 없다**

</v-clicks>

<div v-click class="mt-10 flex items-end gap-3">
  <span class="text-7xl font-extrabold text-red-400">4곳+</span>
  <span class="opacity-60 mb-2">행동요령·대피소·쉼터·경보가 흩어진 출처 수</span>
</div>

---
layout: two-cols
---

## <carbon-checkmark-outline class="inline text-green-400" /> 솔루션

<span class="text-blue-400 font-bold">지역 + 가족 구성</span> 두 입력으로<br>흩어진 정보를 맞춤형 한 화면에

<v-clicks>

- <ph-first-aid-kit-duotone class="inline text-green-400" /> 재난 유형별 행동요령 (심각도 배지)
- <ph-users-three-duotone class="inline text-green-400" /> 우리 가족 맞춤 준비물·대피법
- <ph-map-pin-duotone class="inline text-green-400" /> 가까운 대피소 지도 + 거리순 목록

</v-clicks>

::right::

<div v-click class="ml-6 mt-12 rounded-xl border border-gray-600 bg-gray-800/40 p-6 text-center">
  <carbon-screen class="text-6xl text-blue-400 mx-auto" />
  <div class="mt-3 opacity-60 text-sm">메인 화면 스크린샷 자리</div>
</div>

---
layout: center
class: text-center
---

<div v-motion :initial="{ y: 50, opacity: 0 }" :enter="{ y: 0, opacity: 1 }">

<div class="text-blue-400 font-bold tracking-wide">⭐ 차별점</div>

# '평균 국민'이 아니라<br>**우리 가족** 기준

</div>

<div v-click class="mt-6 opacity-70 max-w-2xl mx-auto">
가족 구성을 고르면 준비물·대피법·복약·동반대피가 자동 재구성.<br>
미국 <span class="text-blue-300">Ready.gov 'Make a Plan'</span>을 한국 대피소 데이터와 결합.
</div>

---
layout: center
class: text-center
---

## 데모

<div class="flex justify-center gap-6 mt-6">
  <div v-click class="rounded-xl border border-gray-600 p-4 w-60">
    <ph-map-trifold-duotone class="text-4xl text-blue-400 mx-auto" />
    <div class="mt-2 text-sm">① 서울 관악구 선택</div>
  </div>
  <div v-click class="rounded-xl border border-gray-600 p-4 w-60">
    <ph-baby-duotone class="text-4xl text-blue-400 mx-auto" />
    <div class="mt-2 text-sm">② 가족 '영유아·노인'</div>
  </div>
  <div v-click class="rounded-xl border border-gray-600 p-4 w-60">
    <ph-list-checks-duotone class="text-4xl text-green-400 mx-auto" />
    <div class="mt-2 text-sm">③ 맞춤 가이드 + 대피소</div>
  </div>
</div>

<div v-click class="mt-8 text-sm opacity-50">라이브 데모 · 실패 대비 GIF 백업 준비</div>

---
layout: center
class: text-center
---

# 우리 동네 맞춤 재난 대비 가이드

<div class="opacity-70 mt-2">우리 가족 기준의 재난 대비, 한 화면에서.</div>

<div class="mt-10 text-sm opacity-50">팀 OO · github.com/OO</div>
