'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Instagram } from 'lucide-react'
import { LINKS, SITE } from '@/lib/site'
import { Logo } from './Logo'

const NAV = [
  { href: '#tables', label: 'Tables' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
] as const

export function NavLux() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
        scrolled || open
          ? 'border-b border-white/[0.06] bg-ink/92 backdrop-blur-2xl'
          : 'bg-gradient-to-b from-ink/70 to-transparent backdrop-blur-sm'
      }`}
    >
      <nav
        className="mx-auto flex max-w-content items-center justify-between px-5 py-4"
        aria-label="Primary"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label={`${SITE.name} — home`}>
          <Logo size={32} />
          <div className="leading-none">
            <span className="block font-display text-[0.85rem] font-bold uppercase tracking-widest">
              <span className="text-red">Star</span>{' '}
              <span className="text-gold">Snooker</span>
            </span>
            <span className="block font-display text-[0.55rem] uppercase tracking-[0.25em] text-white/30">
              Academy
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative font-display text-[0.72rem] font-semibold uppercase tracking-widest text-white/45 transition-colors duration-300 hover:text-gold"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-2.5">
          <a
            href={LINKS.phonePrimary}
            aria-label="Call us"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-gold/25 bg-gold/8 text-gold/80 transition-all duration-300 hover:border-gold/50 hover:bg-gold/15 hover:text-gold sm:flex"
          >
            <Phone size={14} />
          </a>
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-all duration-300 hover:border-white/25 hover:text-white sm:flex"
          >
            <Instagram size={14} />
          </a>
          <Link
            href="/login"
            className="hidden rounded-lg border border-white/12 px-4 py-2 font-display text-[0.72rem] font-semibold uppercase tracking-widest text-white/50 transition-all duration-300 hover:border-gold/30 hover:text-gold md:block"
          >
            Login
          </Link>
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative hidden overflow-hidden rounded-lg px-5 py-2 font-display text-[0.72rem] font-bold uppercase tracking-widest text-ink md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold-deep via-gold to-gold-light transition-all duration-300 group-hover:from-gold group-hover:via-gold-light group-hover:to-gold" />
            <span className="relative">Book Now</span>
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 lg:hidden"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden border-t border-white/[0.06] lg:hidden"
          >
            <div className="px-5 pb-6 pt-2">
              <div className="flex flex-col divide-y divide-white/[0.05]">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-white/60 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-white/12 py-3 text-center font-display text-sm font-semibold uppercase tracking-widest text-white/60"
                >
                  Login
                </Link>
                <a
                  href={LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center rounded-lg bg-gold py-3 font-display text-sm font-bold uppercase tracking-widest text-ink"
                >
                  Book Now
                </a>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
