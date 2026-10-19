import { useState } from 'react'
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Clock, Info } from 'lucide-react'
import { ChartContainer } from '@/components/ui/chart'
import { Tooltip as HintTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AllocRow, ModeToggle, RankList, SegToggle, type Mode } from '../w1/Allocation'
import { ChartTip, ChartTipRow, FocusItem, LegendLine, seriesClass } from '../w1/chart-bits'
import { FINISHED_ML, fmt, pct } from '../w1/data'
import { useChartAnimation } from '../w1/motion'
import { ALLOC, ALLOC_SUM, CLEAN_TOTAL, MONTH_POINTS, SHIFT_LANES, SHIFT_POINTS, WASTE_CAP, WASTE_DAILY, WELLS, WELL_CAP, WELL_DAILY, expected, type MonthPoint, type ShiftPoint } from './data'

export const AXIS = '[&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs'
export const CARD = 'glass-card glass-bg flex min-h-0 min-w-0 flex-col gap-1.5 px-4.5 pt-3.5 pb-3'

/* ---------- Nước theo khu vực / công đoạn, so cùng kỳ ---------- */

type Kind = 'sach' | 'nau' | 'mem'

export function AllocBars({ group, mode, onMode }: { group: 'area' | 'stage'; mode: Mode; onMode: (m: Mode) => void }) {
  const [kind, setKind] = useState<Kind>('sach')
  const per = mode === 'per'
  // Trên 1.000 L: m³ chia thành phẩm chung (8,1 triệu L = 8.100 nghìn L).
  const conv = (v: number) => (per ? v / (FINISHED_ML * 1000) : v)
  const top = Math.max(...ALLOC[group].map(([, cur]) => cur))
  const dec = per ? 2 : 0
  const gname = group === 'area' ? 'khu vực' : 'công đoạn'
  return (
    <figure className={CARD}>
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-body font-semibold">Nước theo {gname} · tháng 9/2026</span>
          <ModeToggle mode={mode} onMode={onMode} />
        </span>
        <span className="flex items-center gap-3.5 text-2xs text-muted-foreground">
          <span>xếp từ lớn nhất · so cùng kỳ 2025</span>
          <span className="ml-auto">
            <SegToggle
              label="Loại nước"
              value={kind}
              onChange={setKind}
              items={[
                ['sach', 'Nước sạch'],
                ['nau', 'Nước nấu'],
                ['mem', 'Nước mềm'],
              ]}
            />
          </span>
        </span>
      </figcaption>
      {kind === 'sach' ? (
        <RankList>
          {ALLOC[group].map(([name, cur, prior]) => (
            <AllocRow key={name} metric="nuoc" name={name} value={fmt(conv(cur), dec)} share={cur / top} delta={(cur / prior - 1) * 100} />
          ))}
        </RankList>
      ) : (
        // Wireframe chỉ có số phân bổ nước sạch; nước nấu, nước mềm theo khu chưa có trong fixture.
        <div className="grid min-h-0 flex-1 place-items-center rounded-glass-inner border border-dashed border-border text-2xs text-muted-foreground">
          Chưa có số {kind === 'nau' ? 'nước nấu' : 'nước mềm'} theo {gname} trong bản thử
        </div>
      )}
      <span className="text-2xs text-muted-foreground">
        Tổng {gname} {fmt(ALLOC_SUM, 0)} / đồng hồ tổng {fmt(CLEAN_TOTAL, 0)} m³ · phần chênh xem Cân bằng nước
      </span>
    </figure>
  )
}

/* ---------- Đồ thị điểm: tháng (theo sản lượng) / ca ---------- */

const CURVE = Array.from({ length: 21 }, (_, i) => {
  const vol = 3.4 + i * 0.4
  const e = expected(vol)
  return { vol, exp: e, band: [e * 0.85, e * 1.15] as [number, number] }
})

function MonthDot(p: { cx?: number; cy?: number; payload?: MonthPoint }) {
  const { cx = 0, cy = 0, payload } = p
  if (!payload) return <g />
  if (payload.kind === 'current')
    return (
      <g>
        <circle cx={cx} cy={cy} r={6.5} fill="var(--chart-2)" stroke="var(--foreground)" strokeWidth={2} />
        <text x={cx - 12} y={cy + 18} textAnchor="end" className="chart-label fill-foreground">
          T9/2026: 3,40 · kỳ vọng {fmt(expected(8.1), 2)} · ▼ 2,9% cùng kỳ
        </text>
      </g>
    )
  if (payload.kind === 'prior')
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="var(--card)" stroke="var(--chart-4)" strokeWidth={2.5} />
        <text x={cx - 10} y={cy - 10} textAnchor="end" className="chart-label fill-muted-foreground">
          Cùng kỳ T9/2025: 3,50
        </text>
      </g>
    )
  return <circle cx={cx} cy={cy} r={3} fill="var(--chart-4)" fillOpacity={0.6} />
}

function MonthScatter() {
  const anim = useChartAnimation()
  const [focus, setFocus] = useState<string | null>(null)
  return (
    <>
      <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
        <ComposedChart data={CURVE} margin={{ top: 10, right: 12, bottom: 4, left: -6 }} accessibilityLayer>
          <CartesianGrid stroke="var(--border)" />
          <XAxis
            dataKey="vol"
            type="number"
            domain={[3, 11.5]}
            ticks={[4, 6, 8, 10]}
            tickLine={false}
            axisLine={{ stroke: 'var(--input)' }}
            label={{
              value: 'Sản lượng thành phẩm tháng, triệu L',
              position: 'insideBottomRight',
              offset: -2,
              className: 'fill-muted-foreground text-3xs',
            }}
            height={30}
          />
          <YAxis domain={[2.5, 6.5]} ticks={[3, 4, 5, 6]} tickLine={false} axisLine={false} width={42} tickFormatter={(v: number) => fmt(v, 0)} />
          <Area {...anim} className={seriesClass(focus, 'band')} dataKey="band" type="monotone" stroke="var(--chart-ext-axis)" strokeDasharray="3 3" strokeWidth={1} fill="var(--chart-4)" fillOpacity={0.18} activeDot={false} tooltipType="none" />
          <Line {...anim} className={seriesClass(focus, 'exp')} dataKey="exp" type="monotone" stroke="var(--foreground)" strokeWidth={2} dot={false} activeDot={false} tooltipType="none" />
          <Scatter {...anim} className={seriesClass(focus, 'pts')} data={MONTH_POINTS} dataKey="v" shape={MonthDot} />
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              const p = payload?.find((x) => (x.payload as MonthPoint).label)?.payload as MonthPoint | undefined
              if (!active || !p) return null
              const e = expected(p.vol)
              return (
                <ChartTip title={p.label}>
                  <ChartTipRow label="Nước sạch" value={`${fmt(p.v, 2)} m³/1.000 L`} />
                  <ChartTipRow label="Sản lượng" value={`${fmt(p.vol, 1)} triệu L`} />
                  <ChartTipRow label="Kỳ vọng" value={`${fmt(e, 2)} (${pct((p.v / e - 1) * 100)})`} />
                </ChartTip>
              )
            }}
          />
        </ComposedChart>
      </ChartContainer>
      <span className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-2xs text-muted-foreground">
        <FocusItem id="pts" onFocus={setFocus}>
          <span className="inline-flex items-center gap-1.25">
            <i className="size-1.75 rounded-full bg-chart-4/60" />
            Tháng trước đó
          </span>
        </FocusItem>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-2.5 rounded-full border-[2.5px] border-chart-4" />
          Cùng kỳ
        </span>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-3 rounded-full border-2 border-foreground bg-chart-2" />
          Tháng 9/2026
        </span>
        <FocusItem id="exp" onFocus={setFocus}>
          <LegendLine color="var(--foreground)">Kỳ vọng</LegendLine>
        </FocusItem>
        <FocusItem id="band" onFocus={setFocus}>
          <span className="inline-flex items-center gap-1.25">
            <i className="h-2 w-3.5 border-y border-dashed border-chart-axis bg-chart-4/20" />
            Dải ±15%
          </span>
        </FocusItem>
      </span>
    </>
  )
}

function ShiftDot(p: { cx?: number; cy?: number; payload?: ShiftPoint }) {
  const { cx = 0, cy = 0, payload } = p
  if (!payload || payload.state === 'ok') return <circle cx={cx} cy={cy} r={2.6} fill="var(--chart-4)" fillOpacity={0.6} />
  const ln = SHIFT_LANES[payload.lane]
  const over = payload.state === 'over'
  const d = Math.round(Math.abs(payload.v / ln.cmp - 1) * 100)
  // Nhãn: đầu tháng neo trái, cuối tháng neo phải, giữa tháng canh giữa; Vượt đặt trên điểm, Thấp đặt dưới.
  const anchor = payload.day > 20 ? 'end' : payload.day < 8 ? 'start' : 'middle'
  const dx = anchor === 'end' ? -7 : anchor === 'start' ? 7 : 0
  return (
    <g>
      {over ? <circle cx={cx} cy={cy} r={4.5} fill="var(--destructive)" stroke="var(--card)" strokeWidth={1.5} /> : <circle cx={cx} cy={cy} r={4.5} fill="var(--card)" stroke="var(--foreground)" strokeWidth={2} />}
      <text x={cx + dx} y={over ? cy - 9 : cy + 15} textAnchor={anchor} className={cn('chart-label', over ? 'fill-destructive' : 'fill-foreground')}>
        {String(payload.day).padStart(2, '0')}/09 · {fmt(payload.v, 0)} · {over ? '+' : '−'}
        {d}%
      </text>
    </g>
  )
}

function ShiftScatter() {
  const anim = useChartAnimation()
  return (
    <>
      <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
        <ScatterChart margin={{ top: 10, right: 12, bottom: 4, left: -6 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 102]}
            ticks={[17, 51, 85]}
            tickFormatter={(v: number) => {
              const ln = SHIFT_LANES[Math.round((v - 17) / 34)]
              return `Ca ${ln.name} · cùng kỳ ${fmt(ln.cmp, 0)}`
            }}
            tickLine={false}
            axisLine={{ stroke: 'var(--input)' }}
            height={30}
            label={{
              value: 'Ngày 1 → 30 trong từng ca',
              position: 'insideBottomRight',
              offset: -2,
              className: 'fill-muted-foreground text-3xs',
            }}
          />
          <YAxis dataKey="v" domain={[150, 450]} ticks={[200, 300, 400]} tickLine={false} axisLine={false} width={42} tickFormatter={(v: number) => fmt(v, 0)} />
          {SHIFT_LANES.map((ln, k) => (
            <ReferenceArea key={`a${k}`} x1={k * 34 + 1} x2={k * 34 + 33} y1={ln.cmp * 0.85} y2={ln.cmp * 1.15} fill="var(--chart-4)" fillOpacity={0.16} stroke="var(--chart-ext-axis)" strokeDasharray="3 3" />
          ))}
          {SHIFT_LANES.map((ln, k) => (
            <ReferenceLine
              key={`m${k}`}
              segment={[
                { x: k * 34 + 1, y: ln.cmp },
                { x: k * 34 + 33, y: ln.cmp },
              ]}
              stroke="var(--foreground)"
              strokeWidth={2}
            />
          ))}
          {[34, 68].map((x) => (
            <ReferenceLine key={x} x={x} stroke="var(--input)" />
          ))}
          <Scatter {...anim} data={SHIFT_POINTS} shape={ShiftDot} />
          <Tooltip
            isAnimationActive={false}
            cursor={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as ShiftPoint | undefined
              if (!active || !p) return null
              const ln = SHIFT_LANES[p.lane]
              return (
                <ChartTip title={`Ca ${ln.name} · ${String(p.day).padStart(2, '0')}/09/2026`}>
                  <ChartTipRow label="Nước sạch" value={`${fmt(p.v, 0)} m³/ca`} />
                  <ChartTipRow label="Trung bình cùng ca, cùng kỳ" value={`${fmt(ln.cmp, 0)} m³/ca`} />
                  <ChartTipRow label="Chênh" value={`${pct((p.v / ln.cmp - 1) * 100)}${p.state === 'over' ? ' · Vượt' : p.state === 'under' ? ' · Thấp bất thường' : ''}`} />
                </ChartTip>
              )
            }}
          />
        </ScatterChart>
      </ChartContainer>
      <span className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-2xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.25">
          <i className="size-1.75 rounded-full bg-chart-4/60" />
          Bình thường
        </span>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-2.5 rounded-full bg-destructive" />
          Vượt (trên +15%)
        </span>
        <span className="inline-flex items-center gap-1.25">
          <i className="size-2.5 rounded-full border-2 border-foreground" />
          Thấp bất thường (dưới −15%)
        </span>
        <LegendLine color="var(--foreground)">Trung bình cùng ca kỳ so sánh</LegendLine>
      </span>
    </>
  )
}

export function ScatterCard() {
  const [view, setView] = useState<'month' | 'shift'>('month')
  const shift = view === 'shift'
  return (
    <figure className={CARD}>
      <figcaption className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body font-semibold">{shift ? 'Nước sạch theo ca · m³/ca' : 'Nước sạch / 1.000 L theo sản lượng'}</span>
          <span className="flex items-center gap-1 text-2xs text-muted-foreground">
            {shift ? 'Mỗi điểm 1 ca · so trung bình cùng ca kỳ so sánh · chưa chia sản lượng' : 'm³/1.000 L · mỗi điểm 1 tháng · kỳ vọng ±15% từ lịch sử'}
            {shift && (
              <HintTooltip>
                <TooltipTrigger render={<button type="button" aria-label="Giải thích đồ thị theo ca" className="grid size-4 place-items-center rounded-full text-muted-foreground hover:text-foreground" />}>
                  <Info className="size-3" />
                </TooltipTrigger>
                <TooltipContent className="max-w-72 flex-col items-start gap-1 text-left">
                  <span>Nhật ký ca của tổ xử lý nước (XLNC), có từ 01/2026.</span>
                  <span>Kỳ so sánh theo bộ lọc "So với" (đang là cùng kỳ 09/2025).</span>
                  <span>Ngưỡng ±15% tạm lấy theo cảnh báo số 6, chờ xác nhận.</span>
                </TooltipContent>
              </HintTooltip>
            )}
          </span>
        </span>
        <SegToggle
          label="Đơn vị thời gian"
          value={view}
          onChange={setView}
          items={[
            ['month', 'Tháng'],
            ['shift', 'Ca'],
          ]}
        />
      </figcaption>
      {shift ? <ShiftScatter key="shift" /> : <MonthScatter key="month" />}
    </figure>
  )
}

/* ---------- Cột theo ngày: khai thác giếng, xả thải ---------- */

export function DailyCard({ kind }: { kind: 'well' | 'waste' }) {
  const anim = useChartAnimation()
  const well = kind === 'well'
  const [src, setSrc] = useState<string>(well ? 'tong' : 'qt')
  const share = well ? (WELLS.find((w) => w[0] === src)?.[2] ?? 1) : 1
  const rows = (well ? WELL_DAILY : WASTE_DAILY).map((r) => ({
    day: r.day,
    v: r.v * share,
  }))
  // Trần cấp phép áp cho tổng; khi xem một giếng thì ẩn đường trần.
  const cap = well ? (src === 'tong' ? WELL_CAP : null) : WASTE_CAP
  return (
    <figure className={CARD}>
      <figcaption className="flex flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 text-body leading-tight font-semibold">{well ? 'Khai thác giếng theo ngày' : 'Nước xả thải theo ngày'}</span>
          {well ? (
            <SegToggle label="Giếng" value={src} onChange={setSrc} items={WELLS.map(([v, l]) => [v, l] as [string, string])} />
          ) : (
            <SegToggle
              label="Điểm đo xả thải"
              value={src}
              onChange={setSrc}
              items={[
                ['qt', 'Quan trắc'],
                ['uasb', 'Vào UASB'],
              ]}
            />
          )}
        </span>
        <span className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-2xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.25">
            <i className="size-2.5 rounded-xs bg-chart-2/50" />
            m³ / ngày đêm
          </span>
          {cap && (
            <LegendLine color="var(--foreground)" dashed>
              {well ? `Trần cấp phép (minh hoạ ${fmt(cap, 0)})` : `Trần xả thải (minh hoạ ${fmt(cap, 0)})`}
            </LegendLine>
          )}
          {!well && <b className="font-semibold text-foreground">Tháng 9: 84,2% nước cấp</b>}
        </span>
      </figcaption>
      {!well && src === 'uasb' ? (
        <div className="grid min-h-0 flex-1 place-items-center rounded-glass-inner border border-dashed border-border text-2xs text-muted-foreground">Chưa có số nước vào UASB theo ngày trong bản thử</div>
      ) : (
        <ChartContainer config={{}} className={cn('aspect-auto min-h-0 w-full flex-1', AXIS)}>
          <BarChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%" accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: 'var(--input)' }} ticks={[1, 5, 10, 15, 20, 25, 30]} interval={0} />
            <YAxis domain={[0, well && src !== 'tong' ? 'auto' : 1250]} ticks={well && src !== 'tong' ? undefined : [0, 500, 1000]} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => fmt(v, 0)} />
            <Bar {...anim} dataKey="v" radius={[2, 2, 0, 0]} fill="var(--chart-2)" fillOpacity={0.5} />
            {cap && <ReferenceLine y={cap} stroke="var(--foreground)" strokeWidth={1.3} strokeDasharray="5 4" />}
            <Tooltip
              isAnimationActive={false}
              cursor={{ fill: 'var(--muted)', fillOpacity: 0.6 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as (typeof rows)[number]
                return (
                  <ChartTip title={`${String(r.day).padStart(2, '0')}/09/2026`}>
                    <ChartTipRow label={well ? 'Khai thác' : 'Xả thải'} value={`${fmt(r.v, 0)} m³`} />
                  </ChartTip>
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      )}
      <span className="inline-flex items-center gap-1 text-2xs text-muted-foreground">
        <Clock className="size-3 shrink-0" />
        Chờ giấy phép: chưa tô ngày vượt. Khi có trần thật, ngày vượt tô đậm kèm nhãn "Vượt".
      </span>
    </figure>
  )
}
