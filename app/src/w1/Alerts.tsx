import { ArrowUp, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ALERTS, type AlertId } from './data'

export function StatusBadge({ kind, children, className }: { kind: 'warn' | 'over'; children: React.ReactNode; className?: string }) {
  const Icon = kind === 'over' ? ArrowUp : TriangleAlert
  return (
    <Badge
      className={cn(
        'font-semibold',
        kind === 'over'
          ? 'bg-destructive-solid text-destructive-solid-foreground shadow-sm shadow-destructive-solid/60'
          : 'bg-warning-solid text-warning-solid-foreground shadow-sm shadow-warning-solid/60',
        className,
      )}
    >
      <Icon strokeWidth={2.6} />
      {children}
    </Badge>
  )
}

export function Alerts({ onOpen }: { onOpen: (id: AlertId) => void }) {
  return (
    <section aria-label="Cảnh báo" className="glass-card glass-bg grid grid-cols-[--spacing(43)_repeat(5,minmax(0,1fr))] py-1.5">
      <div className="flex flex-col justify-center gap-0.5 pr-3.5 pl-4">
        <b className="flex items-center gap-1.5 text-body">
          <TriangleAlert className="size-3.5" strokeWidth={2.2} />
          Cảnh báo T9
        </b>
        <span className="text-2xs whitespace-nowrap text-muted-foreground">
          5 cần xử lý ·{' '}
          <a href="#" className="text-ring">
            Ngưỡng
          </a>
        </span>
      </div>
      {ALERTS.map((a) => (
        <button
          key={a.id}
          type="button"
          title={`${a.text} · xem chi tiết`}
          aria-haspopup="dialog"
          onClick={() => onOpen(a.id)}
          className="flash-once flex min-w-0 cursor-pointer flex-col justify-center gap-0.5 border-l border-border px-3.5 py-1 text-left transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <StatusBadge kind={a.kind} className="h-4 px-1.5 text-3xs [&>svg]:size-2.5!">
              {a.label}
            </StatusBadge>
            <span className="truncate text-xs font-bold tabular-nums">{a.value}</span>
          </span>
          <span className="truncate text-2xs text-muted-foreground">{a.text}</span>
        </button>
      ))}
    </section>
  )
}
