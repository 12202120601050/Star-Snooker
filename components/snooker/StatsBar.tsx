'use client'

import { useRef, useEffect, useState } from 'react'
import { m, useInView } from 'framer-motion'

const STATS = [
  { value: 9, prefix: '', suffix: '+', label: 'Game Tables' },
  { value: 5, prefix: '', suffix: '', label: 'Game Types' },
  { value: 3, prefix: '', suffix: '+', label: 'Years of Excellence' },
  { value: 500, prefix: '', suffix: '+', label: 'Happy Members' },
  { value: 50, prefix: '₹', suffix: '', label: 'Starting Per Hour' },
] as const

function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
      else setCount(value)
    }
    requestAnimationFrame(tick)
  }, [inView, value])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}

export function StatsBar() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-ink-2/80 backdrop-blur-sm">
      {/* Gold line accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="mx-auto max-w-content px-5 py-10">
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((stat, i) => (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="stat-number">
                <Counter value={stat.value} prefix={stat.prefix ?? ''} suffix={stat.suffix} />
              </div>
              <div className="font-display text-[0.68rem] uppercase tracking-widest text-white/35">
                {stat.label}
              </div>
            </m.div>
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
