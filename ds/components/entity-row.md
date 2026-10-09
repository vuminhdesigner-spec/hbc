# Entity Row

## Purpose

Entity Row is the repeated row that lists **other named things attached to a
record** — its contacts, its bank accounts, its related companies. One row is one
entity: an identity mark, the entity's name, and one line of supporting
detail.

It is a *list of subjects*, which is what separates it from its neighbours in the
same card. `design-system/components/data-viewer.md` lists **fields of one
record** as label/value pairs; this lists several records, each with a name of its
own. If the rows have no identity of their own, they are data-viewer rows.

## Source

| Item | Value |
|---|---|
| Figma file | MDM (Un-Official) (`TpwqqNqhnFgycttdngXmFA`) |
| Frame | `Section` — the `Người liên hệ` card — node `10282:8548`, inside `10287:10813` |
| Rows read | 40px mark, 12px gap, name over **one** ellipsised supporting line, rows 20px apart (user decision 2026-09-30; the frame draws 16) |
| Reviewed via | Figma MCP server, re-read 2026-09-30 (first read 2026-09-16 drew 64px mark / 16px gap / two lines / 24px apart) |
| Earlier frames | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`): `11420:69164`, which draws a **56px** mark and a 14/20 Semibold name; `12035:58097` (`Chủ đầu tư`, 2026-08-19), which draws **64px** over text-md/Medium |

**Which frame wins, and why it changed.** The rules lived in
`styles/section-card.css` against the two MDM - V2 frames until 2026-09-16.
`design-system/components/section-header.md` had already recorded that
`12035:58097` disagreed with them about exactly two things — the mark's size and
the name's type — and left the implementation alone under the rule that *a shared
component is not restyled from one new instance*, while saying in the same breath
that disagreements like it "are the kind that decides whether these bodies become
real components". Node `10282:8548` is a second, independent frame that agrees
with the newer one. Two frames against one is what that sentence was waiting for,
so the body was promoted to this contract and took the newer geometry with it.

## Anatomy

A row is 44px tall (24 name + 20 supporting line). Name and supporting line are each
one line, nowrap with ellipsis; the full string stays in the accessibility tree and,
when clipped, in a tooltip (`[data-tooltip-overflow]`, `tooltip.md`).

| Part | Class | Spec |
|---|---|---|
| Row | `.entity-row` | flex, `align-items: flex-start`, **12px** gap, `min-width: 0` |
| Mark | `.entity-row__mark` | **40px** circle (`--utui-avatar-size-md`), `neutral-100` ground, monogram in `neutral-600` at text-sm/Semibold |
| Logo | `.entity-row__logo` | Optional image, absolutely positioned over the monogram, `object-fit: cover`, full bleed |
| Body | `.entity-row__body` | grid, no gap, `min-width: 0` |
| Name | `.entity-row__name` | **Text md/Medium** (16/24), `text/primary`. **One line**, nowrap + ellipsis |
| Supporting | `.entity-row__meta` | **Text sm/Regular** (14/20), `text/tertiary`. **One line**, nowrap + ellipsis |
| List | `.entity-list` | grid, rows **16px** apart |
| Row as control | `.entity-row--action` | The same row on a `<button>` or `<a>`. Button chrome reset, `--utui-radius-md`, 8px of block padding given back with a negative `margin-block` so the list keeps its 20px pitch; inline padding is reset to 0 so the mark stays level with the section header's icon. Hover paints `bg/surface-hover` and underlines the name; focus is `base.css`'s shared ring |

**The mark carries an identity, not a glyph.** A monogram, or the entity's own
photograph or logo laid over it. Exception: a row that has no identity of its own,
only a kind (an address), puts a `.featured-icon.featured-icon--neutral` (40px,
20px glyph, `neutral-100` disc) in the mark slot directly, without
`.entity-row__mark` — the same 40px, so the row geometry is unchanged. It is
`aria-hidden`; the kind is the row's name.

**The logo covers the monogram rather than replacing it**, so a record whose
image is missing or fails to load still shows an identity mark instead of an
empty disc. `cover` with no padding and no base colour is deliberate:
`11420:69164` draws these as full-bleed brand discs and the assets are square
brand tiles whose own background *is* the disc. A transparent-artwork logo would
need `contain` over a white base — that is per-asset, so it belongs on a modifier
rather than in the base rule.

## Content Slots

| Slot | Holds |
|---|---|
| Name | What the entity is called, one line. Never a field label. Carries `data-tooltip-overflow` |
| Supporting | One line joining what the entity **is to this record** with its detail, by `·` — `Đại diện nhà cung cấp · Giám đốc kinh doanh`, `19035… · <holder>`, a full address. Carries `data-tooltip-overflow` |

The frame's own rows read a short name over one supporting line. Consumers with
more facts join them into the one line with `·` rather than adding lines; what
does not fit is cut by the ellipsis, shown in full by the tooltip on hover (and focus,
on an `--action` row), and lives in the drawer or dialog the row opens — or, for a
static row, the card's own drawer.

## States

| State | Behaviour |
|---|---|
| Default | Mark, name, one supporting line |
| No image | The monogram is the mark. This is the default, not a fallback state to author |
| Broken image | Same as no image — the monogram is underneath, so nothing renders empty |
| Hover / focus (`--action` only) | Ground goes to `bg/surface-hover`, the **name** underlines. The name carries the affordance as well as the ground, so the row says which part of it is the subject of the action |
| Empty list | **Not this component's.** A section with no entities renders the card's empty-state body — `design-system/components/empty-state.md` — and keeps its card and anchor pill |

## Tokens

| Role | Token |
|---|---|
| Mark size | `--utui-avatar-size-md` (40px) |
| Mark ground / monogram | `--utui-color-neutral-100` / `--utui-color-neutral-600` |
| Row gap | `--utui-spacing-03` (12px) |
| Body gap | none |
| List gap | `--utui-spacing-05` (20px) |
| Name | `--utui-font-size-text-md`, `--utui-font-weight-medium`, `--utui-line-height-text-md`, `--utui-color-gray-900` |
| Supporting | `--utui-font-size-text-sm`, `--utui-font-weight-regular`, `--utui-line-height-text-sm`, `--utui-color-gray-500` |

No new token. `text/primary` `#101828` and `text/tertiary` `#667085` are the gray
ramp entries this package already resolves those roles through.

## Usage

Use it for contacts, bank accounts, related organisations and people — anything
where the row's subject has a name of its own.

Do not use it for a record's own fields (`data-viewer.md`), for files
(`attachment-list.md`), or for a table that needs columns or sorting
(`data-table.md`).

**CTA: the row itself, one action.** When a row leads somewhere — open the
entity's view or edit dialog, or navigate to it — the whole row becomes that
control via `.entity-row--action` (hover + click, see States). Every row of a card
takes it or none does. The row has no separate trailing button: a second
per-row action (delete, call, …) means the list has outgrown this component and
belongs in the section's drawer (`design-system/components/drawer.md`), whose
`.data-table` carries the per-row actions this row does not.

**The list is not paginated and does not scroll, and it is not the record's
whole collection.** It shows the first N entities of the section's drawer list,
in list order — see `design-system/patterns/item-detail.md`'s sync rule. A card
that holds more entities than it shows ends with the section's `Xem tất cả`
footer link, which belongs to `design-system/patterns/item-detail.md`, not here.

## Accessibility

- The mark is decorative (`aria-hidden="true"`): the name beside it already says
  who the row is. A monogram read aloud is noise.
- A logo `<img>` inside the mark takes `alt=""` for the same reason.
- The name is text, not a heading — the rows sit under the section's `h2` and a
  list of `h3`s would put every contact in the document outline.
- The supporting line is its own element, not part of the name string.
- When a row becomes actionable, the control wraps the row's content and takes
  the accessible name — do not make the mark the only target. `.entity-row--action`
  is that control: `<button>` when it opens a dialog on the same screen, `<a>` when
  it navigates. The name says what opens AND for whom
  (`aria-label="Xem chi tiết Nguyễn Thị Thanh Tâm"`), because the row's own text is
  three separate elements and a control named by all of them reads as a paragraph.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `styles/entity-row.css` |
| Contract | `design-system/components/entity-row.md` |
| Consumers | `screens/doi-tac/chi-tiet.html` — `Người liên hệ` (opens the contact view dialog), `Tài khoản ngân hàng` and `Địa chỉ` (open edit) are `.entity-row--action`; `Địa chỉ` carries a `featured-icon--neutral` mark |
| Composed by | `design-system/patterns/item-detail.md`, as one of the section card's body shapes |

## Known Gaps

- **`Trạng thái` is not rendered on a read view, by product decision
  (2026-09-16).** MDM-1166 AC1.2 gives both a contact and a bank account a status,
  and both lists on `screens/doi-tac/chi-tiet.html` carried a state badge until
  this contract was written. The frame draws no badge; the decision was to follow
  it rather than add a slot, so the field is reached on the update screen and the
  read view is taken to list the record's current entities. **This is a decision,
  not an oversight** — an inactive entity is currently indistinguishable here, and
  if that becomes a problem the fix is the slot below, not a badge improvised into
  a screen.
- **If that decision is revisited, a trailing slot collides at `md`.** Measured
  2026-09-16 at 768: a third flex child with `margin-inline-start: auto` leaves ~125px for
  body and badge together in a span-3 card, and `.entity-row__body`'s
  `min-width: 0` lets the supporting lines paint straight through it. A wrapping
  line on the name's row degrades instead. Whoever closes the gap above should
  start from that measurement.
- ~~**The section header's trailing action differs from this package's.**~~
  **CLOSED 2026-09-29 (MDM-1209).** The partner record's three collection
  cards drew a pencil while their sub-pages existed, against the frame's own
  arrow; retiring the sub-pages into drawers closed the divergence from the
  other side — `Địa chỉ`, `Tài khoản ngân hàng` and `Người liên hệ` all draw
  `arrow_forward` now, matching the frame exactly (`item-detail.md`'s
  drawer/hand-over rule).
- **~~No row is interactive anywhere yet.~~ CLOSED 2026-09-16 by
  `.entity-row--action`.** The frame still draws no interactive row, so the two
  states are **authored, not evidenced**: they are the treatment the listing
  screens already give a clickable row (`bg/surface-hover` plus an underlined
  name), taken here rather than invented per screen, which is what this gap asked
  for. `screens/doi-tac/chi-tiet.html`'s `Người liên hệ` rows are the first
  consumer — each opens that contact's read-only dialog; `Tài khoản ngân hàng`
  followed (2026-09-29), opening its edit dialog; `Địa chỉ` too (2026-09-30). A designer may still
  overrule the two values; what must not happen again is a screen deciding them.
- **The control's own hit area is the card's content width, not the row's.** The
  usual inline-padding-plus-negative-inline-margin construction makes the row
  8px wider than its grid track on each side, which is page overflow in a card
  grid. The padding is on the block axis only; see `styles/entity-row.css`.
- **No logo/photo asset for bank rows (2026-09-30).** The frame draws a bank logo
  in the 40px mark; `ds/assets/` holds none, so bank rows keep the monogram
  (`TCB`, `VCB`). `.entity-row__logo` is ready for the image once the asset exists.
- **Bank row is not the frame's exact text.** The frame draws a short brand name
  (`Techcombank`) over the full legal name; the record has only the full name, so
  name = full name and the one supporting line = account number · holder. A short
  name field would be new data — needs a product answer.
