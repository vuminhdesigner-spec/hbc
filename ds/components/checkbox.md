# Checkbox and radio

## Purpose

Checkbox and radio are the two selection controls. They are **one component set
in the source** and one file here, because they share every axis, every state and
every token — they differ in shape, in whether `Indeterminate` exists, and in
what choosing one implies about the others.

A checkbox answers *is this on?* for its own row. A radio answers *which one of
these?* for its group. Neither is a switch: a control that turns a whole region
of a form on or off is `design-system/components/toggle.md`.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Checkbox`, node `1097:63652`, 1504 x 1388 |
| Reviewed via | Figma MCP (`get_metadata`, `get_variable_defs`, `get_screenshot`), 2026-09-16 |
| Shipped implementation | `.choice` in `styles/form-field.css`, built 2026-08-14 from the MDM product file's investor picker (`tS8dUB2qWLc28gZbtj8IIL`, `11357:48413`, redrawn `12035:57167`) — **not** from the UI-kit set above |
| Next consumer | The `Thiết lập bảng` drawer's column list — `Table Setting`, node `11320:65276` |

## Variants

Seven axes. Not every combination exists — see the two rules under the table.

| Axis | Options |
|---|---|
| `Type` | `Checkbox`, `Radio` |
| `Size` | `sm`, `md` |
| `Checked` | `False`, `True` |
| `Indeterminate` | `False`, `True` |
| `Text` | `False`, `True` |
| `Supporting text` | `False`, `True` |
| `State` | `Default`, `Hover`, `Focused`, `Disabled` |

**`Indeterminate` belongs to the checkbox alone.** The set draws no
`Type=Radio, Indeterminate=True`, and it should not: a radio is one of several
mutually exclusive answers, and "partly" is not one of them.

**`Indeterminate=True` only appears with `Checked=True`.** The two are not
independent in the source — indeterminate is a *presentation* of the checked
state, not a third value beside it. In markup that is `indeterminate = true` on a
checked input, which is what the DOM property means too.

## Geometry

Measured off the set, 2026-09-16.

| | `sm` | `md` |
|---|---|---|
| Control box | **16 x 16** | **20 x 20** |
| Label row, `Supporting text=False` | 20 tall | 24 tall |
| Label + supporting block | 40 tall | 50 tall |
| Label type | `Text sm/Medium` (14/20) | `Text md/Medium` (16/24) |
| Supporting type | `Text sm/Regular` | `Text md/Regular` |

The label row's height is its own line height, so a bare control is shorter than
a labelled one and the two align on the first text line, not on their boxes.

**The gap between control and text is not measured** — the set's frames are sized
to their content and do not expose it. The implementation uses 8px at `sm` and
12px at `md`, which is the package's own step, and that is a choice rather than a
reading. Recorded in *Known Gaps*.

## States

| State | Box | Mark |
|---|---|---|
| Default, unchecked | 1px `border/primary` on `bg/primary` | — |
| Hover, unchecked | 1px `Green/500` | — |
| Focused | 1px `Brand/300` plus a 4px `Brand/50` ring | — |
| Disabled | `Neutral/100` fill, `border/primary` | If checked, the mark in `text/disabled` |
| Checked | 1px `Green/500` on `bg/primary` | `Green/500` check |
| Indeterminate | 1px `Green/500` on `bg/primary` | `Green/500` dash |

**The selected state is green, not brand.** Every other "this one is chosen"
signal in this package is the brown brand ramp; this control borrows the success
ramp instead. That is the source's decision, read off `Green/500` in the set's
variables, and it is deliberate enough to survive here — but it is the reason a
reader who assumes brand will get it wrong.

**The focus ring is brand, and it is the only place the two ramps meet.** Green
says *chosen*, brand says *you are here*. They are different questions, so they
keep different colours.

## Tokens

Every value in the set maps onto a token this package already has. **No new
primitives were needed**, which is the test a component from the UI kit should
pass.

| Role | Figma | Token |
|---|---|---|
| Box fill | `bg/primary` `#ffffff` | `--utui-white` |
| Box border | `border/primary` `#e5e5e5` | `--utui-color-neutral-200` |
| Selected border, check, dash | `Green/500` `#22C55E` | `--utui-color-green-500` |
| Hover border | `Green/500` | `--utui-color-green-500` |
| Focus border | `Brand/300` `#D9B287` | `--utui-color-brand-300` |
| Focus ring | `shadow-color/focus-brand` `#faf5ed`, spread 4 | `--utui-color-brand-50` |
| Disabled fill | `Neutral/100` `#F5F5F5` | `--utui-color-neutral-100` |
| Disabled mark and text | `text/disabled` `#98a2b3` | `--utui-color-gray-400` |
| Label | `text/secondary` `#344054` | `--utui-color-gray-700` |

`Green/50` `#F0FDF4` is in the set's variables and is **not used by any drawn
state**; it maps to `--utui-color-green-50` if a future state wants a tint.

## Accessibility

- A native `<input type="checkbox">` or `<input type="radio">`, visually
  restyled. Not a `<div role="checkbox">`: the native control brings keyboard
  operation, the indeterminate property, form participation and AT's own
  vocabulary, and re-implementing those is how the round-trip gets lost.
- The control keeps a real accessible name. With `Text=True` that is the
  `<label>`; with `Text=False` the caller supplies `aria-label`, because a
  control with no name is a control a screen-reader user cannot report.
- Supporting text is joined with `aria-describedby`, not folded into the label —
  it qualifies the choice, it does not name it.
- The focus ring is drawn on the box, and the box is what receives focus. The
  whole label row is a click target through `<label>`, which the browser gives
  for free and which must not be re-implemented with JS.
- Radios share a `name` so the browser owns the group's arrow-key behaviour.

## Code Mapping

| Component CSS | `.choice`, `.choice--sm`, `.choice[type="radio"]`, `.choice--flag` in `styles/form-field.css` |
| Tokens | `--utui-choice-*` in `design-system/tokens/css/untitled-ui-component.css` |
| Consumers | `screens/du-an/chi-tiet.js` — the investor picker's radio column, and the read-only `Liên hệ chính` flag |
| States page | `checkbox-states.html`, **removed 2026-09-23** (ADR 0011). The control has no screen consumer, so no state of it is visible anywhere in the repository now |

**There is no `.checkbox` class, and there must not be one.** `styles/data-table.css`
carries a deprecated `.checkbox` — a decorative `<span>` that can neither be
focused nor toggled, kept only so the cascade is unchanged, which no screen
renders. Authoring new markup against that name collides with it: a `width: 20px`
from a rule nobody meant to use.

```html
<label class="field-choice">
  <input class="choice choice--sm" type="checkbox" checked>
  <span>Tên cột</span>
</label>

<label class="field-choice">
  <input class="choice" type="radio" name="khu-vuc">
  <span>Miền Bắc</span>
</label>
```

Indeterminate is a DOM property, not an attribute, so it is set from script:
`input.indeterminate = true`. Checkbox only: `.choice[type="checkbox"]:indeterminate` draws a dash (used by the select-all box in `du-an/ho-so/danh-sach`).

`:indeterminate` ALSO MATCHES A RADIO whose whole group is unchecked. That is the
spec, not a browser quirk, so any rule added for it must be guarded with
`[type="checkbox"]` or every untouched radio group paints a dash.

## Known Gaps

- **THE KIT MARKS SELECTION IN GREEN AND THIS PACKAGE DOES NOT. Decided
  2026-09-16: the package keeps brand.** `.choice:checked` paints
  `--utui-color-brand-600` on `--utui-color-bg-brand-subtle`; the UI-kit set
  paints `Green/500` on white. The disagreement is not only a hue — the two files
  give green opposite jobs. Here green is `.choice--flag`, a read-only statement
  of fact about a record (`Liên hệ chính`); in the kit green *is* selection.

  Brand wins because the two meanings cannot both be green, and green already has
  the older, wider job: `.claude/skills/design-rules/SKILL.md` reserves the
  status ramps for real status meaning, and a record's flag is exactly that.
  Adopting the kit would have forced `--flag` onto a third colour to make room.

  This is a **standing deviation from the UI kit**, not an oversight. Anyone
  re-reading node `1097:63652` will find green and should not "correct" the
  implementation to match it. Revisit only if the kit's own semantics change.

- **No hover state.** The set draws a `Green/500` rim on hover; `.choice` has
  none, so the control gives no pointer feedback before it is pressed.

- **Focus: ĐÃ CÓ (2026-10).** `.choice:focus-visible` = viền `--utui-color-border-focus` + `--utui-focus-ring`. Bản gốc ghi: **No focus state.** The set draws a `Brand/300` border plus a 4px `Brand/50`
  ring. `.choice` relies on whatever `base.css` gives a focused input, which is
  the generic field ring and not this control's. A selection control with no
  focus treatment of its own is the one place keyboard users most need it.

- **Indeterminate: ĐÃ CÓ cho checkbox (2026-10)** — `.choice[type="checkbox"]:indeterminate` vẽ vạch ngang, dùng ở ô "Chọn tất cả" của `danh-sach` hồ sơ; vẫn chặn radio. Bản gốc ghi: **No indeterminate.** Nothing styles `:indeterminate`, so a partly-selected
  parent checkbox — which the `Thiết lập bảng` column list wants — renders as
  unchecked. Whoever adds it must guard the rule with `[type="checkbox"]`: CSS
  `:indeterminate` also matches a radio whose whole group is unchecked, and an
  unguarded rule paints a dash on every untouched radio group. Verified.

- **No label or supporting-text composition.** The set carries `Text` and
  `Supporting text` axes; `.choice` is the box alone and each caller lays out its
  own label. The kit's geometry for it is recorded under *Geometry* above so the
  composition, when it is built, does not have to be re-derived.

- **`--utui-choice-radius-sm` has no consumer** and says so in its own comment.
  The `sm` size is otherwise ready.

- **`Size=md` has no consumer for the kit's type ramp.** `.choice` is the box
  only, so the `Text md/Medium` step the set pairs with the 20px box is not
  implemented anywhere.
