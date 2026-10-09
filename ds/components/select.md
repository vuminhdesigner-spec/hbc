# Select

## Purpose

Select lets a user choose one value — or several — from a list the screen
authors, when an option carries more than a string: an avatar, a status dot, a
supporting handle, or a tick on the row that is already chosen.

**Since 2026-08-20 this is the portal's only dropdown.** Every native `<select>`
in the MDM screens was migrated — 20 form controls, the `Giai đoạn` table cell, and
all three filter panels — on the product decision that one product must not draw
two different dropdowns: closed they were indistinguishable, open one showed the DS
menu (6px rows, hover tint, tick on the chosen row) and the other the platform's
popup. `grep '<select'` over `screens/` and `scripts/` returns comments only.

What that costs, stated rather than discovered: every dropdown in the portal now
depends on `scripts/select.js` being loaded, and on the ARIA contract below being
right — obligations the platform used to meet for free. It buys a menu that matches
the design at every state and one control to reason about.

The native shell is NOT deleted. `.form-field__control select` and
`.cell-input select` still work and are still specified in
`design-system/components/inputs.md` and `data-table.md`, so a consumer outside
this portal — or a screen that must run without JS — has a documented fallback.
No MDM screen uses it.

| The options are… | Use |
|---|---|
| Any list, in an MDM screen | `.select` |
| Rows with an avatar, dot, or supporting text | `.select` (Icon / Avatar / Dot leading) |
| Long enough to need a typed filter | `.select` (type Search) |
| Several values at once, each removable | `.select` (type Tags) |
| Several values, and the user may invent one that is not listed | `.select` (type Tags + `data-select-creatable`) |
| A list that must work with no JavaScript | native `<select>` — see inputs.md |

## Source

DS component set `Select` — `SFo9P9PCVQiuOk2SqjZYKQ`, node `9825:59933`, read
2026-08-19. Six types × five states, 30 variants:

- Types: `Default`, `Icon leading`, `Avatar leading`, `Dot leading`, `Search`,
  `Tags`.
- States: `Placeholder`, `Default`, `Focused`, `Open`, `Disabled`.

The frame draws the menu only on the `Open` row; every other row is the closed
control.

## Anatomy

- Field label, required marker and hint — all three are
  `design-system/components/inputs.md` parts (`.form-field__label`,
  `.required-marker`, `.form-field__hint`). The select is the control inside that
  field, not a field of its own.
- `.select` — the positioning context for the menu.
- `.select__control` — the closed box. A `<button>` on the four untyped types; a
  `<div>` holding a `.select__input` on Search and Tags.
- Leading slot — `.select__lead` (20px glyph), `.avatar.avatar--xs` (24px), or
  `.select__dot` (8px). All decoration; the value text says the same thing.
- `.select__value` → `.select__label` + optional `.select__support`, or
  `.select__placeholder` while nothing is chosen.
- `.select__tags` → `.select__tag` (avatar + text + `.select__tag-remove`), on the
  Tags type only.
- `.select__clear` — the trailing `×` of the typed types.
- `.select__chevron` — the trailing disclosure glyph of the untyped types.
- `.select__menu` → `.select__option` → `.select__option-body` →
  `.select__option-text` + optional `.select__option-support`; plus one optional
  `.select__empty` row.

## Variants

| Type | Markup difference |
|---|---|
| Default | Value row only. |
| Icon leading | `.select__lead` glyph at the head of each option body. |
| Avatar leading | `.avatar.avatar--xs` at the head of each option body. When the body also has a `.select__option-support` line, the name keeps its width (`flex-shrink: 0`) and the support line truncates first (`min-width: 0`, ellipsis, one line). |
| Dot leading | `.select__dot` (tone modifier per frame) at the head. |
| Search | `.select__control` is a `<div>`: leading `search` glyph, `.select__input`, trailing `.select__clear`. The committed value is shown IN the input; re-opening shows the full list with that text selected, so the first keystroke replaces it. |
| Tags | Search, plus `.select__control--tags` on the shell, `.select__tags` (empty `<ul>`) before the input, and `data-select-multiple`. |

**Creatable Tags (2026-10-06).** `data-select-creatable` on a Tags `.select` lets a
typed query that matches no option become a value. The script appends one last
row, `Thêm “<query>”`, whenever the trimmed query is non-empty and equals no
option's text or `data-value`. The duplicate test is case-insensitive (`vi` locale) and
whitespace-collapsed but **diacritic-sensitive** — `Ban` and `Bán` are two tags — while the
suggestion filter above it still folds diacritics. Choosing it — pointer
or `Enter` — adds the option row to the list, ticks it and builds its chip. Never a
duplicate: a query that equals an existing option shows no `Thêm` row, and `Enter`
picks that option. With partial matches the first match stays the active row, so
`Enter` takes it and the `Thêm` row is reached with `↓`/`End`; with no match the
`Thêm` row is the active one. A created option is an ordinary option afterwards:
unticking its chip leaves it in the list as a suggestion. **Commit on leave:** closing the
menu by `Tab`, blur or an outside press (so also a Save click while typing) turns a
non-empty, non-duplicate query into a chip; `Escape` cancels the query instead. Only
creatable controls do this. A disabled Tags control hides its remove and clear buttons and
the search glyph, and shows `data-select-disabled-placeholder` when it holds no chip. `setValue([...])` on a
creatable control creates the rows it does not know (a record's saved tags), so a
screen can prefill without authoring them. The row is generated and carries
`data-select-create`; it is not a screen-authored part.

`.select__control--tags` is not optional: it carries the wrap, the 6px chip gap and
the block padding. Without it the chips refuse to wrap and a chosen value is
clipped. The chip's internals (`.select__tag`, `.select__tag-body`,
`.select__tag-text`, `.select__tag-remove`) are generated by the script — author
the empty `<ul>` and nothing else.

The leading mark is authored **once, in the option**. The trigger's value row is
built by cloning the chosen option's `.select__option-body`, so the closed
control cannot show a different mark from the row it came from — and a screen
cannot author a `Dot leading` trigger over an `Icon leading` list.

## Tags overflow

**One row, and what does not fit folds into a `+N` chip.** The set draws it —
`Type=Tags, State=Default` (9825:60087, 400x94) is the magnifier, three chips, a
`+4`, then the clear-all, inside 44px — and `State=Placeholder` (9825:60123) is
the magnifier and the word alone. Built 2026-09-22; the control wrapped to as
many rows as it needed until then.

| Rule | Where |
|---|---|
| The row never wraps and never scrolls sideways | `.select__control--tags` is `flex-wrap: nowrap` + `overflow: hidden` |
| Chips fold from the END, and at least one always stands | `fitTags()` in `scripts/select.js` |
| `+N` carries no avatar and no remove control | `.select__tag--more`; it stands for values, not for one value |
| `+N` names what it folded, for a screen reader | `aria-label="+2: Nhóm A, Nhóm B"` |
| The query placeholder belongs to the **empty** control | `syncInput()` clears it as soon as a chip exists |
| The query asks for its `10ch` floor back while it has focus, so chips fold to make room and unfold on blur | `.select--querying` + the focus/blur pair |
| A width change re-runs the fit | `ResizeObserver` on the control |

**How many fit is measured, not calculated.** `fitTags()` shows every chip, then
folds from the end while `scrollWidth` exceeds `clientWidth`. Arithmetic over
paddings, gaps and glyph widths gets the same answer only until a font, a label
or a tier changes.

**Folding is not hiding.** A folded value stays in the model, stays ticked in the
menu, and is named on the `+N` chip; clicking anywhere on the control — the chip
included — opens that menu. What folding costs, and it is a real cost: a folded
value's own remove button is not on the row, so it is removed from the menu
rather than from the chip. Accepted with the set's own design.

## States

- **Placeholder** — no selection. A `.select__lead` authored as a direct child of `.select__value`, before the placeholder, stays in this state (Icon leading date fields). `.select__placeholder` text colour only; the box
  is unchanged, because an empty select is not an error.
- **Default** — a value is shown.
- **Hover** — border steps to `--utui-field-border-hover`.
- **Focused / Open** — one treatment: a 2px `--utui-select-border-open` rim
  (Brand/300). No 4px halo, unlike `.form-field__control` — the open menu is what
  reports the state, and a halo under it reads as two overlapping cards. The
  second pixel is an inset shadow, so the value text does not shift when the menu
  opens.
- **Disabled** — `--utui-field-bg-disabled` fill, `--utui-select-text-disabled`
  text, and the native `disabled` attribute on the button or the input. Not
  `aria-disabled` alone: the control must leave the tab order, and the script only
  reads the real attribute. On the typed types the script also disables
  `.select__clear` and every `.select__tag-remove`, because a fill alone left a
  disabled Tags field that could still be emptied chip by chip.
- **Error** (extrapolated — the frame draws none) — `.select__control--error` plus
  `aria-invalid` and the field's `.form-field__error` row. Needed because a
  required combobox has to be able to say it is empty; see "Required" below.
- **Option: active** — `[data-active]` (keyboard) or `:hover` (pointer), one tint,
  never both at once.
- **Option: selected** — `aria-selected="true"`, which also draws the tick.
- **Option: disabled** — `aria-disabled="true"`. Stays in the list, stays
  arrow-reachable and therefore stays announced — a row a user cannot pick is
  information, and a row the keyboard skips is a row a screen reader never reads.
  `Enter`/`Space`/click on it commit nothing and leave the menu open.
- **Empty result** — `.select__empty` unhidden while a typed query matches nothing.

## Tokens

| Role | Token |
|---|---|
| Height, padding, radius, fill, rim, text | `--utui-field-*` (shared with inputs, deliberately) |
| Open / pointer rim | `--utui-select-border-open` (Brand/300, the frame's) |
| Keyboard focus rim | `--utui-select-border-focus` (Brand/600 — see Deviations) |
| Disabled text | `--utui-select-text-disabled` |
| Query floor on Tags | `--utui-select-query-min-width` |
| Clear control | `--utui-select-clear-size`, `--utui-select-clear-glyph` |
| Leading glyph size | `--utui-select-lead-size` |
| Leading avatar | `--utui-select-avatar-size` |
| Leading dot | `--utui-select-dot-size` |
| Supporting text | `--utui-select-support-text` |
| Menu offset / height / radius / border / shadow | `--utui-select-menu-offset`, `--utui-select-menu-max-height`, `--utui-select-menu-radius`, `--utui-select-menu-border`, `--utui-select-menu-shadow` |
| Menu stacking | `--utui-select-menu-z` (50 — level with the filter popover, above sticky chrome, below modal and drawer) |
| Option gutter / padding / radius / active tint | `--utui-select-option-gutter`, `--utui-select-option-padding-y`, `--utui-select-option-radius`, `--utui-select-option-bg-active` |
| Selected tick | `--utui-select-check-color`, `--utui-select-check-width`, `--utui-select-check-height`, `--utui-select-check-stroke` |
| Tag gap / radius / border / fill / text / avatar / remove | `--utui-select-tag-*` |

The shell consumes the field roles rather than restating them, so a select and a
text input in one form cannot drift apart.

Several of these tokens are **pinned literals**, not ladder steps, because the
frame's value has no step on the package's scale — the same class of pin as
`--utui-choice-radius-sm` in `inputs.md` (which is where
`--utui-choice-radius` itself sat until 2026-09-04, when the DS's 6px turned out
to be a ladder step after all and only the 16px box kept the literal). They are: the option row's 6px inline
gutter, its 10px/8px/10px body padding, the chip's `2px 4px 2px 5px` padding and
its 3px/5px gaps, the 16px chip avatar, and the drawn tick's 5x10px geometry. Each
carries its reason in the token block. One value is **invented**:
`--utui-select-tag-remove-radius` (3px) — the frame draws no radius on that box,
and a square hover fill inside a 6px chip reads as a mistake.

## Usage

- One field, one label. The label is `.form-field__label` and carries BOTH `for`
  (so a click forwards to the trigger) and an `id` that the trigger's
  `aria-labelledby` points at — see "Naming a `<button>` trigger" below, because
  `for` alone does not name a button.
- Standing help goes in `.form-field__hint` and is wired with
  `aria-describedby`. Validation messages stay `.form-field__error` — a hint is
  not where an error goes.
- Keep the option list authored in the HTML. This component filters, marks and
  mirrors options; it does not build them from data.
- Tags wrap onto a second line rather than clipping or scrolling sideways, so the
  control grows with the number of chosen values. A one-chip control is still
  44px.
- The menu is `position: fixed`, placed by the script, so a scroll container does
  not clip it — a select is safe inside a modal body, a table wrapper or a drawer.
  It is re-placed rather than closed on scroll, resize, a filter and a chip change,
  so the list survives a stray trackpad nudge and never detaches from its trigger.
- Placement picks the roomier side, then **caps the menu to the room that side
  actually has** (floor: 96px) and clamps `top` into the viewport. A 320px menu on
  a 375x667 phone therefore scrolls inside itself instead of hanging past the fold
  where nothing could reach it.
- A required select is marked `data-select-required` on the `.select`, not
  `required` on the trigger — see "Required".
- **The trigger floors at `min-width: 0`, and it must.** `.select__control` is a
  grid item of `.select`, and a grid item's automatic minimum is its min-content
  size — so `width: 100%` alone was overruled by the widest option's label and
  the control grew past its own column, taking the PAGE with it. Fixed
  2026-08-20; measured before it in Chrome at 375px as
  `documentElement.scrollWidth` **421** on `project-edit` and **435** on
  `project-doc-upload` against a 375px client area, i.e. horizontal page overflow,
  which `.claude/skills/responsive/SKILL.md` § Principles forbids outright. A `min-width:
  0` on `.select` or on the `.form-field` around it does **not** cover this: an
  ancestor's floor says nothing about an item's own automatic minimum. Nothing
  inside the control needed changing — `.select__value` already floors at 0 and
  `.select__label` already truncates, which is the shrink this component was
  authored for.

## Accessibility

- Trigger is `role="combobox"` with `aria-haspopup="listbox"`,
  `aria-expanded`, and `aria-controls` pointing at the menu. On the typed types
  those attributes sit on the `<input>`, never on the wrapping `<div>` — a
  combobox role on an unfocusable element is announced and unreachable.
- Menu is `role="listbox"` (plus `aria-multiselectable` when multiple), each row
  `role="option"` with `aria-selected`.
- Focus never leaves the trigger. The keyboard's position in the list travels on
  `aria-activedescendant`, which is why every option needs an id — `select.js`
  generates them when the markup omits them.
- Keyboard: `↓`/`↑` open and move, `Home`/`End` jump, `Enter` and `Space` commit,
  `Escape` closes and keeps focus, `Tab` closes and leaves. Printable keys are a 1s
  typeahead buffer on the untyped types — prefix-matched, like the native
  `<select>` a user arrives from, and a `Space` mid-buffer is a character rather
  than a commit so `ngung h` reaches `Ngừng hoạt động`. `Backspace` in an empty
  Tags input removes the last chip.
- `Escape` inside a dialog closes the menu ONLY; the handler stops propagation so
  `modal.js` does not take the form down with it. A second press closes the dialog.
- An emptied filter is announced through a per-instance `role="status"`
  (`.sr-only-label`): `.select__empty` is painted, and a non-`option` child of a
  listbox is not reliably announced — it is `role="presentation"` for that reason.
- The listbox is named from the field's label, so entering the popup announces
  which list it is.
- `Enter` inside an open menu is always prevented from bubbling into a form
  submit. **On a CLOSED menu it is prevented only on the untyped types** — a closed
  `Enter` opens the list there, so there is something to prevent; on a typed type
  (Search / Tags) a closed `Enter` has nothing to commit and the handler returns
  without preventing. **So a consumer must not treat `event.defaultPrevented` as
  "the combobox handled it".** A screen that maps `Enter` to a save and guards only
  on that flag will fire the save from inside a typed combobox whose list is shut.
  Guard on the structure as well — `event.target.closest(".select")` — which is true
  whichever branch this component took. Recorded 2026-08-26d, after
  `screens/du-an/ho-so/tai-len.js` shipped the flag-only guard and the typed control
  that would have tripped it was removed the day before by coincidence.
- Each `.select__tag-remove` is named for the value it removes (`Xóa Olivia`),
  because a screen reader reads it out of context beside near-identical siblings.
- The tick on a selected row is drawn in CSS, not set as an icon-font glyph — the
  same reason `.choice` draws its own mark: the icon font is a CDN dependency, and
  a list that shows no tick until a webfont arrives misreports which row is
  chosen.
- Colour is never the only signal: the tick pairs with `aria-selected`, the dot
  with the option's own text, the disabled fill with the `disabled` attribute.

## Code Mapping

| Part | Class / hook |
|---|---|
| Container | `.select` + `data-select` |
| Multi-select | `data-select-multiple` (implied by `.select__tags`) |
| Form value | `data-select-name="owner"` → a synced hidden input (comma-joined when multiple) |
| Placeholder override | `data-select-placeholder` |
| Remove-button verb | `data-select-remove-label` (default `Xóa`) |
| Creatable (Tags only) | `data-select-creatable` on `.select`; generated last row `.select__option[data-select-create]` reading `Thêm “…”` |
| Creatable row verb | `data-select-create-label` (default `Thêm`) |
| Empty placeholder when disabled | `data-select-disabled-placeholder` (Tags; e.g. `Chưa có tag`) |
| Chip label | `data-select-tag-label` on the `.select__option` — text of the Tags chip and the `+N` label; the remove button's `aria-label` uses `.select__option-text` instead (no `•` read out); falls back to `.select__option-text` |
| Placement | `[data-placement="below"\|"above"]` on `.select`, written at open time; the menu's `top`/`left`/`width`/`max-height` are inline styles |
| Required | `data-select-required` on `.select`; both screen validators sweep it beside `[required]` |
| Error | `.select__control--error` + `aria-invalid` on the trigger + `.form-field__error` |
| Open | `.select--open` |
| Styles | `../../styles/select.css` |
| Behaviour | `../../scripts/select.js` — `OmeuSelect.init(root)`, `OmeuSelect.close()`, `OmeuSelect.get(node)` |
| Instance API | `root.omeuSelect.value()`, `.setValue(v)` (fires `select:change`), `.clear()`, `.open()`, `.close()`, `.place()`, `.refresh()` (re-reads options a screen injected) |
| Change event | `select:change` on `.select`, bubbling, `detail: { value, values, labels }` |

`select.js` self-starts once on `DOMContentLoaded`, as `metric-scroll.js`
already does. An unenhanced `.select` is a dead control rather than a degraded one,
so a screen that forgets to call `init()` would ship a broken field. `init()` is
idempotent and takes a root, so markup inserted later (a modal body, a new form
row) is enhanced by calling it again.

## Known Gaps

- **Creatable has no length or count limit and no validation of the typed text.**
  Whitespace is trimmed and collapsed; nothing else. Whether a tag has a maximum
  length, forbidden characters or a per-record cap is a PO decision (2026-10-06).

- ~~**Inline padding.** The frame pads the control 14px.~~ **Withdrawn
  2026-09-04 — the premise was wrong.** Re-read from the frame: `Type=Default`
  (9825:59934 / 9825:59986) and `Type=Dot leading` (9825:60290) both draw
  `px 12`, which is `--utui-field-padding-x` exactly. There is no deviation to
  defend. The *reasoning* that was attached to it — a select and a text input in
  one form must start their text at the same x — is still why the token is shared,
  and it now costs nothing.
- **Menu grey only.** The frame draws Gray/200 `#E4E7EC` on the **menu** border,
  against this package's `#E5E5E5`; that half of the old note stands and is the
  ramp divergence recorded in `inputs.md`. The **control** border half is
  withdrawn with the padding note above: the frame draws `border/primary`
  `#E5E5E5`, which is `--utui-field-border` exactly, not the Gray/300 `#D0D5DD`
  this gap used to claim.
- **The leading dot is 10px in the frame; the package draws 8px.**
  `--utui-select-dot-size` resolves through `--utui-field-dot-size`, and its
  comment calls 8px "exact", which the frame (9825:60298, a 10px `_Dot`)
  contradicts. Recorded rather than repointed: the token is shared with
  `.form-field__dot`, whose own 8px was measured from an MDM product frame, so
  changing it here changes a status dot in a form that no one has re-read. A 2px
  dot is not a state and does not gate anything.
- **Trigger 14/20, menu rows 16/24 (USER DECISION 2026-10-01).** `.select__value`
  and `.select__input` use `--utui-field-font-size` / `--utui-field-line-height`
  (14/20) like every field; `.select__option` stays `text-md` 16/24 as the frame's
  `_Input dropdown menu item` (9825:59991) draws it. A chosen value is therefore
  smaller in the trigger than in the menu — accepted, recorded here.
- **Disabled fill.** The frame fills Gray/50; this uses
  `--utui-field-bg-disabled` (Neutral/100), the fill every other disabled control
  in the package already carries. Neutral/50 is taken by the read-only fill, and
  disabled and read-only must not look alike.
- **Fixed placement assumes no transformed ancestor.** A `transform`, `filter` or
  `contain: paint` on an ancestor makes it the containing block for a fixed child,
  which would re-introduce clipping. No ancestor of a `.select` in this package has
  one — `.modal__scrim` carries the only `backdrop-filter` and it is a sibling of
  the panel — but a new surface must be checked.
- **Scrollbar.** The frame draws a custom 8px bar inside the menu. The native
  scrollbar is kept: it is the only scroll affordance that reports position
  without a script, and no other scroll region in this package restyles one.
- **Error state is extrapolated.** The frame draws none. `.select__control--error`
  restates `.form-field__control--error`'s treatment on this component's own shell
  (a `.select` has no `.form-field__control` to put it on) and is built because a
  required combobox must be able to say it is empty. Unconfirmed by any frame.
- **Keyboard focus rim departs from the frame.** The frame paints Brand/300
  `#d9b287` for Focused and Open alike, and this component drops the 4px halo that
  gives `.form-field__control` a second cue — so the rim would be the whole focus
  indicator at **1.97:1** on a white field, under WCAG 2.1 SC 1.4.11's 3:1.
  `:focus-visible` therefore paints Brand/600 (5.83:1, same hue) and the frame's
  rim is kept for the open menu and the pointer. Measured 2026-08-20.
- **Disabled and placeholder text.** The frame draws Gray/500 `#667085` (4.73:1 on
  its fill). Disabled text is repointed to `--utui-color-text-tertiary` via
  `--utui-select-text-disabled` to clear 4.5:1; the PLACEHOLDER still resolves
  through `--utui-field-placeholder`, which is the package-wide token gap recorded
  in `inputs.md` — changing it touches every field, so it is repointed there,
  not here. **The figure this note used to carry (Neutral/400, 2.52:1) is stale:**
  re-measured 2026-09-04, the role resolves to Neutral/500 `#737373` — 4.74:1 on
  white and 4.54:1 on the Neutral/50 tint, both over the line. See the same
  correction in `inputs.md`.
- ~~**The Tags row wraps; the frame folds into `+N`.**~~ ~~**The query
  placeholder sits beside the chips.**~~ **Both fixed 2026-09-22** — see *Tags
  overflow* above. The row is one line again, and the package's own reasoning for
  wrapping (never hide a value the user chose) is met by the fold rather than
  against it.
- **Tags block padding.** 4px against the frame's 10px. A chip is 26px and the
  control's floor is 44px, so 4px is what keeps a chip row at exactly the field
  height; 10px would make it 46px and every Tags field would stand taller than
  the input beside it. Measured 2026-09-22.
- **The tick's footprint.** The frame reserves a 20px `check` glyph; the drawn mark
  is ~11px, so a selected row's label truncates ~9px later than in the frame.
  Accepted with the decision not to load an icon font for state.
- **Label→control gap is 8px, the frame draws 6px.** `.form-field` is a single
  symmetric grid `gap` in `legacy/detail-and-forms.css`, so the frame's 6/8 rhythm
  is structurally unreachable until that grid moves into `form-field.css`. Recorded
  there too.
- **The 16px help icon beside the label is not built.** The frame draws
  label + `*` + a help circle with a tooltip. `.form-field__label` has no slot for
  it and no screen asks for one yet. `design-system/components/tooltip.md` now
  exists but is title-only, no author-supplied content — v1 does not cover this
  help-text case even once the label gets its slot.
- **`display: contents` on the chip list has two costs.** N chips are N tab stops
  BEFORE the combobox, and WebKit has historically dropped `display: contents`
  nodes from the accessibility tree even with an explicit role — the `role="list"` /
  `role="listitem"` pair the script writes is verified in Blink only. A chip must
  stay operable by keyboard, so the buttons are not `tabindex="-1"`.
- **No forced-colors handling.** The rim is a border plus an inset shadow, and
  shadows do not paint in forced-colors mode. Package-wide: nothing in `styles/`
  handles that mode.
- **No hover state drawn.** The frame has no Hover row; the border step comes from
  the field set, so it matches every other control rather than being invented.
- **No size ladder.** One height (44px, `--utui-field-height`). The frame draws
  one size.
- **No group headers or dividers** in the menu — the frame draws a flat list.
- **Type coverage in screens.** Only Dot leading is in a screen so far (see
  Consumers). Every type and state is instantiated in the fixture
  `select-states.html` (**removed 2026-09-23**, ADR 0011), which is what "tested" meant here — it
  loads the real stylesheet and the real script. The fixture exists because a
  review found four of six types had no instance anywhere in the repository while
  this contract described them as smoke-tested; two were broken (Search never
  showed the value it committed; a disabled Tags control could still be emptied).
- **No readonly state.** A locked record (e.g. `screens/du-an/ho-so/chi-tiet.html`
  on an appraisal-locked document) can only disable the trigger, which removes it
  from tab order — a sighted, non-mouse reader loses the value entirely rather than
  seeing it uneditable. `.form-field__control--readonly` exists for text inputs;
  `.select` has no equivalent.

## Consumers

| Screen | Controls | Types |
|---|---|---|
| `screens/du-an/danh-sach.html` `#createDrawer` | `Trạng thái`; `Loại hình`, `Dòng sản phẩm`, `Dự án cấp trên`, `Loại dự án` | Dot leading, Default |
| `screens/du-an/ho-so/chi-tiet.html` | `Vị trí thư mục` (required); `Hình thức hồ sơ`; `Ngày nhận`, `Ngày văn bản`, `Hiệu lực từ ngày`, `Đến ngày` | Default, Icon leading |
| `screens/du-an/ho-so/tai-len.html` | `Vị trí thư mục` (required), `Ngày văn bản` (required); `Ngày nhận`, `Hiệu lực từ ngày`, `Đến ngày`, and `Ngày dự kiến nộp` in `Bản cứng kèm theo`. **No `Hình thức hồ sơ` and no Tags control** as of 2026-08-26c — see below | Default, Icon leading |
| `screens/du-an/chi-tiet.js` — `Thông tin dự án` dialog | five fields, of which `Trạng thái` carries the tone | Dot leading, Default |
| `scripts/phase-table.js` — `Giai đoạn` cell | one per editable row, on both wizards and the phase dialog | Default, `.select--cell` |
| `screens/du-an/ho-so/danh-sach.html` `#uploadOverlay` and `screens/du-an/ho-so/chi-tiet.html` — `Tag` (MDM-1259 AC2) | one per screen, free-typed, creatable; `chi-tiet` locks it through `applyLock()` (disabled) | Tags + creatable |
| `screens/du-an/ho-so/danh-sach.js`, `screens/du-an/ho-so/hang-doi.js`, `screens/doi-tac/danh-sach.js` — filter `Giá trị` of an `enum-multi` row | `Tag`; `Vai trò đối tác`, `Quốc gia` | Tags (not creatable) |
| `screens/du-an/chi-tiet.js`, `screens/du-an/danh-sach.js`, `screens/du-an/ho-so/danh-sach.js` — filter panels | `Điều kiện` + enum `Giá trị` per row (text values stay `<input>`) | Default |

`Hình thức hồ sơ` on the upload screen was a select, then four quantities
(`.doc-kind`, 2026-08-22), then a panel of its own (2026-08-22d), then a select
again on 2026-08-26 — and **is gone entirely as of 2026-08-26c.** Node `12630:42501`
of the same section draws `Thông tin hồ sơ` as a 13-cell grid with no document-form
select in it. `screens/du-an/ho-so/chi-tiet.html` still draws the field and
still owns the three option ids (`original` / `copy` / `scan`); the two screens are
out of step again, this time with the *upload* side matching the newer node. The
`form` key left the upload payload with the control, and `applyUploadedDoc()` in
`screens/du-an/ho-so/danh-sach.js` now reads `""` for it — recorded there as a
receiver-side gap.

**Update 2026-10-06: Tags has consumers again** — see the table above. The paragraphs
below are the 2026-08-26c record and are kept for the four lessons.

**There was no Tags consumer, 2026-08-26c.** `Bản cứng kèm theo`'s
`Hình thức bản cứng` was the first one outside the fixture and lasted one day: node
`12630:42486` draws four authored quantity fields and no chip control, so the
control, its options, its clear-all and the one-field-per-chip render are gone from
`screens/du-an/ho-so/tai-len.html`. **`select-states.html` was the only Tags
instance in the repository, and it was removed 2026-09-23 (ADR 0011).** That is the position the fixture exists for, and it is
why the fixture exists: this type had no consumer for most of its life and two of
its six types shipped broken while this contract described them as smoke-tested.

Four things the deleted consumer proved, kept because the next screen to take the
type needs them and there is now no instance to read them off:

- the `<ul class="select__tags">` is authored **empty** — the script builds every
  chip from the chosen option rows, so a hand-written `<li>` is overwritten on init
  and can disagree with the menu;
- read `select:change` **at the document**, not on the one control: the event
  bubbles and its `detail.values` is the whole chosen set;
- **anything a chip generates must be guarded on the chosen set.** That
  document-level listener fires for every combobox on the page, and an unguarded
  rebuild both churns the DOM and throws away whatever had focus;
- **the query floor is what decides whether the row holds** — it was the reason
  this control wrapped for most of its life: two chips plus the clear-all plus a
  `10ch` floor measured 343.8px against a 326px box at 424px of panel. The floor
  is now asked for only when the control is empty or being typed into, and what
  does not fit folds into `+N`. See *Tags overflow*.

**`.select__control` on the Tags type is a `<div>`, so do not treat it as a field.**
It carries no `id`, no role and no error node, and a consumer that clears field
errors from the same `select:change` handler will write `aria-invalid` onto it —
a form-validation state on a generic div, which is a lie an AT can read.

**Guard on the field's MESSAGE NODE, not on `trigger.id`.** The test is
`document.getElementById(`${trigger.id}Error`)` — the same lookup the consumer's own
`setFieldError()` performs — because a field that has an authored message node is a
field the screen validates, and one with no message node has nothing to say.

Corrected here 2026-08-26d. This section prescribed `trigger.id` and called it the
correct test; the guard that ships in `screens/du-an/ho-so/tai-len.js` tests the
message node, and the reasoning that made the change necessary is worth keeping in
both directions:

- `trigger.id` was added for the right reason and is **too weak for the job**. It
  excludes the Tags div, which is what it was written for, and admits every
  `<button class="select__control">` on the page. On that screen six comboboxes carry
  an id and only two are ever validated (`Vị trí thư mục`, `Ngày văn bản`), so the
  other four were being told `aria-invalid="false"` by a clear that had nothing to
  clear — publishing a validity state on a control no gate ever checks, which tells
  assistive tech the screen is validating something it is not.
- The message-node test **still excludes the Tags trigger**, so nothing about the
  lesson above is lost: an id-less `<div>` cannot resolve `${id}Error` either. It
  excludes it as a consequence of the right question rather than as the question.

So the Tags div remains the reason this paragraph exists, and "does this field have
somewhere to put a message" remains the test — `trigger.id` was a proxy for it that
happened to be true of one control and false of four others.

**A `[data-select-required]` nobody sweeps is not a required field.** `Vị trí thư
mục` on `screens/du-an/ho-so/tai-len.html` carried the attribute and the visible
asterisk from 2026-08-13 and was never in that screen's gate, so the one field that
decides where a document is filed could be emptied and saved. Swept from
2026-08-26c. Two notes for a screen adding a required combobox: put both required
selectors in **one** `querySelectorAll` (`[required], [data-select-required]`) so
the offender list stays in document order — concatenating two lists reports every
combobox after every input, which on that form named the first field on the page
last; and word the message with the control's verb (`Vui lòng chọn …` for a
combobox, `Vui lòng nhập …` for a box you type in).

Migrated 2026-08-19 (the two wizards' `Trạng thái`) and 2026-08-20 (everything
else). Screens that build their rows at runtime call `OmeuSelect.init(scope)` after
writing the markup, and read values through `OmeuSelect.get(el).value()` or the
bubbling `select:change` event — a `<button>` trigger has no `.value`, so any
`.value` read left over from the native control would have written `""` over a real
value. Four of them also needed a bridge:

- `du-an/ho-so/tai-len.js` / `du-an/ho-so/chi-tiet.js` — `readValue`/`setValue`/
  `setDate` route through the component, and `setDate` appends the record's own date
  as a row before selecting it, then calls `refresh()`.
- `du-an/ho-so/chi-tiet.js` — a `state.loading` flag, because `setValue()` announces
  and `render()` writes twelve fields on every document: without it, opening a
  document marked the form dirty.
- `phase-table.js` — the row's `select:change` writes the model, and each rendered
  row is enhanced with `init(tr)`.
- the three filter panels — one delegated `select:change` listener per panel, bound
  once outside the render, since the rows are rebuilt on every open. Both fields were a native `<select>` with one static
`.form-field__dot--success` beside it, so the dot went on reading Success after
`Ngừng hoạt động` was chosen — a status mark that contradicts the value beside it.
The Dot leading type carries the mark on the option, so the trigger shows the
chosen row's own mark. `.form-field__dot` stays in `form-field.css` for a field
whose dot qualifies a value that cannot change (a read-only row); it is no longer
used on these two screens.

Every other select on those screens stays native: their options are plain strings.

### Naming a `<button>` trigger

`aria-labelledby` points at the **label alone**:

```html
<label class="form-field__label" id="fieldStatusLabel" for="fieldStatus">Trạng thái</label>
<button class="select__control" type="button" id="fieldStatus"
        aria-labelledby="fieldStatusLabel">
```

`for` forwards a click on the label to the trigger — a `<button>` is a labelable
element — but it does not NAME it: a button's accessible name comes from its own
content. With `role="combobox"` that content is announced as the control's **value**,
so an `aria-labelledby` that also listed the trigger's own id produced
"Trạng thái Hoạt động, combo box, Hoạt động" and renamed the field on every pick.
That is what this contract mandated until 2026-08-20; it is now the label alone, as
in the APG select-only combobox pattern. The typed types do the same — the input's
value is not its name.

### Required

`select.js` also writes `aria-required="true"` on the focusable node (the `.select__input` on typed types, the trigger button otherwise) whenever the root has `data-select-required`. Name that node once: a `<label for>` that carries the hidden `(bắt buộc)` text, with no extra `aria-label` on the input.

The trigger is a `<button>` and cannot carry `required`, so a required select is
marked on the container:

```html
<div class="select" data-select data-select-required>
```

`screens/du-an/tao-moi.js` and `screens/du-an/chi-tiet.js` sweep
`[data-select-required]` beside `[required]`, read the value through
`OmeuSelect.get(control).value()`, and paint `.select__control--error` +
`aria-invalid` + the field's `.form-field__error` row. Before 2026-08-20 the
validators saw `[required]` only: a required select rendered its `*`, never
validated and never blocked a save. If a field must not be required, do not render
the marker — the two have to agree.

## Inside a dialog (`Thông tin dự án`, 2026-08-20)

The section-edit dialog on `project-overview` builds its body from a field spec, so
the migration is in `screens/du-an/chi-tiet.js`, not in markup. Three things it
establishes for every future consumer:

- **A field opts in with `dots`, not `dot`.** `{ label: "Trạng thái", type: "select",
  options: [...], dots: { "Hoạt động": "success" } }` routes the field to
  `selectMarkup()`; every other `type: "select"` stays a native select. The tone
  belongs to the option, so it cannot keep reading Success under a different value.
  Options with no entry in `dots` still get a dot, untoned — otherwise the rows
  would not line up.
- **Injected markup needs `OmeuSelect.init(scope)`.** The script self-starts on the
  document once; a dialog body written later is enhanced by the screen, right after
  `innerHTML`. `init()` is idempotent, so re-opening the dialog costs nothing.
- **A save must read the component, not the element.** The trigger is a `<button>`
  and its `.value` is `""`, so `saveSectionEditor()` goes through
  `OmeuSelect.get(control).value()` and falls back to `control.value` for the
  native controls beside it. Reading `.value` blindly would have saved an empty
  string over `Hoạt động`.

`Escape` inside a dialog closes the menu ONLY: the keydown handler stops
propagation while the list is open, so `modal.js`'s document-level listener does
not take the whole form down with it. A second `Escape` closes the dialog.

## Verification — 2026-09-04 (re-read against `9825:59933`, no rule changed)

The frame this contract was written from was read again end to end. The type and
state matrix is unchanged: six types (`Default`, `Icon leading`, `Avatar
leading`, `Dot leading`, `Search`, `Tags`) × five states (`Placeholder`,
`Default`, `Focused`, `Open`, `Disabled`), which is exactly what Variants and
States above describe. **No stylesheet or script rule changed as a result.**

Confirmed still exact, node by node: the open rim is `border-2` in
`border/brand` `#D9B287` (9825:59986); the menu is 320px tall at a 4px offset,
8px radius, `shadow-lg` (9825:59991); a menu row is a 6px gutter around a
`pl 8 / pr 10 / py 10` body at a 6px radius with a Gray/50 active tint
(9825:59993–60000); the leading dot's success tone is Success/500 `#17B26A`
(9825:60298), the substitution already recorded against `--utui-field-dot-success`.

What the re-read *did* change is this contract's own record. Four entries in
Known Gaps described deviations that the frame does not support — the control's
14px padding and its Gray/300 border (both actually the package's own values),
and a placeholder contrast figure measured against a token that has since been
repointed — and two real ones were missing: the 10px leading dot and the
`text-md` menu row. All six are corrected in place above. A gap that is not real
is worse than no gap: it is a rule the next reader will defend.
