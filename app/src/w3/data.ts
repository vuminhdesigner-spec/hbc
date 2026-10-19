// FIXTURE minh hoạ, chép từ wireframe v0.3 board Nước + Cân bằng nước (design/wireframe-nang-luong/v03, đã review 19/10) — không phải số của nhà máy.
// Trần giếng, trần xả thải là số giả định để vẽ (chờ giấy phép). Đấu nối giếng, GTT, NS26 và vị trí bể chứa chưa xác nhận.

/* ---------- Màn Tiêu thụ ---------- */

export const KPI = [
  {
    title: 'Nước sạch / 1.000 L',
    value: 3.4,
    dec: 2,
    unit: 'm³',
    note: '▼ 2,9% cùng kỳ · kỳ vọng 3,38',
  },
  {
    title: 'Nước nấu / 1.000 L dịch nha',
    value: 1.8,
    dec: 2,
    unit: 'm³',
    note: '15.500 m³ · ▼ 1,1% cùng kỳ',
  },
  {
    title: 'Nước mềm / 1.000 L',
    value: 0.36,
    dec: 2,
    unit: 'm³',
    note: '2.900 m³ · gồm 800 cấp lò hơi',
  },
  {
    title: 'Khai thác giếng',
    value: 30300,
    dec: 0,
    unit: 'm³',
    note: 'Cao nhất 1.147 m³/ngày đêm · chờ giấy phép',
  },
  {
    title: 'Nước xả thải',
    value: 25500,
    dec: 0,
    unit: 'm³',
    note: '84,2% nước cấp · cao nhất 1.035 m³/ngày đêm',
  },
]

/** [tên, tháng 9/2026 m³, cùng kỳ 2025 m³]. Công đoạn cộng từ khu vực, khớp Tổng quan. */
export const ALLOC: Record<'area' | 'stage', [string, number, number][]> = {
  area: [
    ['Nấu', 7100, 7320],
    ['Lọc – Men', 4200, 4150],
    ['Chiết bia hơi (KEG)', 3900, 3880],
    ['Lạnh', 2300, 2350],
    ['Chiết nước', 1700, 1660],
    ['Khối TCT', 1300, 1290],
    ['Nhà ăn, hội trường', 700, 710],
  ],
  stage: [
    ['Nấu', 7100, 7320],
    ['Chiết', 5600, 5540],
    ['Lên men – Lọc', 4200, 4150],
    ['Phụ trợ', 2300, 2350],
    ['Ngoài sản xuất', 2000, 2000],
  ],
}
export const ALLOC_SUM = 21200
export const CLEAN_TOTAL = 27540

/* ---- Cột theo ngày: giếng và xả thải (m³/ngày đêm), số giả lập quanh trung bình ---- */
const NOISE_WELL = [10, -30, 40, 20, -10, 60, 30, -20, 0, 15, -40, 25, 50, 160, 5, -25, 35, 10, -15, 140, 20, -35, 45, 0, 30, 175, -10, 15, -20, 25]
const NOISE_WASTE = [20, -15, 30, 0, 10, -25, 40, 15, -10, 5, 25, -20, 35, 10, 0, -30, 20, 45, -5, 15, 30, -10, 230, 5, -20, 10, 25, -15, 0, 20]
const daily = (base: number, amp: number, noise: number[]) => noise.map((n, i) => ({ day: i + 1, v: base + amp * Math.sin(i / 4.2) + n }))

/** Tỷ lệ từng giếng trong tổng khai thác tháng (G1 7.700, G2 8.000, G3 7.000, G4 7.600 / 30.300). */
export const WELLS = [
  ['tong', 'Tổng', 1],
  ['g1', 'G1', 7700 / 30300],
  ['g2', 'G2', 8000 / 30300],
  ['g3', 'G3', 7000 / 30300],
  ['g4', 'G4', 7600 / 30300],
] as const

export const WELL_DAILY = daily(985, 40, NOISE_WELL)
export const WELL_CAP = 1100
export const WASTE_DAILY = daily(835, 35, NOISE_WASTE)
export const WASTE_CAP = 1000

/* ---- Đồ thị điểm theo tháng: kỳ vọng minh hoạ f(x) = 1,9 + 12/x (m³/1.000 L) ---- */
export const expected = (vol: number) => 1.9 + 12 / vol
const VOLS = [6.2, 3.9, 7.4, 8.8, 9.6, 10.2, 10.0, 8.7, 7.9, 8.4, 7.1, 8.9, 6.5, 4.0, 7.7, 9.0, 9.9, 10.6, 10.3, 8.8, 8.0, 8.6, 7.3, 9.2, 6.8, 4.1, 7.9, 9.2, 10.1, 10.8, 10.4, 9.0]
const NOISE = [-0.03, 0.05, 0.01, -0.02, 0.04, -0.05, 0.02, 0.0, 0.03, -0.04, 0.06, 0.01, -0.02, 0.03, -0.01, 0.05, -0.03, 0.02, 0.0, -0.06, 0.04, 0.01, -0.02, 0.03, 0.02, -0.04, 0.01, 0.03, -0.02, 0.0, 0.02, -0.01]

export type MonthPoint = {
  vol: number
  v: number
  label: string
  kind: 'past' | 'prior' | 'current'
}

export const MONTH_POINTS: MonthPoint[] = [
  ...VOLS.map((vol, i): MonthPoint | null => {
    if (i === 20) return null
    return {
      vol,
      v: expected(vol) * (1 + NOISE[i]),
      label: `T${(i % 12) + 1}/${2024 + Math.floor(i / 12)}`,
      kind: 'past',
    }
  }).filter((p): p is MonthPoint => p !== null),
  { vol: 8.3, v: 3.5, label: 'T9/2025', kind: 'prior' },
  { vol: 8.1, v: 3.4, label: 'T9/2026', kind: 'current' },
]

/* ---- Theo ca: nước sạch SX, m³/ca. Mốc = trung bình cùng ca kỳ so sánh; trên +15% là Vượt, dưới −15% là Thấp bất thường ---- */
type Lane = {
  name: string
  cmp: number
  mean: number
  noise: number[]
  out: [number, number][]
}
const LANES: Lane[] = [
  {
    name: 'đêm',
    cmp: 320,
    mean: 330,
    noise: [0.06, 0.03, 0.09, 0.05, 0.07],
    out: [[20, 262]],
  },
  {
    name: 'sáng',
    cmp: 318,
    mean: 315,
    noise: [0.04, 0.08, 0.05, 0.1, 0.03],
    out: [[14, 398]],
  },
  {
    name: 'chiều',
    cmp: 300,
    mean: 312,
    noise: [0.07, 0.05, 0.03, 0.09, 0.06],
    out: [[28, 412]],
  },
]
export type ShiftState = 'ok' | 'over' | 'under'
export type ShiftPoint = {
  x: number
  v: number
  day: number
  lane: number
  state: ShiftState
}
export const SHIFT_LANES = LANES.map((l) => ({ name: l.name, cmp: l.cmp }))
export const SHIFT_POINTS: ShiftPoint[] = LANES.flatMap((ln, k) =>
  Array.from({ length: 30 }, (_, d) => {
    const hit = ln.out.find((o) => o[0] === d + 1)
    const v = hit ? hit[1] : ln.mean * (1 + ln.noise[d % ln.noise.length] * (d % 3 === 1 ? -1 : 1) * 0.6)
    const state: ShiftState = v > ln.cmp * 1.15 ? 'over' : v < ln.cmp * 0.85 ? 'under' : 'ok'
    return { x: k * 34 + 2 + d, v, day: d + 1, lane: k, state }
  }),
)

export type ShiftRow = {
  day: string
  shift: string
  meter: string
  v: number
  cmp: number
  state: 'over' | 'under'
}
export const SHIFTS: ShiftRow[] = [
  {
    day: '28/09',
    shift: 'chiều',
    meter: 'Nước sạch SX (ĐH điện)',
    v: 412,
    cmp: 300,
    state: 'over',
  },
  {
    day: '20/09',
    shift: 'đêm',
    meter: 'Nước sạch SX (ĐH điện)',
    v: 262,
    cmp: 320,
    state: 'under',
  },
  {
    day: '20/09',
    shift: 'đêm',
    meter: 'Nước nấu tổng tại XLN',
    v: 268,
    cmp: 206,
    state: 'over',
  },
  {
    day: '14/09',
    shift: 'sáng',
    meter: 'Giếng G3',
    v: 118,
    cmp: 92,
    state: 'over',
  },
  {
    day: '09/09',
    shift: 'chiều',
    meter: 'Nước vào UASB',
    v: 336,
    cmp: 280,
    state: 'over',
  },
]

/* ---------- Màn Cân bằng nước ---------- */

export const BALANCE_KPI = [
  {
    title: 'Nước giếng khai thác (G1–G4)',
    value: 30300,
    unit: 'm³',
    note: 'Đấu nối GTT chờ nhà máy xác nhận',
  },
  {
    title: 'Nước sạch nhà máy',
    value: 27540,
    unit: 'm³',
    note: 'Đồng hồ tổng 26.240 + nhánh NS26 1.300',
  },
]

/** Nút sơ đồ dòng nước; loss = nhánh thất thoát / chưa đo (vẽ viền đứt). */
export const FLOW_NODES: { name: string; loss?: boolean }[] = [
  { name: 'G1' },
  { name: 'G2' },
  { name: 'G3' },
  { name: 'G4' },
  { name: 'Nước thô' },
  { name: 'Thất thoát', loss: true },
  { name: 'Nước trung gian (bể)' },
  { name: 'Xả rửa, thất thoát', loss: true },
  { name: 'Nước sạch tổng' },
  { name: 'Nhánh NS26' },
  { name: 'Chênh qua bể chứa', loss: true },
  { name: 'Nấu' },
  { name: 'Lọc – Men' },
  { name: 'Chiết bia hơi (KEG)' },
  { name: 'Nước mềm (XLNC)' },
  { name: 'Lạnh' },
  { name: 'Chiết nước' },
  { name: 'Sục rửa lọc' },
  { name: 'Nhà ăn, hội trường' },
  { name: 'Chưa đo (tổng − các con)', loss: true },
  { name: 'Khối TCT' },
]

/** [nguồn, đích, m³] theo chỉ số trong FLOW_NODES. */
export const FLOW_LINKS: [number, number, number][] = [
  [0, 4, 7500],
  [1, 4, 7800],
  [2, 4, 6900],
  [3, 4, 7600],
  [0, 5, 200],
  [1, 5, 200],
  [2, 5, 100],
  [4, 6, 29300],
  [4, 7, 500],
  [6, 8, 26240],
  [6, 9, 1300],
  [6, 10, 1760],
  [8, 11, 7100],
  [8, 12, 4200],
  [8, 13, 3900],
  [8, 14, 2900],
  [8, 15, 2300],
  [8, 16, 1700],
  [8, 17, 1400],
  [8, 18, 700],
  [8, 19, 2040],
  [9, 20, 1300],
]

export type BalanceState = 'ok' | 'warn' | 'tank'
/** Bảng đối chiếu cha – con: level 0 = nguồn; sum = tổng đồng hồ con trực tiếp (null nếu không có con đo được). */
export type BalanceRow = {
  name: string
  level: 0 | 1 | 2 | 3
  depth: number
  v: number
  sum: number | null
  state: BalanceState | null
}
export const BALANCE: BalanceRow[] = [
  {
    name: 'Giếng G1–G4',
    level: 0,
    depth: 0,
    v: 30300,
    sum: 29800,
    state: 'ok',
  },
  {
    name: 'Nước thô (ĐH điện)',
    level: 1,
    depth: 0,
    v: 29800,
    sum: 29300,
    state: 'ok',
  },
  {
    name: 'Nước trung gian',
    level: 1,
    depth: 1,
    v: 29300,
    sum: 27540,
    state: 'tank',
  },
  {
    name: 'Nước sạch tổng (ĐH điện)',
    level: 1,
    depth: 2,
    v: 26240,
    sum: 24200,
    state: 'ok',
  },
  { name: 'Nấu', level: 2, depth: 3, v: 7100, sum: 6300, state: 'warn' },
  {
    name: 'ĐH nước nấu nhà nấu',
    level: 3,
    depth: 4,
    v: 5600,
    sum: null,
    state: null,
  },
  { name: 'Rửa nhà nấu', level: 3, depth: 4, v: 700, sum: null, state: null },
  { name: 'Lọc – Men', level: 2, depth: 3, v: 4200, sum: 4100, state: 'ok' },
  {
    name: 'Chiết bia hơi (KEG)',
    level: 2,
    depth: 3,
    v: 3900,
    sum: 3800,
    state: 'ok',
  },
  {
    name: 'Nước mềm (XLNC)',
    level: 2,
    depth: 3,
    v: 2900,
    sum: 2800,
    state: 'ok',
  },
  { name: 'Lạnh', level: 2, depth: 3, v: 2300, sum: 2200, state: 'ok' },
  { name: 'Chiết nước', level: 2, depth: 3, v: 1700, sum: null, state: null },
  { name: 'Sục rửa lọc', level: 2, depth: 3, v: 1400, sum: null, state: null },
  {
    name: 'Nhà ăn, hội trường',
    level: 2,
    depth: 3,
    v: 700,
    sum: null,
    state: null,
  },
  {
    name: 'Nhánh NS26 (không qua ĐH tổng)',
    level: 1,
    depth: 2,
    v: 1300,
    sum: 1300,
    state: 'ok',
  },
  { name: 'Khối TCT', level: 2, depth: 3, v: 1300, sum: null, state: null },
]
