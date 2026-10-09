# Progress Steps

## Purpose

Progress Steps shows where the user is in a short, linear, multi-step task and
how much of it is behind them. It is a **status indicator for a flow the page
itself is driving** — it reports the step, it does not own the buttons that move
between steps. Those live in the host's action area: the page header's Button
group (`ds/components/page-header.md`), or a drawer's footer.

Use it for a wizard of 3–5 named steps on one screen. Do not use it for tabs
(`ds/components/tab-bar.md` — those are peers, not a sequence), for a paged record
set (`ds/components/pagination.md`), or for a progress *bar*, which reports a
percentage rather than a position.

## Source

| Item | Value |
|---|---|
| Reference | Untitled UI "Line" progress steps (authored) |
| Former frame | MDM V2 `Tạo dự án mới`, node `10838:66444` — **no longer matches** |
| `--text` in Figma | OMEU DS V2 `SFo9P9PCVQiuOk2SqjZYKQ`, page `Progress steps`: `Progress steps / Text` `12227:30829` (Step=1/2/3, Blocked) built from `_Step text base` `12227:899` (State=Complete/Current/Upcoming/Blocked). Pushed from this contract 2026-10-02 — not yet signed off by design |
| First consumers | `screens/du-an/danh-sach.html` and `screens/doi-tac/danh-sach.html` `#createDrawer`; `screens/du-an/ho-so/danh-sach.html` `#importDrawer` (`nav.drawer__header-steps`) |

**GAP: authored from the Untitled UI line reference; the dot + caption frame
10838:66444 was replaced by a segmented line bar. Needs design sign-off.**

## Anatomy

- **List** — one `<ol>`, full width, one segment per step, equal widths, 16px apart.
- **Item** (`__item`, `<li>`) — `flex: 1 1 0`, no width cap.
  - **Body** (`__body`) — a `<button>` on a completed step, a `<span>` on every
    other; the same box (24px min block size, WCAG 2.5.8 target size), so the
    `base.css` focus ring wraps the 24px box, not the 4px line.
  - **Bar** (`__bar`, `aria-hidden`) — the visible 4px pill segment.
  - **State** (`__state`) — visually hidden text: position, title, state, and
    what activating does. Not optional; see Accessibility.

There are no dots, captions, titles or connector. The step's title is shown by
the host (page-header subtitle).

## Variant `progress-steps--text` (USER DECISION 2026-10)

A chain of labelled steps on one 20px row, for a drawer header where three bars read as too many progress bars (`#importDrawer`, every step). Authored from code, then pushed to Figma (see Source); design sign-off pending (GAP).

- Item = `button|span.progress-steps__body` holding a marker, `__label` (`aria-hidden`, the visible name) and the hidden `__state`; then `span.material-symbols-outlined.progress-steps__sep` (`chevron_right`, tertiary; hidden on the last item).
- Complete: Material `check_circle` in `--utui-color-text-success`, label secondary. Current: `__marker` with the number on `--utui-progress-step-dot-current-bg/-fg`, label semibold primary. Upcoming: `__marker` on `--utui-progress-step-dot-upcoming-bg/-border`, label tertiary. Blocked replaces the number with Material `error` in `--utui-color-text-error` (same slot as `check_circle`).
- Marker and icon size `--utui-progress-step-text-size` (20px); gap `--utui-spacing-02`.
- `__marker` is `border-box` 20px with a 1.5px border (17px inside): it sets `line-height: 1` and centres the digit with `place-items: center` — the shared 20px line-height pushes it down.
- A returnable complete step stays a `<button data-goto-step>` styled as a link (underline on hover, base focus ring); a committed step is a plain `<span>`. `aria-current="step"` stays on the `<li>`.
- In a drawer header the chain sits under the title where a supporting line would (a full-width row of its own when the header is narrower than the chain); `drawer.md` Header steps owns the layout.
- Because the label is visible, the host must not repeat "Bước n/N · <title>". A drawer header carrying the chain has no `.drawer__supporting` at all — no step summary either (USER DECISION 2026-10-05).

## States

Per step, exactly one step is `current`:

| State | Bar colour | Token |
|---|---|---|
| Upcoming (no class) | Gray/200 | `--utui-progress-step-line-upcoming` |
| `is-current` | Brand/500 | `--utui-progress-step-line-current` |
| `is-complete` | Success green | `--utui-progress-step-line-complete` |
| `is-blocked` (always also `is-current`) | Red/600 | `--utui-progress-step-line-blocked` |

`is-blocked` is declared last so it wins at equal specificity.

### Interactive states

**A completed step is a control: activating it returns to that step** — except a step whose work is already committed (`#importDrawer` once its commit is sent ("Gửi phê duyệt" / "Hoàn thành lưu trữ (Adhoc)" at step 3, 4 steps: Chọn tệp, Kiểm tra dữ liệu, Đính kèm tệp, Kết quả): steps 1-3 stay `is-complete` but render a `<span>`, not a button, with no "chọn để quay lại" in the state text). Current,
upcoming and blocked stay inert.

| | Complete | Current / Upcoming / Blocked |
|---|---|---|
| Element | `button.progress-steps__body` | `span.progress-steps__body` |
| Hover | bar goes to `--utui-progress-step-line-complete-hover` (Green/700) | none |
| Focus visible | `base.css` `button:focus-visible` ring around the 24px body | not focusable |

An inert step is a `<span>`, not a disabled button. No tooltips (USER DECISION).

### `Blocked`

A step the user cannot leave because a required field on it is empty — a
modifier on the current step only. The consumer clears it when leaving the step
(`setStep` calls `clearBlocked()`), so a red bar never sits on a non-current step.
Forward jumps through a completed segment validate the step being left; backward
is free.

### Progress is a high-water mark — 2026-08-14

Step status is derived from the **furthest step the user has reached**, never from
the current step alone. Stepping back leaves the steps behind the mark
`complete`: green segment, the state text
`đã hoàn thành, chọn để quay lại bước này`, and a `<button>` body.

Two rules follow, and both are why the mark exists. A step whose data was entered
must never re-read `Chưa thực hiện` — that is the indicator asserting something
false about the user's own work. And a user who steps back for one field must not
have to press `Tiếp tục` through every step they did not want to touch, which is
what an inert `<span>` body forces.

The mark lives in the consumer's state (`state.furthestStep` in
`du-an/tao-moi.js`, `doi-tac/tao-moi.js`) and only ever moves forward. `Blocked`
still overrides it, so a `complete` mark cannot outlive valid data.

**An edit form of an existing record would open with every step complete.** Every
field would be pre-filled from the stored record, so `upcoming` would both assert
that entered data was not entered and make later steps inert on the most common
edit path — changing one field. No screen in this package is currently an edit
form of an existing record (`du-an/chinh-sua.js`, the one that seeded the mark to
`STEPS.length`, was removed 2026-09-28 — no màn chỉnh sửa) — kept here as the rule
for the next one.

## Tokens

| Role | Token |
|---|---|
| Gap between segments | `--utui-progress-steps-gap` (16px) |
| Bar thickness | `--utui-progress-step-line-size` (4px) |
| Upcoming | `--utui-progress-step-line-upcoming` → `--utui-color-gray-200` |
| Current | `--utui-progress-step-line-current` → `--utui-color-brand-500` |
| Complete | `--utui-progress-step-line-complete` → `--utui-color-icon-success` |
| Complete hover | `--utui-progress-step-line-complete-hover` → `--utui-color-green-700` |
| Blocked | `--utui-progress-step-line-blocked` → `--utui-color-red-600` |
| Body min height | `--utui-spacing-06` (24px) |

Borrowed by `screens/du-an/ho-so/chi-tiet.css` (status history, not this
component): `dot-size`, `dot-inner`, `dot-border-width`, `ring`, `dot-current-bg/-fg`,
`dot-upcoming-bg/-border`, `track-size`, `track-bg`. **GAP: no status-history component.**

## Layout Contract

- `.progress-steps` is a flex row, full width of its host, at every breakpoint.
  There is no tier rule in `responsive.css`: a line bar stays one row.
- Segments share the width equally (`flex: 1 1 0; min-width: 0`); any step count works.
- The block is as tall as the 24px body; the line is centred in it.
- `--text` is content-width (not a full-width bar), items wrap per item; the row reads 20px, the body keeps the 24px target (`--utui-spacing-06`).

## Accessibility

- The list is an `<ol>`; wrap it in a `<nav>` with an `aria-label` naming the flow.
- The current step's `<li>` carries `aria-current="step"`.
- A completed step is a real `<button type="button">` (Tab, Enter, Space). Its
  accessible name is its `__state` text.
- **Every segment's name is inside `__state`**, e.g. `Bước 1 trên 4: Thông tin
  chung, đã hoàn thành, chọn để quay lại bước này`. Variants: `…, đang thực hiện`,
  `…, chưa thực hiện`, blocked `…, chưa thể tiếp tục, còn thông tin bắt buộc chưa nhập`.
  The bar is `aria-hidden`.
- The indicator does not take focus and does not announce itself on change; the
  consumer's `role="status"` line (`#stepStatus`) does.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `ds/tokens/untitled-ui-component.css` |
| Component CSS | `ds/styles/progress-steps.css` |
| Example | `screens/du-an/danh-sach.html` and `screens/doi-tac/danh-sach.html` `#createDrawer`, and `screens/du-an/ho-so/danh-sach.html` `#importDrawer` (each `nav.drawer__header-steps`, inside `.drawer__header` under the title row — USER DECISION 2026-10, `drawer.md` Header steps), each rendered by `renderProgress()` in its own bundle |

Angular draft (not confirmed): no modifiers; input `furthest` (the high-water mark) — TODO: not yet in `ds/angular-map.json` (which lists `steps`, `current`, `blocked`); dev adds it.

```html
<nav aria-label="Tiến trình tạo dự án">
  <ol class="progress-steps">
    <li class="progress-steps__item is-complete">
      <button class="progress-steps__body" type="button" data-goto-step="1">
        <span class="progress-steps__bar" aria-hidden="true"></span>
        <span class="progress-steps__state">Bước 1 trên 4: Thông tin chung, đã hoàn thành, chọn để quay lại bước này</span>
      </button>
    </li>
    <li class="progress-steps__item is-current" aria-current="step">
      <span class="progress-steps__body">
        <span class="progress-steps__bar" aria-hidden="true"></span>
        <span class="progress-steps__state">Bước 2 trên 4: Đối tác, đang thực hiện</span>
      </span>
    </li>
    <li class="progress-steps__item">
      <span class="progress-steps__body">
        <span class="progress-steps__bar" aria-hidden="true"></span>
        <span class="progress-steps__state">Bước 3 trên 4: Liên hệ, chưa thực hiện</span>
      </span>
    </li>
  </ol>
</nav>
```

## Known Gaps

- **GAP: authored, not from a frame.** Design sign-off needed (see Source).
- **Upcoming Gray/200 on white is ~1.2:1**, under the 3:1 non-text minimum. The
  host's visible "Bước n/N" text and `__state` carry the count.
- **Current vs complete differ by colour only** (brand vs green). Position and the
  host's visible step label carry it.
- **Blocked is only a red bar.** The field errors and `__state` carry the meaning.
- **Pointer users cannot tell which step a non-current segment is** — no
  tooltips (USER DECISION).
- **A seeded-complete edit form** would show every segment complete while step 1
  is current; no current screen does this. Inferred, needs sign-off if built.
- **Known Gap: a returnable complete step has no resting affordance** (USER DECISION 2026-10, `--text`): only hover underline and the focus ring show it is a button.
- **Step count** above five has not been reviewed.
- **GAP: vertical status history.** `screens/du-an/ho-so/chi-tiet.css` `.archive-timeline` is screen-local, borrowing `--utui-progress-step-*` tokens; no vertical variant exists here.
