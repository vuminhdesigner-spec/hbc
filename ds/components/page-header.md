# Page Header

## Purpose

Page Header is the identity band at the top of a page's main region. It carries
the record or page title, optional qualifying badges, an optional subtitle, the
page's primary actions, and the in-page section tabs. It is the block that stays
pinned while page content scrolls, so it is what keeps "what am I looking at"
and "what can I do here" reachable at any scroll position.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Page Header`, node `9794:12221`, 1440 x 440 |
| Variant `Type=Default` | node `9706:768`, 1400 x 158 |
| Variant `Type=Transparent` | node `9794:12222`, 1400 x 158 |
| Reviewed instance | MDM V2 `pat-listing` (`tS8dUB2qWLc28gZbtj8IIL`, node `10254:53657`) |
| Reviewed instances, partner | MDM (Un-Official) (`TpwqqNqhnFgycttdngXmFA`): the record's `view` / `create/edit` / `edit` frames, header instance `10267:47732`, and `contact` (`14128:55930`), header instance `14128:55977`. Read 2026-09-17; both agree with the screens that ship them |
| Reviewed via | Figma REST API, 2026-08-03; component set re-read via the Figma MCP server 2026-08-14, **2026-09-04** (the component shrank from 585px to 440px) and **2026-09-17** (the back button moved into the title row) — see the revisions at the end of this file |
| File version | Not recorded for the 2026-09-17 read. There is no `.env` in the working copy, so the REST route that returns `lastModified` was unavailable and the MCP server does not expose it |

## Anatomy

In top-to-bottom, source order. Every part except the title and the tab bar is
optional, driven by the component properties below.

**Mapping to the Figma component** (OMEU Design System V2 › `Page Header`,
node 9794:12221, variants `Type=Default` / `Type=Transparent`; checked
2026-09-29). The component root is the whole band, not just the title row:

| Figma layer | Class here | Registry |
|---|---|---|
| `Page Header` (root) | `.page-sticky` | page-header (sibling block; CSS in `ds/styles/app-shell.css`) |
| `Page Tab Group` | `.page-tab-group` | page-tab (instance) |
| `Breadcrumbs` (`breadcrumb`) | `.breadcrumbs` | breadcrumbs (instance) |
| `Page header` (pt 16, px 20, gap 4) | `.page-header-block` | page-header (sibling block) |
| `top` (title · badges · Button group) | `.page-header` | page-header (primary block) |
| `Tab Bar` (`tab`) | `.tabs` | tab-bar (instance) |

The class names predate this mapping and are kept (decision 2026-09-29); the
registry lists `.page-sticky` and `.page-header-block` under page-header so
Inspect reports them as this component. The `Type` variant has no root
modifier — `--transparent` lives on `.page-tab-group` and `.tabs`.

Items 2–5 render inside one wrapper, **`.page-header-block`** — the sticky
region's own body, holding the Top row and the Tab Bar. Page Tab Group (item 1)
is `.page-sticky`'s *other* child, placed above the block rather than inside
it; see Known Gaps for the ownership question this splits on. The block was
nine copies of the same rule pasted into as many screen bundles under the name
`.page-sticky__body` until a 2026-09-28 PO decision promoted it into this file
— see § Tokens and § Code Mapping.

1. **Page Tab Group** — the workspace's open records. Owned by
   `design-system/components/page-tab.md`. See Known Gaps: the design system nests this
   *inside* Page Header, which conflicts with `design-system/components/app-shell.md`.
2. **Breadcrumb** — ancestor trail, gap 12px: a `home-line` icon button, then one
   `chevron-right` (16px) before each label. Ancestors are `Text sm/Medium` in
   `Neutral/600`; the current page is `Text sm/Semibold` in `text/brand-primary`.
   Off by default. Its own band, above the header block, with its own 16px top and
   20px side padding.
3. **Back button** — a bare 20px `arrow_back` icon, and **since 2026-09-17 it is
   the first child of the Title row**, 12px before the page title, not a band of
   its own. Off by default. It carries no label in the source, and the component
   set draws no circular icon-button form. Until 2026-09-17 the source drew it as
   its own band above the header block, icon plus a `Link color` label; the
   package followed the move on 2026-09-17 and the band is gone.

   **It is an `<a>` and it carries an `aria-label` that names the destination.**
   The source draws no label, so the accessible name has nowhere else to live, and
   `Quay lại` on its own is ambiguous on a sub-page of a record — it could mean
   the record or the list the user came from. The five screens that draw it name
   the page they return to: `Quay lại Danh sách dự án`, `Quay lại Chi tiết dự án`,
   `Quay lại Hồ sơ dự án`, `Quay lại Thông tin Đối tác`, `Quay lại Chi tiết đối
   tác`. Never a `<button>`: a real navigation must be openable in a new tab.

   **Where it points, 2026-08-14 — no live consumer since 2026-08-19.** When the
   page is a section's view-all, the back link targets *the section it was opened
   from*, not the top of the parent screen: the rule was written for
   `./project-investor.html#dia-chi` on `investor-address.html`, and both screens
   were deleted on 2026-08-19 with the record's `Chủ đầu tư` tab. Returning to the
   top of a 1727px tab makes the user re-find the section on every traversal,
   which is the whole cost a sub-page is meant to save, so the rule stands for the
   next view-all page anyone builds. Its other half still applies today: section
   cards carry `scroll-margin-block-start` for the pinned chrome, so a fragment
   lands under it rather than behind it.
4. **Top row** (`top`, gap **80px**), split left/right:
   - **`.left`** (gap 16px in `Transparent`, 0 in `Default`): the optional 76px
     circular **Avatar**, then `left-content` (gap 8px) — the **Title** row
     (gap 12px, items centred) holding the optional back icon, the page title and
     the **Badge group** slot (itself a `1fr` row, gap 8px), and below it the
     **Sub-title** row (gap 8px; the frame is named `Sub-title3` in
     `Transparent` and `Sub-title` in `Default` — the same content either way).
   - **Button group** slot: the page's actions, right-aligned, items centred,
     gap 12px. Two buttons in the component's default — one secondary, one
     primary, primary last, **both drawn `Icon=Leading` with a 20px icon**. They
     are **size `sm`** (36px) —
     `.button--compact`, which is what `design-system/components/button.md`
     maps `sm` onto — not the 44px `lg` that a bare `.button` resolves to.
5. **Tab Bar** — in-page section navigation, 1px bottom border. Owned by
   `design-system/components/tab-bar.md`.

`.page-header-block` carries `--utui-spacing-04` top and `--utui-page-gutter-x`
left/right padding — **no bottom padding** — and a `--utui-spacing-01` gap
between its `top` row and the Tab Bar: **16px / 20px / 0** padding, **4px**
gap. Top and gap now follow the 2026-09-17 Figma re-read of the component set
(both were **32px / 16px** before the 2026-09-04 re-read); the 2026-09-29 PO
decision reverses the 2026-09-28 one, which had kept the values the nine
consuming screens already shipped (**20px / 20px / 0**, **8px** gap) rather
than reflow them to match. Horizontal padding stays on `--utui-page-gutter-x`
deliberately — that token also feeds `.page`, and splitting it would break the
shared left edge the two are meant to keep. The 80px top-row gap is a minimum
separation, not a fixed one: the heading column is `1fr` and the action group
hugs.

**Modifier `.page-header-block--padded`** — restores `--utui-page-gutter-y`
bottom padding the block otherwise omits. Used by the two wizard flows
(`du-an/tao-moi`, `doi-tac/tao-moi`; both pages became drawers 2026-10-02/09-29, no consumer now), whose header is not followed by a
`.page` region that would otherwise supply the same top padding to balance.

## Variants

Two variants, `Type=Default` and `Type=Transparent`. They are not only a fill
swap — three things change with them:

| | `Default` | `Transparent` |
|---|---|---|
| Header block fill | `--background/neutral/bg-neutral-01` (white) | none, inherits the page |
| Page Tab Group | `--bg/tertiary` `#f5f5f5` strip; the active tab is a **white** tile with 8px top corners | no strip fill and no active-tab fill; a **1px bottom border** (`--border/primary`) instead. The active tab is brand label only |
| Breadcrumb / back-button bands | white fill | none |
| `.left` gap | **0** | **16px** |
| Secondary action | `--brand/50` fill *and* `--brand/50` border, brand label | white fill, `--border/primary` border, `--text/secondary` label |

`Default` occludes what scrolls under it; `Transparent` inherits the page wash and
leans on the tab strip's border to separate itself. **The MDM screens all use
`Transparent`.**

The `.left` gap difference is almost certainly an authoring slip rather than
intent — `Default` puts a 76px avatar flush against the title. Only `Transparent`
is implemented, so nothing depends on the answer yet.

## Component Properties

The complete set, re-confirmed on 2026-09-17. Anything not in this table is not a
property of this component. The 2026-09-17 read changed no property name and no
default; what changed is where the back icon sits and what the two slots are
filled with.

| Property | Type | Default | Notes |
|---|---|---|---|
| `Type` | variant | `Default` | See Variants above. |
| `Avatar` | boolean | false | The 76px circular record image. |
| `Badge` | boolean | true | Shows the Badge group slot. |
| `Badge group` | slot | 2 badges | Filled with `design-system/components/badge.md` instances. Named `Badge group` in `Transparent` (`10118:11101`) and **`Badge group2`** in `Default` (`11601:16754`) — one slot, two names. |
| `Sub-title` | boolean | true | The subtitle row: text plus an inline `Link color` button. |
| `CTA` | boolean | true | Shows the Button group slot. |
| `Button group` | slot | 2 buttons | Filled with `design-system/components/button.md` instances. |
| `Tab` | boolean | true | Shows the Tab Bar. |
| `Back to previous page` | boolean | false | Shows the 20px `arrow_back` inside the Title row (`11276:51630` in `Transparent`, `11276:51623` in `Default`). |
| `Breadcrumb` | boolean | false | |

**`Timestamp` and `Sub-title2` are gone.** Both were in this contract from the
2026-08-03 sync and neither exists in the published component any more:
`Sub-title` is now a single row that already carries the inline button
`Sub-title2` was documented for, and there is no "Last update" line at all. No
screen in the package rendered either, so nothing had to change in code.

## Content Slots

| Slot | Notes |
|---|---|
| Title | Entity identifier, e.g. `LUMIÈRE Boulevard`. One `h1` per page. `Text xl/Semibold`, **20/30** — `Display sm` 30/38 until the 2026-09-04 re-read. |
| Badge group | 0–3 badges, gap 8px, 16px radius, `Text sm/Medium` 14/20, 24px tall. The default fill changed on 2026-09-17 and now draws **two different badges rather than a row of codes**: a **Dot badge** carrying a status (`Green/50` fill, `text/success-primary` label, 8px dot, padding 2/10/2/8, gap 6) and a **gray badge with a trailing 16px `expand_more`** carrying a version (`Neutral/100` fill, `Neutral/700` label, padding 2/6/2/10, gap 4). The gray `info` icon-left code badge this contract described is no longer what the component draws by default, though the slot still accepts it — what the slot *means* is per instance, per the 2026-09-09 finding. |
| Sub-title | One line, `Text sm/Regular` in `--text/neutral/secondary` (Neutral/500), plus an optional trailing `Link color` button — `size=md`, `Icon=False`. |
| Button group | 1–2 actions, **size `sm`** (36px, `.button--compact`), each drawn `Icon=Leading` with a 20px icon in the source default. At most one primary, and it comes last. |
| Tabs | 2–5 in-page sections. |

## States

- Default.
- Pinned — when the page pins the header, it must carry an opaque background
  even in the `Transparent` variant, or scrolling content shows through.
- **Collapsed — a pinned header sheds its orienting parts once the page has
  scrolled away from the top.** See the rule below.
- Actions disabled, per `design-system/components/button.md`.

### Collapse on scroll

**Rule.** Where a page pins its header over a scrolling document, the header
collapses once the page leaves the top and restores when it returns to it.

- **What collapses:** the 76px avatar and the whole sub-title row (description
  and its `Xem thêm` link), including while the description is expanded.
- **What must not collapse:** the title, the badge group, the button group, the
  back link and the Tab Bar. Those are what the pin is *for* — a header that
  stops answering "what am I looking at" and "what can I do here" has spent its
  pinned height on nothing.
- **Thresholds:** collapse past 64px of scroll, restore at 8px or less. Two
  values, not one, so a scroll position resting on the threshold cannot flip the
  state every frame.
- **Motion:** 200ms ease, and none at all under `prefers-reduced-motion`. The
  sub-title's row is interpolated `1fr` → `0fr` rather than clipped to a
  max-height, because its real height is content-dependent; the avatar animates
  its box to zero. Transitions stay off until the first scroll offset has been
  read, so a page opened at a fragment does not play the collapse as an entrance
  animation.
- **Where it applies:** only where the document actually scrolls. In the
  fixed-viewport layout mode (`.mdm-shell--fixed`,
  `design-system/components/app-shell.md`) the page is exactly one viewport and
  the header can never collapse, so those screens do not opt in.
- **Not in Figma.** The component set draws one header height and no scrolled
  state; this is a package rule, taken 2026-09-09 for the same reason as the
  expanded sub-title before it — the composition pins, so the scrolled state
  exists whether or not the source draws it. Needs design confirmation,
  particularly which parts a collapsed header keeps.

Implemented as `.page-sticky.is-collapsed` in `styles/page-header.css`, toggled
by `scripts/page-header-collapse.js`, which a screen opts into with
`data-page-header-collapse` on its `.page-sticky` block. Screens carrying it:
`du-an/tao-moi` carried it until it became a drawer (2026-10-02; `du-an/chinh-sua` removed 2026-09-28).
`du-an/chi-tiet` carried
it until 2026-09-09 and dropped it in the same read that turned its `Avatar` and
`Sub-title` off — a collapse whose whole job is to give back the height of the
avatar and the sub-title has nothing to remove from a header that draws neither.
**That is the rule: opt in only while the composition has parts worth collapsing.** A screen that publishes a measured chrome height already observes
`.page-sticky` with a `ResizeObserver`, so the shorter box republishes itself and
the anchor rail follows it down.

## Tokens

| Role | Token | Value |
|---|---|---|
| `.page-header-block` padding (top / sides, no bottom) | `--utui-spacing-04` / `--utui-page-gutter-x` | **16px / 20px** — top follows the Figma component read; sides stay on the page gutter token, PO decision 2026-09-29 (see Anatomy) |
| `.page-header-block` gap (`top` row ↔ Tab Bar) | `--utui-spacing-01` | **4px**, matches the Figma component read, same decision |
| `.page-header-block--padded` bottom padding | `--utui-page-gutter-y` | **20px**, wizard screens only |
| Top-row gap (heading ↔ actions) | `--utui-page-header-gap` | **80px**, stepped to 40px at `md` and 16px at `sm` by `responsive.css` |
| Identity gap (avatar ↔ text) | `--utui-page-header-identity-gap` | 16px |
| Avatar | `--utui-page-header-avatar-size` | 76px, `--app-radius-pill` |
| Heading block gap (title ↔ sub-title) | `--utui-spacing-02` | 8px |
| Title row gap (back icon ↔ title ↔ badge slot) | `--utui-spacing-03` | 12px |
| Badge group internal gap | `--utui-spacing-02` | 8px |
| Action gap | `--utui-spacing-03` | 12px |
| Title | `--utui-page-header-title-size` / `-line` / `-weight`, `--app-text` | **20 / 30**, semibold |
| Sub-title | `Text sm`, `--utui-color-text-tertiary` | Neutral/500 |
| Surface (`Default`) | `--utui-color-bg-surface` | white |

This component introduces no new tokens. `--utui-page-header-gap` gained the
design system's value on 2026-08-14 (it read 40px, and the rule that lays the
header out ignored it and used 24px); `--utui-page-header-title-*` and the page
gutters took the component's values on 2026-09-04.

## Usage

Use Page Header on any page whose main region represents one record or one
named area. Do not use it for modal or drawer titles. Keep to one primary
action; a second action must be secondary.

## Accessibility

- The title is the page's `h1`.
- The badge group is decorative-adjacent but carries real identifiers, so it
  must be readable text, not an image, and should sit in a labelled list.
- Section tabs that navigate between screens are a `<nav>` with
  `aria-current="page"` — not `role="tablist"`. See `design-system/components/tab-bar.md`.
- The back icon has no visible label, so its `aria-label` is its only accessible
  name and it must name the destination, not the act. Its hit area is the icon;
  it takes the global `a:focus-visible` ring from `styles/base.css`.
- Focus order runs back icon → title → badges → actions → tabs, matching source
  order.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.page-header`, `.page-header--docs`, `.page-header__identity`, `.page-header__avatar`, `.page-header__heading`, `.page-header__title`, `.page-header__subtitle`, `.page-header__subtitle.is-expanded`, `.page-header__description`, `.page-header__back-icon` in `styles/page-header.css`; the grid itself in `styles/app-shell.css`|
| `--docs` | A flex row (title left, `.header-actions` right) instead of the base header's `1fr auto` grid — the listing/detail pair whose header carries no avatar, sub-title or tab row, only a title and a button group. `align-items: flex-start` since 2026-09-29 (Figma top row starts, not centres); `> .header-actions { flex-shrink: 0 }` alongside it, so a wrapping title never squeezes the button group — moved into this rule from byte-identical copies in `screens/du-an/chi-tiet.css` and `screens/du-an/ho-so/danh-sach.css` the same day. `flex-direction: column` at `sm` lives in `styles/responsive.css`. Promoted 2026-09-28 from a byte-identical copy in `screens/du-an/chi-tiet.css` and `screens/du-an/ho-so/danh-sach.css`; both screens now import the shared rule and carry none of their own. Consumers: `screens/du-an/chi-tiet.html`, `screens/du-an/ho-so/danh-sach.html` |
| `.page-header-block` | `.page-header-block`, `.page-header-block--padded` in `styles/page-header.css`. Wraps `.page-header` + the Tab Bar inside `.page-sticky`. Promoted 2026-09-28 from `.page-sticky__body`, identical rules pasted into `doi-tac/{chi-tiet,dia-chi,ho-so-nang-luc,nguoi-lien-he,tai-khoan-ngan-hang}.css` and `du-an/{chi-tiet,phan-cap}.css` — `dia-chi.css`, `nguoi-lien-he.css` and `tai-khoan-ngan-hang.css` are gone since MDM-1209 (2026-09-29) folded the three pages into `chi-tiet.html`'s drawers, leaving `doi-tac/{chi-tiet,ho-so-nang-luc}.css` of that group; `--padded` replaces the bottom-padding variant that lived in `doi-tac/tao-moi.css` and `du-an/tao-moi.css`. Registry note: `ds/components/page-header.json` lists both classes under `api.parts`, not a second `block` — the schema has one `block` field per component, so this is the narrower of the two options the refactor brief offered. |
| Collapse on scroll | `.page-sticky.is-collapsed` rules in `styles/page-header.css`; `scripts/page-header-collapse.js`; opted into with `data-page-header-collapse` on `.page-sticky` |
| Examples | `screens/du-an/ho-so/danh-sach.html`, `screens/du-an/chi-tiet.html`, `screens/du-an/ho-so/tai-len.html` (Back button = true; also `doi-tac/chi-tiet`) |
| `.header-actions` outside a page header | `.doc-detail__header` (`ds/components/doc-detail.md`, promoted 2026-09-29 from screen-local glue in `screens/du-an/ho-so/chi-tiet.css`) — a shell-less popup header that composes the action row without being a `.page-header`. It reuses the class (same 12px-gap end-aligned row) but **owns its own stack rung**: it stacks at `lg` (≤1279), measured against DC's three actions, while the `.page-header` variants stack at `sm` in `styles/responsive.css`. Both the `flex-wrap` and the `justify-content: flex-start` that travel with it are now declared in `styles/doc-detail.css`, not a screen bundle — `screens/du-an/ho-so/chi-tiet.css` still carries its own byte-identical copy until lượt B rewires that screen onto the promoted component, at which point the screen's copy is the one to delete. Must not be lifted into the shared `sm` rung either way — when a header stacks is the composition's decision, not this component's. |

```html
<header class="page-header">
  <div>
    <div class="page-header__heading">
      <h1 class="page-header__title">LUMIÈRE Boulevard</h1>
      <ul class="badge-group" aria-label="Mã dự án">
        <li><span class="badge badge--md badge--gray badge--icon-left badge--no-dot">…</span></li>
      </ul>
    </div>
  </div>
  <div class="header-actions">
    <button class="button button--compact" type="button">Thêm danh mục</button>
    <button class="button button--compact button--primary" type="button">Tải lên hồ sơ</button>
  </div>
</header>
```

## Known Gaps

- **The back link is icon-only now, and the label it lost lives in an
  `aria-label`.** The 2026-09-17 re-read moved the control into the title row and
  dropped its text; the package followed on the same day, so `.page-header__back`
  and the `:has()` row gap beside it are gone from `styles/page-header.css` and
  the five screens that draw it use `.page-header__back-icon`. What the band
  bought is preserved rather than dropped: the accessible name still names the
  destination, and it is still an `<a href>`. What it cost is real and recorded
  here — an icon with no visible label is a weaker affordance for a sighted user
  who has not met the pattern, and the hover step to `--utui-color-icon-strong`
  is the package's own answer to that, not the source's. Revisit if operators
  report missing the control.
- **The badge slot's default is now a status and a version, not a row of codes,
  and the source still disagrees with itself about what the slot means.** The
  2026-09-09 reconciliation already recorded that two tabs of the project record
  draw its lifecycle state there and a third draws its project code; the
  2026-09-17 component default adds a third reading — a Dot status badge plus a
  version selector. The shipped screens follow their own instances, not this
  default. What the gray badge's trailing `expand_more` implies — that the badge
  is a *control* that opens a version list — has no contract and no consumer;
  `design-system/components/badge.md` authors no menu behaviour. Treat it as an
  open question for the design system owner rather than as a build instruction.
- **The source's default buttons carry a leading icon; the package's do not.**
  Both slot buttons are drawn `Icon=Leading` with a placeholder `info` glyph. The
  shipped headers use text-only actions (`Thêm danh mục`, `Tải lên hồ sơ`,
  `Đồng bộ hồ sơ`), which `design-system/components/button.md` supports either
  way. Read as placeholder filling rather than a requirement — an icon belongs on
  a header action only where it names something, per that contract.
- **One slot, two names.** `Type=Transparent` calls the badge slot `Badge group`
  and `Type=Default` calls it `Badge group2`. Nothing in the package reads slot
  names, so this costs nothing today; it is recorded so a later reader does not
  take the two names for two slots.
- **Page Tab Group ownership is narrowed but not closed.** This component set
  nests `Page Tab Group` inside Page Header, while `design-system/components/app-shell.md`
  declares the tab strip shell chrome that page patterns start *below*. The
  2026-08-03 sync resolved half of it: `Page Tab Group` is its own design system
  component set (`9794:11908`) that Page Header merely *composes*, so the strip
  is authored once and placed by whoever owns the top of the main region — the
  two contracts are not describing different components. What remains open is
  which layer renders it in product code. The shell reading is implemented,
  because the strip survives navigation between pages while a page header does
  not. Confirm with the design system owner.
- No hover, focus, or disabled treatment is authored on the header itself; all
  interactive state comes from the composed button and tab components.
- **The sub-title row wraps at `sm`.** The source composition is a single nowrap
  row — description clamped, trailing link beside it — and that holds only while
  the description can shrink. Where the description is a bare text node rather
  than a `.page-header__description` span with `min-width: 0`, its intrinsic
  minimum plus a `flex-shrink: 0` link exceeded a 279px content column and pushed
  the page into horizontal overflow (measured on `item-detail` at 375px,
  2026-08-12: `scrollWidth` 404 against a 375px viewport). `responsive.css` now
  sets `flex-wrap: wrap` at `sm`. Two follow-ups: the wrapped link keeps the 12px
  left margin `item-detail.css` gives it, which reads as an indent on its own
  line; and every sub-title should really use the `__description` span so the
  clamp works the same way everywhere.

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/page-header.md`](docs/revisions/page-header.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-12 (`pat-listing` re-read)
- 2026-08-12 (`Chi tiết dự án`, expanded sub-title)
- 2026-08-13 (`Tải lên hồ sơ`, Back button = true)
- 2026-08-14 (design system component set re-read)
- 2026-09-04 (design system component set re-read)
- 2026-09-09 (the project record's three tabs lose their identity band)
- 2026-09-17 (design system component set re-read — the back button moves into the title row)
