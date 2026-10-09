# App Shell

## Purpose

App Shell defines the persistent product frame for V2 enterprise workflows. It
contains the level-1 module rail, level-2 side navigation, and the main content
canvas.

## Anatomy

- Side navigation: brand, module switcher, route list, collapse toggle, and
  profile. Owned by `design-system/components/side-navigation.md`.
- Page tab strip: the workspace's open records, sitting at the top of the main
  region. Owned by `design-system/components/page-tab.md`. This is shell chrome — page
  patterns start below it.
- Main region: page content, header, controls, and workflow surfaces.

The shell reads `--utui-nav-width` / `--utui-nav-width-collapsed` for its
navigation column instead of hard-coding a width, so collapsing the nav reflows
the main region automatically.

## Scroll behaviour

The **side navigation is persistent** — it must not scroll away with the page.
The shell pins it with `position: sticky; top: 0; height: 100vh; align-self:
start` (scoped to the shell as `.mdm-shell > .side-nav`, not to the nav
component itself, so the nav stays reusable outside this frame). Internal
scrolling of the nav's route list is owned by
`design-system/components/side-navigation.md`.

Whether a page pins its own header below the tab strip is the page pattern's
call — see `design-system/patterns/item-listing.md`, which pins the tab strip and its page
header together as one sticky block. That block is `.page-sticky`
(`styles/app-shell.css`; in the registry it belongs to page-header — it is the
Figma `Page Header` root, see page-header.md § Anatomy): it wraps the page tab group and
`.page-header-block` (`design-system/components/page-header.md`) as siblings, so both pin
together with one `position: sticky` rather than two.

### Fixed-viewport mode (added 2026-08-16)

A page may opt out of document scrolling entirely: the shell becomes exactly one
viewport tall, and one nominated region inside the page absorbs whatever height
is left over. Every listing screen uses it; no detail screen does.

Opt in with three classes and nothing else:

| Class | On | Effect |
|---|---|---|
| `.mdm-shell--fixed` | the shell | `height: 100dvh; overflow: hidden` — the document cannot scroll. `.main` becomes a column. |
| `.page--fixed` | the page container | The page is a flex column that fills what the pinned chrome leaves. Its own `gap` and padding are untouched. |
| `.page-fill` | one region inside the page | Takes the leftover height. A page may declare several as long as only one is unhidden at a time. |

What the mode buys, and why it is a height chain rather than more pinning:

- **The table's column header and its pagination footer are both frozen, and
  neither needs a sticky element.** The footer is a sibling of the row scroller,
  so it cannot scroll in the first place — see `design-system/components/data-table.md`,
  `.table-panel--fill`. A sticky footer would additionally track the table's
  *horizontal* scroll and slide the pagination group off a 2844px table.
- **Nothing measures the chrome.** The previous arrangement pinned bands over a
  scrolling document and bounded the table with
  `calc(100dvh - --utui-scroll-region-offset)` — a tiered constant standing in for
  chrome whose height depends on its content, so the bound was either short (dead
  space under the footer) or long (the page scrolled). Three screens had grown a
  local ResizeObserver to publish their real chrome height; that workaround is
  gone from `du-an/ho-so/danh-sach` and is unnecessary in this mode by construction.
- **Hiding a region gives its height to the data**, which is what the fullscreen
  mode below trades — the whole chrome band for a taller table, not one region
  at a time.

Two rules come with it:

- **Every link in the chain needs `min-height: 0`.** A flex item's default
  `min-height: auto` refuses to shrink below its content, which pushes the
  overflow back up to the document one level higher and quietly restores the
  scrollbar the mode exists to remove.
- **The fill region has a floor of 320px** — a header, three rows and a footer.
  "What is left" is a subtraction, and at 1024x768 with the metric strip open it
  came out at roughly zero: a column header, a horizontal scrollbar and a frozen
  footer with no rows between them. Below the floor the *page column* scrolls
  (`.page--fixed` is `overflow: hidden auto`), so the nav and the pinned chrome
  still hold still and only the page's blocks move.

`responsive.css` reverts the whole mode at `sm`, where a 322px pinned block and a
three-row toolbar would leave a 667px viewport reading the table through a slot.
That is the mode's only tier rung — everything else about it is width-independent,
which is the point of expressing it as a height chain instead of as offsets.

### Fullscreen mode (added 2026-09-28)

A listing page may opt into a second, orthogonal mode: `.is-fullscreen` on
`.mdm-shell`. It is a CSS state, not the browser Fullscreen API — no user-agent
chrome, no separate window, nothing to request permission for. It replaces the
metric region's own disclosure (`design-system/components/metric-item.md`),
which hid the strip in place; this hides the strip along with the rest of the
chrome around the table.

**Hides:** `.mdm-shell.is-fullscreen > .side-nav`, `.page-sticky` (the pinned
page-tab strip and page header), `.page--fixed > .metric-region`.
**Keeps:** the page's `<h1>`, the toolbar (search, `Bộ lọc`, `Tạo mới`, the
toggle itself), the table and its pagination. `.mdm-shell.is-fullscreen > .main`
spans both grid tracks, since `.side-nav` leaves it the grid's only item.

Toggle: `.listing-toolbar__icon-button[data-action="toggle-fullscreen"]`
(`design-system/components/listing-toolbar.md`), `aria-label` swaps between
"Mở toàn màn hình" / "Thoát toàn màn hình" — no `aria-pressed`, no `aria-expanded`
(the control does not name one single region it discloses). Behaviour:
`scripts/listing-fullscreen.js` (`window.OmeuListingFullscreen`).

**Escape** exits fullscreen, following the "topmost layer" convention
(`scripts/nav-collapse.js`): it defers to the filter panel, a drawer or a modal
if any of those was open when the key went down (state read at the capture
phase, before that layer's own handler closes it), to a search field that still
has text (Escape clears the keyword first), and to `select.js` (stopPropagation
on the combo) and `tooltip.js` (capture phase).

**Focus:** a click leaves focus on the button (default browser behaviour).
Exiting via Escape returns focus to the button, unless focus is already inside
the toolbar or the table and still visible — that stays put.

**On exit**, `window.OmeuMetricScroll.refresh()` runs once the metric region is
visible again, since the strip may have been re-measured at 0 width while
hidden. On every toggle, a `resize` event is dispatched on `window` so the
screen's own filter-panel repositioning (already listening for `resize`) runs
without this shared script reaching into screen internals.

Only paired with `.mdm-shell--fixed` today — `du-an/danh-sach` and
`doi-tac/danh-sach`. **Known consequence at 1024×768 (D7):** the metric region
is not hidden by a tier, so it stays visible outside fullscreen mode; the table
drops to its 320px floor and the page column scrolls, same as any other content
this mode cannot fit above the floor.

## Variants

| Variant | Description |
|---|---|
| OneHub shell | Current composition: one navigation column plus main region. Used by every screen in `screens/` and by `index.html`. |
| Legacy two-tier shell | **Retired.** Separate 80px icon rail plus a 280px level-2 list. Its only demo (`demo-V2/index.html`) was removed 2026-08-03; no screen composes it. |

## States

- Default: navigation expanded, main region fills the remaining width.
- Navigation collapsed: nav column narrows to `--utui-nav-width-collapsed` and
  the main region reflows.
- Active route: one navigation item is active.
- Responsive: shell remains usable at every width with no horizontal page
  overflow. The nav column is 288px at `xl`/`2xl` and the 64px rail from `lg`
  down; at `sm` the rail is forced in CSS so the composition holds without JS.
  Tiers, tokens and the region reference are in `.claude/skills/responsive/SKILL.md` — the
  shell must not carry its own breakpoint values.

## Tokens

| Role | Token |
|---|---|
| Page background | `--utui-color-bg-page` |
| Navigation column width | `--utui-nav-width`, `--utui-nav-width-collapsed` |
| Navigation surface | `--utui-nav-*` (owned by `design-system/components/side-navigation.md`) |
| Radius | `--app-radius`, `--app-radius-pill` |

## Usage

Use App Shell for authenticated, repeated operations where users switch between
modules and level-2 workflow areas. Do not use it for standalone landing pages
or simple one-off dialogs.

The shell owns only the page grid and main region. Navigation internals belong
to `design-system/components/side-navigation.md`.

## Accessibility

- The navigation region must expose a meaningful `aria-label`.
- Active navigation state must be visible without relying only on color.
- The main content area should follow the navigation in DOM order.

## Code Mapping

| Surface | File |
|---|---|
| Shell CSS | `styles/app-shell.css` — includes `.mdm-shell` and `.page-sticky`, moved out of the three screen bundles on 2026-08-11 (identical in all three, and `responsive.css` cannot override a screen-level rule) |
| Fixed-viewport mode | `styles/app-shell.css` (`.mdm-shell--fixed`, `.page--fixed`, `.page-fill`); reverted at `sm` in `styles/responsive.css`. Consumed by `du-an/danh-sach`, `du-an/ho-so/danh-sach`, `du-an/phan-cap`, `du-an/ho-so/tai-len`, `du-an/ho-so/hang-doi` and `index.html` — six consumers. `investor-address` was one of them until 2026-08-19, when it was deleted with the record's `Chủ đầu tư` tab |
| Fullscreen mode | `styles/app-shell.css` (`.mdm-shell.is-fullscreen`); behaviour `scripts/listing-fullscreen.js` (`window.OmeuListingFullscreen`). Consumed by `du-an/danh-sach` and `doi-tac/danh-sach`, both `.mdm-shell--fixed` |
| Tier behaviour | `styles/responsive.css` |
| OneHub shell markup | `.mdm-shell` in every `screens/*.html` and in `index.html` |
| Legacy two-tier rules | `styles/legacy/two-tier-shell.css`, `styles/legacy/responsive-legacy.css` — retired, see Known Gaps |

## Examples

- `screens/du-an/danh-sach.html` — current OneHub shell
- `screens/du-an/ho-so/danh-sach.html` — OneHub shell with the page wash

## Known Gaps

~~`demo-V2/index.html` still renders the legacy two-tier shell…~~ Resolved
2026-08-03 by deletion: that demo was removed as outdated, so no screen renders
the two-tier shell any more. The `.icon-rail` and legacy `.side-nav__module`
rules in `styles/app-shell.css` are now **dead code** and should be removed — as are
`demo-V2/app.js` and `demo-V2/prototype-data.{js,json}` were deleted in the
2026-08-03 restructure. The rules themselves survive in
`styles/legacy/two-tier-shell.css`, still imported so the cascade is
unchanged, and safe to drop once confirmed.
