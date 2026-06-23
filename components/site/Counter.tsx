'use client'

import { useEffect, useRef, useState } from 'react'

// Counts up from 0 to `target` once it scrolls into view. Honours reduced-motion
// by jumping straight to the final value.
//
// The initial render is a deterministic `0` on both server and client so there
// is no hydration mismatch — the animation only starts after mount in useEffect.
export function Counter({
  target,
  suffix = '',
  prefix = '',
  duration = 1800,
}: {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setCount(target)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          // easeOutCubic for a natural deceleration
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(target * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
