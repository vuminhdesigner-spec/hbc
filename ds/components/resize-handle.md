# Resize handle

## Purpose

A drag handle on the vertical divider between two side-by-side columns, so the user sets the width of the first one. v1 consumer: the category tree beside the list in `du-an/ho-so/danh-sach` (`folder.md` § Variant `--bare`). Not for row/column resizing inside a table.

## Anatomy

- `.resize-handle` — `div role="separator"`, absolutely positioned and centred on the column's inline-end border. Direct child of the column being resized (the column needs `position: relative`); the column's parent is the container.
- Hit area `--utui-spacing-03` (12px) wide, starting 1px inside the column edge (mostly on the list side, so it overlaps only 1px of the nav scrollbar thumb), `cursor: col-resize`. Visible stroke: 2px, exactly over the column's 1px border (plus 1px inside), transparent at rest (the column's own 1px border shows), `--utui-color-brand-500` on hover/focus-visible, `--utui-color-brand-600` while dragging.

## Behaviour (`ds/scripts/resize-handle.js`)

| Input | Result |
|---|---|
| Drag | Width = pointer x minus column left edge, clamped. |
| ArrowLeft / ArrowRight | -/+ `--resize-step` (`--utui-spacing-04`, 16px). |
| Home / End | Min / max. |
| Double-click / Enter | Back to the screen's default (override removed, storage cleared). |
| Container resize (window, nav collapse) | Re-clamped to min/max via ResizeObserver; `aria-valuemax` updated. Going narrow to wide re-applies the saved width. |

- Min `--resize-min` = `--utui-spacing-64` - `--utui-spacing-04` (240px). Max = 50% of the container. Both are written to `aria-valuemin/max`; `aria-valuenow` is the column's px width.
- The width is written as `--resize-size` on the container. The screen's grid owns the default: `grid-template-columns: var(--resize-size, <default>) minmax(0, 1fr)`.
- Persisted under `data-resize-storage-key` in `localStorage`; every read/write is in try/catch, failure falls back to the default. The default width is never stored.
- At `max-width: 1023px` (`responsive.css`) the handle is `display: none`: the columns stack, no saved width is applied. The screen's own stacked rule must drop the column template.

- Drag keeps the pointer offset from the column edge (no jump), caches min/max/default on pointerdown and applies in `requestAnimationFrame`; `lostpointercapture` cleans up.
- **Siblings of the handle's column must be `isolation: isolate`.** The handle is `z-index: 1`; a sibling whose sticky cells use z 2/3 (`data-table.css`) would otherwise paint over it. In `danh-sach` that is `.docs-main`.
- `aria-valuetext` = "<n> px", updated with `aria-valuenow`.

## Accessibility

`role="separator"`, `aria-orientation="vertical"`, `aria-controls` = column id, `aria-label` (Vietnamese, e.g. "Đổi độ rộng danh mục"), `tabindex="0"`. Focus ring is inset (`outline-offset: -2px`) because the shell clips overflow.

## Markup

```html
<aside class="folder folder--bare" id="folderPanel">
  …
  <div class="resize-handle" role="separator" aria-orientation="vertical" tabindex="0"
       aria-label="Đổi độ rộng danh mục" aria-controls="folderPanel"
       aria-valuemin="0" aria-valuemax="0" aria-valuenow="0"
       data-resize-target="folderPanel" data-resize-storage-key="mdm:du-an:ho-so:tree-width"></div>
</aside>
```

## Gaps

- No Figma node for this handle; stroke, hit width and colours are derived from existing tokens. Needs design confirmation.
- `data-resize-target` is only a marker for the script (it uses the parent); kept for discoverability.
- Left-to-right only (pointer maths ignores RTL).
