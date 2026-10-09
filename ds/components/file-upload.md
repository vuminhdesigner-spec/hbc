# File upload

The upload surface: a bordered pane that is either a dropzone waiting for a file,
a preview of the file that was chosen, or a statement that the file cannot be
rendered. One block with three states, not three components.

This is the **first dropzone in the package**. `design-system/components/attachment-list.md`
documents the same Untitled UI `File upload` source component with its dropzone
switched *off* — a read-only list of files already attached — and records the
absence of this one. The two are siblings, not variants of each other: that one
lists, this one accepts.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| State A — nothing chosen | `Tải lên hồ sơ`, node `11420:76339` |
| State B — a file chosen | `Tải lên hồ sơ`, node `11420:76690` |
| State C — a file it cannot render | `Tải lên hồ sơ` / `preview-not-support-format-file`, node `12042:69782`, read 2026-08-26 |
| Underlying DS component | Untitled UI `File upload` (the same set `attachment-list` reads) |
| **DS component set** | **OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`), `File upload`, node `9826:63774` — read 2026-09-22** |
| Second consumer, state C copy | MDM (Un-Official) (`TpwqqNqhnFgycttdngXmFA`), `pop-up-full-screen` § preview column (`2-edit-files.png`), read 2026-09-29 for `ds/components/doc-detail.md` — the read that gives state C its edit/read-only supporting-line split |
| Reviewed via | Figma REST API, 2026-08-13; the DS set via Figma MCP, 2026-09-22; `get_design_context`, 2026-09-29 |

**THE THREE PRODUCT NODES ABOVE NO LONGER RESOLVE — 2026-09-22.** `11420:76339`,
`11420:76690` and `12042:69782` all return *node not found* in
`tS8dUB2qWLc28gZbtj8IIL`, and that file now lists exactly one top-level page,
`Cover` (`15:19014`). Whether the frames were deleted, moved, or are simply not
shared with the reading session is **unknown** and was not assumed either way.
They are kept in the table because they are what this contract was written from;
the DS set is the only source that can be re-read today.

**The DS set is the authority for everything in the Anatomy below.** Its variant
matrix is three axes, not the two this file described:

| Variant | Node | What it adds |
|---|---|---|
| `Files queued=False, Preview=False, Collapse=False` | `9826:63789` | The bare dropzone — `_File upload base`, 512 x 126 |
| `Files queued=True, Preview=False, Collapse=False` | `9826:63781` | A **`File queue`** under it: three `_File upload item base` rows, 512 x 72, 12px apart, the first 16px below the pane |
| `Files queued=False, Preview=True, Collapse=False` | `11762:3205` | The `Tệp đính kèm` CARD around the pane — the chrome `design-system/components/attachment.md` productizes |
| `Files queued=True, Preview=True, Collapse=False` | `11762:2753` | That card with the queue AND a preview column beside it |
| `Files queued=False, Preview=True, Collapse=True` | `11770:601` | The collapsed control, **48 x 48** here against the 40 x 40 `attachment.md` records from `_Attachment` |

## Anatomy

The pane: 1px border, **12px radius, WHITE fill** (`Base/White`), clipped content.
It has no intrinsic height — whoever places it says how tall it is.

**CORRECTED 2026-09-22, and it was an inversion rather than a rounding error.**
This read `16px radius, #F5F5F5 fill (Neutral/100 exactly)` from the product
nodes that no longer resolve. `_File upload base` (`9826:63790`) draws
`bg-white`, `border 1px solid #E4E7EC`, `rounded-[12px]`, `px-[24px] py-[16px]`,
`gap-[12px]` — a **white** pane whose icon tile is the grey one, where this
package painted a **grey** pane with a white tile. `styles/file-upload.css` was
repainted the same day at the requester's direction; the two states that were
drawn ON the grey (the preview viewport and the unsupported block) keep it as
their own background, so only the dropzone changed surface.

Two values are deliberately NOT taken from the set, both because the package has
already decided them elsewhere: the border stays `--app-border` (#E5E5E5) against
the set's #E4E7EC, which is `attachment-list.css`'s recorded decision for the same
stroke on the same frame; and the prompt and hint keep the Neutral ramp against
the set's `text/secondary` #344054, which is divergence 4 in
`design-system/components/data-table.md`. A third is left OPEN: the set resolves
`Tải lên` to `button-link-color/text` **#3b82f6**, while `--utui-button-link-color`
is blue-600 **#2563EB** — that token belongs to
`design-system/components/button.md` and repainting it would move every link
button in the package, so it is recorded here and decided there.

**State A — dropzone**, centred both ways, 8px between parts:

1. **Icon tile** — 40px, **`Neutral/100` fill, pill radius, no border and no
   shadow**, holding a `cloud_upload` glyph: `p-[10px]` around a 20px icon with
   `rounded-[20px]` on the set's `Featured icon` (`9826:63790`). A chip around the
   glyph, not a bare icon. It was `white, 8px radius, 1px border, shadow-xs` here
   until 2026-09-22 — see the pane note above; the two halves of the composition
   were swapped.
2. **Prompt** — `Tải lên hoặc kéo thả tài liệu vào đây`. Only `Tải lên` is the
   control (`design-system/components/button.md` Hierarchy=Link color, semibold); the rest is
   prose in the same sentence, so the line is inline text and wraps mid-sentence.
3. **Hint** — `Text xs`, tertiary. The set's own string is
   `DOCX, XLSX, JPG, PNG (Tối đa 10 MB)`; the du-an hồ sơ screens add PDF (user 2026-10-05); the package's consumers write their own
   accepted list (the partner document dialog adds PDF), which is correct — the
   hint states what THAT field accepts. The set's capitalisation of `Tối đa` is
   the drawn one. May end with one `.file-upload__hint-action` link
   (`.button--link`, inline, hint size) for a resource the accepted file
   depends on, e.g. `· Tải tệp mẫu` on `#importDrawer` step 1 (USER DECISION
   2026-10). Never a second upload control; it hides with the dropzone once a
   file is chosen.

**State B — preview**:

1. **Caption bar** — a `description` glyph, `Bản xem trước:` and the file's name,
   clamped to one line. In the flow above the document, never over it.
   **Optional as of 2026-08-26** — see *Who names the file* below.
2. **Viewport** — the rendered document, scrolling inside its own box.
3. **Swap button** — `Đổi tài liệu khác` with an `upload` glyph, overlaid
   bottom-centre. A secondary button with a Brand/50 fill and a Brand/200 border,
   *not* the white secondary fill: it acts on the document, not on the page.
   **Optional as of 2026-08-26** — see *Where the actions go* below.

**State C — unsupported format** (added 2026-08-26). Centred in the same grey
pane, 24px between parts, the text column capped at 352px:

1. **Illustration** — `.empty-illustration` (152 x 152, `ds/components/empty-state.md`), không dùng featured-icon.
2. **Title** — the file's own name, `16/24` Semibold. Not a heading: the pane
   already has one, and a name that changes with the picked file would put a
   moving target in the document outline. Wraps anywhere — a file name has no
   spaces to break at.
3. **Supporting text** — `Hệ thống không hỗ trợ đọc định dạng tệp.`, `14/20`
   tertiary. **The DS set writes this state differently** (`11762:2753`, read
   2026-09-22): title `Chưa hỗ trợ đọc định dạng tệp.` over supporting
   `Vui lòng mở tệp bằng trình duyệt/ứng dụng khác.`, i.e. the title carries the
   fact and the supporting line carries the recovery — and neither a download nor
   a swap button is drawn inside that panel. The package kept the product
   reading (the file's own name as the title) for `project-doc-upload` because
   that is what that screen was built and reviewed against; the divergence was
   recorded rather than resolved.

   **IT WAS RE-DRAWN — 2026-09-29, MDM-1209.** The doc-detail popup's preview
   column (`ds/components/doc-detail.md` region 11, SPEC frame `2-edit-files.png`)
   is the second consumer this note said to wait for, and it takes the DS
   set's own strings, not the file-name reading: title **"Chưa hỗ trợ đọc định
   dạng tệp"** (no file name, no trailing period per this read), and the
   supporting line splits by edit right, while item 4 (Download) prints in
   **both** readings (D5, review 2026-09-29 — was edit-mode-hidden, corrected:
   opening the file in the browser is not always possible, so editing still
   needs the same escape hatch read-only has) —
   - **Editable** — "Vui lòng mở tệp bằng trình duyệt/ứng dụng khác"
   - **Read-only** — "Vui lòng tải xuống để xem chi tiết"

   Both readings now have a real consumer. `project-doc-upload` keeps the
   file-name title (nothing about that screen changed); a screen built against
   this contract from now on should take the 2026-09-29 strings — they are
   the DS set's own copy, not a package invention, and the earlier
   `project-doc-upload` reading is the one to treat as legacy divergence going
   forward. Note what the recovery sentence says either way: the DS's answer
   to a file it cannot render is **open it** — in the browser while editing,
   by downloading while read-only.
4. **Download** — a link button with a 20px `download` glyph. **Present in
   both edit and read-only readings of the doc-detail popup** (D5, review
   2026-09-29): read-only's only action, and edit's alongside the swap below
   it — see *Where the actions go*.
5. **Swap button** — the same `Đổi tài liệu khác` state B carries, in the same
   overlaid position. **Optional**, editable reading only — a read-only
   viewer cannot replace a file it did not upload.

The text parts are `styles/empty-state.css`'s page-variant parts
(`.empty-page__text`, `__title`, `__supporting`) composed in the markup. The
`.empty-page` box itself is **not** used: its 512px column and 160px of block
padding are page scale, and this sits inside a pane that centres its own content.

**State C IS NOT AN ERROR.** A file is chosen, the consumer's metadata form still
saves, and both of `project-doc-upload`'s exits still work. What is missing is the
rendering, not the document. The pane keeps its normal rim, and
`.form-field__control--error` — which means *no file was chosen at all* — must
never be set at the same time.

State A has no swap button; states B and C may both have one, and neither has a
dropzone.

### Where the actions go — two placements, 2026-08-26

The pane's two actions, `Đổi tài liệu khác` and `Tải xuống`, have **two valid
placements**, and the consumer picks one:

1. **Inside the pane** — the swap overlaid bottom-centre on the body, the download
   as a link button inside state C. This is what nodes `11420:76690` and
   `12042:69782` draw and what this contract described until 2026-08-26.
2. **In a footer row the consumer owns**, below the pane, both as ordinary
   secondary buttons and both available in state B as well as state C. This is what
   the productized `Attachment` component draws (OMEU DS V2
   `SFo9P9PCVQiuOk2SqjZYKQ`, node `10964:9598`), and `project-doc-upload` moved to
   it — a download is as useful on a document the pane *can* render as on one it
   cannot, which placement 1 cannot express.

Placement 2 is where this went. `Attachment` was built later the same day and it
owns a footer, so this pane is now that component's body — and placement 1 has no
consumer. It is still supported, because a consumer that places this pane with no
chrome of its own has nowhere else to put the two actions. **The bottom clearances
follow the button rather than the state.**
`.file-upload__viewport` and the state-C block pay ~84px of bottom padding for the
overlay, keyed on `:has(.file-upload__swap)` — so a consumer taking placement 2
does not pay for a button it does not have. Before that guard the state-C empty
block sat 84px above its own centre with nothing under it.

**Whichever placement is taken, `#uploadSwap` is still the focus target for
A→B and A→C.** The rule is about the control that replaces the trigger, not about
where it sits.

**Always present, never painted:**

4. **Status** — `.file-upload__status`, a `role="status"` live region that carries
   the chosen file's name. Not drawn in either node; added because the swap is
   otherwise silent (see Accessibility). It sits outside all three states so it is
   rendered before its text arrives, and it is visually hidden rather than
   `display: none`, which would take it out of the accessibility tree too.

### Who names the file — 2026-08-26

The caption bar is **not taken by a consumer whose surrounding chrome already names
the file.** `design-system/components/attachment.md` draws the name once, in its
section header's supporting line, and gives its body no caption; node `10964:9598`
is unambiguous about that.

On `project-doc-upload` the name was being printed **three times** on one pane —
the attachment header, this caption, and state C's own title — and the caption is
the one that goes, because it is the only one of the three that repeats a string
the reader can already see two rows above it.

`.file-upload__caption`, `__filename` and their rules stay in
`styles/file-upload.css` and are still correct for a consumer with no such chrome:
a pane placed with no visible heading over it has no other statement of which file
is open. **What a screen reader gets does not change either way** — the
`role="status"` region above names the file on the pick, and it is the caption's
accessibility job that mattered, not the caption.

The preview's grid is `auto minmax(0, 1fr)`, so the caption's row simply collapses
to zero when it is absent; nothing else is conditional on it.

### The file queue — `Files queued=True`, added 2026-09-22

The set draws a **list of files under the dropzone**, and this contract said for
six weeks that it did not exist ("Multiple files are not addressed… a product
question"). It exists: `9826:63781` is `_File upload base` with a `File queue`
frame 16px below it, holding three `_File upload item base` rows of 512 x 72,
12px apart. The three rows in the node are three different row STATES, drawn at
once so the set can show them:

| Row | Trailing part |
|---|---|
| Uploaded | `Đã tải lên` success badge, then a **delete** (trash) control |
| Hovered, in flight | a **cancel** (X) control on a tinted row |
| In flight | a **progress spinner** |

**The row is `design-system/components/attachment-list.md`'s, not a new part.**
That contract was read off this same `File queue` in the product file, with the
dropzone hidden, and was a stub with no consumer until 2026-09-22 —
`styles/attachment-list.css` already draws the 72px row, the 12px list gap, the
40px file-type chip and the name-over-size block. The queue is therefore composed,
not written a second time: `.file-upload` + `.attachment-list` as siblings, the
list 16px below the pane. The first consumer is the `Thêm/Cập nhật hồ sơ` dialog
on `screens/doi-tac/ho-so-nang-luc.html`, which builds the **delete** row only —
nothing in this package uploads, so the cancel and the spinner are states that
cannot occur here.

**A queue does not make the pane multi-state.** The dropzone stays `State=Empty`
while files are listed under it: the set draws `Files queued=True` with the
dropzone still painted, which is the opposite of `.is-filled` hiding it. A
consumer that wants both has two parts, not one.

## States

| State | Class | Notes |
|---|---|---|
| Empty | `.file-upload` | Default. Dropzone painted, preview and the overlay swap not rendered. A consumer with a footer row hides that row here too — neither action means anything with no file. |
| Filled | `.file-upload.is-filled` | Preview painted, dropzone not rendered. The overlay swap is painted if the consumer placed it inside. |
| Unsupported | `.file-upload.is-unsupported` | The empty-state block painted, dropzone and preview not rendered; the overlay swap painted if placed inside. Mutually exclusive with `.is-filled`; the consumer sets exactly one. Not an error — see State C above. Copy has two readings as of 2026-09-29 (file-name title vs. the DS set's own title + edit/read-only supporting line) — see State C, item 3. |
| Focus | — | Both triggers and the scroll viewport take the shared `:focus-visible` ring from `base.css`. |
| Hover | `.file-upload:hover` (empty only) | Dropzone is clickable (`cursor: pointer`): grey fill `--utui-file-upload-hover-bg`, tile turns `--utui-file-upload-hover-tile-bg` so it does not vanish on neutral-100, dashed rim unchanged. Not on `.is-filled` / `.is-unsupported`. The error rim stays red. Figma: `_File upload base` (`9826:63631`) `State=Hover` (`12255:581`), added 2026-10-06 from this code — design to confirm. |
| Drag-over | `.file-upload.is-dragover` | Set by `ds/scripts/file-upload.js` while files are dragged over the pane (enter/over on, leave via counter / drop off). White fill, tile unchanged, solid 2px brand rim (`--utui-file-upload-dragover-border`; 1px border + 1px inset ring so nothing shifts). On an errored pane the brand rim wins while dragging; the `.form-field__error` line stays (USER DECISION 2026-10-06). Only empty panes (State A) take the class. Figma: `_File upload base` `State=Drag-over` (`9826:63648`, was named `Hover` until 2026-10-06; its dragged-file glyph is illustration only). |
| Error | `.file-upload.form-field__control--error` | An empty pane blocking a save. The pane *is* the control, so it takes the shared error class from `design-system/components/inputs.md`, with a `.form-field__error` message immediately after it in a column wrapper. **That wrapper is `.attachment-pane__body` since 2026-08-26** — it was the consumer's own `.upload-drop`, and a component that owns a header and a footer has no reason to make every consumer re-author the box between them. `aria-invalid` goes on the file input for the DEV contract, but that input is `aria-hidden`, so the failure is announced through the pane's own `.file-upload__status` live region. **Consumer obligation:** clear the state as soon as a file arrives. First consumer: `setUploadError()` in `screens/du-an/ho-so/tai-len.js`, 2026-08-14. |
| Uploading / failed | **not implemented** | See Known Gaps. |

The three painted states are mutually exclusive and the consumer owns which one
is set. `project-doc-upload` derives it from the file name against the input's own
`accept` list — one authored list, so the hint line, the OS dialog's filter and
the preview decision cannot drift apart. `accept` does not filter a drag and drop,
so state C is a normal path rather than an edge one.

All three states live in the DOM at once and the modifiers decide which is
painted, so nothing is rebuilt on selection. The two that are not current are
`display: none`, so they cost no layout and nothing inside them is focusable
while they are not the current state.

### Fill — `.file-upload--fill` (USER DECISION 2026-10)

The pane stretches to the remaining height of its parent and the dropzone content (tile, prompt, hint) centres on both axes: a large drop target as in Google Drive / Dropbox upload, instead of a ~130px strip over blank space. The parent must be a flex column with a definite height (the consumer's pane), and the floor is `--utui-file-upload-fill-min-block-size` (160px) so 1024x768 never collapses it. Drag events stay on the whole `.file-upload`, so the large area is the target. When the consumer shows a file row under the pane (a failed read), it returns the pane to normal size (`flex: 0 0 auto; min-block-size: 0`) so the row stays in view. Consumer: `#importDrawer` step 1 (`screens/du-an/ho-so/danh-sach.html`, `nhap-excel.css` `.import-pane`).

**Dashed border (USER DECISION 2026-10).** `--fill` draws its rim dashed, colour `--utui-file-upload-fill-border` (= `--utui-color-border-strong`), so the drop target reads apart from the solid `inform` directly above it in step 1. Dashed is the common drop-zone convention (Dropbox, Ant Design Upload.Dragger, Carbon file uploader drop container, Atlassian). It stays dashed when a file is chosen and the pane shrinks to normal size. The error state (`.form-field__control--error`) stays dashed and only turns red (`--utui-field-border-error`); its 2-class selector outranks `--fill`'s colour. **Deviation: DS set `_File upload base` 9826:63790 draws the rim solid; design must confirm.**

### Consumer obligations

1. **Clear the error state as soon as a file arrives** — see the Error row above.
2. **A pane holding a file is unsaved work, and the page must guard its exits.**
   This component has no persistence and no `remove` control: between the drop and
   whatever the consumer calls "save", the picked file exists only in the page, and
   the pane gives the operator no signal that it is at risk. So a page placing this
   component owes the same leave guard a form mid-edit owes — the back link, the
   workspace tab strip (`pageTabs.setLeaveGuard`, `design-system/components/page-tab.md`) and
   `beforeunload`. `project-doc-upload` had none of the three until 2026-08-18, so a
   tab click discarded the picked document and thirteen metadata fields silently.
3. **Read what the consumer needs off the `File` at pick time, not later.** The
   pane keeps a name for its caption and nothing else; `fileInput.files` is cleared
   by a re-pick and is not a record. `project-doc-upload` keeps `name` and `size`
   in its own state, because the list it saves into draws a type chip and a size
   beside every document's name.

**Empty → filled must move focus, and so must empty → unsupported.** Nothing is rebuilt, but the dropzone — and the
`Tải lên` trigger the user just activated — stops being rendered, and a focused
element that stops being rendered drops focus to `<body>`; the next Tab restarts at
the top of the page. The transition therefore focuses `Đổi tài liệu khác`, the
control that replaces the trigger. Only on `empty → filled`, and only when focus is
in the pane or already lost — a re-pick from state B leaves focus where it is, and
a pointer drop must not pull focus out of a metadata field mid-typing.

## Tokens

| Role | Token | Source |
|---|---|---|
| Pane radius | `--utui-radius-xl` | 16px, exact |
| Pane border | `--app-border` | — |
| Pane fill | `--utui-color-bg-surface` | white, matches CSS |
| Dropzone padding | `--utui-spacing-08` | |
| Dropzone gap | `--utui-spacing-02` | |
| Tile size | 40px | literal; the same 40px as `--utui-file-chip-size`, but a different part — not aliased |
| Tile radius | `--app-radius` | 8px, exact |
| Tile shadow | `--utui-shadow-xs` | |
| Prompt | `Text sm`, `--app-text-muted` | |
| Hint | `Text xs`, `--app-text-subtle` | |
| Hover fill | `--utui-file-upload-hover-bg` | = `--utui-color-bg-surface-hover` |
| Hover / drag-over tile fill | `--utui-file-upload-hover-tile-bg` | = `--utui-color-bg-surface` |
| Drag-over rim | `--utui-file-upload-dragover-border` | = `--utui-color-border-brand` |
| Swap fill / border / text | `--utui-color-bg-brand-subtle`, `--utui-color-border-brand-subtle`, `--utui-color-text-brand` | Brand/50 fill, exact |
| Sheet shadow | `--utui-shadow-lg` | placeholder only |

No new token. The pane's height is composition and belongs to the screen.

## Responsive

Nothing tier-specific inside the component. The dropzone is a centred column
that wraps its own prompt, and the preview's viewport is a scroll container, so
both reflow on their container at every tier. The pane's column collapses first —
that is the placing pattern's call (`screens/du-an/ho-so/tai-len.css`).

The preview viewport is a bounded scroll region: it must be sized from `100dvh`
minus `--utui-scroll-region-offset` by whoever places it, never from `vh`.

### The pane may be collapsed by the component around it — and that component now exists

`screens/du-an/ho-so/tai-len.html` folds the whole column this pane sits in down to
a single 40px control so the metadata form takes the width, and reopens it from that
control. It arrived there on 2026-08-22 from wireframe S2 note 6. (It was a 44px
full-height rail until 2026-08-26, when the `Attachment` node's collapsed variant
was re-read as a 40px icon button — see `attachment.md`, "The collapsed control".)

**It was briefly removed on 2026-08-26 as an unsourced divergence and restored the
same day**, when the productized `Attachment` component was found in the OMEU DS V2
file (`SFo9P9PCVQiuOk2SqjZYKQ`, node `10964:9598`) carrying `collapse` as one of its
variant axes alongside `state`, `chevron` and `edit`. Recorded because a removal
that was reversed the same day is exactly the history a contract exists to keep.

**`Attachment` was then built, later the same day, and it owns the collapse.**
`design-system/components/attachment.md`, `styles/attachment.css` and
`scripts/attachment.js`; this pane is that component's body, and the three Figma
`state` values of `Attachment` are the three states of this contract. The two
obligations below are no longer "whoever does it" — they are that component's, and
they are discharged there. They stay written here because a consumer may still place
this pane inside chrome of its own, and if it collapses that chrome it owes exactly
these two things.

Nothing inside this component changes when a consumer collapses it: the collapse is
the consumer's own region disclosure, and the pane is simply not rendered while it is
closed. Two obligations fall on whoever does it, and neither is optional:

- **Take the pane out of the tree, not just out of sight.** `display: none` on the
  wrapper, so the dropzone, both triggers and the preview's `role="region"`
  viewport leave the tab order together. A `tabindex="0"` scroller behind a
  collapsed pane is a tab stop with nothing behind it.
- **Reopen the pane before refusing a save on it.** The empty-pane error is
  announced through `.file-upload__status`, which lives inside the pane, and a
  live region that is not rendered when its text arrives announces nothing. The
  same call has to put focus on `Tải lên`, which is only focusable once the pane
  is back. `validateUpload()` in `screens/du-an/ho-so/tai-len.js` does both, in that
  order — through `OmeuAttachment`'s `expand({ focus: false })`, because that caller
  places focus itself a moment later — and it is the shared gate, so BOTH of that
  screen's exits inherit it rather than only the one that owns the collapse.

- **A refusal painted on this pane must be cleared when the pane is hidden.** The
  red rim and its message mean "no file was chosen and a save was refused", and on a
  region nobody can see that is not actionable. `attachment.md` states the rule and
  the mechanism: the component dispatches `attachment:toggle` and the consumer
  clears its own error, which is safe precisely because the gate above reopens the
  pane and re-announces the message.

That is a **cap at every tier, not only where the pane shares a row**. A
`min-height` alone is a floor: the pane grows to the document, the viewport never
scrolls, its `tabindex="0"` becomes a dead tab stop, and a tall document pushes
whatever follows the pane off the page. On `project-doc-upload` the desktop row
supplies the cap down to `lg`; from `md` the stacked pane sets the same expression
on itself. Placing this component without a definite height is a defect.

## Accessibility

- The pane is a `<section>` with an accessible name. The `Tải lên hồ sơ` frame
  draws no visible heading over the region, so the name is a visually-hidden
  heading. **A consumer that draws a visible heading over the pane takes the next
  level down** — `screens/du-an/ho-so/tai-len.html` puts a visible
  `Tài liệu đính kèm` heading above it, the head of the disclosure described above,
  so the hidden one is an `<h3>` there. The level follows the document's outline and
  moves when the outline does. What the contract requires is that the pane keeps a
  name of its own, not that the name is always an `h2`.
- Clicking anywhere on the empty dropzone opens the picker (`ds/scripts/file-upload.js` forwards to `.file-upload__trigger`; clicks on an `a`/`button`/`input`/`label`/`[role]` inside the dropzone keep their own behaviour, and a click that ends a text selection opens nothing). The dropzone has no role, `tabindex` or wrapping label, so no control nests in another: keyboard users still reach the picker only through the `Tải lên` button. Drag-over is a pointer-only cue and announces nothing.
- The `<input type="file">` is `display: none` and out of the tab order. It is
  never the visible control; the two buttons are, and both call `.click()` on it.
  Hiding it is safe *only* because a real, labelled, focusable button stands in
  for it at every state.
- The preview viewport is a scroll container, so it carries `role="region"`,
  `tabindex="0"` and a label that says it scrolls. A scroller a keyboard cannot
  reach strands the rest of the document.
- The placeholder sheet is `aria-hidden`: it is furniture standing in for a
  document. The caption is what tells a screen reader which file is open.
- Drag and drop is an addition, never the only route — the prompt offers it in
  words, and the button offers the same thing to a keyboard. Preventing the default
  on the dropzone is not enough: the *document* must cancel `dragover`/`drop` as
  well, or a file dropped a few pixels wide of the pane triggers the browser's own
  "open this file" behaviour, navigating away and discarding the form.
- The A→B and A→C swaps move focus to `Đổi tài liệu khác`; see States for why and
  when. Both transitions lose the same trigger, so both owe the same move.
- The swap is announced by `.file-upload__status`, a `role="status"` region
  holding the chosen file's name. A notification is not a substitute: it is a page-level
  confirmation, it lives at the other end of the document, and it says nothing
  about which file the preview is now showing.
- **State C needs its own sentence in that region, not state B's.** Announcing
  "bản xem trước đã mở" over a pane that says the format is unreadable is the
  worst thing the live region could do, and "the document is attached, it just
  cannot be shown" is not visible anywhere else for a screen-reader user.
- The placeholder sheet stays `aria-hidden`, so the caption and that status region
  are the whole of what a screen reader gets from state B.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.file-upload`, `.file-upload__status`, `.file-upload__dropzone`, `__tile`, `__prompt`, `__trigger`, `__hint`, `__preview`, `__caption`, `__filename`, `__viewport`, `__sheet`, `__line`, `__unsupported`, `__swap`, `__input`, `__hint-action`, `.file-upload--fill`, `.file-upload.is-filled`, `.file-upload.is-unsupported`, `.file-upload.is-dragover` in `styles/file-upload.css`; drag-over and click-to-pick in `ds/scripts/file-upload.js` (State A panes only). `__swap` and `__caption` both have no consumer as of 2026-08-26 — see *Where the actions go* and *Who names the file*. |
| Chrome around it | `design-system/components/attachment.md` — the card, the header that names the file, the footer that holds the actions, and the collapse |
| Example | `screens/du-an/ho-so/tai-len.html`, wired in `du-an/ho-so/tai-len.js` (`setFile`, `bindUpload`) |

```html
<section class="file-upload" id="fileUpload" aria-labelledby="uploadPaneHeading">
  <h2 class="sr-only-label" id="uploadPaneHeading">Tài liệu tải lên</h2>
  <p class="file-upload__status" id="uploadStatus" role="status" aria-live="polite"></p>
  <div class="file-upload__dropzone">…</div>
  <!-- the caption inside is optional; omit it when the chrome around the pane
       already names the file -->
  <figure class="file-upload__preview">…</figure>
  <div class="file-upload__unsupported">…</div>
  <button class="button file-upload__swap" id="uploadSwap" type="button" data-action="pick-file">…</button>
  <input class="file-upload__input" type="file" accept="…" aria-hidden="true" tabindex="-1">
</section>
```

## Known Gaps

- **No progress, no failure, no size or format rejection — and the DS DOES draw
  the first two.** Corrected 2026-09-22: the `File queue` above draws an
  in-flight spinner, a cancel control and an `Đã tải lên` badge (`9826:63781`).
  They are unbuilt because nothing in this package uploads anything, not because
  they are unspecified. Size and format rejection remain genuinely undrawn. The hint promises
  a 10MB ceiling and a format list that nothing enforces — the `accept`
  attribute filters the OS dialog and is not validation. What a rejected file
  should say is a copy and product decision. The size is now *read* on
  `project-doc-upload` (it is printed beside the document in the list), which
  makes the missing check a smaller job than it was — but it is still missing,
  and the pane still shows a 12MB file as accepted.
- **The document preview is a placeholder.** `.file-upload__sheet` is a
  page-shaped block of skeleton lines, because the demo has no real file to
  render and a fake screenshot would read as design intent. How a DOCX, an XLSX
  and an image are actually previewed — native viewer, server-rendered image — is
  still unspecified. The **download-only fallback half of this gap closed on
  2026-08-26** with state C: what the pane shows for a format it cannot read is
  now drawn. Which formats fall into it is not — `accept` is the only list, and it
  is an OS-dialog filter that was never a rendering claim.
- **`Tải xuống` downloads nothing.** Nothing is uploaded anywhere in the demo, and
  the pane deliberately does not keep the `File` (see consumer obligation 3), so
  the control reports its intent and stops. The real implementation fetches the
  stored document by id from the server that refused to render it. A `<a download>`
  over a blob would demo a capability the product does not have.
- **State C's announced string is undrawn copy**, like state B's. The live region
  says the document is attached and can still be saved, which is the fact a
  screen-reader user cannot get from anywhere else on the pane — but no node
  specifies the LIVE-REGION sentence (the 2026-09-29 read gave the VISIBLE
  title and supporting line, not `.file-upload__status`'s text). Needs a
  UX-writing pass with the visible sentence beside it.
- **The announced string is undrawn copy.** `Đã chọn tài liệu <tên>. Bản xem trước
  đã mở.` was written to close the silent-swap defect (2026-08-13); neither node
  specifies it, so it needs a UX-writing pass. Previously recorded here as "the
  state change is silent", with the toast (since replaced by notification) as the compensation — which did not work,
  because it carried no `role="status"` either.
- **Removing a file is drawn, and now built in one place.** Corrected
  2026-09-22: every queue row carries a delete control in the set, and the
  partner document dialog builds it (`.attachment__action`). What is still
  undrawn is removing the file from a pane in `State=File Support` — the
  single-document case, where `Đổi tài liệu` replaces and nothing clears.
  (`Đổi tài liệu khác` was this file's name for that button; the component's own
  label is `Đổi tài liệu`, which `attachment.md` and the upload screen already
  use.)
- **Multiple files ARE addressed — answered 2026-09-22.** Both components carry
  an axis for it: `File upload` has `Files queued` (the queue above) and
  `_Attachment` (`10964:9598`) has gained **`Multi Files`**, whose `True` member
  swaps the footer's `Đổi tài liệu` for `Tải lên`. So a hồ sơ carrying several
  files is a case the design system draws, and the product question is only
  *which* hồ sơ do. What is still open is the single-input path: a consumer that
  lets the operator add a second file to an existing document has no drawn flow
  for the upload itself, only for the list that results.
- **The 40px tile is a literal.** It is the same 40px as
  `--utui-file-chip-size` but a different part, so it is not aliased to it; if a
  third 40px chip appears, tokenise the size rather than the component.
