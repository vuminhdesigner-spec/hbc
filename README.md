# Template thiết kế + bàn giao một file HTML

Tách từ `mdm-design` (2026-10-07): giữ công cụ (`tools/`, hook, agent, skill trong `.claude/`) và
design system đầy đủ (`ds/`); màn, flow, email của MDM đã bỏ. Có sẵn `screens/mau/` + `flows/mau.flow.json` làm mẫu.

## 0. Bắt đầu dự án mới từ template

1. Giải nén, đổi tên thư mục, rồi `git init && git add -A && git commit -m "khởi tạo từ template"`
   (`--release` cần nguồn đã commit).
2. `handoff.config.json`: điền `seshatProject` (tên project trên Seshat) và `devDs` (đường dẫn DS Angular của dev).
3. `package.json › name`, tiêu đề + mô tả đầu `CLAUDE.md` theo dự án.
4. Mục điều hướng trái: sửa danh sách module trong `ds/scripts/module-nav.js` (đang là module MDM).
5. Thử: `npm run handoff -- mau` → mở `dist/mau.html`. Dựng màn thật xong thì xoá `screens/mau/`, `flows/mau.flow.json`.
6. Email template (nếu cần): tạo `emails/emails.html` theo luật `emails/CLAUDE.md`.

Ví dụ `du-an`, `doi-tac` bên dưới và trong skill là flow của MDM — thay bằng flow của bạn.


Nơi designer dựng màn MDM cùng Claude Code. Mỗi **flow** (bộ màn của một tính năng, vd. `du-an`, `doi-tac`)
được gói thành **một file HTML** đưa lên Seshat cho PO, dev, QC xem. Mỗi màn hoặc trạng thái trong flow là một **step**.

## 1. Cài đặt (lần đầu)

Làm một lần trên máy mới (macOS). Không cần `npm install` hay thư viện nào khác —
agent, skill, hook đi kèm repo trong `.claude/`.

| Công cụ | Dùng để | Cài | Kiểm tra |
|---|---|---|---|
| Claude Code | làm việc với Claude | [hướng dẫn cài](https://docs.anthropic.com/en/docs/claude-code/setup) | `claude --version` |
| Node.js 20+ | chạy lệnh build, kiểm tra, gửi Seshat | [nodejs.org/download](https://nodejs.org/en/download) (bản LTS) | `node -v` |
| git | lưu mốc + đánh dấu khi chốt phiên bản | Terminal: `xcode-select --install` | `git --version` |

**Kết nối (MCP)** — trong Claude Code gõ `/mcp` để xem đã kết nối chưa.

- **Jira (Atlassian)** — claude.ai → Settings → Connectors → Atlassian → Connect,
  đăng nhập tài khoản Jira công ty. Claude Code dùng chung tài khoản claude.ai.
- **Seshat** — lấy khoá API trên trang Seshat, rồi chạy trong Terminal:
  ```
  claude mcp add --scope user --transport http omSeshat https://ai-sdlc.onemount.dev/seshat/portal/mcp --header "Authorization: Bearer <khoá>"
  ```
- **Figma** (chỉ khi làm từ Figma) — trong Claude Code gõ `/plugin`, cài `figma`, rồi đăng nhập Figma khi được hỏi.

**Mở repo:** `cd mdm-design && claude`. Lần đầu Claude Code hỏi có tin thư mục này không → đồng ý để hook chạy.

## 2. Quy trình làm việc

Mọi bước gõ bằng lời cho Claude là đủ. Ví dụ với flow `du-an`:

1. **Đưa yêu cầu** — dán mã ticket (`MDM-123`) hoặc link Jira/Figma.
   Claude tự đọc nội dung ticket và thiết kế Figma, không cần copy.
2. **Làm rõ trước khi làm** — câu có chữ kiểu "lỗi", "khó dùng", "thiếu", "màn mới"… thì
   Claude tự hỏi lại vài câu (chọn đáp án) trước khi sửa. Muốn chủ động, gõ từ khoá ở đầu câu:

   | Gõ | Claude làm |
   |---|---|
   | `clarify:` … | hỏi cho rõ yêu cầu trước |
   | `5whys:` … | truy nguyên nhân lỗi (hỏi "vì sao" từng tầng) |
   | `option:` … | đưa vài phương án để chọn rồi mới sửa |
   | `no-clarify` | bỏ bước hỏi, làm luôn |

3. **Chọn hướng giao diện** (khi có nhiều cách trình bày) — gõ "research UI cho …" hoặc "moodboard …".
   Claude vẽ các phương án bằng dữ liệu thật trên một trang để so, rồi hỏi chọn.
4. **Dựng/sửa màn** — Claude tự chia việc cho 3 trợ lý: chọn component có sẵn (`component-planner`)
   → dựng màn (`fe-dev`) → soát giao diện, câu chữ, trạng thái (`ui-ux-reviewer`) → sửa lỗi nặng.
   Sửa nhỏ (đổi chữ, một style) Claude làm thẳng.
5. **Xem bản mới** — Claude tự build và kiểm tra sau khi sửa, rồi báo đường dẫn `dist/du-an.html`
   (mở bằng trình duyệt: chuột phải → Open With → Chrome, hoặc gõ "mở du-an"). Muốn build lại: "build du-an".
6. **Chốt phiên bản** — gõ "chốt du-an". Claude tìm màn mới/vừa đổi so với bản chốt trước,
   soạn ghi chú "đổi gì" cho từng màn và đưa bạn duyệt. Duyệt xong Claude lưu mốc và chốt vN.
   Ghi chú hiện thành ghim đánh số trên màn để dev thấy ngay chỗ đổi.
7. **Gửi** — gõ "gửi du-an lên Seshat". Claude đưa file lên và trả link.
   Gắn link từng step (`…/du-an.html#<step>`) vào user story trên Jira.

Chỉ cho xem nhanh, chưa chốt phiên bản: bỏ bước 6.

## 3. Dev nhận file

Mở link Seshat, hoặc mở file `<flow>.html` tải về bằng trình duyệt (không cần server).

- **Cột trái**: các step của flow. Link trong màn cũng chuyển step như app thật.
  Prototype chỉ điều hướng — dữ liệu nhập ở màn này không mang sang màn khác.
  Deep link: `doi-tac.html#chi-tiet`.
- **1024 / 1440 / 1920**: dựng màn đúng 1024×768 / 1440×900 / 1920×1080 rồi thu nhỏ cho vừa
  khung như responsive mode của Chrome (tỉ lệ hiện cạnh nút). Mặc định 1440.
- **⇤ / ⇥** ở hai góc (phím `[` và `]`): thu gọn cột step và panel chi tiết. Lựa chọn được nhớ.
- **Ghi chú thay đổi** (phím `N`): bật trên khung màn để thấy ghim ở chỗ đổi so với bản trước.
- **Inspect** (phím `I`, `Esc` để tắt): bấm phần tử để xem component, class, trạng thái,
  token kèm giá trị và token `--ds-*` tương ứng, và component Angular đề xuất (`<ds-button>` + inputs).
- DevTools vẫn thấy `var(--utui-*)` nguyên vẹn — token không bị resolve.

Cần mạng cho font icon Material Symbols; phần còn lại chạy offline.

**AI của dev convert sang Angular.** Đầu file có `<script type="application/json" id="mdm-ai">` (~30 KB):
danh sách màn và đúng các block cần đọc, bảng component → `<ds-*>` + modifier → input, bảng token
`--utui-*` → `--ds-*`, và luật convert. Mỗi màn là các block
`<script type="text/plain" data-screen="…" data-part="html|css|js">`, đọc riêng được. Prompt mẫu:

> Đọc `<script id="mdm-ai">` trong doi-tac.html, rồi convert màn `doi-tac/chi-tiet`
> sang Angular: đọc đúng các block trong screens[].blocks của màn đó, theo rules.

Bảng modifier → input (`ds/angular-map.json`) là **bản nháp** ghép theo tên. Mục ghi `(nháp)`
hoặc `CHƯA MAP` chờ dev xác nhận: sửa file, đặt `"confirmed": true`, build lại.

## Thêm

- [`tools/README.md`](tools/README.md) — lệnh `npm run …` tương ứng từng bước, khi muốn tự chạy trong Terminal.
- [`CLAUDE.md`](CLAUDE.md) — cấu trúc repo và luật cho Claude.
