'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'

const GALLERY = [
  {
    title: 'Championship Hall',
    sub: 'Main arena with full-size snooker tables',
    gradient: 'from-emerald-deep/80 via-emerald/40 to-emerald-mid/20',
    accent: '#0d5c2e',
    rows: 2,
    icon: '🎱',
  },
  {
    title: 'Precision Lighting',
    sub: 'Pro-grade overhead illumination',
    gradient: 'from-gold-deep/50 via-gold/25 to-transparent',
    accent: '#d4af37',
    rows: 1,
    icon: '💡',
  },
  {
    title: 'Pool Tables',
    sub: '4 immaculate pool tables',
    gradient: 'from-blue-900/60 via-blue-800/30 to-transparent',
    accent: '#1A52A8',
    rows: 1,
    icon: '🎳',
  },
  {
    title: 'The Lounge',
    sub: 'Comfortable seating between sessions',
    gradient: 'from-ink-4/90 via-ink-3/60 to-ink-2/20',
    accent: '#ffffff',
    rows: 1,
    icon: '☕',
  },
  {
    title: 'Tournament Night',
    sub: 'Monthly competitions & events',
    gradient: 'from-red-900/60 via-red-800/30 to-transparent',
    accent: '#e01f26',
    rows: 2,
    icon: '🏆',
  },
  {
    title: 'Premium Cues',
    sub: 'Professionally maintained equipment',
    gradient: 'from-amber-900/50 via-amber-800/25 to-transparent',
    accent: '#f59e0b',
    rows: 1,
    icon: '🎯',
  },
  {
    title: 'Mini Snooker',
    sub: '3 tables for quick frames',
    gradient: 'from-emerald-mid/50 via-emerald/20 to-transparent',
    accent: '#1a8a4c',
    rows: 1,
    icon: '⚽',
  },
  {
    title: 'Carrom & Chess',
    sub: 'Classic Indian board games',
    gradient: 'from-purple-900/50 via-purple-800/25 to-transparent',
    accent: '#9333ea',
    rows: 1,
    icon: '♟',
  },
  {
    title: 'VIP Corner',
    sub: 'Private space for members',
    gradient: 'from-gold-deep/60 via-gold/20 to-transparent',
    accent: '#d4af37',
    rows: 1,
    icon: '⭐',
  },
]

type GalleryItem = typeof GALLERY[number]

function GalleryCard({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="masonry-item"
    >
      <m.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="group relative cursor-pointer overflow-hidden rounded-xl"
        onClick={onClick}
        style={{ height: item.rows === 2 ? '380px' : '180px' }}
      >
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
        <div className="absolute inset-0 bg-ink/40" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span style={{ fontSize: item.rows === 2 ? '6rem' : '3rem' }}>{item.icon}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-400">
          <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              {item.title}
            </h4>
            <p className="text-xs text-white/50">{item.sub}</p>
          </div>
        </div>

        {/* Zoom icon */}
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ZoomIn size={12} className="text-white" />
        </div>

        {/* Border accent */}
        <div
          className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/15 transition-all duration-400"
          style={{ boxShadow: `inset 0 0 0 0px ${item.accent}` }}
        />

        {/* Bottom label (always visible) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-ink/80 to-transparent">
          <p
            className="font-display text-[0.62rem] font-semibold uppercase tracking-wider"
            style={{ color: item.accent }}
          >
            {item.title}
          </p>
        </div>
      </m.div>
    </m.div>
  )
}

export function GalleryLux() {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  return (
    <section id="gallery" className="relative py-28 overflow-hidden">
      <div className="mx-auto max-w-content px-5">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label mb-5"
            >
              Club Gallery
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2rem,5vw,3.8rem)] font-bold uppercase leading-[0.9] text-white"
            >
              Inside the<br />
              <span className="gold-text">Academy</span>
            </m.h2>
          </div>
          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-[240px] text-sm text-white/40"
          >
            A glimpse into the world-class environment we've crafted for you.
          </m.p>
        </div>

        {/* Masonry grid */}
        <div className="masonry-grid">
          {GALLERY.map((item, i) => (
            <GalleryCard
              key={item.title}
              item={item}
              index={i}
              onClick={() => setLightbox(item)}
            />
          ))}
        </div>

        {/* CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/star_snooker__academy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-8 py-3.5 font-display text-sm font-semibold uppercase tracking-widest text-white/60 transition-all duration-300 hover:border-gold/30 hover:text-gold"
          >
            View More on Instagram
          </a>
        </m.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/95 backdrop-blur-xl"
            onClick={() => setLightbox(null)}
          >
            <m.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-xl w-full overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`relative flex h-72 items-center justify-center bg-gradient-to-br ${lightbox.gradient}`}
              >
                <span style={{ fontSize: '8rem', opacity: 0.3 }}>{lightbox.icon}</span>
                <button
                  onClick={() => setLightbox(null)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="border border-white/8 rounded-b-2xl bg-ink-2 p-6">
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
                  {lightbox.title}
                </h3>
                <p className="mt-1 text-sm text-white/45">{lightbox.sub}</p>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
