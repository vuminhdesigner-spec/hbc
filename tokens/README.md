# Token Base: 3 layer

Bộ token chuẩn của Base. Phong cách kính nhẹ chốt ngày 2026-10-22 theo W1 bản 38. Ngày 2026-10-22 bộ token được chia thành 3 layer.

**Nguồn duy nhất là `app/src/index.css`.** Các file JSON trong thư mục này sinh tự động bằng lệnh `node tools/gen_tokens.mjs`, không sửa tay. Muốn đổi giá trị thì sửa `index.css` rồi chạy lại lệnh.

## 3 layer

| Layer | Trong `index.css` | Figma collection | Mode | Ví dụ |
|---|---|---|---|---|
| **primitive**: giá trị gốc | khối `Layer 1 · primitive` (`:root`) | `primitive` | value | `--green-700: #106138` → `color/green/700` |
| **semantic**: vai trò | khối `Layer 2 · semantic` (`:root` và `.dark`); chữ khai trong `@theme` | `semantic` | light / dark | `--primary: var(--green-700)` → `color/primary` |
| **component**: theo component | khối `Layer 3 · component` (`:root`) | `component` | value (tự theo semantic) | `--button-primary-bg-from: var(--cta-from)` → `color/button/primary-bg-from` |

**Luật trỏ:**
- semantic chỉ trỏ vào primitive.
- component chỉ trỏ vào semantic.
- Màn và component shadcn chỉ dùng semantic hoặc component, không dùng primitive.
- Tên khoá shadcn (`background`, `card`, `primary`…) giữ nguyên, nên component shadcn không phải sửa.

**Cách đặt tên:**
- Mỗi collection chia 3 nhóm `color/`, `size/`, `typography/`.
- Mỗi token mang tên biến CSS trong `$extensions["com.habeco.css"]`. Tên này cũng là code syntax WEB của variable trong Figma.

## File

| File | Nội dung |
|---|---|
| `primitive.tokens.json` | **color:** các thang 50–950 `green` (thương hiệu), `leaf` (xanh dữ liệu: hơi, đạt), `gray` (trung tính ngả xanh, có thêm bậc 150 / 850 / 925 / 975 cho nền tối), `slate`, `blue`, `yellow`, `gold`, `orange`, `red`; cộng `brand-red/500`, `white`, `black`, và các màu trong suốt `*-alpha/<phần trăm>`.<br>**size:** px 0–64 và 999.<br>**typography:** `font-size/<px>`, `line-height/<px>`, `font-weight/400–700`, `font-family/be-vietnam-pro`. |
| `semantic.light.tokens.json`, `semantic.dark.tokens.json` | **color:** khoá shadcn và 7 nhóm mở rộng (`glass`, `cta`, `kpi-hero`, `status`, `risk`, `chart-ext`, `sidebar-ext`).<br>**size:** `radius/*` (thang shadcn tính từ `radius/base` 10 px, cộng `card` 18, `inner` 12, `pill` 999), `spacing/<bước Tailwind>` (`3_5` nghĩa là `p-3.5`, vì Figma không cho dấu chấm trong tên), `blur/*`, `control/xs·sm·md·lg` (16 / 28 / 32 / 36, theo thang shadcn base-nova `h-7` / `h-8` / `h-9`, lưới 4 px, chốt 2026-10-24), `layout/*` (menu 64 / 264, header 56, thanh lọc 52, lề 24, dòng bảng 40, lề mobile 16, thanh tab 64, vùng an toàn đáy 24), `icon/sm·md` (14 / 16). Các số đo khác lấy từ W1 bản 38. Line-height làm tròn về lưới 4 px: body 13/20, kpi 26/32. Bước đệm nửa (6, 10, 14, 18) vẫn đúng thang Tailwind/shadcn.<br>**typography:** `<cỡ>/font-size`, `<cỡ>/line-height` (3xs, 2xs, xs, body, sm, base, lg, xl, 2xl, kpi, display 40/48 cho tiêu đề tài liệu), `weight/*`, `family/sans`. |
| `component.tokens.json` | button, input (dùng cho cả select), card, kpi-card, badge, tabs, pill, menu (menu trái), table, tooltip, sheet (ngăn kéo và hộp thoại), chart, sec-bar |
| `effects.tokens.json` | Đổ bóng `card`, `pill`, `glow`, bản sáng và tối. Figma lưu thành Effect style `light/…` và `dark/…`. |

## Thang primitive: neo và nắn

- **Neo, giữ đúng mã:**
  - Xanh thương hiệu: #106138, CTA #1f7d4c, #5fae7f, #74c091.
  - Đồ thị: vàng điện #fce526 và #f2bf00, nước #0a7fe6 và #2f93f0, hơi #0e9f3e và #22b04c.
  - Badge: #f97316, #dc2626.
  - Nền và chữ hai mode.
- **Bậc còn thiếu:** nội suy theo OKLCH.
- **Màu nắn về bậc gần nhất (2026-10-22):** khoảng cách màu OKLab ≤ 0,031, tương phản đổi không quá 0,25.

| Token | Mode | Trước | Sau |
|---|---|---|---|
| `glass/canvas-to` | light | #f6f7f5 | gray/50 #f5f6f5 |
| `glass/card-to` | light | #f8fcffcc | white-alpha/80 |
| `sidebar-ext/open` | light | #fafcfaf7 | white-alpha/97 |
| `risk/good` | light | #3bb54a | leaf/500 #22b04c |
| `risk/caution` | light | #f2c21b | yellow/300 #f2bf00 |
| `chart-ext/track` | light | #e3edf6 | blue/100 #e3effb |
| `card` | dark | #1c221fd6 | gray-925-alpha/84 |
| `popover` | dark | #1a211d | gray/925 #1a221d |
| `accent-foreground` | dark | #eaf0eb | gray/150 #e5efe7 |
| `highlight-border` | dark | #3c5a2a | leaf/800 #1c5c2a |
| `warning`, `risk/warning` | dark | #f27a3a | orange/500 #f97316 |
| `glass/canvas-to` | dark | #0e1311 | gray/975 #0d110f |
| `glass/card-to` | dark | #151b18c7 | gray-950-alpha/78 |
| `kpi-hero/from` | dark | #18261d | gray/925 #1a221d |
| `risk/caution` | dark | #e8bb2a | yellow/300 #f2bf00 |
| `chart-ext/track` | dark | #1e2621 | gray/900 #1c2a22 |
| `sidebar-ext/open` | dark | #131916f7 | gray-950-alpha/97 |

## Điểm chính

- **Nền và card kính:**
  - Nền màn là gradient từ `glass/canvas-from` sang `glass/canvas-to`.
  - Card là gradient từ `card` sang `glass/card-to`, viền `glass/card-edge`, làm nhoè nền phía sau 16 px.
- **CTA:** gradient từ `cta/from` sang `cta/to`, chữ `cta/foreground`, kèm glow. Dùng cho nút chính, tab đang chọn và mục menu đang chọn. Các token component `button/primary-*`, `tabs/active-*` và `menu/active-*` cùng trỏ vào CTA.
- **Màu đồ thị:**
  - Semantic: `chart-1` điện, `chart-2` nước, `chart-3` hơi, `chart-4` kỳ so sánh, `chart-5` SEC hoặc một chuỗi chung.
  - Component đặt tên theo nghĩa: `chart/electricity`, `chart/water`, `chart/steam`, `chart/comparison`, `chart/sec`, `chart/volume`, `chart/track`, `chart/axis`, `chart/grid`.
- **Trạng thái:**
  - "Đạt" không tô màu.
  - "Cảnh báo" dùng `badge/warning-*`, trỏ vào `status/warning-solid`.
  - "Vượt" dùng `badge/destructive-*`.
  - Luôn kèm icon và nhãn.
  - Thanh SEC dùng 4 điểm `sec-bar/*`, trỏ vào `risk/*`.

## Ngoại lệ tương phản (đã quyết, giữ nguyên)

- **Chữ trắng trên badge cảnh báo:** khoảng 2,8:1, chưa đạt AA cho chữ nhỏ.
- **`chart-4` (kỳ so sánh) trên card ở light:** 2,99:1, thiếu một chút so với ngưỡng 3:1 cho nét đồ thị. Giữ nguyên #8a96a1 (quyết định 2026-10-22).
- **Vàng điện `chart-1` trên nền sáng:** khoảng 1,3:1, không có viền bọc. Số liệu Điện luôn phải có nhãn, tooltip hoặc bảng đi kèm. Icon đặt trên nền vàng dùng `chart/electricity-on`.

## Chưa xử lý

- **Còn xanh dương:** `ring` và `sidebar-ring`, `accent` và `accent-foreground` (light), `chart-ext/track` (light), `border`, `input`.
- **Giữ từ hướng A:** `highlight*`, `success`.
- **Avatar:** dùng chung `control/sm` (28 px), không có token riêng (quyết định 2026-10-24).
- **Kích thước còn gõ số trong Figma (chưa thành token):** icon trong Badge 10 px, công tắc 32 × 18, ô icon trên KPI card 26 px, chiều rộng ngăn kéo 480 / hộp thoại 420 / thông báo 360.

## Không phải Figma Variable

- **Gradient:** dựng từ cặp `from`/`to`.
- **Đổ bóng:** Effect style `light/card`, `light/pill`, `light/glow` và bản `dark/…`.
- **Làm nhoè nền:** Effect style `blur/glass` và `blur/sidebar`, gắn variable `size/blur/*`.
