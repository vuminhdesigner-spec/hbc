# Pagination

## Purpose

Pagination is the band under a table. It moves a user through a paged record
set, and it carries the footer's utility actions and result count. It owns page
navigation only; it never owns the table body, filters, or row selection.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Pagination`, node `1115:68622` |
| `Type=One page` | `1115:68886` |
| `Type=Multi-page` | `1115:68618` |
| `Type=Table Edit` | `10194:63880` |
| Pager button atom | `_Pagination button group base`, set `1114:68857` |
| Button atom in the Actions slot | `Buttons/Button`, set `1038:34411` (`Size=sm`) |
| Reviewed via | Figma Dev Mode MCP (`get_metadata` + `get_design_context`), 2026-09-05 |
| Previous read | Figma REST node API, 2026-08-19 — superseded, see the revision at the end |

`Pagination button group` (`1114:69397`) was in this table until 2026-09-05. It
is **not** in the file any more: `get_metadata` returns "node not found" for it,
and the atom above lost the `Middle` hierarchy and both number-cell `Icon` values
that composed it. The joined page group is gone from the design system, and the
package no longer draws it.

The utility actions (`Tải lại`, `Thiết lập`, `Tải xuống`, `Thêm dòng`) and the
result count (`6 kết quả`) are local customizations already present in this Figma
file, not stock Untitled UI content.

## Anatomy

- **Container** — a full-width `SPACE_BETWEEN` / `CENTER` row with a 1px
  Neutral/200 rule along its top. Every type draws it.
- **Actions slot** — an optional horizontal group of `Size=sm` buttons, 12px
  apart. Governed by the set's one boolean property, `CTA` (default `true`),
  which shows or hides the whole slot. Its contents are per instance, not per
  type: a consumer may switch individual buttons off.
- **Pager** — two **detached** buttons 8px apart, drawn by `Multi-page`:
  `Trang trước` with a leading `arrow-left`, `Trang sau` with a trailing
  `arrow-right`. Each carries its own full border and its own 8px radius. There
  is no number run, no truncation cell, and nothing joining them.
- **Result count** — a short `Details` text, right-aligned, drawn by every type.
  A bare total (`6 kết quả`) in `One page` and `Table Edit`; a **range**
  (`1-50/500 kết quả`) in `Multi-page`, 24px after the pager, where it is the only
  thing that says where in the set the reader is.

## Variants

### Type

Three values, and nothing else.

| Type | Composition |
|---|---|
| `One page` | Three utility actions left (`Tải lại`, `Thiết lập`, `Tải xuống`), bare count right. No pager. |
| `Multi-page` | The same three actions left, then the pager and its range count right. |
| `Table Edit` | `Thêm dòng` (`Hierarchy=Secondary color`) + `Thiết lập` left, bare count right. No pager. |

**All three are 60px**, and for the first time the height is not a variant fact:
every type is a 36px `sm` button row inside 12/12 padding. It was 64/68 while the
set drew 12 top / 16 bottom and `Multi-page` held a 40px joined group.

`Table Edit` settles an ownership question this contract once carried open: the
editable phase table's footer — a data action beside a view utility — is a
Pagination type, not a table part.

### `Prev-next`

**Never existed as a type.** The 2026-09-05 read of the product frame
`Danh sách dự án` found this composition before the DS carried it and the package
named it `Type=Prev-next` provisionally; the same day's read of the set showed the
DS had redrawn `Multi-page` as exactly this. One type, one name: `Multi-page`.

### Shape, Breakpoint

**Gone**, since the 2026-08-19 read, along with the nine-value `Type` axis and
the separate-number compositions (`Page default`, `Card default`, the
`Card minimal` / `Card button group` alignment family).

## States

The states are on `_Pagination button group base` (`1114:68857`), which is now
`Hierarchy` (Leading / Trailing) x `Icon` (True) x `State` — six variants, both
hierarchies a labelled arrow button.

| State | Fill | Label |
|---|---|---|
| `Default` | Neutral/0 `#FFFFFF` | Gray/900 `#101828`, Text sm/Semibold |
| `Focused` | Neutral/50 `#FAFAFA` | Gray/900 `#101828` |
| `Active/hover` | Neutral/50 `#FAFAFA` | Gray/900 `#101828` |

Three things follow:

- **Hover and focus are one paint.** Same fill, same label colour, and the set
  distinguishes them by nothing. Do not invent an intermediate tint, and do not
  read the fill as a current-page marker — there is no current-page cell left for
  it to mark.
- **The label is `text/primary`, not `text/secondary`.** A secondary
  `Buttons/Button` beside it in the same band is `#344054`; this one is `#101828`.
- **`Focused` draws no ring** — only the Neutral/50 fill, which is 1.03:1 against
  the Default it replaces and cannot carry focus by itself (WCAG 2.4.11). The
  package pairs the fill with the app's ordinary outer halo. A recorded deviation.

**There is no `Disabled` state in the set.** The package adds one, because the
first and last page leave a direction with nowhere to go. Also a recorded
deviation.

## Tokens

| Role | Token | Value in the set |
|---|---|---|
| Footer top border | `--utui-pagination-footer-border` | Neutral/200 `#E5E5E5` |
| Footer padding | `--utui-pagination-footer-padding-x` / `-top` / `-bottom` | 24 / 12 / 12 |
| Footer height floor | `--utui-table-footer-height` | 60px |
| Utility action gap | `--utui-pagination-actions-gap` | 12px |
| Result count text | `--utui-pagination-count-text` | Gray/700 `#344054`, Text sm/Medium |
| Pager button gap | `--utui-pagination-nav-gap` | 8px |
| Pager to count | `--utui-pagination-pager-gap` | 24px |
| Pager button height | `--utui-pagination-nav-height` | 36px |
| Pager button side padding | `--utui-pagination-nav-padding-x` | 16px |
| Pager button radius | `--utui-pagination-nav-radius` | 8px |
| Pager button border | `--utui-pagination-nav-border` | Neutral/200 `#E5E5E5` |
| Pager button fill | `--utui-pagination-nav-bg` | Neutral/0 `#FFFFFF` |
| Pager button label | `--utui-pagination-nav-text` | Gray/900 `#101828` |
| Hover / focus fill | `--utui-pagination-nav-active-bg` | Neutral/50 `#FAFAFA` |
| Disabled label | `--utui-pagination-nav-disabled-text` | *not drawn by the set* — package addition |

The twelve `--utui-pagination-group-*` steps and `--utui-pagination-item-size`
came out on 2026-09-05 with the control they painted. Focus needs no token of its
own: `--app-focus` from `base.css` is the indicator, because these buttons are
detached and nothing clips them.

## Layout Contract

- The two pager buttons are 36px, not the app's default 44px. The set draws them
  and the utility actions beside them at the same height, and the band reads as
  one row because of it.
- They carry **no shadow**. `Buttons/Button` has Shadow/xs; the pager atom does
  not, and that is the one place the two disagree.
- They are `.button`s in the markup — what the frame draws is a bordered
  secondary control, which is the button component — with the geometry above
  applied by `.pagination-nav .button` in `styles/pagination.css`. Not a new
  button hierarchy: nothing outside a table footer draws it.
- **One composition in every state.** A `Multi-page` footer does not switch to
  `One page` when the set fits on a page. The range count already reads
  `1-50/50`, and both buttons are `disabled` at the ends. This reverses the rule
  the joined group needed, where a single cell between two dead arrows said
  nothing at all. `One page` remains the type for a footer that does no paging —
  a search-results list, a record's own history.
- The count is a range in `Multi-page`: `first-last/total kết quả`, with `first`
  zero when the set is empty.
- The footer wraps rather than squeezing (`flex-wrap: wrap`, 12px row gap), and
  `.pagination-pager` takes `margin-left: auto` so it keeps the far edge on a
  wrapped line. Two labelled buttons and a range count are wider than the joined
  control they replaced, and the first thing a `nowrap` flex row gives up is the
  buttons' own text.
- At `sm` the footer stacks, the utility action row wraps, and the pager wraps —
  all three in `styles/responsive.css`, because they are tier behaviour. Wrap,
  never shrink the buttons or drop the third action.

## Usage

Use `Multi-page` for any table that pages, `One page` for a footer that only
counts, and `Table Edit` for an editable table whose footer adds rows. Use the
`CTA` boolean, or hide individual buttons in the Actions slot, when a screen has
fewer utilities to offer — read the slot's hidden children rather than assuming
three.

Avoid using Pagination for step-by-step wizards, tabs, or carousels; those are
separate navigation problems with different affordances.

## Accessibility

- **The landmark is the whole pager, count included.** `<nav
  class="pagination-pager" aria-label="Phân trang">` holds the button pair in a
  plain `<div class="pagination-nav">` and the count beside it. A landmark around
  the buttons alone gave a screen-reader user who jumped to it two direction
  controls and no position at all — and unlike the joined group it replaced, this
  composition has no `aria-current` cell, so pressing `Trang sau` announced
  nothing. A footer with no pager gets **no** `<nav>`: a navigation landmark with
  nothing to navigate is noise.
- **Each button is `aria-describedby` the count.** Not `role="status"`: the
  footer is rebuilt on every keystroke of the toolbar search, so a live region
  would read the position out while the user is typing — the same defect
  `design-system/patterns/search-results.md` records for the list regions. A
  description is read on focus, which is when it is wanted and never otherwise.
- The buttons carry their direction in **visible text**, so they take no
  `aria-label`: one would be a second copy of the same name. Their icon is
  `aria-hidden`. `data-page-intent="prev" | "next"` is what code matches on, for
  the same reason.
- Use native `disabled` for a direction with nowhere to go, so it is announced as
  unavailable rather than only painted grey.
- **Focus must be visible.** The set's `Focused` fill is 1.03:1 and cannot carry
  it. The package uses the app's outer halo from `base.css` — restated in
  `.pagination-nav .button:focus-visible` only because the resting rule sets
  `box-shadow: none` and would otherwise win by source order. The inset ring the
  joined group needed is gone with the group: it existed because those cells
  abutted and the strip scrolled at `sm`, and neither is true of two detached
  buttons.
- **44px targets under `pointer: coarse`.** `.pagination-nav .button` is in that
  list in `styles/responsive.css`.
- **A footer that re-renders its own region must put focus back.** The consumer
  replaces the markup containing the control the user just pressed, so focus
  falls to `<body>`. `V2Pagination.restoreFocus(root, intent, fallback)` in
  `scripts/pagination.js` is the shared implementation, and its rungs are in
  order: the button matching `intent` while it is still enabled, then **the
  still-enabled sibling** (at the last page the pressed `Trang sau` comes back
  disabled and landing on the first button silently reverses direction), then any
  pager button, then **the count**, then the caller's fallback.
- **The count carries `tabindex="-1"` and an `id` in a `Multi-page` footer.** The
  `tabindex` is the rung that catches a press leaving both buttons disabled;
  without it the restore fell through to the screen's search input and the
  operator's next keystroke re-filtered the list. It is out of the tab order — the
  count is a description, not a stop. The `id` is what the buttons describe
  against, and must be unique per screen. A `One page` count needs neither.
- Announce a page change through the screen's single `role="status"` line, never
  by making the table a live region — see `design-system/patterns/search-results.md`,
  which records why `aria-live` came off all three list regions.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Focus restore | `restoreFocus()` in `scripts/pagination.js`, published as `window.V2Pagination`. Load before the screen bundle. Do not copy into a bundle — the screen with no copy silently dropped focus on every page change, and two of the three copies of the page-number window it used to hold had drifted. |
| Footer container, actions slot, count | `.table-footer`, `.pagination-actions`, `.pagination-count` in `styles/pagination.css` |
| Pager | `.pagination-pager` (the landmark, and the 24px gap to the count), `.pagination-nav` (the 8px button pair), `.pagination-nav .button` in `styles/pagination.css`. Both are class hooks, not element hooks — the landmark is on the outer box and the inner one is a plain `<div>`. |
| Tier behaviour (stack, wrap, touch target) | `styles/responsive.css` only |
| `Multi-page` examples | `screens/du-an/danh-sach.js` (`renderPagination()`), `screens/du-an/ho-so/danh-sach.js` (`renderPagination()`), `screens/du-an/ho-so/hang-doi.js` (`renderPagination()`), and the `Chủ đầu tư` picker drawer in `screens/du-an/chi-tiet.js` (`pickerPagination()`) |
| `One page` examples | `screens/du-an/phan-cap.js` (`renderFooter()`) and `screens/du-an/ho-so/danh-sach.js` (`onePageFooter()`, the search-results footer) |
| `Table Edit` example | `scripts/phase-table.js`, used by `screens/du-an/tao-moi.js` (`du-an/chinh-sua.js` removed 2026-09-28 — no màn chỉnh sửa) |
| Product deviation: a single CTA in the Actions slot | `renderInvestorRecord()` in `screens/du-an/chi-tiet.js` — `Đổi chủ đầu tư`, a full-size `Hierarchy=Secondary color` button (leading `add`), with the count on the right. Neither `One page` nor `Table Edit`; it is the `Chủ đầu tư` dialog frame (`12035:63630`) using the footer band for the record's own CTA. Kept as drawn. The band has no pager — see `design-system/patterns/project-overview.md` Known Gaps for what a long history costs. |

## Class Contract For Static HTML

`Type=Multi-page`:

```html
<footer class="table-footer">
  <div class="pagination-actions">
    <button class="button button--compact" type="button" data-action="reload">…</button>
    <button class="button button--compact" type="button" data-action="settings">…</button>
    <button class="button button--compact" type="button" data-action="download">…</button>
  </div>
  <nav class="pagination-pager" aria-label="Phân trang">
    <div class="pagination-nav">
      <button class="button" type="button" data-page-intent="prev" aria-describedby="listPageCount" data-page="1" disabled>…Trang trước</button>
      <button class="button" type="button" data-page-intent="next" aria-describedby="listPageCount" data-page="2">Trang sau…</button>
    </div>
    <p class="pagination-count" id="listPageCount" tabindex="-1">1-50/500 kết quả</p>
  </nav>
</footer>
```

`Type=One page`. The count is a `<p>` with no `tabindex`, and there is no `<nav>`:

```html
<footer class="table-footer">
  <div class="pagination-actions">
    <button class="button button--compact" type="button" data-action="reload">…</button>
    <button class="button button--compact" type="button" data-action="settings">…</button>
    <button class="button button--compact" type="button" data-action="download">…</button>
  </div>
  <p class="pagination-count">8 kết quả</p>
</footer>
```

`Type=Table Edit`. The first action is a `Hierarchy=Secondary color` button that
ADDS a row rather than acting on the view:

```html
<footer class="table-footer">
  <div class="pagination-actions">
    <button class="button button--compact button--secondary-color" type="button" data-action="add-row">…</button>
    <button class="button button--compact" type="button" data-action="settings">…</button>
  </div>
  <p class="pagination-count">4 kết quả</p>
</footer>
```

## Known Gaps

- **No mobile composition, in the set or in the package.** The `Breakpoint` axis
  and its `Page X of Y` form have been gone from the set since the 2026-08-19
  read, so the unbuilt mobile composition this contract once carried is no longer
  a gap against the source — but it is also no longer specified. What ships at
  `sm` (footer stacks, actions wrap, pager wraps) is a package decision with **no
  design evidence behind it**. Confirm with the designer before shipping a
  mobile-facing listing screen; do not treat the current behaviour as spec.
- **`CTA=false` has no consumer.** Every footer in the package draws its Actions
  slot. The type with no actions at all is drawable in Figma and untested here.
- **The set draws no `Disabled` and no real focus indicator.** The package adds
  both (see States). They are the package's values, not the DS's, and they should
  be pushed back into the component set rather than living only here.
- **The pager grows to 44px on a coarse pointer and the utility actions do not.**
  `.pagination-nav .button` is in the `pointer: coarse` list; `.button--compact`
  is not, so the band is 44/36 ragged on touch. Inherited from when the page cells
  were the thing that grew. It is every compact button in the package, not this
  component's to settle alone.
- **A focused count has no visible indicator.** `restoreFocus()` lands on
  `.pagination-count[tabindex]` at page 1, and Chrome does not match
  `:focus-visible` on a programmatically focused non-interactive element, so the
  operator is announced their new position but not shown it. Acceptable as a
  focus holder, unresolved as a visual.
- **The footer renders 1px taller than the set.** The set's 60px includes its own
  1px top stroke; a CSS `border-top` adds to the box, so the package measures 61.
  One pixel, shared by every bordered band in the package; a fix would mean paying
  11px of padding-top to hide the border, which is worse.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/pagination.md`](docs/revisions/pagination.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-19 (re-synced against a redrawn component set)
- 2026-08-14 (`.pagination-group` scrolls at sm)
- 2026-08-14 (`project-docs` footers carry one utility action)
- 2026-09-05 (`Type=Prev-next`, and the footer wraps)
- 2026-09-05 (the DS deleted the joined page group)
