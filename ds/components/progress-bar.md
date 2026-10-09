# Progress Bar

## Purpose

A thin determinate bar that reports how far one running task is: the aggregate upload of the files of one row, or of the whole import in the dock. It reports; it owns no control. For a position in a sequence of steps use `progress-steps.md`.

## Source

| Item | Value |
|---|---|
| Figma | **None. AUTHORED (gap).** 4px height is a USER DECISION (2026-10) |
| Note | `.cell-progress` (data-table) uses the bar only while running; `.is-complete` / `.is-failed` are still used by the dock item. |
| First consumers | `screens/du-an/ho-so/danh-sach.html` `#importDrawer` step 3 (`.cell-progress`, `ds/components/data-table.md`) and its dock item (`.dock__progress`, `ds/components/dock.md`) |

## Anatomy

| Part | Class | Notes |
|---|---|---|
| Track | `.progress-bar` | `<div role="progressbar">`, `--utui-progress-bar-height` (4px) tall, full width, `--utui-progress-bar-track` |
| Fill | `.progress-bar__fill` | Child `<span>`, `inline-size: var(--progress)`. The consumer sets `--progress: 45%` on the track |

## States

| State | Class | Fill |
|---|---|---|
| Running (default) | none | `--utui-progress-bar-fill` (`bg-brand`) |
| Complete | `.is-complete` | `--utui-progress-bar-fill-complete` (`icon-success`) |
| Failed | `.is-failed` | `--utui-progress-bar-fill-error` (`icon-error`); the fill keeps the width reached |

No indeterminate state. TODO Q7: assumes the backend reports byte progress (XHR `progress`); without it the bar has nothing to show.

## Accessibility

- `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`, and an `aria-valuetext` that says the same in words (`Đang tải 2 trên 3 tệp, 45%`), `aria-label` naming what is measured (`Tiến độ tải tệp của {mã}`).
- **Not a live region.** The consumer announces start, completion and failure through the surface's one live region, never per tick.
- State is also carried by the text next to the bar (a failed bar is never red alone).

## Tokens

`--utui-progress-bar-height`, `-track`, `-fill`, `-fill-complete`, `-fill-error`, `-radius` in `ds/tokens/untitled-ui-component.css` (after Progress steps).

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `ds/styles/progress-bar.css` (imported after `progress-steps.css` in `app.css`) |
| Tokens | `ds/tokens/untitled-ui-component.css` |
| Example | `screens/du-an/ho-so/nhap-excel.js` (`cellProgress()`, `dockItem`) |

Angular draft (not confirmed): inputs `value` (0-100), `state` (`running` | `complete` | `failed`), `label`, `valueText`. Mapped to `progress-bar` in `handoff.config.json` (`npm run angular:draft`); dev confirms.

```html
<div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="45"
     aria-valuetext="Đang tải 2 trên 3 tệp, 45%" aria-label="Tiến độ tải tệp của HS-2026-001" style="--progress: 45%">
  <span class="progress-bar__fill"></span>
</div>
```

## Known Gaps

- No Figma frame; colours and height authored.
- No indeterminate state (Q7).
