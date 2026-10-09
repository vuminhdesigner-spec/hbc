# Doc detail (document popup)

## Purpose

Doc detail is the full-screen popup a single hồ sơ (document record) opens
into — for reading it, editing its metadata, or uploading a new one. It
replaces the app shell entirely (no side nav, no page tabs, no breadcrumb):
the record is the whole screen for as long as the popup is open, and closing
it returns to wherever it was opened from.

One component, two consumers with different edit rights: `chi-tiet` (a
record that already exists, read-only or editable by role/state) and
`tai-len` (a new record, always editable). Both share the same frame; what
differs is which parts render and whether the form fields are `--readonly`.

Two ways to host the frame. As a **page** (`chi-tiet`): its own HTML file, close is
navigation. As an **overlay** (`tai-len`, since 2026-10-01): `.doc-detail--overlay`
floats over the screen it was opened from, so that screen, its dock and the drafts
kept in memory survive; close is a `<button>`, not navigation.

## Source

| Item | Value |
|---|---|
| Figma file | MDM (Un-Official) (`TpwqqNqhnFgycttdngXmFA`) |
| Frame | `pop-up-full-screen`, 1440 x 792, section `14146:26959` |
| Frames read | `1-edit-empty` (`14146:26983`), `2-edit-files` (`14146:27015`), `3-edit-collapsed` (`14146:27022`), `4-readonly-archived` (`14162:51821`), `6-rename-move` (`14222:29784`) |
| Read via | `get_design_context`, 2026-09-29 (MDM-1209) |
| Prior source | Screen-local `.doc-detail*` in `screens/du-an/ho-so/chi-tiet.css`, drawn against an earlier read of the same frame family — no preview column, a single document well instead |

## Anatomy

**`.doc-detail`** — the popup root. Full-viewport grid (header row, body row),
page wash background (`--utui-page-wash*`), no `.mdm-shell`.

**`.doc-detail--overlay`** — the root as a surface of `modal.js`: `position: fixed;
inset: 0`, `z-index: --utui-doc-detail-overlay-z` (60, same band as drawer/modal; DOM
order decides, so child layers come after it in the markup), `overflow: auto` so the
sticky header sticks inside it, `[hidden]` hides it. Markup carries
`role="dialog" aria-modal="true" aria-label tabindex="-1"` on the root itself (no
`.modal__panel` wrapper; `modal.js` `panelOf()` accepts it) and opt-in
`data-drawer-minimizable`. Child layers open with `{ stack: true }`; a close guard goes
through `beforeClose` (sync: ask, return `false`, close again when confirmed).

**`.doc-detail__header`** (`header-docs`, sticky, white, shadow-xs; measured headless 2026-10: ~92px at ≥1280 with the folder row (copy button no longer sets the row height), ~140px at 1024 where `.header-actions` wraps under the identity, re-measured 2026-10-06 with three named + print icon (DC at Hoàn thành bàn giao); 1280 still ~92px — the Figma 72px frame has no folder row):

1. **`.doc-detail__close`** — a 36px control (not `.button`), X glyph. Page: an
   `<a href>` with a per-role destination (`data-return-link`) — closing is a
   real navigation back to the list. Overlay: a `<button type="button"
   data-modal-close>` — closing is dismissing a surface (`ds/scripts/modal.js`),
   nothing to open in a new tab.
   **`.doc-detail__minimize`** — optional, only in an overlay, directly after
   `__close` in `__header-left`. Glyph `minimize`, `aria-label="Thu nhỏ"`; shares the
   icon-button rule of `.drawer__close` (`drawer.css`: `--utui-button-height-md` box,
   hover `--utui-color-bg-surface-hover`) and joins `__close` as one cluster.
   Calls `OmeuModal.minimize(id)` (needs `data-drawer-minimizable` on the overlay and
   depth 1, so it is inert whenever a child layer — move drawer, send dialog,
   discard confirm — is open, because the overlay itself goes inert). Hidden at
   `max-width: 767px` (`responsive.css`), like `.drawer__minimize`. AUTHORED, no Figma
   frame. Restoring never reopens a child layer.
2. **`.doc-detail__identity`** — everything the header knows about the record.
   Two rows: the title row (title text · badges) and, under it, the
   **`.doc-detail__folder`** chip with the full folder path (2026-10 change: the
   old "Tạo bởi … vào ngày …" supporting line is gone — the creator is the rail's
   "Người gửi yêu cầu"; the chip took its slot). The title (`__heading` or
   `__title-input`) hugs its text — the input sizes to its value/placeholder via
   `field-sizing: content` — so badges sit right after it (12px gap).
   `__identity` takes the free width of the header. When the row is short the
   title shrinks (floor 12ch) and the chip ellipsizes inside its own row; there
   is no fixed max-width on either. Browsers without `field-sizing` (Firefox, as
   of 2026-10) fall back to the old fill-the-row input via `@supports not`;
   functional, not pixel-faithful:
   - **`.doc-detail__title`** — a flex row: either **`.doc-detail__heading`**
     (an `<h1>`, read-only / static) or **`.doc-detail__title-input`** (an
     `<input>`, edit mode — see States below) and an optional `.badge-group`
     (ds/components/badge.md: a gray `--no-dot` badge carrying `<Mã hệ thống>`
     and a status badge whose tone follows the archive state). The title text is
     the one part allowed to shrink and ellipsis; badges keep their own size.
   - **`.doc-detail__folder`** — "[folder icon] <path>" (no "trong" word), `text-sm`, opens
     the move drawer. Edit mode only (PLAN Q8); read-only prints the same markup
     on a non-interactive element (a `<span>`, not a `<button>`) — the class
     carries no assumption about which. Ancestors are NOT separate targets: the
     whole chip is one button.
     - **`.doc-detail__folder-row`** wraps the chip and **`.doc-detail__folder-copy`**,
       an icon-only `.button.button--link-gray.button--compact` (`content_copy`,
       `aria-label="Sao chép đường dẫn"`) that is a sibling of the chip. Invisible
       (opacity 0, still tabbable) until the row is hovered or focus is inside; always
       visible under `@media (hover: none)`. The screen copies "Danh mục / Thư mục" with
       `navigator.clipboard.writeText` and toasts "Đã sao chép đường dẫn" or
       "Không sao chép được đường dẫn".
     - **`.doc-detail__folder-path`** — flex run of the path:
       `__folder-segment` (first, secondary text) · `__folder-sep` · optional
       `__folder-collapsed` (middle levels as one text run joined with " › ") ·
       `__folder-sep` · `__folder-segment--leaf` (primary text). Shrink order,
       Google-Drive style: only `__folder-collapsed` shrinks (to 0). First and
       leaf are `flex-shrink: 0` with a cap of `30cqw` / `45cqw` of `__identity`
       (a size container; a `%` of the content-sized path is circular and
       truncated even short paths, measured 2026-10), then ellipsize.
       `__folder-sep` is a CSS
       "›" (`::before`), so it never enters `textContent` (tooltip text).
     - Full path for assistive tech: E button carries
       `aria-label="<path>, chuyển vị trí hồ sơ"` (starts with the visible text); R span keeps an
       `.sr-only-label` with "Hiện trong: <path>" and hides the visual path
       (`aria-hidden`). Path pieces are painted by the screen's script.
     - Sighted full text: `data-tooltip-overflow` on each ellipsizable piece
       (it reads that piece's text only — see Known Gaps).
3. **`.header-actions`** (ds/components/page-header.md — reused, not owned
   here) — up to three named actions plus icon-only ones (raised from two
   2026-10-06: DC at Hoàn thành bàn giao has Lưu chỉnh sửa / Từ chối / Đồng ý),
   built by the consumer's own `actionsFor()`. Never disabled: an action that does not
   apply is absent, not greyed out (PLAN region 7).

**`.doc-detail__body`** — up to three tracks, named grid areas
(`files` / `preview` / `form` / `rail`):

1. **`.doc-detail__doc`** — the file-listing column, 380px, content height. An
   `.attachment-pane` (ds/components/attachment.md) — section header (featured
   icon, "Tệp đính kèm", `__collapse`/`__expand`), a `file-upload` dropzone
   (edit mode only) and an `attachment-list` file queue.
2. **`.doc-detail__preview`** — 500px (view-only body: see below), only rendered while ≥1 file exists
   (PLAN region 11). A second `file-upload` instance (ds/components/file-upload.md),
   state B (`.is-filled`) or C (`.is-unsupported`) — never the dropzone state,
   there is nothing to drop here. At ≥1280 fills the viewport under the header (`100dvh − --utui-doc-detail-header-block-size
   − 2 × --utui-page-gutter-y`), not the form + rail column height; state B scrolls the
   document inside its viewport, state C centres in it. ≤1279 (preview above the form):
   content height, viewport bounded by `--utui-scroll-region-offset`.
   View-only body (no `__form-track`/`__rail`, e.g. doi-tac file viewer): a `:has` rule makes the map `files` 380px + `preview` `minmax(0, 1fr)`; fills the height at ≤1279 too; ≤1023 stacks them. No modifier.
3. **`.doc-detail__form-track`** — the form column: "Bản cứng kèm theo" and
   "Thông tin hồ sơ", two `section-card--form` instances
   (ds/components/section-card.md), stacked.
4. **`.doc-detail__rail`** — "Yêu cầu lưu trữ" summary + "Lịch sử trạng thái"
   timeline, stacked *under* the form column (PLAN Q2 — it is not its own
   grid column any more; the pre-promotion glue gave it one). Always present. Exception: the upload overlay (tai-len) has no request yet, so it renders no rail at all.

## States

| State | What changes |
|---|---|
| Edit, empty | No files: `.doc-detail__preview` is `[hidden]`, `.doc-detail__doc` shows the dropzone. Chưa lưu được: Lưu khi không còn tệp `done` mở lại vùng đính kèm, báo "Vui lòng đính kèm tệp." tại `.file-upload` (aria-invalid trên nút "Tải lên"), focus nút đó, chặn lưu. |
| Edit, files | `.doc-detail__preview` renders; `.doc-detail__doc` shows the queue under the dropzone. |
| Edit, collapsed | `.doc-detail__doc`'s `.attachment-pane` carries `.is-collapsed` (ds/components/attachment.md) — the file column shrinks to its own auto-width control, and `.doc-detail__preview` folds with it (D3, 2026-09-29 review: collapsing the file pane always folds the preview too — CSS enforces this regardless of the preview's own `[hidden]`, so it cannot be reached collapsed-with-preview-visible even before a consumer's JS sets the attribute). Expanding restores the preview if ≥1 file exists — that restore is JS's job, not CSS's. |
| Read-only (role or archive state has no edit right) | Dropzone absent, file rows show a download icon instead of delete, form fields are `--readonly`/disabled (`applyLock()`), the folder chip and title print as static text, and the toggle in "Bản cứng kèm theo" is a disabled, checked/unchecked switch, never omitted. |
| Missing record (`?id=` names nothing) | `.doc-detail__body` is `[hidden]`; `.doc-detail__missing` (an `.empty-page`) renders instead. |

### Title — default / hover / editing / error

Read from `6-rename-move.png`, edit mode only:

1. **Default** — placeholder "Nhập tên hồ sơ..." (`--utui-color-text-placeholder`)
   or the saved name (`--utui-color-text-primary`); no visible box.
2. **Hover** — a rounded highlight appears behind the text
   (`--utui-color-bg-surface-hover`), signalling the field is editable. Not a
   border — an untouched field must not look like a permanent input.
3. **Editing (`:focus-visible`)** — `--utui-field-border-focus` border +
   `--utui-field-focus-shadow` ring, the same recipe `.form-field__control`
   uses.
4. **Error (`.is-error`, PLAN Q6)** — empty on save: `--utui-field-border-error`
   border, and `.doc-detail__title-error` (styled like `.form-field__error`,
   no icon) prints under the title. The consumer sets both together and clears
   both once the field is non-empty again.

**Left edge = the title's text edge**, in E and R alike. The input is pulled
back by its padding + border (negative `margin-inline-start`), so the title text,
folder row and error line share one edge; the hover/focus box overhangs to the left
into the gap beside the close button.

## Container (D1, 2026-09-29 review)

`.doc-detail__form-track` is a named CSS container — `container: doc-form /
inline-size` — declared in `styles/doc-detail.css`. It replaces the
`:has(> .doc-detail__preview)`/`:has(.attachment-pane.is-collapsed)` selectors
the two screens used to key their own form's column count off: a real
`@container` query reads the track's actual rendered width, so it reflows
correctly whichever of preview-present, preview-absent, pane-collapsed or a
narrow viewport caused that width, without the consumer naming each cause.

**The `@container` rules themselves are screen-owned**, same split
ds/components/section-card.md § `--form` Known Gaps already records for the
2-up/4-up field grid — `.doc-detail__form-track` only declares the container,
`screens/du-an/ho-so/chi-tiet.css` and `.../tai-len.css` each query it for
their own grids (`.doc-detail__form`, `.hardcopy__counts`, `.hardcopy__fields`).

**Thresholds are literal `px`, not `var()`** — a `@container` condition cannot
read a custom property, so each is computed once from the fields' own numbers
and written as a comment beside the rule that uses it:

`track width ≥ N × field-min + (N−1) × gap + card-inset`, where `card-inset`
is the card's padding + border (`20px × 2 + 1px × 2 = 42px` — inside doc-detail
both `.section-card--form` and the rail cards use the 20px inset, 2026-10-05).

| Grid | Field min | Gap | Columns → threshold |
|---|---|---|---|
| `.doc-detail__form` ("Thông tin hồ sơ", both screens) | 170px (SPEC) | 24px (`--utui-spacing-06`) | 1 (base) / 2 ≥ 406px / 4 ≥ 794px |
| `.doc-detail__rail` data-list (chi-tiet, stacked label over value; container `doc-rail`; column gap 24px so its columns sit under the form's) | 170px | 24px (`--utui-spacing-06`) | 1 (base) / 2 ≥ 406px / 4 ≥ 794px |
| `.hardcopy__counts` (chi-tiet, 4 quantity fields, "Ngày dự kiến nộp" is its own full-width sibling, not in this grid) | 170px | 16px (`--utui-spacing-04`) | 2 (base) / 4 ≥ 770px |
| `.hardcopy__fields` (tai-len, date + 4 quantities in one grid, `.hardcopy__due` spans the row until 5-up) | 170px | 16px | 2 (base) / 5 ≥ 956px |

**Viewport tiers still cap columns below their container-query result** at
≤1279px/≤1023px/≤767px (`styles/responsive.css` rungs) — a deliberate product
choice to keep the tablet/mobile reading calmer than the raw width would
otherwise allow, not something a container query can express on its own.
Each screen's own tier rules restate the cap at the same selector so it wins
by source order, not by inventing a second breakpoint scale.

**GAP: chi-tiet's hardcopy grid does not reach "1×5".** SPEC's collapsed
reading merges the date field into a single 5-up row; chi-tiet keeps the date
field outside `.hardcopy__counts` entirely (a pre-existing structural
difference from tai-len, not introduced by this review), so its own ceiling
is 4-up counts beside a full-width date row. Unifying the two screens' hardcopy
markup is a product/design call, not made here.

## Tokens

No new token. Reuses `--utui-page-wash*`, `--utui-page-gutter-*`,
`--utui-page-block-gap`, `--utui-spacing-*`, `--utui-field-border-*`,
`--utui-field-*-shadow`, `--utui-color-text-*`, `--utui-font-*`,
`--utui-radius-md`.

**Literal, component-owned container measures** (per `.claude/skills/design-rules/SKILL.md`
§ Layout — "not a viewport breakpoint"): file column 380px, preview column
500px — read off the Figma frame, not tokenised, same convention the
pre-promotion glue already used for its own 428px/300px tracks. The `doc-form`
container's own query thresholds are the same kind of literal — see § Container.

## Responsive

**GAP.** The Figma source is a single 1440px frame; no responsive variant of
*this* column set (file / preview / form+rail) was drawn or reviewed. The
ladder in `styles/doc-detail.css` (folds at the shared 1279px/1023px/767px
rungs — `.claude/skills/responsive/SKILL.md`) is inferred from the
pre-promotion glue's OWN ladder, which folded a different three tracks (a
single document well / form / rail, no preview column). Confirm once a
screen is actually built against it and real file names/counts exist to
reflow against.

## Accessibility

- Page: the close control is a real `<a href>`, never a `<button>` — it is
  navigation, and it must be openable in a new tab. Overlay: a `<button>`, because
  it dismisses a dialog (`role="dialog"` on the root, focus lands on it, Tab is
  trapped by `modal.js`, the page behind is inert).
- The title is the popup's one `<h1>` in read-only mode; in edit mode the
  `<input>` needs an `aria-label` (e.g. "Tên hồ sơ") since it carries no
  visible `<label>` of its own — the placeholder is not one.
- `.doc-detail__title-error` needs `aria-describedby` from the title input,
  the same wiring `.form-field__error` uses.
- The preview and file-listing panes are each their own labelled region; see
  ds/components/attachment.md and ds/components/file-upload.md for their own
  accessibility rules (the scrollable viewport in particular:
  `role="region"` + `tabindex="0"` + a label saying it scrolls).
- Long titles, folder names and file names need
  `data-tooltip-overflow` (ds/components/tooltip.md) — not authored here, a
  screen concern (PLAN region 23). The trigger this attribute goes on must be
  a focusable element or a descendant of one that `ds/scripts/tooltip.js`'s
  `focusin` handler can resolve — see that script's own fallback for a
  keyboard-focusable ancestor (R11, 2026-09-29 review).

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.doc-detail`, `__header`, `__header-left`, `__close`, `__minimize`, `__identity`, `__title`, `__heading`, `__title-input`, `__title-error`, `__folder`, `__folder-row`, `__folder-copy`, `__folder-icon`, `__folder-path`, `__folder-segment`, `__folder-segment--leaf`, `__folder-collapsed`, `__folder-sep`, `__body`, `__doc`, `__preview`, `__form-track`, `__rail`, `__form`, `__missing` in `styles/doc-detail.css` |
| Composes | `.header-actions` (ds/components/page-header.md), `.badge-group` (ds/components/badge.md), `.button--link-gray` (ds/components/button.md), `.attachment-pane` (ds/components/attachment.md), `.file-upload` (ds/components/file-upload.md), `.attachment-list` (ds/components/attachment-list.md), `.section-card--form` (ds/components/section-card.md), `.data-viewer` (ds/components/data-viewer.md) |
| Icon asset | `ds/assets/folder-icon.webp`, shared with `ds/components/folder.md` |
| Screens | `screens/du-an/ho-so/chi-tiet.{html,css,js}` (page) and `.../tai-len.{css,js}` (overlay inside `danh-sach.html`; markup there, drafts and dock in `tai-len.js`) and `screens/doi-tac/ho-so-nang-luc.{html,js}` (view-only overlay `#fileViewer`) consume this file — the screens own only the composition glue § Known Gaps still lists. |

```html
<div class="doc-detail" data-modal-inert>
  <header class="doc-detail__header">
    <div class="doc-detail__header-left">
      <a class="doc-detail__close" data-return-link href="./danh-sach.html" aria-label="Đóng, về Hồ sơ dự án">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </a>
      <!-- Overlay instead: <button class="doc-detail__close" type="button" data-modal-close aria-label="Đóng"> + <button class="doc-detail__minimize" type="button" aria-label="Thu nhỏ"> -->
      <div class="doc-detail__identity">
        <div class="doc-detail__title">
          <input class="doc-detail__title-input" aria-label="Tên hồ sơ" placeholder="Nhập tên hồ sơ...">
          <ul class="badge-group" aria-label="Trạng thái">
            <li><span class="badge badge--md badge--gray badge--no-dot">HS-2026-014</span></li>
            <li><span class="badge badge--md badge--warning">Chờ nhận bàn giao</span></li>
          </ul>
        </div>
        <div class="doc-detail__folder-row">
        <button class="button button--link-gray doc-detail__folder" type="button"
                aria-label="Danh mục › Thư mục, chuyển vị trí hồ sơ">
          <img class="doc-detail__folder-icon" src="../../../ds/assets/folder-icon.webp" alt="" aria-hidden="true">
          <span class="doc-detail__folder-path">
            <span class="doc-detail__folder-segment" data-tooltip-overflow>Danh mục</span>
            <span class="doc-detail__folder-sep" aria-hidden="true"></span>
            <span class="doc-detail__folder-segment doc-detail__folder-segment--leaf" data-tooltip-overflow>Thư mục</span>
          </span>
        </button>
        <button class="button button--link-gray button--compact doc-detail__folder-copy" type="button" aria-label="Sao chép đường dẫn">
          <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
        </button>
        </div>
      </div>
    </div>
    <div class="header-actions"></div>
  </header>

  <div class="doc-detail__body">
    <section class="attachment-pane doc-detail__doc">…</section>
    <figure class="doc-detail__preview"><div class="file-upload is-unsupported">…</div></figure>
    <div class="doc-detail__form-track">
      <section class="section-card section-card--form">…</section>
      <section class="section-card section-card--form">…</section>
    </div>
    <aside class="doc-detail__rail">…</aside>
  </div>
</div>
```

## Known Gaps

- **Responsive fold is inferred, not measured** — see § Responsive.
- **Overlay minimize/dock is AUTHORED**, no Figma frame (button, dock item, copy). No
  autosave: minimized drafts live in memory and are lost on reload (`beforeunload`
  warns). Copy "Hồ sơ mới {n}", "Hồ sơ đang thu nhỏ", the discard dialog: chờ PO duyệt.
- **A minimized draft shows no upload progress** on its dock item; failures surface on
  the file row when the draft is reopened.
- **`.doc-detail__folder` on a read-only `<span>` vs. an edit-mode `<button>`
  is a markup choice, not enforced by this file.** Nothing here stops a
  consumer from shipping a `<button>` with no `type="button"` handler in
  read-only mode; that is a screen-review item, not a CSS one.
- **No icon-button smaller than `--compact`** in ds/. The copy button is 36px and
  makes the header taller (see measured heights above). Not invented here.
- **Keyboard users cannot read a truncated R path on screen.** The R path
  pieces sit inside `aria-hidden` (the sr-only label carries the text) and
  `tooltip.js` only resolves a focused `button`/`a`/`treeitem`, so a `tabindex`
  on the R wrapper would not open any tooltip. Needs a tooltip.js option. On the
  E chip, focusing the button opens only the first piece's tooltip
  (`descendantTrigger` takes the first match).
- **Hover-reveal copy-path button is AUTHORED**, no Figma frame; ds/ has no copy
  pattern yet. Copy and toast strings await PO/design.
- **Folder path is 2 levels only (Danh mục › Thư mục), no project name** —
  the fixture tree has no deeper level. Markup and CSS already take 3+ levels
  (`__folder-collapsed`), but that branch has only been exercised with a
  temporary long label.
- **Path tooltip is per piece, not the whole path.** `tooltip.js` shows the
  trigger's own `textContent` and only when that element overflows; a flex
  wrapper whose children shrink never overflows. So the ellipsized segment
  shows its own name, and the middle run shows the hidden levels; the full path
  is only in the accessible name. Fix needs a tooltip.js option (e.g. read the
  text from an attribute); not done (no new script).
- **"Mã hệ thống" is a fixture field** (PLAN Q7) — no record in this package
  carries it yet; whoever wires the badge needs to add it to sample data and
  say so with a `fixture` comment.
- **chi-tiet's hardcopy grid caps at 4-up, not the SPEC "1×5"** — see
  § Container.
- **The move-drawer and folder tree this chip opens** are
  ds/components/drawer.md `--md` and ds/components/folder.md `--compact` —
  both wired to both screens as of the 2026-09-29 review.
