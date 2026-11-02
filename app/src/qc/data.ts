// Các mục báo cáo dựng từ dữ liệu gốc tháng 08/2026 (report.ts). Mục 14 (kho) bỏ theo recap họp.
// Trạng thái không chép nhãn "ĐẠT 100%" của hệ thống mà tự tính lại từ Min/Max so với TC (người dùng chọn 30/10).
// TC nguồn nước lấy theo dòng TC trên bảng portal, vì TC trong backend khác bảng (đã báo lại).
import { R, parseSpec, type RawInd, type Spec } from './report'

export type { Spec }
export type Status = 'ok' | 'warn' | 'over' | 'none'

export type Check = {
  /** Khoá trong dữ liệu gốc; trùng khoá chuỗi SPC thì bấm dòng để đổi đồ thị */
  key: string
  /** Dòng nước / dòng sản phẩm, nếu mục có nhiều dòng */
  group?: string
  name: string
  unit: string
  spec: Spec | null
  min?: number
  avg?: number
  max?: number
  n?: number
  dec: number
  /** TC ghi nguyên văn khi portal viết khác dạng khoảng (ví dụ "35±2") */
  tcText?: string
  /** Hậu quả nói bằng lời thường, cho Ban giám đốc (theo đặc tả) */
  impact?: string
}

export type Section = {
  no: number
  /** Tên ngắn như mục lục của app Habeco */
  name: string
  /** Tiêu đề mục như app Habeco */
  title: string
  /** Nhãn đầu mục như app Habeco (nguồn, phạm vi) */
  tags: string[]
  source: string
  samples: string
  checks: Check[]
  /** Trạng thái đặt tay khi không tính từ số (cảm quan, chưa có dữ liệu) */
  manual?: { status: Status; reason: string }
  notes: string[]
}

export const fmt = (v: number, d: number) => v.toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d })

export const decOf = (...vs: (number | null | undefined)[]) =>
  Math.min(3, Math.max(0, ...vs.filter((v): v is number => v != null).map((v) => (String(v).split('.')[1] ?? '').length)))

const num = (v: number | null | undefined) => (v == null ? undefined : v)

/** Một chỉ tiêu SAP/biểu mẫu thành Check; ghi lại TC đọc không được hoặc nhập sai. */
function ind(key: string, r: RawInd, notes: string[], o: { name?: string; group?: string; impact?: string } = {}): Check {
  const { spec, issue } = parseSpec(r.tieu_chuan)
  if (issue) notes.push(`${o.group ? o.group + ' · ' : ''}${o.name ?? r.ten_chi_tieu}: ${issue}.`)
  return {
    key,
    group: o.group,
    name: o.name ?? r.ten_chi_tieu.replace(/\s+/g, ' ').trim(),
    unit: r.don_vi?.trim() ?? '',
    spec,
    min: num(r.min),
    avg: num(r.trung_binh),
    max: num(r.max),
    n: r.so_mau || undefined,
    dec: Math.max(decOf(r.min, r.max) || decOf(r.trung_binh), decOf(spec?.lo, spec?.hi)),
    tcText: r.tieu_chuan?.includes('±') ? r.tieu_chuan.replace(/\s+/g, '') : undefined,
    impact: o.impact,
  }
}

const sp = (lo?: number, hi?: number, loStrict = false, hiStrict = false): Spec => ({ lo, hi, loStrict, hiStrict })

/* ── Mục 1 · Nước: TC theo bảng portal ── */

const WATER_NAME: Record<string, [string, string]> = {
  ph: ['pH', ''],
  do_trong: ['Độ trong', 'EBC'],
  kiem_tong: ['Kiềm tổng', 'mg CaCO₃/l'],
  do_cung: ['Độ cứng', '°H'],
  ca2: ['Ca²⁺', 'mg/l'],
  mg2: ['Mg²⁺', 'mg/l'],
  clo_du: ['Clo dư', 'mg/l'],
  fe2: ['Fe²⁺', 'mg/l'],
  mn2: ['Mn²⁺', 'mg/l'],
}
const WATER_SPEC: Record<'nuoc_nau' | 'nuoc_mem' | 'nuoc_sinh_hoat', Record<string, Spec | null>> = {
  nuoc_nau: { ph: sp(6.8, 7.2), do_trong: sp(undefined, 0.5), kiem_tong: sp(30, 60), do_cung: sp(undefined, 6), ca2: sp(30, 60), mg2: sp(undefined, 20), clo_du: sp(undefined, 0.01, false, true), fe2: sp(undefined, 0.05), mn2: sp(undefined, 0.05, false, true) },
  nuoc_mem: { ph: sp(7, 8), do_trong: sp(undefined, 0.5, false, true), kiem_tong: null, do_cung: sp(undefined, 1.4), ca2: sp(undefined, 2.4), mg2: null, clo_du: sp(undefined, 0.15), fe2: sp(undefined, 0.1), mn2: sp(undefined, 0.05) },
  nuoc_sinh_hoat: { ph: sp(6.5, 8.5), do_trong: sp(undefined, 0.5, false, true), kiem_tong: null, do_cung: sp(undefined, 11), ca2: null, mg2: null, clo_du: sp(0.15, 0.3), fe2: sp(undefined, 0.2), mn2: null },
}
export const WATER_LINES = [
  ['nuoc_nau', 'Nước nấu'],
  ['nuoc_mem', 'Nước mềm'],
  ['nuoc_sinh_hoat', 'Nước sinh hoạt'],
] as const
const WATER_IMPACT: Record<string, string> = {
  'nuoc_nau.clo_du': 'Clo dư trong nước nấu làm hỏng men và gây mùi lạ cho cả mẻ bia.',
  'nuoc_mem.do_cung': 'Nước mềm cứng quá 1,4 °H làm hỏng men.',
  'nuoc_sinh_hoat.clo_du': 'Nước sinh hoạt dùng cho vệ sinh, CIP; không đi vào bia.',
}

function water(notes: string[]): Check[] {
  const out: Check[] = []
  for (const [line, groupLabel] of WATER_LINES) {
    const m = R.muc_1_nuoc.dong_nuoc[line].metrics
    for (const k of Object.keys(WATER_NAME)) {
      const v = m[k]
      if (!v) continue
      const [name, unit] = WATER_NAME[k]
      out.push({ key: k, group: groupLabel, name, unit, spec: WATER_SPEC[line][k], min: v.min, avg: v.tb, max: v.max, dec: decOf(v.min, v.max), impact: WATER_IMPACT[`${line}.${k}`] })
    }
  }
  notes.push('TC trong backend khác bảng (vd. nước mềm: pH 6,8–7,2 và Clo < 0,01); đang dùng TC theo bảng.')
  notes.push('Kiềm tổng nước mềm, nước sinh hoạt và Mn²⁺ nước sinh hoạt (0,5 mg/l) chưa có TC để so.')
  return out
}

/* ── Các mục ── */

function build(): Omit<Section, 'title' | 'tags'>[] {
  const n1: string[] = []
  const n2: string[] = []
  const n3: string[] = []
  const n4: string[] = []
  const n5: string[] = []
  const n6: string[] = []
  const d2 = R.muc_2_dich_nha
  const d3 = R.muc_3_len_men
  const d4 = R.muc_4_btp
  const d5 = R.muc_5_sau_loc.dong_san_pham
  const d6 = R.muc_6_thanh_pham.san_phams
  const d8 = R.muc_8_co2_daw
  const d9 = R.muc_9_vi_sinh
  const d10 = R.muc_10_khieu_nai
  const sk = d3.sinh_khoi_men
  const bq = d3.bao_quan_men
  const lmc = d4.so_ngay_cho_loc

  const microMax = (k: string) => Math.max(...d9.danh_sach_nhom.map((g) => Number(g.max[k]) || 0))
  const lots = R.muc_13_nvl.danh_sach_lo
  const lotsOk = lots.filter((l) => l.ket_luan === 'Đạt').reduce((s, l) => s + l.so_lo_count, 0)
  const lotsAll = lots.reduce((s, l) => s + l.so_lo_count, 0)

  const productChecks = (p: keyof typeof d6, groupLabel: string) => Object.entries(d6[p].chi_tieus).map(([k, r]) => ind(k, r, n6, { group: groupLabel }))

  return [
    { no: 1, name: 'Nguồn nước sản xuất', source: 'Biểu mẫu KCS Nước', samples: `Nước nấu ${R.muc_1_nuoc.spc_records.length} đợt; nước mềm, sinh hoạt theo kế hoạch`, checks: water(n1), notes: n1 },
    {
      no: 2,
      name: 'Dịch nha lạnh',
      source: 'SAP ZRQM001',
      samples: `${d2.so_me_nau} mẻ nấu · ${fmt(d2.san_luong_tb_me, 1)} hl/mẻ`,
      checks: Object.entries(d2.chi_tieus)
        .filter(([k]) => k !== 'san_luong')
        .map(([k, r]) =>
          ind(k, r, n2, {
            name: k === 'do_duong' ? 'Độ đường' : k === 'duong_sot' ? 'Đường sót + bột sót (bã)' : undefined,
            impact: k === 'do_duong' ? 'Độ đường lệch làm lệch độ cồn và hương vị bia.' : k === 'do_mau' ? 'Màu bia thành phẩm không đều giữa các mẻ.' : undefined,
          }),
        ),
      notes: n2,
    },
    {
      no: 3,
      name: 'Lên men & men giống',
      source: 'SAP ZRQM001 + KCS Lên men',
      samples: `${d3.so_tank} tank`,
      checks: [
        { key: 'pz', name: 'Pz hạ lạnh', unit: '°P', spec: sp(3.5, 3.7), min: d3.pz_ha_lanh_min, avg: d3.pz_ha_lanh_tb, max: d3.pz_ha_lanh_max, n: d3.so_tank, dec: 2 },
        ind('day_bon', sk.day_bon, n3, { name: 'Mật độ men khi đầy bồn' }),
        ind('cuc_dai', sk.cuc_dai, n3, { name: 'Mật độ men cực đại' }),
        ind('ha_lanh', sk.ha_lanh, n3, { name: 'Mật độ men khi hạ lạnh' }),
        ind('truoc_loc', sk.truoc_loc, n3, { name: 'Mật độ men trước lọc', impact: 'Men chưa lắng hết khi chuyển lọc: tải máy lọc, bia dễ đục và có mùi men.' }),
        { key: 'bq', name: 'Thời gian bảo quản men', unit: 'giờ', spec: sp(undefined, 72, false, true), avg: bq.thoi_gian_bao_quan_tb, max: bq.thoi_gian_bao_quan_max, dec: 0 },
        { key: 'chet', name: 'Tỷ lệ men chết', unit: '%', spec: sp(undefined, 5, false, true), avg: bq.ty_le_chet_tb, max: bq.ty_le_chet_max, dec: 2 },
      ],
      notes: [...n3, `${d3.so_tank_duoi_4_ngay} tank lên men chính dưới 4 ngày (nhanh); chưa có ngưỡng nên không tính là lỗi.`],
    },
    {
      no: 4,
      name: 'Bia trước lọc',
      source: 'SAP ZRQM001 + COOISPI',
      samples: `${d4.so_mau} mẻ · ${lmc.tong_so_tank_da_loc} tank đã lọc`,
      checks: [
        ...Object.entries(d4.chi_tieus)
          .filter(([k]) => k !== 'chua')
          .map(([k, r]) =>
            ind(k, r, n4, {
              name: k === 'vdk' ? 'VDK (diacetyl)' : undefined,
              impact: k === 'vdk' ? 'VDK trên 0,10 là bia chưa chín, còn mùi bơ; không được chuyển sang lọc.' : undefined,
            }),
          ),
        { key: 'ngay_loc', name: 'Số ngày cho lọc', unit: 'ngày', spec: parseSpec(lmc.tieu_chuan.replace('ngày', '')).spec, min: lmc.thoi_gian_lm_min, avg: lmc.thoi_gian_lm_tb, max: lmc.thoi_gian_lm_max, n: lmc.tong_so_tank_da_loc, dec: 0 },
      ],
      notes: [...n4, 'Backend đếm 106 mẫu cho mỗi chỉ tiêu trong khi kỳ có 53 mẻ (có thể đếm trùng).'],
    },
    {
      no: 5,
      name: 'Bia sau lọc',
      source: 'SAP ZRQM001',
      samples: `Keg ${d5.keg.so_mau} mẻ · PET ${d5.pet.so_mau} mẻ`,
      checks: [
        ...Object.entries(d5.keg.chi_tieus).map(([k, r]) => ind(k, r, n5, { group: 'Keg', impact: k === 'co2' ? 'Bia thiếu ga: ít bọt, nhạt; dễ bị khiếu nại non ga.' : undefined })),
        ...Object.entries(d5.pet.chi_tieus).map(([k, r]) => ind(k, r, n5, { group: 'PET' })),
      ],
      notes: n5,
    },
    {
      no: 6,
      name: 'Bia thành phẩm',
      source: 'SAP ZRQM001 (loại 04)',
      samples: `${Object.values(d6).reduce((s, p) => s + p.so_mau, 0)} lô chiết, 4 sản phẩm`,
      checks: [...productChecks('keg_50l_mb', 'Keg 50 L MB'), ...productChecks('keg_50l_mn', 'Keg 50 L MN'), ...productChecks('keg_30l_mb', 'Keg 30 L MT'), ...productChecks('pet_1l', 'PET 1 L')],
      notes: [...new Set(n6), 'Chuỗi theo lô có nhiều cặp lô số y hệt nhau (vd. HHT26A2420 và HHT26A3460) — cần kiểm tra trùng mẫu.'],
    },
    {
      no: 7,
      name: 'Chỉ tiêu nâng cao',
      source: 'SAP Z014 + Lab',
      samples: 'Polyphenol, FAN, độ đắng',
      checks: Object.values(R.muc_7_nang_cao.dong_san_pham).flatMap((d) => Object.entries(d.chi_tieus).map(([k, r]) => ind(k, r, [], { group: d.ten_dong }))),
      manual: { status: 'none', reason: 'Hệ thống ghi "Đạt" nhưng không có số đo nào trong kỳ.' },
      notes: [],
    },
    {
      no: 8,
      name: 'CO₂ & nước khử khí',
      source: 'Trạm CO₂ & DAW',
      samples: `${d8.so_mau_co2} mẫu CO₂ · ${d8.so_mau_daw} mẫu DAW`,
      checks: [
        { key: 'co2', name: 'Độ tinh khiết CO₂', unit: '%', spec: sp(99.96), min: d8.co2_do_tinh_khiet_min, avg: d8.co2_do_tinh_khiet_tb, max: d8.co2_do_tinh_khiet_max, n: d8.so_mau_co2, dec: 3 },
        { key: 'daw_do', name: 'DO nước khử khí', unit: 'mg/l', spec: sp(undefined, 0.05, false, true), avg: d8.daw_do_tb, n: d8.so_mau_daw, dec: 3 },
        { key: 'daw_trong', name: 'Độ trong nước khử khí', unit: 'EBC', spec: sp(undefined, 0.05, false, true), avg: d8.daw_do_trong_tb, n: d8.so_mau_daw, dec: 3 },
      ],
      notes: [],
    },
    {
      no: 9,
      name: 'Vi sinh toàn nhà máy',
      source: 'Lab Vi sinh KCS',
      samples: `${d9.tong_so_mau} mẫu, ${d9.danh_sach_nhom.length} nhóm mẫu`,
      checks: [
        { key: 'coliform', name: 'Coliform', unit: 'cfu/ml', spec: sp(undefined, 0), max: microMax('coliform'), n: d9.tong_so_mau, dec: 0 },
        { key: 'ecoli', name: 'E. coli', unit: 'cfu/ml', spec: sp(undefined, 0), max: microMax('ecoli'), n: d9.tong_so_mau, dec: 0 },
        { key: 'lactic', name: 'Vi khuẩn lactic', unit: 'cfu/ml', spec: sp(undefined, 0), max: microMax('lactic'), n: d9.tong_so_mau, dec: 0, impact: 'Một mẫu lactic dương tính là phải CIP lại ngay.' },
      ],
      notes: ['Tổng VSV hiếu khí và men mốc chưa có TC để so (vd. không khí phòng nuôi cấy 1.000, bia hơi 300 cfu/ml).', `Portal chỉ hiện 15 nhóm; backend có ${d9.danh_sach_nhom.length} nhóm.`],
    },
    {
      no: 10,
      name: 'Khiếu nại & đổi trả',
      source: 'SAP Z028 + sổ khiếu nại keg',
      samples: `${d10.tong_so_keg_doi_tra} keg · 0 chai 1 L`,
      checks: [{ key: 'rate', name: 'Tỷ lệ đổi trả bia keg', unit: '%', spec: sp(undefined, 0.1, false, true), avg: (d10.so_lit_bia_loi / d10.tong_san_luong_lit) * 100, dec: 3 }],
      notes: [],
    },
    {
      no: 11,
      name: 'Nước tinh lọc',
      source: 'KCS Nước tinh lọc',
      samples: 'Hoá lý + vi sinh',
      checks: [],
      manual: { status: 'none', reason: 'Chưa có dữ liệu kiểm tra trong kỳ.' },
      notes: [],
    },
    {
      no: 12,
      name: 'Cảm quan hội đồng',
      source: 'Phiếu thử nếm KCS',
      samples: `${R.muc_12_cam_quan.danh_sach_mau.length} mẫu · 8 người thử`,
      checks: [],
      manual: { status: 'over', reason: 'Ring test 0 điểm, không đạt. Mẫu "Hơi PET lưu" 6,71 điểm, ghi nhận oxy hoá.' },
      notes: ['Điểm bia khoảng 7,0–7,5 trong khi đặc tả nói dưới 8,5 là cảnh báo — cần xác nhận thang điểm trước khi tô màu.'],
    },
    {
      no: 13,
      name: 'Nguyên vật liệu nhập',
      source: 'SAP ZRQM001 (loại 01) + MB51',
      samples: `${fmt(R.muc_13_nvl.tong_khoi_luong_tan, 1)} tấn malt · ${lotsAll} lô`,
      checks: [{ key: 'lot', name: 'Tỷ lệ lô đạt', unit: '%', spec: sp(100), avg: (lotsOk / lotsAll) * 100, n: lotsAll, dec: 0 }],
      notes: [],
    },
  ]
}

/** Tên, tiêu đề và nhãn đầu mục theo app Habeco hiện tại (đối chiếu 02/11/2026). */
const APP: Record<number, { name: string; title: string; tags: string[] }> = {
  1: { name: 'Nguồn nước sản xuất', title: 'Chất Lượng Nước Sản Xuất (Nước nấu, Nước mềm, Nước sinh hoạt)', tags: ['Nhập từ Form KCS Nước', 'Đồ thị SPC 6 chỉ tiêu'] },
  2: { name: 'Dịch nha lạnh', title: 'Chất Lượng Dịch Nha Lạnh', tags: [`SAP ZRQM001 (${R.muc_2_dich_nha.so_me_nau} mẻ)`, 'Chỉ tiêu kiểm soát theo quy trình'] },
  3: { name: 'Tình hình lên men', title: 'Tình Hình Lên Men & Chất Lượng Bia Sau Lên Men', tags: [`Theo dõi ${R.muc_3_len_men.so_tank} Tank`, 'ZRQM001 & Form KCS'] },
  4: { name: 'Bia BTP & Lọc', title: 'Chất Lượng Bia Bán Thành Phẩm & Quá Trình Lọc', tags: [`BTP: SAP ZRQM001 (${R.muc_4_btp.so_mau} mẻ)`, 'Theo dõi lọc: Form KCS'] },
  5: { name: 'Bia sau lọc', title: 'Chất Lượng Bia Sau Lọc', tags: [`SAP ZRQM001 (${R.muc_5_sau_loc.dong_san_pham.keg.so_mau + R.muc_5_sau_loc.dong_san_pham.pet.so_mau} mẻ)`] },
  6: { name: 'Bia TP sau chiết', title: 'Chất Lượng Bia Thành Phẩm Sau Chiết', tags: ['SAP ZRQM001', 'SPC & Cpk kiểm soát chất lượng'] },
  7: { name: 'Chỉ tiêu nâng cao', title: 'Kiểm Tra Các Chỉ Tiêu Nâng Cao Của Bia', tags: ['SAP ZRQM001 (Z014)', 'Phòng KT-KCS / Lab'] },
  8: { name: 'CO₂ & Nước khử khí', title: 'Chất Lượng CO₂ Cấp Sản Xuất, Nước Khử Khí', tags: ['Trạm Khí CO₂ & DAW'] },
  9: { name: 'Kiểm tra vi sinh', title: 'Chất Lượng Vi Sinh', tags: ['Lab Vi Sinh KCS'] },
  10: { name: 'Khiếu nại bia hơi', title: 'Tình Hình Bia Hơi Khiếu Nại & Đổi Trả', tags: ['CSKH & Quản Lý Chất Lượng'] },
  11: { name: 'Nước tinh lọc', title: 'Chất Lượng Nước Tinh Lọc UniAqua', tags: ['Sản phẩm UniAqua'] },
  12: { name: 'Điểm cảm quan', title: 'Tổng Hợp Điểm Thử Nếm Bia Hơi Keg 30, 50 L & Bán Thành Phẩm', tags: ['Hội Đồng Cảm Quan KCS'] },
  13: { name: 'Tổng hợp NVL nhập', title: `Tổng Hợp Nguyên Vật Liệu Nhập (${R.muc_13_nvl.danh_sach_lo.length} Nhà Cung Cấp)`, tags: [`Tổng khối lượng: ${fmt(R.muc_13_nvl.tong_khoi_luong_tan, 2)} Tấn`] },
}

export const SECTIONS: Section[] = build().map((s) => ({ ...s, ...APP[s.no] }))

const RANK: Record<Status, number> = { none: 0, ok: 1, warn: 2, over: 3 }
export const worst = (list: Status[]): Status => list.reduce<Status>((a, b) => (RANK[b] > RANK[a] ? b : a), 'ok')

export function judge(v: number, s: Spec): Status {
  if (s.lo != null && v < s.lo) return 'over'
  if (s.hi != null && v > s.hi) return 'over'
  if ((s.lo != null && s.loStrict && v === s.lo) || (s.hi != null && s.hiStrict && v === s.hi)) return 'warn'
  return 'ok'
}

export function checkStatus(c: Check): Status {
  const vals = [c.min, c.max].filter((v): v is number => v != null)
  const use = vals.length ? vals : c.avg != null ? [c.avg] : []
  if (!c.spec || !use.length) return 'none'
  return worst(use.map((v) => judge(v, c.spec!)))
}

export function sectionStatus(s: Section): Status {
  if (s.manual) return s.manual.status
  const known = s.checks.map(checkStatus).filter((x) => x !== 'none')
  return known.length ? worst(known) : 'none'
}

export const label = (c: Check) => (c.group ? `${c.group} · ${c.name}` : c.name)

export const section = (no: number) => SECTIONS.find((s) => s.no === no)!

export function specText(s: Spec | null, dec: number) {
  if (!s) return '—'
  const f = (v: number) => fmt(v, dec)
  if (s.lo != null && s.hi != null) return `${f(s.lo)} – ${f(s.hi)}`
  if (s.hi != null) return s.hi === 0 ? '= 0' : `${s.hiStrict ? '<' : '≤'} ${f(s.hi)}`
  if (s.lo != null) return `${s.loStrict ? '>' : '≥'} ${f(s.lo)}`
  return '—'
}

/** Khiếu nại keg tháng 8: nguyên nhân và quy đổi (mục 10.1). */
const K = R.muc_10_khieu_nai
export const RETURNS = {
  rate: (K.so_lit_bia_loi / K.tong_san_luong_lit) * 100,
  limit: 0.1,
  keg: K.tong_so_keg_doi_tra,
  liters: K.so_lit_bia_loi,
  output: K.tong_san_luong_lit,
  causes: [
    { name: 'Xì zoăng, hỏng nắp', kind: 'Vỏ keg', n: K.keg_xi_gioang_hong },
    { name: 'Bia đục, có cặn', kind: 'Chất lượng bia', n: K.nguyen_nhan_loi.duc_can },
    { name: 'CO₂ không đạt', kind: 'Chất lượng bia', n: K.nguyen_nhan_loi.co2 },
    { name: 'Chua, màu, khác', kind: 'Chất lượng bia', n: K.nguyen_nhan_loi.chua + K.nguyen_nhan_loi.mau + K.nguyen_nhan_loi.khac },
  ],
}

/** NVL nhập tháng 8 theo nhà cung cấp (mục 13.1). */
export const SUPPLIERS = Object.values(
  R.muc_13_nvl.danh_sach_lo.reduce<Record<string, { name: string; items: string[]; tons: number; ok: number; total: number }>>((a, l) => {
    const s = (a[l.nha_cung_cap] ??= { name: l.nha_cung_cap, items: [], tons: 0, ok: 0, total: 0 })
    s.items.push(l.ten_nvl)
    s.tons += l.so_luong_tan
    s.total += l.so_lo_count
    if (l.ket_luan === 'Đạt') s.ok += l.so_lo_count
    return a
  }, {}),
).sort((a, b) => b.tons - a.tons)

export const RECORDS = R.tong_so_ban_ghi_qc
