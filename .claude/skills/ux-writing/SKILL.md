---
name: ux-writing
description: Luật câu chữ UI tiếng Việt của MDM — nhãn, nút, empty state, validation, lỗi, xác nhận, trạng thái. Nạp khi viết hoặc review bất kỳ chuỗi hiển thị nào trong screens/ hay khi ui-ux-reviewer gặp finding về copy.
---

# UX Writing — MDM

Giọng và người dùng: Product Profile trong skill `design-rules`. **Màn đã có là style
guide.** Mẫu dưới đây đọc từ mdm-portal ngày 2026-09-23; khi lệch với `screens/` của
repo này, grep và theo số đông, rồi ghi rõ trong báo cáo.

## Luật không được phá

**Không đặt thuật ngữ mới.** Trạng thái, vai trò, trường, loại tài liệu chỉ có một tên —
tên trong ticket hoặc màn đã có. Trước khi viết nhãn:

```bash
grep -rhoE '<từ hoặc gốc từ>[^<"]{0,30}' screens | sort | uniq -c | sort -rn
```

Không có kết quả → thuật ngữ mới → câu hỏi cho PO, ghi `cần xác nhận`, không tự chọn từ đồng nghĩa.

## Mẫu đang dùng

| Vai trò | Mẫu | Ví dụ |
|---|---|---|
| Hành động chính/phụ | Động từ, hoặc động từ + đối tượng khi view có nhiều loại. Sentence case | `Lưu`, `Thêm địa chỉ`, `Tải lên`, `Chỉnh sửa` |
| Hành động kép | Nêu cả hai bước theo thứ tự | `Lưu và gửi phê duyệt` |
| Đóng/huỷ | Chép theo màn anh em gần nhất | `Đóng`, `Hủy`, `Bỏ thay đổi` |
| Phá huỷ | Động từ + đối tượng | `Xóa địa chỉ` |
| Xác nhận không hoàn tác | Nút nói rõ hệ quả | `Lưu trữ ngay, không hoàn tác` |
| Tiêu đề dialog xác nhận | Hành động dạng câu hỏi, có đối tượng | `Xóa địa chỉ?`, `Bỏ thay đổi?` |
| Thành công | `Đã` + động từ + đối tượng | `Đã lưu địa chỉ` |
| Thành công hoàn tác được | Dòng thành công + `[Hoàn tác]` | `Đã xóa Tiền dự án. [Hoàn tác]` |
| Đang xử lý | `Đang` + động từ + `…` | `Đang lưu…` |
| Trống — chưa có gì | `Chưa có` + đối tượng | `Chưa có người liên hệ` |
| Trống — lọc không ra | `Không tìm thấy` + đối tượng + `phù hợp` | `Không tìm thấy công ty phù hợp` |
| Trống — không có quyền | Nói là quyền, không phải vắng | `Chưa có quyền xem thông tin này` |
| Ô trống có lý do | `Chưa có — <lý do>` / `Không có — <lý do>` | `Chưa có — DC chưa nhận bàn giao` |
| Bắt buộc | `Vui lòng nhập`/`Vui lòng chọn` + nhãn của trường | `Vui lòng nhập Ngày bắt đầu.` |
| Sai định dạng | Trường + `không hợp lệ` + định dạng trong ngoặc | `… không hợp lệ (dd/mm/yyyy).` |
| Giới hạn | Luật dạng con số | `tối đa 10MB` |
| Lưu thất bại | `Không thể` + hành động + `. Thử lại.` | `Không thể lưu địa chỉ. Thử lại.` |
| Tải thất bại | `Không tải được` + đối tượng | `Không tải được danh sách công ty` |

**Trạng thái** lấy nguyên văn từ quy trình; trạng thái ghép giữ dấu ` - `
(`Chờ nhận bàn giao`). Không rút gọn ở một màn — đọc khác nhau là hai trạng thái.

## Luật

- Câu chữ phục vụ nhiệm vụ hiện tại và chỉ bước tiếp; lỗi nói phải làm gì.
- Sentence case; mã (`YC-0148`), vai trò (`DC`, `PTDA`) giữ cách viết riêng.
- Không từ nội bộ trên UI: node id, tên bảng, tên entity tiếng Anh.
- Dữ liệu mẫu (tên, mã, file) không phải copy — không "sửa", không thêm giá trị giống bản ghi thật.
- Không bịa luật nghiệp vụ trong copy (ngưỡng, hạn, người phụ trách) — để trống slot và hỏi.

## Số & định dạng

Số hiển thị theo vi-VN: dấu `.` phân nghìn, dấu `,` phân thập phân
(`5.000.000.000 VNĐ`, `12,5%`). **Ngoại lệ: Kinh độ/Vĩ độ giữ dấu chấm thập
phân** (`10.7769, 106.7009`) — đây là chuẩn GIS, số phải dán được thẳng sang
bản đồ/công cụ toạ độ mà không cần đổi dấu. Không đổi giá trị số, chỉ đổi cách
hiển thị.

## Mâu thuẫn đang tồn tại — báo, không tự giải

- `Thử lại` vs `Tải lại` cho thử lại sau lỗi tải (cả hai có trong `screens/`).
- Dòng thành công có/không dấu chấm cuối.
- Nhãn đóng `Đóng` / `Hủy` / `Bỏ thay đổi` chưa có luật bề mặt nào dùng nhãn nào.

## Đầu ra

```text
| Vị trí (file:line) | Hiện tại | Đề xuất | Mẫu / lý do |
|---|---|---|---|
```

Chuỗi chính xác dev dán được; nói rõ dòng nào theo mẫu, dòng nào cần PO quyết.
