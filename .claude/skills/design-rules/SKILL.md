---
name: design-rules
description: Luật thiết kế V2 của MDM — Product Profile cố định (desktop-first, B2B dày dữ liệu, UI tiếng Việt, WCAG 2.1 AA), luật visual/layout/component/token và file nào sở hữu sự thật nào trong mdm-design. Nạp trước khi dựng, sửa, review hay đề xuất màn/component/pattern.
---

# Luật thiết kế V2

V2: hệ thiết kế doanh nghiệp điềm tĩnh, chính xác, dày dữ liệu, dựa trên Untitled UI.
Nội dung và hành động rõ; phân cấp tiết chế; trang trí đứng sau nhiệm vụ.

## Product Profile — không suy lại

Chỉ ghi phân loại khi màn **lệch** khỏi bảng này, kèm dòng và lý do.

| Biến | Sản phẩm này |
|---|---|
| Miền | Quản lý dự án xây dựng, nặng hồ sơ và phê duyệt |
| Thiết bị | **Desktop-first.** Không bao giờ mobile-first |
| Người dùng | B2B, vận hành nội bộ, dùng hằng ngày, thường thao tác hàng loạt |
| Vai trò | Vai trò quyết định quyền sửa, không quyết định có thấy bản ghi hay không |
| Giọng | Chuyên nghiệp, điềm tĩnh, đúng sự thật. UI tiếng Việt |
| Mức hệ trọng | Cao: hệ quả pháp lý/kiểm toán. Hành động được ghi lại, không âm thầm đảo ngược |
| Tiếp cận | WCAG 2.1 AA. Bắt buộc dùng được hoàn toàn bằng bàn phím |
| Thuật ngữ | Lấy từ nghiệp vụ, không dịch |

## Visual

- Nền trung tính là mặc định; màu brand chỉ cho hành động quan trọng nhất của màn.
- Info/success/warning/error chỉ mang nghĩa trạng thái thật.
- **Chọn là brand, trạng thái không bao giờ là chọn.** Checkbox/radio/hàng đang chọn
  dùng brand (`--utui-choice-checked-*`); xanh lá là sự thật về bản ghi (`.choice--flag`).
  `ds/components/checkbox.md` § States còn ghi `Green/500` — cũ so với token; token thắng.
- Font `--utui-font-family-body` (Roboto/system-UI), không webfont.
- Phân cấp bằng border và tông nền, không bằng shadow nặng.
- Radius gọn `--utui-radius-md`; pill chỉ cho badge trạng thái và pill lọc.
- Trạng thái không bao giờ chỉ dựa vào màu.

## Layout

- Màn sản phẩm nằm trong `app-shell` với một cột `side-navigation`.
- Danh sách: bộ lọc, bảng, phân trang ở chân (`ds/patterns/item-listing.md`).
- Chi tiết: page header, section nhóm, tab, bảng liên quan (`ds/patterns/item-detail.md`).
- Form: section có tên, lưu/hủy ở chỗ đoán được.
- Gutter và khoảng cách block là token (`--utui-page-gutter-*`, `--utui-page-block-gap`),
  không phải padding riêng của màn.
- Breakpoint: dùng đúng mốc `ds/styles/responsive.css` đang dùng; không thêm mốc mới.
- Mốc container: chỉ khai báo trong contract component sở hữu nó, literal, suy từ một bề rộng
  tối thiểu; luật "không thêm mốc" áp cho viewport.

## Component và token

- Chỉ ghép từ component trong `registry/index.md` và token `--utui-*` trong `ds/tokens/`.
- Thiếu component hoặc token → **gap** trong hand-back, không tự chế, không ghim giá trị cứng.
- Không tạo token semantic trong CSS màn.
- Không `!important`, selector nhân đôi hay inline style để thắng cascade.

## File nào sở hữu gì

| Sự thật | Nằm ở |
|---|---|
| Token (3 tầng) | `ds/tokens/untitled-ui-{primitive,semantic,component}.css` |
| CSS component | `ds/styles/<tên>.css`; `app.css` là barrel — thứ tự import là cascade |
| Hành vi dùng chung | `ds/scripts/*.js` |
| Contract một component | `ds/components/<tên>.md` + `<tên>.json` (`api.modifiers`, `api.parts`) |
| Bố cục trang | `ds/patterns/<tên>.md` — không sở hữu token hay nội tại component |
| Màn | `screens/<entity>/<màn>.{html,css,js}`, dữ liệu mẫu trong `.js` |
| Thứ tự bàn giao | `flows/<flow>.flow.json` → `dist/<flow>.html` (máy sinh) |

Contract còn trích đường dẫn mdm-portal (`design-system/…`, `styles/…`, `screens/du-an/…`)
— là lịch sử; đổi sang `ds/…` khi đọc.

Kiểm: `npm run handoff -- <flow>` (build + verify: lỗi JS, tràn ngang, link, trang trống).
