# Notification

## Purpose

Notification is the page-level card that reports an outcome at the top-right of the
viewport: an action finished (`success`), something worth knowing (`info`), a caution
(`warning`) or a failure (`alert`). It replaced the toast, which was removed from `ds/`
on 2026-09-30; every page-level acknowledgement now goes through this component.

It is **not** `badge` (the status of a record) and not the inline status line a form,
dialog or drawer owns (`.form-field__error`, `.modal__status`, `.drawer__status`). It
outlives the screen that raised it: the upload flow raises it on the screen the user
lands on, not the one they left.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`) |
| Frame | `Notification`, node `9984:54071` |
| Variants | `type` = alert / warning / success / info; `desc` (bool); `button` (bool) |
| Reviewed via | Figma MCP (design context + screenshot), 2026-09-30 |

All four tones are drawn in Figma now. The earlier frame `11152:53299` drew only
success; the other tones were extrapolated. The 504px wrapper, 24px padding and canvas
backdrop in the frame are showcase, not part of the component.

## Anatomy

- **Stack** (`.notification-stack`) - fixed layer at `top`/`right` `--utui-spacing-06`,
  cards `--utui-spacing-03` apart, at most 400px wide and clamped to the viewport minus
  the two 24px gutters. Cards **append**: a later card sits below the earlier one.
  `pointer-events: none` on the layer; only cards take clicks. `z-index: 40`, under
  modal and drawer (60).
- **Card** (`.notification`) - `--utui-color-bg-surface`, padding `--utui-spacing-04`,
  `--utui-radius-lg`, 1px border, `--utui-shadow-lg`. A flex row: featured icon, content
  column, `--utui-spacing-04` apart.
  - **Featured icon** - `.featured-icon--sm.featured-icon--ring`, glyph `info` for every
    tone (per Figma), `aria-hidden`. Tone selects the modifier (table below).
  - **Content column** (`.notification__body`) - `.notification__text` (title over
    description, `--utui-spacing-01` apart) then `.notification__actions` when present,
    `--utui-spacing-03` apart; right padding `--utui-spacing-08` leaves room for close.
  - **Title** - 14/20 medium, `--utui-color-gray-900`.
  - **Description** (optional) - 14/20 regular, `--utui-color-gray-600`, two lines then an
    ellipsis; the full string stays in the DOM.
  - **Actions** (optional) - `.button--link` / `.button--link-gray` (14/20 semibold).
- **Close** (`.notification__close`) - `<button>`, 36px box at the top-right,
  `--utui-spacing-02` inset, 20px `close` glyph in `--utui-color-gray-400`.

## Tones

| Tone | Featured icon | Card border | Actions with a CTA | Live region on `.notification__text` |
|---|---|---|---|---|
| `alert` | `--error` (Red/100, ring Red/50, glyph Red/600) | `--utui-color-border-strong` | one CTA, `.button--link` | `role="alert"` (assertive) |
| `warning` | `--warning` (Yellow) | `--app-border` | one CTA | `role="status"` (polite) |
| `success` | `--success` (Green) | `--app-border` | `Đóng` (`.button--link-gray`) + CTA | `role="status"` |
| `info` | no modifier = brand (Brand/100, ring Brand/50, glyph Brand/600) | `--app-border` | `Đóng` + CTA | `role="status"` |

`info` is the **brand** tint as drawn in Figma, not featured-icon's blue `--info`. The
`notification--{alert,warning,success,info}` classes on the card are tone hooks set by
the script; only `--alert` has CSS (the border). Choose the tone by meaning:

- failure -> `alert`; a caution or a refused action -> `warning`;
- a real action that completed -> `success`;
- a message about something that did not really happen (a demo stub, a download in
  progress) -> `info`.

## States and behaviour

| State | Treatment |
|---|---|
| Shown | Appended to the stack; no motion. The component has no animation, so no `prefers-reduced-motion` rule is needed; add one together with any entrance/exit motion |
| Auto-dismiss | **`success` and `info` without a CTA** close after 5000 ms (`AUTO_DISMISS_MS`). The timer pauses while the pointer is over the card or focus is inside it, and restarts in full when both leave |
| Stays | A card with a CTA, `warning` and `alert` stay until the user dismisses them or activates the CTA |
| Undo slot | A card raised with `slot: "undo"` is the only one of its slot: a new one replaces the old. A screen closes it with `dismissSlot("undo")` when the context changes (wizard step change). Other cards are not touched |
| Close hover | `--utui-color-bg-surface-subtle` fill, icon `--app-text` |
| Close focus | The shared focus ring from `base.css` |
| Dismissed | Card removed from the DOM; if focus was inside it, focus moves to the next card's close button |

`autoDismiss` overrides the rule: `false` = stay, a number = milliseconds. Activating the
CTA runs `onActivate` and closes the card.

## Tokens

| Role | Token |
|---|---|
| Card padding, icon-to-content gap | `--utui-spacing-04` |
| Radius / shadow / surface | `--utui-radius-lg` / `--utui-shadow-lg` / `--utui-color-bg-surface` |
| Border | `--app-border`; alert `--utui-color-border-strong` |
| Stack offset, close clearance | `--utui-spacing-06`, `--utui-spacing-08` |
| Stack gap, text-to-actions, actions row | `--utui-spacing-03` |
| Title-to-description | `--utui-spacing-01` |
| Title / description | `--utui-color-gray-900` + `--utui-font-weight-medium` / `--utui-color-gray-600` |
| Type | `--utui-font-size-text-sm` / `--utui-line-height-text-sm` |
| Close | `--utui-color-gray-400`, hover `--utui-color-bg-surface-subtle` + `--app-text`, radius `--app-radius`; coarse hit area `--utui-touch-target-min` |
| Tone icon | via `featured-icon` (`--utui-color-{red,yellow,green,brand}-{50,100,600}`) |

Literals with a comment in the CSS: the 400px card width and the 36px close box
(single-consumer composition values).

## Usage

- A one-line reply to an action: pass `title` only. Do not invent a description.
- A named object worth re-reading (a document or project name): `title` + `description`.
- Undo: `success` + `cta: { label: "Hoàn tác", onActivate }`, `slot: "undo"`.
- Not a substitute for status next to the thing that changed (`file-upload` owns its own
  `role="status"` line).
- While a modal or drawer is open the stack (z 40) sits under the scrim (60): use
  `.modal__status` / `.drawer__status` there.
- Never raise both a notification and another surface for one event.

## Accessibility

- The live region is `.notification__text` (title + description), with `aria-atomic="true"`:
  `role="alert"` (assertive) for `alert`, `role="status"` (polite) for the others. The
  card itself is not a live region, so the close button and actions are not read back
  and the title is not read twice.
- **Append empty, write after 32 ms** with `setTimeout`, not `requestAnimationFrame`
  (rAF does not run in a hidden tab). A live region inserted with its text is often not
  announced.
- The empty stack is in the HTML from first paint.
- Focus is never taken. Close and CTA are real `<button>`s reachable by Tab.
- **Esc closes the card that has focus** (focus-within). The handler is on the card and
  does not stop propagation, so a modal's or drawer's own Esc is unaffected; while an
  overlay is open the shell is inert and the stack sits under it. After closing, focus
  moves to the next card's close button.
- Close label: `Đóng thông báo: {title}`; the `Đóng` link button carries the same
  `aria-label`. Two open cards never share a button name. `closeLabel` overrides.
- Auto-dismiss can lose a message, so it applies only to `success`/`info` without a CTA,
  pauses on hover and focus, and errors and warnings stay.
- The featured icon is `aria-hidden`; tone is never the only carrier - the title states the outcome.
- Coarse pointer: the close box stays 36px and a 44px `::after` is the hit area (`responsive.css`).

## Responsive

No media query of its own. The stack is `min(400px, calc(100vw - 48px))` wide and
`fixed`, so the page never scrolls sideways.

## Code Mapping

| Surface | File |
|---|---|
| CSS | `.notification-stack`, `.notification`, `--alert`, `__body`, `__text`, `__title`, `__description`, `__actions`, `__close` in `ds/styles/notification.css` |
| Coarse hit area | `.notification__close::after` in `ds/styles/responsive.css` |
| Renderer | `window.OmeuNotification.show({ title, description, tone, cta: { label, onActivate }, autoDismiss, closeLabel, slot })`; `notify(title, tone \| options)` for one-liners; `dismiss(card)`, `dismissSlot(slot)`, `dismissAll()` in `ds/scripts/notification.js` |
| Featured icon | `ds/components/featured-icon.md` |
| Per-screen markup | `<div class="notification-stack" id="notificationStack"></div>` and `<script src=".../ds/scripts/notification.js">` before the screen bundle |
| Shared-script callbacks | `row-table.js` and `phase-table.js` take a `notify(message, action?)` option; `page-tab.js` calls `OmeuNotification.notify(..., "warning")` |

Each screen has a local `notify(message, tone)` that calls `OmeuNotification.notify`; the
former toast message became the `title`.

### Cross-screen handoff

The demo is standalone pages, so the upload flow and project creation pass the name
through `sessionStorage` (`mdm.savedDocName`, `mdm.createdProjectName`); the target
screen reads it **once and clears it** and raises the notification. The write and
navigation are gated on `reportValidity()`. This is a demo mechanism, not a contract for
DEV. `du-an/chi-tiet.js` still reads `mdm.updatedProjectName`, which nothing writes
since the edit screen was removed (2026-09-28).

## Known Gaps

- **Missing tokens:** (1) Gray/300 (`#D0D5DD`) for the alert border - approximated by
  `--utui-color-border-strong` (Neutral/300); (2) the 2px `padding-top` of the Figma
  content column - dropped; (3) the 7px close inset - `--utui-spacing-02` (8px) is 1px
  off; (4) Figma's `Dismiss` is `#344054` (Gray/700) - `.button--link-gray` is Neutral/600.
- **No cap on the stack:** a bulk action that raises many cards has no limit.
- **Focus after the last card closes** falls to `<body>`; needs a shell-level answer.
- **No entrance/exit motion.** Add it together with a `prefers-reduced-motion` rule.
- **Overlays cover the stack** (z 40 < 60); no tier raises it above an open modal or drawer.
- **The 5 s auto-dismiss is a product decision (2026-09-30)**, not drawn in Figma.
- **Cross-screen handoff is a demo mechanism** (above).
