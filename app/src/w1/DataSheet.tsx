import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { UNITS, fmt, pct, type Group, type Unit } from './data'

const f0 = (v: number | null) => (v == null ? '—' : fmt(v, 0))
const per = (a: Unit, k: 'dien' | 'nuoc' | 'hoi', d: number) => {
  const v = a[k]
  if (v == null || !a.bv) return '—'
  return fmt(k === 'nuoc' ? v / (a.bv * 1000) : v / a.bv, d)
}

const NUM = 'text-right tabular-nums'

export function DataSheet({ open, onOpenChange, group }: { open: boolean; onOpenChange: (o: boolean) => void; group: Group }) {
  const gname = group === 'area' ? 'khu vực' : 'công đoạn'
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="glass-card inset-y-2.5! right-2.5! h-auto! w-245! max-w-none! gap-0 overflow-hidden bg-background">
        <SheetHeader className="flex-row items-center gap-3 border-b border-border px-4 py-3.5 pr-14">
          <SheetTitle className="text-sm font-semibold">Số liệu theo {gname} · tháng 9/2026</SheetTitle>
          <SheetDescription className="ml-auto text-2xs">Cột và file Excel theo mẫu bảng theo dõi điện nhà máy</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Table className="text-xs">
            <TableHeader className="bg-muted text-2xs">
              <TableRow>
                <TableHead>{group === 'area' ? 'Khu vực' : 'Công đoạn'}</TableHead>
                <TableHead>Mẫu số sản lượng</TableHead>
                <TableHead className={NUM}>Điện, MWh</TableHead>
                <TableHead className={NUM}>kWh/1.000 L</TableHead>
                <TableHead className={NUM}>Nước, m³</TableHead>
                <TableHead className={NUM}>m³/1.000 L</TableHead>
                <TableHead className={NUM}>Hơi, tấn</TableHead>
                <TableHead className={NUM}>kg/1.000 L</TableHead>
                <TableHead className={NUM}>So cùng kỳ*</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {UNITS[group].map((a) => {
                const d = a.dd ?? a.dh
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-2xs text-muted-foreground">{a.base ?? 'Không gắn sản lượng'}</TableCell>
                    <TableCell className={NUM}>{f0(a.dien)}</TableCell>
                    <TableCell className={cn(NUM, 'font-semibold')}>{per(a, 'dien', 1)}</TableCell>
                    <TableCell className={NUM}>{f0(a.nuoc)}</TableCell>
                    <TableCell className={NUM}>{per(a, 'nuoc', 2)}</TableCell>
                    <TableCell className={NUM}>{f0(a.hoi)}</TableCell>
                    <TableCell className={NUM}>{per(a, 'hoi', 0)}</TableCell>
                    <TableCell className={cn(NUM, a.warn && 'font-semibold text-warning-foreground')}>{d == null ? '—' : pct(d)}</TableCell>
                    <TableCell className="max-w-60 truncate text-2xs text-muted-foreground">{a.note}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter className="bg-muted font-semibold">
              <TableRow>
                <TableCell>Toàn nhà máy</TableCell>
                <TableCell className="text-2xs font-normal text-muted-foreground">Thành phẩm 8,1 triệu L</TableCell>
                <TableCell className={NUM}>672</TableCell>
                <TableCell className={NUM}>83,0</TableCell>
                <TableCell className={NUM}>27.540</TableCell>
                <TableCell className={NUM}>3,40</TableCell>
                <TableCell className={NUM}>3.035</TableCell>
                <TableCell className={NUM}>375</TableCell>
                <TableCell className={NUM}>▼ 1,2%</TableCell>
                <TableCell className="text-2xs font-normal text-muted-foreground">* điện; theo đồng hồ tổng</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  )
}
