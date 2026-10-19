import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Moon, Sun, X } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { SegToggle } from '../w1/Allocation'
import { ChartTip, ChartTipRow, LegendLine } from '../w1/chart-bits'
import { FACTORY_TOTAL, METRICS, SERIES_COLOR, UNITS, VOLUME, fmt, type Metric } from '../w1/data'

/* ---------- chung ---------- */

const Reduced = createContext(false)
const MS = { fast: 120, base: 200, data: 300 }
const useMs = (k: keyof typeof MS) => (useContext(Reduced) ? 0 : MS[k])

type Verdict = 'use' | 'maybe' | 'avoid'
const VERDICT: Record<Verdict, { label: string; className: string }> = {
  use: { label: 'Đề xuất dùng', className: 'border-success text-success' },
  maybe: { label: 'Cân nhắc', className: 'border-warning text-warning-foreground' },
  avoid: { label: 'Tránh', className: 'border-destructive text-destructive-foreground' },
}

type Note = { verdict: Verdict; when: string; spec: string; recharts: string; source?: { label: string; href: string } }

function Demo({ id, title, lead, notes, controls, children }: { id: string; title: string; lead: string; notes: Note[]; controls?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="glass-card glass-bg grid min-w-0 gap-5 p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-balance">{title}</h2>
          <p className="mt-1 max-w-prose text-xs text-muted-foreground">{lead}</p>
        </div>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
        <div className="min-w-0 rounded-glass-inner border border-border bg-background/60 p-3">{children}</div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {notes.map((n, i) => (
          <div key={i} className="flex flex-col gap-1.5 border-l-2 border-border pl-3">
            <Badge variant="outline" className={cn('bg-transparent', VERDICT[n.verdict].className)}>
              {VERDICT[n.verdict].label}
            </Badge>
            <p className="text-xs font-semibold">{n.when}</p>
            <p className="text-2xs text-muted-foreground">
              <b className="font-semibold text-foreground">Thông số:</b> {n.spec}
            </p>
            <p className="text-2xs text-muted-foreground">
              <b className="font-semibold text-foreground">Recharts/shadcn:</b> {n.recharts}
            </p>
            {n.source && (
              <a href={n.source.href} target="_blank" rel="noreferrer" className="text-2xs text-ring underline-offset-2 hover:underline">
                Nguồn: {n.source.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

const months = METRICS.dien.cur.map((_, i) => `T${i + 1}`)
const AXIS = 'aspect-auto w-full [&_.recharts-cartesian-axis-tick_text]:fill-chart-axis [&_.recharts-cartesian-axis-tick_text]:text-3xs'

/* ---------- 1. Hover ---------- */

function HoverDemo() {
  const rows = UNITS.area.filter((u) => u.dien != null).slice(0, 4)
  const top = Math.max(...rows.map((r) => r.dien as number))
  const cols: [string, string][] = [
    ['0ms', 'Tức thì'],
    ['120ms', '120 ms'],
    ['400ms', '400 ms'],
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cols.map(([d, label]) => (
        <div key={d} className="flex flex-col gap-1">
          <span className="text-2xs font-semibold text-muted-foreground">{label}</span>
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              style={{ transitionDuration: d }}
              className="grid h-6 grid-cols-[1fr_--spacing(16)] items-center gap-2 rounded-lg px-1.5 text-left text-2xs transition-colors ease-(--ease-standard) hover:bg-muted"
            >
              <span className="truncate">{r.name}</span>
              <span className="h-2 overflow-hidden rounded-full bg-chart-track">
                <i className="block h-full rounded-full bg-chart-1-deep" style={{ width: `${((r.dien as number) / top) * 100}%` }} />
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ---------- 2. Tooltip ---------- */

function TipChart({ animated }: { animated: boolean }) {
  const rows = METRICS.dien.cur.map((v, i) => ({ m: months[i], v }))
  return (
    <ChartContainer config={{ v: { label: '2026', color: 'var(--chart-1)' } }} className={cn(AXIS, 'h-36')}>
      <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--input)' }} />
        <YAxis domain={[65, 112]} tickLine={false} axisLine={false} />
        <Line dataKey="v" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
        <Tooltip
          isAnimationActive={animated}
          animationDuration={400}
          cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <ChartTip title={`Tháng ${String(label).slice(1)}`}>
                <ChartTipRow label="kWh/1.000 L" value={fmt(payload[0].value as number, 1)} />
              </ChartTip>
            ) : null
          }
        />
      </LineChart>
    </ChartContainer>
  )
}

function TooltipDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <span className="text-2xs font-semibold text-muted-foreground">Mặc định Recharts: trượt theo 400 ms</span>
        <TipChart animated />
      </div>
      <div>
        <span className="text-2xs font-semibold text-muted-foreground">Đang dùng ở W1: nhảy tới điểm, mờ dần khi hiện</span>
        <TipChart animated={false} />
      </div>
    </div>
  )
}

/* ---------- 3. Đổi dữ liệu trên đồ thị ---------- */

type Scope = 'all' | 'lanh' | 'khinen'
const SCOPE_NAME: Record<Scope, string> = { all: 'Toàn nhà máy', lanh: 'Lạnh', khinen: 'Khí nén' }

function DataChangeDemo() {
  const [variant, setVariant] = useState<'instant' | 'morph' | 'fade'>('morph')
  const [scope, setScope] = useState<Scope>('all')
  const [metric, setMetric] = useState<Metric>('dien')
  const dataMs = useMs('data')
  const baseMs = useMs('base')
  const m = METRICS[metric]
  const unit = scope === 'all' ? null : UNITS.area.find((u) => u.id === scope)!
  const val = unit?.[metric]
  const share = unit && val != null ? val / FACTORY_TOTAL[metric] : 1
  const rows = m.cur.map((v, i) => ({ m: months[i], cur: v * share, prior: m.prior[i] * share }))
  const color = SERIES_COLOR[metric]
  const chart = (
    <ChartContainer config={{ cur: { label: '2026', color } }} className={cn(AXIS, 'h-44')}>
      <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--input)' }} />
        <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmt(v, m.dec > 1 ? 1 : 0)} />
        <Line dataKey="prior" stroke="var(--chart-4)" strokeOpacity={0.55} strokeWidth={1.75} dot={false} isAnimationActive={variant === 'morph'} animationDuration={dataMs} animationEasing="ease-out" />
        <Line dataKey="cur" stroke={color} strokeWidth={2.5} dot={{ r: 2.5, fill: 'var(--card)', stroke: color }} isAnimationActive={variant === 'morph'} animationDuration={dataMs} animationEasing="ease-out" />
      </LineChart>
    </ChartContainer>
  )
  return (
    <Demo
      id="du-lieu"
      title="Đổi bộ lọc, đổi chỉ số trên đồ thị"
      lead="Bấm đổi khu hoặc đổi Điện/Nước/Hơi để so ba cách. Biến hình giúp mắt bám theo cùng một đường khi số thay đổi; mờ chéo hợp khi đường mới không còn là 'cùng một thứ'."
      controls={
        <>
          <SegToggle label="Cách chuyển" value={variant} onChange={setVariant} items={[['instant', 'Tức thì'], ['morph', 'Biến hình 300 ms'], ['fade', 'Mờ chéo 200 ms']]} />
          <span className="text-2xs text-muted-foreground">Khu</span>
          <SegToggle label="Khu" value={scope} onChange={setScope} items={(Object.keys(SCOPE_NAME) as Scope[]).map((k) => [k, SCOPE_NAME[k]])} />
          <SegToggle label="Chỉ số" value={metric} onChange={setMetric} items={(['dien', 'nuoc', 'hoi'] as Metric[]).map((k) => [k, METRICS[k].name])} />
        </>
      }
      notes={[
        {
          verdict: 'use',
          when: 'Biến hình khi cùng chỉ số, cùng đơn vị (đổi khu, đổi kỳ, đổi sản phẩm)',
          spec: '300 ms, giảm tốc (ease-out). Không kéo dài hơn: người xem đang chờ đọc số.',
          recharts: 'Line/Area/Bar: isAnimationActive, animationDuration={300}, animationEasing="ease-out". Recharts tự nội suy từ điểm cũ sang điểm mới.',
          source: { label: 'Heer & Robertson 2007, Animated Transitions in Statistical Data Graphics', href: 'https://homes.cs.washington.edu/~jheer/files/2007-AnimatedTrans-InfoVis.pdf' },
        },
        {
          verdict: 'use',
          when: 'Mờ chéo khi đổi sang chỉ số khác đơn vị (Điện → Nước)',
          spec: '200 ms mờ vào. Trục đổi thang đo nên biến hình dễ gây hiểu nhầm là "số tăng/giảm".',
          recharts: 'Bọc đồ thị bằng key theo chỉ số + class animate-in fade-in-0; tắt animation của Line để không chạy đè.',
          source: { label: 'UW CSE442: đổi thang trục làm khó theo dõi', href: 'https://courses.cs.washington.edu/courses/cse442/18au/lectures/CSE442-Animation.pdf' },
        },
      ]}
    >
      <div className="mb-1 text-2xs text-muted-foreground">
        {m.title} — {SCOPE_NAME[scope]}
        {unit && val == null ? ` không có số ${m.name.toLowerCase()}, đang hiện toàn nhà máy` : ''} · {m.unit}
      </div>
      {variant === 'fade' ? (
        <div key={metric + scope} className="animate-in fade-in-0" style={{ animationDuration: `${baseMs}ms` }}>
          {chart}
        </div>
      ) : (
        chart
      )}
    </Demo>
  )
}

/* ---------- 4. Hover đồng bộ ---------- */

function SyncDemo() {
  const [sync, setSync] = useState(true)
  const rows = METRICS.dien.cur.map((v, i) => ({ m: months[i], v, vol: VOLUME[i] }))
  const id = sync ? 'w1' : undefined
  const tip = (
    <Tooltip
      isAnimationActive={false}
      cursor={{ stroke: 'var(--chart-ext-axis)', strokeDasharray: '3 3', fill: 'var(--accent)' }}
      content={({ active, payload, label }) =>
        active && payload?.length ? (
          <ChartTip title={`Tháng ${String(label).slice(1)}`}>
            <ChartTipRow label="Điện/1.000 L" value={fmt(rows[months.indexOf(String(label))].v, 1)} />
            <ChartTipRow label="Sản lượng" value={`${fmt(rows[months.indexOf(String(label))].vol, 1)} tr L`} />
          </ChartTip>
        ) : null
      }
    />
  )
  return (
    <Demo
      id="dong-bo"
      title="Rê chuột đồng bộ giữa hai đồ thị"
      lead="Rê chuột trên đường điện: tháng đó sáng lên ở cả dải sản lượng bên dưới. Đây là hành vi đã chốt cho đồ thị 'Điện trên 1.000 L' kèm dải sản lượng (1+5)."
      controls={
        <label className="flex items-center gap-2 text-xs">
          <Switch checked={sync} onCheckedChange={setSync} aria-label="Đồng bộ" /> Đồng bộ (syncId)
        </label>
      }
      notes={[
        {
          verdict: 'use',
          when: 'Hai đồ thị cùng trục thời gian đặt chồng nhau',
          spec: 'Không có chuyển động: con trỏ và dải tô nhảy ngay theo tháng. Tooltip chỉ hiện ở đồ thị đang rê.',
          recharts: 'Cùng syncId="w1" trên hai ComposedChart; Tooltip isAnimationActive={false}.',
        },
      ]}
    >
      <ChartContainer config={{}} className={cn(AXIS, 'h-32')}>
        <LineChart data={rows} syncId={id} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="m" hide />
          <YAxis domain={[65, 112]} tickLine={false} axisLine={false} />
          <Line dataKey="v" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: 'var(--chart-1)' }} isAnimationActive={false} />
          {tip}
        </LineChart>
      </ChartContainer>
      <ChartContainer config={{}} className={cn(AXIS, 'h-20')}>
        <ComposedChart data={rows} syncId={id} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
          <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--input)' }} />
          <YAxis domain={[0, 12]} hide />
          <Bar dataKey="vol" fill="var(--chart-5)" radius={[3, 3, 0, 0]} barSize={14} isAnimationActive={false} />
          <Tooltip isAnimationActive={false} cursor={{ fill: 'var(--accent)' }} content={() => null} />
        </ComposedChart>
      </ChartContainer>
    </Demo>
  )
}

/* ---------- 5. Nhấn mạnh chuỗi ---------- */

function FocusDemo() {
  const [focus, setFocus] = useState<Metric | null>(null)
  const ms = useMs('fast')
  // Chỉ số so T1 = 100, tính từ fixture để ba chuỗi khác đơn vị chung một trục.
  const rows = months.map((mm, i) => {
    const r: Record<string, number | string> = { m: mm }
    ;(['dien', 'nuoc', 'hoi'] as Metric[]).forEach((k) => (r[k] = (METRICS[k].cur[i] / METRICS[k].cur[0]) * 100))
    return r
  })
  const op = (k: Metric) => (focus && focus !== k ? 0.2 : 1)
  return (
    <Demo
      id="nhan-manh"
      title="Làm mờ chuỗi khác khi trỏ vào chú thích"
      lead="Trỏ vào Điện, Nước hoặc Hơi ở chú thích. Ba chuỗi được quy về chỉ số so với T1 = 100 (tính từ số mẫu) để chung một trục."
      notes={[
        {
          verdict: 'maybe',
          when: 'Đồ thị có từ 3 chuỗi trở lên chồng nhau',
          spec: 'Chuỗi khác mờ còn 20% trong 120 ms. Với 2 chuỗi (năm nay + cùng kỳ) như W1 thì không cần.',
          recharts: 'Giữ state chuỗi đang trỏ; đổi strokeOpacity của Line, CSS transition stroke-opacity. Legend tự làm bằng nút để có focus bàn phím.',
        },
      ]}
    >
      <div className="mb-2 flex gap-1">
        {(['dien', 'nuoc', 'hoi'] as Metric[]).map((k) => (
          <button
            key={k}
            type="button"
            onMouseEnter={() => setFocus(k)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(k)}
            onBlur={() => setFocus(null)}
            className="rounded-full px-2.5 py-1 text-2xs hover:bg-muted"
          >
            <LegendLine color={SERIES_COLOR[k]}>{METRICS[k].name}</LegendLine>
          </button>
        ))}
      </div>
      <ChartContainer config={{}} className={cn(AXIS, 'h-40 [&_.recharts-line-curve]:transition-[stroke-opacity]')} style={{ ['--tw-duration' as string]: `${ms}ms` }}>
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--input)' }} />
          <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} />
          {(['dien', 'nuoc', 'hoi'] as Metric[]).map((k) => (
            <Line key={k} dataKey={k} stroke={SERIES_COLOR[k]} strokeOpacity={op(k)} strokeWidth={2.5} dot={false} isAnimationActive={false} style={{ transition: `stroke-opacity ${ms}ms var(--ease-standard)` }} />
          ))}
        </LineChart>
      </ChartContainer>
    </Demo>
  )
}

/* ---------- 6. Số KPI ---------- */

function useTween(target: number, ms: number, on: boolean) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (!on || ms === 0) {
      from.current = target
      setV(target)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(1 - p, 3)
      setV(a + (target - a) * e)
      if (p < 1) raf = requestAnimationFrame(step)
      else from.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms, on])
  return v
}

function KpiDemo() {
  const [month, setMonth] = useState<'8' | '9'>('9')
  const [variant, setVariant] = useState<'instant' | 'fade' | 'count'>('fade')
  const base = useMs('base')
  const reduced = useContext(Reduced)
  const target = METRICS.dien.cur[+month - 1]
  const prior = METRICS.dien.prior[+month - 1]
  const shown = useTween(target, reduced ? 0 : 800, variant === 'count')
  const d = ((target - prior) / prior) * 100
  return (
    <Demo
      id="so-kpi"
      title="Số chính trên thẻ KPI khi đổi kỳ"
      lead="Đổi tháng 8 ↔ tháng 9 để so. Người xem cần đọc được số ngay; số chạy làm họ phải chờ và dễ đọc nhầm số đang chạy."
      controls={
        <>
          <SegToggle label="Cách chuyển" value={variant} onChange={setVariant} items={[['instant', 'Tức thì'], ['fade', 'Mờ chéo 200 ms'], ['count', 'Đếm số 800 ms']]} />
          <SegToggle label="Tháng" value={month} onChange={setMonth} items={[['8', 'Tháng 8'], ['9', 'Tháng 9']]} />
        </>
      }
      notes={[
        {
          verdict: 'use',
          when: 'Mờ chéo số và dòng so cùng kỳ',
          spec: '200 ms mờ vào, không dịch chuyển. Chữ số dùng tabular-nums để không nhảy chiều rộng.',
          recharts: 'Không liên quan Recharts. key theo giá trị + animate-in fade-in-0.',
        },
        {
          verdict: 'avoid',
          when: 'Đếm số chạy lên (count-up)',
          spec: 'Hợp trang giới thiệu, không hợp số liệu vận hành: trong 0,8 giây số hiển thị là số sai.',
          recharts: '—',
          source: { label: 'IBM Carbon: chuyển động "productive" cho tác vụ, không gây chú ý', href: 'https://carbondesignsystem.com/elements/motion/overview/' },
        },
      ]}
    >
      <div className="kpi-tint glass-card flex w-full max-w-80 flex-col gap-1 p-4" style={{ '--tint': 'var(--chart-1)' } as React.CSSProperties}>
        <span className="text-xs font-semibold">Điện / 1.000 L · tháng {month}</span>
        {variant === 'fade' ? (
          <span key={month} className="animate-in text-kpi font-bold tabular-nums fade-in-0" style={{ animationDuration: `${base}ms` }}>
            {fmt(target, 1)} <small className="text-xs font-medium text-muted-foreground">kWh</small>
          </span>
        ) : (
          <span className="text-kpi font-bold tabular-nums">
            {fmt(variant === 'count' ? shown : target, 1)} <small className="text-xs font-medium text-muted-foreground">kWh</small>
          </span>
        )}
        <span key={`d${month}${variant}`} className={cn('text-2xs text-muted-foreground', variant === 'fade' && 'animate-in fade-in-0')} style={{ animationDuration: `${base}ms` }}>
          {d < 0 ? '▼' : '▲'} {fmt(Math.abs(d), 1)}% so cùng kỳ ({fmt(prior, 1)})
        </span>
      </div>
    </Demo>
  )
}

/* ---------- 7. Tải dữ liệu ---------- */

function LoadingDemo() {
  const [variant, setVariant] = useState<'blank' | 'skeleton' | 'keep'>('keep')
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<Scope>('all')
  const fast = useMs('fast')
  const reload = (s: Scope) => {
    setLoading(true)
    window.setTimeout(() => {
      setScope(s)
      setLoading(false)
    }, 900)
  }
  const share = scope === 'all' ? 1 : (UNITS.area.find((u) => u.id === scope)!.dien as number) / FACTORY_TOTAL.dien
  const rows = METRICS.dien.cur.map((v, i) => ({ m: months[i], v: v * share }))
  const chart = (
    <ChartContainer config={{}} className={cn(AXIS, 'h-40')}>
      <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--input)' }} />
        <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} />
        <Line dataKey="v" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
  )
  return (
    <Demo
      id="tai-du-lieu"
      title="Khi đổi bộ lọc phải chờ tải số"
      lead="Bấm một khu: giả lập máy chủ trả số sau 0,9 giây. So ba cách hiển thị trong lúc chờ."
      controls={
        <>
          <SegToggle label="Trong lúc chờ" value={variant} onChange={setVariant} items={[['blank', 'Xoá trắng + vòng quay'], ['skeleton', 'Khung xương'], ['keep', 'Giữ số cũ, làm mờ']]} />
          <SegToggle label="Khu" value={scope} onChange={reload} items={(Object.keys(SCOPE_NAME) as Scope[]).map((k) => [k, SCOPE_NAME[k]])} />
        </>
      }
      notes={[
        {
          verdict: 'use',
          when: 'Đổi bộ lọc khi đã có số: giữ số cũ, làm mờ 50%, thanh tiến trình mảnh ở mép trên',
          spec: 'Mờ sau 120 ms (lần tải nhanh thì không nháy). Khung, trục, chú thích đứng yên.',
          recharts: 'Bọc ChartContainer bằng div opacity + aria-busy; Line isAnimationActive theo mục "Đổi bộ lọc".',
        },
        {
          verdict: 'maybe',
          when: 'Khung xương chỉ cho lần mở màn đầu tiên',
          spec: 'Nghiên cứu lẫn lộn: thử nghiệm của Viget (136 người) thấy khung xương còn bị cảm nhận là chờ lâu hơn vòng quay.',
          recharts: 'shadcn Skeleton đúng kích thước card.',
          source: { label: 'Viget, A Bone to Pick with Skeleton Screens', href: 'https://www.viget.com/articles/a-bone-to-pick-with-skeleton-screens' },
        },
      ]}
    >
      <div className="relative" aria-busy={loading}>
        {loading && variant === 'keep' && <div className="absolute inset-x-0 -top-3 h-0.5 animate-pulse rounded-full bg-ring" />}
        <div className="mb-1 text-2xs text-muted-foreground">Điện trên 1.000 L — {SCOPE_NAME[scope]}</div>
        {loading && variant === 'blank' ? (
          <div className="grid h-40 place-items-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : loading && variant === 'skeleton' ? (
          <div className="flex h-40 flex-col justify-end gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ) : (
          <div className="transition-opacity" style={{ opacity: loading ? 0.5 : 1, transitionDuration: `${fast}ms`, transitionDelay: loading ? `${fast}ms` : '0ms' }}>
            {chart}
          </div>
        )}
      </div>
    </Demo>
  )
}

/* ---------- 8. Drawer ---------- */

function DrawerDemo() {
  const [variant, setVariant] = useState<'slide' | 'instant' | 'bounce'>('slide')
  const [open, setOpen] = useState(false)
  const base = useMs('base')
  const reduced = useContext(Reduced)
  const dur = variant === 'instant' || reduced ? 0 : variant === 'bounce' ? 500 : open ? base : 150
  const ease = variant === 'bounce' ? 'cubic-bezier(.34,1.56,.64,1)' : open ? 'var(--ease-enter)' : 'var(--ease-exit)'
  return (
    <Demo
      id="drawer"
      title="Mở bảng số liệu (drawer) và menu"
      lead="Bấm 'Bảng số liệu'. Trượt ngắn cho biết bảng đến từ đâu và đóng về đâu; nảy và trượt dài làm chậm người đang cần xem số."
      controls={
        <>
          <SegToggle label="Kiểu mở" value={variant} onChange={setVariant} items={[['slide', 'Trượt 200 ms'], ['instant', 'Hiện ngay'], ['bounce', 'Nảy 500 ms']]} />
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpen((o) => !o)}>
            {open ? 'Đóng' : 'Bảng số liệu'}
          </Button>
        </>
      }
      notes={[
        {
          verdict: 'use',
          when: 'Drawer, menu mở rộng: trượt ngắn + lớp phủ mờ dần',
          spec: 'Mở 200 ms giảm tốc (cubic-bezier(0, 0, .38, .9)), đóng 150 ms tăng tốc (cubic-bezier(.2, 0, 1, .9)). Trượt khoảng 40 px kèm mờ, không trượt cả bề rộng.',
          recharts: 'shadcn Sheet đã có sẵn: duration-200, trượt 2.5rem + opacity. Chỉ cần đổi easing sang token.',
          source: { label: 'IBM Carbon motion: easing vào/ra', href: 'https://carbondesignsystem.com/elements/motion/overview/' },
        },
        { verdict: 'avoid', when: 'Nảy (overshoot), trượt dài', spec: 'Carbon khuyên tránh bounce, stretch trong giao diện tác vụ.', recharts: '—' },
      ]}
    >
      <div className="relative h-48 overflow-hidden rounded-lg">
        <div className="grid h-full grid-cols-3 gap-2 p-2 opacity-60">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-muted" />
          ))}
        </div>
        <div
          className="absolute inset-0 bg-scrim transition-opacity"
          style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transitionDuration: `${dur}ms` }}
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-label="Bảng số liệu (mẫu)"
          aria-hidden={!open}
          className="absolute inset-y-2 right-2 flex w-3/5 flex-col gap-1.5 rounded-glass-inner bg-popover p-3 shadow-glass"
          style={{
            transform: open ? 'translateX(0)' : variant === 'bounce' ? 'translateX(110%)' : 'translateX(40px)',
            opacity: open ? 1 : 0,
            visibility: open ? 'visible' : 'hidden',
            transition: `transform ${dur}ms ${ease}, opacity ${dur}ms ${ease}, visibility 0s linear ${open ? 0 : dur}ms`,
          }}
        >
          <div className="flex items-center text-xs font-semibold">
            Số liệu theo khu vực
            <X className="ml-auto size-3.5" />
          </div>
          {UNITS.area.slice(0, 5).map((u) => (
            <div key={u.id} className="flex border-b border-border pb-1 text-2xs">
              {u.name}
              <span className="ml-auto tabular-nums">{u.dien ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  )
}

/* ---------- 9. Cảnh báo ---------- */

function AlertDemo() {
  const [variant, setVariant] = useState<'blink' | 'flash' | 'static'>('flash')
  const [n, setN] = useState(0)
  const reduced = useContext(Reduced)
  return (
    <Demo
      id="canh-bao"
      title="Khi có cảnh báo mới"
      lead="Bấm 'Giả lập cảnh báo mới'. Màn hình chiếu phòng họp cả buổi: thứ gì nhấp nháy liên tục sẽ kéo mắt khỏi người đang trình bày."
      controls={
        <>
          <SegToggle label="Kiểu báo" value={variant} onChange={setVariant} items={[['blink', 'Nhấp nháy liên tục'], ['flash', 'Tô nền một lần'], ['static', 'Tĩnh']]} />
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setN((x) => x + 1)}>
            Giả lập cảnh báo mới
          </Button>
        </>
      }
      notes={[
        {
          verdict: 'use',
          when: 'Tô nền cam nhạt một lần rồi tắt dần',
          spec: 'Hiện ngay, nền warning-subtle tắt dần trong 1,2 s. Badge, icon, nhãn vẫn là thứ mang thông tin (luật màu trạng thái).',
          recharts: 'CSS keyframes trên ô cảnh báo; key theo id cảnh báo để chạy đúng một lần.',
        },
        {
          verdict: 'avoid',
          when: 'Nhấp nháy, pulse lặp lại',
          spec: 'Chuyển động tự chạy quá 5 giây phải có nút dừng (WCAG 2.2.2, mức A).',
          recharts: '—',
          source: { label: 'W3C, Understanding SC 2.3.3 Animation from Interactions', href: 'https://w3c.github.io/wcag/understanding/animation-from-interactions' },
        },
      ]}
    >
      <style>{`@keyframes flash-once{from{background-color:var(--warning-subtle)}to{background-color:transparent}}`}</style>
      {n === 0 ? (
        <p className="text-2xs text-muted-foreground">Chưa có cảnh báo mới.</p>
      ) : (
        <a
          key={`${n}${variant}`}
          href="#canh-bao"
          className={cn('flex max-w-90 flex-col gap-0.5 rounded-lg border border-border px-3 py-2', variant === 'blink' && !reduced && 'animate-pulse')}
          style={variant === 'flash' && !reduced ? { animation: 'flash-once 1.2s var(--ease-standard)' } : undefined}
        >
          <span className="flex items-center gap-1.5">
            <Badge className="h-4 bg-destructive-solid px-1.5 text-3xs text-destructive-solid-foreground">
              <ArrowUp strokeWidth={2.6} />
              Vượt
            </Badge>
            <b className="text-xs tabular-nums">+18,2% / 15%</b>
          </span>
          <span className="text-2xs text-muted-foreground">Khí nén so kỳ vọng theo sản lượng (số mẫu)</span>
        </a>
      )}
    </Demo>
  )
}

/* ---------- 10. Vẽ đồ thị khi mở trang ---------- */

function EntryDemo() {
  const [variant, setVariant] = useState<'draw' | 'none'>('none')
  const [k, setK] = useState(0)
  const reduced = useContext(Reduced)
  const rows = METRICS.dien.cur.map((v, i) => ({ m: months[i], v, p: METRICS.dien.prior[i] }))
  return (
    <Demo
      id="mo-trang"
      title="Vẽ đồ thị lúc mở màn"
      lead="Bấm 'Mở lại màn' để xem. Mặc định Recharts vẽ đường từ trái sang phải trong 1,5 giây mỗi lần đồ thị mới xuất hiện, kể cả khi chuyển tab qua lại."
      controls={
        <>
          <SegToggle label="Lúc mở" value={variant} onChange={setVariant} items={[['none', 'Hiện ngay'], ['draw', 'Vẽ dần 1,5 s (mặc định)']]} />
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setK((x) => x + 1)}>
            Mở lại màn
          </Button>
        </>
      }
      notes={[
        {
          verdict: 'avoid',
          when: 'Vẽ dần mỗi lần mở màn/đổi tab',
          spec: 'Người báo cáo chuyển tab liên tục khi trình bày; mỗi lần phải chờ 1,5 s mới đọc được đường.',
          recharts: 'Đặt isAnimationActive={false} lúc mount; chỉ bật biến hình cho lần đổi dữ liệu sau đó (mục "Đổi bộ lọc").',
        },
        {
          verdict: 'use',
          when: 'Tôn trọng cài đặt "giảm chuyển động" của máy',
          spec: 'Mọi thời lượng về 0. Recharts 3 mặc định isAnimationActive="auto" đã tự tắt khi máy bật giảm chuyển động; khi tự đặt true/false phải tự kiểm.',
          recharts: 'Token --motion-* trong prototype.css về 0ms dưới @media (prefers-reduced-motion: reduce).',
          source: { label: 'W3C, kỹ thuật C39 prefers-reduced-motion', href: 'https://w3c.github.io/wcag/understanding/animation-from-interactions' },
        },
      ]}
    >
      <ChartContainer key={k} config={{}} className={cn(AXIS, 'h-40')}>
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="m" tickLine={false} axisLine={{ stroke: 'var(--input)' }} />
          <YAxis domain={[65, 112]} tickLine={false} axisLine={false} />
          <Line dataKey="p" stroke="var(--chart-4)" strokeOpacity={0.55} strokeWidth={1.75} dot={false} isAnimationActive={variant === 'draw' && !reduced} animationDuration={1500} />
          <Line dataKey="v" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} isAnimationActive={variant === 'draw' && !reduced} animationDuration={1500} />
        </LineChart>
      </ChartContainer>
    </Demo>
  )
}

/* ---------- trang ---------- */

const TOKENS: [string, string, string][] = [
  ['--motion-fast', '120 ms', 'Hover hàng/nút, tooltip hiện/ẩn, đổi trạng thái nút bật tắt'],
  ['--motion-base', '200 ms', 'Drawer, menu mở rộng, mờ chéo số KPI và đồ thị khác đơn vị'],
  ['--motion-data', '300 ms', 'Đường, vùng, cột biến hình khi đổi bộ lọc cùng đơn vị'],
  ['--ease-standard', 'cubic-bezier(.2, 0, .38, .9)', 'Phần tử đứng yên trên màn đổi trạng thái'],
  ['--ease-enter', 'cubic-bezier(0, 0, .38, .9)', 'Thứ đi vào: drawer mở, tooltip hiện'],
  ['--ease-exit', 'cubic-bezier(.2, 0, 1, .9)', 'Thứ đi ra: drawer đóng'],
]

export function MotionPage() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-motion', reduced)
  }, [reduced])

  return (
    <Reduced.Provider value={reduced}>
      <div className="min-h-svh bg-linear-135 from-canvas-from to-canvas-to px-4 py-8 text-body text-foreground sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5">
          <header className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-semibold tracking-wider text-muted-foreground uppercase">Báo cáo năng lượng · nghiên cứu tương tác</p>
              <h1 className="mt-1 text-2xl font-bold text-balance">Chuyển động và tương tác cho dashboard</h1>
              <p className="mt-2 max-w-prose text-xs text-muted-foreground">
                Mười tình huống có thật trên màn Tổng quan, mỗi tình huống thử được ngay bằng Recharts 3.8 và shadcn như app thật. Nguyên tắc chung: chuyển động chỉ để người xem bám theo
                thay đổi, không để trang trí; ngắn (120–300 ms), giảm tốc mượt, không nảy; tắt hết khi máy bật giảm chuyển động. Số liệu là fixture W1.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={reduced} onCheckedChange={setReduced} aria-label="Giả lập giảm chuyển động" />
                Giả lập giảm chuyển động
              </label>
              <Button variant="ghost" size="icon" aria-label={dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'} className="glass-pill rounded-full" onClick={() => setDark((d) => !d)}>
                {dark ? <Sun /> : <Moon />}
              </Button>
            </div>
          </header>

          <section className="glass-card glass-bg p-5" aria-labelledby="tok">
            <h2 id="tok" className="text-base font-semibold">
              Token chuyển động đề xuất
            </h2>
            <p className="mt-1 text-2xs text-muted-foreground">Theo hướng "productive" của IBM Carbon: nhanh, không gây chú ý khi người dùng đang làm việc. Đưa vào Figma Variables cùng nhóm với màu.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-120 text-left text-xs">
                <thead className="text-2xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-1.5 pr-3 font-semibold">Token</th>
                    <th className="py-1.5 pr-3 font-semibold">Giá trị</th>
                    <th className="py-1.5 font-semibold">Dùng cho</th>
                  </tr>
                </thead>
                <tbody>
                  {TOKENS.map(([t, v, u]) => (
                    <tr key={t} className="border-b border-border last:border-0">
                      <td className="py-1.5 pr-3 font-mono text-2xs">{t}</td>
                      <td className="py-1.5 pr-3 font-mono text-2xs tabular-nums">{v}</td>
                      <td className="py-1.5 text-2xs text-muted-foreground">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Demo
            id="hover"
            title="Phản hồi khi rê chuột lên hàng, nút"
            lead="Rê chuột qua các hàng ở ba cột. 120 ms vẫn cảm thấy tức thì nhưng không giật; 400 ms đã thấy trễ."
            notes={[
              {
                verdict: 'use',
                when: 'Đổi nền/màu chữ khi hover, focus',
                spec: '120 ms, ease-standard, chỉ đổi màu/nền, không phóng to, không dịch chuyển.',
                recharts: 'Tailwind transition-colors duration-(--motion-fast). Button shadcn đã có transition-all.',
                source: { label: 'Val Head: thời lượng UI 200–500 ms, nhỏ thì ngắn hơn; ngưỡng 0,1 s của NN/g', href: 'https://valhead.com/?p=2978' },
              },
            ]}
          >
            <HoverDemo />
          </Demo>

          <Demo
            id="tooltip"
            title="Tooltip trên đồ thị"
            lead="Rê chuột qua hai đồ thị. Bên trái tooltip trượt đuổi theo con trỏ; bên phải là cách W1 đang làm."
            notes={[
              {
                verdict: 'use',
                when: 'Tooltip nhảy ngay tới điểm, chỉ mờ dần khi xuất hiện',
                spec: 'Vị trí: không chuyển động. Hiện: mờ 120–150 ms. Tooltip shadcn (menu, nút) cũng chỉ mờ, không trượt (đã chốt 19/10).',
                recharts: 'Tooltip isAnimationActive={false} (mặc định trượt 400 ms ease).',
              },
            ]}
          >
            <TooltipDemo />
          </Demo>

          <DataChangeDemo />
          <SyncDemo />
          <FocusDemo />
          <KpiDemo />
          <LoadingDemo />
          <DrawerDemo />
          <AlertDemo />
          <EntryDemo />

          <footer className="pb-4 text-2xs text-muted-foreground">
            Dựng trong app/ cùng stack với app team (React, shadcn base-nova, Recharts 3.8). Thời lượng số và easing là đề xuất để thảo luận, chưa phải quyết định.
          </footer>
        </div>
      </div>
    </Reduced.Provider>
  )
}
