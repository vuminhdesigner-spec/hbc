// FIXTURE: dữ liệu báo cáo chất lượng tháng 08/2026 lấy nguyên từ portal (Inertia props `reportData`, xem 30/10/2026).
// Đã bỏ mục 14 (kho, ngoài phạm vi theo recap) và tên người. Chỉ đọc, không sửa số.
import raw from './t08.json'

export type Spec = { lo?: number; hi?: number; loStrict?: boolean; hiStrict?: boolean }

export type RawInd = {
  ten_chi_tieu: string
  don_vi: string
  tieu_chuan: string | null
  min: number | null
  max: number | null
  trung_binh: number | null
  so_mau: number
  danh_gia: string
}

export const R = raw as unknown as Report

/** Đọc chuỗi tiêu chuẩn của SAP/biểu mẫu: "13.1 - 13.7", "≤ 0.10", ">3.8", "35±2", "3.8000 - 0.0000"… */
export function parseSpec(s: string | null | undefined): { spec: Spec | null; issue?: string } {
  if (!s) return { spec: null }
  const t = s.replace(/\s+/g, '').replace(',', '.')
  if (t === '-' || t === '') return { spec: null }
  let m = t.match(/^(-?[\d.]+)±([\d.]+)$/)
  if (m) return { spec: { lo: +m[1] - +m[2], hi: +m[1] + +m[2] } }
  m = t.match(/^(-?[\d.]+)-(-?[\d.]+)$/)
  if (m) {
    const lo = +m[1]
    const hi = +m[2]
    // "3.8000 - 0.0000": cận trên bằng 0 là lỗi nhập, đọc thành "≥ 3,8" và ghi chú lại.
    if (hi < lo) return { spec: { lo }, issue: `TC ghi "${s}", đọc thành ≥ ${lo}` }
    return { spec: { lo, hi } }
  }
  m = t.match(/^(<|≤|<=|>|≥|>=)(-?[\d.]+)$/)
  if (m) {
    const v = +m[2]
    if (m[1] === '<') return { spec: { hi: v, hiStrict: true } }
    if (m[1] === '≤' || m[1] === '<=') return { spec: { hi: v } }
    if (m[1] === '>') return { spec: { lo: v, loStrict: true } }
    return { spec: { lo: v } }
  }
  return { spec: null, issue: `Không đọc được TC "${s}"` }
}

/* ── Kiểu dữ liệu (chỉ phần màn dùng) ── */

type Ind = RawInd
type Metric3 = { min: number; max: number; tb: number }
type Water = { tc: string; metrics: Record<string, Metric3>; danh_gia: string }
export type WaterSpc = { ngay: string; ph: number | null; kiem_tong: number | null; do_cung: number | null; ca2: number | null; mg2: number | null; do_trong: number | null }
export type FinishedPoint = { con: number; co2: number; ph: number; do_mau: number; do_duong: number; ea: number }
export type FinishedDaily = FinishedPoint & { ngay: string; ngay_full: string; so_lo: number }
export type FinishedBatch = FinishedPoint & { lo: string; ngay: string }
type Product = { danh_gia: string; ten: string; ma_sp: string; so_mau: number; chi_tieus: Record<string, Ind> }
export type MicroGroup = { loai_mau: string; so_mau: number; max: Record<string, string>; tb: Record<string, string>; danh_gia: string }
export type Tasting = { lo: string; max: number; min: number; tb: number; so_nguoi: number; mui_vi: string; danh_gia: string }
export type Lot = { nha_cung_cap: string; ten_nvl: string; thoi_diem: string; so_luong_tan: number; so_lo_count: number; ket_luan: string; xu_ly: string | null }

type Report = {
  tong_so_ban_ghi_qc: number
  muc_1_nuoc: { danh_gia_chung: string; dong_nuoc: Record<'nuoc_nau' | 'nuoc_mem' | 'nuoc_sinh_hoat', Water>; spc_records: WaterSpc[] }
  muc_2_dich_nha: { danh_gia_chung: string; so_me_nau: number; tong_san_luong_hl: number; san_luong_tb_me: number; chi_tieus: Record<string, Ind> }
  muc_3_len_men: {
    so_tank: number
    danh_gia_len_men: string
    danh_gia_sinh_khoi: string
    so_bon_pz_duoi_tc: number
    so_bon_pz_trong_tc: number
    so_bon_pz_tren_tc: number
    pz_ha_lanh_tb: number
    pz_ha_lanh_min: number
    pz_ha_lanh_max: number
    nhiet_do_cuc_dai_tb: number
    nhiet_do_cuc_dai_min: number
    nhiet_do_cuc_dai_max: number
    ap_suat_tb: number
    so_ngay_lmc_tb: number
    so_ngay_lmc_min: number
    so_ngay_lmc_max: number
    so_tank_duoi_4_ngay: number
    so_tank_tren_7_ngay: number
    sinh_khoi_men: Record<'day_bon' | 'cuc_dai' | 'ha_lanh' | 'truoc_loc', Ind>
    bao_quan_men: { thoi_gian_bao_quan_tb: number; thoi_gian_bao_quan_max: number; thoi_gian_bao_quan_tc: string; ty_le_chet_tb: number; ty_le_chet_max: number; so_bon_men_chet_tren_5: number; so_bon_men_tren_8_doi: number; so_bon_men_bao_quan_tren_3_ngay: number }
  }
  muc_4_btp: {
    danh_gia_chung: string
    so_mau: number
    chi_tieus: Record<string, Ind>
    so_ngay_cho_loc: { tieu_chuan: string; thoi_gian_lm_tb: number; thoi_gian_lm_max: number; thoi_gian_lm_min: number; tong_so_tank_da_loc: number; so_tank_loc_som: number; so_tank_loc_muon: number }
  }
  muc_5_sau_loc: { danh_gia_chung: string; dong_san_pham: Record<'keg' | 'pet', Product> }
  muc_6_thanh_pham: { danh_gia_chung: string; san_phams: Record<'keg_50l_mb' | 'keg_50l_mn' | 'keg_30l_mb' | 'pet_1l', Product>; spc_series: { daily: FinishedDaily[]; batch: FinishedBatch[] } }
  muc_7_nang_cao: { danh_gia_chung: string; dong_san_pham: Record<string, { ten_dong: string; ket_luan: string; chi_tieus: Record<string, Ind> }> }
  muc_8_co2_daw: { danh_gia_chung: string; co2_do_tinh_khiet_tb: number; co2_do_tinh_khiet_min: number; co2_do_tinh_khiet_max: number; daw_do_trong_tb: number; daw_do_tb: number; so_mau_co2: number; so_mau_daw: number }
  muc_9_vi_sinh: { danh_gia_chung: string; danh_sach_nhom: MicroGroup[]; tong_so_mau: number }
  muc_10_khieu_nai: {
    tong_so_keg_doi_tra: number
    keg_50l: number
    keg_30l: number
    keg_xi_gioang_hong: number
    so_lit_bia_loi: number
    tong_san_luong_lit: number
    ty_le_doi_tra_phan_tram: number
    danh_gia: string
    nguyen_nhan_loi: Record<'co2' | 'duc_can' | 'chua' | 'mau' | 'khac', number>
  }
  muc_11_nuoc_tinh_loc: null
  muc_12_cam_quan: { danh_gia_chung: string; danh_sach_mau: Tasting[]; diem_trung_binh_tong_the: number }
  muc_13_nvl: { danh_gia_chung: string; danh_sach_lo: Lot[]; tong_so_lo: number; tong_khoi_luong_tan: number; ty_le_dat: number }
}
