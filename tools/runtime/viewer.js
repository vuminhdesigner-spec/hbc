/* ============================================================
   Viewer — khung ngoài của file flow: danh sách step, độ phân giải, Inspect,
   panel chi tiết. Dữ liệu nằm trong <script id="mdm-data">.

   Màn chạy trong iframe srcdoc và có thể KHÁC ORIGIN với viewer (công cụ deploy
   nhúng trang trong iframe sandbox), nên viewer không đọc DOM của màn: mọi thứ
   đi qua postMessage (xem shim.js).
   ============================================================ */
(function () {
  "use strict";
  var DATA = JSON.parse(document.getElementById("mdm-data").textContent);
  var flow = DATA.flow;
  var $ = function (s) { return document.querySelector(s); };
  var frame = $("#hvFrame"), stepList = $("#hvSteps"), detail = $("#hvDetail"), compPane = $("#hvPaneComp"), trackPane = $("#hvPaneTrack");
  var state = { step: null, search: "", inspect: false, width: "1440", inventory: null, errors: [], notesOn: false, notesBefore: false, notesClosed: {} };
  var V = DATA.versions || { releases: [], added: [], changed: [], removed: [] };
  V.changes = V.changes || []; V.ds = V.ds || [];
  /* Ghi chú của step, đánh số theo thứ tự trong flow.json — số này cũng là số ghim trên màn. */
  function notesOf(id) { return V.changes.filter(function (c) { return c.step === id; }).map(function (c, i) { return { n: i + 1, step: c.step, note: c.note, sel: c.sel }; }); }
  function markOf(id) { return V.added.indexOf(id) >= 0 ? "added" : V.changed.indexOf(id) >= 0 ? "changed" : null; }
  /* Nhãn Mới/Đổi trên cây: bấm để mở lịch sử của step đó (lối tắt, phím H là lối chính). */
  function treeMark(id) { return id ? markHtml(markOf(id)).replace('<span class="hv-mark', '<span data-hist-open="' + esc(id) + '" class="hv-mark hv-mark--btn').replace(/title="([^"]*)"/, 'title="$1 · bấm để xem thay đổi"') : ""; }
  function markHtml(kind) {
    if (!kind || V.ui === false) return "";
    var since = V.since != null ? " so với v" + V.since : "";
    return '<span class="hv-mark' + (kind === "added" ? " hv-mark--added" : "") + '" title="' + (kind === "added" ? "Step mới" : "Đã đổi") + since + '">' + (kind === "added" ? "Mới" : "Đổi") + "</span>";
  }

  /* Bảng tra giá trị -> token dev (--ds-*), khớp theo GIÁ TRỊ. */
  var devByValue = {};
  Object.keys(DATA.dev.tokens).forEach(function (n) {
    var v = norm(DATA.dev.tokens[n]);
    (devByValue[v] = devByValue[v] || []).push(n);
  });
  function norm(v) { return String(v).trim().toLowerCase().replace(/\s+/g, " ").replace(/^0px$/, "0"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function post(type, data) {
    data = data || {};
    data.mdm = type;
    if (frame.contentWindow) frame.contentWindow.postMessage(data, "*");
  }

  /* ------------------------------------------------------------- srcdoc */
  function scriptSafe(code) { return code.replace(/<\/script/gi, "<\\/script"); }
  /* Mã của màn nằm trong <script type="text/plain" data-screen|data-file> (dễ đọc cho AI của dev); ds/shim/ảnh trong #mdm-pack (gzip). */
  var BLOCK = {};
  document.querySelectorAll('script[type="text/plain"]').forEach(function (el) {
    var text = el.textContent.replace(/^\n|\n$/g, "").replace(/<\\\/script/gi, "</script").replace(/<\\!--/g, "<!--");
    if (el.dataset.part === "html") BLOCK["screen:" + el.dataset.screen] = text;
    if (el.dataset.file) BLOCK[el.dataset.file] = text;
  });
  function unpack() {
    var b64 = document.getElementById("mdm-pack").textContent.trim(), bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text().then(function (t) {
      var p = JSON.parse(t);
      Object.keys(p.blocks).forEach(function (k) { BLOCK[k] = p.blocks[k]; });
      DATA.assets = p.assets;
    });
  }
  /* Màu Inspect lấy từ --hv-* của khung (đã resolve): màn brand khác có thể không có token --utui-*. */
  var rootCs = getComputedStyle(document.documentElement);
  var INSPECT = ["border", "tip-bg", "tip-fg", "tip-font", "tip-pad", "tip-radius"].reduce(function (o, k) { o[k] = rootCs.getPropertyValue("--hv-inspect-" + k).trim(); return o; }, {});
  function srcdocFor(step, search, probe, html) {
    var s = { html: html || BLOCK["screen:" + step.screen] };
    var boot = { screen: step.screen, query: search, assets: DATA.assets, registry: DATA.registry, probe: !!probe, inspect: INSPECT };
    return s.html
      .replace(/<script data-mdm-shim><\/script>/, function () {
        return "<script>window.__MDM_BOOT=" + JSON.stringify(boot).replace(/</g, "\\u003c") + ";\n" + scriptSafe(BLOCK["runtime/shim.js"]) + "</script>";
      })
      .replace(/<style data-mdm-css="([^"]+)"><\/style>/g, function (_m, keys) {
        return "<style>" + keys.split("|").map(function (k) { return BLOCK[k]; }).join("\n").replace(/<\/style/gi, "<\\/style") + "</style>";
      })
      .replace(/<script data-mdm-js="([^"]+)"><\/script>/g, function (_m, k) {
        return "<script>" + scriptSafe(BLOCK[k]) + "</script>";
      })
      .replace(/__MDM_ASSET__\/([^"')\s]+)/g, function (m, k) { return DATA.assets[k] || m; });
  }

  function load(stepId, search, push) {
    var step = flow.steps.filter(function (s) { return s.id === stepId; })[0] || flow.steps[0];
    if (step !== state.origin) state.notesBefore = false;
    state.step = state.origin = step;
    state.search = search != null ? search : (step.query || "");
    state.inventory = null;
    if (state.hv) { state.hv.focus = 0; state.hv.found = null; }
    frame.srcdoc = srcdocFor(step, state.search, false, state.hv ? histSrc(step) : state.notesBefore ? prevSrc(step) : null);
    show(step, push === false ? null : "pushState");
    if (state.hv) renderHist();
    compPane.innerHTML = trackPane.innerHTML = "";
    if (!detail.dataset.pinned) inspectHint();
  }
  /* Cập nhật step list + header mà không nạp lại màn. */
  function show(step, how) {
    state.step = step;
    var h = stepHash();
    if (how && location.hash !== h) { try { history[how](null, "", h); } catch (_) {} }
    renderSteps();
    $("#hvStepTitle").textContent = step.title;
    var leaf = leafOf[step.id], path = [flow.title].concat(leaf.up.slice(1).map(function (n) { return n.label; }));
    var mine = leaf.members && leaf.members.filter(function (m) { return m.s === step; })[0], last = leaf.label;
    var crumb = $("#hvCrumb");
    crumb.innerHTML = path.map(function (l) { return '<span class="hv-crumb__up">' + esc(l) + '</span><span class="hv-crumb__sep" aria-hidden="true">›</span>'; }).join("") + esc(last);
    crumb.title = path.concat(last, mine ? [mine.label] : []).join(" › ");
    var vbar = $("#hvVariants");
    vbar.hidden = !mine;
    vbar.setAttribute("aria-label", mine ? "Biến thể: " + leaf.label : "Biến thể");
    vbar.innerHTML = mine ? leaf.members.map(function (m) {
      return '<button class="hv-btn" type="button" data-step="' + esc(m.s.id) + '" aria-pressed="' + (m.s === step) + '" title="' + esc(m.s.title) + '">' + esc(m.label) + '</button>';
    }).join("") : "";
    renderNotesSwitch();
    if (box) fit();
    $("#hvStepMeta").textContent = "screens/" + step.screen + ".html" + state.search;
    renderVersions();
    sendPins();
    document.title = step.title + " · " + flow.title;
  }

  function stepHash() { return "#" + state.origin.id + (state.search !== (state.origin.query || "") ? "|" + state.search : ""); }

  function fromHash() {
    var raw = decodeURIComponent(location.hash.slice(1));
    if (raw.indexOf("__selftest") === 0) return;
    var parts = raw.split("|");
    load(parts[0] || flow.steps[0].id, parts.length > 1 ? parts[1] : null, false);
  }

  /* Cây Màn › Luồng (`group`) › [Ngoại lệ (`case: "edge"`)] › Trạng thái; step cùng `variant` gộp một lá. Prev/Next vẫn theo thứ tự flow. */
  function fold(x) { return String(x).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase(); }
  function bare(x) { return fold(x).replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim(); }
  var SAMPLE = /\s*\(dữ liệu mẫu\)\s*/;
  /* Tầng gốc (kiểu Storybook) = thư mục của màn; nhãn ở flow.json › sections. */
  var nid = 0, roots = [], byRoot = {}, byScreen = {}, byVariant = {}, leafOf = {};
  flow.steps.forEach(function (s, i) {
    var dir = s.screen.split("/").slice(0, -1).join("/"), root = byRoot[dir];
    if (!root) roots.push(root = byRoot[dir] = { id: "hvN" + nid++, label: (flow.sections && flow.sections[dir]) || flow.title, kids: [] });
    var scr = byScreen[s.screen];
    if (!scr) root.kids.push(scr = byScreen[s.screen] = { id: "hvN" + nid++, label: (flow.screens && flow.screens[s.screen]) || s.title, kids: [], groups: {}, root: root });
    var parent = scr, up = [root, scr];
    if (s.group) {
      parent = scr.groups[s.group];
      if (!parent) scr.kids.push(parent = scr.groups[s.group] = { id: "hvN" + nid++, label: s.group, kids: [] });
      up.push(parent);
    }
    if (s.case === "edge") {
      if (!parent.edge) parent.edge = { id: "hvN" + nid++, label: "Ngoại lệ", kids: [], isEdge: true };
      parent = parent.edge;
      up.push(parent);
    }
    var title = s.title.replace(SAMPLE, " ").trim(), label = s.label || title, cut = s.label ? -1 : title.indexOf(" — ");
    if (cut > 0 && [scr.label, s.group || ""].some(function (l) { return l && bare(l) === bare(title.slice(0, cut)); })) label = title.slice(cut + 3);
    if (!s.label && (bare(label) === bare(scr.label) || (s.group && bare(label) === bare(s.group)))) label = "Mặc định";
    var hay = fold([s.title, s.group, s.variant, scr.label, s.id, s.query].join(" ")), leaf;
    label = label.charAt(0).toUpperCase() + label.slice(1);
    if (s.variant) {
      var vkey = parent.id + "|" + s.variant;
      leaf = byVariant[vkey];
      if (!leaf) parent.kids.push(leaf = byVariant[vkey] = { s: s, label: s.variant, members: [], hay: "", up: up });
      leaf.members.push({ s: s, label: label, hay: hay });
      leaf.hay += " " + hay;
    } else parent.kids.push(leaf = { s: s, label: label, hay: hay, up: up });
    leafOf[s.id] = leaf;
  });
  // Nhánh Ngoại lệ luôn ở cuối luồng (hoặc cuối màn nếu step không có group).
  roots.forEach(function (root) { root.kids.forEach(function (scr) {
    [scr].concat(scr.kids).forEach(function (n) {
      if (n.edge) { n.edge.label += " (" + n.edge.kids.length + ")"; n.kids.push(n.edge); }
    });
  }); });
  // Màn chỉ có một luồng → bỏ tầng luồng; màn chỉ một step → một dòng.
  roots.forEach(function (root) { root.kids.forEach(function (scr) {
    if (scr.kids.length === 1 && scr.kids[0].kids && !scr.kids[0].isEdge) {
      var only = scr.kids[0];
      scr.kids = only.kids;
      leaves(scr).forEach(function (l) { l.up = l.up.filter(function (n) { return n !== only; }); });
    }
  }); });
  function leaves(n) { return n.kids ? n.kids.reduce(function (a, k) { return a.concat(leaves(k)); }, []) : [n]; }

  var open = {}, fopen = {}, findInput = $("#hvFind");
  roots.forEach(function (r) { open[r.id] = true; });
  state.filter = "";
  function matchHay(hay) {
    return !state.filter || state.filter.split(" ").every(function (t) { return hay.indexOf(t) >= 0; });
  }
  function hasMark(id) { if (V.ui === false) return false; if (!state.hv) return !!markOf(id); var c = countOf(id, verOf(state.hv.v)); return c === "new" || c > 0; }
  function marked(leaf) { return leaf.members ? leaf.members.some(function (m) { return markOf(m.s.id); }) : !!markOf(leaf.s.id); }
  function match(leaf) { return matchHay(leaf.hay) && (!state.onlyChanged || marked(leaf)); }
  function isCur(l) { return l.members ? l.members.some(function (m) { return m.s === state.step; }) : l.s === state.step; }
  /* Lá biến thể trỏ tới biến thể đang xem, nếu không thì biến thể đầu tiên khớp ô tìm. */
  function target(l) {
    if (!l.members) return l.s;
    var cur = l.members.filter(function (m) { return m.s === state.step; })[0] || l.members.filter(function (m) { return matchHay(m.hay); })[0];
    return (cur || l.members[0]).s;
  }
  /* Kiểu Storybook: chevron trái, icon theo loại — màn `web` (component), luồng `folder` (group), trạng thái `bookmark` (story). */
  function ico(name, cls) { return '<span class="material-symbols-outlined hv-ico ' + cls + '" aria-hidden="true">' + name + '</span>'; }
  var SPACER = '<span class="hv-ico" aria-hidden="true"></span>';
  function leafHtml(l, depth) {
    var s = target(l), cur = isCur(l);
    return '<li><a class="hv-step hv-step--d' + depth + (cur ? " is-current" : "") + '" href="#' + esc(s.id) + '"' + (cur ? ' aria-current="step"' : "") + '>' + SPACER +
      (depth === 0 ? ico("web", "hv-ico--screen") : ico(l.members ? "stacks" : "bookmark", "hv-ico--state")) +
      '<span class="hv-step__title" data-tooltip-overflow>' + esc(depth === 0 && !l.members ? s.title.replace(SAMPLE, " ").trim() : l.label) + '</span>' +
      (state.hv ? histMark(s.id) : treeMark(l.members ? (l.members.map(function (m) { return markOf(m.s.id) ? m.s.id : null; }).filter(Boolean)[0] || null) : markOf(s.id) ? s.id : null)) +
      (l.members ? '<span class="hv-step__count" aria-label="' + l.members.length + ' biến thể">' + l.members.length + '</span>' : "") + '</a></li>';
  }
  function nodeHtml(n, depth) {
    if (!n.kids) return match(n) ? leafHtml(n, depth) : "";
    var all = leaves(n);
    if (depth === 0 && all.length === 1) return match(all[0]) ? leafHtml(all[0], 0) : "";
    var inner = n.kids.map(function (k) { return nodeHtml(k, depth + 1); }).join("");
    if (!inner) return "";
    var has = all.some(isCur);
    var on = state.filter || state.onlyChanged ? fopen[n.id] !== false : !!open[n.id], here = has && !on;
    return '<li class="hv-grp"><button class="hv-grp__head hv-grp__head--d' + depth + (here ? " is-current" : "") + '" type="button" aria-expanded="' + on + '" aria-controls="' + n.id + '">' +
      ico(on ? "expand_more" : "chevron_right", "hv-ico--chev") +
      (depth === 0 ? ico("web", "hv-ico--screen") : n.isEdge ? ico("report", "hv-ico--edge") : ico(on ? "folder_open" : "folder", "hv-ico--group")) +
      '<span class="hv-grp__title" data-tooltip-overflow>' + esc(n.label) + '</span>' + (!on && all.some(function (l) { return hasMark(l.s.id) || (l.members || []).some(function (m) { return hasMark(m.s.id); }); }) ? '<span class="hv-mark-dot" title="Có step mới/đổi"></span>' : "") + (here ? '<span class="hv-sr"> (đang xem)</span>' : "") + '</button>' +
      '<ol class="hv-steps hv-steps--sub" id="' + n.id + '"' + (on ? "" : " hidden") + '>' + inner + '</ol></li>';
  }
  function rootHtml(r) {
    var inner = r.kids.map(function (k) { return nodeHtml(k, 0); }).join("");
    if (!inner) return "";
    var has = leaves(r).some(isCur);
    var on = state.filter || state.onlyChanged ? fopen[r.id] !== false : !!open[r.id];
    return '<li class="hv-root"><button class="hv-root__head' + (has && !on ? " is-current" : "") + '" type="button" aria-expanded="' + on + '" aria-controls="' + r.id + '">' +
      ico(on ? "expand_more" : "chevron_right", "hv-ico--chev") + '<span class="hv-root__title" data-tooltip-overflow>' + esc(r.label) + '</span>' + (has && !on ? '<span class="hv-sr"> (đang xem)</span>' : "") + '</button>' +
      '<ol class="hv-steps hv-steps--root" id="' + r.id + '"' + (on ? "" : " hidden") + '>' + inner + '</ol></li>';
  }
  /* Dựng lại cây nhưng giữ focus bàn phím nếu đang ở trong list. */
  function renderSteps() {
    var ae = document.activeElement, keep = ae && stepList.contains(ae) ? (ae.getAttribute("aria-controls") || ae.getAttribute("href")) : null;
    if (state.step && state.openedFor !== state.step.id) {
      state.openedFor = state.step.id;
      leafOf[state.step.id].up.forEach(function (n) { open[n.id] = true; });
    }
    var html = roots.map(rootHtml).join("");
    stepList.innerHTML = html || '<li class="hv-empty">' + (state.filter ? "Không có step nào khớp “" + esc(findInput.value.trim()) + "”" + (state.onlyChanged ? " trong các step đổi" : "") : "Không có step nào đổi") + ".</li>";
    if (keep) {
      var back = stepList.querySelector('[aria-controls="' + keep + '"]') ||
        Array.prototype.filter.call(stepList.querySelectorAll("a.hv-step"), function (a) { return a.getAttribute("href") === keep; })[0];
      if (back && !back.closest("[hidden]")) back.focus();
    }
    revealCurrent();
  }
  findInput.addEventListener("input", function () {
    state.filter = fold(findInput.value).replace(/\s+/g, " ").trim();
    fopen = {};
    renderSteps();
  });
  var onlyBtn = $("#hvOnlyChanged"), nChanged = V.added.length + V.changed.length;
  onlyBtn.hidden = !nChanged || V.ui === false;
  onlyBtn.querySelector(".hv-only__n").textContent = nChanged;
  onlyBtn.onclick = function () {
    state.onlyChanged = !state.onlyChanged;
    onlyBtn.setAttribute("aria-pressed", String(state.onlyChanged));
    fopen = {};
    renderSteps();
  };
  findInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && findInput.value) { e.stopPropagation(); findInput.value = ""; findInput.dispatchEvent(new Event("input")); }
  });
  /* Cuộn riêng .hv-side (không dùng scrollIntoView: nó cuộn cả trang chứa viewer). */
  function revealCurrent() {
    var side = $("#hvSide"), cur = stepList.querySelector('.is-current');
    if (!cur || !side.clientHeight) return;
    var r = cur.getBoundingClientRect(), sr = side.getBoundingClientRect(), pad = 8;
    if (r.top < sr.top + pad) side.scrollTop -= sr.top + pad - r.top;
    else if (r.bottom > sr.bottom - pad) side.scrollTop += r.bottom - (sr.bottom - pad);
  }
  /* Bấm step: tự điều hướng thay vì dựa vào hashchange (sandbox có thể chặn history). */
  stepList.addEventListener("click", function (e) {
    var g = e.target.closest(".hv-grp__head, .hv-root__head");
    if (g) { var gid = g.getAttribute("aria-controls"); (state.filter || state.onlyChanged ? fopen : open)[gid] = g.getAttribute("aria-expanded") !== "true"; renderSteps(); stepList.querySelector('[aria-controls="' + gid + '"]').focus(); return; }
    var hm = e.target.closest("[data-hist-open]");
    if (hm) { e.preventDefault(); var hid = hm.dataset.histOpen; setHistory(true, { step: hid, v: HV[0] && HV[0].version }); return; }
    var a = e.target.closest("a.hv-step");
    if (!a) return;
    e.preventDefault();
    load(a.getAttribute("href").slice(1));
  });

  function navigate(pathname, search) {
    var key = pathname.replace(/^\/screens\//, "").replace(/\.html$/, "");
    var exact = flow.steps.filter(function (s) { return s.screen === key && (s.query || "") === search; })[0];
    var any = exact || flow.steps.filter(function (s) { return s.screen === key; })[0];
    if (!any) { toast("“" + pathname + "” nằm ngoài flow này — màn đó chưa được bàn giao."); return; }
    load(any.id, search);
  }

  /* ------------------------------------- step theo modal/drawer đang mở
     Màn báo chữ ký surface (shim.js §5). Chữ ký của từng step học lúc step đó
     nạp; step chưa gặp thì dò trong iframe ẩn, lần lượt, dừng ở step khớp đầu tiên.
     Chỉ highlight: hash/search giữ step đã nạp (state.origin) để reload đúng trạng thái thật. */
  var SIG_KEY = "mdm.viewer.sig." + flow.id + "." + DATA.meta.builtAt, sigOf = {};
  try { sigOf = JSON.parse(localStorage.getItem(SIG_KEY)) || {}; } catch (_) {}
  function learn(id, sig) {
    sigOf[id] = sig;
    try { localStorage.setItem(SIG_KEY, JSON.stringify(sigOf)); } catch (_) {}
  }
  /* importDrawer ↔ ?import=1, approverModal ↔ ?preview=approvers: dò step trùng chữ trước. */
  function words(x) {
    return String(x).replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/)
      .filter(function (w) { return w.length > 2 && w !== "modal" && w !== "drawer"; });
  }
  function score(step, want) {
    return words(step.query || "").filter(function (w) { return want.some(function (x) { return x.indexOf(w) === 0 || w.indexOf(x) === 0; }); }).length;
  }
  var syncToken = 0, probe = null, probeDone = null, probeChain = Promise.resolve();
  function findBySig(sig) {
    var o = state.origin;
    if (sigOf[o.id] === sig) return o;
    if (sigOf[state.step.id] === sig && state.step.screen === o.screen) return state.step;
    return flow.steps.filter(function (s) { return s.screen === o.screen && sigOf[s.id] === sig; })[0] || null;
  }
  function probeStep(step) {
    probeChain = probeChain.then(function () {
      return new Promise(function (resolve) {
        if (!probe) {
          probe = document.createElement("iframe");
          probe.setAttribute("sandbox", "allow-scripts");
          probe.setAttribute("aria-hidden", "true");
          probe.tabIndex = -1;
          probe.className = "hv-probe";
          document.body.appendChild(probe);
        }
        var t = setTimeout(function () { probeDone = null; resolve(null); }, 8000);
        probeDone = function (sig) { clearTimeout(t); probeDone = null; resolve(sig); };
        probe.style.width = state.width + "px";
        probe.srcdoc = srcdocFor(step, step.query || "", true);
      });
    });
    return probeChain;
  }
  async function syncSurface(sig) {
    var token = ++syncToken, origin = state.origin, hit = findBySig(sig);
    if (hit) { if (hit !== state.step) show(hit); return; }
    var want = words(sig);
    var todo = flow.steps.filter(function (s) { return s.screen === origin.screen && !(s.id in sigOf); })
      .map(function (s, i) { return { s: s, k: score(s, want), i: i }; })
      .sort(function (a, b) { return b.k - a.k || a.i - b.i; }).map(function (x) { return x.s; });
    for (var i = 0; i < todo.length; i++) {
      var got = await probeStep(todo[i]);
      if (got != null) learn(todo[i].id, got); else sigOf[todo[i].id] = null;
      if (token !== syncToken || state.origin !== origin) return;
      if (got === sig) { show(todo[i]); return; }
    }
  }

  /* --------------------------------------------------------- tin từ màn */
  var waiters = [];
  function waitFor(type, ms) {
    return new Promise(function (resolve) {
      var w = { type: type, resolve: resolve };
      waiters.push(w);
      setTimeout(function () { var i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); resolve(null); } }, ms || 8000);
    });
  }
  window.addEventListener("message", function (e) {
    if (probe && e.source === probe.contentWindow) { if (e.data && e.data.mdm === "loaded" && probeDone) probeDone(e.data.sig); return; }
    if (e.source !== frame.contentWindow || !e.data || !e.data.mdm) return;
    var m = e.data;
    if (m.mdm === "loaded" && state.step === state.origin && state.search === (state.step.query || "")) learn(state.step.id, m.sig);
    if (m.mdm === "surface" && !state.selftest) syncSurface(m.sig);
    if (m.mdm === "navigate") navigate(m.pathname, m.search);
    if (m.mdm === "reload") load(state.origin.id, state.search, false);
    if (m.mdm === "error") { state.errors.push({ screen: state.step.screen, msg: m.msg }); toast("Lỗi JS trong " + state.step.screen + ": " + m.msg); }
    if (m.mdm === "ready" || m.mdm === "loaded") {
      state.inventory = m.inventory;
      post("setInspect", { on: state.inspect });
      renderInventory();
      if (m.mdm === "loaded") { sendPins(); sendDiff(); }
    }
    if (m.mdm === "detail") renderDetail(m.d);
    if (m.mdm === "diff" && state.hv) { state.hv.found = m.focus ? { n: m.focus, shown: m.shown } : null; renderHist(); }
    if (m.mdm === "pins") { state.pinFound = { step: m.step, found: m.found, shown: m.shown }; renderVersions(); }
    if (m.mdm === "pinClose" || m.mdm === "pinToggle") { var ck = state.step.id + ":" + m.n; state.notesClosed[ck] = m.mdm === "pinClose" ? 1 : !state.notesClosed[ck]; sendPins(); }
    if (m.mdm === "pinVer") { state.notesBefore = !!m.before; state.notesFocus = m.before ? "before" : "after"; load(state.origin.id, state.search, false); }
    if (m.mdm === "pin") { setSide("right", true); selectTab("hvTabVer"); var li = $('#hvPaneVer [data-note="' + m.n + '"]'); if (li) li.focus(); }
    if (m.mdm === "key") {
      if (m.key === "Escape") setInspect(false);
      if (m.key === "h" || m.key === "H") setHistory(!state.hv);
      if (m.key === "n" || m.key === "N") setNotes(!state.notesOn);
      if (m.key === "i" || m.key === "I") setInspect(!state.inspect);
      if (m.key === "[") toggleSide("left");
      if (m.key === "]") toggleSide("right");
    }
    waiters.slice().forEach(function (w) {
      if (w.type === m.mdm) { waiters.splice(waiters.indexOf(w), 1); w.resolve(m); }
    });
  });

  /* --------------------------------------------------------------- Inspect */
  function setInspect(on) {
    state.inspect = !!on;
    if (on) { setSide("right", true); selectTab("hvTabInspect"); }
    $("#hvInspect").setAttribute("aria-pressed", String(state.inspect));
    post("setInspect", { on: state.inspect });
  }

  function angularFor(name, classes) {
    var a = DATA.dev.angular[name];
    if (!a) return '<p class="hv-muted">Chưa có component Angular tương ứng (ds/angular-map.json).</p>';
    var block = (DATA.registry.filter(function (c) { return c.name === name; })[0] || { block: "." + name }).block.slice(1);
    var attrs = [], open = [];
    classes.forEach(function (c) {
      if (c.indexOf(block + "--") !== 0) return;
      var mod = c.slice(block.length + 2), m = a.modifiers && a.modifiers[mod];
      if (m && m.input) attrs.push(m.input + '="' + m.value + '"' + (m.confirmed ? "" : " ?"));
      else open.push("." + c);
    });
    return '<p><code class="hv-code">&lt;' + esc(a.selector) + (attrs.length ? " " + esc(attrs.join(" ")) : "") + '&gt;</code></p>' +
      '<p class="hv-muted">' + esc(a.file) + '</p>' +
      (open.length ? '<p class="hv-note">Chưa có input tương ứng: ' + esc(open.join(" ")) + ' — cần dev xác nhận.</p>' : "") +
      (attrs.some(function (x) { return / \?$/.test(x); }) ? '<p class="hv-note">Dấu ? = bản nháp ghép theo tên, chờ dev xác nhận.</p>' : "") +
      (a.note ? '<p class="hv-muted">' + esc(a.note) + '</p>' : "") +
      (a.inputs.length ? '<p class="hv-muted">inputs: ' + a.inputs.map(function (i) { return '<code class="hv-code">' + esc(i) + '</code>'; }).join(" ") + '</p>' : "");
  }
  function swatch(v) {
    return /^(#|rgb|hsl)/i.test(v) ? '<span class="hv-swatch" style="background:' + esc(v) + '"></span>' : "";
  }
  function renderDetail(d) {
    detail.dataset.pinned = "1";
    selectTab("hvTabInspect");
    var rows = d.tokens.map(function (t) {
      var dev = devByValue[norm(t.value)];
      return "<tr><td>" + esc(t.prop) + '</td><td><code class="hv-code">' + esc(t.token) + "</code></td><td>" +
        swatch(t.value) + esc(t.value) + "</td><td>" + (dev ? dev.slice(0, 2).map(function (n) { return '<code class="hv-code">' + esc(n) + "</code>"; }).join(" ") : '<span class="hv-muted">—</span>') + "</td></tr>";
    }).join("");
    detail.innerHTML =
      '<div class="hv-panel__head"><h2 class="hv-h2">' + esc(d.component || "Ngoài registry") + (d.part ? ' <span class="hv-muted">› ' + esc(d.part.split("__")[1]) + "</span>" : "") + '</h2>' +
      '<button class="hv-btn hv-btn--ghost" type="button" id="hvBack">Tổng quan màn</button></div>' +
      (d.contract ? '<p class="hv-muted">Contract: <code class="hv-code">' + esc(d.contract) + "</code></p>" : '<p class="hv-note">Phần tử này không thuộc component nào trong registry — là composition của màn hoặc HTML thường.</p>') +
      '<h3 class="hv-h3">HTML</h3><p><code class="hv-code">&lt;' + esc(d.tag) + (d.role ? ' role="' + esc(d.role) + '"' : "") + "&gt;</code> " +
      d.classes.map(function (c) { return '<code class="hv-code">.' + esc(c) + "</code>"; }).join(" ") + "</p>" +
      (d.states.length ? '<p class="hv-muted">Trạng thái: ' + d.states.map(function (c) { return '<code class="hv-code">' + esc(c) + "</code>"; }).join(" ") + "</p>" : "") +
      (d.component ? '<h3 class="hv-h3">Angular (DS của dev)</h3>' + angularFor(d.component, d.classes) : "") +
      '<h3 class="hv-h3">Token áp lên phần tử (' + d.tokens.length + ')</h3>' +
      (rows ? '<div class="hv-table-wrap"><table class="hv-table"><thead><tr><th>Thuộc tính</th><th>Token</th><th>Giá trị</th><th>Token dev</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
            : '<p class="hv-muted">Không có rule nào dùng var(--…) trực tiếp trên phần tử này.</p>');
    $("#hvBack").onclick = function () { delete detail.dataset.pinned; inspectHint(); selectTab("hvTabComp"); };
  }
  function inspectHint() {
    detail.innerHTML = '<p class="hv-muted">Bật <strong>Inspect</strong> (phím I) rồi bấm vào phần tử trên màn để xem class, token, bản Angular.</p>';
  }
  function renderInventory() {
    var rows = state.inventory;
    $("#hvTabComp").innerHTML = "Component" + (rows ? ' <span class="hv-tab__n">' + rows.length + "</span>" : "");
    if (!rows) { compPane.innerHTML = ""; return; }
    var ev = trackingFor();
    $("#hvTabTrack").innerHTML = "Đo lường" + (ev.length ? ' <span class="hv-tab__n">' + ev.length + "</span>" : "");
    trackPane.innerHTML = renderTracking(ev);
    compPane.innerHTML =
      '<p class="hv-muted">Bật <strong>Inspect</strong> (phím I) rồi bấm vào phần tử để xem class, token, bản Angular.</p>' +
      '<div class="hv-table-wrap"><table class="hv-table"><thead><tr><th>Component</th><th>Số lần</th><th>Angular</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var a = DATA.dev.angular[r.name];
        return "<tr><td><code class=\"hv-code\">" + esc(r.block) + "</code></td><td>" + r.n + "</td><td>" + (a ? '<code class="hv-code">' + esc(a.selector) + "</code>" : '<span class="hv-muted">chưa map</span>') + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  /* Event đo lường của màn đang xem, từ flows/<id>.tracking.json. */
  var ON_LABEL = { route: "Vào màn", click: "Bấm", search: "Tìm kiếm", "api-success": "API thành công", "api-fail": "API lỗi", state: "Khi hiển thị", "submit-invalid": "Gửi form lỗi" };
  var SEL_LABEL = { click: "Gắn vào", search: "Gắn vào", "api-success": "Form", "api-fail": "Form", "submit-invalid": "Form", state: "Phần tử" };
  function trackingFor() {
    var id = state.step.screen.split("/").pop();
    return (flow.tracking || []).filter(function (t) { return t.screen === id || t.screen === state.step.id || t.screen === "*"; });
  }
  function renderTracking(ev) {
    if (!ev.length) return '<p class="hv-muted">Màn này không có event đo lường.</p>';
    return '<section>' +
      '<p class="hv-muted">Chỉ gửi đúng event và param dưới đây. Luật đầy đủ trong <code class="hv-code">#mdm-ai › tracking</code>.</p>' +
      '<ol class="hv-events">' + ev.map(function (t) {
        var fixed = t.fixed || {};
        var params = Object.keys(t.params || {}).map(function (k) {
          return '<code class="hv-code">' + esc(k) + '<span class="hv-muted">: ' + esc(k in fixed ? '"' + fixed[k] + '"' : t.params[k]) + "</span></code>";
        }).join("");
        var sel = t.selector ? t.selector.split(/,\s*/).map(function (x) { return '<code class="hv-code">' + esc(x) + "</code>"; }).join("") : "";
        return '<li class="hv-event"><div class="hv-event__head"><code class="hv-event__name">' + esc(t.event) + "</code>" +
          '<span class="hv-event__on">' + esc(ON_LABEL[t.on] || t.on) + (ON_LABEL[t.on] ? ' <span class="hv-muted">· ' + esc(t.on) + "</span>" : "") + "</span></div>" +
          '<dl class="hv-event__meta">' +
          (sel ? "<dt>" + (SEL_LABEL[t.on] || "Gắn vào") + '</dt><dd class="hv-event__chips">' + sel + "</dd>" : "") +
          "<dt>Param</dt><dd" + (params ? ' class="hv-event__chips hv-event__chips--nowrap">' + params : '><span class="hv-muted">không có</span>') + "</dd></dl>" +
          (t.when ? '<p class="hv-event__when hv-muted">' + esc(t.when) + "</p>" : "") + "</li>";
      }).join("") + "</ol></section>";
  }

  /* ------------------------------------------------------------ phiên bản */
  function fmtDate(d) { var p = String(d).split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : d; }
  function stepTitle(id) { var s = flow.steps.filter(function (x) { return x.id === id; })[0]; return s ? s.title : id; }
  /* Ghim vùng đổi trên màn: shim vẽ trong iframe (khác origin), viewer chỉ gửi selector. */
  var PIN = ["pin", "pin-fg", "surface", "text", "text-2", "border", "pressed-bg", "pressed-fg", "font"].reduce(function (o, k) { o[k] = rootCs.getPropertyValue("--hv-" + k).trim(); return o; }, {});
  /* Ghi chú dính: lần đổi gần nhất của step (build › stepNotes), mặc định tắt; công tắc trên khung hoặc phím N. */
  var NOTES = V.notes || {};
  function noteOf(id) { return NOTES[id] || null; }
  function prevSrc(step) { var sn = noteOf(step.id); return sn && sn.prev && sn.prev !== "cur" ? BLOCK["hist:" + sn.prev] || null : null; }
  function renderNotesSwitch() {
    var sn = state.step && noteOf(state.step.id), sw = $("#hvNotes");
    sw.hidden = !sn || !!state.hv;
    if (!sn) return;
    sw.setAttribute("aria-checked", String(state.notesOn));
    $("#hvNotesLabel").textContent = "Ghi chú thay đổi (" + sn.items.length + ")";
  }
  function setNotes(on) {
    if (!state.step || !noteOf(state.step.id) || state.hv) return;
    state.notesOn = on;
    state.notesClosed = {};
    if (!on && state.notesBefore) { state.notesBefore = false; load(state.origin.id, state.search, false); return; }
    renderNotesSwitch();
    sendPins();
  }
  $("#hvNotes").addEventListener("click", function () { setNotes(!state.notesOn); });
  function sendNotes() {
    var sn = noteOf(state.step.id), id = state.step.id;
    if (!sn || !state.notesOn) { post("pins", { step: id, items: [], ink: PIN }); return; }
    post("pins", { step: id, items: sn.items, ink: PIN, bubble: {
      open: sn.items.filter(function (c) { return !state.notesClosed[id + ":" + c.n]; }).map(function (c) { return c.n; }),
      head: (sn.isNew ? "Mới ở v" : "Đổi ở v") + sn.v, total: sn.items.length,
      ver: sn.isNew || !sn.prev ? null : { before: state.notesBefore, labels: ["Trước · v" + sn.since, "Sau · v" + sn.v] },
      focus: state.notesFocus || null, reveal: !!state.notesFocus,
    } });
    state.notesFocus = null;
  }
  function sendPins() {
    if (!state.step || state.hv) return;
    if (V.ui === false) { sendNotes(); return; }
    post("pins", { step: state.step.id, items: notesOf(state.step.id).filter(function (c) { return c.sel; }), ink: PIN });
  }
  function noteHtml(c) {
    var f = c.sel && state.pinFound && state.pinFound.step === c.step ? state.pinFound : null;
    var hint = !f ? "" : f.found.indexOf(c.n) < 0 ? "không thấy vùng ghim trên màn" : (f.shown || []).indexOf(c.n) < 0 ? "vùng đang ẩn, mở nó trên màn để thấy ghim" : "";
    return '<li class="hv-note-item" data-note="' + c.n + '" tabindex="-1"><span class="hv-pin-n" aria-hidden="true">' + c.n + "</span><span>" + esc(c.note) +
      (hint ? ' <span class="hv-muted">(' + hint + ")</span>" : "") + "</span></li>";
  }
  /* Kiểu release notes: tóm tắt → một danh sách step đổi theo thứ tự flow (step đang xem mở ghi chú) → DS và lịch sử thu gọn. */
  function renderVersions() {
    var btn = $("#hvVersion");
    btn.innerHTML = '<span class="material-symbols-outlined hv-ico" aria-hidden="true">history</span>' + (V.current != null ? "v" + V.current + (V.frozen ? ' <span class="hv-ver__draft">· bản lưu</span>' : "")
      : "v" + V.next + ' <span class="hv-ver__draft">· nháp</span>') + (unseen() ? '<span class="hv-ver__dot" aria-hidden="true"></span><span class="hv-sr"> (có bản mới từ lần bạn xem trước)</span>' : "");
    var id = state.step && state.step.id, ver = V.current != null ? "v" + V.current : "v" + V.next + " nháp";
    var rows = flow.steps.filter(function (s) { return markOf(s.id) || notesOf(s.id).length; });
    $("#hvTabVer").innerHTML = "Phiên bản" + (rows.length ? ' <span class="hv-tab__n">' + rows.length + "</span>" : "");
    var html = "";
    if (V.frozen) html += '<p class="hv-note">Bản lưu ' + ver + '. <a href="' + esc(V.base + V.id) + '.html" target="_blank" rel="noopener">Mở bản mới nhất</a></p>';
    var count = function (n, k, label) { return n ? '<span class="hv-mark' + k + '">' + n + " " + label + "</span>" : ""; };
    html += '<p class="hv-sum"><strong>' + ver + "</strong>" + (V.since == null ? '<span class="hv-muted">Bản đầu tiên</span>'
      : '<span class="hv-muted">so với v' + V.since + "</span>" + count(V.added.length, " hv-mark--added", "mới") + count(V.changed.length, "", "đổi") + count(V.removed.length, " hv-mark--removed", "bỏ")) + "</p>";
    if (V.since != null && !rows.length && !V.removed.length) html += '<p class="hv-muted">Không step nào đổi.</p>';
    if (rows.length || V.removed.length) html += '<ul class="hv-changes">' + rows.map(function (s) {
      var here = s.id === id, ns = notesOf(s.id), kind = markOf(s.id);
      var old = here && V.since != null && kind !== "added" ? '<a class="hv-changes__old" href="' + esc(V.base + V.id + "/v" + V.since + ".html#" + s.id) + '" target="_blank" rel="noopener">Xem ở v' + V.since + " ↗</a>" : "";
      return '<li class="hv-changes__row' + (here ? " is-here" : "") + '"><a class="hv-changes__head" href="#' + esc(s.id) + '" data-step-link="' + esc(s.id) + '"' + (here ? ' aria-current="step"' : "") + ">" +
        markHtml(kind) + '<span class="hv-changes__title" data-tooltip-overflow>' + esc(s.title) + "</span></a>" +
        (here ? (ns.length ? '<ol class="hv-notes">' + ns.map(noteHtml).join("") + "</ol>" : '<p class="hv-muted">Chưa có ghi chú.</p>') + old : "") + "</li>";
    }).join("") + V.removed.map(function (x) {
      return '<li class="hv-changes__row"><span class="hv-changes__head"><span class="hv-mark hv-mark--removed">Bỏ</span><code class="hv-code">' + esc(x) + "</code></span></li>";
    }).join("") + "</ul>";
    var foot = "";
    if (V.ds.length) foot += '<details class="hv-more"><summary>' + V.ds.length + " file design system đổi</summary><ul>" +
      V.ds.map(function (d) { return '<li><code class="hv-code">' + esc(d.file.replace(/^ds\//, "")) + "</code></li>"; }).join("") + "</ul></details>";
    var keep = Array.prototype.map.call(document.querySelectorAll("#hvPaneVer details"), function (d) { return d.open; });
    $("#hvPaneVer").innerHTML = html + '<div class="hv-foot">' + foot + "</div>";
    document.querySelectorAll("#hvPaneVer details").forEach(function (d, i) { if (keep.length === document.querySelectorAll("#hvPaneVer details").length && keep[i]) d.open = true; });
  }
  $("#hvPaneVer").addEventListener("click", function (e) {
    var a = e.target.closest("[data-step-link]");
    if (a) { e.preventDefault(); load(a.dataset.stepLink); }
  });

  /* Lịch sử phiên bản kiểu Google, tính theo step: cây = tab, panel phải = danh sách bản, màn ở bản đang chọn
     với chỗ đổi được tô (so DOM với bản trước có step đó), "Tổng N thay đổi ↑↓". */
  var HV = V.hist || [], diffCache = {};
  function verOf(v) { return HV.filter(function (h) { return h.version === v; })[0]; }
  function verLabel(h) { return "v" + h.version + (h.draft ? " · nháp" : h.date ? " · " + fmtDate(h.date) : ""); }
  function htmlAt(h, screen) {
    var id = h && h.screens[screen];
    return !id ? null : id === "cur" ? BLOCK["screen:" + screen] : BLOCK["hist:" + id] || null;
  }
  function hasStep(h, id) { return h.steps.indexOf(id) >= 0 && !!htmlAt(h, (flow.steps.filter(function (s) { return s.id === id; })[0] || {}).screen); }
  function prevOf(h, id) { var i = HV.indexOf(h); for (var j = i + 1; j < HV.length; j++) if (hasStep(HV[j], id)) return HV[j]; return null; }
  var SKIP = { SCRIPT: 1, STYLE: 1, TEMPLATE: 1, LINK: 1, META: 1, NOSCRIPT: 1 };
  function kids(el) { return Array.prototype.filter.call(el.children, function (c) { return !SKIP[c.tagName]; }); }
  function keyOf(el) { return el.tagName + (el.id ? "#" + el.id : ""); }
  function ownText(el) { return Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; }).map(function (n) { return n.nodeValue; }).join(" ").replace(/\s+/g, " ").trim(); }
  function nameOf(el) {
    var t = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
    return t ? "“" + (t.length > 48 ? t.slice(0, 47) + "…" : t) + "”" : "<" + el.tagName.toLowerCase() + (el.classList[0] ? "." + el.classList[0] : "") + ">";
  }
  /* Selector cho DOM thật trong iframe: neo vào id gần nhất, rồi nth-child theo HTML tĩnh. */
  function selOf(el) {
    var parts = [];
    while (el && el.tagName !== "BODY") {
      if (el.id && /^[A-Za-z][\w-]*$/.test(el.id)) { parts.unshift("#" + el.id); return parts.join(" > "); }
      var i = 1, p = el.previousElementSibling;
      while (p) { i++; p = p.previousElementSibling; }
      parts.unshift(el.tagName.toLowerCase() + ":nth-child(" + i + ")");
      el = el.parentElement;
    }
    parts.unshift("body");
    return parts.join(" > ");
  }
  function lcs(a, b) {
    var n = a.length, m = b.length, d = [], i, j;
    for (i = 0; i <= n; i++) { d.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) d[i][j] = keyOf(a[i]) === keyOf(b[j]) ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
    var pairs = []; i = 0; j = 0;
    while (i < n && j < m) {
      if (keyOf(a[i]) === keyOf(b[j])) { pairs.push([i, j]); i++; j++; } else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++;
    }
    return pairs;
  }
  function attrDiff(a, b) {
    var out = [];
    Array.prototype.forEach.call(b.attributes, function (x) { var o = a.getAttribute(x.name); if (o === null) out.push("thêm " + x.name); else if (o !== x.value) out.push("đổi " + x.name); });
    Array.prototype.forEach.call(a.attributes, function (x) { if (!b.hasAttribute(x.name)) out.push("bỏ " + x.name); });
    return out;
  }
  function walk(a, b, out) {
    var ad = attrDiff(a, b), ta = ownText(a), tb = ownText(b), what = [];
    if (ad.length) what.push(ad.join(", "));
    if (ta !== tb) what.push("chữ “" + (ta.slice(0, 40) || "∅") + "” → “" + (tb.slice(0, 40) || "∅") + "”");
    if (what.length && b.tagName !== "BODY") out.push({ kind: "chg", sel: selOf(b), text: "Đổi " + nameOf(b) + ": " + what.join("; ") });
    var ka = kids(a), kb = kids(b), pairs = lcs(ka, kb), ia = {}, ib = {};
    pairs.forEach(function (p) { ia[p[0]] = ib[p[1]] = 1; walk(ka[p[0]], kb[p[1]], out); });
    kb.forEach(function (el, j) { if (!ib[j]) out.push({ kind: "add", sel: selOf(el), text: "Thêm " + nameOf(el) }); });
    ka.forEach(function (el, i) { if (!ia[i]) out.push({ kind: "del", sel: selOf(b), text: "Bỏ " + nameOf(el) + " khỏi " + nameOf(b) }); });
  }
  function bodyOf(html) { return new DOMParser().parseFromString(html, "text/html").body; }
  /* Kết quả của step ở bản h: {none} chưa có · {isNew} mới · {items[]} so với bản trước. */
  function diffOf(id, h) {
    var step = flow.steps.filter(function (s) { return s.id === id; })[0];
    if (!h || !step || !hasStep(h, id)) return { none: true };
    var p = prevOf(h, id);
    if (!p) return { isNew: true, since: null };
    var key = h.version + "|" + p.version + "|" + step.screen;
    if (!diffCache[key]) {
      var out = [], a = htmlAt(p, step.screen), b = htmlAt(h, step.screen);
      if (a !== b) walk(bodyOf(a), bodyOf(b), out);
      out.forEach(function (x, i) { x.n = i + 1; });
      diffCache[key] = out;
    }
    return { items: diffCache[key], since: p.version };
  }
  function countOf(id, h) { var d = diffOf(id, h); return d.none ? null : d.isNew ? "new" : d.items.length; }
  function histMark(id) {
    var c = countOf(id, verOf(state.hv.v));
    if (c === null) return "";
    return c === "new" ? '<span class="hv-mark hv-mark--added" title="Step mới ở bản này">Mới</span>'
      : c ? '<span class="hv-hcount" title="' + c + ' thay đổi trên màn">' + c + "</span>" : '<span class="hv-hcount hv-hcount--zero" title="Không đổi trên màn">0</span>';
  }
  function histSrc(step) {
    var h = verOf(state.hv.v);
    if (!hasStep(h, step.id)) { var any = HV.filter(function (x) { return hasStep(x, step.id); })[0]; if (any) { state.hv.v = any.version; h = any; } }
    return htmlAt(h, step.screen);
  }
  var HVINK = ["changed-fg", "added-fg", "pin"].reduce(function (o, k) { o[k] = rootCs.getPropertyValue("--hv-" + k).trim(); return o; }, {});
  function sendDiff() {
    if (!state.hv || !state.step) return;
    var d = diffOf(state.step.id, verOf(state.hv.v));
    post("diff", { items: d.items ? d.items.map(function (x) { return { n: x.n, kind: x.kind, sel: x.sel }; }) : [], focus: state.hv.focus + 1, hl: state.hv.hl, dim: state.hv.dim && !!(d.items && d.items.length), whole: !!d.isNew && state.hv.hl, ink: HVINK });
  }
  function verUrl(n) { return V.base + V.id + "/v" + n + ".html"; }
  function linkFor(h) { return new URL((h.draft || h.version === V.current ? V.base + V.id + ".html" : verUrl(h.version)) + "#" + (state.step ? state.step.id : ""), location.href).href; }
  function renderHist() {
    if (!state.hv) return;
    var h = verOf(state.hv.v), step = state.step, d = diffOf(step.id, h), items = d.items || [];
    if (state.hv.focus >= items.length) state.hv.focus = 0;
    var cur = items[state.hv.focus], vis = state.hv.found;
    var desc = d.isNew ? "Step mới ở v" + h.version + "." : !items.length ? "Không có thay đổi trên màn so với v" + d.since + "." :
      '<span class="hv-hbar__k hv-hbar__k--' + cur.kind + '">' + ({ chg: "Đổi", add: "Thêm", del: "Bỏ" })[cur.kind] + "</span> " + esc(cur.text.replace(/^(Đổi|Thêm|Bỏ) /, "")) +
      (vis && vis.n === cur.n && !vis.shown ? ' <span class="hv-muted">(đang ẩn trên màn, mở vùng chứa nó để thấy)</span>' : "");
    $("#hvHistBar").innerHTML = '<div class="hv-hbar__row"><button class="hv-btn hv-btn--icon hv-btn--ghost" type="button" data-hist-close aria-label="Thoát lịch sử phiên bản" title="Thoát · Esc"><span class="material-symbols-outlined hv-ico" aria-hidden="true">arrow_back</span></button>' +
      '<strong class="hv-hbar__title">' + esc(verLabel(h)) + "</strong>" +
      '<button class="hv-btn hv-btn--primary hv-hbar__copy" type="button" data-hist-copy>Sao chép link bản này</button><span class="hv-hbar__sp"></span>' +
      '<span class="hv-hbar__total" aria-live="polite">' + (d.isNew ? "Step mới" : "Tổng: " + items.length + " thay đổi" + (items.length ? ' <span class="hv-muted">(' + (state.hv.focus + 1) + "/" + items.length + ")</span>" : "")) + "</span>" +
      '<button class="hv-btn hv-btn--icon hv-btn--ghost" type="button" data-hist-move="-1" aria-label="Thay đổi trước"' + (items.length > 1 ? "" : " disabled") + '><span class="material-symbols-outlined hv-ico" aria-hidden="true">keyboard_arrow_up</span></button>' +
      '<button class="hv-btn hv-btn--icon hv-btn--ghost" type="button" data-hist-move="1" aria-label="Thay đổi sau"' + (items.length > 1 ? "" : " disabled") + '><span class="material-symbols-outlined hv-ico" aria-hidden="true">keyboard_arrow_down</span></button></div>' +
      '<p class="hv-hbar__desc">' + desc + "</p>";
    var others = function (x) { return flow.steps.filter(function (s) { var c = countOf(s.id, x); return s.id !== step.id && (c === "new" || c > 0); }); };
    $("#hvPaneHist").innerHTML = '<div class="hv-hp__head"><h2 class="hv-h3 hv-hp__title">Lịch sử phiên bản</h2></div>' +
      (V.frozen ? '<p class="hv-note">Bản lưu v' + V.current + ', có thể đã có bản mới hơn. <a href="' + esc(V.base + V.id) + ".html#" + esc(step.id) + '">Mở bản mới nhất</a></p>' : "") +
      '<ol class="hv-hp__list">' + HV.map(function (x) {
        var c = countOf(step.id, x), os = others(x), open = state.hv.open[x.version];
        var mine = c === null ? '<span class="hv-muted">Step chưa có ở bản này</span>' : c === "new" ? '<span class="hv-mark hv-mark--added">Mới</span> Step mới' : c ? "<b>" + c + "</b> thay đổi ở step này" : '<span class="hv-muted">0 thay đổi ở step này</span>';
        return '<li class="hv-hp__item' + (x.version === state.hv.v ? " is-on" : "") + '"><button class="hv-hp__pick" type="button" data-hist-v="' + x.version + '" aria-pressed="' + (x.version === state.hv.v) + '"' + (c === null ? " disabled" : "") + '>' +
          '<span class="hv-hp__ver">' + esc(verLabel(x)) + "</span><span class=\"hv-hp__mine\">" + mine + "</span>" + (x.note ? '<span class="hv-hp__note">' + esc(x.note) + "</span>" : "") + "</button>" +
          (os.length ? '<button class="hv-hp__more" type="button" data-hist-open-v="' + x.version + '" aria-expanded="' + !!open + '"><span class="material-symbols-outlined hv-ico" aria-hidden="true">' + (open ? "expand_more" : "chevron_right") + "</span>" + os.length + " step khác đổi</button>" +
            (open ? '<ul class="hv-hp__others">' + os.map(function (s) { var oc = countOf(s.id, x); return '<li><a href="#' + esc(s.id) + '" data-hist-step="' + esc(s.id) + '" data-hist-sv="' + x.version + '">' + esc(s.title) + "</a> " + (oc === "new" ? '<span class="hv-mark hv-mark--added">Mới</span>' : '<span class="hv-hcount">' + oc + "</span>") + "</li>"; }).join("") + "</ul>" : "") : "") + "</li>";
      }).join("") + "</ol>" +
      '<div class="hv-hp__opts"><label><input type="checkbox" data-hist-opt="hl"' + (state.hv.hl ? " checked" : "") + "> Tô thay đổi</label>" +
      '<label><input type="checkbox" data-hist-opt="dim"' + (state.hv.dim ? " checked" : "") + "> Làm mờ phần không đổi</label></div>";
  }
  /* Chấm trên nút phiên bản: có bản mới từ lần trước mở lịch sử (nhớ trên trình duyệt; lần đầu không chấm). */
  function verKey() { return HV[0] ? HV[0].version + (HV[0].draft ? "d" : "") : ""; }
  function unseen() {
    try { var k = "mdm.viewer.seen." + V.id, v = localStorage.getItem(k); if (v === null) { localStorage.setItem(k, verKey()); return false; } return v !== verKey(); } catch (_) { return false; }
  }
  function markSeen() { try { localStorage.setItem("mdm.viewer.seen." + V.id, verKey()); } catch (_) {} }
  function setHistory(on, opts) {
    opts = opts || {};
    if (V.ui === false) return;
    var was = !!state.hv;
    if (on) {
      if (!HV.length) { toast("Flow này chưa có phiên bản nào."); return; }
      state.hv = { v: opts.v != null ? opts.v : (state.hv ? state.hv.v : HV[0].version), focus: 0, hl: state.hv ? state.hv.hl : true, dim: state.hv ? state.hv.dim : false, open: state.hv ? state.hv.open : {} };
      if (!was) state.hvPanel = $(".hv-main").dataset.right;
      markSeen(); renderVersions();
      setSide("right", true);
    } else {
      state.hv = null;
      if (state.hvPanel === "closed") setSide("right", false);
    }
    document.body.classList.toggle("hv-histmode", !!state.hv);
    $("#hvHistBar").hidden = $("#hvPaneHist").hidden = !state.hv;
    $("#hvVersion").setAttribute("aria-pressed", String(!!state.hv));
    if (state.step && (on || was)) load(opts.step || state.step.id, state.search, false);
    renderSteps();
  }
  function moveFocus(dx) {
    var d = diffOf(state.step.id, verOf(state.hv.v)), n = d.items ? d.items.length : 0;
    if (!n) return;
    state.hv.focus = (state.hv.focus + dx + n) % n; state.hv.found = null;
    renderHist(); post("diffFocus", { focus: state.hv.focus + 1 });
  }
  $("#hvHistBar").addEventListener("click", function (e) {
    if (e.target.closest("[data-hist-close]")) { setHistory(false); $("#hvVersion").focus(); return; }
    var mv = e.target.closest("[data-hist-move]"); if (mv) { moveFocus(+mv.dataset.histMove); return; }
    if (e.target.closest("[data-hist-copy]")) {
      var url = linkFor(verOf(state.hv.v)), done = function () { toast("Đã sao chép " + url); }, fail = function () { toast("Không sao chép được. Link: " + url); };
      try { navigator.clipboard.writeText(url).then(done, fail); } catch (_) { fail(); }
    }
  });
  $("#hvPaneHist").addEventListener("click", function (e) {
    var p = e.target.closest("[data-hist-v]"); if (p) { state.hv.v = +p.dataset.histV; state.hv.focus = 0; load(state.step.id, state.search, false); renderSteps(); return; }
    var o = e.target.closest("[data-hist-open-v]"); if (o) { var k = o.dataset.histOpenV; state.hv.open[k] = !state.hv.open[k]; renderHist(); return; }
    var s = e.target.closest("[data-hist-step]"); if (s) { e.preventDefault(); state.hv.v = +s.dataset.histSv; state.hv.focus = 0; load(s.dataset.histStep); renderSteps(); }
  });
  $("#hvPaneHist").addEventListener("change", function (e) {
    var k = e.target.dataset.histOpt; if (!k) return;
    state.hv[k] = e.target.checked; sendDiff();
  });
  $("#hvVersion").onclick = function () { setHistory(!state.hv); };

  /* ------------------------------------------------------------- tiện ích */
  var toastTimer;
  function toast(msg) {
    var t = $("#hvToast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 4000);
  }

  /* Thu gọn hai bên; chỉ cây step nhớ lựa chọn cho lần mở sau (lỗi storage thì bỏ qua). */
  var SIDES = { left: { btn: "#hvToggleLeft", open: "left_panel_close", closed: "left_panel_open", name: "danh sách step" },
                right: { btn: "#hvToggleRight", open: "right_panel_close", closed: "right_panel_open", name: "panel chi tiết" } };
  function setSide(side, open) {
    var cfg = SIDES[side], b = $(cfg.btn);
    $(".hv-main").dataset[side] = open ? "open" : "closed";
    b.setAttribute("aria-expanded", String(open));
    b.querySelector(".hv-ico").textContent = open ? cfg.open : cfg.closed;
    b.setAttribute("aria-label", (open ? "Thu gọn " : "Mở ") + cfg.name);
    b.title = b.getAttribute("aria-label") + " · phím " + (side === "left" ? "[" : "]");
    if (side === "left") try { localStorage.setItem("mdm.viewer.left", open ? "open" : "closed"); } catch (_) {}
  }
  function toggleSide(side) { setSide(side, $(".hv-main").dataset[side] === "closed"); }

  /* Tab của panel chi tiết (WAI-ARIA tabs, kích hoạt ngay khi chuyển bằng phím). */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".hv-tab"));
  function selectTab(id) {
    tabs.forEach(function (t) {
      var on = t.id === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t) {
    t.onclick = function () { selectTab(t.id); };
    t.onkeydown = function (e) {
      var live = tabs.filter(function (x) { return !x.hidden; }), i = live.indexOf(t), j = null;
      if (e.key === "ArrowRight") j = (i + 1) % live.length;
      if (e.key === "ArrowLeft") j = (i - 1 + live.length) % live.length;
      if (e.key === "Home") j = 0;
      if (e.key === "End") j = live.length - 1;
      if (j == null) return;
      e.preventDefault(); selectTab(live[j].id); live[j].focus();
    };
  });
  $("#hvTabTrack").hidden = !(flow.tracking && flow.tracking.length);
  /* UI phiên bản đang tạm tắt (build › VERSION_UI). */
  if (V.ui === false) { $("#hvTabVer").hidden = true; $("#hvVersion").hidden = true; }

  /* Kéo đổi độ rộng cây step / panel chi tiết (invert: panel phải, kéo sang trái là rộng ra); hành vi theo ds/components/resize-handle.md (min, phím, nhấp đúp, nhớ). */
  var main = $(".hv-main");
  function resizer(handle, o) {
    var key = "mdm.viewer.size." + o.name, x = o.axis === "x";
    function px(prop) {
      var p = document.createElement("div");
      p.style.cssText = "position:absolute;visibility:hidden;width:var(" + prop + ")";
      handle.appendChild(p);
      var v = Math.round(p.getBoundingClientRect().width);
      handle.removeChild(p);
      return v;
    }
    function size() { var r = o.el.getBoundingClientRect(); return Math.round(x ? r.width : r.height); }
    function bounds() {
      var min = px(x ? "--hv-resize-min-x" : "--hv-resize-min-y");
      return { min: min, max: Math.max(min, Math.floor(x ? main.clientWidth / 2 : main.clientHeight * 0.6)) };
    }
    function sync() {
      var b = bounds(), n = size();
      handle.setAttribute("aria-valuemin", b.min); handle.setAttribute("aria-valuemax", b.max);
      handle.setAttribute("aria-valuenow", n); handle.setAttribute("aria-valuetext", n + " px");
    }
    function apply(v) {
      var b = bounds(), n = Math.min(b.max, Math.max(b.min, Math.round(v)));
      main.style.setProperty(o.prop, n + "px");
      sync();
      return n;
    }
    function save(v) { try { if (v == null) localStorage.removeItem(key); else localStorage.setItem(key, String(v)); } catch (_) {} }
    function reset() { main.style.removeProperty(o.prop); save(null); sync(); }
    var saved = null;
    try { saved = parseInt(localStorage.getItem(key), 10); } catch (_) {}
    if (isFinite(saved)) apply(saved); else sync();
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      var start = x ? e.clientX : e.clientY, from = size(), last = from;
      handle.classList.add("is-dragging");
      document.body.classList.add("hv-resizing", "hv-resizing--" + o.axis);
      function move(ev) { var d = (x ? ev.clientX : ev.clientY) - start; last = apply(x && !o.invert ? from + d : from - d); }
      function end() {
        handle.removeEventListener("pointermove", move); handle.removeEventListener("lostpointercapture", end);
        handle.classList.remove("is-dragging");
        document.body.classList.remove("hv-resizing", "hv-resizing--" + o.axis);
        save(last);
      }
      handle.addEventListener("pointermove", move); handle.addEventListener("lostpointercapture", end);
    });
    handle.addEventListener("keydown", function (e) {
      var step = px("--hv-resize-step"), b = bounds(), grow = x ? (o.invert ? "ArrowLeft" : "ArrowRight") : "ArrowUp", shrink = x ? (o.invert ? "ArrowRight" : "ArrowLeft") : "ArrowDown";
      if (e.key === "Enter") { reset(); e.preventDefault(); return; }
      var to = e.key === grow ? size() + step : e.key === shrink ? size() - step : e.key === "Home" ? b.min : e.key === "End" ? b.max : null;
      if (to == null) return;
      e.preventDefault();
      save(apply(to));
    });
    handle.addEventListener("dblclick", reset);
    window.addEventListener("resize", function () {
      if (!o.el.getClientRects().length) return;   // vùng đang đóng: giữ cỡ đã lưu
      if (main.style.getPropertyValue(o.prop)) apply(size()); else sync();
    });
  }
  resizer($("#hvResizeLeft"), { name: "left", axis: "x", prop: "--hv-left-size", el: $("#hvSide") });
  resizer($("#hvResizeRight"), { name: "right", axis: "x", invert: true, prop: "--hv-right-size", el: $("#hvPanel") });

  function setWidth(w) {
    state.width = w;
    document.querySelectorAll("[data-width]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.width === w)); });
    fit();
  }

  /* Scale như responsive mode của Chrome: dựng đúng W × H của độ phân giải,
     thu nhỏ cho vừa cả chiều rộng lẫn chiều cao khung, không phóng to quá 100%. */
  var box = $("#hvFrameBox"), stage = $(".hv-stage");
  function fit() {
    var cs = getComputedStyle(stage);
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var top = $("#hvStageTop");
    if (top.offsetHeight) availH -= top.offsetHeight + parseFloat(getComputedStyle(top.parentNode).rowGap);
    var hbar = $("#hvHistBar");
    if (!hbar.hidden) availH -= hbar.offsetHeight + parseFloat(getComputedStyle(hbar.parentNode).rowGap);
    var btn = document.querySelector('[data-width="' + state.width + '"]');
    var w = +state.width, h = +btn.dataset.height, k = Math.min(1, availW / w, availH / h);
    frame.style.width = w + "px";
    frame.style.height = h + "px";
    frame.style.transform = k < 1 ? "scale(" + k + ")" : "";
    box.style.width = w * k + "px";
    box.style.height = h * k + "px";
    state.scaleLabel = w + " × " + h + " · " + Math.round(k * 100) + "%";
  }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(stage); else window.addEventListener("resize", fit);

  /* ------------------------------------------------------------- self-test
     `#__selftest`: chạy qua mọi step bằng đúng kênh postMessage mà người dùng
     dùng, rồi gửi kết quả cho trang cha. tools/verify_flow.mjs chạy nó cả ở
     cùng origin lẫn trong iframe sandbox giống công cụ deploy. */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function selftest() {
    var out = [], hit = [];
    for (var i = 0; i < flow.steps.length; i++) {
      var step = flow.steps[i], before = state.errors.length;
      var loaded = waitFor("loaded");
      load(step.id, null, false);
      var m = await loaded;
      var r = { step: step.id, ready: !!m, components: m ? m.inventory.length : 0, broken: m ? m.broken : [], overflow: {}, fit: [] };
      if (m) {
        for (var w of ["1024", "1440", "1920"]) {
          setWidth(w);
          await sleep(120);
          var meas = waitFor("measure");
          post("measure", {});
          var x = await meas;
          r.overflow[w] = x ? x.overflow : null;
          var st = $(".hv-stage");
          r.fit.push({ w: +w, h: +$('[data-width="' + w + '"]').dataset.height, width: x && x.width, height: x && x.height,
                       stageOverflow: st.scrollWidth - st.clientWidth, label: state.scaleLabel });
        }
        setWidth("1440");
        await sleep(100);
        if (i === 0) {
          var got = waitFor("detail", 4000);
          post("test-inspect", {});
          var d = await got;
          r.inspect = d ? { heading: d.d.component, tokens: d.d.tokens.length } : null;
          delete detail.dataset.pinned;
          var fr = frame.getBoundingClientRect().width;
          setSide("left", false); setSide("right", false);
          await sleep(100);
          var closed = getComputedStyle($("#hvSide")).display === "none" && getComputedStyle($("#hvPanel")).display === "none";
          var grew = Math.round(frame.getBoundingClientRect().width - fr);
          setSide("left", true); setSide("right", true);
          await sleep(100);
          r.collapse = { closed: closed, reopened: getComputedStyle($("#hvSide")).display !== "none", grew: grew };
        }
        var own = (flow.tracking || []).filter(function (t) { return t.selector && (t.screen === step.screen.split("/").pop() || t.screen === step.id); });
        if (own.length) {
          var tr = waitFor("test-tracking", 3000);
          post("test-tracking", { selectors: own.map(function (t) { return t.selector; }) });
          var tf = await tr;
          own.forEach(function (t) { if (tf && tf.found.indexOf(t.selector) >= 0) hit.push(t); });
        }
        var pn = (noteOf(step.id) ? noteOf(step.id).items : notesOf(step.id)).filter(function (c) { return c.sel; });
        if (pn.length) {
          var pw = waitFor("pins", 3000);
          post("pins", { step: step.id, items: pn, ink: PIN });
          var pr = await pw;
          r.pins = pn.map(function (c) { return { sel: c.sel, found: !!pr && pr.found.indexOf(c.n) >= 0 }; });
        }
        var lk = waitFor("test-link", 3000), next = waitFor("loaded");
        post("test-link", {});
        var l = await lk;
        if (l && l.href) { var n = await next; r.link = { href: l.href, to: n ? state.step.screen + state.search : null }; }
      }
      r.errors = state.errors.slice(before).map(function (e) { return e.msg; });
      out.push(r);
    }
    if (flow.tracking && out.length) out[0].tracking = flow.tracking.filter(function (t) { return t.selector; }).map(function (t) {
      return { event: t.event, screen: t.screen, selector: t.selector, found: hit.indexOf(t) >= 0 };
    });
    window.parent.postMessage({ mdmSelftest: out }, "*");
  }

  /* ---------------------------------------------------------------- wiring */
  $("#hvFlowTitle").textContent = flow.title;
  renderVersions();
  inspectHint();
  $("#hvInspect").onclick = function () { setInspect(!state.inspect); };
  $("#hvToggleLeft").onclick = function () { toggleSide("left"); };
  $("#hvToggleRight").onclick = function () { toggleSide("right"); };
  ["left", "right"].forEach(function (side) {
    var saved = null;
    try { saved = localStorage.getItem("mdm.viewer." + side); } catch (_) {}
    setSide(side, side === "left" && saved !== "closed");   // panel chi tiết luôn đóng khi mở trang
  });
  $("#hvVariants").onclick = function (e) { var b = e.target.closest("[data-step]"); if (b && b.getAttribute("aria-pressed") !== "true") load(b.dataset.step); };
  document.querySelectorAll("[data-width]").forEach(function (b) { b.onclick = function () { setWidth(b.dataset.width); }; });
  window.addEventListener("hashchange", fromHash);
  window.addEventListener("popstate", fromHash);
  document.addEventListener("keydown", function (e) {
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "i" || e.key === "I") setInspect(!state.inspect);
    if (e.key === "Escape") { if (state.hv) { setHistory(false); $("#hvVersion").focus(); } else setInspect(false); }
    if (e.key === "h" || e.key === "H") setHistory(!state.hv);
    if (e.key === "n" || e.key === "N") setNotes(!state.notesOn);
    if (e.key === "[") toggleSide("left");
    if (e.key === "]") toggleSide("right");
  });
  setWidth("1440");
  unpack().then(function () { if (location.hash.indexOf("#__selftest") === 0) { state.selftest = true; selftest(); } else fromHash(); });
})();
