# Empty state

## Purpose

Khối một vùng chứa hiển thị khi chưa có nội dung (hoặc không có kết quả): minh hoạ,
một câu nêu sự thật, một dòng hướng dẫn, và action giải quyết nó.

## Source

| Item | Value |
|---|---|
| Figma file | OMEU Design System V2 (`SFo9P9PCVQiuOk2SqjZYKQ`) |
| Component | `Empty state`, node `9966:18716` |
| Variant dùng | **`Type=illustration, Size=md`** (`9966:18715`), 512 x 312 |
| Reviewed via | Figma MCP, 2026-10-01 |

**Luật (2026-10-01): chỉ dùng `Type=illustration`.** `Type=icon` (`9966:18714`,
chip 48px) không dùng nữa — không vẽ lại vòng icon, không ghép `.featured-icon`
vào empty state. `Type=illustration lg` (`11420:68345`, 200px, tiêu đề 24/32) chưa
có màn nào cần nên chưa dựng.

## Anatomy

Căn giữa, một cột:

1. **Illustration** — `.empty-illustration`, 152 x 152 (`ds/assets/empty-illustration.svg`,
   export nguyên từ node `9966:18351`). Trang trí, `aria-hidden`. Dính liền khối chữ
   (khoảng trắng nằm sẵn trong SVG).
2. **Title** — `16/24` Semibold, `text-primary`, tối đa 352px. Nêu sự thật.
3. **Supporting text** — `14/20`, `text-tertiary`, cách title 4px, tối đa 352px.
   Nói phải làm gì / vì sao.
4. **Actions** — cách khối chữ 24px (`--utui-empty-page-gap`). Không bắt buộc.

## Variants

| Variant | Class | Where |
|---|---|---|
| Section | `.empty-block` > `.empty-illustration`, `__title`, `__text`, action | Trong section card, table panel, cây/listing. Padding 16px. Con phẳng, không wrapper. |
| Page | `.empty-page` > `.empty-illustration`, `.empty-page__text` (`__title`, `__supporting`), action | Thân cả một màn/tab. Cột 512px, padding khối `--utui-empty-page-padding-y` (160px, bậc md/sm ở `responsive.css`). |
| Parts không có hộp page | `.empty-illustration` + `.empty-page__text` trong vỏ của component khác | `.file-upload__unsupported` (`ds/components/file-upload.md` State C) — pane 600px tự căn giữa. |

```html
<div class="empty-block">
  <span class="empty-illustration" aria-hidden="true"></span>
  <p class="empty-block__title">Chưa có hồ sơ trong danh mục này</p>
  <p class="empty-block__text">Tải lên hồ sơ đầu tiên, hoặc chọn một danh mục khác trong cây danh mục.</p>
  <button class="button" type="button">…</button>
</div>
```

## Usage

- Vùng chứa phải giữ chỗ (section card trong `item-detail`) render khối này thay vì biến mất.
- **Empty** (chưa có gì → action tạo) và **zero-result** (sau tìm kiếm/lọc → action
  "Xóa bộ lọc"/"Xóa từ khóa", button secondary) dùng chung component, **không dùng chung copy**.
- Một action. Vùng chỉ đọc (vd `Các giai đoạn chính` trên chi tiết dự án) không có action.
- Action mở drawer mang `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.

## Accessibility

- Title là mô tả của vùng chứa, không phải heading cạnh tranh với tiêu đề section
  (ngoại lệ: `.empty-page` là thân cả màn thì title được là `<h2>`).
- Illustration `aria-hidden`, không alt.
- Tên action nói rõ tạo cái gì.

## Code Mapping

| Surface | File |
|---|---|
| CSS | `ds/styles/empty-state.css`; token `--utui-empty-illustration-size`, `--utui-empty-text-measure`, `--utui-empty-page-*` |
| Asset | `ds/assets/empty-illustration.svg` (CSS background, build nhúng qua `url()`) |
| Section — có action | `screens/du-an/ho-so/danh-sach.js` `emptyState()` / `gridEmptyState()`; `screens/du-an/chi-tiet.js` `investorEmptyBody()` |
| Section — không action | `screens/du-an/chi-tiet.js` `tableEmptyBody()` |
| Bảng sửa được | `ds/scripts/row-table.js`, `ds/scripts/phase-table.js` `emptyMarkup()` |
| Zero-result | `screens/du-an/danh-sach.js`, `phan-cap.js`, `ho-so/hang-doi.js`, `screens/doi-tac/danh-sach.js`, `chi-tiet.html` |
| Page | `screens/du-an/ho-so/chi-tiet.html` `#previewMissing` (`?id=999999`) |

## Known Gaps

- **Tên `.empty-block`, không phải `.empty-state`** — `.empty-state`/`.error-state`
  cũ còn trong `ds/styles/legacy/detail-and-forms.css`. Hợp nhất là việc sau.
- Một minh hoạ (cloud) cho mọi ngữ cảnh — Figma chỉ có một; cần minh hoạ riêng
  (search, lỗi…) thì phải có export từ design trước.
- `Type=illustration lg` chưa dựng (chưa có consumer).
- `.empty-page` trong track `auto` làm trang tràn ngang — đặt trong track `minmax(0, 1fr)`.
- `--utui-empty-page-padding-y` 160px là token component giá trị cứng (thang spacing dừng ở 64px).
