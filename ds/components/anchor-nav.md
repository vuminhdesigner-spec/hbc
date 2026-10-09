# Anchor navigation

## Purpose

Anchor navigation is a pill rail that lists the sections already present on a
long page and scrolls to them. It is a table of contents.

It is **not** a tab bar: nothing is hidden, and activating a pill changes scroll
position, not content.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Instance | `Horizontal tabs` in `Thông tin chi tiết`, node `10287:10813`, 1088 x 44 |
| Second instance | `Horizontal tabs` in `Chi tiết dự án`, node `10559:34349`, **524 x 44** — the rail hugs its four pills instead of spanning the content column |
| Third instance | `Horizontal tabs` in `Chủ đầu tư`, node `10840:73734`, **891 x 44** — hugs six visible pills; four further pills (`Người liên hệ`, `Thông tin khác`, two `My details`) are authored and hidden |
| Current `Chi tiết dự án` instance | `Horizontal tabs`, node `13314:69903` in component `13314:69886`, **627 x 44** — five pills since the `Chủ đầu tư` pill was added 2026-09-09; supersedes `10559:34349` above |
| Reviewed via | Figma REST API, 2026-08-04; re-read 2026-08-12; Figma MCP `get_metadata` 2026-09-23 (no file version returned) |

## Not To Be Confused With

| If the control… | Use |
|---|---|
| Scrolls to content already on the page | **Anchor navigation** (this) |
| Swaps panels in place | `design-system/components/tab-bar.md` |
| Navigates to another screen | `.segmented`, see `design-system/patterns/item-listing.md` |
| Is a mutually exclusive control | `design-system/components/button-group.md` |

## Anatomy

- **Rail** — 44px tall, 10px radius, 4px padding, 4px gap, 1px border on
  surface. Scrolls horizontally when the pills overflow; it never wraps.
  **Width is the pills' width**, not the content column's: `Chi tiết dự án` draws
  it at 524px of 1088. `item-detail` stretches it, which is the odd one out.
- **Pill** — 36px tall, 6px radius, 12px horizontal padding, 8px internal gap.
  Label is `Text sm` **Semibold** in both states.
- **Count badge** — an optional trailing `design-system/components/badge.md` per pill. Hidden
  in the reviewed instance.

## States

| State | Treatment |
|---|---|
| Default | Transparent pill, label `#667085` |
| Hover | `--utui-color-neutral-50` |
| Active | `--utui-color-brand-50` surface, `--utui-color-brand-500` label |

Hover is authored after the active rule in `anchor-nav.css` on purpose: the two
selectors tie on specificity, so the later `.is-active` wins and hovering the
active pill does not grey out its brand surface.

The active pairing does not reach 4.5:1 — see Known Gaps.

The active pill follows the **topmost section currently in view**, not the last
one clicked — the rail reflects position, so it must update on scroll.

## Usage

Use the rail only when BOTH hold: (a) the page height without the rail is at
least 2 x the viewport height, measured at 1440x900 with full fixture data; (b)
the page has at least 4 section cards. The designer decides per screen; the rail
is never hidden dynamically by JS. **This threshold is an internal decision with
no design-system source** (measured 2026-09-30): `doi-tac/chi-tiet` is 1.41
viewports (empty state 1.51) with 6 sections, so no rail; `du-an/chi-tiet` is 2.37
(empty investor 2.23) with 5 sections, so it keeps the rail. The sections must also
be a fixed known set. The rail must list **every** section,
in the same order, 1:1 — see `design-system/patterns/item-detail.md`.

**A pill's label should be its section's title.** The 1:1 rule is about count and
order, and it is met by generating the rail from the section list — but a pill is
a link, and a link whose text does not name where it goes is a navigation defect
for anyone scanning link text rather than the page. `Chủ đầu tư` breaks this: see
Known Gaps.

Do not use it to filter, and do not hide sections it points at.

## Pinned

The static geometry above describes the rail at rest. The shipping instance
(`du-an/chi-tiet`) also **pins** it, and that is a composition with obligations of its own — most of
them outside the rail's own CSS. Whether a hugging rail may pin at all is still
open (see Known Gaps); this section documents the construction that ships, so it
has an owner.

| Part | Rule |
|---|---|
| Offset | `top: calc(<published chrome height> + var(--utui-page-gutter-y))`. The chrome height is measured by the screen's JS and published as `--overview-chrome-height`; `--utui-sticky-chrome-offset` is the no-JS fallback. |
| Gutter | The offset **carries the page gutter**. At rest the rail sits `--utui-page-gutter-y` below the chrome, because it is the first block of a body with that padding-top; pinning to the bare chrome height snapped that gap to 0 the moment it stuck. The token steps per tier, so the offset needs no breakpoint rule. |
| Layer | `z-index: 30`, under the pinned page chrome (`.page-sticky`, `z-index: 40`) and under the drawer and notification layers. The rail must never cover the chrome it pins beneath. |
| Target obligation | Every section the rail points at needs `scroll-margin-block-start` of **chrome + rail + two gutters** — see below. |
| Target sync | Whenever the screen sets a pill `.is-active` (click and spy), it must also set `.is-anchor-target` on that pill's `section-card` and clear it from the others. Every pill `href` must point at a `.section-card`. Spy is suppressed while a click's smooth scroll runs (`intentLock`: held until `scrollend`, capped at 3000ms; 900ms where `scrollend` is unsupported). |
| Scroll spy | The observer's band starts below the pinned stack, not at viewport 0. |

**The `scroll-margin` obligation is the important half, and it is invisible from
the rail.** A pill is a plain `#id` link, so the browser puts the target's top at
viewport 0 — behind everything pinned there. Without it the card's featured icon,
its `h2` and its supporting line all land underneath the chrome, i.e. the
component silently fails at its one job. The margin belongs on the **target**:

```css
.section-card {
  scroll-margin-block-start: calc(
    var(--overview-chrome-height, var(--utui-sticky-chrome-offset)) + var(--overview-rail-height, 44px) +
      var(--utui-page-gutter-y) * 2
  );
}
```

Two gutters: one is the rail's own offset from the chrome, the second is the air
between the rail's border and the card that lands under it. Measured 2026-08-14
on both screens: clearance below the rail is 24px at `md`/`lg`/`xl`/`2xl` and
16px at `sm`, which is `--utui-page-gutter-y` at each tier, as intended.

The rail's height is measured and published beside the chrome height rather than
written as a constant — a horizontal scrollbar makes the box 44px on macOS and
61px where scrollbars take space, and both are correct. The `44px` above is the
contractual fallback for the no-JS path only.

**The spy must not use `scrollIntoView` to reveal the active pill.** Keeping an
off-edge pill visible is a horizontal move inside the rail, but `scrollIntoView`
has no "leave the vertical axis alone" option: `block` defaults to `"start"`, and
it scrolls *every* scrollable ancestor including the document — so each spy
update fights the scroll that triggered it. `block: "nearest"` is no safer once
the rail is pinned flush under the chrome. Both screens now set the rail's
`scrollLeft` directly (`revealPill`), measured from bounding boxes rather than
`offsetLeft`, since the rail is positioned and bordered.

Screens that pin also declare `scroll-behavior: smooth` on the scroll root under
`@media (prefers-reduced-motion: no-preference)`: with the landing position
fixed, a pill click is a visible move rather than a teleport.

## Accessibility

- A labelled `<nav>` containing in-page links (`<a href="#id">`), not buttons —
  the destination exists and should be linkable and openable in place.
- The active pill carries `aria-current="location"`, not `"page"` — every
  target is on this page.
- Do not use `role="tablist"`; it promises panel-swapping this does not do.
- Each target section needs a matching `id` and its own heading.
- **Focus is drawn inward on the pill**, not with the app's 4px outset ring:
  `outline: 2px solid var(--utui-color-brand-500)` at `outline-offset: -2px`. The
  rail is its own scroll container, so a descendant's ring is clipped at the
  rail's padding box, and that padding is 4px — exactly the outset ring's width,
  with nothing left over once the pills overflow and the rail scrolls. Neither
  the 44px height nor the 4px padding may grow to make room. Same treatment as
  the other scroller-clipped controls (`media-gallery.css`, `page-tab.css`).

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `.anchor-nav`, `.anchor-nav__item` in `styles/anchor-nav.css` |
| Examples | `screens/du-an/chi-tiet.html` (the only screen with a rail; `doi-tac/chi-tiet` dropped it under the Usage rule) — hugging (`justify-self: start`) and pinned, tracked by its own screen `.js`. It is the **only** demo since 2026-08-19: `screens/project-investor.html`, the second hugging instance, was deleted with the record's `Chủ đầu tư` tab. `item-detail.html` is gone from `screens/` too, so the full-width instance of the Figma source (`10287:10813`, 1088 x 44) also has **no demo**. |
| Pinned composition | `.anchor-nav` sticky rules and the section cards' `scroll-margin-block-start` in `screens/du-an/chi-tiet.css`; the published chrome and rail heights in `screens/du-an/chi-tiet.js` (`trackChromeHeight`) |

## Known Gaps

- **The target-section ring (`.is-anchor-target`) is not drawn in Figma; design not yet confirmed.**

- **A pill in `Chủ đầu tư` does not name its section — the gap now has no
  consumer.** The first pill reads `Thông tin chung`; the section it scrolls to
  is titled `Thông tin chủ đầu tư`. Verified in the frame twice. Almost certainly
  left over from `Thông tin chi tiết` (`10287:10813`), whose first section really
  is `Thông tin chung`. `screens/project-investor.js` rendered the source text
  verbatim, through an explicit per-section `anchor` override, rather than
  silently reconciling it. That screen was **deleted on 2026-08-19** with the tab,
  so nothing renders the mismatched pill any more and no successor inherits it —
  the `Chủ đầu tư` card that absorbed the tab's content sits on
  `project-overview` and is deliberately *out* of that screen's rail (next gap).
  Kept, because the source frame still draws the contradiction: one of the two
  strings is wrong, only a designer or PO can say which, and the answer is needed
  again the moment `Chủ đầu tư` is drawn with a rail.

- **The `project-overview` rail names four of its five cards.** Since 2026-08-19
  that screen carries a fifth section card (`Chủ đầu tư`, `Section` 12017:29704)
  which the source leaves out of the rail; the screen follows the source through
  a per-section `anchor: false` rather than inventing a fifth pill. The rail's
  contract — one pill per section, in source order — still holds for what it
  lists, but the only rendered instance no longer covers every section of its
  page. Whether a section card may be unreachable from the rail is a designer
  call; adding the pill is one flag in `screens/du-an/chi-tiet.js`.

- **Whether the rail pins is unspecified in the source**, which is a static
  frame. Both demo screens pin it under the page header; the construction is now
  documented under Pinned above so it has an owner, but it is still unconfirmed
  design. Everything from here to the end of this list is open, and none of it is
  answered by the Pinned section.

- **May a hugging rail pin at all?** The rail hugs its pills per the source
  (524px of an 1088px column on `Chi tiết dự án`, 891px on `Chủ đầu tư`). Stuck,
  it is opaque only across those pills; section cards scroll upward through the
  same horizontal band beside them with nothing behind them. A full-bleed backing
  strip, stretching the rail when pinned, or not pinning the hugging instances
  all contradict either the source or each other. Designer call.

- **How far may the pinned chrome grow before the rail is sacrificed?**
  Expanding `Xem thêm` while scrolled rewrites the published chrome height by
  hundreds of px in one frame, and the stuck rail teleports, untransitioned. At
  `sm` the published height (322px collapsed on `project-overview`) approaches a
  667px viewport, and expanded it is reported at 794px — past that point the
  rail's `top` is below the viewport bottom and it never pins at all. A cap such
  as `top: min(chrome-height, 40vh)` is a decision about which of the two the
  user keeps. Measured 2026-08-14: collapsed 322px against a 667px viewport at
  375px on `project-overview`; the second figure in that measurement (262px on
  `project-investor`) was taken on the screen deleted 2026-08-19 and is kept only
  as evidence that the height is composition-dependent rather than fixed. The
  **expanded**
  figure could not be re-measured in the headless harness (it delivers neither
  `ResizeObserver` nor `IntersectionObserver` callbacks) and still needs a real
  browser.

- **The active pill's label fails WCAG 1.4.3 AA.** `--utui-color-brand-500`
  (`#a67038`) on `--utui-color-brand-50` (`#faf5ed`) is **3.9:1**, and the label
  is `Text sm` (14px) Semibold — not large text, so the bar is 4.5:1. The
  default pill passes (`#667085` on white, 5.0:1) and so does hover, which
  leaves the *selected* item as the one state a low-vision user cannot read.
  `--utui-color-brand-600` (`#8c5926`) on the same surface is 5.5:1 and is the
  minimal fix, but it deviates from the source pairing, so it is a designer call
  rather than an edit made here. The same 500-on-50 pairing is used by
  `styles/badge.css:157`, so the decision is wider than this rail.
  Measured 2026-08-14.

- **36px pills vs the 44px comfortable touch target.** Passes WCAG 2.5.8 AA
  (24x24), fails 2.5.5 AAA. `styles/responsive.css` contains no
  `.anchor-nav` rule at all, so the pills are identical at `2xl` and at 375px —
  where the rail is the primary means of moving around a 2478px page. Growing
  the pill means growing the contractual 44px rail. Designer call, and possibly
  `sm` only.

- **Should the app shell publish its chrome height once?**
  `.claude/skills/responsive/SKILL.md` already proposes this as an `design-system/components/app-shell.md`
  contract change. Two screens now carry the same workaround, and both the
  pinned offset and the section `scroll-margin` above depend on it, so a third
  screen will copy it again. Worth scheduling; not re-derived here.

- **No token for the rail's 44px height.** The radius scale likewise has 8px and
  12px and no 10px, so the pill's `border-radius: 10px` is a hardcoded literal
  faithful to the source. Both are unrepresentable source values — token gaps,
  not defects. The 44px also appears as the no-JS fallback in
  `screens/du-an/chi-tiet.css`, which is the cost of not having the token — it
  was in two screen stylesheets until `project-investor.css` was deleted on
  2026-08-19, and the duplication returns with the next consumer.

- **`z-index: 30` is a bare literal** in the rail's own screen rule, and it
  ties `side-navigation.css` at the same layer. There is no
  z-index token ladder in `design-system/tokens/css/`; the values are conventions carried in
  eight separate files, and the rail/side-navigation tie resolves by DOM order today.

- ~~**`project-investor` ships the identical pinned construction to
  `project-overview`**, but the risk is recorded only against the latter.~~
  **Void 2026-08-19** — `project-investor` was deleted, so the pinned
  construction has a single consumer again and its viewport-overflow risk is
  recorded where that consumer is, in
  `design-system/patterns/project-overview.md`. The reasoning outlives the
  deletion: the risk belongs to the *construction*, not to one screen, so the
  next screen to pin a hugging rail either copies that record or the record is
  lifted into this file.
- **The last section's pill may be unreachable by scrolling.** The spy band is
  the top 30% of the readable area, anchored just under the pinned stack. At
  maximum scroll a final section shorter than the remaining 70% has its top
  *below* the band and so never intersects it — the rail would rest on the
  second-to-last pill with the last section fully in view. The one remaining
  screen is exposed by construction; whether it actually triggers depends on the last
  card's rendered height and has not been measured (the headless harness
  delivers no `IntersectionObserver` callbacks). The usual remedy is to force
  the last pill active once the scroll root is at its end, which is a rule about
  the rail's meaning ("topmost in view" vs "where you are"), so it is recorded
  here rather than patched.

- Focus-visible and keyboard treatment are not authored in Figma.
- The count badge slot is unused everywhere, so its size and colour pairing are
  inferred from `design-system/components/badge.md` rather than observed.
- Overflow is implemented as horizontal scroll with no affordance indicating
  more pills exist off-edge.
