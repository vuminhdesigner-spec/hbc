# Folder grid

## Purpose

Folder grid is the tile view of a document listing: sub-folders and documents
side by side as icon cards, browsed by opening one level at a time. It is the
second view mode of the same record set a data table shows, not a different
record set — use it when the user is *locating* a document by where it was filed,
and the table when they are *comparing* documents by their attributes.

It is always paired with `design-system/components/breadcrumbs.md`, which is the only way back
up. Do not compose it beside `design-system/components/folder.md` — the tree and the trail
control the same thing, and two controls for one state is a defect, not a
convenience.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 |
| Figma file key | `tS8dUB2qWLc28gZbtj8IIL` |
| Section | component `pat-listing/view-mode/folder`, node `13458:26966` (cập nhật 2026-10-01; bản cũ `11099:28736`) |
| Grid container | `Slot`, node `13458:26991` — 20px gap, wrap |
| Card | `folder&file`, node `13096:51028` (folder) / `13096:51039` (file), 180 x 180 — **implementation dùng 144 x 144, gap 12** (yêu cầu 2026-10-01, lệch Figma) |
| States read | `11099:31457` (one level deep), `11099:31755` (two levels deep) |
| Reviewed via | Figma MCP `get_design_context`, 2026-08-14 |

## Anatomy

1. **Grid** — a list of cards. Fixed 144px tracks, 12px gap, wrapping, aligned
   to the start of the row. The container does not stretch its cards: a row with
   two cards in it still starts at the left edge with two 144px tiles.
2. **Card** (`folder&file`, 144 x 144, 16px radius, padding 8, content centred
   with an 8px gap) — one control, top to bottom:
   - **Figure**, a fixed 80px square. It holds the exported folder illustration
     at **80px** (`assets/folder-icon.webp`, shared with
     `design-system/components/folder.md` and the table's sub-folder chip) or a file-type glyph
     at **64px** (`assets/file-type-icons/file-<ext>.svg`, shared with
     `design-system/components/data-table.md`).
   - **Name**, `Text sm` regular (14/20) in `Neutral/700` — Figma vẽ Text md medium, đổi theo yêu cầu 2026-10-01, centred, clamped to two
     lines with an ellipsis so every tile stays 180px tall.
   - **Kind**, visually hidden — `Thư mục` / `Thư mục, chưa có hồ sơ` or `Tệp PDF, 200 KB`; hồ sơ nhiều tệp: `Hồ sơ, 3 tệp: JPG, DOC, XLSX` Thẻ nhiều đuôi dùng `.file-chip.file-chip--multi.folder-card__icon--file` (asset `file-multi.svg` + `.file-chip__count`, số text-sm).
     Không đếm số hồ sơ (bỏ 2026-10-01); thư mục chưa có hồ sơ dùng asset `assets/folder-empty.svg`
     (không giấy, xám nhạt; cùng luật với `folder.md`). Gap: Figma chưa có icon rỗng.
3. **Empty level** — a folder with no children and no documents renders the
   listing's empty state, not an empty grid.

There is **no visible meta line**. The source draws name only; size and type are
carried in the hidden kind text so the card still announces what it is.

## States

| State | Treatment |
|---|---|
| Default | Transparent tile on the panel surface, transparent 1px border. |
| Hover | `--utui-color-bg-surface` fill and a `--utui-color-border-default` border. The only state authored in Figma (`state="Hover"` on the Slot's first card). |
| Focus | Not authored. The implementation shows the hover surface plus the shared brand focus ring — a card is a control and must be visible when tabbed to. |
| Activated (folder) | Opens that folder: the grid re-renders one level down and the breadcrumb trail gains a segment. |
| Activated (file) | Opens the document preview screen. |
| Empty | `Thư mục này chưa có nội dung`, with the parent reachable from the trail. |

## Tokens

| Role | Token |
|---|---|
| Card width | `--utui-folder-card-width` (144px) |
| Card height | `--utui-folder-card-height` (144px) |
| Card radius | `--utui-folder-card-radius` (`--utui-radius-xl`) |
| Card padding | `--utui-folder-card-padding-top` / `-x` / `-bottom` (8 / 8 / 8) |
| Figure–name gap | `--utui-folder-card-gap` (8px) |
| Figure | `--utui-folder-card-figure-size` (80px) |
| Folder glyph | `--utui-folder-card-icon-folder` (80px) |
| File glyph | `--utui-folder-card-icon-file` (64px) |
| Hover surface | `--utui-folder-card-hover-bg` |
| Hover border | `--utui-folder-card-hover-border` |
| Grid gap | `--utui-folder-grid-gap` (`--utui-spacing-03`, 12px) |
| Name | `--utui-font-size-text-sm` / `--utui-line-height-text-sm`, `--utui-font-weight-regular`, `--utui-color-neutral-700` |

`--utui-folder-card-width` is a token rather than a literal because
`responsive.css` has to hand the card the whole column at `sm`.

## Responsive

The grid is `repeat(auto-fill, var(--utui-folder-card-width))`, so it sheds a
column on its own with the card keeping its designed size at every width. That is
the "collapse the region, not the component" rule expressed as a wrapping grid,
so no tier rule exists above `sm`. Measured on `du-an/ho-so/danh-sach?view=folder` 2026-10-01:

| Viewport | Columns | Card |
|---|---|---|
| 1920 | 8+ (chỉ có 8 thẻ mẫu) | 144 x 144 |
| 1440 | 7 | 144 x 144 |
| 1280 | 6 | 144 x 144 |
| 1024 | 5 | 144 x 144 |
| 768 | 4 | 144 x 144 |
| 375 | 1 | full track x 144 |

The composing pattern must not nest the grid inside a padded panel: the source's
inset is the page gutter, and a second one costs a column.

At `sm` (279px content column) `responsive.css` gives the grid a single
`minmax(0, 1fr)` track; the card fills the track and its glyphs are capped at
`max-width: 100%`.

## Accessibility

- The grid is a `<ul>` of `<li>`, so the number of items is announced. The card
  is a `<button>`, so Enter and Space come from the element rather than a
  keydown handler.
- The card is one control with one accessible name — the illustration is
  `aria-hidden`, and the hidden kind text is what distinguishes a folder from a
  document. The two kinds must never be told apart by illustration alone.
- The name clamps to two lines visually but the full string stays in the DOM, so
  the accessible name is complete.
- The grid's container is a named, programmatically focusable `role="group"`.
  Focus moves there after a drill-down or a breadcrumb jump, so the change of
  location is announced; it does **not** move on the initial render or on a view
  switch, where it would be taken away from the control the user just pressed.
- Under `pointer: coarse` the card is far above the 44px minimum, so it needs no
  hit-area rule.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.folder-grid`, `.folder-card`, `.folder-card__figure`, `.folder-card__icon`, `.folder-card__name`, `.folder-card__kind` in `styles/folder-grid.css` |
| Tier rule | `styles/responsive.css` (sm) |
| Tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Assets | `assets/folder-icon.webp`, `assets/file-type-icons/` |
| Example | `screens/du-an/ho-so/danh-sach.html` (`#docsGridView`), rendered by `screens/du-an/ho-so/danh-sach.js` |

```html
<ul class="folder-grid">
  <li>
    <button class="folder-card" type="button" data-grid-folder="f02">
      <span class="folder-card__figure">
        <img class="folder-card__icon" src="../assets/folder-icon.webp" alt="" aria-hidden="true">
      </span>
      <span class="folder-card__name">02. Quy hoạch</span>
      <span class="folder-card__kind">Thư mục</span>
    </button>
  </li>
  <li>
    <button class="folder-card" type="button" data-grid-record="1105">
      <span class="folder-card__figure">
        <img class="folder-card__icon folder-card__icon--file" src="../assets/file-type-icons/file-xlsx.svg" alt="" aria-hidden="true">
      </span>
      <span class="folder-card__name">T&amp;T.COLOA.PLDA.PCCC.01</span>
      <span class="folder-card__kind">Tệp XLSX, 200 KB</span>
    </button>
  </li>
</ul>
```

## Known Gaps

- **No selected, disabled, loading, or drag state is authored.** Only default and
  hover exist in the source, so multi-select, drag-to-move and any bulk action on
  the grid are unspecified. Assume none is supported.
- **No row action.** The table gives every record a 3-dot overflow menu
  (`design-system/components/data-table.md`); the card gives it nothing, so rename, download and
  delete are unreachable in this mode. The source draws no affordance for them.
  This needs a product decision, not CSS.
- **The card badge at `11099:31723` is unexplained.** A second 32px image sits
  over the folder illustration at (157, 99) on exactly one card in the source,
  with no variant, name or repeat instance to say what it means — shared? locked?
  synced? It is not implemented; implementing a status marker whose meaning is
  guessed would be worse than leaving it out.
- **No sort or pagination.** The Slot is a fixed height in the source (564px, two
  rows) with no footer, so what happens past two rows of cards — scroll, paginate,
  or grow the page — is not authored. The implementation lets the grid grow with
  the page.
- **`sm` behaviour is extrapolated.** The source has one 1920px frame; every tier
  below it is reasoned from the design rules, per `.claude/skills/responsive/SKILL.md`.
