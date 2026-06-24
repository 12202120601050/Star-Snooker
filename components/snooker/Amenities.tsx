'use client'

import { m } from 'framer-motion'

const ITEMS = [
  { icon: '🎱', title: 'Championship Tables', desc: '2 full-size tournament-grade snooker tables with Strachan cloth' },
  { icon: '🔦', title: 'Pro Lighting System', desc: 'Precision overhead lighting eliminating shadows and glare' },
  { icon: '🎯', title: 'Premium Cue Selection', desc: 'High-quality cues available for every player, from beginner to pro' },
  { icon: '❄️', title: 'Climate Controlled', desc: 'Year-round comfortable temperature for focused gameplay' },
  { icon: '🍽️', title: 'Canteen & Refreshments', desc: 'Cold drinks, snacks, and energy boosts to keep you playing' },
  { icon: '🅿️', title: 'Easy Parking', desc: 'Convenient parking available in the Vraj Prime Complex' },
  { icon: '🏆', title: 'Tournament Arena', desc: 'Hosted competitions with leaderboards, prizes, and rankings' },
  { icon: '📱', title: 'Digital Scoreboard', desc: 'Live session tracking and digital scoring for all tables' },
] as const

export function Amenities() {
  return (
    <section id="amenities" className="relative py-28 overflow-hidden">
      {/* Dark felt background section */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink to-ink-2" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto max-w-content px-5">
        {/* Header */}
        <div className="mb-16 text-center">
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6 flex justify-center"
          >
            <span className="section-label">World-Class Facilities</span>
          </m.div>
          <m.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2rem,5vw,3.8rem)] font-bold uppercase leading-[0.9] text-white"
          >
            Everything You<br />
            <span className="gold-text">Need to Play</span>
          </m.h2>
          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mt-5 max-w-md text-sm text-white/40"
          >
            Meticulously maintained and upgraded for an experience that rivals the best clubs in India.
          </m.p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <m.div
              key={item.title}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 cursor-default transition-all duration-400 hover:border-gold/20 hover:bg-gold/[0.03]"
            >
              {/* Top-left gold dot */}
              <div className="absolute left-4 top-4 h-1 w-1 rounded-full bg-gold/30 group-hover:bg-gold/70 transition-colors duration-300" />

              <div className="mb-4 text-3xl transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-white group-hover:text-gold transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-xs leading-relaxed text-white/35 group-hover:text-white/50 transition-colors duration-300">
                {item.desc}
              </p>

              {/* Bottom gold line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-px rounded-b-2xl bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
