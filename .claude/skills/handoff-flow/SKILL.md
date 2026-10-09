---
name: handoff-flow
description: Tạo hoặc cập nhật một flow bàn giao (flows/<id>.flow.json → dist/<id>.html, một file HTML cho dev). Dùng khi được yêu cầu gói một chuỗi màn MDM để bàn giao, thêm step/trạng thái vào flow, hoặc build lại sau khi sửa screens/ hoặc ds/.
---

# handoff-flow

## 1. Màn

Màn nằm ở `screens/<entity>/<màn>.{html,css,js}`, link nhau bằng `./<màn>.html`.
Màn chưa có → dựng theo `registry/index.md` + contract của component cần dùng
(CLAUDE.md luật 2–4). Không đọc HTML màn chỉ để tìm link: build in ra mọi link
tĩnh trỏ ra ngoài flow.

## 2. Flow

```json
{
  "id": "doi-tac",
  "title": "Đối tác (External) — MDM-823",
  "steps": [
    { "id": "danh-sach", "screen": "doi-tac/danh-sach" },
    { "id": "chi-tiet-trong", "screen": "doi-tac/chi-tiet", "query": "?state=empty",
      "title": "Chi tiết đối tác — trạng thái trống" }
  ]
}
```

- `id` step: chữ thường, gạch nối; là deep link `dist/<flow>.html#<id>`.
- `query`: chỉ tham số JS của màn thật sự đọc —
  `grep -n "location.search\|URLSearchParams" screens/<path>.js`.
- `title`: bỏ trống để lấy `<title>` của màn.
- `label` (tuỳ chọn): nhãn ngắn trong cây step (một dòng, ~20 ký tự); `title` vẫn đầy đủ cho header, tooltip, mục lục AI. Luồng nhiều bước dùng tiền tố `1/3`, `2/3`…
- `group` (tuỳ chọn): tên luồng con (vd. "Nhập hồ sơ từ Excel"); dãy step liền nhau cùng `group` gộp thành một nhóm thu gọn được trong danh sách step. Không có `group` thì gộp theo màn.
- `case: "edge"` (tuỳ chọn): step ngoại lệ (lỗi, chặn, thiếu quyền, trống, quá giới hạn, nhánh phụ). Cây step gom vào nhánh "Ngoại lệ (n)" ở cuối luồng; không ghi = happy path, giữ thứ tự flow.
- `variant` (tuỳ chọn): các step cùng vị trí, chỉ khác dữ liệu/trạng thái (vd. 4 lỗi tệp ở bước 1/3) cùng một `variant` → một lá trong cây, chuyển bằng chip trên thanh trên; `label` của từng step là chữ trên chip. Mỗi step vẫn giữ `#id` riêng.
- `sections` (tuỳ chọn, cấp flow): `{ "<thư mục màn>": "<nhãn>" }`, vd. `{ "du-an/ho-so": "Hồ sơ dự án" }` — tầng gốc VIẾT HOA của cây step (kiểu Storybook). Thư mục không có nhãn thì dùng `title` của flow.
- Đo lường (tuỳ chọn): `flows/<id>.tracking.json` — allowlist event, chỉ enum/số đếm, không dữ liệu cá nhân. Build chặn param trong `forbidden` và kiểu sai; verify FAIL nếu `selector` không có trong màn. Mẫu: `flows/doi-tac.tracking.json`.
- Ghi chú thay đổi: `"changes": { "vN": [{ "step": "<id>", "note": "<đổi gì>", "sel": "<selector, tuỳ chọn>" }] }`, với vN là bản sắp phát hành (build in "vN nháp"). Mỗi step Mới/Đổi cần ít nhất một ghi chú, nếu thiếu thì build cảnh báo và `--release` từ chối. `sel` vẽ ghim đánh số lên vùng đó trên màn; verify FAIL nếu selector không có trong màn của step. "Đổi" chỉ tính file `screens/` của màn. Thay đổi ở ds/ hiện thành dòng "DS" riêng, không bắt buộc ghi chú. Khoá vN đã phát hành giữ nguyên làm lịch sử.

## 3. Build + verify

Lưu file là hook tự chạy; chạy tay `npm run handoff -- <id>`. Đọc output:
- `LỖI` → không ghi file. Sửa nguồn.
- `cảnh báo: … link tới màn ngoài flow` → thêm màn vào flow, hoặc nêu trong hand-back.
- `FAIL` verify: lỗi JS / tràn ngang / link không chuyển / trang trống.

Refactor CSS/JS dùng chung (bỏ file, đổi thứ tự import) → chụp `npm run snapshot`
trước và sau, `--compare` phải "Mọi màn giống hệt".

## 4. Chốt phiên bản ("chốt <flow>", "release <flow>")

1. `npm run build -- flows/<flow>.flow.json` → đọc dòng "step đổi chưa có ghi chú trong changes.vN".
2. Mỗi step đó: `git diff <gitSha bản trước trong releases.json> -- screens/<màn>.*` (cả thay đổi chưa commit) →
   soạn `{ step, note, sel }`: note một câu tiếng Việt nói người dùng thấy gì khác (luật `ux-writing`), sel trỏ đúng vùng đổi.
   Không bịa: diff chỉ là refactor/không thấy khác thì nói rõ, hỏi user.
3. In bảng step → ghi chú, hỏi duyệt bằng `AskUserQuestion` (kèm --note tóm tắt + ticket; không có ticket thì `MDM-0000`).
4. Duyệt → ghi vào `changes.vN`, commit nguồn (trừ dist/), `npm run handoff -- <flow> --release --note … --ticket …`,
   commit `flows/<flow>.releases.json` + `git tag <flow>/vN`. Không push. Hỏi có `npm run seshat -- <flow>` không.

## 5. Hand-back

Đường dẫn `dist/<id>.html`, kích thước, số step, kết quả verify, link ra ngoài
flow, và điều gì chưa làm và vì sao.
