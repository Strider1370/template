<script setup lang="ts">
/**
 * global-top.vue — Slidev 편집 보조 오버레이 (Notion 정적 HTML 의 edit-overlay 와 동일 기능).
 *
 * 켜는 법: 발표 빌드 URL 에 ?edit=1 (예: localhost:4173/?edit=1) 또는 dev 모드에서 'e' 키.
 * 발표(평소) 모드에선 완전 비활성 — 아무것도 그리지 않는다.
 *
 * 기능(레이어 토글):
 *  - addr  : 모든 data-addr 칸에 순번 배지 + 주소 라벨. 호버=크기/폰트/오버플로우, 클릭=주소복사.
 *  - warn  : 텍스트 넘침(overflow)·작은 글씨(<16px) 경고 마크.
 *  - time  : 슬라이드 코너에 레이아웃·소요·누적 시간(예산 초과/3연속 반복 경고).
 *  - asset : 이미지 placeholder/404 라벨.
 *  - 편집맵 내보내기: 전체 "주소: 값" 을 클립보드 + edit-map.txt.
 *
 * 주소 규약은 generate-slidev.mjs 가 박은 data-addr (id.content.slot[.index]) — Notion 과 공유.
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { useNav } from '@slidev/client'

const { currentSlideRoute, slides, currentSlideNo } = useNav()

const LAYERS = ['addr', 'warn', 'time', 'asset'] as const
type Layer = (typeof LAYERS)[number]

// ?edit=1 또는 dev 모드일 때만 활성(발표 빌드는 ?edit 없으면 완전 비활성).
function editRequested() {
  try { return new URLSearchParams(location.search).get('edit') === '1' } catch { return false }
}
const editable = (import.meta as any).env?.DEV || editRequested()

const on = ref(editRequested())
const layers = reactive<Record<Layer, boolean>>({ addr: true, warn: true, time: true, asset: true })

const LAYER_LABEL: Record<Layer, string> = {
  addr: '주소/번호 배지', warn: '가독성·오버플로우', time: '레이아웃·시간', asset: '자산 상태',
}

// ---- toast ----
const toastMsg = ref('')
const toastShow = ref(false)
let toastTimer: any
function toast(msg: string) {
  toastMsg.value = msg
  toastShow.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastShow.value = false), 1600)
}
function copyText(text: string, okMsg?: string) {
  const done = () => toast(okMsg || '복사됨: ' + text)
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done))
  else fallbackCopy(text, done)
}
function fallbackCopy(text: string, cb: () => void) {
  const ta = document.createElement('textarea')
  ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'
  document.body.appendChild(ta); ta.select()
  try { document.execCommand('copy') } catch {}
  document.body.removeChild(ta); cb()
}

// ---- decorations (imperative DOM, injected INSIDE the scaled slide so badges scale with it) ----
function addrEls(): HTMLElement[] {
  return Array.prototype.slice.call(document.querySelectorAll('#slide-content [data-addr]'))
}
function ensureRelative(el: HTMLElement) {
  if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; el.setAttribute('data-ee-pos', '1') }
}

function onHover(e: Event) {
  const el = e.currentTarget as HTMLElement
  el.classList.add('ee-hover')
  const r = el.getBoundingClientRect()
  const fs = Math.round(parseFloat(getComputedStyle(el).fontSize) || 0)
  const overflow = el.scrollHeight > el.clientHeight + 1 ? '넘침' : '정상'
  const me = e as MouseEvent
  showTip(el.getAttribute('data-addr') + '\n' + Math.round(r.width) + ' x ' + Math.round(r.height) + ' px\nfont ' + fs + 'px · ' + overflow, me.clientX, me.clientY)
  e.stopPropagation()
}
function onLeave(e: Event) { (e.currentTarget as HTMLElement).classList.remove('ee-hover'); hideTip() }
function onClick(e: Event) {
  const addr = (e.currentTarget as HTMLElement).getAttribute('data-addr') || ''
  copyText(addr, '복사됨: ' + addr); e.stopPropagation(); e.preventDefault()
}

function checkReadability(el: HTMLElement) {
  const overflow = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1
  const fs = parseFloat(getComputedStyle(el).fontSize) || 16
  const hasText = (el.textContent || '').trim().length > 0
  const tooSmall = hasText && fs < 16 && !el.querySelector('[data-addr]')
  if (overflow || tooSmall) {
    el.classList.add('ee-overflow')
    const m = document.createElement('span')
    m.className = 'ee-warn-mark'
    m.textContent = overflow ? '⚠ overflow' : '⚠ ' + Math.round(fs) + 'px'
    el.appendChild(m)
  }
}

function decorateSlideCorner() {
  const fm: any = (currentSlideRoute.value?.meta?.slide as any)?.frontmatter || {}
  const layout = fm.semanticLayout || '?'
  const dur = Number(fm.durationSeconds) || 0
  // 누적 시간 + 3연속 반복 검사(현재 슬라이드까지).
  let cumulative = 0
  const layoutSeq: string[] = []
  const list: any[] = (slides as any).value || []
  for (let i = 0; i < list.length && i < currentSlideNo.value; i++) {
    const f: any = (list[i]?.meta?.slide as any)?.frontmatter || {}
    cumulative += Number(f.durationSeconds) || 0
    layoutSeq.push(f.semanticLayout || '?')
  }
  const budget = Number((slides as any).value?.[0]?.meta?.slide?.frontmatter?.presentationSeconds) || 0
  const mm = Math.floor(cumulative / 60), ss = cumulative % 60
  const cum = mm + ':' + (ss < 10 ? '0' + ss : ss)
  const n = layoutSeq.length
  const repeat3 = n >= 3 && layoutSeq[n - 1] === layoutSeq[n - 2] && layoutSeq[n - 2] === layoutSeq[n - 3]

  const host = (addrEls()[0]?.closest('.slidev-layout') as HTMLElement) || document.querySelector('#slide-content .slidev-layout') as HTMLElement
  if (!host) return
  ensureRelative(host)
  const c = document.createElement('div')
  c.className = 'ee-corner' + (budget && cumulative > budget ? ' ee-over' : '')
  c.innerHTML = layout + ' · ' + dur + 's · ' + cum + (repeat3 ? ' <span class="ee-repeat">⟲3연속</span>' : '')
  host.appendChild(c)
}

function decorateAssets() {
  const imgs: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll('#slide-content [data-asset-status]'))
  imgs.forEach((img) => {
    const status = img.getAttribute('data-asset-status')
    const broken = img.tagName === 'IMG' && (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth === 0
    let label: HTMLElement | null = null
    if (broken) { label = document.createElement('span'); label.className = 'ee-asset-label ee-404'; label.textContent = '404' }
    else if (status === 'placeholder') { label = document.createElement('span'); label.className = 'ee-asset-label'; label.textContent = 'placeholder' }
    if (label) { ensureRelative(img); img.appendChild(label) }
  })
}

// Slidev 가 v-clicks/전환으로 슬라이드 DOM 을 다시 그리면 주입한 배지가 지워진다.
// MutationObserver 로 #slide-content 변화를 감지해 다시 데코레이트(자기 변경은 disconnect 로 무시).
let observer: MutationObserver | null = null
let decTimer: any
function scheduleDecorate() {
  clearTimeout(decTimer)
  decTimer = setTimeout(() => { if (on.value) decorate() }, 130)
}
function observeRoot() {
  const root = document.querySelector('#slide-content')
  if (!root || !on.value) return
  if (!observer) observer = new MutationObserver(() => scheduleDecorate())
  observer.observe(root, { childList: true, subtree: true })
}
function stopObserver() { if (observer) { observer.disconnect(); observer = null } }

function decorate() {
  if (observer) observer.disconnect() // 자기 주입이 다시 트리거하지 않도록
  clearDecorations()
  let n = 0
  addrEls().forEach((el) => {
    ensureRelative(el)
    n++
    const badge = document.createElement('span'); badge.className = 'ee-badge'; badge.textContent = String(n); el.appendChild(badge)
    const lab = document.createElement('span'); lab.className = 'ee-addr'; lab.textContent = el.getAttribute('data-addr') || ''; el.appendChild(lab)
    checkReadability(el)
    el.addEventListener('mouseover', onHover); el.addEventListener('mouseout', onLeave); el.addEventListener('click', onClick)
  })
  decorateSlideCorner()
  decorateAssets()
  observeRoot() // 재관찰(이후 Vue 재렌더 감지)
}

function clearDecorations() {
  document.querySelectorAll('.ee-badge,.ee-addr,.ee-warn-mark,.ee-corner,.ee-asset-label').forEach((x) => x.remove())
  document.querySelectorAll('.ee-overflow').forEach((x) => x.classList.remove('ee-overflow'))
  addrEls().forEach((el) => {
    el.removeEventListener('mouseover', onHover); el.removeEventListener('mouseout', onLeave); el.removeEventListener('click', onClick)
  })
  document.querySelectorAll('[data-ee-pos="1"]').forEach((el) => { (el as HTMLElement).style.position = ''; el.removeAttribute('data-ee-pos') })
}

// ---- tooltip (fixed, unscaled) ----
const tip = reactive({ show: false, text: '', x: 0, y: 0 })
function showTip(text: string, x: number, y: number) {
  tip.text = text; tip.show = true
  tip.x = Math.min(x + 14, window.innerWidth - 220); tip.y = Math.max(y - 60, 8)
}
function hideTip() { tip.show = false }

// ---- export edit map ----
function exportMap() {
  const lines = addrEls().map((el) => {
    const addr = el.getAttribute('data-addr')
    let val: string
    if (el.tagName === 'IMG') val = '[img] ' + ((el as HTMLImageElement).getAttribute('src') || '')
    else {
      const clone = el.cloneNode(true) as HTMLElement
      clone.querySelectorAll('.ee-badge,.ee-addr,.ee-warn-mark,.ee-corner,.ee-asset-label').forEach((x) => x.remove())
      val = (clone.textContent || '').replace(/\s+/g, ' ').trim()
    }
    return addr + ': ' + val
  })
  const text = lines.join('\n')
  copyText(text, '편집맵 ' + lines.length + '행 복사됨')
  try {
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'edit-map.txt'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  } catch {}
}

// ---- body class sync (CSS 레이어 가시성) ----
function syncBody() {
  if (typeof document === 'undefined') return
  document.body.classList.toggle('ee-on', on.value)
  LAYERS.forEach((k) => document.body.classList.toggle('ee-layer-' + k, on.value && layers[k]))
}

async function redecorate() {
  if (!on.value) { stopObserver(); clearDecorations(); return }
  await nextTick()
  scheduleDecorate()
}

watch(on, () => { syncBody(); redecorate() })
watch(layers, syncBody, { deep: true })
watch(currentSlideRoute, () => { if (on.value) redecorate() })

function onKey(e: KeyboardEvent) {
  if (e.key !== 'e' && e.key !== 'E') return
  const t = e.target as HTMLElement
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
  on.value = !on.value
}

onMounted(() => {
  if (!editable) return
  document.addEventListener('keydown', onKey)
  syncBody(); redecorate()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  clearTimeout(decTimer); stopObserver(); clearDecorations()
  if (typeof document !== 'undefined') document.body.classList.remove('ee-on', 'ee-layer-addr', 'ee-layer-warn', 'ee-layer-time', 'ee-layer-asset')
})
</script>

<template>
  <template v-if="editable">
    <!-- 토글 버튼 (오버레이 꺼져 있을 때) -->
    <button v-if="!on" class="ee-fab" title="편집 모드 (e)" @click="on = true">✎ 편집</button>

    <!-- 컨트롤 패널 -->
    <div v-if="on" class="ee-panel">
      <h4>편집 모드 <button class="ee-close" title="닫기 (e)" @click="on = false">닫기</button></h4>
      <label v-for="k in LAYERS" :key="k"><input type="checkbox" v-model="layers[k]"> {{ LAYER_LABEL[k] }}</label>
      <button class="ee-export" @click="exportMap">편집맵 내보내기</button>
      <div class="ee-hint">호버=정보 · 클릭=주소복사 · e=토글</div>
    </div>

    <!-- 툴팁 / 토스트 (고정·비축소) -->
    <div v-show="tip.show" class="ee-tooltip ee-show" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">{{ tip.text }}</div>
    <div v-show="toastShow" class="ee-toast ee-show">{{ toastMsg }}</div>
  </template>
</template>

<!-- 전역(비scoped) — document 에 주입한 .ee-* 데코레이션을 스타일링. 모두 ee- 접두사로 격리. -->
<style>
.ee-fab {
  position: fixed; bottom: 14px; left: 14px; z-index: 2147483000;
  background: #5645d4; color: #fff; border: none; border-radius: 8px;
  padding: 6px 12px; font: 600 13px/1 -apple-system, 'Pretendard', sans-serif; cursor: pointer;
  opacity: .55; box-shadow: 0 4px 14px rgba(0,0,0,.3);
}
.ee-fab:hover { opacity: 1; }

.ee-panel {
  position: fixed; top: 12px; right: 12px; z-index: 2147483000; width: 230px;
  background: #0a1530; color: #fff; border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.35);
  font-family: -apple-system, 'Pretendard', 'Noto Sans KR', sans-serif; font-size: 13px; line-height: 1.45;
  padding: 12px 14px; user-select: none;
}
.ee-panel h4 { margin: 0 0 8px; font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
.ee-panel .ee-close { cursor: pointer; background: rgba(255,255,255,.12); border: none; color: #fff; border-radius: 6px; padding: 2px 8px; font-size: 13px; }
.ee-panel label { display: flex; align-items: center; gap: 7px; padding: 3px 0; cursor: pointer; }
.ee-panel label input { accent-color: #5645d4; }
.ee-panel .ee-export { margin-top: 8px; width: 100%; cursor: pointer; background: #5645d4; border: none; color: #fff; border-radius: 7px; padding: 7px; font-size: 13px; font-weight: 600; }
.ee-panel .ee-hint { margin-top: 8px; font-size: 11px; opacity: .65; }

/* 주소/순번 배지 — 레이어 토글로 표시 */
.ee-badge, .ee-addr { display: none; }
body.ee-on.ee-layer-addr .ee-badge, body.ee-on.ee-layer-addr .ee-addr { display: block; }
.ee-badge {
  position: absolute; z-index: 2147482000; top: 0; left: 0; transform: translate(-50%, -50%);
  min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: #5645d4; color: #fff;
  font: 700 11px/18px -apple-system, sans-serif; text-align: center; pointer-events: none; box-shadow: 0 0 0 2px #fff;
}
.ee-addr {
  position: absolute; z-index: 2147482000; bottom: 0; right: 0; background: rgba(10,21,48,.82); color: #fff;
  font: 600 9px/1.2 ui-monospace, monospace; padding: 1px 4px; border-radius: 4px 0 0 0; pointer-events: none;
  max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
body.ee-on.ee-layer-addr [data-addr].ee-hover { outline: 2px solid #5645d4 !important; outline-offset: -2px; }

/* 툴팁 / 토스트 */
.ee-tooltip {
  position: fixed; z-index: 2147483600; background: #0a1530; color: #fff;
  font: 600 11px/1.5 ui-monospace, monospace; padding: 6px 9px; border-radius: 7px; pointer-events: none;
  max-width: 320px; white-space: pre-line; box-shadow: 0 6px 18px rgba(0,0,0,.4);
}
.ee-toast {
  position: fixed; z-index: 2147483600; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: #1aae39; color: #fff; font: 600 13px/1 -apple-system, sans-serif; padding: 10px 16px;
  border-radius: 999px; box-shadow: 0 6px 18px rgba(0,0,0,.3);
}

/* 가독성·오버플로우 경고 */
.ee-warn-mark { display: none; }
body.ee-on.ee-layer-warn .ee-overflow { outline: 2px solid #e03e3e !important; outline-offset: -2px; }
body.ee-on.ee-layer-warn .ee-warn-mark {
  display: block; position: absolute; z-index: 2147482100; top: 0; left: 0; background: #e03e3e; color: #fff;
  font: 700 11px/1 sans-serif; padding: 2px 4px; border-radius: 0 0 5px 0; pointer-events: none;
}

/* 레이아웃·시간 코너 */
.ee-corner { display: none; }
body.ee-on.ee-layer-time .ee-corner {
  display: block; position: absolute; z-index: 2147482000; top: 6px; left: 6px; background: rgba(10,21,48,.85);
  color: #fff; font: 600 11px/1.3 ui-monospace, monospace; padding: 3px 7px; border-radius: 6px; pointer-events: none;
}
body.ee-on.ee-layer-time .ee-corner.ee-over { background: #e03e3e; }
body.ee-on.ee-layer-time .ee-corner .ee-repeat { color: #ffb454; }

/* 자산 상태 */
.ee-asset-label { display: none; }
body.ee-on.ee-layer-asset [data-asset-status="placeholder"] { outline: 2px dashed #dd5b00 !important; outline-offset: -2px; }
body.ee-on.ee-layer-asset .ee-asset-label {
  display: inline-block; position: absolute; z-index: 2147482100; top: 6px; right: 6px; background: #dd5b00; color: #fff;
  font: 700 10px/1 sans-serif; padding: 3px 5px; border-radius: 5px; pointer-events: none;
}
body.ee-on.ee-layer-asset .ee-asset-label.ee-404 { background: #e03e3e; }
</style>
