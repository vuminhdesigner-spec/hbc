/* frozen-end.js — marks `.data-table-wrap` with `.has-hidden-end` while columns are scrolled out of view to the right of its frozen end column. */
(function () {
  "use strict";

  function sync(wrap) {
    const hidden = wrap.scrollLeft + wrap.clientWidth < wrap.scrollWidth - 1;
    wrap.classList.toggle("has-hidden-end", hidden);
  }

  const resizer = new ResizeObserver((entries) => entries.forEach((entry) => sync(entry.target)));
  const seen = new WeakMap(); // wrap -> its table, observed for size
  const onScroll = (event) => sync(event.currentTarget);

  function release(wrap) {
    resizer.unobserve(wrap);
    resizer.unobserve(seen.get(wrap));
    wrap.removeEventListener("scroll", onScroll);
    seen.delete(wrap);
  }

  function scan() {
    document.querySelectorAll(".data-table-wrap").forEach((wrap) => {
      if (!wrap.querySelector(":scope > .data-table--frozen-end")) return;
      if (seen.has(wrap)) return;
      seen.set(wrap, wrap.firstElementChild);
      resizer.observe(wrap);
      resizer.observe(wrap.firstElementChild);
      wrap.addEventListener("scroll", onScroll, { passive: true });
      sync(wrap);
    });
  }

  const holdsWrap = (node) =>
    node.nodeType === 1 && (node.matches(".data-table-wrap") || node.querySelector(".data-table-wrap"));

  let queued = false;
  function queueScan() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  }

  new MutationObserver((records) => {
    let touched = false;
    records.forEach((record) => {
      record.removedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        const wraps = node.matches(".data-table-wrap") ? [node] : node.querySelectorAll(".data-table-wrap");
        wraps.forEach((wrap) => {
          if (seen.has(wrap) && !wrap.isConnected) release(wrap);
        });
      });
      record.addedNodes.forEach((node) => {
        if (holdsWrap(node)) touched = true;
      });
    });
    if (touched) queueScan();
  }).observe(document.body, { childList: true, subtree: true });
  scan();
})();
