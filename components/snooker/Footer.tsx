import { Phone, MapPin, Instagram } from 'lucide-react'
import { LINKS, SITE } from '@/lib/site'
import { WhatsAppIcon } from '@/components/site/icons'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-gold/15 bg-[#070707] px-6 py-10 text-center">
      <div className="mb-3 flex items-center justify-center gap-2.5">
        <Logo size={30} />
        <span className="font-display text-[0.9rem] font-bold uppercase tracking-wide">
          <span className="text-red">Star</span> <span className="text-gold">Snooker</span> <span className="text-white">Academy</span>
        </span>
      </div>
      <nav aria-label="Footer" className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-[#37d07a] hover:opacity-80">
          <WhatsAppIcon size={14} /> WhatsApp
        </a>
        <a href={LINKS.phonePrimary} className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-gold hover:opacity-80">
          <Phone size={13} /> {SITE.phonePrimaryDisplay}
        </a>
        <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-red-light hover:opacity-80">
          <Instagram size={13} /> Instagram
        </a>
        <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-white/60 hover:opacity-80">
          <MapPin size={13} /> Location
        </a>
      </nav>
      <p className="text-[0.75rem] text-white/25">
        © 2025 {SITE.name} · Vraj Prime Complex, {SITE.city}, Anand · All rights reserved
      </p>
    </footer>
  )
}
