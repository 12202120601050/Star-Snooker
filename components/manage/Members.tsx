'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { api } from '@/lib/api'
import { rupee } from '@/lib/manage'

type Member = { _id: string; name: string; phone: string; loyaltyPoints?: number; outstandingBalance?: number; totalSessions?: number }

export function Members() {
  const [members, setMembers] = useState<Member[]>([])
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const ctrl = new AbortController()
    api
      .get('/customers', { signal: ctrl.signal })
      .then((r) => { setMembers(Array.isArray(r.data) ? r.data : []); setState('ok') })
      .catch(() => setState('error'))
    return () => ctrl.abort()
  }, [])

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Users size={18} className="text-gold" />
        <h3 className="font-display text-[0.95rem] font-bold uppercase tracking-wider text-white">Members</h3>
        <span className="ml-auto text-[0.72rem] text-white/40">{members.length} total</span>
      </div>

      {state === 'loading' && <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">Loading…</p>}
      {state === 'error' && (
        <p className="rounded-xl border border-red/20 bg-red/5 px-4 py-8 text-center text-[0.82rem] text-white/50">
          Couldn&apos;t reach the backend. Members appear here once the server &amp; database are live.
        </p>
      )}
      {state === 'ok' && members.length === 0 && (
        <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No members yet.</p>
      )}
      {state === 'ok' && members.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-[0.64rem] font-bold uppercase tracking-wider text-white/50 sm:px-5">
            <span>Member</span>
            <span className="w-20 text-center">Points</span>
            <span className="w-24 text-right">Balance</span>
          </div>
          {members.map((m) => (
            <div key={m._id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <div className="truncate text-[0.9rem] font-medium text-white">{m.name}</div>
                <div className="text-[0.72rem] text-white/40">{m.phone}</div>
              </div>
              <span className="w-20 text-center font-display text-[0.95rem] font-bold tabular-nums text-gold">{m.loyaltyPoints ?? 0}</span>
              <span className={`w-24 text-right font-display text-[0.92rem] font-semibold tabular-nums ${m.outstandingBalance ? 'text-red-light' : 'text-white/40'}`}>
                {rupee(m.outstandingBalance ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
