# Inform

Thông báo **tĩnh theo ngữ cảnh**: một điều kiện đang đứng yên trong vùng nội dung (ví dụ "m/N hồ sơ chưa có quyền"). Khác `notification` (kết quả tạm thời, hiện rồi đóng) và `snack-bar` (trạng thái chọn). Hiện sẵn khi vùng chứa mở, không aria-live.

## Source

| Item | Value |
|---|---|
| Figma | OMEU Design System V2, `SFo9P9PCVQiuOk2SqjZYKQ`, frame `Inform` `11297:36733`; variant `Color` = Brand `11297:36734`, Gray `11297:36745`, Error `11297:36767`, Warning `11297:36778`, Success `11297:36839` |
| Read | Spec do coordinator đọc từ `get_design_context` (node Warning); chưa đọc lại trực tiếp |
| Code | `ds/styles/inform.css`, tokens `--utui-inform-*` |
| Không phải | Bản `inform` trong mdm-portal (banner hoàn thiện hồ sơ, radial wash) là component KHÁC. "Completeness banner" của `item-detail` vẫn là gap riêng, pattern đó không đổi. |

## Anatomy

**Tô nền theo tone, không viền, không shadow** (USER DECISION 2026-10, sau moodboard). Prior art: Atlassian Section message (tô nền không viền), Fluent 2 MessageBar (info xám). Radius `--utui-radius-lg` (12px), padding và gap 16px, flex row, `align-items: flex-start`, `width: 100%`.

| Phần | Selector | Ghi chú |
|---|---|---|
| Block | `.inform` + tone | Không class tone = neutral (info xám, `--utui-color-bg-surface-subtle`) |
| Tone | `.inform--warning`, `--error`, `--success`, `--brand` | Nền `--utui-color-bg-{warning,error,success,brand}-subtle`; glyph `--utui-color-icon-{warning,error,success,brand}`; neutral glyph `--utui-color-icon-default` |
| Icon | `.inform__icon` = `.material-symbols-outlined` | Glyph 20px không vòng, `aria-hidden`. Glyph: neutral `info`, warning `warning`, error `error`, success `check_circle` |
| Content | `.inform__content` | cột, gap 12px giữa text và actions |
| Text | `.inform__text` > `.inform__title` + `.inform__supporting` | gap 4px; title Text sm/Semibold `text-primary`, supporting Text sm/Regular `text-secondary`; supporting tuỳ chọn |
| Actions | `.inform__actions` (tuỳ chọn) | `.button.button--link`, nằm dưới text kể cả ở màn hẹp |
| Close | `.inform__close` (tuỳ chọn) | 36px, góc trên phải; khi có thì title chừa `--utui-spacing-08` |

Tương phản đã tính (WCAG, sRGB): text-primary `#171717` / text-secondary `#525252` trên nền neutral 16.44 / 7.17, warning 16.89 / 7.36, error 16.39 / 7.14, success 17.13 / 7.46, brand 16.52 / 7.20 (đều ≥ 4.5). Glyph trên nền cùng tone: neutral 4.35, warning 3.35, error 4.41, success 3.15, brand 5.42 (đều ≥ 3). Tone luôn kèm tiêu đề và glyph khác nhau, không chỉ dựa vào màu.

## Usage

- Điều kiện đứng yên trong ngữ cảnh, có tiêu đề (không chỉ dựa vào màu). Việc vừa xảy ra thì dùng `notification`.
- Không `aria-live`; dùng `role="note"` hoặc `<section aria-labelledby>`. Nếu nằm trong dialog/drawer, trỏ `aria-describedby` của panel tới tiêu đề và supporting của inform.
- Không tràn ở 1024; không có điểm đổi bố cục riêng.

## Lệch so với Figma

- **Figma `Inform` `11297:36733` vẽ card trắng viền 1px + shadow-xs + `featured-icon` 40px có vòng; code giờ tô nền theo tone, không viền, glyph 20px không vòng. Lệch có chủ ý (USER DECISION 2026-10), cần design xác nhận.**
- Gray của Figma thành neutral `--utui-color-bg-surface-subtle` + glyph `--utui-color-icon-default`.
- Button link dùng `.button--link` hiện có (màu link của ds), không ghim `#3b82f6`.

## Consumer

`screens/du-an/ho-so/danh-sach.html` — `#moveDrawer` bước 1 và `#printCheckDrawer` (`.inform--warning`, không close, không action); `#importDrawer` chỉ ở bước 4 (`--success` / `--warning`, kết quả; bước 1 bỏ inform, "Tải tệp mẫu" nằm trong hint của file-upload; bước 2–3 bỏ để bảng có chỗ, USER DECISION 2026-10).

## Known Gaps

1. Chưa có state/animation. Chưa có Angular map xác nhận (`npm run angular:draft`, không `confirmed`).
2. Close dùng cùng luật với `.drawer__close` nhưng khai báo riêng trong `inform.css` (ba nơi đều AUTHORED).
