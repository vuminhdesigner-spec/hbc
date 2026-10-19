// FIXTURE minh hoạ, chép từ wireframe v0.3 board Điện (canvas LiHL9ZN53TuxSSAs3DmK7u, đã review 19/10) — không phải số của nhà máy.
// Cây: công tơ điện lực → 2 nhánh theo cặp MBA → đồng hồ cấp 1. Tỷ lệ thật tháng 9/2026 từ file ghi chỉ số, quy về Σ 4 MBA = 672.
// Ngăn tủ xếp vào nhánh theo sơ đồ Hệ tủ A, B là giả định, chờ nhà máy xác nhận.

export type TreeNode = {
  id: string
  name: string
  mwh: number
  peak?: string
  sub: string
  /** Nhánh lệch lớn hoặc số cần kiểm tra */
  warn?: boolean
  /** Nhóm phụ (chưa rõ nhánh, chưa có đồng hồ) — chữ nhạt */
  muted?: boolean
  children?: TreeNode[]
}

export const TREE: TreeNode = {
  id: 'evn',
  name: 'Công tơ điện lực',
  mwh: 684,
  sub: 'Tổn hao so Σ 4 MBA: 12 MWh · 1,8%',
  children: [
    {
      id: 't12',
      name: 'Nhánh MBA T1 + T2',
      mwh: 331,
      peak: '25%',
      sub: 'Σ con 393 · lệch −18,9% · cần xác nhận',
      warn: true,
      children: [
        { id: 'lanh2', name: 'Lạnh 2', mwh: 263, sub: 'DHD09 · chung ánh sáng men 2 · ngăn CT9' },
        { id: 'xln', name: 'Xử lý nước', mwh: 55, sub: 'Nước cấp 31 · nước thải 25 · CT5, CT6' },
        { id: 'chietnuoc', name: 'Chiết nước', mwh: 23, sub: 'DHD04 · ngăn CT7' },
        { id: 'co2', name: 'CO2', mwh: 21, sub: 'DHD10, DHD11 · ngăn CT6' },
        { id: 'men2', name: 'Men 2', mwh: 15, sub: 'DHD07 · ngăn CT8' },
        { id: 'lohoi', name: 'Lò hơi', mwh: 11, sub: 'DHD17 · ngăn CT5 · lò trấu không chạy' },
        { id: 'nho', name: '4 đồng hồ nhỏ', mwh: 5, sub: 'Men 1, silo, đồi kỹ thuật, tủ cũ' },
      ],
    },
    {
      id: 't34',
      name: 'Nhánh MBA T3 + T4',
      mwh: 341,
      peak: '25%',
      sub: 'Σ con 131 · lệch 61,7% · cần xác nhận',
      warn: true,
      children: [
        { id: 'naunau', name: 'Nhà nấu', mwh: 68, sub: 'DHD05 · chung nhà ăn, hội trường · CT10' },
        { id: 'mnk', name: 'Máy nén khí', mwh: 42, sub: 'Máy 1: 2 (CT1) · máy 2: 40 (CT3)' },
        { id: 'keg', name: 'Keg', mwh: 15, sub: 'Keg 1 + 3 (CT1) · Keg 2 (CT15)' },
        { id: 'chietchai', name: 'Chiết chai', mwh: 6, sub: 'DHD03 · ngăn CT11' },
        { id: 'nghiepvu', name: 'Khối nghiệp vụ', mwh: 0, sub: 'DHD20 · CT2 · cần kiểm tra', warn: true },
      ],
    },
    { id: 'chuaro', name: 'Chưa rõ nhánh', mwh: 106, sub: 'Lạnh 1, hội trường, MTV, nhà 3 tầng… không có trên sơ đồ tủ', muted: true },
    { id: 'chuadh', name: 'Chưa có đồng hồ', mwh: 42, sub: '= Σ 4 MBA − Σ 27 đồng hồ', muted: true },
  ],
}

export const KPI = {
  perL: { value: 83, dec: 1, unit: 'kWh', note: 'Định mức 105 · Đạt · ▼ 1,2% cùng kỳ' },
  total: { value: 672, dec: 0, unit: 'MWh', note: 'Sản lượng 8,1 triệu L · ▼ 4,8% cùng kỳ' },
  loss: { value: 12, dec: 0, unit: 'MWh · 1,8%', note: 'Công tơ điện lực 684 · ▲ 0,3 điểm cùng kỳ' },
  read: { done: 29, total: 32, note: '2 chưa ghi · 1 cần kiểm tra' },
}

/** [tên, tháng 9/2026 MWh, cùng kỳ 2025 MWh, cảnh báo]. Công đoạn cộng từ khu vực. Cảnh báo khớp Khí nén ở Tổng quan. */
export const ALLOC: Record<'area' | 'stage', [string, number, number, boolean?][]> = {
  area: [
    ['Lạnh', 339, 326],
    ['Nhà nấu', 68, 69],
    ['Xử lý nước', 55, 56],
    ['Máy nén khí', 42, 39, true],
    ['Chiết', 28, 28],
    ['Khối TCT', 23, 22],
    ['CO2', 21, 22],
    ['Men', 17, 17],
    ['Keg', 15, 15],
    ['Khác (lò hơi, hành chính, silo)', 20, 21],
  ],
  stage: [
    ['Phụ trợ', 457, 443],
    ['Nấu', 68, 69],
    ['Chiết', 43, 43],
    ['Ngoài sản xuất, khác', 43, 43],
    ['Lên men – Lọc', 17, 17],
  ],
}
export const UNMETERED_MWH = 42

/** Khung giờ Σ 4 MBA từng tháng 2026: [tháng, % cao điểm, % bình thường, % thấp điểm, MWh] — tỷ lệ thật từ file ghi chỉ số. */
export const TOU: [number, number, number, number, number][] = [
  [1, 24.5, 56.9, 18.6, 410],
  [2, 23.4, 57.7, 19.0, 365],
  [3, 24.6, 57.0, 18.4, 658],
  [4, 25.7, 56.2, 18.0, 753],
  [5, 25.4, 56.3, 18.3, 805],
  [6, 25.5, 56.7, 17.9, 915],
  [7, 24.8, 56.4, 18.8, 852],
  [8, 24.4, 57.5, 18.1, 731],
  [9, 24.7, 56.6, 18.7, 672],
]

export type MeterStatus = 'ok' | 'wait' | 'warn'
export type Meter = { name: string; area: string; peak: string; normal: string; low: string; sum: string; ti: string; status: MeterStatus; note: string }

export const METERS: Meter[] = [
  { name: 'MBA T1', area: 'Trạm biến áp', peak: '40,3', normal: '92,1', low: '30,4', sum: '162,8', ti: '300', status: 'ok', note: 'Đã ghi · 30/09' },
  { name: 'DHD09 · Lạnh 2, ánh sáng men 2', area: 'Lạnh', peak: '—', normal: '—', low: '—', sum: '262,6', ti: '500', status: 'ok', note: 'Đã ghi · 30/09' },
  { name: 'DHD05 · Nhà nấu, nhà ăn, hội trường', area: 'Nhà nấu', peak: '—', normal: '—', low: '—', sum: '68,1', ti: '250', status: 'ok', note: 'Đã ghi · 30/09' },
  { name: 'DHD13 · Máy nén khí 2', area: 'Máy nén khí', peak: '—', normal: '—', low: '—', sum: '40,4', ti: '120', status: 'ok', note: 'Đã ghi · 29/09' },
  { name: 'DHD20 · Khối nghiệp vụ', area: 'Khối TCT', peak: '—', normal: '—', low: '—', sum: '0,0', ti: '60', status: 'warn', note: 'Cần kiểm tra · luôn bằng 0' },
  { name: 'DHD14 · Silo nguyên liệu', area: 'Silo nguyên liệu', peak: '—', normal: '—', low: '—', sum: '—', ti: '50', status: 'wait', note: 'Chưa ghi · quá hạn 30/09' },
  { name: 'DHD27 · Nhà 3 tầng khu hành chính', area: 'Hành chính nhà máy', peak: '—', normal: '—', low: '—', sum: '—', ti: '20', status: 'wait', note: 'Chưa ghi · quá hạn 30/09' },
]

/* ---- Đồ thị điểm theo tháng: kỳ vọng minh hoạ f(x) = 43 + 300/x, điểm tháng là số giả lập quanh đường ---- */
export const expected = (vol: number) => 43 + 300 / vol
const VOLS = [6.2, 3.9, 7.4, 8.8, 9.6, 10.2, 10.0, 8.7, 7.9, 8.4, 7.1, 8.9, 6.5, 4.0, 7.7, 9.0, 9.9, 10.6, 10.3, 8.8, 8.0, 8.6, 7.3, 9.2, 6.8, 4.1, 7.9, 9.2, 10.1, 10.8, 10.4, 9.0]
const NOISE = [0.04, -0.03, 0.02, -0.05, 0.01, 0.06, -0.02, 0.03, -0.04, 0.0, 0.05, -0.01, 0.02, 0.07, -0.03, 0.01, -0.06, 0.02, 0.04, -0.02, 0.03, -0.05, 0.01, 0.0, 0.03, -0.02, 0.05, -0.01, 0.02, -0.04, 0.01, 0.02]

export type MonthPoint = { vol: number; v: number; label: string; kind: 'past' | 'prior' | 'current' }

/** 01/2024 → 08/2026 (32 tháng), 09/2025 là điểm cùng kỳ, thêm 09/2026. */
export const MONTH_POINTS: MonthPoint[] = [
  ...VOLS.map((vol, i): MonthPoint | null => {
    if (i === 20) return null
    const y = 2024 + Math.floor(i / 12)
    return { vol, v: expected(vol) * (1 + NOISE[i]), label: `T${(i % 12) + 1}/${y}`, kind: 'past' }
  }).filter((p): p is MonthPoint => p !== null),
  { vol: 8.3, v: 84, label: 'T9/2025', kind: 'prior' },
  { vol: 8.1, v: 83, label: 'T9/2026', kind: 'current' },
]

/* ---- Đồ thị theo ca (khu XLNC + XLNT, kWh/ca): số giả lập. Mốc = trung bình cùng ca kỳ so sánh, vùng bình thường ±15%. ---- */
type Lane = { name: string; cmp: number; mean: number; noise: number[]; out: [number, number][] }
const LANES: Lane[] = [
  { name: 'đêm', cmp: 620, mean: 640, noise: [0.05, 0.08, 0.03, 0.1, 0.06], out: [[17, 765]] },
  { name: 'sáng', cmp: 600, mean: 610, noise: [0.07, 0.04, 0.09, 0.05, 0.02], out: [] },
  { name: 'chiều', cmp: 575, mean: 560, noise: [0.06, 0.1, 0.04, 0.08, 0.03], out: [[23, 450]] },
]
export type ShiftPoint = { x: number; v: number; day: number; lane: number; out: boolean }
export const SHIFT_LANES = LANES.map((l) => ({ name: l.name, cmp: l.cmp }))
export const SHIFT_POINTS: ShiftPoint[] = LANES.flatMap((ln, k) =>
  Array.from({ length: 30 }, (_, d) => {
    const hit = ln.out.find((o) => o[0] === d + 1)
    const v = hit ? hit[1] : ln.mean * (1 + ln.noise[d % ln.noise.length] * (d % 3 === 1 ? -1 : 1) * 0.6)
    return { x: k * 34 + 2 + d, v, day: d + 1, lane: k, out: v > ln.cmp * 1.15 || v < ln.cmp * 0.85 }
  }),
)
