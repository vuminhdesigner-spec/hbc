# Section card

## Purpose

Section card is the repeating box `design-system/patterns/item-detail.md` grids into
a record's read view: a bordered, radius-16 surface holding one
`design-system/components/section-header.md` and one of a small set of body shapes.
The card and its 6-column grid are documented here, split out of
`section-header.md` on 2026-09-24 so the box, the grid and the header's own
anatomy each have one contract.

## Source

Same frames as `design-system/components/section-header.md` — MDM - V2
(`tS8dUB2qWLc28gZbtj8IIL`), `Thông tin chi tiết` (`10287:10813`, also read 2026-09-30 in `TpwqqNqhnFgycttdngXmFA`) and
`Chi tiết dự án` (`10553:25814`, `13314:69886`) — plus the partner record's own
flow frame (`TpwqqNqhnFgycttdngXmFA`, `14128:55929`, read 2026-09-16), which is
the source for the card's row order and the `arrow_forward` trailing icon.

## Anatomy

| Part | Class | Spec |
|---|---|---|
| Card | `.section-card` | flex column, 16px radius, 1px `--app-border`, `shadow-xs`, 20px padding and 20px internal gap (moved off the frame's 24px, 2026-09-16 product decision — see `design-system/patterns/item-detail.md` Composition Rules) |
| Grid | `.section-grid` | 6 columns, 20px gutter (`--utui-spacing-05`), `align-items: stretch` so a short card in a row pads rather than shrinking |
| Body wrapper | `.section-body` | flex column, 16px gap; used when a body needs its own layout beyond a bare list |

A card's body is one of: a `.data-list` (`design-system/components/data-viewer.md`,
opt into `--cols` for a wide card that can hold more than one label/value pair
per row), an `.entity-list`
(`design-system/components/entity-row.md`), an `.attachment-list`
(`design-system/components/attachment-list.md`), or an `.empty-state`
(`design-system/components/empty-state.md`). The trailing action and the
optional `.section-more` footer link are `design-system/components/section-header.md`'s.

## The 6-column grid and its spans

`.section-grid` is 6 columns at a 20px gutter — 349 / 534 / 719 / 1088px at the
1088px content width for spans 2 / 3 / 4 / 6. A card is one of four spans:

| Modifier | Span (of 6) | Default use |
|---|---|---|
| `.section-card` (bare) | 2 | the narrow default — most field-group and collection cards |
| `.section-card--wide` | 4 | a wider card, usually paired with a span-2 |
| `.section-card--full` | 6 | one card takes the whole row |
| `.section-card--form` | not on the 6-column grid | a titled section of form fields in a single-column layout (a form's own track, not an `item-detail` read view) — see below |

## `--form` (a form's own section card)

Merged 2026-09-28 from a standalone `form-panel` package (`.form-panel`, ex
`ds/components/form-panel.md`) once a second consumer proved it was the same
box as `.section-card` with two differences: 24px rhythm instead of 20px, and
`shadow-xl` instead of `shadow-xs`. Both are product decisions kept from the
merged component, not a re-reading of a new frame.

| Part | Class | Spec |
|---|---|---|
| Card | `.section-card.section-card--form` | Same box as the bare card, but 24px gap/padding (`--utui-spacing-06`) and `--utui-shadow-xl` |
| Head | `.section-header__bar` (+ `.section-header__lead` around the mark and title) | The same parts `section-header.md`'s `Type=Horizontal` composes — icon, then title, 12px apart. **Never rendered with a divider or a supporting line**: those parts of `section-header.md` are left out of the markup, not hidden by CSS |
| Title | `.section-header__title` | Its own reading under `--form` — `xl/30` semibold, `--app-text` (not the grid header's `lg/28`, `--utui-color-gray-900`) |
| Trailing control | a plain element, second child of `.section-header__bar` | The bar's own `space-between` seats it flush right — a switch, in the one consumer that has one. Do not add a class for this: the bar already does the placement |
| Switch-gated body | `.section-body[hidden]` | The one consumer whose whole body is optional — 24px gap under `--form` (not the grid body's 16px), `[hidden]` re-declares `display: none` so a closed body leaves its fields out of the tab order, not just out of sight |

A card with no gated body carries no `.section-body` at all — its content
(e.g. a `<form>`) is a direct flex child of the card, spaced by the card's own
24px gap, same as any other `.section-card` body.

**What did not survive the merge, and why:**

- `.hardcopy__switch`'s `margin-inline-start: auto` — replaced by
  `.section-header__bar`'s existing `space-between`, which seats the same
  element in the same place with one fewer rule.
- `.hardcopy__label` (`cursor: pointer` only) — now a plain `<label for>`
  inside `.section-header__title`; the cursor rule moved to
  `.section-card--form .section-header__title label` so it stays scoped to a
  head that actually carries a labelled control.
- `.hardcopy__counts` — the 2-up/4-up quantities grid never left screen-local
  CSS: it was never a `ds/` rule (see the pre-merge `form-panel.md` Known Gaps),
  and stays authored per screen (`screens/du-an/ho-so/{chi-tiet,tai-len}.css`).
  **GAP: two screens now carry a byte-similar copy of this rule** — promote it
  if a third consumer needs it.

Consumers: `screens/du-an/ho-so/chi-tiet.html`, `screens/du-an/ho-so/tai-len.html`
(both cards — the switch-gated "Bản cứng kèm theo" and the plain "Thông tin hồ sơ").

Do not introduce a span that does not resolve on this grid — see
`design-system/patterns/item-detail.md` Composition Rules for the row-order and
body-shape rules that go with each span.

## Container for a wide-card body (`section-card`)

A card becomes a **named CSS container** — `container: section-card /
inline-size` — only when it directly holds a `.data-list--cols` body, declared
as `.section-card:has(> .data-list--cols)` in `styles/data-viewer.css` (that
file owns the query the container serves; see its contract). A card with no
such body pays nothing for containment it never queries. See
`design-system/components/data-viewer.md` § Variant `--cols` for the pair-count
rule this container feeds.

## Responsive

Owned in `styles/responsive.css`, tier collapses before any card's internals do:

| Tier | Grid |
|---|---|
| `xl`+ (`>=1280`) | 6 columns, spans as declared |
| `lg` (1024–1279) | spans hold as `xl` — the nav rail gives the width back, rows stay full |
| `md` (768–1023) | 2 equal columns; bare cards span 1, `--wide`/`--full` span 2 (full row) |
| `sm` (`<=767`) | 1 column |

Cards keep their reading order at every tier.

## State

| Class | Look | Owner |
|---|---|---|
| `.is-anchor-target` | `box-shadow: var(--utui-focus-brand)` (2px gap + 2px brand ring, layered over `--utui-shadow-xs`, which the token already includes) | Screen JS, only on screens that have an anchor rail (see anchor-nav.md Usage), set with the active `.anchor-nav__item` (click and scroll spy), on one card at a time. Kept until the pill changes; no transition. On `--form` the ring replaces `--utui-shadow-xl` (accepted). |

## Accessibility

- Each card is a labelled `<section>` (`aria-labelledby` pointing at the
  header's title `id`) with an `id` the page's anchor rail (if present) and deep links target — see
  `design-system/components/anchor-nav.md` and
  `design-system/patterns/item-detail.md`.
- `.is-anchor-target` is a visual cue only: no `focus()`, no `tabindex`, no ARIA on the section (the pill carries `aria-current="location"`). Do not select it with `:focus-visible`/`:focus-within`.
- A section with no data still renders its card with the empty-state body; the
  card and its anchor pill never disappear.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.section-card`, `.section-card--form`, `.section-card.is-anchor-target`, `.section-grid` and its spans, `.section-body`, in `styles/section-card.css`; the `--cols` container declaration lives in `styles/data-viewer.css` |
| Tier collapse | `styles/responsive.css` |
| Contract | `design-system/components/section-card.md` (this file) |
| Consumers | `screens/doi-tac/chi-tiet.html` (`--full`, `--wide`), `screens/du-an/chi-tiet.html` (`--wide` + `--full`, rows 4+2 / 4+2 / 6). `screens/doi-tac/ho-so-nang-luc.html` (`--full` only). `screens/du-an/ho-so/chi-tiet.html`, `screens/du-an/ho-so/tai-len.html` use `--form` |

## Known Gaps

- **`.is-anchor-target` ring vanishes in forced-colors mode** (box-shadow is dropped); no outline added, gap recorded.

- **The card carries no border in the source frame** — only `shadow-xs`.
  `.section-card` adds `1px solid --app-border`, consistent across the package
  and a pre-existing deviation from the frame; a designer call rather than a
  silent removal — carried over from `design-system/components/section-header.md`.
- **`--form`'s rim colour is a recorded gap, not a token match** — carried over
  from the pre-merge `form-panel.md`: `--app-border` (Neutral/200) is one ramp
  across from the source node's own stroke (Gray/200), and no semantic border
  token resolves to it exactly.
- **`--form`'s two-up/four-up quantities grid is not in `ds/`** — see the
  `--form` section above. Recorded rather than promoted because it has exactly
  two consumers today.
