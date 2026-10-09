# Tab Bar

## Purpose

Tab Bar switches between panels **within a single page** — the content below it
changes without navigating. It is the underline-indicator tab pattern.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Tab Bar`, node `10008:7762`, 229 x 140 — variant axis `Type` |
| Superseded node | `9685:108836` (single component, no variant axis) |
| Tab item | `_tab-item`, property `state` (`True` / `False`) |
| Reviewed via | Figma REST API (`/v1/files/…/nodes`), 2026-08-03 |
| Last synced | 2026-08-03 — see Revision History |

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/tab-bar.md`](docs/revisions/tab-bar.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-19
- 2026-08-13
- 2026-08-12 (3)
- 2026-08-12 (2)
- 2026-08-12
- 2026-08-03
- 2026-07-29

## Not To Be Confused With

Three components in this package look like tabs. Pick by what the control
actually does:

| If the control… | Use | Semantics |
|---|---|---|
| Swaps panels in place, no navigation | **Tab Bar** (this) | `role="tablist"` / `role="tab"` + `aria-selected` |
| Navigates to another screen | **Segmented button group** (`.segmented`), *or* Tab Bar where Figma composes one — see below | `<nav>` + `aria-current="page"` |
| Represents an open record in the workspace | **Page Tab** (`design-system/components/page-tab.md`) | `<nav>` + `aria-current`, closable |
| Scrolls to a section already on the page | **Anchor navigation** (`design-system/components/anchor-nav.md`) | `<nav>` of in-page links + `aria-current="location"` |

Using `role="tablist"` for something that navigates is an accessibility defect,
not a styling choice — see `design-system/patterns/item-listing.md`.

**The MDM project record frames compose a Tab Bar for screen navigation**, not a
segmented group: the four project screens sit in a `Tab Bar` instance inside
`Page Header`. That is the product's source of truth, so the implementation keeps
the Tab Bar's appearance and gives it navigation semantics (`<nav>` + links). What
is unresolved is the design-system intent — whether those four tabs should have
been drawn as `.segmented`. That is a designer decision, recorded in Known Gaps;
it is not something an implementation can settle by picking different markup.

## Anatomy

- **Bar** — 1px bottom rule (`#E5E5E5`) spanning its full width. The surface
  above that rule depends on the `Type` variant.
- **Tab item** — 40px tall, 16px horizontal padding, 8px internal gap, label
  only (no icon or badge in this component).
- **Indicator** — a 1.5px bar in `Brand/500` under the active tab only, sitting
  on top of the bar's bottom rule. The active tab's label row is 38px so the
  indicator fits inside the 40px item without shifting the label.

## Variants

### Bar — `Type`

| Variant | Treatment |
|---|---|
| `Default` | Bar fills with `bg/primary` (white). Use over a plain page. |
| `Transparent` | Bar has **no fill**; the page background or wash shows through. The bottom rule is unchanged. Use when the page carries a gradient — see `design-system/patterns/item-listing.md`. |

The two variants are otherwise byte-identical: same height, padding, label
colours, indicator and rule. Only the bar's own fill differs.

### Tab item — `state`

| State | Treatment |
|---|---|
| `True` (active) | Label `Brand/500` (#A67038), 1.5px `Brand/500` underline. |
| `False` (inactive) | Label `#667085` in the component set, `#737373` in every product instance — see Known Gaps. No underline. |

**Weight does not change between states** — both are `Text sm/Semibold` (600).
Only colour and the indicator differ. Do not add a weight change; it causes the
row to reflow as the selection moves.

## States

- Active / inactive as above.
- Hover and focus visible on every tab.
- Disabled, when a panel is unavailable — not specified in the source.

## Tokens

| Role | Token | Figma source |
|---|---|---|
| Item height | `--utui-tab-bar-height` | 40px |
| Item horizontal padding | `--utui-tab-bar-padding-x` | `px-[16px]` |
| Bar background (`Default`) | `--utui-tab-bar-bg` | `bg/primary` → `bg-surface`, exact |
| Bar background (`Transparent`) | none — `.tabs--transparent` clears the fill | no fill in source |
| Bar bottom rule | `--utui-tab-bar-border` | `border/primary` → `border-default`, exact |
| Inactive label | `--utui-tab-bar-text` | instance `#737373` → `text-tertiary`; set says `Gray/500`, see Known Gaps |
| Active label | `--utui-tab-bar-text-active` | `Brand/500` → `brand-500`, exact |
| Indicator colour | `--utui-tab-bar-indicator` | `Brand/500` → `brand-500`, exact |
| Indicator thickness | `--utui-tab-bar-indicator-height` | 1.5px |

Every value maps onto an existing tier — this component introduces no pinned
literals.

## Layout Contract

- Tabs sit flush against each other with **no gap**; spacing comes from each
  item's 16px padding.
- The bar is a single row and does not wrap. If tabs exceed the width, scroll
  the bar rather than wrapping to a second line.
- **Scrolling above `md` is opt-in: `.tabs--overflow`.** The default bar scrolls
  only from `md` down (`styles/responsive.css`), which was written when three
  tabs were the only case and three tabs always fit a desktop width. A bar with
  more tabs than fit at `xl` adds the modifier; the existing three-tab record
  bars do not, and are unchanged. Added 2026-09-16 for the company record's six
  tabs, under ADR 0008 — a shared contract is extended by an opt-in variant, not
  forked.

  **The width that needs it is the `xl` floor, not the design width.** Measured:
  those six tabs fit 1440 with ~50px spare and overflow at 1280, where the
  content region is 952px against ~1067px of tabs. A bar checked only at its
  frame's width will look fine and clip the last tab on a 1280 laptop.

  The variant keeps a **thin scrollbar** where the `md` rung hides it. That rung
  hides it because a touch strip is swiped and its edge fade already says there
  is more; a desktop bar has no swipe, so hiding it leaves a mouse user with no
  signal at all. The difference is deliberate.

  It needs no `tabindex`, unlike a scrolling table wrap: every tab is an `<a>`,
  so tabbing moves through them and the browser scrolls each into view.
- The indicator is rendered as the item's bottom border so it overlays the bar's
  own rule; total item height stays 40px with `box-sizing: border-box`.

## Usage

Use Tab Bar for the sibling views of one record — detail / owner / hierarchy /
documents on a project, for example. Keep labels to one or two words.

Do not put counts, icons, or close controls in it; those belong to other
components. Whether each view is a panel of this page or a screen of its own
decides the semantics below — the appearance is the same either way.

## Accessibility

Two cases, and the markup must match which one the bar actually does.

**Screen navigation** (the only implemented case, and what Figma composes on the
project record):

- The bar is a `<nav>` with an `aria-label` naming the group of screens.
- Each tab with a target is an `<a href>`; the current one carries
  `aria-current="page"` and is a self-link.
- A tab whose screen does not exist yet is a `<button type="button">` that
  shows a notification on activation — focusable and operable, unlike the `<span
  aria-disabled="true">` this was earlier on 2026-08-12. **No screen in the project record renders this
  case as of 2026-08-13**; it is kept in the contract for the next bar that has
  an unbuilt tab (`item-detail.html` still has one).
- Focus order is DOM order; the links have no roving focus, and any buttons among
  them are just later stops in that same order — not a separate widget with its
  own focus model.

**Panel swapping** (specified, not built):

- The bar is `role="tablist"` with an `aria-label`.
- Each tab is `role="tab"` with `aria-selected`, and controls a panel via
  `aria-controls`; the panel is `role="tabpanel"`.
- Arrow-key roving focus between tabs is expected for a true tablist.

In both cases the active state is colour **plus** an indicator, so it does not
rely on colour alone.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Component CSS | `.tabs`, `.tabs--transparent`, `.tab`, `.tab.is-active`, `a.tab`, `.tab[aria-disabled]` in `styles/tab-bar.css` |
| Examples | The project record's section tabs, one bar per screen and identical apart from which tab is the `aria-current="page"` self-link: `screens/du-an/chi-tiet.html` (`Chi tiết dự án`), `screens/du-an/phan-cap.html` (`Phân cấp`), `screens/du-an/ho-so/danh-sach.html` (`Hồ sơ dự án`). All three render `.tabs--transparent` and every tab is an `<a href>`, so no screen's `.js` carries a tab handler. A fourth tab, `Chủ đầu tư` → `screens/project-investor.html`, was removed on 2026-08-19 with the screen behind it |

## Class Contract For Static HTML

The only implemented usage is **screen navigation**, so this is the contract that
exists. Each tab is one of exactly three things:

```html
<!-- The project record's three sibling screens, as rendered on
     du-an/chi-tiet.html. A fourth tab, `Chủ đầu tư`, was retired on
     2026-08-19 together with the screen behind it. -->
<nav class="tabs tabs--transparent" aria-label="Khu vực dự án">
  <!-- current screen: a self-link, so aria-current has something to sit on -->
  <a class="tab is-active" href="./chi-tiet.html" aria-current="page">Chi tiết dự án</a>
  <!-- the other two screens -->
  <a class="tab" href="./phan-cap.html">Phân cấp</a>
  <a class="tab" href="./ho-so/danh-sach.html">Hồ sơ dự án</a>
</nav>
```

The third case — a tab whose screen does not exist — is no longer rendered on the
project record but is still part of the contract, because `item-detail.html` has
one. It is a real control with feedback on activation, never a link to `#`:

```html
<!-- no screen yet: a real control, with feedback on activation -->
<button class="tab" type="button" data-tab="phan-cap">Phân cấp</button>
```

Why each choice:

- **`<a href>` over `<button>` + handler, for a tab that has somewhere to go.**
  The control leaves the page, so the element that means "go somewhere" is the
  honest one: it gets middle-click, open-in-new-tab, a status-bar target and
  back-button behaviour for free, and it cannot silently do nothing. Nothing in
  `.tab` assumed a button — only `text-decoration` and the visited/link colour
  needed resetting.
- **A self-link for the current tab.** `aria-current="page"` belongs on a link;
  putting it on a `<span>` or a dead `<button>` announces "current page" on an
  element with no page semantics.
- **`<button type="button">` for a tab with no screen, not a link and not a
  `<span>`.** It has nowhere to send `href`, so a real `<a>` would need
  `href="#"` — which scrolls the page and claims a destination that does not
  exist — or `href="javascript:void(0)"`, which is worse. `<button disabled>`
  would announce a disabled control where the actual situation is "not built
  yet", a different, temporary thing. A plain, enabled button that shows the
  same "not in this demo" notification every other unfinished control in the package
  already uses is honest about which of those three it is, and it is focusable
  and operable — the `<span aria-disabled="true">` used for a few hours on
  2026-08-12 was neither. See Known Gaps for what this still doesn't cover.

**Do not resurrect the `role="tablist"` markup** this file used to show. There is
no panel-swapping tab bar in the package.

If one is ever built, it needs `role="tablist"` / `role="tab"` +
`aria-selected` + `aria-controls`, arrow-key roving focus, and a `role="tabpanel"`
per tab — and it must be a different composition from the one above, not the same
markup with different attributes.

## Known Gaps

- ~~The only remaining Tab Bar usage is screen navigation, so the tablist ARIA
  contract has no implementation at all.~~ Resolved 2026-08-12: the contradiction
  between this file's Class Contract and its own usage is closed. Both Tab Bar
  instances (`du-an/chi-tiet.html`, `du-an/ho-so/danh-sach.html`) are a `<nav>` of
  links, the Class Contract above now documents that, and the tablist markup is
  explicitly retired rather than left as the example.
- ~~**An "unavailable tab" is not a designed state.** One of the four project tabs
  (`Phân cấp`, down from two on 2026-08-12) still has no screen. Figma authors no
  such state, so a `<button class="tab">` looks exactly like an inactive tab — it
  just happens to show a notification instead of navigating. A sighted user gets no
  advance signal that this tab differs from "Hồ sơ dự án" until they click it. If
  the state is meant to be real (greyed, a `Soon` badge, a tooltip), it needs
  authoring; if not, it becomes a link as soon as its screen lands and the
  question disappears. `Phân cấp` has no source frame at all, so it will be the
  last one to answer this.~~ **Resolved 2026-08-13 for the project record**, by
  the second route this paragraph offered: `Phân cấp` turned out to have a source
  frame after all (`11142:42756`), it is built as `du-an/phan-cap.html`, and
  every tab on all four screens is now a link. The state was never authored and
  is now never rendered there, so the question closes rather than being answered.
  It is **not** resolved for the package: `item-detail.html`'s `Hồ sơ năng lực`
  tab is still a `<button class="tab">` with the same non-signal, so if a designed
  "unavailable tab" state is ever wanted, that bar is where the requirement will
  reappear.
- **Resolved 2026-09-30:** the "not built yet" message is now a notification, which is its own
  `role="status"` region (`notification.md`), so a screen-reader user hears it.
- Hover and focus-visible treatments are not defined in the Figma source. Focus is
  the shared `--app-focus` ring from `base.css`; note that at `md` and below the
  bar is a horizontal scroller, so a focus ring on the first or last tab can be
  clipped by `overflow-x: auto`.
- Overflow behaviour (more tabs than fit) is unspecified in the source. The bar
  scrolls horizontally from `md` down (`styles/responsive.css`) and
  neither scrolls nor wraps above it.
- **The `Chi tiết dự án` instance sets `Type=Default` but has no fill**
  (`fills: []`, bottom stroke only), so it renders identically to `Transparent`
  and is implemented as `.tabs--transparent`. Same class of set-vs-instance
  disagreement as the inactive label colour below.
- **The 1.5px indicator may round to a whole device pixel in some browsers.**
  Was 1.5px, moved to 2px on 2026-08-03 when the standalone `Tab Bar` component
  set measured 2px, avoiding the rounding question entirely. Reverted to 1.5px
  on 2026-09-29 per a re-read of the Page Header's embedded Tab Bar
  (`figma-page-header.md`), which draws 1.5px and is the PO-confirmed source of
  truth for this decision — the sub-pixel rounding risk this bullet originally
  raised is back and unmeasured on a real device.
- **The component set and its instances disagree on the inactive label.** The
  set (`10008:7762`) draws it from Untitled UI `Gray/500` (#667085), a
  blue-grey. Every in-product instance — including the `Tab Bar` inside
  `pat-listing` (`10254:53657`) — renders `#737373`, this package's
  `neutral-500`. The token follows the **instance**, per the precedent in
  `design-system/components/data-table.md`: where the design system and the composed
  component disagree, the thing the product actually composes with wins.
  Syncing to the set was tried on 2026-08-03 and reverted, because it made the
  screen diverge from its own source and shifted every other tab bar in the
  package. This is one instance of the broader Gray-vs-neutral ramp gap — see
  `design-system/patterns/item-listing.md`.
