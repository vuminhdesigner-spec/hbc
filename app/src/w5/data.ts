// FIXTURE minh hoạ, chép từ wireframe board Hơi (design/wireframe-nang-luong/Hoi.dc.html, bản "Điện + biomass" 19/10).
// Tấn hơi và tấn biomass T1–T9/2026 theo số liệu hơi của nhà máy (biomass tháng 9 chưa có số).
// Phân bổ công đoạn, cùng kỳ, sản lượng, đồ thị điểm và ca: số giả lập.

import type { MeterStatus } from '../w2/data'

export type SteamNode = {
  id: string
  name: string
  t: number
  share: string
  sub: string
  warn?: boolean
  muted?: boolean
  children?: SteamNode[]
}

export const STEAM_TREE: SteamNode = {
  id: 'boiler',
  name: 'Đồng hồ tổng lò hơi',
  t: 3035,
  share: '100%',
  sub: 'Số tiêu thụ của nhà máy · tổng con 2.610 · lệch 14,0%',
  warn: true,
  children: [
    { id: 'nau', name: 'Nấu', t: 1980, share: '65%', sub: 'Đồng hồ mới từ 06/2026 · trước đó chưa có số' },
    { id: 'loc', name: 'Lọc', t: 160, share: '5%', sub: 'Đồng hồ hơi lọc' },
    { id: 'keg', name: 'Chiết keg', t: 470, share: '15%', sub: 'Đồng hồ hơi keg' },
    { id: 'loss', name: 'Thất thoát / chưa đo', t: 425, share: '14%', sub: '= tổng − 3 đồng hồ con', muted: true },
  ],
}

export const KPI = {
  perL: { value: 375, unit: 'kg', note: '▼ 1,6% cùng kỳ' },
  total: { value: 3035, unit: 'tấn', note: '▲ 3,8% so tháng trước' },
  biomass: { value: 1136, unit: 'tấn', note: '0,39 t / tấn hơi · tháng 9 chưa có số' },
  read: { done: 4, total: 4, note: 'Không có số cần kiểm tra' },
}

/** [công đoạn, tháng 9/2026 tấn, cùng kỳ 2025 tấn (null = chưa có số), cơ sở chia riêng của công đoạn, là phần thất thoát] — xếp từ lớn nhất. */
export const ALLOC: [string, number, number | null, string, boolean][] = [
  ['Nấu', 1980, null, '230 kg/1.000 L dịch nha', false],
  ['Chiết keg', 470, 474, '58 kg/1.000 L thành phẩm keg', false],
  ['Thất thoát / chưa đo', 425, null, 'Tổng − 3 đồng hồ con', true],
  ['Lọc', 160, 154, '20 kg/1.000 L bia sau lọc', false],
]

/** Tấn hơi và tấn biomass theo tháng 2026; null = chưa có số. */
export const STEAM_T = [1415, 1383, 2547, 3354, 3213, 3528, 3816, 2924, 3035]
export const BIOMASS_T: (number | null)[] = [523.75, 446.15, 995.22, 1130.57, 1150.5, 1300.16, 1235.51, 1136, null]

export type SteamMeter = { name: string; stage: string; t: string; share: string; status: MeterStatus; note: string; muted?: boolean }
export const METERS: SteamMeter[] = [
  { name: 'Đồng hồ tổng lò hơi', stage: 'Toàn nhà máy', t: '3.035', share: '100%', status: 'ok', note: 'Đã ghi · 30/09' },
  { name: 'Đồng hồ hơi nấu', stage: 'Nấu', t: '1.980', share: '65,2%', status: 'ok', note: 'Đã ghi · 30/09 · mới từ 06/2026' },
  { name: 'Đồng hồ hơi lọc', stage: 'Lọc', t: '160', share: '5,3%', status: 'ok', note: 'Đã ghi · 30/09' },
  { name: 'Đồng hồ hơi keg', stage: 'Chiết keg', t: '470', share: '15,5%', status: 'ok', note: 'Đã ghi · 30/09' },
  { name: 'Thất thoát / chưa đo', stage: '—', t: '425', share: '14,0%', status: 'ok', note: '= tổng − 3 đồng hồ con', muted: true },
]

/* ---- Đồ thị điểm theo tháng: kỳ vọng minh hoạ f(x) = 270 + 600/x, điểm tháng là số giả lập quanh đường ---- */
export const expected = (vol: number) => 270 + 600 / vol
const VOLS = [6.2, 3.9, 7.4, 8.8, 9.6, 10.2, 10.0, 8.7, 7.9, 8.4, 7.1, 8.9, 6.5, 4.0, 7.7, 9.0, 9.9, 10.6, 10.3, 8.8, 8.0, 8.6, 7.3, 9.2, 6.8, 4.1, 7.9, 9.2, 10.1, 10.8, 10.4, 9.0]
const NOISE = [0.05, -0.04, 0.02, -0.03, 0.06, -0.01, 0.03, -0.05, 0.0, 0.04, -0.02, 0.01, -0.06, 0.03, 0.05, -0.02, 0.01, -0.04, 0.02, 0.06, -0.03, 0.0, 0.04, -0.01, 0.02, -0.05, 0.03, 0.01, -0.02, 0.04, -0.03, 0.02]

export type MonthPoint = { vol: number; v: number; label: string; kind: 'past' | 'prior' | 'current' }

export const MONTH_POINTS: MonthPoint[] = [
  ...VOLS.map((vol, i): MonthPoint | null => {
    if (i === 20) return null
    const y = 2024 + Math.floor(i / 12)
    return { vol, v: expected(vol) * (1 + NOISE[i]), label: `T${(i % 12) + 1}/${y}`, kind: 'past' }
  }).filter((p): p is MonthPoint => p !== null),
  { vol: 8.3, v: 381, label: 'T9/2025', kind: 'prior' },
  { vol: 8.1, v: 375, label: 'T9/2026', kind: 'current' },
]

/* ---- Theo ca (tấn hơi/ca): số giả lập. Mốc = trung bình cùng ca kỳ so sánh, vùng bình thường ±15%. ---- */
type Lane = { name: string; cmp: number; mean: number; noise: number[]; out: [number, number][] }
const LANES: Lane[] = [
  { name: 'đêm', cmp: 35, mean: 36, noise: [0.06, 0.03, 0.08, 0.05, 0.04], out: [[21, 28]] },
  { name: 'sáng', cmp: 36, mean: 35, noise: [0.05, 0.07, 0.03, 0.09, 0.06], out: [] },
  { name: 'chiều', cmp: 31, mean: 30, noise: [0.08, 0.04, 0.06, 0.03, 0.07], out: [[9, 37.5]] },
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
