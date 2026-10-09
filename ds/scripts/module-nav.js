/* module-nav.js — the side navigation's module registry, in one place.

   WHY THIS FILE EXISTS. The same two lists — the OneHub modules, and the MDM
   item set under them — were declared as object literals inside TEN files:
   `index.js` and every screen bundle. The copies were identical except for two
   things a machine can work out: how many `../` each `href` needed for its own
   depth, and which item carried `active: true`. `Quản lý công ty` sat in all ten
   as an item with no `href` at all — a dead entry, duplicated ten times, waiting
   for a screen that did not exist.

   So adding one destination meant ten edits, and the company module's remaining
   waves would have multiplied that again. ADR 0007 (docs/adr/) decided the rule:
   a registry more than one screen reads lives in one script under `scripts/`,
   the way `page-tab.js` and `role-switch.js` already do. This is that script.

   WHAT IT DOES NOT OWN, and this matters when reading it: the eight existing
   bundles still render the nav themselves — `navItemMarkup()`, `renderNav()`,
   the module menu and the collapse toggle are still theirs. Only the DATA moved
   here. That rendering is entangled with each bundle's own `state`, `esc`,
   `icon` and `notify`, and lifting all eight in one change is a refactor of
   working screens that no static check would catch the mistakes in. The
   duplication this file removes is the one ADR 0007 names; consolidating the
   rendering is separate, later work, and is NOT done.

   A screen with no bundle of its own can still get a navigation: call
   `OmeuModuleNav.render()` and this file paints `#navSection` itself.

   Plain IIFE publishing one global, loaded with <script src>. No module system
   here — see the head of page-tab.js. */

(function (global) {
  "use strict";

  /* The OneHub modules, in menu order. Only `mdm` has a screen set in this
     package; the other five are switcher entries the frame draws. */
  var MODULES = [
    { id: "scc", label: "[SCC] Quản lý đối tác", icon: "handshake" },
    { id: "pms", label: "[PMS] Mua sắm đấu thầu", icon: "shopping_cart" },
    { id: "clms", label: "[CLMS] Quản lý hợp đồng", icon: "history_edu" },
    { id: "mdm", label: "[MDM] Quản lý dữ liệu", icon: "auto_stories" },
    { id: "twf", label: "[TWF] Quy trình và công việc", icon: "account_tree" },
    { id: "iams", label: "[IAMS] Quản lý phân quyền", icon: "admin_panel_settings" },
  ];

  /* The MDM item set, as the `navigation-onehub` instance draws it
     (expand=true, module=MDM).

     `path` is RELATIVE TO THE REPOSITORY ROOT, not to the caller — resolve()
     supplies the climb, so one registry serves `index.html` at the root and a
     screen two folders inside `screens/`. An item with no `path` is drawn but
     does not navigate: the frame lists it and this package has no screen for it.

     `owns` is the path prefix an item claims for the ACTIVE state. It is a
     prefix and not an equality test because a module's item stays current across
     that module's screens — every screen under `screens/du-an/` marks
     `Quản lý dự án`, including the ones under `du-an/ho-so/`.

     THE COMPANY ITEM WAS RENAMED on 2026-09-16, from `Quản lý công ty`. Its
     screen calls itself `Thông tin Công ty` — that is what the QC environment
     titles the page, what the hidden <h1> says and what the page-tab registry
     carries — and a nav item naming the same screen differently is a defect
     rather than a preference. The other labels are LEFT ALONE deliberately:
     production also calls this rail's other entries `Trang chủ`,
     `Thông tin Dự án`, `Quản lý hồ sơ` and `Logs`, and whether to adopt that
     wording is a product decision, recorded as an open question, not a side
     effect of moving this registry. */
  var ITEMS = [
    { label: "Tổng quan", icon: "donut_small", path: "index.html", owns: "index.html" },
    { label: "Sản phẩm gốc", icon: "inventory_2" },
    { label: "Sản phẩm nhà cung cấp", icon: "local_shipping" },
    { label: "Quản lý dự án", icon: "maps_home_work", path: "screens/du-an/danh-sach.html", owns: "screens/du-an/" },
    { label: "Quản lý căn hộ", icon: "house" },
    { label: "Thông tin Công ty", icon: "corporate_fare", path: "screens/cong-ty/danh-sach.html", owns: "screens/cong-ty/" },
    /* THE COMPANY ITEM'S OTHER HALF, added 2026-09-16 with MDM-823. AC1 of that
       ticket splits the organisation set by `orgGroup`: `Internal` — MAG's own
       companies — stays on the item above, and `External` — the partners MAG
       works with — is this one. Two menu items over one record set, which is why
       it sits DIRECTLY BELOW `Thông tin Công ty` and not at the end of the rail:
       an operator who cannot find a vendor under the first item has to find the
       second one without being told to look. */
    { label: "Thông tin Đối tác", icon: "handshake", path: "screens/doi-tac/danh-sach.html", owns: "screens/doi-tac/" },
  ];

  /* Where the repository root is from the current page, as a prefix.

     `screens/` is the marker, because the root itself has no name to look for.
     A page inside it is (segments-after-`screens`) folders down, counting
     `screens` itself: `screens/du-an/danh-sach.html` is two, and
     `screens/du-an/ho-so/danh-sach.html` is three. A page that is not under
     `screens/` is the portal home, sitting at the root. */
  function rootPrefix() {
    var parts = String(global.location.pathname).split("/");
    var at = parts.lastIndexOf("screens");
    if (at === -1) return "./";
    var depth = parts.length - at - 1;
    return new Array(depth + 1).join("../");
  }

  /* The current page as the registry spells it — repo-relative. */
  function here() {
    var parts = String(global.location.pathname).split("/");
    var at = parts.lastIndexOf("screens");
    if (at !== -1) return parts.slice(at).join("/");
    return parts[parts.length - 1] || "index.html";
  }

  function resolve(item) {
    var page = here();
    return {
      label: item.label,
      icon: item.icon,
      href: item.path ? rootPrefix() + item.path : null,
      active: !!(item.owns && page.indexOf(item.owns) === 0),
    };
  }

  /* The resolved item set for this page: real hrefs, one item flagged active.
     This is what a bundle reads instead of declaring its own copy. */
  function items() {
    return ITEMS.map(resolve);
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function itemMarkup(item) {
    var tag = item.href ? "a" : "button";
    return (
      "<" + tag + ' class="nav-item' + (item.active ? " is-active" : "") + '"' +
      (item.href ? ' href="' + esc(item.href) + '"' : ' type="button"') +
      (item.active ? ' aria-current="page"' : "") +
      ' title="' + esc(item.label) + '">' +
      '<span class="material-symbols-outlined" aria-hidden="true">' + esc(item.icon) + "</span>" +
      '<span class="nav-item__label">' + esc(item.label) + "</span>" +
      "</" + tag + ">"
    );
  }

  /* Paints `#navSection`. For a screen with no bundle of its own; a screen that
     already renders its own nav must NOT call this, or the rail is drawn twice. */
  function render() {
    var section = global.document.getElementById("navSection");
    if (!section) return;
    section.innerHTML =
      '<div class="nav-group__items">' + items().map(itemMarkup).join("") + "</div>";
  }

  global.OmeuModuleNav = {
    modules: MODULES,
    items: items,
    itemMarkup: itemMarkup,
    render: render,
  };

  /* OPT-IN AUTO RENDER. A screen with no bundle of its own marks its rail
     `data-module-nav="auto"` and this file paints it. The attribute is what makes
     it opt-in rather than automatic: the eight screens that render their own nav
     must not be painted twice, and an unconditional render here would do exactly
     that. Reading an attribute is also the same shape page-tab.js uses with
     `data-page-tab-owner` — the page declares what it wants from the shared
     script, the shared script does not guess. */
  var section = global.document.getElementById("navSection");
  if (section && section.getAttribute("data-module-nav") === "auto") render();
})(window);
