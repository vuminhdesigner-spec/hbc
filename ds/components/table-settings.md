# Table Settings

## Purpose

Table Settings is the drawer a listing opens from its footer's `Thiết lập`
action. It is where the reader decides what the table shows them: which columns
are visible, what order they sit in, which are pinned to an edge, and whether
cell text is clipped to one line so more records fit the viewport.

It is not a filter. A filter changes which *records* the table returns
(`design-system/components/filter-panel.md`); this changes how the returned
records are *presented*, and nothing it does touches the query.

## Source

| Item | Value |
|---|---|
| Figma node | **Not recorded.** No frame in the four V2 files has been cited for this drawer's body. Its two implementations were authored against the product, and the CSS comments cite measured renders rather than a node |
| Implementation | `screens/cong-ty/danh-sach.js` `drawerMarkup()` and `screens/doi-tac/danh-sach.js`, 2026-09 |
| Shell | `design-system/components/drawer.md` — the scrim, panel, header band, body and right-aligned footer are the shared drawer's, unmodified |

Recorded as a contract 2026-09-23 because the same nine blocks were authored
twice, screen-local, in two listing screens. What follows describes what both
build; it does not decide anything neither of them settled.

## Anatomy

Inside the shared drawer, titled `Thiết lập bảng` behind a `settings` featured
icon:

1. **`.col-setting__stack`** — one child of `.drawer__body`, holding all three
   blocks. `styles/drawer.css` gives the body two grid rows (a table wrap over a
   pagination footer); three children get crammed into two tracks and overlap.
   The stack scrolls, because eleven columns plus the toggle row exceed a short
   viewport.
2. **`.col-limit`** — the character-limit row. A `<label>` so the whole row is
   the switch's target: a `.col-limit__text` block (`__title` `Giới hạn ký tự`,
   `__hint` `Giới hạn số dòng để xem được nhiều bản ghi.`) takes the free space,
   and a `.toggle` sits at the far edge. Closed by a bottom rule.
3. **`.col-setting__heading`** — `Thiết lập ẩn hiện, chuyển vị trí, ghim cột`.
4. **`.col-setting`** — the column list, a `.data-table` so it inherits the
   header band, row rule and cell padding rather than restating them. Three
   columns, `56px / auto / 96px`, headed by a screen-reader-only `Đổi vị trí`,
   then `Cột hiển thị` and `Ghim cột`.

Each row is a `draggable` `<tr>` carrying `data-col` and `data-index`:

| Cell | Content |
|---|---|
| Reorder | `.col-grip` with a `drag_indicator` glyph, plus an `.sr-only-label` reading `Kéo để đổi vị trí <column>` |
| Visibility | a `.choice.choice--sm` checkbox and the column label; `disabled` when the column is fixed |
| Pin | `.col-pin`, two `.button.button--compact` carrying `first_page` and `last_page`, `aria-pressed`, labelled `Ghim <column> sang trái` / `sang phải` |

The footer is the drawer's own: `Mặc định` resets, a primary `Lưu` saves.

### Pin groups (USER DECISION 2026-10-07)

The list shows the table's real order: pinned-left rows on top, unpinned in the
middle, pinned-right at the bottom. While any column is pinned, each non-empty group
opens with a `tr.col-setting__group` label row (`<th scope="colgroup" colspan="3">`
`Ghim trái` / `Không ghim` / `Ghim phải`; caption type, `--utui-color-bg-table-header`).
Each column row carries `data-group` (`left` / `none` / `right`).

- **Pin** moves the row to the end of the left group or the start of the right group;
  **unpin** puts it on the edge of the unpinned group next to the group it left. Focus
  stays on the pressed button.
- **Drag** (and `Alt+↑/↓` in `doi-tac`) only reorders within a group; dropping on another
  group's row is refused (no `dragover` accept).
- The panel is `.drawer--fit` (`ds/components/drawer.md`): column names never wrap.

## What it releases from `.data-table`

The column list is a `.data-table` inside a 400px panel, and three of that
contract's page-table rules are wrong at that width. Each was measured, not
assumed:

| Released | Page-table value | Here | Why |
|---|---|---|---|
| `min-width` | `1180px` | `0` with `table-layout: fixed` | The page value pushed `Ghim cột` clean off the panel edge |
| Cell height / overflow / wrap | fixed height, hidden, nowrap | `auto` / `visible` / `normal` | A half-visible column name is a column the reader cannot identify |
| `padding-inline` | `--utui-table-cell-padding-x` (24px) | `--utui-spacing-02` (8px) | 24px left 48px of a 96px pin column for two 36px buttons and clipped the second |

`screens/du-an/ho-so/danh-sach.css` departs from the second and first rows (USER DECISION 2026-10-07):
`table-layout: auto` and `white-space: nowrap`, with the panel at `inline-size: max-content`
(floor `--utui-drawer-width-sm`, ceiling viewport minus `--utui-drawer-gutter`), so a column
name never wraps and the drawer widens instead. `doi-tac` keeps the fixed 400px.

## Tokens

| Role | Token |
|---|---|
| Row gaps | `--utui-spacing-01`, `--utui-spacing-02`, `--utui-spacing-04`, `--utui-spacing-05` |
| Divider under the limit row | `--utui-color-border-default` |
| Title and heading text | `--utui-color-gray-700`, `--utui-font-weight-medium` |
| Hint text | `--utui-color-text-tertiary`, `--utui-font-size-text-sm` |
| Heading size | `--utui-font-size-text-md` |
| Pressed pin | `--utui-color-brand-300` border, `--utui-color-brand-600` text |

## States

| State | Treatment |
|---|---|
| Column hidden | checkbox unchecked; the table drops the column on save |
| Column fixed | checkbox `disabled` — the identifier column cannot be hidden |
| Pinned left / right | the matching `.button` takes `.is-active`, `aria-pressed="true"`. Brand, because pinning is a selection (`.claude/skills/design-rules/SKILL.md`) |
| Dragging | `.col-grip` is `cursor: grab`; `tr:active .col-grip` is `grabbing` |
| Character limit on | the page table takes a `--clip` variant; `.cell-text`, `.entity-title` and `.entity-subtitle` become one clipped line. On `screens/doi-tac/danh-sach.html` and `screens/du-an/ho-so/danh-sach.html`, clipped cells carry `data-tooltip-overflow` so the clipped string is still reachable — see `ds/components/tooltip.md` |

## Accessibility

- The panel is the drawer's `role="dialog"` `aria-modal="true"`, labelled by its
  title; Escape, the scrim and focus handling are the drawer's.
- Each grip carries an `.sr-only-label` naming the column it reorders, because
  the glyph itself is `aria-hidden`.
- Pin buttons carry `aria-pressed` and a label naming both the column and the
  edge. `.is-active` is the visible half of that state, never the only half.
- The reorder column's header is screen-reader-only rather than empty.
- **Open:** drag-and-drop is pointer-only in both implementations. No keyboard
  path to reorder a column has been designed.
- Character limit on, `screens/doi-tac/danh-sach.html` and `screens/du-an/ho-so/danh-sach.html`: the tooltip that recovers
  a clipped string is mouse/focus-reachable, not keyboard-reachable for the two
  non-link cells (`.cell-text`, `.entity-subtitle`) — `ds/components/tooltip.md`
  GAP-1.

## Code Mapping

| Part | File |
|---|---|
| Markup | `screens/cong-ty/danh-sach.js`, `screens/doi-tac/danh-sach.js` — `drawerMarkup()`; `screens/du-an/ho-so/danh-sach.html` `#settingsDrawer` + `danh-sach.js` `paintSettingsRows()` (đủ contract; `Tên hồ sơ` là hàng như mọi cột — kéo, ghim được, chỉ checkbox `disabled`; mặc định ghim trái, chỉ đóng băng `--frozen-identity` khi đứng ngay sau cột hành động; mở từ kết quả tìm kiếm thì chỉ còn Giới hạn ký tự) |
| Styles | `screens/cong-ty/danh-sach.css`, `screens/doi-tac/danh-sach.css`, `screens/du-an/ho-so/col-setting.css` (`.col-*`; nút ghim vuông 36px; dùng chung `danh-sach` và `hang-doi` của ho-so) — screen-local |
| Shell | `styles/drawer.css` |
| List surface | `styles/data-table.css` |
| Clipped-cell recovery (`screens/doi-tac/danh-sach.html`, `screens/du-an/ho-so/danh-sach.html`) | `ds/styles/tooltip.css`, `ds/scripts/tooltip.js` — `ds/components/tooltip.md` |

## Known Gaps

- **No stylesheet.** The component has no sheet of its own under `styles/` — the
  name `table-settings.css` is reserved, not written. Its rules are authored
  twice, screen-local. Extracting them is a separate pass: the two
  copies have diverged at the stack (`.col-setting__stack` in `cong-ty`,
  `__intro` and `__scroll` in `doi-tac`), and that divergence has to be resolved
  before one sheet can serve both.
- **`.col-choice` is deliberately not part of this contract.** Both screens carry
  it and both record why it stays screen-local: `design-system/components/checkbox.md`
  logs the missing label composition as a gap, and promoting one drawer's layout
  would decide the package's label composition for every selection control —
  which one drawer does not get to settle (ADR 0008). It is listed here so the
  exclusion is visible, not so it can be quietly adopted.
- **No Figma source.** Until a frame is cited, this contract records an
  implementation, not a design.
- **No keyboard reorder**, as above.
- **Pin buttons overflow the 96px column.** An icon-only `.button--compact` renders
  46px, not 36px: two of them plus gap and padding are 8px wider than the column.
  `screens/du-an/ho-so/danh-sach.css` and `screens/doi-tac/danh-sach.css` square
  them to `--utui-button-height-sm`. Fix belongs in the future `table-settings.css`.
- **Pinning only reorders.** Pinned-left sits right after the action column,
  pinned-right at the end; nothing becomes sticky — `ds/components/data-table.md`
  caps frozen columns at two.
- ~~**List order ≠ table order.**~~ **Closed 2026-10-07 (USER DECISION):** the list is
  grouped by pin — see *Pin groups*.
- **`screens/cong-ty/danh-sach.html`'s Character limit clip has no tooltip
  recovery.** Only `screens/doi-tac/danh-sach.html` wires `data-tooltip-overflow`
  onto its clipped cells (needs decision, 2026-09-24) — the two screens share
  this drawer and its `--clip` variant but now disagree on whether a clipped
  string can be read back. Needs a decision on whether `cong-ty` gets the same
  wiring or the two are allowed to diverge.
