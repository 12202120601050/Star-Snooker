import { MapPin, Clock, Phone, ExternalLink, Instagram } from 'lucide-react'
import { LINKS, SITE } from '@/lib/site'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/site/motion'
import { WhatsAppIcon } from '@/components/site/icons'

export function Visit() {
  return (
    <section
      id="visit"
      aria-labelledby="visit-heading"
      className="relative overflow-hidden px-6 py-24"
      style={{ background: 'linear-gradient(180deg,#0c0d0c 0%,#0a0a0b 100%)' }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <SectionHeading
            id="visit-heading"
            eyebrow="Find Us"
            title={
              <>
                Visit the <span className="gold-text">Club</span>
              </>
            }
          />
        </div>

        <div className="mb-12 grid gap-5 sm:grid-cols-3">
          <Reveal>
            <div className="h-full rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <MapPin size={18} />
              </div>
              <div className="mb-1 font-display text-[0.88rem] font-bold uppercase tracking-wide text-white">Address</div>
              <div className="text-[0.82rem] leading-relaxed text-white/45">
                {SITE.streetAddress}, {SITE.city}, {SITE.region} {SITE.postalCode}
              </div>
              <a
                href={LINKS.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/10 px-3.5 py-2 text-[0.76rem] font-semibold text-gold transition-colors hover:bg-gold/20"
              >
                <ExternalLink size={13} /> Open in Maps
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <Phone size={18} />
              </div>
              <div className="mb-1 font-display text-[0.88rem] font-bold uppercase tracking-wide text-white">Call / WhatsApp</div>
              <div className="flex flex-col gap-1.5 text-[0.85rem] text-white/60">
                <a href={LINKS.phonePrimary} className="transition-colors hover:text-gold">{SITE.phonePrimaryDisplay}</a>
                <a href={LINKS.phoneSecondary} className="transition-colors hover:text-gold">{SITE.phoneSecondaryDisplay}</a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="h-full rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <Clock size={18} />
              </div>
              <div className="mb-1 font-display text-[0.88rem] font-bold uppercase tracking-wide text-white">Hours</div>
              <div className="text-[0.82rem] leading-relaxed text-white/45">
                {SITE.hours}
                <br />
                Walk-ins always welcome
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-lg bg-red px-6 py-3.5 font-display text-[0.82rem] font-bold uppercase tracking-wider text-white shadow-[0_0_22px_rgba(224,31,38,0.45)] transition-transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon size={18} /> Book on WhatsApp
            </a>
            <a
              href={LINKS.phonePrimary}
              className="inline-flex items-center gap-2.5 rounded-lg border border-gold/40 bg-gold/10 px-6 py-3.5 font-display text-[0.82rem] font-bold uppercase tracking-wider text-gold transition-transform hover:-translate-y-0.5"
            >
              <Phone size={17} /> Call Us
            </a>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-lg border border-red/40 bg-red/10 px-6 py-3.5 font-display text-[0.82rem] font-bold uppercase tracking-wider text-red-light transition-transform hover:-translate-y-0.5"
            >
              <Instagram size={17} /> Instagram
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
