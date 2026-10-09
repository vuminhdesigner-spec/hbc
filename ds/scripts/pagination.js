/* pagination.js — focus restore for every table footer.
   Contract: design-system/components/pagination.md, "Layout Contract".
   Styles: ../styles/pagination.css.

   `pageList()` and `ELLIPSIS` lived here until 2026-09-05. They implemented the
   truncation window of the joined page group — `1 2 3 … 8 9 10` — and the DS
   deleted that control: `Pagination button group` (1114:69397) is gone from the
   file and `_Pagination button group base` lost its `Middle` hierarchy, so there
   is no numbered cell in the component any more. Every consumer draws the
   prev/next pager, which has no window to compute. Removed rather than kept for
   a caller that no longer exists.

   Load it BEFORE the screen bundle. It publishes one namespace and runs nothing
   on load. Same convention as ./metric-scroll.js. */
(function (global) {
  "use strict";

  /* Focus after a footer re-renders itself.

     Every consumer replaces the markup CONTAINING the control the user just
     pressed, so without this focus falls to <body> and a keyboard operator
     restarts from the top of the document on each page change. The contract has
     asked for this to live here since 2026-08-14 — project-docs had it,
     project-overview's picker had its own, and project-list had none at all, so
     paging that screen by keyboard silently dropped focus. Fixed 2026-08-19.

     `intent` is which direction was pressed. The honest replacement is the same
     button — a user paging forward is usually paging forward again — unless that
     press has just disabled it at the end of the set, in which case the other
     button is where the user can still act. Matching is by `data-page-intent`
     rather than by position or by accessible name: the buttons carry their
     direction in visible text, where an `aria-label` saying the same thing would
     be a second copy of the name for one control.

     `fallback` is the last rung and takes an element or a selector — a footer
     whose pager has gone (a search-results footer draws `Type=One page`, which
     has none) must still land focus somewhere, and never on <body>. It is
     optional, and a caller with a focusable `.pagination-count` in its footer
     should omit it rather than name a control the user was not navigating: see
     the note on that rung below. */
  function restoreFocus(root, intent, fallback) {
    if (!root) return false;
    const nav = root.querySelector(".pagination-nav");
    const candidates = [];
    if (nav) {
      if (intent === "next" || intent === "prev") {
        candidates.push(nav.querySelector('[data-page-intent="' + intent + '"]'));
      }
      /* THE STILL-ENABLED SIBLING, BEFORE THE GENERIC RUNG — 2026-09-05, from a
         UX audit of `project-list`. At the last page the pressed `Trang sau`
         comes back `disabled` and the rung below returns the FIRST button in the
         pager, which is `Trang trước`: focus silently reversed direction, and the
         operator's next Enter paged backwards. Selecting on the direction
         attribute plus `:not([disabled])` lands on the button that can still
         act, whichever it is. */
      candidates.push(nav.querySelector("[data-page-intent]:not([disabled])"));
      candidates.push(nav.querySelector("button"));
    }
    /* The count, before the caller's fallback. It is reached when BOTH buttons
       are disabled — a set that fits on one page — and before this rung existed
       what came next was whatever the screen passed, which on `project-list` was
       its SEARCH INPUT: focus landed in a text field where the next character
       typed re-filtered the list. The count is in the footer the press rebuilt,
       it carries `tabindex="-1"` for exactly this, and focusing it announces the
       position. A `[tabindex]` guard rather than the bare class: a count that is
       not focusable would silently swallow the restore and the chain would stop
       here having done nothing. */
    candidates.push(root.querySelector(".pagination-count[tabindex]"));
    candidates.push(typeof fallback === "string" ? root.querySelector(fallback) : fallback);
    for (const node of candidates) {
      if (node && !node.disabled && typeof node.focus === "function") {
        node.focus();
        return true;
      }
    }
    return false;
  }

  global.V2Pagination = {
    restoreFocus: restoreFocus,
  };
})(window);
