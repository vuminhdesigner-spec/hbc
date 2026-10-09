# Data viewer

## Purpose

Data viewer is one label/value row — the atom of a read-only attribute list.

## Source

| Item | Value |
|---|---|
| Figma file | MDM - V2 (`tS8dUB2qWLc28gZbtj8IIL`) |
| Instance | `Data viewer` in `Thông tin chi tiết`, node `10287:10813` |
| Second instance | `Data viewer` in `Chi tiết dự án`, node `10553:25814` — 37 rows across four cards |
| Third instance | `Data viewer` in `Chủ đầu tư`, node `10840:73734` — 17 rows across two cards, one of them split into two lists |
| Current `Chi tiết dự án` | frames named `Data viewer` in component `13314:69886` — 31 visible rows (hidden rows excluded); supersedes `10553:25814` above. In this frame the rows are plain frames, not instances |
| Reviewed via | Figma REST API, 2026-08-04; re-read 2026-08-12; Figma MCP `get_metadata` 2026-09-23 (no file version returned) |

## Revision History

Every revision to this contract, newest last. The reasoning — what was
re-read, what changed, and why the earlier reading was wrong — lives in
[`docs/revisions/data-viewer.md`](docs/revisions/data-viewer.md). Read a revision when you need to know *why*
a rule above reads the way it does; the rules above are the contract and are
current.

- 2026-08-18
- 2026-08-12 (2)
- 2026-08-12
- 2026-08-04

## Anatomy

- Row: two columns, 16px gap, top-aligned.
- **Label** — fixed-width column, `16/24` Regular `Gray/500`.
- **Value** — fills the remainder, `16/24` **Medium (500)** `Gray/900`, wraps
  freely. The weight is what separates the two columns when the label column is
  narrow; the empty placeholder drops back to Regular, because it is not a value,
  and takes `--utui-color-text-tertiary` — see below.
- Rows in a list are separated by 16px. There are no rules between rows.

### The label column hugs its longest label

**Decided 2026-09-16, closing the question this section carried from 2026-08-19**
(see Known Gaps): the column is `fit-content(40%)`, so every list is exactly as
wide as its own longest label and no wider. The four-step ladder and its
`--utui-data-viewer-label-*` tokens are retired, and so are the
`.data-list--wide` / `--label-md` / `--label-xl` classes that picked from it.

The evidence is a measurement of all six label lists in the package, in Chrome at
1440 — widest rendered label against the 180px step each of them was sitting on:

| List | Widest label | Dead space at 180px |
|---|---|---|
| `Thông tin liên hệ` (partner) | 59px — `Website` | **121px** |
| `Thông tin chung` (company) | 85px — `Tên công ty` | **95px** |
| Partner card 1, left track | 119px — `Tên đối tác (VN)` | **61px** |
| Partner card 1, right track | 132px — `Lĩnh vực cung cấp` | **48px** |
| `Vốn điều lệ` (company) | 130px | **50px** |
| `Thông tin kinh doanh` (company) | 176px — `Đăng ký thay đổi lần thứ` | 4px |

One list of six was correctly sized. The rest carried 48–121px between label and
value, which is what a reader sees as the two columns drifting apart.

`fit-content(40%)` rather than bare `max-content`: the cap is what stops an
unusually long label eating the value column. At a 264px card body the label can
take at most 105px and the value keeps 143px — more than the retired 120px step
left it. Below 1024 a row inside a card stacks anyway (`styles/responsive.css`).

**The two tracks belong to the `<dl>`, not to the row, and that is what keeps the
values in one line.** A grid track is shared only between items of one grid, so
sizing each row's own two columns lets every row hug its own label and staggers
every value to a different x — which is exactly what happened for a few hours on
2026-09-16 before it was caught. `.data-list` is the grid; `.data-viewer` is
`display: contents`, handing its `<dt>` and `<dd>` straight to it. The wrapper
carries no semantics, so removing its box changes nothing in the accessibility
tree — the `<dt>`/`<dd>` are the `<dl>`'s children either way.

The row is restored to a real box in the two arrangements that need it, and both
are the same reason — one grid cannot hold two different gaps:

| Arrangement | Why the row is a box again |
|---|---|
| Stacked (`≤1023` inside a card, and `≤767` everywhere) | The list's single column carries 16px between rows; the row's own grid carries 4px between a label and its value |
| `.data-list--grid` | Several rows sit across the card, so each stacks its own label over its own value rather than filling the list's two tracks |

**The list also packs its rows to the start** (`align-content: start`). A `<dl>`
inside a `.data-split` is a grid item and stretches to the height of the taller
track, and auto-sized rows hand that leftover height back out between themselves:
the partner record's 4-row right track was pitched ~66px against the left track's
40px, which reads as two list densities in one card. Packed to the start, the
spare height sits at the bottom where it belongs.

Verified at 1440 after both fixes: every value in a list resolves to one x; the
label column measures 118 / 132 / 59px on the three partner-record lists — each
its own longest label, to the pixel; and the row pitch is a uniform 40px
(24px line box + the list's 16px gap), rising only where a value or a label wraps
to a second line.

**What the ladder was, kept as the evidence it was decided against.** The source
sized the label column to the card it sits in, and four widths were declared as
`--utui-data-viewer-label-sm|md|lg|xl`:

| Step | Width | Class | Observed in |
|---|---|---|---|
| `sm` | 90px | `.data-list` (default) | `Thông tin chi tiết`, 480px body |
| `md` | 120px | `.data-list--label-md` | `Chi tiết dự án`, 608px body |
| `lg` | 180px | `.data-list--wide` | implementation addition — see Known Gaps |
| `xl` | 220px | `.data-list--label-xl` | `Chi tiết dự án`, 352px body |

A third frame picks a width off the ladder: the `Chủ đầu tư` card (`12035:58097`,
read 2026-08-19) draws **147px** in a 400px card. Mapped to `lg` (180px) rather
than pinned, per the same rule as the 80 / 111 / 143px columns above. Measured in
Chrome at 1440 before choosing: at `md` (120px) both `Mã số doanh nghiệp` and
`Địa chỉ trụ sở chính` wrap to two lines, and 147px is the narrowest column at
which all six labels hold one line — i.e. the frame's number is a measurement of
this exact label set, not a round value. `lg` costs the value column 33px, which
an address wraps through either way; two extra label rows cost a row each.

Pick the step from the **card width and the labels**, not from the number of rows:
`Quy mô dự án` uses the widest column in the narrowest card because its labels
carry their units (`Mật độ dân số (Số người/km2)`).

### Variant — `--cols` (2026-09-24, replacing `--grid` and `.data-split`)

A card whose list has more rows than read comfortably in one column may pack its
rows into side-by-side label/value **pairs**, each pair still label-left like the
default row — unlike the retired `--grid`, nothing stacks. Opt in with
`.data-list--cols` on the `<dl>`; a bare `.data-list` never gains columns on its
own.

- **The pair count comes from the card's own width, read through a named CSS
  container** (`container: section-card / inline-size`, declared on
  `.section-card:has(> .data-list--cols)` so a card without the modifier never
  pays for containment it does not use). This is the package's first container
  query — see Known Gaps in `design-system/components/data-table.md` for the
  standing gap it closes.
- **W = 400px** is the minimum width one pair needs to hold its longest label
  plus a value that does not break mid-word. Two pairs therefore need a body of
  **2W = 800px** and three need **3W = 1200px**. Both numbers are literal in the
  component's `@container` conditions — a container-query condition cannot read
  a custom property, so the arithmetic lives only in this paragraph and in the
  CSS comment beside it.
- Track: `repeat(N, fit-content(calc(40% / N)) minmax(0, 1fr))`, the same 40%
  cap the single-pair row uses, split N ways so each pair still hugs its own
  longest label rather than the list's.
- Every value in the multi-pair tiers takes `padding-inline-end` so the next
  pair's label does not crowd the previous value — one flat rule on
  `.data-viewer__value`, not a `:nth-child` count, because the pair count itself
  changes with the container.
- **Bounded to `>=1024` viewport width as well as the container width**, so the
  stacked tiers below (and the shared ones in `styles/responsive.css`) still win
  under it — a card is never both narrower than its own stack threshold and
  wide enough to justify pairs.
- Source: this is an implementation variant, not a Figma frame. It replaces two
  prior, narrower attempts at the same problem — see below.

**What it replaces.** `--grid` (a full-width card stacking label over value in
4 or 3 columns) and `.data-split` (a full-width card holding two independent
`<dl>`s at a fixed ratio) both existed to fit more rows across a wide card.
Neither had a live consumer after `Thông tin khác` on
`screens/doi-tac/chi-tiet.html` gave up `--grid` for a plain list on 2026-09-16
(recorded below), and both read the card's width from a breakpoint rather than
the box itself — exactly the standing weakness *The label column hugs its own
longest label* section already named. `--cols` is the same idea, read
correctly: a container query instead of a guessed tier, pairs instead of a full
stack, and one rule instead of two variants.

## The empty value is text, not blank

A field with no data renders the literal string **`--`** in
`--utui-color-text-tertiary`, at Regular weight rather than the filled value's
Medium. The row is **not** removed.

**Decision, 2026-09-28.** Replaces the prior `Chưa có dữ liệu` string across
every consumer, including `doi-tac`. `--` is quieter at a glance across a dense
card, but on its own it reads to a screen reader as "dash dash" rather than
naming the state, so the empty `<dd>` wraps the glyph and the announced text in
two children instead of relying on `aria-label` on the `<dd>` itself: `<span
aria-hidden="true">--</span><span class="sr-only-label">Chưa có dữ liệu</span>`
— the visible glyph and the announced text are allowed to differ here because
the glyph's whole job is to be quiet, and the announcement's job is to be
unambiguous.

**Decision, 2026-09-28 (2).** `aria-label` on the `<dd>` itself is dropped in
favour of the `sr-only-label` span above. Same announced string, but the
markup no longer depends on an attribute a consumer can drop silently when it
sets a value dynamically — `textContent`/`innerHTML` writes that forget the
attribute produce a `<dd>` with no accessible name at all, where forgetting to
remove the second `<span>` at least leaves the correct name in place, and
forgetting to add it back on an empty value at least leaves the visible glyph.
`.sr-only-label` is the shared utility in `styles/base.css`.

This matters twice over: it tells a sighted reader the field exists and is
simply unfilled, and it gives a screen reader something to announce instead of
silence. Removing empty rows would also make the record look more complete than
it is, which the completeness banner in `design-system/components/inform.md` exists to
contradict.

**Deviation from the source, 2026-08-18.** The frame draws this string in
`Gray/400` (`#98A2B3`), which is 2.6:1 against the card surface — below AA for
normal text. The sentence above is the reason it cannot be a Gray/400: the
contract deliberately renders an absent value as *content text* so it is
announced, and painting content text below AA gives back the sighted half of
that decision. It is also **not** an input placeholder, so
`--utui-color-text-placeholder` (Neutral/400 `#A3A3A3`, 2.9:1) is the wrong token
as well; that one is reserved for real field placeholders. The value resolves
through `--utui-color-text-tertiary` (Neutral/500 `#737373`, 4.7:1), which is the
ramp the rest of the package uses for quiet text. `.cell-empty` in
`styles/data-table.css` carried the same defect through the placeholder token and
was corrected in the same pass — its contract note belongs in
`design-system/components/data-table.md`.

## Usage

Use for reading attributes. Do not use it for editable fields — that is
`design-system/components/inputs.md` — and do not put actions in the value.

Keep one fact per row. A value that needs its own structure (an address, a
person, a bank) belongs in a tile or entity list instead.

## Accessibility

- Render a list as a `<dl>` with `<dt>`/`<dd>` pairs so label and value are
  programmatically associated. Two loose `<span>`s are not sufficient.
- The empty placeholder must be real text in the DOM: `<span
  aria-hidden="true">--</span><span class="sr-only-label">Chưa có dữ
  liệu</span>` inside the `<dd>`, not an `aria-label` on the `<dd>`, since the
  visible `--` glyph alone does not announce sensibly.
- Never rely on column position alone to convey which is label and which is
  value.

## Code Mapping

| Surface | File |
|---|---|
| Component tokens | None — the label-column ladder (`--utui-data-viewer-label-sm` … `-xl`) is retired; the column hugs its longest label instead (see above) |
| Label colour | `--utui-color-gray-500` (Gray ramp — see Known Gaps) |
| Value colour | `--utui-color-gray-900` (Gray ramp — see Known Gaps) |
| Empty-value colour | `--utui-color-text-tertiary` — **not** `--utui-color-gray-400`, and **not** `--utui-color-text-placeholder` |
| Component CSS | `.data-list`, `.data-list--cols`, `.data-viewer`, `.data-viewer__label/__value`, `--empty` in `styles/data-viewer.css`; the `--cols` container is declared on `.section-card:has(> .data-list--cols)` in the same file |
| Tier rules | `styles/responsive.css` for the stacked tiers; the `--cols` pair count is a `@container` query owned in `styles/data-viewer.css` itself, not here — see Responsive |
| Examples | `screens/doi-tac/chi-tiet.html` — the `Thông tin chung`, `Thông tin liên hệ` and `Thông tin khác` cards carry `--cols`; so do `Vị trí dự án` (was `--grid`) and `Thông tin dự án` in `screens/du-an/chi-tiet.js`. `screens/du-an/ho-so/tai-len.html`, and the rows built in `screens/du-an/ho-so/danh-sach.js` and `screens/du-an/ho-so/chi-tiet.js` use the plain list. `screens/item-detail.html` and `screens/project-investor.html` are gone |

## Responsive

Owned in `styles/responsive.css`, never in a screen bundle:

| Form | `lg`+ | `md` | `sm` |
|---|---|---|---|
| Default list, inside a `.section-card` | side by side | stacks | stacks |
| Default list, elsewhere (modal, drawer) | side by side | side by side | stacks |
| `--cols` | 1–3 pairs, by container width | 1 pair (the variant is `>=1024`-only — see below) | 1 pair |

**Scoped to `.section-card`, because the tier is a proxy for the card's width,
not the viewport's.** Below 1024 the section grid is two equal columns, so every
card is about 312px wide and its body about 264px — a label plus the 16px gap
leaves little enough value width that a wrapping company name reads better
stacked. A list composed somewhere else (the modal on a fixed-width panel, the
upload summary) has no such card to be narrow, so it keeps two columns down to
`sm`. This scoping is also the reasoning the retired label-width ladder used to
carry per step; it now applies uniformly since every list hugs its own label
(see above) rather than picking a width off a ladder.

**`--cols` reads a named CSS container** (`section-card`, on the card that holds
the `<dl>`), not a viewport tier: 1 pair below 800px of card width, 2 from 800,
3 from 1200. The two thresholds are `2W`/`3W` off the variant's 400px minimum
pair width — see the variant section above. The whole rule is wrapped in
`@media (min-width: 1024px)` so the shared stacked tier above still wins under
it; a card that stacks its rows one-per-line never also tries to pair them. This
is the container query the paragraph above gestures at, and the first one this
package has shipped.

## Known Gaps

- An optional **help icon** is authored beside the label and hidden in every
  instance across both frames, so its behaviour (tooltip? popover?) is unknown.
  `design-system/components/tooltip.md` now exists but is title-only and takes
  no author-supplied content, so it does not serve this on its own even once a
  behaviour is picked.
- The `--wide` (180px) step is an implementation addition, not a Figma value —
  the two source frames use 90 / 120 / 220. It is kept because `item-detail` is
  built on it; a designer decision should either adopt it or fold it into the
  120px step.
- ~~**The ladder is not the source's ladder.**~~ **Closed 2026-09-16 — it hugs.**
  `Chủ đầu tư` picks **80 / 111 / 143px**, so across three frames the label column
  took six different widths (80, 90, 111, 120, 143, 220): it was being sized by
  hand per card, not chosen from a scale. This entry put the choice as "either the
  scale is real and the frames should snap to it, or the column is meant to hug
  its longest label and the ladder should be replaced by `max-content`". The
  second was chosen, on the measurement in *The label column hugs its longest
  label* above — the frames' own numbers turned out to be measurements of their
  label sets, which is exactly what a hug reproduces. The mapping that cost
  `Thông tin kinh doanh` 23px of value column is gone with it.
- Two rows in `Chi tiết dự án` are **hidden variants that carry a trailing `link`
  icon** in the value (`Cụm dự án`, `Khu đô thị`, both referencing another
  project). A value that is a reference to another record is a real case with no
  contract: no link colour, no icon placement and no keyboard behaviour are
  specified. Recorded in `design-system/patterns/project-overview.md`.
- The label/value colours use the Gray ramp; see the ramp gap in
  `design-system/components/tab-bar.md`. The **empty** value no longer does — it
  was the one member of that ramp that failed AA, so it was moved to the Neutral
  ramp via `--utui-color-text-tertiary` ahead of the rest. The remaining two are
  a contrast-safe pair, so they wait for the ramp decision rather than being
  migrated one rule at a time.

## Known gap — 2026-08-22 (no two-column grid variant)

The now-retired `--grid` variant (removed 2026-09-24, see `--cols` above)
documented **4 and 3 columns**. The archiving lane needed **two**:
the wireframe draws its `Thông tin hồ sơ` panel as six fields two-up in three rows,
inside a column narrower than the four-column variant assumes.

The consumer was the deleted `chung-chi-tiet-yeu-cau-luu-tru` screen; since the D49
merge of 2026-08-26 it is the `Yêu cầu lưu trữ` rail card on
`screens/du-an/ho-so/chi-tiet.html`.

It shipped one field per line on `.data-list--wide` (180px label — the ladder step
where `Người nhận bản cứng` holds one line) rather than inventing
`.data-list--grid-2`, because a screen bundle authoring a new component variant is a
variant no contract knows about and no other screen can find.

Recorded so the next consumer does not re-derive it: **either `data-viewer` gains a
narrow two-up shape of its own, or the contract states that two-up is out of scope
and narrow panels stack.** Both are fine; the gap is that neither is written down,
so the question is answered per screen. `--cols` does not close this: its
narrowest step needs 800px of card width, far past a 300px rail.

### The narrow rail does not use that construction any more — 2026-08-27d

**This section described markup the screen no longer renders**, which is worse than
describing no markup at all: the rail card is a bare `.data-list`
(`screens/du-an/ho-so/chi-tiet.html`), not `.data-list--wide`, and the
doc-detail stylesheet forks the component's grid inside its rail:

```css
/* ds/styles/doc-detail.css */
.doc-detail__rail .data-viewer {
  grid-template-columns: minmax(0, 1fr);
  gap: var(--utui-spacing-01);
}

.doc-detail__rail .data-list {
  grid-template-columns: minmax(0, 1fr);
}
```

That is the label ABOVE its value, one field per line, in a **300px** track — the
frame's own construction (`12646:27767` draws `Text` at y0 and `Value` at y28), and
what the track can hold: the component's default 90px label column would leave about
190px for `Bộ phận lưu trữ (DC) — Miền Bắc`, and the 180px `--wide` step leaves 120.
Neither ladder step fits, so the rail stacks instead of choosing one.

**The gap, recorded and not decided:** the component has no stacked form. There was
never a right existing shape to reach for — `.data-list--grid .data-viewer` also laid
the LIST out in columns, a full-width card's behaviour and not a 300px rail's — and
as of 2026-09-24 that shape is gone entirely along with the rest of `--grid`. So the
rail forks the rule in a screen file, with no modifier to reach for instead.

Whether `data-viewer` gains a `--stack` variant is a **design-system owner's call**
and is deliberately not taken here — the same standing this section's 2-column
question already has, and a second consumer is not yet the case for a variant. What
is closed is that the fork is now written down in the contract instead of only in the
screen that made it. Owner: DS + design.
