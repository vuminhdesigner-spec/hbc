# Listing Toolbar

## Purpose and ownership

Hàng tìm kiếm + lọc mở đầu vùng nội dung của màn danh sách. Component chỉ sở hữu
**bố cục** giữa các phần (khoảng cách, giãn/co, xuống dòng). Không sở hữu nội bộ
của ô tìm kiếm (`inputs.md` › `.search-field`), nút `Bộ lọc`
(`filter-panel.md` › `.filter-trigger`) hay CTA (`button.md`).

## Source

Figma component `tool-bar`, node `10471:20007` (file `TpwqqNqhnFgycttdngXmFA`),
sync 2026-09-24.

```
tool-bar            flex-col, gap 12, w 1000
├─ Search Panel     flex-row, wrap, gap 24 (cả hai trục), không padding
│  ├─ left          flex-row, gap 16, items-center, không giãn
│  │  ├─ Select Type=Search   400 × 36
│  │  ├─ Filter (Bộ lọc)       prop `filter` = true — 100 × 36
│  │  └─ Button group (view)   prop `viewMode` = true — 2 nút icon, 34px
│  └─ right         flex 1, justify-end, gap 12      prop `ctaGroup` = true
│     └─ CTA (slot, mặc định Button primary) — cao 36
└─ Button group (lọc cấp 2)  prop `filterLevel2` = false — nhóm nút chữ
```

Bản trước lấy `py 12px` từ instance `Search Panel` 10471:20421; component gốc
không có padding, khớp với việc đã bỏ `padding-block` (2026-09-05).

## Anatomy and variants

| Class | Figma | Luật |
|---|---|---|
| `.listing-toolbar` | `Search Panel` | `display: flex; align-items: center; column-gap: --utui-spacing-04`. Không `padding-block`. |
| `.listing-toolbar__search` | `Select` Type=Search | `flex: 0 1 400px; min-width: 0` — gắn lên `.search-field`. |
| `.listing-toolbar__group` | `left` | `display: flex; flex: 0 1 auto; column-gap: --utui-spacing-04; min-width: 0`. Chỉ cần khi hàng có `__actions` và phải wrap nhóm trái như một khối. |
| `.listing-toolbar__actions` | `right` | `flex: 1 1 auto; justify-content: flex-end; column-gap: --utui-spacing-03`; cách khối trái 24px (gap 16 + `margin-inline-start` 8). |
| `.listing-toolbar--wrap` | wrap của `Search Panel` | `flex-wrap: wrap; row-gap: --utui-spacing-06`. Xuống dòng theo nội dung, không theo tier. |
| `.listing-toolbar .filter-trigger > .button` | Filter | `white-space: nowrap`. |
| `.listing-toolbar .search-field`, `.listing-toolbar .button` | Select, Filter, CTA | `min-height: --utui-button-height-sm` (36). Chỉ trong toolbar; form ở chỗ khác vẫn 44. Hàng cao 36. |
| `.listing-toolbar .button-group__item` | Button group (view) | `height: --utui-button-height-sm` (36); `--icon-only` thêm `width` 36 (vuông, thay 48×44 mặc định). Thêm 2026-10-01 — trước đó nhóm view cao 44, lệch hàng. |
| `.listing-toolbar__icon-button` | Không có trong Figma | Nút icon-only vuông trong hàng toolbar (vd. nút "Mở toàn màn hình"). `width: --utui-button-height-sm; padding: 0` — vuông 36 theo hàng control 36; icon 20 là mặc định của `.material-symbols-outlined`. Dùng cùng `.button` (viền/nền mặc định). Thêm 2026-09-28, thay `.metric-toggle` (đã xoá cùng disclosure của metric-item). |

Hàng không có CTA (`ctaGroup` = false) chính là khối `left` đứng một mình: đặt ô
tìm kiếm và `.filter-trigger` là con trực tiếp của `.listing-toolbar`, gap 16 —
không cần `__group`.

## Supported states

Không có state riêng. State thuộc các phần con (`.search-field` focus,
`.filter-trigger` `aria-expanded`).

## Token dependencies

| Vai trò | Token |
|---|---|
| Gap trong khối trái / giữa các phần | `--utui-spacing-04` (16) |
| Gap giữa CTA | `--utui-spacing-03` (12) |
| Khối trái ↔ CTA, row-gap của `--wrap` | `--utui-spacing-06` (24) |
| Rộng ô tìm kiếm | `400px` — literal ghi nhận, chưa có token |
| Cao control trong toolbar | `--utui-button-height-sm` (36) — ghi đè `--utui-field-height`/`--utui-button-height-lg` (44) |

## Usage guidance

- Gắn `.listing-toolbar` lên phần tử **hàng**, cạnh class riêng của màn (không
  thay class màn — JS/CSS màn chọn theo nó).
- **Không dùng `gap` shorthand** trên phần tử mang class của component này: trục
  dọc thuộc riêng `--wrap`. Đổi khoảng ngang bằng `column-gap`.
- Xuống dòng theo tier (vd `.list-search { flex-basis: 100% }` dưới `lg`) là
  việc của màn/pattern `item-listing`, không dùng `--wrap` thay.
- Padding trên/dưới hàng là của màn cung cấp.

## Accessibility requirements

- Hàng hoặc tổ tiên gần nhất là landmark có `aria-label` nói rõ nó tìm/lọc gì
  (vd `aria-label="Thanh công cụ danh sách đối tác"`).
- Wrap không được đổi thứ tự tab: thứ tự DOM = thứ tự nhìn thấy.
- Bàn phím và focus thuộc các phần con.

## Code Mapping

| Surface | File |
|---|---|
| Luật chung | `ds/styles/listing-toolbar.css` |
| Ô tìm kiếm | `.search-field` — `ds/styles/form-field.css` |
| Nút `Bộ lọc` | `.filter-trigger` — `ds/styles/filter-panel.css` |
| Màn dùng | `screens/doi-tac/danh-sach` (có `__actions`). `dia-chi`, `nguoi-lien-he`, `tai-khoan-ngan-hang` từng dùng (chỉ khối trái) trước khi bị gộp vào drawer trên `chi-tiet.html` (MDM-1209, 2026-09-29) — nay `.drawer__toolbar` ghép `.listing-toolbar --wrap` (2026-09-29). Cũng dùng ở `#investorDrawer` (`screens/du-an/chi-tiet`) |

## Known Gaps

- **`Button group` đã có trong `ds/`** (`ds/components/button-group.md`), kể cả
  luật overflow >4 ô, dùng ở `screens/du-an/ho-so/hang-doi.html` (`#worksetGroup`,
  5 ô — vai trò gần với `filterLevel2` hơn `viewMode`). Gap trước ghi "chưa có
  trong ds/" đã lỗi thời.
- **GAP: hàng lọc cấp 2 (`filterLevel2`).** Khung ngoài `tool-bar` là cột gap 12
  chứa `Search Panel` + nhóm nút. `hang-doi.html` dựng khung này screen-local
  (`.docs-filter` trong `hang-doi.css`) thay vì qua `listing-toolbar`; chưa có
  CSS cho khung cột này trong `ds/` — dựng khi có màn thứ hai cần đúng bố cục
  `tool-bar` gốc (Search Panel bên trên, nhóm nút bên dưới, cùng cột).
- **Padding ngang lệch Figma 2px.** Ô tìm kiếm và CTA Figma vẽ `px 14`; `ds/` không có token 14px
  nên giữ padding gốc (search 12, button 16). Nút `Bộ lọc` (`px 16`) khớp.
- **Pointer thô (touch):** control 36 không nới lên 44, cùng lệch với mọi
  `.button--compact` (gap đã ghi ở `pagination.md`).
- **Rộng 400px là literal**, không phải token. Nếu có frame vẽ rộng khác, promote
  thành token thay vì thêm modifier.
- **GAP: không có Figma cho nút "Mở toàn màn hình".** `.listing-toolbar__icon-button`
  tạm dùng `.button` mặc định (viền/nền mặc định), chưa đối chiếu được với frame nào.
- **GAP: không có tooltip cho nút chỉ có icon.** `.listing-toolbar__icon-button`
  tạm chỉ dùng `aria-label` đổi theo trạng thái, chưa có `tooltip.md` gắn vào.
