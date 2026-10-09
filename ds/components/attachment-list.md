# Attachment list

> **Status: 2026-09-22 — IT HAS A CONSUMER, AND ITS SOURCE IS NOW IDENTIFIED.**
> The `Thêm/Cập nhật hồ sơ` dialog on `screens/doi-tac/ho-so-nang-luc.html` renders
> this list as the **file queue under a `file-upload` dropzone**. And the frame
> this file was measured from is not an unexplained region after all: it is the
> `File queue` of the DS's own `File upload` component set, variant
> `Files queued=True` (OMEU DS V2 `SFo9P9PCVQiuOk2SqjZYKQ`, `9826:63774` →
> `9826:63781`) — same 72px row, same 12px list gap, same 40px file-type chip,
> same name-over-size block. The product instance simply hid the dropzone above
> it. `design-system/components/file-upload.md` records the pairing from its side.
>
> One part was added with the consumer: **`.attachment__action`**, the trailing
> delete. This file recorded it as "authored and hidden … what it would do is
> unspecified"; the DS set draws it as a delete on a completed row (and a cancel
> on one still uploading, which is not built — nothing here uploads).
>
> The paragraph below is the status as it stood until then, kept because the
> Behaviour section is still inferred rather than specified.
>
> **Status: stub, and as of 2026-08-19 with no consumer.** This records a region
> that exists in a product frame with no design-system component behind it — an
> Untitled UI `File upload` instance with its dropzone switched off, read as a
> list. Anatomy below is measured; behaviour is inferred. Do not treat Behaviour
> as a contract until the open questions are answered.
>
> Its only implementation was the `Tài liệu đính kèm` card of
> `screens/project-investor.html`, deleted on 2026-08-19 when the product owner
> retired the record's `Chủ đầu tư` tab. Nothing renders `.attachment-list`
> today and no successor picked it up: the investor content that survived the
> retirement is the `Chủ đầu tư` card on `screens/du-an/chi-tiet.html` and the
> `#investorModal` dialog it opens, neither of which lists attachments.
> `styles/attachment-list.css` is still imported by `styles/app.css` and is
> unchanged — the contract and its stylesheet are kept, not deleted, because the
> source frame (`10840:73734`) still draws the region and the open questions
> below are still the questions the next consumer has to answer.

> **Not `design-system/components/attachment.md`.** That contract, added
> 2026-08-26, is the card that shows **one** attached document — a section header
> naming it, a body that renders it, a pager and a footer of actions. This one is a
> read-only list of **many**. The names are close and the two were built from the
> same Untitled UI `File upload` set, so: `.attachment-list` / `.attachment` and
> `styles/attachment-list.css` are here; `.attachment-pane` and
> `styles/attachment.css` are there, and that block is `-pane` precisely because
> `.attachment` — the class of one **item** in the list below — was already taken.
> Neither file declares a selector or a token the other one does.

## Purpose

Attachment list shows the files attached to a record, inside a section card. Each
entry names one file, states its format and its size, and is a card of its own
rather than a table row.

It is **not** the documents table (`design-system/components/data-table.md`): that is a
listing screen's primary content with sorting, selection, row actions and
pagination. This is a short, read-only summary of a handful of files in a
2-of-6 card, with the full set behind the section's `Xem thêm N+` link.

It is also **not** an upload control. The source component can draw a dropzone;
this instance hides it. The dropzone half of that component now exists as
`design-system/components/file-upload.md` (added 2026-08-13 for `Tải lên hồ sơ`), so the gap
this file recorded — "there is no upload-dropzone component" — is closed. The two
remain separate contracts: this one lists files already attached, that one accepts
a new one.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Instance | `File upload` in `Chủ đầu tư`, node `10840:73734`, inside the `Tài liệu đính kèm` section — 293 x 156 |
| Instance properties | `Files queued = True`, `Type = Progress fill`, `Breakpoint = Desktop`; the `_File upload base` dropzone child is **hidden** |
| Item | `_File upload item base`, 293 x 72 — `Icon = true`, `Icon type = File type`, `State = Complete` |
| Reviewed via | Figma REST API, 2026-08-12 |
| Second consumer, 2026-09-29 | MDM (Un-Official) (`TpwqqNqhnFgycttdngXmFA`), `pop-up-full-screen` § File queue (`2-edit-files.png`) — the doc-detail popup's file column (`ds/components/doc-detail.md`). Read via `get_design_context`. This is the read that adds selection and the uploading/failed states below; the 2026-08-12 read only ever drew `State = Complete`. |

The underlying `File upload` **is** a published component, but only its
"completed queue" slice is used here and no MDM frame documents that slice as a
read-only attachment list. That gap is why this file exists.

## Anatomy

- **List** — vertical, items 12px apart. The 16px above it is the section card
  body's own gap, not the list's.
- **Item** — 293 x 72 in the source (the width is the card's, the height is
  content): 12px radius, 1px border, surface fill, 12px block / 16px inline padding (66px row), 12px gap.
  - **File-type chip** — 40px, the same chip as the documents table's name cell
    (`.file-chip`, `assets/file-type-icons/file-*.svg`). Colour and
    label are baked into the exported icon; the chip is a 40px frame around an
    `<img>`. Formats seen here: `XLSX`, `DOCX`.
  - **Text block** — file name `14/20` Medium `Gray/700`, clamped to one line with
    an ellipsis, over its size `14/20` Regular `Gray/700`. The two lines touch:
    the source gives them no gap.
- **Trailing action** — authored and **hidden** in this instance (a `Buttons/Button`
  after the content row, ~20px). What it would do is unspecified.

The source's own progress states (`Progress bar`, `Progress fill`, uploading,
failed) belong to `File upload`, not here: every item in this instance is
`State = Complete`. **Update, 2026-09-29: those states are now this
component's** — the doc-detail popup's file queue is the same row family with
its dropzone hidden, and it draws all of `Progress bar` / uploading / failed /
selected. See States below.

**Row structure, 2026-09-29** — `.attachment` (the `<li>`) holds up to three
children, never nested:

1. **`.attachment__select`** — a `<button>` wrapping the file-type chip and
   `.attachment__body`. Opens the row into whatever the consumer's preview is.
   **Opt-in**: a list that never selects a row (the original, read-only
   consumer above) keeps the file-type chip and `.attachment__body` as plain
   markup with no `__select` at all.
2. **`.attachment__body` / `__name` / `__meta`** — unchanged from 2026-08-12.
3. **`.attachment__action`** — the trailing control (delete / cancel), a
   sibling of `__select`, never inside it — a row is never a button nested in
   a button.

## Behaviour

- **Read-only by default.** No entry is a link, a button or a download in the
  source, and no cursor or hover state is drawn — still true for a consumer
  that never adds `.attachment__select`.
- **Selectable, opt-in (2026-09-29).** A consumer that renders `__select`
  makes the row a real button; exactly one item at a time carries
  `.is-selected` (Figma: `--utui-color-border-focus` brand-300 border + 4px brand-50 ring — colour is not the
  only cue, the border itself changes token, same principle
  `ds/components/checkbox.md` § States records for "chọn là brand").
- Opening a file, and seeing the rest of them, happens through the section
  header's `chevron_right` and the `Xem thêm 10+` footer link — both of which the
  section already owns (`design-system/components/section-header.md`).
- The list shows the first N attachments only. N is 2 in the source and the
  footer says `10+`, so it is not "all of them".

## States

Added 2026-09-29 for the doc-detail popup's file queue (`ds/components/doc-detail.md`).
All four are opt-in classes on `.attachment`; a consumer that never uploads
(the 2026-08-12 read-only list) sets none of them.

| State | Class | Notes |
|---|---|---|
| Default / complete | `.attachment` | Unchanged since 2026-08-12. |
| Selected | `.attachment.is-selected` | `--utui-color-border-focus` (brand-300 #D9B287, matches Figma) border + 4px brand-50 ring. At most one row at a time — the consumer's job, not enforced here. |
| Uploading | `.attachment.is-uploading` | Progress fill grows from the left, keyed on the row's own `--progress` custom property (a percentage the consumer sets inline; nothing here computes it). The trailing control is a cancel (glyph `cancel`, per Figma), or a `.attachment__spinner` in place of it — the consumer picks which, per row. Both in one button: put `.attachment__spinner` before the glyph inside `.attachment__action` — spinner at rest, cancel glyph on row hover or when the action button has `:focus-visible` (focus on the select button does not swap it). The spinner is 32px green (`--utui-attachment-spinner-size`, colour `--utui-color-icon-success` green-600 #16A34A; Figma `Loading indicator` draws Green/500 #22C55E, ~2.3:1 on white — below WCAG 1.4.11, so USER DECISION 2026-10-05 takes green-600, ~3.3:1) and fits inside the 40px `.attachment__action`. It stays indeterminate, with no % text (Figma `Loading indicator` 9826:63724 keeps its `Text` child hidden; USER DECISION 2026-10-05). The ring is a ¾ green arc on a track, 3px stroke (Figma `State=In progress` 9826:63716); the track uses `--utui-color-border-subtle` #F5F5F5 for Figma Gray/100 #F2F4F7. **GAP:** 3px stroke and 800ms rotation have no token. The progress fill is not in the DS component (`State=In progress` draws a plain white row); it is kept from the product frame `10840:73734` (`Type = Progress fill`), USER DECISION 2026-10-05. A row with no `.attachment__select` (plain `.file-chip` + `.attachment__body` children, as the Excel import's file row) lifts those two children above the fill the same way (2026-10, `attachment-list.css`). |
| Failed | `.attachment.is-failed` | Border takes `--utui-field-border-error`; `.attachment__error` is an error icon cell (AUTHORED — Figma `File upload` 9826:63774 has no error state) in the trailing slot, after `__select`/`__body` and before `__action` (tab order select → error → delete). The reason is in a tooltip on hover/focus (`data-tooltip`, `data-tooltip-place="bottom"`; USER DECISION 2026-10-05, extends the exception in `tooltip.md`). The icon is `role="img"`, `tabindex="0"`, `aria-label` = the reason. A hidden placeholder stays `<span class="attachment__error" hidden>` with none of those. **GAP: no copy is designed for *why* the upload failed** — too large, wrong format, a network error are three different sentences and none is drawn. See Known Gaps. |

## Modifier `--grid` (USER DECISION 2026-10)

`.attachment-list--grid` splits the list into columns by its **container's width**: `grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 288px))` with `justify-content: start`. Bounds are `--utui-attachment-list-grid-min` (240px) and `--utui-attachment-list-grid-max` (288px); auto-fill counts columns by the max, so 288px = (897px detail width at 1024 − 2 gaps) / 3, rounded down to 8 → at least 3 files per row (USER DECISION 2026-10), 4 at 1440+; gap is the list's own `--utui-spacing-03`. Why this form: a single column in a wide container (the Excel import's row detail, ~1900px) stretched each item across the table and left a huge gap between file name and delete. A `1fr` max would refill the gap; a fixed max caps every track, and `justify-content: start` packs the tracks left, so all items are one width and align to the same left edge in every row. `min(100%, 240px)` lets one column shrink below 240px in a narrow container instead of overflowing. Names keep the one-line ellipsis (`data-tooltip-overflow`).

Prior art: Google Drive grid view, Jira attachments grid view, Ant Design Upload `picture-card` (fixed-size cards wrapping by container width).

Consumer: only the `.row-detail` of `#importDrawer` step 3 (`screens/du-an/ho-so/danh-sach.html`). Every other consumer stays single-column; do not add `--grid` to them without a decision.

## Tokens

| Role | Token | Source |
|---|---|---|
| Item radius | `--utui-radius-lg` | 12px, exact |
| Item padding | `--utui-spacing-03` block, `--utui-spacing-04` inline | 12 / 16px, Figma `State=In progress` 9826:63716 (66px row), 2026-10-05 |
| Item gap (chip → text) | `--utui-spacing-03` | 12px, exact |
| List gap | `--utui-spacing-03` | 12px, exact |
| `--grid` track min / max | `--utui-attachment-list-grid-min` / `-max` | 240px / 288px, USER DECISION 2026-10 (≥ 3 per row at 1024) |
| Item border | `--app-border` (`#E5E5E5`) | source `#E4E7EC` — see Known Gaps |
| Item surface | `--utui-color-bg-surface` | white, exact |
| Name colour / weight | `--utui-color-gray-700`, `--utui-font-weight-medium` | `#344054`, 500, exact |
| Size colour | `--utui-color-gray-700` | `#344054`, exact — **not** a tertiary grey |
| Chip size | `--utui-file-chip-size` | shared with `design-system/components/data-table.md` |
| Selected border / ring | `--utui-color-border-focus`, `--utui-color-bg-brand-subtle` | added 2026-09-29 |
| Failed border | `--utui-field-border-error` | added 2026-09-29, same token `.form-field__control--error` uses |
| Uploading fill | `--utui-color-bg-surface-subtle` | added 2026-09-29 |
| Spinner ring | `--utui-color-border-subtle`, `--utui-color-icon-success` (green-600), size `--utui-attachment-spinner-size` 32px | Figma `Loading indicator` 32px; colour deviates (Figma green-500 < 3:1), USER DECISION 2026-10-05 |
| Error icon | `--utui-color-icon-error`, 20px glyph | AUTHORED, 2026-10-05 |

New component tokens: the two `--grid` bounds and `--utui-attachment-spinner-size`. The chip's icon (`assets/file-type-icons/`) is shared
with `design-system/components/data-table.md` rather than a second asset set.

## Responsive

Nothing tier-specific. The item is a flex row with a fixed 40px chip and a
`min-width: 0` text block, so it reflows on its container's width at every tier;
the card it sits in collapses first (`.claude/skills/responsive/SKILL.md`, section card grid).

The name's one-line clamp is not a breakpoint decision — it holds at every width.

## Accessibility

- The list is a `<ul>` of `<li>`s: it is a list of files, and the count matters.
- **The format chip is announced here**, unlike the same chip in the documents
  table. In the table the file name carries its own extension, so the chip's
  `<img>` is decorative and `aria-hidden`. Here two attachments share one name
  (`Giấy chứng nhận đăng ký`) and differ only by format and size, so hiding the
  chip would hide the only thing that tells them apart — the `<img>` instead
  carries `alt="DOCX"` / `alt="XLSX"` etc. so it is announced; only that `alt`
  vs. `aria-hidden` differs between the two containers.
- Any format's icon can be used here, since the label lives in the `<img>`'s
  `alt`, not baked into the graphic alone — unlike the documents table, where
  the chip is purely decorative and the icon's baked-in label is never read by
  a screen reader either way.
- The name is clamped visually only. The full string stays in the DOM, so the
  ellipsis costs a sighted reader the tail of a long name and costs a
  screen-reader user nothing. `design-system/components/tooltip.md` now exists
  but is not wired here — needs decision.
- Nothing in the list is focusable, which is honest for a read-only list. If an
  entry ever opens the file it must become a real `<a>`/`<button>`, not a
  click handler on the `<li>`. **2026-09-29: `.attachment__select` is exactly
  that** — a real `<button>`, never a click handler on the `<li>` — for a
  consumer that opts into selection.
- **`.attachment__error` is a focusable `role="img"` icon** (`tabindex="0"`, `aria-label` = reason, tooltip on hover/focus, Esc closes). The row's control (`__select`, or `__action` when no select) keeps `aria-describedby` pointing at its id when `.is-failed`.
- **The uploading state's live announcement is the consumer's job.** Nothing
  here is a `role="status"` region; a consumer whose queue can fail or finish
  silently owes one, the same obligation `ds/components/file-upload.md`
  states for its own swap.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.attachment-list`, `.attachment`, `.attachment__select`, `.attachment__body`, `.attachment__name`, `.attachment__meta`, `.attachment__action`, `.attachment__error`, `.attachment__spinner`, `.attachment.is-selected`, `.attachment.is-uploading`, `.attachment.is-failed` in `styles/attachment-list.css` |
| Shared chip | `.file-chip`, `.file-chip__icon` and the one variant `.file-chip--sm` in `styles/data-table.css`. `.file-chip__label` and the wider `--*` set this row used to name were never authored |
| Example | `screens/doi-tac/ho-so-nang-luc.html` renders `.attachment`/`.attachment__action` as a delete-only file queue (no `__select`, no new states). `is-selected`, `is-uploading`, `is-failed` and `.attachment__select` are wired in `ds/components/doc-detail.md`'s file column, both `screens/du-an/ho-so/chi-tiet.html` and `.../tai-len.html`. |

```html
<ul class="attachment-list">
  <li class="attachment is-selected">
    <button class="attachment__select" type="button" aria-pressed="true">
      <span class="attachment__body">
        <span class="attachment__name">Hop-dong-thue.pdf</span>
        <span class="attachment__meta">2.4 MB</span>
      </span>
    </button>
    <button class="attachment__action" type="button" aria-label="Xóa Hop-dong-thue.pdf">…</button>
  </li>
  <li class="attachment is-uploading" style="--progress: 42%">
    <button class="attachment__select" type="button">
      <span class="attachment__body">
        <span class="attachment__name">Bien-ban-nghiem-thu.docx</span>
        <span class="attachment__meta">Đang tải lên…</span>
      </span>
    </button>
    <button class="attachment__action" type="button" aria-label="Hủy tải lên Bien-ban-nghiem-thu.docx">…</button>
  </li>
  <li class="attachment is-failed">
    <button class="attachment__select" type="button">
      <span class="attachment__body">
        <span class="attachment__name">Anh-hien-truong.jpg</span>
      </span>
    </button>
    <span class="attachment__error" role="img" tabindex="0" aria-label="…" data-tooltip="…" data-tooltip-place="bottom"><span class="material-symbols-outlined" aria-hidden="true">error</span></span>
    <button class="attachment__action" type="button" aria-label="Xóa Anh-hien-truong.jpg">…</button>
  </li>
</ul>
```

## Known Gaps

- **No copy for a failed upload.** `.attachment__error` has no designed
  string for size, format or network rejection — see § States. Needs a
  UX-writing pass before any consumer ships `.is-failed`.
- **No way to open, download or preview a file** in the read-only reading —
  see the selectable reading above for the consumer that now can.
- **The hidden trailing action** on each item (`Buttons/Button`, hidden in this
  instance) has no specified behaviour — delete, download, or `more_vert`.
- **The item border is `#E4E7EC`**, the same untokenised Gray-ramp value as the
  section divider in `design-system/components/section-header.md`. Implemented with
  `--app-border` (`#E5E5E5`) rather than pinning a second literal; a designer call
  should either tokenise the Gray ramp or accept the neutral one.
- **The file-type chip lives in `data-table.css`** because the table needed it
  first. It is not table-specific: it had two consumers until 2026-08-19 and now
  has one rendered one (`du-an/ho-so/danh-sach.js`) plus this unrendered stylesheet. The
  argument for moving it to its own stylesheet and its own contract is unchanged
  — it is shared by construction, not by accident — and the second consumer
  returns whenever an attachment list is drawn again.
- **No empty state.** A record with no attachments is undrawn. The section cannot
  simply disappear — the anchor rail points at it — so it needs either
  `design-system/components/empty-state.md` or a placeholder line.
- **No count.** The footer says `10+` in every card of this frame, which is
  sample data, not a rule. Whether the real string is a count, a fixed `10+`, or
  "view all" is unresolved and is a `design-system/patterns/item-detail.md` question, not this
  component's.
- **Format coverage in sample data was narrow.** Only `XLSX` and `DOCX` appeared
  in the deleted screen's data, though 52 icon assets exist in
  `assets/file-type-icons/` — extending a `fileTypeMap` to more formats is a data
  change, not an asset gap (see `design-system/components/data-table.md`). The
  live map is now the one in `screens/du-an/ho-so/danh-sach.js`, which the documents
  table uses for the same chip.
- **Sizes are pre-formatted strings** (`16 MB`, `4.2 MB`) with no rule for
  rounding, unit or locale separator.

- 2026-10-05 — Failed state: `.attachment__error` becomes a focusable error icon with the reason in a tooltip (USER DECISION, AUTHORED); selected border -> `--utui-color-border-focus`; uploading cancel glyph `cancel`; spinner 32px green-600 `--utui-color-icon-success` (Figma green-500 fails 1.4.11), ¾ arc 3px, no % text; row padding 12/16 per Figma `State=In progress` (66px row); progress fill kept from the product frame.
