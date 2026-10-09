# Item Detail (pat-id)

## Purpose

Item Detail is the reusable page-level layout for **reading** one record's full
attribute set. It presents a record as a grid of titled sections — each a
self-contained group of facts with its own edit affordance — under a page header
that carries the record's identity and a single primary edit action.

It is the read side of a record. The listing that leads into it is
`design-system/patterns/item-listing.md`; the form that edits it is a separate surface reached
from a section's action, not this pattern.

**Three screens compose on this grid today.** `doi-tac/chi-tiet` (rows of
6 / 2+2+2 / 2+4), `du-an/chi-tiet` (rows of 4+2 / 4+2 / 6, see *Record
specifics*) and `doi-tac/ho-so-nang-luc` (`--full` cards only). All use the shared `.section-grid` and its spans; neither carries
its own row shape.

**A second screen composed on this grid until 2026-08-19.** `Chủ đầu tư`
(`screens/project-investor.html`, node `10840:73734`) laid out rows
of 6, then 3+3, then 2+2+2, at the same 1088px content width and 32px gutter, so
it reused this pattern rather than getting one of its own; the screen was deleted
when the product owner retired the record's `Chủ đầu tư` tab. The evidence it
provided still stands — two independent records resolved to the same grid — which
is why the
grid's CSS moved out of `item-detail.css` into `styles/section-card.css`
on 2026-08-12 — see Code Mapping. Its one addition is a **span-6 card**
(`.section-card--full`), for a full-row card — that screen split its data list
into two side by side (`.data-split`, retired 2026-09-24 for
`design-system/components/data-viewer.md`'s `--cols`, which packs one list into
pairs instead of composing two).

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 |
| Figma file key | `tS8dUB2qWLc28gZbtj8IIL` |
| Frame | `Thông tin chi tiết`, node `10287:10813`, 1440 x 1959 |
| Reviewed screen | Company master record — `Công ty TNHH Một Thành Viên Xây dựng Tiến Phát` |
| Reviewed via | Figma REST API (`/v1/files/…/nodes`), 2026-08-04 |

## Shell Context

The **side navigation** and the **page tab strip** are shell chrome owned by
`design-system/components/app-shell.md`. The pattern's anatomy starts at the page header.

One divergence to note: the side navigation in this frame carries a **search
input** directly under the brand (264 x 40, `icon-leading`, placeholder
`Tìm kiếm`) that no listing screen has. That belongs to
`design-system/components/side-navigation.md`, not to this pattern — recorded in Known Gaps.

## Anatomy

In top-to-bottom, source order:

1. **Page header** — `design-system/components/page-header.md`, variant `Transparent`, with
   `Badge`, `CTA`, `Sub-title` and `Tab` all enabled:
   - title (record name) plus one status **Badge** (`Success` in the reviewed
     screen, carrying the record code);
   - **Sub-title** carrying the provenance line — "last updated at … by …" plus
     an inline "view update history" link. Note this uses the **Sub-title**
     slot, *not* the header's `Timestamp` boolean, which is off;
   - one primary action (`Sửa thông tin` / Edit);
   - **Tab Bar** for sibling views of the same record (`Thông tin chi tiết`,
     `Hồ sơ năng lực`).
2. **Completeness banner** — a full-width `inform` card (16px radius, 24px
   padding, 24px gap): 48px featured icon, a 20/30 Medium headline with a 14/20
   supporting line, and a trailing secondary action. It reports how much of the
   record is still unfilled. Optional. See `design-system/components/inform.md`.
3. **Anchor navigation (optional, see `design-system/components/anchor-nav.md` § Usage for when)** — a `Horizontal tabs` pill rail (44px tall, 10px
   radius, 4px padding, 4px gap) listing every section below it. Pills are 36px,
   6px radius, 12px horizontal padding; the active pill is `brand-50` with a
   `Brand/500` Semibold label, inactive labels are `#667085` Semibold. Each pill
   has an optional trailing count badge, unused in the reviewed screen. See
   `design-system/components/anchor-nav.md`.
4. **Section grid** — the record's content, as cards. See below.

### Section card

The repeating unit — see `design-system/components/section-card.md` for the box,
the grid and its spans. 16px radius, surface background, **20px padding, 20px gap**
on this grid (see Composition Rules; the component's own base is still the frame's 24).

- **Section header** — see `design-system/components/section-header.md`: a 40px featured icon
  on the left, the trailing action on the right, then a title (18/28 Semibold)
  with a supporting line (14/20), then a 1px divider.
- **Body**, one of these shapes:

  | Body | Used for | Composition |
  |---|---|---|
  | **Data list** | attribute groups | `Data viewer` rows, 16px gap. Label 16/24 Regular `#667085`, `fit-content(40%)` — hugs its own longest label rather than a fixed width. A wide card may opt into `--cols` to pack more than one label/value pair per row, by the card's own measured width — see `design-system/components/data-viewer.md` |
  | **Entity list** | addresses, banks, contacts | **`design-system/components/entity-row.md`** — rows 20px apart: a **40px** mark, 12px gap, then a text-md/Medium name over **one** ellipsised supporting line (re-read 2026-09-30, `10282:8548` in `10287:10813`). All three are `--action` rows; banks and contacts carry a monogram mark, addresses a `featured-icon--neutral` `location_on` mark, name = address type, supporting line = the composed address |
  | **Attachment list** | files on the record | 12px apart, each a bordered card: 40px file-type chip, name, size — `design-system/components/attachment-list.md` |
  | **Empty state** | any section with no data | 293 x 240 block: icon, "no information yet" title, guidance line, and a primary "add" action |

- **Optional footer link** — `Xem tất cả` with a trailing arrow, when the
  section holds more entries than fit. No count in the label (USER DECISION,
  2026-09-29, reversing this pattern's own earlier `Xem thêm 10+` reading) — the card already
  shows a curated subset (the collection's first N records in list order, not
  a "top" ranked by anything), and a count invites reading it as a total the
  arrow_forward destination will confirm or correct. Whichever surface shows
  the actual total says so; this label just offers to see it.

## Composition Rules

- Fixed order: page header → completeness banner → anchor navigation (if present) → section
  grid. Do not interleave.
- **The grid is 6 columns with a 20px gutter.** Cards span 2, 3, 4 or 6 columns
  (349 / 534 / 719 / 1088px at the 1088px content width). Shipped rows: the partner record
  (`doi-tac/chi-tiet`) is **6 / 2+2+2 / 2+4** (`--full`, three base cards, a base
  card plus `--wide`); the project record (`du-an/chi-tiet`) is **4+2 / 4+2 / 6**
  (`--wide` + base, `--wide` + base, `--full`). Do not introduce a span that does not resolve on
  this grid.

  **A body shape can be wrong for a span, and the span wins.** The partner
  record's `Thông tin khác` gave up its `data-list--grid` body in that same
  change: a four-column grid of short attributes is what a span-6 card wants, and
  the card is span-2 now. It went back to the plain data list every other
  field-group card on that page uses.

  **The gutter is 20px by product decision (2026-09-16), not the source frame's
  32.** `.claude/skills/design-rules/SKILL.md` fixes page layout at one 20px
  rung — `--utui-page-gutter-x`, `--utui-page-gutter-y` and
  `--utui-page-block-gap` are all `--utui-spacing-05` — and this grid is page
  layout by the same argument: it is the gap between a page's blocks, six columns
  wide. The frame's 32 left the one region that is not on the rung in the middle
  of the page.
- **A card is 20px padding, 20px gap**, moved off the frame's 24 in the same
  decision and applied to `.section-card` itself rather than to this grid — so
  every screen that uses section cards reads alike. One rung, one card
  geometry. The record screens of the time were re-measured when it landed.
- **Cards in a row stretch to equal height.** A short card pads rather than
  shrinking, so row baselines stay aligned.
- **The grid collapses before any card's internals do**, and cards keep their
  reading order. The 6-column grid holds through `xl` so the 1440px source frame
  renders as designed; at `lg` spans hold as `xl`; at `md` the grid
  is two equal columns — bare cards span one, `--wide`/`--full` the whole row;
  at `sm` it is one column. See `design-system/components/section-card.md`. The ladder is
  `.claude/skills/design-rules/SKILL.md` — the label/value rows, the banner and
  the anchor rail's offset are component- and token-level and are not restated
  here.
- **The anchor navigation (if present) and the section grid must match 1:1 and in order.** A
  pill with no section, or a section with no pill, is a defect — the rail is a
  table of contents, not a filter.
- **A section with no data still renders its card**, carrying the empty-state
  body. Sections must not disappear, because the anchor rail (if present) and deep links reference them and
  their absence would read as "this record has no such concept" rather than "no
  data yet".
- **The trailing action encodes where editing happens**, and is not decorative:
  - `edit` (pencil) — the section is editable in place;
  - `arrow_forward` (or `chevron_right`) — the section opens its own sub-page or
    drawer, and the card's `Xem tất cả` footer goes to the same place.
  Pick by behaviour, not by how full the card looks.

  **The glyph is `arrow_forward` where a frame draws one.** The flow frame for
  the partner record (`TpwqqNqhnFgycttdngXmFA`, `14128:55929`, read 2026-09-16)
  draws an arrow on all three of its collection cards; `chevron_right` is what
  this contract asked for before any frame had drawn the action, and it stays
  listed because an earlier company record screen (since deleted) predates that read. The two mean
  the same thing and one screen should not carry both.

  **A collection card's arrow and its `Xem tất cả` are ONE affordance drawn
  twice, so they must be the same kind of element.** Where the page exists, both
  are `<a href>` — a real navigation has to be openable in a new tab. Where the
  full collection is a drawer instead (`design-system/components/drawer.md`),
  both are `<button>`s carrying `aria-haspopup="dialog"` and open the same
  surface. `screens/doi-tac/chi-tiet.html` is the drawer case for all three of
  its collection cards: `Địa chỉ`, `Tài khoản ngân hàng` and `Người liên hệ`
  each open `#addressDrawer` / `#bankDrawer` / `#contactDrawer` (MDM-1209,
  folding the three stand-alone list pages this pattern used to link to into
  one drawer per card, on the record's own page).

  **The card shows the first N records of the drawer's own list, in list
  order — not a separate copy of the data.** (USER DECISION, 2026-09-29.)
  Re-render the card from that same source after every add, edit or delete:
  deleting a record the card was showing pulls the next one up from the list;
  the card goes to its empty state only once the list is actually empty (or a
  demo forces it to, same as `Người liên hệ`'s `?state=empty`); adding a
  record never changes the card unless the list had fewer than N before. The
  full mechanism, including the drawer's own true-empty state and its `Thêm …`
  visibility, is `design-system/components/drawer.md`'s.
- The page header's primary action edits the record as a whole; per-section
  actions edit one group. Both may be present — they are not redundant.

### Scroll behaviour

- The page header pins with the shell's tab strip as one sticky block, exactly
  as in `design-system/patterns/item-listing.md`.
- **The anchor rail should pin below it** once scrolled to, so the table of
  contents stays reachable in a page this tall (at least 2 viewports at 1440x900). The source
  frame is a static composition and does not state this; it is a pattern-level
  decision recorded here and flagged in Known Gaps.
- The section grid scrolls normally; cards do not scroll internally.

## Record specifics (`du-an/chi-tiet`)

The project record's read view is this pattern on the shared 6-column grid,
not a separate pattern. Implemented in `screens/du-an/chi-tiet.html` / `.css` /
`.js`; the section data marks each card `span: "wide"` or `"full"` (absent =
base). Rows: `Thông tin dự án` (wide) | `Quy mô` ; `Các giai đoạn chính` (wide) |
`Chủ đầu tư` ; `Vị trí dự án` (full). The tier collapse comes from
`styles/responsive.css`, not from this screen.

- **`Thông tin dự án` carries `--cols`, but packs two pairs only from ~1600px.**
  The wide card's body passes the 800px `--cols` threshold
  (`styles/data-viewer.css`) only at viewports of roughly 1600px and up; at the
  1440 source frame and below it reads as one pair per row. The spare height
  under `Quy mô` and under the phase table is the row stretch this pattern asks for.

- **`Vị trí dự án` is full-width and ends in a static map image.**
  `.overview-map` (`screens/du-an/chi-tiet.css`) is a plain `<img>` after the
  card's label/value grid, with a real `alt` naming the project's address, not
  a decorative one. **Open question:** the source is a screenshot, not a live
  map; whether this ships as an embedded map (and which provider) is a
  design/product call, not something CSS can settle.
- **The record's lifecycle state drives the page header's actions, not a
  section.** `STATUSES` / `TRANSITIONS` / `ROLE_ACTIONS` and
  `renderProjectStatus()` (`screens/du-an/chi-tiet.js`) pick the header's badge
  tone and its offered actions from the record's status and the acting role —
  e.g. `Gửi phê duyệt` in `Nháp` (no page-level `Chỉnh sửa`; there is no màn
  chỉnh sửa, removed 2026-09-28 — sửa theo block/card bằng bút chì), `Không
  phê duyệt` + `Phê duyệt dự án` in `Chờ phê duyệt`, nothing once the record is
  decided.
  Every transition confirms through `design-system/components/modal.md` at
  the `md` size before it commits, and reports through a notification card.
- **Permission gate on the `Chủ đầu tư` card.** `?permission=none` in the URL hides
  the card's content and shows the empty-block message `Chưa có quyền xem thông
  tin này` instead (decision PO 2026-09-28; existing behaviour kept as-is).

## Content Slots

| Region | Slot | Notes |
|---|---|---|
| Page header | Title | Record name |
| Page header | Badge | One status/code badge |
| Page header | Sub-title | Last-updated line + history link |
| Page header | Primary action | One, e.g. `Sửa thông tin` |
| Page header | Tabs | 2–4 sibling views of the record |
| Banner | Headline + supporting + action | Completeness prompt; omit when the record is complete |
| Anchor rail (optional) | Pills | One per section, in section order; optional count badge |
| Section | Icon, title, supporting text | Supporting text states the section's purpose, not its contents |
| Section | Trailing action | `edit` or `chevron_right` per the rule above |
| Section | Body | Data list / entity list / empty state |
| Section | Footer link | `Xem tất cả`, when truncated |

## States

The pattern owns how regions behave relative to each other; each region's own
rendering belongs to its component.

- **Default** — all sections populated.
- **Missing value** — an individual field with no data renders the placeholder
  `--` in muted type, in place of the value, with a `.sr-only-label` span
  `Chưa có dữ liệu` so it still announces. The row stays; it is not removed. See
  `design-system/components/data-viewer.md` (decision, 2026-09-28).
- **Empty section** — the card renders the empty-state body with its own add
  action. The card and its anchor pill both remain.
- **Complete record** — the completeness banner is omitted entirely rather than
  showing a zero count.
- **Short record → no rail** — added 2026-09-30. Under the anchor-nav Usage rule
  (page at least 2 viewports tall and at least 4 sections), a page below it omits the rail and
  keeps every section `id` for `aria-labelledby` and deep links. Example:
  `doi-tac/chi-tiet`.
- **Unlinked record** — added 2026-08-14 for the `Chủ đầu tư` tab
  (`11357:48456`). When the whole pattern describes a *related* record that has
  not been chosen yet, the anchor rail and the entire card grid are replaced by
  one page-level empty state (`design-system/components/empty-state.md`, `.empty-page`) whose
  primary action opens the picker (`design-system/components/drawer.md`). This is one of two
  cases where the rail is absent (see *Short record*): there are no sections to link to, so a rail of six
  pills pointing at nothing would be worse than none. Distinguish it from *Empty
  section*, where the record exists and one of its collections is empty — there
  the card and its pill both stay.
  Exactly one of the two bodies is in the document at a time; nothing is
  duplicated in the accessibility tree, and confirming in the drawer moves focus
  to the body that replaced the empty state.
- **Loading** — sections may skeleton independently; the anchor rail should
  render as soon as the section list is known, since it does not depend on
  values.
- **Error** — a section that fails to load shows its own error inside the card,
  and must not blank the rest of the grid.

## Tokens

All values resolve through the component contracts this pattern composes and the
shared V2 token tiers. This pattern introduces no new tokens.

The 6-column grid and its 20px gutter are pattern-level layout, not tokens.

## Usage

Use Item Detail for any record whose attributes are numerous enough to need
grouping, and where reading dominates editing. Do not use it for:

- record **lists** — that is `design-system/patterns/item-listing.md`;
- a full-page **form** — a detail page links to editing, it does not embed it;
- analytics or dashboards, which have no single subject record.

Below roughly 3 sections the grid is not worth it; render a single column.

## Accessibility

- One `h1`-equivalent page title; each section title is an `h2`.
- Each section card is a labelled `<section>` with an `id` the anchor rail
  targets.
- The anchor rail is a labelled `<nav>` of in-page links, **not** a
  `role="tablist"` — it scrolls to content that is already present rather than
  swapping panels. Marking it as tabs would promise behaviour it does not have.
- The active pill carries `aria-current="location"` (not `page` — the sections
  are all on this page).
- Section trailing actions need accessible names that include the section, e.g.
  "Sửa Thông tin chung"; several identical icons appear on one screen.
- Data-list rows must associate label and value programmatically — a description
  list is the natural fit, not two loose spans.
- The `--` placeholder is `aria-hidden`, followed by a `.sr-only-label` span
  `Chưa có dữ liệu` (data-viewer.md § Accessibility), so a screen reader announces "no data" rather than "dash
  dash" or silence.

## Known Gaps

### Open

- ~~Four regions have no component contract.~~ Authored 2026-08-04 as
  `design-system/components/inform.md`, `design-system/components/anchor-nav.md`,
  `design-system/components/section-header.md` and `design-system/components/data-viewer.md`, alongside
  `design-system/components/empty-state.md` and `design-system/components/featured-icon.md`. Each carries
  its own Known Gaps. The originals were:
  - **`inform` — the completeness banner.** 48px featured icon, 20/30 Medium
    headline, 14/20 supporting line, trailing action, 16px radius. Reusable well
    beyond this pattern; needs `design-system/components/inform.md`.
  - **`Horizontal tabs` — the anchor rail.** Pill-style in-page navigation with
    an optional count badge per pill. Overlapped visually with `.segmented` and
    with `design-system/components/tab-bar.md` but is a third thing (in-page
    anchors). Two of the three are now settled: it was built as
    `design-system/components/anchor-nav.md`, and `.segmented` was retired
    unshipped on 2026-08-12 (`styles/legacy/segmented.css`). What is left to
    reconcile is the anchor rail against the tab bar.
  - **`Section header`** — featured icon + action group + title + supporting
    text + divider. Used nine times in this one frame.
  - **`Data viewer`** — the label/value row, including the `--` (+ sr-only `Chưa có dữ liệu`)
    empty-value convention and the fixed 90px label column.
- ~~`Empty state` has no contract either~~ — now `design-system/components/empty-state.md`, though `.empty-state` rules survive
  in `styles/legacy/detail-and-forms.css` from the removed
  `index.html`. Whatever is authored should reconcile with those rather than
  duplicate them.
- ~~`Featured icon` has no contract~~ — now `design-system/components/featured-icon.md`. It is used by four components (this pattern's banner and
  section headers, `design-system/components/metric-item.md`, `design-system/components/folder.md`) at 40px
  and 48px with tone-based tints, and has no contract of its own.
- **The side navigation gains a search input** in this frame that no listing
  screen has. That is a `design-system/components/side-navigation.md` change, not a pattern
  concern — but it is unrecorded there today.
- **Anchor-rail pinning is unspecified in the source.** The recommendation above
  is a pattern-level decision, not evidence. Confirm before implementing.
- ~~**Topmost-wins spying cannot resolve a row of two cards.**~~ **Settled 2026-09-30:**
  the pressed-pill hold (`intentLock` until `scrollend`) is now in
  `design-system/components/anchor-nav.md` › Target sync and ships in
  `screens/du-an/chi-tiet.js`. `screens/doi-tac/chi-tiet.html`, where it was found
  2026-09-16, no longer has a rail (Short record).
- ~~The entity-list row has no badge slot.~~ **Settled 2026-09-16 by reading the
  row's own frame** (`10282:8548`), which promoted the body to
  `design-system/components/entity-row.md`: the row is a mark, a name and (since
  2026-09-30) one supporting line, and the frame draws no badge. The relationship is
  the first token of the supporting line, exactly as the frame writes that
  relationship, and the screen-local `.entity-row__headline` is gone. **What did
  not get settled is `Trạng thái`**, which MDM-1166 gives both contacts and bank
  accounts: the badges that carried it were removed with the rest, so an inactive
  entity now reads like an active one. That is a live gap on the component's
  contract, with the `md` collision measurement whoever closes it will need.
- ~~Two card paddings exist in the package.~~ Closed the day it opened
  (2026-09-16): the 20px rung was applied to `.section-card` for every consumer
  rather than scoped to this grid. Every record screen of the time re-measured.
- ~~No demo implementation exists yet.~~ Built 2026-08-04 as
  `screens/item-detail.html`, which validated the 6-column grid and
  produced the six component contracts listed above. That screen has since been
  deleted; `screens/du-an/chi-tiet.html` is the record screen that composes
  on the grid today.

## Code Mapping

| Surface | File |
|---|---|
| Pattern contract | `design-system/patterns/item-detail.md` |
| Demo implementations | `screens/doi-tac/chi-tiet.html` (the partner record, added 2026-09-16) — **one of two screens composed on this pattern's 6-column grid**, in rows of 6 / 2+2+2 / 2+4, and **the package's only screen whose section cards open a drawer** (`Địa chỉ`, `Tài khoản ngân hàng`, `Người liên hệ` → `#addressDrawer` / `#bankDrawer` / `#contactDrawer`, MDM-1209). `screens/du-an/chi-tiet.html` (the project record) is composed on the same grid (rows of 4+2 / 4+2 / 6), and `screens/doi-tac/ho-so-nang-luc.html` uses it with `--full` cards only. Each carries their own `.css` / `.js`. Three earlier ones are gone: `screens/item-detail.html` (company master record), `screens/project-investor.html` (a project's investor, deleted 2026-08-19 with the record's `Chủ đầu tư` tab), and `screens/doi-tac/{dia-chi,tai-khoan-ngan-hang,nguoi-lien-he}.html` (the three stand-alone list pages, folded into `chi-tiet.html`'s drawers, MDM-1209) |
| Section card + bodies + the card grid | `styles/section-card.css`; the grid's tier collapses in `styles/responsive.css` |
| Sample data | Inline in each screen's `.js` — one entry per section, carrying its grid span, action type and body |

