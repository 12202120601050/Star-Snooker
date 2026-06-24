'use client'

import { m } from 'framer-motion'
import { LINKS } from '@/lib/site'

const EVENTS = [
  {
    tag: 'Monthly',
    title: 'Club Championship',
    desc: 'Open to all members. Single-elimination bracket across Big Snooker and Pool.',
    prize: '₹5,000 Prize Pool',
    color: 'gold',
  },
  {
    tag: 'Quarterly',
    title: 'Star Open',
    desc: 'Our flagship tournament. Open to all — members and walk-ins. Registered players compete for the Star Trophy.',
    prize: '₹15,000 Prize Pool',
    color: 'emerald',
  },
  {
    tag: 'Annual',
    title: 'Gujarat Snooker League',
    desc: 'The premier league event of the year. Qualifying rounds through the season, finals in December.',
    prize: '₹50,000 Prize Pool',
    color: 'red',
  },
] as const

export function Tournament() {
  return (
    <section id="tournament" className="relative overflow-hidden py-28">
      {/* Felt background */}
      <div className="absolute inset-0 felt-bg opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/80" />

      {/* Gold spotlight from top center */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gold/10 blur-[100px]" />

      <div className="relative mx-auto max-w-content px-5">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] items-center">
          {/* Left: copy */}
          <div>
            <m.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="section-label mb-6"
            >
              Competition
            </m.div>

            <m.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold uppercase leading-[0.9] text-white"
            >
              Compete &<br />
              <span className="gold-text">Conquer</span>
            </m.h2>

            <m.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 text-sm leading-relaxed text-white/45"
            >
              Star Snooker Academy hosts regular tournaments across skill levels. Test yourself
              against the best players in Gujarat, climb the leaderboard, and compete for prizes
              and glory.
            </m.p>

            {/* Mini stats */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-8 grid grid-cols-3 gap-3"
            >
              {[
                { v: '12+', l: 'Events/Year' },
                { v: '200+', l: 'Participants' },
                { v: '₹70k+', l: 'Prize Money' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-center">
                  <div className="font-display text-2xl font-bold gold-text">{s.v}</div>
                  <div className="mt-1 font-display text-[0.58rem] uppercase tracking-wider text-white/30">{s.l}</div>
                </div>
              ))}
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl bg-gold px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(212,175,55,0.35)]"
              >
                Register Interest
              </a>
            </m.div>
          </div>

          {/* Right: event cards */}
          <div className="flex flex-col gap-4">
            {EVENTS.map((ev, i) => {
              const colors = {
                gold: { badge: 'bg-gold/20 text-gold border-gold/30', bar: 'bg-gold', prize: 'text-gold' },
                emerald: { badge: 'bg-emerald/20 text-emerald-light border-emerald/30', bar: 'bg-emerald-light', prize: 'text-emerald-light' },
                red: { badge: 'bg-red/20 text-red-light border-red/30', bar: 'bg-red', prize: 'text-red-light' },
              }[ev.color]

              return (
                <m.div
                  key={ev.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-all duration-400 hover:border-white/15 hover:-translate-y-0.5"
                >
                  {/* Left color bar */}
                  <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${colors.bar} opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="pl-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`rounded-full border px-2.5 py-0.5 font-display text-[0.58rem] font-semibold uppercase tracking-widest ${colors.badge}`}>
                        {ev.tag}
                      </span>
                      <span className={`font-display text-xs font-bold ${colors.prize}`}>{ev.prize}</span>
                    </div>
                    <h3 className="mb-1.5 font-display text-base font-bold uppercase tracking-wide text-white group-hover:text-gold transition-colors duration-300">
                      {ev.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-white/40">{ev.desc}</p>
                  </div>
                </m.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
