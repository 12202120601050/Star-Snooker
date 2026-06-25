'use client'

import { useRef, useState, MouseEvent } from 'react'
import { m, useMotionValue, useMotionTemplate, useSpring, useTransform } from 'framer-motion'
import { GAMES } from '@/lib/site'

const ICONS: Record<string, string> = {
  snooker: '🎱',
  pool: '🔵',
  carrom: '🎯',
  tabletennis: '🏓',
  chess: '♟',
  zapminton: '🏸',
}

const COLORS: Record<string, { from: string; to: string; accent: string }> = {
  snooker: { from: 'from-emerald/20', to: 'to-emerald-deep/5', accent: 'text-emerald-light' },
  pool: { from: 'from-blue-900/20', to: 'to-blue-950/5', accent: 'text-blue-400' },
  carrom: { from: 'from-amber-900/20', to: 'to-amber-950/5', accent: 'text-amber-400' },
  tabletennis: { from: 'from-red-900/20', to: 'to-red-950/5', accent: 'text-red-400' },
  chess: { from: 'from-white/5', to: 'to-white/0', accent: 'text-white/70' },
  zapminton: { from: 'from-purple-900/20', to: 'to-purple-950/5', accent: 'text-purple-400' },
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 22 })
  const springY = useSpring(y, { stiffness: 220, damping: 22 })
  const rotX = useTransform(springY, [-80, 80], [12, -12])
  const rotY = useTransform(springX, [-80, 80], [-12, 12])
  const glowX = useTransform(springX, [-80, 80], [0, 100])
  const glowY = useTransform(springY, [-80, 80], [0, 100])
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(212,175,55,0.12) 0%, transparent 60%)`

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <m.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {/* Moving glare layer */}
      <m.div
        style={{ background: glowBackground }}
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
      />
      {children}
    </m.div>
  )
}

export function TablesShowcase() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="tables" className="relative py-28 overflow-hidden">
      {/* Background gold glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />

      <div className="mx-auto max-w-content px-5">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <m.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-label mb-5"
            >
              Our Games
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2rem,5vw,3.8rem)] font-bold uppercase leading-[0.9] text-white"
            >
              Tables &<br />
              <span className="gold-text">Pricing</span>
            </m.h2>
          </div>
          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-xs text-sm text-white/40"
          >
            Hover any card to explore our world-class tables and competitive pricing for every game.
          </m.p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: '1200px' }}>
          {GAMES.map((game, i) => {
            const color = COLORS[game.icon] ?? COLORS.chess
            const isHovered = hovered === i

            return (
              <m.div
                key={game.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard className="relative h-full">
                  <div
                    className={`relative h-full overflow-hidden rounded-2xl border transition-all duration-500 ${
                      isHovered
                        ? 'border-gold/30 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.1)]'
                        : 'border-white/[0.07]'
                    }`}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Card background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${color.from} ${color.to} transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-60'}`}
                    />
                    <div className="absolute inset-0 bg-ink-2/70" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col p-6" style={{ transformStyle: 'preserve-3d' }}>
                      {/* Icon */}
                      <m.div
                        animate={{ scale: isHovered ? 1.15 : 1 }}
                        transition={{ duration: 0.4, ease: 'backOut' }}
                        className="mb-5 text-5xl"
                        style={{ transform: 'translateZ(20px)' }}
                      >
                        {ICONS[game.icon]}
                      </m.div>

                      {/* Name */}
                      <h3
                        className={`mb-1 font-display text-xl font-bold uppercase tracking-wide transition-colors duration-300 ${
                          isHovered ? 'text-gold' : 'text-white'
                        }`}
                        style={{ transform: 'translateZ(15px)' }}
                      >
                        {game.name}
                      </h3>

                      {/* Sub */}
                      <p className="mb-6 text-sm text-white/40">{game.sub}</p>

                      {/* Divider */}
                      <div
                        className={`mb-5 h-px transition-all duration-500 ${
                          isHovered
                            ? 'bg-gradient-to-r from-gold/60 to-transparent'
                            : 'bg-white/8'
                        }`}
                      />

                      {/* Pricing */}
                      <div className="flex items-end justify-between" style={{ transform: 'translateZ(10px)' }}>
                        <div>
                          <p className="mb-0.5 font-display text-[0.6rem] uppercase tracking-widest text-white/30">
                            Per Frame
                          </p>
                          <p className={`font-display text-2xl font-bold ${game.frame ? color.accent : 'text-white/20'}`}>
                            {game.frame ? `₹${game.frame}` : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="mb-0.5 font-display text-[0.6rem] uppercase tracking-widest text-white/30">
                            Per Hour
                          </p>
                          <p className={`font-display text-2xl font-bold ${game.hour ? 'text-gold' : 'text-white/20'}`}>
                            {game.hour ? `₹${game.hour}` : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Book button — appears on hover */}
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-5"
                      >
                        <a
                          href={`https://wa.me/919601818268?text=Hi! I want to book a ${game.name} table.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full rounded-xl border border-gold/40 bg-gold/10 py-2.5 text-center font-display text-xs font-bold uppercase tracking-widest text-gold transition-all duration-300 hover:bg-gold hover:text-ink"
                        >
                          Book This Table
                        </a>
                      </m.div>
                    </div>
                  </div>
                </TiltCard>
              </m.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
