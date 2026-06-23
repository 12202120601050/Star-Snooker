'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, Instagram } from 'lucide-react'
import { LINKS, NAV_ITEMS, SITE } from '@/lib/site'
import { WhatsAppIcon } from '@/components/site/icons'
import { Logo } from './Logo'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
        scrolled || open ? 'border-b border-gold/20 bg-ink/95 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-content items-center justify-between px-5 py-3" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
          <Logo size={34} />
          <span className="font-display text-[0.95rem] font-bold uppercase leading-none tracking-wide">
            <span className="text-red">Star</span> <span className="text-gold">Snooker</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[0.8rem] font-semibold uppercase tracking-wider text-white/55 transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={LINKS.phonePrimary}
            aria-label={`Call ${SITE.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold transition-transform hover:-translate-y-0.5"
          >
            <Phone size={15} />
          </a>
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${SITE.name} on Instagram`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red/30 bg-red/10 text-red-light transition-transform hover:-translate-y-0.5"
          >
            <Instagram size={15} />
          </a>
          <Link
            href="/login"
            className="hidden rounded-md border border-white/15 px-3.5 py-2 font-display text-[0.78rem] font-bold uppercase tracking-wider text-white/70 transition-colors hover:border-gold hover:text-gold md:inline-block"
          >
            Login
          </Link>
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md bg-red px-4 py-2 font-display text-[0.78rem] font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(224,31,38,0.45)] transition-transform hover:-translate-y-0.5 md:inline-block"
          >
            Book Now
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-5 pb-5 md:hidden">
          <div className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3.5 font-display text-sm font-semibold uppercase tracking-wider text-white/70 hover:text-gold"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md border border-white/15 py-2.5 text-center font-display text-sm font-bold uppercase tracking-wider text-white/70"
            >
              Login
            </Link>
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red py-2.5 font-display text-sm font-bold uppercase tracking-wider text-white"
            >
              <WhatsAppIcon size={15} /> Book
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
