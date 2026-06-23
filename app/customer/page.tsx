'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Trophy, Clock, Phone } from 'lucide-react'
import { Guard } from '@/components/auth/Guard'
import { useAuth } from '@/store/auth'
import { api } from '@/lib/api'
import { Logo } from '@/components/snooker/Logo'
import { LINKS } from '@/lib/site'

function CustomerHome() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [points, setPoints] = useState<number | null>(null)
  const [active, setActive] = useState<any>(null)

  useEffect(() => {
    // Loyalty + active table — best effort; fail silently if backend is offline.
    api.get('/auth/me').then((r) => setPoints(r.data?.loyaltyPoints ?? null)).catch(() => {})
    api.get('/sessions/my').then((r) => setActive(r.data)).catch(() => {})
  }, [])

  const doLogout = () => { logout(); router.replace('/login') }

  return (
    <div className="min-h-dvh bg-ink px-6 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display text-[0.9rem] font-bold uppercase tracking-wide">
              <span className="text-red">Star</span> <span className="text-gold">Snooker</span>
            </span>
          </div>
          <button onClick={doLogout} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 hover:border-red hover:text-red-light">
            <LogOut size={16} />
          </button>
        </div>

        <h1 className="mt-8 font-display text-2xl font-bold text-white">Hi {user?.name?.split(' ')[0] || 'there'} 👋</h1>
        <p className="mt-1 text-[0.85rem] text-white/45">Welcome back to the club.</p>

        {/* Loyalty */}
        <div className="gold-border mt-6 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent p-6">
          <div className="flex items-center gap-2 text-gold">
            <Trophy size={18} />
            <span className="font-display text-[0.8rem] font-bold uppercase tracking-wider">Loyalty Points</span>
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-white">{points ?? '—'}</div>
          <p className="mt-1 text-[0.78rem] text-white/45">Earn points every hour you play.</p>
        </div>

        {/* Active table */}
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 text-white/70">
            <Clock size={17} />
            <span className="font-display text-[0.8rem] font-bold uppercase tracking-wider">Active Table</span>
          </div>
          {active ? (
            <div className="mt-2">
              <div className="font-display text-lg font-bold text-gold">{active.tableName}</div>
              <div className="text-[0.78rem] text-white/45">{active.mode === 'frames' ? 'Frames · loser pays' : 'Running on timer'}</div>
            </div>
          ) : (
            <p className="mt-2 text-[0.82rem] text-white/40">No active table right now.</p>
          )}
        </div>

        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red px-6 py-3.5 font-display text-[0.82rem] font-bold uppercase tracking-wider text-white"
        >
          <Phone size={16} /> Book a Table
        </a>
      </div>
    </div>
  )
}

export default function CustomerPage() {
  return (
    <Guard roles={['customer']}>
      <CustomerHome />
    </Guard>
  )
}
