# Filter Panel

> **Read the 2026-08-14 revision first.** Everything from `## Purpose` down to
> that heading describes the **Untitled UI community file's** `filter-panel` — an
> inline toolbar that expands into a select grid. No screen in this package
> implements it, and the class names, React sources and prototype paths its
> *Code Mapping* and *Class Contract* rows cite do not exist here. What is built
> is MDM V2's `filter-expand` popover, specified in the revisions below; its
> toolbar row was promoted out to `design-system/components/listing-toolbar.md`.

## Purpose

Filter Panel groups search, date range, and expandable filters above an
operational list or data table. It follows the Figma component set with two
variants: collapsed toolbar by default and expanded toolbar with a direct filter
field grid.

## Source

| Source | Reference |
|---|---|
| Figma component set | Untitled UI community file, node `9629:3100`, component `filter-panel` |
| Figma variant: collapse | Node `9629:3099`, `Property 1=collapse`, `1014 x 68` |
| Figma variant: expand | Node `9629:3122`, `Property 1=expand`, `1014 x 248` |
| Figma component set: trigger | OMEU Design System V2, `SFo9P9PCVQiuOk2SqjZYKQ`, node `10094:9732`, component `Filter` — `State=Default` `10094:9519`, `State=Focus` `10094:9733`, `State=Active` `10100:10840`. Read 2026-09-04; this is the authority for the trigger. |
| Figma component: the popover | OMEU Design System V2, `SFo9P9PCVQiuOk2SqjZYKQ`, node `10094:9535`, component `Filter/Expand`, `698 x 360` at its six drawn rows. Read 2026-09-16. **This is the authority for the panel shell**, the field chip and the footer — it sits beside the trigger set above, in the file that is this package's token truth. The MDM V2 product component `10780:73530` stays the evidence for *composition*: which fields a screen offers and what applying them does. |
| React source dependencies | `react-main/components/base/input/input.tsx`, `react-main/components/base/select/select.tsx`, `react-main/components/base/buttons/button.tsx`, `react-main/components/application/date-picker/date-range-picker.tsx` |
| Prototype implementation | `docs/sprint-v2/design/prototype/rfp-list.html`, `docs/sprint-v2/design/prototype/rfp.css` |

## Anatomy

- Panel container with neutral background and rounded corners.
- Toolbar row.
- Leading search input.
- Trailing date range button.
- Trailing filter trigger button.
- Expanded body containing a responsive select grid.
- Accessible region label via `aria-label`; visible screen title, result count,
  clear action, and applied chips stay outside this component unless a separate
  product-specific extension is defined.

## Variants

| Variant | Use |
|---|---|
| Collapse | Default. Search, date range, and filter trigger only. Filter body is hidden. |
| Expand | Search, date range, active filter trigger, and visible select grid. |
| Mobile stacked | Search, date range, filter trigger, then fields in a single column. |

## States

- Default collapsed.
- Expanded.
- Hover on action buttons and field controls.
- Focus on search, selects, date picker, and action buttons.
- Filtered, reflected by control values and the external list/table result
  region.
- Empty result, owned by the list/table region below the panel.
- Loading, with disabled controls or `aria-busy` on the related list region.
- Error, when filter metadata cannot load.
- Disabled or readonly, when the user lacks permission to change filters.

## Tokens

| Role | Token |
|---|---|
| Panel background | `--utui-color-neutral-50` |
| Panel radius | `--radius-xl` or `--utui-card-radius` |
| Search/select background | `--utui-field-bg` |
| Search/select border | `--utui-field-border` |
| Search/select focus | `--utui-field-focus-shadow` |
| Search/select text | `--utui-field-text` |
| Placeholder text | `--utui-field-placeholder` |
| Button background/border/text | `--utui-button-*` |
| Label text | `--utui-color-text-secondary` |
| Icon color | `--utui-color-text-secondary` |
| Gap and padding | `--utui-spacing-03`, `--utui-spacing-04`, `--utui-spacing-06` |
| Trigger, applied | `--utui-filter-trigger-active-border-width`, `--utui-filter-trigger-active-border`, `--utui-filter-trigger-active-shadow` |
| Trigger count badge | `.badge--brand` (Brand/50 fill, Brand/500 label — the frame's two values, exactly) |

## Layout Contract

- Keep the primary search field first in source order.
- Collapse variant height is one toolbar row; body must be hidden via
  `hidden` or equivalent state.
- Toolbar uses left search and right-aligned date/filter actions.
- Expanded filter fields use a 3-column responsive grid; each field owns its
  label and native control.
- On narrow viewports, stack search, actions, and fields vertically; do not let
  flex-basis values create extra height.
- The panel may wrap, but it must not create page-level horizontal overflow.
- The list/table below owns empty, loading, pagination, and row interaction
  states.

## Usage

Use Filter Panel for list screens where users repeatedly scan, compare, and
triage records. Collapse is the default state; expand only when users ask for
field-level filtering.

For HSMT listing, the recommended fields are search, trạng thái, bước quy
trình, hình thức lựa chọn nhà thầu, phụ trách, and optional date/deadline range.

Avoid placing unrelated record actions inside Filter Panel. Export, create,
clear-all, result counts, and applied chips should stay in the page header,
table header/footer, or a product-specific extension unless the Figma component
is intentionally extended.

## Accessibility

- Use a labelled region such as `aria-label="Tìm kiếm và lọc..."`.
- Search input must have an accessible label or visible label.
- Native selects need associated labels.
- Filter trigger must expose `aria-expanded` and `aria-controls`.
- Collapse state must remove hidden fields from keyboard flow.
- Preserve logical focus order: search, date range, filter trigger, fields, then
  table/list.
- When filters update the list asynchronously, update a polite live region or
  the table region state.

## Code Mapping

**The rows below belong to the superseded community component.** For what the
package actually renders, see *Built implementation* underneath them.

| Surface | File |
|---|---|
| Component contract | `design-system/components/filter-panel.md` |
| HSMT static markup | `../docs/sprint-v2/design/prototype/rfp-list.html` — **not in this repository** |
| HSMT CSS classes | `../docs/sprint-v2/design/prototype/rfp.css` — **not in this repository** |
| Input treatment | `react-main/components/base/input/input.tsx` — **not in this repository** |
| Select treatment | `react-main/components/base/select/select.tsx` — **not in this repository** |
| Button treatment | `react-main/components/base/buttons/button.tsx` — **not in this repository** |
| Date range treatment | `react-main/components/application/date-picker/date-range-picker.tsx` — **not in this repository** |

### Built implementation

| Surface | File |
|---|---|
| Popover CSS | `.filter-panel`, `.filter-panel__scroll`, `.filter-panel__rows`, `.filter-panel__footer`, `.filter-row`, `.filter-row__group`, `.filter-row__field`, `.filter-row__field-label`, `.filter-op-static` (static operator for a one-operator type, e.g. `Là một trong`) in `styles/filter-panel.css` |
| Trigger CSS | `.filter-trigger`, `.filter-trigger__count` in the same file; the count is a `.badge--sm.badge--brand.badge--no-dot` |
| Toolbar row | `.listing-toolbar*` in `styles/listing-toolbar.css` — `design-system/components/listing-toolbar.md`, not this contract |
| Examples | `screens/du-an/danh-sach.html`, `screens/du-an/ho-so/danh-sach.html`, `screens/du-an/ho-so/hang-doi.html`, `screens/cong-ty/danh-sach.html`, `screens/doi-tac/danh-sach.html`, and the investor drawer in `screens/du-an/chi-tiet.html`; the rows are built by each bundle |
| Composition (fields, operators, applying) | `design-system/patterns/filter.md` |

The row is three columns — `200px` field name, `142px` operator, the value
filling the rest — inside `.filter-row__group`, which carries the `role="group"`
and the field name as its label. The field-name chip is a static, `aria-hidden`
`<span>` holding **the label and nothing else**: no leading glyph. The `Bộ lọc`
trigger keeps its own `filter_list` icon, which is a different element and is
drawn by the DS `Filter` set.

```html
<li class="filter-row">
  <div class="filter-row__group" role="group" aria-label="Tên dự án">
    <span class="filter-row__field" aria-hidden="true">
      <span class="filter-row__field-label">Tên dự án</span>
    </span>
    <select class="form-field__control" aria-label="Điều kiện">…</select>
    <select class="form-field__control" aria-label="Giá trị">…</select>
  </div>
</li>
```

## Class Contract For Static HTML

**Superseded.** The markup below is the community component's and is rendered
nowhere in this package — `.filter-panel__row`, `__control`, `__search`,
`__actions`, `__button`, `__date`, `__trigger`, `__body`, `__fields` and
`.filter-panel--expanded` have no rule in `styles/filter-panel.css`. The built
markup is in the revisions below.

Collapse, default:

```html
<section class="filter-panel" data-component="filter-panel" data-variant="collapse" aria-label="...">
  <div class="filter-panel__row">
    <label class="filter-panel__control filter-panel__search">...</label>
    <div class="filter-panel__actions">
      <button class="filter-panel__button filter-panel__date" type="button">...</button>
      <button class="filter-panel__button filter-panel__trigger" type="button" aria-expanded="false" aria-controls="..." data-action="toggle-filters">...</button>
    </div>
  </div>
  <div class="filter-panel__body" id="..." hidden>
    <div class="filter-panel__fields">...</div>
  </div>
</section>
```

Expand:

```html
<section class="filter-panel filter-panel--expanded" data-component="filter-panel" data-variant="expand" aria-label="...">
  <div class="filter-panel__row">
    <label class="filter-panel__control filter-panel__search">...</label>
    <div class="filter-panel__actions">
      <button class="filter-panel__button filter-panel__date" type="button">...</button>
      <button class="filter-panel__button filter-panel__trigger" type="button" aria-expanded="true" aria-controls="..." data-action="toggle-filters">...</button>
    </div>
  </div>
  <div class="filter-panel__body" id="...">
    <div class="filter-panel__fields">...</div>
  </div>
</section>
```

## Notes

The Figma source uses Untitled UI's neutral `#FAFAFA` container, white controls,
`#D4D4D4` borders, `8px` control radius, and `12px` panel radius. The collapse
variant is one 68px toolbar row. The expand variant keeps the same toolbar and
adds a 3-column select grid below it. Map these values to V2 tokens instead of
copying raw Figma values into production code.

## Known Gaps

Accepted, written differences between the DS `Filter/Expand` component
(`10094:9535`) and what this package renders. A value that differs with an entry
here is a decision; the same value with no entry is a defect.

- **The row is 44px; the DS component draws 36px.** Every control in the frame
  is `py 8` on a 20px line box inside a 1px rim, and this package's
  `--utui-field-height` is 44px so that a control clears the 44px touch target
  (`--utui-touch-target-min`). This is not a filter-panel decision — it is the
  package-wide one recorded in
  [`design-system/components/inputs.md`](inputs.md), and this frame
  re-confirms the frame's side of it rather than reopening it. The filter row
  therefore runs 8px taller per row than the frame, and the panel's own
  geometry — width, padding, gaps, column widths — is exact.
- **The operator column spells `Bằng` where the frame draws `=`.** Set
  2026-09-16 against Excel's and Google Sheets' Vietnamese filter vocabulary,
  which is what this product's operators already use daily — Excel ships `Bằng`,
  `Không Bằng`, `Chứa`, `Ở Giữa`, `Trước`, `Sau`, and neither spreadsheet labels
  a condition with a bare glyph. The frame's `=` is sample content inside a
  shell; which operators a field type offers is composition and is owned by
  [`design-system/patterns/filter.md`](../patterns/filter.md), where the full
  mapping and its sources live. The shell itself — geometry, chip, footer — is
  the frame's, exactly.
- **The chip's label is one step darker than the frame.** The DS component binds
  it to `text/tertiary` #667085, which is 4.54:1 on the chip's own Neutral/50
  surface — over the line for a 14px label, but only just.
  `--utui-filter-field-text` is `--utui-color-text-secondary` instead, ~7:1, and
  matches every other static label in the package.
- **The popover's behaviour is hand-copied into six screen bundles.** `du-an/danh-sach.js`,
  `du-an/ho-so/danh-sach.js`, `du-an/ho-so/hang-doi.js`, `du-an/chi-tiet.js`,
  `cong-ty/danh-sach.js` and `doi-tac/danh-sach.js` each carry the same ~200
  lines: draft/applied state, row rendering, the applied count on the trigger,
  fixed positioning with the flip-above clamp, the Tab cycle, the `pointerdown`
  outside-dismiss with its `<select>` guard. The CSS is shared; the behaviour is
  not. It belongs in a `scripts/filter-panel.js` beside `scripts/modal.js`, and
  the extraction has to move every consumer at once — which is why no single
  screen's pass has done it. This was recorded at three copies on 2026-08-14 and
  is at six.
- **Two components share this contract and this class name.** The Untitled UI
  inline panel described above `## Purpose` is unimplemented; the popover is the
  built one. They should be split into two files, or the unbuilt one retired.
  Not done here because the older half is referenced from
  [`design-system/patterns/item-listing.md`](../patterns/item-listing.md).
- **A popover inside a modal surface works only by stacking-context nesting.**
  `.filter-panel` is `z-index: 50` and `.drawer` / `.modal` are `60`. The drawer
  consumer is fine because the overlay establishes a stacking context and the
  popover is inside it; a popover rendered as a sibling of the overlay would
  paint behind the panel.
- **There is no native signal for "a `<select>`'s dropdown is open".** The
  outside-dismiss guard approximates it: a `pointerdown` outside the panel while
  a `<select>` inside it holds focus is treated as the dropdown being dismissed,
  not the panel.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/filter-panel.md`](docs/revisions/filter-panel.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-14 (MDM V2 `filter-expand`, the built variant)
- 2026-08-20 (operator and value controls are `.select`)
- 2026-09-04 (the applied trigger is a rim and a badge, not a fill)
- 2026-09-16 (the panel's source moves to the DS `Filter/Expand` component)
