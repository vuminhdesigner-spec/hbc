# Badge

## Purpose

Badge is the small pill that qualifies something else — a record's status, a
count on a tree row, an identifier beside a page title. It never stands alone
and never carries an action.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Badge`, node `1046:3819`, 2259 x 588 |
| Reviewed instances | MDM V2 `pat-listing` (`10254:53657`) — page-header codes, tree counts, table status |
| Canvas | `↳ Badges`, node `12:539` — also carries `_Badge base` and a separate `Badge group` component set (see below) |
| Reviewed via | Figma REST API (`/v1/files/…/nodes`), 2026-08-03 |

## Two Different "Badge Groups"

The name `Badge group` refers to **two unrelated things** in this design system.
Do not conflate them:

| Name | What it is | Class |
|---|---|---|
| `Badge group` **slot** on `Page Header` (`9794:12221`) | A plain horizontal row of identifier badges — `DA3019`, `LBV`, `B7`. Gap 8px, `align-items: center`. No container styling of its own. | `.badge-group` |
| `Badge group` **component set** (on the `↳ Badges` canvas) | An announcement banner: a brand-tinted pill containing a small white `Badge` ("New feature"), a message, and a trailing arrow. Two children, md/lg sizes, gap 8/12px. | **not implemented** |

`.badge-group` implements the **slot**, matching the Page Header's own slot
name. The component set is unused by any V2 screen and has no CSS. If it is
ever built, it needs a different class name.

## Variants

Three axes, giving 3 x 8 x 13 combinations.

| Axis | Options |
|---|---|
| `Size` | `sm`, `md`, `lg` |
| `Icon` | `False`, `Dot`, `Country`, `X close`, `Avatar`, `Icon right`, `Icon left`, `Only` |
| `Color` | `Brand`, `Gray`, `Error`, `Warning`, `Success`, `Slate`, `Sky`, `Blue`, `Indigo`, `Purple`, `Pink`, `Rose`, `Orange` |

### Size

| Size | Height | Padding | Type |
|---|---|---|---|
| `sm` | 22px | 2px 8px 2px 6px | 12px / 18px, medium |
| `md` | 24px | 2px 10px 2px 8px | 14px / 20px, medium |
| `lg` | 28px | 4px 12px 4px 10px | 14px / 20px, medium |

Radius is 16px at every size.

Gap and padding depend on the `Icon` axis, and the padding **mirrors**:

| Icon | Gap | Padding (md) |
|---|---|---|
| `Dot` | 6px | `2px 10px 2px 8px` — tighter on the dot side |
| `Icon left` | 4px | `2px 8px 2px 10px` — tighter on the label side |

### Colour

Each colour resolves to a 50-level surface and a 600/700-level text from the
same primitive ramp — e.g. `Brand` is `--utui-color-brand-50` on
`--utui-color-brand-600`, `Gray` is `--utui-color-neutral-100` on
`--utui-color-neutral-700`. Badges have no border.

## Usage in the V2 screens

| Use | Variant |
|---|---|
| Table status cell | `sm` / `Dot` / status colour |
| Category tree count | `sm` / `False` / `Gray` |
| Page-header identifier | `md` / `Icon left` / `Gray`, glyph `info` |

The page-header identifier used `Brand` until 2026-08-04, when it was switched
to `Gray` for label contrast (3.87:1 → 9.51:1). With blend mode now implemented
(below), `Brand` is legible again and matches the original Figma spec — the
switch to `Gray` can be reverted if that is the intended colour.

## Blend Mode

The Figma component composites with **`multiply`**, implemented as
`mix-blend-mode: multiply` on `.badge`. This is not decorative — it is what
makes the badge work on more than one surface:

| Backdrop | `Brand` fill renders as |
|---|---|
| White card or table row | `#FAF5ED` — unchanged, because multiply is identity against white |
| Page gradient (`#F9F5EF`) | `#F4EBDE` — self-darkened, so the pill separates |

Without it, the fill is composited flat and any `50`/`100`-tier badge sits
within a couple of RGB units of the page background, which is why the
page-header identifiers appeared to have no background at all. Labels are
essentially unaffected (`#404040` → `#3E3D3C`).

Blending resolves against the nearest stacking context. In the MDM screens
that is `.page-sticky` (`position: sticky` + `z-index`), which paints the page
gradient itself, so the badge blends against the correct backdrop. Introducing
`isolation: isolate`, `opacity`, `transform` or `filter` on any ancestor
between the badge and the surface it should blend with will silently break
this.

In the `Brand` colour the label is **Brand/500** (#A67038) while the leading
icon glyph is **Brand/600** (#8C5926) — they are not the same value. `Gray` has
no separate icon rule, so its glyph inherits the label colour (Neutral/700).
Icons come from Material Symbols, matching the rest of this package.

Status colour mapping used by the MDM listing screens, re-read 2026-08-14 from
the status columns each screen draws:

| Screen | Column | Value | Colour |
|---|---|---|---|
| `Hồ sơ dự án` | Trạng thái lưu trữ | *(the two-value axis was retired 2026-08-22d)* | *(five request states — see the 2026-08-22 revision)* |
| `Hồ sơ dự án` | Trạng thái hồ sơ | Hiệu lực | `Success` |
| `Hồ sơ dự án` | Trạng thái hồ sơ | Hết hiệu lực | `Gray` |
| `Danh sách dự án` | Trạng thái | Kinh doanh, Vận hành | `Success` |
| `Danh sách dự án` | Trạng thái | Tiền dự án | `Blue` |
| `Danh sách dự án` | Trạng thái | Thi công xây dựng | `Blue` |
| `Danh sách dự án` | Trạng thái | Phát triển sản phẩm | `Blue` (inferred) |

`Danh sách dự án`'s column carries the project **phase**, not a lifecycle state —
the same four values its metric tiles count. `Phát triển sản phẩm` is marked
inferred because no row of the frame sits in that phase; its tone is taken from
the matching tile's Blue featured icon.

The older processing-state axis (`Đã xử lý` `Success` / `Đang xử lý` `Blue` /
`Chờ phê duyệt` `Warning` / `Nháp` `Gray`) survives only in the `Hồ sơ dự án`
filter panel's `Trạng thái` facet; no table column renders it.

### Status modifiers vs ramp modifiers

Most colour modifiers in `badge.css` are named for a *status* (`--success`,
`--pending`, `--paused`, `--cancelled`) because that was the only use.
`.badge--cancelled` shares one rule block with `.badge--error` — red-50 surface,
red-500 dot, red-700 label — so it is a name for the Error treatment, not a
fourteenth colour. Recorded 2026-09-23; it had been in `badge.css` undocumented. `Phân cấp`'s
`Loại dự án` column is a **classification**, not a status — `Khu đô thị` and
`Dự án bất động sản` are project types — so it uses ramp-named aliases added
2026-08-13: `.badge--blue` and `.badge--green`. Each shares one rule with its
status sibling, so nothing moves visually; the point is that the markup does not
claim a state the data does not have. Prefer the ramp name whenever the value
being shown is a category.

Deviation, recorded not fixed: the frame draws that green label at **green-600**
(#16A34A) while `.badge--green` renders **green-700** (#15803D), the value every
other V2 badge already uses. One ramp step on one column is not worth splitting
the rule; take it to the DS owner with the other set-vs-instance differences.

## States

Badge has no interactive states. The `X close` icon variant is the one
exception: its close affordance is a button and follows
`design-system/components/button.md` for hover and focus.

**A badge the document hides stays hidden — `.badge[hidden]` restores
`display: none`** (added 2026-08-16). The base `.badge` is `display: inline-flex`,
an author rule that beats the UA's `[hidden] { display: none }`, so a badge
authored `hidden` painted anyway — and a count badge is authored with no text, so
what painted was an empty pill. That is how the `Bộ lọc` count on `project-docs`
(`#filterCount`, hidden in the markup so its id exists from first paint while JS
owns the attribute) showed a grey pill beside the trigger on first load, against a
frame that draws no badge there. Any badge whose visibility a script owns may be
authored `hidden`; it does not need a screen-local override. Same trap and same
one-line answer as `.button-group[hidden]`, `.metric-scroller__arrow[hidden]` and
`.form-field__error[hidden]`.

## Tokens

| Role | Token |
|---|---|
| Radius | 16px |
| Gap | 6px (`Dot`) / 4px (`Icon left`) |
| Surface | `--utui-color-<ramp>-50` / `--utui-color-neutral-100` |
| Text | `--utui-color-<ramp>-500` / `-600` / `-700`, by ramp |
| Type (sm) | `--utui-font-size-text-xs`, medium |
| Type (md/lg) | `--utui-font-size-text-sm`, medium |

This component introduces no new tokens.

## Accessibility

- Status must never be conveyed by colour alone — use the `Dot` variant plus a
  text label, which is why the table status column mandates it.
- A badge that duplicates adjacent text should be `aria-hidden`; a badge
  carrying unique information (a count, a code) must stay in the accessible
  name of its row.
- Contrast: the 50-level surface with 600-level text meets AA at these type
  sizes. Do not restyle a badge to a mid-ramp surface.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.badge`, `.badge[hidden]`, `.badge--sm/--md/--lg`, `.badge--no-dot`, `.badge--icon-left`, colour modifiers in `styles/badge.css` |
| Examples | `screens/du-an/ho-so/danh-sach.html` (all three uses, and a `.badge--warning` consumer — `Chờ bàn giao`, via `archiveStateMap` in its bundle), `screens/du-an/phan-cap.html` and `screens/du-an/danh-sach.html` (ramp-named `.badge--blue` / `.badge--green` for a classification column — project type and project phase respectively) |

```html
<span class="badge badge--sm badge--success">Đã xử lý</span>
<span class="badge badge--sm badge--gray badge--no-dot">10</span>
<span class="badge badge--md badge--gray badge--icon-left badge--no-dot">
  <span class="material-symbols-outlined badge__icon" aria-hidden="true">info</span>DA3019
</span>
```

## Known Gaps

- **The implementation inverts the `Icon` axis default.** In Figma the default
  is `Icon=False` and the dot is opt-in; in CSS `.badge` paints the dot by
  default and `.badge--no-dot` opts out. This is deliberate — every existing V2
  demo relies on the dot appearing without a modifier, and flipping it would
  silently drop the status dot from screens that depend on it. Revisit if the
  demos are ever migrated together.
- Only `False`, `Dot`, and `Icon left` are implemented. `Country`, `X close`,
  `Avatar`, `Icon right`, and `Only` have no CSS.
- Only `Brand`, `Gray`, `Success`, `Blue`, `Warning`, `Error` are implemented
  as colour modifiers. The remaining seven ramps (`Slate`, `Sky`, `Indigo`,
  `Purple`, `Pink`, `Rose`, `Orange`) exist in Figma but have no `.badge--*`
  class. The underlying **primitives** for those ramps were added on 2026-08-03
  (see `design-system/tokens/css/untitled-ui-primitive.css`), so the classes are now a small
  mechanical addition rather than blocked on tokens.
- `Warning` has two classes. `.badge--warning`/`--yellow` (added 2026-08-14) is
  the correct one: yellow-50 surface, yellow-500 dot, yellow-700 label, the
  values the `Chờ nộp` cells of `Hồ sơ dự án` (10062:13752) drew before that
  column became the archiving request's state, and the values `Chờ bàn giao`
  now takes on it. The older
  `.badge--paused`/`--inactive` maps `Warning` onto the **orange** ramp and is a
  pre-existing approximation, left in place for the screens already on it.
  New Warning uses should take `.badge--warning`.
- **Figma variable names could not be read.** The value-level sync on
  2026-08-03 resolved 52 colour variables off the `↳ Badges` canvas by pairing
  each `boundVariables` alias with its resolved paint; 35 matched an existing
  token exactly. Variable *names* need `/v1/files/:key/variables/local`, which
  returns 403 for this token (missing `file_variables:read`, and the endpoint
  is Enterprise-gated). Until that scope is available, the token file records
  values, not the design system's own variable names.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/badge.md`](docs/revisions/badge.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-22 (the archiving states)
