import { ArrowUpRight, Droplet, Flame, Gauge, Info, Zap, type LucideIcon } from 'lucide-react'
import { Area, AreaChart, Tooltip as ChartTooltip, YAxis } from 'recharts'
import { ChartTip, ChartTipRow, LegendLine } from './chart-bits'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { StatusBadge } from './Alerts'
import { useCountUp, useReducedMotion } from './motion'
import { METRICS, SERIES_COLOR, fmt, type Metric } from './data'

const CARDS: { k: Metric; name: string; ref: string; value: number; dec: number; unit: string; delta: string; icon: LucideIcon }[] = [
  { k: 'dien', name: 'Điện / 1.000 L', ref: 'Định mức 105', value: 83, dec: 1, unit: 'kWh', delta: '▼ 1,2% so cùng kỳ · kỳ vọng 80,0 (+3,7%)', icon: Zap },
  { k: 'nuoc', name: 'Nước / 1.000 L', ref: 'Không có định mức', value: 3.4, dec: 2, unit: 'm³', delta: '▼ 2,9% so cùng kỳ', icon: Droplet },
  { k: 'hoi', name: 'Hơi / 1.000 L', ref: 'Không có định mức', value: 375, dec: 0, unit: 'kg', delta: '▼ 1,6% so cùng kỳ', icon: Flame },
]

/** Số chính chạy lên khi mở màn và khi đổi kỳ (người dùng chọn 19/10). */
function CountUp({ value, dec }: { value: number; dec: number }) {
  return <>{fmt(useCountUp(value), dec)}</>
}

function Tile({ icon: Icon, onYellow }: { icon: LucideIcon; onYellow?: boolean }) {
  return (
    <span className={cn('kpi-tile grid size-7.5 shrink-0 place-items-center rounded-glass-inner', onYellow ? 'text-chart-1-foreground' : 'text-cta-foreground')}>
      <Icon className="size-3.75" strokeWidth={2.2} />
    </span>
  )
}

/** Sparkline 9 tháng; rê chuột hiện tháng, năm nay và cùng kỳ. */
function Spark({ k, id }: { k: Metric; id: string }) {
  const reduced = useReducedMotion()
  const m = METRICS[k]
  const color = SERIES_COLOR[k]
  const rows = m.cur.map((v, i) => ({ i, v, p: m.prior[i] }))
  return (
    <AreaChart width={112} height={34} data={rows} margin={{ top: 4, right: 4, bottom: 4, left: 0 }} className="cursor-crosshair" aria-label={`${m.title}, rê chuột để xem từng tháng`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.55} />
          <stop offset="1" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <YAxis hide domain={['dataMin', 'dataMax']} />
      <Area
        dataKey="v"
        type="linear"
        stroke={color}
        strokeWidth={2}
        fill={`url(#${id})`}
        isAnimationActive={!reduced}
        animationDuration={1500}
        dot={(p) =>
          p.index === rows.length - 1 ? <circle key="last" cx={p.cx} cy={p.cy} r={3.5} fill={color} stroke="var(--card)" strokeWidth={2} /> : <g key={p.index} />
        }
        activeDot={{ r: 3.5, fill: color, stroke: 'var(--card)', strokeWidth: 2 }}
      />
      <ChartTooltip
        isAnimationActive={false}
        allowEscapeViewBox={{ x: true, y: true }}
        offset={12}
        wrapperStyle={{ zIndex: 20 }}
        cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '2 2' }}
        content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          const r = payload[0].payload as (typeof rows)[number]
          return (
            <ChartTip title={`Tháng ${r.i + 1}`}>
              <ChartTipRow swatch={<LegendLine color={color} />} label="2026" value={`${fmt(r.v, m.dec)} ${m.unit}`} />
              <ChartTipRow swatch={<LegendLine color="var(--chart-4)" faint />} label="Cùng kỳ 2025" value={`${fmt(r.p, m.dec)} ${m.unit}`} />
            </ChartTip>
          )
        }}
      />
    </AreaChart>
  )
}

function GoButton({ label, icon: Icon, onClick, disabled }: { label: string; icon: LucideIcon; onClick?: () => void; disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label={label} onClick={onClick} aria-disabled={disabled} className="glass-pill rounded-full text-muted-foreground hover:text-ring aria-disabled:opacity-50" />}>
        <Icon />
      </TooltipTrigger>
      <TooltipContent>{disabled ? `${label} (chưa dựng trong bản thử)` : label}</TooltipContent>
    </Tooltip>
  )
}

function SecCard() {
  const share = 91.4
  return (
    <div className="kpi-hero glass-card relative flex min-w-0 flex-col gap-0.5 pt-3 pr-3.5 pb-2.5 pl-4" style={{ '--tint': 'var(--chart-5)' } as React.CSSProperties}>
      <div className="flex items-center gap-2">
        <Tile icon={Gauge} />
        <span className="text-xs font-semibold">SEC khu sản xuất</span>
        <span className="ml-auto text-2xs whitespace-nowrap text-muted-foreground">Trần 1.486</span>
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-xs" aria-label="Chi tiết SEC" className="glass-pill rounded-full text-muted-foreground hover:text-ring" />}>
            <Info />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="glass-pill min-w-55 flex-col items-stretch gap-0 rounded-glass-inner bg-popover px-2.5 py-2 text-2xs text-popover-foreground tabular-nums *:last:hidden">
            {[
              ['Ngưỡng cảnh báo 90%', '1.337'],
              ['Trần năm', '1.486'],
              ['Còn đến trần', '128'],
              ['T9 so tháng trước', '1.365 ▲ 3,0%'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 leading-relaxed text-muted-foreground">
                {k}
                <b className="ml-auto font-semibold text-foreground">{v}</b>
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex min-h-8.5 items-end gap-2">
        <span className="text-kpi font-bold tracking-tight tabular-nums">
          <CountUp value={1358} dec={0} /> <small className="text-xs font-medium tracking-normal text-muted-foreground">MJ/1.000 L</small>
        </span>
        <StatusBadge kind="warn" className="mb-1 ml-auto">
          Gần trần · 91%
        </StatusBadge>
      </div>
      <div role="img" aria-label="Đã dùng 91,4% trần, ngưỡng cảnh báo 90%" className="risk-bar relative mt-1 mb-1.5 h-2 rounded-full">
        <i className="absolute top-1/2 -mt-1.75 -ml-1.75 size-3.5 rounded-full bg-risk-warning ring-3 ring-card shadow-sm" style={{ left: `${share}%` }} />
        <b title="Ngưỡng cảnh báo 90%" className="absolute -top-1 -bottom-1 -ml-0.5 w-0.75 rounded-xs bg-foreground ring-2 ring-card" style={{ left: '90%' }} />
      </div>
      <span className="mt-auto truncate text-2xs text-muted-foreground">Luỹ kế năm · ▼ 1,1% so cùng kỳ (1.373)</span>
    </div>
  )
}

export function Kpis({ onOpen }: { onOpen: (tab: 'dien' | 'hoi') => void }) {
  return (
    <section aria-label="Chỉ số" className="grid grid-cols-4 gap-3">
      {CARDS.map((c) => (
        <div key={c.k} className="kpi-tint glass-card relative flex min-w-0 flex-col gap-0.5 pt-3 has-[.recharts-active-dot]:z-10 pr-3.5 pb-2.5 pl-4" style={{ '--tint': SERIES_COLOR[c.k] } as React.CSSProperties}>
          <div className="flex items-center gap-2">
            <Tile icon={c.icon} onYellow={c.k === 'dien'} />
            <span className="text-xs font-semibold">{c.name}</span>
            <span className="ml-auto text-2xs whitespace-nowrap text-muted-foreground">{c.ref}</span>
            <GoButton label={`Mở tab ${METRICS[c.k].name}`} icon={ArrowUpRight} onClick={c.k === 'dien' || c.k === 'hoi' ? () => onOpen(c.k as 'dien' | 'hoi') : undefined} disabled={c.k !== 'dien' && c.k !== 'hoi'} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-kpi font-bold tracking-tight tabular-nums">
              <CountUp value={c.value} dec={c.dec} /> <small className="text-xs font-medium tracking-normal text-muted-foreground">{c.unit}</small>
            </span>
            <span className="ml-auto shrink-0">
              <Spark k={c.k} id={`sp-${c.k}`} />
            </span>
          </div>
          <span className="mt-auto truncate text-2xs text-muted-foreground">{c.delta}</span>
        </div>
      ))}
      <SecCard />
    </section>
  )
}
