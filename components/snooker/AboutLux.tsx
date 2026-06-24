'use client'

import { m } from 'framer-motion'
import { SITE } from '@/lib/site'

const HIGHLIGHTS = [
  {
    icon: '♟',
    title: 'Championship Grade',
    body: 'Full-size competition snooker tables with professional cloth and precision-balanced pockets.',
  },
  {
    icon: '⚡',
    title: 'Premium Atmosphere',
    body: 'Dramatic lighting, climate control, and an immersive environment designed for peak performance.',
  },
  {
    icon: '🎯',
    title: 'Expert Coaching',
    body: 'Learn from experienced players. Sessions available for all skill levels, from beginner to competitive.',
  },
  {
    icon: '🏆',
    title: 'Regular Tournaments',
    body: 'Monthly in-house competitions and annual championship events with prizes and rankings.',
  },
]


export function AboutLux() {
  return (
    <section id="about" className="relative py-28 overflow-hidden">
      {/* Background emerald glow */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-emerald/5 blur-[120px]" />

      <div className="mx-auto max-w-content px-5">
        {/* Top: label + headline + intro */}
        <div className="mb-20 grid gap-12 lg:grid-cols-[1fr_1.1fr] items-end">
          <div>
            <m.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-label mb-6"
            >
              About the Club
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.2rem,5vw,4rem)] font-bold uppercase leading-[0.9] text-white"
            >
              Where
              <br />
              <span className="gold-text">Champions</span>
              <br />
              Play
            </m.h2>
          </div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="mb-5 text-base leading-relaxed text-white/50 md:text-lg">
              Nestled in the heart of {SITE.city}, Star Snooker Academy has become the definitive
              destination for snooker enthusiasts across Gujarat. We've built more than a club —
              we've built a community.
            </p>
            <p className="text-sm leading-relaxed text-white/35">
              From casual evening sessions to serious competitive play, our facility offers the
              perfect environment. Every table is tournament-standard, every cue is professionally
              maintained, and every visit is designed to exceed your expectations.
            </p>
          </m.div>
        </div>

        {/* Visual divider with decorative element */}
        <m.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent origin-left"
        />

        {/* Highlights grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h, i) => (
            <m.div
              key={h.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12, duration: 0.65, ease: 'easeOut' }}
              className="group relative rounded-2xl p-6 luxury-glass transition-all duration-500 hover:-translate-y-1 hover:border-gold/20"
            >
              {/* Gold corner accent */}
              <div className="absolute right-0 top-0 h-12 w-12 overflow-hidden rounded-2xl">
                <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full border border-gold/15" />
              </div>

              <div className="mb-4 text-3xl">{h.icon}</div>
              <h3 className="mb-2 font-display text-base font-bold uppercase tracking-wider text-white group-hover:text-gold transition-colors duration-300">
                {h.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/40">{h.body}</p>
            </m.div>
          ))}
        </div>

        {/* Bottom decorative bars */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-20 flex flex-col gap-2 sm:flex-row"
        >
          {[
            { label: 'Championship Snooker', w: 'flex-[2]', color: 'bg-gold/80' },
            { label: 'Pool & Mini Snooker', w: 'flex-[1.5]', color: 'bg-emerald/60' },
            { label: 'Carrom & TT', w: 'flex-[1]', color: 'bg-red/40' },
            { label: 'Chess', w: 'flex-[0.5]', color: 'bg-white/20' },
          ].map((b) => (
            <div key={b.label} className={`${b.w} group cursor-default`}>
              <div className={`h-1.5 rounded-full ${b.color} transition-all duration-300 group-hover:h-2.5`} />
              <p className="mt-2 font-display text-[0.62rem] uppercase tracking-wider text-white/30 group-hover:text-white/50 transition-colors">
                {b.label}
              </p>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  )
}
