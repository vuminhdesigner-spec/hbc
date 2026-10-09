/* ============================================================
   Frame shim — chạy ĐẦU TIÊN trong mỗi màn (iframe srcdoc) của file flow.

   Màn và viewer có thể KHÁC ORIGIN: công cụ deploy nhúng trang trong iframe
   sandbox, nên màn không được đụng vào window.parent. Mọi trao đổi đi qua
   postMessage { mdm: "<loại>", ... }.

   1. `__mdm.location` — location giả mang đường dẫn thật của màn
      (/screens/doi-tac/chi-tiet.html). build_flow.mjs viết lại tham chiếu
      location trong JS của màn thành `__mdm.location`.
   2. Chuyển màn: link và location.href trỏ tới màn khác → báo viewer.
   3. Ảnh JS dựng lúc chạy → thay bằng data URI trong boot.assets.
   4. Inspect: di chuột xem component, bấm để gửi chi tiết cho viewer.
   5. Modal/drawer đang mở → báo viewer để đánh dấu step tương ứng.

   Prototype chỉ điều hướng, không mang dữ liệu qua các màn.
   Vào: window.__MDM_BOOT = { screen, query, assets, registry, probe, inspect }.
   ============================================================ */
(function () {
  "use strict";
  var boot = window.__MDM_BOOT;
  var ORIGIN = "https://mdm.local";
  function send(type, data) {
    data = data || {};
    data.mdm = type;
    try { window.parent.postMessage(data, "*"); } catch (_) {}
  }
  window.addEventListener("error", function (e) {
    send("error", { msg: (e.message || "error") + (e.lineno ? " @" + e.lineno : "") });
  });
  /* Khung dò (probe) của viewer: storage giả để không ghi đè nháp/dock của khung chính. */
  if (boot.probe) ["localStorage", "sessionStorage"].forEach(function (k) {
    var m = {};
    var mem = { getItem: function (x) { return x in m ? m[x] : null; }, setItem: function (x, v) { m[x] = String(v); },
                removeItem: function (x) { delete m[x]; }, clear: function () { m = {}; }, key: function (i) { return Object.keys(m)[i] || null; },
                get length() { return Object.keys(m).length; } };
    try { Object.defineProperty(window, k, { value: mem, configurable: true }); } catch (_) {}
  });
  var virt = new URL("/screens/" + boot.screen + ".html" + (boot.query || ""), ORIGIN);

  /* ---------------------------------------------------------- 1. location */
  function go(target, replace) {
    var url = new URL(String(target), virt);
    if (url.origin !== ORIGIN) { window.open(url.href, "_blank", "noopener"); return; }
    if (url.pathname === virt.pathname && url.search === virt.search && url.hash) {
      virt.hash = url.hash;
      var el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (el) el.scrollIntoView();
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      return;
    }
    send("navigate", { pathname: url.pathname, search: url.search, hash: url.hash, replace: !!replace });
  }
  var loc = {
    get href() { return virt.href; }, set href(v) { go(v); },
    get pathname() { return virt.pathname; },
    get search() { return virt.search; }, set search(v) { go(virt.pathname + (String(v).charAt(0) === "?" ? v : "?" + v)); },
    get hash() { return virt.hash; }, set hash(v) { go((String(v).charAt(0) === "#" ? "" : "#") + v); },
    get origin() { return ORIGIN; }, get host() { return "mdm.local"; }, get hostname() { return "mdm.local"; },
    get protocol() { return "https:"; }, get port() { return ""; },
    assign: function (v) { go(v); }, replace: function (v) { go(v, true); },
    reload: function () { send("reload"); },
    toString: function () { return virt.href; }
  };
  window.__mdm = { location: loc };

  document.addEventListener("click", function (e) {
    if (inspecting || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href === "#" || /^(javascript|mailto|tel):/i.test(href)) return;
    e.preventDefault();
    go(href);
  });

  /* ------------------------------------------------------------ 2. assets */
  function assetFor(src) {
    if (!src || /^(data|blob|https?):/i.test(src)) return null;
    try { return boot.assets[new URL(src, virt).pathname.slice(1)] || null; } catch (_) { return null; }
  }
  function fixImg(img) { var d = assetFor(img.getAttribute("src")); if (d) img.setAttribute("src", d); }
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      if (m.type === "attributes") { if (m.target.tagName === "IMG") fixImg(m.target); return; }
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.tagName === "IMG") fixImg(n);
        if (n.querySelectorAll) n.querySelectorAll("img[src]").forEach(fixImg);
      });
    });
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });

  /* ----------------------------------------------------------- 3. inspect
     Màu/chữ của khung highlight do viewer truyền (boot.inspect, đã resolve từ --hv-*). */
  var inspecting = false, box, tip, current, blocks = {};
  (boot.registry || []).forEach(function (c) { blocks[c.block.slice(1)] = c; });
  // Sibling blocks (registry `extra`) resolve to their component, labelled by their own class; a primary block always wins.
  var extras = {};
  (boot.registry || []).forEach(function (c) { (c.extra || []).forEach(function (x) { if (!blocks[x] && !extras[x]) extras[x] = c; }); });

  function componentOf(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      for (var i = 0; i < n.classList.length; i++) {
        var cls = n.classList[i], b = cls.split("__")[0].split("--")[0];
        if (blocks[b]) return { el: n, comp: blocks[b], part: cls.indexOf("__") > 0 ? cls : null };
        if (extras[b]) return { el: n, comp: extras[b], part: "__" + cls };
      }
    }
    return null;
  }
  function tokensOn(el) {
    var out = [], seen = {};
    function walk(rules) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.cssRules && !r.selectorText) { if (!r.media || window.matchMedia(r.media.mediaText).matches) walk(r.cssRules); continue; }
        if (!r.selectorText) continue;
        var ok = false;
        try { ok = el.matches(r.selectorText); } catch (_) {}
        if (!ok) continue;
        for (var j = 0; j < r.style.length; j++) {
          var prop = r.style[j];
          if (prop.indexOf("--") === 0) continue;
          (r.style.getPropertyValue(prop).match(/var\(--[a-z0-9-]+/g) || []).forEach(function (v) {
            var name = v.slice(4), key = prop + name;
            if (seen[key]) return;
            seen[key] = 1;
            out.push({ prop: prop, token: name, value: getComputedStyle(el).getPropertyValue(name).trim() });
          });
        }
      }
    }
    for (var s = 0; s < document.styleSheets.length; s++) { try { walk(document.styleSheets[s].cssRules); } catch (_) {} }
    return out;
  }
  function describe(el) {
    var hit = componentOf(el), classes = Array.prototype.slice.call((hit ? hit.el : el).classList);
    return {
      tag: el.tagName.toLowerCase(), role: el.getAttribute("role"),
      component: hit ? hit.comp.name : null, contract: hit ? hit.comp.contract : null, part: hit ? hit.part : null,
      classes: classes, tokens: tokensOn(el),
      states: classes.filter(function (c) { return /^is-/.test(c); })
        .concat(["aria-expanded", "aria-selected", "aria-current", "aria-invalid", "disabled", "hidden"]
          .filter(function (a) { return el.hasAttribute(a); })
          .map(function (a) { return a + "=" + (el.getAttribute(a) || "true"); }))
    };
  }
  function inventory() {
    return (boot.registry || []).map(function (c) { return { name: c.name, block: c.block, n: document.querySelectorAll(c.block).length }; })
      .filter(function (r) { return r.n; }).sort(function (a, b) { return b.n - a.n; });
  }

  function ensureUi() {
    if (box) return;
    box = document.createElement("div");
    box.setAttribute("data-mdm-ui", "");
    var ink = boot.inspect || {};
    box.style.cssText = "position:fixed;pointer-events:none;z-index:2147483646;border:2px solid " + ink.border + ";box-shadow:0 0 0 1px " + ink["tip-fg"] + ";background:color-mix(in srgb, " + ink.border + " 8%, transparent);border-radius:2px;display:none";
    tip = document.createElement("div");
    tip.setAttribute("data-mdm-ui", "");
    tip.style.cssText = "position:fixed;pointer-events:none;z-index:2147483647;font:" + ink["tip-font"] + ";color:" + ink["tip-fg"] + ";background:" + ink["tip-bg"] + ";padding:0 " + ink["tip-pad"] + ";border-radius:" + ink["tip-radius"] + ";display:none;white-space:nowrap";
    document.body.appendChild(box);
    document.body.appendChild(tip);
  }
  function onMove(e) {
    var el = e.target;
    if (el.closest("[data-mdm-ui]") || el === current) return;
    current = el;
    var hit = componentOf(el), r = el.getBoundingClientRect();
    box.style.display = tip.style.display = "block";
    box.style.left = r.left + "px"; box.style.top = r.top + "px"; box.style.width = r.width + "px"; box.style.height = r.height + "px";
    tip.textContent = (hit ? hit.comp.name + (hit.part ? " › " + hit.part.split("__")[1] : "") : "(ngoài registry)") + "  <" + el.tagName.toLowerCase() + ">";
    tip.style.left = Math.max(0, r.left) + "px"; tip.style.top = Math.max(0, r.top - 22) + "px";
  }
  function onPick(e) { e.preventDefault(); e.stopPropagation(); send("detail", { d: describe(e.target) }); }
  function swallow(e) { e.preventDefault(); e.stopPropagation(); }
  function setInspect(on) {
    ensureUi();
    inspecting = !!on;
    var fn = on ? "addEventListener" : "removeEventListener";
    document[fn]("mousemove", onMove, true);
    document[fn]("click", onPick, true);
    ["mousedown", "mouseup", "pointerdown", "submit"].forEach(function (t) { document[fn](t, swallow, true); });
    if (!on) { box.style.display = tip.style.display = "none"; current = null; }
  }

  /* ------------------------------------------------ lệnh từ viewer */
  window.addEventListener("message", function (e) {
    if (e.source !== window.parent || !e.data || !e.data.mdm) return;
    var m = e.data;
    if (m.mdm === "setInspect") setInspect(m.on);
    if (m.mdm === "measure") {
      var de = document.documentElement;
      send("measure", { id: m.id, overflow: de.scrollWidth - de.clientWidth, width: de.clientWidth, height: window.innerHeight });
    }
    if (m.mdm === "test-inspect") {   // self-test: Inspect trên nút đầu tiên
      var b = document.querySelector(".button--primary") || document.querySelector(".button");
      setInspect(true);
      if (b) b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      setInspect(false);
    }
    if (m.mdm === "test-tracking") {  // self-test: selector nào trong tracking.json có trong DOM màn này
      send("test-tracking", { found: m.selectors.filter(function (sel) { try { return !!document.querySelector(sel); } catch (_) { return false; } }) });
    }
    if (m.mdm === "pins") drawPins(m.step, m.items || [], m.ink || {}, m.bubble || null);
    if (m.mdm === "diff") drawDiff(m);
    if (m.mdm === "diffFocus") focusDiff(m.focus, true);
    if (m.mdm === "test-link") {      // self-test: bấm link đầu tiên tới màn khác
      var own = boot.screen.split("/").pop() + ".html";
      var a = Array.prototype.filter.call(document.querySelectorAll('a[href$=".html"]'), function (x) {
        return !x.closest(".side-nav") && x.getAttribute("href").slice(-own.length) !== own;
      })[0];
      send("test-link", { href: a ? a.getAttribute("href") : null });
      if (a) a.click();
    }
  });

  /* -------------------------------- 7. lịch sử phiên bản: tô chỗ đổi so với bản trước */
  var marks = [], markRaf = 0, markOpt = {}, dimStyle = null;
  function clearDiff() {
    marks.forEach(function (k) { k.ring.remove(); k.badge.remove(); });
    marks = [];
    cancelAnimationFrame(markRaf);
    Array.prototype.forEach.call(document.querySelectorAll("[data-mdm-keep]"), function (el) { el.removeAttribute("data-mdm-keep"); });
    document.documentElement.removeAttribute("data-mdm-dim");
    document.documentElement.style.removeProperty("box-shadow");
  }
  function drawDiff(m) {
    clearDiff();
    markOpt = m;
    var ink = m.ink || {}, col = { chg: ink["changed-fg"], add: ink["added-fg"], del: ink.pin };
    if (m.whole) document.documentElement.style.boxShadow = "inset 0 0 0 4px " + col.add;
    (m.items || []).forEach(function (it) {
      var t = null;
      try { t = document.querySelector(it.sel); } catch (_) {}
      var ring = document.createElement("div"), badge = document.createElement("div");
      ring.setAttribute("data-mdm-ui", ""); badge.setAttribute("data-mdm-ui", "");
      ring.style.cssText = "position:fixed;pointer-events:none;z-index:2147483640;border-radius:4px;display:none;border:2px " + (it.kind === "del" ? "dashed " : "solid ") + col[it.kind] + ";background:color-mix(in srgb, " + col[it.kind] + " 10%, transparent)";
      badge.style.cssText = "position:fixed;pointer-events:none;z-index:2147483641;display:none;min-width:18px;height:18px;padding:0 4px;border-radius:9px;font:700 11px/18px system-ui,sans-serif;text-align:center;color:#fff;background:" + col[it.kind];
      badge.textContent = it.n;
      document.body.appendChild(ring); document.body.appendChild(badge);
      marks.push({ n: it.n, t: t, ring: ring, badge: badge });
      if (t && m.dim) { t.setAttribute("data-mdm-keep", "t"); for (var el = t.parentElement; el && el !== document.body; el = el.parentElement) if (!el.hasAttribute("data-mdm-keep")) el.setAttribute("data-mdm-keep", "a"); }
    });
    if (m.dim) {
      if (!dimStyle) { dimStyle = document.createElement("style"); dimStyle.setAttribute("data-mdm-ui", ""); dimStyle.textContent = "html[data-mdm-dim] body *:not([data-mdm-keep]):not([data-mdm-keep=t] *):not([data-mdm-ui]){opacity:.25}"; document.head.appendChild(dimStyle); }
      document.documentElement.setAttribute("data-mdm-dim", "");
    }
    function place() {
      marks.forEach(function (k) {
        var r = k.t && k.t.getBoundingClientRect(), on = !!r && m.hl && !inspecting && r.width > 0 && r.height > 0, s = k.ring.style, b = k.badge.style;
        var focus = k.n === markOpt.focus;
        s.display = b.display = on ? "block" : "none";
        if (!on) return;
        s.left = r.left - 3 + "px"; s.top = r.top - 3 + "px"; s.width = r.width + 6 + "px"; s.height = r.height + 6 + "px";
        s.borderWidth = focus ? "3px" : "2px"; s.boxShadow = focus ? "0 0 0 4px color-mix(in srgb, " + s.borderColor + " 30%, transparent)" : "none";
        b.left = Math.max(0, r.right - 10) + "px"; b.top = Math.max(0, r.top - 10) + "px";
      });
      if (marks.length) markRaf = requestAnimationFrame(place);
    }
    place();
    focusDiff(m.focus, false);
  }
  function focusDiff(n, scroll) {
    markOpt.focus = n;
    var k = marks.filter(function (x) { return x.n === n; })[0];
    if (!k) return;
    var r = k.t && k.t.getBoundingClientRect(), shown = !!r && r.width > 0 && r.height > 0;
    if (shown && (scroll || r.top < 0 || r.bottom > window.innerHeight)) k.t.scrollIntoView({ block: "center", inline: "nearest" });
    send("diff", { focus: n, shown: shown });
  }

  /* ------------------------------------------- 6. ghim vùng đổi (changes) */
  var pins = [], pinRaf = 0;
  function css(el, o) { Object.keys(o).forEach(function (k) { el.style[k] = o[k]; }); return el; }
  function ui(tag, parent) { var el = document.createElement(tag); el.setAttribute("data-mdm-ui", ""); if (parent) parent.appendChild(el); return el; }
  /* Bóng chú thích cạnh ghim: ghi chú + [Trước | Sau] (bubble.ver); ✕ thu về ghim, bấm ghim mở lại. */
  function makeBubble(it, bubble, ink) {
    var box = css(ui("div"), { position: "fixed", zIndex: 2147483642, width: "280px", boxSizing: "border-box", padding: "10px 12px",
      background: ink.surface, color: ink.text, border: "1px solid " + ink.pin, borderRadius: "8px", boxShadow: "0 8px 24px rgba(16,24,40,.18)",
      font: "13px/1.45 " + ink.font, textAlign: "left", display: "none" });
    box.setAttribute("role", "note");
    var hd = css(ui("div", box), { display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" });
    css(ui("span", hd), { font: "700 12px/1.4 " + ink.font, color: ink.pin }).textContent = bubble.head + " · " + it.n + "/" + bubble.total;
    var x = css(ui("button", hd), { marginLeft: "auto", border: "0", background: "none", color: ink["text-2"], font: "16px/1 " + ink.font, padding: "2px 4px", cursor: "pointer" });
    x.type = "button"; x.textContent = "✕"; x.setAttribute("aria-label", "Thu gọn ghi chú " + it.n);
    x.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); send("pinClose", { n: it.n }); });
    css(ui("div", box), { whiteSpace: "pre-line" }).textContent = it.note;
    var segBtns = [];
    if (bubble.ver) {
      var seg = css(ui("div", box), { display: "inline-flex", marginTop: "8px", border: "1px solid " + ink.border, borderRadius: "999px", padding: "2px" });
      seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "So với bản trước");
      [true, false].forEach(function (before, i) {
        var on = bubble.ver.before === before, b = css(ui("button", seg), { border: "0", borderRadius: "999px", padding: "2px 12px", cursor: "pointer",
          font: (on ? "600 " : "400 ") + "12px/1.6 " + ink.font, background: on ? ink["pressed-bg"] : "transparent", color: on ? ink["pressed-fg"] : ink["text-2"] });
        b.type = "button"; b.textContent = bubble.ver.labels[i]; b.setAttribute("aria-pressed", String(on));
        b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); if (!on) send("pinVer", { before: before }); });
        b.dataset.ver = before ? "before" : "after";
        segBtns.push(b);
      });
    }
    document.body.appendChild(box);
    return { el: box, seg: segBtns };
  }
  function drawPins(step, items, ink, bubble) {
    pins.forEach(function (p) { p.rings.concat(p.badge, p.bub ? p.bub.el : []).forEach(function (el) { el.remove(); }); });
    pins = [];
    cancelAnimationFrame(pinRaf);
    var found = [];
    items.forEach(function (it) {
      var targets = [];
      try { targets = Array.prototype.slice.call(document.querySelectorAll(it.sel)); } catch (_) {}
      if (targets.length) found.push(it.n);
      var rings = targets.map(function () {
        var r = document.createElement("div");
        r.setAttribute("data-mdm-ui", "");
        r.style.cssText = "position:fixed;pointer-events:none;z-index:2147483640;border:2px solid " + ink.pin + ";border-radius:4px;background:color-mix(in srgb, " + ink.pin + " 8%, transparent);display:none";
        document.body.appendChild(r);
        return r;
      });
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-mdm-ui", "");
      b.setAttribute("aria-label", "Thay đổi " + it.n + ": " + it.note);
      b.title = it.note;
      b.textContent = it.n;
      b.style.cssText = "position:fixed;z-index:2147483641;width:24px;height:24px;padding:0;border:0;border-radius:50%;cursor:pointer;font:700 13px/24px system-ui,sans-serif;text-align:center;color:" + ink["pin-fg"] + ";background:" + ink.pin + ";box-shadow:0 0 0 2px " + ink["pin-fg"] + ";display:none";
      b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); send(bubble ? "pinToggle" : "pin", { n: it.n }); });
      if (bubble) b.setAttribute("aria-expanded", String(bubble.open.indexOf(it.n) >= 0));
      document.body.appendChild(b);
      pins.push({ targets: targets, rings: rings, badge: b, bub: bubble && bubble.open.indexOf(it.n) >= 0 ? makeBubble(it, bubble, ink) : null });
    });
    if (bubble && bubble.reveal) { var t0 = pins.filter(function (p) { return p.targets.length; })[0]; if (t0) t0.targets[0].scrollIntoView({ block: "center", inline: "nearest" }); }
    if (bubble && bubble.focus) { var fb = pins.map(function (p) { return p.bub && p.bub.seg.filter(function (x) { return x.dataset.ver === bubble.focus; })[0]; }).filter(Boolean)[0]; if (fb) fb.focus({ preventScroll: true }); }
    /* Theo vùng mỗi khung hình: màn cuộn, mở overlay, đổi cỡ. Ẩn khi đang Inspect. */
    function place() {
      var stack = [];
      pins.forEach(function (p) {
        var first = null;
        p.targets.forEach(function (t, i) {
          var r = t.getBoundingClientRect(), on = !inspecting && r.width > 0 && r.height > 0, s = p.rings[i].style;
          s.display = on ? "block" : "none";
          if (!on) return;
          s.left = r.left - 2 + "px"; s.top = r.top - 2 + "px"; s.width = r.width + 4 + "px"; s.height = r.height + 4 + "px";
          if (!first) first = r;
        });
        var bs = p.badge.style;
        bs.display = first ? "block" : "none";
        if (first) { bs.left = Math.max(0, first.right - 12) + "px"; bs.top = Math.max(0, first.top - 12) + "px"; }
        if (!p.bub) return;
        var el = p.bub.el, W = 280, vw = document.documentElement.clientWidth, vh = window.innerHeight;
        el.style.display = inspecting || (p.targets.length && !first) ? "none" : "block";
        if (el.style.display === "none") return;
        var h = el.offsetHeight, left, top;
        if (first) {
          left = first.right + 16;
          top = Math.min(Math.max(8, first.top - 4), vh - h - 8);
          if (first.width > vw / 2) { left = Math.min(first.right, vw) - W - 16; top = Math.max(8, first.top + 16); }   // vùng lớn: neo góc trong
          else if (left + W > vw - 8) left = first.left - W - 16 >= 8 ? first.left - W - 16 : Math.max(8, vw - W - 8);
        } else { left = vw - W - 16; top = 16; }   // không thấy vùng ghim: neo góc trên phải
        stack.forEach(function (o) { if (left < o.l + W && o.l < left + W && top < o.t + o.h + 8 && o.t < top + h) top = o.t + o.h + 8; });
        stack.push({ l: left, t: top, h: h });
        el.style.left = left + "px"; el.style.top = top + "px";
      });
      if (pins.length) pinRaf = requestAnimationFrame(place);
    }
    place();
    send("pins", { step: step, found: found, shown: pins.map(function (p, i) { return p.badge.style.display === "block" ? items[i].n : null; }).filter(Boolean) });
  }

  /* ----------------------------------------------------------- 5. surface
     Chữ ký = id modal/drawer đang mở (+ vị trí progress-steps bên trong). */
  function surfaceSig() {
    return Array.prototype.filter.call(document.querySelectorAll(".modal[id], .drawer[id]"), function (el) {
      return !el.hidden && !el.classList.contains("is-minimized");
    }).map(function (el) {
      var cur = el.querySelector('[aria-current="step"]');
      return el.id + (cur ? ":" + (Array.prototype.indexOf.call(cur.parentElement.children, cur) + 1) : "");
    }).join(" ");
  }
  var lastSig = null, sigTimer;
  function watchSurface() {
    lastSig = surfaceSig();
    new MutationObserver(function () {
      clearTimeout(sigTimer);
      sigTimer = setTimeout(function () {
        var s = surfaceSig();
        if (s !== lastSig) { lastSig = s; send("surface", { sig: s }); }
      }, 150);
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden", "class", "aria-current"] });
  }

  /* Phím tắt khi focus đang ở trong màn: chuyển cho viewer. */
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === "Escape" && inspecting) { setInspect(false); send("key", { key: "Escape" }); return; }
    if ("iI[]hHnN".indexOf(e.key) >= 0 && e.key.length === 1) send("key", { key: e.key });
  });

  document.addEventListener("DOMContentLoaded", function () { send("ready", { inventory: inventory() }); });
  window.addEventListener("load", function () {
    setTimeout(function () {
      var broken = Array.prototype.filter.call(document.images, function (i) { return i.complete && i.naturalWidth === 0 && i.getAttribute("src"); })
        .map(function (i) { return i.getAttribute("src").slice(0, 80); });
      if (!boot.probe) watchSurface();
      send("loaded", { broken: broken, inventory: inventory(), sig: boot.probe ? surfaceSig() : lastSig });
    }, 300);
  });
})();
