'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Clock, Phone, User as UserIcon, MapPin } from 'lucide-react'
import { Guard } from '@/components/auth/Guard'
import { useAuth } from '@/store/auth'
import { api } from '@/lib/api'
import { Logo } from '@/components/snooker/Logo'
import { LINKS, SITE } from '@/lib/site'

function CustomerHome() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [active, setActive] = useState<any>(null)

  useEffect(() => {
    // Active table — best effort; fail silently if backend is offline.
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
        <p className="mt-1 text-[0.85rem] text-white/45">Welcome to the club.</p>

        {/* Member */}
        <div className="gold-border mt-6 rounded-2xl bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 text-gold">
            <UserIcon size={18} />
            <span className="font-display text-[0.8rem] font-bold uppercase tracking-wider">Member</span>
          </div>
          <div className="mt-2 font-display text-lg font-bold text-white">{user?.name}</div>
          <div className="text-[0.8rem] text-white/45">{user?.phone}</div>
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

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-red px-4 py-3.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-white"
          >
            <Phone size={15} /> Book
          </a>
          <a
            href={LINKS.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-gold/40 px-4 py-3.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-gold"
          >
            <MapPin size={15} /> Visit
          </a>
        </div>
        <p className="mt-4 text-center text-[0.72rem] text-white/30">{SITE.hours}</p>
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
