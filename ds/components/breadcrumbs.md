# Breadcrumbs

## Purpose

Breadcrumbs is a path trail: it says where the user is inside a hierarchy and
lets them jump back to any ancestor. Use it when a region navigates *into*
something and the way back is not a browser Back — a folder grid, a nested
category, a drill-down chart.

It is not a tab strip (`design-system/components/tab-bar.md`) and not screen navigation
(`design-system/components/side-navigation.md`). Every segment except the last is an ancestor
of the current location, in order.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 |
| Figma file key | `tS8dUB2qWLc28gZbtj8IIL` |
| Component | `Breadcrumbs`, `10119:11541`–`10119:11547` |
| Reviewed instances | `11099:31733` (one level) and `11099:31757` (two levels) in `pat-listing/view-mode/folder` |
| Reviewed via | Figma MCP `get_design_context`, 2026-08-14 |

## Anatomy

1. **Trail** — a horizontal run with a 12px gap, 20px tall at one line.
2. **Root segment** — icon only, the 20px `home-line` glyph, with a visually
   hidden label so the button's accessible name is not "home". **Decision
   2026-10-01** (thay quyết định 2026-09-28 dùng tên dự án làm gốc): khi tên
   thực thể đã là title của page-header, gốc là icon home với nhãn ẩn (ở
   `screens/du-an/ho-so/danh-sach`: "Tất cả danh mục") — một tên chỉ hiện một
   lần trên màn, như Google Drive dùng title làm breadcrumb.
3. **Separator** — the 16px `chevron-right` glyph, decorative.
4. **Ancestor segment** — `Text sm` medium in `Neutral/600`. A control.
5. **Current segment** — `Text sm` semibold in `text/brand-primary`. Not a
   control.

## States

| State | Treatment |
|---|---|
| Ancestor, default | `--utui-breadcrumbs-text` (Neutral/600), medium. |
| Ancestor, hover | Brand text and an underline. Not authored in Figma; supplied because a segment that navigates must look like it does. |
| Ancestor, focus | Shared brand focus ring from `base.css`. |
| Current | `--utui-breadcrumbs-text-current` (Brand/500), semibold, `aria-current="page"`. |
| Root only | When the trail is at the root, the home segment IS the current segment: it renders as the inert current form, not as a button that goes where the user already is. `screens/du-an/ho-so/danh-sach` ẩn cả trail ở gốc (2026-10-01) — chỉ còn icon trơ, không mang thông tin; hiện từ danh mục cấp 1. |

## Tokens

| Role | Token |
|---|---|
| Gap | `--utui-breadcrumbs-gap` (`--utui-spacing-03`, 12px) |
| Separator size | `--utui-breadcrumbs-separator-size` (16px) |
| Ancestor text | `--utui-breadcrumbs-text` (`--utui-color-neutral-600`) |
| Current text | `--utui-breadcrumbs-text-current` (`--utui-color-brand-500`) |
| Text size | `--utui-font-size-text-sm` / `--utui-line-height-text-sm` |

**Token note.** `text/brand-primary` in the source resolves to `#a67038`, which
is Brand/500 — one step lighter than this package's `--utui-color-text-brand`
(Brand/700). The component token is pinned to the primitive so the current
segment renders as drawn; if the semantic alias is meant to be the correct value,
that is a design-system decision and this token should follow it.

## Responsive

The trail wraps rather than scrolling or truncating. Document category names in
this data set run to 60 characters, so a `nowrap` trail would push the current
location — the one segment the user needs to see — off the edge of the panel.
There is no tier rule: wrapping needs no breakpoint.

## Accessibility

- The trail is a `<nav>` with an `aria-label`, containing an ordered list. The
  order carries the meaning, so `<ol>`, not `<ul>`.
- Ancestors are `<button>`s: they change what the page shows without leaving it.
  Use `<a href>` instead when a segment is a real, separately-addressable URL.
- The current segment is a `<span aria-current="page">`, not a disabled button —
  a disabled control is a tab stop that does nothing.
- Separators are `aria-hidden`; the list structure already conveys the sequence.
- The root's hidden label must stay in the DOM. An icon-only button with no text
  announces as "button" and nothing else.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.breadcrumbs`, `.breadcrumbs__list`, `.breadcrumbs__item`, `.breadcrumbs__separator`, `.breadcrumbs__link`, `.breadcrumbs__current`, `.breadcrumbs__label-hidden` in `styles/breadcrumbs.css` |
| Tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Example | `screens/du-an/ho-so/danh-sach.html` (`#docsBreadcrumbs`), rendered by `screens/du-an/ho-so/danh-sach.js` |

```html
<nav class="breadcrumbs" aria-label="Đường dẫn thư mục">
  <ol class="breadcrumbs__list">
    <li class="breadcrumbs__item">
      <button class="breadcrumbs__link" type="button" data-crumb-index="-1">
        <span class="material-symbols-outlined" aria-hidden="true">home</span>
        <span class="breadcrumbs__label-hidden">Thư mục gốc</span>
      </button>
    </li>
    <li class="breadcrumbs__item">
      <span class="breadcrumbs__separator material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <button class="breadcrumbs__link" type="button" data-crumb-index="0">01. Chấp thuận đầu tư, GCN đầu tư</button>
    </li>
    <li class="breadcrumbs__item">
      <span class="breadcrumbs__separator material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <span class="breadcrumbs__current" aria-current="page">Quyết định chấp thuận chủ trương đầu tư</span>
    </li>
  </ol>
</nav>
```

## Known Gaps

- **No collapsed form.** Untitled UI's breadcrumb has a `…` overflow segment for
  deep paths; the MDM source shows only two levels and authors no truncation, so
  a five-level path simply wraps. If deep hierarchies are real, the overflow
  segment needs to be authored before it is built.
- **No hover, focus, or disabled state is authored.** All three are supplied by
  the implementation from the shared button reset.
- **The home glyph is a material-symbols `home`, not the source's `home-line`.**
  The source's is an outline variant that is not in this package's icon set;
  visually near-identical, recorded rather than silently substituted.
- **Separator glyph size.** The source uses a 16px chevron beside 20px text; the
  material glyph at 16px sits slightly high against the Figma export. Not
  corrected with a literal offset.

## Known gaps — 2026-08-22

### 1. The current segment fails AA

`--utui-breadcrumbs-text-current` is Brand/500. **Measured in Chrome:
`rgb(166,112,56)` on the page wash `rgb(248,250,252)` = 4.02:1, at 14px / weight 600.**

14px semibold is **not** large text under WCAG (large is ≥18.66px bold or ≥24px), so
the threshold is 4.5:1 and this misses it. It measures ~4.20:1 on plain white, which
misses too — so this is not a wash-composition problem that a different background
fixes.

This is **pre-existing and already shipping**: `screens/du-an/ho-so/danh-sach.html` has drawn
it since before the archiving lane existed. It surfaced again while building that
lane, which is the only reason it is written down now. Component-owned; not overridden
in any screen file, because a screen that fixes its own breadcrumb leaves every other
consumer failing.

### 2. There is no anchor form of the ancestor segment

`.breadcrumbs__link` is authored for a `<button>` — the component's only consumer
moves a view in-page rather than navigating. The archiving lane needs the ancestor
segment to be a **link to another page**, and an `<a>` carrying that class renders
underlined at rest.

`screens/du-an/ho-so/chi-tiet.html` works around it with
`.button.button--link-gray` on an `<a>`, keeping the trail's list, separator and
current segment from this component and replacing only that one segment. (It was
recorded on `chung-chi-tiet-yeu-cau-luu-tru` too until that bundle merged into this
one on 2026-08-26 — D49; same workaround, one consumer now. De-pathed 2026-08-26d,
as `button.md` and `data-viewer.md` already were: a deleted screen named with a
`.html` on it is a path the validator only tolerates because `CITED_PATH_RE` wants a
`screens/` prefix, and the next person to add one will not be so lucky.) Recorded as a divergence
rather than a fix: the contract wants an anchor form of the segment, and
inventing one inside a screen bundle would be authoring a component part.

### 3. The band itself is unimplemented

`page-header.md` draws Breadcrumb as its own band of the page header, with its own
padding. **Nothing in this package implements it** — `.breadcrumbs` is the folder-grid
trail, a different component with a different job.

The screen that first needed it — the requester's archiving-request list — has since been
deleted: that list merged into `screens/du-an/ho-so/danh-sach.html`, where a request is a state on
the document row rather than a second list. `screens/du-an/ho-so/chi-tiet.html` still
ships a single back-link where its wireframe draws a full trail, for the same reason: it
carries the one hop that matters and claims to be nothing more. (The request's *detail*
screen made the same compromise and merged into that same file on 2026-08-26 — D49 — so
the archiving lane is now down to one screen owing this band, not three.)

The band stays owed by `page-header.md`.
