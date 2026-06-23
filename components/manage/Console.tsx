'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, Coffee, ClipboardCheck, Receipt, Users, LogOut } from 'lucide-react'
import { useStore } from './Provider'
import { Tables } from './Tables'
import { Canteen } from './Canteen'
import { Stock } from './Stock'
import { Members } from './Members'
import { Logo } from '@/components/snooker/Logo'
import { rupee } from '@/lib/manage'
import { useAuth } from '@/store/auth'

function SalesPanel() {
  const { db } = useStore()
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const today = db.sales.filter((s) => s.at >= start.getTime())
  const total = today.reduce((a, s) => a + s.total, 0)
  const play = today.reduce((a, s) => a + s.play, 0)
  const canteen = today.reduce((a, s) => a + s.canteen, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today's Total", value: total, accent: 'text-gold' },
          { label: 'Table Play', value: play, accent: 'text-white' },
          { label: 'Canteen', value: canteen, accent: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="gold-border rounded-2xl bg-white/[0.02] px-4 py-5 text-center">
            <div className={`font-display text-[1.5rem] font-bold ${s.accent}`}>{rupee(s.value)}</div>
            <div className="mt-1 text-[0.6rem] uppercase tracking-wider text-white/40">{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-3 font-display text-[0.85rem] font-bold uppercase tracking-wider text-white/70">Recent Sales</h3>
        {today.length === 0 ? (
          <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No sales yet today.</p>
        ) : (
          <div className="space-y-2">
            {today.slice(0, 30).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 text-[0.82rem]">
                <div>
                  <span className="font-semibold text-white/85">{s.tableName}</span>
                  <span className="ml-2 text-[0.7rem] uppercase tracking-wider text-white/35">{s.note ?? s.mode}</span>
                </div>
                <div className="flex items-center gap-3 text-white/45">
                  <span className="text-[0.7rem]">{new Date(s.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="font-display font-bold text-gold">{rupee(s.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function Console({ admin = false }: { admin?: boolean }) {
  const { db } = useStore()
  const { user, logout } = useAuth()
  const router = useRouter()
  const tabs = [
    { id: 'tables', label: 'Tables', icon: LayoutGrid },
    { id: 'canteen', label: 'Canteen', icon: Coffee },
    { id: 'stock', label: 'Stock', icon: ClipboardCheck },
    { id: 'sales', label: 'Sales', icon: Receipt },
    ...(admin ? [{ id: 'members', label: 'Members', icon: Users } as const] : []),
  ] as const
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('tables')

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const todayTotal = db.sales.filter((s) => s.at >= start.getTime()).reduce((a, s) => a + s.total, 0)

  const doLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="min-h-dvh bg-ink pb-20 text-white">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-display text-[0.9rem] font-bold uppercase tracking-wide">
              <span className="text-red">Star</span> <span className="text-gold">Snooker</span>
              <span className="ml-1 hidden text-white/50 sm:inline">· {admin ? 'Admin' : 'Counter'}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-display text-base font-bold text-gold">{rupee(todayTotal)}</div>
              <div className="text-[0.55rem] uppercase tracking-wider text-white/40">Today</div>
            </div>
            <button onClick={doLogout} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 hover:border-red hover:text-red-light">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-2 pb-2 sm:px-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-display text-[0.72rem] font-bold uppercase tracking-wider transition-colors ${tab === t.id ? 'bg-gold text-ink' : 'text-white/55 hover:text-white'}`}
            >
              <t.icon size={15} /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-6 sm:px-6">
        {user && <p className="mb-4 text-[0.78rem] text-white/40">Signed in as <span className="text-white/70">{user.name}</span> ({user.role})</p>}
        {tab === 'tables' && <Tables />}
        {tab === 'canteen' && <Canteen />}
        {tab === 'stock' && <Stock />}
        {tab === 'sales' && <SalesPanel />}
        {tab === 'members' && <Members />}
      </main>
    </div>
  )
}
