import { useEffect, useRef, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DELTA_KEY, FACTORY_TOTAL, FINISHED_ML, METRICS, SERIES_COLOR, UNITS, fmt, pct, type Group, type Metric, type Unit } from './data'

export type Mode = 'abs' | 'per'

const U: Record<Metric, { abs: string; per: string; dAbs: number; dPer: number }> = {
  dien: { abs: 'MWh', per: 'kWh/1.000 L TP', dAbs: 0, dPer: 1 },
  nuoc: { abs: 'm³', per: 'm³/1.000 L TP', dAbs: 0, dPer: 2 },
  hoi: { abs: 'tấn', per: 'kg/1.000 L TP', dAbs: 0, dPer: 0 },
}
// Điện vàng gần trắng nên thanh kết thúc ở vàng đậm (bản 38).
const BAR_END: Record<Metric, string> = { dien: 'var(--chart-ext-chart-1-deep)', nuoc: 'var(--chart-2)', hoi: 'var(--chart-3)' }

const perL = (k: Metric, v: number) => (k === 'nuoc' ? v / (FINISHED_ML * 1000) : v / FINISHED_ML)

/** Số hàng bị che (nằm dưới mép) trong danh sách cuộn; 0 khi vừa hết. */
function useHiddenRows<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [hidden, setHidden] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const bottom = el.scrollTop + el.clientHeight + 1
      setHidden([...el.children].filter((c) => (c as HTMLElement).offsetTop + (c as HTMLElement).offsetHeight > bottom).length)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', update)
    }
  }, [])
  return [ref, hidden] as const
}

function RankList({ children }: { children: React.ReactNode }) {
  const [ref, hidden] = useHiddenRows<HTMLDivElement>()
  return (
    <>
      <div
        ref={ref}
        className="relative -mr-1.5 flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pr-1.5"
        style={hidden ? { maskImage: 'linear-gradient(to bottom, black calc(100% - 16px), transparent)' } : undefined}
      >
        {children}
      </div>
      {hidden > 0 && <span className="-mt-1 shrink-0 px-1.5 text-3xs text-muted-foreground">Còn {hidden} hàng · cuộn để xem</span>}
    </>
  )
}

/** Số thực tế / Trên 1.000 L — chỉ áp dụng cho phân bổ (biên bản 14/10). Mặc định trên 1.000 L. */
export function ModeToggle({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <SegToggle
      label="Hiển thị phân bổ"
      value={mode}
      onChange={onMode}
      items={[
        ['per', 'Trên 1.000 L'],
        ['abs', 'Số thực tế'],
      ]}
    />
  )
}

export function SegToggle<T extends string>({ label, value, onChange, items }: { label: string; value: T; onChange: (v: T) => void; items: [T, string][] }) {
  return (
    <ToggleGroup aria-label={label} value={[value]} onValueChange={(v) => v[0] && onChange(v[0] as T)} spacing={0.5} className="rounded-full! bg-muted p-0.75">
      {items.map(([v, l]) => (
        <ToggleGroupItem
          key={v}
          value={v}
          className="h-7 rounded-full! px-3 text-xs font-normal text-muted-foreground aria-pressed:bg-popover aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:shadow-glass-pill"
        >
          {l}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const ROW_COLS = 'grid-cols-[--spacing(30.5)_1fr_--spacing(12)_--spacing(19)]'

type RowProps = {
  metric: Metric
  name: string
  /** Dòng phụ dưới tên (ví dụ mẫu số riêng của công đoạn). */
  sub?: string
  value: string
  /** Độ dài thanh, 0–1 so với giá trị lớn nhất của danh sách. */
  share: number
  /** Cùng kỳ chưa có số: ghi chữ thay cho %, không coi là 0. */
  noHistory?: boolean
  delta?: number | null
  warn?: boolean
  /** Thất thoát / chưa đo: thanh khung nét đứt, không tô. */
  loss?: boolean
  pressed?: boolean
  onClick?: () => void
}

/** Một hàng xếp hạng: tên · thanh trên nền track · số · so cùng kỳ. Dùng chung Tổng quan và trang Điện/Nước/Hơi. */
export function AllocRow({ metric, name, sub, value, share, noHistory, delta, warn, loss, pressed, onClick }: RowProps) {
  const c = SERIES_COLOR[metric]
  const body = (
    <>
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{name}</span>
        {sub && <span className="truncate text-3xs text-muted-foreground">{sub}</span>}
      </span>
      <span className="h-2 overflow-hidden rounded-full bg-chart-track">
        <i
          className={cn('block h-full rounded-full', loss && 'border border-dashed border-foreground')}
          style={{
            width: `${(share * 100).toFixed(1)}%`,
            backgroundImage: loss ? undefined : `linear-gradient(90deg, color-mix(in srgb, ${c} 55%, var(--popover)), ${BAR_END[metric]})`,
          }}
        />
      </span>
      <span className="text-right font-semibold">{value}</span>
      <span className={cn('text-right text-muted-foreground', warn && 'font-semibold text-warning-foreground')}>
        {noHistory ? (
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Clock className="size-2.5" aria-hidden />
            chưa có số
          </span>
        ) : delta == null ? (
          ''
        ) : (
          (warn ? '⚠ ' : '') + pct(delta)
        )}
      </span>
    </>
  )
  const cls = cn('grid w-full shrink-0 items-center gap-2.5 rounded-lg px-1.5 text-left text-2xs tabular-nums', sub ? 'min-h-8 py-0.5' : 'h-5', ROW_COLS)
  if (!onClick) return <div className={cls}>{body}</div>
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(cls, 'transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted', pressed && 'bg-accent shadow-[inset_3px_0_0_var(--ring)]')}
    >
      {body}
    </button>
  )
}

export { RankList }

type Props = { group: Group; mode: Mode; onMode: (m: Mode) => void; selected: string | null; onSelect: (id: string | null) => void }

export function Allocation({ group, mode, onMode, selected, onSelect }: Props) {
  const list = UNITS[group]
  return (
    <section aria-label="Phân bổ tiêu thụ" className="flex min-h-0 flex-col gap-2">
      <div className="flex items-center gap-3">
        <h2 className="text-body font-semibold">Phân bổ tiêu thụ theo {group === 'area' ? 'khu vực' : 'công đoạn'} · tháng 9/2026</h2>
        <span className="text-2xs text-muted-foreground">xếp từ lớn nhất · so cùng kỳ</span>
        <span className="flex-1" />
        <ModeToggle mode={mode} onMode={onMode} />

      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        {(['dien', 'nuoc', 'hoi'] as Metric[]).map((k) => {
          const u = U[k]
          const arr = list.filter((a): a is Unit & Record<Metric, number> => a[k] != null).sort((p, q) => (q[k] as number) - (p[k] as number))
          const top = arr[0][k] as number
          const total = mode === 'abs' ? `${fmt(FACTORY_TOTAL[k], u.dAbs)} ${u.abs}` : `${fmt(perL(k, FACTORY_TOTAL[k]), u.dPer)} ${u.per}`
          return (
            <figure key={k} className="glass-card glass-bg flex min-h-0 flex-col gap-1.5 px-3 pt-3 pb-2.5">
              <figcaption className="flex items-center gap-2 px-1.5">
                <span className="size-2 rounded-full" style={{ background: SERIES_COLOR[k] }} />
                <b className="text-body">{METRICS[k].name}</b>
                <span className="ml-auto text-2xs text-muted-foreground">{mode === 'abs' ? u.abs : u.per}</span>
              </figcaption>
              <RankList>
                {arr.map((a) => {
                  const v = a[k] as number
                  const d = a[DELTA_KEY[k]]
                  const on = a.id === selected
                  return (
                    <AllocRow
                      key={a.id}
                      metric={k}
                      name={a.name}
                      value={mode === 'abs' ? fmt(v, u.dAbs) : fmt(perL(k, v), u.dPer)}
                      share={v / top}
                      delta={d}
                      warn={a.warn && k === 'dien'}
                      pressed={on}
                      onClick={() => onSelect(on ? null : a.id)}
                    />
                  )
                })}
              </RankList>
              <span className="shrink-0 border-t border-border px-1.5 pt-1.5 text-2xs text-muted-foreground">
                Toàn nhà máy {total}
                {k === 'hoi' ? ' · chỉ có đồng hồ nấu, lọc, chiết keg' : ' · gồm cả phần chưa đo'}
              </span>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
