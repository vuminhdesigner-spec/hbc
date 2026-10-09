/* page-tab.js — the shared behaviour of design-system/components/page-tab.md, the workspace
   tab strip.

   Why this file exists: the strip is shell chrome, not page content, so its
   state belongs to the workspace and not to whichever screen happens to draw
   it. Before this file, each of the nine screens that render the strip bound
   its own handlers: one tab navigated, the other two showed a toast, and "×" did too
   on all of them. That made the strip look like a browser tab bar while
   behaving like a static picture of one — a tab you "closed" was still there on
   the next screen, and the tab of the record you were reading was not
   necessarily the active one.

   The model here is the browser tab bar, because that is what the component
   set draws and what a user reads it as:

   - clicking a tab switches to that page; clicking the active tab does nothing
   - "×" closes the tab and it stays closed across navigation
   - closing the active tab moves to its right-hand neighbour, or its left one
     if it was last — the same tab the browser would land on
   - the last tab cannot be closed; a browser closes the window instead, which a
     demo of standalone pages has no equivalent for
   - the page you are on always has a tab: if its tab was closed earlier and you
     arrive from a link, the tab comes back rather than the strip lying about
     what is open
   - middle-click closes a tab

   Second shared script in the package, after scripts/notification.js, and for
   the same reason: this is behaviour no single screen owns. No build step, so
   it is a plain IIFE publishing one global. Load it with a <script src> BEFORE
   the screen's own bundle, so a screen can register its leave guard against it.

   State lives in sessionStorage (`mdm.pageTabs`): a workspace's open tabs
   outlive a navigation but not the browser tab the demo is running in, which is
   the same lifetime du-an/tao-moi.js (drawer) and du-an/ho-so/chi-tiet.js already use
   for their hand-offs. See README.md.

   Where a page fits in the strip is declared in the HTML, on the strip itself:

     <nav class="page-tab-group" data-page-tab-owner="lumiere marina">

   That is the list of tabs this page can be the content of, most specific
   first. Two entries are needed only where one file serves two tabs; the stored
   active tab then decides which of them is showing. */

(function (global) {
  "use strict";

  var STORAGE_KEY = "mdm.pageTabs";

  /* WHERE `screens/` IS FROM HERE. The bundles stopped sitting at one uniform
     depth on 2026-09-16, when the folder was cut by business entity:
     `screens/du-an/chi-tiet.html` is one folder below `screens/` and
     `screens/du-an/ho-so/chi-tiet.html` is two. A fixed number of `../` in the
     registry below would therefore be right for one depth and broken for the
     other, so the registry holds paths relative to `screens/` and this function
     supplies the climb. It also answers for the portal home at the repository
     root, which is outside `screens/` altogether — that page draws no strip and
     does not load this file, but the same registry shape is what role-switch.js
     uses, and keeping the two resolvers identical is cheaper than remembering
     which one had the exception. */
  function screensRoot() {
    var parts = String(global.location.pathname).split("/");
    var at = parts.lastIndexOf("screens");
    if (at === -1) return "screens/";
    var depth = parts.length - at - 2; // folders between `screens/` and the file
    return depth > 0 ? new Array(depth + 1).join("../") : "./";
  }

  /* The tabs this workspace can have open, in strip order. This is the one
     place they are declared — the static markup in each screen is the no-JS
     fallback, and this list is what the strip is rebuilt from.

     `href` is written relative to `screens/` and resolved through screensRoot()
     at click time — see hrefFor().

     `marina` points at the same file as `lumiere` because Grand Marina Saigon
     has no screen of its own; see Known Gaps in design-system/components/page-tab.md. */
  var REGISTRY = [
    { id: "list", label: "Danh sách dự án", icon: "language", href: "du-an/danh-sach.html" },
    { id: "lumiere", label: "LUMIÈRE Boulevard", icon: "language", href: "du-an/chi-tiet.html" },
    { id: "marina", label: "Grand Marina Saigon", icon: "language", href: "du-an/chi-tiet.html" },
    /* The company listing, added 2026-09-16. Its LABEL IS LOAD-BEARING, not
       decoration: that screen hides its <h1> the way `du-an/danh-sach` does, so
       `validate_v2.mjs`'s `a11y:hidden-title-has-tab-label` requires this string
       to equal the hidden heading exactly. Renaming one without the other fails
       the check, which is the point — a screen whose only visible name is its
       tab cannot have the tab disagree with it. */
    { id: "cong-ty", label: "Thông tin Công ty", icon: "language", href: "cong-ty/danh-sach.html" },
    /* The partner listing, added 2026-09-16 with MDM-823. Its label is
       load-bearing for the same reason the company one's is: that screen hides
       its <h1> too, so `validate_v2.mjs`'s `a11y:hidden-title-has-tab-label`
       requires this string to equal the hidden heading exactly. */
    { id: "doi-tac", label: "Thông tin Đối tác", icon: "language", href: "doi-tac/danh-sach.html" },
  ];

  function hrefFor(tab) {
    return screensRoot() + tab.href;
  }

  var group = document.querySelector(".page-tab-group");
  var slot = group && group.querySelector(".page-tab-group__slot");
  // The screen that draws no strip: du-an/ho-so/chi-tiet.html, the
  // document surface with no shell of its own. It drew the strip between
  // 2026-08-22 and 2026-08-26d, while it was a record detail on the app shell; it
  // is a popup full-screen again (Figma section 12646:17687) and does not load
  // this file at all. dc-tham-dinh-thong-tin.html was the second such screen until
  // it was deleted on 2026-08-27 and its lane folded into the first.
  if (!group || !slot) return;

  var owners = String(group.dataset.pageTabOwner || "")
    .split(/\s+/)
    .filter(Boolean);

  var leaveGuard = null;
  var state = resolveState();

  render();
  bind();

  /* ---------- State ---------- */

  function byId(id) {
    for (var i = 0; i < REGISTRY.length; i += 1) {
      if (REGISTRY[i].id === id) return REGISTRY[i];
    }
    return null;
  }

  function readState() {
    try {
      var raw = global.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.open)) return null;
      // Drop ids the registry no longer knows, so a stale session cannot
      // resurrect a tab that has been removed from the component.
      var open = parsed.open.filter(byId);
      if (!open.length) return null;
      return { open: open, active: parsed.active };
    } catch (error) {
      /* Private-mode Safari throws on storage access rather than returning
         null, and file:// origins can too. The strip still works for this
         page; it just forgets on navigate. */
      return null;
    }
  }

  function writeState() {
    try {
      global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* See readState. */
    }
  }

  /* First load opens every tab in the registry — the workspace the frames draw.
     After that the stored list wins, corrected against the page being loaded:
     the active tab has to be one this page can be, and that tab has to be
     open. */
  function resolveState() {
    var stored = readState();
    var next = stored || { open: REGISTRY.map(function (tab) { return tab.id; }), active: owners[0] };

    var owner = owners.indexOf(next.active) >= 0 ? next.active : owners[0];
    if (owner) {
      next.active = owner;
      if (next.open.indexOf(owner) < 0) next.open = withTab(next.open, owner);
    } else if (next.open.indexOf(next.active) < 0) {
      // No owner declared and the stored active tab is gone: fall back to the
      // first open tab rather than leaving nothing marked.
      next.active = next.open[0];
    }
    return next;
  }

  // Insert `id` in registry order, so a reopened tab returns to its own place
  // in the strip instead of the end.
  function withTab(open, id) {
    var wanted = REGISTRY.map(function (tab) { return tab.id; });
    return wanted.filter(function (candidate) {
      return candidate === id || open.indexOf(candidate) >= 0;
    });
  }

  /* ---------- Render ---------- */

  function render() {
    slot.textContent = "";
    state.open.forEach(function (id) {
      var tab = byId(id);
      if (tab) slot.appendChild(tabElement(tab, id === state.active));
    });
    // ≤md the slot is a horizontal scroller (.claude/skills/responsive/SKILL.md), so the
    // active tab can land off-screen on load.
    var active = slot.querySelector(".page-tab.is-active");
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  /* Markup per the Class Contract in design-system/components/page-tab.md, including its
     documented flaw: the close control is a role="button" span nested in the
     tab's <button>, because HTML forbids a button inside a button. Building it
     here rather than in nine copies of the markup does not fix that — the fix
     is structural and changes the component's anatomy — but it does mean the
     Enter/Space handler and the stopPropagation guard every screen used to
     hand-write now exist once. */
  function tabElement(tab, isActive) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = isActive ? "page-tab is-active" : "page-tab";
    button.dataset.tab = tab.id;
    // The label ellipsises, so the full name needs somewhere to live.
    button.title = tab.label;
    if (isActive) button.setAttribute("aria-current", "page");

    var icon = document.createElement("span");
    icon.className = "page-tab__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.appendChild(glyph(tab.icon));

    var label = document.createElement("span");
    label.className = "page-tab__label";
    label.textContent = tab.label;

    var close = document.createElement("span");
    close.className = "page-tab__close";
    close.setAttribute("role", "button");
    close.setAttribute("tabindex", "0");
    close.setAttribute("aria-label", "Đóng " + tab.label);
    close.appendChild(glyph("close"));

    button.appendChild(icon);
    button.appendChild(label);
    button.appendChild(close);
    return button;
  }

  function glyph(name) {
    var span = document.createElement("span");
    span.className = "material-symbols-outlined";
    span.setAttribute("aria-hidden", "true");
    span.textContent = name;
    return span;
  }

  /* ---------- Events ---------- */

  /* Delegated to the group, not bound per tab: render() replaces the tabs
     whenever one closes, so per-tab listeners would have to be rebound each
     time. */
  function bind() {
    group.addEventListener("click", function (event) {
      var close = event.target.closest(".page-tab__close");
      if (close) {
        // The close control sits inside the tab it closes; without this the
        // same click would also switch to that tab.
        event.stopPropagation();
        closeTab(tabIdOf(close));
        return;
      }
      var tab = event.target.closest(".page-tab");
      if (tab) activate(tab.dataset.tab);
    });

    group.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var close = event.target.closest(".page-tab__close");
      if (!close) return;
      // A span with role="button" gets neither key for free.
      event.preventDefault();
      event.stopPropagation();
      closeTab(tabIdOf(close));
    });

    // Middle-click closes, as it does in a browser. `auxclick` is the event
    // that reports it; button 1 is the wheel.
    group.addEventListener("auxclick", function (event) {
      if (event.button !== 1) return;
      var tab = event.target.closest(".page-tab");
      if (!tab) return;
      event.preventDefault();
      closeTab(tab.dataset.tab);
    });
  }

  function tabIdOf(node) {
    var tab = node.closest(".page-tab");
    return tab ? tab.dataset.tab : null;
  }

  /* ---------- Behaviour ---------- */

  function activate(id) {
    // Clicking the tab you are already on does nothing, the same as a browser.
    if (!id || id === state.active) return;
    var tab = byId(id);
    if (!tab) return;
    withLeave(function () {
      state.active = id;
      writeState();
      global.location.href = hrefFor(tab);
    });
  }

  function closeTab(id) {
    var index = state.open.indexOf(id);
    if (index < 0) return;

    if (state.open.length <= 1) {
      // A browser would close the window here. Six standalone pages have no
      // window to close, and an empty strip would strand the user with no way
      // back, so this is refused out loud rather than silently.
      notify("Không thể đóng tab cuối cùng.", "warning");
      return;
    }

    var wasActive = id === state.active;

    function finishClose() {
      var neighbour = state.open[index + 1] || state.open[index - 1];
      state.open.splice(index, 1);
      if (wasActive) state.active = neighbour;
      writeState();

      if (wasActive) {
        global.location.href = hrefFor(byId(neighbour));
        return;
      }

      var hadFocus = slot.contains(document.activeElement);
      render();
      if (hadFocus) {
        // Keep the keyboard in the strip: focus whatever took the closed tab's
        // place, or the new last tab.
        var tabs = slot.querySelectorAll(".page-tab");
        var next = tabs[Math.min(index, tabs.length - 1)];
        if (next) next.focus();
      }
    }

    // Closing the tab you are in leaves the page, so it goes through the same
    // guard as a click. Closing any other tab does not.
    if (wasActive) {
      withLeave(finishClose);
    } else {
      finishClose();
    }
  }

  /* A screen with unsaved work (project-create) registers a
     guard; returning false stops the navigation and leaves the strip alone.
     Registered from the screen's own bundle, which loads after this file.

     The guard may return a boolean (a synchronous `window.confirm`) or a Promise<boolean> (an on-brand `ds` modal,
     which cannot answer before the user clicks a button in it; no consumer since 2026-10-02) — `proceed` only runs once the answer, either way, is not `false`. */
  function withLeave(proceed) {
    if (!leaveGuard) {
      proceed();
      return;
    }
    var result = leaveGuard();
    if (result && typeof result.then === "function") {
      result.then(function (allowed) {
        if (allowed !== false) proceed();
      });
      return;
    }
    if (result !== false) proceed();
  }

  /* Chỉ dùng để từ chối đóng tab cuối; cần notification.js nạp trước. */
  function notify(message, tone) {
    if (global.OmeuNotification) global.OmeuNotification.notify(message, tone);
  }

  global.pageTabs = {
    activate: activate,
    close: closeTab,
    // A copy: the strip owns its order, and a caller mutating it would desync
    // the rendered tabs from storage.
    list: function () {
      return state.open.slice();
    },
    active: function () {
      return state.active;
    },
    setLeaveGuard: function (fn) {
      leaveGuard = typeof fn === "function" ? fn : null;
    },
  };
})(window);
