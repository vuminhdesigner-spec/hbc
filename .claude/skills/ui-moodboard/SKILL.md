---
name: ui-moodboard
description: Research và trình bày các hướng UI dưới dạng moodboard trực quan (artifact HTML) — mỗi phương án vẽ lại bằng dữ liệu thật của flow MDM, kèm thông số, độ hợp, bảng so sánh, nguồn và đề xuất, rồi hỏi chọn bằng AskUserQuestion. Nạp khi được hỏi "nên trình bày X thế nào", "research UI/moodboard cho Y", khi so sánh ≥ 3 hướng bố cục/component, hoặc khi component-planner trả về needs-decision về hình thức hiển thị.
---

# UI moodboard — MDM

Người dùng chọn phương án bằng mắt, không bằng danh sách chữ. Moodboard là **công cụ quyết
định**, không phải sản phẩm bàn giao: không đưa vào `ds/`, `screens/` hay `dist/`.
Mẫu đã duyệt: `mau-cay-menu.html` (9 kiểu cây menu + nền stage, 2026-10-02).

## Khi nào dùng / không dùng

- Dùng: câu hỏi hình thức (cây, bảng, form, nav, nền, mật độ) có ≥ 3 hướng hợp lý; yêu cầu
  "research", "moodboard", "tham khảo các hệ thống khác".
- Không dùng: chỉ 2 phương án đơn giản (AskUserQuestion có `preview` là đủ); sửa copy/một class;
  câu hỏi đã có luật trong `design-rules`/contract `ds/` trả lời.

## Quy trình

1. **Chốt câu hỏi và dữ liệu mẫu.** Một câu hỏi thiết kế duy nhất. Lấy **một** đoạn dữ liệu
   thật từ `flows/*.flow.json` / `screens/` (tên màn, luồng, trạng thái, nhãn tiếng Việt thật)
   — mọi thẻ dùng cùng đoạn này để so sánh công bằng. Không lorem, không bịa (luật 5).
2. **Research có nguồn.** WebSearch/WebFetch tài liệu chính thức của design system
   (Carbon, Atlassian, Material, Cloudscape, Fluent…) để lấy số thật: chiều cao dòng, thụt,
   cỡ, hành vi. Số không có nguồn → ghi "ước lượng". Cuối trang liệt kê nguồn có link.
3. **Mỗi phương án một thẻ**, gồm:
   - Tên dạng **"Kiểu <hệ thống>"** — vẽ lại bằng HTML/CSS, **không** ảnh chụp, logo hay
     nhận diện thương hiệu.
   - Mock nhỏ, tương tác tối thiểu nếu hành vi là điểm khác biệt (vd. hover đổi icon).
   - Thông số: dòng, thụt/khoảng cách, dấu hiệu phân cấp/trạng thái, mục đang chọn.
   - **Độ hợp với MDM** (Rất hợp / Hợp một phần / Ít hợp) + một câu lý do theo Product
     Profile trong `design-rules` (desktop-first, B2B dày dữ liệu, tiếng Việt có dấu, WCAG AA).
   - Luôn có thẻ **"Hiện tại"** (đang dùng trong repo) và một thẻ **"Đề xuất cho MDM"** (lai,
     giữ cái đang tốt).
4. **Bảng so sánh** một dòng/phương án, cùng các cột thông số.
5. **Rút ra + đề xuất**: 3–5 gạch đầu dòng, nêu token `--utui-*` sẽ dùng nếu dựng thật
   (kiểm tên trong `ds/tokens/*.css`), gap nếu thiếu token/component.
6. **Publish artifact** (quickstart → plain page; `icon` một từ chung). Trả link + 3–4 dòng
   tóm tắt trong chat, rồi **AskUserQuestion**: phương án đề xuất đặt đầu, gắn
   "(Recommended)"; mỗi câu hỏi độc lập tối đa 4. Bị từ chối/Esc thì dừng.
7. Lưu bản nguồn vào scratchpad; nếu người dùng muốn giữ làm mẫu, chép vào thư mục skill này.

## Luật trình bày

- Trang tiếng Việt, đọc được ở 400px, hai theme (token màu trên `:root` + dark).
- Font hỗ trợ tiếng Việt (vd. Be Vietnam Pro + JetBrains Mono); icon Material Symbols
  (bộ của `ds/`) cho mock khi phương án cần icon.
- Màu trong mock là minh hoạ, không phải token MDM — phần "đề xuất" mới nêu token thật.
- Một trang một câu hỏi lớn; câu hỏi phụ liên quan (vd. nền stage khi bàn về sidebar) được
  thêm một mục riêng ở cuối.
- Không kết luận thay người dùng: đề xuất rõ ràng, nhưng quyết định qua AskUserQuestion.

## Bàn giao sau khi chọn

Ghi phương án đã chọn vào kế hoạch (planner) hoặc dựng thẳng nếu là viewer/tooling; màn mới
hoặc đổi bố cục vẫn đi planner → fe-dev → reviewer theo CLAUDE.md.
