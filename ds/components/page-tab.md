# Page Tab

## Purpose

Page Tab is the workspace tab strip: a browser-style row of open records that
lets a user keep several pages open and switch between them. It sits above the
page header, spanning the main region.

It is **workspace chrome, not page content** — it belongs to the shell, and a
page pattern should not own or re-declare it.

It is its own design system component set, but `design-system/components/page-header.md`
composes an instance of it. That means the design system draws the strip and the
page header as one block, while this repo renders the strip from the shell. Both
can be true at once — the strip is authored once here and *placed* by whatever
owns the top of the main region — but which layer renders it in product code is
still an open decision. See Known Gaps in `design-system/components/page-header.md`.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 |
| Figma file key | `SFo9P9PCVQiuOk2SqjZYKQ` |
| Component set | `Page Tab Group`, node `9794:11908`, 1180 x 140 — variant axis `type` |
| Superseded node | `9681:108196`, 1140 x 28 (single component, no variant axis) |
| Tab states | `_PageTab` — `active`, `in active`, `active-transparent` |
| In-product instance | MDM V2 `DBO/DSPageTabGroup` (`10004:14096`) in the `pat-listing` frame |
| Reviewed via | Figma REST API (`/v1/files/…/nodes`), 2026-08-03 |
| Last synced | 2026-08-03 — see Revision History |

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/page-tab.md`](docs/revisions/page-tab.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-14
- 2026-08-04 (2)
- 2026-08-04
- 2026-08-03 (2)
- 2026-08-03
- 2026-07-29
- 2026-07-29

## Anatomy

- **Group** — full-width strip, `align-items: flex-start` so the active tab's
  rounded top meets the page surface below. The strip's fill is variant-
  dependent: `bg/tertiary` in `Default`, none in `Transparent`. `Transparent`
  carries a 1px bottom rule in place of the fill; `Default` has none.
- **Slot** — the scrollable/clipping row that holds the tabs.
- **Tab** — leading 20px icon, label, trailing 12px close control.

## Variants

### Group — `type`

| Variant | Treatment |
|---|---|
| `Default` | Strip fills with `bg/tertiary` (`neutral-100`, #F5F5F5). The active tab paints white on top of it, so the tab reads as raised out of the strip. **Used by the MDM screens.** |
| `Transparent` | Strip has no fill and inherits the page background, and carries a **1px `border/primary` bottom rule** — with no fill, that rule is what bounds the strip against the page. The active tab has no surface either — it uses the `active-transparent` tab state and is distinguished by label colour and weight alone. |

Figma spells the second variant `Trasnparent`. Treat that as a typo in the
source, not as the intended name.

### Tab — `state`

| State | Treatment |
|---|---|
| `active` | White surface (`bg/primary`), top corners rounded, label **`Brand/500` Medium**, **no** split rule. Only in `type=Default`. |
| `active-transparent` | No surface, no radius, label **`Brand/500` Medium**, and it **keeps** the trailing split rule — with no surface, the split is the only thing separating it from the next tab. Only in `type=Transparent`. |
| `in active` | Transparent (shows whatever the group's background is), label `text/secondary` **Regular**, trailing 22px split rule. |

All states use the same 16px horizontal padding and the same close-control
treatment — the close icon is `icon/fg-tertiary` at full opacity throughout.
Only the surface, label colour, label weight, radius and split rule vary.

The split rule is the one behaviour that inverts between the two group
variants. `Default` suppresses it on the active tab, because the raised white
surface already separates that tab from its neighbour. `Transparent` keeps it,
because there is no surface to do that.

## States

- Default (active / inactive as above).
- Hover on the tab and, separately, on its close control.
- Focus visible on both the tab and the close control — they are two distinct
  targets.
- Overflow — the slot clips; long labels ellipsize rather than widening the tab.

## Tokens

| Role | Token | Figma source |
|---|---|---|
| Strip height | `--utui-page-tab-height` | frame height, 40px |
| Tab width | `--utui-page-tab-width` | 200px, fixed — see Layout Contract |
| Active top radius | `--utui-page-tab-radius` | instance `rounded-tl-[8px]` |
| Icon/label gap | `--utui-page-tab-gap` | `gap-[8px]` |
| Horizontal padding (start) | `--utui-page-tab-padding-x` | `pl-[16px]` |
| Horizontal padding (end) | `--utui-page-tab-padding-x-end` | `0` — no trailing padding; the split rule and close control sit flush with the tab's right edge |
| Vertical padding | `--utui-page-tab-padding-y` | `py-[4px]` |
| Label↔close gap | `.page-tab__close` `margin-left: var(--utui-spacing-02)` | 16px total (8px `--utui-page-tab-gap` + 8px this margin) — Figma re-read 2026-09-29 |
| Split rule height | `--utui-page-tab-split-height` | `h-[22px]` |
| Close control size | `--utui-page-tab-close-size` | 12px in Figma; 16px here, see Known Gaps |
| Close icon size | `--utui-page-tab-close-icon-size` | 12px, exact |
| Group background | `--utui-page-tab-group-bg` | `bg/tertiary` → `neutral-100`, exact |
| Group bottom rule (`Transparent` only) | `--utui-page-tab-group-border` | `border/primary` → `neutral-200` |
| Active tab background | `--utui-page-tab-active-bg` | `bg/primary` → `bg-surface`, exact |
| Inactive label colour | `--utui-page-tab-text` | `text/secondary` #404040 → `neutral-700` |
| Active label colour | `--utui-page-tab-text-active` | `Brand/500` → `brand-500`, exact |
| Leading icon colour | `--utui-page-tab-icon` | `Brand/500` → `brand-500`, exact |
| Close icon colour | `--utui-page-tab-close-icon` | `icon/fg-tertiary` → `icon-default`, exact |
| Split rule colour | `--utui-page-tab-split` | `Colors/Neutral/Border/colorSplit`, pinned |

Every value above resolves through a token; the only literal left in the
component CSS is the 1px hairline width of the split rule.

Note `text/secondary` is #404040 (Neutral/700), one step darker than this
package's `--utui-color-text-secondary` (Neutral/600), so it references the
primitive rather than the semantic token.

## Layout Contract

- The strip is 40px tall and sits flush above the page surface, with no gap —
  the active tab's white background must visually join the page below it.
- Tabs are a **fixed 200px**. Both the current component set (`9794:11908`)
  and all three tabs in the current screen (`10254:53657`) are exactly 200px;
  the label ellipsizes rather than widening the tab. The earlier 160–280px
  bounded range was derived from the superseded `9681:108196` node and its
  instances, and no longer describes the source.
- Inactive tabs always draw the trailing split rule. The active tab draws one
  in `type=Transparent` but not in `type=Default`, so a rule appears after the
  active tab only in the transparent strip.
- The slot clips rather than wrapping; the strip never becomes two rows.
- From `md` down the slot becomes a horizontal scroller instead of clipping:
  three 200px tabs cannot fit a tablet or phone content column, and clipping
  makes the later tabs unreachable rather than merely off-screen. The scrollbar
  is hidden — the strip's own edge already signals more content. The strip still
  never wraps. See `.claude/skills/responsive/SKILL.md`.

## Behaviour

The strip is read as a browser tab bar, so it behaves as one. The source frames
draw no interaction, so this is a contract decision recorded here rather than a
Figma reading — and it is a decision about the workspace, not about a screen,
which is why one shared implementation owns it (`scripts/page-tab.js`).

| Action | Result |
|---|---|
| Click an inactive tab | Switches to that page. |
| Click the active tab | Nothing. It is where you already are. |
| Close (`×`, or middle-click) an inactive tab | The tab goes, the page stays. |
| Close the active tab | The tab goes and the workspace moves to its right-hand neighbour, or its left one if it was the last. |
| Close the only open tab | Refused, with a message. A browser closes its window here; a workspace has nothing to close, and an empty strip strands the user. |
| Arrive on a page whose tab was closed | The tab reopens, in strip order. The page you are on always has a tab. |

Two rules follow from those, and both are easy to get wrong:

- **Closing is not local to the screen.** A tab closed on one page is still
  closed on the next, so the open set is workspace state with a session
  lifetime, not per-page DOM.
- **A page must say which tab it is.** A tab holds a record, and a record has
  sub-pages — the record's own sections, its edit form, a view-all sub-page —
  none of which open a tab of their own. Each page therefore declares the tab
  it is the content of, and the strip marks that tab active. In the demo that
  declaration is `data-page-tab-owner` on the strip; a real shell would take it
  from routing. Where one page can serve two tabs, it lists both and the stored
  active tab decides.

A page that can lose work (a form mid-edit) must be able to stop the strip from
navigating — the strip is a way out of the page like any other, and it has to
ask the same question the back link asks. The demo does this with a registered
guard (`pageTabs.setLeaveGuard`); the contract point is that the strip cannot
navigate unconditionally.

**The guard's return, 2026-09-28.** `setLeaveGuard(fn)` accepts an `fn` that
returns either a boolean (a synchronous `window.confirm`) or a
`Promise<boolean>` (an on-brand `ds` modal; no consumer since the create
pages became drawers, 2026-10-02, which cannot answer before the user clicks a button in it) —
navigation proceeds unless the answer, either way, is `false`. Backward
compatible: an existing synchronous guard needs no change.

## Usage

Use one Page Tab Group per workspace, owned by the app shell. Each tab
represents an open record or list, not a section of the current page — for
in-page section navigation use the segmented button group instead (see
`design-system/patterns/item-listing.md`).

Do not put actions other than close inside a tab.

## Accessibility

- The group is a labelled `<nav>`; the active tab carries `aria-current="page"`.
- The close control is a separate `<button>` nested beside the tab's own
  control, each with its own accessible name (`Đóng <label>`).
- The leading icon is decorative (`aria-hidden`); the label carries the name.
- Label contrast: `#404040` on `#f5f5f5` (inactive) passes comfortably. The
  active label is `#A67038` on the page background — verify it against the page
  wash where the `Transparent` variant is used, since that is a tinted rather
  than a flat surface.
- The close control no longer relies on opacity to signal the inactive state, so
  its contrast is now the same in both states.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | `design-system/tokens/css/untitled-ui-component.css` |
| Behaviour (shared) | `scripts/page-tab.js` — the open-tab list, the click/close/navigate logic, and the `pageTabs` global (`activate`, `close`, `list`, `active`, `setLeaveGuard`) |
| Component CSS | `.page-tab-group`, `.page-tab-group--transparent`, `.page-tab-group__slot`, `.page-tab`, `.page-tab__icon`, `.page-tab__label`, `.page-tab__close` in `styles/page-tab.css` |
| Example (`Default`) | **None.** It was `screens/item-listing.html`, deleted with the generic item screens; every screen in the package now sets `Transparent` |
| Example (`Transparent`) | Every `screens/*.html` — the strip is identical on all eight |

## Class Contract For Static HTML

```html
<nav class="page-tab-group" aria-label="Trang đang mở">
  <div class="page-tab-group__slot">
    <button class="page-tab" type="button">
      <span class="page-tab__icon" aria-hidden="true">
        <span class="material-symbols-outlined">language</span>
      </span>
      <span class="page-tab__label">Danh sách dự án</span>
      <span class="page-tab__close" role="button" tabindex="0" aria-label="Đóng Danh sách dự án">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </span>
    </button>
    <button class="page-tab is-active" type="button" aria-current="page">…</button>
  </div>
</nav>
```

Note the close control cannot be a nested `<button>` inside a `<button>`; see
Known Gaps.

In the demo this markup is **generated** by `scripts/page-tab.js` from
the shared open-tab list; the copy written into each screen's HTML is the no-JS
fallback and has to stay in step with that list. Two consequences worth knowing
before editing a screen: a tab's label lives in one place, and the label always
carries the full name — the frames render some labels truncated, and the
truncation is `.page-tab__label`'s job, not the markup's.

## Known Gaps

- **The close control is a `role="button" tabindex="0"` `<span>` nested inside
  the tab `<button>`.** Recorded 2026-08-14 from a UX review of
  `project-create`; the markup is identical on all six screens that render the
  strip, so this is inherited, not new. Three consequences: nested interactive
  content is invalid HTML and its accessibility-tree result varies by UA; every
  consumer has to hand-write the `Enter`/`Space` handler a real `<button>` would
  give it, and each of them also has to `stopPropagation()` so closing a tab does
  not also activate it; and the outer tab's accessible name absorbs the inner
  control's. The fix is structural — the close control becomes a sibling of the
  tab, not a child, which changes this component's anatomy and every screen's
  markup at once — so it is recorded here rather than patched on one screen.
  Narrowed 2026-08-14: the second consequence is gone, because the markup and its
  handlers are now generated in one place. The invalid nesting and the absorbed
  accessible name are not — they are what the anatomy says, and they still need
  the structural fix.
- **The `Transparent` bottom rule was added from a report, not from the source.**
  The colour (`border/primary` → `neutral-200`) and width (1px) mirror the Tab
  Bar's own bottom rule rather than being read off `9794:11909`, because the
  Figma connector was unavailable when it was implemented. Confirm the token and
  width against the component set, and confirm that `type=Default` really has no
  such rule.
- **Resolved 2026-08-04: the active tab's split rule in `Transparent`.** The
  set (`9794:11908`) drew a trailing split on `active-transparent`; the instance
  in `pat-listing` (`10254:53657`) had no split node on that tab, and the
  implementation had followed the screen. Confirmed that the **set** is correct,
  so the split is now drawn. Note this reverses the precedent used in
  `design-system/components/data-table.md`, where the screen won a set-vs-screen conflict —
  neither source is automatically authoritative, so flag these individually
  rather than applying a blanket rule.
- **The two inactive tabs in the screen use different label colours** —
  `#404040` (Neutral/700) on one and `#344054` (Gray/700) on the other, for the
  same `in active` state. The component set uses `#344054` for both. The token
  stays on `neutral-700`; this is another instance of the Gray-vs-neutral ramp
  gap (QC-01).

- **Nested interactive controls.** The design puts a close control inside a
  clickable tab. HTML forbids nesting a `<button>` inside a `<button>`, so the
  demo renders the close as a focusable `role="button"` span. A production
  implementation should restructure this — sibling controls in a shared
  container is the usual fix — rather than copy the demo's workaround.
- The close target is 16px (Figma draws 12px), below the recommended minimum
  touch target. The original 28px strip left no room to grow it; at the current
  40px there is room for a larger hit area, so this is now worth revisiting
  rather than accepting.
- ~~The component uses unreconciled OneHub tokens.~~ Largely resolved by the
  2026-07-29 revision: it now uses `bg/*`, `text/*` and `icon/*` variables that
  map onto this package's tiers exactly, and the leading icon moved to
  `Brand/500`. Only `Colors/Neutral/Border/colorSplit` is still pinned. The
  broader OneHub reconciliation remains open for
  `design-system/components/side-navigation.md`, which is now the sole holder of the `#ae7129`
  accent literal.
- Tab overflow behaviour (many open tabs) is not specified in the source and is
  not implemented; the slot clips above `md` and scrolls below it. The browser
  model this component follows shrinks its tabs instead, and offers scroll arrows
  once they hit a floor — neither is drawn in the source, and the fixed 200px tab
  width is, so this stays open. The strip does scroll the active tab into view on
  load, which is what makes the ≤md scroller usable.
- **Nothing opens a tab.** The behaviour added 2026-08-14 covers switching and
  closing, which is what the strip's own controls can do. Opening — the other
  half of the browser model, where activating a record from a list adds a tab —
  has no source and no caller: the demo's workspace is a fixed list of three
  tabs, and a closed tab reopens only because the page it belongs to was
  navigated to directly. A real shell opens a tab per record and needs a rule
  for how many may be open at once.
- **`Grand Marina Saigon` shows LUMIÈRE's content.** The tab is in the strip
  because the frames draw it, and it now navigates like its neighbours — but
  Grand Marina has no screen, so it points at `du-an/chi-tiet.html`. The strip
  says Grand Marina while the header says LUMIÈRE. Accepted for the demo as
  better than a tab that raises a notification; it is not a design position.
- **The project list's tab was renamed to match its siblings.** The
  `pat-listing` frame labels the active tab `Quản lý dự án` while the page title
  is `Danh sách dự án`, and that mismatch was deliberately preserved. One shared
  tab list cannot hold both names for one tab, and the seven sibling screens all
  draw `Danh sách dự án`, so that name won. Confirm against the frame whether
  `Quản lý dự án` was meant as this tab's name or as the module's.
