# Toggle

## Purpose

Toggle is the switch that turns a region of a form **on or off**. Off means the
region does not apply — not that a value is false, and not that a row is
unselected.

It is **not** `design-system/components/inputs.md`'s `.choice`. A checkbox opts
into a value that is saved with the form; a switch decides whether a block of
fields exists at all. The two are told apart by what the *off* state means, and
the wrong one is a real defect: a switched-off region must take its fields out of
the tab order, which is a consumer obligation this contract carries and the
checkbox contract does not.

It is also not a two-option choice. `Có` / `Không` as two labelled options is a
radio group; a switch has one label and a binary state. This screen shipped the
radio form first and it was corrected against the frame — see **History**.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Instance | `Tải lên hồ sơ`, node `11420:76690` — the trailing control on the `Bản cứng kèm theo` panel header |
| Geometry | 36 x 20 track, pill radius, 16px thumb, 2px inset on every side |
| Underlying DS component | Untitled UI `Toggle`, size `sm` |
| Reviewed via | Figma MCP, 2026-08-26 |

Only the `on` state is drawn in a frame. Off, hover, and disabled are the
Untitled UI construction applied consistently, not documented design intent —
see **Known Gaps**.

## Anatomy

Two parts, one element:

1. **Track** — a `36 x 20` pill. `--utui-toggle-track-bg` off,
   `--utui-toggle-track-bg-checked` on. No border.
2. **Thumb** — a `16px` white circle with `--utui-shadow-sm`, inset 2px, at the
   leading edge off and the trailing edge on.

There is no label part of its own. The switch takes its accessible name from the
string that asks the question beside it — on `du-an/ho-so/tai-len` that is the
panel's own `<h2>`. A second visible label would print the same string twice on
one row.

**That string should be a real `<label for>`, not an `aria-labelledby` target.**
Both give the same accessible name; only the label makes the words a click target,
which is what a pointer user expects of a switch's caption and is the one thing
ARIA cannot supply. Where the string is a heading, the `<label>` goes *inside* the
heading: `<label>` takes phrasing content, so a heading inside a label is invalid
markup and a label inside a heading is not. The heading keeps its `id` for whatever
names the region.

## Markup

It **styles the native checkbox**, the same construction `.choice` uses. The
element decides the semantics, so the control keeps Space, the tab order, the
`:checked` state the CSS reads, and form participation. `role="switch"` is what
changes the announcement from "checkbox, checked" to "switch, on"; it is a markup
obligation, not something the stylesheet can supply.

```html
<h2 class="section-header__title" id="hardCopyHeading">
  <label for="hardCopySwitch">Bản cứng kèm theo</label>
</h2>
<input class="toggle" type="checkbox" role="switch" id="hardCopySwitch" checked>
```

(`section-header__title` is `ds/components/section-card.md` § `--form`'s head
title — the label's `cursor: pointer` is scoped there,
`.section-card--form .section-header__title label`, not a class of its own.)

**No `name`.** A switch that turns a region on and off is not a value the form
posts, and every known instance sits outside its page's `<form>` — so a `name` has
no form owner, nothing reads it, and it reads as a contract that exists. The
canonical snippet carried `name="hardCopy"` until 2026-08-26 and the one consumer
inherited it inert. What the exits read is the consumer's own state.

**No `aria-labelledby` either**, now that the name comes from the `<label for>`
above. Do not write both: two name sources on one control is a thing that can
disagree, and the label is the one with the affordance.

Do not build it from a `<button aria-checked>`. That form needs script to keep
the attribute in step with the paint, and the paint is `:checked` here — the two
would be able to disagree.

## States

| State | Selector | Notes |
|---|---|---|
| Off | `.toggle` | Track `--utui-toggle-track-bg`, thumb at the leading edge. |
| On | `.toggle:checked` | Track `--utui-toggle-track-bg-checked` (Brand/600), thumb at the trailing edge. |
| Hover | `.toggle:hover:not(:disabled)` | Track steps one ramp in whichever direction it is already in. |
| Focus | — | The shared `input:focus-visible` ring from `styles/base.css`. Not restated in the component, so the package has one focus treatment. **Measured 2026-08-26**, on `#hardCopySwitch` in Blink and WebKit: `box-shadow` computes to `--app-focus` (`0 0 0 4px` Brand/100 over the xs shadow) in BOTH the checked and the unchecked state, so `appearance: none` does not cost the ring and the `input` in base.css's selector list does reach it. |
| Disabled | `.toggle:disabled` | The native attribute, never `aria-disabled` alone: the control must leave the tab order. |
| Disabled + on | `.toggle:checked:disabled` | Track `--utui-toggle-track-bg-checked-disabled` (Brand/200), thumb still at the trailing edge. **Added 2026-08-26d as a defect fix**: `:disabled` and `:checked` are both one class-level selector, so the disabled rule won on source order and a LOCKED SWITCH THAT WAS ON painted with the unchecked disabled track. On a read-only form that silently rendered the record's own answer as `Không` (`screens/du-an/ho-so/chi-tiet.html`, the three archive states whose fields lock). |

Nothing animates. The package has no transitions anywhere and no
`prefers-reduced-motion` escape hatch; a sliding thumb would be the first, which
is a motion decision rather than a styling one.

## Tokens

| Role | Token |
|---|---|
| Track width / height | `--utui-toggle-width`, `--utui-toggle-height` |
| Thumb size / inset | `--utui-toggle-thumb-size`, `--utui-toggle-thumb-inset` |
| Track off / hover | `--utui-toggle-track-bg`, `--utui-toggle-track-bg-hover` |
| Track on / hover | `--utui-toggle-track-bg-checked`, `--utui-toggle-track-bg-checked-hover` |
| Track disabled | `--utui-toggle-track-bg-disabled` |
| Track disabled + on | `--utui-toggle-track-bg-checked-disabled` |
| Thumb fill / shadow | `--utui-toggle-thumb-bg`, `--utui-toggle-thumb-shadow` |
| Radius | `--app-radius-pill` |

The checked track is `--utui-color-bg-brand`, the same reading `.choice:checked`
takes: the switch commits the operator to a branch of the form, it does not
report a status, so it wears the brand ramp rather than a success one.

The off track is `--utui-color-bg-surface-subtle` (Neutral/100, `#F5F5F5`). The
frame names Gray/100 (`#F2F4F7`), which has no primitive in this package; the two
are 0.4% apart in luminance. Same class of substitution the upload panel's
Gray/200 rim already records.

## Responsive

Nothing tier-specific. The track is a drawn size at every width — the whole
control **is** the state indicator, so growing the box would redraw the component
rather than make it easier to hit.

Under `@media (pointer: coarse)` the **hit area** grows to
`--utui-touch-target-min`, centred on both axes, via `.toggle::before` in
`styles/responsive.css`. That is why the component owns `::after` for the thumb
and must not take `::before`: a component that owned both would leave a coarse
pointer nothing to grow.

Both of those are pseudo-elements on an `<input>`, which is the construction the
first Known Gap below puts in doubt for Gecko. If that gap resolves against us, the
hit area moves with the thumb.

## Accessibility

- `role="switch"` is required. Without it the control announces as a checkbox,
  and "checked" is the wrong word for a region that is switched off.
- It needs a name, and the name should come from a `<label for>` on the visible
  string that asks the question — usually the heading of the region it controls.
  See **Anatomy** for why a label rather than `aria-labelledby`, and where the
  `<label>` goes when that string is a heading.
- **Do not swap the name with the state.** `aria-checked` (implied by `:checked`
  on a native checkbox with `role="switch"`) already carries on/off; a name that
  changes to "Tắt bản cứng" is a second, contradictory statement of the same fact.
- The switch is operated with Space, which is the native checkbox behaviour and
  is what `role="switch"` expects. Nothing scripts a key handler.
- Colour alone does not carry the state **in Blink and WebKit**: the thumb moves,
  which is a position change a low-vision or colour-blind user reads without the
  ramp. Measured 2026-08-26 — see the Gecko gap below before treating this as a
  satisfied 1.4.1.
- **No live region is needed for the state change.** `role="switch"` announces its
  own new state on activation, and a consumer that also wrote "Đã bật bản cứng"
  into a `role="status"` would have the same fact announced twice. A live region is
  only owed for what the switch does *not* say — a consumer that reveals a region
  whose own contents change with it may owe one for that, which is a different
  obligation belonging to whatever changed.

### Consumer obligation — the region must leave the tree, not just the view

A switched-off region has to be `hidden` (or otherwise removed), not merely
unpainted. Every field inside it leaves the tab order and the accessibility tree
together. Two failures follow from getting this wrong, and both have been seen in
this package:

1. A required field inside a closed region goes on blocking the save, with a
   message pointing at something the operator cannot see.
2. A keyboard user tabs into fields that belong to a branch they have closed.

**Watch the cascade when hiding a grid or a flex box.** An author `display`
declaration beats the UA sheet's `[hidden] { display: none }` at any specificity,
so a container that declares `display: flex`/`display: grid` needs its own
`[hidden]` rule — see `.section-body[hidden]` in `styles/section-card.css` (the
region this contract's own example switches, ex `.hardcopy__details`), and the
same trap recorded in `styles/modal.css`.

### Consumer obligation — rescue focus before the region leaves

Switching off while focus is inside the region drops focus to `<body>`, and the
next Tab restarts at the top of the page past the whole navigation column. So the
consumer moves focus itself, **to the switch**, and it moves it *before* setting
`hidden` so focus never passes through `<body>` at all.

Only when focus is actually inside the region. A pointer user who switches the
panel off from somewhere else on the page must not have focus yanked into it — the
same conditional `design-system/components/file-upload.md` states for its own
empty → filled hand-off, and the same rule `setDocumentPane()` and `setFile()` both
named on the first consumer before this contract asked for it. `setHardCopy()` in
`screens/du-an/ho-so/tai-len.js` shipped without it and is the reason this paragraph
exists.

### Consumer obligation — one answer for the values in a switched-off region

Pick one and state it at the switch. The first consumer had three answers for three
fields in the same region, which is how a reader concludes the behaviour is
accidental. **The answer this package takes: every value stays in its control, and
nothing from a switched-off region leaves the screen.**

- *Kept, not cleared*, because the switch may come back a second later and
  re-typing what the operator already entered is a worse outcome than carrying a
  value nothing currently claims.
- *Never sent*, because a value the operator has switched off is not a claim they
  are making. The consumer's payload omits it — `hardCopyDue: ""` and
  `hardCopyForms: {}` on the off branch, rather than the last value the control
  happens to hold.

A consumer that needs the other rule (clear on switch-off, e.g. because the region
holds something expensive or dangerous to carry) may take it, but must say so where
the switch is wired and must apply it to *every* field in the region.

### Consumer obligation — clear the region's validation errors on switch-off

Explicitly, and at the moment the switch turns off rather than at the next
validation run. A field inside a closed region cannot be invalid: nothing in there
is reachable or readable, so a message pointing at it points at nothing, and a
refusal that outlives the branch that earned it is unresolvable by definition — the
control that would fix it is gone. This includes fields the consumer generates
inside the region; `setHardCopy()` clears both the date's error and every generated
count's.

### Consumer obligation — the authored `checked` and the authored `hidden` must agree

The first paint happens before any script runs. If the markup says `checked` and the
revealed region is authored `hidden`, that paint is a switch that is on over a region
that is not there — and on a load where the script never runs it stays that way. The
authored pair is the state, not a starting point for JS to correct.

The consumer's init then applies the authored value rather than a constant:
`setHardCopy(hardCopySwitch.checked)`, so there is exactly one place the default
lives and it is the markup.

**Corrected 2026-08-26d — the region on `du-an/ho-so/tai-len` generates nothing.**
This paragraph described the counts as script-rendered fields inside an authored
`hidden` box with a visible "no form chosen" line, chosen by a Tags multi-select.
None of that is on the screen: node `12630:42486` draws **four quantity fields and
no control that chooses between them**, so the screen authors four ordinary
`.form-field`s, there is no chip control, no zero-state line, and nothing is built
at runtime. `inputs.md` and `select.md` were both corrected when the chips came
out on 2026-08-26c; this file was missed, which is worth naming because it is the
contract for the control that region belongs to.

What survives the correction is the obligation itself, and it now has one owner
instead of two. The authored pair is **the switch's absent `checked` and the
`hidden` on the revealed wrapper** — one fact written twice, so a load where the
bundle never runs paints the same closed panel a load with JS does.

Two notes for the next consumer, because both were paid for here:

- **Anything a region generates carries the same obligation against its own
  authored state.** That is not exercised by any consumer today; keep the rule.
- **Put the `hidden` on the wrapper, not on the grid inside it.** A screen-owned
  grid of fields declares its own `display`, and an author declaration beats the UA
  sheet's `[hidden] { display: none }` at any specificity — so a grid marked
  `hidden` stays painted and stays tabbable. `.section-body` therefore carries
  its own `[hidden]` rule (`styles/section-card.css`; ex `.hardcopy__details`) and
  the screen-local `.hardcopy__counts` grid inside it deliberately carries none:
  with four authored cells it can never be empty and is never the thing hidden.
  See `inputs.md`, revision 2026-08-26c.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.toggle` and its `::after` thumb in `styles/toggle.css` |
| Tokens | `--utui-toggle-*` in `design-system/tokens/css/untitled-ui-component.css` |
| Coarse-pointer hit area | `.toggle::before` in `styles/responsive.css` |
| Example | `screens/du-an/ho-so/tai-len.html`, `#hardCopySwitch`; wired in `du-an/ho-so/tai-len.js` (`setHardCopy`, `bindHardCopy`) |
| Label affordance | `.section-card--form .section-header__title label` in `ds/styles/section-card.css` — `cursor: pointer` and nothing else (ex `.hardcopy__label`, merged 2026-09-28) |

### The one consumer ships OFF, and that needs a designer — 2026-08-26d

`#hardCopySwitch` carries no `checked`, so `Bản cứng kèm theo` opens closed and the
expected date and the four quantities are `hidden` at first paint. **User ruling,
2026-08-26** (register entry D57): most uploads have no
paper behind them, so the common case should cost no press and the panel should not
draw five controls that most operators leave alone. It is unambiguous for DEV — the
markup is the default, per the obligation above — and it is recorded here because
**a designer has to rule on it and will not read a screen bundle.**

Two facts make it a real question rather than a formality:

- **Node `11420:76690` draws the switch ON, over an open panel.** The default that
  ships is the opposite of the only composition in the frame.
- **Only the `on` state is drawn anywhere** (see Source). So this consumer's resting
  appearance — an off track, thumb at the leading edge, over a collapsed panel — is
  a state no frame in MDM - V2 draws, on the one instance of the component in the
  package. The off construction is Untitled UI applied consistently, which is the
  gap this file already records; the ruling is what makes that gap the *default*
  view of the screen rather than a state a reader passes through.

Neither is an argument against the ruling — a frame draws a panel open because a
frame has to draw its contents. Both are why the ruling belongs in a file a
designer reads. Confirm the closed panel is the intended first impression, or draw
the `off` state and say so.

## History

Added 2026-08-26 with the `Tải lên hồ sơ` Figma reconciliation. The panel it
lands on shipped three earlier forms of the same question:

| Date | Form | Why it changed |
|---|---|---|
| — | Segmented control (wireframe `S2`) | V2 has no segmented control; `styles/legacy/segmented.css` is retired. |
| 2026-08-22 | `Có` / `Không` radio pair | The honest reading of a wireframe that drew two labelled options — a choice of one from two named values is a radio group. |
| 2026-08-26 | This switch | Node `11420:76690` draws one control with an on and an off state. |

The radio pair was not wrong for what it was read from; the frame simply asks a
different question shape. Nothing about the model changed with it —
`state.hardCopy` is still `"yes"` / `"no"`, because the confirm dialog prints
`Có` / `Không` and that wording is the archiving flowchart's, not the widget's.

**Revised the same day, after a UX review of the first consumer.** Everything added
came from a defect in that one instance, which is worth recording because a contract
written from a single instance is exactly how the defects got in:

| Added | Because |
|---|---|
| `<label for>` instead of `aria-labelledby` | The name was correct and the words were not a click target. |
| `name` dropped from the snippet | It was inert on the only consumer and was propagating. |
| Focus-rescue obligation | `setHardCopy()` hid the region with focus inside it. |
| One answer for switched-off values | The one consumer had three. |
| Clear errors on switch-off | It was done, but as an implementation detail rather than a stated obligation. |
| Authored `checked` / `hidden` must agree | Nothing had said so, and the first paint is the one no script guards. |
| No live region needed | To stop a consumer adding one that duplicates `role="switch"`. |

## Known Gaps

- **THE THUMB MAY NOT PAINT IN FIREFOX, AND THE THUMB IS THE WHOLE NON-COLOUR STATE
  SIGNAL. Unverified — needs a real Gecko run.** The thumb is `.toggle::after` on an
  `<input>`, and generated content on form controls is the classic non-universal
  case: Gecko has historically not rendered `::before` / `::after` on `<input>` at
  all, whatever the `appearance`. If that still holds, then in Firefox the control
  is a bare coloured pill and the ONLY thing separating on from off is the track
  ramp — which makes the 1.4.1 claim in **Accessibility** false there, and also
  silently drops the coarse-pointer hit area, since that is `.toggle::before` in
  `styles/responsive.css`.

  **Measured 2026-08-26, in Blink and WebKit only:** `::after` resolves
  `content: ""`, `16 x 16`, white, `--app-radius-pill`, the sm shadow, and
  `inset-inline-start` moving `2px → 18px` between unchecked and checked. Both
  engines are correct. **Firefox could not be launched in the environment this was
  measured in** (the Playwright Gecko build is killed on start), so the one engine
  the concern is about is the one engine with no result.

  If it does fail, the construction has to change and the change is known: move the
  thumb off the pseudo-element and onto a real sibling — `<input class="toggle">` +
  `<span class="toggle__thumb" aria-hidden="true">`, painted with
  `.toggle:checked + .toggle__thumb`. That keeps the native checkbox as the
  semantics and the `:checked` as the paint trigger, costs one element, and works in
  every engine. It also frees `::before` and `::after` on the input, which would
  make the coarse-pointer hit area portable too. **Do not adopt it on speculation —
  verify in Firefox first**, because it adds a part to a contract written from one
  instance.
- **The off track is below 3:1 against a white card.** `#F5F5F5` on
  `#FFFFFF` is 1.05:1, and the DS draws no border on the track, so the boundary
  of an off switch is not perceivable to a low-vision user — only the thumb's
  shadow (`--utui-shadow-sm`) suggests it. WCAG 1.4.11 applies to a control's
  state indicator. This is the Untitled UI construction as drawn, so raising it is
  a design-system decision, not a screen fix: the candidates are a 1px
  `--utui-color-border-strong` rim on the off track (still 1.5:1, insufficient
  alone) or an off track at Neutral/300 or darker. **Not resolved. Needs design.**
- **Only the `on` state has a frame.** Off, hover and disabled are the Untitled UI
  construction applied consistently. Nothing in the MDM file draws a disabled
  switch at all.
- **Size `md` is not built.** Untitled UI's `Toggle` has a larger step; no MDM
  frame uses it, so only `sm` exists. Adding it means a size modifier and a second
  set of geometry tokens, not a rescale of these.
- **No label or supporting-text slot.** The DS component can carry a label and a
  description to its trailing side; the one MDM instance carries neither, so the
  parts are not built. A consumer that needs them should extend this contract
  rather than compose a label in a screen file.
- **One consumer.** Everything here that is not the geometry is inference from a
  single instance. Confirm with the designer before treating the state table as
  spec.
