import { Target, CircleDot, Grid2x2, Disc3, Crown, Zap, type LucideIcon } from 'lucide-react'
import { GAMES, bookUrl, type Game } from '@/lib/site'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/site/motion'

const ICONS: Record<Game['icon'], LucideIcon> = {
  snooker: Target,
  pool: CircleDot,
  carrom: Grid2x2,
  tabletennis: Disc3,
  chess: Crown,
  zapminton: Zap,
}

export function Games() {
  return (
    <section id="games" aria-labelledby="games-heading" className="relative overflow-hidden bg-ink px-6 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="mx-auto max-w-content">
        <div className="mb-12 text-center">
          <SectionHeading
            id="games-heading"
            eyebrow="What We Offer"
            title={
              <>
                Pick Your <span className="gold-text">Game</span>
              </>
            }
            subtitle="Six ways to play under one roof in Vallabh Vidyanagar — from championship snooker to a quick game of chess."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g, i) => {
            const Icon = ICONS[g.icon]
            return (
              <Reveal key={g.name} delay={(i % 3) * 0.08}>
                <article className="gold-border group relative h-full overflow-hidden rounded-2xl bg-white/[0.02] p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold transition-transform group-hover:scale-110">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-[1.15rem] font-bold uppercase tracking-wide text-white">{g.name}</h3>
                  <p className="mt-1 text-[0.85rem] text-white/45">{g.sub}</p>

                  <div className="mt-5 flex items-end gap-4 border-t border-white/8 pt-4">
                    {g.frame !== null && (
                      <div>
                        <div className="font-display text-[1.3rem] font-bold leading-none text-white">₹{g.frame}</div>
                        <div className="text-[0.62rem] uppercase tracking-wider text-white/35">per frame</div>
                      </div>
                    )}
                    {g.hour !== null && (
                      <div>
                        <div className="font-display text-[1.3rem] font-bold leading-none text-gold">₹{g.hour}</div>
                        <div className="text-[0.62rem] uppercase tracking-wider text-white/35">per hour</div>
                      </div>
                    )}
                  </div>

                  <a
                    href={bookUrl(g.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block rounded-md border border-white/15 bg-white/5 py-2.5 text-center font-display text-[0.72rem] font-bold uppercase tracking-wider text-white transition-colors hover:border-red hover:bg-red/15"
                  >
                    Book {g.name}
                  </a>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
