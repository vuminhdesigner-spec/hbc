# Item Listing (pat-il)

## Purpose

Item Listing is the reusable page-level layout for scanning, searching, and
monitoring a collection of operational records inside one MDM module (for
example, a project's uploaded records/documents). It combines lightweight
aggregate context (KPI summary), search/filter controls, and a paginated data
table under a page header with section tabs.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 |
| Figma file key | `tS8dUB2qWLc28gZbtj8IIL` |
| Frame | `pat-listing`, node `8576:63578` |
| Reviewed screen instance | `#DA3018 - LUMIÈRE Boulevard` → `Hồ sơ dự án` (project records tab) |
| Reviewed via | Figma Desktop Dev Mode MCP (`get_metadata`, `get_design_context`, `get_screenshot`), 2026-07-28 |

This is a different Figma file from the Untitled UI community file used for
the current V2 token/component source (`SFo9P9PCVQiuOk2SqjZYKQ`). The pattern
below is documented from the MDM V2 file directly; token and color values
should still resolve through the existing V2 token tiers, not be copied as
raw Figma values.

## Shell Context

This pattern occupies the app shell's main region. The **side navigation** and
the **page tab strip** above it are shell chrome owned by
`design-system/components/app-shell.md` (and, for the nav's internals,
`design-system/components/side-navigation.md`) — they are present on every screen regardless
of which pattern fills the main region, so this pattern neither describes nor
owns them. `screens/du-an/danh-sach.html` renders both for realism.

The pattern's anatomy therefore starts at the page header.

## Anatomy

In top-to-bottom, source order. **Folded 2026-08-14** against the screens that
ship: the six items below were written from the first `pat-listing` read and five
of them had been overtaken by revisions appended further down this file, so a
reader who trusted them built the wrong screen. Each item now states what ships;
the revision sections keep the reasoning.

1. **Page header — OPTIONAL since 2026-09-05, and omitted by default since
   2026-09-16.** Page title (record/entity identifier) and the record-level
   action. The pattern's *primary* CTA may live in the toolbar rather than here,
   so this slot is not always the one primary action on the screen.

   **The header-less shape is the listing composition.** It was one frame's
   choice when `project-list` adopted it — its `Page Header` instance is 40px,
   the page-tab strip with the title row off — and a second consumer made it a
   convention: `company-list` took the same shape on 2026-09-16 *by decision*,
   its own production source having drawn a title row. Two screens agreeing is
   what makes it the default; a new listing starts here and a listing that draws
   a header, like `project-docs`, states why.

   A screen that omits it owes three things: the primary CTA moves to the
   toolbar's trailing slot, the page keeps an accessible name (see
   *Accessibility*), and — because that name is then visible only as the page-tab
   label — the `data-page-tab-owner` entry's label in `scripts/page-tab.js` must
   equal the hidden `<h1>` exactly. `tools/gates/validate_v2.mjs` enforces the last one
   as `a11y:hidden-title-has-tab-label`; it is a check, not a convention, because
   the two strings live in different files and drift silently.
2. **Section navigation** — the record's sections (e.g. "Chi tiết dự án",
   "Chủ đầu tư", "Phân cấp", "Hồ sơ dự án"). These navigate between screens, so
   they are a `<nav>` of `<a href>` with `aria-current="page"` on the current one,
   never a `role="tablist"`. Shipped as `.tabs tabs--transparent` per
   `design-system/components/tab-bar.md` — the `.segmented` group with a green status dot
   described here originally was retired 2026-08-12 and never shipped.
3. **Summary metrics row** — 3–5 `Metric item` tiles (featured icon, label,
   number; no delta and no sparkline — see `design-system/components/metric-item.md`, which
   supersedes the `Metric item` variant in `design-system/components/dashboard-kpi.md`). Both
   MDM listing frames draw five. The row is one line at every tier and scrolls
   sideways inside its own scroller; it never wraps and never steps a column
   count. It has no collapse of its own — the escape hatch is the shell's
   fullscreen mode (`ds/components/app-shell.md` § Fullscreen mode),
   which hides the whole chrome band, this row included, and gives the height
   back to the table rows.
4. **Filter row** — search input and a `Bộ lọc` (Filter) trigger, a bordered
   **secondary** button, not a ghost button. See `design-system/patterns/filter.md` for the
   popover this trigger opens and `design-system/components/filter-panel.md` for the panel
   itself. There is **no** standalone status `Select` on this row: it was in the
   first read and no shipped screen draws one — the status axis is a facet inside
   the filter body.

   On a listing screen that also has a folder hierarchy, the search input does
   **not** narrow the table in place: a non-empty query swaps the whole body for
   a flat results table, because a query that can match anything cannot also be
   scoped to one open folder. That state is its own pattern —
   `design-system/patterns/search-results.md`. The `Bộ lọc` trigger is the control that narrows
   in place.

   **State across a navigation — 2026-08-14.** A listing's location (query,
   selected category, view mode, grid path, page) travels in **URL parameters**,
   not in session storage. A URL is linkable and survives a reload, and the
   sub-screens already take parameters, so this adds no new mechanism. Sub-screens
   carry the parameters they received back into every return link; the listing
   reads them before its first paint, validates each against real data, and keeps
   them in step with `replaceState` — never `pushState`, because a folder click is
   not a history entry. Session storage stays what it already was: a one-shot
   handoff for a save that just happened. Before this, every exit from a document
   returned the operator to the root state — first folder, page 1, table mode,
   query cleared — which on a bulk task means re-navigating the tree per record.
   Implemented on `project-docs` / `project-doc-upload` / `project-doc-preview`.
   The applied *filter* is deliberately not carried yet: serialising ten
   operator+value pairs into the URL is a pattern decision that has not been made,
   so returning from a document restores the location but not the filter.

   **Root state — 2026-10-05 (supersedes "first folder" above).** Entering with no
   `?folder=`: table view shows the category panel expanded (`folder--bare.is-wide`, with "Cập nhật gần nhất" / "Người cập nhật" columns) and no list; choosing a category collapses it and the browse table appears (replaces the empty state "Chọn danh mục để xem hồ sơ", 2026-10-06);
   folder view at the root still shows the category cards; the filter applies only
   once a category is chosen (it stays on and keeps its values meanwhile).

   **The browse table lists DOCUMENTS ONLY — 2026-08-16.** Its row inventory is
   one kind of row: a document filed against the selected folder (only documents; folder update info lives in the expanded category panel). Folders are
   listed by the three surfaces that exist for them — the tree beside the table,
   the folder-grid view mode, and the search results table (whose own source node
   draws folder rows, see `design-system/patterns/search-results.md`). This corrects a re-read:
   the frame's `Table` (`10254:53657`) draws seven rows and all seven are files,
   so the earlier reading that "the source lists sub-folders and documents in the
   same table" was wrong, and with it the two rules it produced —
   `project-docs`' three authored folder rows, and the synthesised sub-folder
   rows for a category selection.

   ~~**Consequence, still a product question.**~~ **Resolved 2026-08-22d**, and
   the answer is the first of the two this paragraph named: **the descendants'
   documents roll up into the category listing.** Selecting a category lists the
   union of its leaves, and the badge is computed from that same set rather than
   authored — so it cannot promise records the model does not have.

   The open question was stated as "either the descendants roll up, or a category
   is not selectable at all". The second was tried first (decision 5, 2026-08-14)
   and is what produced the dead rows: `f02`–`f06` carried `count: 120` from the
   comp with no children under them, and the repair was to make the rows inert
   rather than to fix the number. See `design-system/components/folder.md`,
   revisions 2026-08-22c and 2026-08-22d. **No folder row was put back into the
   documents table**, which is the part of the original answer that still stands.
5. **Data Table** — **15 visible columns totalling 2844px** per the re-read of
   the MDM V2 `Table` recorded in `design-system/components/data-table.md` (2026-08-12).
   `project-docs` renders **17 columns / 3231px** since 2026-08-22d, when the
   archiving request's state and its two deadline columns landed on the document
   row — see that contract's 2026-08-22d revision and this one's below. The first read below (13 columns / 2294px, Figma
   `10007:17211`) is kept for its column list, and its two status columns are now
   `Trạng thái lưu trữ` and `Trạng thái hồ sơ` rather than one `Trạng thái`:
   ID, Tài liệu (`Lead icon` cell), Mã hồ sơ, Số văn bản, Loại tài liệu,
   Trạng thái (badge with dot, not colour alone), Người tạo (`Avatar` cell),
   Nơi nhận, Nơi phát hành, Date, Người cập nhật (`Avatar` cell), Ngày cập
   nhật, and a 68px action column. Total width is 2294px, so the table scrolls
   horizontally inside the panel. See `design-system/components/data-table.md`.
6. **Pagination footer** — left utility actions and a right-aligned joined
   pagination group with prev/next arrows. **How many utility actions is an
   instance decision, not the pattern's:** `project-docs` renders one
   (`Thiết lập`, per node `10007:17123` — see the 2026-08-14 revision in
   `design-system/components/pagination.md`), the other instances render three (reload,
   settings/column config, download). Read the source instance's Actions slot
   rather than taking a count from here. See `design-system/components/pagination.md`,
   `Type=Multi-page` — renamed from `Card button group right aligned` when the DS
   set was re-read on 2026-08-19, and the pattern draws `Type=One page` instead
   whenever the record set fits on one page. It sits on the bottom edge of the viewport
   and does not move: it is outside the row scroller, so freezing it costs no
   sticky element — see *Scroll behaviour*.

## Composition Rules

- Fixed order: page header → section navigation → summary metrics row → filter
  row → data table → pagination footer. Do not interleave. **Two amendments,
  2026-09-05** (`project-list`, `10469:9852`): the page header may be absent
  entirely (Anatomy item 1), and where it is, the filter row leads the content
  region and the metrics row follows it — `tool-bar` at y=56, the metric
  `Container` at y=108. Both are the frame's order. Every other screen in the
  package still draws header → metrics → toolbar, and this does not license
  reordering one that does.
- The summary metrics row is optional per screen: include it only when the
  record set has meaningful count-based states to show at a glance (e.g.
  total / published / draft / suspended). Omit the row entirely rather than
  showing empty or placeholder KPIs.
- The filter row and data table are visually grouped (no separating card
  boundary between them); the metrics row above is a visually distinct
  section.
- Table pagination is the only footer; do not add a second global footer
  below it.
- The page is fixed to one viewport and the table region absorbs the leftover
  height (see *Scroll behaviour*). A new instance opts in with
  `.mdm-shell--fixed`, `.page--fixed` and `.page-fill` on whichever region holds
  its list; everything else about the composition is unchanged.
- Responsive behavior belongs to this pattern, not to the table/KPI
  components individually: collapse regions before shrinking anything. The
  ladder — tiers, tokens and the full region reference — is
  `.claude/skills/responsive/SKILL.md`. For this pattern:
  - The metric row stays on ONE line at every tier: the tiles flex down to
    `--utui-metric-tile-min-width` and the row then scrolls sideways inside
    `.metric-scroller`, with an arrow at each edge. It does not wrap and it has
    no column-count ladder — that went on 2026-08-14, along with the per-screen
    copies of it. See `design-system/components/metric-item.md` and `.claude/skills/responsive/SKILL.md` § Metric rows.
  - The category tree stops being a sibling column at `md` and sits above the
    list, keeping its own scroll so a long tree cannot push the table away. As a
    column it fills the page's leftover height; stacked at `md` it is capped at
    320px, which is the only tier where that number is needed.
  - The filter row stacks at `md`, search first and full width.
  - The table always keeps its designed column widths and scrolls inside
    `.data-table-wrap`. Never compress cell text, hide columns, or introduce
    column priority to fit a width.
  - Gutters, the page header stack and the pagination footer come from the
    shared ladder; this pattern must not restate them per breakpoint.

### Tree + list region

A listing with a category tree draws the tree and the table as **one block**, not two cards. Added 2026-10-01 (`du-an/ho-so/danh-sach`).

DOM: `.docs-body` (shell) > `aside.folder.folder--bare` + `section.docs-main` > `.table-panel.table-panel--fill`. Landmarks and `aria-label`s are unchanged.

- Shell: `gap: 0`, `--utui-radius-md`, `--utui-color-bg-surface`, `--utui-shadow-xs`, `overflow: hidden`. The shell is clipped, so child focus rings must be inset (`.docs-main:focus-visible` uses `outline-offset: -2px`).
- Tree column: `.folder--bare` — divider on its inline-end edge, head band aligned with the table's `thead` (`folder.md` § Variant `--bare`).
- List: the `.table-panel` carries `.table-panel--bare` (`data-table.md` § Variants) and so loses radius/fill/shadow.
- Columns: tree default 360px at xl, 288px (`--utui-spacing-64` + `--utui-spacing-08`) at `max-width: 1279px` (lg) — **OPEN: chờ Figma xác nhận** the lg value. The user resizes it with `.resize-handle` on the divider (`resize-handle.md`): min 240px, max 50% of `.docs-body`, remembered in localStorage; the grid is `var(--resize-size, <default>) minmax(0, 1fr)`. The category panel also has a full-width `.is-wide` state (`folder.md` § State `.is-wide`, 2026-10-06): the shell becomes one column and the list is hidden; the resize handle is hidden and its saved width returns on collapse.
- At `max-width: 1023px` the tree stacks above the list (capped 320px), the divider turns horizontal, the resize handle is hidden and a saved width is not applied.
- The list column (`.docs-main`) is `isolation: isolate` so its sticky cells (z 2/3) cannot paint over the tree column's `.resize-handle`; same rule for any sibling of a handle's column. The `.table-panel--bare` goes on the list panel inside `.docs-body`, not on the search-results card.
- Shell CSS lives in the screen (`.docs-body`) because this pattern owns no stylesheet and there is one consumer; promote to `ds/styles/` when a second listing adopts it.
- Empty/loading list (`?state=loading`, an empty folder) render inside the shared frame without their own surface. Search results are NOT in this frame: they show in `#docsSearchView` (own card) while `.docs-body` is hidden.

### Page wash

The page background is the `BG Gradient` style rather than a flat page colour.
It is **pattern-owned**: no component paints it, and it sits behind every region
in the anatomy.

Source: the published style `Color Styles/BG Gradient` (`7684:91648`), which
stacks three gradient fills over a Slate-50 base. In paint order (top layer
first):

| Layer | Paint | Value |
|---|---|---|
| 1 | Linear | `brand-50` at 0% → transparent at 58.12% |
| 2 | Radial, semi-axes 1231.4 x 446.7 rotated 45.3° at 50.65% 40.19% | `brand-100` → transparent |
| 3 | Linear | `--utui-page-wash-cool` at 29.01% → transparent at 53.12% |
| base | Solid | `--utui-page-wash-base` (`slate-50`) |

The two linear layers carry no fixed angle on purpose. Figma normalises
gradient handles to the node box, so their visual angle skews with aspect
ratio — the style's own export reads 174° / 204° in its ~2.17:1 frame and
175.87° / 196.79° in a 2006x1358 one. Both are the same paint.

`--utui-page-wash` therefore ships as a **single stretched SVG layer**, not as
three CSS gradient functions. CSS cannot express either the rotation on layer 2
or the aspect-dependent skew on 1 and 3; `preserveAspectRatio="none"` gives
both for free. The earlier all-CSS transcription flattened layer 2 into an
axis-aligned `radial-gradient(69.83% 43.92% ...)`, a much larger ellipse that
smeared `brand-100` over the page — measured against the Figma render, a mean
channel error of 7.05 biased warm (R -1.2, G -3.6, B -6.7), which read as a
brown cast with the cool layer washed out. The SVG form measures 0.82 with no
colour bias. Verify changes by rendering at 2006x1358 and diffing against the
`bg-gradient` node, not by eye — the error is a few units per channel on a very
pale field.

Any paint site needs three declarations, not one: `background-image`,
`background-size: var(--utui-page-wash-size)` and `background-repeat: no-repeat`
— plus the `background-color` below.

Take these values from the **style**, not from a frame that consumes it. The
one exception is the SVG's own geometry, transcribed from `bg-gradient`
(`11762:32305`): a stretching viewBox makes the source frame's aspect
irrelevant, which is the only thing that warning guards against. The figures
here were previously transcribed off the `pat-listing` `Main` frame
(`10254:53657`) and were wrong on both linear angles, the radial extent, the
cool-layer stops, and the base colour — see Known Gaps.

Paint it on the **page container** (`.mdm-shell`), not on the main column or
the scrolling page wrapper, and leave both of those transparent so one
background covers nav gutter, header and content alike. The navigation column's
own opaque fill covers its half. The composed token is `--utui-page-wash`.

Any element painting it must set `background-color: var(--utui-page-wash-base)`;
compositing the layers over white instead of Slate-50 loses the cool cast of the
unwashed lower page. Because every paint site uses
`background-attachment: fixed`, the layers resolve against the viewport, so a
sticky slice and the page behind it stay aligned at any scroll offset — which is
what lets `.page-sticky` repaint the same background without cutting a band
across it.

Because the wash renders behind the header, the **Page Header must use its
`Transparent` variant** (`design-system/components/page-header.md`) — the `Default` variant's
opaque surface would mask the gradient exactly where it is strongest.

### Scroll behaviour

**Rewritten 2026-08-16: the page does not scroll.** Every instance of this pattern
now runs in the shell's fixed-viewport mode (`design-system/components/app-shell.md`) — the
document is exactly one viewport, the regions above the list take their natural
height, and the list region takes what is left. What used to be three separate
mechanisms for keeping chrome on screen while the document scrolled is one height
chain, and the pattern owns which region absorbs the leftover:

| Region | Height |
|---|---|
| Pinned block (tab strip + page header + section nav) | Natural |
| Summary metrics row | Natural |
| Filter row | Natural |
| List region (table body + its frozen footer) | **The rest**, floor 320px |

Consequences, each of which replaces a rule that used to be in this section:

- **The table's column header and its pagination footer are both frozen.** The
  footer is a sibling of the row scroller rather than a row inside it, so it needs
  no sticky treatment — and must not be given one, or it would track the table's
  horizontal scroll as well. See `design-system/components/data-table.md`.
- **The toolbar's pinning is gone**, and so is the measured
  `--docs-chrome-height` that positioned it. Both existed to keep the toolbar
  reachable in a scrolled document; there is no scrolled document.
- **The metric strip is always shown; the escape hatch is fullscreen, not a
  per-region collapse.** The user can hide the whole chrome band — nav, tab
  strip and the strip together — via the shell's fullscreen mode and get that
  height back on the rows. See `ds/components/app-shell.md` §
  Fullscreen mode.
- **The category tree fills its column** and scrolls inside it, rather than being
  bounded by `calc(100dvh - offset - 60px)`.
- **At `sm` the mode comes off** and the page scrolls again, pinned block and all;
  so does the floor's fallback on any viewport too short for 320px of list. Those
  are the only two states in which this pattern scrolls vertically.

Side-navigation persistence is the shell's, not this pattern's — see
`design-system/components/app-shell.md`. What follows is the pinning contract as it stood
before this rewrite. It is kept because the pinned block itself is unchanged —
still one sticky element, still painting the wash with
`background-attachment: fixed` — and because `sm` still uses it exactly as
written. Read the toolbar bullet at the end as history:

- The **page header and section navigation stay pinned** while the rest of the
  page scrolls, and they pin *together with the shell's page tab strip* as one
  block. Implement all three as a *single* sticky element (`.page-sticky`)
  rather than stacked sticky elements: one element needs no cascading `top`
  offsets and leaves no gaps for content to show through.
- The pinned block must be **opaque, but not flat**. It repeats the page wash
  (below) with `background-attachment: fixed` rather than painting a solid
  colour: the layer is then positioned against the viewport, so the sticky
  slice and the region behind it stay aligned at every scroll offset. A flat
  fill would cut a hard band across the gradient as soon as the page scrolls.
- That single element is the one place this pattern reaches above its own
  anatomy, and it does so only to co-ordinate pinning — the tab strip's
  contents remain owned by `design-system/components/page-tab.md`.
- Because the sticky block owns the page's top padding, the scrolling region
  below it must not repeat that padding.
- Pinning the header keeps the record identity and the primary action reachable
  at any scroll position, which is the point — do not move the primary action
  into the scrolling region.
- The table's column headers stay pinned while rows scroll; see
  `design-system/components/data-table.md`.
- **The toolbar may pin as a second band under that block, and on `project-docs`
  it does** (2026-08-15). Two rules come with it, and both are what stop a second
  sticky element from being the mistake the single block above avoids:
  - its `top` is the **measured** height of the pinned block, published by the
    screen's JS with `--utui-sticky-chrome-offset` as the no-JS fallback. The
    token is a tiered constant and the block's height is content-dependent, so a
    toolbar pinned to the token hides behind it — see `.claude/skills/responsive/SKILL.md`
    §10.6;
  - it carries the same wash-with-`background-attachment: fixed` band as the
    block above it, extended over the page gutter and given back with a negative
    margin, or the table scrolls through it and the gradient gets a hard edge.

  Pin the toolbar rather than *hiding* the metric row on scroll. Both reclaim
  vertical budget for the data; only one of them moves the content the user is
  reading, drops a labelled region out of the accessibility tree with nothing to
  announce it, and detaches every overlay anchored to the toolbar. The metric
  strip's scroll collapse shipped on 2026-08-14 and was removed on 2026-08-15 for
  exactly that — the reasoning is kept in `design-system/components/metric-item.md`.

## Content Slots

| Region | Slot | Notes |
|---|---|---|
| Page header | Title | Entity identifier, e.g. `#DA3018 - LUMIÈRE Boulevard` |
| Page header | Primary action | One action, e.g. `Tải lên hồ sơ` |
| Section navigation | Sections | 2–4 sections; active one marked with a green dot plus `aria-current="page"`, not color alone |
| KPI 1–5 | icon, label, value | No delta and no sparkline — neither MDM frame draws a `_Change`. See `design-system/components/metric-item.md` |
| Filter row | Search placeholder | e.g. `Tìm mã hồ sơ, số văn bản, tên tài liệu…` |
| Filter row | Status select | Single-select status filter |
| Filter row | Filter trigger | Opens expanded filter body per `filter-panel.md` |
| Table | Columns | Product/module-specific; status column always uses badge + dot |
| Table | Row actor | Created-by avatar + name + email, matching Data Table anatomy |

## States

The pattern owns only how the regions behave *relative to each other* in each
state; the visual treatment of each region belongs to its component contract.

- **Default populated** (see screenshot reference above).
- **Empty** (no records at all) and **zero-result** (filtered to nothing) — the
  table region renders the state; the KPI row stays visible showing zeroes, and
  the filter row stays enabled so the user can clear the filter that produced a
  zero-result. Do not blank the whole page.
  "Showing zeroes" is the whole obligation: **the KPI row counts the current
  result set, not the unfiltered one.** A screen with a live search therefore
  re-renders its tiles on every keystroke, and must call
  `window.OmeuMetricScroll.refresh()` afterwards so the strip's arrows re-measure
  a row whose tiles just changed — see `design-system/components/metric-item.md`. It must also
  not shift the page under a focused search input while doing so.
  Where a tile's qualifier cannot follow the filter — a "vs. yesterday" delta on
  an arbitrary subset is a fabrication — omit the qualifier rather than render a
  placeholder, per `design-system/components/metric-item.md` *Change absent*.
- **Loading** — KPIs show skeleton or are omitted; the list region carries
  `aria-busy` per `design-system/components/filter-panel.md`, which owns the loading contract
  for the region it filters.
- **Error** — a table-level error must not blank the KPI row; KPIs fall back to
  "unavailable" per the Dashboard KPI contract rather than blocking the whole
  page.

Empty, zero-result, and error are **not yet specified** by
`design-system/components/data-table.md`, which defers them to the PRD, and are not
implemented in the demo. See Known Gaps.

## Tokens

All visual values resolve through the component contracts this pattern composes
(`app-shell.md`, `dashboard-kpi.md`, `filter-panel.md`, `data-table.md`,
`pagination.md`) and the shared V2 token tiers in `design-system/tokens/`.

The one exception is the page wash, which no component owns. It adds five
component-tier tokens in `design-system/tokens/css/untitled-ui-component.css`, recorded in
the token source under `component.page-wash`:

| Token | Resolves to |
|---|---|
| `--utui-page-wash-warm` | `--utui-color-brand-50` |
| `--utui-page-wash-glow` | `--utui-color-brand-100` |
| `--utui-page-wash-cool` | `#f2faff` — **pinned literal**, see Known Gaps |
| `--utui-page-wash-base` | `--utui-color-slate-50` |
| `--utui-page-wash` | the composed three-layer gradient |

## Usage

Use Item Listing for any MDM module whose primary job is scanning a record
set with light aggregate context before drilling into a specific record's
detail. Do not use it for pure analytics/dashboard screens (no record-level
table) or for detail/edit screens (see `design-system/patterns/item-detail.md`).

## Accessibility

- One `h1`-equivalent page title. It may be **visually hidden** on a screen whose
  frame draws no header row — `.sr-only-label` on `project-list`'s `<h1>`. What
  the rule requires is that the page has exactly one accessible name and that it
  is first in the content region's source order, not that it is painted. A screen
  in that shape has a second obligation: its only *visible* name is then the
  page-tab label, which is rendered from a shared registry, so the two strings
  have to be kept in step deliberately rather than by luck. Since 2026-09-16
  that is checked rather than trusted — `tools/gates/validate_v2.mjs`'s
  `a11y:hidden-title-has-tab-label` fails the build when a hidden `<h1>` and its
  registry label disagree, which is what adding the second consumer exposed.
- The section navigation moves between screens rather than swapping in-page
  panels, so it is a labelled `<nav>` with `aria-current="page"` on the active
  section — not a `role="tablist"`. Only use tablist semantics if the sections
  ever swap content in place without navigating.
- KPI region should be a labelled landmark separate from the table region.
- Follow each composed component's own accessibility contract; this pattern
  only owns heading/landmark order and focus order top-to-bottom as listed in
  Anatomy.

## Code Mapping

| Surface | File |
|---|---|
| Pattern contract | `design-system/patterns/item-listing.md` |
| Demo implementation | `screens/du-an/danh-sach.html`, `screens/du-an/danh-sach.css`, `screens/du-an/danh-sach.js`. `screens/item-listing.*` was the first demo and has been deleted |
| Sample data | Inline in the screen bundle (KPI totals are static display values; the table renders a smaller mock record set to demonstrate search/filter/pagination — same convention as other V2 demos) |

`screens/du-an/danh-sach.js` no longer follows that sample-data convention
for its KPIs, and deliberately: its tiles are **derived from the filtered record
set** so the zero-result state above shows zeroes instead of the frame's 88 / 50
/ 30 / 8 / 8. The cost is that its default view reads 50 / 25 / 15 / 5 / 5 — its
own 50-row sample set — rather than the frame's figures, which no whole number of
cycles of that set can produce. The frame's proportions are preserved. Any other
screen whose KPIs sit above a live filter should follow it; `item-listing.js` and
`du-an/ho-so/danh-sach.js` still carry static totals and still have this defect.

**The toolbar row carries no vertical padding.** `Search Panel` is `py 12px` and
68px tall (§*Revision — 2026-08-12*, `10471:20421`), and the row consumed
`--utui-spacing-03` as `padding-block` for that — first on each screen's own
class (from 2026-08-16), then on the shared `.listing-toolbar` base rule after
the 2026-09-03 promotion. **Removed 2026-09-05 by request.** The row now
resolves to the height of its tallest control, 44px, and the space above and
below it comes from whatever stacks the region's children. The composition is
unchanged: `.docs-filter` (`screens/du-an/ho-so/danh-sach.css`), `.list-toolbar`
(`screens/du-an/danh-sach.css`) and the inner `.docs-filter__search`
(`screens/du-an/ho-so/hang-doi.css`) all still carry the `.listing-toolbar` class
(`du-an/phan-cap.html`'s toolbar dropped its own `.hierarchy-toolbar` /
`.hierarchy-search` hooks 2026-09-28 — dead, no CSS or JS used them),
which is now gap and alignment only. The mechanism, and the note not to
reinstate the padding on the component, are owned by
[`design-system/components/listing-toolbar.md`](design-system/components/listing-toolbar.md)
— patterns do not own component internals
(`design-system/patterns/README.md`).


## Known Gaps

The gaps recorded against this contract. Each is an **accepted** deviation:
do not re-fix one, and do not invent a value it says is missing. What each
gap is, what was measured and what it costs live in [`docs/revisions/item-listing.md`](docs/revisions/item-listing.md#known-gaps)
— read the entry your change touches, not the file.

| Group | Entries |
|---|---|
| Open | 5 |
| Resolved | 3 |

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/item-listing.md`](docs/revisions/item-listing.md). Read a revision when you need to know *why* a rule above
reads the way it does; the rules above are the contract and are current.

- 2026-08-12 (`pat-listing` re-read)
- 2026-08-14 (`Địa chỉ`: the pattern as a *view-all sub-page*)
- 2026-08-21 (scope is an axis, not a facet) · RATIFIED 2026-08-22
- 2026-08-22d (a row's actions may depend on a row's state)
- 2026-08-27 (a work-group row is a third toolbar axis, and it is not a scope)
- 2026-08-27e (a declared deadline survives the state it was declared in)
- 2026-08-27f (a deadline the listing refuses and the detail screen prints)
- 2026-09-05 (`project-list` drops its page header; the toolbar leads)
- 2026-09-16 (a second consumer makes the header-less shape the default)
