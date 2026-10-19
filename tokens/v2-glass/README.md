# Token v2-glass — W1 hướng kính nhẹ (bản 38, 2026-10-16)

Bộ token chạy song song với bộ chính. `app/src/index.css` và `tokens/*.json` ở thư mục cha **chưa đổi**.
Khi chốt hướng này mới thay bộ chính: sửa `index.css` theo `theme.css`, chép các file JSON lên, rồi cập nhật phần màu đã chốt trong CLAUDE.md.

Nguồn: artifact UI W1 https://claude.ai/artifact/TVPSYk5eKRYcDvW3NLHjED (bản 38). File JSON được sinh tự động từ phần CSS của artifact, không gõ tay.

## File

| File | Nội dung |
|---|---|
| `semantic.light.tokens.json`, `semantic.dark.tokens.json` | DTCG cho Figma Variables. Tên khoá shadcn giữ đúng như bộ chính, cộng thêm 7 nhóm mở rộng. |
| `theme.css` | Cùng các giá trị viết dạng CSS variables (`:root` và `.dark`), kèm shadow, radius, blur. |

Màu có độ trong suốt được ghi dạng hex 8 ký tự `#rrggbbaa`.

## Khác bộ chính

- **Nền và card kính:**
  - Nền màn là xám ngả xanh lá rất nhẹ, gradient từ `glass.canvas-from` sang `glass.canvas-to`.
  - Card là trắng mờ, gradient từ `card` sang `glass.card-to`, có viền `glass.card-edge` và làm nhoè nền phía sau 16 px.
- **CTA:** gradient xanh thương hiệu từ `cta.from` (#1f7d4c) sang `cta.to` (#106138), chữ trắng, glow `--shadow-glow`. Dùng cho nút chính, tab đang chọn và mục đang chọn trên menu.
- **Màu đồ thị:**

  | Token | Chuỗi | Màu |
  |---|---|---|
  | `chart-1` | Điện | vàng chanh #fce526 |
  | `chart-2` | Nước | xanh dương #0a7fe6 |
  | `chart-3` | Hơi | xanh lá #0e9f3e |
  | `chart-5` | SEC | xanh thương hiệu #106138 |
  | `chart-ext.volume` | Cột sản lượng | xám trung tính |
  | `chart-ext.chart-1-deep` | Điểm cuối gradient thanh xếp hạng Điện | vàng đậm #f2bf00 (sáng và tối như nhau) |

  Vàng điện chỉ đạt tương phản khoảng 1,3:1 trên nền sáng và không có viền bọc (người dùng quyết định). Số liệu phải có nhãn, tooltip hoặc bảng đi kèm. Icon đặt trên nền vàng dùng màu `chart-ext.chart-1-foreground`.
- **Trạng thái:**
  - Badge cảnh báo là nền đặc `status.warning-solid` (#f97316) với chữ trắng, tương phản khoảng 2,8:1, chưa đạt AA cho chữ 10 px (người dùng quyết định).
  - Badge vượt là `status.destructive-solid` (#dc2626) với chữ trắng.
  - Thanh SEC dùng gradient 4 điểm `risk.good`, `risk.caution`, `risk.warning`, `risk.critical`.
- **Thẻ SEC:** nền gradient xanh lá nhạt từ `kpi-hero.from` sang `kpi-hero.to`.
- **Menu:** nền kính `sidebar`. Khi mở rộng, menu nổi trên nội dung với nền `sidebar-ext.open` và lớp phủ `glass.scrim`.
- **Dark mode:** nền xám than chỉ ám xanh lá rất nhẹ. Bộ chính đậm xanh hơn, người dùng thấy nặng nên đã giảm.

## Chưa xử lý (mock chưa đụng tới)

- **Còn xanh dương:** `ring`, `sidebar-ring` (#2f74c0), `accent` và `accent-foreground` (nền dòng phân bổ đang chọn), `chart-ext.track`, `border`, `input`.
- **Giữ nguyên từ bộ chính:** `highlight*`, `success`.

## Không phải Figma Variable

Figma Variables không lưu được shadow, gradient và blur, nên các giá trị này nằm trong `theme.css` và cần dựng tay trong Figma:
- **Effect style:** shadow (`--shadow-card`, `--shadow-pill`, `--shadow-glow`), blur 16 / 14 px.
- **Gradient:** dựng từ cặp token `from`/`to` (`cta`, `glass`, `kpi-hero`) và 4 điểm `risk`.
- **Radius:** card 18, ô bên trong 12, pill 999.
