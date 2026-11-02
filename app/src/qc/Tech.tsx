import { Fragment, useEffect, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { SegToggle } from '../w1/Allocation'
import { QcBadge, StatusIcon } from './bits'
import { SpcChart, SpcLegend, SpcStrip, spcStats, type SpcPoint } from './charts'
import { checkStatus, decOf, fmt, judge, label, section, sectionStatus, specText, worst, type Check, type Section, type Status } from './data'
import { R, type FinishedPoint } from './report'

// Tab Kỹ thuật GIỮ NGUYÊN cấu trúc bảng của portal (người dùng chốt 30/10: nhà máy và team PTSP đã quen).
// Chỉ cải tiến UX trên chính bảng đó: tô ô ngoài TC, cột đầu cố định khi cuộn ngang, mục lục có trạng thái,
// tìm kiếm không dấu, thu gọn mục. Công thức và nhãn đánh giá giữ đúng backend (việc của Habeco, chốt 02/11).
// Tiêu đề bảng con (3.1, 3.2…) chỉ hiện khi mục có từ 2 bảng; mục một bảng thì tiêu đề trùng tên mục nên bỏ.

/* ── Nhóm công đoạn (giữ tab Tất cả như bản cũ; mục 14 bỏ theo recap) ── */

export type GroupId = 'all' | 'nau' | 'loc' | 'lab' | 'tt'
export const GROUPS: { id: GroupId; name: string; sections: number[] }[] = [
  { id: 'all', name: 'Tất cả (13)', sections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { id: 'nau', name: 'Nấu & Lên men', sections: [1, 2, 3] },
  { id: 'loc', name: 'Lọc & Chiết', sections: [4, 5, 6] },
  { id: 'lab', name: 'Lab & Vi sinh', sections: [7, 8, 9, 11] },
  { id: 'tt', name: 'Kho & NVL', sections: [10, 12, 13] },
]
const groupStatus = (g: (typeof GROUPS)[number]) => {
  const known = g.sections.map((n) => sectionStatus(section(n))).filter((s) => s !== 'none')
  return known.length ? worst(known) : 'none'
}

/** Nhóm công đoạn: cùng kiểu với tab Tổng quan / Kỹ thuật (nút đang chọn nền xanh đặc, chữ trắng), như app Habeco. */
export function GroupToggle({ value, onChange }: { value: GroupId; onChange: (g: GroupId) => void }) {
  return (
    <ToggleGroup aria-label="Nhóm công đoạn" value={[value]} onValueChange={(v) => v[0] && onChange(v[0] as GroupId)} spacing={0.5} className="glass-card glass-bg rounded-full! p-1">
      {GROUPS.map((g) => (
        <ToggleGroupItem
          key={g.id}
          value={g.id}
          className="h-7.5 rounded-full! px-3.5 text-body font-normal text-muted-foreground hover:text-foreground aria-pressed:glass-cta aria-pressed:font-semibold aria-pressed:text-cta-foreground aria-pressed:hover:text-cta-foreground"
        >
          {g.name}
          {g.id !== 'all' && groupStatus(g) === 'over' && <i aria-label="có mục vượt TC" className="size-1.5 rounded-full bg-destructive-solid" />}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/* ── Ô số: tô theo TC ── */

const TONE: Record<Status, string> = {
  ok: '',
  none: '',
  warn: 'bg-warning-subtle font-semibold text-warning-foreground',
  over: 'bg-destructive/10 font-semibold text-destructive-foreground',
}

function cellStatus(v: number | undefined | null, c?: Check | null): Status {
  if (v == null || !c?.spec) return 'none'
  return judge(v, c.spec)
}

/** Ô giá trị: số theo số lẻ của chỉ tiêu; ngoài TC thì tô và có tooltip TC. */
function Val({ v, c, dec, bold, extra }: { v?: number | null; c?: Check | null; dec?: number; bold?: boolean; extra?: React.ReactNode }) {
  const st = cellStatus(v, c)
  // Hàng TB giữ số lẻ như dữ liệu gốc (tối đa 3), giống portal: 6,911 chứ không làm tròn 6,9.
  const raw = v == null ? 0 : Math.min(3, (String(v).split('.')[1] ?? '').length)
  const d = dec ?? (bold ? Math.max(c?.dec ?? 0, raw) : (c?.dec ?? 2))
  return (
    <TableCell
      title={st === 'over' || st === 'warn' ? `${st === 'over' ? 'Ngoài' : 'Chạm'} TC ${specText(c!.spec, c!.dec)}` : undefined}
      className={cn('text-right tabular-nums', bold && 'font-semibold', TONE[st])}
    >
      {v == null ? <span className="text-muted-foreground">-</span> : fmt(v, d)}
      {extra}
    </TableCell>
  )
}

const STICKY = 'sticky left-0 z-[1] bg-popover'

const HEAD = 'h-auto py-2 text-2xs leading-tight whitespace-normal'

/** Đánh giá đặt dưới tên dòng (ô đã ghim trái) thay cho cột cuối bảng: luôn thấy, không phải cuộn ngang (chọn 30/10).
 *  Nhãn lấy nguyên từ backend, chỉ đổi cách hiển thị. Xuất Excel vẫn giữ cột Đánh giá như mẫu tổng công ty. */
function Verdict({ text, className }: { text?: string | null; className?: string }) {
  if (!text || text === '-') return null
  return <QcBadge status={/KHÔNG|NGOÀI/i.test(text) ? 'over' : 'ok'} label={text} className={cn('flex w-fit', className)} />
}

/* ── Bảng ma trận như portal: dòng sản phẩm × (TC, Max, Min, TB), cột là chỉ tiêu ── */

type Col = { key: string; label: string; unit?: string }
type Line = { name: string; sub?: string; verdict?: string; checks: Check[] }
type RowKind = 'TC' | 'Max' | 'Min' | 'TB'

function Matrix({ title, cols, lines, rows = ['TC', 'Max', 'Min', 'TB'], lineHead = 'Loại', compact }: { title?: string; cols: Col[]; lines: Line[]; rows?: RowKind[]; lineHead?: string; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      {title && <h3 className="border-l-3 border-primary pl-2 text-xs font-semibold">{title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className={cn(HEAD, STICKY, 'min-w-40 bg-muted')}>{lineHead}</TableHead>
              <TableHead className={cn(HEAD, 'w-16')}>Chỉ số</TableHead>
              {cols.map((col) => {
                const c = lines.flatMap((l) => l.checks).find((x) => x.key === col.key)
                return (
                  <TableHead key={col.key} className={cn(HEAD, 'text-right', compact ? 'min-w-16' : 'min-w-20')}>
                    {col.label}
                    {(col.unit ?? c?.unit) && <span className="block font-normal text-muted-foreground">({col.unit ?? c?.unit})</span>}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((l) => {
              const by = (k: string) => l.checks.find((x) => x.key === k)
              return rows.map((r, i) => (
                <TableRow key={l.name + r} className={cn(r === 'TC' && 'bg-highlight/50 hover:bg-highlight/50', r === 'TB' && 'bg-muted/40', i === rows.length - 1 && 'border-b-2')}>
                  {i === 0 && (
                    <TableCell rowSpan={rows.length} className={cn(STICKY, 'align-middle font-semibold whitespace-normal')}>
                      {l.name}
                      {l.sub && <span className="block text-2xs font-normal text-muted-foreground">{l.sub}</span>}
                      <Verdict text={l.verdict} className="mt-1.5" />
                    </TableCell>
                  )}
                  <TableCell className={cn('text-muted-foreground', r === 'TB' && 'font-semibold text-foreground')}>{r === 'TB' ? 'Trung bình' : r}</TableCell>
                  {cols.map((col) => {
                    const c = by(col.key)
                    if (r === 'TC')
                      return (
                        <TableCell key={col.key} className="text-right whitespace-nowrap text-highlight-foreground tabular-nums">
                          {c?.tcText ?? (c?.spec ? specText(c.spec, c.dec) : '-')}
                        </TableCell>
                      )
                    const v = r === 'Max' ? c?.max : r === 'Min' ? c?.min : c?.avg
                    return <Val key={col.key} v={v} c={c} bold={r === 'TB'} />
                  })}
                </TableRow>
              ))
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

type Head = React.ReactNode | { h: React.ReactNode; cs?: number; rs?: number }
const isHead = (x: Head): x is { h: React.ReactNode; cs?: number; rs?: number } => typeof x === 'object' && x !== null && 'h' in x

/** Bảng đơn giản: tiêu đề cột (có thể hai tầng như app Habeco: ô nhóm `cs`, ô đứng hai tầng `rs`, tầng dưới `sub`) + các dòng ô sẵn. */
function Simple({ title, head, sub, children }: { title?: string; head: Head[]; sub?: React.ReactNode[]; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {title && <h3 className="border-l-3 border-primary pl-2 text-xs font-semibold">{title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              {head.map((x, i) => {
                const g = isHead(x) ? x : { h: x }
                return (
                  <TableHead key={i} colSpan={g.cs} rowSpan={g.rs} className={cn(HEAD, i === 0 && cn(STICKY, 'bg-muted'), g.cs && 'border-b border-border text-center')}>
                    {g.h}
                  </TableHead>
                )
              })}
            </TableRow>
            {sub && (
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                {sub.map((h, i) => (
                  <TableHead key={i} className={cn(HEAD, 'text-right')}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ── Khung một mục: thu gọn được như portal ── */

/** Khung mục như app Habeco: tiêu đề + nhãn nguồn; đánh giá nằm dưới tên dòng trong bảng (chọn 30/10). */
function Card({ s, children }: { s: Section; verdict?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <section id={`muc-${s.no}`} aria-labelledby={`muc-${s.no}-t`} className="glass-card glass-bg flex scroll-mt-4 flex-col">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex cursor-pointer items-center gap-2.5 rounded-glass px-4.5 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-ring">
        <span className="grid size-6 place-items-center rounded-md bg-muted text-xs font-semibold tabular-nums">{s.no}</span>
        <h2 id={`muc-${s.no}-t`} className="text-sm font-semibold">
          {s.title}
        </h2>
        {s.tags.map((tag) => (
          <span key={tag} className="shrink-0 rounded-full border border-border bg-popover/60 px-2 py-0.5 text-2xs whitespace-nowrap text-muted-foreground">
            {tag}
          </span>
        ))}
        <ChevronDown aria-hidden className={cn('ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast)', !open && '-rotate-90')} />
      </button>
      {open && (
        <div className="flex flex-col gap-3 px-4.5 pb-4">
          {children}
        </div>
      )}
    </section>
  )
}

const LABEL: Record<string, string> = {
  ph: 'pH',
  do_trong: 'Độ trong',
  kiem_tong: 'Kiềm tổng',
  do_cung: 'Độ cứng',
  ca2: 'Ca²⁺',
  mg2: 'Mg²⁺',
  clo_du: 'Clo',
  fe2: 'Fe²⁺',
  mn2: 'Mn²⁺',
  do_chua: 'Độ chua',
  do_duong: 'Độ đường',
  do_mau: 'Độ màu',
  do_dang: 'Độ đắng',
  polyphenol: 'Polyphenol',
  fan: 'FAN',
  duong_sot: 'Đường sót + bột sót',
  duong_tong: 'Đường tổng',
  duong_ban_dau: 'HL ban đầu',
  ea: 'Ea',
  er: 'Er',
  co2: 'CO₂',
  con: 'Cồn 20°C',
  vdk: 'VDK',
  do: 'DO',
  tpo: 'TPO',
}
const cols = (keys: string[]): Col[] => keys.map((k) => ({ key: k, label: LABEL[k] ?? k }))
const lineOf = (s: Section, group: string, name: string, sub?: string, verdict?: string): Line => ({ name, sub, verdict, checks: s.checks.filter((c) => c.group === group) })

/* ── SPC (giữ chỗ cũ: dưới bảng, chọn chỉ tiêu bằng tab) ── */

function SpcPanel({ title, sub, check, points, pick, right }: { title: string; sub: string; check: Check; points: SpcPoint[]; pick: React.ReactNode; right?: React.ReactNode }) {
  const stats = spcStats(points, check.spec)
  return (
    <figure className="flex min-w-0 flex-col gap-2 rounded-glass-inner border border-border bg-popover/40 px-3.5 pt-3 pb-3">
      <figcaption className="flex flex-wrap items-center gap-2">
        <span className="flex min-w-0 flex-col">
          <b className="text-body font-semibold">{title}</b>
          <span className="text-2xs text-muted-foreground">{sub}</span>
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {right}
          {pick}
        </span>
      </figcaption>
      <SpcStrip stats={stats} spec={check.spec} dec={check.dec} unit={check.unit} />
      <SpcLegend />
      <SpcChart key={`${check.group}|${check.key}|${points.length}`} points={points} spec={check.spec} unit={check.unit} dec={check.dec} />
    </figure>
  )
}

/* ── Mục 1 ── */

const WATER_SERIES = ['ph', 'kiem_tong', 'do_cung', 'ca2', 'mg2', 'do_trong'] as const

function Water() {
  const s = section(1)
  const [k, setK] = useState<(typeof WATER_SERIES)[number]>('ph')
  const c = s.checks.find((x) => x.group === 'Nước nấu' && x.key === k)!
  const points: SpcPoint[] = R.muc_1_nuoc.spc_records.map((r) => ({ x: r.ngay.slice(0, 5), v: r[k], sub: r.ngay }))
  return (
    <Card s={s} verdict={R.muc_1_nuoc.danh_gia_chung}>
      <Matrix
        lineHead="Loại nước"
        cols={cols(['ph', 'do_trong', 'kiem_tong', 'do_cung', 'ca2', 'mg2', 'clo_du', 'fe2', 'mn2'])}
        lines={[
          lineOf(s, 'Nước nấu', 'Nước nấu', 'tần suất 1 tuần / 2 lần', R.muc_1_nuoc.dong_nuoc.nuoc_nau.danh_gia),
          lineOf(s, 'Nước mềm', 'Nước mềm', 'tuần / 1 lần', R.muc_1_nuoc.dong_nuoc.nuoc_mem.danh_gia),
          lineOf(s, 'Nước sinh hoạt', 'Nước sinh hoạt', 'tháng 2 lần', R.muc_1_nuoc.dong_nuoc.nuoc_sinh_hoat.danh_gia),
        ]}
      />
      <SpcPanel
        title={`Đồ thị kiểm soát SPC — Nước nấu · ${c.name}`}
        sub={`${points.filter((p) => p.v != null).length} đợt kiểm tra trong tháng 8/2026`}
        check={c}
        points={points}
        pick={<SegToggle label="Chỉ tiêu đồ thị" value={k} onChange={setK} items={WATER_SERIES.map((x) => [x, LABEL[x]] as [typeof x, string])} />}
      />
    </Card>
  )
}

/* ── Mục 2 ── */

function Wort() {
  const s = section(2)
  const sl = R.muc_2_dich_nha.chi_tieus.san_luong
  const yieldCheck: Check = { key: 'san_luong', name: 'Sản lượng', unit: 'hl', spec: null, min: sl.min ?? undefined, avg: sl.trung_binh ?? undefined, max: sl.max ?? undefined, dec: 2 }
  return (
    <Card s={s} verdict={R.muc_2_dich_nha.danh_gia_chung}>
      <Matrix
        lineHead="Loại dịch nha"
        cols={[{ key: 'san_luong', label: 'Sản lượng' }, ...cols(['do_chua', 'do_duong', 'do_mau', 'do_trong', 'ph', 'do_dang', 'polyphenol', 'fan', 'duong_sot'])]}
        lines={[{ name: 'Hơi cao độ', sub: `${R.muc_2_dich_nha.so_me_nau} mẻ`, verdict: R.muc_2_dich_nha.danh_gia_chung, checks: [yieldCheck, ...s.checks] }]}
      />
    </Card>
  )
}

/* ── Mục 3 ── */

function Ferment() {
  const s = section(3)
  const d = R.muc_3_len_men
  const by = (k: string) => s.checks.find((c) => c.key === k)!
  const bq = d.bao_quan_men
  const pz = by('pz')
  const hl = by('ha_lanh')
  const tl = by('truoc_loc')
  return (
    <Card s={s} verdict={d.danh_gia_len_men}>
      <Simple
        title={`3.1 Chất lượng lên men (${d.so_tank} tank - Hơi cao độ)`}
        head={[{ h: 'Loại bia', rs: 2 }, { h: 'Số tank', rs: 2 }, { h: 'TC Pz hạ lạnh (°P)', rs: 2 }, { h: 'Số bồn lên men', cs: 3 }, { h: 'Pz hạ lạnh (°P)', cs: 3 }, { h: 'Số ngày LMC (ngày)', cs: 3 }, { h: 'Số tank LM', cs: 2 }]}
        sub={['Pz < TC', 'Pz trong TC', 'Pz > TC', 'TB', 'Min', 'Max', 'TB', 'Min', 'Max', '< 4 ngày', '> 7 ngày']}
      >
        <TableRow>
          <TableCell className={cn(STICKY, 'font-semibold')}>
            Hơi cao độ
            <Verdict text={d.danh_gia_len_men} className="mt-1.5" />
          </TableCell>
          <TableCell className="text-right tabular-nums">{d.so_tank}</TableCell>
          <TableCell className="text-right whitespace-nowrap text-highlight-foreground tabular-nums">{specText(pz.spec, 2)}</TableCell>
          <TableCell className={cn('text-right tabular-nums', d.so_bon_pz_duoi_tc > 0 && TONE.over)}>{d.so_bon_pz_duoi_tc}</TableCell>
          <TableCell className="text-right tabular-nums">{d.so_bon_pz_trong_tc}</TableCell>
          <TableCell className={cn('text-right tabular-nums', d.so_bon_pz_tren_tc > 0 && TONE.over)}>{d.so_bon_pz_tren_tc}</TableCell>
          <Val v={d.pz_ha_lanh_tb} c={pz} bold />
          <Val v={d.pz_ha_lanh_min} c={pz} />
          <Val v={d.pz_ha_lanh_max} c={pz} />
          <Val v={d.so_ngay_lmc_tb} dec={1} />
          <Val v={d.so_ngay_lmc_min} dec={0} />
          <Val v={d.so_ngay_lmc_max} dec={0} />
          <TableCell className="text-right tabular-nums">{d.so_tank_duoi_4_ngay}</TableCell>
          <TableCell className="text-right tabular-nums">{d.so_tank_tren_7_ngay}</TableCell>
        </TableRow>
      </Simple>
      <Simple
        title="3.2 Sinh khối nấm men (triệu tế bào/ml)"
        head={[{ h: 'Loại bia', rs: 2 }, { h: 'Mật độ TB khi đầy bồn', cs: 3 }, { h: 'Mật độ TB nấm men cực đại', cs: 3 }, { h: 'Mật độ TB khi hạ lạnh', cs: 1 }, { h: 'Mật độ TB trước lọc', cs: 1 }]}
        sub={['Max', 'Min', 'TB', 'Max', 'Min', 'TB', 'TB', 'TB']}
      >
        <TableRow>
          <TableCell className={cn(STICKY, 'font-semibold')}>
            Hơi
            <Verdict text={d.danh_gia_sinh_khoi} className="mt-1.5" />
          </TableCell>
          <Val v={by('day_bon').max} c={by('day_bon')} dec={1} />
          <Val v={by('day_bon').min} c={by('day_bon')} dec={1} />
          <Val v={by('day_bon').avg} c={by('day_bon')} dec={2} bold />
          <Val v={by('cuc_dai').max} c={by('cuc_dai')} dec={1} />
          <Val v={by('cuc_dai').min} c={by('cuc_dai')} dec={1} />
          <Val v={by('cuc_dai').avg} c={by('cuc_dai')} dec={2} bold />
          <Val v={hl.avg} c={hl} dec={2} bold />
          <Val v={tl.avg} c={tl} dec={2} bold />
        </TableRow>
      </Simple>
      <Simple
        title="3.3 Bảo quản và tái sử dụng men"
        head={[
          { h: 'Loại men', rs: 2 },
          { h: <>Thời gian bảo quản (giờ)<span className="block font-normal text-muted-foreground">(tiêu chuẩn {bq.thoi_gian_bao_quan_tc})</span></>, cs: 2 },
          { h: 'Tỷ lệ chết (%)', cs: 2 },
          { h: 'Số bồn men chết > 5%', rs: 2 },
          { h: 'Số bồn men > 8 đời', rs: 2 },
          { h: 'Số bồn men BQ > 3 ngày', rs: 2 },
        ]}
        sub={['Trung bình', 'Max', 'Trung bình', 'Max']}
      >
        <TableRow>
          <TableCell className={cn(STICKY, 'font-semibold')}>
            Bia hơi
          </TableCell>
          <Val v={bq.thoi_gian_bao_quan_tb} c={by('bq')} dec={2} bold />
          <Val v={bq.thoi_gian_bao_quan_max} c={by('bq')} dec={0} />
          <Val v={bq.ty_le_chet_tb} c={by('chet')} bold extra="%" />
          <Val v={bq.ty_le_chet_max} c={by('chet')} extra="%" />
          <TableCell className="text-right tabular-nums">{bq.so_bon_men_chet_tren_5}</TableCell>
          <TableCell className="text-right tabular-nums">{bq.so_bon_men_tren_8_doi}</TableCell>
          <TableCell className="text-right tabular-nums">{bq.so_bon_men_bao_quan_tren_3_ngay}</TableCell>
        </TableRow>
      </Simple>
    </Card>
  )
}

/* ── Mục 4 ── */

function PreFilter() {
  const s = section(4)
  const l = R.muc_4_btp.so_ngay_cho_loc
  const days = s.checks.find((c) => c.key === 'ngay_loc')!
  return (
    <Card s={s} verdict={R.muc_4_btp.danh_gia_chung}>
      <Matrix
        title={`4.1 Các chỉ tiêu hóa lý bia BTP trước lọc (Hơi BTP - ${R.muc_4_btp.so_mau} mẻ kiểm tra)`}
        lineHead="Loại bia"
        cols={[{ key: 'do_chua', label: 'Chua' }, ...cols(['do_mau']), { key: 'do_trong', label: 'Đục' }, ...cols(['duong_tong', 'ea', 'er', 'co2']), { key: 'con', label: 'Cồn', unit: '%v' }, ...cols(['vdk', 'ph', 'do_dang'])]}
        lines={[{ name: 'Hơi BTP', verdict: R.muc_4_btp.danh_gia_chung, checks: s.checks.filter((c) => c.key !== 'ngay_loc') }]}
        rows={['Max', 'Min', 'TB']}
        compact
      />
      <Simple
        title="4.2 Số ngày cho lọc"
        head={[{ h: 'Loại bia', rs: 2 }, { h: 'Tiêu chuẩn', rs: 2 }, { h: 'Tổng thời gian lên men (ngày)', cs: 3 }, { h: 'Tổng số tank đã lọc', rs: 2 }, { h: 'Số tank lọc sớm', rs: 2 }, { h: 'Số tank lọc muộn', rs: 2 }]}
        sub={['Trung bình', 'Max', 'Min']}
      >
        <TableRow>
          <TableCell className={cn(STICKY, 'font-semibold')}>
            Hơi cao độ
          </TableCell>
          <TableCell className="text-highlight-foreground">{l.tieu_chuan}</TableCell>
          <Val v={l.thoi_gian_lm_tb} c={days} dec={1} bold />
          <Val v={l.thoi_gian_lm_max} c={days} dec={1} />
          <Val v={l.thoi_gian_lm_min} c={days} dec={1} />
          <TableCell className="text-right tabular-nums">{l.tong_so_tank_da_loc}</TableCell>
          <TableCell className={cn('text-right tabular-nums', l.so_tank_loc_som > 0 && TONE.over)}>{l.so_tank_loc_som}</TableCell>
          <TableCell className={cn('text-right tabular-nums', l.so_tank_loc_muon > 0 && TONE.over)}>{l.so_tank_loc_muon}</TableCell>
        </TableRow>
      </Simple>
    </Card>
  )
}

/* ── Mục 5 ── */

function PostFilter() {
  const s = section(5)
  const d = R.muc_5_sau_loc.dong_san_pham
  return (
    <Card s={s} verdict={R.muc_5_sau_loc.danh_gia_chung}>
      <Matrix
        lineHead="Loại bia"
        title={`5.1 Chỉ tiêu chất lượng bia sau lọc (${d.keg.so_mau + d.pet.so_mau} mẻ lọc)`}
        cols={[...cols(['do_chua', 'do_mau', 'do_trong', 'duong_ban_dau', 'ea', 'er', 'co2']), { key: 'con', label: 'Cồn 20°C', unit: '%v' }, ...cols(['ph', 'do'])]}
        lines={[lineOf(s, 'Keg', 'BTP bia hơi Hanoi Lọc', `${d.keg.so_mau} mẻ`, d.keg.danh_gia), lineOf(s, 'PET', 'BTP bia hơi Hanoi Lọc MN PET', `${d.pet.so_mau} mẻ`, d.pet.danh_gia)]}
      />
    </Card>
  )
}

/* ── Mục 6 ── */

const FIN_KEYS: { k: keyof FinishedPoint; check: string; label: string }[] = [
  { k: 'con', check: 'con', label: 'Độ cồn' },
  { k: 'do_duong', check: 'duong_tong', label: 'Độ đường ban đầu' },
  { k: 'ph', check: 'ph', label: 'pH' },
  { k: 'do_mau', check: 'do_mau', label: 'Độ màu' },
  { k: 'co2', check: 'co2', label: 'CO₂' },
  { k: 'ea', check: 'ea', label: 'Ea' },
]

function Finished() {
  const s = section(6)
  const p = R.muc_6_thanh_pham.san_phams
  const [k, setK] = useState<keyof FinishedPoint>('con')
  const [by, setBy] = useState<'daily' | 'batch'>('daily')
  const f = FIN_KEYS.find((x) => x.k === k)!
  const c = s.checks.find((x) => x.group === 'Keg 50 L MB' && x.key === f.check)!
  const ser = R.muc_6_thanh_pham.spc_series
  const points: SpcPoint[] =
    by === 'daily'
      ? ser.daily.map((r) => ({ x: r.ngay, v: r[k], sub: `${r.ngay_full} · TB của ${r.so_lo} lô` }))
      : ser.batch.map((r) => ({ x: r.lo.slice(-5), v: r[k], sub: `Lô ${r.lo} · ngày ${r.ngay}` }))
  return (
    <Card s={s} verdict={R.muc_6_thanh_pham.danh_gia_chung}>
      <Matrix
        lineHead="Sản phẩm"
        cols={cols(['do_chua', 'do_mau', 'do_trong', 'co2', 'con', 'duong_tong', 'ea', 'er', 'ph', 'do', 'tpo', 'do_dang'])}
        lines={[
          lineOf(s, 'Keg 50 L MB', 'Hơi thành phẩm KEG MB', `${p.keg_50l_mb.so_mau} lô`, p.keg_50l_mb.danh_gia),
          lineOf(s, 'Keg 50 L MN', 'Hơi thành phẩm MN', `${p.keg_50l_mn.so_mau} lô`, p.keg_50l_mn.danh_gia),
          lineOf(s, 'Keg 30 L MT', 'Hơi TP MT', `${p.keg_30l_mb.so_mau} lô`, p.keg_30l_mb.danh_gia),
          lineOf(s, 'PET 1 L', 'Hơi thành phẩm 1 lít', `${p.pet_1l.so_mau} lô`, p.pet_1l.danh_gia),
        ]}
        compact
      />
      <SpcPanel
        title={`Đồ thị kiểm soát SPC bia thành phẩm · ${f.label}`}
        sub={by === 'daily' ? `${ser.daily.length} ngày chiết · TC theo Keg 50 L MB` : `${ser.batch.length} lô chiết · TC theo Keg 50 L MB`}
        check={c}
        points={points}
        right={
          <SegToggle
            label="Trục thời gian"
            value={by}
            onChange={setBy}
            items={[
              ['daily', 'Theo 30 ngày (TB)'],
              ['batch', 'Theo 40 lô chiết'],
            ]}
          />
        }
        pick={<SegToggle label="Chỉ tiêu đồ thị" value={k} onChange={setK} items={FIN_KEYS.map((x) => [x.k, x.label] as [keyof FinishedPoint, string])} />}
      />
    </Card>
  )
}

/* ── Mục 7 ── */

function Advanced() {
  const s = section(7)
  const lines = Object.values(R.muc_7_nang_cao.dong_san_pham).map((d) => lineOf(s, d.ten_dong, d.ten_dong, undefined, d.ket_luan))
  return (
    <Card s={s} verdict={R.muc_7_nang_cao.danh_gia_chung}>
      <Matrix lineHead="Loại bia" cols={cols(['polyphenol', 'fan', 'do_dang'])} lines={lines} rows={['Max', 'Min', 'TB']} />
    </Card>
  )
}

/* ── Mục 8 ── */

function Co2() {
  const s = section(8)
  const d = R.muc_8_co2_daw
  const [co2, dawDo, dawTrong] = s.checks
  const order = [co2, dawTrong, dawDo]
  const rows: [string, (number | undefined)[]][] = [
    ['Trung bình (TB)', [co2.avg, dawTrong.avg, dawDo.avg]],
    ['Max', [co2.max, undefined, undefined]],
    ['Min', [co2.min, undefined, undefined]],
  ]
  return (
    <Card s={s} verdict={d.danh_gia_chung}>
      <Simple
        title="8.1 Chỉ tiêu chất lượng CO₂ và Nước khử khí"
        head={[{ h: 'Giá trị', rs: 2 }, { h: 'CO₂', cs: 1 }, { h: 'Nước khử khí', cs: 2 }, { h: 'Kết luận', rs: 2 }]}
        sub={['Độ tinh khiết (%)', 'Độ trong (EBC)', 'DO (mg/l)']}
      >
        <TableRow className="bg-highlight/50 hover:bg-highlight/50">
          <TableCell className={cn(STICKY, 'text-muted-foreground')}>Tiêu chuẩn (TC)</TableCell>
          {order.map((c) => (
            <TableCell key={c.key} className="text-right text-highlight-foreground tabular-nums">
              {specText(c.spec, Math.max(decOf(c.spec?.lo), decOf(c.spec?.hi)))}
            </TableCell>
          ))}
          <TableCell>-</TableCell>
        </TableRow>
        {rows.map(([name, vals], i) => (
          <TableRow key={name}>
            <TableCell className={cn(STICKY, i === 0 && 'font-semibold')}>{name}</TableCell>
            {vals.map((v, j) => (
              <Val key={j} v={v} c={order[j]} bold={i === 0} />
            ))}
            <TableCell>{i === 0 ? <Verdict text={d.danh_gia_chung} /> : null}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className={cn(STICKY, 'text-muted-foreground')}>Số mẫu phân tích</TableCell>
          <TableCell className="text-right tabular-nums">{d.so_mau_co2}</TableCell>
          <TableCell colSpan={2} className="text-center tabular-nums">
            {d.so_mau_daw}
          </TableCell>
          <TableCell />
        </TableRow>
      </Simple>
    </Card>
  )
}

/* ── Mục 9: giữ đủ cột của portal; hiện đủ nhóm mẫu có trong backend ── */

const MICRO_COLS = [
  { k: 'hieuKhi', name: 'Tổng VSV hiếu khí (cfu/ml)', zero: false },
  { k: 'coliform', name: 'Coliform (cfu/ml)', zero: true },
  { k: 'ecoli', name: 'E.coli (cfu/ml)', zero: true },
  { k: 'menMoc', name: 'Men, mốc (cfu/ml)', zero: false },
  { k: 'menDai', name: 'Men dại (cfu/ml)', zero: false },
  { k: 'lactic', name: 'VK lactic (cfu/ml)', zero: true },
  { k: 'strep', name: 'Streptococci (cfu/250ml)', zero: false },
  { k: 'pseudo', name: 'Pseudomonas (cfu/250ml)', zero: false },
  { k: 'baoTu', name: 'Bào tử kị khí (cfu/50ml)', zero: false },
]

function MicroCell({ raw, zero }: { raw?: string; zero: boolean }) {
  const has = raw != null && raw !== '-' && raw !== ''
  const v = Number(raw)
  const bad = zero && has && v > 0
  return (
    <TableCell className={cn('text-right tabular-nums', bad && TONE.over)} title={bad ? 'Bắt buộc bằng 0' : undefined}>
      {has ? fmt(v, Number.isInteger(v) ? 0 : 1) : <span className="text-muted-foreground">-</span>}
    </TableCell>
  )
}

function Micro() {
  const s = section(9)
  return (
    <Card s={s} verdict={R.muc_9_vi_sinh.danh_gia_chung}>
      <Simple head={['Loại mẫu', 'Số mẫu', 'Chỉ số', ...MICRO_COLS.map((m) => m.name)]}>
        {R.muc_9_vi_sinh.danh_sach_nhom.map((g) => {
          return (
            <Fragment key={g.loai_mau}>
              {(['Max', 'TB'] as const).map((r, i) => (
                <TableRow key={r} className={cn(i === 1 && 'border-b-2 bg-muted/40')}>
                  {i === 0 && (
                    <TableCell rowSpan={2} className={cn(STICKY, 'max-w-56 align-middle font-semibold whitespace-normal')}>
                      {g.loai_mau}
                      <Verdict text={g.danh_gia} className="mt-1.5" />
                    </TableCell>
                  )}
                  {i === 0 && (
                    <TableCell rowSpan={2} className="text-right align-middle tabular-nums">
                      {g.so_mau}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">{r}</TableCell>
                  {MICRO_COLS.map((m) => (
                    <MicroCell key={m.k} raw={(r === 'Max' ? g.max : g.tb)[m.k]} zero={m.zero} />
                  ))}
                </TableRow>
              ))}
            </Fragment>
          )
        })}
      </Simple>
    </Card>
  )
}

/* ── Mục 10 ── */

function Returns() {
  const s = section(10)
  const k = R.muc_10_khieu_nai
  // Số lẻ của tỷ lệ như app Habeco: theo loại keg 1 số lẻ, theo nguyên nhân 2 số lẻ.
  const pct = (n: number, d = 2) => `${fmt((n / k.tong_so_keg_doi_tra) * 100, d)}%`
  const rate = s.checks[0]
  const rows: [string, string, string, string, React.ReactNode][] = [
    ['Tổng số keg đổi trả trong tháng', 'keg', fmt(k.tong_so_keg_doi_tra, 0), '100%', 'Tổng cộng các loại keg'],
    ['• Keg 50 lít', 'keg', fmt(k.keg_50l, 0), pct(k.keg_50l, 1), 'Chiếm đa số sản lượng'],
    ['• Keg 30 lít', 'keg', fmt(k.keg_30l, 0), pct(k.keg_30l, 1), 'Thị trường miền Trung'],
    ['• Keg xì zoăng, hỏng nắp (lỗi cơ khí)', 'keg', fmt(k.keg_xi_gioang_hong, 0), pct(k.keg_xi_gioang_hong, 1), 'Lỗi cơ khí vỏ keg'],
    ['Số lít bia quy đổi bị lỗi', 'lít', fmt(k.so_lit_bia_loi, 0), '-', 'Quy đổi từ số keg'],
    ['Tổng sản lượng bia hơi sản xuất / xuất xưởng', 'lít', fmt(k.tong_san_luong_lit, 0), '-', 'Sản lượng trong kỳ'],
    ['Tỷ lệ đổi trả bia keg trên tổng sản lượng', '%', `${fmt(rate.avg!, 3)}%`, '', <Verdict key="v" text={k.danh_gia} />],
    ['Phân loại chi tiết nguyên nhân khiếu nại chất lượng', '', '', '', ''],
    ['• Bia đục, có cặn', 'keg', fmt(k.nguyen_nhan_loi.duc_can, 0), pct(k.nguyen_nhan_loi.duc_can), `${k.nguyen_nhan_loi.duc_can} keg đục cặn`],
    ['• Hàm lượng CO₂ không đạt', 'keg', fmt(k.nguyen_nhan_loi.co2, 0), pct(k.nguyen_nhan_loi.co2), `${k.nguyen_nhan_loi.co2} keg CO₂ không đạt`],
    ['• Độ chua không đạt', 'keg', fmt(k.nguyen_nhan_loi.chua, 0), pct(k.nguyen_nhan_loi.chua), k.nguyen_nhan_loi.chua ? `${k.nguyen_nhan_loi.chua} keg` : `Không có (${pct(0)})`],
    ['• Độ màu không đạt', 'keg', fmt(k.nguyen_nhan_loi.mau, 0), pct(k.nguyen_nhan_loi.mau), k.nguyen_nhan_loi.mau ? `${k.nguyen_nhan_loi.mau} keg` : `Không có (${pct(0)})`],
    ['Tình hình khiếu nại bia hơi chai 1 lít', '', '', '', ''],
    ['Tổng số chai 1 lít khiếu nại', 'chai', '0', '0%', '100% ĐẠT CHUẨN'],
  ]
  return (
    <Card s={s} verdict={k.danh_gia}>
      <Simple title="10.1 Tổng hợp đổi trả & khiếu nại bia hơi Keg" head={['Chỉ tiêu khiếu nại / Đổi trả', 'Đơn vị', 'Số lượng / Giá trị', 'Tỷ lệ (%)', 'Ghi chú & Đánh giá']}>
        {rows.map(([a, u, v, p, n]) =>
          !u ? (
            <TableRow key={a} className="bg-muted/40 hover:bg-muted/40">
              <TableCell colSpan={5} className={cn(STICKY, 'bg-transparent text-2xs font-semibold text-muted-foreground')}>
                {a}
              </TableCell>
            </TableRow>
          ) : (
          <TableRow key={a} className={cn(a.startsWith('Tỷ lệ') && 'bg-muted/40')}>
            <TableCell className={cn(STICKY, !a.startsWith('•') && 'font-semibold')}>{a}</TableCell>
            <TableCell className="text-muted-foreground">{u}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{v}</TableCell>
            <TableCell className="text-right tabular-nums">{p}</TableCell>
            <TableCell className="text-muted-foreground">{n}</TableCell>
          </TableRow>
          ),
        )}
      </Simple>
    </Card>
  )
}

/* ── Mục 11 ── */

function Plain({ no }: { no: number }) {
  const s = section(no)
  return (
    <Card s={s}>
      <p className="text-xs text-muted-foreground">{s.manual?.reason}</p>
    </Card>
  )
}

/* ── Mục 12 ── */

function Sensory() {
  const s = section(12)
  return (
    <Card s={s} verdict={R.muc_12_cam_quan.danh_gia_chung}>
      <Simple title="12.1 Điểm đánh giá cảm quan nếm thử" head={['Lô sản phẩm / Mẫu thử', 'Ngày thử', 'Điểm Max', 'Điểm Min', 'Điểm Trung bình', 'Số người thử', 'Mùi vị cảm quan']}>
        {R.muc_12_cam_quan.danh_sach_mau.map((m) => {
          const st: Status = m.mui_vi === 'KHÔNG ĐẠT' ? 'over' : m.mui_vi !== 'ĐẠT' ? 'warn' : 'ok'
          return (
            <TableRow key={m.lo}>
              <TableCell className={cn(STICKY, 'font-semibold')}>{m.lo}</TableCell>
              <TableCell className="text-muted-foreground">08/2026</TableCell>
              <Val v={m.max} dec={2} />
              <Val v={m.min} dec={2} />
              <Val v={m.tb} dec={2} bold />
              <TableCell className="text-right tabular-nums">{m.so_nguoi}</TableCell>
              <TableCell>{st === 'ok' ? <Verdict text={m.mui_vi} /> : <QcBadge status={st} label={st === 'over' ? 'Không đạt' : `Ghi nhận: ${m.mui_vi}`} />}</TableCell>
            </TableRow>
          )
        })}
      </Simple>
    </Card>
  )
}

/* ── Mục 13 ── */

function Inbound() {
  const s = section(13)
  const n = R.muc_13_nvl
  return (
    <Card s={s} verdict={n.danh_gia_chung}>
      <Simple title="13.1 Bảng tổng hợp nguyên vật liệu nhập" head={['Nhà Cung cấp', 'NVL nhập', 'Thời điểm', 'Số lượng (tấn)', 'Đạt/Không đạt chất lượng', 'Xử lý khi không đạt']}>
        {n.danh_sach_lo.map((l) => (
          <TableRow key={l.nha_cung_cap + l.ten_nvl}>
            <TableCell className={cn(STICKY, 'font-semibold')}>{l.nha_cung_cap}</TableCell>
            <TableCell>{l.ten_nvl}</TableCell>
            <TableCell className="max-w-64 whitespace-normal text-muted-foreground tabular-nums">
              {l.thoi_diem}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{fmt(l.so_luong_tan, decOf(l.so_luong_tan))}</TableCell>
            <TableCell><Verdict text={l.ket_luan} /></TableCell>
            <TableCell className="text-muted-foreground">{l.xu_ly ?? '-'}</TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-muted/40 font-semibold">
          <TableCell className={STICKY}>Tổng cộng ({n.danh_sach_lo.length} nhà cung cấp / đợt)</TableCell>
          <TableCell>—</TableCell>
          <TableCell>—</TableCell>
          <TableCell className="text-right tabular-nums">{fmt(n.tong_khoi_luong_tan, 2)}</TableCell>
          <TableCell>Tỷ lệ đạt: {fmt(n.ty_le_dat, 0)}%</TableCell>
          <TableCell>—</TableCell>
        </TableRow>
      </Simple>
    </Card>
  )
}

const VIEW: Record<number, () => React.ReactElement> = {
  1: Water,
  2: Wort,
  3: Ferment,
  4: PreFilter,
  5: PostFilter,
  6: Finished,
  7: Advanced,
  8: Co2,
  9: Micro,
  10: Returns,
  11: () => <Plain no={11} />,
  12: Sensory,
  13: Inbound,
}

/* ── Tìm kiếm như portal: theo tên mục, chỉ tiêu, nhóm mẫu; không dấu cũng khớp ── */

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
const HAYSTACK: Record<number, string> = Object.fromEntries(
  GROUPS[0].sections.map((no) => {
    const s = section(no)
    const extra = no === 9 ? R.muc_9_vi_sinh.danh_sach_nhom.map((g) => g.loai_mau).join(' ') : no === 12 ? R.muc_12_cam_quan.danh_sach_mau.map((m) => m.lo).join(' ') : ''
    return [no, norm(`${s.name} ${s.checks.map(label).join(' ')} ${s.checks.map((c) => LABEL[c.key] ?? '').join(' ')} ${extra}`)]
  }),
)

/* ── Màn ── */

export function Tech({ group }: { group: GroupId }) {
  const g = GROUPS.find((x) => x.id === group)!
  const [q, setQ] = useState('')
  const nq = norm(q.trim())
  const shown = g.sections.filter((no) => !nq || HAYSTACK[no].includes(nq))
  const [active, setActive] = useState<number | null>(null)
  const go = (no: number) => {
    setActive(no)
    document.getElementById(`muc-${no}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  // Mục đang xem: mục cuối cùng có đầu mục đã cuộn qua mép trên (cộng khoảng đệm), để mục lục đánh dấu theo.
  const key = shown.join(',')
  useEffect(() => {
    const nos = key ? key.split(',').map(Number) : []
    let raf = 0
    const spy = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let cur = nos[0] ?? null
        for (const no of nos) {
          const el = document.getElementById(`muc-${no}`)
          if (el && el.getBoundingClientRect().top <= 140) cur = no
        }
        setActive(cur)
      })
    }
    spy()
    window.addEventListener('scroll', spy, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', spy)
    }
  }, [key])
  return (
    <main className="flex flex-col gap-3 px-6 pt-0.5 pb-6">
      <label className="relative block">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <span className="sr-only">Tìm chỉ tiêu, mục, mẫu</span>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm chỉ tiêu, hóa lý, mẻ nấu, vi sinh…" className="glass-pill h-9 rounded-full bg-white pl-10 dark:bg-popover" />
      </label>
      <div className="grid grid-cols-[--spacing(56)_minmax(0,1fr)] items-start gap-3">
        <nav aria-label="Mục lục báo cáo" className="glass-card glass-bg sticky top-3 flex max-h-[calc(100svh---spacing(6))] flex-col gap-0.5 overflow-y-auto p-2">
          <span className="px-2 pt-1 pb-1.5 text-2xs font-semibold tracking-wide text-muted-foreground uppercase">Mục lục · {g.name}</span>
          {shown.map((no) => {
            const s = section(no)
            const bad = s.checks.filter((c) => {
              const x = checkStatus(c)
              return x === 'over' || x === 'warn'
            })
            return (
              <button
                key={no}
                type="button"
                onClick={() => go(no)}
                aria-current={active === no ? 'location' : undefined}
                className={cn(
                  'flex cursor-pointer flex-col items-start gap-0.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-(--motion-fast) hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
                  active === no && 'bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)] hover:bg-primary/10',
                )}
              >
                <span className="flex w-full items-center gap-2 text-xs">
                  <span className="w-4 text-right text-2xs text-muted-foreground tabular-nums">{no}</span>
                  <span className={cn('truncate', active === no ? 'font-semibold' : 'font-medium')}>{s.name}</span>
                  <span className="ml-auto">
                    <StatusIcon status={sectionStatus(s)} />
                  </span>
                </span>
                {bad.length > 0 && (
                  <span className="w-full truncate pl-6 text-3xs text-muted-foreground">
                    {bad.map(label).slice(0, 2).join(', ')}
                    {bad.length > 2 ? '…' : ''}
                  </span>
                )}
              </button>
            )
          })}
          {!shown.length && <span className="px-2 py-1.5 text-xs text-muted-foreground">Không có mục khớp “{q}”</span>}
        </nav>
        <div key={group} className="flex min-w-0 flex-col gap-3 animate-in duration-200 fade-in-0">
          {shown.map((no) => {
            const V = VIEW[no]
            return <V key={no} />
          })}
        </div>
      </div>
    </main>
  )
}
