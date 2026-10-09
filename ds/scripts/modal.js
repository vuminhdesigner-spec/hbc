/* modal.js — the behaviour half of the app's MODAL SURFACES.
   Contracts: design-system/components/modal.md and
   design-system/components/drawer.md. Styles: ../styles/modal.css,
   ../styles/drawer.css.

   Why this is shared and not per-screen: a modal surface's obligations are the
   same wherever it appears — take focus, trap it, make the page behind it inert,
   close on Escape and on the scrim, and put focus back on the control that
   opened it. Two screens open the `Địa chỉ` record modal already, and the
   investor picker drawer in project-investor.js was a third copy of the same
   trap written by hand. Duplicating it is how one copy ends up without the
   return of focus and nobody notices.

   THE DRAWER IS THE SAME SURFACE, since 2026-08-19. The centred dialog and the
   right-anchored drawer differ in where the box sits, not in what it owes a
   keyboard or a screen reader, so the panel and scrim lookups below take both
   class names and the drawer keeps no behaviour of its own. Two things fall out
   of that and both are wanted:
     * the replace-by-default rule (below) covers the drawer as well, so
       `Đổi chủ đầu tư` closing its dialog and opening the picker is sequential
       BY CONSTRUCTION rather than by a screen remembering to close first;
     * the drawer contract's obligations are met by tested code instead of by a
       fourth hand-rolled trap.

   Load it BEFORE the screen bundle. It publishes one namespace and runs nothing
   on load beyond a single document-level key listener. Same convention as
   ./pagination.js.

   Usage — the markup owns the content, this owns the behaviour:

     <div class="modal" id="addressModal" hidden>
       <button class="modal__scrim" type="button" data-modal-close aria-label="Đóng"></button>
       <div class="modal__panel" role="dialog" aria-modal="true"
            aria-labelledby="addressModalTitle">…</div>
     </div>

     OmeuModal.open("addressModal", triggerElement);   // fills nothing, shows it
     OmeuModal.close();                                // returns focus, pops one

   A surface opened from INSIDE another one passes `{ stack: true }`:

     OmeuModal.open("attributeModal", button, { stack: true });

   Without it open() REPLACES what is open — see the stack note below for why
   that is still the default.

   A surface that must not be dismissed unasked (a dirty form) passes
   `beforeClose`, checked on every route that reaches close() — Escape, the
   scrim, `[data-modal-close]`, a caller's own close() — and returning `false`
   cancels it:

     OmeuModal.open("createDrawer", trigger, { beforeClose: confirmLeave });

   The screen fills the body before calling open(). */
(function (global, document) {
  "use strict";

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // The two surfaces this script drives. A selector list rather than a
  // `data-` hook, because both classes are already the contract's own names and
  // a third surface should have to be added here deliberately.
  const PANEL = ".modal__panel, .drawer__panel";
  const SCRIM = ".modal__scrim, .drawer__scrim";

  // The doc-detail overlay is its own panel (no scrim, no wrapper); every other surface keeps a panel inside it.
  function panelOf(el) {
    return el.querySelector(PANEL) || (el.matches(".doc-detail--overlay") ? el : null);
  }

  /* A STACK, AND IT IS OPT-IN (2026-09-21).

     This was one surface at a time, on the reasoning that a stack with no
     consumer is untested code guarding a case that does not exist. There is a
     consumer now: the partner record's `Thông tin khác` editor is a dialog, and
     the control that adds a configured attribute to it opens a picker — which,
     under the old rule, closed the very form it was adding a field to.

     `open()` still REPLACES by default, because that default is load-bearing:
     `Đổi chủ đầu tư` on screens/du-an/chi-tiet.js hands its dialog over to the
     picker drawer and relies on the first one closing. Only a caller that passes
     `{ stack: true }` gets a second surface over the first.

     What stacking owes, and what is implemented below: the panel underneath goes
     `inert`, so the pointer, the tab order and the accessibility tree stop at the
     top panel; Escape and the scrim close the TOP one only; each entry returns
     focus to its own opener as it pops; and the shell stays inert until the last
     one closes. The paint order is the DOM's — a stacked overlay must come after
     the one it covers in the markup, which is what its z-index peer does. */
  const stack = [];

  function top() {
    return stack.length ? stack[stack.length - 1] : null;
  }

  function currentEl() {
    const entry = top();
    return entry ? entry.el : null;
  }

  /* The subtree made inert while a modal is open. `.mdm-shell` is the whole app
     shell (design-system/components/app-shell.md); the modal itself lives outside
     it, next to the notification stack, so making the shell inert cannot make the modal inert
     too.

     THE FALLBACK IS NOT COSMETIC — fixed 2026-08-22. `dc-tham-dinh-thong-tin.html`
     drew no app shell at all: it was a two-column document surface with no side
     nav, no page tabs and no page header, so `.mdm-shell` matched nothing and
     this returned `null`. Every caller then skipped the `inert` write silently,
     and the page behind an open dialog stayed focusable and readable to assistive
     tech on exactly the two screens whose dialogs write records — that screen's
     issue-code and cancel dialogs among them.

     THAT SCREEN IS GONE (deleted 2026-08-27, its lane folded into
     `du-an/ho-so/chi-tiet.html`) AND THE FALLBACK IS NOT. The surviving
     screen is shell-less by design and opens the three dialogs that now move a
     record between archive states, so the case the fix was written for is still
     live — it just has one holder instead of two. Deleting the fallback with the
     screen would have reintroduced the defect on the screen that inherited its
     work.

     `[data-modal-inert]` lets a shell-less screen name its own root explicitly.
     Failing that we take the first element child of `<body>` that is not a modal
     surface and not the notification stack, which is the shell's structural position on every
     screen that has one. Nothing is guessed about the markup beyond that. */
  function shell() {
    const declared = document.querySelector("[data-modal-inert]");
    if (declared) return declared;
    const shellEl = document.querySelector(".mdm-shell");
    if (shellEl) return shellEl;
    const children = Array.prototype.slice.call(document.body.children);
    for (let i = 0; i < children.length; i += 1) {
      const node = children[i];
      if (node.matches(".modal, .drawer, .notification-stack, .dock") || node.tagName === "SCRIPT") continue;
      return node;
    }
    return null;
  }

  function stops() {
    const current = currentEl();
    if (!current) return [];
    const panel = panelOf(current);
    if (!panel) return [];
    // Scrim included deliberately: it is the pointer's dismiss target and a real
    // button, so a keyboard user reaching it and pressing Enter closes the modal
    // the same way. It is outside the panel, hence the two queries.
    const inPanel = [...panel.querySelectorAll(FOCUSABLE)];
    // A drawer scrim opts out with tabindex="-1" (drawer.md: not focusable); a modal scrim stays a stop.
    const scrim = current.querySelector(SCRIM);
    const all = scrim && scrim.tabIndex >= 0 ? [scrim].concat(inPanel) : inPanel;
    // `offsetParent === null` filters what is not rendered. The active element is
    // kept regardless: a control that has focus is a valid stop even if the test
    // cannot see it (a `position: fixed` ancestor reports no offsetParent).
    return all.filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function trapTab(event) {
    if (event.key !== "Tab" || !currentEl()) return;
    const list = stops();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // A panel below the top of the stack is made inert as a whole — overlay and
  // scrim included, because the scrim of a covered surface must not be a dismiss
  // target for the one above it.
  function setInert(el, value) {
    if (el && "inert" in HTMLElement.prototype) el.inert = value;
  }

  // The dock (ds/components/dock.md) sits outside the shell, so it goes inert with the shell and comes back with it.
  function setPageInert(value) {
    setInert(shell(), value);
    setInert(document.querySelector(".dock"), value);
  }

  // Surfaces minimized to the dock: hidden, off the stack, not closed.
  const docked = new Set();

  function open(id, trigger, options) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (!el) return;
    // Already the top, or already somewhere in the stack: opening it again would
    // give one element two entries and two focus returns.
    if (stack.some((entry) => entry.el === el)) return;
    if (options && options.stack) {
      // Stack: the surface below stays painted and goes inert.
      setInert(currentEl(), true);
    } else if (currentEl()) {
      // Replace — the default, and what a hand-over relies on. Only the stack is
      // closed: a surface minimized to the dock is off the stack and stays there. Closed without
      // returning focus, since focus is about to move into the new panel. The
      // CALLER still owes the new panel a trigger that will outlive the panel
      // being closed, because the one inside it will not. `force: true` so a
      // hand-over is never blocked by the surface it is replacing's own
      // `beforeClose` (below) — that guard is for a USER dismissing a panel,
      // not for this package deciding to move on from it.
      while (stack.length) close({ returnFocus: false, force: true });
    }
    stack.push({
      el: el,
      opener: trigger || (document.activeElement !== document.body ? document.activeElement : null),
      // Opt-in per open() call (doi-tac/tao-moi.js's create-drawer wizard is
      // the first consumer, 2026-09-29): a dirty-state guard closing by any
      // route owns without a screen re-implementing Escape/scrim/×/footer
      // dismissal four times over. Returns false to cancel the close.
      beforeClose: options && typeof options.beforeClose === "function" ? options.beforeClose : null,
    });
    el.hidden = false;
    el.classList.remove("is-minimized");
    docked.delete(el);
    // `inert` is what actually removes the page behind the dialog from the
    // pointer, the tab order and the accessibility tree. trapTab() above is the
    // fallback for UAs without it, not a duplicate of it.
    setPageInert(true);
    // Focus the panel itself rather than its first control: this dialog is a
    // record to read, and landing on `Đóng` announces the way out before the
    // content. The panel carries tabindex="-1" for exactly this.
    const panel = panelOf(el);
    if (panel) panel.focus();
    el.querySelectorAll("[data-modal-close]").forEach((button) => {
      // Idempotent: re-opening the same modal must not stack a second handler on
      // the same control. Bound once per element, flagged on the element.
      if (button.dataset.modalBound === "true") return;
      button.dataset.modalBound = "true";
      button.addEventListener("click", () => close());
    });
  }

  // Full-screen toggle: state class on the panel (modal) or overlay (drawer); label + glyph follow it.
  const EXPAND = "[data-modal-expand]";

  function setExpanded(el, on) {
    const target = el.classList.contains("drawer") ? el : el.querySelector(".modal__panel");
    if (!target) return;
    target.classList.toggle("is-expanded", on);
    el.querySelectorAll(EXPAND).forEach((button) => {
      button.setAttribute("aria-label", on ? "Thoát toàn màn hình" : "Mở toàn màn hình");
      const glyph = button.querySelector(".material-symbols-outlined");
      if (glyph) glyph.textContent = on ? "close_fullscreen" : "open_in_full";
    });
    window.dispatchEvent(new Event("resize"));
  }

  // Entering the sheet tier drops expanded state on every open surface (the toggle is hidden there).
  const narrow = window.matchMedia("(max-width: 767px)");
  narrow.addEventListener("change", (event) => {
    if (!event.matches) return;
    stack.forEach((entry) => setExpanded(entry.el, false));
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest && event.target.closest(EXPAND);
    const entry = top();
    if (!button || !entry || !entry.el.contains(button)) return;
    const target = entry.el.classList.contains("drawer") ? entry.el : entry.el.querySelector(".modal__panel");
    setExpanded(entry.el, !(target && target.classList.contains("is-expanded")));
  });

  // Closes the TOP surface only. The one below it, if any, comes back out of
  // `inert` and keeps its own focus return for when it closes in its turn.
  function close(options) {
    const entry = top();
    if (!entry) return;
    // Asked, not told: a `beforeClose` returning `false` cancels every route
    // that reaches here — Escape, the scrim, `[data-modal-close]`, a caller's
    // own close() — because they all funnel through this one function. `force`
    // is only for this package's own hand-over in open() above.
    if (entry.beforeClose && !(options && options.force) && entry.beforeClose() === false) return;
    stack.pop();
    entry.el.hidden = true;
    // No memory: the next open starts at the design size.
    setExpanded(entry.el, false);
    const below = currentEl();
    if (below) setInert(below, false);
    else setPageInert(false);
    const returnFocus = !options || options.returnFocus !== false;
    // Only if the trigger is still in the document and still focusable — a row
    // action survives a re-render as a different element, and focusing a detached
    // node silently drops focus on <body>. A stacked surface's trigger usually
    // sits in the panel below, which is exactly why that panel is left painted.
    if (returnFocus && entry.opener && entry.opener.isConnected && entry.opener.offsetParent !== null) {
      entry.opener.focus();
    }
  }

  // Minimize (dock.md): hide + leave the stack without closing; depth 1 and data-drawer-minimizable only; caller keeps the content.  
  function minimize(id) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const entry = top();
    if (!el || !entry || entry.el !== el || stack.length !== 1) return false;
    if (!el.hasAttribute("data-drawer-minimizable")) return false;
    stack.pop();
    el.hidden = true;
    el.classList.add("is-minimized");
    // Expanded is remembered by the caller per draft; the next open starts at the design size.
    setExpanded(el, false);
    docked.add(el);
    setPageInert(false);
    return true;
  }

  // Re-opens a docked surface: same as open() plus the expanded state the caller saved. Focus lands on the panel.
  function restore(id, trigger, options) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    if (!el) return;
    open(el, trigger, options);
    if (options && options.expanded && !narrow.matches) setExpanded(el, true);
  }

  // Escape closes, from anywhere: focus may be on the scrim, which is outside the
  // panel, so a panel-scoped listener would miss it.
  document.addEventListener("keydown", (event) => {
    if (!currentEl()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    trapTab(event);
  });

  global.OmeuModal = {
    open: open,
    close: close,
    isOpen: () => stack.length > 0,
    // How many surfaces are open. A consumer that stacks needs to know whether
    // it is the one being closed or the one underneath.
    depth: () => stack.length,
    minimize: minimize,
    restore: restore,
    // Ids of surfaces currently minimized. A surface that hosts several drafts (one DOM) is listed while none of them is open in it.
    docked: () => Array.from(docked, (el) => el.id),
  };
})(window, document);
