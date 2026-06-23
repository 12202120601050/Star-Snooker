'use client'

import { LazyMotion, domAnimation, m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

// LazyMotion + domAnimation loads only the DOM animation features (~5kb) instead
// of the full motion bundle, and `m` is the lightweight motion component. This
// is the recommended Framer Motion pattern for keeping the bundle small.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}

type Direction = 'up' | 'down' | 'left' | 'right'

const OFFSET: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 64 },
  down: { y: -64 },
  left: { x: -70 },
  right: { x: 70 },
}

// Scroll-triggered reveal. Animates once when it enters the viewport.
//
// Server and the first client render output an identical plain <div> (no motion
// styles) to avoid hydration mismatches; the animated version mounts on the
// client afterwards. Reduced-motion users always get the plain div.
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className,
}: {
  children: ReactNode
  delay?: number
  direction?: Direction
  className?: string
}) {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || reduce) return <div className={className}>{children}</div>

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, scale: 0.94, ...OFFSET[direction] }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -90px 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  )
}

// Scroll-linked parallax: children drift vertically as the element passes
// through the viewport. `speed` is the total travel in px (top → bottom).
// No-op for reduced-motion users.
export function Parallax({
  children,
  speed = 60,
  className,
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])

  // Server + first client render output a plain <div> (no motion attributes) so
  // hydration matches exactly; the motion wrapper engages after mount.
  if (!mounted || reduce) return <div ref={ref} className={className}>{children}</div>
  return (
    <m.div ref={ref} style={{ y }} className={className}>
      {children}
    </m.div>
  )
}
