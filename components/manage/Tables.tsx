'use client'

import { useState } from 'react'
import { Play, Trophy, RotateCcw, Plus, Minus, Check, X, Clock } from 'lucide-react'
import { TABLES, fmtDuration, framesTotals, rupee, timerAmount, type TableConfig } from '@/lib/manage'
import { useStore } from './Provider'

function CanteenPicker({ tableId }: { tableId: string }) {
  const { db, addToCart } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-gold">
        + Canteen
      </button>
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-48 overflow-auto rounded-lg border border-white/10 bg-ink-2 p-1 shadow-xl">
          {db.canteen.map((it) => (
            <button
              key={it.id}
              onClick={() => { addToCart(tableId, it); setOpen(false) }}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[0.8rem] text-white/85 hover:bg-white/5"
            >
              <span>{it.name}</span>
              <span className="text-gold">{rupee(it.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TableCard({ t }: { t: TableConfig }) {
  const { db, now, startTimer, startFrames, addFrameWin, undoFrame, decFromCart, cancelSession, checkout } = useStore()
  const s = db.sessions[t.id]
  const [setup, setSetup] = useState(false)
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [charge, setCharge] = useState(t.frame ?? 0)

  const cartTotal = s ? s.cart.reduce((a, c) => a + c.price * c.qty, 0) : 0

  // ── Idle table ──
  if (!s) {
    return (
      <div className="gold-border rounded-2xl bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[1.05rem] font-bold uppercase tracking-wide text-white">{t.name}</h3>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white/40">Free</span>
        </div>
        <p className="mt-1 text-[0.72rem] text-white/40">
          {t.frame !== null && <>Frame {rupee(t.frame)} · </>}
          {t.hour !== null && <>Hour {rupee(t.hour)}</>}
        </p>

        {!setup ? (
          <div className="mt-4 flex flex-col gap-2">
            {t.hour !== null && (
              <button onClick={() => startTimer(t)} className="flex items-center justify-center gap-2 rounded-md bg-gold px-3 py-2.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-ink hover:opacity-90">
                <Clock size={15} /> Start Timer
              </button>
            )}
            {t.frame !== null && (
              <button onClick={() => setSetup(true)} className="flex items-center justify-center gap-2 rounded-md border border-red/50 bg-red/10 px-3 py-2.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-red-light hover:bg-red/20">
                <Trophy size={15} /> Frames · Loser Pays
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <input value={p1} onChange={(e) => setP1(e.target.value)} placeholder="Player 1 (e.g. Rajan)" className="w-full rounded-md border border-white/12 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            <input value={p2} onChange={(e) => setP2(e.target.value)} placeholder="Player 2 (e.g. Megh)" className="w-full rounded-md border border-white/12 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            <label className="flex items-center justify-between gap-2 text-[0.72rem] text-white/50">
              Frame charge
              <input type="number" value={charge} onChange={(e) => setCharge(Number(e.target.value))} className="w-24 rounded-md border border-white/12 bg-ink px-2 py-1.5 text-right text-sm text-gold outline-none focus:border-gold" />
            </label>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { startFrames(t, [p1.trim() || 'Player 1', p2.trim() || 'Player 2'], charge); setSetup(false); setP1(''); setP2('') }}
                className="flex-1 rounded-md bg-red px-3 py-2 font-display text-[0.74rem] font-bold uppercase tracking-wider text-white hover:opacity-90"
              >
                Start
              </button>
              <button onClick={() => setSetup(false)} className="rounded-md border border-white/15 px-3 py-2 text-[0.74rem] font-semibold text-white/60">Cancel</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Active table ──
  const play = s.mode === 'timer' ? timerAmount(t.hour ?? 0, t.frame ?? 0, now - s.startedAt) : framesTotals(s).total
  const ft = s.mode === 'frames' ? framesTotals(s) : null

  return (
    <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/[0.06] to-transparent p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[1.05rem] font-bold uppercase tracking-wide text-white">{t.name}</h3>
        <span className="rounded-full bg-red/20 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-red-light">Playing</span>
      </div>

      {s.mode === 'timer' ? (
        <div className="mt-3">
          <div className="font-display text-3xl font-bold tabular-nums text-white">{fmtDuration(now - s.startedAt)}</div>
          <div className="text-[0.72rem] text-white/45">Running · {rupee(t.hour ?? 0)}/hr</div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
              <span className="text-sm font-semibold text-white/90">{s.players[i]}</span>
              <div className="flex items-center gap-3">
                <span className="text-[0.7rem] text-white/40">owes</span>
                <span className="font-display text-sm font-bold text-gold">{rupee(ft!.owed[i])}</span>
                <button onClick={() => addFrameWin(t.id, i)} className="rounded-md bg-felt/80 px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-wider text-white hover:opacity-90" style={{ background: '#1f8a4c' }}>
                  Won
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-[0.72rem] text-white/45">
            <span>{ft!.frames} frame{ft!.frames === 1 ? '' : 's'} · loser pays {rupee(s.frameCharge)}</span>
            {ft!.frames > 0 && (
              <button onClick={() => undoFrame(t.id)} className="inline-flex items-center gap-1 text-white/50 hover:text-white">
                <RotateCcw size={12} /> Undo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart */}
      {s.cart.length > 0 && (
        <div className="mt-3 space-y-1 rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
          {s.cart.map((c) => (
            <div key={c.itemId} className="flex items-center justify-between text-[0.78rem] text-white/80">
              <span>{c.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => decFromCart(t.id, c.itemId)} className="text-white/40 hover:text-red-light"><Minus size={13} /></button>
                <span className="w-5 text-center tabular-nums">{c.qty}</span>
                <span className="w-12 text-right text-gold">{rupee(c.price * c.qty)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals + actions */}
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <div>
          <div className="text-[0.62rem] uppercase tracking-wider text-white/40">Total</div>
          <div className="font-display text-xl font-bold text-gold">{rupee(play + cartTotal)}</div>
        </div>
        <div className="flex items-center gap-2">
          <CanteenPicker tableId={t.id} />
        </div>
      </div>
      <div className="mt-2.5 flex gap-2">
        <button onClick={() => checkout(t)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-felt px-3 py-2.5 font-display text-[0.76rem] font-bold uppercase tracking-wider text-white hover:opacity-90" style={{ background: '#1f8a4c' }}>
          <Check size={15} /> Checkout
        </button>
        <button onClick={() => { if (confirm('Cancel this session without billing?')) cancelSession(t.id) }} aria-label="Cancel session" className="rounded-md border border-white/15 px-3 py-2.5 text-white/50 hover:border-red hover:text-red-light">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

export function Tables() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TABLES.map((t) => (
        <TableCard key={t.id} t={t} />
      ))}
    </div>
  )
}
