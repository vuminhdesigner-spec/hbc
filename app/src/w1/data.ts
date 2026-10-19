// FIXTURE minh hoạ, chép từ wireframe v0.3 / artifact W1 bản 38 — không phải số của nhà máy.

export type Metric = 'dien' | 'nuoc' | 'hoi'
export type Group = 'area' | 'stage'

export type Unit = {
  id: string
  name: string
  base: string | null
  bv?: number
  dien: number | null
  nuoc: number | null
  hoi: number | null
  dd?: number
  dn?: number
  dh?: number
  note: string
  warn?: boolean
}

export const UNITS: Record<Group, Unit[]> = {
  area: [
    { id: 'nau', name: 'Nấu', base: 'Dịch nha', bv: 8.6, dien: 62, nuoc: 7100, hoi: 1980, dd: -2.1, dn: -3.0, dh: -1.8, note: 'Đã trừ nhà ăn, hội trường (tự động)' },
    { id: 'locmen', name: 'Lọc – Men', base: 'Bia sau lọc', bv: 7.9, dien: 118, nuoc: 4200, hoi: 160, dd: 1.4, dn: 1.1, dh: 4.0, note: 'Men 1 + Men 2; lọc không đo điện riêng' },
    { id: 'lanh', name: 'Lạnh', base: 'Bia sau lọc', bv: 7.9, dien: 188, nuoc: 2300, hoi: null, dd: 3.8, dn: -2.2, note: 'Lạnh 2 đo chung ánh sáng men 2' },
    { id: 'keg', name: 'Chiết bia hơi (KEG)', base: 'Thành phẩm keg', bv: 8.1, dien: 92, nuoc: 3900, hoi: 470, dd: -0.6, dn: 0.4, dh: -0.9, note: 'Keg 1 + Keg 3 đo chung' },
    { id: 'chietnuoc', name: 'Chiết nước', base: 'Nước tinh lọc', bv: 1.2, dien: 26, nuoc: 1700, hoi: null, dd: 0.9, dn: 2.5, note: '' },
    { id: 'khinen', name: 'Khí nén', base: 'Thành phẩm', bv: 8.1, dien: 80, nuoc: null, hoi: null, dd: 6.2, note: 'Vượt kỳ vọng theo sản lượng +18,2%', warn: true },
    { id: 'xln', name: 'Xử lý nước', base: 'Thành phẩm', bv: 8.1, dien: 56, nuoc: null, hoi: null, dd: -1.0, note: '' },
    { id: 'tct', name: 'Khối TCT', base: null, dien: 41, nuoc: 1300, hoi: null, dd: 2.4, dn: 0.8, note: 'Không tính SEC khu sản xuất' },
    { id: 'nhaan', name: 'Nhà ăn, hội trường', base: null, dien: 9, nuoc: 700, hoi: null, dd: -0.8, dn: -1.5, note: 'Không tính SEC khu sản xuất' },
    { id: 'cpb', name: 'Chưa phân bổ (hơi)', base: null, dien: null, nuoc: null, hoi: 425, dh: 12.0, note: 'Đồng hồ tổng lò hơi − Σ 3 đồng hồ con' },
  ],
  stage: [
    { id: 's-nau', name: 'Nấu', base: 'Dịch nha', bv: 8.6, dien: 62, nuoc: 7100, hoi: 1980, dd: -2.1, dn: -3.0, dh: -1.8, note: '' },
    { id: 's-lm', name: 'Lên men – Lọc', base: 'Bia sau lọc', bv: 7.9, dien: 118, nuoc: 4200, hoi: 160, dd: 1.4, dn: 1.1, dh: 4.0, note: 'Mẫu số chờ nhà máy xác nhận' },
    { id: 's-chiet', name: 'Chiết', base: 'Thành phẩm', bv: 9.3, dien: 118, nuoc: 5600, hoi: 470, dd: -0.3, dn: 1.0, dh: -0.9, note: 'Keg + chiết nước' },
    { id: 's-pt', name: 'Phụ trợ', base: 'Thành phẩm', bv: 9.3, dien: 324, nuoc: 2300, hoi: null, dd: 3.1, dn: -2.2, note: 'Lạnh, khí nén, xử lý nước' },
    { id: 's-ngoai', name: 'Ngoài sản xuất', base: null, dien: 50, nuoc: 2000, hoi: null, dd: 1.8, dn: 0.2, note: 'Khối TCT, nhà ăn, hội trường' },
    { id: 's-cpb', name: 'Chưa phân bổ (hơi)', base: null, dien: null, nuoc: null, hoi: 425, dh: 12.0, note: 'Đồng hồ tổng lò hơi − Σ 3 đồng hồ con' },
  ],
}

export const DELTA_KEY = { dien: 'dd', nuoc: 'dn', hoi: 'dh' } as const
export const FACTORY_TOTAL: Record<Metric, number> = { dien: 672, nuoc: 27540, hoi: 3035 }
/** Thành phẩm tháng 9, triệu lít */
export const FINISHED_ML = 8.1

export const VOLUME = [6.8, 4.1, 7.9, 9.2, 10.1, 10.8, 10.4, 9.0, 8.1]
export const VOLUME_PRIOR = [6.6, 4.3, 7.6, 9.0, 9.8, 10.5, 10.2, 8.8, 8.3]

export type MetricDef = {
  name: string
  title: string
  unit: string
  cur: number[]
  prior: number[]
  ref: number | null
  refLabel?: string
  dec: number
  dom?: [number, number]
  step?: number
}

export const METRICS: Record<Metric, MetricDef> = {
  dien: { name: 'Điện', title: 'Điện trên 1.000 L theo tháng', unit: 'kWh/1.000 L', cur: [92, 108, 86, 79, 74, 72, 73, 78, 83], prior: [95, 104, 88, 81, 77, 74, 75, 80, 84], ref: 105, refLabel: 'Định mức 105', dec: 1, dom: [65, 112], step: 10 },
  nuoc: { name: 'Nước', title: 'Nước trên 1.000 L theo tháng', unit: 'm³/1.000 L', cur: [3.9, 4.6, 3.7, 3.4, 3.2, 3.1, 3.2, 3.3, 3.4], prior: [4.0, 4.4, 3.8, 3.5, 3.3, 3.2, 3.3, 3.4, 3.5], ref: null, dec: 2 },
  hoi: { name: 'Hơi', title: 'Hơi trên 1.000 L theo tháng', unit: 'kg/1.000 L', cur: [208, 337, 322, 365, 318, 327, 367, 325, 375], prior: [215, 330, 330, 372, 326, 335, 371, 333, 381], ref: null, dec: 0 },
}

export const SEC = {
  cur: [1475, 1705, 1415, 1345, 1295, 1275, 1285, 1325, 1365],
  prior: [1490, 1690, 1430, 1360, 1310, 1290, 1300, 1340, 1380],
  ceiling: 1486,
  warnAt: 1337,
  forecast: 1371,
}

export type AlertId = 'sec' | 'khinen' | 'hoi' | 'nuoc' | 'ghiso'
export type Alert = { id: AlertId; value: string; text: string; kind: 'warn' | 'over'; label: string }

export const ALERTS: Alert[] = [
  { id: 'sec', value: '91% / 90%', text: 'SEC khu sản xuất gần trần', kind: 'warn', label: 'Gần trần' },
  { id: 'khinen', value: '+18,2% / 15%', text: 'Khí nén so kỳ vọng theo sản lượng', kind: 'over', label: 'Vượt' },
  { id: 'hoi', value: '14,0% / 10%', text: 'Hơi: lò hơi lệch Σ 3 đồng hồ con', kind: 'warn', label: 'Lệch' },
  { id: 'nuoc', value: '+32%', text: 'Nước sạch ca chiều 28/09 so trung bình ca', kind: 'warn', label: 'Bất thường' },
  { id: 'ghiso', value: '2 đồng hồ', text: 'Điện chưa ghi số, quá hạn 30/09', kind: 'warn', label: 'Chưa ghi' },
]

export const SERIES_COLOR: Record<Metric, string> = {
  dien: 'var(--chart-1)',
  nuoc: 'var(--chart-2)',
  hoi: 'var(--chart-3)',
}

export const fmt = (v: number, d: number) =>
  v.toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d })

export const pct = (v: number) => (v > 0 ? '▲ ' : v < 0 ? '▼ ' : '') + fmt(Math.abs(v), 1) + '%'
