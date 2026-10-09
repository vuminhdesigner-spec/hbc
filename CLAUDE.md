# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# habeco-dashboard — dashboard báo cáo tự động Nhà máy bia Hoàng Hoa Thám

Dự án cá nhân, tách từ template mdm-design. Repo này là **nguồn**: design system (`ds/`) và màn (`screens/`).
Output đối tác nhận là **Figma** — không dùng Seshat, không bàn giao Angular (bỏ qua `npm run seshat`, luật 6).
`dist/<flow>.html` chỉ dùng để xem/verify nội bộ.

Phạm vi (kick-off 2026-10-09): ưu tiên Báo cáo năng lượng (điện, nước, hơi; drill-down 2 cấp), sau đó Báo cáo chất lượng;
bộ lọc thời gian toàn cục (tháng, năm, khoảng tuỳ chọn, so cùng kỳ); người dùng: vận hành, trưởng phòng, ban giám đốc.
Ngoài phạm vi: backend SAP ERP, chatbot AI, design system đầy đủ giai đoạn đầu.
Chờ PL: mã màu brand Habeco (xanh chủ đạo + đỏ, vàng) — chưa đổi token brand; danh sách module/mục điều hướng — chưa sửa `ds/scripts/module-nav.js`.

```
ds/tokens/        3 tầng token --utui-* (primitive, semantic, component)
ds/styles/        CSS component; app.css là barrel — THỨ TỰ IMPORT LÀ CASCADE
ds/scripts/       hành vi dùng chung (nav, page-tab, modal, select…)
ds/assets/        ảnh — chỉ .svg/.webp (GitLab chặn png/jpg/gif)
ds/components/    <tên>.md contract (người viết) + <tên>.json registry
ds/patterns/      bố cục trang (item-listing, item-detail, filter)
screens/<entity>/ màn: <màn>.html + .css + .js
flows/            <flow>.flow.json — thứ tự step gửi dev; <flow>.tracking.json — allowlist đo lường (tuỳ chọn)
emails/           emails.html — mọi email template (table + inline CSS) + hướng dẫn, gửi backend nguyên file
dist/             máy sinh, gitignore (vượt 1 MiB) — không sửa tay, không commit
```

Đổi token primitive thì sửa tay hex trong `emails/` (luật riêng: `emails/CLAUDE.md`).

## Lệnh

Không `npm install` (không dependency). Cần Node 20+ và Chrome (verify/snapshot chạy headless).

- `npm run handoff -- <flow>` — build + verify → `dist/<flow>.html`; bỏ `<flow>` = mọi flow
- `npm run build -- flows/<flow>.flow.json` / `npm run verify -- dist/<flow>.html` — chạy riêng từng bước.
  Verify chạy self-test của viewer 2 lượt (iframe thường + sandbox): mỗi step mở được, không lỗi JS,
  không ảnh vỡ, không tràn ngang ở 1024/1440/1920, link chuyển step
- `npm run handoff -- <flow> --release --note "…" --ticket MDM-…` — phát hành vN: cần nguồn đã commit;
  mỗi step Mới/Đổi cần ghi chú trong `flow.json › changes.vN` (skill `handoff-flow`);
  ghi `flows/<flow>.releases.json` (máy sinh: hash từng step + từng file ds/),
  in lệnh commit + `git tag <flow>/vN`. Không còn bản lưu `dist/<flow>/vN.html`: viewer nhúng HTML bản trước (git) cho
  ghi chú dính — công tắc "Ghi chú thay đổi" trên khung, mỗi step hiện lần đổi gần nhất có ghi chú, nút Trước/Sau trong bóng chú thích
- `npm run seshat -- <flow>` — tải `dist/<flow>.html` lên Seshat (project = `handoff.config.json › seshatProject`, ghi đè) rồi deploy;
  bỏ `<flow>` = mọi file trong dist/. Khoá lấy từ `~/.claude.json › mcpServers.omSeshat`
- `npm run index` — sinh lại `registry/index.md` sau khi đổi `ds/components|patterns`
- `npm run snapshot -- --root . --out a.json` rồi `--compare a.json b.json` —
  chứng minh một refactor không đổi giao diện (computed style mọi phần tử)

Hook `PostToolUse` (`tools/hook_flow.mjs`) tự build + verify khi sửa `flows/*.flow.json|*.tracking.json`
(flow đó) hoặc `tools/runtime|lib/*`, `build_flow.mjs`, `ds/angular-map.json` (mọi flow).
**Sửa `screens/` hay `ds/styles` không kích hoạt hook** — tự chạy `npm run handoff -- <flow>`.
Hỏng thì sửa nguyên nhân, không tắt hook. Hook `UserPromptSubmit` (`hook_clarify.mjs`) đẩy
prompt báo lỗi/phản hồi UX/yêu cầu tính năng qua bước làm rõ (phản hồi UX → đưa phương án trước khi sửa);
gõ `no-clarify` để bỏ, `clarify:`, `5whys:` hoặc `option:` để bật thẳng.

Trạng thái màn (empty, lỗi, quá giới hạn…) là step riêng trong flow: cùng `screen`, khác
`query` (`?state=empty`, `?preview=…`) mà JS của màn đọc — xem skill `handoff-flow`.

Git chỉ dùng trên máy (commit + tag cho `--release`); không push GitLab — bàn giao chỉ qua Seshat (`npm run seshat`).

## Luật

1. **Đọc `registry/index.md` (~5 KB) trước**; chỉ mở contract `.md` của component
   thật sự cần. Không đọc `dist/*.html` — dùng output của build/verify.
2. **Chỉ dùng token và component có trong `ds/`.** Không viết giá trị cứng.
   Thiếu component → ghi là gap trong hand-back, không tự chế.
3. **ds/ chỉ chứa thứ flow dùng.** Thêm component mới: CSS vào `ds/styles/` + một
   dòng import đúng chỗ trong `app.css`, contract `.md` + `.json` vào `ds/components/`,
   rồi `npm run index`. `.json` giờ viết tay (công cụ export chưa chuyển sang).
4. **Comment ngắn, một dòng.** Lý do dài không để trong code. Ngoại lệ bắt buộc
   giữ: gap, câu hỏi mở, TODO, và dữ liệu mẫu/bịa (fixture) — ghi rõ.
   Build bỏ **toàn bộ** comment khỏi `dist/` (tools/lib/strip_comments.mjs), nên comment
   chỉ tốn chỗ trong nguồn, không làm nặng file gửi dev.
5. **Không bịa dữ liệu, không thêm feature ngoài yêu cầu.**
6. **Map Angular là bản nháp**: component → thư mục ở `handoff.config.json › angularMap`,
   modifier → input ở `ds/angular-map.json` (`npm run angular:draft`). Không tự đặt
   `confirmed: true` — chỉ dev xác nhận. dist/ nhúng bảng này vào mục lục `#mdm-ai` cho AI của dev.
7. **Recap có câu hỏi mở → hỏi bằng `AskUserQuestion`**, không liệt kê dạng text.
   Phương án đề xuất đặt đầu, gắn "(Recommended)". Bị từ chối/Esc thì dừng, không hỏi lại.

Đã biết: contract trong `ds/components/*.md` còn trích đường dẫn của mdm-portal
(`styles/…`, `screens/du-an/…`, `docs/adr/…`) — là lịch sử, không phải lỗi build.

Tạo/cập nhật flow: skill `handoff-flow`.

## Agent

| Việc | Gọi |
|---|---|
| Yêu cầu/ticket/Figma → cần biết dùng component nào | `component-planner` |
| Dựng hoặc sửa màn trong `screens/`, CSS trong `ds/styles` | `fe-dev` (đưa kế hoạch của planner nếu có) |
| Review màn/flow trước khi gửi dev | `ui-ux-reviewer` (đưa output `npm run handoff`) |

Màn mới hoặc đổi bố cục: planner → fe-dev → reviewer → sửa 🔴 (tối đa 1 vòng) → handoff.
Chuyển màn từ mdm-portal: bỏ planner; đụng `ds/styles` hoặc đổi bố cục → fe-dev; reviewer bắt buộc trước handoff.
Sửa nhỏ (copy, một class): làm thẳng, không cần agent.
