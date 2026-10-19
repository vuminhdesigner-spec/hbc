import { ArrowDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '../w1/Alerts'
import type { Mode } from '../w1/Allocation'
import { fmt } from '../w1/data'
import { useCountUp } from '../w1/motion'
import { AllocBars, DailyCard, ScatterCard } from './Charts'
import { KPI, SHIFTS } from './data'

function Count({ value, dec }: { value: number; dec: number }) {
  return <>{fmt(useCountUp(value), dec)}</>
}

export function Kpi({ title, children, note }: { title: string; children: React.ReactNode; note: string }) {
  return (
    <div className="glass-card glass-bg flex min-w-0 flex-col gap-1 px-4 py-3">
      <span className="truncate text-xs text-muted-foreground">{title}</span>
      <span className="text-kpi font-bold tracking-tight tabular-nums">{children}</span>
      <span className="line-clamp-2 text-2xs text-muted-foreground">{note}</span>
    </div>
  )
}

export const Unit = ({ children }: { children: React.ReactNode }) => <small className="text-xs font-medium tracking-normal text-muted-foreground">{children}</small>

function Shifts() {
  return (
    <section aria-label="Bất thường trong ca" className="glass-card glass-bg flex min-h-0 min-w-0 flex-col">
      <div className="flex flex-col gap-0.5 px-4.5 pt-3.5 pb-2">
        <span className="text-body font-semibold">Bất thường trong ca · tháng 9/2026</span>
        <span className="text-2xs text-muted-foreground">So trung bình cùng ca kỳ so sánh, chưa tính theo sản lượng · ngưỡng ±15% tạm lấy theo cảnh báo số 6, chờ xác nhận</span>
      </div>
      <ul className="flex min-h-0 flex-col overflow-y-auto">
        {SHIFTS.map((s) => {
          const d = (s.v / s.cmp - 1) * 100
          return (
            <li key={s.day + s.meter} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 border-t border-border px-4.5 py-1.5 text-xs tabular-nums">
              <span className="truncate font-medium">{s.meter}</span>
              <span className="row-span-2">
                {s.state === 'over' ? (
                  <StatusBadge kind="over">Vượt</StatusBadge>
                ) : (
                  <Badge variant="outline" className="font-semibold">
                    <ArrowDown strokeWidth={2.6} />
                    Thấp bất thường
                  </Badge>
                )}
              </span>
              <span className="line-clamp-2 text-2xs text-muted-foreground">
                {s.day} · ca {s.shift} · {fmt(s.v, 0)} m³ · {d > 0 ? '+' : '−'}
                {fmt(Math.abs(d), 0)}% so cùng kỳ ({fmt(s.cmp, 0)}){s.state === 'under' && ' · kiểm tra số đọc'}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

type Props = { group: 'area' | 'stage'; mode: Mode; onMode: (m: Mode) => void }

/** Tab Nước (W3), màn Tiêu thụ — theo wireframe v0.3 đã review 19/10. */
export function Nuoc({ group, mode, onMode }: Props) {
  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(--spacing(72),1fr)_minmax(--spacing(72),1fr)] gap-3 px-6 pt-0.5 pb-4">
      <section aria-label="Chỉ số nước" className="grid grid-cols-5 gap-3">
        {KPI.map((k) => (
          <Kpi key={k.title} title={k.title} note={k.note}>
            <Count value={k.value} dec={k.dec} /> <Unit>{k.unit}</Unit>
          </Kpi>
        ))}
      </section>
      <section className="grid min-h-0 grid-cols-2 gap-3">
        <AllocBars key={group + mode} group={group} mode={mode} onMode={onMode} />
        <ScatterCard />
      </section>
      <section className="grid min-h-0 grid-cols-3 gap-3">
        <DailyCard kind="well" />
        <DailyCard kind="waste" />
        <Shifts />
      </section>
    </div>
  )
}
