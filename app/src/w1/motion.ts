import { useEffect, useRef, useState } from 'react'

// Thời lượng khớp token trong prototype.css (--motion-*). Recharts cần số ms nên giữ bản JS ở đây.
export const MS = { fast: 120, base: 200, data: 300, draw: 1500, count: 800, load: 700 }

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Lần đầu đồ thị xuất hiện: vẽ dần 1,5 s. Sau đó mỗi lần đổi số: biến hình 300 ms. Remount (key) để vẽ lại. */
export function useChartAnimation() {
  const reduced = useReducedMotion()
  const [drawn, setDrawn] = useState(false)
  return {
    isAnimationActive: !reduced,
    animationDuration: drawn ? MS.data : MS.draw,
    animationEasing: 'ease-out' as const,
    onAnimationEnd: () => setDrawn(true),
  }
}

/** Số chạy từ giá trị cũ (lần đầu từ 0) tới giá trị mới, giảm tốc. */
export function useCountUp(target: number) {
  const reduced = useReducedMotion()
  const [v, setV] = useState(reduced ? target : 0)
  const from = useRef(reduced ? target : 0)
  useEffect(() => {
    if (reduced) {
      from.current = target
      setV(target)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / MS.count)
      const cur = a + (target - a) * (1 - Math.pow(1 - p, 3))
      from.current = cur
      setV(cur)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced])
  return v
}
