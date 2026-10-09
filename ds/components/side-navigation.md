# Side Navigation

## Purpose

Side Navigation is the single persistent navigation surface for OneHub product
screens. It carries brand identity, module switching, the active module's
route list, a collapse control, and the signed-in user's profile entry point.

It replaces the previous two-tier composition (icon rail for modules plus a
separate level-2 list): module switching now happens in a dropdown inside this
one column.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `navigation-onehub`, node `9714:7538` |
| Variants | 13: `expand` true/false x `module` PMS, CLMS, SCC, MDM, TWF, IAMS, plus `expand=true, module=dropdown` |
| Variant: expanded (PMS, grouped) | `9714:7539`, 288 x 840 |
| Variant: expanded (MDM, flat) | `9714:7852`, 288 x 840 |
| Variant: collapsed (MDM) | `9714:7889`, 64 x 840 |
| Variant: module menu open | `9714:8071`, 288 x 840 |
| Reviewed via | claude.ai Figma MCP (`get_metadata`, `get_variable_defs`, `get_design_context`, `get_screenshot`), 2026-08-22 |

Superseded source: the MDM - V2 product file (`tS8dUB2qWLc28gZbtj8IIL`,
`navigation-onehub` `8562:91424`, 288 x 800). The nav is shared by six modules, so
its values come from the design-system file; the product file is now read only as
a consumer instance. See the 2026-08-22 revision at the end of this document for
what moved.

## Anatomy

In source order:

1. **Backdrop** — decorative skyline image pinned to the bottom of the nav,
   `pointer-events: none`, hidden when collapsed.
2. **Brand row** — the 40 x 40 mark slot holding the 32 x 32 logo, and the
   collapse toggle at the opposite end.
3. **Module switcher** — bordered trigger showing the active module's icon and
   label with an `unfold_more` affordance; opens the module menu.
4. **Module menu** — light surface listing every module the user can reach, with
   a check on the active one.
5. **Search field** — bordered field under the trigger, grouped with it 12px
   apart. Filters the item list. Injected by `scripts/nav-search.js`, not
   authored; see the deviation note under Usage.
6. **Nav section** — either a flat item list or a set of collapsible groups,
   depending on the module. Scrolls independently when it overflows.
7. **Footer** — the profile row alone (avatar, name, email, `more_vert`
   overflow). The collapse toggle was here until 2026-08-22.

## Variants

| Variant | Width | Composition |
|---|---|---|
| Expanded | `--utui-nav-width` (288px) | Full labels, module label, search input, group headers, profile detail. |
| Collapsed | `--utui-nav-width-collapsed` (64px) | Icons only, with a divider under the module block and the brand row stacked so the toggle survives. Labels, group headers, backdrop, profile detail, the search input and the module chevron are hidden. |

| Nav section shape | Use |
|---|---|
| Flat list | Modules with a short, unsegmented route list (e.g. MDM). |
| Collapsible groups | Modules with enough routes to need grouping (e.g. PMS). Each group has a label button with an `expand_less` / `expand_more` chevron. |

## States

- Default.
- Hover on nav items, module trigger, menu options, collapse toggle, and the
  whole profile row — `--utui-nav-item-hover-bg`.
- The profile row carries a `title`: the action when expanded, the identity plus
  the current role when collapsed, where nothing else draws them.
- Focus visible on every control.
- Active route — light `--utui-nav-item-active-bg` panel, brand label text, and
  a brand-tinted icon. Must also carry `aria-current="page"`.
- Module menu open / closed.
- Group expanded / collapsed.
- Collapsed nav — items keep their `title` so the label is still discoverable.

## Tokens

| Role | Token |
|---|---|
| Width | `--utui-nav-width`, `--utui-nav-width-collapsed` |
| Container padding / gap | `--utui-nav-padding`, `--utui-nav-gap` |
| Container background | `--utui-nav-bg` |
| Default text | `--utui-nav-text` |
| Muted text (email) | `--utui-nav-text-muted` |
| Item height / padding / gaps | `--utui-nav-item-height`, `--utui-nav-item-padding`, `--utui-nav-item-gap`, `--utui-nav-item-gap-y` |
| Item radius | `--utui-nav-item-radius` |
| Item hover | `--utui-nav-item-hover-bg` |
| Active item | `--utui-nav-item-active-bg`, `--utui-nav-item-active-text`, `--utui-nav-item-active-icon` |
| Module trigger | `--utui-nav-module-bg`, `--utui-nav-module-border`, `--utui-nav-module-shadow` |
| Collapsed divider | `--utui-nav-divider` |
| Group label | `--utui-nav-group-label-text`, `--utui-nav-group-gap` |
| Module menu | `--utui-nav-dropdown-bg`, `--utui-nav-dropdown-text`, `--utui-nav-dropdown-active-bg`, `--utui-nav-dropdown-offset`, `--utui-nav-dropdown-gap`, `--utui-nav-dropdown-radius`, `--utui-nav-dropdown-shadow` |

## Layout Contract

- The nav owns its own width; the page shell reads
  `--utui-nav-width` / `--utui-nav-width-collapsed` for its grid column rather
  than hard-coding pixels.
- The container is 12px padded with a 16px gap between its blocks (`spacing/md`).
- Nav items are a fixed 40px tall with 8px padding and a 12px icon/label gap,
  4px apart, and every label is Medium (500) — the active row goes to 600, so
  weight still changes but is not what marks an item as a label.
- Only the nav section scrolls. Brand row, module block (trigger plus search) and
  footer stay fixed.
- The module menu opens 8px below the trigger and spaces its options 4px apart.
- The module menu must paint above the nav list. Because the list is a later
  sibling in the same stacking context, the module wrapper needs an explicit
  higher `z-index` — not just a high value on the menu itself.
- Collapsed only, a 1px divider separates the module block from the item list,
  one container gap away on each side. It is a border on the section, not an
  element, so no screen authors it.
- The backdrop sits at `z-index: 0` behind all interactive content.
- From `lg` down (≤1279px) the nav defaults to collapsed; the toggle still lets
  the user expand it deliberately, at every tier including `sm`.
- **Below `xl`, expanding does not widen the column — the nav becomes an
  overlay.** The shell keeps its 64px rail column and the expanded nav is
  `position: fixed`, 288px, `z-index: 56`, over a scrim on `.mdm-shell::before`
  (`styles/responsive.css`). Three reasons, in order: a 288px column would leave
  480px of content at 768px and 87px at 375px; the shell column was pinned at
  64px for this whole range already, so an expanded nav in flow was clipped by
  the nav's own `overflow: hidden`; and the overlay is what makes the toggle
  worth having at `sm`, where it used to be hidden.
- The overlay is dismissed by the toggle, by a click on the scrim, and by
  `Escape` — `scripts/nav-collapse.js`, which also owns the `.is-collapsed`
  class, the toggle's `aria-*` and glyph, and the narrow-tier default. A screen
  bundle must not re-implement any of that; nine of them did, and the nine that
  did not had a dead toggle. See `.claude/skills/responsive/SKILL.md`.
- **The nav is never hidden.** Removing it leaves a screen with no navigation at
  all; the rail is the narrow form. (A `display: none` at 1180px did exactly this
  until 2026-08-11, while the shell still reserved the column — an empty gutter
  and no nav between 761px and 1180px.)

## Usage

Use one Side Navigation per authenticated product screen. Put cross-module
navigation in the module menu and route-level navigation in the nav section —
never mix the two levels in one list.

Avoid adding page-level actions (create, export, filter) here; those belong to
the page header or table toolbar.

## Accessibility

- The container is `<aside>` with an `aria-label`.
- The module trigger uses `aria-haspopup="menu"`, `aria-expanded`, and
  `aria-controls`; the menu is `role="menu"` with `role="menuitemradio"` +
  `aria-checked` options.
- The menu closes on outside click and on `Escape`, returning focus to the
  trigger.
- Group label buttons expose `aria-expanded` and `aria-controls`.
- The active route carries `aria-current="page"`; the active treatment is a
  background *and* weight change, never color alone.
- The collapse toggle updates both its `aria-label` and `aria-expanded`.
- The search field is an `<input type="search">` with an `aria-label`; its
  no-match message is `role="status"` so a filter that empties the list is
  announced. Filtered items are hidden with the `hidden` attribute, so they leave
  the accessibility tree rather than staying focusable but invisible.
- Collapsed items keep a `title` so the icon still has a discoverable name.
- Decorative backdrop and avatar monogram are `aria-hidden`. The brand mark
  carries its accessible name on the `<img alt>`; an `aria-label` on the
  wrapping `<div>` would be inert.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Component CSS | `.side-nav`, `.nav-module`, `.nav-module-block`, `.nav-search`, `.nav-group`, `.nav-item`, `.side-profile`, `.nav-collapse` in `styles/side-navigation.css` |
| Search field markup + filter | `scripts/nav-search.js` (injected; one script tag per screen) |
| Collapse / expand state, narrow-tier default, overlay dismissal | `scripts/nav-collapse.js` (one script tag per screen, before the screen bundle) |
| Narrow-tier overlay + scrim | `@media (max-width: 1279px)` in `styles/responsive.css` |
| Full implementation | `screens/du-an/danh-sach.html` + `screens/du-an/danh-sach.js`; the same rail is in every other `screens/*.html` and in `index.html` |
| Backdrop asset | `assets/nav-backdrop.webp` |
| Legacy two-tier usage | **none** — `demo-V2/index.html` was removed 2026-08-03 |

## Class Contract For Static HTML

```html
<aside class="side-nav" id="sideNav" aria-label="Điều hướng OneHub">
  <img class="side-nav__backdrop" src="./assets/nav-backdrop.webp" alt="" aria-hidden="true">
  <div class="side-nav__brand">
    <span class="side-nav__mark"><img src="./assets/brand-mark.svg" alt="One Mount"></span>
    <button class="nav-collapse" id="navCollapse" type="button"
            aria-label="Thu gọn điều hướng" aria-expanded="true">…</button>
  </div>

  <!-- .nav-module-block, .nav-search and .nav-search__empty are injected by
       scripts/nav-search.js around this element. Do not author them. -->
  <div class="nav-module">
    <button class="nav-module__trigger" type="button"
            aria-haspopup="menu" aria-expanded="false" aria-controls="moduleMenu">
      <span class="material-symbols-outlined" aria-hidden="true">auto_stories</span>
      <span class="nav-module__label">[MDM] Quản lý dữ liệu</span>
      <span class="material-symbols-outlined" aria-hidden="true">unfold_more</span>
    </button>
    <div class="nav-module__menu" id="moduleMenu" role="menu" hidden>
      <button class="nav-module__option" role="menuitemradio" aria-checked="true">…</button>
    </div>
  </div>

  <div class="side-nav__section">
    <!-- flat -->
    <div class="nav-group__items">
      <button class="nav-item is-active" type="button" aria-current="page" title="Dự án">…</button>
    </div>
    <!-- or grouped -->
    <div class="nav-group">
      <button class="nav-group__label" type="button" aria-expanded="true" aria-controls="navGroup0">
        <span>Mua sắm &amp; đấu thầu</span>
        <span class="material-symbols-outlined" aria-hidden="true">expand_less</span>
      </button>
      <div class="nav-group__items" id="navGroup0">…</div>
    </div>
  </div>

  <div class="side-nav__footer">
    <div class="side-profile">
      <span class="side-profile__avatar" aria-hidden="true">AD</span>
      <div class="side-profile__body">
        <span class="side-profile__name">admin</span>
        <span class="side-profile__mail">admin@company.com</span>
      </div>
      <button class="side-profile__more" type="button" aria-label="Tùy chọn tài khoản">…</button>
    </div>
  </div>
</aside>
```

Add `.is-collapsed` to `.side-nav` for the 64px composition.

## Known Gaps

- **Token layer divergence (important, and narrowed 2026-08-22).** The OneHub
  semantic layer is real and published: reading `9714:7538` returns
  `background/accent/primary/bg-navigation` `#562f11`,
  `background/accent/primary/bg-primary-light` `#f6f3ef`,
  `icon/accent/primary/icon-primary` `#ae7129`,
  `text/neutral/teritary` `#bbbbbb`, `text/neutral/primary` `#212121`,
  `overlay/light/light-5` `#ffffff0d`, `light-10` `#ffffff1a` and `light-20`
  `#ffffff33` as variables, each at exactly the value pinned in
  `design-system/tokens/css/untitled-ui-component.css`. **The values are
  attested, not guessed** — the earlier wording here, that they have "no
  equivalent", conflated two different problems.
  What remains open is only the *aliasing*: the Untitled UI tiers this package is
  built from have no accent step for these to point at, so they stay literals
  carrying their Figma variable name in a comment. Note `#ae7129`
  (`icon/accent/primary/icon-primary`, also published as
  `color/other/brand/default`) is close to but not equal to `Brand/500`
  `#a67038` (published as `text/brand-primary` and `ic/brand-dark`) — two
  distinct variables, so the difference is intended and must not be collapsed.
  Reconciling the two systems — adopt OneHub semantics, extend the Untitled UI
  tiers, or keep the nav as the only consumer — is still an open design-system
  decision this contract should not settle on its own.
- ~~`demo-V2/index.html` still renders the **legacy two-tier shell**~~ (icon rail +
  this nav using the superseded `.side-nav__module` header) because its
  app-shell has not been revamped. Those legacy header rules are kept in
  `app.css` under an explicit comment. Migrating it is an `app-shell.md`
  follow-up.
- Only MDM (flat) and PMS (grouped) have an authored item set in the demo. SCC,
  CLMS, TWF, and IAMS appear in the module menu but report that they are out of
  demo scope rather than rendering invented routes.
- The profile `more_vert` overflow menu and the module menu's own keyboard
  roving-focus behavior are not implemented; only open/close, outside-click, and
  `Escape` are wired.
- **The narrow-tier overlay does not contain focus.** ~~No off-canvas drawer
  variant.~~ Closed 2026-09-17 — the expanded nav below `xl` is that drawer: a
  fixed 288px panel over a scrim, dismissed by the toggle, a scrim click or
  `Escape`. What is not built is the modal half: `Tab` from inside the open
  overlay walks into the page behind the scrim, where `scripts/modal.js` would
  trap it. The dismissal routes make it escapable by keyboard, so this is a
  refinement rather than a trap. Tracked in
  `.claude/skills/responsive/reference.md` § Known gaps.
- ~~`.side-profile__more` stays 24px under coarse pointers~~ — closed 2026-08-22,
  the trigger is the whole profile row. Collapsed it is 40px, still under the 44px
  minimum: that is the width of the 64px rail minus its padding, so the target
  cannot grow without widening the rail. See the last revision.
- **The active item's label fails WCAG 1.4.3 AA — measured, open.**
  `.nav-item.is-active` paints `--utui-nav-item-active-text` `#a67038` on
  `--utui-nav-item-active-bg` `#f6f3ef` at **3.80:1**, below the 4.5:1 its
  14–16px semibold label needs. Measured 2026-09-23 by `tools/measure/measure_a11y.mjs`
  in Chromium at 1440 on every screen that draws the nav. It is the same
  Brand/500 text that fails on Brand/50 (`anchor-nav.md`, `badge.md`), so the fix
  is the brand-ramp decision `button.md` § Measured contrast — 2026-08-27f
  already leaves to the DS owner, not a nav-local colour. Listed in
  `tools/measure/measure_a11y.accepted.json` so the gate does not fail every build on it;
  remove it there when the pairing is fixed.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/side-navigation.md`](docs/revisions/side-navigation.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-22 (`.side-profile` gains a role switch)
- 2026-08-22 (source re-pointed at the design-system file)
- 2026-08-22c (the profile row is the trigger)
