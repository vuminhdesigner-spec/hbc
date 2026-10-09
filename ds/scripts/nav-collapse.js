/* nav-collapse.js — the side navigation's collapse/expand state, in one place.

   WHY THIS FILE EXISTS. The same fifteen lines — `setNavCollapsed()`, the
   toggle's click binding, and a `matchMedia("(max-width: 1279px)")` default —
   were declared inside NINE bundles (`index.js`, the five `du-an` screens and
   the three `du-an/ho-so` screens), and were missing outright from the nine
   `doi-tac` and `cong-ty` screens. Those nine had a collapse button that did
   nothing and no narrow default at all, so between 768px and 1279px the shell
   reserved a 64px rail (styles/responsive.css) while the nav inside it still
   composed at 288px: every label, the search field and the module trigger were
   clipped by the nav's own `overflow: hidden`, with no way to recover. That is
   the bug this file closes, and it could not be closed in one screen's bundle.

   The copies had drifted, too: `du-an/ho-so/hang-doi.js` never swapped the
   toggle's glyph, so the control drew `left_panel_close` while announcing
   `Mở rộng điều hướng`.

   ADR 0007 (docs/adr/) is the rule this follows: behaviour more than one screen
   reads lives in one script under `scripts/`, the way `module-nav.js`,
   `page-tab.js` and `role-switch.js` already do.

   WHAT IT OWNS: the `.is-collapsed` class on `#sideNav`, the toggle's `aria-*`
   and glyph, the narrow-tier default, and dismissal of the narrow-tier overlay
   (scrim click, Escape). Nothing else. Module-menu rendering, nav-item
   rendering and the search filter stay where they are.

   Plain IIFE, loaded with <script src>, no module system — see the head of
   page-tab.js. It must be loaded before the screen bundle so a bundle that
   wants the state can read `OmeuNavCollapse`. */

(function (global) {
  "use strict";

  var sideNav = document.getElementById("sideNav");
  var toggle = document.getElementById("navCollapse");
  if (!sideNav || !toggle) return;

  var shell = sideNav.closest(".mdm-shell");
  /* 1279px is the lg tier's upper edge — keep it in step with
     --utui-breakpoint-xl and the same boundary in ../styles/responsive.css. */
  var narrow = global.matchMedia("(max-width: 1279px)");

  function moduleMenu() {
    return document.getElementById("moduleMenu");
  }

  /* Collapsing with the module menu open would leave the menu painted over a
     64px rail. The DOM is closed directly rather than through the bundle's own
     setModuleMenu(): this script is loaded first and must not depend on a
     screen exporting anything. */
  function closeModuleMenu() {
    var menu = moduleMenu();
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    var trigger = document.querySelector(".nav-module__trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function isCollapsed() {
    return sideNav.classList.contains("is-collapsed");
  }

  function set(collapsed) {
    sideNav.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Mở rộng điều hướng" : "Thu gọn điều hướng");
    /* The glyph has to move with the label, or the control shows
       `left_panel_close` while announcing `Mở rộng điều hướng` — the icon and
       the accessible name saying opposite things. */
    var glyph = toggle.querySelector(".material-symbols-outlined");
    if (glyph) glyph.textContent = collapsed ? "left_panel_open" : "left_panel_close";
    if (collapsed) closeModuleMenu();
  }

  /* Below xl the expanded nav is an overlay over the page (styles/responsive.css),
     so it needs the two dismissals every overlay has. Neither fires at xl and
     above, where the nav is a column in the grid and dismissing it would be the
     user losing their navigation to a stray click. */
  function overlayOpen() {
    return narrow.matches && !isCollapsed();
  }

  if (shell) {
    /* The scrim is `.mdm-shell::before`, so a click on it is reported on the
       shell itself; a click on anything inside the nav is not a dismissal.
       A pseudo-element is enough here — unlike the drawer's scrim, which has to
       be a real element because its panel is a sibling, not a descendant. */
    shell.addEventListener("click", function (event) {
      if (!overlayOpen()) return;
      if (event.target.closest(".side-nav")) return;
      set(true);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !overlayOpen()) return;
    /* Escape belongs to the topmost layer. The module menu is inside the nav and
       the screen bundles close it on Escape themselves; a modal or drawer paints
       ABOVE this overlay (z-index 60 against 56), so while either is open this
       key is not ours. */
    var menu = moduleMenu();
    if (menu && !menu.hidden) return;
    if (document.querySelector(".modal:not([hidden]), .drawer:not([hidden])")) return;
    set(true);
    toggle.focus();
  });

  toggle.addEventListener("click", function () {
    set(!isCollapsed());
  });

  /* Below xl the nav defaults to collapsed; the toggle still lets the user
     expand it deliberately, and at xl and above it comes back expanded. */
  narrow.addEventListener("change", function (event) {
    set(event.matches);
  });

  set(narrow.matches);

  global.OmeuNavCollapse = {
    set: set,
    isCollapsed: isCollapsed,
  };
})(window);
