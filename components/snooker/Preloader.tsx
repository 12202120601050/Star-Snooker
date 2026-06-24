'use client'

import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'

export function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ink"
        >
          {/* Outer ring */}
          <div className="relative flex items-center justify-center">
            <m.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="w-20 h-20 rounded-full border border-gold/20"
            />
            {/* Spinning arc */}
            <m.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute w-20 h-20 rounded-full"
              style={{
                border: '1.5px solid transparent',
                borderTopColor: '#d4af37',
                borderRightColor: 'rgba(212,175,55,0.3)',
              }}
            />
            {/* Center dot */}
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'backOut' }}
              className="absolute w-3 h-3 rounded-full bg-gold"
              style={{ boxShadow: '0 0 16px rgba(212,175,55,0.6)' }}
            />
          </div>

          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 font-display text-xs font-semibold uppercase tracking-[0.4em] text-gold/60"
          >
            Star Snooker
          </m.p>
        </m.div>
      )}
    </AnimatePresence>
  )
}
