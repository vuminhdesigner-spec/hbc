---
name: component-selection
description: Luật biến một yêu cầu thành kế hoạch component — màn thuộc pattern nào, mỗi vùng dùng component nào trong ds/, modifier nào, và chỗ nào là gap. Nạp trước khi dựng màn từ yêu cầu/Figma, khi component-planner chạy, hoặc khi được hỏi "cái này dùng component nào".
---

# Chọn component — yêu cầu → kế hoạch

Quyết một lần, viết thành kế hoạch, rồi mới dựng — để `fe-dev` thực thi quyết định
thay vì tự quyết, và reviewer có cái để đối chiếu. Bảng dưới lấy từ Purpose/Usage của
contract; lệch với contract thì contract thắng, file này cũ — nói ra.

## Luật

1. **Pattern → vùng → component**, đúng thứ tự.
2. **Mỗi vùng đúng một contract trong `ds/components/`, hoặc là gap.** Không có
   lựa chọn thứ ba "CSS riêng của màn".
3. **Modifier chỉ tồn tại nếu `ds/components/<tên>.json › api.modifiers` liệt kê.**
4. **Tái dùng trước.** Một mode/cột/bộ lọc trên màn đã có thắng màn mới; màn đã ghép
   pattern là mẫu để chép.
5. **Hai component cùng hợp → câu "not X" của contract quyết.**

## Bước 1 — Pattern

| Việc của màn | Pattern | Màn mẫu |
|---|---|---|
| Quét, tìm, lọc một tập bản ghi rồi vào chi tiết | `ds/patterns/item-listing.md` | `screens/doi-tac/danh-sach` |
| Đọc một bản ghi có ≥ 3 nhóm thuộc tính | `ds/patterns/item-detail.md` | `screens/doi-tac/chi-tiet` |
| Lọc theo trường dưới `Bộ lọc` | `ds/patterns/filter.md` | `screens/doi-tac/danh-sach` |
| Tạo bản ghi nhiều bước (3–5) | `ds/patterns/wizard-drawer.md` | `screens/doi-tac/danh-sach` `#createDrawer` |
| Tạo/sửa bản ghi cả trang | **Không có pattern** — gap. Section có tên, lưu/hủy đoán được | — |
| Dashboard | **Không có pattern**, không có chart — gap | — |

Mọi màn nằm trong `app-shell` + một `side-navigation`; `page-tab` thuộc shell.

## Bước 2 — Component theo nhu cầu

Chỉ gồm component có trong `ds/components/`.

| Nhu cầu | Dùng | Không |
|---|---|---|
| Đi giữa module/route | `side-navigation` | không cho hành động trang |
| Mở nhiều bản ghi cùng lúc | `page-tab` (của shell) | không cho section của một trang |
| View anh em của một bản ghi | `tab-bar` | không phải chuỗi bước |
| Nhảy tới section trên trang dài | `anchor-nav` | không phải bộ lọc, không ẩn gì |
| Qua trang tập bản ghi | `pagination` | không cho wizard |
| Vị trí trong tác vụ 3–5 bước | `progress-steps` | không phải thanh % |
| Bản ghi so sánh được, sort, chọn, hành động hàng | `data-table` | không dùng card |
| Hàng tìm + lọc trên danh sách | `listing-toolbar` + `filter-panel` | không đặt hành động bản ghi trong bộ lọc |
| Chọn cột bảng hiển thị | `table-settings` | không phải bộ lọc |
| Chuỗi bị cắt (`Giới hạn ký tự`) cần xem đầy đủ | `tooltip` (`data-tooltip-overflow`) | không thay label/control, không chứa nội dung bắt buộc, không dùng `title` |
| Thứ có tên gắn vào bản ghi (liên hệ, tài khoản) | `entity-row` | cần cột/hành động → `data-table` |
| File đính kèm, tóm tắt chỉ đọc | `attachment-list` | không phải upload |
| Nhận file mới | `file-upload` | — |
| Một sự thật chỉ đọc | `data-viewer` | sửa được → `inputs` |
| Nhập có nhãn, gợi ý, validation | `inputs` | — |
| Chọn từ danh sách (mọi dropdown) | `select` | — |
| Hàng/tuỳ chọn này bật? · Chọn một trong các | `checkbox` (gồm radio) | bật/tắt cả vùng → `toggle` |
| Bật/tắt cả một vùng form | `toggle` | không phải giá trị boolean lưu |
| Đọc ngắn, xác nhận, form nhỏ trên trang | `modal` | bảng rộng/form dài → `drawer` |
| Picker hoặc form dài trả giá trị về trang | `drawer` | — |
| Báo kết quả / cảnh báo / lỗi cấp trang | `notification` | 4 tone; success/info tự đóng sau 5s nếu không có CTA |
| Vùng chứa chưa có gì | `empty-state` | lọc không ra là copy khác |
| Danh tính trang, hành động chính | `page-header` | không cho tiêu đề modal |
| Đầu một section card | `section-header` | không phải heading trang |
| Trạng thái, số đếm, mã | `badge` | không đứng một mình, không là hành động |
| Neo thị giác của section | `featured-icon` | không phải trạng thái |
| 3–5 ô số đếm trên danh sách | `metric-item` | — |
| Của ai | `avatar` | không thay tên |

## Bước 3 — Modifier

```bash
node -e 'console.log(JSON.parse(require("fs").readFileSync("ds/components/<tên>.json","utf8")).api)'
```

Contract mô tả mà JSON không liệt kê → "đặc tả, chưa dựng", ghi trong kế hoạch.
`checkbox`, `section-header`, `table-settings` chỉ có `.md` (không `.json`, không có trong
`registry/index.md`) — mục Variants của contract là danh sách duy nhất.

## Bước 4 — Gap

| Thiếu | Fallback |
|---|---|
| Date picker (`inputs.md` Known Gaps) | select trên các ngày dữ liệu có |
| Breadcrumbs, button-group, folder, snack-bar, inform, dashboard-kpi, chart | có ở mdm-portal, chưa port → gap; port theo luật 3 CLAUDE.md chỉ khi được yêu cầu |
| Pattern form cả trang | gap; wizard nhiều bước → `ds/patterns/wizard-drawer.md` |

Tìm trước khi kết luận: `grep -il '<tên control>' ds/components/*.md` — có thể tồn tại dưới tên khác.

## Kế hoạch

```text
| # | Vùng | Yêu cầu (nguồn#dòng) | Contract | Modifier | Quyết định |
|---|---|---|---|---|---|
| 1 | Toolbar | ticket#2 | listing-toolbar | --wrap | reuse doi-tac/danh-sach |
| 2 | Lọc Ngày tạo | ticket#5 | GAP: date picker | select trên ngày mẫu | record gap |
```

`Quyết định`: `reuse <màn>`, `new instance`, `record gap`, hoặc `needs decision: <câu hỏi>`
(chặn vùng đó, không chặn cả màn). Tự kiểm: mọi contract có file trong `ds/components/`,
mọi modifier có trong `.json` — không có tool `plan:check` ở repo này.
