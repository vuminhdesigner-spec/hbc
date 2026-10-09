# Form Field

## Purpose

Form Field collects structured user input with consistent label, control,
helper, required, and validation behavior.

## Anatomy

- Label.
- Required marker, when applicable.
- Input, select, textarea, date, or number control.
- Optional leading glyph (`.form-field__icon`, 20px) or text add-on
  (`.form-field__affix`) inside the value row.
- Optional trailing glyph slot (`.form-field__status`, 16px), at the field's end
  and outside the value row: standing help normally, an alert once the shell
  carries `--error`.
- Optional helper text.
- Optional validation message.

## Variants

| Variant | Use |
|---|---|
| Text input | Short free-text values. |
| Textarea | Multi-line descriptions or objectives. |
| Select | Controlled option lists. |
| Date/time | Scheduling and deadlines. |
| Number | Capacity and numeric thresholds. |
| Labelled checkbox (`.choice-field`) | A boolean the form grid treats as one field — the `.choice` box with its label beside it, taking `.form-field`'s place in a `.modal__body--form` grid so it lines up with the inputs above. Added 2026-09-16 for `Là liên hệ chính`. It does **not** settle the package's selection-control label composition, which `design-system/components/checkbox.md` holds open: the two screen-local compositions (`.status-choice`, `.col-choice`) are pointer **rows** with hit areas and hover grounds, and this is a field. |

The DS `Input field` set (`SFo9P9PCVQiuOk2SqjZYKQ`, 9825:55767) carries eight
`Type=` values. Two are built — `Default` and `Icon leading` — and the other six
are **not**, because no MDM frame has asked for one yet. They are listed here
with their nodes so the screen that needs one reads the frame instead of
inventing a treatment, and so nobody re-derives what the set already answers:

| Un-built type | Node | What the frame draws |
|---|---|---|
| Leading dropdown | 9825:56480 | A 36px-tall select segment at the head (`text-md` label, 20px chevron, `pl 12`), then the text input at `pl 10 / pr 12`. |
| Trailing dropdown | 9825:56998 | The same segment at the tail. |
| Leading text | 9825:56721 | A text add-on segment (`px 12 / py 8`, left radius only); the input beside it carries **its own** 1px Neutral/300 border, which is what draws the divider. |
| Payment input | 9825:55933 | A card-brand mark leading the value row. |
| Tags | 9825:56238 | Chips before the query, `py 6` instead of `py 8` once filled. Geometry is chip-for-chip the combobox's — the `--utui-select-tag-*` tokens already hold every value. |
| Trailing button | 9825:56744 | A `px 14` button welded to the tail, its own border, right radius only, the field's left. |

## States

- Default.
- Hover.
- Focus.
- Disabled — `.form-field__control--disabled`, or the native `disabled`
  attribute on the control, which the shell reads with `:has()`. The attribute
  is what makes the state real; the class is for a composite shell with no
  single input to test.
- Required.
- Error.
- Success, when confirmation is useful. Not implemented — see Known Gaps.

## Tokens

| Role | Token |
|---|---|
| Background | `--utui-field-bg` |
| Border | `--utui-field-border` |
| Border focus | `--utui-field-border-focus` |
| Error border | `--utui-field-border-error` |
| Text | `--utui-field-text` |
| Placeholder | `--utui-field-placeholder` |
| Required marker | `--utui-color-text-error` |
| Radius | `--utui-field-radius` |
| Disabled fill | `--utui-field-bg-disabled` |
| Disabled text | `--utui-field-text-disabled` |
| Value font (14/20) | `--utui-field-font-size`, `--utui-field-line-height` |
| Textarea shell min height (128px) | `--utui-field-area-min-height` |
| Trailing glyph | `--utui-field-status-size`, `--utui-field-status-color`, `--utui-field-status-error` |

## Usage

Group related fields into sections with clear headings. Mark required fields at
the label level and avoid duplicating the same list in an aside unless the form
has a long validation summary or multi-step review.

## Accessibility

- Labels must be associated with controls by `for` and `id`.
- Native `required` should be set for required fields.
- Required markers should be visually red but not the only accessibility cue.
- Error messages should be programmatically associated in implementation.

## Code Mapping

| Surface | File |
|---|---|
| Field tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Form CSS | `.choice-field`, `.form-field__label`, `.required-marker`, `.form-field__control`, `.form-field__control--area`, `.form-field__control--disabled`, `.form-field__control--error`, `.form-field__control--readonly`, `.form-field__icon`, `.form-field__affix`, `.form-field__status`, `.form-field-row` in `styles/form-field.css` |
| Error message | `.form-field__error` in the same file — the message row under a `--error` control, hidden with `[hidden]` when the field is valid |
| Status dot | `.form-field__dot`, `.form-field__dot--success` in the same file — a leading indicator inside a value row, `aria-hidden`, never the only signal. `success` is the only tone the source draws; `design-system/components/select.md` draws the same dot as `.select__dot` |
| Example form | `Thông tin hồ sơ` in `screens/du-an/ho-so/tai-len.html` |
| Search clear | `.search-field__clear` in `styles/form-field.css`; example in `screens/du-an/ho-so/danh-sach.html` |
| States fixture | `input-field-states.html`, **removed 2026-09-23** (ADR 0011). It carried the two built types across placeholder, filled, disabled, error and read-only; the disabled state and the trailing glyph slot are now instantiated nowhere |


## Known Gaps

The gaps recorded against this contract. Each is an **accepted** deviation:
do not re-fix one, and do not invent a value it says is missing. What each
gap is, what was measured and what it costs live in [`docs/revisions/form-field.md`](docs/revisions/form-field.md#known-gaps)
— read the entry your change touches, not the file.

- **No visible legend for the required `*` (2026-09-30, USER DECISION).** `#createDrawer` dropped its "Bổ sung các thông tin bắt buộc *…" line; sighted users rely on the `*` convention (WCAG 3.3.2 technique H90 not met). Screen readers still get the sr-only "(bắt buộc)" in each label and `required` on text inputs.

| Gap |
|---|
| ~~`--utui-field-placeholder` fails contrast, everywhere~~ **Resolved** — the token resolves to Neutral/500, re-measured 2026-09-04 at 4.74:1 on white |
| No date picker |
| No success treatment is implemented |
| Six of the frame's eight input types are not built (see Variants) |
| The frame fills a disabled control Neutral/50; the package keeps Neutral/100 so disabled and read-only stay apart |
| The frame's focus is a 2px Brand/300 rim and no halo; the package draws a 1px Brand/600 rim plus the shared focus ring (2px white gap + 2px Brand/500, `--utui-focus-brand`; USER DECISION 2026-09-30 — the old Brand/300 rim + Brand/100 halo measured 1.97:1 / ~1.2:1, under WCAG 1.4.11) |
| Every error role resolves through the RED ramp, not the frame's Error ramp |
| The control is 44px; the frame draws 38px |
| Figma draws label/hint/placeholder in the gray ramp (#344054 label, #667085 hint/placeholder); ds standardizes on neutral, so the mismatch is on the Figma side (USER DECISION) |
| Figma names the focus style "brand-100" but its hex #faf5ed is brand-50 — design should fix the name |
| Helper text has no authored part |
| `.form-field__hint` exists, and it was OFFERED AND DECLINED on `screens/du-an/ho-so/tai-len` |
| A screen-owned group of related fields has no way to carry a group name |
| ~~`.field` / `.search-field` are a different control~~ **Resolved 2026-09-03.** Both now consume `--utui-field-height` (44px); see [`docs/revisions/form-field.md`](docs/revisions/form-field.md#known-gaps) |

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/form-field.md`](docs/revisions/form-field.md). Read a revision when you need to know *why* a rule above
reads the way it does; the rules above are the contract and are current.

- 2026-08-13 (`Tải lên hồ sơ`, first implemented form)
- 2026-08-14 (`Tạo dự án mới`: read-only fill and status dot)
- 2026-08-14 (`.search-field` gains a clear affordance)
- 2026-08-14 (`Slide out menu`: the first real selection control)
- 2026-08-19 (`.form-field__hint`, and where the combobox starts)
- 2026-08-20 (label weight, and the gap the grid cannot draw)
- 2026-08-22 (hint text is for the user, never for the team)
- 2026-08-22 (a group of quantities: the label moves beside the control)
- 2026-08-22c (a pair aligns row by row, and a hint belongs to a field)
- 2026-08-22d (a group whose panel already names it)
- 2026-08-22e (`Ảnh dự án`: a picture is a field, and its control is a file input)
- 2026-08-26 (both `.doc-kind` revisions are superseded; the reasoning is not)
- 2026-08-26c (a uniform grid is not a run of pairs)
- 2026-08-26d (a field never stretches its own tracks)
- 2026-09-04 (synced against the DS `Input field` set: the disabled state, the trailing glyph slot, and the six types that stay unbuilt)
- 2026-10-01 (`Textarea input field` 1238:278: value 14/20 for every control incl. `.search-field` and select trigger; textarea shell 128px via `--utui-field-area-min-height`; legacy `.form-field textarea` removed)
