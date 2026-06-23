import { ArrowRight, ListChecks } from 'lucide-react'
import { HERO_STATS, LINKS, SITE } from '@/lib/site'
import { Counter } from '@/components/site/Counter'
import { WhatsAppIcon } from '@/components/site/icons'
import { Reveal } from '@/components/site/motion'
import { Logo } from './Logo'

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 pb-16 pt-24 sm:px-6">
      {/* ── Background: black with gold/red glow + felt-green base sweep ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 55% at 50% 6%, rgba(242,176,30,0.18), transparent 60%), radial-gradient(ellipse 95% 55% at 50% 102%, rgba(31,138,76,0.30), transparent 62%), radial-gradient(ellipse 60% 40% at 50% 60%, rgba(224,31,38,0.14), transparent 65%), linear-gradient(180deg,#0a0a0b 0%,#0c0c0e 60%,#0a0a0b 100%)',
        }}
      />
      {/* Felt dot texture, faint */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      {/* Pulsing glow orbs */}
      <div className="pointer-events-none absolute left-[-8%] top-[12%] h-64 w-64 rounded-full bg-gold/15 blur-[80px] motion-safe:animate-glow sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute bottom-[8%] right-[-8%] h-72 w-72 rounded-full bg-red/15 blur-[90px] motion-safe:animate-glow sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink" />

      {/* ── Content ── */}
      <Reveal className="relative z-[2] mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <div className="motion-safe:animate-float">
          <Logo size={150} glow className="h-auto w-[120px] sm:w-[150px]" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-felt motion-safe:animate-pulse" style={{ background: '#37d07a' }} />
          <span className="text-[0.64rem] font-bold uppercase tracking-[0.2em] text-gold sm:text-[0.7rem]">{SITE.hours}</span>
        </div>

        <h1 className="mt-5 font-display text-[clamp(2.1rem,9vw,4.6rem)] font-bold uppercase leading-[0.95] tracking-tight" style={{ filter: 'drop-shadow(0 3px 14px rgba(0,0,0,0.6))' }}>
          <span className="text-red">Star</span> <span className="gold-text">Snooker</span>
          <br />
          <span className="text-white">Academy</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[clamp(0.98rem,2.2vw,1.15rem)] leading-relaxed text-white/65">
          {SITE.city}&apos;s home for snooker, pool, carrom, table tennis &amp; chess — championship tables, cool vibe, chilled canteen.
        </p>

        {/* One primary CTA + subordinate secondary */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red px-7 py-3.5 font-display text-[0.92rem] font-bold uppercase tracking-wider text-white shadow-[0_0_26px_rgba(224,31,38,0.5)] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            <WhatsAppIcon size={18} /> Book a Table
          </a>
          <a
            href="#pricing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gold/40 px-7 py-3.5 font-display text-[0.92rem] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 sm:w-auto"
          >
            <ListChecks size={18} /> View Pricing <ArrowRight size={15} />
          </a>
        </div>

        {/* Stats */}
        <dl className="mt-11 flex items-center divide-x divide-white/12">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="px-5 text-center first:pl-0 last:pr-0 sm:px-7">
              <dd className="font-display text-[1.7rem] font-bold leading-none text-white sm:text-[2rem]">
                <Counter target={s.value} prefix={s.prefix} suffix={s.suffix} />
              </dd>
              <dt className="mt-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-white/45">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="absolute bottom-5 left-1/2 z-[2] -translate-x-1/2 text-center text-white/30">
        <div className="mx-auto mb-1.5 h-8 w-px bg-gradient-to-b from-gold to-transparent" />
        <span className="text-[0.55rem] uppercase tracking-[0.3em]">Scroll</span>
      </div>
    </section>
  )
}
