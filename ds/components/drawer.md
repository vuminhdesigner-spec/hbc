# Drawer (slide-out menu)

## Purpose

Drawer is a modal panel anchored to the trailing edge of the viewport. It holds
one decision that needs more room than a dialog — a picker over a wide table, a
long form — without leaving the record the user is on.

Use it when the task returns a value to the page behind it. Use a page when the
task is the destination, and a popover (`design-system/components/filter-panel.md`) when the
page behind it stays a valid place to be.

**Or use it to hold a record's own sub-collection** — search, filter and a full
`.data-table`, in place of a stand-alone list page — when a section card's
"see everything" trigger has nowhere else to go. A row's own form, confirm or
view then stacks on top of it (`design-system/components/modal.md` § Stacking)
rather than replacing it, so the operator's search and filter are still there
on the way back. `screens/doi-tac/chi-tiet.html`'s three record drawers are
this case (MDM-1209).

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Instance | `Slide out menu`, node `12035:57167`, in section `Chủ đầu tư` (`12022:55515`). Panel 1221 with a 40px gutter |
| Opened from | The `Chủ đầu tư` card's empty state (`Chọn chủ đầu tư`) and `Đổi chủ đầu tư` in the `Chủ đầu tư` dialog (`12035:63630`) |
| Reviewed via | Implementation spec extracted from the Figma MCP, 2026-08-14 off `11357:48413`; re-read 2026-08-19 off `12035:57167` |
| Shell spacing | OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`), node `9974:35089`. Read 2026-09-29, USER DECISION — same split `design-system/components/filter-panel.md`'s Source table already makes between a trigger set and a panel component read from two different files: `12035:57167` above stays the authority for what this component IS (the 1221px picker composition, the toolbar/search/table), `9974:35089` is now the authority for the four bands' own padding and the gap between them, for every drawer this contract covers — the investor picker, `--md` move, `--sm` table-settings, and the three `doi-tac/chi-tiet.html` list drawers alike. |

**Node history, and why it matters.** The contract was written against
`11357:48413`, which was later deleted from the file — for one day this document
said no frame drew the surface and its only consumer had been folded into a
modal. `12035:57167` draws it again, with the same geometry and one addition
(the `Bộ lọc` trigger, previously a recorded gap). Anything citing `11357:48413`
is stale; the live node is `12035:57167`.

## Anatomy

| Part | Class | Notes |
|---|---|---|
| Overlay | `.drawer` | `position: fixed`, full viewport, flex row aligned to the end. Contributes nothing to page `scrollWidth`. |
| Scrim | `.drawer__scrim` | `--utui-drawer-scrim` (`#101828` at .8) with an 8px backdrop blur. A real element, because it carries the dismiss handler. Not focusable: `tabindex="-1"` on the `<button>` (a pointer target only; Escape and `.drawer__close` are the keyboard routes). |
| Panel | `.drawer__panel` | `role="dialog" aria-modal="true"`, 1221px wide, `100dvh` tall, a flex column with a `row-gap` between whichever bands are actually present (header, toolbar, an optional status line, body, an optional footer). |
| Header | `.drawer__header` | Padded 20px top / 8px bottom (9974:35089): Featured icon (`--lg --success` — the drawer default, USER DECISION 2026-09-29; was brand) + `.drawer__title` (Text xl/Semibold, 20/30, `flex: 1 1 auto` — what pushes the two optional trailing parts below to the far edge). |
| Heading + supporting | `.drawer__heading` > `.drawer__title` + `.drawer__supporting` | Optional. Wrap the title in `.drawer__heading` (takes the title's `flex: 1 1 auto`) when the drawer needs the source's hidden supporting line; `.drawer__supporting` is Text sm/Regular, `--text/secondary` (same as `.modal__supporting`). Point the panel's `aria-describedby` at it. Never together with `.drawer__header-steps`: a header with a stepper has no supporting line (USER DECISION 2026-10-05) — `#createDrawer` and `#importDrawer` keep `.drawer__heading` around the title only. |
| Title name | `.drawer__title-name` | Optional span inside `.drawer__title` for a variable name after fixed lead text ("Chuyển vị trí <tên hồ sơ>"). The title becomes a nowrap flex row; the lead stays whole, the name ellipsizes — add `data-tooltip-overflow` for the full text. First consumer: `#moveDrawer` in `screens/du-an/ho-so/chi-tiet.html` and `tai-len.html`. |
| Header actions | `.drawer__header-actions` | Optional, trailing edge of the header (placed there by `.drawer__title`'s own `flex-grow`, not a margin of its own). **AUTHORED — no Figma frame draws it (gap).** First consumer: `screens/doi-tac/chi-tiet.html`'s three record drawers, each holding a `Thêm …` primary button that opens the same create/edit form the drawer's own row action does. |
| Close | `.drawer__close` | **Required on every drawer** (USER DECISION 2026-10), outermost on the header's trailing edge (after `.drawer__header-actions` in source order). Icon-only, `--utui-button-height-md` hit area (40px), icon `--utui-color-icon-default`, hover `--utui-color-bg-surface-hover` + `--utui-color-icon-strong` (same tokens as `.modal__close`), `close` glyph, `aria-label="Đóng"`, `data-modal-close`. **AUTHORED — 9974:35089 draws no `×` (gap).** Every drawer's header-level dismiss control; a drawer with a footer keeps its own `Đóng` / `Hủy` / `Quay lại` as well. See Footer below and Known Gaps. |
| Icon-button cluster | (rule in `drawer.css`) | Adjacent `.drawer__minimize` / `.drawer__expand` / `.drawer__close` sit flush: the header's flex gap between them is cancelled (`margin-inline-start: -gap`). The title-to-cluster gap is unchanged. `.dock__restore/__expand/__close` share the button rule. |
| Minimize | `.drawer__minimize` | Optional, **before** `.drawer__expand` (order: header-actions, minimize, expand, close). Same icon-only look as `.drawer__close`; glyph `minimize`, `aria-label="Thu nhỏ"`. Shown only when the overlay carries `data-drawer-minimizable`; hidden at `max-width: 767px`. Hides the drawer into the dock (`ds/components/dock.md`) without closing it. The screen wires the click (it must snapshot its own draft first), then calls `OmeuModal.minimize(id)`. **AUTHORED — no Figma frame draws it (gap).** |
| Expand | `.drawer__expand` | Optional full-screen toggle, between `.drawer__header-actions` and `.drawer__close`. Same icon-only look as `.drawer__close`; glyph `open_in_full` / `close_fullscreen`, `aria-label` `Mở toàn màn hình` / `Thoát toàn màn hình` (no `aria-pressed` — the label carries the state, as in `listing-fullscreen.js`), `data-modal-expand`. Shown only when the overlay carries `data-drawer-expandable`; hidden at `max-width: 767px`, where the drawer is already full-bleed. **AUTHORED — no Figma frame draws it (gap).** |
| Toolbar | `.drawer__toolbar` | Inset only (`--utui-drawer-padding-x`). A search + `Bộ lọc` row composes `.listing-toolbar .listing-toolbar--wrap` on the same element with `.listing-toolbar__search` on the field — controls 36, field 400px, wrap by content (`ds/components/listing-toolbar.md`). `--md` stacks its fields in a column, 16px apart (`--utui-drawer-toolbar-gap`) — not a listing-toolbar row. The wizard stepper is **not** a toolbar band: it lives in the header (`.drawer__header-steps`, see Header steps). A wizard step's toolbar may be a read-only field (`#importDrawer` step 1: `Thư mục lưu hồ sơ`, USER DECISION 2026-10), an `.inform` lead (`#importDrawer` step 4) or a filter group alone (`#importDrawer` step 2); step 3 has no toolbar band. Or an **inform lead** — one `.inform` (`ds/components/inform.md`, no `×`/action) stating the condition the body's table acts on, e.g. the permission-check step (USER DECISION 2026-10); it stays out of the scroll so the body remains the one scroll area. |
| Header steps | `.drawer__header-steps` | Optional, wizard drawers only (USER DECISION 2026-10; authored, no Figma frame — GAP). A `nav[aria-label]` last child of `.drawer__header` holding `ol.progress-steps`. Layout (USER DECISION 2026-10-02): when it is present `.drawer__header` becomes a grid (`:has(> .drawer__header-steps)`, named container `drawer-header`) and `.drawer__heading` is `display: contents`, so the stepper takes the place of the supporting text: title (row 1) / stepper (row 2) beside the icon, no `.drawer__supporting` (USER DECISION 2026-10-05; a step summary goes in the body or the live region, not the header); the icon and the control buttons span rows 1-2, centred. Fallback `@container drawer-header (max-width: 1023px)` (header narrower than the longest chain, `#createDrawer` with 4 steps): the stepper drops to its own full-width row under icon / title. DOM unchanged either way. One shared threshold: a 3-step chain drops too even when it would fit (USER DECISION 2026-10-02, accepted). No separate band. Consumers: `#createDrawer` (`doi-tac/danh-sach`, `du-an/danh-sach`) and `#importDrawer`, all on the text chain `ol.progress-steps.progress-steps--text` (`ds/components/progress-steps.md`). Pattern: `ds/patterns/wizard-drawer.md`. |
| Body | `.drawer__body` | The only band that scrolls, and the band a consumer renders INTO. Two internal rows: content, then a table footer — its own inner grid, unaffected by the panel's own layout. A wrapper element inside it takes the whole `1fr` row and puts the footer back inside the scroller — render the two rows as its direct children. Inset on the inline axis only (`--utui-drawer-padding-x`); the block spacing above and below it is the panel's own `row-gap`, not a padding this band carries itself. A table renders inside `.table-panel .table-panel--fill` (`data-table.md`) — the panel's surface; in a drawer it also takes a 1px `--app-border`, since shadow-xs draws no edge on white. With no footer band the body adds 20px bottom padding so the panel clears the drawer edge. |
| Status | `.drawer__status` | Optional, and now positioned by which shape the drawer is (USER DECISION, 2026-09-29) — see *Two positions* below. **Not itself a live region when the panel already has one** — see *Announcing what the drawer says* below. |
| Footer | `.drawer__footer` | **Optional — a picker's band, not every drawer's.** Right-aligned actions, secondary then primary, 12px apart, over a 1px top border, present only when the drawer has a commit action to put there. A listing drawer (no commit action) omits the band entirely. Every drawer has `.drawer__close` in the header; a drawer with a footer keeps `Đóng` / `Hủy` there as well. When present, the status line shares the actions' row (USER DECISION 2026-10-05): `flex: 1 1 0; min-width: 0`, text at the start, actions at the end, a long sentence wraps inside the status and never pushes the buttons down; source order is reading order, so it takes no `order`. Row order is status · back · primary; a back button always sits beside the actions (never leads the row), so it does not move when the status shows or hides (USER DECISION 2026-10-05). A consumer's own full-width summary (`.picker-selection`, `width: 100%`, `order: -2`) still takes its own line above, declaring its `order`; never `flex-basis: 100%`, which becomes a block size when the row wraps into a column. |

**Multi-step drawer in one panel (2026-10).** A drawer can swap its bands between steps without closing: `du-an/ho-so/danh-sach.html` `#moveDrawer` runs step 1/2 "Kiểm quyền" then step 2/2 folder picker. Each step is its own `.drawer__toolbar` + `.drawer__body` pair, the inactive pair `hidden` (`[hidden]` rules in `drawer.css`). Step 1 is a lead in `.drawer__toolbar` (`.drawer__supporting` lines) over a `.drawer__body` holding `.table-panel .table-panel--fill` > `.data-table-wrap` — the one scroll area, sticky header. Footer: step 1 `Hủy` + primary; step 2 `Quay lại` (back, keeps step-1 ticks) + primary only — no `Đóng` past step 1, dismissal is the header `×` / Escape / scrim (USER DECISION 2026-10, same as `#createDrawer`; too many choices otherwise). Opened straight at the picker (no check step), the footer keeps `Đóng` + primary. The step indicator is text in `.drawer__supporting` ("Bước n/2 · …"; `.progress-steps` not used to save height — a drawer uses either the stepper or this line, never both). The panel's `aria-describedby` names the supporting line (and step 1's lead title), and focus moves to the panel on a step change — that is the one channel that announces the step; the `sr-only role="status"` line is kept only for the status text. A one-step check drawer (`#printCheckDrawer`) uses the same bands. `#importDrawer` (Excel import, `du-an/ho-so/danh-sach.html`, 3 steps) and `#createDrawer` carry the stepper in the header (`nav.drawer__header-steps` > `ol.progress-steps`, USER DECISION 2026-10). Where it sits in the header: see Header steps above (beside the icon under the title, narrow header falls back to its own row). `#importDrawer` (4 steps): step 1's toolbar is the read-only `Thư mục lưu hồ sơ` field (template download is the file-upload hint link); the `.inform` lead is at step 4 only (result: `--success` / `--warning`). Step 2's toolbar is the `Tất cả / Hợp lệ / Lỗi (n)` filter alone; a refused `Tiếp theo` shows the reason in `.drawer__status`, turns the stepper blocked and focuses the first invalid cell. Footer: step 1 `Hủy` + `Tiếp theo`; step 2 `Quay lại bước trước` + `Tiếp theo`; step 3 `Quay lại bước trước` + `Hoàn thành lưu trữ (Adhoc)` + `Gửi phê duyệt` (the one commit, busy = disabled + `aria-busy` on the pressed button, status `Đang gửi…` / `Đang lưu trữ…`); step 4 `Đóng` (+ `Thử lại n hồ sơ`). While committing, `×`, minimize and back are disabled and Esc/scrim refused; minimize shows at step 4 only while files upload. The panel's `aria-describedby` on `#importDrawer` is `importStepCurrent`: the stepper's hidden state text for the current step (name + state), so the step name is announced on every step change. Pattern: `ds/patterns/wizard-drawer.md`.

**Two positions, one status part (USER DECISION, 2026-09-29; footer position changed 2026-10-05).** In `.drawer__footer` the status sits in the same row as the actions (see Footer): text at the start, actions at the end, `flex: 1 1 0` so it never takes a line of its own. A listing drawer, which has no footer, renders the same part directly between `.drawer__toolbar` and `.drawer__body`; the flex column stretches it, but it needs its OWN `padding-inline: var(--utui-drawer-padding-x)` there (every other direct child carries that inset itself). `hidden` still means no row and no `row-gap` in either position.

## The drawer cannot use a notification

`styles/notification.css` is `z-index: 40` and this overlay is `60`, so a notification raised
while the drawer is open paints behind the scrim: it can be neither read nor
reached. A drawer that stays open after acting therefore answers on
`.drawer__status`, which is inside the panel. This is the same gap
`design-system/components/modal.md` records for the centred dialog, and
`.drawer__status` is the drawer's `.modal__status`.

## Announcing what the drawer says

**The visible status line is what a reply LOOKS like; it is not necessarily what
it SOUNDS like.** `.drawer__status` is `hidden` until it has something to say, and
`hidden` is `display: none`: a `role="status"` mutated while it is out of the
accessibility tree announces nothing. Two ways to be honest about that, and the
consumer picks by whether the panel already publishes a live region:

- **The panel has no other live region.** Put `role="status"` on
  `.drawer__status`, reveal it (`hidden = false`) **before** writing its text, and
  set `hidden` again only to clear it. That is the order `styles/notification.css` states
  for every live region in this package.
- **The panel already has one** — a picker announcing counts and paging from an
  `sr-only` `role="status"`, which is what *Accessibility* below requires. Then
  this line carries **no role**, and the consumer routes the same sentence through
  that one region. Two polite regions on one surface interleave unpredictably, and
  `design-system/patterns/project-overview.md` says one live region per screen.

Either way the sentence is written once, by one function, so the visible and the
spoken reply cannot drift.

Recorded 2026-08-19, after the investor picker shipped with `role="status"` on a
`hidden` element **and** an `sr-only` region beside it: three of its replies
(`Chủ đầu tư không thay đổi.`, `Thiết lập cột (chưa có trong bản demo).`,
`Tải xuống danh sách (chưa có trong bản demo).`) were painted and silent, and the
panel was in breach of the one-live-region rule at the same time.

**A message must also be cleared by whatever makes it untrue.** The same review
found the picker clearing its line in exactly one place — opening the drawer — so
one press of `Thiết lập` pinned its reply through every subsequent search, page
and selection, and the footer could show two contradictory lines at once. Clear it
on selection, on load, and on **anything that changes which rows are shown** —
typing, `Escape` in the field, the field's own clear button, and a filter applied
or cleared from the panel's popover. A client-side change is not a round trip and
does not pass through the load path, so it clears its own.

The wording used to enumerate the query, and the enumeration was the bug: the fix
pass of 2026-08-19 cleared the line on every route it named and left the filter
popover — the one remaining path that changes the table — pinning
`Thiết lập cột (chưa có trong bản demo).` under a list it no longer described.
Write this rule as a condition on the list, never as a list of controls.

**OPEN QUESTION — whether the two become one shared surface-status part.** They
were added the same day for the same reason and carry the same eleven declarations,
the same neutral 20px glyph (`--utui-color-icon-default`) and the same consumer
obligations. One difference left: this one takes `flex: 1 1 0` because it lives in
a flex footer. Merging them is a contract change for both files and neither
can own the other's, so it is a design-system decision — recorded in full under
Known Gaps in `design-system/components/modal.md`. Until it is answered, a fix to
one **must** be applied to the other; the neutral glyph tone came from this file to
that one on 2026-08-19 for exactly that reason.

**`.drawer__status-action` — the row-table undo, added 2026-09-29.** This part had
no consumer until `screens/doi-tac/tao-moi.js`'s create-drawer wizard moved its
tables' add/delete/undo messages off the notification they cannot use (`The drawer cannot
use a notification`, above) and onto this line instead — the same `Hoàn tác` control
`.modal__status-action` already gives the phase table. Same declarations, same
name pattern (`-action`, a part of a part). One divergence stays open above.

## States

| State | Behaviour |
|---|---|
| Closed | `hidden` on `.drawer`. `.drawer[hidden] { display: none }` is declared, because the author `display: flex` would otherwise beat the UA rule and leave a modal painted and tabbable while it is marked closed. |
| Open | Shell behind is `inert`; the page does not scroll (`body:has(.drawer:not([hidden]))`). |
| Expanded | `.drawer.is-expanded` (state class on the overlay, set by `ds/scripts/modal.js`): panel is `100%` of the viewport, gutter dropped, width modifiers ignored. Focus stays on `.drawer__expand`; label and glyph swap. `Escape` closes the drawer as usual (no shrink-first step). **Not remembered by the drawer:** closing resets it, the next open starts at the design size. A minimized draft's screen remembers it per draft and passes `expanded` to `restore()`. Entering `max-width: 767px` while expanded drops `is-expanded` (the button is hidden there; `ds/scripts/modal.js`). |
| Minimized | `.drawer.is-minimized` together with `[hidden]` on the overlay (set by `OmeuModal.minimize`). Off the modal stack, shell and dock not inert, page scroll lock released, Escape does nothing to it. The draft lives in a dock item; restoring (`OmeuModal.restore`) re-opens the overlay with focus on the panel and brings back `is-expanded` if that draft was expanded. Only a lone surface (depth 1) can minimize; a stacked one cannot. Opt-in via `data-drawer-minimizable`. First consumer `#createDrawer`, several drafts (max 3) over one DOM. |
| Primary action disabled | The confirm action stays disabled until the panel has something to confirm — and a value the panel **preselected** is not that. A picker may open with the record's current value checked so the panel shows what it is about to change, but the primary enables only once the user has picked, or the first press of the one commit action commits nothing and the drawer does not even close. |
| Selection changed or cleared | **The list re-renders with the footer summary, not after it.** A picker's checked control and its current-row treatment are computed when the rows are built, so writing the summary alone leaves the two halves disagreeing — the footer saying nothing is selected over a checked, tinted row, and that row then un-re-selectable, since clicking an already-checked radio fires no `change` at all. Re-render, then place focus (rule 6 below). Added 2026-08-19, after `Bỏ chọn` shipped with all three failures at once. |
| Re-selecting the row that is already checked | Not a no-op. The picker treats a `click` on the checked control as a pick, because the user who opened the panel to **keep** the current value reaches for that control first and it fires no `change`. It routes to the same commit path, which answers "unchanged" in words rather than leaving a dead control and a disabled primary. |

## Behaviour the component requires of its consumer

These are not optional; a drawer without them is a trap. **Since 2026-08-19 they
are supplied by `scripts/modal.js`, which drives this surface as well as the
centred dialog** — the panel and scrim lookups in that file take both class
names. Do not hand-roll them again; the drawer's own copy of this trap was the
third in the package before it was deleted.

Two things follow from sharing that script, and both are wanted:

- **One surface at a time covers the drawer too.** `OmeuModal.open()` closes
  whatever is open first, so a dialog handing over to a drawer
  (`Đổi chủ đầu tư`) is sequential by construction rather than by a screen
  remembering to close first. `design-system/components/modal.md`'s
  replace-by-default rule is satisfied without a stack — and still is since
  stacking arrived (2026-09-21), because stacking is opt-in per call and this
  hand-over does not ask for it.
- **The caller owes the new panel a trigger that will outlive the old one.** When
  a dialog opens the drawer, the button that was pressed is inside the panel
  being closed; `close()` skips a trigger that is no longer rendered, and focus
  would land on `<body>`. Pass a control on the page behind instead.

1. Focus moves into the panel on open — the panel box itself (`tabindex="-1"`),
   so the drawer is announced from its title (see Accessibility; `modal.js`).
2. Focus is restored to the trigger on close. If the trigger no longer exists —
   because confirming replaced the region it lived in — focus goes to the content
   that replaced it, never to `<body>`.
3. `Escape` closes and cancels. So does the scrim. **Exception, 2026-08-14:** a
   search field inside the panel consumes `Escape` while it has text — clearing a
   query is what that key means in a search input (`design-system/components/inputs.md`) —
   and the drawer's `Escape` applies when the field is empty or unfocused. Without
   the split, one keypress discarded the query and the pending selection together.
   Every other dismissal path is unaffected, and so is focus return.
4. The page behind is `inert`. A `Tab` trap inside the panel is the fallback for
   UAs without `inert`, not a substitute for it.
5. The confirm action is the only thing that commits; closing by any other route
   changes nothing.
6. **A control inside the panel that destroys or hides itself must place focus
   before it does.** Added 2026-08-19, after the investor picker's `Bỏ chọn` —
   which lives in the very line its own action hides — dropped focus to `<body>`:
   the next `Tab` restarted at the scrim and `Shift+Tab` left the page, because
   the `Tab` trap only intervenes at the first and last stop and has nothing to
   wrap from. The same failure had already been guarded twice in that one panel
   (the filter popover on close, and every re-render of the table region), which
   is what makes it a rule rather than three fixes. Send focus to the control
   that replaced it, or — when nothing replaced it — to a control outside the
   region that is always present. Never to `<body>`.
7. A drawer that can go dirty (a form, not a picker) passes `beforeClose` to
   `open()` (`design-system/components/modal.md` § *Behaviour the component requires of its consumer*
   item 6) so Escape/scrim/`×`/a footer's own dismiss button all ask the same
   question instead of a screen guarding each route by hand. First consumer:
   `screens/doi-tac/danh-sach.html`'s `#createDrawer`; also `screens/du-an/danh-sach.html`'s.

## Tokens

| Token | Role |
|---|---|
| `--utui-drawer-width` | Panel width (1221px) |
| `--utui-drawer-width-lg` | `--lg` panel width (1341px) |
| `--utui-drawer-gutter` | Space left of the panel; stepped 40 / 24 / 0 in `styles/responsive.css` |
| `--utui-drawer-bg`, `--utui-drawer-shadow` | Panel surface |
| `--utui-drawer-padding-x` | Content inset (20px, 9974:35089), shared by every band on the inline axis |
| (panel `row-gap`, `--utui-spacing-05`) | 20px between every band the panel actually renders (9974:35089) — not a named drawer token, the package's own spacing-05 used directly, same as the panel's `border-inline-start` uses `--app-border` directly rather than a drawer-scoped alias |
| `--utui-drawer-header-gap` | Header band's icon-to-title gap. The band's own padding is the panel's `--utui-drawer-padding-x` inline, `--utui-spacing-05`/`--utui-spacing-02` block (20 top / 8 bottom, 9974:35089) — read directly, no drawer-scoped padding token for the header |
| `--utui-drawer-toolbar-gap` | Gap between the stacked `--md` toolbar fields; a row toolbar takes its gaps from `.listing-toolbar` |
| `--utui-drawer-footer-gap`, `--utui-drawer-footer-padding-y` | Footer band (optional — see Anatomy) |
| `--utui-drawer-scrim`, `--utui-drawer-scrim-blur` | Overlay |

## Responsive

- The panel is `min(--utui-drawer-width, 100vw - --utui-drawer-gutter)` and
  `min-inline-size: 0`, so a wide table inside it scrolls rather than pushing the
  panel past the viewport. The gutter is the only tier value, and it is stepped in
  `styles/responsive.css` — never in a screen file.
- `100dvh`, never `vh`: a picker's footer holds its only commit action, and a
  mobile browser toolbar must not sit on top of it. A listing drawer has no
  commit action to protect, but keeps `100dvh` anyway — the same reasoning
  covers `.drawer__close` in its header.
- The body's scroll region is bounded by the panel, not by the viewport. A
  consumer embedding `.data-table-wrap` gets that from
  `.drawer__body .data-table-wrap` in `drawer.css`.

## Accessibility

- `role="dialog"`, `aria-modal="true"`, labelled by the panel title.
- The trigger carries `aria-haspopup="dialog"`, `aria-expanded` and
  `aria-controls`.
- `.drawer__expand` is a native `<button>` whose accessible name states the action it will do; the swap of `aria-label` is the state signal (no `aria-pressed`, no live region). Focus is not moved by toggling.
- `.drawer__minimize` is a native `<button>` named `Thu nhỏ`. After it runs, focus goes to the new dock item's restore button (`dock.md`); restoring puts focus on the panel.
- The scrim is not in the tab order; the keyboard routes out are `.drawer__close`
  (every drawer) and the footer `Đóng` / `Hủy` when there is one.
- **`.drawer__panel:focus { outline: none }` is correct and is not a focus-ring
  defect.** The panel is a focus *landing* target, not a control: `scripts/modal.js`
  focuses it so the drawer is announced from its title, and Chrome paints its UA
  ring on a programmatically focused `tabindex="-1"` box — a ring around the whole
  1221px panel, on something the user cannot act on. Every control inside keeps
  the app ring from `styles/base.css`, and `.modal__panel:focus` in
  `styles/modal.css` says the same thing for the same reason. Noted 2026-08-19
  after a review checked it; do not "restore" it.
- Any scroll container inside the body is a named, focusable region
  (`role="region"`, `tabindex="0"`, a label that says it scrolls). Where it can
  do either — a table that fits the panel at one tier and scrolls at another —
  the tab stop and the `cuộn ngang` half of the label are **measured** after
  render and on resize, per `design-system/components/data-table.md`.
- Row counts and paging inside the body are announced from one `role="status"`
  line, not by making the table a live region. **That line is the panel's only
  live region**; a visible `.drawer__status` beside it routes its text through the
  same one rather than becoming a second.
- **Every control that opens the panel carries the popup attributes** —
  `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` naming the surface it
  opens — including one that also opens something else in another state. A trigger
  without them is invisible to whatever syncs `aria-expanded`, and its accessible
  name must describe the surface it actually opens: a pencil named "edit" that
  opens a picker for a record that does not exist yet is naming the wrong thing.

## Code Mapping

| Surface | File |
|---|---|
| Component CSS | `styles/drawer.css` |
| Tokens | `design-system/tokens/css/untitled-ui-component.css`, `--utui-drawer-*` |
| Behaviour | `scripts/modal.js` — shared with `design-system/components/modal.md` since 2026-08-19 |
| Example | `screens/du-an/chi-tiet.html`, `#investorDrawer` — the company picker for `Chủ đầu tư`. Opened from the card's empty state and from `Đổi chủ đầu tư` in `#investorModal`; `openInvestorDrawer()` / `confirmInvestor()` in `screens/du-an/chi-tiet.js`. It was the drawer on the deleted `screens/project-investor.html`, spent 2026-08-19 as the second view of `#investorModal`, and returned to a drawer the same day when `12035:57167` was read. `--md`: `screens/du-an/ho-so/chi-tiet.html` and `.../tai-len.html`, `#moveDrawer` — the folder-move picker; the readonly current-folder field is a plain `.form-field` + `.form-field__control--readonly`, no dedicated part. **A data-table body, not a picker — and the `.drawer__close` / no-footer case:** `screens/doi-tac/chi-tiet.html`'s `#addressDrawer` / `#bankDrawer` / `#contactDrawer`, base size — the full record list for `Địa chỉ` / `Tài khoản ngân hàng` / `Người liên hệ`, each a copy of the standalone list page (`toolbar` + `.data-table` + `.table-footer`) that page used to be, folded into the record's own page (MDM-1209) instead of navigating to it. No footer (no commit action); `.drawer__close` in the header is the only header-level dismiss, and `.drawer__status` sits between the toolbar and the body instead of a footer it does not have. The card's `.section-action` and `.section-more` open the drawer (`aria-haspopup="dialog"`); the drawer's own `cell-action` pencil and the card row both open the same create/edit `.modal`, stacked (`{ stack: true }`) when opened from inside the drawer. **The Purpose paragraph's "a long form" case, base size:** `screens/doi-tac/danh-sach.html`'s `#createDrawer` (`--lg`, see Known Gaps size axis) — the four-step partner create wizard (`screens/doi-tac/tao-moi.js`, `screens/doi-tac/tao-moi.css`), a page until 2026-09-29. Tables sit in plain `.table-panel` (not `--fill`): step 3 stacks two, so none fills the body. The stepper is `nav.drawer__header-steps` > `.progress-steps` inside the header (one segment per step, no toolbar band); the header is the standard featured icon + `.drawer__title` "Tạo đối tác mới" with no `.drawer__supporting` (the stepper is `progress-steps--text` and sits where the supporting line would, per Header steps; rewritten by `renderProgress()`; Angular draft, not confirmed: `furthest` input on progress-steps). `screens/du-an/danh-sach.html`'s `#createDrawer` ("Tạo dự án mới", 3 steps, `screens/du-an/tao-moi.js`) is the same composition, a page until 2026-10-02; see `ds/patterns/wizard-drawer.md`; footer holds the step's own back/next/save (`#stepActions`), since `Lưu đối tác` is the drawer's one commit action; `.drawer__status` sits in that footer per the picker position and carries the tables' add/delete/undo replies (`.drawer__status-action`, above), since `#stepStatus`, the wizard's own `role="status"`, is the panel's one live region. Opened from the listing toolbar's `Tạo mới` (`#createPartnerTrigger`) or `?create=1` on load; `beforeClose` (`design-system/components/modal.md` § *Behaviour…* item 6) reruns the wizard's own dirty-form confirm on every dismissal route. Steps 2–4 have no `Hủy`: dismissal is via ×, Escape or scrim (USER DECISION; dev note). |

## Known Gaps

- **`#createDrawer` step 3 scrolls ~45px at 1440×790 with both tables empty** (header icon + title + stepper row). Accepted (USER DECISION 2026-09-30): the body is the bounded scroll area and real rows grow the tables anyway.
- **Minimize exists since 2026-09-30 (supersedes "no minimize, fall back to a page-tab").** Dock: `ds/components/dock.md`. `.drawer__expand` and `.drawer__minimize` are AUTHORED, no Figma frame draws either. Drafts are not saved: a reload loses them (dock.md).
- **Angular draft (not confirmed):** inputs `expandable: boolean` (`data-drawer-expandable`), `expanded` two-way (`is-expanded`) and `minimizable: boolean` (`data-drawer-minimizable`); outputs `minimized`, `restored` (a `DockService` holds max 3 drafts, see dock.md); the map in `ds/angular-map.json` is not edited by hand.

- **Whether a picker should preselect at all is unanswered.** The investor picker
  opens with the project's current investor checked, which answers "which company
  am I replacing?" — a question the panel title does not carry — at the cost of a
  picker that can read as already done. The interim rule above (preselect, state
  it in words, keep the primary disabled) removes the defect it caused; whether
  the preselection itself is right is a designer's call.
- **No enter/exit transition.** The source is a static frame; the panel appears
  and disappears. A slide would need a motion token this package does not have.
- ~~**No header close control.**~~ **Closed 2026-10, every drawer.**
  `.drawer__close` — an `×`, `aria-label="Đóng"`, `data-modal-close` — is
  required on every drawer (USER DECISION). **AUTHORED:** 9974:35089 draws no
  header close control, so this stays a gap against the source (designer to
  confirm), no longer against the product. A drawer with a footer keeps its
  `Đóng` / `Hủy` there too; the scrim and `Escape` reach every drawer either way.
- **Panel corners are square.** The source gives no radius for the panel edge;
  square is the assumption, not a read value.
- ~~**Size axis is a single instance.**~~ **Closed 2026-09-16, extended
  2026-09-29.** `.drawer--sm` gives the panel `--utui-drawer-width-sm` (400px),
  read off `Table Setting` (`SFo9P9PCVQiuOk2SqjZYKQ`, `11320:65276`).
  `.drawer--md` gives it `--utui-drawer-width-md` (560px), read 2026-09-29 off
  "Chuyển vị trí thư mục" (MDM Un-Official `TpwqqNqhnFgycttdngXmFA`,
  `6-rename-move.png`) — the folder-move picker, a readonly "current folder"
  field, a search field and a `folder--compact` tree
  (`ds/components/folder.md`), no filter trigger. `--sm` changes only the
  width; `--md` also stacks the toolbar's two fields full width instead of the
  `--sm` row-of-two (R5, review 2026-09-29 — SPEC draws them one above the
  other, not sharing a row). Header, footer, scrim, Escape and focus handling
  stay the same component either way. `max-inline-size` still applies, so
  below `xl` either narrow panel is the viewport minus the gutter exactly as
  the wide one is, and neither needs a responsive rung. **Wired to both
  `screens/du-an/ho-so/chi-tiet.html` and `.../tai-len.html`** — opened from
  `ds/components/doc-detail.md`'s folder chip. **`.drawer--lg`, added 2026-09-30:**
  `--utui-drawer-width-lg` (1341px), width only like `--sm`; first consumer
  `#createDrawer` (contacts table 1298px + 40 padding + 3 border). Authored, no
  Figma frame. `max-inline-size: calc(100vw - gutter)` still applies, so the table fits only at viewport ≥1381px and with no classic vertical scrollbar; below that (1366, 1280) or with a Windows scrollbar the table wrap scrolls sideways (Known gap).
  **`.drawer--fit`, added 2026-10-07 (USER DECISION):** `inline-size: max-content`,
  floor `--utui-drawer-width-sm` (400px), ceiling the usual `max-inline-size`
  (viewport minus gutter); width only. For a panel whose content must not wrap —
  `Thiết lập bảng` (`ds/components/table-settings.md`): column names stay on one
  line and the panel widens instead. Consumers: `screens/du-an/ho-so/danh-sach.html`
  `#settingsDrawer`, `screens/doi-tac/danh-sach.js`. Content inside must be
  `nowrap` (or otherwise bounded) — the panel grows to the widest line up to the
  ceiling. No Figma frame.
- ~~**The `Bộ lọc` trigger in the source toolbar has no panel behind it.**~~
  Resolved in implementation 2026-08-19: `12035:57167` still draws no panel — as
  no `Bộ lọc` instance anywhere in this file does — so the trigger opens the
  package's existing popover (`design-system/components/filter-panel.md`,
  composed per `design-system/patterns/filter.md`) rather than a new surface. The
  fields are derived from the picker's own rows. Still worth a designer's
  confirmation that the drawer's filter is that popover and not something else;
  what is no longer open is whether the control exists.
- **The filter popover inside a drawer relies on stacking-context nesting.**
  `.filter-panel` is `z-index: 50` and `.drawer` is `60`, which only works
  because the overlay establishes a stacking context and the popover is inside
  it. A future popover rendered as a sibling of the overlay would paint behind
  the panel.

- **GAP: native `window.confirm` leave guard.** `#createDrawer`'s `beforeClose` still uses the native `window.confirm` dirty-form prompt (`screens/doi-tac/tao-moi.js`, ~line 708); kept by USER DECISION, not the `.modal` confirm pattern.
