# Attachment

## Purpose

Attachment is the card that shows **one** document attached to a record: a section
header naming it, a body that renders it, and a footer of the things you can do to
it. It is the frame around a document, not the document — its body is one
`design-system/components/file-upload.md` instance and the three Figma `state`
values are that component's three states.

It is **not** `design-system/components/attachment-list.md`. That contract is a
card list of the files attached to a record, read off the same Untitled UI
`File upload` set with its dropzone switched off; it lists, this one shows. Two
contracts, two stylesheets, no shared selector — see **Naming** below, because the
two names are close enough that the collision was real and had to be resolved.

It is also not `file-upload` with a header bolted on. `file-upload` is a surface
that accepts a file and has no chrome, no actions of its own and no idea how tall
it is. This is the chrome: the card, the name, the disclosure, the pager and the
actions.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`) |
| Component | `Attachment`, node `10964:9598` |
| Instance geometry | 605.5 x 708 expanded; the collapsed variant is a 40 x 40 hug |
| Body | Untitled UI `File upload` — `_File upload base` in `Empty`, the rendered document in `File Support`, an empty state in `Not Support` |
| Product instance | MDM V2 (`tS8dUB2qWLc28gZbtj8IIL`), section `10769:44445` — the left column of `Tải lên hồ sơ`, drawn **bare** in all four frames |
| Reviewed via | Figma MCP, 2026-08-26; re-read the same day after the node's collapsed variant changed — see **History** |

Only `File Support` has a drawn collapsed variant. `collapse` is orthogonal in the
component definition, so it is built for all three states and nothing about it
reads the body.

## Naming

The block is `.attachment-pane`, not `.attachment`, and the reason is not taste.
`styles/attachment-list.css` already owns `.attachment` — as the class of one
**item** in its list, not of the list itself — plus `.attachment__body`,
`.attachment__name` and `.attachment__meta`. Two meanings for `.attachment` in one
cascade is a defect waiting for the first screen that renders both.

The token prefix is still `--utui-attachment-*`, which is free: `attachment-list`
owns no tokens at all and reuses the data table's file chip.

So the pairs are:

| | Contract | Stylesheet | Block | Tokens |
|---|---|---|---|---|
| One attachment, shown | `attachment.md` | `styles/attachment.css` | `.attachment-pane` | `--utui-attachment-*` |
| Many attachments, listed | `attachment-list.md` | `styles/attachment-list.css` | `.attachment-list` / `.attachment` | none |

## Variants

Four props in the Figma component. Two are classes here, two are markup.

> **RE-READ 2026-09-22 — the variant matrix is not the one below.** `_Attachment`
> (`10964:9598`) today publishes **`State` x `Collapse` x `Multi Files`**:
> `State=Empty|File Support|Not Support`, `Collapse=False|True`, and
> **`Multi Files=False|True`**, which this file does not record at all. `chevron`
> and `edit` do not appear as variant axes any more — they may survive as boolean
> component properties (a variant listing would not show those), so this is a
> question for the designer rather than a finding that they are gone.
>
> What the two `Multi Files` members actually differ by, read off
> `10964:9616` and `11709:11236`: the footer's FIRST action. `False` draws
> `Đổi tài liệu` — replace this document; `True` draws `Tải lên` — add another.
> `Tải xuống` is unchanged, and **the pager is drawn on both**.
>
> That last fact matters for the open question in Known Gaps below. The pager
> being present when there is only one file does **not** settle whether it moves
> between the record's attachments or the pages of one document — it only leans
> that way, since the `Multi Files` footer exists to add files and something has
> to move between them. Still unanswered; do not build on either reading.

| Prop | Values | Default | How it is expressed |
|---|---|---|---|
| `state` | `Empty` \| `File Support` \| `Not Support` | `Empty` | **Not a class on this component.** It is the body's state — `file-upload`'s A / B / C. |
| `collapse` | boolean | `false` | `.attachment-pane.is-collapsed`, set by `scripts/attachment.js` |
| `chevron` | boolean | `true` | the presence of `.attachment-pane__pager` in the footer |
| `edit` | boolean | `true` | the presence of the `Đổi tài liệu` button in the footer |

### Why `state` is not a class here

Because nothing outside the body varies with it except two strings the consumer
owns:

- the header's supporting line — the file name in `File Support` and
  `Not Support`, the consumer's own "nothing attached" string in `Empty`;
- whether the footer is present at all — it is not, in `Empty`, because there is
  nothing to swap and nothing to download.

Adding `.attachment-pane--empty` would put a second writer on facts
`file-upload`'s own `.is-filled` / `.is-unsupported` already carry, and two
writers on one state is how the two disagree. Do not add one.

### The card, and `--bare`

`.attachment-pane` is a white card: `--utui-radius-xl`, `--utui-shadow-md`, 24px
of padding. That is what node `10964:9598` draws and it is the default.

`.attachment-pane--bare` removes the surface and the padding and keeps the 24px
rhythm between the header, the body and the footer.

**It is a variant, not a screen that was wrong.** Two Figma sources disagree and
both are drawn: the DS node draws the card, and all four frames of the product
section `10769:44445` draw this column bare with its head above it in the page.
The DS node is the component and the product section is a consumer, so the card is
the default and the bare form is the variant — with its evidence named, which is
what makes it a variant rather than a local override.

The reason the consumer needs it is compositional rather than decorative: the pane
shares a row with two white `--utui-shadow-xl` panels, and a third raised white
card in that row flattens the hierarchy those frames draw. The padding goes with
the surface because without a card there is nothing to be inset from — the header
aligns to the column edge, which is what puts the pane's leading edge on the page
gutter beside everything else.

If a designer rules that the product section should adopt the card, deleting this
variant is a one-line change in one screen. Until then, do not "fix" the bare
consumer.

## Anatomy

Three rows in a grid: `auto` / `minmax(0, 1fr)` / `auto`. The header and the footer
size themselves, the body takes the rest. So the body absorbs whatever height the
consumer gives the card, the header never scrolls away from the control that closes
it, and the actions stay pinned under the surface they act on.

**The card has no intrinsic size.** The frame's instance is 605.5 x 708 and both
figures are composition — whoever places it says how wide and how tall. There is
no width token, deliberately: a third figure would only be something for the two
consumers to disagree with.

### 1. Section header — `.attachment-pane__header`

The frame's `Section header`, whose only row while the pane is open is the Action
Bar. **Two gaps, and they are different:** 16px between the Action Bar's leading
group and its trailing action, 12px inside that group.

- **`.attachment-pane__lead`** — flex-fills, `min-width: 0`.
  - **`.attachment-pane__icon`** — a 40px `design-system/components/featured-icon.md`
    composed in the markup as `--success --ring` with an `attachment` glyph
    (Green/100 disc, Green/600 glyph, Green/50 halo — exactly that tone). The
    halo is **6px**, this component's own value, not the shared 8px ladder step.
  - **`.attachment-pane__heading`** — 4px apart:
    - **`.attachment-pane__title`** — `Tài liệu đính kèm`, text-lg 18/28 semibold.
    - **`.attachment-pane__file`** — text-sm 14/20 regular, Gray/500, **one line
      with an ellipsis**. A file name has no spaces to break at, and the header is
      a fixed row above a bounded body: a name that wrapped it to two lines would
      take that height off the document. The full string stays in the DOM.
- **`.attachment-pane__collapse`** — the disclosure. See below.

The trailing action is pushed out by the leading group taking the free width, not
by `justify-content: space-between`: with the button absent, a spread would push
the icon and the title apart instead.

### 2. Body — `.attachment-pane__body`

A slot and the box around it. One explicit `minmax(0, 1fr)` row for the document
surface; a message that follows it — `.form-field__error` on a pane refusing a
save, per `design-system/components/file-upload.md`'s Error row — takes an implicit
auto row 8px below, which is the same rhythm a `.form-field` gives a control and
its error.

**The component owns this wrapper**, which is a change from what `file-upload.md`
described: the error's column wrapper used to be the consumer's own box
(`.upload-drop` on `du-an/ho-so/tai-len`). A component with a header and a footer
has no reason to make every consumer re-author the box between them.

What goes in the slot, per `state`:

| `state` | Body |
|---|---|
| `Empty` | `.file-upload` — state A, the dropzone |
| `File Support` | `.file-upload.is-filled` — state B, the rendered document |
| `Not Support` | `.file-upload.is-unsupported` — state C, the "cannot read this format" block |

The `Not Support` illustration is `styles/empty-state.css`'s page-variant text
parts plus one composed `.featured-icon`; the frame's 152 x 118 cloud and loose
dots are decorative art with no exported asset here. That reduction is already
recorded in `empty-state.md` and `file-upload.md` — do not author new illustration
SVG for it.

**One divergence worth stating:** the node's `File Support` body is the document
image filling the region with no grey backing and no rim. `.file-upload` always
carries its Neutral/100 fill and 1px rim, so the package's preview sits inside a
1px frame the node does not draw. Left as-is — removing the rim in this one state
would give `file-upload` a surface that changes with its content, which is a bigger
change than a 1px line is worth.

### 3. Footer — `.attachment-pane__footer`

A wrapping flex row. **Hidden while the pane holds no file** — `hidden` on the row,
not a class, so both buttons leave the tab order and the accessibility tree with
it. `attachment.css` carries the `[hidden]` rule the row's own `display: flex`
would otherwise beat, which is the same UA-cascade trap `.metric-scroller__arrow`,
`.button-group` and `.form-field__error` each already carry a rule for.

- **Leading, when `chevron`** — `.attachment-pane__pager`: two icon-only secondary
  buttons (`.button.attachment-pane__page`), `chevron_left` and `navigate_next`,
  36px square, 8px radius. `margin-inline-end: auto`.
- **Trailing** —
  - when `edit`: `Đổi tài liệu` with an `upload` glyph;
  - always: `Tải xuống` with a `download` glyph.

Both are `.button.button--compact` (36px tall, 12px inline against the node's 14px
— the nearest step on the ladder, and the height is exact).

**The row is `justify-content: flex-end`, not the node's `space-between`.** With
the pager present the two are identical, because the pager carries
`margin-inline-end: auto`. Without it — `chevron=false`, which is the whole point
of the axis — `space-between` throws the two action buttons to opposite ends of a
600px card and two related controls read as two unrelated ones. Measured on the
first consumer before this component existed.

### 4. The disclosure — `.attachment-pane__collapse`

`Thu gọn` with a `chevron_left` glyph. 40px tall, 16px of inline padding, text-sm
semibold, Gray/600, transparent until hover.

**It is authored as a component part rather than composed from
`design-system/components/button.md`, and that is a recorded gap.** The frame draws
Untitled UI's `Buttons/Button` Hierarchy=**Tertiary gray** — no border, no fill, a
gray label. This package does not implement that hierarchy: `.button--tertiary` is
brand-coloured and `.button--link-gray` is label-only with no box. If tertiary gray
is ever added to `button.md`, this part becomes a composition and its rule goes.

The glyph takes `currentColor` and is not tinted separately: the frame draws one
control, and an icon on a different ramp from its own label reads as two things in
a row.

### 5. The collapsed control — `.attachment-pane__expand`

Rendered only while `.is-collapsed`, and at that point it is the whole of the
component: the node's `Collapse=True` variant, a **40 x 40** hug carrying the card's
own white surface, 16px radius and shadow-md around one icon-only tertiary-gray
button — `padding: 10px` on a 20px `chevron_right`, and no text.

The pane itself sheds its surface and its padding in that state and the control
carries them, so the collapsed form is one drawn box rather than a 40px button
floating inside a 24px-padded card. The pane also pins `justify-items: start` and
`align-content: start`, because its consumers stretch it and a grid would otherwise
grow a 40px hug to the full track.

**It replaced a 44px full-height rail on 2026-08-26**, and the reason is worth
keeping: the variant then drew a hug-sized 85px strip with a featured icon above a
word-wrapped title, and 85px could not contain its own drawn children (24px of
padding either side of a 40px featured icon is 88px before the 126 x 40
action-group placeholder in the same row). That was a layout artifact rather than a
specification, so the package chose `--utui-touch-target-min` and rotated the title
to fit it. The variant now draws a 40px icon button — a real size on the button
ladder — so the substitute is retired with the artifact that motivated it.

**What the rail argued for and this keeps:**

- **One control, no decoration inside it.** The collapsed variant draws no featured
  icon now, which is the reading the rail took anyway: a green disc inside a
  control says "attachment", not "press me to open".
- **A real `<button>` in the flow**, reachable by Tab at the position the pane
  occupies. It is the only route back to `Tải xuống`, `Đổi tài liệu` and the
  document.
- **The region's name survives the collapse** — see **Accessibility**. It is no
  longer visible, because the variant draws no label, so it lives on the control's
  accessible name: an `aria-label`, or a `.sr-only-label` span inside the button for
  a consumer that wants the string in the DOM. There is no visible label part and
  this component mints no selector for one.

**40px is under the 44px touch target**, which the rail was not. That is settled
where every other drawn-size control in this package settles it: a
`@media (pointer: coarse)` rung in `styles/responsive.css` grows the box to
`--utui-touch-target-min`. The box grows rather than gaining a pseudo hit area
because nothing width-locks it — both consumers give the collapsed pane an `auto`
column, so a 44px control simply makes a 44px column.

## States

| State | Selector | Notes |
|---|---|---|
| Default | `.attachment-pane` | Card, three rows, expanded. |
| Bare | `.attachment-pane--bare` | Surface and padding removed, rhythm kept. See **The card, and `--bare`**. |
| Collapsed | `.attachment-pane.is-collapsed` | Header, body and footer `display: none`; the 40px control is the only row, unstretched. Higher specificity than `--bare`, so rule order does not matter. |
| Footer absent | `.attachment-pane__footer[hidden]` | The consumer's, while the pane holds no file. |
| Focus | — | The shared `:focus-visible` ring from `styles/base.css`, on the disclosure, the collapsed control, both pager buttons and both actions. Not restated here, so the package has one focus treatment — **with one exception**: the collapsed control composes the ring with its own shadow-md, because `base.css` declares the ring as a bare `box-shadow` at higher specificity and would otherwise flatten the drawn surface at the moment of aim. Same override `styles/select.css` makes. |

Nothing animates, in either direction. The package has no transitions anywhere,
and a column swapping between an `fr` track and a 40px button has nothing to
interpolate — which is also why there is no `.is-ready` gate of the kind
`.metric-region` needs.

## Collapse — the obligations

The `collapse` axis hides a region containing focusable controls, so it inherits
the obligation set `design-system/components/toggle.md` states for the same problem.
Five answers, and each is one answer rather than a per-consumer choice.

### 1. The region leaves the tree, not just the view

`display: none` on the header, the body and the footer. The dropzone, both
triggers, the preview's `role="region"` scroll viewport, the pager and both actions
leave the tab order and the accessibility tree together. There is no animation to
keep any of them in the box model for, which is simpler than a clipped-and-`inert`
disclosure panel.

That leaves **exactly one trigger rendered per state** — `Thu gọn` while the pane
is open, the 40px control while it is shut — and both carry `aria-expanded` for the
same panel.

### 2. Focus is rescued, and it is rescued conditionally

A press always moves focus, because in both directions the control that was
pressed stops being rendered, and a focused element that stops being rendered
drops focus to `<body>` — after which the next Tab restarts past the whole
navigation column. Focus goes to the control that replaces it, in the same task,
so it never passes through `<body>` at all.

A **programmatic** collapse or expand moves focus only when focus was actually
inside the pane. A pointer user who folds the pane from elsewhere on the page must
not have focus yanked into it — the same conditional `toggle.md` states and the
same one `file-upload.md`'s empty → filled hand-off follows. `scripts/attachment.js`
takes `{ focus: true | false }` for the two callers that know better than the
default.

### The two options `collapse()` / `expand()` take

`OmeuAttachment.get(pane).collapse(options)` and `.expand(options)` accept one
object. Both keys default to the behaviour a caller gets by passing nothing, so a
consumer only names the one it needs.

| Option | Values | Default | Effect |
|---|---|---|---|
| `focus` | `true` \| `false` \| omitted | omitted | `true` — always move focus to the control that replaces the one that went away; the two click handlers pass this, because a press always un-renders its own trigger. `false` — never move it; for a caller that is about to place focus itself. Omitted — move it **only if focus was inside the pane**, which is obligation 2 above. |
| `persist` | `true` \| `false` | `true` | `false` applies the class, updates both triggers' `aria-expanded`, moves focus under the rule above and dispatches `attachment:toggle` — but does **not** write `sessionStorage`. **The pane still opens or shuts; only the memory of it is suppressed.** |

**Why `persist: false` exists.** The stored value answers one question — *what
posture did the **user** put this pane in* — and a system-driven call is not an
answer to it. `screens/du-an/ho-so/tai-len` is the case that produced the option: a
save refused for a missing document calls `expand()` so the dropzone is visible and
its live region can announce (obligation 4 and `file-upload.md`), and until
2026-08-26 that wrote `collapsed=false`. An operator who had folded the pane
*deliberately*, to get the wide 3-up form, therefore lost that posture for the rest
of the session — and lost it again on every subsequent no-file refusal. The pane
must still open, because a dropzone nobody can see cannot be used; what it must not
do is overwrite a choice the user made with one they did not.

The rule for a consumer: **pass `persist: false` from any call the user did not
make.** A press is the user; a validation refusal, a deep link, a restored draft
and a programmatic reveal are not.

`data-attachment-persist="none"` is the other half of the same axis and is not
replaced by this one: the attribute opts a whole pane out of storage (what a
fixture wants), the option opts out a single call. Both must permit a write for one
to happen.

### 3. The values in the hidden region are kept, and collapse is allowed while they exist

**One answer: nothing in the body is discarded, cleared or reset by a collapse, and
collapse is never blocked because the body holds unsaved work.**

The body holds a picked file — the most expensive thing on the pane. It survives,
because the collapse is a view change the user asked for and the control that
reopens it is one press away; a disclosure that silently dropped a document would be the worst failure this
component could have. Reopening shows the same state, the same file and the same
preview scroll position.

Blocking the collapse instead would be a modal-scale intervention over a reversible
view change, and it would break the affordance the collapse exists for — the
operator folds the pane *because* they are now typing metadata about the file they
just picked.

**Consumer obligation that follows:** a pane holding a file is unsaved work whether
it is visible or not, so the page still owes the leave guard `file-upload.md`
obligation 2 describes (back link, workspace tab strip, `beforeunload`). Collapsing
is not saving, and the collapsed control must not be able to be mistaken for a
discard — which is why its accessible name carries the region rather than being a
bare chevron. The name is the only place that reading can live now: the variant
draws no text.

### 4. The body's refusal is cleared when the body is hidden

A `.form-field__control--error` on the body, and the `.form-field__error` message
under it, mean "no file was chosen and a save was refused". Painted on a region
nobody can see, that is not actionable: the control that would fix it is not
rendered.

**So the refusal is cleared on collapse.** It is safe here — unlike the general
case — precisely because the gate that produced it reopens the pane before
refusing again and re-announces the message into the pane's own live region. The
message is therefore never lost, only never stale.

The component cannot do this itself: it does not know what a consumer painted on
the body. It dispatches a bubbling **`attachment:toggle`** with
`detail.collapsed`, and the consumer clears its own. Same shape as `select:change`.

### 5. The authored state is the state

The first paint happens before any script runs, so the markup's
`.is-collapsed` (present or absent) and the `aria-expanded` on **both** triggers
must agree with each other. An authored pane with no `.is-collapsed` and a
collapsed control reading `aria-expanded="false"` is a first paint that is wrong about itself, and on
a load where the script never runs it stays that way. Both triggers describe the
same panel, so both read the same value.

`scripts/attachment.js` then applies the *authored* value rather than a constant
when there is nothing in storage — which is why its storage read is nullable and
distinguishes "chose expanded" from "never chose".

### What the collapse takes away, and why that is allowed

`Tải xuống` and `Đổi tài liệu` were reachable a moment ago and are not now. Stated
rather than glossed:

- Both act on the body, and an action on a region that is not rendered is an
  affordance with no subject.
- One press on a control that is always present, named with the region, and
  reachable by Tab at the position the region occupies restores them.
- `.claude/skills/responsive/SKILL.md` § Principles (4) forbids **hiding a control to make a
  width fit**; § Vertical budget permits **the user hiding a region to get room**. The line is who
  decides, and this is the user. The collapsed control carries a name, a state and
  the way back at every width, and no tier undoes it.

That is also the argument for it being a real `<button>` in the flow rather than an
overlay or a click handler on the pane: it is the only route back to two actions and
a document, and a control a keyboard cannot get to would strand all three.

## Tokens

| Role | Token | Source |
|---|---|---|
| Card fill | `--utui-attachment-bg` | `bg/primary` white, exact |
| Card radius | `--utui-attachment-radius` | 16px, exact |
| Card shadow | `--utui-attachment-shadow` | the frame's two-layer shadow-md |
| Card padding / row rhythm | `--utui-attachment-padding` | 24px, exact |
| Action Bar gap | `--utui-attachment-bar-gap` | 16px, exact |
| Leading group gap | `--utui-attachment-lead-gap` | 12px, exact |
| Title / supporting gap | `--utui-attachment-text-gap` | 4px, exact |
| Featured icon halo | `--utui-attachment-icon-ring` | **6px, a measurement** — see below |
| Supporting line ink | `--utui-attachment-supporting-text` | Gray/500 `#667085`, exact |
| Disclosure ink | `--utui-attachment-collapse-text` | Gray/600 `#475467`, exact |
| Disclosure box | `--utui-attachment-collapse-height`, `--utui-attachment-collapse-padding-x` | 40px / 16px, from `padding: 10px 16px` |
| Footer / pager gap | `--utui-attachment-footer-gap` | 12px; **the frame draws 10px** — see below |
| Pager button box | `--utui-attachment-page-size`, `--utui-attachment-page-radius` | 36px / 8px, exact |
| Collapsed control box | `--utui-attachment-expand-size` | 40px, exact — the node's `Collapse=True` hug. Its surface reuses `--utui-attachment-bg`, `-radius`, `-shadow` and its ink `--utui-attachment-collapse-text` |
| Title ink | `--app-text` | frame: Gray/900 — see below |
| Body surface | `file-upload`'s own tokens | not restated here |

Three substitutions, all recorded rather than pinned silently:

- **The halo is 6px, not the 8px `--utui-featured-icon-ring` ladder step.** Kept as
  its own measurement for exactly the reason
  `--utui-table-cell-folder-link-icon-ring` (6px, same value, same argument) already
  is: the shared ring is a ladder step and this is a reading off one instance. It
  is applied through `--featured-icon-ring-width`, the local property
  `featured-icon.css` publishes for this, not by copying its box-shadow.
- **The footer gap is 12px against the frame's 10px.** The spacing ladder steps
  8 → 12 and this package has no 10. 12px is what `--utui-modal-actions-gap`
  already puts between two adjacent buttons, so the row keeps the one button-row
  rhythm the rest of the package has rather than gaining a component-private
  value. Same class of substitution as the toggle's Gray/100 track.
- **The title takes `--app-text` (Neutral/900 `#171717`) against the frame's
  Gray/900 `#101828`.** At near-black the difference is invisible and one heading
  ink across the package is worth more than 0.3% of luminance. The supporting line
  is *not* treated the same way and takes Gray/500 exactly, because there the
  nearest neutral (`#525252`) differs in both lightness and hue and it shows on a
  14px line under an 18px title. `#667085` is 4.95:1 on the white card, so AA holds
  for normal text.

No primitive was minted. Every colour the frame names —
`green/600 · 100 · 50`, `gray/600 · 500 · 200 · 100 · 50`, `base/white` — is
already an exact primitive in this package.

## Responsive

Nothing about the component changes above `md`. **One** thing changes at `md` and
below, in `styles/responsive.css`, because from `md` the responsive contract stacks
two-column bodies and every consumer of this card is full width from there down:

- **Every row sizes itself.** The card's container no longer has a definite height,
  so a `minmax(0, 1fr)` body track has no free space to resolve against.

It was two until 2026-08-26: the collapsed rail turned from a vertical strip into a
full-width horizontal bar with its label the right way up. A 40px square button is
the same box in a tall narrow column as in a wide short row, so there is nothing to
reorient and that rung is gone — along with the container-query caveat that came
with it, since the orientation was the only thing the tier was standing in for
here (`.claude/skills/responsive/SKILL.md`, Known Gap 5). The one rung left is
about the container's *height*, which is what the tier actually reports.

The separate `@media (pointer: coarse)` rung that grows the collapsed control to
44px is a pointer rule, not a tier rule, and applies at every width.

**The body's height is the consumer's, at every tier.** `file-upload.md` requires
a definite height, as a **cap** and not a floor: without one the pane grows to the
document, the preview viewport never scrolls, its `tabindex="0"` becomes a dead tab
stop, and a tall document pushes whatever follows the card off the page. On
`du-an/ho-so/tai-len` the desktop row supplies the cap down to `lg` and the stacked
pane sets `100dvh - --utui-scroll-region-offset` on `.file-upload` itself from
`md`. `dvh`, never `vh`.

Under `@media (pointer: coarse)`:

- the disclosure grows its **hit area** to 44px via `::after` — growing the box
  would push the section header down and take that height off the body it heads,
  and the control is already ~94px wide with its label;
- the pager buttons grow their **box** to 44px square. Nothing width-locks the
  footer row, it already wraps, and a square icon-only control whose hit area is
  larger than its own paint is the one case where the pseudo trick misleads: there
  is no label to aim at.

The collapse is **not** a tier rule and is undone at no width.

## Accessibility

- The pane is a landmark with a name in **both** states: a `<section>` whose
  `aria-labelledby` points at `.attachment-pane__title`. Collapsed, the title is not
  rendered — so a consumer that collapses must keep the name resolvable, which is
  why the collapsed control carries the region's name as its accessible name
  (`aria-label`, or a `.sr-only-label` span inside the button) and the section's
  labelling id stays on an element the consumer controls. The node draws no text in
  that variant, so **the name has nowhere else to live**: a bare chevron with no
  accessible name would leave the collapsed region unnameable and its only control
  unlabelled.
- **Exactly one trigger is rendered per state**, and both carry `aria-expanded`
  and `aria-controls` for the same panel. `aria-controls` points at the body, which
  is the substantive region even though the collapse also removes the header and
  the footer.
- **Do not swap either control's name with the state.** `aria-expanded` already
  says which way it is. `Thu gọn` alone names no region, so the accessible name says
  which: `Thu gọn khung tài liệu đính kèm`, with the visible word contained in it
  (WCAG 2.5.3).
- **The two pager buttons need authored names — the frame gives them none.** They
  are icon-only, so there is no visible string to contain: the name is the whole
  label. `Tài liệu trước` and `Tài liệu sau`. See **Known Gaps** for the two
  unresolved questions behind them.
- **A pager with no position statement is half a control.** A screen-reader user who
  presses `Tài liệu sau` learns nothing about where they now are. The component does
  not draw a position indicator and neither does the frame; a consumer that builds
  the pager owes an announcement of the new document — the body's own
  `.file-upload__status` live region is the right place, and it is already the
  region that names the current file. Recorded as a gap, not solved here.
- The featured icon is `aria-hidden`, per `featured-icon.md`. The green is the
  component's own colour and not a status, so nothing depends on it.
- The supporting line is **not** a live region. The body already owns one
  (`.file-upload__status`) and that is where a pick is announced; a second region
  naming the same file would announce it twice.
- The header's file name is clamped visually only — the full string stays in the
  DOM, so the ellipsis costs a sighted reader the tail of a long name and costs a
  screen-reader user nothing. The collapsed control has no visible name to clamp.
- Focus is visible on every reachable control from the shared `:focus-visible`
  ring, and focus order across a collapse is the subject of obligation 2 above.

## Markup

```html
<section class="attachment-pane" id="documentPane" aria-labelledby="documentPaneHeading">
  <div class="attachment-pane__header">
    <div class="attachment-pane__lead">
      <span class="featured-icon featured-icon--success featured-icon--ring attachment-pane__icon" aria-hidden="true">
        <span class="material-symbols-outlined">attachment</span>
      </span>
      <div class="attachment-pane__heading">
        <h2 class="attachment-pane__title" id="documentPaneHeading">Tài liệu đính kèm</h2>
        <p class="attachment-pane__file" id="documentPaneFile">Chưa có tài liệu</p>
      </div>
    </div>
    <button class="attachment-pane__collapse" type="button"
            aria-expanded="true" aria-controls="documentPanePanel"
            aria-label="Thu gọn khung tài liệu đính kèm">
      <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      <span>Thu gọn</span>
    </button>
  </div>

  <div class="attachment-pane__body" id="documentPanePanel">
    <section class="file-upload">…</section>
    <p class="form-field__error" hidden></p>
  </div>

  <div class="attachment-pane__footer" hidden>
    <div class="attachment-pane__pager">
      <button class="button attachment-pane__page" type="button" aria-label="Tài liệu trước">
        <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      </button>
      <button class="button attachment-pane__page" type="button" aria-label="Tài liệu sau">
        <span class="material-symbols-outlined" aria-hidden="true">navigate_next</span>
      </button>
    </div>
    <button class="button button--compact" type="button">
      <span class="material-symbols-outlined" aria-hidden="true">upload</span>
      <span>Đổi tài liệu</span>
    </button>
    <button class="button button--compact" type="button">
      <span class="material-symbols-outlined" aria-hidden="true">download</span>
      <span>Tải xuống</span>
    </button>
  </div>

  <button class="attachment-pane__expand" type="button"
          aria-expanded="true" aria-controls="documentPanePanel"
          aria-label="Mở rộng khung tài liệu đính kèm">
    <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
  </button>
</section>
```

The collapsed control is authored **last**, after the footer, so a keyboard reaches
it at the position the region occupies in both states. Its name may be a
`.sr-only-label` span inside the button instead of the `aria-label` — one or the
other, never neither, and never a chevron on its own.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.attachment-pane` and its parts in `styles/attachment.css` |
| Tokens | `--utui-attachment-*` in `design-system/tokens/css/untitled-ui-component.css` |
| Collapse behaviour | `scripts/attachment.js` — `OmeuAttachment.init/get/destroy`, and the `attachment:toggle` event |
| Tier rules + coarse pointer | `.attachment-pane*` in `styles/responsive.css` |
| Body | `design-system/components/file-upload.md`, `styles/file-upload.css` |
| Header icon | `design-system/components/featured-icon.md` |
| Footer buttons | `design-system/components/button.md` (`.button--compact`) |
| Example — `--bare`, `chevron=false`, `edit=true` | `screens/du-an/ho-so/tai-len.html`, `#documentPane`; wired in `du-an/ho-so/tai-len.js` (`revealDocumentPane`, `bindDocumentPane`) |
| Fixture — every combination | `attachment-states.html`, **removed 2026-09-23** (ADR 0011). The card, the pager and every collapsed state but one were instantiated only there and are now instantiated nowhere |

## History

Added 2026-08-26. The component existed in the DS file before the package knew it
did, and the order that happened in is worth keeping because it changed two
rulings:

| Date | Event |
|---|---|
| 2026-08-22 | `screens/du-an/ho-so/tai-len` builds a document pane with a sideways collapse, from wireframe `S2` note 6. No component behind it. |
| 2026-08-26 | The collapse is deleted as an unsourced divergence — ~90 lines, one consumer, no Figma frame. |
| 2026-08-26 | `Attachment` (`10964:9598`) is found carrying `collapse` as one of four variant axes. The collapse is restored the same day. |
| 2026-08-26 | The pane is evolved toward the node — section header, footer action row — under the screen's own class names, explicitly so the reharvest would be a lift. Three things are left as recorded deferrals: the ring width, the rail width, and the card. |
| 2026-08-26 | This contract. The pane is reharvested; the three deferrals are ruled on; the collapse moves to `scripts/attachment.js`. The collapsed state is built as a 44px full-height rail with a rotated title, over the variant's then-drawn 85px strip. |
| 2026-08-26 | The node is re-read and its `Collapse=True` variant is now a 40 x 40 icon button with no featured icon and no title. The rail goes with the 85px artifact that justified it: `.attachment-pane__rail` / `__rail-label` become `.attachment-pane__expand`, the five `--utui-attachment-rail-*` tokens become one `--utui-attachment-expand-size`, the `md` reorientation rung is deleted, and a `pointer: coarse` rung grows the 40px box to the touch target. The one consumer and the fixture are updated with it. |
| 2026-08-26 | A UX audit of that swap lands five fixes: the focus ring is composed with the control's shadow-md instead of replacing it, the touch-target override moves to `width` + `min-height` so both axes win on used value rather than import order, the collapsed pane's own box shrinks to its control (`align-self`/`justify-self: start`) so the hit area matches the paint, `attachment:toggle` and the storage write are gated on an actual state change, and the fixture's `--short` pin is restored for the two EXPANDED cases that carry it. Two entries are added to **Known Gaps**: the collapsed pane's missing on-screen name, and the focus ring's unmeasured contrast on this control. |
| 2026-08-26 | Product ruling on the missing on-screen name: **it ships as drawn.** No label, badge, state dot, `title`, tooltip or relocated control is added — five candidates considered, all five are chrome the node does not draw, and the cost is recorded rather than argued away. One question goes to the designer: does `Collapse=True` stay a bare chevron, or gain a visible cue when a document is behind it? Not a merge blocker; the loss is discoverability, never data. The two other open Known Gaps (`Empty` + `collapse`, the pager) are untouched. |
| 2026-08-26 | `collapse()` / `expand()` gain a second option, `{ persist: false }` — apply the state, do not record it. Sanctioned component change from a UX audit of `screens/du-an/ho-so/tai-len`: a save refused for a missing document calls `expand()`, and the storage write behind it erased a fold the operator had made deliberately, for the whole session, on every such refusal. **The pane still opens** — only the persistence is suppressed. Default is `true`, the two click handlers do not pass it, and `data-attachment-persist="none"` is unchanged. The one consumer passes it from `revealDocumentPane()`. The collapsed control's labelling is NOT reopened: the ruling above stands. |
| 2026-09-22 | The set is re-read from `File upload`'s side (`9826:63774`) and `_Attachment` has changed: its variant matrix is now `State` x `Collapse` x **`Multi Files`**, and `chevron` / `edit` are no longer variant axes. `Multi Files=True` (`11709:11236`) swaps the footer's `Đổi tài liệu` for `Tải lên`; the pager is drawn on both members, so the pager's own open question below is NOT settled by it. Recorded, not acted on — no markup, CSS or script in this package changed. See the note under **Variants**. |

The reharvest changed four metrics on that screen, all toward the node: the
header's icon-to-text gap 20 → 12px, the header/body/footer rhythm 12 → 24px, the
supporting line Neutral/600 → Gray/500, the footer's button gap 8 → 12px. And it
removed one thing: `.file-upload__caption`, because the file's name was being
printed three times on one pane.

## Known Gaps

- **The pager's two buttons have no drawn names, and two questions behind them are
  open.** `Tài liệu trước` / `Tài liệu sau` are authored here on the reading that
  the pager moves between the **attachments of the record**: the body already
  scrolls for pages within one document, and paging a scrollable preview would be
  two mechanisms for one job. The other reading — the pager turns the pages of the
  current document — is equally consistent with a frame that draws
  `chevron_left` / `navigate_next` and nothing else. **Needs a product decision, not
  a CSS one.** Second question, same source: the frame draws no position indicator
  (`2 / 5`), no disabled end states and no count, so a pager is authored with no way
  to say where it is. The component leaves both to the consumer and neither is
  drawn anywhere.
- **The collapsed variant is drawn only for `File Support`.** Collapse is built for
  all three states because it is orthogonal in the component definition and nothing
  about it reads the body — but `Empty` + `collapse` in particular is a composition
  no frame draws, and "fold away the dropzone you have not used yet" is a plausible
  thing for a designer to want to forbid. Confirm.
- **The collapsed pane has no on-screen name for a sighted operator — ruled
  2026-08-26: it ships as the node draws it.** The variant draws a 40px chevron
  and no text, and the header that held both the region's name and the attached
  file's name is `display: none` — so a sighted operator who folds a pane holding
  a document sees a bare chevron: nothing states that a file is attached, what it
  is called, or that `Tải xuống` and `Đổi tài liệu` are behind it. Assistive tech
  is fine — the control's accessible name carries the region and the landmark
  stays named.

  The justification previously on record (the variant draws an icon plus the
  title, so only the *file* name is lost) was true of the retired 85px strip and
  is not true of the 40px button; it was struck from
  `screens/du-an/ho-so/tai-len.js` and pointed here.

  **Ruling: nothing is added.** Not a visible label, not a badge or state dot, not
  a `title`, not a tooltip, not the retired rotated-title rail, and the reopen
  control is not relocated into the form panel's header. All five were considered
  and all five are new chrome this node does not draw; the package's job here is to
  build the component as drawn and report what that costs, not to invent an answer
  the designer has not given. The cost is stated in the paragraph above and stays
  stated — it is not argued away.

  **What is routed to the designer, and it is the whole question:** should
  `Collapse=True` on `10964:9598` stay a bare chevron, or gain a visible cue when a
  document is behind it? A node change comes first and a package change after, the
  same order every other drawn-size question in this file follows.

  **What holds in the meantime.** The loss is discoverability, never data:
  Collapse obligation 3 keeps the file, the preview and the scroll position across
  a fold, and the way back is always one press on a control that is always
  rendered, always in the tab order at the region's own position, and always named
  for assistive tech. The consumer still owes the leave guard `file-upload.md`
  obligation 2 describes, which is what makes "I cannot see that a file is
  attached" a legibility problem rather than a loss-of-work one.

  **Does not block this change.** The bare chevron is the shipped behaviour, not a
  placeholder waiting on the answer above.
- **The collapsed control is 40px and the touch target is 44px.** Closed by a
  `pointer: coarse` rung rather than by overriding the drawn size, which is this
  package's standing answer — but it is the node drawing a control below the target,
  so a designer ruling would be better than a rung. The 85px strip this variant used
  to draw, and the arithmetic that made it unbuildable, is retired: see **History**.
- **The focus ring is doing more work on this control than anywhere else it is
  used, and it is the package's weakest indicator.** `--app-focus` is a 4px
  Brand/100 halo; `styles/select.css` already records the brand ring measuring
  1.97:1 on white at Brand/300 and departs to Brand/600 for SC 1.4.11. Here the ring
  is the whole indicator on a 40px icon-only control with no label, on the page wash,
  and it is a keyboard user's only route back to a document and two actions. The
  control composes the ring with its own shadow-md rather than losing it (see
  `styles/attachment.css`), but the halo's contrast is inherited and unmeasured.
  Package-wide, not this component's to fix alone — recorded here because this is
  where it matters most.
- **Two Figma sources disagree about the card.** `--bare` is built with the product
  section as its evidence, but nobody has said the two are meant to differ. A
  designer ruling either way is a one-line change in one screen.
- **`Buttons/Button` Hierarchy=Tertiary gray is not implemented**, so the
  disclosure is a component part rather than a composition. See the disclosure
  above.
- **`Tải xuống` downloads nothing** on the one consumer, and the reason is
  `file-upload.md`'s: nothing is uploaded anywhere in the demo and the pane
  deliberately does not keep the `File`. Inherited, not new.
- **No multi-attachment consumer exists**, which is the same gap as the pager's:
  every axis about *a set* of attachments — the pager, its names, its position
  indicator, what the header says while you page — is authored from a component
  frame with one file in it.
- **One consumer, and it takes three of the four axes at their non-default value**
  (`--bare`, `chevron=false`). The card, the pager and the `Empty` + `collapse`
  combination are exercised only by the fixture. Everything here that is not
  measured off the node is inference from a single instance.
