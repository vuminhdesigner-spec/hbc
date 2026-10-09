# Modal (centred dialog)

## Purpose

Modal is a centred surface that interrupts the page for one thing: a record to
read, a fact to confirm, a short form.

It comes in **two sizes** — a 538px read panel and an 848px form panel — and they
are one component, not two surfaces: same inset, radius, shadow, gap ladder,
scroll behaviour and obligations. See Sizes below.

Use it when the content is short enough that a drawer would be mostly empty
space. A `--table` dialog may be expanded to full screen (`data-modal-expandable`, see Anatomy), which covers a table that needs more room than 1096px. Use `design-system/components/drawer.md` when the task needs a long form or a searchable, filterable sub-collection
beside the record, a page when the task is the destination, and
`design-system/components/filter-panel.md` when the page behind stays a valid place to be.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Read instance | `Modal`, node `11415:67308`, overlay 1440 x 960, panel **538 x 556** |
| Drawn over | `view` (`11415:67306`) in section `Địa chỉ` (`11415:67171`) |
| Opened from | a row's eye control in the `Địa chỉ` table (`11415:67219`) — see Known Gaps, the frame draws the modal over a different screen |
| Form instance | `pat-listing` (`11491:30254`) → modal `11491:30275`, panel **`I11491:30275;9883:83198`, 848 x 808**, body 800px in two columns |
| Opened from | a section header's `edit` pencil on `Chi tiết dự án` — the section-edit dialog |
| Table instance | `Các giai đoạn chính` (`12022:53364`) → modal `12022:53366`, panel **`I12022:53366;9883:83198`, 1096 x 664**, body 1048px holding one table |
| Opened from | a section header's `edit` pencil on `Các giai đoạn chính` — the same section-edit dialog, at table size |
| Reviewed via | Figma MCP server, 2026-08-14 (read + form), 2026-08-19 (table) |
| **Component set** | **`Modal`, node `933:39265`, in the DS file `SFo9P9PCVQiuOk2SqjZYKQ`** — 1855 x 34812 |
| Variants read directly | `Horizontal` `933:37839`; `Stacked left aligned` `1105:65365`; `Stacked centered` `172:4346`; `Destructive stacked centered` `1111:1774`; `Horizontal, Mobile` `1103:64656`; `Form` `9883:82899` |
| Set reviewed via | Figma MCP server, 2026-08-14 |

Until 2026-08-14 this contract was written from the MDM product instance alone. The
component set is the component; the MDM instances are consumers. Where they
disagree, the difference is recorded rather than normalised away — see Known Gaps
for the 538px width, which is **not** a size the set draws.

## Not To Be Confused With

| If the surface… | Use |
|---|---|
| Interrupts the page for a short read or confirm | **Modal**, read size |
| Interrupts the page to edit one group of fields | **Modal**, form size |
| Needs a searchable list, or a form long enough to need its own sections (a `--table` dialog can expand instead when the table is the whole task) | `design-system/components/drawer.md` |
| Leaves the page behind usable | `design-system/components/filter-panel.md` |
| Reports something that happened | `design-system/components/notification.md` (or the screen notification) |

## Anatomy

| Part | Class | Notes |
|---|---|---|
| Overlay | `.modal` | `position: fixed`, full viewport, centred grid with 32px padding. Contributes nothing to page `scrollWidth`. |
| Scrim | `.modal__scrim` | `--utui-scrim-bg` (`#101828` at .8) with an 8px backdrop blur. A real element, because it carries the dismiss handler. |
| Panel | `.modal__panel` | `role="dialog" aria-modal="true"`, width per size, height from its content, **two declared grid rows** (`minmax(0, 1fr) auto`) — the optional status line takes a third, implicit `auto` row between them. |
| Close | `.modal__close` | **Required, every consumer.** First child of `.modal__panel` (not of `.modal__content`, which scrolls) — a 44px icon-only trigger, top/inset-inline-end `--utui-spacing-03`, `close` glyph, `aria-label="Đóng"`, `data-modal-close`. **AUTHORED per Untitled UI web (untitledui.com/react/components/modals)**; Figma set `933:39265` layer `Button close X` synced to this spec 2026-09-29. Reserves `padding-inline-end` over the top text/heading row when that row has no featured icon above it — see `styles/modal.css`. |
| Controls | `.modal__controls` | Optional corner group replacing the bare `.modal__close` position: `position: absolute`, same top/inline-end offset, holds `.modal__expand` then `.modal__close` (the close keeps its look and size). First child of `.modal__panel`. Reserves 2 x touch target over the top text row. |
| Expand | `.modal__expand` | Full-screen toggle, 44px icon-only like `.modal__close`; glyph `open_in_full` / `close_fullscreen`, `aria-label` `Mở toàn màn hình` / `Thoát toàn màn hình`, `data-modal-expand`. **`--table` only, by decision (2026-09-30):** shown only when `.modal` carries `data-modal-expandable` AND its panel is `.modal__panel--table` (CSS guard); hidden at `max-width: 767px` (bottom sheet). **AUTHORED — no Figma frame draws it (gap).** |
| Content | `.modal__content` | Featured icon (`--lg`, tone per instance, light circle outline), `.modal__text`, then the body slot. **The band that scrolls.** Because it scrolls, `overflow-y: auto` computes the inline axis to `auto` too, and the box clips on both — so it carries `--utui-featured-icon-ring` of padding on its inline-start/block-start sides (with an equal negative margin, so nothing visibly moves) purely to give the icon's `--ring` shadow, which paints outside its own box, room before that clip edge. Fixed 2026-09-17; see `styles/modal.css`. |
| Heading | `.modal__heading` | Optional wrapper — `.modal__text` with a control beside it, aligned to the title, wrapping rather than shrinking. For an action that acts on the **form in the dialog** rather than on the record: the partner record's `Thiết lập thông tin` decides which fields its section editor holds. An action that saves, closes or writes belongs in `.modal__actions`; one that opens another record belongs on the row it describes. |
| Title | `.modal__title` | Text lg/Semibold (18/28), `--text/primary`. An `h2` when the page already has an `h1`. |
| Supporting | `.modal__supporting` | Text sm/Regular, `--text/secondary` — a step darker than the section header's supporting line. |
| Body | `.modal__body` | The instance's content: a `design-system/components/data-viewer.md` list at the read size, a `design-system/components/inputs.md` grid at the form size (`.modal__body--form`), one table at the table size (`.modal__body--table`). A body may also be a layout while wearing the **base** class — see the 2026-08-22 note. |
| Prose body | `.modal__body--prose` | Opt-in marker, read by one rule only: the `sm` centring guard in `styles/responsive.css`. It states that this body is PROSE and may be centred with the title above it. A body that does not carry it is treated as a layout and is left as drawn. No consumer today — the read size is what it is for. See *`sm` is a bottom sheet*. |
| Status | `.modal__status` | Optional, and it is the panel's **third row** — a sibling of `.modal__content`, not a child of it, so it cannot be scrolled out of sight (see Responsive). A message raised BY the dialog's own content, with an optional action — `role="status"` — **the panel's only live region**, revealed (`hidden = false`) *before* its text is written and set `hidden` again only to clear it, per the rule `styles/notification.css` states for every live region here. Writing into it while it is still `hidden` is writing outside the accessibility tree, and announces nothing; two polite regions on one panel interleave, so a surface that already publishes one routes this line's text through that instead of adding a role here (`design-system/components/drawer.md`, *Announcing what the drawer says*). `styles/modal.css` stated the opposite order in a comment until 2026-08-19 — the implementation never followed it, the drawer's did, and three replies there were silent. It exists because the notification layer sits below the overlay; see Known Gaps. Not a notification: it does not float, time out or take focus. Its glyph is the consumer's to choose and is painted the neutral `--utui-color-icon-default`, the same tone `.drawer__status` uses. |
| Status action | `.modal__status-action` | Optional, inside the status line — the phase editor's `Hoàn tác`. `type="button"`, because a status inside a dialog whose primary is a submit would otherwise save the record. `min-block-size: --utui-touch-target-min` (44px) with no inline padding, so the label stays flush and the target is real; it borrowed `.notification__action` until 2026-08-19, which gave the one control that recovers a deleted row a ~20px hit area from a component this dialog is not part of. |
| Actions | `.modal__actions` | Right-aligned, 12px apart, secondary then primary. Wraps rather than shrinks. Both sizes draw 44px buttons, which is `.button`'s own height — no size modifier. |

Height is **content-driven**. The source's 556px and 808px are one instance's
worth of rows, not fixed boxes; the panel is capped at `100dvh - 64px` and the
content band scrolls inside it, so the action row is always reachable.

**The two panel rows are declared, and that is load-bearing.** An `auto` row is
sized from its max-content contribution and does not shrink when its container is
capped, so with implicit rows a content band taller than the cap overflowed the
panel and pushed the action row off the bottom of the screen. Measured 2026-08-14
in Chrome at 375x667: the form panel's band was 1292px inside a 603px panel and
`Đóng` / `Lưu` were unreachable. `minmax(0, 1fr) auto` lets the band take the
leftover and shrink to it; the read panel had the same latent bug and only escaped
it by being short.

**The status line does not clear itself on a timer, so its consumer states when it
does clear.** It is not a notification and must not behave like one — a message that
erases itself while the dialog is still open takes its action with it. Four
moments, and the phase editor implements all four: a new message replaces it, its
own action is used, the dialog opens or closes, and the dialog's content changes
again in a way that makes the sentence stale (the editor clears it on the table's
`onDirty`, i.e. on the next add or delete). A message describing a change that
still stands is left where it is.

## States

| State | Behaviour |
|---|---|
| Closed | `hidden` on `.modal`. `.modal[hidden] { display: none }` is declared, because the author `display: grid` would otherwise beat the UA rule and leave a modal painted and tabbable while it is marked closed. |
| Open | Shell behind is `inert`; the page does not scroll (`body:has(.modal:not([hidden]))`). |
| Read-only | **A property of the read size, not of the component.** The 538px instance has no primary action at all: `Đóng` alone, because the dialog reads a record and saves nothing. Do not add a disabled `Lưu` to fill that row. |
| Editing | The 848px form size fills both action slots — `Đóng` then a primary `Lưu` with a leading `save` glyph. It is the only size that writes anything. |
| Invalid | A required field that is empty blocks `Lưu` and reports through the authored field error of `design-system/components/inputs.md` (`.form-field__control--error` / `.form-field__error` / `aria-invalid`), never `reportValidity()`. The dialog stays open, the field takes focus, and it is scrolled into `.modal__content`. The consumer owns `novalidate` on the form. |
| Expanded | `.modal__panel.is-expanded` (set by `ds/scripts/modal.js`): panel fills the viewport (`100%` x `100dvh`, overlay padding and radius dropped); the content band stays the scroll region. Focus stays on `.modal__expand`; label and glyph swap. `Escape` closes the dialog (no shrink-first). Not remembered: closing resets it. Entering `max-width: 767px` while expanded drops `is-expanded` and returns the bottom sheet (`ds/scripts/modal.js`). |
| Covered | A second surface is open over this one: the whole overlay is `inert`, so its panel, its controls and its scrim are out of the pointer, the tab order and the accessibility tree until the surface above it closes. See Stacking. |

## Stacking

**One surface at a time is still the default, and stacking is opt-in.**
`scripts/modal.js` replaces what is open unless the caller passes
`{ stack: true }` — because a hand-over depends on the replacing behaviour
(`design-system/components/drawer.md`: `Đổi chủ đầu tư` closes its dialog and
opens the picker drawer), and a surface that stacked by accident would leave the
first one painted with its focus return lost.

A second surface is warranted in two cases:

- **The first one cannot be left**: the form in it holds unsaved work, and the
  second surface's whole job is to change what that form contains. The one
  consumer is the partner record's `Thông tin khác` editor and the picker
  that adds a configured attribute to it
  (`design-system/components/attribute-field.md`).
- **A listing drawer, covered by one row's form, confirm or view.** The
  drawer (`design-system/components/drawer.md`) holds the operator's own
  search and filter, which closing it to open the row surface and reopening
  it after would drop. Stacking instead means the list is exactly as the
  operator left it once the row surface closes. Consumer:
  `screens/doi-tac/chi-tiet.html`'s three record drawers (`Địa chỉ`, `Tài
  khoản ngân hàng`, `Người liên hệ`) — every row's pencil/name and each
  drawer's own `Thêm …` open their surface with `{ stack: true }`; closing it
  returns to the still-open drawer, not to the page behind it.

Anything else the user could reach before opening the first surface is a
hand-over, not this case — replace, don't stack.

What a stacked pair owes, all of it implemented in `scripts/modal.js`:

- the covered overlay goes `inert` **as a whole**, scrim included — the scrim of
  a covered surface must not be a dismiss target for the one above it;
- Escape and the scrim close the **top** surface only;
- each surface returns focus to its own opener as it closes, so closing the
  picker lands back on the control inside the form that opened it;
- the shell stays `inert` until the last surface closes;
- the stacked overlay comes **after** the one it covers in the markup. Both carry
  the same z-index, so DOM order is what puts it on top.

Two is the depth this is built and tested for. A third surface is a sign the
first one is the wrong surface.

## Sizes

The set draws **three** widths — 400, 544 and 848 — and the package carries a fourth
because one product instance is 538px.

| Size | Panel | Body | Actions | Consumer |
|---|---|---|---|---|
| `sm` | `.modal__panel--sm`, **400px** | short text, or none | split 50/50 — **and only here**, see Layouts | `du-an/chi-tiet.html` — `#investorDiscardModal`; `du-an/tao-moi.js` — `#leaveConfirmModal`, since 2026-09-28; stacked over `#createDrawer` since 2026-10-02 |
| `md` | `.modal__panel--md`, **544px** | short text, or none | hug right, optional leading control | `du-an/ho-so/chi-tiet.html` — the three DC confirms, since 2026-08-27 |
| Form | `.modal__panel--form`, **848px** | `.modal__body--form`, a two-column `design-system/components/inputs.md` grid | `Đóng` + `Lưu` | `du-an/chi-tiet.html` |
| Table | `.modal__panel--table`, **1096px** | `.modal__body--table`, one full-width `design-system/components/data-table.md` table | `Đóng` + `Lưu` | `du-an/chi-tiet.html` |
| Read | `.modal__panel--read` / the base rule, 538px | `design-system/components/data-viewer.md` list | `Đóng` only | **none since 2026-08-19** — it was `investor-address.html` |

The base rule still falls back to `--utui-modal-width` so the read consumer does not
shift, but a new consumer should name its size: inheriting 538px by default means
inheriting a number nothing in either file explains.

**Width gap, 2026-08-27 — 456px.** `Chi tiết hồ sơ thay đổi theo trạng thái`
(`tS8dUB2qWLc28gZbtj8IIL`, `12684:34637` and `12684:34638`) draws its two
`Type=Horizontal` confirms at **456px**, which is none of the set's three widths and
not the 538px read instance either. `du-an/ho-so/chi-tiet.html` ships them
at `md` (544px), the width the horizontal layout belongs to, and the 88px
difference is recorded here rather than pinned as a fifth literal. Whether the
product means a narrower confirm size — the set's `sm` is 400px and stacks its
actions, so 456 is not that either — is a question for the DS owner. Same call
`.modal__panel--form` made for 848px before it had a token.

### The table size — open questions

One is a product/design decision raised by the 2026-08-19 audit and recorded
rather than answered, because the behaviour they describe is already shipped and
changing it silently would be worse than leaving it visible.

- ~~`Enter` inside a table cell submits the dialog, so it saves and closes.~~
  **Decided 2026-09-28: swallow it.** `ds/scripts/phase-table.js` now calls
  `preventDefault()` on `Enter` in a cell's text input, for every consumer
  (both wizard steps and this dialog's `#sectionModal` phase editor) — a key
  most people press to leave a field must not also submit the surface behind
  it. The `.select` cell's own trigger already stopped this in `select.js`.
- **Where the table's own footer controls belong.** `Thêm dòng` and `Thiết lập`
  sit in the table's footer inside the body, while `Đóng` and `Lưu` sit in the
  panel's action row; a user therefore meets two rows of buttons with different
  scopes. The frame draws it that way. See
  `design-system/components/data-table.md` for the `Thiết lập` half of it.

## Layouts

Orthogonal to size. The set expresses these as `Type` values; here they are panel
modifiers, because the parts and the behaviour are identical and only the
arrangement changes.

| Layout | Class | Arrangement |
|---|---|---|
| Stacked left aligned (default) | — | Icon above the text, everything left-aligned. |
| Stacked centered | `.modal__content--centered` | Same DOM; the icon centres and the text is centred. |
| Horizontal | `.modal__panel--horizontal` | The panel is a **row**: 48px icon, then a column holding the text and the action row 32px below it. |
| Form | `.modal__panel--form` | Stacked, with the two-column field grid as the body. |

**The horizontal layout is the one place the markup differs:** its featured icon is a
child of the **panel**, not of `.modal__content`. That is how the set builds it (the
icon is a sibling of `Content`), and it is what puts the action row in the second
column, indented past the icon — a full-width action row underneath the icon is a
different composition, and not the drawn one.

### A field that spans the form grid

`.modal__body--form` is `repeat(auto-fit, minmax(min(340px, 100%), 1fr))`, i.e.
two columns at the form size and one below it. A field that is drawn the full
width of the panel carries **`.form-field--full`** (`grid-column: 1 / -1`) rather
than a second grid or a nested row.

Added 2026-08-22 with the two controls the `Thông tin dự án` dialog gained: the
`Ảnh dự án` picture field at the top of the panel and the `Mô tả dự án` textarea
at the bottom of it. Both are full-bleed in the source, and a 128px textarea
sharing a row with a 44px input leaves that input floating at the top of a box
three times its height.

The rule is on the body, not on `.form-field` — a spanning field means nothing
outside a grid, and `form-field.css` owns no layout of its own.

### Action row

| Class | Layout | Behaviour |
|---|---|---|
| `.modal__actions` | form, read, horizontal | Right-aligned, buttons hug their labels. |
| `.modal__actions--split` | the two stacked layouts **at `sm` (400px)** | Both buttons take an **equal half** of the row (`flex: 1 0 0`). |
| `.modal__actions--between` | horizontal | `space-between`: an optional leading control — the set's `Don't show again` checkbox — at the start, buttons at the end. Compose `.choice--sm` from `design-system/components/inputs.md`; the set's 16px box with a 4px radius is what that class already is. |

A 400px panel has no room for a right-aligned pair to read as a hierarchy, which is
why the set splits the row there and leans on order and fill instead. Do not
right-align a stacked layout's actions to match the form size.

**Scoped to `sm` on 2026-09-16, when the first stacked `md` consumer arrived.**
That sentence is an argument about 400px — a pair of buttons with no room to
express a hierarchy — and it does not carry to 544px, which has the room. The
`Sizes` table said `md` hugs right while this row said the stacked layouts split,
and the two could not both be followed by
`screens/doi-tac/chi-tiet.html`'s `Cập nhật trạng thái` dialog: a stacked `md`
panel. It hugs right, and the rule now says which axis wins — the **width**
decides the action row, not the layout. A stacked `sm` splits; everything wider
hugs right.

### Tones

`Warning …` and `Destructive …` are prefixes on the `Type` axis, and they change
exactly two things: the featured icon's tone, and — for destructive — the primary
button.

| Tone | Featured icon | Confirm button |
|---|---|---|
| Brand (default) | `.featured-icon--lg` | `.button--primary` |
| Success | `--success` | `.button--primary` |
| Warning | `--warning` | `.button--primary` |
| Destructive | `--error` | `.button--destructive` (Red/600 fill **and** border) |

Both of those were missing when the set was read and were added with it:
`.featured-icon--error` (`design-system/components/featured-icon.md`) and `.button--destructive`
(`design-system/components/button.md`). Before that, a delete confirmation composing
`.featured-icon--lg` with no tone silently got the **brand amber** — the one tone a
destructive dialog must not wear.

A size is a **modifier**, never a screen-local width. Everything the form size
changes lives in two blocks of `styles/modal.css`: the panel width and the
body grid. The width goes through a component-local `--modal-panel-width` with the
read token as its fallback — the construction `styles/data-viewer.css`
uses for its label column — so the panel rule carries one `inline-size` however
many sizes exist.

A third size needs a frame. Do not derive one from a screen's content.

## Behaviour the component requires of its consumer

Identical obligations to `design-system/components/drawer.md`, and for the same reason — a modal
without them is a trap. They are **implemented once**, in
`scripts/modal.js`, so a consumer gets them by calling
`OmeuModal.open(id, trigger)` rather than by reimplementing them. Since
2026-08-19 that script drives **both** surfaces: its panel and scrim lookups take
`.modal__panel, .drawer__panel` and `.modal__scrim, .drawer__scrim`, so the
drawer carries no behaviour of its own.

1. Focus moves into the panel on open. This dialog focuses the **panel box**
   (`tabindex="-1"`), not its first control: the content is a record to read, and
   landing on `Đóng` announces the way out before the thing being read.
2. Focus is restored to the trigger on close, and only if that element is still
   in the document and still rendered — a row control does not survive a table
   re-render, and focusing a detached node drops focus on `<body>`.
3. `Escape` closes. So does the scrim.
4. The page behind is `inert`. The `Tab` trap is the fallback for UAs without
   `inert`, not a substitute for it.
5. The screen fills `.modal__body` **before** calling `open()`, so the dialog is
   never announced empty.
6. A caller that must not lose unsaved work passes `beforeClose` to `open()` —
   `OmeuModal.open(id, trigger, { beforeClose: fn })` — checked on every route
   that reaches `close()` (Escape, the scrim, `[data-modal-close]`, a caller's
   own `close()`); `fn` returning `false` cancels the close. Added 2026-09-29
   for `screens/doi-tac/tao-moi.js`'s create-drawer wizard, which owed the same
   dirty-form guard on four dismissal routes.

One surface at a time is still the default here too — replace unless the
caller opts into `{ stack: true }` (`## Stacking` above names both cases this
package tests). Opening a second surface without that option closes the first
one without returning focus, because focus is about to move into the new
panel.

**A dialog may hand over to a drawer, and that is not a stack.** `Đổi chủ đầu tư`
in `#investorModal` closes its dialog and opens `#investorDrawer`; there is still
one panel, one focus trap and one `inert` subtree at every moment, and `open()`
enforces it rather than the screen remembering to close first. The one obligation
this puts on the caller: **pass a trigger that outlives the panel being closed.**
The control that was pressed is inside the dialog going away, `close()` skips a
trigger that is no longer rendered, and focus would land on `<body>` — so hand
over a control on the page behind (here, the card's own pencil).

**A row's form, confirm or view may stack over the drawer that lists it** —
the second case in `## Stacking`. `screens/doi-tac/chi-tiet.html`'s three
record drawers do this for every row's pencil/name, each drawer's own
`Thêm …`, and the delete confirm behind `Địa chỉ`'s bin action. The drawer
goes `inert` under the row surface and comes back exactly as the operator
left its search and filter once that surface closes — see
`design-system/components/drawer.md`.

## Tokens

| Token | Role |
|---|---|
| `--utui-modal-width` | Panel width at the read size (538px) |
| `--utui-modal-width-sm`, `--utui-modal-width-md`, `--utui-modal-width-form` | 400 / 544 / 848px — the three widths the DS set draws |
| `--utui-modal-width-table` | 1096px, the MDM table instance. Like the 538px read width it is a product instance and **not** a size the set draws — see Known Gaps |
| `--utui-modal-bg`, `--utui-modal-shadow` | Panel surface (Shadow/xl) |
| `--utui-modal-radius` | 12px — `--utui-radius-lg`. Was `--utui-radius-xl` (16px) while the token had no consumer; corrected 2026-08-14. |
| `--utui-modal-padding` | 24px inset |
| `--utui-modal-gap` | 32px between the content band and the action row |
| `--utui-modal-content-gap` | 20px inside the content band |
| `--utui-modal-body-gap` | 16px between body rows |
| `--utui-modal-actions-gap` | 12px between actions |
| `--utui-scrim-bg`, `--utui-scrim-blur` | Overlay. One Figma `bg overlay` component, shared with the drawer, whose `--utui-drawer-scrim*` now alias these. |

## Responsive

- The panel is its size's width capped at `100%` of a padded overlay, so it
  narrows with the viewport and never touches its edge. **No screen carries a
  width query for it, `styles/responsive.css` has no `.modal` rung, and
  the component has no tier rule at all.**
- **The overlay's column track is `minmax(0, 1fr)`, and that is what makes the cap
  work.** An `auto` track is sized from its item's max-content contribution, so a
  panel declaring `inline-size: 848px` made the *track* 848px wide inside a 311px
  overlay, and the panel's own `max-inline-size: 100%` then resolved against that
  848px grid area and clamped nothing. Measured 2026-08-14 in Chrome: the form
  panel was 848px at every width from 375 up, overflowing the viewport on both
  sides, and no page-overflow check caught it — the overlay is `fixed`, so it
  contributes nothing to `documentElement.scrollWidth`, and the scroll lock puts
  `overflow: hidden` on the body. The read panel had the same bug below a ~602px
  viewport. Fixed 2026-08-14; measured after: panel 311px at 375, 704px at 768,
  848px from 1024 up, `scrollWidth === clientWidth` at 375 / 768 / 1024 / 1280 /
  1440 / 1920 with the dialog open and closed.
- `100dvh`, never `vh`: the action row must not sit under a mobile browser's
  toolbar.
- The content band, not the panel, is the scroll region — the action row stays
  put. See the two declared panel rows under Anatomy; without them that sentence
  was only true for content shorter than the cap.
- **The form body reflows on the PANEL's width, not the viewport's, and it uses
  `auto-fit` rather than a tier rung.** A modal panel is 848px inside an overlay
  with 32px of padding, so the two are different numbers: a `max-width: 1023px`
  rung would stack the body at 1024 where the panel is still full width, and leave
  it two-up at 375 where the panel is 311px. `repeat(auto-fit, minmax(min(340px,
  100%), 1fr))` resolves against the body box, which is what a container query
  would do — see gap 5 in `.claude/skills/responsive/SKILL.md`. Below `2 × 340px + 24px` of
  body the grid is one column: the field keeps its designed width and the region
  collapses. The `min(340px, 100%)` is load-bearing — a bare `340px` minimum makes
  a single track wider than a 263px body on a 375px phone.

### `sm` is a bottom sheet, not a narrower panel

The set's `Breakpoint=Mobile` (read from `Horizontal, Mobile` `1103:64656`) is a
different composition, and four things change together:

| | Desktop | `sm` (≤767px) |
|---|---|---|
| Overlay | centred, 32px padding | panel anchored to the **end** of the block axis, 16px side gutters, **80px** bottom offset |
| Panel | width per size | **full width** of that box, insets 20 / 16 / 16, gap **24px** |
| Content | gap 20px, alignment per layout | gap **16px**, and **every layout collapses to the centred stack** — including horizontal, whose icon-beside-text row is desktop-only |
| Close | `.modal__close` at `--utui-spacing-03` (12px), unchanged | same 12px offset; the text-row reserve recomputes against `--utui-modal-padding-inline-sm` (16px), not the desktop 24px, and horizontal cancels its own reserve — its icon sits above the (now centred) title, not beside it |
| Actions | secondary then primary, hugging or split | stacked full width, and the **primary comes first** |

The reversed action order is a decision, not a slip: on a sheet the primary sits
nearest the thumb. It is implemented with `order`, so the DOM keeps
secondary-then-primary — reading order and tab order stay as authored and one markup
serves both breakpoints.

Two scoping notes. The centred text is scoped **away from every panel whose body is
a layout rather than prose**, and this whole block lives in `styles/responsive.css`,
not in `modal.css`, because it steps with the tier; the form body's `auto-fit`
reflow is the opposite case and correctly does not.

#### The centring guard is keyed on the body, not on the size — 2026-08-27d

This paragraph used to read *"A new size with a layout in its body has to be added
to that `:not()` list"*, and the list was
`:not(.modal__panel--form):not(.modal__panel--table)` — **panel sizes**. That
sentence was the contract admitting the guard was on the wrong axis, and the hazard
proved it twice:

- `--table` was missing from the list when it shipped on 2026-08-19. Measured at
  375 rather than assumed: the dialog's title and supporting line were centred over
  a left-aligned table and its footer band — two alignments in one panel — and every
  child of the band became a fit-content grid item instead of a stretched one.
- `screens/du-an/ho-so/chi-tiet.html`'s `Từ chối lưu trữ hồ sơ` dialog then
  walked past the exclusion entirely: it is `.modal__panel--horizontal
  .modal__panel--md` with a required `Lý do từ chối` field in its body, so it is
  neither excluded size. Measured at 375 on 2026-08-27: `#rejectForm` was 311px
  against a 311px `.modal__content`, so it did **not** shrink — the hint string's
  max-content saved it by accident — but the centring **was** applied over a form
  that is `text-align: start`. Same two-alignments-in-one-panel defect, one size
  over.

A size list could never express this, because **a body can be a layout while
wearing the base class** — see the 2026-08-22 note below, where an 848px panel
deliberately composes its own rows inside the base `.modal__body`, and
`screens/du-an/ho-so/tai-len.html`'s dashed summary panel does the same at `md`.

**The rule now: at `sm`, a panel is centred when its content band holds no body, or
holds one that has declared itself prose with `.modal__body--prose`.** A body that
says nothing is treated as a layout and keeps the alignment it was drawn with.
The default is therefore the safe one — a forgotten marker costs left-aligned text
in a prose dialog, never two alignments in one panel — and **a new size needs no
change here at all.**

**One shipped dialog's rendering moved with the inversion, and it is not the one the
fix was for.** `screens/du-an/ho-so/tai-len.html`'s `#sendModal` has a body — the
dashed summary panel — and no `.modal__body--prose`, so at `sm` its title and
supporting line are now **start-aligned** where the size-list guard centred them.
That is the guard reading the same evidence as everywhere else (a body that says
nothing is a layout), it was measured at 375 with no break, and it is recorded here
rather than opted back in with a marker: adding the marker would assert that panel is
prose, which is exactly the claim the round removed from the size list.

`.modal__body--prose` has **no consumer today**: the read size is what it is for and
it has had none since 2026-08-19. It is written down rather than left implicit so the
next read dialog does not have to rediscover why its `Data viewer` list stopped
centring.

**Three rules share that one predicate, and the third is the icon.** `--horizontal` is
the only layout whose featured icon is a child of the *panel* rather than of
`.modal__content`, so at `sm` it is centred by a rule of its own; a stacked panel's
icon sits inside the content band and `justify-items` already decides it. Where the
text stays as drawn, the icon goes to the start with it — otherwise the reject dialog
draws a centred icon over a left-aligned title, which is the same defect one part up.

The sizing half of the old hazard is unchanged and still the reason the guard
matters: a body child that is not a scroll container is sized from its max-content
contribution when the grid item goes fit-content, and a wide one would move the
horizontal scroll onto `.modal__content`, where no page-overflow check can see it
because the overlay is `fixed`. (The 2026-08-19 table case did not overflow only
because the table sits inside `.data-table-wrap` and the band's single `auto` track
is already the panel's width, so fit-content clamped to the 311px track.)

Measured 2026-08-14 at 375: panel 343px (375 − 2×16), 80px clear below it, primary
above secondary, `scrollWidth === clientWidth`. At 768 and above: 544px, centred,
desktop action order. Measured again 2026-08-19 with the table dialog open at 375:
panel 343px, `.modal__content` `scrollWidth === clientWidth` (311), the table
scrolling inside its own wrap at its 548px floor.

## Accessibility

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` the title and
  `aria-describedby` the supporting line.
- The panel takes `tabindex="-1"` so focus can land on it; nothing else in the
  dialog is added to the tab order.
- `.modal__expand` is a native `<button>`; its `aria-label` names the action and swaps with the state (no `aria-pressed`). Toggling does not move focus. Focus order: panel -> `.modal__expand` -> `.modal__close` -> body.
- The scrim **is** focusable here, unlike the drawer's: it is a `<button>` with a
  name (`Đóng chi tiết…`), so the pointer's dismiss target is also a keyboard
  one. The scrim, `Escape`, `.modal__close` and the panel's own `Đóng` action are
  **four ways to close every dialog.**
- Focus order: panel (landing target) → `.modal__close` → the body's own
  controls → `.modal__actions`. `.modal__close` is first in source, right after
  the panel's opening tag, so Tab reaches it before anything in the content.
- `#leaveConfirmModal`'s `×` **stays on the page**, same as its `Hủy` button,
  `Escape` and the scrim — it must never trigger the navigation the dialog is
  guarding against.
- A read-only value renders as text, never as a blank — see
  `design-system/components/data-viewer.md`. A read-only boolean renders as a `disabled`
  `.choice--flag` with its own accessible name (`design-system/components/inputs.md`).

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `styles/modal.css` |
| Behaviour | `scripts/modal.js` (`window.OmeuModal`) |
| Tokens | `design-system/tokens/css/untitled-ui-component.css`, `--utui-modal-*` and `--utui-scrim-*` |
| Example — read size | **No consumer since 2026-08-19.** It was `screens/investor-address.html` (`#addressModal`), deleted with the record's `Chủ đầu tư` tab; the Figma frame behind it stopped drawing the dialog in the same week |
| Example — form size | `screens/du-an/chi-tiet.html`, `#sectionModal`, with `openSectionEditor()` / `saveSectionEditor()` |
| Example — table size | `screens/du-an/chi-tiet.html`, `#investorModal` — the `Chủ đầu tư` record dialog (`12035:63630`), one four-column table with a footer band carrying `Đổi chủ đầu tư`, and `Đóng` as the only action. Also `#sectionModal` at `--table` for the phase editor. The frame's own panel measures ~1041px, which is not a size this package draws; it ships at the 1096px table size rather than pinning a sixth literal width, and the fill column absorbs the 55px |
| Example — status line and its action | `screens/du-an/chi-tiet.html`, `#sectionModalStatus` — written by `phaseStatus()` in `screens/du-an/chi-tiet.js` for the phase table's row delete and its `Hoàn tác` |

## Known Gaps

- **A modal does not minimize (deliberate, 2026-09-30).** Minimize / dock exists for the drawer only (`drawer.md`, `dock.md`); `OmeuModal.minimize` refuses a surface without `data-drawer-minimizable`, and `modal.css` has no minimize part. No Figma frame draws `.modal__expand` / `.modal__controls` (AUTHORED). Only `--table` opts in (`#investorModal`); other sizes are not expandable.
- **Angular draft (not confirmed):** inputs `expandable: boolean` (`data-modal-expandable`) and `expanded` two-way (`is-expanded`); `ds/angular-map.json` is not edited by hand.

- **30 of the set's 34 `Type` values are not implemented.** Built: `Horizontal`,
  `Stacked left aligned`, `Stacked centered`, `Form`, each with the Warning and
  Destructive tones. Not built, and why: `Stacked with team` / `… and link` /
  `… and invites`, `Access request`, `Plan`, `Payment method`, `Payment details`,
  `Payment details with image`, `Email invite`, `User invite`, `Link field`,
  `Labels`, `Checkboxes`, `Input field`, `2FA code`, `Verification code`,
  `Password prompt` are Untitled UI product content with no MDM screen behind them;
  `Centered photo`, `Centered photo carousel`, `Centered video carousel`,
  `Date picker`, `Toggles`, `With dropdown` / `Dropdown` and `File upload` would
  additionally need components V2 does not have (carousel, date picker, toggle) or
  already has in another surface. Same convention as `design-system/components/badge.md`, which
  documents 13 ramps and implements six. **A screen that needs one of these must
  read its own variant** — do not extrapolate from the four above.
- **538px is not a width the set draws.** The read consumer's panel came from the
  MDM instance (`11415:67308`) before the set had been read, and the set's three
  widths are 400 / 544 / 848. Nothing in either file explains the 6px difference
  from 544, so the likely answer is that the instance was resized by hand. It was
  kept so `investor-address` would not shift; that screen was deleted on
  2026-08-19, so the size now has **no consumer to protect** and the cheapest
  resolution is to fold it into `md` (544px) once the DS owner confirms the 538 is
  a slip.
- ~~**A dialog with two views, added 2026-08-19.**~~ Superseded the same day.
  `#investorModal` briefly carried the company picker as a second view, because
  no frame drew the picker and this contract refuses a modal stack. `12035:57167`
  draws the picker as a **drawer**, so the two views are two surfaces again — and
  still not a stack, because the dialog closes as the drawer opens. See *One
  modal surface at a time* above; that is the pattern to copy when a dialog needs
  to hand a decision to a bigger surface.
- **A surface that stays open after acting cannot use the notification.**
  `styles/notification.css` sits at z-index 40 and the overlay at 60, so a notification raised
  while a dialog or drawer is open paints behind the scrim. Two answers exist —
  `.modal__status` inside the panel and, since 2026-08-19, `.drawer__status` —
  and both are the same idea implemented twice for two surfaces. A
  `.notification-stack--over-modal` tier would let them agree instead.
- **1096px is a fourth product width the DS set does not draw.** The set draws
  400 / 544 / 848; the table instance is 1096 and the read instance 538. The
  table size has a reason the 538 does not — its body is a table sized by the
  record rather than by a reading measure — but the DS owner should still decide
  whether the set grows a table width or the instance comes down to 848.
- ~~Two `styles/modal.css` rules are currently scoped inside a screen file.~~
  **Resolved 2026-08-19, both halves, and neither the way the entry expected.**
  The `grid-template-columns: minmax(0, 1fr)` half is now `.modal__body--table` in
  `styles/modal.css` — it belongs to the size whose body is a table, and both
  table-bodied dialogs in the package carry that class, so the
  `.investor-modal .modal__body` copy in `screens/du-an/chi-tiet.css` was
  removed with its measurement moved into the component's comment. The
  `[hidden] { display: none }` half has **no consumer at all** since the two-view
  investor dialog was retired on 2026-08-19: nothing in the package hides a
  `.modal__body` or a `.modal__actions` any more, so the rule was not lifted, it
  was dropped. A dialog that ever swaps its body again needs it back — a grid or
  flex container's author `display` beats the UA's `[hidden]` rule, the same trap
  `.modal[hidden]` records at the overlay level.
- **The set draws no `Form, Mobile` variant**, so the form size's sheet composition
  is not specified by design: it is the shared `sm` geometry with the centred text
  deliberately withheld (see Responsive). A designer needs to confirm or replace it.
- **The stacked layouts' split action row has no consumer yet.** `sm` / `md` and the
  destructive tone exist because the row-delete confirmation still open in
  `design-system/components/data-table.md` needs exactly them, and because a destructive dialog
  built ad hoc is how the brand amber ends up on a delete button. First real
  consumer will confirm the copy and the button order.
- **The set draws no hover state for the destructive confirm button**, so its hover
  is inferred one ramp step (Red/700) — see `design-system/components/button.md`.
- **The source instance's field list does not describe an address.** The dialog is
  titled `Địa chỉ` and its supporting line is about addresses, but its seven rows
  are `Địa chỉ`, `Họ tên`, `Chức danh`, `Địa chỉ`, `Số điện thoại`, `Email`,
  `Liên hệ chính` — a contact record. The table behind it (frame layer name:
  `contact`) has no address column either. Almost certainly the `Người liên hệ`
  frame duplicated and retitled; only a designer or PO can say which of the two
  titles is wrong. Built as drawn.
- **`Địa chỉ` is used as a label twice in the same list**, on rows 1 and 4. Row 1
  carries the address; row 4 is empty in the frame. Kept verbatim — same treatment
  as the mismatched anchor pill in `design-system/components/anchor-nav.md` — but two identical
  labels in one list is a real defect for anyone reading the list rather than
  looking at it.
- **The frame draws `Email` as `Chưa có dữ liệu`** while every row of the table
  beside it shows an email. The demo renders the record's real email and leaves
  the phone empty, because a dialog claiming a record has no email while the row
  behind it prints one is worse than a deviation from the frame. Deliberate.
- **The modal is drawn over the wrong background.** Frame `view`
  (`11415:67306`) composes it over the `Thông tin chi tiết` project screen, which
  authors no control that could open it. The only authored trigger for a single
  address record is the eye control in the `Địa chỉ` table, so that is what the
  demo wires. Whether the record modal should also open from the section's address
  tiles on the `Chủ đầu tư` tab is a design question — it is **not** wired, because
  a tile carries an address and the dialog carries a person, and mapping one to
  the other would be invented data.
- **No enter/exit transition.** The source is a static frame; the panel appears and
  disappears. A fade would need a motion token this package does not have. Same
  gap as the drawer.
- ~~No header close control.~~ **Closed 2026-09-29, every consumer.**
  `.modal__close` — an `×`, `aria-label="Đóng"`, `data-modal-close` — is
  authored per Untitled UI web. The DS set `Modal` (`933:39265`) was synced to it
  2026-09-29: `Button close X` — 44×44, `radius/md`, 20px `close`, `ic/gray-dark`,
  12px top/right — in all 5 variants (it had a bare 24px icon at 16px before).
- **The close glyph ships at 20px, not Untitled's 24px.** This package's inline
  glyphs default to 20px (`.modal__status` is the precedent) and there is no
  shared icon-size token to carry a 24px exception into one control. Recorded
  2026-09-29 rather than pinning a local literal.
- **The package now has 4-5 different close-button styles**, added on
  different days for different surfaces: `.modal__close` (44px, `--utui-radius-md`,
  `--utui-color-icon-default` / `--utui-color-icon-strong` hover), `.drawer__close`
  (40px, `--app-radius`, `--utui-color-gray-500` / `--utui-color-brand-600` hover),
  `.section-action`, `.cell-action` and the page-tab close icon each their own
  rule. `.drawer__close`'s 40px hit area and hover-to-brand treatment are
  deliberately **not** synced to `.modal__close` here — recorded, not fixed, as a
  separate ticket per the plan this gap comes from.
- **`.modal__close`'s icon colour is a deviation from Untitled for AA.**
  Untitled's web reference draws the close glyph in a lighter tertiary tone;
  `--utui-color-icon-default` is used instead so the glyph clears the 3:1
  non-text contrast Untitled UI docs cite the whole page's Product Profile
  standard (WCAG 2.1 AA) — same reasoning `.modal__status`'s glyph note gives
  for choosing a token over the drawn tone.
- **Scrolling content passes under `.modal__close`.** The trigger's background
  is transparent, so a long body's own text or a table row scrolling in
  `.modal__content` shows through behind the glyph rather than stopping at an
  opaque edge. Fixing it means giving the trigger `--utui-modal-bg` so it reads
  as a surface over the scroll — deferred, not done here.
- **The 848px form width has no token.** `design-system/tokens/css/untitled-ui-component.css`
  carries `--utui-modal-width` (538px) and nothing for the form size, so 848px is
  pinned in `.modal__panel--form`. It is scoped through `--modal-panel-width`, so
  a `--utui-modal-width-form` token drops into one declaration when a designer
  supplies it. Same shape of gap as `--utui-modal-radius` before it was corrected.
- ~~No confirm size.~~ **`du-an/tao-moi.js` shipped one, 2026-09-28** — `sm`
  (`#leaveConfirmModal`, opened `{ stack: true }` over `#createDrawer` since 2026-10-02), replacing its `window.confirm()` leave guard. Reuses
  the same tone and split-action layout as `#investorDiscardModal`.
  `du-an/chinh-sua.js` removed 2026-09-28 (no màn chỉnh sửa; sửa theo block/card) —
  gap moot.
- **The form size's actions do not pin their drawn widths.** The frame draws
  `Đóng` at 118px and `Lưu` at 146px; both ship content-width, as the read size's
  `Đóng` already does. A button pinned narrower than its label stops saying what it
  does, and Vietnamese labels are the ones that would break first.
- **The notification layer sits below the modal.** `notification.css` is `z-index: 40` and the
  overlay is 60, so a notification raised while a dialog is open would paint behind the
  scrim. Three consumers order around it, and they do it three ways: the
  section-edit dialog on `project-overview` raises its save confirmation **after**
  `close()`; `#investorModal` stays open and announces in its own live region; and
  the phase-table editor — which deletes a row while the dialog stays open, and
  whose `Hoàn tác` must therefore be *reachable*, not merely visible — writes into
  `.modal__status` inside the panel. The third case is why that part exists. A
  `.notification-stack--over-modal` tier would let all three agree. There is no z-index token ladder in `design-system/tokens/css/`, so this stays a
  convention held in separate files — the same gap `design-system/components/anchor-nav.md`
  records.
- **`.modal__status` and `.drawer__status` are the same part in two files.**
  Added on the same day, for the same reason, with the same eleven declarations,
  the same neutral 20px glyph and the same consumer obligations (no timer, no
  focus, cleared by whatever makes the message untrue). They differ in three
  places now: the drawer's carries `width: 100%` and a declared `order: -1`
  because it lives in a flex footer; the modal's has an action part
  (`.modal__status-action`) the drawer's has no consumer for; and **the drawer's
  is not itself a live region** when its panel already publishes one, which is the
  case in the only consumer it has (`role="status"` on a `hidden` element
  announced nothing, and a second polite region beside the picker's own would have
  interleaved — see `design-system/components/drawer.md`). Any merge has to carry
  that split as a documented option rather than pinning `role="status"` into the
  part. Whether they become **one shared surface-status part** — and if so
  where it lives, since neither `modal.css` nor `drawer.css` can own the other's —
  is a design-system decision, not a screen's. It is not merged here because
  merging two component internals is a contract change for both, and because a
  third surface (`filter-panel.md`) may want it and has not asked yet.
- ~~The status line can be written below the fold.~~ **Resolved 2026-08-19 by
  moving the part.** It was authored as the last child of `.modal__content`, the
  band that scrolls, so the phase editor's row-delete undo could be painted out of
  sight after a long list — measured at 1440 x 520 with ten rows: the band was
  1122px inside 332px and the undo sat 790px down it. It is now the panel's third
  row, a sibling of the band, always visible and always in the tab order between
  the band and the action row. `scrollIntoView({ block: "nearest" })` on the old
  placement was the other answer and was rejected: it works, but it drags the table
  out from under the control the editor has just focused, so recovering from a
  delete would move the thing you were about to click. A consumer that puts a
  status back inside the band owns that problem again.
- **The form size keeps the panel's landing focus rather than focusing its first
  field.** `scripts/modal.js` focuses the panel for every consumer, which
  announces the dialog from its title before its ten controls. Whether a form
  dialog should instead land on its first editable field is a design question; it
  is deliberately not overridden per consumer, because a per-screen focus rule is
  how the shared behaviour starts drifting.
- **The panel's focus is deliberately invisible.** It is a landing target, not a
  control, and Chrome paints its own ring on a programmatically focused
  `tabindex="-1"` box — measured 2026-08-14, a blue UA outline around the whole
  panel. `.modal__panel:focus { outline: none }` suppresses it. Nothing focusable
  loses an indicator: every control inside keeps the app ring from `base.css`.
  Whether the dialog should instead show a deliberate focus treatment on arrival
  is undrawn.
- **448px is a fifth panel width the set does not draw, read 2026-09-17.**
  `screens/doi-tac/chi-tiet.html`'s `Đổi trạng thái` dialog (MDM (Un-Official),
  `TpwqqNqhnFgycttdngXmFA`, node `14136:6489`) measures a 400px content column
  plus the 24px panel padding on each side — 448px total — and neither of the
  two stacked-size widths (400 / 544) is that number. Built at `md` (544px)
  rather than a new modifier: `.modal__panel--horizontal` is already the layout
  the frame draws (icon and text in a row), and this contract's own Sizes
  section already ties that layout to `md` — `du-an/ho-so/chi-tiet.html`'s
  `Từ chối lưu trữ` dialog is the existing `.modal__panel--horizontal
  .modal__panel--md` consumer with a body field, which is the precedent this
  dialog follows rather than inventing a `--utui-modal-width-448` no other
  frame corroborates. Same shape of gap as the 456px and 538px entries above:
  recorded rather than pinned.
- **The horizontal layout's icon-to-text gap measures 20px in this frame,
  not the 24px `.modal__panel--horizontal` ships.** `styles/modal.css` sets
  `column-gap: var(--utui-spacing-06)` (24px) for every horizontal consumer;
  node `14136:6489` reads 20px (`--utui-spacing-05`) between the featured icon
  and the text column. Not changed here: `.modal__panel--horizontal` is shared
  by three consumers already (`approvalModal`, `docDeleteModal`, `rejectModal`
  in `du-an/chi-tiet.html` and `du-an/ho-so/chi-tiet.html`), and a screen
  rebuilding one dialog is not the pass to re-measure and move a component-wide
  token against the other two without their own frames in hand. Read again if
  the DS owner re-opens the horizontal layout's geometry.
- **The frame draws the `Xác nhận` primary disabled by default (bg tertiary,
  border disabled, text disabled), which is not `.button--primary:disabled`'s
  shipped look (Brand/200 fill, white label, the 1.47:1 contrast gap this
  contract's sibling `button.md` already records, 2026-08-22).** Not
  reconciled here — `button.md` says plainly not to work around its known gap
  in a screen bundle — so `#statusModal` inherits the existing disabled-primary
  treatment rather than getting a one-off neutral disabled style. The frame's
  own disabled rendering is closer to the "stop tinting the surface" direction
  that gap's entry already proposes as one of two fixes; this dialog is simply
  a second instance of the same unresolved question, not a new one.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/modal.md`](docs/revisions/modal.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-22 (the `inert` subtree on a shell-less screen)
- 2026-08-22 (`--form` is a body layout, not a size)
- 2026-09-17 (`.modal__content`'s clip edge was cropping the stacked layouts'
  featured-icon ring; padded the two touching sides and pulled the box back by
  the same amount rather than moving the icon out of the scrolling band)
- 2026-09-29 (added `.modal__close`, AUTHORED per Untitled UI web, to every
  consumer; `#leaveConfirmModal`'s X stays on the page)
- 2026-09-29 (Figma DS set `Modal` `933:39265`: close icon wrapped in 44px
  `Button close X` to match `.modal__close`)
