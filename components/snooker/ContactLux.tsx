'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import { MapPin, Phone, Clock, Instagram, MessageCircle, ChevronRight } from 'lucide-react'
import { SITE, LINKS } from '@/lib/site'

const INFO = [
  {
    icon: MapPin,
    label: 'Address',
    value: SITE.streetAddress,
    sub: `${SITE.city}, ${SITE.region} — ${SITE.postalCode}`,
    href: LINKS.maps,
    color: 'text-gold',
    hoverColor: 'hover:text-gold',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: SITE.phonePrimaryDisplay,
    sub: SITE.phoneSecondaryDisplay,
    href: LINKS.phonePrimary,
    color: 'text-emerald-light',
    hoverColor: 'hover:text-emerald-light',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Open Daily',
    sub: 'Morning to Late Night',
    href: null,
    color: 'text-blue-400',
    hoverColor: '',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@star_snooker__academy',
    sub: 'Follow for updates & events',
    href: LINKS.instagram,
    color: 'text-pink-400',
    hoverColor: 'hover:text-pink-400',
  },
] as const

export function ContactLux() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = `Hi! My name is ${name}. ${message || 'I want to inquire about booking a table.'} (Phone: ${phone})`
    window.open(`https://wa.me/919601818268?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <section id="contact" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ink to-ink-2" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-[500px] w-[500px] rounded-full bg-gold/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-content px-5">
        {/* Header */}
        <div className="mb-16">
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-label mb-5"
          >
            Find Us
          </m.div>
          <m.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2rem,5vw,3.8rem)] font-bold uppercase leading-[0.9] text-white"
          >
            Visit &<br />
            <span className="gold-text">Connect</span>
          </m.h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* LEFT — Info cards */}
          <div>
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {INFO.map((item, i) => {
                const Icon = item.icon
                const content = (
                  <m.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`group relative flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-400 hover:border-white/15 hover:-translate-y-0.5 ${item.href ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${item.color}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="mb-0.5 font-display text-[0.6rem] uppercase tracking-widest text-white/30">
                        {item.label}
                      </p>
                      <p className={`font-display text-sm font-semibold text-white transition-colors duration-300 ${item.hoverColor}`}>
                        {item.value}
                      </p>
                      <p className="text-xs text-white/40">{item.sub}</p>
                    </div>
                    {item.href && (
                      <ChevronRight
                        size={12}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/50 transition-colors"
                      />
                    )}
                  </m.div>
                )

                return item.href ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                )
              })}
            </div>

            {/* Map button */}
            <m.a
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.5 }}
              href={LINKS.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-emerald/25 bg-emerald/8 p-5 transition-all duration-400 hover:border-emerald/40 hover:bg-emerald/12 group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald/20 text-2xl">
                🗺️
              </div>
              <div className="flex-1">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-white">
                  Open in Google Maps
                </p>
                <p className="text-xs text-white/40">
                  4th Floor, Vraj Prime Complex, Iskcon Mandir Road
                </p>
              </div>
              <ChevronRight size={14} className="text-emerald-light/50 group-hover:text-emerald-light transition-colors" />
            </m.a>
          </div>

          {/* RIGHT — Contact form */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="gold-border rounded-2xl overflow-hidden luxury-glass">
              {/* Form header */}
              <div className="border-b border-white/[0.06] bg-gradient-to-r from-gold/8 to-transparent px-6 py-5">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-gold" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white">
                    Send a Message
                  </h3>
                </div>
                <p className="mt-1 text-xs text-white/40">We'll respond on WhatsApp instantly</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block font-display text-[0.62rem] uppercase tracking-widest text-white/40">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-gold/40 focus:bg-gold/[0.04]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[0.62rem] uppercase tracking-widest text-white/40">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 ..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-gold/40 focus:bg-gold/[0.04]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[0.62rem] uppercase tracking-widest text-white/40">
                    Message (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Table booking, event inquiry, membership..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-gold/40 focus:bg-gold/[0.04]"
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-xl py-3.5 font-display text-sm font-bold uppercase tracking-widest text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(212,175,55,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold-deep via-gold to-gold-light" />
                  <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-gold-light via-gold to-gold-deep transition-transform duration-500 group-hover:translate-x-0" />
                  <span className="relative flex items-center justify-center gap-2">
                    <MessageCircle size={14} />
                    Send via WhatsApp
                  </span>
                </button>
              </form>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  )
}
