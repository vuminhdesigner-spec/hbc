# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# habeco-dashboard — dashboard báo cáo tự động Nhà máy bia Hoàng Hoa Thám

Dự án cá nhân. Đối tác (có dev riêng) nhận **Figma** — HTML không nằm trong báo giá.
Quy trình: **HTML nháp nội bộ (React + shadcn) → Figma** bằng skill `figma:figma-generate-design`,
dùng shadcn/ui Figma kit + Variables Habeco. HTML chỉ để chốt nhanh bố cục/dữ liệu/câu chữ và làm demo dự phòng;
không gửi đối tác trừ khi PL đồng ý.

```
app/                       Vite + React + TS + Tailwind v4 + shadcn/ui (style base-nova, icon lucide)
app/src/index.css          token theme shadcn (CSS variables) — nguồn màu duy nhất
app/src/components/ui/     component shadcn (thêm bằng CLI, không tự viết)
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

Chờ PL: mã màu Habeco (xanh chủ đạo + đỏ, vàng) — `index.css` đang dùng màu TẠM có TODO;
cấu trúc điều hướng/module; đối tác có cần demo chạy được cho buổi thi đua không.

## Luật

1. Chỉ dùng component shadcn và token theme (`bg-primary`, `text-muted-foreground`, `var(--chart-1)`…).
   Không viết màu/kích thước cứng — Figma Variables phải ánh xạ 1-1 với token.
2. Màu biểu đồ cố định: `chart-1` điện, `chart-2` nước, `chart-3` hơi.
3. UI tiếng Việt, desktop-first, WCAG 2.1 AA.
4. **Không bịa dữ liệu, không thêm feature ngoài yêu cầu.** Dữ liệu mẫu ghi rõ là fixture.
5. Recap có câu hỏi mở → hỏi bằng `AskUserQuestion`, phương án đề xuất đặt đầu, gắn "(Recommended)".

Agent (`component-planner`, `fe-dev`, `ui-ux-reviewer`) và skill (`design-rules`, `component-selection`,
`handoff-flow`, `ux-writing`, `ui-moodboard`) trong `.claude/` còn viết theo ds/ MDM cũ — chưa chuyển sang shadcn.
Dùng phần luật chung (UX, câu chữ); bỏ qua chỗ trỏ `ds/`, `registry/`, `flows/`, `npm run handoff`.
