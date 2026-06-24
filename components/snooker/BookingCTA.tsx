'use client'

import { useRef } from 'react'
import { m, useScroll, useTransform } from 'framer-motion'
import { LINKS, SITE } from '@/lib/site'

export function BookingCTA() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40])

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* Layered background */}
      <div className="absolute inset-0 bg-ink-2" />

      {/* Moving gold orb */}
      <m.div
        style={{
          y,
          background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(13,92,46,0.06) 50%, transparent 70%)',
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Diagonal gold lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent"
            style={{
              top: `${10 + i * 16}%`,
              left: '-10%',
              right: '-10%',
              transform: `rotate(${-8 + i * 2}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-content px-5 text-center">
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6 flex justify-center"
        >
          <span className="section-label">Ready to Play?</span>
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 max-w-3xl font-display font-bold uppercase leading-[0.88] text-white"
          style={{ fontSize: 'clamp(2.5rem,7vw,6rem)' }}
        >
          Your Best Game{' '}
          <span className="shimmer-text">Starts Here</span>
        </m.h2>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mb-12 max-w-lg text-base text-white/45"
        >
          Walk in, book on WhatsApp, or call us. Tables are ready. The cues are chalked.
          All that's missing is you.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(212,175,55,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold-deep via-gold to-gold-light" />
            <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-gold-light via-gold to-gold-deep transition-transform duration-500 group-hover:translate-x-0" />
            <span className="relative">Book on WhatsApp</span>
          </a>

          <a
            href={LINKS.phonePrimary}
            className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:text-gold"
          >
            Call {SITE.phonePrimaryDisplay}
          </a>
        </m.div>

        {/* Hours reminder */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-10 flex items-center justify-center gap-2"
        >
          <div className="live-dot" />
          <span className="font-display text-xs uppercase tracking-widest text-white/30">
            Open Daily · Morning to Late Night
          </span>
        </m.div>
      </div>
    </section>
  )
}

