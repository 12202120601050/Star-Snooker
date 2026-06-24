'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { m, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, MapPin, Clock } from 'lucide-react'
import { SITE, LINKS } from '@/lib/site'

const BilliardScene = dynamic(() => import('@/components/three/BilliardScene'), {
  ssr: false,
  loading: () => null,
})

export function HeroLux() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  useEffect(() => {
    setMounted(true)
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative flex h-screen min-h-[700px] items-center overflow-hidden"
    >
      {/* Three.js canvas */}
      <m.div
        style={{ scale: bgScale }}
        className="absolute inset-0 z-0"
      >
        {mounted && <BilliardScene />}
      </m.div>

      {/* Layered dark overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink/85 via-ink/65 to-ink" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink/70 via-transparent to-ink/40" />

      {/* Emerald ambient glow at top */}
      <div className="absolute -top-40 left-1/2 z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald/10 blur-[100px]" />

      {/* Mouse-follow spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(700px circle at ${50 + mouse.x * 18}% ${50 + mouse.y * 18}%, rgba(212,175,55,0.07) 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <m.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 mx-auto w-full max-w-content px-5"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_380px]">
          {/* LEFT — headline + CTAs */}
          <div>
            {/* Badge */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="section-label mb-7"
            >
              Est. 2021 · {SITE.city}, Gujarat
            </m.div>

            {/* Main headline */}
            <m.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 font-display font-bold uppercase leading-[0.88]"
            >
              <span className="block text-white" style={{ fontSize: 'clamp(3.8rem,9.5vw,7.5rem)' }}>
                Star
              </span>
              <span
                className="shimmer-text block"
                style={{ fontSize: 'clamp(3.8rem,9.5vw,7.5rem)' }}
              >
                Snooker
              </span>
              <span
                className="mt-3 block tracking-[0.5em] text-white/25"
                style={{ fontSize: 'clamp(1rem,3vw,2.2rem)' }}
              >
                ACADEMY
              </span>
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 max-w-[480px] text-base leading-relaxed text-white/50 md:text-lg"
            >
              {SITE.description.split('.')[0]}. Championship tables, masterful lighting, and
              an atmosphere that commands your best game.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(212,175,55,0.35)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gold-deep via-gold to-gold-light" />
                <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-gold-light via-gold to-gold-deep transition-transform duration-500 group-hover:translate-x-0" />
                <span className="relative">Reserve a Table</span>
              </a>
              <a
                href={LINKS.phonePrimary}
                className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold/8 hover:text-gold"
              >
                Call to Book
              </a>
            </m.div>
          </div>

          {/* RIGHT — Glass info card */}
          <m.aside
            initial={{ opacity: 0, x: 40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="gold-border rounded-2xl p-6 luxury-glass">
              {/* Status */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="section-label text-[0.62rem] mb-2">Live Status</p>
                  <div className="flex items-center gap-2">
                    <div className="live-dot" />
                    <span className="font-display text-sm font-semibold text-green-400">Open Now</span>
                  </div>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-gold/10"
                  style={{ boxShadow: '0 0 20px rgba(212,175,55,0.15)' }}
                >
                  <span className="font-display text-lg font-bold text-gold">★</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { v: '9', l: 'Tables' },
                  { v: '5', l: 'Games' },
                  { v: '₹50', l: 'From/hr' },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center"
                  >
                    <div className="font-display text-2xl font-bold gold-text">{s.v}</div>
                    <div className="mt-0.5 font-display text-[0.6rem] uppercase tracking-wider text-white/35">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-emerald/25 bg-emerald/8 p-3.5">
                <Clock size={14} className="mt-0.5 shrink-0 text-emerald-light" />
                <div>
                  <p className="mb-0.5 font-display text-[0.68rem] font-semibold uppercase tracking-wider text-emerald-light">
                    Hours
                  </p>
                  <p className="text-xs text-white/50">{SITE.hours}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gold/60" />
                <p className="text-xs leading-relaxed text-white/40">
                  {SITE.streetAddress}
                  <br />
                  {SITE.city}, {SITE.region}
                </p>
              </div>

              {/* Pricing preview */}
              <div className="mt-4 text-center">
                <span className="font-display text-[0.65rem] uppercase tracking-wider text-white/30">
                  Starting from{' '}
                  <span className="font-bold text-gold">{SITE.priceRange}</span>
                </span>
              </div>
            </div>
          </m.aside>
        </div>
      </m.div>

      {/* Scroll cue */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5"
      >
        <span className="font-display text-[0.58rem] uppercase tracking-[0.4em] text-white/25">
          Scroll
        </span>
        <m.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={14} className="text-white/25" />
        </m.div>
      </m.div>
    </section>
  )
}
