/* ============================================================
   theme/edit-overlay.js — 편집 오버레이 동작 (B안)
   generate-static-html.mjs 가 <script> 로 인라인한다.
   ?edit=1 쿼리 또는 'e' 키로 토글. 발표 모드에선 완전 비활성.
   순수 vanilla. getBoundingClientRect / getComputedStyle 사용.
   ============================================================ */
(function () {
  "use strict";

  var BODY = "<body>"; // marker, replaced at runtime
  var doc = document;
  var body = doc.body;

  // 누적 시간/예산은 generate-static-html 이 window.__EE_META 로 주입.
  var META = window.__EE_META || { presentationSeconds: 0, layouts: [] };

  var LAYERS = ["addr", "warn", "time", "asset"];
  var state = { on: false, layers: { addr: true, warn: true, time: true, asset: true } };

  var els = {}; // generated overlay nodes, keyed for cleanup

  function isEditRequested() {
    try {
      var p = new URLSearchParams(location.search);
      return p.get("edit") === "1" || p.get("edit") === "true";
    } catch (e) { return false; }
  }

  // ---- toast ----
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = doc.createElement("div");
      toastEl.className = "ee-toast";
      body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("ee-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("ee-show"); }, 1600);
  }

  function copyText(text, okMsg) {
    var done = function () { toast(okMsg || ("복사됨: " + text)); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, cb) {
    var ta = doc.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.left = "-9999px";
    body.appendChild(ta); ta.select();
    try { doc.execCommand("copy"); } catch (e) {}
    body.removeChild(ta);
    if (cb) cb();
  }

  // ---- tooltip ----
  var tipEl;
  function showTip(html, x, y) {
    if (!tipEl) {
      tipEl = doc.createElement("div");
      tipEl.className = "ee-tooltip";
      body.appendChild(tipEl);
    }
    tipEl.textContent = html;
    tipEl.classList.add("ee-show");
    var tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
    var px = Math.min(x + 14, window.innerWidth - tw - 8);
    var py = Math.max(y - th - 10, 8);
    tipEl.style.left = px + "px";
    tipEl.style.top = py + "px";
  }
  function hideTip() { if (tipEl) tipEl.classList.remove("ee-show"); }

  // ---- panel ----
  function buildPanel() {
    var p = doc.createElement("div");
    p.className = "ee-panel";
    var rows = LAYERS.map(function (k) {
      var labelText = {
        addr: "주소/번호 배지",
        warn: "가독성·오버플로우",
        time: "레이아웃·시간",
        asset: "자산 상태"
      }[k];
      return '<label><input type="checkbox" data-ee-layer="' + k + '" checked> ' + labelText + "</label>";
    }).join("");
    p.innerHTML =
      '<h4>편집 모드 <button class="ee-close" title="닫기 (e)">닫기</button></h4>' +
      rows +
      '<button class="ee-export">편집맵 내보내기</button>' +
      '<div class="ee-hint">호버=정보 · 클릭=주소복사 · e=토글</div>';
    body.appendChild(p);

    p.querySelector(".ee-close").addEventListener("click", function () { toggle(false); });
    p.querySelector(".ee-export").addEventListener("click", exportMap);
    p.querySelectorAll("input[data-ee-layer]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        state.layers[cb.getAttribute("data-ee-layer")] = cb.checked;
        applyLayerClasses();
      });
    });
    els.panel = p;
  }

  function applyLayerClasses() {
    LAYERS.forEach(function (k) {
      body.classList.toggle("ee-layer-" + k, state.on && state.layers[k]);
    });
  }

  // ---- decorations: addr badges + addr labels ----
  function getAddrEls() {
    return Array.prototype.slice.call(doc.querySelectorAll("[data-addr]"));
  }

  function decorate() {
    clearDecorations();
    var addrEls = getAddrEls();
    var n = 0;
    addrEls.forEach(function (el) {
      // 위치 기준 컨테이너 확보
      var cs = getComputedStyle(el);
      if (cs.position === "static") {
        el.style.position = "relative";
        el.setAttribute("data-ee-pos", "1");
      }
      n++;
      var addr = el.getAttribute("data-addr");

      var badge = doc.createElement("span");
      badge.className = "ee-badge";
      badge.textContent = n;
      el.appendChild(badge);

      var lab = doc.createElement("span");
      lab.className = "ee-addr";
      lab.textContent = addr;
      el.appendChild(lab);

      // (1) overflow / small font check
      checkReadability(el);

      // hover handlers
      el.addEventListener("mouseover", onHover);
      el.addEventListener("mouseout", onLeave);
      el.addEventListener("click", onClick);
    });

    decorateSlides();
    decorateAssets();
  }

  function checkReadability(el) {
    var overflow = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    var cs = getComputedStyle(el);
    var fs = parseFloat(cs.fontSize) || 16;
    var hasText = (el.textContent || "").trim().length > 0;
    var tooSmall = hasText && fs < 16 && !el.querySelector("[data-addr]");
    if (overflow || tooSmall) {
      el.classList.add("ee-overflow");
      var m = doc.createElement("span");
      m.className = "ee-warn-mark";
      m.textContent = overflow ? "⚠ overflow" : "⚠ " + Math.round(fs) + "px";
      el.appendChild(m);
    }
  }

  // (2) slide layout/time corner badges
  function decorateSlides() {
    var slides = Array.prototype.slice.call(doc.querySelectorAll(".slide[data-layout]"));
    var cumulative = 0;
    var budget = META.presentationSeconds || 0;
    var prevLayouts = [];
    slides.forEach(function (s) {
      var layout = s.getAttribute("data-layout") || "?";
      var dur = parseInt(s.getAttribute("data-duration") || "0", 10) || 0;
      cumulative += dur;
      var mm = Math.floor(cumulative / 60), ss = cumulative % 60;
      var cum = mm + ":" + (ss < 10 ? "0" + ss : ss);

      prevLayouts.push(layout);
      var repeat3 = prevLayouts.length >= 3 &&
        prevLayouts[prevLayouts.length - 1] === layout &&
        prevLayouts[prevLayouts.length - 2] === layout &&
        prevLayouts[prevLayouts.length - 3] === layout;

      var c = doc.createElement("div");
      c.className = "ee-corner";
      if (budget && cumulative > budget) c.classList.add("ee-over");
      c.innerHTML = layout + " · " + dur + "s · " + cum +
        (repeat3 ? ' <span class="ee-repeat">⟲3연속</span>' : "");
      var cs = getComputedStyle(s);
      if (cs.position === "static") { s.style.position = "relative"; s.setAttribute("data-ee-pos", "1"); }
      s.appendChild(c);
    });
  }

  // (3) asset status
  function decorateAssets() {
    var imgs = Array.prototype.slice.call(doc.querySelectorAll("[data-asset-status]"));
    imgs.forEach(function (img) {
      var status = img.getAttribute("data-asset-status");
      var broken = img.tagName === "IMG" && img.complete && img.naturalWidth === 0;
      var label = null;
      if (broken) {
        label = doc.createElement("span");
        label.className = "ee-asset-label ee-404";
        label.textContent = "404";
      } else if (status === "placeholder") {
        label = doc.createElement("span");
        label.className = "ee-asset-label";
        label.textContent = "placeholder";
      }
      if (label) {
        var host = img.parentElement || body;
        var hcs = getComputedStyle(host);
        if (hcs.position === "static") { host.style.position = "relative"; host.setAttribute("data-ee-pos", "1"); }
        host.appendChild(label);
      }
    });
  }

  function onHover(e) {
    var el = e.currentTarget;
    el.classList.add("ee-hover");
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    var fs = Math.round(parseFloat(cs.fontSize) || 0);
    var overflow = el.scrollHeight > el.clientHeight + 1 ? "넘침" : "정상";
    var txt = el.getAttribute("data-addr") + "\n" +
      Math.round(r.width) + " x " + Math.round(r.height) + " px\n" +
      "font " + fs + "px · " + overflow;
    showTip(txt, e.clientX, e.clientY);
    e.stopPropagation();
  }
  function onLeave(e) {
    e.currentTarget.classList.remove("ee-hover");
    hideTip();
  }
  function onClick(e) {
    var addr = e.currentTarget.getAttribute("data-addr");
    copyText(addr, "복사됨: " + addr);
    e.stopPropagation();
    e.preventDefault();
  }

  // (4) export edit map
  function exportMap() {
    var lines = getAddrEls().map(function (el) {
      var addr = el.getAttribute("data-addr");
      var val;
      if (el.tagName === "IMG") {
        val = "[img] " + (el.getAttribute("src") || "");
      } else {
        // strip overlay-injected text
        var clone = el.cloneNode(true);
        Array.prototype.forEach.call(
          clone.querySelectorAll(".ee-badge,.ee-addr,.ee-warn-mark,.ee-corner,.ee-asset-label"),
          function (x) { x.remove(); }
        );
        val = (clone.textContent || "").replace(/\s+/g, " ").trim();
      }
      return addr + ": " + val;
    });
    var text = lines.join("\n");
    copyText(text, "편집맵 " + lines.length + "행 복사됨");
    // try .txt download as well
    try {
      var blob = new Blob([text], { type: "text/plain" });
      var a = doc.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "edit-map.txt";
      doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    } catch (e) {}
  }

  function clearDecorations() {
    Array.prototype.forEach.call(
      doc.querySelectorAll(".ee-badge,.ee-addr,.ee-warn-mark,.ee-corner,.ee-asset-label"),
      function (x) { x.remove(); }
    );
    Array.prototype.forEach.call(doc.querySelectorAll(".ee-overflow"), function (x) {
      x.classList.remove("ee-overflow");
    });
    getAddrEls().forEach(function (el) {
      el.removeEventListener("mouseover", onHover);
      el.removeEventListener("mouseout", onLeave);
      el.removeEventListener("click", onClick);
    });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-ee-pos="1"]'), function (el) {
      el.style.position = "";
      el.removeAttribute("data-ee-pos");
    });
  }

  // ---- toggle ----
  function toggle(force) {
    state.on = typeof force === "boolean" ? force : !state.on;
    body.classList.toggle("ee-on", state.on);
    if (state.on) {
      if (!els.panel) buildPanel();
      decorate();
      applyLayerClasses();
    } else {
      clearDecorations();
      applyLayerClasses();
      hideTip();
    }
  }

  function init() {
    // ensure panel exists once (hidden until ee-on); but build lazily on toggle
    doc.addEventListener("keydown", function (e) {
      if (e.key === "e" || e.key === "E") {
        // ignore when typing in a field
        var t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
        toggle();
      }
    });
    if (isEditRequested()) toggle(true);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
