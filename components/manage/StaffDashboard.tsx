'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Receipt, Coffee, ClipboardCheck, BarChart3, BookUser,
  LogOut, Play, Square, Trophy, X, Plus as PlusIcon, FileText,
  Minus, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Wallet,
  CheckCircle, Clock,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { Logo } from '@/components/snooker/Logo'
import { TABLES, rupee, fmtDuration, timerAmount, type TableConfig } from '@/lib/manage'

// ── Types ──
type ApiSession = {
  tableId: string
  tableName: string
  mode: 'timer' | 'frames'
  startTime: number
  hourRate: number
  frameCharge: number
  players: string[]
  framesWonBy: number[]
  framesLostBy?: number[]
  selectedDuration?: number
  customerName?: string
  customerId?: string
  cart?: Array<{ itemId: string; name: string; price: number; qty: number }>
}
type Item = { _id: string; name: string; price: number; stock: number }
type Bill = {
  _id: string; tableName: string; mode: string; amount: number
  canteenAmount: number; total: number; paymentMethod: string
  cashAmount?: number; upiAmount?: number; customerName?: string
  createdAt: string; note?: string
}
type KhataCustomer = {
  _id: string; name: string; phone?: string; balance: number
  loyaltyPoints?: number; outstandingBalance?: number
}
type KhataTransaction = {
  _id: string; type: 'gave' | 'got'; amount: number; note?: string; createdAt: string
}

// ── Helpers ──
const frameTotals = (s: ApiSession) => {
  const n = Math.max(2, s.players?.length || 2)
  const owed = new Array(n).fill(0) as number[]
  // Use framesLostBy if available, else derive from framesWonBy (2-player compat)
  const losses = s.framesLostBy?.length
    ? s.framesLostBy
    : (s.framesWonBy || []).map(w => (w === 0 ? 1 : 0))
  for (const loser of losses) {
    if (loser >= 0 && loser < n) owed[loser] += s.frameCharge
  }
  return { owed, total: owed.reduce((a, b) => a + b, 0) }
}

const sessAmount = (t: TableConfig, s: ApiSession, now: number) => {
  if (s.mode === 'frames') return frameTotals(s).total
  const rate = s.hourRate || t.hour || 0
  if (s.selectedDuration) return Math.round(rate * (s.selectedDuration / 60))
  return timerAmount(rate, now - s.startTime)
}

const DURATIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hr',  minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hr',  minutes: 120 },
  { label: 'Open',  minutes: 0 },
]

// ── Start modal ──
function StartModal({ table, customers, onStart, onClose }: {
  table: TableConfig; customers: string[]
  onStart: (o: any) => void; onClose: () => void
}) {
  const [mode, setMode] = useState<'timer' | 'frames'>('timer')
  const [cust, setCust] = useState('Walk-in')
  const [players, setPlayers] = useState(['Player 1', 'Player 2'])
  const [hourRate, setHourRate] = useState(table.hour ?? 0)
  const [frameCharge, setFrameCharge] = useState(table.frame ?? 0)
  const [durationMin, setDurationMin] = useState(0)
  const [forgot, setForgot] = useState(false)
  const [agoMin, setAgoMin] = useState('0')

  const fixedAmount = durationMin > 0 ? Math.round(hourRate * (durationMin / 60)) : null

  const addPlayer = () => { if (players.length < 5) setPlayers([...players, `Player ${players.length + 1}`]) }
  const removePlayer = (i: number) => { if (players.length > 2) setPlayers(players.filter((_, j) => j !== i)) }
  const updatePlayer = (i: number, v: string) => setPlayers(players.map((p, j) => j === i ? v : p))

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase text-white">▶ Start {table.name}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Mode</label>
        <div className="mb-3 flex gap-2">
          {(['timer', 'frames'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg py-2 font-display text-[0.74rem] font-bold uppercase ${mode === m ? 'bg-gold text-ink' : 'border border-white/12 bg-white/5 text-white/55'}`}>
              {m === 'timer' ? 'Timer (hourly)' : 'Frames (loser pays)'}
            </button>
          ))}
        </div>

        {mode === 'timer' ? (
          <div className="mb-3">
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Rate ₹/hour</label>
            <input type="number" value={hourRate} onChange={(e) => setHourRate(Number(e.target.value))} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            <label className="mb-1 mt-3 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Duration</label>
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button key={d.minutes} onClick={() => setDurationMin(d.minutes)} className={`flex-1 rounded-lg py-1.5 font-display text-[0.65rem] font-bold uppercase transition-colors ${durationMin === d.minutes ? 'bg-gold text-ink' : 'border border-white/12 text-white/55 hover:border-gold/40'}`}>
                  {d.label}
                </button>
              ))}
            </div>
            {fixedAmount !== null && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-gold/[0.08] px-3 py-2">
                <span className="text-[0.72rem] text-white/50">Fixed charge</span>
                <span className="font-display font-bold text-gold">₹{fixedAmount}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Charge ₹/frame</div>
            <input type="number" value={frameCharge} onChange={(e) => setFrameCharge(Number(e.target.value))} className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Players</label>
              <button onClick={addPlayer} disabled={players.length >= 5} className="flex items-center gap-1 rounded-md border border-gold/30 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-gold disabled:opacity-30">
                <PlusIcon size={10} /> Add
              </button>
            </div>
            <div className="mb-3 space-y-1.5">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={p} onChange={(e) => updatePlayer(i, e.target.value)} className="flex-1 rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
                  {players.length > 2 && (
                    <button onClick={() => removePlayer(i)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 text-white/40 hover:border-red-light hover:text-red-light">
                      <Minus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Customer</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button onClick={() => setCust('Walk-in')} className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === 'Walk-in' ? 'text-white' : 'border border-white/12 text-white/55'}`} style={cust === 'Walk-in' ? { background: '#1f8a4c' } : undefined}>Walk-in</button>
          {customers.map((c) => <button key={c} onClick={() => setCust(c)} className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === c ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}>{c}</button>)}
        </div>
        <input value={cust === 'Walk-in' ? '' : cust} onChange={(e) => setCust(e.target.value || 'Walk-in')} placeholder="Or type name…" className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />

        <button onClick={() => setForgot(!forgot)} className="mb-2 flex items-center gap-2 text-[0.78rem] font-semibold text-white/45">
          <span className={`flex h-4 w-4 items-center justify-center rounded border ${forgot ? 'border-gold bg-gold text-ink' : 'border-white/25'}`}>{forgot && '✓'}</span>
          ⏱ Forgot to start on time?
        </button>
        {forgot && (
          <div className="mb-3 flex items-center gap-2">
            <input type="number" min="0" value={agoMin} onChange={(e) => setAgoMin(e.target.value)} className="w-20 rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            <span className="text-[0.8rem] text-white/40">minutes ago</span>
          </div>
        )}

        <button
          onClick={() => onStart({
            mode, customerName: cust, hourRate, frameCharge,
            players: mode === 'frames' ? players : [],
            startTime: Date.now() - Number(agoMin || 0) * 60000,
            selectedDuration: durationMin > 0 ? durationMin : undefined,
          })}
          className="w-full rounded-lg bg-red py-3 font-display text-sm font-bold uppercase tracking-wider text-white"
        >
          🎱 Start Session
        </button>
      </div>
    </div>
  )
}

// ── Frame modal (3+ players) ──
function FrameModal({ session, onRecord, onClose }: {
  session: ApiSession
  onRecord: (winner: number, loser: number) => void
  onClose: () => void
}) {
  const [winner, setWinner] = useState<number | null>(null)
  const [loser, setLoser] = useState<number | null>(null)
  const ready = winner !== null && loser !== null && winner !== loser

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase text-white">Record Frame</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
        </div>

        <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-wider text-green-400">Who won?</label>
        <div className="mb-4 grid grid-cols-2 gap-1.5">
          {session.players.map((p, i) => (
            <button key={i} onClick={() => { setWinner(i); if (loser === i) setLoser(null) }} className={`rounded-lg py-2 text-[0.72rem] font-bold ${winner === i ? 'bg-green-600 text-white' : 'border border-white/12 text-white/55 hover:border-green-400/40'}`}>
              {p || `P${i + 1}`}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-wider text-red-light">Who lost?</label>
        <div className="mb-4 grid grid-cols-2 gap-1.5">
          {session.players.map((p, i) => (
            <button key={i} disabled={winner === i} onClick={() => setLoser(i)} className={`rounded-lg py-2 text-[0.72rem] font-bold ${loser === i ? 'bg-red text-white' : winner === i ? 'cursor-not-allowed border border-white/6 text-white/20' : 'border border-white/12 text-white/55 hover:border-red-light/40'}`}>
              {p || `P${i + 1}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => ready && onRecord(winner!, loser!)}
          disabled={!ready}
          className={`w-full rounded-lg py-2.5 font-display text-sm font-bold uppercase text-white ${ready ? 'bg-gold text-ink' : 'cursor-not-allowed bg-white/10 text-white/30'}`}
        >
          Record Frame
        </button>
      </div>
    </div>
  )
}

// ── Bill modal ──
function BillModal({ table, session, now, onProcess, onClose }: {
  table: TableConfig; session: ApiSession; now: number
  onProcess: (method: string, disc: number, cashAmt?: number, upiAmt?: number) => void
  onClose: () => void
}) {
  const play = sessAmount(table, session, now)
  const canteen = (session.cart || []).reduce((a, c) => a + c.price * c.qty, 0)
  const [disc, setDisc] = useState('0')
  const [pm, setPm] = useState<'cash' | 'upi' | 'split' | 'credit'>('cash')
  const [cashAmt, setCashAmt] = useState('')
  const [upiAmt, setUpiAmt] = useState('')
  const d = Math.min(Number(disc) || 0, play + canteen)
  const total = play + canteen - d

  const handleCashChange = (v: string) => { setCashAmt(v); setUpiAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const handleUpiChange = (v: string) => { setUpiAmt(v); setCashAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const splitValid = pm !== 'split' || (Number(cashAmt) + Number(upiAmt) === total && total > 0)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase text-white">Bill · {table.name}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mb-3 space-y-1.5 rounded-xl bg-white/[0.03] p-3 text-[0.85rem]">
          <div className="flex justify-between text-white/60"><span>{session.mode === 'frames' ? `Frames (${session.framesWonBy.length})` : 'Table time'}</span><span className="text-white">{rupee(play)}</span></div>
          {canteen > 0 && <div className="flex justify-between text-white/60"><span>Canteen</span><span className="text-white">{rupee(canteen)}</span></div>}
          {d > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{rupee(d)}</span></div>}
          <div className="flex justify-between border-t border-white/10 pt-1.5 font-display font-bold"><span>Total</span><span className="text-gold">{rupee(total)}</span></div>
        </div>
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Discount ₹</label>
        <input type="number" value={disc} onChange={(e) => setDisc(e.target.value)} className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Payment Method</label>
        <div className="mb-3 flex gap-1.5">
          {(['cash', 'upi', 'split', 'credit'] as const).map((m) => (
            <button key={m} onClick={() => { setPm(m); setCashAmt(''); setUpiAmt('') }} className={`flex-1 rounded-lg py-2 text-[0.7rem] font-bold uppercase ${pm === m ? 'bg-gold text-ink' : 'border border-white/12 text-white/50'}`}>{m}</button>
          ))}
        </div>
        {pm === 'split' && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 text-[0.68rem] uppercase tracking-wider text-white/40">Split — must total {rupee(total)}</p>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-green-400">Cash ₹</label><input type="number" value={cashAmt} onChange={(e) => handleCashChange(e.target.value)} placeholder="0" className="w-full rounded-lg border border-green-400/30 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-green-400" /></div>
              <div><label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#23c2ff' }}>UPI ₹</label><input type="number" value={upiAmt} onChange={(e) => handleUpiChange(e.target.value)} placeholder="0" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none" style={{ borderColor: 'rgba(35,194,255,0.3)' }} /></div>
            </div>
            {!splitValid && (Number(cashAmt) > 0 || Number(upiAmt) > 0) && <p className="mt-1.5 text-[0.68rem] text-red-light">Cash + UPI must equal {rupee(total)}</p>}
          </div>
        )}
        {pm === 'credit' && (
          <div className="mb-3 rounded-xl border border-red-light/20 bg-red-light/[0.05] px-3 py-2">
            <p className="text-[0.72rem] text-red-light">⚠ This will be added to the customer's khata as outstanding balance.</p>
          </div>
        )}
        <button onClick={() => splitValid && onProcess(pm, d, pm === 'split' ? Number(cashAmt) : undefined, pm === 'split' ? Number(upiAmt) : undefined)} disabled={!splitValid} className={`w-full rounded-lg py-3 font-display text-sm font-bold uppercase tracking-wider text-white ${splitValid ? 'bg-red' : 'cursor-not-allowed bg-red/40'}`}>
          ✅ Collect {rupee(total)}
        </button>
      </div>
    </div>
  )
}

// ── Add Bill modal ──
function AddBillModal({ canteen, customers, onAdd, onClose }: { canteen: Item[]; customers: string[]; onAdd: (b: any) => void; onClose: () => void }) {
  const [kind, setKind] = useState<'table' | 'canteen'>('table')
  const [tableId, setTableId] = useState(TABLES[0].id)
  const [amount, setAmount] = useState('')
  const [cust, setCust] = useState('Walk-in')
  const [pm, setPm] = useState('cash')
  const [cashAmt, setCashAmt] = useState('')
  const [upiAmt, setUpiAmt] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  const t = TABLES.find((x) => x.id === tableId)!
  const cAmt = canteen.reduce((a, i) => a + (cart[i._id] || 0) * i.price, 0)
  const play = kind === 'table' ? Number(amount) || t.hour || 0 : 0
  const total = play + cAmt
  const handleCashChange = (v: string) => { setCashAmt(v); setUpiAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const handleUpiChange = (v: string) => { setUpiAmt(v); setCashAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const splitValid = pm !== 'split' || (Number(cashAmt) + Number(upiAmt) === total && total > 0)
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase text-white">📝 Add Bill</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mb-3 flex gap-2">
          <button onClick={() => setKind('table')} className={`flex-1 rounded-lg py-2 text-[0.74rem] font-bold uppercase ${kind === 'table' ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}>🎱 Table</button>
          <button onClick={() => setKind('canteen')} className={`flex-1 rounded-lg py-2 text-[0.74rem] font-bold uppercase ${kind === 'canteen' ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}>🍫 Canteen only</button>
        </div>
        {kind === 'table' && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div><label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Table</label><select value={tableId} onChange={(e) => setTableId(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white">{TABLES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <div><label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Amount ₹</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`${t.hour}`} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" /></div>
          </div>
        )}
        <label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Canteen items</label>
        <div className="mb-3 grid grid-cols-2 gap-1.5">
          {canteen.map((i) => (
            <button key={i._id} onClick={() => setCart((c) => ({ ...c, [i._id]: (c[i._id] || 0) + 1 }))} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-left">
              <span className="text-[0.78rem] text-white">{i.name} <span className="text-white/40">₹{i.price}</span></span>
              {cart[i._id] ? <span className="rounded-full bg-gold px-1.5 text-[0.7rem] font-bold text-ink">{cart[i._id]}</span> : null}
            </button>
          ))}
        </div>
        <label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Customer</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button onClick={() => setCust('Walk-in')} className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === 'Walk-in' ? 'text-white' : 'border border-white/12 text-white/55'}`} style={cust === 'Walk-in' ? { background: '#1f8a4c' } : undefined}>Walk-in</button>
          {customers.map((c) => <button key={c} onClick={() => setCust(c)} className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === c ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}>{c}</button>)}
        </div>
        <input value={cust === 'Walk-in' ? '' : cust} onChange={(e) => setCust(e.target.value || 'Walk-in')} placeholder="Or type name…" className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" />
        <label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Payment Method</label>
        <div className="mb-3 flex gap-1.5">
          {['cash', 'upi', 'split', 'credit'].map((m) => (
            <button key={m} onClick={() => { setPm(m); setCashAmt(''); setUpiAmt('') }} className={`flex-1 rounded-lg py-1.5 text-[0.68rem] font-bold uppercase ${pm === m ? 'bg-gold text-ink' : 'border border-white/12 text-white/50'}`}>{m}</button>
          ))}
        </div>
        {pm === 'split' && total > 0 && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="mb-2 text-[0.68rem] uppercase tracking-wider text-white/40">Split — total {rupee(total)}</p>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-green-400">Cash ₹</label><input type="number" value={cashAmt} onChange={(e) => handleCashChange(e.target.value)} placeholder="0" className="w-full rounded-lg border border-green-400/30 bg-ink px-3 py-2 text-sm text-white" /></div>
              <div><label className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: '#23c2ff' }}>UPI ₹</label><input type="number" value={upiAmt} onChange={(e) => handleUpiChange(e.target.value)} placeholder="0" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" /></div>
            </div>
          </div>
        )}
        <div className="mb-3 flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className="text-[0.8rem] text-white/50">Total</span><span className="font-display font-bold text-gold">{rupee(total)}</span></div>
        <button
          onClick={() => {
            if (total <= 0 || !splitValid) return
            const items = canteen.filter((i) => cart[i._id]).map((i) => ({ itemId: i._id, name: i.name, price: i.price, qty: cart[i._id] }))
            onAdd({ tableId: kind === 'canteen' ? 'counter' : tableId, tableName: kind === 'canteen' ? 'Counter' : t.name, mode: kind === 'canteen' ? 'canteen' : 'timer', amount: play, canteenAmount: cAmt, canteenItems: items, total, paymentMethod: pm, customerName: cust, cashAmount: pm === 'cash' ? total : pm === 'split' ? Number(cashAmt) : 0, upiAmount: pm === 'upi' ? total : pm === 'split' ? Number(upiAmt) : 0 })
          }}
          className="w-full rounded-lg bg-red py-3 font-display text-sm font-bold uppercase tracking-wider text-white"
        >💾 Save Bill</button>
      </div>
    </div>
  )
}

// ── Cancel confirm modal ──
function CancelModal({ table, session, now, onConfirm, onClose }: {
  table: TableConfig; session: ApiSession; now: number
  onConfirm: () => void; onClose: () => void
}) {
  const amt = sessAmount(table, session, now)
  const elapsed = fmtDuration(now - session.startTime)
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-2xl border border-red-light/30 bg-ink-2 p-5">
        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle size={22} className="shrink-0 text-red-light" />
          <div>
            <h3 className="font-display text-base font-bold uppercase text-white">Cancel Session?</h3>
            <p className="text-[0.72rem] text-white/40">This cannot be undone</p>
          </div>
        </div>
        <div className="mb-4 rounded-xl bg-white/[0.03] p-3 text-[0.82rem]">
          <div className="flex justify-between"><span className="text-white/50">Table</span><span className="text-white">{table.name}</span></div>
          <div className="flex justify-between mt-1"><span className="text-white/50">Customer</span><span className="text-white">{session.customerName || 'Walk-in'}</span></div>
          <div className="flex justify-between mt-1"><span className="text-white/50">Duration</span><span className="text-white">{elapsed}</span></div>
          <div className="flex justify-between mt-1 border-t border-white/10 pt-1.5 font-display font-bold"><span>Bill lost</span><span className="text-red-light">{rupee(amt)}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/15 py-2.5 font-display text-[0.74rem] font-bold uppercase text-white/70">Keep Playing</button>
          <button onClick={onConfirm} className="rounded-lg bg-red py-2.5 font-display text-[0.74rem] font-bold uppercase text-white">Yes, Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Day Close Report modal ──
function ShiftReportModal({ bills, onClose }: { bills: Bill[]; onClose: () => void }) {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const cash = bills.reduce((a, b) => b.paymentMethod === 'cash' ? a + b.total : b.paymentMethod === 'split' ? a + (b.cashAmount || 0) : a, 0)
  const upi = bills.reduce((a, b) => b.paymentMethod === 'upi' ? a + b.total : b.paymentMethod === 'split' ? a + (b.upiAmount || 0) : a, 0)
  const credit = bills.filter((b) => b.paymentMethod === 'credit').reduce((a, b) => a + b.total, 0)
  const splitBills = bills.filter((b) => b.paymentMethod === 'split')
  const splitTotal = splitBills.reduce((a, b) => a + b.total, 0)
  const total = bills.reduce((a, b) => a + b.total, 0)
  const tablePlay = bills.filter((b) => b.mode !== 'canteen').reduce((a, b) => a + (b.amount || 0), 0)
  const canteenSales = bills.reduce((a, b) => a + (b.canteenAmount || 0), 0)
  const byTable = bills.reduce((acc, b) => { if (b.mode === 'canteen') return acc; acc[b.tableName] = (acc[b.tableName] || 0) + b.total; return acc }, {} as Record<string, number>)
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold/25 bg-ink-2 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div><h3 className="font-display text-lg font-bold uppercase text-white">Day Close Report</h3><p className="text-[0.72rem] text-white/40">{today}</p></div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] p-4 text-center"><div className="font-display text-xl font-bold text-gold">{rupee(total)}</div><div className="text-[0.58rem] uppercase tracking-wider text-white/40">Total Revenue</div></div>
          <div className="rounded-xl bg-white/[0.03] p-4 text-center"><div className="font-display text-xl font-bold text-green-400">{rupee(cash + upi)}</div><div className="text-[0.58rem] uppercase tracking-wider text-white/40">Collected</div></div>
        </div>
        <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <h4 className="mb-3 text-[0.68rem] font-bold uppercase tracking-wider text-white/40">Payment Breakdown</h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[0.85rem]"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-green-400" /><span className="text-white/70">Cash</span></div><span className="font-display font-bold text-green-400">{rupee(cash)}</span></div>
            <div className="flex items-center justify-between text-[0.85rem]"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{ background: '#23c2ff' }} /><span className="text-white/70">UPI</span></div><span className="font-display font-bold" style={{ color: '#23c2ff' }}>{rupee(upi)}</span></div>
            {splitTotal > 0 && <div className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[0.85rem]"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-gold" /><span className="text-white/70">Split ({splitBills.length} bills)</span></div><span className="font-display font-bold text-gold">{rupee(splitTotal)}</span></div>
              <div className="ml-4 space-y-0.5">
                <div className="flex justify-between text-[0.72rem] text-white/40"><span>↳ Cash portion</span><span className="text-green-400">{rupee(splitBills.reduce((a, b) => a + (b.cashAmount || 0), 0))}</span></div>
                <div className="flex justify-between text-[0.72rem] text-white/40"><span>↳ UPI portion</span><span style={{ color: '#23c2ff' }}>{rupee(splitBills.reduce((a, b) => a + (b.upiAmount || 0), 0))}</span></div>
              </div>
            </div>}
            {credit > 0 && <div className="flex items-center justify-between text-[0.85rem]"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-red-light" /><span className="text-white/70">Credit (pending)</span></div><span className="font-display font-bold text-red-light">{rupee(credit)}</span></div>}
          </div>
          {total > 0 && <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10"><div className="bg-green-400" style={{ width: `${(cash / total) * 100}%` }} /><div style={{ width: `${(upi / total) * 100}%`, background: '#23c2ff' }} />{credit > 0 && <div className="bg-red-light" style={{ width: `${(credit / total) * 100}%` }} />}</div>}
        </div>
        <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <h4 className="mb-3 text-[0.68rem] font-bold uppercase tracking-wider text-white/40">Revenue Source</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-white/[0.03] p-3 text-center"><div className="font-display text-base font-bold text-gold">{rupee(tablePlay)}</div><div className="text-[0.58rem] uppercase tracking-wider text-white/35">Table Play</div></div>
            <div className="rounded-lg bg-white/[0.03] p-3 text-center"><div className="font-display text-base font-bold text-gold">{rupee(canteenSales)}</div><div className="text-[0.58rem] uppercase tracking-wider text-white/35">Canteen</div></div>
            <div className="rounded-lg bg-white/[0.03] p-3 text-center"><div className="font-display text-base font-bold text-white/70">{bills.length}</div><div className="text-[0.58rem] uppercase tracking-wider text-white/35">Bills</div></div>
          </div>
        </div>
        {Object.keys(byTable).length > 0 && <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <h4 className="mb-3 text-[0.68rem] font-bold uppercase tracking-wider text-white/40">Table-wise Revenue</h4>
          <div className="space-y-1.5">
            {Object.entries(byTable).sort(([, a], [, b]) => b - a).map(([name, amt]) => (
              <div key={name} className="flex items-center justify-between text-[0.82rem]"><span className="text-white/60">{name}</span><span className="font-display font-bold text-gold">{rupee(amt)}</span></div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  )
}

// ── Khata tab ──
function KhataTab() {
  const [customers, setCustomers] = useState<KhataCustomer[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [txns, setTxns] = useState<Record<string, KhataTransaction[]>>({})
  const [search, setSearch] = useState('')
  const [payFor, setPayFor] = useState<KhataCustomer | null>(null)
  const [payType, setPayType] = useState<'got' | 'gave'>('got')

  const loadAll = async () => {
    try { const { data } = await api.get('/khata'); setCustomers(data) } catch {}
  }
  useEffect(() => { loadAll() }, [])

  const loadTxns = async (id: string) => {
    if (txns[id]) return
    try {
      const { data } = await api.get(`/khata/${id}`)
      setTxns(p => ({ ...p, [id]: data.transactions || [] }))
    } catch {}
  }

  const toggle = async (c: KhataCustomer) => {
    if (expanded === c._id) { setExpanded(null); return }
    setExpanded(c._id)
    await loadTxns(c._id)
  }

  const submit = async (amount: string, note: string) => {
    if (!payFor || !amount || Number(amount) <= 0) return
    await api.post(`/khata/${payFor._id}`, { type: payType, amount: Number(amount), note }).catch(() => {})
    setPayFor(null)
    await loadAll()
    // Refresh expanded customer's transactions
    if (expanded === payFor._id) {
      const { data } = await api.get(`/khata/${payFor._id}`).catch(() => ({ data: null })) as any
      if (data) setTxns(p => ({ ...p, [payFor._id]: data.transactions || [] }))
    }
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  ).sort((a, b) => (b.balance || 0) - (a.balance || 0))

  const totalOutstanding = customers.reduce((a, c) => a + Math.max(0, c.balance || 0), 0)

  return (
    <div>
      {/* Summary */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-light/20 bg-red-light/[0.04] px-5 py-4">
        <div>
          <div className="text-[0.65rem] uppercase tracking-wider text-white/40">Total Outstanding</div>
          <div className="font-display text-2xl font-bold text-red-light">{rupee(totalOutstanding)}</div>
        </div>
        <Wallet size={28} className="text-red-light/40" />
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer…" className="mb-4 w-full rounded-xl border border-white/15 bg-ink-2 px-4 py-2.5 text-sm text-white outline-none focus:border-gold" />

      {/* Customer list */}
      <div className="space-y-2">
        {filtered.length === 0 && <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No customers found.</p>}
        {filtered.map((c) => {
          const bal = c.balance || 0
          const isExp = expanded === c._id
          return (
            <div key={c._id} className={`overflow-hidden rounded-xl border transition-all ${bal > 0 ? 'border-red-light/20' : 'border-white/8'} bg-white/[0.02]`}>
              {/* Row */}
              <div className="flex items-center px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[0.88rem] text-white">{c.name}</div>
                  {c.phone && <div className="text-[0.68rem] text-white/35">{c.phone}</div>}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {bal > 0 ? (
                    <span className="font-display text-[0.9rem] font-bold text-red-light">{rupee(bal)}</span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-green-400/30 px-2 py-0.5 text-[0.62rem] font-bold uppercase text-green-400"><CheckCircle size={10} /> Cleared</span>
                  )}
                  {bal > 0 && <>
                    <button onClick={() => { setPayFor(c); setPayType('got') }} className="rounded-lg bg-green-600/20 px-2 py-1 text-[0.62rem] font-bold uppercase text-green-400 hover:bg-green-600/30">Received</button>
                    <button onClick={() => { setPayFor(c); setPayType('gave') }} className="rounded-lg bg-red-light/10 px-2 py-1 text-[0.62rem] font-bold uppercase text-red-light hover:bg-red-light/20">Credit</button>
                  </>}
                  {bal === 0 && (
                    <button onClick={() => { setPayFor(c); setPayType('gave') }} className="rounded-lg border border-white/12 px-2 py-1 text-[0.62rem] font-bold uppercase text-white/40 hover:text-white">+ Credit</button>
                  )}
                  <button onClick={() => toggle(c)} className="text-white/30 hover:text-white">
                    {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Transactions (expanded) */}
              {isExp && (
                <div className="border-t border-white/8 bg-white/[0.01]">
                  {!txns[c._id] ? (
                    <div className="px-4 py-3 text-center text-[0.75rem] text-white/30">Loading…</div>
                  ) : txns[c._id].length === 0 ? (
                    <div className="px-4 py-3 text-center text-[0.75rem] text-white/30">No transactions yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {txns[c._id].map((t) => (
                        <div key={t._id} className="flex items-center justify-between px-4 py-2.5">
                          <div>
                            <span className={`text-[0.7rem] font-bold uppercase ${t.type === 'gave' ? 'text-red-light' : 'text-green-400'}`}>
                              {t.type === 'gave' ? '↑ Credit given' : '↓ Payment received'}
                            </span>
                            {t.note && <div className="text-[0.65rem] text-white/35">{t.note}</div>}
                            <div className="text-[0.62rem] text-white/25">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                          </div>
                          <span className={`font-display text-sm font-bold ${t.type === 'gave' ? 'text-red-light' : 'text-green-400'}`}>
                            {t.type === 'gave' ? '+' : '−'}{rupee(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment / Credit modal */}
      {payFor && <PayModal customer={payFor} type={payType} onSubmit={submit} onClose={() => setPayFor(null)} />}
    </div>
  )
}

function PayModal({ customer, type, onSubmit, onClose }: {
  customer: KhataCustomer; type: 'got' | 'gave'
  onSubmit: (amount: string, note: string) => void; onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const bal = customer.balance || 0
  const isReceiving = type === 'got'

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-white">
              {isReceiving ? '💰 Payment Received' : '📋 Give Credit'}
            </h3>
            <p className="text-[0.68rem] text-white/40">{customer.name} {bal > 0 ? `· owes ${rupee(bal)}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
        </div>
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Amount ₹</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={isReceiving && bal > 0 ? `Full: ${bal}` : '0'} className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        {isReceiving && bal > 0 && (
          <button onClick={() => setAmount(String(bal))} className="mb-3 w-full rounded-lg border border-green-400/20 py-1.5 text-[0.7rem] font-bold uppercase text-green-400">
            Full amount ({rupee(bal)})
          </button>
        )}
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={isReceiving ? 'e.g. Cash payment' : 'e.g. Snooker session'} className="mb-4 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        <button
          onClick={() => onSubmit(amount, note)}
          disabled={!amount || Number(amount) <= 0}
          className={`w-full rounded-lg py-3 font-display text-sm font-bold uppercase tracking-wider text-white ${Number(amount) > 0 ? (isReceiving ? 'bg-green-600' : 'bg-red') : 'cursor-not-allowed bg-white/10'}`}
        >
          {isReceiving ? `✓ Record ${amount ? rupee(Number(amount)) : ''} Received` : `Add ${amount ? rupee(Number(amount)) : ''} to Khata`}
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ──
export function StaffDashboard({ admin = false }: { admin?: boolean }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())
  const [sessions, setSessions] = useState<Record<string, ApiSession>>({})
  const [bills, setBills] = useState<Bill[]>([])
  const [canteen, setCanteen] = useState<Item[]>([])
  const [khata, setKhata] = useState<any[]>([])
  const [tab, setTab] = useState<'tables' | 'bills' | 'canteen' | 'shift' | 'khata' | 'finance'>('tables')
  const [startFor, setStartFor] = useState<TableConfig | null>(null)
  const [billFor, setBillFor] = useState<TableConfig | null>(null)
  const [frameFor, setFrameFor] = useState<string | null>(null) // tableId for frame modal
  const [cancelFor, setCancelFor] = useState<TableConfig | null>(null)
  const [addBill, setAddBill] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const polling = useRef(false)

  const refreshTables = async () => { try { const { data } = await api.get('/sessions'); const map: Record<string, ApiSession> = {}; for (const s of data) map[s.tableId] = s; setSessions(map) } catch {} }
  const refreshBills = async () => { try { const { data } = await api.get('/bills/today'); setBills(data) } catch {} }
  const refreshCanteen = async () => { try { const { data } = await api.get('/canteen'); setCanteen(data) } catch {} }

  useEffect(() => {
    refreshTables(); refreshBills(); refreshCanteen()
    if (admin) { api.get('/khata').then((r) => setKhata(r.data || [])).catch(() => {}) }
    const t = setInterval(() => {
      setNow(Date.now())
      if (!polling.current) { polling.current = true; refreshTables().finally(() => { polling.current = false }) }
    }, 3000)
    return () => clearInterval(t)
  }, [admin])

  const customers = useMemo(() => Array.from(new Set(bills.map((b) => b.customerName).filter((c): c is string => !!c && c !== 'Walk-in' && c !== 'Counter'))), [bills])

  const start = async (t: TableConfig, o: any) => {
    setStartFor(null)
    await api.post('/sessions', { tableId: t.id, tableName: t.name, mode: o.mode, startTime: o.startTime, hourRate: o.hourRate, frameCharge: o.frameCharge, players: o.players, customerName: o.customerName, cart: [], selectedDuration: o.selectedDuration }).catch(() => {})
    refreshTables()
  }

  const recordFrame = async (tableId: string, winner: number, loser: number) => {
    setSessions((p) => ({
      ...p,
      [tableId]: {
        ...p[tableId],
        framesWonBy: [...(p[tableId].framesWonBy || []), winner],
        framesLostBy: [...(p[tableId].framesLostBy || []), loser],
      }
    }))
    setFrameFor(null)
    await api.patch(`/sessions/${tableId}/frame`, { winner, loser }).catch(() => {})
  }

  const undoFrame = async (tableId: string) => {
    const s = sessions[tableId]
    const newWon = (s.framesWonBy || []).slice(0, -1)
    const newLost = (s.framesLostBy || []).slice(0, -1)
    setSessions((p) => ({ ...p, [tableId]: { ...p[tableId], framesWonBy: newWon, framesLostBy: newLost } }))
    await api.patch(`/sessions/${tableId}`, { framesWonBy: newWon, framesLostBy: newLost }).catch(() => {})
  }

  const addToCart = async (tableId: string, item: Item) => {
    const s = sessions[tableId]; const cart = [...(s.cart || [])]; const line = cart.find((c) => c.itemId === item._id)
    if (line) line.qty += 1; else cart.push({ itemId: item._id, name: item.name, price: item.price, qty: 1 })
    setSessions((p) => ({ ...p, [tableId]: { ...p[tableId], cart } }))
    await api.patch(`/sessions/${tableId}`, { cart }).catch(() => {})
  }

  const cancel = async (tableId: string) => {
    setCancelFor(null)
    setSessions((p) => { const n = { ...p }; delete n[tableId]; return n })
    await api.delete(`/sessions/${tableId}`).catch(() => {})
  }

  const processBill = async (t: TableConfig, method: string, disc: number, cashAmt?: number, upiAmt?: number) => {
    const s = sessions[t.id]
    const play = sessAmount(t, s, Date.now())
    const canteenAmt = (s.cart || []).reduce((a, c) => a + c.price * c.qty, 0)
    const total = play + canteenAmt - disc
    const resolvedCash = method === 'cash' ? total : method === 'split' ? (cashAmt ?? 0) : 0
    const resolvedUpi = method === 'upi' ? total : method === 'split' ? (upiAmt ?? 0) : 0
    setBillFor(null)
    await cancel(t.id)
    await api.post('/bills', {
      tableId: t.id, tableName: t.name, mode: s.mode,
      duration: Math.round((Date.now() - s.startTime) / 60000),
      frames: s.framesWonBy.length, players: s.players,
      amount: play, canteenAmount: canteenAmt, canteenItems: s.cart || [],
      discount: disc, total, paymentMethod: method,
      cashAmount: resolvedCash, upiAmount: resolvedUpi,
      customerName: s.customerName,
    }).catch(() => {})
    refreshBills(); refreshCanteen()
  }

  const saveManualBill = async (b: any) => { setAddBill(false); await api.post('/bills', b).catch(() => {}); refreshBills(); refreshCanteen() }
  const doLogout = () => { logout(); router.replace('/login') }

  const galla = useMemo(() => {
    const cash = bills.reduce((a, b) => b.paymentMethod === 'cash' ? a + b.total : b.paymentMethod === 'split' ? a + (b.cashAmount || 0) : a, 0)
    const upi = bills.reduce((a, b) => b.paymentMethod === 'upi' ? a + b.total : b.paymentMethod === 'split' ? a + (b.upiAmount || 0) : a, 0)
    const total = bills.reduce((a, b) => a + b.total, 0)
    return { cash, upi, total }
  }, [bills])

  const tabs = [
    { id: 'tables', label: 'Tables', icon: LayoutGrid },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'canteen', label: 'Canteen', icon: Coffee },
    { id: 'shift', label: 'Shift', icon: ClipboardCheck },
    { id: 'khata', label: 'Khata', icon: BookUser },
    ...(admin ? [{ id: 'finance', label: 'Finance', icon: BarChart3 } as const] : []),
  ] as const

  return (
    <div className="min-h-dvh bg-ink pb-16 text-white">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-[0.85rem] font-bold uppercase">
              <span className="text-red">Star</span> <span className="text-gold">Snooker</span>
              <span className="hidden text-white/45 sm:inline"> · {admin ? 'Admin' : 'Counter'}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {admin && (
              <>
                <div className="hidden text-right sm:block"><div className="font-display text-sm font-bold text-green-400">{rupee(galla.cash)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">Cash</div></div>
                <div className="hidden text-right sm:block"><div className="font-display text-sm font-bold" style={{ color: '#23c2ff' }}>{rupee(galla.upi)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">UPI</div></div>
                <div className="text-right"><div className="font-display text-base font-bold text-gold">{rupee(galla.total)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">Galla</div></div>
              </>
            )}
            {!admin && user && (
              <div className="text-right">
                <div className="font-display text-[0.78rem] font-bold text-white/80">{user.name}</div>
                <div className="text-[0.5rem] uppercase tracking-wider text-white/40">Counter</div>
              </div>
            )}
            <button onClick={doLogout} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 hover:border-red"><LogOut size={16} /></button>
          </div>
        </div>
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-2 pb-2 sm:px-5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-display text-[0.7rem] font-bold uppercase tracking-wider ${tab === t.id ? 'bg-gold text-ink' : 'text-white/55'}`}>
              <t.icon size={14} /><span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-5 sm:px-6">
        {/* ── Tables ── */}
        {tab === 'tables' && (
          <>
            <div className="mb-4 flex justify-end">
              <button onClick={() => setAddBill(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 font-display text-[0.72rem] font-bold uppercase text-gold">
                <PlusIcon size={14} /> Add Bill
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TABLES.map((t) => {
                const s = sessions[t.id]
                if (!s) return (
                  <div key={t.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[0.95rem] font-bold text-white">{t.name}</span>
                      <span className="text-[0.65rem] uppercase tracking-wider text-white/30">Open</span>
                    </div>
                    <div className="mt-1 text-[0.7rem] text-white/35">₹{t.frame}/frame · ₹{t.hour}/hr</div>
                    <button onClick={() => setStartFor(t)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-display text-[0.74rem] font-bold uppercase text-white" style={{ background: '#1f8a4c' }}>
                      <Play size={14} /> Start
                    </button>
                  </div>
                )
                const amt = sessAmount(t, s, now)
                const ft = frameTotals(s)
                const multiPlayer = (s.players?.length || 2) > 2

                return (
                  <div key={t.id} className="gold-border rounded-2xl bg-gold/[0.04] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[0.95rem] font-bold text-white">{t.name}</span>
                      <span className="rounded bg-red/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-red-light">{s.mode}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[0.72rem] text-white/45">
                      <span>{s.customerName || 'Walk-in'}</span>
                      {s.selectedDuration && <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-gold">{s.selectedDuration >= 60 ? `${s.selectedDuration / 60}hr` : `${s.selectedDuration}min`}</span>}
                    </div>

                    {s.mode === 'timer' ? (
                      <div className="mt-2 flex items-end justify-between">
                        <span className="font-display text-xl font-bold tabular-nums text-white">{fmtDuration(now - s.startTime)}</span>
                        <span className="font-display text-lg font-bold text-gold">{rupee(amt)}</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {/* Multi-player: show all players + owed */}
                        {multiPlayer ? (
                          <>
                            <div className="mb-2 space-y-1">
                              {s.players.map((p, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
                                  <span className="text-[0.78rem] text-white/80">{p || `P${i + 1}`}</span>
                                  <span className={`font-display text-[0.78rem] font-bold ${ft.owed[i] > 0 ? 'text-red-light' : 'text-white/30'}`}>{ft.owed[i] > 0 ? `owes ${rupee(ft.owed[i])}` : 'clear'}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-[0.7rem]">
                              <button onClick={() => setFrameFor(t.id)} className="inline-flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 font-display text-[0.7rem] font-bold uppercase text-gold">
                                <Trophy size={11} /> Record Frame
                              </button>
                              <div className="flex items-center gap-2">
                                <span className="text-white/40">{s.framesWonBy.length} frames</span>
                                {s.framesWonBy.length > 0 && <button onClick={() => undoFrame(t.id)} className="text-[0.62rem] text-white/25 hover:text-white/60">↩ Undo</button>}
                                <span className="font-display font-bold text-gold">{rupee(ft.total)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              {[0, 1].map((i) => (
                                <button key={i} onClick={() => recordFrame(t.id, i, i === 0 ? 1 : 0)} className="flex-1 rounded-lg border border-white/12 bg-white/5 py-2 text-[0.72rem] font-bold text-white hover:border-gold">
                                  <Trophy size={12} className="mx-auto mb-0.5 text-gold" />
                                  {s.players[i] || `P${i + 1}`}
                                  <div className="text-[0.62rem] text-white/45">owes {rupee(ft.owed[i])}</div>
                                </button>
                              ))}
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[0.7rem]">
                              <div className="flex items-center gap-2">
                                <span className="text-white/40">{s.framesWonBy.length} frames</span>
                                {s.framesWonBy.length > 0 && <button onClick={() => undoFrame(t.id)} className="text-[0.62rem] text-white/25 hover:text-white/60">↩ Undo</button>}
                              </div>
                              <span className="font-display font-bold text-gold">{rupee(ft.total)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      <button onClick={() => setBillFor(t)} className="rounded-lg bg-red py-2 text-[0.72rem] font-bold uppercase text-white">
                        <Square size={11} className="mr-1 inline" />Bill
                      </button>
                      <select onChange={(e) => { const it = canteen.find((c) => c._id === e.target.value); if (it) addToCart(t.id, it); e.target.value = '' }} defaultValue="" className="rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-[0.7rem] text-white/70">
                        <option value="" disabled>+ Canteen</option>
                        {canteen.map((c) => <option key={c._id} value={c._id}>{c.name} ₹{c.price}</option>)}
                      </select>
                    </div>
                    {(s.cart || []).length > 0 && <div className="mt-1.5 text-[0.66rem] text-white/40">{(s.cart || []).map((c) => `${c.name}×${c.qty}`).join(', ')}</div>}
                    <button onClick={() => setCancelFor(t)} className="mt-1.5 w-full text-[0.62rem] uppercase tracking-wider text-white/25 hover:text-red-light">Cancel session</button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Bills ── */}
        {tab === 'bills' && (
          <div className="space-y-2">
            {bills.length === 0
              ? <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No bills today.</p>
              : bills.map((b) => (
                <div key={b._id} className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 text-[0.82rem]">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white/85">{b.tableName}</span>
                      <span className={`ml-2 text-[0.7rem] uppercase ${b.paymentMethod === 'credit' ? 'text-red-light' : 'text-white/35'}`}>{b.paymentMethod}</span>
                      <div className="text-[0.68rem] text-white/35">{b.customerName} · {new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className="font-display font-bold text-gold">{rupee(b.total)}</span>
                  </div>
                  {b.paymentMethod === 'split' && (
                    <div className="mt-1.5 flex gap-4 text-[0.68rem]">
                      <span className="text-green-400">Cash {rupee(b.cashAmount || 0)}</span>
                      <span style={{ color: '#23c2ff' }}>UPI {rupee(b.upiAmount || 0)}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {tab === 'canteen' && <CanteenTab canteen={canteen} onChange={refreshCanteen} />}
        {tab === 'shift' && <ShiftTab canteen={canteen} onSaved={refreshCanteen} />}
        {tab === 'khata' && <KhataTab />}
        {tab === 'finance' && admin && <FinanceTab khata={khata} todayBills={bills} onShowReport={() => setShowReport(true)} />}
      </main>

      {startFor && <StartModal table={startFor} customers={customers} onStart={(o) => start(startFor, o)} onClose={() => setStartFor(null)} />}
      {billFor && sessions[billFor.id] && <BillModal table={billFor} session={sessions[billFor.id]} now={now} onProcess={(m, d, c, u) => processBill(billFor, m, d, c, u)} onClose={() => setBillFor(null)} />}
      {frameFor && sessions[frameFor] && <FrameModal session={sessions[frameFor]} onRecord={(w, l) => recordFrame(frameFor, w, l)} onClose={() => setFrameFor(null)} />}
      {cancelFor && sessions[cancelFor.id] && <CancelModal table={cancelFor} session={sessions[cancelFor.id]} now={now} onConfirm={() => cancel(cancelFor.id)} onClose={() => setCancelFor(null)} />}
      {addBill && <AddBillModal canteen={canteen} customers={customers} onAdd={saveManualBill} onClose={() => setAddBill(false)} />}
      {showReport && <ShiftReportModal bills={bills} onClose={() => setShowReport(false)} />}
    </div>
  )
}

// ── Canteen tab ──
function CanteenTab({ canteen, onChange }: { canteen: Item[]; onChange: () => void }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [stock, setStock] = useState('')
  const add = async () => { if (!name || !price) return; await api.post('/canteen', { name, price: Number(price), stock: Number(stock) || 0 }).catch(() => {}); setName(''); setPrice(''); setStock(''); onChange() }
  const adjust = async (i: Item, delta: number) => { await api.put(`/canteen/${i._id}`, { stock: Math.max(0, i.stock + delta) }).catch(() => {}); onChange() }
  const remove = async (i: Item) => { await api.delete(`/canteen/${i._id}`).catch(() => {}); onChange() }
  return (
    <div>
      <div className="mb-4 grid grid-cols-[1fr_auto_auto_auto] gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New item" className="rounded-lg border border-white/15 bg-ink-2 px-3 py-2 text-sm text-white" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="₹" className="w-20 rounded-lg border border-white/15 bg-ink-2 px-3 py-2 text-sm text-white" />
        <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="qty" className="w-20 rounded-lg border border-white/15 bg-ink-2 px-3 py-2 text-sm text-white" />
        <button onClick={add} className="rounded-lg bg-gold px-3 font-display text-[0.72rem] font-bold uppercase text-ink">Add</button>
      </div>
      <div className="space-y-2">
        {canteen.map((i) => (
          <div key={i._id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5">
            <div><span className="text-[0.9rem] text-white">{i.name}</span> <span className="text-[0.75rem] text-gold">₹{i.price}</span></div>
            <div className="flex items-center gap-2">
              <button onClick={() => adjust(i, -1)} className="h-7 w-7 rounded border border-white/12 text-white/60">−</button>
              <span className="w-10 text-center font-display font-bold tabular-nums text-white">{i.stock}</span>
              <button onClick={() => adjust(i, 1)} className="h-7 w-7 rounded border border-white/12 text-white/60">+</button>
              <button onClick={() => remove(i)} className="ml-1 h-7 w-7 rounded border border-white/8 text-white/20 hover:border-red-light/40 hover:text-red-light"><X size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Shift stock count ──
function ShiftTab({ canteen, onSaved }: { canteen: Item[]; onSaved: () => void }) {
  const [shift, setShift] = useState('Evening')
  const [counts, setCounts] = useState<Record<string, string>>({})
  const save = async () => {
    const rows = canteen.map((i) => ({ itemId: i._id, name: i.name, system: i.stock, counted: Number(counts[i._id] ?? i.stock) }))
    await api.post('/stock', { shift, rows }).catch(() => {})
    onSaved()
  }
  return (
    <div>
      <div className="mb-4 flex gap-2">{['Morning', 'Evening', 'Night'].map((s) => <button key={s} onClick={() => setShift(s)} className={`rounded-lg px-3 py-1.5 text-[0.74rem] font-bold uppercase ${shift === s ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}>{s}</button>)}</div>
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-white/10 bg-white/5 px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-wider text-white/50"><span>Item</span><span className="w-14 text-center">System</span><span className="w-16 text-center">Counted</span><span className="w-12 text-center">Diff</span></div>
        {canteen.map((i) => { const c = counts[i._id]; const diff = c === undefined ? 0 : Number(c) - i.stock; return (
          <div key={i._id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5"><span className="text-[0.85rem] text-white">{i.name}</span><span className="w-14 text-center text-white/60">{i.stock}</span><input value={c ?? ''} onChange={(e) => setCounts((p) => ({ ...p, [i._id]: e.target.value }))} placeholder={`${i.stock}`} type="number" className="w-16 rounded border border-white/15 bg-ink px-2 py-1 text-center text-white" /><span className={`w-12 text-center text-[0.8rem] ${diff < 0 ? 'text-red-light' : diff > 0 ? 'text-green-400' : 'text-white/25'}`}>{c === undefined ? '—' : diff > 0 ? `+${diff}` : diff}</span></div>
        )})}
      </div>
      <button onClick={save} className="mt-4 w-full rounded-lg bg-red py-3 font-display text-sm font-bold uppercase tracking-wider text-white">Save Shift Count</button>
    </div>
  )
}

// ── Admin Finance tab ──
function FinanceTab({ khata, todayBills, onShowReport }: { khata: any[]; todayBills: Bill[]; onShowReport: () => void }) {
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [payment, setPayment] = useState('all')
  const [bills, setBills] = useState<Bill[]>([])
  const [statPeriod, setStatPeriod] = useState<'today' | '7days' | '30days'>('today')
  const [tableStats, setTableStats] = useState<Array<{ name: string; revenue: number; count: number }>>([])

  const load = async () => {
    const params: any = {}; if (from) params.from = from; if (to) params.to = to; if (payment !== 'all') params.payment = payment
    try { const { data } = await api.get('/bills', { params }); setBills(data) } catch {}
  }

  const loadStats = async () => {
    try {
      const { data } = await api.get('/stats', { params: { period: statPeriod } })
      setTableStats(data.topStations || [])
    } catch {
      // Fallback: compute from todayBills
      const map: Record<string, { revenue: number; count: number }> = {}
      todayBills.filter(b => b.mode !== 'canteen').forEach(b => {
        if (!map[b.tableName]) map[b.tableName] = { revenue: 0, count: 0 }
        map[b.tableName].revenue += b.total
        map[b.tableName].count += 1
      })
      setTableStats(Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue))
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { loadStats() }, [statPeriod, todayBills])

  const todayCash = todayBills.reduce((a, b) => b.paymentMethod === 'cash' ? a + b.total : b.paymentMethod === 'split' ? a + (b.cashAmount || 0) : a, 0)
  const todayUpi = todayBills.reduce((a, b) => b.paymentMethod === 'upi' ? a + b.total : b.paymentMethod === 'split' ? a + (b.upiAmount || 0) : a, 0)
  const todayCredit = todayBills.filter((b) => b.paymentMethod === 'credit').reduce((a, b) => a + b.total, 0)
  const todayTotal = todayBills.reduce((a, b) => a + b.total, 0)
  const total = bills.reduce((a, b) => a + b.total, 0)
  const cash = bills.reduce((a, b) => b.paymentMethod === 'cash' ? a + b.total : b.paymentMethod === 'split' ? a + (b.cashAmount || 0) : a, 0)
  const upi = bills.reduce((a, b) => b.paymentMethod === 'upi' ? a + b.total : b.paymentMethod === 'split' ? a + (b.upiAmount || 0) : a, 0)
  const outstanding = khata.reduce((a, k) => a + Math.max(0, k.balance || k.outstandingBalance || 0), 0)
  const maxTableRev = tableStats[0]?.revenue || 1

  return (
    <div>
      {/* Today's Galla */}
      <div className="mb-5 rounded-2xl border border-gold/20 bg-gold/[0.04] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-widest text-gold">Today's Galla</h3>
          <button onClick={onShowReport} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white/60 hover:border-gold hover:text-gold">
            <FileText size={12} /> Day Close Report
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[['Total', todayTotal, 'text-gold'], ['Cash', todayCash, 'text-green-400'], ['UPI', todayUpi, ''], ['Credit', todayCredit, 'text-red-light']].map(([l, v, cls]) => (
            <div key={l as string} className="rounded-xl bg-ink/60 p-3 text-center">
              <div className={`font-display text-lg font-bold ${cls || ''}`} style={cls ? {} : { color: '#23c2ff' }}>{rupee(v as number)}</div>
              <div className="text-[0.55rem] uppercase tracking-wider text-white/35">{l as string}</div>
            </div>
          ))}
        </div>
        {todayTotal > 0 && (
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="bg-green-400" style={{ width: `${(todayCash / todayTotal) * 100}%` }} />
            <div style={{ width: `${(todayUpi / todayTotal) * 100}%`, background: '#23c2ff' }} />
            <div className="bg-red-light" style={{ width: `${(todayCredit / todayTotal) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Table Stats */}
      <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><TrendingUp size={15} className="text-gold" /><h3 className="font-display text-[0.72rem] font-bold uppercase tracking-wider text-white/70">Table Performance</h3></div>
          <div className="flex gap-1">
            {(['today', '7days', '30days'] as const).map((p) => (
              <button key={p} onClick={() => setStatPeriod(p)} className={`rounded-md px-2 py-0.5 text-[0.6rem] font-bold uppercase ${statPeriod === p ? 'bg-gold/20 text-gold' : 'text-white/35 hover:text-white/60'}`}>
                {p === 'today' ? 'Today' : p === '7days' ? '7D' : '30D'}
              </button>
            ))}
          </div>
        </div>
        {tableStats.length === 0 ? (
          <p className="text-center text-[0.75rem] text-white/30 py-3">No data for this period.</p>
        ) : (
          <div className="space-y-2.5">
            {tableStats.slice(0, 8).map((t, rank) => (
              <div key={t.name}>
                <div className="mb-1 flex items-center justify-between text-[0.78rem]">
                  <div className="flex items-center gap-2">
                    <span className={`font-display text-[0.65rem] font-bold w-4 ${rank === 0 ? 'text-gold' : 'text-white/30'}`}>#{rank + 1}</span>
                    <span className="text-white/80">{t.name}</span>
                    <span className="text-[0.62rem] text-white/30">{t.count} bills</span>
                  </div>
                  <span className="font-display font-bold text-gold">{rupee(t.revenue)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div className={`h-full rounded-full transition-all ${rank === 0 ? 'bg-gold' : 'bg-white/30'}`} style={{ width: `${(t.revenue / maxTableRev) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {outstanding > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-light/20 bg-red-light/[0.04] px-4 py-3">
          <span className="text-[0.8rem] text-white/60">Total Outstanding (Khata)</span>
          <span className="font-display font-bold text-red-light">{rupee(outstanding)}</span>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <div><label className="block text-[0.62rem] uppercase text-white/40">From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-white/15 bg-ink-2 px-2 py-1.5 text-sm text-white" /></div>
        <div><label className="block text-[0.62rem] uppercase text-white/40">To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-white/15 bg-ink-2 px-2 py-1.5 text-sm text-white" /></div>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className="rounded-lg border border-white/15 bg-ink-2 px-2 py-1.5 text-sm text-white"><option value="all">All</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="split">Split</option><option value="credit">Credit</option></select>
        <button onClick={load} className="rounded-lg bg-gold px-4 py-1.5 font-display text-[0.72rem] font-bold uppercase text-ink">Filter</button>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[['Total', total, 'text-gold'], ['Cash', cash, 'text-green-400'], ['UPI', upi, '']].map(([l, v, cls]) => (
          <div key={l as string} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 text-center">
            <div className={`font-display text-base font-bold ${cls || ''}`} style={cls ? {} : { color: '#23c2ff' }}>{rupee(v as number)}</div>
            <div className="text-[0.55rem] uppercase tracking-wider text-white/40">{l as string}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {bills.slice(0, 100).map((b) => (
          <div key={b._id} className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2 text-[0.8rem]">
            <div className="flex items-center justify-between">
              <div><span className="text-white/85">{b.tableName}</span> <span className={`text-[0.66rem] uppercase ${b.paymentMethod === 'credit' ? 'text-red-light' : 'text-white/35'}`}>{b.paymentMethod}</span><div className="text-[0.64rem] text-white/35">{b.customerName} · {new Date(b.createdAt).toLocaleDateString('en-IN')}</div></div>
              <span className="font-display font-bold text-gold">{rupee(b.total)}</span>
            </div>
            {b.paymentMethod === 'split' && <div className="mt-1 flex gap-3 text-[0.65rem]"><span className="text-green-400">Cash {rupee(b.cashAmount || 0)}</span><span style={{ color: '#23c2ff' }}>UPI {rupee(b.upiAmount || 0)}</span></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
