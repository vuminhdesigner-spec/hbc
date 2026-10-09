# Button

## Purpose

Button triggers a clear user action in a workflow, such as create, save, export,
filter, pagination, or return to a previous page.

## Anatomy

- Container.
- Optional leading icon.
- Label.
- Optional trailing icon.

## Revision History

Every revision to this contract — the table rows first, then the entries
written up in full. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/button.md`](docs/revisions/button.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-04
- 2026-08-27
- 2026-08-27f
- 2026-08-14 (`Secondary color` implemented)

## Variants

Four axes in the design system: `Size` (sm/md/lg/xl) x `Hierarchy` (7) x `Icon`
(False/Leading/Trailing/Only/Dot) x `State` (Default/Hover/Focused/Disabled) —
528 authored combinations.

### Hierarchy

| Hierarchy | Class | Treatment |
|---|---|---|
| `Primary` | `.button--primary` | Brand/500 fill **with a Brand/600 border**; hover Brand/700; disabled Brand/200. Label white. |
| `Secondary gray` | `.button` | Surface fill, default border, label **Gray/700**; hover `#FAFAFA` + `#262626`. |
| `Secondary color` | `.button--secondary-color` | Brand/50 fill, Brand/700 label, no visible border. See the 2026-08-14 revision. |
| `Tertiary gray` | — | Not implemented. |
| `Tertiary color` | `.button--tertiary` | No box; label Brand/700, hover fills Brand/50. |
| `Link color` | `.button--link` | **Label only** — no fill, border, shadow or vertical padding. Label `#2563EB` (Blue/600) — **not** the source's Blue/500; see the contrast note below. |
| `Link gray` | `.button--link-gray` | Label only, `#525252`; hover `#404040`. |
| `Destructive` | `.button--destructive` | Red/600 fill **and** Red/600 border, white label. Added 2026-08-14 from the `Modal` set (`SFo9P9PCVQiuOk2SqjZYKQ`, `933:39265`), whose `Destructive …` types draw the confirm action this way. Fill and border share one value here, unlike Primary. **Hover is inferred** (Red/700, one ramp step, following Primary's pattern) — the set draws no hover for it, so that step needs design confirmation. Disabled is not drawn either and is not implemented. |
| `Secondary destructive` | `.button--secondary-destructive` | Red/50 fill, Red/700 label, **no visible border** (transparent, not absent). Added 2026-08-27 from `Chi tiết hồ sơ thay đổi theo trạng thái` (`tS8dUB2qWLc28gZbtj8IIL`, `12684:19630`), where `Từ chối lưu trữ` sits between a `Secondary gray` save and the brand primary. The destructive analogue of `Secondary color`, **not** a variant of `Destructive` — see the note below. **Hover is inferred** (Red/100, following `Secondary color`'s one-step fill change); disabled is not drawn and not implemented. Label on fill measures **5.91:1** at rest — passes AA. |
| `Ghost` | `.button--ghost` | No border, no fill, no shadow; label `--app-brand-strong`. **Not in the DS set** and not drawn by any frame this contract cites. It is the only hierarchy here painted from an `--app-*` alias rather than a `--utui-button-*` token: `styles/base.css` defines `--app-brand-strong` as Brand/700, so it resolves to the same value `Tertiary color` uses for its label — the two differ only in that `Tertiary color` fills on hover and this draws no hover at all. Recorded 2026-09-23; it had been in `button.css` undocumented. Whether it should exist beside `Tertiary color`, and whether it should move onto the button's own tokens, are open. |

`Secondary destructive` is not in the set either, and it is a separate hierarchy
from `Destructive` rather than a size or state of it. `Destructive` is a solid
Red/600 fill with a white label — the confirm of a destructive dialog, the most
emphatic control on its surface. `Secondary destructive` is the same act offered
in a **page header, beside the brand primary**: a second solid fill there competes
with the action the screen recommends, which is exactly the hierarchy problem
`Secondary color` solves one ramp over. Both are needed and neither substitutes
for the other — `screens/du-an/ho-so/chi-tiet.html` draws them together,
`Từ chối lưu trữ` in the header and `Xác nhận` in the dialog it opens.

**Open for the DS owner:** whether `Secondary destructive` belongs on the button
component as a ninth hierarchy, whether its fill/label pair is Red/50 + Red/700
(measured from one frame instance, not from a published style) and what its hover
and disabled steps are. Implemented ahead of that answer because the frame draws
the control and a screen-local fork of it would be worse.

**One of those questions now has a number.** `rgb(185,28,28)` on `rgb(254,242,242)`
measures **5.91:1** at rest — comfortably over 4.5, and over the 4.83:1 of
`Destructive`'s own white-on-Red/600 confirm. Accessibility is therefore not an
argument against publishing the hierarchy; the remaining question is a
design-system one about how many hierarchies the axis should carry. **Its hover
step (`--utui-color-red-100`) is still unmeasured** and is the one state that could
move the pair under 4.5.

`Destructive` is not in the seven `Hierarchy` values of `Buttons/Button`
(`1038:34411`) — it comes from the Modal set's own button instances
(`Buttons/Button destructive`). Whether the DS intends it as an eighth hierarchy on
the button component or as a modal-local style is a question for the DS owner;
implemented here as a hierarchy because a destructive confirm is not modal-specific
(the row-delete confirmation open in `design-system/components/data-table.md` needs the same
treatment).

**Link buttons are not boxes.** At `md` the control is 20px tall — the height of
its own text — against 40px for every other hierarchy. Give them no vertical
padding and no min-height, or they will not sit on the baseline of the text they
appear in.

### Size

| Size | Height | Padding |
|---|---|---|
| `sm` | 36px | 0 12px |
| `md` | 40px | 10px 16px |
| `lg` | 44px | 0 16px |
| `xl` | 48px | 0 16px |

`.button--compact` maps to `sm`. Radius is 8px and the label is `Text sm`
Semibold at every size.

## States

- Default.
- Hover.
- Focus visible.
- Disabled.
- Busy (`.button[aria-busy="true"]` + `.button__spinner`; USER DECISION 2026-10-05): a request is out. The leading glyph is replaced by `<span class="button__spinner" aria-hidden="true"></span>` (ring in `currentColor`, `--utui-button-spinner-size` = glyph size, 800ms/turn, 1600ms under reduced motion), the label changes to the progressive form ("Đang gửi…"), the cursor is `progress` and the button is not greyed. Use `aria-disabled="true"`, not `disabled`, so focus stays on it; the script ignores the click. Other buttons of the group stay `disabled`. GAP: no Figma frame, design sign-off pending. Consumer: `#importDrawer` (Gửi phê duyệt, Hoàn thành lưu trữ (Adhoc), Thử lại n hồ sơ). Follow-up: the five "Đang lưu…" buttons in `screens/doi-tac/chi-tiet.js` (lines 48, 774, 1517, 1828) and `ho-so-nang-luc.js:47` still use the old pattern.
- Hidden. `.button[hidden] { display: none; }` sits in `styles/button.css`
  beside `.button-group[hidden]` — the base rule's `display: inline-flex`
  otherwise beats the UA sheet, so a consumer toggling `.hidden` on a
  recovery action (e.g. an empty state's `Xóa bộ lọc` / `Xóa tìm kiếm` pair)
  changed the attribute and both buttons kept showing. Fixed 2026-09-17.

## Tokens

| Role | Token |
|---|---|
| Primary background | `--utui-button-bg-primary` |
| Primary hover | `--utui-button-bg-primary-hover` |
| Primary text | `--utui-button-text-primary` |
| Secondary background | `--utui-button-bg-secondary` |
| Border | `--utui-button-border-secondary` |
| Radius | `--utui-button-radius` |
| Focus | `--app-focus` |

## Usage

Use one dominant primary action per local action group. Use icons when they
increase scan speed, especially for add, save, download, filter, and back
actions.

Avoid using button styling for passive labels, status chips, or navigation
items that are not actionable.

## Accessibility

- Icon-only buttons must have `aria-label`.
- Disabled buttons must use native `disabled` when possible.
- Focus visible must remain clear on light and brand backgrounds.
- Labels should be action verbs.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Prototype button CSS | `styles/button.css`; the one screen-level override left is in `screens/du-an/chi-tiet.css` |
| Examples | Header actions, filters, pagination, form submit |

## Measured contrast — 2026-08-27f

Sampled from computed sRGB in Chromium at 1440 with the controls **at rest**, on
`screens/du-an/ho-so/chi-tiet.html` (the one screen that draws four of these
hierarchies at once). These are measurements, not estimates: do not re-open them as
review findings, and do not re-derive them from token hex values, which is how the
`Link color` figures were wrong before 2026-08-14.

| Control | Pair | Ratio | AA (4.5:1) |
|---|---|---|---|
| `.button` — `Secondary gray` (`Lưu chỉnh sửa`) | label on surface | **10.46:1** | pass |
| `.form-field__hint`, 14px | hint on surface | **7.81:1** | pass |
| `#stateArchiveBadge` | badge label on tint | **6.16:1** | pass |
| `.button--secondary-destructive` (`Từ chối lưu trữ`) | `185,28,28` on `254,242,242` | **5.91:1** | pass |
| rail tertiary label (`data-viewer__label`) | label on surface | **4.97:1** | pass |
| `.button--destructive` (`Xác nhận`) | white on Red/600 | **4.83:1** | pass |
| `.button--primary` | `255,255,255` on `166,112,56` | **4.20:1** | **FAIL** |

**`.button--primary` fails AA and the brand token was NOT changed.** The label is
14px/600 (`--utui-font-size-text-sm`, added to `.button` 2026-09-29 — see Known
Gaps history) — under the 18.66px/bold threshold, so it is not large text and
4.5:1 applies, not 3:1. The failure is in `--utui-color-brand-500` itself, so it is
package-wide and pre-existing: every primary button on every screen carries it, and
so does every other white-on-brand surface. **Fixing it is a token decision for the
DS owner, not a screen's or a lane's** — darkening the brand ramp one step moves
every screen in the package at once and wants a visual check across all of them.
Recorded here so the next reviewer measures nothing and argues from this figure.
Related and separate: the disabled primary at 1.47:1, below.

**Still unmeasured, and owed** — these are gaps, not passes:

- the **hover** state of `.button--secondary-destructive` (`--utui-color-red-100`
  fill), the one step that could take that pair back under 4.5:1;
- **touch-target sizes on a real device** — the `sm` control is 36px against the
  44px WCAG 2.5.5 target;
- **screen-reader announcement order** for a header whose action group is replaced
  wholesale after a decision.

## Known Gaps

- **`.button--compact` (`sm`) padding-x is 12px, not the 14px Figma draws.**
  `--utui-button-padding-x-sm` resolves to `--utui-spacing-03` (12px) — there is
  no 14px spacing primitive in the package. PO decision 2026-09-29: keep 12px
  rather than add a one-off token for a single step; recorded here instead.
- **`Tertiary gray` is not implemented.**
- **`Focused` is not implemented.**
- **`Link color` shows the same label colour in all three states** in the
  source, while `Link gray` differentiates. Likely an authoring slip; confirm.
- **`Link color` deviates from the source by one ramp step, deliberately.**
  Changed 2026-08-14 after a UX review of `design-system/patterns/search-results.md`, where the
  token also paints the `Thư mục cha` cell link. The source's Blue/500 `#3B82F6`
  measures **3.68:1** on white and **3.52:1** on `--utui-table-row-hover-bg`
  (`#FAFAFA`) — under 4.5:1 for the 14px text every consumer renders, so the
  colour failed WCAG AA wherever the token was used. Blue/600 `#2563EB` measures
  **5.17:1** and **4.95:1** on the same two surfaces.

  One token changed (`--utui-button-link-color`), so every consumer moved
  together: the `Xem thêm` expander in four page headers, the `Tải lên` trigger
  on `project-doc-upload`, and the folder link in the search-results table. All
  sit on white or on the page wash, so all gain contrast and none inverts. A
  designer should either accept the step or supply a compliant Blue/500
  alternative — it is a source deviation, not a preference.

## Known gap — 2026-08-22 (the disabled primary is unreadable)

`.button--primary:disabled` paints white on `--utui-color-brand-200`. **Measured in
Chrome: `rgb(255,255,255)` on `rgb(235,209,178)` = 1.47:1.**

WCAG exempts inactive controls, so this is not a conformance failure. It is a
usability one: at 1.47:1 the label is not read so much as guessed at, and a disabled
primary is often the most consequential control on the screen — the operator needs to
know **which** action is unavailable, not just that something is.

**The consumer that reported this gap no longer renders the state.** It was the
deleted `chung-chi-tiet-yeu-cau-luu-tru` screen, which disabled `Tải biên bản bàn giao`
in `Chờ bàn giao` because the handover record does not exist until DC receives the
hard copy. On 2026-08-25 a stakeholder decision replaced that dimming with **absence**
— an action that does not exist yet is not drawn — and on 2026-08-26 the bundle itself
merged into `screens/du-an/ho-so/chi-tiet.html` (D49), which follows the same
present/absent rule for every action in its header slot.

So the gap has **no reporting consumer left in the package**, and that is a reason to
keep it recorded rather than to close it: nothing was patched at screen level and
nothing about the tint changed — the exposure did. The next screen to dim a primary
will hit 1.47:1 exactly as this one did. Still the component's to fix.

Two directions, neither chosen here: darken the disabled foreground against the tint,
or stop tinting the surface and use a neutral disabled treatment as the secondary
button does. The second is the bigger change and the more consistent one.

**Do not work around this in a screen bundle.** A screen that re-colours a disabled
primary makes one button readable and leaves every other one in the package as it was.
