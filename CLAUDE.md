# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# habeco-dashboard — dashboard báo cáo tự động Nhà máy bia Hoàng Hoa Thám

Designer (cá nhân) nhận thầu từ app team (đơn vị phát triển) — theo JD + báo giá trong `docs/`.
App đã chạy: React, Tailwind v4 (CSS variables), shadcn/Radix, Lucide, Recharts; desktop 1366–1920 px, có lúc chiếu phòng họp.
Bàn giao **Figma**: variables màu/chữ/khoảng cách đủ light + dark. Ngoài phạm vi: code, logo/nhận diện, khảo sát người dùng.
Mã màu do designer quyết (giữ tông xanh lá đậm + đỏ, vàng); phải tách được màu thương hiệu khỏi màu trạng thái đạt/cảnh báo/vượt.
Mỗi màn: brief → wireframe (kèm lý do chọn đồ thị) → Figma hoàn chỉnh → sửa tối đa 2 vòng. Đồ thị phải làm được bằng Recharts.
`app/` là nháp nội bộ cùng stack với app team — kiểm khả thi Recharts, không giao. Không đưa tên khách ra ngoài/portfolio.

```
app/                       Vite + React + TS + Tailwind v4 + shadcn/ui (style base-nova, icon lucide)
app/src/index.css          token theme shadcn (CSS variables) — nguồn màu duy nhất
app/src/components/ui/     component shadcn (thêm bằng CLI, không tự viết)
tokens/                    JSON (DTCG) cho Figma variables — sinh từ app/src/index.css + thang 50–950
design/                    moodboard đã duyệt (màu: hướng A, dark từ C — 2026-10-09)
docs/                      tài liệu đối tác — che dữ liệu (om-kit-data-mask) trước khi đọc
tools/hook_clarify.mjs     hook UserPromptSubmit: bước làm rõ trước khi sửa
```

## Lệnh (trong `app/`)

- `npm run dev` — chạy local
- `npm run build` — kiểm type + build
- `npx shadcn@latest add <tên>` — thêm component

## Phạm vi (kick-off 2026-10-09)

Ưu tiên Báo cáo năng lượng (điện, nước, hơi; drill-down 2 cấp), sau đó Báo cáo chất lượng.
Bộ lọc thời gian toàn cục: tháng, năm, khoảng tuỳ chọn, so cùng kỳ. Người dùng: vận hành, trưởng phòng, ban giám đốc.
Ngoài phạm vi: backend SAP ERP, chatbot AI, design system đầy đủ giai đoạn đầu.

Màu đã chốt (moodboard `design/moodboard-mau.html`): menu trái xanh 800, nút xanh 700, vàng kim chỉ cho số chính/mục chọn;
đạt không tô màu, cảnh báo cam, vượt đỏ, luôn kèm icon + nhãn; đỏ thương hiệu không dùng trong dữ liệu. Font Be Vietnam Pro.

## Luật

1. Chỉ dùng component shadcn và token theme (`bg-primary`, `text-muted-foreground`, `var(--chart-1)`…).
   Không viết màu/kích thước cứng — Figma Variables phải ánh xạ 1-1 với token.
2. Màu biểu đồ cố định: `chart-1` điện, `chart-2` nước, `chart-3` hơi (đã kiểm CVD), `chart-4` kỳ so sánh, `chart-5` một chuỗi chung.
   Đổi màu thì sửa `index.css` rồi sinh lại `tokens/`.
3. UI tiếng Việt, desktop-first, WCAG 2.1 AA.
4. **Không bịa dữ liệu, không thêm feature ngoài yêu cầu.** Dữ liệu mẫu ghi rõ là fixture.
5. Recap có câu hỏi mở → hỏi bằng `AskUserQuestion`, phương án đề xuất đặt đầu, gắn "(Recommended)".

Agent (`component-planner`, `fe-dev`, `ui-ux-reviewer`) và skill (`design-rules`, `component-selection`,
`handoff-flow`, `ux-writing`, `ui-moodboard`) trong `.claude/` còn viết theo ds/ MDM cũ — chưa chuyển sang shadcn.
Dùng phần luật chung (UX, câu chữ); bỏ qua chỗ trỏ `ds/`, `registry/`, `flows/`, `npm run handoff`.
