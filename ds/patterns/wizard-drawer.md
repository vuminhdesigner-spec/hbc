# Wizard Drawer (pat-wd)

## Purpose

Tạo một bản ghi nhiều bước (3–5) mà không rời trang danh sách: một `drawer--lg`
có stepper ở header, mỗi bước là một panel form, footer giữ nút lùi/tiếp/lưu.
Có thể thu nhỏ vào dock để làm việc khác rồi quay lại.

**Dùng khi:** tạo bản ghi từ một danh sách, 3–5 bước, người dùng cần xem lại
danh sách giữa chừng (minimize).

**Không dùng khi:**
- Cần URL riêng cho form (chia sẻ link, mở tab) → trang.
- 1–2 bước → `modal`, hoặc một drawer đơn như `#moveDrawer`.
- Hơn 5 bước → chưa review; hỏi design trước.

## Source

| Item | Value |
|---|---|
| Figma | **Không có frame.** Authored (USER DECISION 2026-10): drawer, stepper và dock đều dựng từ component sẵn có |
| Consumers | `screens/doi-tac/danh-sach.html` `#createDrawer` (4 bước); `screens/du-an/danh-sach.html` `#createDrawer` (3 bước); `screens/du-an/ho-so/danh-sach.html` `#importDrawer` (4 bước, biến thể: bước cuối là kết quả) |
| Chốt | USER DECISION 2026-10-02: chuyển "Tạo dự án mới" từ trang sang drawer, rút pattern từ ba consumer |

## Anatomy

Overlay `.drawer.drawer--lg[data-drawer-expandable][data-drawer-minimizable]`.

1. **Header** (`.drawer__header`): `featured-icon --lg` (`--success`) + `.drawer__title` + `.drawer__minimize` → `.drawer__expand` → `.drawer__close`, rồi `nav.drawer__header-steps[aria-label]` > `ol.progress-steps.progress-steps--text`. Có stepper thì không có `.drawer__supporting` (USER DECISION 2026-10-05); stepper đã cho biết bước, tóm tắt bước (nếu có) đọc qua live region. Bố cục header (USER DECISION 2026-10-02, `drawer.css`): header là grid, `.drawer__heading` `display: contents`; cạnh icon xếp title (hàng 1) / stepper (hàng 2); icon và nút điều khiển span hàng 1–2, căn giữa. Header hẹp hơn chuỗi dài nhất (`@container drawer-header (max-width: 1023px)`, vd. `#createDrawer` 4 bước) thì stepper rơi về hàng riêng full-width dưới icon/title. DOM không đổi.
2. **Live region**: một `p.sr-only-label[role=status]` duy nhất (`#stepStatus`) cho câu trạng thái; `.drawer__status` không mang `role`.
3. **Body** (`.drawer__body` > `.create-page`): mỗi bước một `section.create-step` (`tabindex="-1"` — focus khi đổi bước là panel, không phải section, `h2` sr-only "Bước n trên N — tên") chứa `form.create-step__form[novalidate]`. Nhóm có tên dùng `.create-group` (section-header không divider), phẳng trên nền drawer, không `.section-card`. Bảng nằm trong `.table-panel`.
4. **Footer** (`.drawer__footer`): `p.drawer__status[hidden]` + `.header-actions#stepActions`; nút phụ trước, chính sau.
5. **Modal huỷ** (`#leaveConfirmModal`, `modal__panel--sm`, `__actions--split`, nút `.button--destructive`) đặt sau drawer; **dock** (`section.dock`) đặt sau modal; notification stack cuối.

## Composition Rules

**Luật bước**
- Có high-water mark (`furthestStep`): bước đã tới là `complete`, bấm để quay lại; bước chưa tới không bấm được.
- `blocked` chỉ đặt cho bước hiện tại (còn trường bắt buộc trống); bỏ khi dữ liệu hợp lệ trở lại.
- Nhảy tới: validate từ bước hiện tại tới bước sai đầu tiên, dừng ở đó, focus trường lỗi.
- Lùi tự do, không validate.
- Lưu: validate mọi bước; bước sai đầu tiên được mở ra và đánh lỗi.

**Footer theo bước (chuẩn: doi-tac, du-an)**

| Bước | Phụ | Chính |
|---|---|---|
| 1 | `Hủy` (`data-modal-close`) | `Tiếp tục` |
| giữa | `Quay lại bước trước` (`.button`) | `Tiếp tục` |
| cuối | `Quay lại bước trước` | `Lưu …` |

`#importDrawer` (4 bước: Chọn tệp, Kiểm tra dữ liệu, Đính kèm tệp, Kết quả) dùng cùng chuẩn: nút chính `Tiếp theo` ở bước 1–2, `Quay lại bước trước` ở bước 2–3. Bước 3 là bước commit duy nhất: `Quay lại bước trước` · `Hoàn thành lưu trữ (Adhoc)` (`.button--secondary-destructive`) · `Gửi phê duyệt` (`.button--primary`), mỗi nút mở modal xác nhận chồng. Thứ tự hàng footer mọi drawer: status (trái, `flex: 1 1 0`) · lùi · nút chính; nút lùi luôn cạnh nút chính để không nhảy khi status hiện/ẩn (USER DECISION 2026-10-05). Bước 4 (sau commit): `Đóng`, thêm `Thử lại n hồ sơ` khi thành công một phần. Footer dựng lại mỗi lần đổi bước: nút submit ngoài form phải `dispatchEvent("submit")` thủ công; `Hủy` bind lại và gắn `data-modal-bound` để `modal.js` không bind lần hai.

**Đóng**
- Một `beforeClose` cho cả bốn đường đóng (Escape, scrim, `×`, `Hủy`). Dirty thì trả `false`.
- Chuẩn: modal xác nhận chồng, `OmeuModal.open("leaveConfirmModal", null, { stack: true })`. Nút xác nhận: `dirty = false`, `close({ returnFocus: false })` (đóng modal), rồi `close()` (đóng drawer).
- `window.confirm` của doi-tac là gap cũ (giữ theo USER DECISION trước).
- **Reset khi mở**, không khi đóng: đóng bị huỷ thì giữ nguyên dữ liệu.

**Minimize → dock**
- Tối đa 3 nháp (`MAX_DRAFTS`). Đủ 3: nút tạo mở notification `warning`, không mở drawer.
- `capture()` chụp field, select, hàng bảng (`structuredClone`), bước, high-water mark, dirty, expanded; `resetWizard(draft)` đặt lại.
- Tiêu đề nháp = tên bản ghi, hoặc "<Thực thể> mới n" (n thấp nhất chưa dùng).
- `beforeunload` khi còn nháp hoặc drawer mở và dirty.

## Content Slots

| Slot | Nội dung |
|---|---|
| Header icon | `featured-icon --lg --success`, glyph theo thực thể |
| Title | "Tạo <thực thể> mới" |
| Stepper | `STEPS[].title`; `__state` mỗi bước: "Bước n trên N: <tên>, <trạng thái>" |
| Body | form theo bước: `.create-grid` (3 cột, `--4` cho vị trí), `.create-group`, hoặc bảng |
| Footer status | câu trả lời của bảng (thêm/xoá/`Hoàn tác`), thay cho notification bị drawer che |
| Modal huỷ | tiêu đề "Đóng form tạo <thực thể>?", mô tả "Thông tin đã nhập sẽ không được lưu.", `Giữ lại` · `Đóng form` (copy chờ PO) |

## States

| State | Hành vi |
|---|---|
| Mở | luôn từ trống, bước 1 |
| Blocked | marker lỗi ở bước hiện tại; `__state` nói còn thông tin bắt buộc |
| Dirty | đóng hỏi xác nhận; `beforeunload` bật |
| Minimized | overlay ẩn, dock hiện nháp |
| Committing (busy) | chỉ `#importDrawer`, bước 3 → 4: bảng chỉ đọc, `×`/minimize/lùi khoá, nút đang bấm `aria-busy`, status "Đang gửi…". Thất bại: giữ dữ liệu, status "Không thể …" + `Thử lại`. Create wizard chưa có busy khi lưu (gap) |
| Committed | chỉ `#importDrawer`, bước 4 (kết quả): bước 1–3 `is-complete` khoá (`<span>`), đóng không hỏi |
| Upload chưa xong | chỉ `#importDrawer`: Gửi / Adhoc ở bước 3 bị chặn khi còn tệp đang tải (stepper `còn tệp đang tải lên`, dòng báo `Vui lòng đợi tệp tải xong.`); stepper nêu đủ lý do (`còn tệp đang tải lên và hồ sơ chưa có tệp đính kèm` khi cả hai); block tự gỡ khi mọi tệp xong hoặc lỗi và mọi hồ sơ có tệp (USER DECISION 2026-10), gỡ thì xoá lỗi từng dòng và chỉ đọc qua live region `Đã đủ tệp cho mọi hồ sơ. Có thể tiếp tục.` (copy chờ PO), không đổi giao diện. Bước 4 bảng không có cột tệp; trạng thái mỗi hồ sơ chỉ `Thành công` / `Thất bại` (kèm lý do, `Thử lại n hồ sơ`); không còn tải nền sau commit, minimize ẩn ở bước 4 |

## Tokens

Không có token riêng của pattern. Dùng token của `drawer`, `progress-steps`, `modal`, `dock`, và `--utui-spacing-04|06`, `--utui-page-block-gap`, `--utui-focus-ring` cho `.create-*`.

## Usage

Khác biệt giữa ba consumer:

| | doi-tac `#createDrawer` | du-an `#createDrawer` | `#importDrawer` |
|---|---|---|---|
| Bước | 4 | 3 | 4 |
| Icon | `handshake` | `maps_home_work` | theo màn hồ sơ |
| Supporting | không | không | không (tóm tắt đọc qua live region) |
| Footer lùi | `Quay lại bước trước` `.button` | như doi-tac | như doi-tac |
| Xác nhận đóng | `window.confirm` (gap) | modal chồng `stack: true` | modal chồng `stack: true` trước commit; sau commit đóng thẳng; không tự xuống dock |
| Bảng | địa chỉ, liên hệ, ngân hàng, thuộc tính | giai đoạn chính | xem trước dòng Excel (16 cột mẫu), tệp theo hồ sơ chưa tạo, kết quả theo hồ sơ |
| Thu nhỏ | dock, tối đa 3 | dock, tối đa 3 | dock chung với tải lên, tối đa 3; nháp có thanh tiến độ khi tệp đang tải |
| Sau lưu | `./chi-tiet.html` | `./chi-tiet.html` | bước 4 kết quả (inform + bảng theo hồ sơ), `Đóng`; không toast |
| Mở khi tải | `?create=1` | `?create=1` | — |

## Accessibility

- Đổi bước: focus vào panel (`#createDrawerPanel`), **không** announce "Bước n trên N". `aria-describedby="createStepCurrent"` trỏ vào `__state` của bước hiện tại (renderProgress gắn id này) nên trình đọc màn hình đọc tên bước.
- `#stepStatus` chỉ dành cho câu trạng thái (bảng, lý do chặn).
- Notification nằm dưới scrim của drawer: dùng `.drawer__status`, không dùng notification.
- Trigger: `aria-haspopup="dialog"`, `aria-controls`, `aria-expanded` đồng bộ theo `[hidden]` của drawer (`modal.js` không đặt).
- Focus trả về trigger khi đóng; về mục dock khi thu nhỏ.

## Code Mapping

| Surface | File |
|---|---|
| Hành vi chung | `ds/scripts/modal.js` (`open`, `beforeClose`, `stack`, `minimize`, `restore`) |
| Component | `ds/components/drawer.md`, `progress-steps.md`, `dock.md`, `modal.md` |
| Bố cục form `.create-*` | `screens/doi-tac/tao-moi.css`, `screens/du-an/tao-moi.css` (nhân bản) |
| Logic bước/dock | `screens/doi-tac/tao-moi.js`, `screens/du-an/tao-moi.js`, `screens/du-an/ho-so/nhap-excel.js` |

## Known Gaps

- Không có frame Figma cho drawer, stepper, dock.
- CSS `.create-*` nhân bản trong hai màn (USER DECISION 2026-10-02 để lại); thăng lên `ds/styles/` khi có consumer thứ ba hoặc khi design chốt.
- Create wizard chưa có trạng thái busy khi lưu.
- Không tự lưu nháp: tải lại trang mất nháp (`dock.md`).
- doi-tac còn dùng `window.confirm` cho đóng form và đóng nháp ở dock; `closeDraft` của du-an cũng vậy (modal cần drawer đóng trước).
- Copy modal huỷ của du-an là bịa, chờ PO.
- Chưa có trạng thái lưu không thành công (giữ dữ liệu + "Thử lại") và chưa gate quyền tạo trên nút mở — chờ PO (USER DECISION 2026-10-02: ghi gap, chưa dựng).
- Ngưỡng fallback stepper là một số chung (1023px, theo chuỗi 4 bước của doi-tac): wizard 3 bước cũng xuống hàng riêng dù còn vừa (USER DECISION 2026-10-02: chấp nhận).

## Revision History

- 2026-10-02: tạo pattern từ doi-tac, du-an (chuyển trang → drawer) và `#importDrawer`.
