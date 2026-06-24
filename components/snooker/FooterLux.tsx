'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, Instagram, MapPin, MessageCircle } from 'lucide-react'
import { LINKS, SITE } from '@/lib/site'
import { Logo } from './Logo'

const SECTIONS = [
  {
    title: 'Explore',
    links: [
      { label: 'Our Tables', href: '#tables' },
      { label: 'Amenities', href: '#amenities' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'Tournaments', href: '#tournament' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Member Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'Staff Portal', href: '/login' },
    ],
  },
] as const

export function FooterLux() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.05] bg-ink">
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="mx-auto max-w-content px-5">
        {/* Main footer content */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <Logo size={36} />
              <div className="leading-none">
                <span className="block font-display text-base font-bold uppercase tracking-widest">
                  <span className="text-red">Star</span>{' '}
                  <span className="text-gold">Snooker</span>
                </span>
                <span className="block font-display text-[0.55rem] uppercase tracking-[0.25em] text-white/30">
                  Academy
                </span>
              </div>
            </Link>

            <p className="mb-6 max-w-[240px] text-sm leading-relaxed text-white/40">
              {SITE.tagline}. Where every visit is an experience and every frame is a memory.
            </p>

            {/* Social icons */}
            <div className="mb-6 flex gap-3">
              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all duration-300 hover:border-pink-400/30 hover:text-pink-400"
              >
                <Instagram size={15} />
              </a>
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all duration-300 hover:border-green-400/30 hover:text-green-400"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href={LINKS.phonePrimary}
                aria-label="Phone"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all duration-300 hover:border-gold/30 hover:text-gold"
              >
                <Phone size={15} />
              </a>
            </div>

            {/* Address */}
            <a
              href={LINKS.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-xs text-white/30 transition-colors hover:text-gold"
            >
              <MapPin size={12} className="mt-0.5 shrink-0" />
              <span>
                {SITE.streetAddress}
                <br />
                {SITE.city}, {SITE.region}
              </span>
            </a>
          </div>

          {/* Nav columns */}
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="mb-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/30">
                {s.title}
              </h4>
              <ul className="space-y-3">
                {s.links.map((link) => (
                  <li key={link.label}>
                    {'href' in link && link.href.startsWith('#') ? (
                      <a
                        href={link.href}
                        className="text-sm text-white/50 transition-colors duration-300 hover:text-gold"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 transition-colors duration-300 hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h4 className="mb-5 font-display text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/30">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href={LINKS.phonePrimary}
                className="block text-sm text-white/50 transition-colors hover:text-gold"
              >
                {SITE.phonePrimaryDisplay}
              </a>
              <a
                href={`tel:${SITE.phoneSecondaryRaw}`}
                className="block text-sm text-white/50 transition-colors hover:text-gold"
              >
                {SITE.phoneSecondaryDisplay}
              </a>
              <div className="pt-2">
                <div className="mb-1 font-display text-[0.6rem] uppercase tracking-widest text-white/25">
                  Hours
                </div>
                <p className="text-xs text-white/40">{SITE.hours}</p>
              </div>
              <div className="pt-1">
                <a
                  href={LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg border border-gold/25 bg-gold/8 px-4 py-2 font-display text-[0.65rem] font-bold uppercase tracking-widest text-gold transition-all duration-300 hover:bg-gold hover:text-ink"
                >
                  Book on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.04] py-6 sm:flex-row">
          <p className="text-[0.65rem] text-white/25">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <div className="live-dot h-1.5 w-1.5" />
            <span className="text-[0.62rem] uppercase tracking-widest text-white/20">
              Open Daily · Walk-ins Welcome
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
