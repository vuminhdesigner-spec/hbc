/* page-header-collapse.js — collapse the pinned page header once the page
   scrolls away from the top.
   Contract: design-system/components/page-header.md (States → Collapsed).
   Styles: ../styles/page-header.css.

   Why this exists: the header pins, so on a long page its orienting parts —
   the 76px avatar and the sub-title — are re-read once and then occupy the top
   of the viewport for the rest of the scroll. Collapsing gives that height back
   to the content while keeping what the pin is FOR: the title, the badges, the
   actions and the tab bar stay in place at every scroll offset.

   Opt in per screen with `data-page-header-collapse` on the `.page-sticky`
   block. It is an attribute rather than an automatic behaviour because the
   package has two layout modes: in the fixed-viewport mode
   (`.mdm-shell--fixed`, app-shell.css) the document never scrolls, so a header
   there would never collapse and the listener would be dead weight. Give the
   attribute a selector as its value to watch a scroll container instead of the
   window.

   What is deliberately NOT here:
   - any height, duration or easing. The collapse is a class toggle; every
     dimension and the 200ms motion (and its prefers-reduced-motion opt-out)
     live in page-header.css.
   - any re-measurement of the pinned chrome. Screens that publish a chrome
     height already observe `.page-sticky` with a ResizeObserver
     (screens/du-an/chi-tiet.js), so the shorter box republishes itself. */
(function (global) {
  "use strict";

  const SELECTOR = ".page-sticky[data-page-header-collapse]";

  /* Two thresholds, not one: a single one at the exact height the collapse
     removes lets a scroll position that sits on it flip the class every frame.
     Collapse once the user has clearly left the top; expand only back AT the
     top, which is also where the parts being hidden are worth reading again. */
  const COLLAPSE_AT = 64;
  const EXPAND_AT = 8;

  function create(block) {
    const selector = block.getAttribute("data-page-header-collapse");
    const source = selector ? document.querySelector(selector) : null;
    // Missing selector target is a screen bug, not a reason to break the page:
    // fall back to the document scroll the default already uses.
    const scroller = source || global;

    let frame = 0;
    let collapsed = false;

    function offset() {
      return scroller === global
        ? global.scrollY || document.documentElement.scrollTop || 0
        : scroller.scrollTop;
    }

    function sync() {
      frame = 0;
      const y = offset();
      const next = collapsed ? y > EXPAND_AT : y > COLLAPSE_AT;
      if (next === collapsed) return;
      collapsed = next;
      block.classList.toggle("is-collapsed", collapsed);
    }

    // Coalesced to one frame: `scroll` fires per frame of a wheel or a swipe and
    // every call reads a scroll offset, which forces a layout flush.
    function onScroll() {
      if (frame) return;
      frame = global.requestAnimationFrame(sync);
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });

    sync();
    /* Transitions stay off until after the first sync — a page opened at a
       fragment (`#dia-chi`) is already scrolled on first paint, and without this
       the header would play the collapse animation on load. */
    global.requestAnimationFrame(function () {
      block.classList.add("is-ready");
    });

    return {
      element: block,
      refresh: sync,
      destroy: function () {
        scroller.removeEventListener("scroll", onScroll);
        if (frame) global.cancelAnimationFrame(frame);
        block.classList.remove("is-collapsed", "is-ready");
      },
    };
  }

  const instances = [];

  function init(root) {
    const scope = root || document;
    scope.querySelectorAll(SELECTOR).forEach(function (block) {
      // No-op if already wired, so a screen that calls init() again does not
      // stack listeners.
      if (instances.some((entry) => entry.element === block)) return;
      const instance = create(block);
      if (instance) instances.push(instance);
    });
    return instances;
  }

  function refresh() {
    instances.forEach((entry) => entry.refresh());
  }

  function destroy() {
    while (instances.length) instances.pop().destroy();
  }

  global.OmeuPageHeaderCollapse = {
    init: init,
    refresh: refresh,
    destroy: destroy,
    instances: instances,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    init();
  }
})(window);
