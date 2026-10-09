# Button group

## Purpose

Button group joins two or more equal-weight buttons into one control. Use it
when the buttons are alternatives to each other — a view switch, a mode
toggle, a segmented choice — not when they are unrelated actions that merely
sit next to each other.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Button group`, node `1046:10171`, 862 x 269 |
| Reviewed instance | MDM V2 `pat-listing` (`10254:53657`) filter row — `Size=lg`, icon-only, 2 segments |
| Reviewed via | Figma REST API (`/v1/files/…/nodes`), 2026-08-03 |

## Variants

| Axis | Options |
|---|---|
| `Size` | `sm`, `md`, `lg`, `xl` |
| `Icon` | `False` (label only), `Leading` (icon + label), `Only` (icon only) |

### Geometry

| Size | Height | Segment width, `Icon=Only` | Segment width, `Icon=False` |
|---|---|---|---|
| `sm` | 36px | 36px | 50px |
| `md` | 40px | 44px | 60px |
| `lg` | 44px | 48px | 68px |
| `xl` | 48px | 56px | 76px |

Label-bearing segments size to content; the widths above are the authored
defaults. Container radius is 8px and only the outer corners round — inner
segment corners stay square.

**`Icon=Only`'s width does not step with size — the implementation renders a
fixed 48px at every size modifier.** Reviewed 2026-09-28: the frame's own
widths above run 4–8px wider than the row's height at `md`/`lg`/`xl`
(44/48/56 against 40/44/48) and 36 = 36 at `sm`, so there is no single
"width = height" rule the frame draws either — squaring the box would itself
be a deviation. Left as the existing 48px literal rather than reworked, because
the one live consumer (`danh-sach.html`'s view-mode switch) renders
`.button-group--icon-only` with **no size modifier** — the unstyled default,
44px tall — where 48px is already what ships today; changing it would move
that screen's pixels for no frame this file can point to. `sm`/`md`/`xl`
`Icon=Only` have no consumer to size correctly against the table above — see
Known Gaps.

## Anatomy

- **Container** — one joined row. The group carries the radius and the shadow.
- **Segment** (`_Button group base`) — 1px `--utui-color-border-default`
  border, `--utui-color-bg-surface` background. Adjacent segments share one
  border: every segment after the first drops its left border rather than
  doubling up.
- The Figma component set authors 9 segment slots and hides the unused ones;
  in code, render only the segments you need.
- **Attention dot** (`.button-group__dot`) — a small filled circle inside a
  segment's label, beside its text. It is a drawn cue that the segment's
  category needs attention — **never a count and never an error/status
  colour**; the token is `--utui-color-icon-warning`, chosen because the cue
  means "something here is waiting on you", not "this is broken". Promoted
  2026-09-28 from `.docs-workset__dot` (`screens/du-an/ho-so/hang-doi.css`),
  the segment row that named the rule first.

## Overflow (>4 segments)

Product decision, 2026-09-28: a group with more than 4 segments shows the
first **3** plus a `.button-group__more` ("⋯") trigger; the rest live in a
`.button-group__menu` popover. Picking a menu item swaps it into the group's
own 3rd visible slot — the segment that sat there returns to the menu — so the
active choice is always one of the visible segments, never hidden inside the
menu. Below 5 segments, render plain segments; do not author the overflow
markup for a group that does not need it.

| Part | Class | Spec |
|---|---|---|
| Trigger | `.button-group__more` | Same box as a segment (border, height, radius), glyph-only, right end of the row. `aria-haspopup="menu"`, `aria-expanded`, `aria-label="Thêm lựa chọn"` |
| Menu | `.button-group__menu` | Popover, `position: fixed` — hung off the trigger and placed by `../scripts/button-group.js`, for the same "a scrolling ancestor clips an absolutely-positioned popover" reason `design-system/components/select.md`'s menu is `fixed`. `role="menu"`, `[hidden]` when closed |
| Menu item | `.button-group__menu-item` | `role="menuitemradio"`, `aria-checked`. Carries the same identifying data attribute the segment does (e.g. `data-workset`), so a screen's existing per-segment click handler keeps working on the same element after it moves |

Behaviour (`../scripts/button-group.js`):

- Click the trigger to open/close the menu; `aria-expanded` mirrors state.
- <kbd>↓</kbd>/<kbd>↑</kbd> move a roving highlight between open menu items.
- <kbd>Esc</kbd> closes the menu and returns focus to the trigger, without
  changing selection.
- Activating a menu item **moves that element** into the group, in place of
  the current 3rd visible segment, and moves the displaced segment into the
  menu — element identity is preserved (the DOM node is relocated, not
  cloned), so any click listener a screen already bound to it keeps firing.
  `role`/`aria-checked` are stripped on the way into the row; `role="menuitemradio"`/
  `aria-checked` are added on the way into the menu. A screen's own
  `aria-pressed`/`.is-active` bookkeeping on the visible segments is untouched.
- A click on the trigger or a document press outside the group closes the
  menu; a resize/scroll of the page re-places it while open, same as
  `.select__menu`.

The screen still owns which segment is selected and what selecting one does
(`setWorkset()` in `hang-doi.js`); this component owns only the show/overflow
mechanics and the swap.

## States

| State | Treatment |
|---|---|
| Default | Surface background, default border. |
| Hover | `--utui-color-neutral-50`. |
| Selected | `--utui-color-brand-50` background with brand text. In the reviewed instance the first segment is selected. |
| Disabled | Per `design-system/components/button.md`. |
| Overflow trigger open (`.button-group__more[aria-expanded="true"]`) | Same brand tint as a selected segment — the trigger reads as "engaged" while its menu is open. |
| Menu item selected (`.button-group__menu-item[aria-checked="true"]`) | `--utui-color-brand-50` background with brand text — same treatment as a selected segment, since the item is a stand-in for one. |

Selection is not a Figma variant axis — it is expressed by overriding the
segment fill. Treat "which segment is selected" as application state.

**Known Gap: selected state is colour-only.** Neither a selected segment nor a
selected menu item carries a shape or icon change — `aria-pressed`/`aria-checked`
is the only non-colour signal. No frame authors a second cue; flagged here
rather than invented.

## Tokens

| Role | Token |
|---|---|
| Radius | `--app-radius` (8px) |
| Border | `--utui-color-border-default` |
| Surface | `--utui-color-bg-surface` |
| Hover surface | `--utui-color-neutral-50` |
| Selected surface | `--utui-color-brand-50` |
| Selected text | `--utui-color-brand-600` |
| Shadow | `--utui-shadow-xs` |
| Height | `--utui-button-height-{sm,md,lg,xl}` — 36 / 40 / 44 / 48px |
| `Icon=Only` width | `48px`, literal, does not step with size — see Known Gaps |
| Attention dot | `--utui-field-dot-size`, `--utui-radius-pill`, `--utui-color-icon-warning` |
| Menu offset / radius / border / shadow / padding / z-index | `--utui-button-group-menu-offset`, `-radius`, `-border`, `-shadow`, `-padding-block`, `-z` |

## Usage

Use for mutually exclusive alternatives with a persistent selection — the
document-listing view switch (`Hiển thị theo danh mục` / `Hiển thị dạng bảng`)
is the reference case. Do not use it for a row of independent actions; those
are separate buttons with a gap. Do not use it for navigation between screens
— that is `design-system/components/tab-bar.md`.

2–4 segments render as plain segments. **Above 4, use the overflow markup**
(§ Overflow) rather than letting the row grow past 4 unbounded or reaching for
a select — the segments stay mutually exclusive, scannable alternatives, just
with the least-recently-picked ones folded.

## Accessibility

- Wrap the group in `role="group"` with an `aria-label` naming the choice.
- Icon-only segments need an `aria-label` each; the icon itself is
  `aria-hidden`.
- For a toggle group, each segment carries `aria-pressed`. For a
  single-choice group where one option is always active, `role="radiogroup"`
  with `aria-checked` is the better fit.
- Selection must be visible without relying on colour alone at the smallest
  sizes — pair the brand tint with an icon change or `aria-pressed` state (see
  Known Gap above — no icon change is authored today).
- Overflow trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-label="Thêm
  lựa chọn"`. Menu: `role="menu"`; items `role="menuitemradio"` +
  `aria-checked`. <kbd>Esc</kbd> returns focus to the trigger; arrow keys move
  the highlight; the trigger's own name does not change when the menu opens.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.button-group`, `.button-group__item`, `.button-group--icon-only`, size modifiers, `.button-group__more`, `.button-group__menu`, `.button-group__menu-item`, `.button-group__dot` in `styles/button-group.css` |
| Overflow behaviour | `scripts/button-group.js` |
| Menu tokens | `tokens/css/untitled-ui-component.css` (`--utui-button-group-menu-*`) |
| Example | `screens/du-an/ho-so/danh-sach.html` filter row (plain, `--icon-only`); `screens/du-an/ho-so/hang-doi.html` (`#worksetGroup`, 5 segments — the overflow case) |

```html
<div class="button-group button-group--icon-only" role="group" aria-label="Kiểu hiển thị">
  <button class="button-group__item is-active" type="button" aria-pressed="true" aria-label="Hiển thị theo danh mục">
    <span class="material-symbols-outlined" aria-hidden="true">folder_open</span>
  </button>
  <button class="button-group__item" type="button" aria-pressed="false" aria-label="Hiển thị dạng bảng">
    <span class="material-symbols-outlined" aria-hidden="true">table_chart</span>
  </button>
</div>
```

## Known Gaps

- No selected, hover, focus, or disabled state is authored in the Figma
  component set — the only evidence for the selected treatment is the
  `pat-listing` instance overriding the first segment's fill to
  `--utui-color-brand-50`. Hover and focus are supplied by the implementation
  from `design-system/components/button.md` conventions and should be confirmed.
- `Icon=Leading` and sizes `sm` / `md` / `xl` are specified here but have no
  usage in any V2 screen yet, so their padding is taken from the component set
  rather than from a composed example.
- The relationship to `.segmented` — both rendered a joined row of buttons, one
  as navigation and one as a control — **closed itself on 2026-08-12**, when
  `design-system/patterns/item-listing.md` dropped `.segmented` for
  `.tabs tabs--transparent` (`design-system/components/tab-bar.md`). The group
  never shipped; its stylesheet moved to `styles/legacy/segmented.css` on
  2026-08-21 and it got no contract. This component is now the package's only
  joined row of buttons, so there is no shared base to agree on.
- **`Icon=Only` width does not step with size, reviewed 2026-09-28.** The
  implementation renders a fixed 48px at every size modifier, where the
  component set draws 36/44/48/56 for `sm`/`md`/`lg`/`xl` (not a "square"
  rule either — `sm` is 36 = 36, the rest run 4–8px wider than tall). Left as
  the existing literal rather than reworked to match the frame per-size,
  because the one live consumer (`danh-sach.html`'s view-mode switch) uses
  **no size modifier** and already renders 48px — matching the frame's `lg`
  row by coincidence, not by a rule this file can state generally. `sm` / `md`
  / `xl` combined with `Icon=Only` have no consumer, so implementing the
  frame's per-size widths is deferred rather than done against zero evidence
  of how it should look composed; doing so is also the one style-only change
  in this package that would move an existing screen's pixels with no frame
  to justify it, which is reason enough to leave it be until a consumer needs
  it.
- **The overflow rule (§ Overflow) has no Figma source.** No component set or
  frame draws a `Button group` past 4 segments; the 3-visible/"⋯" behaviour is
  a 2026-09-28 product decision built to fit `hang-doi.html`'s 5-segment
  archive row, reasoned from the design rules rather than measured from a
  frame.
- **The overflow menu borrows `.select__menu`'s `position: fixed` reasoning
  but not its file** — a second, smaller popover implementation
  (`.button-group__menu`) rather than a shared one, because the two differ in
  every other respect (no typing, no filtering, no tags, a handful of rows).
  If a third popover needs the same escape-a-scrolling-ancestor treatment,
  that is the point to factor one out.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/button-group.md`](docs/revisions/button-group.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-21 (`Icon=False` gets its first usage, next to an `Icon=Only`)
- 2026-08-22 (which ARIA idiom a segmented group takes)
- 2026-08-27 (a segment carrying an attention dot, and the row that scrolls)
