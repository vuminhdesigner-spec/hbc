import { CircleCheck, Clock, TriangleAlert } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { StatusBadge } from '../w1/Alerts'
import type { Mode } from '../w1/Allocation'
import { fmt } from '../w1/data'
import { useCountUp } from '../w1/motion'
import { AllocBars, ScatterCard, TouCard } from './Charts'
import { MeterTree } from './MeterTree'
import { KPI, METERS, type MeterStatus, type TreeNode } from './data'

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
    <section aria-label="Chỉ số điện" className="grid grid-cols-4 gap-3">
      <Kpi title="Điện / 1.000 L" note={KPI.perL.note}>
        <Count value={KPI.perL.value} dec={KPI.perL.dec} /> <Unit>{KPI.perL.unit}</Unit>
      </Kpi>
      <Kpi title="Tổng điện (Σ 4 MBA)" note={KPI.total.note}>
        <Count value={KPI.total.value} dec={0} /> <Unit>{KPI.total.unit}</Unit>
      </Kpi>
      <Kpi title="Tổn hao MBA" note={KPI.loss.note}>
        <Count value={KPI.loss.value} dec={0} /> <Unit>{KPI.loss.unit}</Unit>
      </Kpi>
      <Kpi title="Ghi chỉ số tháng 9" note={KPI.read.note}>
        <Count value={KPI.read.done} dec={0} /> / {KPI.read.total} <Unit>đồng hồ</Unit>
      </Kpi>
    </section>
  )
}

const STATUS_ICON: Record<MeterStatus, typeof Clock> = { ok: CircleCheck, wait: Clock, warn: TriangleAlert }

function Issues() {
  const rows = METERS.filter((m) => m.status !== 'ok')
  return (
    <section aria-label="Đồng hồ cần xử lý" className="glass-card glass-bg flex min-h-0 min-w-0 flex-col">
      <div className="flex flex-col gap-0.5 px-4.5 pt-3.5 pb-2">
        <span className="text-body font-semibold">Đồng hồ cần xử lý · tháng 9/2026</span>
        <span className="text-2xs text-muted-foreground">29 / 32 đã ghi · chỉ liệt kê đồng hồ chưa ghi hoặc số cần kiểm tra</span>
      </div>
      <ul className="flex flex-col">
        {rows.map((m) => (
          <li key={m.name} className="grid h-10 grid-cols-[1.6fr_1fr_0.5fr_1.7fr] items-center gap-2 border-t border-border px-4.5 text-xs tabular-nums transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted">
            <span className="truncate font-medium">{m.name}</span>
            <span className="truncate text-muted-foreground">{m.area}</span>
            <span className="text-muted-foreground">TI {m.ti}</span>
            <span className="flex min-w-0">
              <StatusBadge kind="warn" className="max-w-full">
                <span className="truncate">{m.note}</span>
              </StatusBadge>
            </span>
          </li>
        ))}
      </ul>
      <span className="mt-auto px-4.5 pt-2 pb-3 text-2xs text-muted-foreground">Số đọc cần kiểm tra không đưa vào đồ thị và tổng khu vực cho đến khi được xác nhận.</span>
    </section>
  )
}

export function MeterSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const NUM = 'text-right tabular-nums'
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="glass-card inset-y-2.5! right-2.5! h-auto! w-225! max-w-none! gap-0 overflow-hidden bg-background">
        <SheetHeader className="border-b border-border px-4 py-3.5 pr-14">
          <SheetTitle className="text-sm font-semibold">Bảng đồng hồ điện · tháng 9/2026</SheetTitle>
          <SheetDescription className="text-2xs">Cột theo bảng theo dõi điện của nhà máy · MWh · chỉ MBA và lò hơi ghi 3 khung giờ · TI: hệ số biến dòng</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Table className="text-xs">
            <TableHeader className="bg-muted text-2xs">
              <TableRow>
                <TableHead>Đồng hồ</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead className={NUM}>Cao điểm</TableHead>
                <TableHead className={NUM}>Bình thường</TableHead>
                <TableHead className={NUM}>Thấp điểm</TableHead>
                <TableHead className={NUM}>Tổng</TableHead>
                <TableHead className={NUM}>TI</TableHead>
                <TableHead>Ghi chỉ số</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {METERS.map((m) => {
                const Icon = STATUS_ICON[m.status]
                return (
                  <TableRow key={m.name}>
                    <TableCell className="max-w-56 truncate">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.area}</TableCell>
                    <TableCell className={NUM}>{m.peak}</TableCell>
                    <TableCell className={NUM}>{m.normal}</TableCell>
                    <TableCell className={NUM}>{m.low}</TableCell>
                    <TableCell className={cn(NUM, 'font-semibold')}>{m.sum}</TableCell>
                    <TableCell className={NUM}>{m.ti}</TableCell>
                    <TableCell className={cn('whitespace-nowrap', m.status === 'ok' ? 'text-muted-foreground' : 'font-semibold text-warning-foreground')}>
                      <span className="inline-flex items-center gap-1">
                        <Icon className="size-3" />
                        {m.note}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  )
}

type Props = { group: 'area' | 'stage'; mode: Mode; onMode: (m: Mode) => void; node: string; onNode: (n: TreeNode) => void }

/** Tab Điện (W2) theo wireframe v0.3 đã review 19/10. */
export function Dien({ group, mode, onMode, node, onNode }: Props) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[--spacing(75)_minmax(0,1fr)] gap-3 px-6 pt-0.5 pb-4">
      <MeterTree selected={node} onSelect={onNode} />
      <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(--spacing(80),1fr)_auto] gap-3">
        <Kpis />
        <section className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3">
          <AllocBars key={group + mode} group={group} mode={mode} onMode={onMode} />
          <ScatterCard />
        </section>
        <section className="grid min-h-0 grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-3">
          <Issues />
          <div className="flex h-72 min-h-0 *:flex-1">
            <TouCard />
          </div>
        </section>
      </div>
    </div>
  )
}

export { StatusBadge }
