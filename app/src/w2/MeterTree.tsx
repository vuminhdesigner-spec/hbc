import { useState } from 'react'
import { ChevronDown, ChevronRight, TriangleAlert, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmt } from '../w1/data'
import { TREE, type TreeNode } from './data'

type Props = { selected: string; onSelect: (n: TreeNode) => void }

function Row({ node, depth, selected, onSelect, open, onToggle }: { node: TreeNode; depth: number; selected: string; onSelect: (n: TreeNode) => void; open: Set<string>; onToggle: (id: string) => void }) {
  const has = !!node.children?.length
  const isOpen = open.has(node.id)
  const on = node.id === selected
  return (
    <li role="treeitem" aria-expanded={has ? isOpen : undefined} aria-selected={on} className="flex flex-col">
      <div
        className={cn(
          'grid min-h-8 grid-cols-[1fr_--spacing(12)_--spacing(9)] items-center gap-2 rounded-lg pr-2 transition-colors duration-(--motion-fast) ease-(--ease-standard) hover:bg-muted',
          on && 'bg-accent shadow-[inset_3px_0_0_var(--ring)] hover:bg-accent',
        )}
        style={{ paddingLeft: `calc(var(--spacing) * ${2 + depth * 3.5})` }}
      >
        <span className="flex min-w-0 items-start gap-1 py-1">
          {has ? (
            <button type="button" aria-label={isOpen ? `Thu gọn ${node.name}` : `Mở ${node.name}`} onClick={() => onToggle(node.id)} className="mt-0.5 grid size-4 shrink-0 place-items-center rounded text-muted-foreground hover:text-foreground">
              {isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          ) : (
            <span className="size-4 shrink-0" />
          )}
          <button type="button" onClick={() => onSelect(node)} className="flex min-w-0 flex-col text-left">
            <span className={cn('truncate text-xs', depth < 2 ? 'font-semibold' : 'font-normal', node.muted && 'text-muted-foreground')}>{node.name}</span>
            <span className={cn('flex items-center gap-1 truncate text-3xs text-muted-foreground', node.warn && 'text-warning-foreground')}>
              {node.warn && <TriangleAlert className="size-2.5 shrink-0" />}
              <span className="truncate">{node.sub}</span>
            </span>
          </button>
        </span>
        <span className={cn('text-right text-xs tabular-nums', node.muted && 'text-muted-foreground')}>{fmt(node.mwh, 0)}</span>
        <span className="text-right text-2xs text-muted-foreground tabular-nums">{node.peak ?? ''}</span>
      </div>
      {has && isOpen && (
        <ul role="group" className="flex flex-col">
          {node.children!.map((c) => (
            <Row key={c.id} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} open={open} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function MeterTree({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(() => new Set(['evn', 't12', 't34']))
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  return (
    <aside aria-label="Cây đồng hồ điện" className="glass-card glass-bg flex min-h-0 flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        {/* Cùng ô icon điện với thẻ KPI ở Tổng quan */}
        <span className="kpi-tile grid size-7.5 shrink-0 place-items-center rounded-glass-inner text-chart-1-foreground" style={{ '--tint': 'var(--chart-1)' } as React.CSSProperties}>
          <Zap className="size-3.75" strokeWidth={2.2} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body font-semibold">Cây đồng hồ điện</span>
          <span className="text-2xs text-muted-foreground">Bấm một nút để lọc cả màn · MWh · % cao điểm</span>
        </span>
      </div>
      <ul role="tree" aria-label="Cây đồng hồ điện" className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
        <Row node={TREE} depth={0} selected={selected} onSelect={onSelect} open={open} onToggle={toggle} />
      </ul>
      <div className="border-t border-border px-4 py-3 text-2xs leading-relaxed text-muted-foreground">
        Tổn hao = công tơ điện lực − Σ 4 MBA
        <br />
        <b className="text-foreground tabular-nums">684 − 672 = 12 MWh · 1,8%</b>
        <br />
        Hai nhánh lệch lớn: chưa rõ ngăn tủ nào thuộc nửa thanh cái nào, và aptomat liên lạc A12, A34 thường đóng hay mở. Xếp nhánh theo sơ đồ tủ là giả định.
      </div>
    </aside>
  )
}
