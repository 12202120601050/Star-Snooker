'use client'

import { useState, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Rahul Patel',
    role: 'Regular Member',
    initials: 'RP',
    rating: 5,
    text: 'Hands down the best snooker club in Gujarat. The tables are impeccably maintained and the atmosphere is top-notch. I\'ve been a regular for over 2 years and the experience just keeps getting better.',
    color: 'from-emerald-deep to-emerald-mid',
  },
  {
    name: 'Priya Shah',
    role: 'Elite Member',
    initials: 'PS',
    rating: 5,
    text: 'As a serious player, the quality of the tables matters enormously. Star Snooker\'s championship tables are genuinely tournament-standard. The coaching sessions helped take my game to a whole new level.',
    color: 'from-gold-deep to-gold',
  },
  {
    name: 'Arjun Mehta',
    role: 'Walk-In Customer',
    initials: 'AM',
    rating: 5,
    text: 'Visited on a friend\'s recommendation and was absolutely blown away. The lighting, the cues, the cloth quality — everything is premium. The staff are friendly and knowledgeable. Will definitely be back.',
    color: 'from-blue-900 to-blue-700',
  },
  {
    name: 'Vishal Desai',
    role: 'Tournament Finalist',
    initials: 'VD',
    rating: 5,
    text: 'Competed in the Star Open and was impressed by the organisation. The tournament format was professional, the tables played perfectly, and the prize distribution was fair and fast. Highly recommend.',
    color: 'from-red-900 to-red-700',
  },
  {
    name: 'Kavya Joshi',
    role: 'Regular Member',
    initials: 'KJ',
    rating: 5,
    text: 'Finally a snooker club that women feel welcome in! The staff are respectful and the atmosphere is inclusive. I come here at least twice a week for the pool tables and the canteen chai is amazing!',
    color: 'from-purple-900 to-purple-700',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? 'text-gold fill-gold' : 'text-white/20'}
        />
      ))}
    </div>
  )
}

export function Reviews() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((c) => (c + 1) % REVIEWS.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + REVIEWS.length) % REVIEWS.length)
  }, [])

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  const review = REVIEWS[current]

  return (
    <section id="reviews" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ink-2 to-ink" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-emerald/5 blur-[100px]" />

      <div className="relative mx-auto max-w-content px-5">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label mb-5"
            >
              Testimonials
            </m.div>
            <m.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2rem,5vw,3.8rem)] font-bold uppercase leading-[0.9] text-white"
            >
              Loved by<br />
              <span className="gold-text">Players</span>
            </m.h2>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white/60 transition-all duration-300 hover:border-gold/30 hover:text-gold"
              aria-label="Previous review"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white/60 transition-all duration-300 hover:border-gold/30 hover:text-gold"
              aria-label="Next review"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main review */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-8 md:p-10 min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <m.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {/* Quote mark */}
                <div className="mb-5 font-display text-6xl font-bold leading-none text-gold/20">"</div>

                <p className="mb-8 text-base leading-relaxed text-white/65 md:text-lg md:leading-relaxed">
                  {review.text}
                </p>

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${review.color}`}>
                    <span className="font-display text-sm font-bold text-white">{review.initials}</span>
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      {review.name}
                    </div>
                    <div className="mt-0.5 text-xs text-white/40">{review.role}</div>
                  </div>
                  <div className="ml-auto">
                    <Stars count={review.rating} />
                  </div>
                </div>
              </m.div>
            </AnimatePresence>

            {/* Bottom gold accent */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </div>

          {/* Mini reviews sidebar */}
          <div className="flex flex-col gap-3">
            {REVIEWS.filter((_, i) => i !== current).slice(0, 3).map((r, i) => (
              <m.button
                key={r.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                onClick={() => {
                  setDirection(1)
                  setCurrent(REVIEWS.indexOf(r))
                }}
                className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all duration-300 hover:border-gold/20 hover:bg-gold/[0.03]"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${r.color}`}>
                  <span className="font-display text-[0.6rem] font-bold text-white">{r.initials}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xs font-bold uppercase tracking-wider text-white/70 group-hover:text-gold transition-colors">
                    {r.name}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[0.65rem] text-white/35">{r.text}</p>
                </div>
              </m.button>
            ))}

            {/* Rating summary */}
            <div className="rounded-xl border border-gold/15 bg-gold/[0.05] p-4 text-center">
              <div className="font-display text-3xl font-bold gold-text">5.0</div>
              <div className="my-1.5 flex justify-center">
                <Stars count={5} />
              </div>
              <div className="font-display text-[0.6rem] uppercase tracking-widest text-white/40">
                Based on Google Reviews
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-gold' : 'w-1.5 bg-white/20'
              }`}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
