# Tooltip

## Purpose

Tooltip is a truncation aid: it echoes, on hover or focus, the full string of a
cell/label whose own box has clipped it. v1 has two consumer families: (1) `screens/doi-tac/danh-sach.html`'s `Giới hạn ký tự` toggle
(`ds/components/table-settings.md`), and (2) `.folder-item__label` in `screens/du-an/ho-so/{danh-sach,chi-tiet,tai-len}` (one-line category names, `ds/components/folder.md`). The first trades the data table's
usual wrap-never-truncates rule (`ds/components/data-table.md`
*Wrapping*) for row density and needs a way to give the string back.

It is **not**:

- a place for content that must be visible without a hover or a focus event —
  if a fact is required to complete a task, it belongs on the page, not behind
  a tooltip;
- a control — nothing inside it is interactive in v1, and it takes no focus of
  its own;
- a substitute for a field's own label, hint or error (`ds/components/inputs.md`
  already owns those) — **one controlled exception**: the error of an editable
  cell in a data table (USER DECISION 2026-10), see *Lỗi của ô sửa* below; and a second one, the error of a failed file in `attachment-list` (USER DECISION 2026-10-05, *Lỗi của tệp* below);
- built from `title`. The native attribute is not reachable by keyboard, has
  no styling hook and cannot be dismissed — the three reasons
  `ds/components/section-header.md` already gives for not using it,
  and the reason this component exists instead.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`) |
| Node | `1052:489` — https://www.figma.com/design/SFo9P9PCVQiuOk2SqjZYKQ/OMEU-Design-System-V2?node-id=1052-489 |
| Read | 2026-09-24 |

The set is `theme` (Light / Dark) × `arrow` (None / Top center / Bottom center /
Bottom left / Bottom right / Left / Right) × `supportingText` (false / true) —
28 variants. v1 builds a slice of it:

| Axis | Built in v1 | Not built |
|---|---|---|
| Theme | **Dark** (`.tooltip`, no modifier) | Light — needs decision |
| Content | Title only, `Text xs/Semibold`, wraps and start-aligns rather than the frame's centered `white-space: nowrap` (a truncated cell string is arbitrary length, unlike the frame's short sample copy), capped at `--utui-tooltip-max-width` (320px) | `supportingText` (title + description) — needs decision. So does the free-form/author-supplied content this would require, and the `aria-describedby` wiring that comes with it — see *Accessibility* |
| Arrow | Bottom center (default, tooltip above trigger), Bottom left (`--start`), Bottom right (`--end`), Top center (tooltip below trigger, `--bottom`), **and** Top left / Top right (`--bottom` + `--start`/`--end`) | Left, Right (tooltip beside the trigger, rotated arrow), None |
| Trigger mode | Hover + focus, both with an open delay | Click (toggletip) |

**Top left / Top right are not in the Figma set.** The `arrow` axis lists
`Top center` but no `Top left`/`Top right` — the frame only draws the rotated
arrow centered. `--bottom` combined with `--start`/`--end` is allowed anyway
(Known Gaps) because a tooltip that flips below a trigger sitting at a
viewport edge needs the same horizontal correction the above-trigger case
already gets; **chờ design xác nhận** whether the frame should grow this cell
or whether v1 should stop combining them.

**Visual fidelity is unverified beyond the token values below — chờ design
duyệt.** This contract was written from the node's own spec sheet (padding,
radius, shadow, type, the arrow path) rather than from a rendered comparison
against the live component.

## Anatomy

```html
<div class="tooltip" role="tooltip" id="ds-tooltip" aria-hidden="true" hidden>
  <span class="tooltip__text">Nội dung đầy đủ của ô bị cắt</span>
  <span class="tooltip__arrow"></span>
</div>
```

One bubble, shared by the whole document and created by `../scripts/tooltip.js`
— not authored per screen. A caller never writes this markup; it opts an
element in with `data-tooltip-overflow`:

```html
<span class="cell-text" data-tooltip-overflow>Một chuỗi rất dài…</span>
```

- **`.tooltip`** — the box. `position: fixed`, placed by the script (top/left
  inline styles), padding, radius, shadow, background, type.
- **`.tooltip__text`** — the message: the trigger's own `textContent`, or the
  `data-tooltip` reason on a disabled control — see *Behaviour*.
- **`.tooltip__arrow`** — one SVG mask (`../assets/tooltip-arrow.svg`, the
  frame's "Bottom center" triangle) recoloured with `background-color` and
  repositioned/rotated by modifier, rather than the twelve theme/direction
  SVGs the frame exports as separate assets.

## Variants

| Modifier | Effect | Figma arrow |
|---|---|---|
| *(none)* | Tooltip above the trigger, arrow centered on the box's bottom edge | Bottom center |
| `.tooltip--start` | Arrow moves to `--utui-tooltip-arrow-inset` from the box's start edge | Bottom left |
| `.tooltip--end` | Arrow moves to `--utui-tooltip-arrow-inset` from the box's end edge | Bottom right |
| `.tooltip--bottom` | Tooltip below the trigger; arrow flips 180° to the box's top edge | Top center |
| `.tooltip--bottom.tooltip--start` | Below the trigger, arrow at the start edge | Not in Figma — chờ design |
| `.tooltip--bottom.tooltip--end` | Below the trigger, arrow at the end edge | Not in Figma — chờ design |

All modifiers are applied by `../scripts/tooltip.js`'s `place()`; a consumer
never authors them.

## Tokens

| Role | Token |
|---|---|
| Background | `--utui-tooltip-bg` (`--utui-color-neutral-900`, `#171717`) |
| Text | `--utui-tooltip-text` (`--utui-color-text-inverse`) |
| Radius | `--utui-tooltip-radius` (`--utui-radius-md`, 8px) |
| Shadow | `--utui-tooltip-shadow` (`--utui-shadow-lg`) |
| Padding | `--utui-tooltip-padding-y` (8px) / `--utui-tooltip-padding-x` (12px) |
| Trigger↔bubble gap | `--utui-tooltip-offset` (8px) — same role `--utui-select-menu-offset` plays for `ds/components/select.md`'s menu |
| Max width | `--utui-tooltip-max-width` (320px) — **TODO(design)**, see Known Gaps |
| Stacking | `--utui-tooltip-z` (70) — **GAP-2**, see Known Gaps |
| Arrow size | `--utui-tooltip-arrow-width` (16px) |
| Arrow inset (`--start`/`--end`) | `--utui-tooltip-arrow-inset` (12px) |
| Type | `--utui-font-family-body`, `--utui-font-size-text-xs`, `--utui-line-height-text-xs`, `--utui-font-weight-semibold` — used directly, no component alias (title-only has one type role) |

## Behaviour

Shared bubble, delegated on `document` — `../scripts/tooltip.js` owns all of
this, in full in its own header comment:

- Opens on `pointerover`/`focusin` of `[data-tooltip-overflow]`, after 150ms,
  and **only if the element is actually overflowing**
  (`scrollWidth > clientWidth || scrollHeight > clientHeight`). An element
  whose content already fits is a no-op.
- `focusin` also resolves the attribute on a **descendant** of the focused
  element, not only the element itself or an ancestor (R11, 2026-09-29
  review) — a truncated `<span data-tooltip-overflow>` nested inside a
  focusable `<button>` (e.g. `ds/components/doc-detail.md`'s folder chip,
  `ds/components/folder.md --compact`'s row label) now opens on keyboard
  focus, where `Element.closest()` alone only ever looks at the target and
  its ancestors.
- Content is `trigger.textContent.trim()` — never `innerHTML`. One shared use
  authors it: `data-tooltip="<reason>"` on an `aria-disabled` control (see *Lý do
  vô hiệu*), plain text, always repeated in the control's `aria-label`. Anything
  richer is still out of scope.
- Positioning: prefers **above** the trigger; flips to `--bottom` only when
  above is too short **and** below has more room (never flips into an equally
  cramped side — the mirror of `../scripts/select.js`'s menu placement, whose
  default side is the opposite one). Horizontally centered by default;
  `--start`/`--end` when centering would overflow the viewport edge, then
  clamped as a last resort.
- Closes 150ms after the pointer leaves the trigger **and** the bubble (WCAG
  1.4.13 Hoverable — a pointer must be able to move from one to the other);
  immediately on `focusout`, `scroll`, `resize`, or a `pointerdown` outside the
  bubble.
- `Escape` dismisses it (1.4.13 Dismissible), from a capture-phase listener so
  it runs before `../scripts/modal.js`'s own Escape and does not take a
  dialog down with it. Once dismissed by Escape, the same hover/focus session
  does not reopen it — only actually leaving and returning re-arms it.
- No animation (**GAP-5**).

## Lý do vô hiệu (`data-tooltip`)

`data-tooltip="<lý do>"` trên một control mở bubble khi hover/focus, không cần tràn chữ; văn bản do caller viết. Dùng cho nút `aria-disabled` giải thích vì sao không bấm được (`snack-bar`). Bubble vẫn `aria-hidden`: caller **phải** đưa lý do vào tên truy cập của control (`aria-label`), nếu không người dùng đọc màn hình không nghe được.

## Lỗi của ô sửa (`data-tooltip`)

USER DECISION 2026-10: trong `data-table` (`.cell-input`), lỗi của ô không vẽ chữ dưới ô nữa (chữ làm ô cao lên và lệch cả dòng); ô lỗi có viền đỏ cùng icon `error` trong ô, câu lỗi hiện bằng tooltip khi hover hoặc focus bàn phím, mở phía dưới ô (`data-tooltip-place="bottom"`). Phần cơ chế do fe-dev chọn. Đặt `data-tooltip="<câu lỗi>"` trên control focus được (input, textarea, `.select__control`). Chữ lỗi **vẫn có** trong accessibility tree: node `.form-field__error.sr-only-label` giữ nguyên và control trỏ `aria-describedby` tới nó, nên bubble vẫn `aria-hidden` mà không nói đôi. Cơ chế (fe-dev chọn): đổi `data-tooltip` khi bubble đang mở thì `tooltip.js` cập nhật tại chỗ (MutationObserver), gỡ attribute thì đóng; lỗi mới xuất hiện trên control đang focus/hover thì mở. Mọi ô lỗi đặt thêm `data-tooltip-place="bottom"` (xem dưới). Chỉ áp cho ô sửa của data-table; form field thường vẫn dùng `.form-field__error` hiện chữ.

## Hướng mở (`data-tooltip-place`)

`data-tooltip-place="bottom"` trên trigger: bubble ưu tiên mở phía dưới trigger (mặc định là phía trên); thiếu chỗ dưới mà phía trên rộng hơn thì lật lên trên. Giá trị khác hoặc không có thì giữ mặc định. Dùng cho ô lỗi của data-table để bubble không che dòng trên/đầu bảng.

## Accessibility

- The bubble is `aria-hidden="true"` **permanently**, and is never wired to
  `aria-describedby`. Its text is already in the accessibility tree — either the
  trigger's own `textContent`, or, for `data-tooltip`, the reason the caller
  appends to the control's `aria-label` — so describing it a second time would
  announce the same string twice. A cell error is the third path: the control's
  `aria-describedby` points to a `.sr-only-label` node holding the same text.
- **GAP-1: keyboard reach is uneven.** `focusin`/`focusout` open and close the
  bubble exactly like `pointerover`/`pointerout`, but only for a trigger that
  can actually receive focus. On `screens/doi-tac/danh-sach.html`,
  `.entity-title` is an `<a>` and gets both; `.cell-text` and
  `.entity-subtitle` are plain `<span>`s with no `tabindex`, so a keyboard-only
  user cannot reach their tooltip at all. **Accepted for v1** (per product
  decision, 2026-09-24) rather than making every truncatable cell focusable,
  which would add tab stops that do nothing else. Needs a decision if this
  gap is not acceptable long-term: either a real control per cell, or a
  different reachability mechanism.
- No `role="status"`/live-region behaviour — a tooltip is not an announcement,
  it is content revealed on demand.

## Lỗi của tệp (attachment-list)

USER DECISION 2026-10-05: mở rộng ngoại lệ trên sang `attachment-list`. Hàng `.is-failed` không in câu lỗi dưới hàng; `.attachment__error` là icon `error` (`--utui-color-icon-error`, 20px) focus được (`tabindex="0"`, `role="img"`, `aria-label` = câu lỗi), câu lỗi trong `data-tooltip` với `data-tooltip-place="bottom"`. Trạng thái lỗi là AUTHORED (Figma `File upload` 9826:63774 không có). Không sửa `tooltip.js`.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `ds/tokens/untitled-ui-component.css` (`--utui-tooltip-*` block) |
| Styles | `ds/styles/tooltip.css` |
| Behaviour | `ds/scripts/tooltip.js` |
| Arrow asset | `ds/assets/tooltip-arrow.svg` |
| Consumer | `screens/doi-tac/danh-sach.js` `cell()` — `data-tooltip-overflow` on `.entity-title`, `.entity-subtitle`, `.cell-text`, only while `state.charLimit` is on; `screens/doi-tac/danh-sach.html` loads `ds/scripts/tooltip.js` after `ds/scripts/role-switch.js`, before its own bundle; `screens/du-an/ho-so/{danh-sach,chi-tiet,tai-len}.js` on `.folder-item__label`; `ds/scripts/snack-bar.js` sets `data-tooltip` (disabled reason) on the CTA / menu row; `ds/scripts/row-table.js` and `screens/du-an/ho-so/nhap-excel.js` set `data-tooltip` + `data-tooltip-place="bottom"` on invalid edit cells; `screens/doi-tac/chi-tiet.js` `data-tooltip-overflow` on `.entity-row__name` / `__meta`; `screens/du-an/ho-so/danh-sach.js` `nameCell()` `data-tooltip` (danh sách định dạng) trên `.file-chip--sm` không focus được — chỉ hover, bàn phím nhận qua `aria-describedby` (GAP-1) |
| Consumer (tệp lỗi) | `screens/du-an/ho-so/{tai-len,nhap-excel}.js` `.attachment__error` (`ds/styles/attachment-list.css`) |
| Related contract | `ds/components/table-settings.md` (`Giới hạn ký tự`), `ds/components/data-table.md` (*Wrapping*) |

## Known Gaps

- **GAP — keyboard-opened tooltip is cancelled when the container scrolls itself.** `onViewportChange` (tooltip.js:230-237) compares the trigger (child span) with `document.activeElement` (parent button), which never match. Fix in a separate task.
- **GAP-1 — keyboard reach.** See *Accessibility* above.
- **GAP-2 — no z-index scale.** Nothing in this package publishes a stacking
  ladder; every surface pins its own literal (drawer/modal are the highest
  today, both 60). `--utui-tooltip-z: 70` is one band above them because a
  tooltip must be able to describe a control inside a dialog. TODO(design
  system owner) if a real scale is ever authored — this token should move
  onto it rather than staying a one-off.
- **GAP-3 — `--utui-tooltip-max-width` is not a confirmed value.** The frame's
  own `supportingText=true` instances measure ~320px (Dark) / 328px (Light)
  wide, and the difference is shadow bleed in the frame capture, not two
  values — 320px is a reasonable ceiling, not a read number. It is close to
  moot for v1 anyway: a title-only tooltip never wraps in the frame, so this
  is a ceiling for the rare pathological long title, not something the built
  variants exercise. TODO(design): confirm 320px, or supply the real value
  once `supportingText` is built.
- **GAP-4 — 22 of 28 Figma variants are not built.** The disabled-reason use
  (`data-tooltip`, plain text mirrored in `aria-label`) is CLOSED, a shared
  decision (2026-10). Light theme,
  `supportingText` (and the free-form rich content / `aria-describedby` wiring it
  would need), `Left`/`Right` arrow placement (tooltip beside the trigger,
  rotated arrow), and arrow `None` all have no CSS. None of `doi-tac`'s
  consumers need them yet.
  - **Light theme: needs decision.** Not built in v1; every consumer
    today is Dark.
  - **`supportingText` / rich content: needs decision.** Not built in
    v1; v1 is title-only by design (see *Purpose*), so this is also a scope
    question, not only a build gap — a tooltip with author-supplied content
    is a materially different component (it needs `aria-describedby`, a
    dismissible-without-losing-content story, and probably the click/toggletip
    trigger mode) rather than an extension of this one.
  - **Toggletip (click-trigger)** is not built. Nothing in `doi-tac` opens a
    tooltip by clicking; if a future consumer needs one (an info icon, say),
    it likely wants `supportingText` too — see above.
  - **N-6 — replace `title` on the role-switch trigger
    (`ds/scripts/role-switch.js:331`) and collapsed nav items
    (`side-navigation.md:207`) with tooltip: needs decision.** Not in v1: needs
    author-supplied content + `aria-describedby` and the `Left` arrow.
  - **N-7 — apply tooltip to `.section-header__supporting` (one-line clamp on
    `chi-tiet`): needs decision.** Not focusable, so it would hit GAP-1.
- **GAP-5 — no open/close animation.** The bubble appears/disappears via
  `hidden` with no transition. Not decided whether it should have one.
- **GAP-6 — the Angular directive is a different, larger component, and
  `npm run angular:draft` cannot see the difference.** `[dsTooltip]` in
  `design-system-of-dev/components/tooltip/ds-tooltip.component.ts` is a
  general-purpose, per-instance CDK-overlay tooltip: explicit `dsTooltip`
  text (never derived from the host's own content), a `dsTooltipDescription`
  rich mode, 8 placements including `left`/`right`, a `click` (toggletip)
  trigger mode, an interactive/follow-cursor mode, open/close animation, and
  real `aria-describedby` wiring appended to the host. **v1's actual need —
  detect that an element's own content is clipped and echo it back — has no
  input on that directive.** This needs a decision from the Angular team:
  extend `[dsTooltip]` with an overflow-detection mode (e.g. an input that
  reads the host's `textContent` instead of taking one), or keep this as a
  separate, narrower directive/utility that only handles the truncation case.
  Handing the dev team `dsTooltip="{{ same string already on screen }}"` on
  every clipped cell is not being proposed here — it duplicates the string in
  the template for exactly the case this component exists to avoid.

  A tooling note, not a design one: `tools/angular_map_draft.mjs` and
  `tools/registry_index.mjs` both resolve an Angular selector by regex-matching
  `selector: 'ds-…'` and taking the first hit in the file — which is
  `ds-tooltip-bubble` (the presentational sub-component `[dsTooltip]` mounts
  into a CDK overlay), because `[dsTooltip]`'s own selector does not start with
  `ds-` and the regex never matches it. **Read `<ds-tooltip-bubble>` in
  `ds/angular-map.json`/the handoff mục lục AI as a tooling artifact, not as
  the integration point** — the real one is the `[dsTooltip]` directive, and
  GAP-6 above is about it, not about the bubble's own template.

## Revision History

- 2026-09-24 — initial contract. v1: Dark theme, title-only, hover/focus
  trigger, `data-tooltip-overflow` on `screens/doi-tac/danh-sach.html`.
- 2026-10-01 — new consumer `.folder-item__label` (`screens/du-an/ho-so/{danh-sach,chi-tiet,tai-len}`); Purpose updated; keyboard/scroll gap recorded.
- 2026-10-05 — ngoại lệ lỗi-trong-tooltip mở rộng sang `attachment-list` (`.attachment__error`), USER DECISION.
