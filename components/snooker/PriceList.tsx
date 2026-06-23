import { LINKS, PRICE_ROWS } from '@/lib/site'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/site/motion'
import { WhatsAppIcon } from '@/components/site/icons'

export function PriceList() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden px-6 py-24"
      style={{ background: 'linear-gradient(180deg,#0a0a0b 0%,#0c0d0c 100%)' }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <SectionHeading
            id="pricing-heading"
            eyebrow="Price List"
            title={
              <>
                Simple, <span className="gold-text">Honest</span> Rates
              </>
            }
            subtitle="A frame is half an hour. No memberships, no hidden charges — pay for what you play."
          />
        </div>

        <Reveal>
          <div className="gold-border overflow-hidden rounded-2xl bg-white/[0.02]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-gold/20 bg-gold/5 px-5 py-3.5 sm:px-7">
              <span className="font-display text-[0.72rem] font-bold uppercase tracking-wider text-gold">Game</span>
              <span className="w-20 text-center font-display text-[0.66rem] font-bold uppercase tracking-wider text-white/55 sm:w-24">Frame</span>
              <span className="w-20 text-center font-display text-[0.66rem] font-bold uppercase tracking-wider text-white/55 sm:w-24">1 Hour</span>
            </div>
            {/* Rows */}
            {PRICE_ROWS.map((row, i) => (
              <div
                key={row.name}
                className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3.5 sm:px-7 ${i % 2 ? 'bg-white/[0.015]' : ''}`}
              >
                <span className="text-[0.92rem] font-medium text-white/90">{row.name}</span>
                <span className="w-20 text-center font-display text-[1.05rem] font-semibold tabular-nums text-white sm:w-24">
                  {row.frame !== null ? `₹${row.frame}` : <span className="text-white/25">—</span>}
                </span>
                <span className="w-20 text-center font-display text-[1.05rem] font-bold tabular-nums text-gold sm:w-24">₹{row.hour}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8 text-center">
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-lg bg-red px-7 py-3.5 font-display text-[0.85rem] font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(224,31,38,0.45)] transition-transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon size={18} /> Book Your Slot
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
