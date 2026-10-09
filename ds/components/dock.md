# Dock (minimized drafts)

## Purpose

The dock is a tray at the bottom-right of the viewport that holds surfaces the user has
**minimized** instead of closed. Three consumers: `#createDrawer` (the partner create
wizard, `screens/doi-tac/danh-sach.html`), `#uploadOverlay` (the document upload
overlay, `screens/du-an/ho-so/danh-sach.html`) and `#importDrawer` (the Excel import
wizard, same screen): the user can step out to the page behind, look something up, and
come back to the same half-filled form.

It is not a page-tab (`page-tab.md`, a navigation destination) and not a notification
(`notification.md`, an outcome). A dock item is unfinished work that the user owns.

## Source

| Item | Value |
|---|---|
| Figma | **None. AUTHORED (gap).** Layout, size and copy are decisions made in the implementation, 2026-09-30 |
| Model | Visual reference: Gmail minimized compose (tab flush with the viewport foot, tinted header, title left, three icons right) - **AUTHORED**. Behaviour: several drafts, newest at the leading edge, right-aligned, restore or close each |
| Confirmed with | User plan of 2026-09-30 (multiple drafts, max 3, minimize control on the drawer) |

## Anatomy

| Part | Class | Notes |
|---|---|---|
| Dock | `.dock` | `<section role="region" aria-label="…">` (label per consumer, see Copy), `position: fixed`, bottom/right `--utui-dock-offset`, left inset = nav width + offset (`body:has(.side-nav.is-collapsed)` and `max-width: 1279px`: collapsed nav width), so it sits in the `.main` column. Lives **outside** `.mdm-shell`, at the end of `<body>`, next to the overlays. `hidden` while it has no item. The layer takes no pointer events; only items do |
| List | `.dock__list` | `<ul>`, flex row, `--utui-dock-gap`, items end-aligned |
| Item | `.dock__item` | `<li>`, `--utui-dock-item-width` (= drawer `sm`, 400px) wide, at least `--utui-dock-item-height` (44px) tall, `--utui-color-bg-surface-subtle` fill, 1px `--app-border` on top and sides (none at the foot), `--utui-radius-md` on the two top corners only, `--utui-dock-shadow`. Flush with the viewport foot (`bottom: 0`). Shrinks (title ellipsis) when the row does not fit |
| Title | `.dock__title` | A `<button>`: draft name (see Copy), text-sm semibold, `--utui-color-text-primary`, one line with ellipsis. Restores the draft; the whole leading area is the target. `aria-label="Mở lại {title}"` |
| Restore | `.dock__restore` | Icon button, glyph `minimize` (as Gmail), a pointer duplicate of the title: `tabindex="-1"` and `aria-hidden="true"`, so keyboard and screen-reader users meet one restore control, not two |
| Expand | `.dock__expand` | **Optional.** Icon button, glyph `open_in_full`, `aria-label="Mở toàn màn hình {title}"`. Restores the draft already expanded. Omit when the surface has no expanded state (the upload overlay is always full screen); then the order is title, minimize, close and Tab order title, close |
| Progress | `.dock__progress` | **Optional.** `position: absolute` flush with the item's foot, holding a `.progress-bar` (`ds/components/progress-bar.md`, `role="progressbar"`, aggregate of the background task). Used by the Excel import item while its files are still uploading (the bar leaves with the last file) |
| Close | `.dock__close` | Icon button, glyph `close`, `aria-label="Đóng {title}"`. Asks the same leave question the surface asks (the screen's `confirmLeave`) |

The icon buttons share the rule of `.drawer__close` / `.drawer__expand` (`drawer.css`: `--utui-button-height-md` box, transparent, hover `--utui-color-bg-surface-hover`). With expand: order title, minimize, expand, close; Tab order title, expand, close. **DOM order = visual order.** The screen inserts the newest
item first, so drafts fill from the right edge leftwards and Tab order follows what is seen
(no `row-reverse`).

## Behaviour

The dock is markup + CSS; the behaviour is split (Angular: see draft below).

| Concern | Rule |
|---|---|
| Minimize | The drawer's `.drawer__minimize` calls `OmeuModal.minimize(id)` (`ds/scripts/modal.js`): overlay `hidden` + `.is-minimized`, off the modal stack, shell no longer inert, Tab trap off. Only when `depth() === 1` and the overlay has `data-drawer-minimizable`. `beforeClose` is not asked: nothing is discarded |
| Draft state | A drawer has one DOM. The screen (`screens/doi-tac/tao-moi.js`) snapshots the draft (step, values, table rows, dirty, expanded) into the item and resets the drawer. Restore loads it back |
| Restore | `OmeuModal.restore(id, trigger, { beforeClose, expanded })`: re-opens, focus on the panel, expanded state of that draft comes back (ignored at `max-width: 767px`) |
| New draft | The trigger (`Tạo mới`) opens a blank draft even when items exist |
| Limit | At most 3 items. At 3, the trigger raises a `warning` notification instead of opening. On `du-an/ho-so/danh-sach` the upload drafts and the Excel import **share** the 3 (`MdmUpload.dockTotal()`); the import is one session at a time, so its trigger restores the docked import instead of starting a second |
| Close from dock | Confirms if the draft is dirty, removes the item, focus moves to the neighbouring item's title button, else to the trigger |
| Excel import | One kind of item, a **draft** (minimized by hand before the commit): title + restore + expand + close; while attached files (step 3, rows not created yet) upload it carries a `.dock__progress` and its title reads `· Đang tải d/n tệp`; closing it asks to drop the session; it takes one of the 3 places. The commit waits for every file to finish (USER DECISION 2026-10), so nothing is left to dock after it: step 4 has no minimize |
| Escape | Does nothing to the dock (it is not on the modal stack) |
| Another surface opens | The dock goes inert together with the shell and comes back when the last surface closes |
| Leaving the page | `beforeunload` (browser default dialog) while any item exists or a dirty drawer is open |

Focus: minimize -> the new item's title button; restore -> the panel; close from dock -> see above.

## Copy

Per consumer; `{title}` is the draft name (see rows), `{n}` the lowest number not used by another item.

| Where | Đối tác (`#createDock`) | Hồ sơ (`#uploadDock`, chờ PO duyệt) |
|---|---|---|
| Region label | `Form tạo đối tác đang thu nhỏ` | `Hồ sơ đang thu nhỏ` |
| Draft with a name | Partner name (VN), trimmed | `#fieldName` value, trimmed |
| Draft without a name | `Đối tác mới {n}` | `Hồ sơ mới {n}` |
| Restore / expand / close labels | `Mở lại {title}` / `Mở toàn màn hình {title}` / `Đóng {title}` | `Mở lại {title}` / (no expand) / `Đóng {title}` |
| Limit notification (`warning`) | `Chỉ thu nhỏ được tối đa 3 form tạo đối tác.` + description `Mở lại rồi lưu hoặc đóng một form trước khi tạo mới.` | `Chỉ thu nhỏ được tối đa 3 hồ sơ đang tải lên hoặc nhập từ Excel.` (no description) |
| Close confirm (from dock) | `window.confirm`: `Đóng {title}? Thông tin đã nhập sẽ không được lưu.` | Modal `#leaveConfirmModal` (same one the overlay's own close uses): `Đóng hồ sơ đang tải lên?` / `Tài liệu và thông tin đã nhập sẽ không được lưu.` / `Giữ lại` · `Đóng hồ sơ` |

`#importDrawer` (`#uploadDock`, shared tray; chờ PO duyệt): item title `Nhập hồ sơ từ Excel`; with expand (order title, minimize, expand, close); labels `Mở lại Nhập hồ sơ từ Excel` / `Mở toàn màn hình …` / `Đóng …`; limit notification `Chỉ thu nhỏ được tối đa 3 hồ sơ đang tải lên hoặc nhập từ Excel.`; close from dock asks `#importLeaveModal` (`Đóng nhập hồ sơ từ Excel?` / `Dữ liệu đã đọc sẽ không được lưu.` / `Giữ lại` · `Đóng nhập hồ sơ`) when the session is dirty. Files being attached keep uploading while it is docked. While files upload the title reads `Nhập hồ sơ từ Excel · Đang tải {done}/{n} tệp` (its accessible name is `Mở lại` + that visible text, WCAG 2.5.3).

## Tokens

| Token | Role |
|---|---|
| `--utui-dock-z` | 45: above chrome and notification (40), below drawer/modal (60). GAP-2: no z-index scale exists |
| `--utui-dock-offset` | 24px from the right and the nav edge (the foot is flush, 0); `0px` at `max-width: 767px` (`responsive.css`) |
| `--utui-dock-gap` | Between items (`--utui-spacing-03`) |
| `--utui-dock-item-width` / `--utui-dock-item-height` | `--utui-drawer-width-sm` / `--utui-touch-target-min` |
| `--utui-dock-radius` / `--utui-dock-shadow` | `--utui-radius-md` / `--utui-shadow-lg` |
| `--utui-dock-clearance` | Space the page keeps at its foot for one row |

## Responsive

- Page clearance: while an item exists, `.main` gets `padding-block-end: --utui-dock-clearance`,
  so the dock never covers pagination (one row: item height + gap). Rule is `body:has(.dock__item) .main` in `dock.css`.
- `max-width: 1279px` and collapsed nav: left inset uses `--utui-nav-width-collapsed`.
- `max-width: 767px`: the dock spans the full width at the foot (offset 0), items **stack one
  per row**, edge to edge, square corners, joined; clearance grows by row (1-3). Chosen over a
  sideways scroller: no scroll container, no extra tab stop, every title visible. Cost: three
  items take 132px of the height. Nothing restores itself on reaching this tier.
- `.drawer__minimize` is hidden at this tier (`responsive.css`); existing items stay.

## Accessibility

- Named landmark `role="region"` with the consumer's label (see Copy); `hidden` when empty.
- Native `<button>`s with the draft title in the name. Equal titles are not de-duplicated; the title keeps its ellipsis.
- Focus ring from `base.css`; the dock is reachable by Tab (end of the document order, after the page).
- Inert with the shell while a modal surface is open; not `aria-hidden`.
- Minimize is not announced by a notification: the focus move to the new item's title button is the announcement.

## Code Mapping

| Surface | File |
|---|---|
| CSS | `ds/styles/dock.css` (imported after `tooltip.css` in `ds/styles/app.css`) |
| Tokens | `--utui-dock-*` in `ds/tokens/untitled-ui-component.css`; sm offset in `ds/styles/responsive.css` |
| Surface behaviour | `OmeuModal.minimize / restore / docked` in `ds/scripts/modal.js` |
| Drawer side | `.drawer__minimize`, `data-drawer-minimizable`, `.is-minimized` (`ds/components/drawer.md`) |
| Example | `screens/doi-tac/danh-sach.html` `#createDock`; items, snapshot and limit in `screens/doi-tac/tao-moi.js` ("Drafts") |
| Example 2 (no expand) | `screens/du-an/ho-so/danh-sach.html` `#uploadDock`; items, per-draft state, background uploads, limit and demo hooks (`?dock=N`, `?open=1`) in `screens/du-an/ho-so/tai-len.js`. Surface side: `.doc-detail__minimize` + `data-drawer-minimizable` on `.doc-detail--overlay` (`ds/components/doc-detail.md`) |
| Example 3 (shared tray) | `screens/du-an/ho-so/danh-sach.html` `#importDrawer`; session, items and demo hook (`?dock=import`) in `screens/du-an/ho-so/nhap-excel.js`. It registers its item into `#uploadDock` through `MdmUpload.registerDock` (`tai-len.js` renders the tray and owns the cap) |

## Angular draft (not confirmed)

Inputs on drawer: `minimizable: boolean` (`data-drawer-minimizable`). Outputs: `minimized`, `restored`.
A `DockService` holds at most 3 entries (title, saved form value, expanded) and renders the dock;
the form value is the host's, not the drawer's. Not in `handoff.config.json › angularMap`: the dev
design system has no dock folder to point at.

## Known Gaps

- **AUTHORED, no Figma frame** for the dock, the item, the minimize glyph or the copy.
- **No autosave: a reload loses every draft.** `beforeunload` warns, nothing persists. The upload overlay also keeps `File` objects and running uploads in memory only, and the dock is only on `du-an/ho-so/danh-sach` of the same project: leaving that page loses the drafts.
- **No z-index scale** (GAP-2, `untitled-ui-component.css`); `--utui-dock-z` is one more literal.
- **Item width follows drawer `sm` (400px), shrinking with an ellipsis.** The dock is bound to the `.main` column (left inset = nav width + offset; collapsed nav and `max-width: 1279px` use the collapsed width), so it never covers the side navigation. Three items need ~1224px of column; narrower columns shrink the titles.
- **"Đối tác mới {n}" and "form tạo đối tác đang thu nhỏ"** are new wording; needs PO confirmation. Same for the upload copy (`Hồ sơ mới {n}`, `Hồ sơ đang thu nhỏ`, the limit and discard texts).
- **The upload-draft dock item shows no upload progress** while its draft keeps uploading in the background (the Excel import draft does while its attached files upload, `.dock__progress`).
- **No swap:** restoring a draft while another is open is not supported; the dock is inert under the scrim while a drawer is open.
- **The limit of 3 is a product choice**, not from a source. The Excel import counts toward the same 3 as the upload drafts (user decision, 2026-10).
- **Focus ring vs `.dock__progress`:** the bar sits flush on the item foot and paints over the bottom edge of the shared focus ring on `.dock__title` (any item that carries a progress bar). The common ring is left as is.
- **Import item order:** the import item is appended after the upload drafts, not placed by time, so "newest at the leading edge" does not hold when both kinds are docked.
- **Native `window.confirm`** on close from dock for the partner drawer, same as its `beforeClose` (drawer.md gap). The upload dock uses a modal instead.
