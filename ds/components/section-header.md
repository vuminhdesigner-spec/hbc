# Section header

## Purpose

Section header is the top block of a section card: an icon, a title, a line
explaining what the section is for, an action, and a rule separating it from the
body. It makes a card self-describing so a reader can scan a grid of them.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) for the first instances; `Thông tin chi tiết` `10287:10813` re-read 2026-09-30 in `TpwqqNqhnFgycttdngXmFA` |
| Instance | `Section header` in `Thông tin chi tiết`, node `10287:10813` — nine instances |
| Second instance | `Section header` in `Chi tiết dự án`, node `10553:25814` — four instances |
| Third instance | `Section header` in `Chủ đầu tư`, node `10840:73734` — six instances, and the first where `Edit` is **not** true everywhere |
| Fourth instance | `Section header` in `Chi tiết dự án`, component `13314:69886` — five instances, and the first to use **`Type=Horizontal`** |
| Reviewed via | Figma REST API, 2026-08-04; re-read 2026-08-12 and 2026-09-09 (file version `2397050114382028962`) |

## Component properties

The instances expose a property set this contract was written without. Read from
`Chi tiết dự án` on 2026-08-12; all four instances there are identical:

| Property | Value in both frames | Notes |
|---|---|---|
| `Type` | `Vertical`, and **`Horizontal` since 2026-09-09** | Both values are now drawn. `Chi tiết dự án` (`13314:69886`) flipped all five of its instances to `Horizontal` — icon and text on ONE row, the action trailing them — where they were `Vertical` before. See *The two types* below. |
| `Supporting text` | `true` | The purpose line. **The description slot the project frames need already exists**; it is `.section-header__supporting`. |
| `Divider` | `true` \| `false` | The 1px rule. `false` = omit the `<hr class="section-header__divider">` from the markup (no hidden state, no CSS). |
| `Edit` | `true` in the first two frames | The trailing action slot. **`Chủ đầu tư` sets it `false` on two of six sections** — see below. |
| `Icon Button` | `false` in the first two frames | A second trailing button. In `Chủ đầu tư` two sections use this slot instead of `Edit`, both holding `chevron_right`. |
| `Badge` | `false` | A `design-system/components/badge.md` slot between icon and action, hidden everywhere. **Gone from the set** in the 2026-09-09 read. |

The 2026-09-09 read also renames the action properties: `Edit` / `Icon Button`
are one `Action Group` boolean plus a `Slot` instance swap. Nothing rendered
changes with it — the slot still resolves to one 40px icon
button, and the rule below still holds: the **icon** decides the meaning, not the
property's name.

### The two types

| | `Vertical` (default) | `Horizontal` (2026-09-09) |
|---|---|---|
| Row 1 | the mark and the action, `space-between` | the mark, then the text block, then the action |
| Row 2 | the text block, full width | — |
| Gaps | 16px in the action bar, 4px in the text block | 12px mark→text, 16px text→action, 4px in the text block |
| Content height | two rows (40px + text) | one 48px row |
| Class | the base markup | the same markup plus `.section-header__lead` around mark + text |

Both types keep `.section-header__bar` as the row and its `space-between`, so the
action trails in either. The variant is a **wrapper, not a second component**:
a screen that flips it moves two elements into `.section-header__lead` and
changes nothing else.

Which type a frame uses is the frame's decision, and the package now draws both —
`Chi tiết dự án` and the `du-an/ho-so/chi-tiet.html` rail are horizontal; the two
project wizards are vertical.

### The action is per instance, and "no action" is a real state

`Chủ đầu tư` (`10840:73734`) is the first frame where a section header renders
**no trailing button at all**: `Thông tin chủ đầu tư` and `Thông tin kinh doanh`
hide every child of their `Action Group`, while the other four show
`chevron_right`. Read 2026-08-12.

Two consequences:

- A screen must carry the action **per section**, not assume every card has one.
  `screens/du-an/chi-tiet.js` assumes `edit` everywhere, which is true
  of its own frame and not of this component.
- Which property carries the button is not meaningful. `Edit=true` and
  `Icon Button=true` both resolve to one 40px icon button; in this
  frame two sections use each. The **icon** decides the meaning (below), not the
  boolean's name.

That same frame was read twice on 2026-08-12, four hours apart, and two headers
lost their button between reads. Treat the action set as unstable until a
designer confirms it, and re-read before changing it.

Nothing here is new *visually*: both frames render icon + action, title +
supporting line, divider. The properties are recorded so a future instance that
flips one is recognised as a variant rather than a redesign.

## Anatomy

20px gap between the content block and the divider; 16px inside the content
block:

1. **Action bar** — a 40px `design-system/components/featured-icon.md` on the left, the
   trailing action on the right, 16px gap, `space-between`. In `Type=Horizontal`
   the text block joins this row, 12px after the mark, and the bar is 48px tall.
   The mark may also be an `Avatar` instead of a `Featured icon` — the first card
   of `Chi tiết dự án` carries the project photo at the same 40px box
   (`.section-header__avatar` in that screen's CSS). A Featured icon here takes
   `featured-icon--ring` (frame `10287:10813`).
2. **Text block** (4px gap) — title `18/28` Semibold `Gray/900`, supporting line
   `14/20` Regular `Gray/500`. Its own row in `Vertical`; inside the action bar in
   `Horizontal`.
3. **Divider** — 1px `--utui-color-gray-200`, full card width.

## The trailing action is contractual

The icon states **where editing happens**, and is not chosen for balance:

| Icon | Meaning |
|---|---|
| `edit` | The section is editable in place — it opens a form dialog carrying **that section's fields only**, and the page does not change |
| `arrow_forward` | The section opens its drawer (`Xem tất cả`) |
| `chevron_right` | The section opens its own sub-page |
| A glyph **+ a label** (`settings`, `add`) | **A card-scoped action on the card's own form** — it configures or adds to the card the header names, and nothing else. Added 2026-09-21; see below |
| none | No action authored for this section |

Mixing these arbitrarily makes the grid unreadable — a user learns the rule once
and then relies on it. See `design-system/patterns/item-detail.md`.

A section with no action is the same promise read the other way: this group has no
way to change it from here. Do not add `edit` to balance a row.

### The labelled action is scoped to its own card (2026-09-21)

The slot took an icon button and nothing else until a card appeared whose header
has something to set: `Thông tin khác` on `screens/doi-tac/danh-sach.html` `#createDrawer` step 4,
where the card's fields are a **configured** set and the user decides which of
them the form draws (`design-system/components/attribute-field.md`). Its label is
`Thiết lập thông tin` and its glyph is `settings`.

What the third form owes, so it does not become a general-purpose slot:

- It is a **labelled `.button`, not an icon button.** `edit` and
  `chevron_right` are learnable because they are two glyphs with two meanings;
  a third bare glyph would make the row a guess. The label says what the action
  does — `Thiết lập thông tin`.
- It is **secondary**, never `.button--primary`. The view it sits on already has
  a primary — a step's `Lưu`, a page's `Sửa thông tin` — and two filled buttons
  on one view stop saying which one finishes the task.
- It acts **on this card only**. A control that adds a record, navigates, or
  touches anything outside the section it is drawn in is not this action; that
  is a page-level action and belongs in `design-system/components/page-header.md`.
- It does **not** replace `edit`. A card that is both editable in place and
  configurable would need two controls in one slot, which the row does not draw;
  no consumer has both today, and one that does is a question for this contract
  rather than a thing to squeeze in.
- On a **read** surface the slot keeps `edit` / `chevron_right`. This form is for
  a card that IS a form — see the two consumers: the create wizard's step 4
  header, and the same control drawn under the fields in the detail screen's
  section dialog, where there is no card header to put it in.

### `edit` opens a section-scoped form dialog (2026-08-14)

Until this date the icon was a promise with nothing behind it: every `edit` in the
package answered with a notification, which is what a flow audit recorded as four dead
actions on one screen. The behaviour is now specified, and a screen that draws the
icon owes it:

- The control is a `<button>` — it opens a dialog over the same page, so unlike
  `chevron_right` (below) it must **not** be an `<a href>`.
- It opens `design-system/components/modal.md` at its **form size**, whose title, supporting line,
  featured icon and tone are the section header's own, so the dialog reads as that
  card rather than as a generic editor.
- The dialog carries **only that section's fields**, in the frame's source order,
  through `design-system/components/inputs.md`. Values are seeded from the record on every
  open, so a discarded edit never survives to the next one.
- It is **not** a shortcut to the record's full edit page. A page-level edit action
  and a card's `edit` are different scopes. `du-an/chi-tiet` has no page-level edit
  action (no màn chỉnh sửa, removed 2026-09-28) — only the section pencils, one per
  card.
- Rows a section shows but does not own — a system-written audit trail
  (`Ngày tạo`, `Người tạo`, `Ngày cập nhật`, `Người cập nhật`) — stay read-only on
  the card and must not appear in the dialog. `edit` means "this group is
  editable", not "every row in it is".

First and so far only implementation: the cards of
`screens/du-an/chi-tiet.js`, which is also the only screen in the package that
draws `edit` at all, so no other screen owes this behaviour today. The other
consumer until 2026-08-19 was `project-investor.js`, whose six sections carried
`chevron_right` or nothing; it was deleted with the record's `Chủ đầu tư` tab.
The nine-instance `Thông tin chi tiết` frame in the Source table above is the one
to check first if that screen is built.

### `chevron_right` is a navigation, so it is a link (2026-08-14)

Once the sub-page a `chevron_right` promises actually exists, the control is an
`<a href>` — not a `<button>` with a JS `location` assignment — because it
navigates and must be openable in a new tab and reachable by the browser's own
affordances. Same reading as the section tab bar and `.page-header__back`.
`.section-action` (composed with `.button`, so Secondary gray — a 40px icon-only square; 2026-09-30, frame `10287:10813`) and `.section-more` are the appearance; the element follows the
job, and `section-card.css` clears the anchor underline on both.

The card's footer link (`Xem thêm N+`, `.section-more`) points at **the same
destination** as the icon when both are drawn. They are one affordance offered
twice, not two, and they must never diverge.

**No live instance since 2026-08-19.** The only one was the `Địa chỉ` section of
`screens/project-investor.js` → `investor-address.html`, and both screens were
deleted with the record's `Chủ đầu tư` tab. The rule stands for the next sub-page
anyone builds, and so does its counterpart: a `chevron_right` section whose page
does not exist keeps the honest "not in this demo" notification, because a link to a
page that does not exist is worse than a notification that says so.

**When the group has no sub-page at all, both controls open a dialog.** That is
the live case today: on `project-overview`, the `Chủ đầu tư` card's `edit` pencil
and its `Xem thêm 10+` footer link are both `<button>`s opening the same
`#investorModal`, so the icon and the link resolve to one destination exactly as
they did when that destination was a page. A footer link is not inherently a
navigation — it is whatever its section's group resolves to.

## Content rules

The supporting line states the section's **purpose**, not its contents. "Manage,
search and sync data across the system" is correct; "9 fields" is not — that
duplicates what the body already shows.

## Usage

Use inside a section card in `design-system/patterns/item-detail.md`. One header per card.

**Flat on a drawer/form surface, no card** (added 2026-09-30): a titled block whose body is already its own bordered surface (`.table-panel`) sits directly on the drawer with `Divider = false`. First consumer: `screens/doi-tac/danh-sach.html` `#createDrawer` steps 2-3 (`.create-group`). A step whose only group has the step's own name (steps 1, 4) omits the section header — the drawer's supporting line ("Bước n/N · <step title>") already names it (USER DECISION 2026-09-30).

Do not use it as a page heading — that is `design-system/components/page-header.md`.

`.section-card--form` (`design-system/components/section-card.md` § `--form`) composes
just `.section-header__bar` + `.section-header__lead` — never the divider or
the supporting line, and never the outer `.section-header`/`.section-header__content`
wrappers, since there is no second row to gap against a divider that is not
drawn. That is markup omission, not a hidden state: a form section simply has
no purpose line and no rule under it.

## Accessibility

- The title is an `<h2>` when the page title is the `<h1>`; the card references
  it with `aria-labelledby`.
- The trailing action needs a name including the section title ("Sửa Thông tin
  chung") — a grid shows many identical icons.
- The divider is presentational and must not be announced.
- Under `pointer: coarse` both navigations carry a 44px hit area, added as a
  `::after` in `styles/responsive.css` on 2026-08-14 — the icon keeps its
  drawn 40px box and the footer link keeps its text width, because growing either
  box would re-space a card whose padding and gap are the product's 20px rung
  (the frame pins 24; see `styles/section-card.css`). On a
  section whose sub-page exists these are the only way into it on a touch device.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.section-card`, `.section-header*` (`.section-header__lead` carries `Type=Horizontal`), `.section-action`, `.section-more` and body classes in `styles/section-card.css` |
| Card grid | `.section-grid` and its `--wide` / `--full` spans, also in `styles/section-card.css` since 2026-08-12; tier collapses in `styles/responsive.css`. The grid is `design-system/patterns/item-detail.md`'s, not this component's — it lives here because two screens now compose on it and a screen bundle is the wrong home for a shared rule. |
| Examples | `screens/du-an/chi-tiet.html` (five cards; the `Chủ đầu tư` card's pencil and its `Xem thêm 10+` link both open `#investorModal`). `screens/du-an/danh-sach.html` `#createDrawer` (`Vị trí dự án`, no divider), `screens/du-an/ho-so/chi-tiet.html` and `index.html`. `screens/item-detail.html` and `screens/project-investor.html` were two more until they were deleted; `screens/du-an/chinh-sua.html` was a third, removed 2026-09-28 |

## Known Gaps

- The action bar's `Action Group` holds at most one *visible* button in every
  instance; the other two slots are authored and hidden everywhere, so what they
  would do is unspecified. Since `Chủ đầu tư` it can also hold **none**.
- **The purpose line is clamped to one line in `Chủ đầu tư`** (`maxLines: 1`,
  `textTruncation: ENDING`) on all six instances, so three of its cards show a
  half-sentence with an ellipsis and no way to read the rest. The implementation
  **wrapped** instead, and this entry asked for a designer call: either the
  supporting text is short enough to fit one line (rewrite the copy) or it wraps
  (change the frames).

  **Called 2026-09-16 — it clamps.** `.section-header__supporting` is one line
  with an ellipsis, matching all three frames (`10282:8548` draws
  `Liên hệ, giao dịch và quản lý thô…` in a 365px card; the same string fits
  whole in the 750px `Địa chỉ` card, so the rule is uniform and the card's width
  decides whether it bites). Two consequences the decision carries with it, and
  neither is optional:
  - **The copy is now load-bearing.** A purpose line written long and trimmed
    here reads as a half-sentence; the first clause has to carry the meaning on
    its own. That is a writing obligation on every consumer, not something this
    rule can enforce — see the `ux-writing` skill.
  - **The full string stays in the accessibility tree.** `text-overflow` is a
    visual clip, so a screen reader announces the whole line and a sighted reader
    does not. `design-system/components/tooltip.md` now exists but is not wired
    here — needs decision.
- **The card carries no border in either source frame** — only `shadow-xs`.
  `.section-card` adds `1px solid --app-border`. Pre-existing, consistent across
  the package, and a deviation from both frames; needs a designer call rather than
  a silent removal.
- ~~**`Type=Vertical` is the only variant used.**~~ **Closed 2026-09-09**:
  `Chi tiết dự án` draws `Type=Horizontal` on all five of its headers, so the
  anatomy is known and implemented (`.section-header__lead`). What is still open
  is *when* a frame should pick which — the two types now differ per screen with
  no stated rule, and a grid of cards that mixed them would look like a mistake.
- Hover and focus treatment for the action is supplied by the implementation,
  not authored in Figma.
- The card's body shapes (data list, entity list, empty state)
  are implemented in the same stylesheet but are arguably their own components;
  `Data viewer` and `Empty state` already have separate contracts.

## Body geometry

Measured from the source and verified against the implementation 2026-08-04:

| Body | Spec |
|---|---|
| Entity list | **Moved out 2026-09-16 — it is `design-system/components/entity-row.md` now.** This row recorded that the body had no consumer and that `12035:58097` disagreed with its 56px mark and 14/20 Semibold name, and left it alone on the rule that a shared component is not restyled from ONE new instance. A second independent frame (`10282:8548`, the `Người liên hệ` card) then agreed with the first, which is what the note below this table said such a disagreement decides. The body became a component, took the newer geometry (40px mark, text-md/Medium name, one supporting line, rows 20px apart) and now has two consumers on `screens/doi-tac/chi-tiet.html`. The rules left `styles/section-card.css` for `styles/entity-row.css` with it |
| Data list | see `design-system/components/data-viewer.md`, including the `.data-split` two-list body |
| Attachment list | see `design-system/components/attachment-list.md` |
| Empty state | see `design-system/components/empty-state.md` |

### Address tiles retired (2026-09-30)

`.tile*` left the package: `Địa chỉ` is an `entity-row` now (`design-system/components/entity-row.md`), which closes the tile-label weight, tile-value colour and green-pin disagreements recorded here before.
