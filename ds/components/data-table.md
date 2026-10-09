# Data Table

## Purpose

Data Table displays dense operational records with sorting, selection, and
row-level actions. Its row content is composed from **table cells**, each of
which has a defined style, an optional supporting line, and its own states.

## Source

| Item | Value |
|---|---|
| Cell style vocabulary | OMEU Design System V2, file `SFo9P9PCVQiuOk2SqjZYKQ`, `Table cell` set, node `1222:107305` |
| Reviewed cell variants | `Lead text` (`1222:107304`), its Hover state (`1222:107386`), `Avatar` (`1227:123054`) |
| Variant set audited | `Table cell` (`1222:107305`), whole set enumerated 2026-09-16 — 33 `Style` values × `Supporting text` True/False × `State` Default/Hover/Disabled/Selected |
| **Table geometry and behaviour** | MDM V2 file `tS8dUB2qWLc28gZbtj8IIL`, `Table`, node `10007:17211` |
| Reviewed table parts | `Table header cell` (`10004:14387`), lead `Table cell` (`10004:14726`) |
| **DS `Table header cell` set** | OMEU Design System V2, `SFo9P9PCVQiuOk2SqjZYKQ`, node `1221:107933` — `Text` × `Checkbox` × `Color` (White / Gray) = **8 variants**, plus two sub-axes on its label (`Arrow`, `Help icon`). All eight read 2026-09-04; see *Revision — 2026-09-04* |
| Fixture | `table-header-cell-states.html`, **removed 2026-09-23** (ADR 0011). It instantiated the eight header variants with local parts and was the only place in the package where a select-all header cell existed; there is no such place now |
| Cell set re-synced | 2026-08-03; full variant list re-read 2026-08-19 — see Revision History |
| Variants read directly, 2026-08-19 | `Edit` (`10191:6072`, `10191:6056`) and its atom `Input field` (`10191:92862` / `10191:92874` over `Input with label` `9825:56087`); `Lead icon radio button` (`1224:6279`, `1224:6275`) and its Selected state (`10328:81`) |
| **Assembled table** | OMEU Design System V2, file `SFo9P9PCVQiuOk2SqjZYKQ`, `Table` component set, node `1227:110587` (3350 × 3277) |
| `Table` set axes | `Example` (Team members / Sales / Companies / Files) × `Breakpoint` (Desktop / Mobile) × `Dividers` (Divider line / Alternating fills) = **16 variants** |
| `Table` set variants read directly, 2026-08-20 | `1227:110480` (Team members / Desktop / Divider line), `1229:12388` (Team members / Desktop / Alternating fills), `1227:110588` (Team members / Mobile / Divider line), `1229:2364` (Files / Desktop / Divider line). `Example=Sales` and `Example=Companies` — 8 variants — were **not** read |
| `Table` set synced | 2026-08-20, the `Dividers` axis — see *Revision — 2026-08-20 (the DS `Table` set)* |
| Reviewed via | Figma Desktop Dev Mode MCP (`get_metadata`, `get_variable_defs`, `get_design_context`, `get_screenshot`), 2026-07-28 |

The cell set is organised on three axes: **Style** × **Supporting text**
(true/false) × **State** (Default/Hover/Disabled).

**Three Figma sources, and which one wins.** The Untitled UI `Table cell` set
defines the *style vocabulary* (what a Lead text / Avatar / Badge cell is). The
`Table` component set is the same DS one tier up — the *assembled* table, i.e.
what a card header, a header row, ten body rows and a pagination footer look
like together, and the only source that states the `Dividers` axis. The MDM V2
`Table` defines *how this product's table behaves* — header geometry, row height,
footer, and text wrapping. Where they disagree, the MDM V2 table wins, because it
is the component the product composes with. The wrapping rule below is one case
where they do; *Divergences from the DS `Table` set* lists the rest.

## Anatomy

- Table panel.
- Header row.
- Optional selection checkbox.
- Body rows, composed of table cells.
- Footer slot — page navigation, utility actions, and result count are owned by
  `design-system/components/pagination.md`, not by this component.

### Cell base

Every cell variant shares the same shell:

| Property | Value | Token |
|---|---|---|
| Height | 56px — a minimum, see *Wrapping* | `--utui-table-row-height` |
| Padding | 12px vertical, 16px horizontal | `--utui-table-cell-padding-y`, `--utui-table-cell-padding-x` |
| Bottom border | 1px `Neutral/200` | `--utui-table-border` |
| Internal gap | 12px | `--utui-table-cell-gap` |
| Type | `Text sm` — 14px / 20px | `--utui-font-size-text-sm`, `--utui-line-height-text-sm` |

### Header cell

| Property | Value | Token |
|---|---|---|
| Height | 44px | `--utui-table-header-height` |
| Padding | 12px vertical, 16px horizontal | `--utui-table-header-padding-y`, `--utui-table-cell-padding-x` |
| Background | White — one of the DS set's two `Color` values, not a divergence from it | `--utui-table-header-bg` |
| Type | `Text xs/Medium` — 12px / 18px, weight 500 | `--utui-font-size-text-xs`, `--utui-line-height-text-xs` |
| Colour | `Neutral/600` | `--utui-table-muted-text` |
| Wrapping | Never wraps | — |
| Bottom rule | 1px `Neutral/200`, drawn as an **inset shadow** | `--utui-table-border` — see *Sticky column headers* |

Every one of those is DS-exact against the `Table header cell` set (`1221:107933`)
except the inline padding and the label colour, both of which are decisions with
reasons — divergences 11 and 4 below.

**The `Color` axis, and what the package's white header actually is.** The set is
`Text` × `Checkbox` × `Color`, and `Color` takes `White` (`bg/primary`
`#FFFFFF`) or `Gray` (`Neutral/50` `#FAFAFA`). Nothing else changes between the
two — same height, same padding, same type, same rule. So the local header is the
set's `Color=White` member rather than a departure from a grey default, which is
what divergence 3 used to imply, and adopting `Color=Gray` costs one token
repoint (`--utui-table-header-bg`) and no new rule. Measured: the fixture's grey
panel does exactly that, and its four header cells differ from the white panel's
in `background-color` alone.

**The checkbox slot.** `Checkbox=True` in four of the eight variants puts the DS
`_Checkbox base` — 20px, 6px radius, 1px rim, white fill — at the head of the
cell with a **12px gap** to the label. The package builds that with no new CSS:
`.cell-select` is already the `auto minmax(0, 1fr)` grid at
`--utui-table-cell-gap` (12px, the same value), it is element-agnostic, and it
works inside a `<th>` unchanged — verified in the fixture, where the header's
`.cell-select` computes to `grid` / `gap: 12px` / `20px …`. `Checkbox=True,
Text=False` is the bare selection column: a `th` whose only child is the control,
whose `aria-label` carries the name because there is no visible label to carry
it.

**Nothing in the package selects rows yet**, so both compositions exist only in
the fixture. That is the same gap `snack-bar.md` records from the other end — the
selection action bar is built and has no consumer because no table has a
checkbox column. See *Known Gaps*.

**`Text=False, Checkbox=False` is 68px wide and empty**, which is the DS's own
statement of the action-column header this package already ships at 68px. The
column head stays silent (a `.sr-only-label` names it); the name of each action
lives on each row's control.

**Two affordances the set draws and the package does not build.** The label is
itself a component with an `Arrow` axis (16px `arrow-down`, 4px gap,
`fg/secondary` `#404040`) and a `Help icon` axis (16px `help-circle`, `False` in
every variant of this set). Neither has any CSS here and no table has `aria-sort`
or a sort behaviour behind it. A header that showed a sort arrow while sorting
nothing would be a lie, so both are recorded in *Known Gaps* with their
measurements instead.

### Cell progress and row detail — added 2026-10 (AUTHORED, no frame)

First consumer: `screens/du-an/ho-so/danh-sach.html` `#importDrawer` step 3, where each row uploads several files. Columns: disclosure (frozen), `Dòng n` (frozen identity), `Tên hồ sơ`, `Nội dung hồ sơ/Trích yếu`, `.cell-progress`, then the `Thêm tệp` text-link CTA. Step 4 of the same drawer has no files column; its status badge is only `Thành công` / `Thất bại` (with the reason); its table is `data-table--clip`, not frozen, with an `empty-block` when a result filter has no rows.

**`.cell-progress`** — one aggregate per row, summed by bytes, not per file: `.progress-bar` (role `progressbar`, `aria-valuetext` in words, `aria-label` naming the row) over `.cell-progress__line` = `.cell-progress__text` (`Đang tải 1/3 tệp`) **only while running**. Done is a `badge--sm badge--success badge--icon-left badge--no-dot` (`check_circle`, `Đã tải 3 tệp`), failed a `badge--sm badge--error …` (`error`, `Không tải được n tệp`); no bar. `Hủy` / `Thử lại` are not in this cell, they sit in the CTA column. A row with nothing yet shows the table empty cell `.cell-empty` (`—` + sr-only `Không có`, see *A table's empty cell*) instead of a bar. Clicking the cell (pointer) toggles the row detail like the disclosure `.cell-action` (USER DECISION 2026-10); the chevron stays the keyboard path, so the cell takes `cursor: pointer` only while the toggle is enabled. A rejection message is a `.form-field__error` in the same cell. No file-type icon or size at row level.

**`.row-detail`** — a `<tr class="row-detail" id hidden>` right under its row, one `<td colspan>` across all columns, holding the row's detail (here an `attachment-list`, so each file can be removed and shows its own state). The row opens it with a disclosure `.cell-action` (`aria-expanded`, `aria-controls` the detail row's id); the detail row is `hidden` while closed. Under `--frozen-action` the detail cell is released from the sticky pane (`tr.row-detail > :first-child`: static, no seam). Consumer may open the detail on its own after a user action that adds content (step 3: adding files open it; a single refused file with no files yet does not), then scrolls it into view (`block: "nearest"`, no smooth scroll under `prefers-reduced-motion`). Step 3 opens one row at a time (accordion): a detail closes only when the user toggles it, another row opens, or the row has no files left — never when uploads finish. Naming files here is the detail's job, not a listing's. The detail follows the visible area: when the wrap holds a `.row-detail`, `.data-table-wrap` gets `container-type: inline-size` (only then) and the cell's first child is `position: sticky` with `inline-size: calc(100cqi - 2 × cell padding - scrollbar size)` (`cqi` includes the vertical scrollbar gutter; with no vertical scroll the card ends one scrollbar width short of the right edge), so a horizontally scrolled table does not cut the card (the cell is `overflow: visible` for this).

**Text-link CTA in the last column (USER DECISION 2026-10):** a row-level action that must read as an action, not an icon, is a plain `.button.button--link` in its own last column (no header text: `.sr-only-label`; fixed `col`, the column before it takes the surplus). The column may hold two links side by side in `.cell-links` (flex, `--utui-spacing-04` gap, `justify-content: flex-end` so the CTA always sits on the right edge): `Hủy` (`.button--link-gray`) or `Thử lại` (`.button--link`) first, then the CTA; the CTA is `Thêm tệp` in every state. When the first link disappears, focus on it moves to the CTA. The accessible name must contain the visible label (WCAG 2.5.3): `aria-label="Thêm tệp cho {mã}"`. One label in every state, so focus stays on the link. On a table that scrolls horizontally the column is kept in view with `.data-table--frozen-end` (below).

**Disclosure column:** the row-detail disclosure is the only control in the first column, so it is one `.cell-action` (68px column, default `--frozen-identity-offset`). The detail's `attachment-list` uses `attachment-list--grid` (`ds/components/attachment-list.md`).

### Row header cell

A `<th scope="row">` — the cell that carries the row's identifier and makes
`CÔNG TY …, Ngày kết thúc đầu tư, 22/12/2026` announceable instead of leaving a
screen reader to read four unlabelled values.

Three tables ship it: `.cell-phase` and `.cell-company` on
`screens/du-an/chi-tiet` since 2026-08-19, and the archive queue's `Tên hồ sơ`
column since 2026-08-27 — fifteen columns being thirteen unlabelled values per row
without it. Both frozen-column rules select `tr > :first-child` and
`tr > :nth-child(2)`, which are element-agnostic, so a table may freeze its identity
column and make it a row header at the same time.

**It is a cell of the BODY, so it takes the *Cell base* above and not the
*Header cell*.** Type is `Text sm` 14/20, height is the 56px row minimum, padding is
12/16, colour is `--utui-table-cell-text` and weight is Regular — the last of
those also resetting the UA's bold, so no consumer has to reset it for itself.
Nothing of the column header applies to it: not the 44px height, not
`Text xs/Medium`, not `--utui-table-muted-text`, and not the sticky positioning
below.

Two things it *may* override, both because it is an identifier rather than a
value:

| Property | Row header | Why |
|---|---|---|
| Weight | `Text sm/Medium` via `--utui-table-cell-lead-weight` | Only when the cell is `Style=Lead text`. `Style=Avatar` keeps Regular — see *Cell Styles* |
| Wrapping | Wraps, and clamps at two lines | The identifier column must never truncate — see *Wrapping* |
| Wrapping, one-line opt-in | `.data-table--clip` (`ds/components/table-settings.md`'s `Giới hạn ký tự` toggle) truncates to one line instead, with `data-tooltip-overflow` recovering the string — `ds/components/tooltip.md` | A reader chose density over the wrap-never-truncates default; the string still has to be reachable, just not always visible — see *Wrapping* |

**Why this section exists.** Until 2026-08-19 `styles/data-table.css` scoped the
header rule as `.data-table th`, which claimed row headers too, so a row header
rendered at 12/18 in the muted colour at the header's 44px — the row's
load-bearing string was the smallest text in its own row. Two consumers disagreed
about whose bug that was: `.phase-table .cell-phase` restated the cell base to
compensate and `.investor-table .cell-company` did not, which is how the
`Chủ đầu tư` dialog shipped its company names two steps down from the dates beside
them. The rule is `.data-table thead th` now — (0,1,2) against the `th, td` rule's
(0,1,1), so the column header still wins where it should and nothing is
escalated — and a consumer that restates the cell base on a row header is
restating the default and can drop it.

### Sticky column headers

The header row stays pinned while rows scroll. Three things are required, and
each of them is a trap worth knowing:

1. **The scroll container must be bounded.** `.data-table-wrap` is already a
   scroll container because of `overflow-x` (needed for the 2294px width), so a
   sticky `thead` sticks to *that box*, not the viewport. Without a
   `max-height` the box never scrolls and the sticky header does nothing.
2. **`border-collapse: separate`.** A sticky `th` does not paint reliably over
   scrolling rows in collapsed-border mode. Only bottom borders are set, so
   nothing doubles up under `separate`.
3. **The header rule is an inset shadow, not a border.** A border on a sticky
   element leaves a seam its own background does not cover.

The pagination footer sits outside the scrolling wrap, so it stays visible
while rows scroll.

### The action column leads, and it is frozen

**A row's icon actions are the FIRST column of the table, and that column stays
put while the table scrolls sideways.** Both halves are the rule: a leading column
that scrolls away with everything else is no better than a trailing one on a table
wide enough to need scrolling. Decided 2026-08-22.

**Why leading.** These tables are wider than any viewport this package targets —
2294px, 2800px, 3231px against 1024–1440 — so horizontal scrolling is the normal
state here, not an edge case, and **whatever sits last is unreachable until the
operator goes looking for it**. A row's actions are not a detail at the end of the
record; they are how the operator acts on the row they have just identified, so
they belong beside the cell that identifies it.

**Why frozen.** `position: sticky; left: 0` inside `.data-table-wrap`, with an
**opaque** background — the rows underneath slide behind this cell, so a
transparent one lets their text read through the icon. It pairs with the sticky
`thead` above: the header freezes vertically, the action column freezes
horizontally, and their intersection — the corner cell, sticky in both axes at
once — has to outrank each of them or whichever wins overlaps it. The right edge is
a `box-shadow`, not a border: a border would take part in the table's own border
collapse and shift every column by a pixel.

**The frozen header cell carries TWO shadows in one declaration, and that is a
trap.** The header's own bottom rule is an inset shadow (see *Sticky column
headers*) and `box-shadow` does not accumulate across rules, so a frozen corner
cell that sets only its seam drops the divider and leaves a visible break in it.
Every frozen header cell therefore restates both in one declaration — and because
it is one declaration, **an unresolvable `var()` anywhere in it voids the whole
thing**, not just that value. All four of these rules cited a token that was never
defined until 2026-09-16, so every frozen header cell computed `box-shadow: none`
and lost its divider and its seam together, on two screens, for three weeks. If a
frozen header looks unruled, check the token resolves before you check the rule.

| | |
|---|---|
| Opt-in class | `.data-table--frozen-action` on the `<table>` |
| Cell | one `.cell-action` per control — `<button>` or `<a>`, both take the class |
| Column head | silent: a `<th scope="col">` whose only child is an `.sr-only-label`. This is the same blank the DS draws as `Text=False, Checkbox=False` — see *Header cell* |
| Accessible name | on each row's control, never on the column head |
| Column width | the consumer's `colgroup`, sized from the control count: **68px for one control**, 72px where a consumer restates the 16px pad on a single control (`du-an/phan-cap`'s chevron), **116px for a pair**, and `n × 40 + (n − 1) × 4 + 2 × pad` beyond that. `--utui-table-cell-action-size` is 40px, `--utui-table-cell-action-gap` 4px |
| Which pad applies is decided by the MARKUP | `td:has(> .cell-action)` gives 14px (`--utui-table-cell-single-action-padding-x`) and `td:has(> .row-actions)` gives 16px (`--utui-table-cell-action-padding-x`). Both use the child combinator, so **a lone control wrapped in `.row-actions` silently takes the pair's 16px**. Author one control as a direct child of the cell and a pair inside the wrapper — `screens/doi-tac/ho-so-nang-luc.html` carries both, one table each |
| Watch the table's total | a column set that drops under `.data-table`'s shared 1180px floor is stretched, and a stretched table redistributes the surplus **proportionally** — which silently renders a 68px action column at 70px. Size the other columns so the authored total clears the floor |

**The last column freezes too: `.data-table--frozen-end`.** USER DECISION 2026-10: freeze the last column, for a row-level CTA that must not scroll away. fe-dev chose the rest: the name `-end` (positional, logical end, like Ant Design Table `fixed: 'right'`; `-action` / `-identity` name the first two by role), the mechanism and `frozen-end.js`. Separate opt-in on the `<table>`. Mechanism: body `tr > :last-child` is `position: sticky; right: 0` with an opaque surface background; the header cell (already sticky on top) also takes `right: 0` and `z-index: 3` over body cells `2`. Row tints (hover, `is-current`, `is-editing`, `is-selected`) are restated for the frozen cell because its base rule out-ranks the row rules. The seam (`-1px` shadow, `--utui-color-border-subtle`) appears only while columns are hidden behind it: `ds/scripts/frozen-end.js` sets `.has-hidden-end` on the `.data-table-wrap` from scroll position and size (observes added/removed wraps only, ResizeObserver + scroll for geometry), so a table that fits (1440) shows no seam. `.row-detail` is excluded, so its colspan cell is never covered; z-index 2/3 sits below the tooltip (`--utui-tooltip-z`) and equals `--frozen-action` / `--frozen-identity`, which are on the other edge and cannot meet it. Consumer: `#importDrawer` step 3. The script must be on the page.

**The second freeze is the identity column.** A frozen action column beside a name
that has scrolled away is an action with no subject, so the cell that identifies
the row freezes with it — `.data-table--frozen-identity`, a **separate** opt-in,
with the consumer setting `--frozen-identity-offset` to the action column's width.
Both rules select `tr > :first-child` and `tr > :nth-child(2)`, which are
element-agnostic, so a table may freeze its identity column and make it a
`<th scope="row">` at the same time. The seam sits on the right of the pair, not
between the two.

**Two frozen columns is the ceiling.** These are 1024px viewports minus a 64px
rail; a third leaves nothing to read beside it. The identity freeze is released
below 1440px for the same arithmetic — the scroll window beside the 371px pair is
165px at 1280 and negative at 375 — on a breakpoint the responsive ladder does not
permit. Read the *Known gap* before relying on this half.

**Opt-in, and the exemption is measured rather than asserted.**
`screens/du-an/phan-cap.html` keeps a trailing 72px chevron. It is a tree table
and 1087px wide, which **fits at 1440** — the 2026-09-16 wrap measurement puts its
horizontal overflow at 0 there and at 135px at 1280, i.e. below the width of its
own narrowest column. A trailing control one short scroll away is not the defect
this rule exists for, and a sticky column would be machinery paying for nothing.
That is the shape of a legitimate exemption: **fits at the design width, and
overflows by less than a column below it**. Everything else takes the rule:
`screens/doi-tac/ho-so-nang-luc.html` overflows by 126px and 216px at 1440 and
freezes both of its tables, and the phase editor measures its own wrap rather
than assuming — see *Code Mapping*.

### The scrollbar is shown on hover — added 2026-09-16

**Pointing at a table brings its scrollbar up, and it stays up for as long as the
pointer is inside.** It is not the platform's fading overlay bar, and it does not
wait for the user to scroll first.

The reason is that this component's whole responsive contract is "columns keep
their widths and the table scrolls" — 2294px, 2526px, 3231px inside a panel a
third that wide. On macOS the platform bar is an *overlay*: it appears while the
user scrolls and fades after. At rest, therefore, a 17-column table cut off at
the panel edge looks exactly like a table that ends there, and the only thing
saying otherwise is the `aria-label` a sighted mouse user never hears. The
`Do not hide columns` rule under *Usage* is what makes the affordance load-bearing.

Three things are required, and each is a trap:

1. **`::-webkit-scrollbar` is the only lever, and it is exclusive with the
   standard properties.** Measured in Chrome 152, 2026-09-16, as the gutter
   (`offsetSize - clientSize`) a scrolling box gives up:

   | declared on the scroller | gutter h / v |
   |---|---|
   | nothing (platform default) | 0 / 0 |
   | `scrollbar-width: thin` | 0 / 0 |
   | `scrollbar-color: <c> <c>` | 0 / 0 |
   | `::-webkit-scrollbar { width: 12px; height: 12px }` | 12 / 12 |
   | both of the last two together | 0 / 0 |

   Neither standard property leaves overlay mode on this platform — they restyle
   a bar that still fades — and **adding either one alongside the pseudo-elements
   silently turns the rule off**, because Chrome then honours the standard path
   and drops `::-webkit-scrollbar` entirely. The pairing is not progressive
   enhancement, it is an off switch. (`media-gallery.css` and `metric-item.css`
   declare both and are right to: they *hide* a bar, and both spellings hide.)

2. **The geometry is unconditional; only the paint is hovered.** Reserving the
   track on `:hover` would reflow the table by 12px at the moment the pointer
   enters it — rows jumping out from under a user reaching for them. So the bar's
   space is always reserved, its thumb is `transparent` at rest, and `:hover`
   changes one colour. Nothing about hover triggers layout.

3. **Both axes are sized.** Chrome reverts an unsized axis to its own 16px
   (`height` alone measures h 12 / v 16), so `width` is set for the vertical bar's
   size, not for its look.

`:focus-visible` carries the same paint as `:hover`, and that is a requirement
rather than a nicety: the wrap is `role="region" tabindex="0"` precisely so it
can be scrolled from the keyboard, and that user's pointer is elsewhere.

**The cost, stated.** A wrap that also scrolls vertically now gives up 12px of
width to the vertical bar. Measured across the nine screens that render a
`.data-table-wrap`, at 1280 and 1440: every wrap that already scrolled
horizontally scrolls by exactly 12px more, and **no wrap that fitted stopped
fitting** — the two that fit at 1440 (`du-an/chi-tiet`, `du-an/phan-cap`) still
fit, the latter while taking the vertical gutter. A wrap that overflows on
neither axis reserves nothing. This is also not a new hazard: `anchor-nav.md`
already records that a machine set to *always show scroll bars* takes 15px and
that both readings are correct, so this makes every machine behave like the more
conservative one — but a screen tuned so its table *just* fits has 12px less room
than it thinks, and `npm run measure` will not catch it, because the overflow is
inside a bounded scroll container by design.

**Scope.** The rule is on `.data-table-wrap`, so it follows the table into the
drawer. It does **not** reach the one case where the scroll moved off the wrap:
`modal.css` records a `minmax(0, 1fr)` fix for a table body whose horizontal
scroll landed on `.modal__content` instead. Where that regresses, the scroller is
`.modal__content` and this contract does not own it.

### Frozen footer, and the fill variant — added 2026-08-16

On a page that is fixed to one viewport (`design-system/components/app-shell.md`), add
`.table-panel--fill` to the panel and `.table-panel__body` to the wrapper the
screen renders its table into. The panel becomes a column: the row scroller takes
the leftover height, the footer keeps its own, and `max-height: none` drops the
tiered bound because the height is now the real leftover rather than an estimate
of it.

The footer needs no `position: sticky` and **must not have one**:

- it is a sibling of the scroll container, not a row inside it, so it cannot
  scroll away in the first place;
- a sticky footer would also track the table's *horizontal* scroll, sliding the
  pagination group off a 3231px table as the user reaches the right-hand columns.
  *(2844px until 2026-08-27 — the project-docs width before revision 2026-08-22d
  took that table to 17 columns; the archive queue's is 2800px.)*

So "freeze the footer" is a layout decision, not a footer property, and the
component gains no new sticky element for it. The sticky `thead` above is
unchanged and keeps working — it sticks to `.data-table-wrap`, whose height is
now exact instead of estimated, which is what makes the bound engage on every
viewport rather than only on short ones (see *Known Gaps*).

### Wrapping

Body cell text **wraps to a maximum of two lines**, then clamps. Two lines at
20px plus 24px of vertical padding is 64px, so a wrapped row grows 8px past the
56px minimum; one line fits it. Header cells never wrap.

This follows the MDM V2 table, whose cells visibly wrap mid-token (`2763/TD-` /
`PCCC`). The generic Untitled UI `Table cell` sets `whitespace-nowrap`; that is
the one place the two sources conflict, and the product table wins.

**Lead text without an icon** (`class="cell-text entity-title"`, e.g. the current row's name on `du-an/phan-cap`) wraps to two lines too: the bare `.entity-title` is nowrap + ellipsis, and `.cell-text.entity-title` restores the clamp.

**Column-width budget.** 16px horizontal padding costs 32px per column. Column
widths must be set with that in mind — a table tuned for tighter padding will
wrap or truncate identifiers when the spec padding is applied. Size the column
that carries the row's identifier so it never truncates.

**A wrapping `user-cell` title grows the row by a line, and that is correct
behaviour rather than a build error.** The two-line arithmetic above is for a
cell whose content is *text*. A `user-cell` is a 32px avatar beside a two-line
body — the title plus its `entity-subtitle` — so a title that wraps to two lines
makes the body three lines (84px row). `--utui-table-row-height` is a `height` on
a cell, i.e. a minimum, so the row stretches rather than clipping the name the
row is identified by. Variable row heights in a table with a wrapping identifier column are the
contract, not a defect — do not "fix" them with a fixed height, which would clip
the one string the row cannot afford to lose.

**One line is on by default behind a toggle the reader can turn off.**
`.data-table--clip` (the `Giới hạn ký tự` toggle,
`ds/components/table-settings.md`) truncates `.cell-text`, `.entity-title` and
`.entity-subtitle` to one line instead of wrapping, and sets `min-width: 0` on
`.cell-lead` / `.entity`. A screen that ships the toggle renders it checked and
adds the class; unchecking removes it and the two-line wrap above returns. The
trade is row density for the guarantee above, so every clipped cell carries
`data-tooltip-overflow` and recovers the full string on hover/focus —
`ds/components/tooltip.md` — only while the class is on. Used by
`screens/doi-tac/danh-sach.html` and `screens/du-an/ho-so/danh-sach.html`; a
table without the toggle keeps the wrap default.

## Cell Styles

**The full axis, read 2026-08-19.** The set draws **33 `Style` values** × the
`Supporting text` boolean × **four `State` values** — `Default`, `Hover`,
`Disabled` and `Selected`. `Selected` is the one this package under-read before:
it is a row-level fill (`Green/50` `#F0FDF4`, the same value `tr.is-current`
already uses) and it applies to every style, not only the selection ones. The
table below is the complete `Style` list; a "Yes" means the package builds that
composition, not that it builds all four of its states.

| Style | Composition | Implemented |
|---|---|---|
| `Text` | Single or two-line text. Primary line Regular. | Yes |
| `Lead text` | Two-line text used as the row's leading identifier. Primary line **Medium**. | Yes |
| `Avatar` | 32px avatar + text block. Primary line **Regular**. | Yes |
| `Badge` | One status badge. | Yes, via `design-system/components/pagination.md`-independent `.badge` |
| `Badges multiple` | Several badges in one cell. | Yes, `.cell-badges` — see the 2026-09-05 revision. A badge with its text in `.cell-badges__text` truncates with an ellipsis at the cell width (2026-10-06); give it `title` with the full text |
| `Avatar group` | Overlapping avatar stack. | No |
| `Lead checkbox` / `Lead radio button` / `Lead toggle` | Leading selection control plus text. | Checkbox and radio: **yes**, `.cell-select` — see below. Toggle: no |
| `Checkbox only` / `Radio button only` / `Toggle only` | Bare selection control. | No |
| `Lead avatar` | 40px avatar, then the row's identifier over a supporting line. | **Yes** — `.cell-lead` with a 40px avatar in its first grid column. `screens/du-an/danh-sach.js` (project thumbnail over the project code) and `screens/cong-ty/danh-sach.html` (initials avatar, company name over the system code) |
| `Lead avatar checkbox` / `Lead avatar radio button` / `Lead avatar toggle` | The same, with a leading selection control. | No |
| `Lead icon` | 40px **circular** `Featured icon` on `Brand/100` + `Neutral/900` Medium text. The text is plain, not a brand-coloured link, even when the row is clickable. | Yes |
| `Lead icon` + checkbox / radio / toggle | Icon with a selection control. | Radio: **yes** — `.cell-select` around `.cell-lead`, the investor picker's identifier column. Checkbox and toggle: no |
| `Lead payment method` (+ checkbox / radio / toggle), `Payment method` | Card brand plus masked number. | No |
| `Trend positive` / `Trend negative` | Delta indicator. | No |
| `Progress bar` | Inline progress. | **Yes**, authored (2026-10): `.cell-progress` holding a `.progress-bar` (`ds/components/progress-bar.md`) — see *Cell progress and row detail* |
| `Action buttons` / `Action icons` / `Action dropdown icon` | Row-level actions. | Partially — plain text link only |
| `Star ratings` | Rating control. | No |
| `Input` / `Edit` | An editable row's cell: the `Input field` atom filling the cell, as a text input or as a select — and, since 2026-09-22, as a **textarea** or a **tags** field. | Yes — see the `Style=Edit` atom section, *Edit cell: focus, error, disabled* and *Two more editable cells* below |
| `Folder link` | 40px neutral icon disc in a `Light circle outline` halo + the folder's name as a **blue link**. | Yes — see the 2026-08-14 revision |

### Tree cell (`.cell-tree`)

The identifier cell of a tree table (`du-an/phan-cap`). Anatomy: marks (`.cell-tree__marks`) then the identifier `.entity-title`. Marks are a toggle `.cell-action` at level 0 or a `.cell-tree__branch` (`subdirectory_arrow_right`) at child level, followed by a `.cell-lead__icon`.

- The identifier wraps to at most two lines, the same clamp as `.cell-lead .entity-title`.
- A child row's `td.cell-tree-cell--child` indents by cell padding + lead icon size (`--utui-table-cell-lead-icon-size`).
- A11y: keep a plain `<table>`. Do not put `aria-level`, `aria-posinset`, `aria-setsize` or `aria-expanded` on `<tr>`; `aria-expanded` and the label live only on the toggle button.

### Edit cell: focus, error, disabled — decided 2026-09-30

Applies to `.cell-input` text input, select and textarea (`.select--cell` follows `select.md`).

- **Focus** is 2px drawn inward: 1px border plus a 1px inset shadow, `--utui-shadow-xs` kept, no outer ring. Same construction as `.select__control`.
- **Focus colour** is always Brand/300 (`--utui-table-cell-input-border-focus`, resolves to `--utui-select-border-open`); no split between pointer and keyboard.
- **Error** keeps the red rim on hover; on focus it is red 1px + 1px inset, no spread outward.
- **Error text is never painted in the cell (USER DECISION 2026-10).** A message under the control makes the cell taller and every other cell in that row lands off-line, so an invalid cell is the red rim plus an `error` glyph at the inner right edge (USER DECISION 2026-10; colour is not the only signal, WCAG 1.4.1) and no text (`aria-invalid="true"`; a select cell uses `.select__control--error`). The glyph is a `td::after` keyed on `aria-invalid` (no markup, `--utui-color-icon-error`, empty alt text, sits left of the chevron on selects; the control's right padding grows so the value never runs under it; the tags cell has no error state yet). The message is a tooltip: `data-tooltip="<message>" data-tooltip-place="bottom"` on the focusable control (the input, textarea or `.select__control` button), opened below the cell on hover and on keyboard focus by `ds/scripts/tooltip.js`. The message stays in the accessibility tree: keep the `.form-field__error` node, add `.sr-only-label` to it and point the control's `aria-describedby` at its id (the bubble itself stays `aria-hidden`). Clearing the error removes `aria-invalid`, `aria-describedby`, `data-tooltip`, `data-tooltip-place` and the node's text. Changing `data-tooltip` while the tooltip is open updates it in place, so it survives typing. Applies to every editable table (`row-table.js`, `nhap-excel.js`, the investor date cells in `du-an/chi-tiet.js`). A control that cannot take focus gets the tooltip on hover only. Not covered: `.cell-progress`'s rejection message (not an input; stays a visible `.form-field__error`).
- **Disabled** uses `--utui-field-bg-disabled`, `--utui-field-text-disabled`; hover leaves the border unchanged (as `form-field.css`).

**Open a11y question (deliberate user choice, not to be changed silently):** Brand/300 at 2px with no halo is about 1.97:1 on a white field, below the 3:1 of WCAG 1.4.11. `select.md` uses Brand/600 for keyboard focus for this reason; the cell input does not.

### Two more editable cells: textarea and tags — added 2026-09-22

**NO FRAME DRAWS EITHER.** The DS `Table` set authors the editable cell as a text
input or a select and nothing else. These two exist because `Thông tin khác` on
`screens/doi-tac/danh-sach.html` `#createDrawer` (a page, `tao-moi.html`, until 2026-09-29) became an editable table on 2026-09-22 and two of
the attributes it carries are neither: `Ghi chú nội bộ` is a sentence and
`Nhóm hàng cung cấp` is a multi-select. Added **at the explicit direction of the
requester**, who was told first that this is a contract change rather than a
screen change. Recorded here so the next reader does not take them for source.

| Cell | Markup | Paint |
|---|---|---|
| Textarea | `<td class="cell-input cell-input--area">` holding a `<textarea rows="2">` | The same box as the text cell. `.cell-input--area textarea` adds `resize: vertical` and a two-line `min-height`, both in `styles/data-table.css` |
| Tags | `<td class="cell-input">` holding the Tags type of `design-system/components/select.md` — `.select.select--cell[data-select][data-select-multiple]`, a `.select__control--tags` shell, `.select__tags`, `.select__input`, `.select__clear` | `.select--cell > .select__control` already sizes the shell to the cell atom, so the tags shell needs nothing of its own |

Two rules the additions carry:

- **`rows="2"`, not the form field's 3.** A three-line box in a table row makes
  every other row taller than its content needs.
- **`resize: vertical`, not the UA's `both`.** A cell the user can widen past its
  own column tears the column rhythm, and the `<colgroup>` width is the one thing
  a row must not be able to argue with.

`styles/data-table.css`'s editable-control group is
`.cell-input :is(input, select, textarea):not(.select__input)`. The `:not()` is
load-bearing: a tags cell has a real `<input>` inside it (the query field), and
without the exclusion the cell's own bordered box would paint on that input as
well as on the shell around it.

### One column, one control per ROW — added 2026-09-22

A column may hand the control decision to the row it is rendering, so one cell
can be a text input on one row and a select, a textarea or a tags field on the
next. `Thông tin khác` is the only consumer: its `Giá trị` cell is whatever the
attribute named in that row's `Thông tin` cell calls for.

Required-ness travels with it: a column that decides its control per row also
decides per row whether that cell is required, so `Mã SAP` and
`Tình trạng hợp tác` can block `Lưu` while the six attributes beside them do not.
Such a column carries **no header `*`** — the marker would claim the column is
required on every row.

Two obligations come with it, both met by `scripts/row-table.js`:

- **The row repaints when the deciding cell changes**, or the value cell would
  keep the control the previous attribute needed. The repaint is one `<tr>`, not
  the table, and it puts focus back on the deciding control by FIELD — the node
  the user was on no longer exists.
- **The repaint is deferred by one task.** `select:change` is dispatched from
  inside the select component's own click handling, and replacing the trigger
  underneath it leaves that handler finishing on a detached node.

A table whose columns are fixed declares no per-row control and never takes
either path.

### A read-only boolean cell (`.cell-flag`) — promoted 2026-09-16

Not a style in the Untitled UI set. Recorded on 2026-08-19 as held back "so the
next reader finds it before writing a third copy"; the third consumer arrived on
2026-09-16 — the `Liên hệ chính` column of the `Người liên hệ` table, then
`screens/doi-tac/nguoi-lien-he.html`, now `#contactDrawer` in
`screens/doi-tac/chi-tiet.html` (MDM-1209) —
so the rule is now `.cell-flag` in `styles/data-table.css`, applying to the `th`
and the `td` together (`text-align: center`, plus `vertical-align: middle` on the
`td`) so the header and the mark stay on one axis.

**The accessible name travels with it and is not optional.** Each cell's
`.choice--flag` names the record **and the polarity** — `Liên hệ chính: Nguyễn Văn
Hùng` — because the column header alone cannot say which of eight rows a mark
belongs to, and an unchecked box with no name is a control that announces nothing.
See `design-system/components/inputs.md`.

`screens/du-an/chi-tiet.css` still carries the screen-local
`.investor-table .cell-flag` this rule was lifted from. It is identical and higher
specificity, so it wins with the same values; delete it the next time that screen
is touched.

Three frames now draw the same cell: a column whose entire content is a **read-only
green check** reporting a fact about the row, centred on both axes because there
is no text to align to.

| Frame | Column | Surface |
|---|---|---|
| `11415:67171` | `Liên hệ chính` | The `Địa chỉ` table and its detail modal |
| `12035:63630` | `Là chủ đầu tư hiện tại` | The `Chủ đầu tư` dialog |
| `14128:55930` / `14128:56108` | `Liên hệ chính` | The partner's contacts table and its read-only contact dialog |

The mark itself was already a component part — `.choice--flag` in
`design-system/components/inputs.md`, promoted on exactly this same
threshold.

**Text weights are deliberately inconsistent between styles.** `Lead text` uses
`Text sm/Medium` for its primary line; `Text` and `Avatar` use
`Text sm/Regular`. Supporting lines are always `Text sm/Regular` in
`Neutral/600`. Do not normalise these to a single weight.

## Variants

| Variant | Use |
|---|---|
| Organization table | MDM list and entity management. |
| Document table | OCR and document review. |
| Version table | Version history and side-sheet detail. |
| `.table-panel--bare` | A panel inside a shared shell (e.g. beside `.folder--bare`, `item-listing.md` § Tree + list region): no radius, fill or shadow; the shell paints them. Added 2026-10-01. |
| `.data-table--hierarchy` | Tree table (`du-an/phan-cap`): `min-width: 1087px` (colgroup 270+288+169+288+72) under the shared 1180px floor, and a 16px pad on the chevron column. Added 2026-10. |
| Records/documents table | MDM item listing pattern, e.g. `screens/du-an/danh-sach.html` (the table is rendered by its bundle). |

### Dividers — `Divider line` and `Alternating fills`

The DS `Table` set's `Dividers` axis has two values, and until 2026-08-20 this
component only had the first.

**`.data-table--striped` is UNRELEASED.** It has no consumer, and do not add
one — no frame in this product requests a striped listing. It is specified so the
local `Dividers` axis is not re-discovered on the next sync, and it is two rules
that cannot be reached without the class. Three things have to be decided before
any table takes it:

- **Hover is a no-op on the filled rows.** `--utui-table-row-hover-bg` is the same
  `Neutral/50` as the fill, so `:hover` on rows 1, 3, 5, 7, 9 paints `#FAFAFA`
  over `#FAFAFA` — zero delta, including on `.is-clickable` rows, where the row
  IS the control. Measured and deliberately **not** patched with the obvious
  `Neutral/100`; see *The zebra and hover* below.
- **Do not put it on a table carrying `<th scope="row">`** until an owner decides.
  All four row-state rules are `td`-scoped, so a row header keeps showing the
  zebra under `:hover`, `.is-current`, `.is-editing` and `aria-disabled`. On
  `.is-current` that means the row's identifier cell reads untinted beside four
  green ones — the cell carrying the row's name is the one that loses the marker.
- **Parity counts every `<tr>` in `tbody`** (`tbody tr:nth-child(odd)`), so a
  group header row, a total row, an empty-state row **or a `display: none`
  filtered row** inverts the stripes from that point down. A table whose body is
  filtered or grouped client-side cannot use the mode as written.

| | `Divider line` | `Alternating fills` |
|---|---|---|
| Class | `.data-table` — the default, nothing to add | `.data-table` **+ `.data-table--striped`** |
| Body rows | No fill; the panel's white shows through | Rows **1, 3, 5, 7, 9** filled `Neutral/50` `#FAFAFA`; rows 2, 4, 6, 8, 10 unfilled |
| Row divider | 1px `Neutral/200` bottom border | **The same border, kept** |
| Header background | White (see *Divergences*) | White |

```html
<table class="data-table data-table--striped">
  <thead>…</thead>
  <tbody>
    <tr>…</tr>  <!-- filled -->
    <tr>…</tr>  <!-- unfilled -->
  </tbody>
</table>
```

**The fill is in addition to the divider, not instead of it.** In `1229:12388`
every body cell still carries its 1px `Neutral/200` bottom border and 30 of the
60 cells additionally carry `Neutral/50` — exactly 5 of 10 rows × 6 columns. A
striped table is therefore *both* zebra and ruled; do not read the mode as a
licence to drop the rule.

**The header inverts.** `TableHeaderCell color` is `Gray` (`#FAFAFA`) in
`Divider line` and `White` in `Alternating fills`, so that the first *filled*
row meets a white header rather than continuing it. Locally the header is white
in **both** modes, because MDM V2's `Table header cell` is white and MDM V2 wins
— so `.data-table--striped thead th` restates the value the default header
already resolves to. It is declared anyway: the mode's contract is "white
header", and if the header is ever re-synced to the DS's `Neutral/50` the zebra
would otherwise start one row early and read as inverted parity.

**Row states beat the zebra in the cascade, unconditionally — and winning the
cascade is not the same as being visible.** The fill is on the `<tr>`; every
row-state rule tints `td`, and a cell background paints over its row's, so
`tr[aria-disabled="true"]`, `:hover`, `.is-current` and `.is-editing` all cover
the stripe by paint order regardless of specificity. Source order in
`styles/data-table.css` agrees as a second guard — the striped block is declared
before all four. Precedence, highest first, **with what each one actually renders
over an odd (filled) row**:

1. `.is-current` — `green-50` `#F0FDF4`. Declared after `:hover` so it survives
   it, and the only row state whose value the zebra cannot swallow. **Renders as
   designed.**
0. `.is-selected` — `--utui-table-row-selected-bg` (`brand-subtle`), hàng có checkbox đang tick (ô tên bọc bằng `.cell-select`). Khai báo sau `.is-editing` nên thắng khi hai trạng thái trùng; không thay `.is-current` ("bản ghi đang mở", xanh). Cue không chỉ là màu: ô tick ở trạng thái checked. Chưa kiểm trong `--striped` (brand-subtle khác Neutral/50 nên không bị nuốt).

2. `.is-editing` — also declared after `:hover`, and `--utui-table-row-editing-bg`
   is `Neutral/50`, **byte-identical to the fill: it wins the cascade and paints
   nothing.** Decided rather than repaired — see *The zebra and `.is-editing`*.
3. `:hover` — `--utui-table-row-hover-bg` is `Neutral/50`, **the same collision**,
   and the worse of the two, because on a `.is-clickable` row hover is the only
   feedback the control gives. **Unresolved** — see *The zebra and hover*.
4. `tr[aria-disabled="true"]` — `--utui-table-cell-disabled-bg` `#FDFDFD`, which
   is **lighter than the fill**, so an inert odd row reads *brighter* than its
   active neighbours instead of dimmer. See *States*.
5. the zebra fill — `Neutral/50` `#FAFAFA`.
6. the panel's white.

Read the ranking as cascade order only. Three of the five states above either
render nothing or invert their own meaning once they have won, because their value
equals or overshoots the fill they cover. A reader who takes the list as a
statement about pixels would ship a mode with no hover.

One further consequence, which is the pre-existing scope of those four rules
rather than something the mode introduces: they repaint `td` only, so a
`<th scope="row">` in a striped row keeps its zebra fill under a row state.
`.is-current` is where that shows — a row header reading untinted beside four
tinted cells. Hover collides on the cells too, so there it is invisible on both.
This is the second of the three unreleased-mode conditions above.

### The zebra and hover — measured, unresolved

The one-line fix is to scope the custom property to the mode, which needs no new
selector and no specificity change:

```css
/* NOT SHIPPED — see the measurement */
.data-table--striped { --utui-table-row-hover-bg: var(--utui-color-neutral-100); }
```

`Neutral/100` `#F5F5F5` is not a new value for the package — it is already
`--utui-color-bg-surface-hover` — but it *is* a new **text** surface for this
table, so the three colours a body cell can carry were measured against it before
shipping it:

| Foreground | Token | On `#F5F5F5` | On the `#FAFAFA` zebra | AA normal text |
|---|---|---|---|---|
| `#344054` | `--utui-table-cell-text` | 9.60:1 | 10.02:1 | pass |
| `#737373` | `--utui-color-text-tertiary`, used by `.cell-empty` | **4.35:1** | 4.54:1 | **fail** |
| `#2563EB` | `--utui-button-link-color`, used by `Folder link` | 4.74:1 | 4.95:1 | pass |

So it was **not shipped**. `.cell-empty` was moved *up* to `Neutral/500` on
2026-08-18 for exactly this reason — `--utui-color-text-placeholder` had put an
em dash that is real content at 2.9:1 — and the move bought 0.24 of headroom over
4.5:1. A `Neutral/100` hover spends more than that, on the one cell in the table
whose whole point is that an absence is announced deliberately.

The ramp has no step between `#FAFAFA` and `#F5F5F5`, so a deeper hover cannot be
had without either a new value or a text change. Two candidates, both an owner's
call and neither taken here:

1. **Invert the hover on a filled row instead of deepening it** —
   `--utui-table-row-hover-bg: var(--utui-color-bg-surface)` declared *inside* the
   existing odd-row rule, which the `tr:hover td` rule inherits. No new selector,
   no new text surface (white and `#FAFAFA` are both already body-cell surfaces
   in this table), and every row gets a visible delta. It inverts the package's
   hover polarity on half the rows, which is an interaction decision.
2. **Repoint `.cell-empty` to `Neutral/600`** (7.17:1 on `#F5F5F5`), after which
   `Neutral/100` clears AA everywhere. That retints the em dash in every table on
   every screen, so it is a package change, not a mode fix.

Until one of them lands, this is the first of the three unreleased-mode
conditions above.

### The zebra and `.is-editing` — decided

`--utui-table-row-editing-bg` is `Neutral/50`, the same value as the fill, so on
an odd striped row the editing tint is invisible and the only cue left is the
presence of controls in the cells.

**Decision: editing keeps `Neutral/50`.** In striped mode its row-level cue is
absorbed and the in-cell controls carry it — an editing row is the only row in the
table holding inputs and a combobox, which is a structural difference rather than
a tint. A second hue for "editing" is a colour-meaning decision the design system
has not stated, and inventing one from a token file is how a palette acquires
meanings nobody agreed to. `design-system/tokens/css/untitled-ui-component.css`
(the `--utui-table-row-editing-bg` comment, ~line 450) already anticipated this
divergence when it said naming the value separately from the hover tint is what
lets the two diverge later; this is the case it was written for, and the answer is
that they do not diverge yet. Flagged as the open question for the DS owner under
*Known Gaps*.

### Divergences from the DS `Table` set

Decisions, with the reason each was taken. None of these is an oversight; do not
"fix" one without reading its reason.

| # | DS `Table` set | This component | Why |
|---|---|---|---|
| 1 | Panel has `1px solid border/primary` and `border-radius 12px` | Panel has **no border**, `--app-radius` (8px), `--utui-shadow-xs` | MDM V2 wins. V2 panel surfaces are fill + shadow; the compact radius is the package's control/card radius. Restoring either would restyle every panel in the product, not just tables. |
| 2 | Panel shadow is the two-layer `shadow-sm` | `--utui-shadow-xs` | Same decision as 1 — heavy shadow is not decoration in V2. |
| 3 | Header background `Neutral/50` in `Divider line` | White in both modes | MDM V2's `Table header cell` is white. The local default therefore already matches the DS's *Alternating fills* header, and the `Dividers` axis changes the body only. **Restated 2026-09-04, and it is weaker than a divergence:** the DS `Table header cell` set carries a `Color` axis whose two values are exactly white and `Neutral/50`, so the local header is the set's `Color=White` member. What the `Table` set fixes per `Dividers` mode, the header cell leaves as a property. |
| 4 | Header label `text/secondary` `#344054` | `Neutral/600` `#525252` via `--utui-table-muted-text` | **Decided 2026-08-20: keep `Neutral/600`.** The reason is hierarchy, not contrast — the DS value is *darker* (10.46:1 against 7.81:1 on white), so adopting it would raise contrast rather than lower it, and no accessibility argument is available here. `#344054` is byte-identical to `--utui-table-cell-text`, so adopting it collapses the header-to-body tonal step on a 13-column table that scrolls under a sticky header, leaving size and weight as the only things distinguishing a column label from a `Style=Text` cell. Separately, `--utui-table-muted-text` is read package-wide, so the change would be a package retint dressed as a table fix. Which ramp a header label belongs to is routed to a DS owner. |
| 5 | Every body cell keeps its bottom border, **including the last row** | `.data-table tr:last-child td` sets `border-bottom: 0` | The local panel puts a pagination footer, or the panel's own clipped edge, directly under the last row; a rule there doubles with the footer's top rule. The DS set draws no visible top rule on its footer (`border-0`), so the two are consistent, not contradictory. |
| 6 | Files' dropdown cell is `padding 16px 24px` | 14px inline via `--utui-table-cell-single-action-padding-x` | Already recorded: 68px − 2 × 14px = the 40px control exactly. A 24px pad would leave a 20px hit area. |
| 7 | Action button wrapper has `border-radius 8px` | `.cell-action` sets no radius | **Yes, scheduled** — the DS is right on substance and `border-radius: var(--utui-radius-md)` is the declaration. The wrapper has no fill and no border in Figma either, and `styles/base.css` gives buttons a `box-shadow` focus ring whose spread follows `border-radius`, so the single observable effect is the corner shape of the focus halo. It lands in its own change rather than this one because it needs a focus-state pass over all four action-column patterns (the 116px `visibility`/`edit` pair, the 68px overflow menu, the 72px chevron, the phase table's delete) plus a clip check against `.data-table :is(th, td) { overflow: hidden }`, which is the rule a 2px outset halo on a cell-edge control has to survive. |
| 8 | Avatar cell is 40 × 40 | `--utui-table-cell-avatar-size` is 32px | Already an open gap — *No 40px avatar in a table cell*, under Known Gaps. The `Table` set is a third frame drawing 40px, which strengthens the case for a size axis. |
| 9 | Column widths `120 / 176 / 224 / 288` + a `flex-1` lead column | Consumers own their `colgroup`; the MDM column set is 13 columns / 2294px | The DS widths belong to its sample content (Team members, Files), not to a contract. |
| 10 | Structure is column-major — a `Column` per header, no row element | `<tr>` per row | Figma has no table primitive. The rendered result is identical and the semantics are non-negotiable; see *Accessibility*. |
| 11 | Header cell is padded **16px** inline (`Table header cell` set, all 8 variants) | 24px, `--utui-table-cell-padding-x` | The header and the body must share one inline padding or the column label sits off the axis of the values under it. The body cell is 24px in the MDM V2 table, so the header follows the body rather than the set. Read together with row 12: the DS's own body cell is *also* 16px, i.e. the set is internally consistent at 16/16 and this package is consistent at 24/24. Adopting the set's 16px for the header alone would be the one combination neither source draws. |
| 12 | `Table cell` is **56px** tall with 12px vertical padding (`1222:107426` and every sibling) | 56px, 12px vertical, `--utui-table-row-height` | **Resolved — tokens now match the DS.** 56px is a minimum: a two-line wrapped cell grows the row to 64px instead of clipping (see *Wrapping*). The earlier local value was 72px / 16px vertical. |
| 13 | `_Checkbox base` rim is `border/primary` `#E5E5E5` | `--utui-choice-border` → `Neutral/300` `#D4D4D4` | **Kept, and routed to a DS owner.** Both values are far under the 3:1 of WCAG 1.4.11 for a control boundary (`#D4D4D4` is 1.47:1 on white, `#E5E5E5` is 1.27:1), so adopting the DS value moves a failing rim in the failing direction for no gain the frame asks for. The 6px radius of the same node **was** adopted — see the 2026-09-04 revision and `components/revisions/form-field.md`. |

### Observed in the DS `Table` set, not implemented

Facts recorded so the next sync does not re-discover them. None of these is a
commitment to build.

- **`Breakpoint = Mobile`** — 8 of 16 variants. A 375px panel with the
  `border-radius` removed, card-header inline padding at 16px and the lead column
  losing its `flex-1`. **No column is dropped or hidden**, and the extracted spec
  records that **no horizontal-scroll affordance is expressed in the node** — the
  extra columns are simply cut off by the panel's `overflow-clip`. That is the
  strongest thing to say about it: a static frame *cannot* express a scroll
  affordance, so `overflow-clip` at 375px is a rendering property of a
  fixed-width artboard rather than a specified behaviour. There is no design
  instruction being overridden here, because none was given. This package does
  the opposite — columns keep their widths and the table scrolls inside a
  labelled, focusable `.data-table-wrap` (see *Usage* and
  `.claude/skills/responsive/SKILL.md`) — and that position is held on
  accessibility grounds, not on a reading of the frame: content that exists must
  be reachable. It is a DS-versus-product conflict expressed across 8 of 16
  variants, so **route it to a DS owner to confirm** rather than closing it here;
  "will keep doing it" was overclaiming for one component contract. Half the
  mobile delta is already absorbed either way: the DS mobile panel drops its
  `border-radius`, and `.table-panel` has neither a border nor the DS's 12px
  radius in *either* mode (divergence 1), so the mobile variant's panel change is
  a no-op locally.
- **Three distinct pagination footers.** The segmented numbered `Pagination` with
  a left action-button group (`1227:108550`, Vietnamese labels "Tải lại",
  "Thiết lập", "Tải xuống"); `Pagination/Card default/Square/Desktop`
  (`1229:12589`) with Previous / Next plus 40 × 40 rounded page chips, current
  page on `Brand/50`; and `Pagination/Card default/Square/Mobile`
  (`1227:110730`) with "Page 1 of 10". All three declare `border-0`, i.e. no
  visible rule above the footer. The footer is owned by
  `design-system/components/pagination.md`, which is where any of these belongs;
  this component only reserves the slot.
- **The card header is part of the `Table` component in Figma**, not a wrapper
  around it: title `Text lg/Medium` over `pt 20px / pb 19px`, plus either a count
  badge (Team members) or a "Download all" / "Upload" action pair (Files, which
  has no footer at all). Locally the toolbar above a table is a separate part.
- **Header affordances.** A 16px `arrow-down` sort arrow in a 4px gap (Team
  members' `Status` only) and a 16px `help-circle` (its `Role` only). Neither has
  any CSS in this package, and `Files` renders neither. **Sourced properly
  2026-09-04:** these are not sample content of the `Table` set — they are two
  axes (`Arrow`, `Help icon`) on the `Table header cell` set's own label
  component (`1221:106787` / `1221:106888`), so every header in the DS can carry
  them. The arrow is `fg/secondary` `#404040`. Promoted to a Known Gap below,
  because "the DS set has a slot for it" is a stronger claim than "one sample
  column drew one".
- **`Example = Sales` and `Example = Companies`** were not read, so any
  progress-bar, numeric or company-logo cell type they carry is unrecorded.
- **State coverage in the set is minimal** — every instance read is
  `state = "Default"`, checkboxes are unchecked, and no hover, selected-row,
  empty or loading state appears anywhere in it. The states this component
  documents come from the cell set and from MDM V2 frames.

## States

Cells carry their own state, applied at the row level in implementation. Focus, error and disabled of the control inside an editable cell: see *Edit cell: focus, error, disabled*.

- **Default** — transparent background.
- **Hover** — `#FAFAFA` (`Neutral/50`) background across the row.
- **Disabled** — **`#FDFDFD` cell background; the text keeps its default
  colour.** Every `State=Disabled` variant in the source dims the surface, not
  the type. Interactive cell content is non-actionable. **Under
  `.data-table--striped` the disabled surface is *lighter* than the zebra**
  (`#FDFDFD` over `#FAFAFA`), so an inert odd row reads brighter than its active
  neighbours and the stripes appear to change parity from that row down —
  therefore in striped mode the surface cannot be the only cue and
  `aria-disabled` plus inert controls have to carry the state.
- Sorted column, selected row (when selection is enabled).
- **Current** — the row that IS the record already on screen. Added 2026-08-13
  from the hierarchy table on `Phân cấp` (`11142:42756`), where every cell of the
  `LUMIÈRE Boulevard` row is filled `green-50`, its `Featured icon` switches from
  `Color=Brand` to `Color=Success`, and its name cell switches from `Style=Text`
  to `Style=Lead text`. Three signals, and none of them is colour alone.
  Implemented as `.data-table tbody tr.is-current`, declared **after** the hover
  rule at equal specificity so the tint survives hover — "you are here" is a fact
  about the row, not a transient state, and dropping it on hover would blank the
  marker at the moment the pointer is on it. Markup also carries `aria-current`
  on the `<tr>` and a `.sr-only-label` note in the name cell.
- **Editing** — the row whose cells hold controls instead of text. Added
  2026-08-14 from `Các giai đoạn chính` (`10838:66444`): every cell filled
  `Neutral/50` (`--utui-table-row-editing-bg`). Implemented as
  `.data-table tbody tr.is-editing`, declared after the hover rule for the same
  reason `.is-current` is. See the revision at the end of this file.
- Empty, loading, and error states can be added when the PRD requires them.

The zebra fill of `.data-table--striped` is **not** in this list on purpose. It
is a table-level mode, not a row state: it says nothing about the row it paints,
and every state above wins the cascade over it. Winning the cascade is not the
same as being seen — `:hover` and `.is-editing` carry the fill's own value and
`aria-disabled` carries a lighter one, so three of the four states above render
wrong over a filled row. See *Dividers* under *Variants*, which is also why the
mode is unreleased.

### Cell text colour depends on `Supporting text`

The source uses two different primary colours, which is easy to miss:

| Cell style | Primary | Supporting |
|---|---|---|
| `Text`, `Supporting text=False` | **Gray/700** `#344054`, Regular | — |
| `Text`, `Supporting text=True` | **Gray/900** `#101828`, Regular | Gray/700 `#344054` |
| `Lead text` / `Lead icon` | **Gray/900** `#101828`, Medium | — |
| `Avatar` | **Gray/900** `#101828`, Regular | Gray/700 `#344054` |

A single-line text cell is therefore *lighter* than the primary line of a
two-line cell. Do not normalise them to one value.

## Tokens

| Role | Token |
|---|---|
| Panel background | `--utui-table-bg` |
| Header background | `--utui-table-header-bg` — white in both `Dividers` modes; `.data-table--striped thead th` restates this same token rather than a surface semantic, so the mode makes no decoupling claim it cannot keep |
| Edit cell focus rim | `--utui-table-cell-input-border-focus` — Brand/300, see *Edit cell: focus, error, disabled* |
| Row divider | `--utui-table-border` — internal only; the panel itself has no border, just fill plus `--utui-shadow-xs` |
| Row hover | `--utui-table-row-hover-bg` — `Neutral/50`, the same value as the alternating fill, which is why hover is a no-op under `--striped`; not scoped to `Neutral/100` because `.cell-empty` fails AA on it (see *The zebra and hover*) |
| Row current | `--utui-table-row-current-bg` — `bg-success-subtle` → green-50, exact |
| Alternating fill | `--utui-table-row-alt-bg` — `Neutral/50` `#FAFAFA`, repointed 2026-08-20 from `--utui-color-bg-page` (`#FFFFFF`, which was not an alternating fill of anything). `.data-table--striped` is its only consumer |
| Cell padding | `--utui-table-cell-padding-x`, `--utui-table-cell-padding-y` |
| Cell gap | `--utui-table-cell-gap` |
| Text-cell colour | `--utui-table-cell-text` — Gray/700 |
| Strong-cell colour | `--utui-table-cell-text-strong` — Gray/900 |
| Supporting text | `--utui-table-cell-supporting-text` — Gray/700 |
| Disabled surface | `--utui-table-cell-disabled-bg` — #FDFDFD, pinned |
| Lead-text weight | `--utui-table-cell-lead-weight` |
| Text/Avatar weight | `--utui-table-cell-text-weight` |
| Avatar size | `--utui-table-cell-avatar-size` |
| Lead icon | `--utui-table-cell-lead-icon-size` (40px), `--utui-table-cell-lead-icon-bg` (Brand/50) |
| Lead icon, Success tone | `--utui-color-green-100` / `--utui-color-green-600` via `.cell-lead__icon--success` — mirrors `.featured-icon--success`; see Known Gaps for the glyph-colour caveat |
| Lead icon, Link tone | `--utui-table-cell-lead-icon-folder-bg` (Blue/100) / `--utui-color-blue-600` via `.cell-lead__icon--link` — the cell names another record; see *Cell style: `Lead icon`, link tone* |
| Action cell | `--utui-table-cell-action-padding-x` (16px), `--utui-table-cell-action-gap` (4px), `--utui-table-cell-action-size` (40px) |
| Status badge | `--utui-badge-*` tokens |
| Scroll wrap's scrollbar | `--utui-table-scrollbar-size` (12px), `--utui-table-scrollbar-track`/`-thumb` (both `transparent` at rest), `--utui-table-scrollbar-thumb-hover` (`border-strong`), `--utui-table-scrollbar-thumb-active` (`icon-muted`). No Figma source and there cannot be one — see *The scrollbar is shown on hover* |

## Usage

Use tables for comparable operational data, not for visual cards or marketing
content. Keep high-priority columns left-aligned and visible at desktop widths.

Columns keep their designed widths at every viewport tier; the table scrolls
horizontally inside `.data-table-wrap` instead of compressing text. That box is
also what keeps a 2294px/2737px table from overflowing the page, so it must be
operable without a mouse: `role="region"`, `tabindex="0"`, and an `aria-label`
naming the table and stating that it scrolls. Do not hide columns, introduce
column priority, or switch to a card-per-row layout at narrow widths — none of
those is specified for V2; record a gap first. See `.claude/skills/responsive/SKILL.md`.

Pick the cell style per column from the table above rather than restyling a
generic text cell — the styles encode the intended reading hierarchy.

## Accessibility

- Use semantic `table`, `thead`, `tbody`, `th`, and `td`.
- Sort buttons should announce the sorted column in implementation.
- Row actions need clear labels.
- Row hover is decorative; never use it as the only signal for state.
- Footer page navigation follows `design-system/components/pagination.md`.
- **`.data-table-wrap`'s focus ring is INSET** (`outline-offset: -2px`), and it
  has to be. The wrap is a focus stop wherever it scrolls, and it is routinely
  rendered flush inside a box that clips: `.investor-record` in the `Chủ đầu tư`
  dialog is `overflow: hidden` so one 12px radius can round the table and its
  footer band together, and an outset ring drawn outside the wrap's border box was
  clipped on three sides there — on the first tab stop inside the panel, i.e. a
  WCAG 2.4.7 failure on the control a keyboard reaches first. Inset is clip-proof
  by construction, reads identically where nothing clips, and costs 2px of the
  first row's white. Do not solve this by removing the clip: the radius is what
  the ring would have been drawn around. Corrected 2026-08-19.
- **`Giới hạn ký tự` clip, `screens/doi-tac/danh-sach.html`:** the tooltip that
  recovers a clipped `.cell-text`/`.entity-title`/`.entity-subtitle` string opens
  on hover and on focus for the one cell that is a link (`.entity-title`); the
  other two are plain text with nothing to focus, so a keyboard-only reader
  cannot reach the full string for them — accepted as
  `ds/components/tooltip.md` GAP-1, not fixed here.
- **A table's empty cell is not `data-viewer`'s empty value — decided
  2026-09-28.** `data-viewer`'s `--` is a FIELD on a record (see
  `ds/components/data-viewer.md`); `.cell-empty`'s em dash (`—`) is a value a
  TABLE ROW does not have, and the two never share a class or a contract
  section. Both need an accessible name the visible glyph alone does not carry,
  but `aria-label` cannot go on the `<span>` that wraps the glyph — a `<span>`
  has no ARIA role of its own (`role="generic"`), and ARIA 1.2 forbids naming a
  generic role. The correct markup is two children inside `.cell-empty`: `<span
  aria-hidden="true">—</span><span class="sr-only-label">Không có</span>`.
  Consumer status: `screens/doi-tac/danh-sach.js` (`EMPTY` constant),
  `ds/scripts/row-table.js`, and the static markup in
  `screens/doi-tac/danh-sach.html`, `screens/doi-tac/ho-so-nang-luc.html` and
  `screens/doi-tac/chi-tiet.html`'s `#bankDrawer` (formerly
  `screens/doi-tac/tai-khoan-ngan-hang.html`, MDM-1209) already use the two-span form.
  `ds/scripts/phase-table.js` carried the invalid `aria-label` form until
  2026-09-28, as did `screens/du-an/chi-tiet.js` and `screens/du-an/danh-sach.js`;
  all three are corrected (2026-09-28).

## Code Mapping

| Surface | File |
|---|---|
| Table + cell tokens | `design-system/tokens/css/untitled-ui-component.css` |
| `Thông tin khác` floor | `.data-table--attributes` (628px) in `styles/data-table.css` — a table hosted in a card or dialog takes a floor from its own columns, never the 1180px listing default |
| Editable-row CSS | `.cell-input` (input **and** select), its `[aria-invalid="true"]` state (error text is `.form-field__error.sr-only-label` + `data-tooltip`, see *Edit cell*), `.cell-edit-trigger`, `tr.is-editing`, `tr.is-clickable` in `styles/data-table.css` |
| Editable-row behaviour | Two shared modules, and a screen uses one of them rather than copying either. `scripts/phase-table.js` (`OmeuPhaseTable`) — `screens/du-an/tao-moi.js` and the `Các giai đoạn chính` dialog in `screens/du-an/chi-tiet.js` (`screens/du-an/chinh-sua.js` used it too until removed 2026-09-28). `scripts/row-table.js` (`OmeuRowTable`, since 2026-09-22) — the four tables on `screens/doi-tac/tao-moi.js` and the `Thông tin khác` dialog in `screens/doi-tac/chi-tiet.js`; it is the one that validates cells, takes a configurable identifier key and supports a per-row control. See *Two shared table engines* under Known Gaps |
| Table and cell CSS | `.data-table`, `.entity`, `.entity-title`, `.entity-subtitle`, `.user-cell`, `.cell-lead`, `.cell-lead__icon--success`, `.cell-lead__icon--link`, `.file-chip`, `tr.is-current` in `styles/data-table.css` |
| Fill variant | `.table-panel--fill`, `.table-panel__body` in `styles/data-table.css`; reverted at `sm` in `styles/responsive.css`. Used by every listing screen |
| Hover scrollbar | `.data-table-wrap::-webkit-scrollbar`, `::-webkit-scrollbar-track`, `::-webkit-scrollbar-thumb` and the `:hover`/`:focus-visible` pair in `styles/data-table.css` — do not add `scrollbar-width` or `scrollbar-color` to that selector |
| Frozen columns | `.data-table--frozen-end` (+ `scripts/frozen-end.js`), `.data-table--frozen-action` and `.data-table--frozen-identity` in `styles/data-table.css`, with the `max-width: 1439px` release of the second — read its *Known gap* before changing that query. Both freezes: `screens/du-an/ho-so/danh-sach.js` and `screens/du-an/ho-so/hang-doi.js`, each setting `--frozen-identity-offset` in its own stylesheet. Action column only: `screens/doi-tac/ho-so-nang-luc.html` (authored on the `<table>`) and `scripts/phase-table.js` (`syncFrozenAction()`, which toggles the class from `scrollWidth > clientWidth` because its two column sets give opposite answers) |
| Alternating fills mode | `.data-table--striped` in `styles/data-table.css` — two rules, declared before the four row-state rules. **Unreleased**: no consumer, and none is to be added until the conditions in *Dividers* are decided |
| File-type icons | `assets/file-type-icons/file-*.svg` (`assets/folder-icon.webp` left this table with its folder rows on 2026-08-16) |
| Clipped-cell tooltip (`Giới hạn ký tự`, `screens/doi-tac/danh-sach.html`, `screens/du-an/ho-so/danh-sach.html`) | `ds/styles/tooltip.css`, `ds/scripts/tooltip.js` — `ds/components/tooltip.md` |
| Tree cell and hierarchy modifier | `.cell-tree`, `.cell-tree__marks`, `.cell-tree__branch`, `td.cell-tree-cell--child`, `.data-table--hierarchy`, `.cell-text.entity-title` in `ds/styles/data-table.css` |
| Examples | `screens/du-an/danh-sach.html`, `screens/du-an/ho-so/danh-sach.html`, `screens/du-an/phan-cap.html` (row-current state, single-chevron action column, `.data-table--hierarchy` and `.cell-tree`) |

## Known Gaps

- **The textarea and tags cells have no source, and no validated state.**
  Added 2026-09-22 (see *Two more editable cells*). No frame draws either, so
  their box, their height and their placement inside the cell are this package's
  answer rather than a transcription — a designer has never seen them. Two
  specific holes: the textarea cell renders `aria-invalid` and a
  `.form-field__error` because the text cell does, but **nothing has ever
  exercised that path**; and the tags cell has **no invalid state at all**,
  because `.select__control--error` is authored for the untyped shell and the
  tags shell is a different element. Neither matters while
  `Thông tin khác` has no required attribute (PO, 2026-09-21), and both become
  real the moment one does.

- **Two shared table engines, not one.** `scripts/row-table.js`
  (`OmeuRowTable`, promoted out of `screens/doi-tac/tao-moi.js` on 2026-09-22)
  serves the two partner screens; `scripts/phase-table.js` (`OmeuPhaseTable`)
  serves the three project screens. Both grew locked rows, always-editing and a
  unique select column on the same day, independently, and **the same four rules
  now live in two files**. They are not interchangeable: only `row-table.js`
  validates cells, carries a configurable identifier key, a runtime-variable
  column set, a boolean cell and a per-row control; only `phase-table.js` has the
  nine-column wizard defaults. Nothing is broken and no consumer is wrong; the
  cost is the next change to either. Merging them is a real change with real risk
  to five screens and was out of scope for the two changes that revealed it.

- **Both identifier classes reset `<button>` defaults but not `<a>` ones.**
  `.cell-lead .entity-title` and `.cell-edit-trigger` clear padding, border,
  background and colour — everything a button brings — because every consumer
  until 2026-09-16 was a `<button>` or a `<span>`. Neither clears
  `text-decoration`, which only a link brings. Authored as an `<a>`, which is
  what this contract's own rule asks for on a clickable row ("a pointer-only row
  is a row a keyboard user cannot open"), the identifier renders **underlined at
  rest** and hover has nothing left to add.

  The sibling action-icon class already solved this and says why: "BOTH A
  `<button>` AND AN `<a>` TAKE THIS CLASS … `text-decoration: none`". The two
  identifier classes want the same line. Patched screen-local in
  `screens/cong-ty/danh-sach.css`; fold it into `styles/data-table.css` when a
  second link consumer appears, since the shared rules have other consumers and
  ADR 0008 makes extending a shared contract a deliberate act.

- **The variant table does not enumerate the nine selection-control
  combinations** of `Lead avatar`, `Lead icon` and `Lead payment method` that the
  component set carries (`Lead avatar checkbox`, `Lead icon toggle`, and so on as
  their own `Style` values, each with both `Supporting text` settings and all four
  states). `Lead icon` has always had its own split row; `Lead avatar` gained one
  on 2026-09-16 and `Lead payment method` still does not. None is implemented, so
  nothing is mis-built today — but a reader counting styles against Figma will
  find the table short, and the audit that found it is recorded above rather than
  left to be repeated.

- **The second freeze is switched by a breakpoint the responsive ladder forbids, and
  no legal boundary reproduces it.** `styles/data-table.css` releases
  `data-table--frozen-identity` inside `@media (max-width: 1439px)`.
  `.claude/skills/responsive/SKILL.md` § Tier ladder permits four boundaries — 768 / 1024 / 1280 /
  1536 — and § Layout tokens gives tiered values to `styles/responsive.css` alone, so the rule
  violates both, and until 2026-08-27 it was argued only in a CSS comment while the
  2026-08-22 revision asserted the opposite.
  **Re-measured 2026-08-27** in Chrome, both consumers, `.data-table-wrap` clientWidth
  minus the 371px frozen pair (68px action + 303px name):

  | Viewport | Scroll window | Usable beside the pair |
  |---|---|---|
  | 375 | 279 | **−92** — columns 3+ unreachable |
  | 768 | 656 | 285 |
  | 1024 | 504 | 133 |
  | 1280 | 536 | 165 |
  | 1366 | 622 | 251 |
  | 1440 | 696 | 325 |
  | 1920 | 1176 | 805 |

  Identical on `screens/du-an/ho-so/hang-doi` (2800px, 15 columns) and
  `screens/du-an/ho-so/danh-sach` (3231px, 17 columns) — the pair and the page chrome are
  the same, so the table's own width does not enter. The widest scrolling column is
  287px in both.
  **Neither legal boundary is right.** Moving the query to `max-width: 1279px` keeps the
  freeze at 1280–1439, where 165px and 251px of scroll window mean the operator reads a
  slit and never sees a wide column whole. Moving it to `max-width: 1535px` drops the
  freeze at **1440px, the design width of both source frames**, which is the one
  composition Figma actually specifies. 1439 is empirically correct and structurally
  illegal.
  **The real reason it cannot sit on the ladder** is that its true trigger is not a
  viewport tier at all: it is *"is there room to read a scrolling column beside the
  frozen pair"*, which is `wrap width − frozen pair width` and depends on the frozen
  columns' widths, the nav rail and the page gutters. A container query on
  `.data-table-wrap`, or a measured class the way `syncSearchScrollRegion()` sets the
  search table's tab stop, expresses it honestly; a breakpoint only approximates it.
  Both are follow-ups, not per-screen fixes. **The package has since adopted a
  container query** — `design-system/components/data-viewer.md`'s `--cols`
  variant, on a named `section-card` container — so the tool this table's own
  freeze wants is no longer unprecedented here, only unapplied to this component.
  **Until then the 1439px query stays**, because the two legal alternatives are both
  measurably worse and because a 375px viewport with the freeze on is a table whose
  columns cannot be reached at all. It is recorded as a gap in
  `.claude/skills/design-rules/SKILL.md` too, since the violation is that document's rule.
- **A table hosted inside a card or a dialog is not a variant of this component,
  and it now has three consumers.** `.phase-table-wrap` (the `Các giai đoạn chính`
  card), `.investor-record` (the `Chủ đầu tư` dialog) and
  `.phase-editor .data-table-wrap` (the editable table inside the section-edit
  dialog), all in `screens/du-an/chi-tiet.css`, share one rule: a 12px-radius wrap with an inset
  1px rule instead of a border — a border takes 2px out of the wrap's content box
  and puts a table that fits exactly over its container — a `min-width` floor set
  from the drawn column widths rather than the listing floor of 1180px, and a
  transparent `thead th`. They also need a header-wrap exception: `.data-table th`
  is `nowrap`, which clips a two-word column label in a 140px column. Promote as
  `.data-table--card` in `styles/data-table.css` so the two screen-local copies
  can go. One of the three differs in where the ring sits: `.investor-record`
  puts it on a box holding the table AND its footer band, because
  `12035:63630` draws both inside one border with a rule between them — so the
  variant needs to say whether the ring belongs to the wrap or to a box around
  it, and `overflow: hidden` on that box is what makes the radius clip a sticky
  header's own fill.
  **And it must release `max-height` for the dialog-hosted cases** (added
  2026-08-19 with the `Chủ đầu tư` history). `.data-table-wrap`'s
  `calc(100dvh - var(--utui-scroll-region-offset))` is an estimate of a *page's*
  chrome; inside a dialog the panel is already capped at `100dvh - 64px` and
  `.modal__content` is already the region that scrolls. Keeping both puts two
  nested vertical scrollers in one surface — measured in Chrome at 1280x420 with
  a three-row investor history: a 120px wrap around a 275px table, i.e. one
  visible row, inside a content band itself scrolling 232px of 337px, with the
  footer band unreachable from the inner scroller. `.phase-editor
  .data-table-wrap` and `.investor-record .data-table-wrap` both release it now;
  the wrap stays `overflow: auto` for the horizontal axis, which is the only axis
  a dialog-hosted table should own. **The release belongs to the WRAP, not to the
  ring box** — on `.investor-record` those are two different elements, and
  `max-height: none` on the ring box is a no-op that reads as a release.
  **And with `max-height` gone the variant should declare `position: static` on
  its `thead th`** — as a statement, not as a fix. Two screen-local rules now do
  (`.phase-editor .phase-table thead th`, `.investor-table thead th`), and a
  third table (`.phase-table-wrap`, in a section body that does not scroll) is in
  the same position and does not.
  *Measured 2026-08-19, because two reviews in a row assumed the opposite.* The
  assumption was that an uncapped wrap stops being a scrollport, so the sticky
  header re-resolves against `.modal__content` and pins itself over the dialog's
  featured icon and title. It does not. `.data-table-wrap` carries `overflow:
  auto` unconditionally for the horizontal axis, and **any `overflow` other than
  `visible` makes an element a scroll container whether or not it has anything to
  scroll** — so the header always resolves against the wrap, and an uncapped wrap
  simply never scrolls it. In Chrome at 1280x420, with `position: sticky` forced
  back on and the dialog's content band scrolling 499px of 232px, the header's
  offset from its own table was 0px at `scrollTop` 0 and 0px at `scrollTop` 200;
  the phase editor's, scrolling 544px of 232px, was 0px and 0px. This is *Sticky
  column headers* above, unchanged: "without a `max-height` the box never scrolls
  and the sticky header does nothing."
  So the reason to declare it is hygiene, not correctness: a header that pins
  nothing should not be a positioned element with a `z-index`, and a table whose
  header never sticks should say so where a reader looks, rather than being
  inert by virtue of two other rules. Whichever way the variant goes, **do not
  answer this by restoring the cap** — that reintroduces the 120px window
  measured above, which is a real defect, unlike this one.
- **No 40px avatar in a table cell.** `--utui-table-cell-avatar-size` is 32px and
  `.user-cell__avatar` is the only size. The `Chủ đầu tư` dialog (`12035:63630`)
  draws 40px in its `Tên công ty` cell while the picker drawer draws 32px in the
  same cell style, so the axis is real and the frames use both. The dialog ships
  at 32px rather than pinning a literal; a size axis on `.user-cell` is the fix,
  and it sits next to the avatar-ramp deviation this contract already records.
- **`.user-cell__avatar` has no image slot, so one company can wear two faces on
  one screen — and that is ACCEPTED, not a bug to fix.** On `project-overview`
  the same company renders as its logo in the `Chủ đầu tư` card (a 64px
  `.avatar--2xl` with `.avatar__image`, per
  `design-system/components/avatar.md`) and as a two-letter monogram in both
  tables, because the table cell part draws initials only. Do **not** "fix" this
  by demoting the card to a monogram: the card is the one place the record is
  shown at identity size, the frame draws the photo there, and losing it would
  trade a real improvement for consistency with a known gap. The fix, when it
  comes, is an image slot on `.user-cell__avatar` — the same change as the size
  axis above, and it should land with it. Recorded 2026-08-19.
- ~~The table header cell was not reviewed; the demo rendered 52px against a
  44px token.~~ Resolved 2026-07-28 against MDM V2 `Table header cell`
  (`10004:14387`): 44px, `Text xs/Medium` on white, 12/24 padding. The token
  was already correct; the CSS was not.
- Only `Text`, `Lead text`, `Lead icon`, `Avatar`, `Badge` and (authored, 2026-10) `Progress bar` cell styles are
  implemented. Selection controls, trend, ratings, payment method,
  avatar group, and the full action-cell treatments are documented above but
  have no CSS.
- **`Giới hạn ký tự` clip (`.data-table--clip`) is wired with `data-tooltip-overflow`
  in `screens/doi-tac/danh-sach` and `screens/du-an/ho-so/danh-sach`.** Any other
  table adopting the clip must add the tooltip too, or a clipped string has no recovery.
- ~~Wrapping is unresolved between the two Figma sources.~~ Resolved
  2026-07-28 against MDM V2 `Table` (`10007:17211`): cells wrap, clamped to two
  lines. See *Wrapping* above.
- The MDM V2 `Table` is 13 columns totalling 2294px. The listing that replaced
  `item-listing` — `screens/du-an/danh-sach.html`, whose table is built in
  its bundle — draws **14 columns totalling 2620px**, so the table scrolls
  horizontally inside its panel; that is the intended behaviour, not overflow.
  The column set and the widths have drifted from the source frame and have not
  been re-read against it. The `pat-listing` frame shows a narrower 1076px
  instance of the same table.
- The `Avatar` cell renders a monogram rather than a photo; the Figma source
  uses a photo with a per-user background colour.
- `Disabled` cell state has a token but no implementation, since no current
  screen renders disabled rows.
- ~~The sticky-header `max-height` is a hand-tuned estimate.~~ **Resolved for the
  listing screens 2026-08-16**, by removing the subtraction rather than tuning it:
  under `.table-panel--fill` the wrap's height is what the page's height chain
  leaves over, so `--utui-scroll-region-offset` is not consulted at all and the
  sticky header engages at every viewport instead of only on short ones. The
  estimate survives where it is still the right rule — the `sm` tier, where the
  page scrolls again, and the drawer and upload panes that bound a table inside a
  surface of their own.
- `.cell-action` stays 40px under coarse pointers, below the 44px touch target,
  because 2 × 40px + a 4px gap is exactly the 116px action column minus its
  padding. Resolving it is a cell-spec decision, not a CSS override — see
  `.claude/skills/responsive/SKILL.md` Known Gaps.
- Headless screenshots of the scrolled table show a few pixels of row text at
  the header's lower edge. All computed values are correct (`position: sticky`,
  `z-index: 2`, opaque background, overlapping cells all `static`/`auto`), and
  the artifact survives every paint-order fix, so it is most likely a headless
  compositing artifact rather than a real defect — **verify in a real browser**
  before treating it as a bug.
- ~~`--utui-table-row-alt-bg` resolves to the wrong colour and should be
  repointed.~~ **Resolved 2026-08-20.** It was `var(--utui-color-bg-page)`
  (`#FFFFFF`), which is not an alternating fill of anything; it is
  `var(--utui-color-neutral-50)` now, and `.data-table--striped` consumes the
  component token instead of reaching through to the primitive. Verified by grep
  that the token had no other consumer before the change — the only hits outside
  its own declaration were this file, the CSS comment beside the striped rule and
  a reviewer note — so the blast radius was zero and nothing rendered differently
  either side of it.
- **`.data-table--striped` hover is a no-op on the filled rows, and the obvious
  fix fails AA** (2026-08-20, open). `--utui-table-row-hover-bg` is the same
  `Neutral/50` as the fill. Scoping it to `Neutral/100` `#F5F5F5` inside the mode
  is one line and needs no new selector, but `.cell-empty` (`Neutral/500`
  `#737373`) measures **4.35:1** there against 4.54:1 on the zebra, so it was not
  shipped. Needs an owner to pick between inverting the hover on a filled row
  (white, no new text surface, but it inverts hover polarity) and repointing
  `.cell-empty` to `Neutral/600` (a package retint). Measurements and both
  candidates are under *The zebra and hover*. This is the reason the mode is
  marked unreleased.
- **`.is-editing` under a zebra has no row-level cue, and that is DECIDED, not
  broken** (2026-08-20). `--utui-table-row-editing-bg` is `Neutral/50` too, so on
  an odd striped row the editing tint paints nothing and the controls in the cells
  are the cue. Editing keeps `Neutral/50`; a second hue is a colour-meaning
  decision for the DS owner, and the token's own comment
  (`design-system/tokens/css/untitled-ui-component.css`, the
  `--utui-table-row-editing-bg` block) already anticipated the divergence. Open
  question routed to the DS owner: does "editing" get its own value once a striped
  table exists, or does the mode simply stay off editable tables?
- **The header label is `Neutral/600` `#525252`, the DS `Table` set draws
  `#344054`** (2026-08-20). **Decided: keep `Neutral/600`** — see divergence 4.
  Not a contrast decision in either direction: the DS value is the darker of the
  two (10.46:1 against 7.81:1 on white). It is byte-identical to
  `--utui-table-cell-text`, so adopting it would collapse the header-to-body tonal
  step on a 13-column table scrolling under a sticky header, and
  `--utui-table-muted-text` is read package-wide, so the change would be a package
  retint dressed as a table fix. The remaining question — which ramp a header
  label belongs to across the package — is routed to a DS owner.
- **`.cell-action` has no `border-radius`, the DS button wrapper has 8px**
  (2026-08-20). **Scheduled, not deferred:** `border-radius: var(--utui-radius-md)`
  is correct on substance. The wrapper has no fill and no border in Figma either,
  and `styles/base.css` gives buttons a `box-shadow` focus ring whose spread
  follows `border-radius`, so the only observable change is the corner shape of
  the focus halo. It gets its own change because it needs a focus-state pass over
  four action-column patterns (116px pair, 68px overflow, 72px chevron, phase-table
  delete) plus a clip check against `.data-table :is(th, td) { overflow: hidden }`.
- **The DS's mobile column clipping is a DS-versus-product conflict, not a settled
  divergence** (2026-08-20). The extracted spec records no horizontal-scroll
  affordance in the mobile node, and a static frame cannot express one, so there
  is no instruction being overridden — but the disagreement runs across 8 of 16
  variants of the DS set, which is wider than one component contract should close
  on its own. This package keeps columns reachable inside a labelled, focusable
  `.data-table-wrap`; a DS owner should confirm that reading. See *Observed in the
  DS `Table` set, not implemented*.

- **No sort affordance, and the DS set has a slot for one.** Added 2026-09-04
  from the `Table header cell` set: its label carries an `Arrow` axis — a 16px
  `arrow-down` in a 4px gap, `fg/secondary` `#404040` — and a `Help icon` axis
  (16px `help-circle`, drawn `False` in all 8 variants of this set). This package
  has neither the glyph nor `aria-sort` nor a sort behaviour on any of its
  tables, and the three are one piece of work: a header that shows a sort arrow
  it cannot act on, or sorts without announcing `aria-sort`, is worse than a
  header with no arrow. Not built for that reason, not for cost. The screens
  that need it most are the ones that already scroll — `du-an/ho-so/danh-sach`
  (17 columns) and `du-an/ho-so/hang-doi` (15).
- **Row selection: built once, on `du-an/ho-so/danh-sach` (2026-10).** The checkbox
  wraps the name cell (`.cell-select` in `th[scope=row]`, no extra column, so the
  frozen-column rules stand), the header carries the tri-state select-all
  (`.choice:indeterminate`), the row takes `.is-selected`, and the bulk bar is
  `snack-bar.md`. Still open: "select all N across pages" (selection is the current
  page only) and selection inside the search-results table.
- **GAP: no compact-table modifier.** A table in a narrow dialog
  (`du-an/ho-so/danh-sach` permission-check drawer, `.perm-list`: `Lead checkbox` + `Badge` columns, one-line cells, compact padding) overrides `min-width`, `table-layout`, cell
  `height` / `padding-block` and `.cell-text` line-clamp (1) locally in the screen CSS (`.perm-list`). A `.data-table--compact`
  modifier would own that; not created.
- **The DS checkbox rim is one step lighter than this package's, and both fail
  1.4.11.** `_Checkbox base` (`1100:296`, read in two DS sets on 2026-09-04)
  draws `border/primary` `#E5E5E5` — 1.27:1 on white — against
  `--utui-choice-border` `#D4D4D4` at 1.47:1. Divergence 13 keeps the darker
  value; the criterion needs 3:1 and neither reaches it, so a rim colour that
  passes is a DS decision this component cannot take alone.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/data-table.md`](docs/revisions/data-table.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-12 (`pat-listing` re-read)
- 2026-08-13 (`Phân cấp`, the hierarchy table)
- 2026-08-14 (`Tìm kiếm folder/file`, the search-results table)
- 2026-08-14 (`Tạo dự án mới`, the first editable table)
- 2026-08-14 (`Slide out menu`, the investor picker table)
- 2026-08-18 (routed from the hierarchy and documents legs)
- 2026-08-20 (the editable investor history)
- 2026-08-20 (the editable cell's select is a `.select`)
- 2026-08-20 (the DS `Table` set)
- 2026-08-20 (UX review gate on `.data-table--striped`)
- 2026-08-22 (the action column leads, and it is frozen)
- 2026-08-22d (the archiving request lands on the document row)
- 2026-08-27 (the archive queue's action column is a link, not a menu)
- 2026-09-22 (two more editable cells, and one control per row)
- 2026-09-22b (the row table is promoted, and cells can be required per row)
- 2026-09-04 (synced against the DS `Table header cell` set)
- 2026-09-05 (`Badges multiple` implemented; `project-list` is 15 columns)
- 2026-09-05b (cell geometry re-synced: 16/12, 56px)
- 2026-09-08 (the row as the control, and a CTA column beside it)
- 2026-09-16 (the scrollbar is shown on hover)
- 2026-09-16b (the frozen action column enters the contract)

## Name cell with format chip (`.file-chip--sm`)

- `.cell-lead` = `.file-chip.file-chip--sm` (32px, `aria-hidden`) + `.entity`. Every file the same extension (one or many) → `file-<ext>.svg` (unknown ext: `file-document.svg`). Different extensions (compare real ext, doc ≠ docx) → `.file-chip--multi` (hook only, no style of its own): `file-multi.svg` (gray-700 page, no letters) + `<span class="file-chip__count">` with the TOTAL file count (`99+` from 100; the sr label carries the real number). An attachment is mandatory, so there is no empty-file glyph. GAP: trang gray-700 + số text-xs 12px chờ designer xác nhận (2026-10-05).
- Text "N tệp: JPG, DOC" (distinct, upper-case, file order) goes in a `.sr-only-label` that `.entity-title` points to with `aria-describedby`, and in `data-tooltip` on the chip (hover only; the chip is not focusable).
