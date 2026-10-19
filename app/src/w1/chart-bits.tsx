import { cn } from '@/lib/utils'

export function LegendLine({ color, faint, dashed, dotted, children }: { color: string; faint?: boolean; dashed?: boolean; dotted?: boolean; children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.25">
      <i
        className={cn('inline-block w-3.5 border-t-[2.5px]', faint && 'border-t-2 opacity-60', dashed && 'border-t-[1.5px] border-dashed', dotted && 'border-t-2 border-dotted')}
        style={{ borderColor: color }}
      />
      {children}
    </span>
  )
}

export function LegendBox({ children }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.25">
      <i className="inline-block size-2.5 rounded-xs bg-linear-to-b from-chart-volume/55 to-chart-volume/15" />
      {children}
    </span>
  )
}

export function ChartTip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-pill w-max min-w-37.5 whitespace-nowrap animate-in rounded-glass-inner px-2.5 py-2 text-2xs tabular-nums duration-150 fade-in-0">
      <div className="mb-1 font-semibold">{title}</div>
      {children}
    </div>
  )
}

export function ChartTipRow({ swatch, label, value }: { swatch?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {swatch}
      {label}
      <b className="ml-auto pl-3 font-semibold text-foreground">{value}</b>
    </div>
  )
}

/** Mục chú thích trỏ được: rê chuột hoặc focus bàn phím làm mờ các chuỗi khác. */
export function FocusItem({ id, onFocus, children }: { id: string; onFocus: (id: string | null) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseEnter={() => onFocus(id)}
      onMouseLeave={() => onFocus(null)}
      onFocus={() => onFocus(id)}
      onBlur={() => onFocus(null)}
      className="-mx-1 rounded-md px-1 transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}

export const seriesClass = (focus: string | null, id: string) => (focus && focus !== id ? 'series series-dim' : 'series')
