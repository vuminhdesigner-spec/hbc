# Folder

## Purpose

Folder is a single-select category tree that scopes a sibling list region. It
sits beside a table or card list rather than above it, and selecting a node
filters what the list shows. Use it when a record set is organised into a named
hierarchy the user must navigate, rather than filtered by attributes.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 |
| Figma file key | `tS8dUB2qWLc28gZbtj8IIL` |
| Component | `Folder`, node `10073:14772`, 344 x 960 |
| Variant set | `Folder`, node `10388:16920` — `Level` (2, 5) x `Expand` (False, True) |
| Reviewed instance | `pat-listing`, node `10254:53657` (rendered 312px wide) |
| Reviewed via | Figma REST API (`/v1/files/…/nodes`), 2026-08-03; MCP re-read of the variant set 2026-08-22b |

## Anatomy

1. **Panel** — 16px radius, `--utui-color-bg-surface`, no border (the surface
   is defined by its fill plus `--utui-shadow-xs`), 16px vertical padding, none horizontal. It has
   **two widths**: 360px resting (`Expand=False`) and 600px expanded
   (`Expand=True`). In `--bare` the Figma toggle is replaced by a drag handle (`resize-handle.md`); nothing else in the
   panel changes. The composing pattern owns both numbers, because the panel is a
   grid column there.
2. **Head** (`Search` frame in Figma, 28px left / 16px right padding) — the panel
   title (`Danh mục`) and an optional trailing add action. The add button is
   hidden in the reviewed instance.
3. **Nav** (`Navigation` frame, 16px horizontal padding) — the tree itself, a
   flat run of `_item_Folder` rows. Depth is expressed by row padding, not by
   nesting. The ladder is **five rungs — 12 / 48 / 84 / 120 / 160px** of
   `padding-left` (node `10388:16920`, all four variants). The first four step
   36px; the fifth steps 40 because a level-5 row is a leaf, drops its chevron
   slot, and needs the extra distance to line its folder icon up under level 4's.
4. **Item** (`_item_Folder`, 40px tall, 6px radius, 8px gap):
   - leading folder icon, 24px — the exported `Folder icon` asset (Figma
     `OMEU Design System V2`, node `10251:240`,
     `assets/folder-icon.webp`), not a material-symbols glyph;
   - label, one line with an ellipsis (`white-space: nowrap`); full text in a tooltip on hover/focus when cut (`data-tooltip-overflow`, `tooltip.md`);
   - no count badge (bỏ 2026-10-01). Danh mục chưa có hồ sơ dùng asset `assets/folder-empty.svg`
     (cùng hình, không có giấy, xám nhạt neutral-300/200 — quyết định 2026-10-06): khác cả hình lẫn màu
     nên không chỉ dựa vào màu (WCAG 1.4.1); kèm chữ ẩn ", chưa có hồ sơ" (`.sr-only-label`).

## Variant `--compact`

Added 2026-09-29 (MDM-1209) for "Chuyển vị trí thư mục" — the folder-move
picker inside `ds/components/drawer.md` `--md` (SPEC `6-rename-move.png`). A
picker that moves ONE record into ONE folder is a different task from the
resting tree's "scope the list beside me to this category", and three things
follow from that:

1. **Only LEAF folders are selectable.** A category row's job here is purely
   to expand/collapse toward the leaf the operator wants — it never carries
   `aria-selected` or `.is-active`. The resting `--sm` tree keeps every row
   selectable (Anatomy/States above); this rule is `--compact`-only.
2. **No count badge.** A picker is not scoping a record set, so "how many
   documents live here" is not information the row needs. Nothing to hide in
   CSS — the badge is composed markup, not a class this file owns (see
   Anatomy: "Computed from the record set, never authored") — a `--compact`
   consumer simply does not render it.
3. **Selected state adds a trailing check, not just colour.** `.folder-item.is-active`
   keeps the brand fill and brand text `--sm` already draws, plus
   `.folder-item__check` (a 20px check glyph, trailing edge, authored on every
   row and `visibility: hidden` off the active one — the slot stays in the DOM
   so a row does not change width when it becomes selected). Colour alone was
   already disallowed by design-rules; a picker whose only signal was a tint
   over a 40px row is a real regression from the resting tree's already-thin
   signal, hence the check.
4. **Surface is a bordered box, not a card.** `.folder` on its own is a
   shadow-xs card with 16px vertical padding (`--utui-spacing-04`) — the
   resting tree's own panel chrome. SPEC draws the picker as a plain
   1px-bordered box, radius ~8 (`--utui-radius-md`), no shadow and no padding
   of its own (the drawer's `--md` body already insets it) — `--compact`
   overrides all four (R5, review 2026-09-29).
5. **It is the scroll region a bounded drawer body needs.** `.folder`'s own
   `align-content: start` never stretches an implicit row, so `--compact`
   gives its sole `.folder__nav` child an explicit `minmax(0, 1fr)` track
   plus `min-height: 0`, and pairs with `ds/components/drawer.md`'s own
   `.drawer__body > * { min-block-size: 0 }` — without both halves the tree
   grows to its full content height instead of scrolling inside the panel
   (R5, review 2026-09-29).

**Search.** The toolbar's search field (a plain `.form-field` / `.search-field` in `.drawer__toolbar` — no new part here)
filters rows by label, and a matching leaf must keep its ancestor branches
visible (and expanded) so the picker never shows a floating leaf with no
category above it. No matches: the nav prints "Không tìm thấy thư mục phù
hợp" in place of the tree — not authored as a component part; a screen-owned
empty line, the smallest thing that satisfies filter-panel.md's own "a filter
that can return nothing must say so" rule, until this recurs on a third
consumer.

**Rows** — 40px (was 64px), padding **8/12** (`--utui-spacing-02` /
`--utui-spacing-03`), same 6px radius — one rule for `--sm` and `--compact`
(`--compact` differs only in indent ladder, no badge, trailing check). **GAP:** the indent ladder below level
2 is inferred, not measured — see the CSS comment.

| Rung (`aria-level`) | `--sm` (resting tree) | `--compact` (picker) |
|---|---|---|
| 1 | 12px | 12px |
| 2 | 48px | 48px — measured, SPEC draws exactly this rung |
| 3 | 84px | 96px — **inferred**, +48px/level held constant |
| 4 | 120px | 144px — inferred |
| 5 | 160px | 192px — inferred |

## Variant `--bare`

Added 2026-10-01 for a tree that shares one shell with its list (`ds/patterns/item-listing.md` § Tree + list region). Same shape as `attachment-pane--bare`: the panel stops being a card.

- No radius, shadow or fill, and no vertical padding or head/nav gap — the shell owns the surface.
- `border-inline-end: 1px solid var(--utui-color-border-default)` on `.folder` itself, so the divider runs the full column height (not just `.folder__nav`). Below 1023px, where the tree stacks above the list, it becomes `border-block-end` (`responsive.css`).
- `.folder__head` is one band with the table's `thead`: height `--utui-table-header-height`, fill `--utui-table-header-bg`, bottom rule `inset 0 -1px 0 var(--utui-table-border)`. Nav gets `--utui-spacing-03` block padding so rows do not touch the band.
- Beside it, the list panel takes `.table-panel--bare` (`data-table.md`).
- Width: user-resizable via `.resize-handle` on the divider (`resize-handle.md`), default 360px (288px at lg), min 240px, max 50% of the shell. History: the 600px Expand state and the `.folder__collapse` button were removed 2026-10-01. **Reopened 2026-10-06** as an official state, see § State `.is-wide` below. Focus rings in the shell stay inset.
- `.folder__title` uses the table header type (`--utui-font-size-text-xs`, `--utui-font-weight-medium`, `--utui-line-height-text-xs`, `--utui-table-muted-text`), same as `.data-table thead th`.
- `.folder__nav` scrollbar shows only while the panel is hovered or holds focus: `::-webkit-scrollbar` geometry fixed, only the thumb paint changes — copied from `.data-table-wrap` (`data-table.css`), same rule: no `scrollbar-width`/`scrollbar-color`.
- Default at lg (288px) is still **OPEN: chờ Figma xác nhận**.

### State `.is-wide` (`--bare`, 2026-10-06)

Full-width view of the tree+list region: the panel fills the whole shell, the list beside it is hidden, and each row gains two secondary cells.

- Default: open while no category is chosen; choosing a category collapses it (JS, screen-owned). The resize handle is hidden while wide; the dragged width is kept and returns on collapse. `border-inline-end` is dropped.
- `.folder__expand` — icon-only square button (`--utui-folder-expand-size` 32px) in the 44px head, **right after `.folder__title` in both states** (it does not move). No border, no fill; icon `--utui-folder-expand-icon`; hover `--utui-folder-expand-hover-bg`; the shared focus ring. Glyph `keyboard_double_arrow_right` when collapsed, `keyboard_double_arrow_left` when wide (2026-10-06: user found expand_content/collapse_content too hard to recognise; double chevron so it does not read as the rows' disclosure chevron). Icon is `--utui-color-icon-default` — `icon-muted` (Neutral/400) is under 3:1 non-text contrast. `aria-label` "Mở rộng danh mục" / "Thu gọn danh mục" swaps with the state; **no** `aria-expanded`/`aria-pressed`; the screen should `announce()` the change. No tooltip (accepted limit, same as the other expand buttons). COPY not yet through the UX writer.
- `.folder__col` — column title in the head (`aria-hidden`, visual only), shown only when wide, `--utui-folder-meta-width` wide, head right padding = nav 16 + row 12 so the titles line up with the row cells.
- `.folder-item__meta` — secondary cell at the end of a row (same width token, one line, ellipsis). Each cell carries its own `.sr-only-label` (", cập nhật gần nhất: ") so the treeitem name reads in full. The screen renders the cells only while wide; the empty-value glyph is the screen's `emptyCell()` (value rule not decided).
- Layout of the shell (`.docs-body` becomes one column, the list is hidden) is screen/pattern work, not this component.
- a11y: `role="tree"` with hidden labels in each cell. **GAP:** a `treegrid` (real column headers) would be more exact; not adopted because rows are `button[role=treeitem]`.

## States

| State | Treatment |
|---|---|
| Default | Transparent row on the panel surface. |
| Hover | `--utui-color-neutral-50` row background. |
| Selected | `--utui-color-brand-50` background, brand text. **At most one** row is selected at a time — never two, and ZERO while a composing pattern has lifted the category condition (see the scope on `screens/du-an/ho-so/danh-sach.html`). **Every row is selectable**: a leaf scopes the list to its own records, a category to the union of its descendants, an empty category to nothing. The icon does not retint — it is a fixed-colour image asset, not a glyph (see Known Gaps). **`--compact` narrows this**: only leaf rows are selectable and the selected row also carries a trailing `.folder-item__check` — see § Variant `--compact`. |
| ~~Non-selectable~~ | **Removed 2026-08-22d.** A row that could not scope the list carried no `aria-selected`, no tab stop and no hover wash. No row is in that state any more — see the 2026-08-22d revision for why the state was a symptom of an invented count rather than a real property of the folder. |
| Expanded / collapsed | Parent rows only; the chevron flips between `expand_less` (open) and `stat_minus_1` (closed) — both render as a chevron, and `stat_minus_1` is the name the source uses in every variant. **Every row that cannot expand renders the chevron slot EMPTY, leaves included** — a leaf drawing a collapsed chevron reads as an unopened parent and inverts the region's depth cue (fixed in `screens/du-an/ho-so/danh-sach.js` on 2026-08-22, where it had been the case for every leaf). Expansion is independent of selection — expanding a parent must not change which leaf is selected. |
| Empty | A category with no children renders no child rows; the panel itself is never empty because the root list is static. A row whose folder holds no records (category: no record in any leaf) draws `assets/folder-empty.svg` — vẫn chọn được, không phải disabled. Gap: Figma chưa có icon rỗng; `folder-empty.svg` vẽ lại từ `folder-icon.webp` trong repo. |

## Tokens

| Role | Token |
|---|---|
| Panel radius | `--utui-radius-xl` (16px) |
| Panel padding | `--utui-spacing-04` (16px) vertical, none horizontal (Figma `Nav`, 10073:14772) |
| Head padding | left `--utui-spacing-04` + `--utui-spacing-03` (28px, title aligns with row text), right `--utui-spacing-04` |
| Nav padding | `--utui-spacing-04` (16px) horizontal; no gap between rows (Figma 10073:14772) |
| Item radius | `--utui-radius-sm` (6px) |
| Item gap | `--utui-spacing-02` (8px) |
| Item height | 40px (`--utui-spacing-10`) |
| Count badge | Computed from the record set, never authored. `0` is printed. |
| Indent ladder | 12 / 48 / 84 / 120 / 160px, driven off `aria-level` |
| `--bare` divider / head | `--utui-color-border-default`, `--utui-table-header-height`, `--utui-table-header-bg`, `--utui-table-border` |
| Panel width | 360px default (owned by the composing pattern), user-resizable 240px to 50% of the shell via `resize-handle` |
| Selected surface | `--utui-color-brand-50` |
| Selected text | `--utui-color-brand-600` |
| Hover surface | `--utui-color-neutral-50` |
| Title | `Text md` 16/24 medium, `--utui-color-text-secondary` |
| Label | `Text sm`, regular (Figma 10388:16920) |
| `--compact` indent ladder | 12 / 48 / 96 / 144 / 192px (rungs 3–5 inferred, see § Variant `--compact`) |
| `--compact` check | `--utui-color-brand-600`, added 2026-09-29 |

This component introduces no new tokens.

## Usage

Use Folder when the record set has a curated hierarchy that is part of the
domain (document categories, org units, chart of accounts). Do not use it as a
substitute for attribute filtering — that belongs to
`design-system/components/filter-panel.md`. Do not use it for navigation between screens;
that is `design-system/components/side-navigation.md`.

Folder is the *table* view mode's hierarchy control. Do not render it alongside
`design-system/components/folder-grid.md`: in the grid mode the breadcrumb trail is the
hierarchy control, and two controls for one piece of state is a defect.

The tree owns selection; the list beside it owns everything else. Selecting a
node resets the list's pagination to page 1 and updates the list region's
accessible name to the selected folder — there is no heading or location line
above the list to update (removed 2026-08-16; the source frame draws neither).

**The tree is the only folder list on this side of the screen.** The table beside
it lists documents only, so the two do not mirror each other: a sub-folder is a
row in the tree, never a row in the table. Do not restore folder rows to that
table to make a category selection non-empty — see the open item in
`design-system/patterns/item-listing.md`.

## Accessibility

- The panel is a labelled region; the tree is `role="tree"` with each row
  `role="treeitem"`.
- The selected row carries `aria-selected="true"`; parent rows carry
  `aria-expanded`. A row that cannot be selected carries neither.
- **Every row carries `aria-level`.** Depth is a flat run of rows with padding
  (see Anatomy), so there is no `role="group"` for assistive tech to infer depth
  from and no nesting to walk: without `aria-level` a `role="tree"` reports every
  row as a sibling at level 1, and the one relationship the region exists to
  express — which leaf sits under which category — is the one it fails to state.
  `aria-level="1"` on root rows, `"2"` on child rows, up to `"5"`. Since
  2026-08-22b it is also what the indent ladder hangs off
  (`.folder-item[aria-level="n"]`), so the depth a row announces and the depth it
  looks are one value rather than two that can drift. Added 2026-08-22, after an
  audit found the roles declared and the structure absent.
- Label text is cut to one line with an ellipsis but must not be truncated in the
  accessible name — keep the full text in the DOM.
- Count badges must not be the only indication of a leaf row's meaning.
- **A tree that re-renders wholesale must re-focus the row with the same
  `data-folder-id`.** Replacing the tree's markup destroys the row the user just
  activated, and focus falls to `<body>` — past the whole nav column. Do it *only*
  when focus was inside the tree: a selection arriving from elsewhere (a search
  result, a grid drill-down) places focus deliberately and must not have it
  stolen. See `renderTree()` in `screens/du-an/ho-so/danh-sach.js`, 2026-08-14.
- **`--compact`: a leaf-only picker must not let a category row take
  `aria-selected`.** Give category rows `aria-expanded` only, same as the
  resting tree's non-selectable-removed history — the difference here is by
  design, not a bug to fix later.
- **`--compact` search**: the query filters `.folder-item__label` text; a
  matching leaf keeps every ancestor row rendered and `aria-expanded="true"`,
  even if the ancestor's own label does not match. Zero matches replaces the
  `role="tree"` region's content with a line reading "Không tìm thấy thư mục
  phù hợp" — that line still needs the region's accessible name, not a new
  one, so a screen reader does not lose context on an empty result.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.folder`, `.folder__head`, `.folder__title`, `.folder__nav`, `.folder-item`, `.folder-item__chevron`, `.folder-item__chevron--empty`, `.folder-item__icon`, `.folder-item__label`, `.folder__expand`, `.folder__col`, `.folder-item__meta`, `.folder--bare.is-wide` in `styles/folder.css` |
| `--bare` | `.folder--bare` in `styles/folder.css`; stacked-tier divider in `styles/responsive.css`, added 2026-10-01 |
| `--compact` | `.folder--compact`, `.folder-item__check` in `styles/folder.css`, added 2026-09-29 |
| Icon asset | `assets/folder-icon.webp`, shared with `design-system/components/folder-grid.md`'s cards (the documents table's sub-folder chip that also used it was retired 2026-08-16) |
| Example | `screens/du-an/ho-so/danh-sach.html`, rendered by `screens/du-an/ho-so/danh-sach.js` — `--sm`, resting tree. `--compact` is now wired to `ds/components/drawer.md` `--md`'s folder-move picker in both `screens/du-an/ho-so/chi-tiet.html` and `.../tai-len.html`; the filter/search behaviour and the tree render are still screen-local JS in each, not a shared `ds/scripts/*` file. |

```html
<aside class="folder" aria-label="Danh mục hồ sơ">
  <div class="folder__head">
    <h2 class="folder__title">Danh mục</h2>
  </div>
  <div class="folder__nav" role="tree" aria-label="Cây danh mục">
    <button class="folder-item" role="treeitem" aria-level="1" aria-expanded="true">…</button>
    <button class="folder-item is-active" role="treeitem" aria-level="2" aria-selected="true">…</button>
  </div>
</aside>
```

`--compact` — a category row carries `aria-expanded` only (never
`aria-selected`); only a leaf row carries `aria-selected` and the trailing
check:

```html
<div class="folder folder--compact" aria-label="Cây thư mục">
  <div class="folder__nav" role="tree" aria-label="Chọn thư mục">
    <button class="folder-item" role="treeitem" aria-level="1" aria-expanded="true">
      <span class="material-symbols-outlined folder-item__chevron" aria-hidden="true">expand_less</span>
      <img class="folder-item__icon" src="../assets/folder-icon.webp" alt="" aria-hidden="true">
      <span class="folder-item__label">Hồ sơ pháp lý</span>
    </button>
    <button class="folder-item is-active" role="treeitem" aria-level="2" aria-selected="true">
      <span class="folder-item__chevron--empty" aria-hidden="true"></span>
      <img class="folder-item__icon" src="../assets/folder-icon.webp" alt="" aria-hidden="true">
      <span class="folder-item__label">Hợp đồng thuê</span>
      <span class="material-symbols-outlined folder-item__check" aria-hidden="true">check</span>
    </button>
  </div>
</div>
```

## Known Gaps

- **The leading icon no longer retints on select/hover** (updated 2026-08-13:
  swapped the material-symbols `folder` glyph for the exported `Folder icon`
  image asset, then shared with `design-system/components/data-table.md`'s sub-folder chip and
  since 2026-08-16 with `design-system/components/folder-grid.md`'s cards only). A
  glyph could shift colour with `currentColor`; a raster image cannot. The
  selected row's brand tint now shows only in the row background and label
  colour, not the icon. If icon-follows-selection is required, this needs a
  colour-variant asset or a switch back to a tintable glyph.
- ~~There is no authored narrow or collapsed form.~~ **Closed 2026-08-22b:**
  node `10388:16920` is a variant set with `Level` and `Expand` axes, and
  `Expand` authors the pair (360/600). The base component `10073:14772` is still
  a plain `COMPONENT` at 344px, composed at 312px in the older `pat-listing`
  instance — treat the variant set as current where the two disagree. The
  responsive behaviour (drop the panel above the list below 1180px) is still
  owned by the composing pattern, not by this contract.
- No hover, focus-visible, or keyboard-navigation treatment is authored in
  Figma. The implementation supplies hover and focus from the shared button
  reset; full `role="tree"` arrow-key navigation is **not** implemented.
- The head's add action is hidden in every reviewed instance, so its icon,
  label, and behaviour are unspecified.
- Multi-select and drag-to-reorder are not authored; assume neither is
  supported until the design system says otherwise.
- **`--compact` is now wired to two screens** (see Code Mapping) — the
  filter/keep-ancestors search behaviour and the empty-result line are both
  built there; roving-focus `role="tree"` arrow-key navigation is still not
  implemented in either (GAP-18 in the MDM-1209 plan carries forward for that
  part only).
- **`--compact`'s indent ladder below level 2 is inferred, not measured** —
  see § Variant `--compact`.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/folder.md`](docs/revisions/folder.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-12 (`pat-listing` re-read)
- 2026-08-21 (a row that is not a folder)
- 2026-08-22 (the added row is now exercised by the data)
- 2026-08-22b (the added row is removed; the behaviour is not)
- 2026-08-22b (the panel collapses by width, not to a rail)
- 2026-08-22c (a category is a set, so it can be selected)
- 2026-08-22d (the count badge is computed, and no row is inert)
- 2026-10-01 (label one line + ellipsis + tooltip, row 40px; Figma 10388:16920)
