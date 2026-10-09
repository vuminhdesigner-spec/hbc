# tools/ — các lệnh dùng hằng ngày

Mọi lệnh gõ trong Terminal, đứng ở thư mục `mdm-design`. Không cần cài thêm gì,
chỉ cần máy có Node.

`<flow>` là tên bộ màn, ví dụ `du-an`, `doi-tac` (xem tên trong thư mục `flows/`).

## Tôi muốn…

**Xem bản mới nhất sau khi sửa màn**
```
npm run handoff -- du-an
```
Gom các màn thành một file `dist/du-an.html` (mở bằng trình duyệt) và tự kiểm tra:
màn nào mở lỗi, ảnh vỡ, bị tràn ngang, link bấm không chuyển màn. Thấy chữ
`LỖI` hoặc `FAIL` là cần sửa trước khi gửi.

**Gửi file cho dev / PO xem online**
```
npm run seshat -- du-an
```
Đưa `dist/du-an.html` lên Seshat (thay bản cũ) và in link xem. Gõ `npm run seshat`
không kèm tên để gửi tất cả.

**Chốt một phiên bản (v1, v2…) để dev bám theo**

Gõ cho Claude: "chốt du-an". Claude soạn ghi chú cho các màn đổi, bạn duyệt, rồi Claude
commit và chạy:
```
npm run handoff -- du-an --release --note "Tóm tắt thay đổi" --ticket MDM-123
```
Lệnh này từ chối nếu còn thay đổi chưa commit hoặc màn đổi nào chưa có ghi chú.
Sau khi chốt, dev bật "Ghi chú thay đổi" trên file sẽ thấy ghim đánh số ngay chỗ đổi.

**Kiểm tra một lần dọn code không làm đổi giao diện**
```
npm run snapshot -- --root . --out truoc.json      (trước khi sửa)
npm run snapshot -- --root . --out sau.json        (sau khi sửa)
npm run snapshot -- --compare truoc.json sau.json
```
Kết quả phải là "Mọi màn giống hệt".

**Cập nhật danh sách component sau khi thêm/sửa component trong `ds/`**
```
npm run index
```

**Sinh bảng gợi ý component → Angular cho dev**
```
npm run angular:draft
```
Chỉ là bản nháp ghép theo tên; dev xác nhận từng mục.

## Tự động khi làm với Claude Code

- Sửa file flow (`flows/…`) → Claude tự build và kiểm tra lại flow đó.
  Sửa màn (`screens/…`) thì **không** tự chạy — gõ `npm run handoff -- <flow>`.
- Khi báo lỗi, góp ý giao diện hay xin tính năng mới, Claude sẽ hỏi lại cho rõ trước khi sửa.
  Gõ `no-clarify` trong câu để bỏ bước hỏi.

## Hay gặp

- **`seshat` báo không thấy omSeshat** — máy chưa kết nối Seshat trong Claude Code; nhờ người cài.
- **`--release` báo "còn thay đổi chưa commit"** — commit trước rồi chạy lại.
- **`--release` báo "chưa có ghi chú"** — thêm ghi chú cho các màn được liệt kê.

---

<details>
<summary>Cho người sửa script</summary>

| File | Vai trò |
|---|---|
| `handoff.mjs` | build + verify (+ `--release`) |
| `build_flow.mjs` | gộp screens/ + ds/ thành `dist/<flow>.html`, bỏ comment, nén ds + ảnh |
| `verify_flow.mjs` | self-test trong Chrome headless, 2 lượt (iframe thường + sandbox), 1024/1440/1920 |
| `seshat_upload.mjs` | gọi thẳng endpoint MCP omSeshat (URL + Authorization từ `~/.claude.json`), ghi `mdm-demo/<flow>.html`, deploy |
| `registry_index.mjs` | sinh `registry/index.md` từ `ds/{components,patterns}/*.json` |
| `style_snapshot.mjs` | computed style mọi phần tử, so 2 bản chụp |
| `angular_map_draft.mjs` | nháp `ds/angular-map.json`, giữ mục `confirmed: true` |
| `hook_flow.mjs` | PostToolUse: sửa flows/, `tools/runtime\|lib`, `build_flow.mjs`, `ds/angular-map.json` → build + verify |
| `hook_clarify.mjs` | UserPromptSubmit: 5 Whys / phương án / làm rõ; `clarify:`, `5whys:`, `option:` bật thẳng |
| `runtime/` | viewer (khung xem, Inspect, ghi chú thay đổi) + shim chạy trong mỗi màn |
| `lib/` | `strip_comments.mjs`, `dev_tokens.mjs` |

</details>
