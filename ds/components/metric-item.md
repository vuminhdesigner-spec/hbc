# Metric item

## Purpose

Metric item is the single-number summary tile: one labelled figure, optionally
qualified by a badge, and optionally carrying a tinted featured icon and an
overflow menu. A row of them gives aggregate context above a list or across a
dashboard.

Re-read 2026-09-04 against a redrawn source — see *Revision — 2026-09-04*. The
change indicator, the sparkline and the footer action row this contract used to
document are not parts of the component any more.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component | `Metric item`, node `9764:346`, 277 x 88 |
| Component key | `c3fd2cc8dc80dc8b69121fa84d9e309db1c7b89b`, library updated 2026-09-04 |
| In-product instance | MDM V2 `pat-listing` (`tS8dUB2qWLc28gZbtj8IIL`, node `10254:53657`) — an instance of the **superseded** set |
| Reviewed via | Figma MCP (`get_metadata`, `get_design_context`), 2026-09-04; the 2026-08-03 read was against the REST API |

This component supersedes the `Metric item` variant previously documented
inside `design-system/components/dashboard-kpi.md`, which was derived from a single MDM-file
instance rather than from the design system. See Known Gaps.

**The library holds two assets under this name.** The component set this
contract was written from (`Metric item`, key `cd2399e4b59ee05e7fd950164a226a7eb2d80c49`,
last updated 2026-08-05) still exists but its node `9764:348` no longer
resolves; the component above is a separate, later asset and is the one this
contract now describes.

## Variants

**No variant axes.** One component with two boolean properties:

| Property | Default | Effect |
|---|---|---|
| `icon` | on | Draws the featured icon in the bottom-right corner. |
| `dots` | off | Draws the 20px `dots-vertical` overflow menu, top-right. |

A `Badge` instance sits beside the number and is hidden in the component's own
default. The screens in this package draw `icon` on, `dots` on, badge off.

## Anatomy

277 x 88, 16px vertical / 20px horizontal padding, 12px radius, white surface
with `shadow-xs`, `overflow: clip`. The card is a row: one text column, plus two
absolutely positioned parts that do not participate in it.

1. **Heading and number** (column, gap 4px) — takes the remaining width:
   - **Heading** — `Text sm` medium 14 / 20, `text/secondary` `#344054`.
   - **Number and badge** (row, gap 16px) — the **Number** at `Display xs`
     semibold 24 / 32, `text/primary` `#101828`, then an optional
     `design-system/components/badge.md` pill.
2. **Featured icon** — a 48px tinted circle inside an 8px ring one ramp step
   lighter (64px overall, **fully round**, 24px glyph), pinned to the
   **bottom-right corner and offset out by the ring width**, so the ring is cut
   by the card's clip. The tint carries the tile's semantic tone.

   The radius read as 28px on 2026-09-04 and was published here and in the CSS
   as a literal until 2026-09-14. It is wrong on a 64px box: 28px is 43.75% of
   the side, so the chip drew as a squircle and the border pulled the inner
   fill's corners to 20px on a 48px box. `design-system/components/featured-icon.md`
   gives the shape as a full circle at every size, and the line above calls it a
   circle — the number described a node this box is not.
3. **Dropdown** — 20px `dots-vertical` overflow menu, inset 20px from the top
   and right edges.

Group gap between tiles is 24px.

## States

- Default.
- Change — **gone from the source as of 2026-09-04** and no longer documented
  here. It was already unconsumed: re-read 2026-08-14, **no** tile of either MDM
  listing frame drew one — `Metric group` 10471:24190 (`Danh sách dự án`) and
  10062:13740 (`Hồ sơ dự án`) are label + number on all five instances.
- Loading — skeleton, or omit the row. Owned by the composing pattern.
- Unavailable — the tile shows the label with no figure rather than blocking
  the page.
- Hover / focus on the overflow menu and on any footer action.

## Tokens

| Role | Token |
|---|---|
| Padding | `--utui-spacing-04` / `--utui-spacing-05` (16px / 20px); `--utui-spacing-04` on both axes at md and below |
| Min height | 88px |
| Heading/number gap | `--utui-spacing-01` (4px) |
| Number/badge gap | `--utui-spacing-04` (16px) |
| Menu inset | `--utui-spacing-05` (20px), both axes, at every tier |
| Radius | `--utui-radius-lg` (12px) |
| Surface | `--utui-color-bg-surface`, `--utui-shadow-xs` |
| Featured icon | 64px overall (48px fill + `--utui-featured-icon-ring`), `--app-radius-pill`, tinted by tone, offset out by the ring width |
| Heading | `Text sm`, medium, `--app-text` |
| Number | `--utui-font-size-display-xs` / `--utui-line-height-display-xs` (24 / 32), semibold, `--app-text` |

Tone tints for the featured icon follow the status ramps: brand-100,
green-100, blue-100, yellow-100, neutral-100 on their 600/700-level glyph.

This component introduces no new tokens.

## Usage

Use a row of 3–5 Metric items above a list to give count-based context, or on a
dashboard as the top summary band. Turn a part off rather than filling it with a
placeholder — a tile with no comparison to draw sets `icon` and `dots` and leaves
the badge slot empty; it does not render an empty qualifier beside the number.

Do not use Metric item for a single hero figure on its own, and do not put more
than one number in a tile.

**The row is one line at every tier.** It does not wrap and it does not step down
a column count: the tiles flex to fill the row and stop at
`--utui-metric-tile-min-width` (176px), past which the row scrolls sideways
inside itself with a `chevron_left` / `chevron_right` pair over its edges. See
Horizontal scroll below, and `.claude/skills/responsive/SKILL.md` § Metric rows.

**At md and below the strip compacts.** The count is still layout, so nothing
about it steps — what steps is the spacing, in `styles/responsive.css`:

| | xl / 2xl | md and below |
|---|---|---|
| `--utui-metric-tile-min-width` | 176px | 160px |
| `.metric-tile` padding | 16px / 20px | 16px |
| `.metric-item` padding (superseded tile) | 20px | 16px |

md and below is where the row always scrolls, so the drawn spacing is being
charged against a width the user is already paying a horizontal scroll for: 24px
each side of a 160px tile is 30% of the tile. A 160px tile keeps 120px of content
box against the 128px a 176px tile had, which costs no figure a line it was not
already going to lose, and buys most of a sixth tile of visible width.

sm gets the same composition as md — a second step would have to come out of the
figure's own type, and a tile whose number is smaller than the same number on the
next screen is worse than a tile with less air.

Compaction is not a substitute for hiding the region — that is now the app-shell
fullscreen mode's job (`ds/components/app-shell.md`); this is what the
strip looks like while it is *shown* at a width it was not drawn for.

## Horizontal scroll — 2026-08-14

**One line, at every tier, arrows to move along it.** The strip was a grid that
stepped 4-up → 2-up → 1-up (5 / 3 / 2 / 1 on the two 5-tile screens), with the
default ladder in `styles/responsive.css` and a copy in every screen that
changed the column count. It is now a non-wrapping flex row that scrolls sideways.

Why the ladder went:

- **A metric row is one comparison.** Stacked 1-up at 375px the five tiles were
  1036px tall — the entire viewport spent on context, no two figures readable
  together, and the data below reachable only by scrolling past all of it.
- **The tile count stopped being configuration.** `flex: 1 0
  var(--utui-metric-tile-min-width)` means a 4-up and a 5-up row need no
  modifier, no grid template and no per-tier rule, so `.metric-group--5` and both
  of its ladders are deleted. A missing rung in one of those copies is what
  pushed the page into horizontal overflow at 375px before 2026-08-11; the class
  of bug is gone, not fixed again.
- **The overflow is bounded.** The rule the package enforces is that the *page*
  never scrolls sideways. A scroller that owns its own overflow is how
  `.data-table-wrap` and `.media-gallery__strip` already comply.

The token is 176px because that is the widest minimum a 5-up row can carry and
still fit the 1088px baseline column (5 × 176 + 4 × 24 = 976), so at the design
width nothing scrolls and the row renders exactly as drawn — the arrows are
`hidden` there, not dimmed.

Anatomy: a `.metric-scroller` wrapper holds the strip plus two absolutely
positioned arrows, and is what the page grid lays out. The arrows are the strip's
siblings rather than its children so that they can be positioned against the
wrapper's edges; nothing applied to the strip reaches them.

The scrollbar is hidden, as on the gallery strip, so **the arrows are not
optional** — a screen that renders `.metric-group` without the wrapper leaves
swipe and the keyboard as the only ways across. The strip takes `tabindex="0"`
only while it actually scrolls (arrow keys then work on it directly) and drops it
again when the row fits, because a scroller with nothing to scroll is a focus
stop with nothing to do.

Both directions are drawn, where `design-system/components/media-gallery.md` draws `next` only:
that control overlays a photo whose edge still shows what is behind it, and this
one overlays a figure. A scrolled strip with no visible way back is worse than
the 40px it costs.

Open question for design: no frame specifies this. The source draws the row at
1440 only, where it fits, so the arrows, the 176px minimum and the disabled-at-
the-ends treatment are all implementation decisions recorded here.

## Scroll collapse — shipped 2026-08-14, removed 2026-08-15

The strip used to collapse out of view on scroll and return at the top. It is
gone: the script (`scripts/metric-collapse.js`), its CSS block, its three
`--utui-metric-group-collapse-*` tokens and the `:root:has(.metric-group) {
overflow-anchor: none }` opt-out have all been removed, and no screen loads it.

Recorded so it is not re-proposed as new. What it cost, against what it bought:

- **What it bought shrank to one tile's height.** The rule was written when the
  strip stacked 1-up and was 1036px at `sm`. The one-line strip landed the same
  day (see *Horizontal scroll — 2026-08-14*) and left it saving 188px.
- **It was inert where it was measured to matter least and fired where the page
  was already long.** A collapse that leaves its scroll container unscrollable
  reverts the user's own gesture, so it had to be refused — which on
  `project-list` meant every desktop tier.
- **It moved everything below it, overlays included.** The fixed filter panel and
  the row menu each needed a `ResizeObserver` handshake to stay attached to their
  triggers, and keyboard focus needed a `scrollIntoView` compensation on
  `focusout` because collapsing lifted the newly focused element by the strip's
  full height.
- **It had no Figma source, no announced state and no way back but `scrollTop
  0`.** A labelled region ceased to exist with no control to hang
  `aria-expanded` on.

`project-docs` pinned its filter toolbar instead (`.docs-filter`), on the same
principle: pin what is needed, do not hide what is there.

**Superseded 2026-08-16 by a disclosure, itself superseded 2026-09-28 by the
listing page's fullscreen mode.** The toolbar's pinning came off with the
listing pages' move to a fixed viewport (`design-system/components/app-shell.md`) —
on a page that does not scroll there is nothing to pin against. Read the four
bullets above as what makes a collapse wrong, not as a ruling that the row must
always be visible: every one of them is about a hide the user did not ask for.

**No per-region collapse control since 2026-09-28.** `.metric-region` had a
disclosure (`.metric-region__head/__toggle/__panel`, `scripts/metric-disclosure.js`)
that hid the strip in place and gave its height to the table. It is gone —
replaced by the listing page's fullscreen mode
(`ds/components/app-shell.md` § Fullscreen mode), which hides the
whole metric region (and the side nav and tab strip) at once. Do not re-propose
a region-local collapse; that decision now belongs to app-shell.

## Accessibility

- The heading and the number must be associated — render them in one labelled
  region per tile, not as two loose spans.
- The overflow menu is a real `<button>` with an accessible name that includes
  the tile's label (e.g. "Tùy chọn Tổng số hồ sơ"), because several identical
  menus appear in one row.
- The KPI row should be a labelled landmark separate from the list region below
  it.
- Once the row scrolls, it must be reachable and traversable without a pointer:
  the strip takes `tabindex="0"` while it overflows (arrow keys scroll it) and
  each arrow is a real `<button>` naming the direction in words, not a glyph
  alone — `Xem các chỉ số trước đó` / `Xem các chỉ số tiếp theo`.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.metric-tile`, `.metric-tile__icon/__menu/__body/__label/__figures/__value` in `styles/metric-item.css` |
| One-line strip | `.metric-group` (flex, `overflow-x: auto`, `scroll-behavior: smooth`) and `.metric-scroller`, `.metric-scroller__arrow--prev/--next` in `styles/metric-item.css`; behaviour in `scripts/metric-scroll.js` (`window.OmeuMetricScroll`) |
| Region | `.metric-region`, `.metric-region[hidden]` in `styles/metric-item.css`. No collapse control of its own — hiding the whole region is the listing page's fullscreen mode, `ds/components/app-shell.md` |
| Icon tones | `.metric-tile__icon--success/--info/--warning/--neutral` in `styles/metric-item.css` — the tint carries the tile's semantic tone |
| Loading | `.metric-tile--loading .metric-tile__skeleton` in the same file: the figure becomes a 64px bar at the display-xs line height so the strip keeps its height, and the label and icon stay drawn. No screen in the package renders it |
| Superseded tile | `.metric-item`, `.metric-item__head/__label/__icon/__value` and `.metric-item__icon--success/--neutral/--error`, still declared in the same file for `design-system/components/dashboard-kpi.md`. No consumer since `screens/item-listing.html` was deleted — see Known Gaps |
| Strip tokens | `--utui-metric-tile-min-width`, `--utui-metric-group-arrow-size` |
| Coarse-pointer hit area | `.metric-scroller__arrow::after` in `styles/responsive.css` — the 40px circle keeps its drawn size and the hit area grows to `--utui-touch-target-min` |
| Example | `screens/du-an/ho-so/danh-sach.html` and `screens/du-an/danh-sach.html`, rendered by their own bundles |

`.metric-tile` implements the whole component: `icon` on is the base rule,
`dots` on is `.metric-tile__menu`, and the badge slot is `.metric-tile__figures`
taking a second child.

**A consumer that re-renders its tiles owns the `refresh()` call.**
`window.OmeuMetricScroll.refresh()` re-reads the scroll width, so the arrows'
hidden and disabled states match the tiles that are actually there; it also has a
`ResizeObserver` on the strip as a backstop, so a screen that forgets the call
degrades to one frame late rather than to wrong controls. Any screen whose KPI
values follow a filter is in this position on every keystroke —
`screens/du-an/danh-sach.js` calls it at the end of `render()`. That screen
also captures and restores the scroll offset around the re-render, because the
row count changes under a *focused* search input.

This is the shape both listing screens render — number only, no change group:

```html
<article class="metric-tile">
  <span class="metric-tile__icon metric-tile__icon--success" aria-hidden="true">…</span>
  <button class="metric-tile__menu" type="button" aria-label="Tùy chọn Đã nộp lưu trữ">…</button>
  <div class="metric-tile__body">
    <span class="metric-tile__label">Đã nộp lưu trữ</span>
    <div class="metric-tile__figures">
      <strong class="metric-tile__value">850</strong>
    </div>
  </div>
</article>
```

## Known Gaps

- **Two competing "Metric item" definitions existed in this repo.**
  `design-system/components/dashboard-kpi.md` documents a 251 x 122 tile with 20px padding, a
  40px icon on the *right* of the label and a 30px value, sourced from MDM
  instance `10009:56207`. No variant in this design system set matches that
  geometry. The design system is the authority, so this contract supersedes it;
  `dashboard-kpi.md` now cross-references here. The legacy `.metric-item` CSS
  class was never migrated, and the screen that rendered it
  (`screens/item-listing.html`) has since been deleted — so the block in
  `styles/metric-item.css` now has **no consumer at all**. Deleting it, and the
  spec `dashboard-kpi.md` retains for it, is the open follow-up.
- **`.metric-tile__icon` re-implements `featured-icon.md`.** `styles/featured-icon.css`
  already carries the sized, ringed, tone-tinted circle as `.featured-icon`
  (`--sm`/`--lg`/`--ring` and the `--featured-icon-*` custom properties), and
  this class hand-rolls the same thing with its own tone modifiers. It was left
  alone in the 2026-09-04 re-sync because switching would rewrite the tile
  markup in `screens/du-an/danh-sach.js` and `index.js`, not just the CSS —
  and the corner offset and the clip are Metric item's, not the shared
  component's. Fold the fill and the ring into `.featured-icon` and keep only
  the positioning here.
- **The badge slot has no CSS.** `.metric-tile__figures` is a flex row with the
  right gap, but nothing styles a `design-system/components/badge.md` pill inside
  it and no screen draws one. Add it when a screen asks.
- **`--utui-metric-tile-min-width` is 176px against a 277px source tile.** The
  featured icon overlaps the text column by 36px, so `.metric-tile__body`
  reserves 44px on its inline end and a 176px tile is left ~92px of text. That is
  enough for the five labels both listing screens draw, and it is the min-width —
  not the reserve — that should move if a longer label lands. The source's own
  24px gap between text and icon would leave 76px and is not affordable at this
  min-width.
- No hover or focus treatment is authored on the tile itself in Figma; only the
  overflow menu and footer actions are interactive.
- **The tile overflow menus are focusable, named, and unwired.** No handler is
  bound in either bundle, so a strip the user has scrolled sideways past holds
  controls that are reachable only by scrolling back — harmless while they do
  nothing, a `.claude/skills/responsive/SKILL.md` § Principles (4) problem the moment they are wired.
  Revisit before that change lands, not after.
- ~~V2 still has no motion scale, and there is now one control that needs one~~
  Resolved 2026-09-28: `.metric-region__panel`'s two literal durations shipped
  2026-08-16 for the region's own collapse went with it, removed along with the
  disclosure (see *Scroll collapse*). `styles/notification.css`'s "no
  transitions in this package" is true again for this component.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/metric-item.md`](docs/revisions/metric-item.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-09-04 (source redrawn: the tile is 88px)
- 2026-08-12 (`pat-listing` re-read)
- 2026-08-22 (O2/D21 answered: the caller lost its strip)
- 2026-09-05 (the detached disclosure, and no kebab)
