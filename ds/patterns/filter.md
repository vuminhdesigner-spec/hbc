# Filter (pat-fi)

## Purpose

Filter is the field-level narrowing control on a listing screen: a popover under
the toolbar's `Bộ lọc` button holding one row per filterable field, and an
applied state on the trigger that says how many conditions are live.

It is the counterpart to `design-system/patterns/search-results.md`. **Search asks "where is
this thing"; filter asks "show me only rows like this".** They are different
questions, they use different controls, and on a screen with a folder hierarchy
they behave differently: a query replaces the browse layout, a filter narrows
whatever table is showing.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 |
| Figma file key | `tS8dUB2qWLc28gZbtj8IIL` |
| Section | `Bộ lọc`, node `10780:69646` |
| Component | `filter-expand`, node `10780:73530`, 698 x 632 |
| Applied state | the toolbar in `filter-applied`, showing the trigger with a `3` count |
| Reviewed via | Figma MCP + section screenshots, 2026-08-14 |

The popover shell, its row and the trigger's applied treatment are the
**component** and are specified in `design-system/components/filter-panel.md`. What is here is
the composition: which fields, which operators per field type, what applying does
and how it interacts with search.

## Anatomy

1. **Trigger** — the toolbar's `Bộ lọc` button, unchanged in position and style.
   `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
2. **Popover** — ten filter rows over a right-aligned footer.
3. **Row** — field name (static) / operator (`<select>`) / value
   (`<select>` or text `<input>`).
4. **Footer** — `Xóa bộ lọc` (secondary, `delete`) then `Lọc` (primary, `done`).

## Content Slots

What each filter row needs: the field it names, the type that decides its
operator set, and the control that takes its value.

### Fields

In source order, as the frame draws them.

| # | Field | Type | Value control | Backed by mock data |
|---|---|---|---|---|
| 1 | Trạng thái | enum | select | yes — `status`, but **no column renders it** (see below) |
| 2 | Người tạo | enum | select | yes — `creator.name` |
| 3 | Ngày tạo | date | select (see gap) | yes — `createdAt` |
| 4 | Ngày văn bản | date | select (see gap) | yes — `docDate` |
| 5 | Nơi phát hành | text | text input | yes — `issuer` |
| 6 | Nơi nhận | text | text input | yes — `recipient` |
| 7 | Cụm dự án | enum | select | **no — decorative** |
| 8 | Người cập nhật | enum | select | yes — `updatedBy.name` |
| 9 | Ngày cập nhật | date | select (see gap) | yes — `updatedAt` |
| 10 | Người nhận | enum | select | yes — `receiver.name` |

Nine of ten filter the table for real. **`Cụm dự án` is decorative**: no record in
this screen's data carries a project cluster, so the control is drawn — the frame
draws it — with no options, and it cannot constrain anything. That is recorded
rather than faked with invented values; a PO decides whether the field belongs on
this screen at all.

Select options are derived from the data, never hand-written, so a filter can
never offer a value no record has.

### Operators

Per field **type**, not per field.

| Type | Operators |
|---|---|
| enum | `Bằng`, `Không bằng`, `Chứa`, `Không chứa` |
| text | `Bằng`, `Không bằng`, `Chứa`, `Không chứa` |
| date | `Bằng`, `Không bằng`, `Trước`, `Sau` |

`Bằng` is the default on every row.

**The vocabulary is Excel's and Google Sheets', not this package's — set
2026-09-16.** The people who use this portal filter spreadsheets every day, so
the words for these conditions are already in their heads and inventing a second
set buys nothing. Microsoft's Vietnamese Excel ships `Bằng`, `Không Bằng`,
`Chứa`, `Bắt đầu Bằng`, `Kết thúc Bằng`, `Lớn Hơn`, `Ở Giữa`, `Trước`, `Sau`
under `Bộ lọc Văn bản` / `Bộ lọc Số` / `Bộ lọc Ngày`. Sheets splits the same
job into `Lọc theo điều kiện` and `Lọc theo giá trị`.

Two rules follow, and both changed what this package shipped:

- **Spell the operator, never draw it as a symbol.** `=` became `Bằng`. Neither
  spreadsheet uses a bare glyph, a screen reader reads `=` as "equals" or as
  nothing depending on the engine, and a symbol column beside a spelled-out
  `Không chứa` was already inconsistent with itself.
- **Use their word where they have one.** `Khác` became `Không bằng` (Excel's
  `Không Bằng`) and `Trong khoảng` became `Ở giữa` (Excel's `Ở Giữa`). Sentence
  case is this package's, not Microsoft's title case — `Không chứa` was already
  written that way.

**The DS component draws `=` and this package no longer does.** `Filter/Expand`
(`10094:9535`) shows `=` on four of its six sample rows. Those rows are sample
content in a shell, the operator vocabulary is composition and lives here, and
the divergence is recorded in `design-system/components/filter-panel.md` rather
than taken silently. If a designer wants the symbol back it is one label per
type in this table.

**Only three operators are drawn at all.** The frame shows `=` on eight rows,
`Không chứa` on `Trạng thái` and `Chứa` on `Nơi nhận` — enough to establish that
enums carry contains/not-contains, and nothing else. The rest are the honest
completion of each type; a designer or PO should confirm the sets.

### Dates are a range — answered 2026-09-16

~~whether dates need a range (`Từ` / `Đến`) rather than the four scalar
comparisons above~~ — **MDM-823 AC2 answers it: `Date Range`.** `partner-list`
(`screens/doi-tac/danh-sach.*`) is the first screen in the package to build one,
and it adds a fourth type to the table above:

| Type | Operators | Value control |
|---|---|---|
| date-range | `Ở giữa` — the only one | two `<input type="date">`, `Từ` and `Đến` |
| enum-multi | `Là một trong` — the only one | multi-select tag control |

Two consequences the two existing date consumers have not taken yet, and both
are real inconsistencies rather than pending work someone forgot:

- **`project-docs` still offers the four scalar date operators** on its three
  date rows. Whether the ticket's answer generalises to that screen's fields is a
  PO call — a request's due date is not a record's creation date — so it is
  recorded here rather than changed underneath it.
- **A one-operator type draws its operator as static text, not as a select.** A
  combobox that cannot select is a control that opens to tell the user they have
  no choice. `.filter-op-static` (`styles/filter-panel.css`, promoted 2026-10-06 on
  its second and third consumers) draws it; `partner-list`, `project-docs` and the
  DC queue apply it to their multi-choice rows (`Là một trong`).

**`Là một trong` is the one label with no spreadsheet precedent, and that is a
fact about the control rather than about the words.** Neither Excel nor Sheets
gives multi-select an operator: Excel's `(Chọn Tất cả)` checkbox list has no
operator row at all, and Sheets files it under `Lọc theo giá trị`, a *mode* that
sits beside `Lọc theo điều kiện` rather than inside it. This panel has no such
mode — every row is field / operator / value, so a multi-select row has an
operator slot that has to say something. `Là một trong` is what fills it.

`Bằng` cannot: the value beside it is a set, and `Mã hệ thống Bằng [A, B, C]` is
not a statement. Worth knowing if a later revision adds a value-picker mode —
that is the change that would let this label go away, and nothing short of it
will.

Semantics for the range: both ends are **inclusive**, either end may be left
empty (giving an open range), and a record whose date is empty matches no range
at all — the same answer SQL gives, and the same reasoning that drops folders
from a filtered document listing below.

Semantics: comparisons are case-insensitive; dates are compared by **day**, not
by timestamp, because the mock stamps every record 09:00 and the frame's control
offers no time. `partner-list` compares its `dd/mm/yyyy` values and the date
input's `yyyy-mm-dd` through one `yyyymmdd` key, for the same reason.

## States

| State | Behaviour |
|---|---|
| Closed | Panel `hidden`, and not keyboard reachable. Trigger `aria-expanded="false"`. |
| Open | Focus moves into the panel and cycles inside it. Trigger `aria-expanded="true"`. |
| Editing | The panel edits a **draft**. Closing without `Lọc` changes nothing. |
| Applied | Panel closes, focus returns to the trigger, the trigger gains a count badge and a tint, the table re-filters, the result count is announced. |
| Cleared | `Xóa bộ lọc` empties every row and drops the badge immediately — it is not a draft edit. |

### The applied signal is the count, not the tint

The trigger gains a brand tint **and** a badge with the number of live
conditions. The badge is the signal; the tint is reinforcement. A filtered
toolbar that differed from an unfiltered one by border colour alone would be
invisible to a large share of users, and the button's `aria-label` carries the
same fact (`Bộ lọc, 2 điều kiện đang áp dụng`).

### Draft vs applied

Two copies of the filter state, deliberately. The panel edits `draft`; the table
reads `applied`; `Lọc` copies one to the other. Anything less means dismissing
the panel silently changes the table.

## Composition Rules

Rules this pattern owns about how it combines with the surfaces around it.

### How filter composes with search

**They compose. Both are predicates over the same set, and they AND together.**

This was the open question `design-system/patterns/search-results.md` recorded, and the
alternative — `Bộ lọc` exits the search state — was rejected: a control that
silently discards the user's query is a worse surprise than one that narrows it,
and the toolbar shows both controls at once, which promises they both apply.

Two consequences follow, and both are consistent rather than special cases:

1. **Folder results drop out while a filter is active.** All ten fields are
   document fields; a folder has none of them, so it cannot satisfy a condition.
   That is the answer SQL gives.
2. **A category listing empties while a filter is active,** for the same reason —
   its rows are sub-folders, not documents.

The same rule is applied in **all four** places the screen lists rows, so a
folder never survives a filter in one region and not another.

### The filter applies to the folder grid too

`project-docs` lists rows in four places, not three: the browse table, the
category listing, the search results table — and the **folder grid**, the
toolbar's second view mode. Until 2026-08-14 the grid took no predicate at all,
so pressing `Lọc` in that mode painted a count badge on the trigger, announced a
number, and changed nothing on screen. The number was worse than the silence: it
was the row count of the hidden *table*, so a screen-reader user was told the
size of a region they were not in.

The decision, taken as the honest reading of "a filter narrows whatever is
showing" rather than deferred:

| Rule | Behaviour |
|---|---|
| Documents in the grid | Filtered by the same `matchesFilters()` predicate the tables use |
| Folders in the grid | **Dropped while any filter is active** — same reason as rule 1 above: all ten fields are document fields |
| Root level of the grid | Shows only folders, so an active filter empties it |
| Announced count | The count of what the **visible** region shows — grid cards in grid mode, table rows in table mode, hits in the search state |

Measured 2026-08-14 at 1440px, filter `Trạng thái = Đã xử lý`, grid pointed at
`Giấy chứng nhận đăng ký đầu tư (IRC)`: 7 cards before, 6 after, announced
`6 kết quả sau khi lọc`, and the hidden browse table holds the same 6 rows.
Returning to the grid root with the filter still active shows 0 cards.

**A PO may prefer the other answer: hide the `Bộ lọc` trigger in grid mode.**
The grid shows a name and a format and none of the ten filtered fields, so a
user filtering by `Nơi phát hành` there cannot see why a card vanished. Hiding
the control would follow the precedent already set for `Kiểu hiển thị`, which
this screen hides in the search state because it has no function there. It is
not implemented because a filter that silently stops applying when the view mode
changes is the worse of the two failures, and because dropping a control is a
design decision. Flagged, not resolved.

The grid's empty state is the folder-empty copy (`Thư mục này chưa có nội dung`),
which is wrong when a filter is what emptied it — the same gap already recorded
below for the table.

## Responsive

The panel adds no breakpoint of its own beyond the row stack the component owns
(`design-system/components/filter-panel.md`).

It is `position: fixed` and placed by the screen, which is what keeps it off the
document's scroll width — an absolutely positioned 698px panel anchored
mid-toolbar overflows the page at 375px, which the responsive contract forbids.
Placement prefers below the trigger, flips above only when below is genuinely
unusable (< 320px), clamps to the viewport, and publishes the available height to
the panel so the rows region scrolls and the footer stays reachable.

Measured 2026-08-14 at 375 / 768 / 1024 / 1280 / 1440 / 1920, panel closed, open,
applied, composed with a query, and after Escape:
`document.documentElement.scrollWidth` equals the viewport at every width and in
every state; the panel is fully inside the viewport and its footer visible at all
six. Re-measured the same day across 13 states × 6 widths (browse, search,
zero-result, leaf and category selections, grid drill-down, metric
collapsed/restored, filter open/applied-in-table/applied-in-grid/composed,
and filter-open-while-the-strip-collapses): 78 of 78 with no horizontal page
scroll. Two of those states — the metric strip's scroll collapse — no longer
exist: the collapse was removed on 2026-08-15 and the toolbar pins instead
(`design-system/components/metric-item.md`). ~~**The matrix has not been re-measured with the
pinned toolbar**~~ — **re-measured 2026-08-14** for the three screens of the
document leg, at 375 / 768 / 1024 / 1280 / 1440 / 1920 and across all three body
regions (default table, folder grid at root and drilled in, non-empty search), with
both field errors painted: no horizontal page scroll in any of them. The one
finding was on `project-doc-preview`, which was overflowing to 681px at 375px
*before* the pass and is fixed. The state that replaces the two removed collapse
states is still new and still unmeasured on its own: panel open while the toolbar
is stuck.

**The applied filter is not carried across a screen boundary**, while folder, view
mode, query and page now are (`design-system/patterns/item-listing.md`, State across a
navigation). So returning from a document restores the operator's location but not
their filter. Serialising ten operator+value pairs into the URL is a pattern
decision that has not been made — not a screen-level omission.

**The open panel tracks its trigger through anything that reflows the strip above
it.** The panel is positioned `fixed`, and its `scroll`/`resize` listeners only
see what those two events report: a metric strip that gains or loses a line — a
late webfont, a scrollbar appearing when the row overflows — moves the trigger
with no event either listener receives, and the panel is left floating over
unrelated content. A `ResizeObserver` on `.metric-group` closes it. Since
2026-08-15 the toolbar is also pinned (`.docs-filter`), so on a scrolled page the
trigger no longer moves at all — but the observer stays: the pinned row's own
offset follows the measured chrome height, which the description's `Xem thêm`
changes. See `design-system/components/metric-item.md`.

## Accessibility

- `role="dialog"` on the panel, labelled by its trigger. Not `aria-modal`:
  nothing here must be decided before the page behind it is usable again.
- Focus moves in on open and **cycles** inside the panel while open.
- `Escape` closes and returns focus to the trigger.
- Outside dismiss is on `pointerdown`, so a drag that starts on the rows
  scrollbar and ends outside does not close the panel.
- Each row is a `role="group"` named by its field, so the name is announced once
  rather than once per control; the visible chip is `aria-hidden`.
- The rows region is a scroll container, so it is `tabindex="0"`, named, and says
  it scrolls.
- The applied count is announced through **the screen's single `role="status"`
  region** — the same one search writes to. Two polite regions on one page
  interleave unpredictably, and the list regions themselves are **not**
  `aria-live`: a 15-column table as an announcement target re-reads itself on
  every apply, every page click and every folder selection.
- **The announced count describes the region that is visible**, never a hidden
  one. See the grid section above.
- Outside dismiss returns focus to the trigger **whenever the panel held focus**,
  not only on the Escape route — the panel is `display: none`d on close, so
  otherwise focus falls to `<body>` and a keyboard user restarts from the top of
  the document. The restore is deferred one frame and skipped if the pointer's
  own default action put focus somewhere else, so it never steals the control
  the user just clicked.

## Code Mapping

| Surface | File |
|---|---|
| Component contract | `design-system/components/filter-panel.md` |
| Component CSS | `styles/filter-panel.css` |
| Markup | `screens/du-an/ho-so/danh-sach.html` — `#filterTrigger`, `#filterPanel`, `#filterRows` |
| Behaviour | `screens/du-an/ho-so/danh-sach.js` — `filterFields`, `filterOperators`, `matchesFilters`, `applyFilters`, `positionFilterPanel`, `bindFilterPanel` |
| Tokens | `--utui-filter-panel-*`, `--utui-filter-field-*` |

## Known Gaps

### Open — needs a design or PO decision

- **`Trạng thái` filters on an axis the table does not show.** Recorded
  2026-08-14 by the `Quản lý dự án` flow audit. Field 1 narrows on the record's
  processing state (`Đã xử lý` / `Đang xử lý` / `Chờ phê duyệt` / `Nháp`), and no
  column of the redesigned table renders it — the two status columns are storage
  and validity, and the metric tiles now label those two axes as well, so the last
  surface that showed processing state is gone. The result is unfalsifiable
  filtering: the operator gets a row set with nothing on screen explaining why
  those rows and not others, which in an audit module is worse than a missing
  filter. Three ways out — give processing state a column back, drop the facet, or
  give it a tile — and all three are product calls. Do not resolve it by removing
  the field quietly: the frame draws it.
- **The three date fields have no date control.** The frame gives `Ngày tạo`,
  `Ngày văn bản` and `Ngày cập nhật` a plain `Chọn` select, which is almost
  certainly a placeholder. V2 has no date picker at all —
  `design-system/components/inputs.md` and `design-system/components/filter-panel.md` both already record
  its absence. Built as drawn: a select over the dates the data actually holds.
  A real implementation needs a picker, and probably a range rather than the four
  scalar operators.
- **`Cụm dự án` has no data.** See Fields.
- **The operator sets are mostly not drawn.** See Operators.
- **No applied-filter chips.** Once filters are applied the only trace outside
  the panel is a number on the trigger; the user cannot see *which* conditions
  are live without reopening it. The frame draws no chip row, and adding one is a
  design decision, not an implementation detail.
- **`Lọc` and `Xóa bộ lọc` are not symmetrical.** `Lọc` applies the draft and
  closes; `Xóa bộ lọc` clears immediately and leaves the panel open. That follows
  from clear being a destructive reset rather than an edit, but the frame does
  not say, and it is worth confirming.
- **No per-row remove.** A row is cleared by emptying its value; there is no `×`
  on a row. The frame draws none.
- **No empty/zero state for a filter that matches nothing.** The table falls back
  to its own empty block, whose copy says the folder is empty rather than that
  the filter excluded everything. `design-system/components/empty-state.md` distinguishes the
  two; this screen does not yet. The folder grid has the same problem with its
  own copy, and it is now reachable more often, since an active filter empties
  the grid's root level by design.
- **Whether `Bộ lọc` belongs in folder-grid mode at all.** See the section
  above: it applies for real now, but the grid shows none of the ten fields it
  filters on, so a card can disappear for a reason nothing on screen explains.

### Resolved

- ~~`Bộ lọc` semantics inside the search state are undefined.~~ Decided above:
  they compose.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/filter.md`](docs/revisions/filter.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-22 (the first derived facet)
- 2026-08-22d (`Trạng thái lưu trữ` opens, and the panel is eleven rows)
- 2026-08-27 (the DC lane drops two facets with its two columns)
