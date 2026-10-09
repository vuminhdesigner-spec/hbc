# Featured icon

## Purpose

Featured icon is the tinted circular badge that gives a section, tile, or banner
a visual anchor and a semantic tone. It is decorative reinforcement — it never
carries meaning that is not also in the adjacent text.

## Source

| Item | Value |
|---|---|
| Figma files | OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`), MDM V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Component set | `Featured icon` (`1102:5338`) — 5 sizes × 6 colours × 2 themes, 60 variants |
| Reviewed instances | `Section header` and `inform` in `Thông tin chi tiết` (`10287:10813`); `Metric item` (`9764:348`); `Folder` (`10073:14772`); `Notification` (`11152:53299`) |
| Reviewed via | Figma REST API, 2026-08-04; `Notification` via Figma MCP, 2026-08-13; **the set itself via Figma MCP, 2026-09-04** |

## Variants

Read off the set on 2026-09-04. Before that date this contract described three
sizes and two ring widths, each inferred from a single product instance; the set
gives all five sizes directly and corrected three colour values (see below).

| Size | Box | Glyph | Padding | Ring (`--ring`) | Used by |
|---|---|---|---|---|---|
| `--xs` | 24px | 12px | 6px | 2px | — (new 2026-09-04) |
| `--sm` | 32px | 16px | 8px | 4px | `design-system/components/notification.md` |
| Default (`md`) | 40px | 20px | 10px | 6px | `design-system/components/section-header.md`, data-table `Lead icon` |
| `--lg` | 48px | 24px | 12px | 8px | `design-system/components/inform.md`, `design-system/components/metric-item.md` |
| `--xl` | 56px | 28px | 14px | 10px | — (new 2026-09-04) |

**The ladder is one rule, not five measurements: the glyph is half the box and
the padding is a quarter of it.** Radius is a full circle at every size. The
glyph size is a real declaration now (`.featured-icon > .material-symbols-outlined`),
where before every size inherited the package's 20px base — so `--sm` gets
smaller and `--lg` gets bigger than they drew before this sync.

| Tone | DS name | Surface | Surface under `--ring` | Glyph | Ring |
|---|---|---|---|---|---|
| Brand (default) | `Brand` | `--utui-color-brand-50` | `--utui-color-brand-100` | `--utui-color-brand-600` | `--utui-color-brand-50` |
| `--success` | `Success` | `--utui-color-green-100` | same | `--utui-color-green-600` | `--utui-color-green-50` |
| `--info` | `Blue` | `--utui-color-blue-100` | same | `--utui-color-blue-600` | `--utui-color-blue-50` |
| `--warning` | `Warning` | `--utui-color-yellow-100` | same | `--utui-color-yellow-600` | `--utui-color-yellow-50` |
| `--neutral` | `Gray` | `--utui-color-neutral-100` | same | `--utui-color-neutral-500` | `--utui-color-neutral-50` |
| `--error` | `Error` | `--utui-color-red-100` | same | `--utui-color-red-600` | `--utui-color-red-50` |
| `--muted` | *(none — local)* | `--utui-color-neutral-400` | same | `--utui-color-text-inverse` | `--utui-color-neutral-300` |

**Brand is the only tone whose surface changes with the theme.** Every other row
is an X/100 disc in both themes; brand is Brand/50 (`bg/brand-primary`) in
`Light circle` and Brand/100 in `Light circle outline`. This is why the CSS
carries `--featured-icon-surface` and `--featured-icon-surface-ring` as separate
properties rather than one background per tone. A plain brand disc is therefore
**paler than it was before 2026-09-04**, when this package painted Brand/100 in
both themes — the change is visible on every section header, metric tile and
folder card that composes an untoned `.featured-icon`.

Two glyph colours were corrected by the same read: `--warning` goes Yellow/600
(the step the set binds; `--utui-color-yellow-600` was added to the primitive
ramp for it) rather than the Yellow/700 this package chose when the tone came
from an instance that named no glyph colour, and `--neutral` goes Neutral/500
(`ic/gray-dark`) rather than Neutral/600.

`--muted` is **not a DS tone** — the set publishes six colours and this is none
of them.

**`--muted` inverts the tone table's rule and is the only one that does.** Every
other row is a pale disc with a dark glyph; this one is a mid-grey disc with a
white glyph, because it exists for a chip on a **subtle surface** rather than on
white. Added 2026-08-26 for the upload pane's unsupported-format illustration
(`design-system/components/file-upload.md` State C, node `12042:69782`), where
`--neutral` was unusable: that tone is a Neutral/100 disc and the pane is
Neutral/100 exactly, so the chip disappeared into its own background.

The node draws the chip as `rgba(52,64,84,0.4)` over the pane, which composites to
`#A8ACB5`; Neutral/400 is the nearest primitive, at 2.24:1 against the pane where
the frame's own chip is 2.07:1. The backdrop blur is not reproduced — nothing sits
behind the chip once the illustration around it is reduced to it (see
`design-system/components/empty-state.md`), so a `backdrop-filter` would cost a
compositing layer for no picture.

**Choosing between `--neutral` and `--muted`:** on `--utui-color-bg-surface`
(white) use `--neutral`; `--muted` is heavier there than any frame draws. On
`--utui-color-bg-surface-subtle` use `--muted`; `--neutral` is invisible there.
Neither figure is a 1.4.3 or 1.4.11 subject — the chip is always `aria-hidden`
decoration — but a mark that cannot be made out is not worth drawing.

~~There is no red/error tone.~~ **Added 2026-08-14**, read off the tone as the
`Modal` component set composes it in its destructive types
(`SFo9P9PCVQiuOk2SqjZYKQ`, `1111:1774` → `FeaturedIcon color=Error`, with the
`alert-circle` glyph). The set gives the surface and the ring; the glyph is the
ramp's 600 level, following `--success` and `--info`.

Why it mattered more than a missing tone usually does: a consumer that composes
`.featured-icon--lg` with no tone gets the **brand** amber, so before this a delete
confirmation wore the same tone as a save confirmation — the one tone a destructive
dialog must not have. The gap `design-system/components/notification.md` records is closed by the
same rule.

### `--ring` — the `Light circle outline` theme

The tinted disc inside a halo one ramp step lighter than its own fill. The halo is
a spread `box-shadow`, not a border, so it grows **outside** the box and the
parent's gap stays as drawn — consumers must expect it to bleed into their own
padding, which is the drawn look.

| Size | Ring width | Token |
|---|---|---|
| `--xs` | 2px | `--utui-featured-icon-ring-xs` |
| `--sm` | 4px | `--utui-featured-icon-ring-sm` |
| Default (`md`) | 6px | `--utui-featured-icon-ring-md` |
| `--lg` | 8px | `--utui-featured-icon-ring-lg` |
| `--xl` | 10px | `--utui-featured-icon-ring-xl` |

**The 40px size rings at 6px, not 8px.** Until 2026-09-04 this file published one
value for every size above `--sm`, taken from a 48px instance; the set steps the
ring 2px per size. `--utui-featured-icon-ring` survives as an alias of the `--lg`
step because `styles/metric-item.css` reaches for it directly at 48px, and
`styles/attachment.css`' 6px override (`--utui-attachment-icon-ring`) turns out to
be the drawn `md` value rather than a deviation from it.

The set draws the halo as an *inside* border, which would eat 2×ring off the disc.
It stays a spread shadow here so the disc keeps the diameter its size modifier
promises and the ring keeps its drawn width.

Each tone publishes its ring colour as a local `--featured-icon-ring-color`, so
`--ring` is one declaration rather than one per tone; the property is inert on the
tones' non-ring uses. `.metric-tile__icon` still carries its own copy of this
treatment — see Known Gaps.

**A ring's parent must not be a clipping box on the side the ring touches
first.** Because the shadow bleeds outside the icon's own box, the FIRST
container whose `overflow` is not `visible` on both axes clips it — and an
`overflow-y: auto` box computes its other axis to `auto` too, per spec, so
"only one axis scrolls" does not mean "only one axis clips." `design-system/components/modal.md`'s
`.modal__content` is exactly that: the icon is its first child, so the ring
was cropped on the corner with no preceding sibling to have already bled into.
The fix lives in `styles/modal.css` (padding equal to `--utui-featured-icon-ring`
on the touching sides, cancelled by an equal negative margin) rather than here,
because the obligation is the clipping container's, not the icon's — but any
other component that puts a `--ring` icon flush against its own scrolling edge
inherits the same trap.

## Usage

Pick the tone from the *subject*, not from the state of the data — a section
about money is not "success" because its values are healthy. In
`design-system/patterns/item-detail.md` the tone is fixed per section and does not change with
content.

Do not use it as a status indicator; that is `design-system/components/badge.md`.

## Accessibility

Always `aria-hidden`. The glyph must never be the only carrier of meaning, and
tone must never be the only difference between two adjacent items.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.featured-icon` and tone/size/theme modifiers in `styles/featured-icon.css` |
| Examples | `screens/du-an/ho-so/danh-sach.html`; `--sm --ring` in `scripts/notification.js` |

## Known Gaps

- Consolidation is incomplete: `.metric-tile__icon`, `.cell-lead__icon` and
  `.empty-block__icon` each still carry their own copy of this treatment rather
  than composing `.featured-icon`. Migrating them is a follow-up.
- ~~The glyph size inside the 40px box varies by usage and is not yet
  tokenised.~~ **Closed 2026-09-04**: the set sizes the glyph at half the box at
  every step, and `--utui-featured-icon-glyph-*` now publishes the ladder. Any
  instance drawn with a 24px glyph in a 40px box is an instance overriding the
  component, not a second `md` size.
- ~~The `--sm` ring width (4px) could not be isolated in the `Notification`
  payload.~~ **Closed 2026-09-04** — the set's `Size=sm, Theme=Light circle
  outline` variants ring at exactly 4px, and the whole ladder is now attested.
- Nothing composes `--xs` or `--xl` yet. They exist because the set publishes
  them; the first consumer should check the glyph at 12px still reads as the mark
  it is meant to be.
