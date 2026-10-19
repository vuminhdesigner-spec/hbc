import { useState } from 'react'
import { CircleCheck, ChevronDown, ChevronRight, Flame, TriangleAlert } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Mode } from '../w1/Allocation'
import { fmt } from '../w1/data'
import { useCountUp } from '../w1/motion'
import { AllocBars, BiomassCard, ScatterCard } from './Charts'
import { KPI, METERS, STEAM_TREE, type SteamNode } from './data'

function Count({ value, dec }: { value: number; dec: number }) {
  return <>{fmt(useCountUp(value), dec)}</>
}

function Kpi({ title, children, note }: { title: string; children: React.ReactNode; note: string }) {
  return (
    <div className="glass-card glass-bg flex min-w-0 flex-col gap-1 px-4 py-3">
      <span className="text-xs text-muted-foreground">{title}</span>
      <span className="text-kpi font-bold tracking-tight tabular-nums">{children}</span>
      <span className="truncate text-2xs text-muted-foreground">{note}</span>
    </div>
  )
}

const Unit = ({ children }: { children: React.ReactNode }) => <small className="text-xs font-medium tracking-normal text-muted-foreground">{children}</small>

function Kpis() {
  return (
    <section aria-label="Chỉ số hơi" className="grid grid-cols-4 gap-3">
      <Kpi title="Hơi / 1.000 L thành phẩm" note={KPI.perL.note}>
        <Count value={KPI.perL.value} dec={0} /> <Unit>{KPI.perL.unit}</Unit>
      </Kpi>
      <Kpi title="Tổng hơi (đồng hồ tổng lò hơi)" note={KPI.total.note}>
        <Count value={KPI.total.value} dec={0} /> <Unit>{KPI.total.unit}</Unit>
      </Kpi>
      <Kpi title="Biomass · tháng 8" note={KPI.biomass.note}>
        <Count value={KPI.biomass.value} dec={0} /> <Unit>{KPI.biomass.unit}</Unit>
      </Kpi>
      <Kpi title="Ghi chỉ số tháng 9" note={KPI.read.note}>
        <Count value={KPI.read.done} dec={0} /> / {KPI.read.total} <Unit>đồng hồ</Unit>
      </Kpi>
    </section>
  )
}

/* ---------- Cây 4 đồng hồ hơi ---------- */

function Row({ node, depth, selected, onSelect, open, onToggle, children }: { node: SteamNode; depth: number; selected: string; onSelect: (n: SteamNode) => void; open: boolean; onToggle: () => void; children?: React.ReactNode }) {
  const has = !!node.children?.length
  const on = node.id === selected
  return (
    <li role="treeitem" aria-expanded={has ? open : undefined} aria-selected={on} className="flex flex-col">
      <div
        className={cn(
          'grid min-h-9 grid-cols-[1fr_--spacing(12)_--spacing(9)] items-center gap-2 rounded-lg pr-2 transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted',
          on && 'bg-accent shadow-[inset_3px_0_0_var(--ring)] hover:bg-accent',
        )}
        style={{ paddingLeft: `calc(var(--spacing) * ${2 + depth * 3.5})` }}
      >
        <span className="flex min-w-0 items-start gap-1 py-1">
          {has ? (
            <button type="button" aria-label={open ? `Thu gọn ${node.name}` : `Mở ${node.name}`} onClick={onToggle} className="mt-0.5 grid size-4 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground">
              {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          ) : (
            <span className="size-4 shrink-0" />
          )}
          <button type="button" onClick={() => onSelect(node)} className="flex min-w-0 flex-col text-left">
            <span className={cn('truncate text-xs', depth === 0 ? 'font-semibold' : 'font-normal', node.muted && 'text-muted-foreground italic')}>{node.name}</span>
            <span className={cn('flex items-center gap-1 truncate text-3xs text-muted-foreground', node.warn && 'text-warning-foreground')}>
              {node.warn && <TriangleAlert className="size-2.5 shrink-0" />}
              <span className="truncate">{node.sub}</span>
            </span>
          </button>
        </span>
        <span className={cn('text-right text-xs tabular-nums', node.muted && 'text-muted-foreground')}>{fmt(node.t, 0)}</span>
        <span className="text-right text-2xs text-muted-foreground tabular-nums">{node.share}</span>
      </div>
      {children}
    </li>
  )
}

function SteamTree({ selected, onSelect }: { selected: string; onSelect: (n: SteamNode) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <aside aria-label="Cây đồng hồ hơi" className="glass-card glass-bg flex min-h-0 flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="kpi-tile grid size-7.5 shrink-0 place-items-center rounded-glass-inner text-foreground" style={{ '--tint': 'var(--chart-3)' } as React.CSSProperties}>
          <Flame className="size-3.75" strokeWidth={2.2} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body font-semibold">Cây đồng hồ hơi</span>
          <span className="text-2xs text-muted-foreground">4 đồng hồ · tấn · bấm một nút để lọc cả màn</span>
        </span>
      </div>
      <ul role="tree" aria-label="Cây đồng hồ hơi" className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
        <Row node={STEAM_TREE} depth={0} selected={selected} onSelect={onSelect} open={open} onToggle={() => setOpen((o) => !o)}>
          {open && (
            <ul role="group" className="flex flex-col">
              {STEAM_TREE.children!.map((c) => (
                <Row key={c.id} node={c} depth={1} selected={selected} onSelect={onSelect} open={false} onToggle={() => {}} />
              ))}
            </ul>
          )}
        </Row>
      </ul>
      <div className="border-t border-border px-4 py-3 text-2xs leading-relaxed text-muted-foreground">
        Thất thoát / chưa đo = tổng lò hơi − nấu, lọc, chiết keg
        <br />
        <b className="text-foreground tabular-nums">3.035 − 2.610 = 425 tấn · 14,0%</b>
        <br />
        Thiếu dữ liệu không vẽ thành số 0. Đồng hồ hơi nấu thay từ 06/2026: các kỳ trước hiện "Chưa có số", phần thất thoát kỳ đó cũng không tính.
      </div>
    </aside>
  )
}

/* ---------- Đồng hồ cần xử lý: tháng 9 đủ 4 / 4, hiện trạng thái trống ---------- */

function Issues() {
  return (
    <section aria-label="Đồng hồ cần xử lý" className="glass-card glass-bg flex min-h-0 min-w-0 flex-col">
      <div className="flex flex-col gap-0.5 px-4.5 pt-3.5 pb-2">
        <span className="text-body font-semibold">Đồng hồ cần xử lý · tháng 9/2026</span>
        <span className="text-2xs text-muted-foreground">4 / 4 đã ghi · chỉ liệt kê đồng hồ chưa ghi hoặc số cần kiểm tra</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border px-4.5 py-4 text-center text-xs text-muted-foreground">
        <CircleCheck className="size-5" />
        Không có đồng hồ cần xử lý trong tháng này.
      </div>
      <span className="px-4.5 pt-2 pb-3 text-2xs text-muted-foreground">Số đọc cần kiểm tra không đưa vào đồ thị và tổng công đoạn cho đến khi được xác nhận.</span>
    </section>
  )
}

export function SteamMeterSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const NUM = 'text-right tabular-nums'
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="glass-card inset-y-2.5! right-2.5! h-auto! w-200! max-w-none! gap-0 overflow-hidden bg-background">
        <SheetHeader className="border-b border-border px-4 py-3.5 pr-14">
          <SheetTitle className="text-sm font-semibold">Bảng đồng hồ hơi · tháng 9/2026</SheetTitle>
          <SheetDescription className="text-2xs">Tấn · cột theo bảng theo dõi hơi của nhà máy (cần đối chiếu)</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Table className="text-xs">
            <TableHeader className="bg-muted text-2xs">
              <TableRow>
                <TableHead>Đồng hồ</TableHead>
                <TableHead>Công đoạn</TableHead>
                <TableHead className={NUM}>Tấn</TableHead>
                <TableHead className={NUM}>% tổng</TableHead>
                <TableHead>Ghi chỉ số</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {METERS.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className={cn(m.muted && 'text-muted-foreground italic')}>{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.stage}</TableCell>
                  <TableCell className={cn(NUM, 'font-semibold')}>{m.t}</TableCell>
                  <TableCell className={NUM}>{m.share}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {!m.muted && <CircleCheck className="size-3" />}
                      {m.note}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  )
}

type Props = { mode: Mode; onMode: (m: Mode) => void; node: string; onNode: (n: SteamNode) => void }

/** Tab Hơi (W5): bố cục như tab Điện, chỗ khối khung giờ thay bằng theo dõi biomass. Phần thành tiền, xỉ chờ PM chốt. */
export function Hoi({ mode, onMode, node, onNode }: Props) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[--spacing(75)_minmax(0,1fr)] gap-3 px-6 pt-0.5 pb-4">
      <SteamTree selected={node} onSelect={onNode} />
      <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(--spacing(80),1fr)_auto] gap-3">
        <Kpis />
        <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3">
          <AllocBars mode={mode} onMode={onMode} />
          <ScatterCard />
        </section>
        <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] gap-3">
          <Issues />
          <div className="flex h-72 min-h-0 *:flex-1">
            <BiomassCard />
          </div>
        </section>
      </div>
    </div>
  )
}
