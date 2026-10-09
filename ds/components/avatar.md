# Avatar

## Purpose

Avatar is the circular identity mark for one person or one organisation. It
answers "whose is this" beside a name, a row, a comment or a menu trigger. It
carries no status of its own beyond presence (the online indicator) and
affiliation (the company badge), and it never stands in for a label — the name
stays in the text next to it.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Avatar`, node `19:1012`, 456 x 2560 |
| Sub-components | `_Avatar online indicator` (`1034:365` md), `_Avatar company icon` (`1036:230` md) |
| Reviewed via | Figma MCP server (`get_metadata`, `get_design_context`, `get_variable_defs`), 2026-08-14 |
| Variants read | one per size for each content and status axis: `19:1256` `19:1121` `19:1016` `1034:556/562/558/560/564` `1217:104703` `1036:195/197/199/201/203` `1217:104695` `19:1108/1119/1125/1129` `1217:104681` `1198:101853` `1198:101869/101873` `1217:104649` |

No V2 screen consumes this component yet — it is a contract-first build. Three
hand-rolled avatar shapes already exist in the demo screens and are **not** this
component; see Known Gaps.

## Anatomy

| Part | Class | Notes |
|---|---|---|
| Circle | `.avatar` | Brand/50 fill, pill radius, no border |
| Photo | `.avatar__image` | Fills the circle, `object-fit: cover` |
| Initials | `.avatar__initials` | 1–2 characters, Medium, Brand/500. A markup hook with no rules of its own — every value is on `.avatar` |
| Placeholder glyph | `.avatar__icon` | Material Symbols `person`, Brand/600 |
| Online indicator | `.avatar__status .avatar__status--online` | Green/500 dot, white ring, flush in the bottom-right corner |
| Company badge | `.avatar__company` + `.avatar__company-image` | Logo image, white ring, 2px **outside** the circle |

Photo, initials and glyph are mutually exclusive — one avatar shows exactly one
of the three. The two status marks are also mutually exclusive: the Figma set has
a single `Status icon` axis, not two independent flags.

## Variants

Five axes in Figma:

| Axis | Options |
|---|---|
| `Size` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl` |
| `Placeholder` | `False`, `True` (the `person` glyph) |
| `Text` | `False`, `True` (initials) |
| `Status icon` | `False`, `Online indicator`, `Company` |
| `State` | `Default`, `Hover`, `Focused` |

`Placeholder` and `Text` are the content axis expressed as two booleans;
`Placeholder=False, Text=False` is the photo. In CSS the content is the child
element, so there is no content modifier class.

### Size ladder

Every metric steps with the size. None of these is interpolated — each is
measured off its own variant.

| Size | Circle | Initials type | Placeholder glyph | Online indicator | Company badge |
|---|---|---|---|---|---|
| `xs` | 24px | text-xs, 12/18 | 16px | 6px | 10px |
| `sm` | 32px | text-sm, 14/20 | 20px | 8px | 12px |
| `md` | 40px | text-md, 16/24 | 24px | 10px | 14px |
| `lg` | 48px | text-lg, 18/28 | 28px | 12px | 16px |
| `xl` | 56px | text-xl, 20/30 | 32px | 14px | 18px |
| `2xl` | 64px | display-xs, 24/32 | 32px | 16px | 20px |

Two things in that table are easy to get wrong by interpolating:

- The **glyph box is not a constant fraction** of the circle. It runs 66.7% of
  the circle at `xs` down to 50% at `2xl`, and `xl` and `2xl` share 32px.
- **`2xl` leaves the text ramp.** Its initials are `display-xs`, not a `text-*`
  step, which is why it is the only size whose type tokens come from the display
  ramp.

Initials are Medium (500) at every size. Radius is the pill token at every size;
the Figma variants draw `200px` / `12px` / `13.333px` on boxes small enough that
all three resolve to a full circle.

### Status marks

| Mark | Fill | Ring | Placement |
|---|---|---|---|
| Online indicator | Green/500 `#22C55E` | 1.5px white | `right: 0; bottom: 0` — flush inside the corner box |
| Company badge | The logo image | 1.5px white | `right: -2px; bottom: -2px` — overhangs the circle |

The 2xl company ring measures 1.667px in Figma. That sub-pixel difference is not
worth a second token; one 1.5px token covers the whole ladder.

The company badge **overhangs its parent's box**. A consumer with tight padding
must leave room for it, the same way `.featured-icon--ring`'s halo bleeds. This
is also why `.avatar` sets no `overflow` clip: a clip on a pill-radius box
follows the circle, so it would cut the corner off the indicator and hide the
company badge entirely. The photo clips itself through the radius it inherits.

## States

| State | Figma | Implementation |
|---|---|---|
| Default | Brand/50 circle | `.avatar` |
| Hover | **Pixel-identical to Default** | no rule |
| Focused | 4px Brand/100 ring | `box-shadow` on `:focus-visible`, interactive avatars only |

Two deliberate departures, both flagged rather than silently absorbed:

1. **Hover draws nothing.** The `State=Hover` variants at every size return the
   same fill, type and geometry as `State=Default`. Rather than invent a tint,
   this implementation writes no hover rule. An interactive avatar therefore has
   pointer feedback (`cursor: pointer`) but no colour feedback — take it to the
   DS owner, because a control that is its own hit target normally needs one.
2. **The focus ring is painted outside.** Figma draws `State=Focused` as a 4px
   Brand/100 stroke on the same 24/40/64px box, i.e. inside the circle, which in
   CSS would crop a photo by 4px on every edge and shrink the initials' box. The
   implementation uses `box-shadow: 0 0 0 4px` instead: same colour, same width,
   painted outside, no layout shift and no cropping.

The ring intentionally does not reuse `--utui-focus-brand`, which pairs the same
4px Brand/100 with `shadow-xs`; the avatar variant carries no shadow.

## Tokens

All in `design-system/tokens/css/untitled-ui-component.css`. This component introduces the
`--utui-avatar-*` family and no new primitives — every colour resolves to an
existing ramp value.

| Role | Token |
|---|---|
| Circle size | `--utui-avatar-size-xs` … `--utui-avatar-size-2xl` |
| Glyph box | `--utui-avatar-icon-size-xs` … `-2xl` |
| Indicator size | `--utui-avatar-indicator-size-xs` … `-2xl` |
| Company size | `--utui-avatar-company-size-xs` … `-2xl` |
| Company offset | `--utui-avatar-company-offset` (-2px) |
| Fill | `--utui-avatar-bg` → `--utui-color-brand-50` |
| Initials | `--utui-avatar-text` → `--utui-color-brand-500` |
| Glyph | `--utui-avatar-icon-color` → `--utui-color-brand-600` |
| Indicator fill | `--utui-avatar-indicator-online` → `--utui-color-green-500` |
| Status ring | `--utui-avatar-status-ring` / `--utui-avatar-status-ring-width` |
| Focus ring | `--utui-avatar-focus-ring` → 4px `--utui-color-brand-100` |
| Radius | `--app-radius-pill` |
| Type | `--utui-font-size-text-*` / `--utui-font-size-display-xs` + `--utui-font-weight-medium` |

Inside `avatar.css` the size classes set local `--avatar-*` properties from
those tokens, and every part reads the local property. Consumers set the size
class; they must not set the local properties.

## Usage

| Use | Variant |
|---|---|
| Table user cell, side-nav profile row | `sm` (32px) |
| Comment or activity row, form owner field | `md` (40px) |
| Detail-page identity block | `xl` / `2xl` |
| Dense chip or breadcrumb trailing mark | `xs` |

Initials are 1–2 characters. Longer strings are not truncated by the component —
the caller derives the initials, as the existing screens' `initials()` helpers
already do.

## Accessibility

- The avatar is decorative whenever the name it belongs to is already in the
  text next to it: `aria-hidden="true"` on the avatar, and `alt=""` on a photo.
  Do not repeat the name in an `alt` and in the adjacent label — a screen reader
  then announces the person twice per row.
- When an avatar is the **only** identification of a person (a bare stack of
  collaborators, an avatar-only menu trigger), it must carry the name: `alt` on
  the photo, or `aria-label` on the interactive element.
- The online indicator conveys meaning by colour and shape alone. It must not be
  the only signal of availability in a view — pair it with text wherever
  presence affects a decision (the same rule badge.md applies to status).
- An interactive avatar must be a real `button` or `a`, never a `div` with a
  click handler, and keeps the 4px focus ring. Note the 24/32px sizes fall below
  the 44px touch target of `.claude/skills/responsive/SKILL.md`; at those sizes the avatar
  should sit inside a larger hit area rather than being the target itself.
- Contrast: Brand/500 initials on Brand/50 measure **3.85:1** (computed
  2026-08-14 from `#A67038` on `#FAF5ED`). That is below the 4.5:1 AA threshold
  for normal text at every size from `xs` to `xl`; only `2xl` clears AA, and only
  because 24px counts as large text against the 3:1 threshold. The same ~3.85:1
  pairing is what `badge.md` records for its Brand label. Treat initials as a
  supporting mark, never as the only readable identification of a person, and see
  the Known Gap below.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.avatar`, `.avatar--xs/--sm/--md/--lg/--xl/--2xl`, `.avatar__image`, `.avatar__icon`, `.avatar__status`, `.avatar__status--online`, `.avatar__company`, `.avatar__company-image` in `styles/avatar.css`. `.avatar__initials` is a markup hook only — it has no rule of its own, by design (see Anatomy) |
| Tokens | `--utui-avatar-*` in `design-system/tokens/css/untitled-ui-component.css` |
| Barrel | imported last before `responsive.css` in `styles/app.css` — it shares no selector with any file above it, so appending it moves no existing rule in the cascade |
| Examples | none yet — no V2 screen consumes it |

```html
<!-- Photo -->
<span class="avatar avatar--md" aria-hidden="true">
  <img class="avatar__image" src="../assets/user-olivia.jpg" alt="">
</span>

<!-- Initials + online indicator -->
<span class="avatar avatar--sm">
  <span class="avatar__initials">NX</span>
  <span class="avatar__status avatar__status--online"></span>
</span>

<!-- Placeholder, no identity available -->
<span class="avatar avatar--md" aria-hidden="true">
  <span class="material-symbols-outlined avatar__icon">person</span>
</span>

<!-- Company badge -->
<span class="avatar avatar--lg" aria-hidden="true">
  <img class="avatar__image" src="../assets/user-olivia.jpg" alt="">
  <span class="avatar__company">
    <img class="avatar__company-image" src="../assets/brand-mark.svg" alt="">
  </span>
</span>

<!-- Interactive: profile menu trigger -->
<button class="avatar avatar--sm" type="button" aria-label="Tài khoản của tôi">
  <span class="avatar__initials">NX</span>
</button>
```

`.avatar` with no size class is `md`. The Figma set's own default variant is
`xs`; `md` is used here to match `badge.css`, whose unmodified class is likewise
the middle step and not the set's first variant.

## Known Gaps

- **Three hand-rolled avatars in the demo screens are not migrated.** None of
  them matches this component's values, so adopting it would change how
  already-reviewed screens render; each needs its own decision with the DS owner.

  | Existing | Where | How it differs |
  |---|---|---|
  | `.side-profile__avatar` | `side-navigation.css:302`, every screen | 32px on **Brand/500** with light text — an inverted avatar for the dark nav column. The DS set has no dark-surface variant at all. |
  | `.user-cell__avatar` | `data-table.css`, rendered by `du-an/danh-sach.js`, `du-an/ho-so/danh-sach.js` and `du-an/chi-tiet.js` (the `#investorModal` history and picker tables) | 32px on **Brand/100** with Brand/700 initials at **text-xs Semibold**. The DS `sm` is Brand/50 / Brand/500 / text-sm Medium. |
  | `.page-header__avatar` | `page-header.css:22`, three screens (`project-overview`, `project-hierarchy`, `project-docs`) | A **76px** photo circle. The ladder stops at 64px, so `Page Header` uses a size the component set does not publish. |

  `screens/du-an/danh-sach.js` (`userCell`) also notes that its source frame draws a
  **photo** where the demo renders initials, so that cell is a recorded
  approximation independent of this component. The same note used to sit in
  `investor-address.js:160` and `project-investor.js:591`; both bundles were
  deleted on 2026-08-19 with the record's `Chủ đầu tư` tab, and the cell style
  they used survives in the two tables of `#investorModal` on
  `screens/du-an/chi-tiet.html`, which render initials for **companies** — a
  case the source draws with no photo at all.
- **The DS `Hover` state draws nothing** (see States). Unresolved with the DS
  owner; no hover rule was invented to cover it.
- **Brand/500 initials on Brand/50 are 3.85:1, so AA fails at five of the six
  sizes** (`xs`–`xl`; `2xl` passes as large text). The DS specifies this pairing
  at every size, so it is recorded rather than silently darkened. Two candidate
  fixes for the DS owner: move initials to Brand/700 (`#70451C`, the value
  `.user-cell__avatar` already uses — 7.55:1, clears AA), or keep Brand/500 and rule
  that initials are always accompanied by the name in text. This is the same
  Brand-label contrast question `badge.md` raised on 2026-08-04 and answered
  there by switching to `Gray` — the two should be decided together.
- **The placeholder glyph is Material Symbols `person`**, not the Untitled UI
  `user` vector the Figma variants export. This follows the package convention
  (`badge.md` records the same substitution for its leading icons). The glyph box
  sizes match the DS exactly; the drawing differs slightly.
- **No demo consumer.** The CSS ships unexercised, which means the ladder is
  correct by measurement but has not been seen rendered. First screen to adopt it
  should re-check the company badge's overhang against its own padding.
- **Figma variable names still unavailable.** As with `badge.md`, values were
  resolved from the variants' bound paints and type styles;
  `/v1/files/:key/variables/local` remains 403 for this token, so the token file
  records values rather than the design system's own variable names.
