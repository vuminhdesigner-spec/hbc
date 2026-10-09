# Snack bar

Thanh hành động khi chọn nhiều hàng: `Đang chọn N <danh từ>` + một CTA + menu ⋮ + nút bỏ chọn. Port từ mdm-portal (Figma `Snack Bar`, node `10974:4867`); chỉ phần flow dùng. Khác `toast` (đã xảy ra, tự tắt) và `notification` (kết quả, người dùng đóng): snack bar báo **trạng thái đang giữ** và chỉ rời khi bỏ chọn.

## Anatomy

Message (`role="status"`, chỉ đếm) · gap 64px · CTA (một hành động) · ⋮ (menu mở lên trên) · đóng. Chế độ `dark` mặc định, `--light` cho nền tối.

| Phần | Selector |
|---|---|
| Positioner (bottom-centre, z 35) | `.snack-bar-region`, `--inline`, `--anchored` |
| Bar | `.snack-bar`, `--light` |
| Message / actions / CTA | `.snack-bar__message`, `__actions`, `__cta` |
| Icon / menu | `__icons`, `__icon-button`, `__menu`, `__menu-item`, `__menu-divider` |

## Usage

- Một bar mỗi màn; `setCount(0)` ẩn. Đóng bar = bỏ chọn (`onClear` bỏ tick hàng).
- **Một CTA.** Hành động còn lại vào menu ⋮. Màn hồ sơ: CTA chữ `Chuyển vị trí` (không số) + icon In (`In`); số hồ sơ áp dụng được nằm ở modal kiểm quyền.
- Không đặt hành động không hoàn tác sau CTA mà thiếu modal xác nhận.
- Bar không lấy focus; khi ẩn trả focus về `returnFocus`.
- Kết quả hành động báo bằng `notification` sau khi bar đã ẩn.
- Mặc định bar cố định giữa đáy viewport (`.snack-bar-region`). Bảng có footer dùng `--anchored`: option `anchored: true` + `mount` là container `position: relative` bọc vùng cuộn (trên footer). Bar nổi đè hàng bảng; vùng cuộn thêm `padding-block-end` + `scroll-padding-block-end` = `--utui-snack-bar-clearance` khi bar hiện để hàng cuối và hàng đang focus không bị che. Bar không chiếm layout và không bao giờ che footer.

## Disabled (khác bản mdm-portal)

Bản gốc: "không có trạng thái disabled, không đưa ra hành động không áp dụng". Flow hồ sơ cần hiện nút số 0 kèm lý do (quyền theo từng hồ sơ), nên thêm:

- `bar.setCta(label, reason)` / `bar.setItem(index, label, reason)` / `bar.setIconAction(index, label, reason)` (icon-button: bật thì aria-label và tooltip cùng `label`, ví dụ "In 3 hồ sơ"; tắt thì aria-label "In. <lý do>", tooltip là lý do): có `reason` → `aria-disabled="true"`, `data-tooltip` (xem `tooltip.md` § Lý do vô hiệu) và `aria-label` = `label. reason`. Dùng `aria-disabled`, không dùng `disabled`, để vẫn focus được và hiện tooltip.
- Màu chữ `--utui-snack-bar-disabled` (`-light`), trỏ `--utui-color-text-disabled`, không hover. Chưa có trong Figma; màu trên nền tối cần design xác nhận.

## Adopting it

```js
var bar = OmeuSnackBar.create({
  noun: "hồ sơ",
  cta: { label: "Chuyển vị trí", onSelect: openMove },
  iconActions: [{ label: "In", glyph: "print", onSelect: openPrint }],
  returnFocus: selectAllBox,
  onClear: clearSelection,
});
bar.setCount(n);
```

Global `OmeuSnackBar`. Options: `mount`, `inline`, `anchored`, `mode`, `noun`, `message(count)`, `cta`, `iconActions`, `items`, `clearLabel` (mặc định `Bỏ chọn tất cả`), `moreLabel`, `returnFocus`, `onClear`.

## Accessibility

`role="status"` chỉ trên message; reveal trước khi ghi; nút đóng tên `Bỏ chọn tất cả`; menu `aria-haspopup/expanded/controls`, `role="menu"`/`menuitem`, Escape trả focus về trigger, ↑/↓ đi qua hàng.

## Responsive

Dưới sm (`max-width: 767px`): gap 64px → 16px, message xuống dòng, bar rộng đủ hàng (`responsive.css`). `pointer: coarse`: icon 44px, CTA có vùng bấm 44px. Bố cục sm là quyết định của dev, chưa có Figma.

## Known Gaps

1. Hover/focus do ta thêm, Figma không vẽ. Focus ring `currentColor`.
2. Disabled (trên) không có trong Figma.
3. Menu ⋮ không có `Home`/`End`, `Tab` không bị chặn (cùng hạn chế với các menu khác).
4. Chưa hỗ trợ `forced-colors`; chưa có motion.
5. Menu mở lên trên: chiều cao tối đa theo `100dvh`; menu nhiều hơn 6 hàng nên là drawer.
