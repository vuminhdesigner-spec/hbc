/* tooltip.js — behaviour for `.tooltip` (ds/components/tooltip.md; styles ds/styles/tooltip.css). One shared bubble created here, not authored per screen — a caller opts in with `data-tooltip-overflow` or, for the reason a control is disabled, `data-tooltip="…"` (caller also puts the reason in `aria-label`; for a data-table edit cell's error the caller keeps the text in an sr-only node the control's `aria-describedby` points to, and may change or remove `data-tooltip` while open — a MutationObserver refreshes/closes) (e.g. `<span class="cell-text" data-tooltip-overflow>…</span>`); bubble text is the trigger's own `textContent` (or its `data-tooltip` reason), and the bubble stays `aria-hidden="true"` always — that text is already in the accessibility tree, so describing it again would announce it twice. Opens only when the trigger actually overflows (`scrollWidth`/`clientWidth`, `scrollHeight`/`clientHeight`). 150ms open delay (a pointer crossing several cells does not flash one bubble per cell) and 150ms close delay (WCAG 1.4.13 Hoverable); Escape dismisses (1.4.13 Dismissible) and does not reopen for the same hover/focus session until the trigger is actually left. Load BEFORE the screen bundle, like ds/scripts/select.js. */
(function (global, document) {
  "use strict";

  var SELECTOR = "[data-tooltip-overflow], [data-tooltip]"; // [data-tooltip] = lý do vô hiệu, văn bản do caller viết (snack-bar)
  var HOVER_DELAY = 150; // no motion token exists yet for this (tooltip.md GAP-5)

  var bubble = null;
  var textNode = null;
  var arrowNode = null;

  var pendingTrigger = null; // has a show timer running for it
  var currentTrigger = null; // the bubble is open for it
  var suppressedTrigger = null; // Escape closed it; do not reopen until it is left
  var showTimer = null;
  var hideTimer = null;

  function ensureBubble() {
    if (bubble) return bubble;
    bubble = document.createElement("div");
    bubble.className = "tooltip";
    bubble.id = "ds-tooltip";
    bubble.setAttribute("role", "tooltip");
    bubble.setAttribute("aria-hidden", "true");
    bubble.hidden = true;
    textNode = document.createElement("span");
    textNode.className = "tooltip__text";
    arrowNode = document.createElement("span");
    arrowNode.className = "tooltip__arrow";
    bubble.appendChild(textNode);
    bubble.appendChild(arrowNode);
    document.body.appendChild(bubble);
    return bubble;
  }

  function overflows(el) {
    return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
  }

  function clearShowTimer() {
    if (showTimer) {
      global.clearTimeout(showTimer);
      showTimer = null;
    }
    pendingTrigger = null;
  }

  function clearHideTimer() {
    if (hideTimer) {
      global.clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  /* Same three-rule shape ../scripts/select.js's `place()` uses for its menu, preference flipped: prefers ABOVE the trigger (a select's menu prefers below), falls back to `--bottom` only when above is short AND below is actually roomier. `data-tooltip-place="bottom"` on the trigger flips the preference (fallback to above when below is short). */
  function place(trigger) {
    var rect = trigger.getBoundingClientRect();
    var root = document.documentElement;
    // Fallback 8 matches --utui-tooltip-offset's own value, in case the token fails to resolve.
    var offset =
      parseFloat(getComputedStyle(root).getPropertyValue("--utui-tooltip-offset")) || 8;

    bubble.classList.remove("tooltip--start", "tooltip--end", "tooltip--bottom");
    bubble.style.visibility = "hidden";
    bubble.hidden = false;
    /* Reset before measuring: the bubble still carries its LAST position, and
       measuring at that stale spot is not measuring at the new trigger's. */
    bubble.style.left = "0px";
    bubble.style.top = "0px";

    var bw = bubble.offsetWidth;
    var bh = bubble.offsetHeight;
    var vw = root.clientWidth;
    var vh = global.innerHeight;

    var above = rect.top - offset;
    var below = vh - rect.bottom - offset;
    // data-tooltip-place="bottom": prefer below, flip above only when below is short AND above is roomier.
    var preferBottom = trigger.getAttribute("data-tooltip-place") === "bottom";
    var useBottom = preferBottom ? !(below < bh && above > below) : above < bh && below > above;
    if (useBottom) bubble.classList.add("tooltip--bottom");

    var top = useBottom ? rect.bottom + offset : rect.top - offset - bh;
    top = Math.max(offset, Math.min(top, vh - bh - offset));

    var center = rect.left + rect.width / 2 - bw / 2;
    var start = center < offset;
    var end = !start && center + bw > vw - offset;
    if (start) bubble.classList.add("tooltip--start");
    if (end) bubble.classList.add("tooltip--end");

    var left = start ? rect.left : end ? rect.right - bw : center;
    left = Math.max(offset, Math.min(left, vw - offset - bw));

    bubble.style.top = Math.round(top) + "px";
    bubble.style.left = Math.round(left) + "px";
    bubble.style.visibility = "";
  }

  function hide() {
    clearShowTimer();
    clearHideTimer();
    if (bubble) bubble.hidden = true;
    currentTrigger = null;
    // `suppressedTrigger` is NOT reset here — the Escape handler sets it right before calling this, and it must survive; only `handleLeave()`/`focusout` (an actual leave) clear it.
  }

  function scheduleHide() {
    if (hideTimer) return;
    hideTimer = global.setTimeout(function () {
      hideTimer = null;
      hide();
    }, HOVER_DELAY);
  }

  function show(trigger) {
    if (!trigger.isConnected) return;
    var authored = trigger.getAttribute("data-tooltip");
    if (!authored && !overflows(trigger)) {
      /* The pointer/focus moved from an overflowing trigger (bubble open) to a
         non-overflowing one before the 150ms close delay fired — e.g.
         `.entity-title` (clipped) down to `.entity-subtitle` (not). Nothing
         else closes A's bubble in that case: the pointer never left A's own
         hide grace period, and B has nothing to show of its own. */
      if (currentTrigger && currentTrigger !== trigger) hide();
      return;
    }
    var text = authored || trigger.textContent.trim();
    if (!text) return;
    ensureBubble();
    textNode.textContent = text;
    currentTrigger = trigger;
    place(trigger);
  }

  function scheduleShow(trigger) {
    if (trigger === suppressedTrigger) return;
    if (currentTrigger === trigger || pendingTrigger === trigger) return;
    clearShowTimer();
    pendingTrigger = trigger;
    showTimer = global.setTimeout(function () {
      showTimer = null;
      pendingTrigger = null;
      show(trigger);
    }, HOVER_DELAY);
  }

  function handleEnter(trigger) {
    /* Only cancel a hide already scheduled FOR THIS trigger. Cancelling it on
       every enter — including a different trigger's `pointerover` — is the
       other half of the stuck-open bug `show()` now guards above: it kept a
       leaving trigger's own close timer alive forever once a second trigger
       entered inside the 150ms grace window. */
    if (trigger === currentTrigger) clearHideTimer();
    scheduleShow(trigger);
  }

  function handleLeave(trigger, immediate) {
    if (pendingTrigger === trigger) clearShowTimer();
    if (suppressedTrigger === trigger) suppressedTrigger = null;
    if (currentTrigger !== trigger) return;
    if (immediate) hide();
    else scheduleHide();
  }

  document.addEventListener("pointerover", function (event) {
    /* A screen that re-renders its row markup under a stationary pointer (e.g.
       `render()` after a filter/toggle) removes `currentTrigger` from the DOM
       without ever firing a `pointerout` on it — nothing else notices. */
    if (currentTrigger && !currentTrigger.isConnected) hide();
    var trigger = event.target.closest ? event.target.closest(SELECTOR) : null;
    if (trigger) {
      handleEnter(trigger);
      return;
    }
    if (bubble && bubble.contains(event.target)) clearHideTimer();
  });

  document.addEventListener("pointerout", function (event) {
    var trigger = event.target.closest ? event.target.closest(SELECTOR) : null;
    if (trigger) {
      var to = event.relatedTarget;
      if (to && (trigger.contains(to) || (bubble && bubble.contains(to)))) return;
      handleLeave(trigger, false);
      return;
    }
    if (bubble && bubble.contains(event.target)) {
      var toEl = event.relatedTarget;
      if (
        toEl &&
        (bubble.contains(toEl) || (currentTrigger && currentTrigger.contains(toEl)))
      ) {
        return;
      }
      if (currentTrigger) scheduleHide();
    }
  });

  document.addEventListener("focusin", function (event) {
    if (currentTrigger && !currentTrigger.isConnected) hide();
    var trigger = event.target.closest ? event.target.closest(SELECTOR) : null;
    // The focused element itself may not carry the attribute — e.g. a truncated label inside a focusable button/row (R11, 2026-09-29 review). Fall back to the nearest descendant.
    if (!trigger) trigger = descendantTrigger(event.target);
    if (trigger) handleEnter(trigger);
  });

  document.addEventListener("focusout", function (event) {
    var trigger = event.target.closest ? event.target.closest(SELECTOR) : null;
    if (!trigger) trigger = descendantTrigger(event.target);
    if (trigger) handleLeave(trigger, true);
  });

  // Descendant fallback only for real controls (button/link/treeitem), never a focus-landing container like a dialog panel.
  function descendantTrigger(el) {
    if (!el || !el.matches || !el.matches('button, a[href], [role="treeitem"]')) return null;
    return el.querySelector(SELECTOR);
  }

  /* A caller that changes `data-tooltip` while the trigger is open or focused (a cell's error text while the user types) must not need to re-open anything: same trigger refreshes text and position in place, a removed attribute closes, and a trigger that is focused/hovered when the attribute first appears opens. */
  if (global.MutationObserver) {
    new MutationObserver(function (records) {
      records.forEach(function (record) {
        var el = record.target;
        var text = el.getAttribute("data-tooltip");
        if (el === currentTrigger) {
          if (!text) hide();
          else {
            textNode.textContent = text;
            place(el);
          }
        } else if (text && (el === document.activeElement || (el.matches && el.matches(":hover")))) {
          scheduleShow(el);
        } else if (!text && el === pendingTrigger) {
          clearShowTimer();
        }
      });
    }).observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-tooltip"],
    });
  }

  /* Capture, and stopped: one Escape closes the tooltip only (same rule ../scripts/select.js's menu follows) and must run before ../scripts/modal.js's own bubble-phase Escape, so a tooltip inside a dialog does not take the dialog with it. */
  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key !== "Escape") return;
      if (!bubble || bubble.hidden) return;
      event.stopPropagation();
      suppressedTrigger = currentTrigger;
      hide();
    },
    true
  );

  /* Closes on scroll/resize, EXCEPT the trigger the keyboard is actually on (`document.activeElement`) — that one repositions instead, since a focus-opened tooltip is the thing being read, not a stale hover. A pointer-opened tooltip is never `activeElement`, so this exception is keyboard-only in practice. */
  function onViewportChange() {
    var active = currentTrigger || pendingTrigger;
    if (active && active === document.activeElement) {
      if (currentTrigger) place(currentTrigger);
      return;
    }
    if (bubble && !bubble.hidden) hide();
    else clearShowTimer();
  }

  document.addEventListener("scroll", onViewportChange, true);
  global.addEventListener("resize", onViewportChange);

  /* Capture, same reason ../scripts/select.js's outside-press listener is capture: a press on the next trigger must close this bubble before that press's own `pointerover` opens a new one. */
  document.addEventListener(
    "pointerdown",
    function (event) {
      if (!bubble || bubble.hidden) return;
      if (bubble.contains(event.target)) return;
      hide();
    },
    true
  );
})(window, document);
