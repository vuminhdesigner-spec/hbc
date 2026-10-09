/* metric-scroll.js — drive the metric strip's two scroll arrows.
   Shared behaviour for every screen that renders a `.metric-scroller`.
   Contract: design-system/components/metric-item.md. Styles: ../styles/metric-item.css.

   Shared because the rule is a property of the metric group ("one line at every
   tier, scroll rather than wrap"), not of any one page, and two screens render
   the strip. A copy per bundle would drift the moment one of them changed.

   What is deliberately NOT here:
   - the scroll animation. `scroll-behavior: smooth` is declared on the strip and
     removed under `prefers-reduced-motion`, so `scrollBy` is called with no
     `behavior` of its own and the stylesheet stays the only place that decides.
   - any width, gap or tile count. The step is measured from the rendered tile, so
     a tier that flexes the tiles wider steps wider with it and nothing here has
     to know --utui-metric-tile-min-width exists.

   Load it BEFORE the screen bundle, like the other shared scripts: it
   auto-initialises on DOMContentLoaded and the bundles render their tiles
   synchronously while parsing, so the strip has its real width by then. A bundle
   that re-renders tiles calls `refresh()`. */
(function (global) {
  "use strict";

  const SELECTOR = ".metric-scroller";

  /* Sub-pixel widths make an exact end-of-scroll comparison unreliable; 1px of
     slack is what the gallery control on project-overview already uses. */
  const SLACK = 1;

  function create(scroller) {
    const strip = scroller.querySelector(".metric-group");
    const prev = scroller.querySelector('[data-metric-scroll="prev"]');
    const next = scroller.querySelector('[data-metric-scroll="next"]');
    if (!strip || !prev || !next) return null;

    let frame = 0;

    /* One tile plus one gap. Measured rather than tokenised: the tiles flex, so
       their rendered width is the only true answer, and paging by the strip's
       own width would skip past tiles the user has not seen. Falls back to the
       visible width when there is no tile at all — an empty strip cannot scroll
       anyway, so this only ever runs before the first render. */
    function step() {
      const tile = strip.querySelector(".metric-tile, .metric-item");
      if (!tile) return strip.clientWidth;
      const gap = parseFloat(getComputedStyle(strip).columnGap) || 0;
      return tile.getBoundingClientRect().width + gap;
    }

    function sync() {
      frame = 0;
      const max = strip.scrollWidth - strip.clientWidth;

      /* The whole row fits: both controls have no function, so they are removed
         rather than shown permanently dimmed — and the strip stops being a tab
         stop, because a scroller that cannot scroll is a focus target with
         nothing to do. This is the desktop case at the design width, where five
         tiles fit the content column exactly as drawn. */
      if (max <= SLACK) {
        prev.hidden = true;
        next.hidden = true;
        strip.removeAttribute("tabindex");
        return;
      }

      prev.hidden = false;
      next.hidden = false;
      /* Focusable only while it scrolls, so the keyboard can reach the strip and
         use the arrow keys on it directly. The ring is styled for it in
         metric-item.css. */
      strip.setAttribute("tabindex", "0");
      // Disabled at the ends, not hidden: a control must not vanish from under
      // the pointer mid-interaction. See ../styles/metric-item.css.
      prev.disabled = strip.scrollLeft <= SLACK;
      next.disabled = strip.scrollLeft >= max - SLACK;
    }

    // Coalesced to one frame: `scroll` fires per frame of a swipe, and every call
    // reads `scrollWidth`, which forces a layout flush.
    function onScroll() {
      if (frame) return;
      frame = global.requestAnimationFrame(sync);
    }

    function onPrev() {
      strip.scrollBy({ left: -step() });
    }

    function onNext() {
      strip.scrollBy({ left: step() });
    }

    prev.addEventListener("click", onPrev);
    next.addEventListener("click", onNext);
    strip.addEventListener("scroll", onScroll, { passive: true });
    global.addEventListener("resize", onScroll, { passive: true });

    /* A tier change reflows the tiles without resizing the window in one case
       that matters — the side nav collapsing to its rail — and re-rendered tiles
       change the scroll width with no event at all. Both are size changes to the
       strip, so one observer covers them and a consumer that forgets to call
       `refresh()` still gets correct controls. */
    let observer = null;
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(onScroll);
      observer.observe(strip);
    }

    sync();

    // Vietnamese labels and Material Symbols glyphs swap late, which changes the
    // tiles' content width after the first measurement.
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready.then(sync);
    }

    return {
      element: scroller,
      strip: strip,
      refresh: sync,
      destroy: function () {
        prev.removeEventListener("click", onPrev);
        next.removeEventListener("click", onNext);
        strip.removeEventListener("scroll", onScroll);
        global.removeEventListener("resize", onScroll);
        if (observer) observer.disconnect();
        if (frame) global.cancelAnimationFrame(frame);
        strip.removeAttribute("tabindex");
      },
    };
  }

  const instances = [];

  function init(root) {
    const scope = root || document;
    scope.querySelectorAll(SELECTOR).forEach(function (scroller) {
      // No-op if already wired, so a screen that calls init() after a re-render
      // does not stack listeners.
      if (instances.some((entry) => entry.element === scroller)) return;
      const instance = create(scroller);
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

  global.OmeuMetricScroll = { init: init, refresh: refresh, destroy: destroy, instances: instances };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    init();
  }
})(window);
