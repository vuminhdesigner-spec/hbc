import { useState } from 'react'
import { ArrowRight, ArrowUpRight, ChevronRight, Microscope, PackageCheck, ShieldCheck, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { GoButton, Tile } from '../w1/Kpis'
import { useCountUp } from '../w1/motion'
import { CheckCards, QcBadge } from './bits'
import { RETURNS, SECTIONS, SUPPLIERS, checkStatus, fmt, label, section, sectionStatus, type Section, type Status } from './data'
import { R } from './report'

/* ── Hàng 1 · Chỉ số ── */

const FIN_LOTS = Object.values(R.muc_6_thanh_pham.san_phams).reduce((a, p) => a + p.so_mau, 0)

function CountUp({ value, dec }: { value: number; dec: number }) {
  return <>{fmt(useCountUp(value), dec)}</>
}

/** Thanh tô chuyển màu từ nhạt sang đậm như thanh báo cáo năng lượng (AllocRow). */
const fill = (c: string, end = c) => `linear-gradient(90deg, color-mix(in srgb, ${c} 55%, var(--popover)), ${end})`
/** Vàng của thẻ đổi trả: đầu đậm như thanh Điện của báo cáo năng lượng. */
const YELLOW = fill('var(--chart-1)', 'var(--chart-ext-chart-1-deep)')

function Kpis({ onGo }: { onGo: (no: number) => void }) {
  const counts = SECTIONS.reduce(
    (a, s) => {
      a[sectionStatus(s)]++
      return a
    },
    { ok: 0, warn: 0, over: 0, none: 0 } as Record<Status, number>,
  )
  const total = SECTIONS.length
  // Số mẫu thuộc nhóm có kết luận không đạt (theo nhãn đánh giá từng nhóm của backend mục 9).
  const microBad = R.muc_9_vi_sinh.danh_sach_nhom.filter((g) => /KHÔNG/i.test(g.danh_gia)).reduce((a, g) => a + g.so_mau, 0)
  const ratePos = (RETURNS.rate / 0.15) * 100
  // Thẻ theo chuẩn v2-glass của báo cáo năng lượng: ô icon, tên, mốc so sánh, nút sang tab Kỹ thuật; mỗi thẻ một màu chuỗi (kpi-tint).
  return (
    <section aria-label="Chỉ số" className="grid grid-cols-4 gap-3">
      <div className="kpi-tint glass-card relative flex min-w-0 flex-col gap-0.5 pt-3 pr-3.5 pb-2.5 pl-4" style={{ '--tint': 'var(--chart-5)' } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <Tile icon={ShieldCheck} />
          <span className="text-xs font-semibold">Mục đạt tiêu chuẩn</span>
          <span className="ml-auto text-2xs whitespace-nowrap text-muted-foreground">{total} mục</span>
          <GoButton label="Xem tab Kỹ thuật" icon={ArrowUpRight} onClick={() => onGo(1)} />
        </div>
        <span className="flex items-end gap-2">
          <span className="text-kpi font-bold tracking-tight tabular-nums">
            <CountUp value={counts.ok} dec={0} />
            <small className="text-base font-semibold text-muted-foreground">/{total}</small>
          </span>
          <span className="mb-1 ml-auto flex gap-1.5">
            <QcBadge status="over" label={`${counts.over} vượt`} />
            {counts.warn > 0 && <QcBadge status="warn" label={`${counts.warn}`} />}
          </span>
        </span>
        <div role="img" aria-label={`${counts.ok} đạt, ${counts.over} vượt, ${counts.none} chưa có số`} className="mt-auto flex h-2 gap-0.5 overflow-hidden rounded-full">
          <i style={{ flex: counts.ok, backgroundImage: fill('var(--success)') }} />
          <i style={{ flex: counts.warn, backgroundImage: fill('var(--status-warning-solid)') }} />
          <i style={{ flex: counts.over, backgroundImage: fill('var(--status-destructive-solid)') }} />
          <i className="bg-chart-track" style={{ flex: counts.none }} />
        </div>
        <span className="text-2xs text-muted-foreground">
          {counts.ok} đạt · {counts.over} vượt · {counts.none} chưa có số đo
        </span>
      </div>

      <div className="kpi-tint glass-card relative flex min-w-0 flex-col gap-0.5 pt-3 pr-3.5 pb-2.5 pl-4" style={{ '--tint': 'var(--chart-2)' } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <Tile icon={Microscope} />
          <span className="text-xs font-semibold">Mẫu vi sinh không đạt</span>
          <span className="ml-auto" />
          <GoButton label="Xem mục 9 ở tab Kỹ thuật" icon={ArrowUpRight} onClick={() => onGo(9)} />
        </div>
        <span className="flex items-end gap-2">
          <span className="text-kpi font-bold tracking-tight tabular-nums">
            {microBad}
            <small className="text-base font-semibold text-muted-foreground">/{R.muc_9_vi_sinh.tong_so_mau}</small>
          </span>
          <QcBadge status={microBad ? 'over' : 'ok'} className="mb-1 ml-auto" />
        </span>
        <span className="mt-auto text-2xs text-muted-foreground">{R.muc_9_vi_sinh.tong_so_mau} mẫu · {R.muc_9_vi_sinh.danh_sach_nhom.length} nhóm mẫu · 9 chỉ tiêu vi sinh</span>
      </div>

      <div className="kpi-tint glass-card relative flex min-w-0 flex-col gap-0.5 pt-3 pr-3.5 pb-2.5 pl-4" style={{ '--tint': 'var(--chart-3)' } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <Tile icon={PackageCheck} />
          <span className="text-xs font-semibold">Lô thành phẩm đạt khi xuất xưởng</span>
          <span className="ml-auto" />
          <GoButton label="Xem mục 6 ở tab Kỹ thuật" icon={ArrowUpRight} onClick={() => onGo(6)} />
        </div>
        <span className="flex items-end gap-2">
          <span className="text-kpi font-bold tracking-tight tabular-nums">
            <CountUp value={sectionStatus(section(6)) === 'ok' ? FIN_LOTS : 0} dec={0} />
            <small className="text-base font-semibold text-muted-foreground">/{FIN_LOTS}</small>
          </span>
          <QcBadge status="ok" className="mb-1 ml-auto" />
        </span>
        <span className="mt-auto text-2xs text-muted-foreground">Keg 50 L MB, MN, MT và PET 1 L · Cpk cồn 1,45</span>
      </div>
      <div className="kpi-tint glass-card relative flex min-w-0 flex-col gap-0.5 pt-3 pr-3.5 pb-2.5 pl-4" style={{ '--tint': 'var(--chart-1)' } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <Tile icon={Undo2} onYellow />
          <span className="text-xs font-semibold">Tỷ lệ đổi trả bia hơi</span>
          <span className="ml-auto text-2xs whitespace-nowrap text-muted-foreground">Ngưỡng ≤ 0,10%</span>
          <GoButton label="Xem mục 10 ở tab Kỹ thuật" icon={ArrowUpRight} onClick={() => onGo(10)} />
        </div>
        <span className="flex items-end gap-2">
          <span className="text-kpi font-bold tracking-tight tabular-nums">
            <CountUp value={RETURNS.rate} dec={3} />
            <small className="text-xs font-medium text-muted-foreground"> %</small>
          </span>
          <QcBadge status="ok" className="mb-1 ml-auto" />
        </span>
        <div role="img" aria-label="0,059% trên ngưỡng 0,10%" className="relative mt-auto h-2 rounded-full bg-chart-track">
          <i className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${ratePos}%`, backgroundImage: YELLOW }} />
          <b className="absolute -top-1 -bottom-1 w-0.75 rounded-xs bg-foreground ring-2 ring-card" style={{ left: `${(RETURNS.limit / 0.15) * 100}%` }} />
        </div>
        <span className="truncate text-2xs text-muted-foreground tabular-nums">
          {fmt(RETURNS.liters, 0)} L lỗi / {fmt(RETURNS.output / 1e6, 2)} triệu L xuất xưởng
        </span>
      </div>
    </section>
  )
}

/* ── Hàng 2 · Chất lượng theo mục: 13 mục theo thứ tự portal, mỗi mục một dòng. Mục lệch ghi tên chỉ tiêu lệch;
   số đo, TC và thanh xem trong ngăn chi tiết khi bấm dòng. ── */

/** Dòng mục: mục có chỉ tiêu vượt / chạm ngưỡng thì mở ngăn chi tiết; mục còn lại chuyển thẳng sang mục đó ở tab Kỹ thuật. */
const ROW = '-mx-2 grid w-[calc(100%+--spacing(4))] grid-cols-[--spacing(26)_--spacing(56)_minmax(0,1fr)_auto_auto] items-center gap-x-3 rounded-lg px-2 py-2 text-left'

function Sections({ onOpen, onGo }: { onOpen: (no: number) => void; onGo: (no: number) => void }) {
  return (
    <section aria-label="Chất lượng theo mục" className="glass-card glass-bg col-span-2 flex min-w-0 flex-col px-4.5 pt-3.5 pb-3">
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="text-body font-semibold">Chất lượng theo mục</h2>
        <span className="text-2xs text-muted-foreground">Chỉ tiêu lệch: có ít nhất một mẻ ngoài TC trong kỳ · bấm dòng xem chi tiết</span>
      </div>
      <ul className="flex flex-col">
        {SECTIONS.map((sec) => {
          const status = sectionStatus(sec)
          const sts = sec.checks.map(checkStatus)
          const bad = sec.checks.filter((_, i) => sts[i] === 'over' || sts[i] === 'warn')
          const measured = sts.filter((s) => s !== 'none').length
          const names = [...new Set(bad.map(label))].join(', ')
          const note = bad.length ? names : (sec.manual?.reason ?? '')
          return (
            <li key={sec.no} className="border-t border-border first:border-t-0">
              {bad.length > 0 ? (
                <button type="button" onClick={() => onOpen(sec.no)} aria-haspopup="dialog" className={cn(ROW, 'cursor-pointer transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring')}>
                <QcBadge status={status} />
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="text-2xs text-muted-foreground tabular-nums">Mục {sec.no}</span>
                  <b className="truncate text-body font-semibold">{sec.name}</b>
                </span>
                <span className={cn('truncate text-2xs', bad.length ? 'text-destructive' : 'text-muted-foreground')} title={note}>
                  {note}
                </span>
                <span className="text-right text-2xs whitespace-nowrap text-muted-foreground tabular-nums">
                  {bad.length > 0 ? (
                    <>
                      <b className="font-semibold text-destructive">{bad.length}</b> / {measured} chỉ tiêu lệch
                    </>
                  ) : measured > 0 ? (
                    `${measured} chỉ tiêu đạt`
                  ) : (
                    ''
                  )}
                </span>
                <ChevronRight aria-hidden className="size-3.5 text-muted-foreground" />
                </button>
              ) : (
                <button type="button" onClick={() => onGo(sec.no)} className={cn(ROW, 'cursor-pointer transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring')}>
                <QcBadge status={status} />
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="text-2xs text-muted-foreground tabular-nums">Mục {sec.no}</span>
                  <b className="truncate text-body font-semibold">{sec.name}</b>
                </span>
                <span className={cn('truncate text-2xs', bad.length ? 'text-destructive' : 'text-muted-foreground')} title={note}>
                  {note}
                </span>
                <span className="text-right text-2xs whitespace-nowrap text-muted-foreground tabular-nums">
                  {bad.length > 0 ? (
                    <>
                      <b className="font-semibold text-destructive">{bad.length}</b> / {measured} chỉ tiêu lệch
                    </>
                  ) : measured > 0 ? (
                    `${measured} chỉ tiêu đạt`
                  ) : (
                    ''
                  )}
                </span>
                <ChevronRight aria-hidden className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ── Cột phải · Khiếu nại, NVL ── */

function Bars({ rows, unit, dec = 0, bg = fill('var(--chart-5)') }: { rows: { label: string; sub?: string; v: number }[]; unit: string; dec?: number; bg?: string }) {
  const max = Math.max(...rows.map((r) => r.v), 1)
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1">
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className="truncate text-xs">{r.label}</span>
            {r.sub && <span className="truncate text-3xs text-muted-foreground">{r.sub}</span>}
          </span>
          <b className="text-xs font-semibold tabular-nums">
            {fmt(r.v, dec)} <small className="font-normal text-muted-foreground">{unit}</small>
          </b>
          <span className="col-span-2 h-1.5 rounded-full bg-chart-track">
            <i className="block h-full rounded-full transition-[width] duration-(--motion-data) ease-(--ease-standard)" style={{ width: `${(r.v / max) * 100}%`, backgroundImage: bg }} />
          </span>
        </li>
      ))}
    </ul>
  )
}

function Side({ onGo }: { onGo: (no: number) => void }) {
  const quality = RETURNS.causes.filter((c) => c.kind === 'Chất lượng bia').reduce((s, c) => s + c.n, 0)
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <section aria-label="Khiếu nại bia hơi" className="glass-card glass-bg flex flex-col gap-2.5 px-4.5 pt-3.5 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-body font-semibold">Keg đổi trả theo nguyên nhân</h2>
          <Button variant="ghost" size="icon-xs" aria-label="Xem mục 10 ở tab Kỹ thuật" onClick={() => onGo(10)} className="glass-pill ml-auto rounded-full text-muted-foreground hover:text-ring">
            <ArrowRight />
          </Button>
        </div>
        <p className="text-2xs text-muted-foreground tabular-nums">
          {RETURNS.keg} keg · lỗi vỏ keg {RETURNS.causes[0].n}, lỗi chất lượng bia {quality} · không có chai 1 L bị khiếu nại
        </p>
        <Bars rows={RETURNS.causes.map((c) => ({ label: c.name, sub: c.kind, v: c.n }))} unit="keg" bg={YELLOW} />
      </section>
      <section aria-label="Nguyên vật liệu nhập" className="glass-card glass-bg flex flex-col gap-2.5 px-4.5 pt-3.5 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-body font-semibold">Nguyên liệu nhập theo nhà cung cấp</h2>
          <Button variant="ghost" size="icon-xs" aria-label="Xem mục 13 ở tab Kỹ thuật" onClick={() => onGo(13)} className="glass-pill ml-auto rounded-full text-muted-foreground hover:text-ring">
            <ArrowRight />
          </Button>
        </div>
        <p className="text-2xs text-muted-foreground">Tất cả lô nhập đều đạt; chưa có lô trả về.</p>
        <Bars rows={SUPPLIERS.map((s) => ({ label: s.name, sub: `${s.ok}/${s.total} lô đạt`, v: s.tons }))} unit="tấn" dec={1} />
      </section>
    </div>
  )
}

/* ── Ngăn kéo chi tiết: chỉ tiêu, TC, dải Min–Max so với TC ── */

/** Mục trong ngăn chi tiết, cho quản lý: chỉ liệt kê chỉ tiêu vượt TC hoặc chạm ngưỡng; còn lại chỉ đếm, xem đủ ở tab Kỹ thuật. */
function SectionBlock({ s }: { s: Section }) {
  const status = sectionStatus(s)
  const sts = s.checks.map(checkStatus)
  const bad = s.checks.filter((_, i) => sts[i] === 'over' || sts[i] === 'warn')
  const ok = sts.filter((x) => x === 'ok').length
  const none = sts.filter((x) => x === 'none').length
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="grid size-5.5 place-items-center rounded-md bg-muted text-2xs font-semibold tabular-nums">{s.no}</span>
        <h3 className="truncate text-sm font-semibold">{s.name}</h3>
        <QcBadge status={status} className="ml-auto" />
      </div>
      <p className="text-2xs text-muted-foreground">
        {s.samples} · Nguồn: {s.source}
      </p>
      {s.manual && <p className="text-xs">{s.manual.reason}</p>}
      {bad.length > 0 && <CheckCards checks={bad} />}
      {s.checks.length > 0 && (
        <p className="text-2xs text-muted-foreground">
          {bad.length === 0 ? 'Không có chỉ tiêu vượt tiêu chuẩn hoặc chạm ngưỡng. ' : ''}
          {ok > 0 && `${ok} chỉ tiêu đạt`}
          {ok > 0 && none > 0 && ' · '}
          {none > 0 && `${none} chưa có số`} · xem đủ ở tab Kỹ thuật
        </p>
      )}
    </section>
  )
}

export type Open = { title: string; sections: number[] } | null

function Detail({ open, onClose }: { open: Open; onClose: () => void }) {
  return (
    <Sheet open={!!open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="glass-card inset-y-2.5! right-2.5! h-auto! w-150! max-w-none! gap-0 overflow-hidden bg-background">
        {open && (
          <>
            <SheetHeader className="gap-1 border-b border-border px-5 py-4 pr-14">
              <SheetTitle className="text-base font-semibold">{open.title}</SheetTitle>
              <SheetDescription className="text-2xs">Tháng 8/2026 · chỉ tiêu vượt tiêu chuẩn hoặc chạm ngưỡng · trên thanh: Min – Max đo được · dưới thanh và vùng xanh: tiêu chuẩn · chấm: trung bình</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-4">
              {open.sections.map((n) => (
                <SectionBlock key={n} s={section(n)} />
              ))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/** Màn Tổng quan cho Ban giám đốc: chỉ số, chất lượng theo mục, khiếu nại và NVL. */
export function Overview({ onGo }: { onGo: (no: number) => void }) {
  const [open, setOpen] = useState<Open>(null)
  const openSection = (no: number) => setOpen({ title: `Mục ${no} · ${section(no).name}`, sections: [no] })
  return (
    <main className="flex flex-col gap-3 px-6 pt-0.5 pb-6">
      <Kpis onGo={onGo} />
      <div className="grid grid-cols-3 gap-3">
        <Sections onOpen={openSection} onGo={onGo} />
        <Side onGo={onGo} />
      </div>
      <Detail open={open} onClose={() => setOpen(null)} />
    </main>
  )
}
