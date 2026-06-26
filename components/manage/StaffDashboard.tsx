'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Receipt, Coffee, ClipboardCheck, BarChart3, BookUser,
  LogOut, Play, Square, Trophy, X, Plus as PlusIcon, FileText,
  Minus, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Wallet,
  CheckCircle, Clock, Bell, Link as LinkIcon, Pencil, Trash2,
  User as UserIcon, KeyRound,
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
  playerIds?: string[]
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
  createdAt: string; note?: string; duration?: number
  timeIn?: string; timeOut?: string
  canteenItems?: Array<{ itemId: string; name: string; qty: number; price: number }>
}
type Expense = { _id: string; amount: number; note?: string; createdAt: string }

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

const tableEmoji = (id: string) => {
  if (id.startsWith('royal') || id.startsWith('big')) return '🟢'
  if (id.startsWith('mini')) return '🎱'
  if (id.startsWith('pool')) return '🔵'
  if (id === 'carrom') return '🎯'
  if (id === 'tt') return '🏓'
  if (id === 'chess') return '♟️'
  if (id === 'zapminton') return '🏸'
  return '🎮'
}

function playAlarmSound(expired = false) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const beep = (freq: number, start: number, dur: number, vol = 0.4) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur)
      osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur + 0.05)
    }
    if (expired) {
      beep(880, 0, 0.18); beep(880, 0.22, 0.18); beep(1100, 0.44, 0.35)
    } else {
      beep(660, 0, 0.15); beep(880, 0.2, 0.15)
    }
  } catch {}
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

const hhmm24 = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

const hhmmTo12 = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

const DURATIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hr',  minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hr',  minutes: 120 },
  { label: 'Open',  minutes: 0 },
]

// ── Alarm banner ──
function AlarmBanner({ tableName, message, isExpired, onExtend, onDismiss }: {
  tableName: string; message: string; isExpired: boolean
  onExtend: (min: number) => void; onDismiss: () => void
}) {
  return (
    <div className={`mx-auto mb-4 flex items-center gap-3 rounded-2xl p-4 max-w-content ${isExpired ? 'border border-red-light/40 bg-red-light/10 animate-pulse' : 'border border-yellow-400/40 bg-yellow-400/8'}`}>
      <Bell size={20} className={isExpired ? 'shrink-0 text-red-light' : 'shrink-0 text-yellow-400'} />
      <div className="flex-1 min-w-0">
        <div className={`font-display text-[0.82rem] font-bold ${isExpired ? 'text-red-light' : 'text-yellow-400'}`}>{tableName}</div>
        <div className="text-[0.72rem] text-white/60">{message}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={() => onExtend(30)} className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1.5 font-display text-[0.65rem] font-bold uppercase text-gold">+30m</button>
        <button onClick={() => onExtend(60)} className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1.5 font-display text-[0.65rem] font-bold uppercase text-gold">+1hr</button>
        <button onClick={onDismiss} className="rounded-lg border border-white/15 px-2.5 py-1.5 font-display text-[0.65rem] font-bold uppercase text-white/50">OK</button>
      </div>
    </div>
  )
}

// ── Add Expense modal ──
function AddExpenseModal({ onSaved, onClose }: { onSaved: () => void; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!amount || Number(amount) <= 0) return
    setBusy(true)
    try {
      await api.post('/expenses', { amount: Number(amount), note })
      onSaved(); onClose()
    } catch { setBusy(false) }
  }
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-ink/85 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-2xl border border-red-light/20 bg-ink-2 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-widest text-red-light">Counter Expense</h3>
            <p className="text-[0.65rem] text-white/35">Cash taken from counter</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-white/40" /></button>
        </div>
        <div className="mb-3">
          <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Amount (₹)</label>
          <input
            type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0" min={1}
            className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2.5 text-center text-xl font-bold text-white outline-none focus:border-red-light"
          />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Description</label>
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="e.g. Petrol, Tea, Supplies…"
            className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-red-light"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-white/15 py-2.5 font-display text-[0.7rem] font-bold uppercase text-white/50">Cancel</button>
          <button onClick={save} disabled={busy || !amount} className="flex-1 rounded-lg bg-red py-2.5 font-display text-[0.7rem] font-bold uppercase text-white disabled:opacity-50">
            {busy ? 'Saving…' : 'Record Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Profile modal ──
function ProfileModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [view, setView] = useState<'info' | 'changePin'>('info')
  const [curr, setCurr] = useState('')
  const [next, setNext] = useState('')
  const [conf, setConf] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const changePin = async () => {
    if (!curr || !next || !conf) return setMsg({ ok: false, text: 'All fields required' })
    if (next !== conf) return setMsg({ ok: false, text: 'New PINs do not match' })
    if (next.length < 4) return setMsg({ ok: false, text: 'PIN must be at least 4 digits' })
    setBusy(true); setMsg(null)
    try {
      await api.post('/auth/change-pin', { currentPassword: curr, newPassword: next })
      setMsg({ ok: true, text: 'PIN changed! Use new PIN next time you log in.' })
      setCurr(''); setNext(''); setConf('')
    } catch (e: any) {
      setMsg({ ok: false, text: e.response?.data?.message || 'Failed to change PIN' })
    } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/85 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-2xl border border-white/12 bg-ink-2 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-widest text-white">My Profile</h3>
          <button onClick={onClose}><X size={16} className="text-white/40" /></button>
        </div>

        {/* tab row */}
        <div className="mb-4 flex gap-1.5">
          <button onClick={() => setView('info')} className={`flex-1 rounded-lg py-1.5 font-display text-[0.68rem] font-bold uppercase ${view === 'info' ? 'bg-gold text-ink' : 'border border-white/15 text-white/50'}`}>
            <UserIcon size={11} className="mr-1 inline" />Info
          </button>
          <button onClick={() => setView('changePin')} className={`flex-1 rounded-lg py-1.5 font-display text-[0.68rem] font-bold uppercase ${view === 'changePin' ? 'bg-gold text-ink' : 'border border-white/15 text-white/50'}`}>
            <KeyRound size={11} className="mr-1 inline" />Change PIN
          </button>
        </div>

        {view === 'info' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="text-[0.58rem] uppercase tracking-wider text-white/35">Name</div>
              <div className="mt-0.5 font-semibold text-white">{user?.name || '—'}</div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="text-[0.58rem] uppercase tracking-wider text-white/35">Phone Number</div>
              <div className="mt-0.5 font-semibold text-white">{user?.phone || '—'}</div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="text-[0.58rem] uppercase tracking-wider text-white/35">Role</div>
              <div className="mt-0.5 font-semibold capitalize text-gold">{user?.role || '—'}</div>
            </div>
          </div>
        )}

        {view === 'changePin' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[0.6rem] uppercase tracking-wider text-white/40">Current PIN</label>
              <input type="password" value={curr} onChange={(e) => setCurr(e.target.value)} placeholder="••••" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-center tracking-[0.25em] text-white outline-none focus:border-gold" />
            </div>
            <div>
              <label className="mb-1 block text-[0.6rem] uppercase tracking-wider text-white/40">New PIN</label>
              <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-center tracking-[0.25em] text-white outline-none focus:border-gold" />
            </div>
            <div>
              <label className="mb-1 block text-[0.6rem] uppercase tracking-wider text-white/40">Confirm New PIN</label>
              <input type="password" value={conf} onChange={(e) => setConf(e.target.value)} placeholder="••••" onKeyDown={(e) => e.key === 'Enter' && changePin()} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-center tracking-[0.25em] text-white outline-none focus:border-gold" />
            </div>
            {msg && <p className={`text-[0.72rem] ${msg.ok ? 'text-green-400' : 'text-red-light'}`}>{msg.text}</p>}
            <button onClick={changePin} disabled={busy} className="w-full rounded-lg bg-gold py-2.5 font-display text-[0.72rem] font-bold uppercase text-ink disabled:opacity-50">
              {busy ? 'Changing…' : 'Change PIN'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PIN gate modal ──
function PinGateModal({ onVerified, onClose }: { onVerified: () => void; onClose: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const verify = async () => {
    if (!pin) return
    setBusy(true); setError('')
    try {
      await api.post('/auth/verify-pin', { password: pin })
      onVerified()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Wrong PIN')
      setBusy(false)
    }
  }
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/85 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-72 rounded-2xl border border-gold/25 bg-ink-2 p-6 shadow-2xl">
        <h3 className="mb-1 font-display text-[0.72rem] font-bold uppercase tracking-widest text-gold">Admin PIN Required</h3>
        <p className="mb-4 text-[0.68rem] text-white/35">Enter your login PIN to continue</p>
        <input
          type="password" autoFocus value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && verify()}
          placeholder="••••"
          className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2.5 text-center text-xl tracking-[0.3em] text-white outline-none focus:border-gold"
          maxLength={6}
        />
        {error && <p className="mt-2 text-center text-[0.72rem] text-red-light">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-white/15 py-2 font-display text-[0.7rem] font-bold uppercase text-white/50">Cancel</button>
          <button onClick={verify} disabled={busy} className="flex-1 rounded-lg bg-gold py-2 font-display text-[0.7rem] font-bold uppercase text-ink disabled:opacity-50">
            {busy ? '…' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit bill modal ──
function EditBillModal({ bill, onSaved, onClose }: { bill: Bill; onSaved: () => void; onClose: () => void }) {
  const [pm, setPm] = useState(bill.paymentMethod as 'cash' | 'upi' | 'split' | 'credit')
  const [discount, setDiscount] = useState(String((bill as any).discount ?? 0))
  const [note, setNote] = useState(bill.note ?? '')
  const [custName, setCustName] = useState(bill.customerName ?? '')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    const disc = Math.min(100, Math.max(0, Number(discount) || 0))
    const base = (bill.amount || 0) + (bill.canteenAmount || 0)
    const total = Math.round(base * (1 - disc / 100))
    try {
      await api.put(`/bills/${bill._id}`, { paymentMethod: pm, discount: disc, total, note, customerName: custName })
      onSaved(); onClose()
    } catch { setBusy(false) }
  }
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-ink/85 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-ink-2 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-widest text-white">Edit Bill</h3>
            <p className="text-[0.65rem] text-white/35">{bill.tableName} · {rupee(bill.total)}</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-white/40" /></button>
        </div>
        <div className="mb-3">
          <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Payment Method</label>
          <div className="flex gap-1.5 flex-wrap">
            {(['cash', 'upi', 'split', 'credit'] as const).map((m) => (
              <button key={m} onClick={() => setPm(m)} className={`rounded-md px-3 py-1 font-display text-[0.68rem] font-bold uppercase transition-colors ${pm === m ? 'bg-gold text-ink' : 'border border-white/15 text-white/50 hover:border-white/30'}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Customer Name</label>
          <input value={custName} onChange={(e) => setCustName(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        </div>
        <div className="mb-3">
          <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Discount %</label>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} min={0} max={100} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          {Number(discount) > 0 && (
            <p className="mt-1 text-[0.65rem] text-white/40">
              New total: {rupee(Math.round(((bill.amount || 0) + (bill.canteenAmount || 0)) * (1 - Number(discount) / 100)))}
            </p>
          )}
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Note</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note…" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-white/15 py-2 font-display text-[0.7rem] font-bold uppercase text-white/50">Cancel</button>
          <button onClick={save} disabled={busy} className="flex-1 rounded-lg bg-gold py-2 font-display text-[0.7rem] font-bold uppercase text-ink disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Start modal ──
function StartModal({ table, customers, onStart, onClose }: {
  table: TableConfig
  customers: Array<{ _id: string; name: string; balance?: number }>
  onStart: (o: any) => void; onClose: () => void
}) {
  const [mode, setMode] = useState<'timer' | 'frames'>('timer')
  const [cust, setCust] = useState('Walk-in')
  const [custId, setCustId] = useState<string | null>(null)
  const [players, setPlayers] = useState(['Player 1', 'Player 2'])
  const [playerIds, setPlayerIds] = useState<string[]>(['', ''])
  const [playerPicker, setPlayerPicker] = useState<number | null>(null)
  const [hourRate, setHourRate] = useState(table.hour ?? 0)
  const [frameCharge, setFrameCharge] = useState(table.frame ?? 0)
  const [durationMin, setDurationMin] = useState(0)
  const [forgot, setForgot] = useState(false)
  const [agoMin, setAgoMin] = useState('0')

  const fixedAmount = durationMin > 0 ? Math.round(hourRate * (durationMin / 60)) : null

  const addPlayer = () => {
    if (players.length < 5) {
      setPlayers([...players, `Player ${players.length + 1}`])
      setPlayerIds([...playerIds, ''])
    }
  }
  const removePlayer = (i: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, j) => j !== i))
      setPlayerIds(playerIds.filter((_, j) => j !== i))
    }
  }
  const updatePlayer = (i: number, v: string) => {
    setPlayers(players.map((p, j) => j === i ? v : p))
    setPlayerIds(playerIds.map((id, j) => j === i ? '' : id)) // unlink if typing manually
  }
  const linkPlayer = (i: number, c: { _id: string; name: string }) => {
    setPlayers(players.map((p, j) => j === i ? c.name : p))
    setPlayerIds(playerIds.map((id, j) => j === i ? c._id : id))
    setPlayerPicker(null)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); setPlayerPicker(null) }}>
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase text-white">{tableEmoji(table.id)} Start {table.name}</h3>
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
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Charge ₹/frame</label>
            <input type="number" value={frameCharge} onChange={(e) => setFrameCharge(Number(e.target.value))} className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Players</label>
              <button onClick={addPlayer} disabled={players.length >= 5} className="flex items-center gap-1 rounded-md border border-gold/30 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-gold disabled:opacity-30">
                <PlusIcon size={10} /> Add
              </button>
            </div>
            <div className="mb-3 space-y-1.5">
              {players.map((p, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        value={p}
                        onChange={(e) => updatePlayer(i, e.target.value)}
                        placeholder={`Player ${i + 1}`}
                        className={`w-full rounded-lg border px-3 py-2 pr-8 text-sm text-white outline-none focus:border-gold ${playerIds[i] ? 'border-gold/40 bg-gold/5' : 'border-white/15 bg-ink'}`}
                      />
                      <button
                        onClick={() => setPlayerPicker(playerPicker === i ? null : i)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 ${playerIds[i] ? 'text-gold' : 'text-white/25 hover:text-white/60'}`}
                        title="Link to registered customer"
                      >
                        <LinkIcon size={13} />
                      </button>
                    </div>
                    {players.length > 2 && (
                      <button onClick={() => removePlayer(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/12 text-white/40 hover:border-red-light hover:text-red-light">
                        <Minus size={14} />
                      </button>
                    )}
                  </div>
                  {playerPicker === i && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-gold/25 bg-ink-2 py-1 shadow-xl">
                      {customers.length === 0 && <div className="px-3 py-2 text-[0.72rem] text-white/35">No registered customers</div>}
                      {customers.map((c) => (
                        <button key={c._id} onClick={() => linkPlayer(i, c)} className="flex w-full items-center justify-between px-3 py-2 text-[0.78rem] text-white hover:bg-white/5">
                          <span>{c.name}</span>
                          {(c.balance || 0) > 0 && <span className="text-[0.65rem] text-red-light">owes {rupee(c.balance!)}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {players.some((_, i) => playerIds[i]) && (
              <div className="mb-3 rounded-lg border border-gold/15 bg-gold/[0.04] px-3 py-2 text-[0.68rem] text-white/40">
                <span className="text-gold">🔗 Linked:</span> {players.filter((_, i) => playerIds[i]).join(', ')} — frame debts will auto-update their khata.
              </div>
            )}
          </>
        )}

        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Customer</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button
            onClick={() => { setCust('Walk-in'); setCustId(null) }}
            className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === 'Walk-in' ? 'text-white' : 'border border-white/12 text-white/55'}`}
            style={cust === 'Walk-in' ? { background: '#1f8a4c' } : undefined}
          >Walk-in</button>
          {customers.map((c) => (
            <button
              key={c._id}
              onClick={() => { setCust(c.name); setCustId(c._id) }}
              className={`relative rounded-md px-2.5 py-1 text-[0.72rem] ${cust === c.name && custId === c._id ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}
            >
              {c.name}
              {(c.balance || 0) > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-light text-[0.45rem] font-bold text-white">!</span>
              )}
            </button>
          ))}
        </div>
        {custId && (customers.find(c => c._id === custId)?.balance || 0) > 0 && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-light/25 bg-red-light/[0.06] px-3 py-1.5">
            <AlertTriangle size={12} className="shrink-0 text-red-light" />
            <span className="text-[0.68rem] text-red-light">Outstanding: {rupee(customers.find(c => c._id === custId)!.balance!)}</span>
          </div>
        )}
        <input
          value={cust === 'Walk-in' ? '' : cust}
          onChange={(e) => { setCust(e.target.value || 'Walk-in'); setCustId(null) }}
          placeholder="Or type name…"
          className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold"
        />

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
            mode, customerName: cust, customerId: custId, hourRate, frameCharge,
            players: mode === 'frames' ? players : [],
            playerIds: mode === 'frames' ? playerIds : [],
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
  onProcess: (method: string, disc: number, cashAmt?: number, upiAmt?: number, resolvedCustomerId?: string, resolvedCustomerName?: string) => void
  onClose: () => void
}) {
  const play = sessAmount(table, session, now)
  const canteen = (session.cart || []).reduce((a, c) => a + c.price * c.qty, 0)
  const [disc, setDisc] = useState('0')
  const [pm, setPm] = useState<'cash' | 'upi' | 'split' | 'credit'>('cash')
  const [cashAmt, setCashAmt] = useState('')
  const [upiAmt, setUpiAmt] = useState('')

  // Registration flow for credit with unregistered customer
  const needsReg = pm === 'credit' && !session.customerId
  const isWalkIn = session.customerName === 'Walk-in' || !session.customerName
  const [regName, setRegName] = useState(isWalkIn ? '' : (session.customerName || ''))
  const [regPhone, setRegPhone] = useState('')
  const [regState, setRegState] = useState<'idle' | 'busy' | 'done' | 'exists'>('idle')
  const [regError, setRegError] = useState('')
  const [regPin, setRegPin] = useState('')
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const [resolvedName, setResolvedName] = useState<string | null>(null)

  const d = Math.min(Number(disc) || 0, play + canteen)
  const total = play + canteen - d
  const frameMode = session.mode === 'frames'
  const ft = frameMode ? frameTotals(session) : null

  const handleCashChange = (v: string) => { setCashAmt(v); setUpiAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const handleUpiChange = (v: string) => { setUpiAmt(v); setCashAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const splitValid = pm !== 'split' || (Number(cashAmt) + Number(upiAmt) === total && total > 0)

  // Credit is allowed to proceed only if customer is registered or registration done
  const creditReady = !needsReg || regState === 'done'
  const canCollect = splitValid && creditReady

  const registerCustomer = async () => {
    if (!regName.trim() || !regPhone.trim()) { setRegError('Name and phone are required'); return }
    if (regPhone.replace(/\D/g,'').length < 10) { setRegError('Enter a valid 10-digit phone number'); return }
    setRegState('busy'); setRegError('')
    try {
      const { data } = await api.post('/customers', { name: regName.trim(), phone: regPhone.trim() })
      setResolvedId(data._id)
      setResolvedName(data.name)
      setRegPin(data.defaultPin || regPhone.replace(/\D/g,'').slice(-4))
      setRegState('done')
    } catch (err: any) {
      const msg = err?.response?.data?.message || ''
      if (msg.toLowerCase().includes('already')) {
        setRegState('exists'); setRegError(msg)
      } else {
        setRegState('idle'); setRegError(msg || 'Registration failed')
      }
    }
  }

  const handleCollect = () => {
    if (!canCollect) return
    onProcess(
      pm, d,
      pm === 'split' ? Number(cashAmt) : undefined,
      pm === 'split' ? Number(upiAmt) : undefined,
      resolvedId || undefined,
      resolvedName || undefined,
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase text-white">Bill · {table.name}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mb-3 space-y-1.5 rounded-xl bg-white/[0.03] p-3 text-[0.85rem]">
          {frameMode && ft ? (
            session.players.map((p, i) => ft.owed[i] > 0 && (
              <div key={i} className="flex justify-between text-white/60">
                <span>{p || `P${i+1}`}</span>
                <span className="text-red-light font-display font-bold">{rupee(ft.owed[i])}</span>
              </div>
            ))
          ) : (
            <div className="flex justify-between text-white/60"><span>Table time</span><span className="text-white">{rupee(play)}</span></div>
          )}
          {canteen > 0 && <div className="flex justify-between text-white/60"><span>Canteen</span><span className="text-white">{rupee(canteen)}</span></div>}
          {d > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{rupee(d)}</span></div>}
          <div className="flex justify-between border-t border-white/10 pt-1.5 font-display font-bold"><span>Total</span><span className="text-gold">{rupee(total)}</span></div>
        </div>

        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Discount ₹</label>
        <input type="number" value={disc} onChange={(e) => setDisc(e.target.value)} className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />

        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Payment Method</label>
        <div className="mb-3 flex gap-1.5">
          {(['cash', 'upi', 'split', 'credit'] as const).map((m) => (
            <button key={m} onClick={() => { setPm(m); setCashAmt(''); setUpiAmt(''); setRegState('idle'); setRegError('') }} className={`flex-1 rounded-lg py-2 text-[0.7rem] font-bold uppercase ${pm === m ? 'bg-gold text-ink' : 'border border-white/12 text-white/50'}`}>{m}</button>
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

        {/* ── Credit flow ── */}
        {pm === 'credit' && (
          session.customerId ? (
            /* Registered customer — just confirm */
            <div className="mb-3 rounded-xl border border-red-light/20 bg-red-light/[0.05] px-3 py-2.5">
              {frameMode && (session.playerIds || []).some(id => !id) ? (
                <p className="text-[0.72rem] text-orange-400">⚠ Some players are not linked — their khata won't be updated.</p>
              ) : (
                <p className="text-[0.72rem] text-red-light">⚠ {rupee(total)} will be added to <span className="font-bold text-white">{session.customerName}</span>'s khata as outstanding balance.</p>
              )}
            </div>
          ) : regState === 'done' ? (
            /* ✓ Registration succeeded */
            <div className="mb-3 rounded-xl border border-green-400/30 bg-green-400/[0.05] px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle size={15} className="text-green-400" />
                <span className="text-[0.78rem] font-bold text-green-400">Customer registered!</span>
              </div>
              <div className="text-[0.72rem] text-white/70"><span className="font-semibold text-white">{resolvedName}</span> · {regPhone}</div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-ink/60 px-3 py-1.5">
                <span className="text-[0.65rem] uppercase tracking-wider text-white/40">Default PIN</span>
                <span className="font-display text-sm font-bold tracking-widest text-gold">{regPin}</span>
                <span className="text-[0.6rem] text-white/30">— share with customer</span>
              </div>
              <div className="mt-1.5 text-[0.65rem] text-white/35">Bill will auto-add to their khatabook.</div>
            </div>
          ) : (
            /* Registration form */
            <div className="mb-3 rounded-xl border border-gold/20 bg-gold/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookUser size={14} className="text-gold" />
                <span className="font-display text-[0.72rem] font-bold uppercase tracking-wider text-gold">
                  {isWalkIn ? 'Register customer to give credit' : `Register "${session.customerName}" to track credit`}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="mb-0.5 block text-[0.62rem] uppercase tracking-wider text-white/40">Full Name</label>
                  <input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Customer name"
                    className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[0.62rem] uppercase tracking-wider text-white/40">Phone Number</label>
                  <input
                    value={regPhone}
                    onChange={(e) => { setRegPhone(e.target.value); setRegError(''); setRegState('idle') }}
                    placeholder="10-digit mobile number"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold"
                  />
                </div>
                {regError && (
                  <p className="text-[0.68rem] text-red-light">{regError}</p>
                )}
                {regState === 'exists' && (
                  <p className="text-[0.65rem] text-orange-400">This phone is already registered. Search them in the Khata tab and link them to this session.</p>
                )}
                <button
                  onClick={registerCustomer}
                  disabled={regState === 'busy'}
                  className="w-full rounded-lg bg-gold py-2 font-display text-[0.72rem] font-bold uppercase tracking-wider text-ink disabled:opacity-50"
                >
                  {regState === 'busy' ? 'Registering…' : '✓ Register & Continue'}
                </button>
              </div>
              <p className="mt-2 text-[0.6rem] text-white/25">Default PIN = last 4 digits of phone. Customer can change from their app.</p>
            </div>
          )
        )}

        <button
          onClick={handleCollect}
          disabled={!canCollect}
          className={`w-full rounded-lg py-3 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors ${canCollect ? 'bg-red' : 'cursor-not-allowed bg-white/10 text-white/30'}`}
        >
          {needsReg && regState !== 'done' ? '🔒 Register customer first' : `✅ Collect ${rupee(total)}`}
        </button>
      </div>
    </div>
  )
}

// ── Add Bill modal ──
function AddBillModal({ canteen, customers, onAdd, onClose }: {
  canteen: Item[]
  customers: Array<{ _id: string; name: string; balance?: number }>
  onAdd: (b: any) => void; onClose: () => void
}) {
  const [kind, setKind] = useState<'table' | 'canteen'>('table')
  const [tableId, setTableId] = useState(TABLES[0].id)
  const [amount, setAmount] = useState('')
  const [cust, setCust] = useState('Walk-in')
  const [custId, setCustId] = useState<string | null>(null)
  const [pm, setPm] = useState('cash')
  const [cashAmt, setCashAmt] = useState('')
  const [upiAmt, setUpiAmt] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})
  // Credit registration
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regState, setRegState] = useState<'idle' | 'busy' | 'done' | 'exists'>('idle')
  const [regError, setRegError] = useState('')
  const [regPin, setRegPin] = useState('')
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const [resolvedName, setResolvedName] = useState<string | null>(null)

  const nowDate = new Date()
  const [startTime, setStartTime] = useState(() => hhmm24(new Date(nowDate.getTime() - 60 * 60000)))
  const [endTime, setEndTime] = useState(() => hhmm24(nowDate))

  const t = TABLES.find((x) => x.id === tableId)!
  const cAmt = canteen.reduce((a, i) => a + (cart[i._id] || 0) * i.price, 0)
  const play = kind === 'table' ? Number(amount) || t.hour || 0 : 0
  const total = play + cAmt

  const calcDuration = () => {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    return diff > 0 ? diff : 0
  }
  const handleCashChange = (v: string) => { setCashAmt(v); setUpiAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const handleUpiChange = (v: string) => { setUpiAmt(v); setCashAmt(String(Math.max(0, +(total - (Number(v) || 0)).toFixed(0)))) }
  const splitValid = pm !== 'split' || (Number(cashAmt) + Number(upiAmt) === total && total > 0)
  const needsReg = pm === 'credit' && !custId
  const creditReady = !needsReg || regState === 'done'
  const canSave = total > 0 && splitValid && creditReady

  const registerCustomer = async () => {
    if (!regName.trim() || !regPhone.trim()) { setRegError('Name and phone are required'); return }
    if (regPhone.replace(/\D/g,'').length < 10) { setRegError('Enter a valid 10-digit phone number'); return }
    setRegState('busy'); setRegError('')
    try {
      const { data } = await api.post('/customers', { name: regName.trim(), phone: regPhone.trim() })
      setResolvedId(data._id); setResolvedName(data.name)
      setRegPin(data.defaultPin || regPhone.replace(/\D/g,'').slice(-4))
      setRegState('done')
    } catch (err: any) {
      const msg = err?.response?.data?.message || ''
      setRegState(msg.toLowerCase().includes('already') ? 'exists' : 'idle')
      setRegError(msg || 'Registration failed')
    }
  }

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
            <div><label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Table</label><select value={tableId} onChange={(e) => setTableId(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white">{TABLES.map((x) => <option key={x.id} value={x.id}>{tableEmoji(x.id)} {x.name}</option>)}</select></div>
            <div><label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Amount ₹</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`${t.hour}`} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" /></div>
          </div>
        )}
        <label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Session Time</label>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="mb-0.5 block text-[0.6rem] uppercase tracking-wider text-white/30">Start</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" />
          </div>
          <span className="mt-5 text-white/30">→</span>
          <div className="flex-1">
            <label className="mb-0.5 block text-[0.6rem] uppercase tracking-wider text-white/30">End</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" />
          </div>
          <div className="mt-5 text-right text-[0.7rem] text-white/35 min-w-[48px]">{calcDuration()} min</div>
        </div>

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
          <button onClick={() => { setCust('Walk-in'); setCustId(null) }} className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === 'Walk-in' ? 'text-white' : 'border border-white/12 text-white/55'}`} style={cust === 'Walk-in' ? { background: '#1f8a4c' } : undefined}>Walk-in</button>
          {customers.map((c) => (
            <button key={c._id} onClick={() => { setCust(c.name); setCustId(c._id); setRegName(c.name) }} className={`relative rounded-md px-2.5 py-1 text-[0.72rem] ${cust === c.name && custId === c._id ? 'bg-gold text-ink' : 'border border-white/12 text-white/55'}`}>
              {c.name}
              {(c.balance || 0) > 0 && <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-light text-[0.45rem] font-bold text-white">!</span>}
            </button>
          ))}
        </div>
        <input value={cust === 'Walk-in' ? '' : cust} onChange={(e) => { setCust(e.target.value || 'Walk-in'); setCustId(null); setRegName(e.target.value) }} placeholder="Or type name…" className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" />
        <label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Payment Method</label>
        <div className="mb-3 flex gap-1.5">
          {['cash', 'upi', 'split', 'credit'].map((m) => (
            <button key={m} onClick={() => { setPm(m); setCashAmt(''); setUpiAmt(''); setRegState('idle'); setRegError('') }} className={`flex-1 rounded-lg py-1.5 text-[0.68rem] font-bold uppercase ${pm === m ? 'bg-gold text-ink' : 'border border-white/12 text-white/50'}`}>{m}</button>
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
        {/* Credit registration — same as BillModal */}
        {pm === 'credit' && (
          custId ? (
            <div className="mb-3 rounded-xl border border-red-light/20 bg-red-light/[0.05] px-3 py-2">
              <p className="text-[0.72rem] text-red-light">⚠ {rupee(total)} will be added to <span className="font-bold text-white">{cust}</span>'s khata as outstanding balance.</p>
            </div>
          ) : regState === 'done' ? (
            <div className="mb-3 rounded-xl border border-green-400/30 bg-green-400/[0.05] px-4 py-3">
              <div className="flex items-center gap-2 mb-1"><CheckCircle size={14} className="text-green-400" /><span className="text-[0.78rem] font-bold text-green-400">Registered!</span></div>
              <div className="text-[0.72rem] text-white/70"><span className="font-semibold text-white">{resolvedName}</span> · {regPhone}</div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-ink/60 px-3 py-1.5">
                <span className="text-[0.65rem] uppercase tracking-wider text-white/40">Default PIN</span>
                <span className="font-display text-sm font-bold tracking-widest text-gold">{regPin}</span>
              </div>
            </div>
          ) : (
            <div className="mb-3 rounded-xl border border-gold/20 bg-gold/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2"><BookUser size={13} className="text-gold" /><span className="font-display text-[0.68rem] font-bold uppercase text-gold">Register to track credit in Khata</span></div>
              <div className="space-y-2">
                <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Customer name" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
                <input value={regPhone} onChange={(e) => { setRegPhone(e.target.value); setRegError(''); setRegState('idle') }} placeholder="10-digit phone number" type="tel" inputMode="numeric" maxLength={10} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
                {regError && <p className="text-[0.68rem] text-red-light">{regError}</p>}
                {regState === 'exists' && <p className="text-[0.65rem] text-orange-400">Phone already registered — search in Khata tab.</p>}
                <button onClick={registerCustomer} disabled={regState === 'busy'} className="w-full rounded-lg bg-gold py-2 font-display text-[0.7rem] font-bold uppercase text-ink disabled:opacity-50">{regState === 'busy' ? 'Registering…' : '✓ Register & Continue'}</button>
              </div>
            </div>
          )
        )}
        <div className="mb-3 flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className="text-[0.8rem] text-white/50">Total</span><span className="font-display font-bold text-gold">{rupee(total)}</span></div>
        <button
          onClick={() => {
            if (!canSave) return
            const finalCustomerId = resolvedId || custId || null
            const finalCustomerName = resolvedName || (custId ? cust : cust)
            const items = canteen.filter((i) => cart[i._id]).map((i) => ({ itemId: i._id, name: i.name, price: i.price, qty: cart[i._id] }))
            const dur = calcDuration()
            onAdd({
              tableId: kind === 'canteen' ? 'counter' : tableId,
              tableName: kind === 'canteen' ? 'Counter' : t.name,
              mode: kind === 'canteen' ? 'canteen' : 'timer',
              amount: play, canteenAmount: cAmt, canteenItems: items, total,
              duration: dur, timeIn: hhmmTo12(startTime), timeOut: hhmmTo12(endTime),
              paymentMethod: pm, customerName: finalCustomerName, customerId: finalCustomerId,
              cashAmount: pm === 'cash' ? total : pm === 'split' ? Number(cashAmt) : 0,
              upiAmount: pm === 'upi' ? total : pm === 'split' ? Number(upiAmt) : 0,
            })
          }}
          disabled={!canSave}
          className={`w-full rounded-lg py-3 font-display text-sm font-bold uppercase tracking-wider text-white ${canSave ? 'bg-red' : 'cursor-not-allowed bg-white/10 text-white/30'}`}
        >
          {needsReg && regState !== 'done' ? '🔒 Register customer first' : '💾 Save Bill'}
        </button>
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

// ── Day Close Report modal (with date picker + canteen stock) ──
function ShiftReportModal({ canteen, onClose }: { canteen: Item[]; onClose: () => void }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(todayStr)
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/bills', { params: { from: date, to: date } })
      .then(r => setBills(Array.isArray(r.data) ? r.data : []))
      .catch(() => setBills([]))
      .finally(() => setLoading(false))
  }, [date])

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const cash = bills.reduce((a, b) => b.paymentMethod === 'cash' ? a + b.total : b.paymentMethod === 'split' ? a + (b.cashAmount || 0) : a, 0)
  const upi = bills.reduce((a, b) => b.paymentMethod === 'upi' ? a + b.total : b.paymentMethod === 'split' ? a + (b.upiAmount || 0) : a, 0)
  const credit = bills.filter((b) => b.paymentMethod === 'credit').reduce((a, b) => a + b.total, 0)
  const splitBills = bills.filter((b) => b.paymentMethod === 'split')
  const splitTotal = splitBills.reduce((a, b) => a + b.total, 0)
  const total = bills.reduce((a, b) => a + b.total, 0)
  const tablePlay = bills.filter((b) => b.mode !== 'canteen').reduce((a, b) => a + (b.amount || 0), 0)
  const canteenSales = bills.reduce((a, b) => a + (b.canteenAmount || 0), 0)
  const byTable = bills.reduce((acc, b) => { if (b.mode === 'canteen') return acc; acc[b.tableName] = (acc[b.tableName] || 0) + b.total; return acc }, {} as Record<string, number>)

  // Canteen sold quantities from bills
  const soldMap: Record<string, number> = {}
  bills.forEach(b => (b.canteenItems || []).forEach(ci => { soldMap[ci.name] = (soldMap[ci.name] || 0) + ci.qty }))

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gold/25 bg-ink-2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div><h3 className="font-display text-lg font-bold uppercase text-white">Day Close Report</h3><p className="text-[0.72rem] text-white/40">{dateLabel}</p></div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        {/* Date picker */}
        <div className="mb-5 flex items-center gap-2">
          <button onClick={() => setDate(d => { const dt = new Date(d); dt.setDate(dt.getDate() - 1); return dt.toISOString().split('T')[0] })} className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.7rem] text-white/60 hover:border-gold hover:text-gold">‹ Prev</button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={todayStr} className="flex-1 rounded-lg border border-white/15 bg-ink px-3 py-1.5 text-center text-[0.78rem] text-white" />
          <button onClick={() => setDate(d => { const dt = new Date(d); dt.setDate(dt.getDate() + 1); const t = dt.toISOString().split('T')[0]; return t <= todayStr ? t : d })} className="rounded-lg border border-white/15 px-3 py-1.5 text-[0.7rem] text-white/60 hover:border-gold hover:text-gold">Next ›</button>
          <button onClick={() => setDate(todayStr)} className="rounded-lg bg-gold/15 px-3 py-1.5 text-[0.7rem] font-bold text-gold">Today</button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[0.85rem] text-white/35">Loading…</div>
        ) : bills.length === 0 ? (
          <div className="py-10 text-center text-[0.85rem] text-white/35">No bills found for this date.</div>
        ) : (
          <>
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
                  <div className="mb-1.5 flex items-center justify-between text-[0.85rem]"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full bg-gold" /><span className="text-white/70">Split ({splitBills.length})</span></div><span className="font-display font-bold text-gold">{rupee(splitTotal)}</span></div>
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
            {Object.keys(byTable).length > 0 && (
              <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <h4 className="mb-3 text-[0.68rem] font-bold uppercase tracking-wider text-white/40">Table-wise Revenue</h4>
                <div className="space-y-1.5">
                  {Object.entries(byTable).sort(([, a], [, b]) => b - a).map(([name, amt]) => (
                    <div key={name} className="flex items-center justify-between text-[0.82rem]"><span className="text-white/60">{name}</span><span className="font-display font-bold text-gold">{rupee(amt)}</span></div>
                  ))}
                </div>
              </div>
            )}
            {/* Canteen stock */}
            {canteen.length > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <h4 className="mb-3 text-[0.68rem] font-bold uppercase tracking-wider text-white/40">Canteen — Sold & Remaining</h4>
                <div className="overflow-hidden rounded-lg border border-white/8">
                  <div className="grid grid-cols-[1fr_auto_auto] border-b border-white/8 bg-white/5 px-3 py-2 text-[0.6rem] font-bold uppercase tracking-wider text-white/40">
                    <span>Item</span><span className="w-14 text-center">Sold today</span><span className="w-14 text-center">Remaining</span>
                  </div>
                  {canteen.map(i => (
                    <div key={i._id} className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-2 text-[0.8rem]">
                      <span className="text-white/80">{i.name} <span className="text-white/35">₹{i.price}</span></span>
                      <span className={`w-14 text-center font-display font-bold ${soldMap[i.name] ? 'text-gold' : 'text-white/25'}`}>{soldMap[i.name] || 0}</span>
                      <span className={`w-14 text-center font-display font-bold ${i.stock <= 2 ? 'text-red-light' : 'text-green-400'}`}>{i.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Khata tab ──
function KhataTab({ onBillCreated }: { onBillCreated?: () => void }) {
  const [customers, setCustomers] = useState<KhataCustomer[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [txns, setTxns] = useState<Record<string, KhataTransaction[]>>({})
  const [search, setSearch] = useState('')
  const [payFor, setPayFor] = useState<KhataCustomer | null>(null)
  const [payType, setPayType] = useState<'got' | 'gave'>('got')
  const [khataPinGate, setKhataPinGate] = useState<{ onVerified: () => void } | null>(null)
  const [editCust, setEditCust] = useState<KhataCustomer | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBusy, setEditBusy] = useState(false)
  const { user } = useAuth()
  const isAdmin = (user as any)?.role === 'admin'

  const loadAll = async () => {
    try { const { data } = await api.get('/khata'); setCustomers(data) } catch {}
  }
  useEffect(() => { loadAll() }, [])

  const openEdit = (c: KhataCustomer) => {
    setEditCust(c); setEditName(c.name); setEditPhone(c.phone || '')
  }
  const saveEdit = async () => {
    if (!editCust) return
    setEditBusy(true)
    try {
      await api.put(`/customers/${editCust._id}`, { name: editName, phone: editPhone })
      await loadAll(); setEditCust(null)
    } catch {}
    setEditBusy(false)
  }
  const deleteCustomer = async (c: KhataCustomer) => {
    await api.delete(`/customers/${c._id}`).catch(() => {})
    if (expanded === c._id) setExpanded(null)
    await loadAll()
  }

  const loadTxns = async (id: string) => {
    if (txns[id]) return
    try { const { data } = await api.get(`/khata/${id}`); setTxns(p => ({ ...p, [id]: data.transactions || [] })) } catch {}
  }

  const toggle = async (c: KhataCustomer) => {
    if (expanded === c._id) { setExpanded(null); return }
    setExpanded(c._id)
    await loadTxns(c._id)
  }

  const submit = async (amount: string, note: string, payMethod: 'cash' | 'upi') => {
    if (!payFor || !amount || Number(amount) <= 0) return
    const amt = Number(amount)
    await api.post(`/khata/${payFor._id}`, { type: payType, amount: amt, note }).catch(() => {})
    // When receiving credit payment, create a bill so it appears in finance tab
    if (payType === 'got') {
      const t = new Date()
      await api.post('/bills', {
        tableId: 'khata', tableName: 'Credit Collected',
        mode: 'canteen', amount: amt, canteenAmount: 0, canteenItems: [],
        discount: 0, total: amt, paymentMethod: payMethod,
        cashAmount: payMethod === 'cash' ? amt : 0,
        upiAmount: payMethod === 'upi' ? amt : 0,
        customerName: payFor.name, customerId: payFor._id,
        timeIn: fmtTime(t), timeOut: fmtTime(t),
        note: note || `Credit collected from ${payFor.name}`,
      }).catch(() => {})
      onBillCreated?.()
    }
    const prev = payFor
    setPayFor(null)
    await loadAll()
    if (expanded === prev._id) {
      const { data } = await api.get(`/khata/${prev._id}`).catch(() => ({ data: null })) as any
      if (data) setTxns(p => ({ ...p, [prev._id]: data.transactions || [] }))
    }
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  ).sort((a, b) => (b.balance || 0) - (a.balance || 0))

  const totalOutstanding = customers.reduce((a, c) => a + Math.max(0, c.balance || 0), 0)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-light/20 bg-red-light/[0.04] px-5 py-4">
        <div>
          <div className="text-[0.65rem] uppercase tracking-wider text-white/40">Total Outstanding</div>
          <div className="font-display text-2xl font-bold text-red-light">{rupee(totalOutstanding)}</div>
        </div>
        <Wallet size={28} className="text-red-light/40" />
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer…" className="mb-4 w-full rounded-xl border border-white/15 bg-ink-2 px-4 py-2.5 text-sm text-white outline-none focus:border-gold" />
      <div className="space-y-2">
        {filtered.length === 0 && <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No customers found.</p>}
        {filtered.map((c) => {
          const bal = c.balance || 0
          const isExp = expanded === c._id
          return (
            <div key={c._id} className={`overflow-hidden rounded-xl border transition-all ${bal > 0 ? 'border-red-light/20' : 'border-white/8'} bg-white/[0.02]`}>
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
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setKhataPinGate({ onVerified: () => { setKhataPinGate(null); openEdit(c) } })}
                        className="rounded p-1 text-white/20 hover:text-gold transition-colors" title="Edit customer"
                      ><Pencil size={12} /></button>
                      <button
                        onClick={() => setKhataPinGate({ onVerified: () => { setKhataPinGate(null); deleteCustomer(c) } })}
                        className="rounded p-1 text-white/20 hover:text-red-light transition-colors" title="Delete customer"
                      ><Trash2 size={12} /></button>
                    </>
                  )}
                  <button onClick={() => toggle(c)} className="text-white/30 hover:text-white">
                    {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
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
      {payFor && <PayModal customer={payFor} type={payType} onSubmit={(amt, note, pm) => submit(amt, note, pm)} onClose={() => setPayFor(null)} />}
      {khataPinGate && <PinGateModal onVerified={khataPinGate.onVerified} onClose={() => setKhataPinGate(null)} />}
      {editCust && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-ink/85 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setEditCust(null)}>
          <div className="w-full max-w-xs rounded-2xl border border-white/12 bg-ink-2 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[0.75rem] font-bold uppercase tracking-widest text-white">Edit Customer</h3>
              <button onClick={() => setEditCust(null)}><X size={16} className="text-white/40" /></button>
            </div>
            <div className="mb-3">
              <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            </div>
            <div className="mb-5">
              <label className="mb-1.5 block text-[0.6rem] uppercase tracking-wider text-white/40">Phone</label>
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} type="tel" className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditCust(null)} className="flex-1 rounded-lg border border-white/15 py-2 font-display text-[0.7rem] font-bold uppercase text-white/50">Cancel</button>
              <button onClick={saveEdit} disabled={editBusy || !editName} className="flex-1 rounded-lg bg-gold py-2 font-display text-[0.7rem] font-bold uppercase text-ink disabled:opacity-50">{editBusy ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PayModal({ customer, type, onSubmit, onClose }: {
  customer: KhataCustomer; type: 'got' | 'gave'
  onSubmit: (amount: string, note: string, payMethod: 'cash' | 'upi') => void; onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [payMethod, setPayMethod] = useState<'cash' | 'upi'>('cash')
  const bal = customer.balance || 0
  const isReceiving = type === 'got'
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xs rounded-2xl border border-gold/25 bg-ink-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-white">{isReceiving ? '💰 Payment Received' : '📋 Give Credit'}</h3>
            <p className="text-[0.68rem] text-white/40">{customer.name} {bal > 0 ? `· owes ${rupee(bal)}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
        </div>
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Amount ₹</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={isReceiving && bal > 0 ? `Full: ${bal}` : '0'} className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        {isReceiving && bal > 0 && (
          <button onClick={() => setAmount(String(bal))} className="mb-3 w-full rounded-lg border border-green-400/20 py-1.5 text-[0.7rem] font-bold uppercase text-green-400">Full amount ({rupee(bal)})</button>
        )}
        {isReceiving && (
          <>
            <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Received via</label>
            <div className="mb-3 flex gap-2">
              <button onClick={() => setPayMethod('cash')} className={`flex-1 rounded-lg py-2 text-[0.72rem] font-bold uppercase ${payMethod === 'cash' ? 'bg-green-600 text-white' : 'border border-white/12 text-white/50'}`}>Cash</button>
              <button onClick={() => setPayMethod('upi')} className={`flex-1 rounded-lg py-2 text-[0.72rem] font-bold uppercase ${payMethod === 'upi' ? 'text-white' : 'border border-white/12 text-white/50'}`} style={payMethod === 'upi' ? { background: '#23c2ff' } : undefined}>UPI</button>
            </div>
          </>
        )}
        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={isReceiving ? 'e.g. Cash payment' : 'e.g. Snooker session'} className="mb-4 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" />
        <button
          onClick={() => onSubmit(amount, note, payMethod)}
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
  const [frameFor, setFrameFor] = useState<string | null>(null)
  const [cancelFor, setCancelFor] = useState<TableConfig | null>(null)
  const [addBill, setAddBill] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [pinGate, setPinGate] = useState<{ onVerified: () => void } | null>(null)
  const [editBill, setEditBill] = useState<Bill | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [addExpense, setAddExpense] = useState(false)
  const polling = useRef(false)

  // Alarm state
  const [activeAlarm, setActiveAlarm] = useState<{ tableId: string; tableName: string; message: string; isExpired: boolean } | null>(null)
  const alarmFiredRef = useRef<Set<string>>(new Set())
  const sessionsRef = useRef<Record<string, ApiSession>>({})
  useEffect(() => { sessionsRef.current = sessions }, [sessions])

  // Alarm check on every tick
  useEffect(() => {
    const s = sessionsRef.current
    Object.entries(s).forEach(([tableId, sess]) => {
      if (sess.mode !== 'timer') return
      const elapsedMin = (now - sess.startTime) / 60000
      if (sess.selectedDuration) {
        const remaining = sess.selectedDuration - elapsedMin
        const warnKey = `${tableId}:warn:${sess.selectedDuration}:${sess.startTime}`
        const expKey = `${tableId}:expire:${sess.selectedDuration}:${sess.startTime}`
        if (remaining <= 5 && remaining > 0 && !alarmFiredRef.current.has(warnKey)) {
          alarmFiredRef.current.add(warnKey)
          playAlarmSound(false)
          setActiveAlarm({ tableId, tableName: sess.tableName, message: `⚠ ${Math.ceil(remaining)} min left!`, isExpired: false })
        }
        if (remaining <= 0 && !alarmFiredRef.current.has(expKey)) {
          alarmFiredRef.current.add(expKey)
          playAlarmSound(true)
          setActiveAlarm({ tableId, tableName: sess.tableName, message: `⏰ Time's up! Please bill or extend.`, isExpired: true })
        }
      } else {
        for (const mark of [30, 60, 90, 120]) {
          const key = `${tableId}:${mark}min:${sess.startTime}`
          if (elapsedMin >= mark && !alarmFiredRef.current.has(key)) {
            alarmFiredRef.current.add(key)
            playAlarmSound(false)
            setActiveAlarm(prev => prev || { tableId, tableName: sess.tableName, message: `🕐 ${mark} minutes elapsed`, isExpired: false })
          }
        }
      }
    })
  }, [now])

  const refreshTables = async () => {
    try { const { data } = await api.get('/sessions'); const map: Record<string, ApiSession> = {}; for (const s of data) map[s.tableId] = s; setSessions(map) } catch {}
  }
  const refreshBills = async () => { try { const { data } = await api.get('/bills/today'); setBills(data) } catch {} }
  const refreshCanteen = async () => { try { const { data } = await api.get('/canteen'); setCanteen(data) } catch {} }
  const refreshExpenses = async () => { try { const { data } = await api.get('/expenses'); setExpenses(data) } catch {} }

  useEffect(() => {
    refreshTables(); refreshBills(); refreshCanteen(); refreshExpenses()
    api.get('/khata').then((r) => setKhata(r.data || [])).catch(() => {})
    const t = setInterval(() => {
      setNow(Date.now())
      if (!polling.current) { polling.current = true; refreshTables().finally(() => { polling.current = false }) }
    }, 3000)
    return () => clearInterval(t)
  }, [admin])

  const customers = useMemo(
    () => khata.filter((k) => k.name).map((k) => ({ _id: k._id, name: k.name, balance: k.balance || 0 })),
    [khata]
  )

  const start = async (t: TableConfig, o: any) => {
    setStartFor(null)
    await api.post('/sessions', {
      tableId: t.id, tableName: t.name, mode: o.mode, startTime: o.startTime,
      hourRate: o.hourRate, frameCharge: o.frameCharge,
      players: o.players, playerIds: o.playerIds || [],
      customerName: o.customerName, customerId: o.customerId || null,
      cart: [], selectedDuration: o.selectedDuration,
    }).catch(() => {})
    refreshTables()
  }

  const extendSession = async (tableId: string, addMin: number) => {
    const s = sessions[tableId]
    if (!s) { setActiveAlarm(null); return }
    const elapsedMin = (now - s.startTime) / 60000
    const newDuration = s.selectedDuration
      ? s.selectedDuration + addMin
      : Math.round(elapsedMin) + addMin
    setSessions(p => ({ ...p, [tableId]: { ...p[tableId], selectedDuration: newDuration } }))
    await api.patch(`/sessions/${tableId}`, { selectedDuration: newDuration }).catch(() => {})
    setActiveAlarm(null)
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

  const removeFromCart = async (tableId: string, itemId: string) => {
    const s = sessions[tableId]
    const cart = (s.cart || [])
      .map(c => c.itemId === itemId ? { ...c, qty: c.qty - 1 } : c)
      .filter(c => c.qty > 0)
    setSessions((p) => ({ ...p, [tableId]: { ...p[tableId], cart } }))
    await api.patch(`/sessions/${tableId}`, { cart }).catch(() => {})
  }

  const cancel = async (tableId: string) => {
    setCancelFor(null)
    setSessions((p) => { const n = { ...p }; delete n[tableId]; return n })
    await api.delete(`/sessions/${tableId}`).catch(() => {})
  }

  const refreshKhata = async () => {
    try { const { data } = await api.get('/khata'); setKhata(data || []) } catch {}
  }

  const processBill = async (
    t: TableConfig, method: string, disc: number,
    cashAmt?: number, upiAmt?: number,
    resolvedCustomerId?: string, resolvedCustomerName?: string,
  ) => {
    const s = sessions[t.id]
    const play = sessAmount(t, s, Date.now())
    const canteenAmt = (s.cart || []).reduce((a, c) => a + c.price * c.qty, 0)
    const total = play + canteenAmt - disc
    const resolvedCash = method === 'cash' ? total : method === 'split' ? (cashAmt ?? 0) : 0
    const resolvedUpi = method === 'upi' ? total : method === 'split' ? (upiAmt ?? 0) : 0
    const finalCustomerId = resolvedCustomerId || s.customerId || null
    const finalCustomerName = resolvedCustomerName || s.customerName || 'Walk-in'
    const endNow = new Date()
    const billTimeIn = fmtTime(new Date(s.startTime))
    const billTimeOut = fmtTime(endNow)
    setBillFor(null)
    await cancel(t.id)
    await api.post('/bills', {
      tableId: t.id, tableName: t.name, mode: s.mode,
      duration: Math.round((Date.now() - s.startTime) / 60000),
      timeIn: billTimeIn, timeOut: billTimeOut,
      frames: s.framesWonBy.length, players: s.players,
      amount: play, canteenAmount: canteenAmt, canteenItems: s.cart || [],
      discount: disc, total, paymentMethod: method,
      cashAmount: resolvedCash, upiAmount: resolvedUpi,
      customerName: finalCustomerName,
      customerId: finalCustomerId,
    }).catch(() => {})

    // Frame mode: create per-player khata entries for credit
    if (s.mode === 'frames' && method === 'credit') {
      const ft = frameTotals(s)
      const pIds = s.playerIds || []
      for (let i = 0; i < ft.owed.length; i++) {
        const pid = pIds[i]
        if (ft.owed[i] > 0 && pid) {
          await api.post(`/khata/${pid}`, {
            type: 'gave', amount: ft.owed[i], note: `Frames on ${t.name}`,
          }).catch(() => {})
        }
      }
    }
    refreshBills(); refreshCanteen()
    if (method === 'credit') refreshKhata()
  }

  const saveManualBill = async (b: any) => { setAddBill(false); await api.post('/bills', b).catch(() => {}); refreshBills(); refreshCanteen() }
  const doLogout = () => { logout(); router.replace('/login') }

  const galla = useMemo(() => {
    const cash = bills.reduce((a, b) => b.paymentMethod === 'cash' ? a + b.total : b.paymentMethod === 'split' ? a + (b.cashAmount || 0) : a, 0)
    const upi = bills.reduce((a, b) => b.paymentMethod === 'upi' ? a + b.total : b.paymentMethod === 'split' ? a + (b.upiAmount || 0) : a, 0)
    const total = bills.reduce((a, b) => a + b.total, 0)
    const exp = expenses.reduce((a, e) => a + e.amount, 0)
    return { cash, upi, total, exp, netCash: cash - exp }
  }, [bills, expenses])

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
                <div className="hidden text-right sm:block"><div className={`font-display text-sm font-bold ${galla.netCash < 0 ? 'text-red-light' : 'text-green-400'}`}>{rupee(galla.netCash)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">Net Cash</div></div>
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
            <button onClick={() => setShowProfile(true)} aria-label="My profile" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 hover:border-gold hover:text-gold"><UserIcon size={16} /></button>
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
        {/* Alarm banner */}
        {activeAlarm && (
          <AlarmBanner
            tableName={activeAlarm.tableName}
            message={activeAlarm.message}
            isExpired={activeAlarm.isExpired}
            onExtend={(min) => extendSession(activeAlarm.tableId, min)}
            onDismiss={() => setActiveAlarm(null)}
          />
        )}

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
                      <span className="font-display text-[0.95rem] font-bold text-white">{tableEmoji(t.id)} {t.name}</span>
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
                // Remaining time for fixed-duration sessions
                const elapsedMin = (now - s.startTime) / 60000
                const remainMin = s.selectedDuration ? s.selectedDuration - elapsedMin : null
                const isOvertime = remainMin !== null && remainMin < 0
                const isAlarm = activeAlarm?.tableId === t.id

                return (
                  <div key={t.id} className={`rounded-2xl p-4 transition-all ${isAlarm ? 'gold-border animate-pulse bg-gold/[0.06]' : 'gold-border bg-gold/[0.04]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[0.95rem] font-bold text-white">{tableEmoji(t.id)} {t.name}</span>
                      <span className="rounded bg-red/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-red-light">{s.mode}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[0.72rem] text-white/45">
                      <span>{s.customerName || 'Walk-in'}</span>
                      {s.selectedDuration && (
                        <span className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase ${isOvertime ? 'bg-red-light/20 text-red-light' : 'bg-gold/20 text-gold'}`}>
                          {isOvertime ? `+${Math.ceil(-remainMin!)}m over` : `${Math.ceil(remainMin!)}m left`}
                        </span>
                      )}
                    </div>

                    {s.mode === 'timer' ? (
                      <div className="mt-2 flex items-end justify-between">
                        <span className={`font-display text-xl font-bold tabular-nums ${isOvertime ? 'text-red-light' : 'text-white'}`}>{fmtDuration(now - s.startTime)}</span>
                        <span className="font-display text-lg font-bold text-gold">{rupee(amt)}</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {multiPlayer ? (
                          <>
                            <div className="mb-2 space-y-1">
                              {s.players.map((p, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[0.78rem] text-white/80">{p || `P${i + 1}`}</span>
                                    {(s.playerIds || [])[i] && <span className="text-[0.55rem] text-gold">🔗</span>}
                                  </div>
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
                                  <div className="flex items-center justify-center gap-1">
                                    {s.players[i] || `P${i + 1}`}
                                    {(s.playerIds || [])[i] && <span className="text-[0.55rem] text-gold">🔗</span>}
                                  </div>
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

                    {/* Cart with remove buttons */}
                    {(s.cart || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(s.cart || []).map((c) => (
                          <span key={c.itemId} className="flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[0.62rem] text-white/55">
                            {c.name}×{c.qty}
                            <button onClick={() => removeFromCart(t.id, c.itemId)} className="ml-0.5 text-white/30 hover:text-red-light transition-colors">
                              <X size={9} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setCancelFor(t)} className="mt-1.5 w-full text-[0.62rem] uppercase tracking-wider text-white/25 hover:text-red-light">Cancel session</button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── Bills ── */}
        {tab === 'bills' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-[0.68rem] font-bold uppercase tracking-wider text-white/40">{bills.length} bills today</span>
              </div>
              <button onClick={() => setAddExpense(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-light/30 bg-red-light/8 px-3 py-2 font-display text-[0.72rem] font-bold uppercase text-red-light hover:bg-red-light/15">
                <Minus size={13} /> Expense
              </button>
            </div>
          <div className="space-y-2">
            {bills.length === 0
              ? <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No bills today.</p>
              : bills.map((b) => (
                <div key={b._id} className="rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3 text-[0.82rem]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-white/85">{b.tableName}</span>
                      <span className={`ml-2 text-[0.7rem] uppercase ${b.paymentMethod === 'credit' ? 'text-red-light' : b.paymentMethod === 'cash' ? 'text-green-400' : 'text-white/35'}`}>{b.paymentMethod}</span>
                      <div className="text-[0.68rem] text-white/35">
                        {b.customerName}
                        {b.timeIn && b.timeOut
                          ? <span className="ml-1.5 text-white/50">{b.timeIn} <span className="text-white/25">→</span> {b.timeOut}{b.duration ? <span className="ml-1 text-white/25">({b.duration}m)</span> : null}</span>
                          : <span className="ml-1.5">{new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-display font-bold text-gold">{rupee(b.total)}</span>
                      {admin && (
                        <>
                          <button
                            onClick={() => setPinGate({ onVerified: () => { setPinGate(null); setEditBill(b) } })}
                            className="rounded p-1 text-white/20 hover:text-gold transition-colors" title="Edit bill"
                          ><Pencil size={12} /></button>
                          <button
                            onClick={() => setPinGate({ onVerified: () => { setPinGate(null); api.delete(`/bills/${b._id}`).then(refreshBills).catch(() => {}) } })}
                            className="rounded p-1 text-white/20 hover:text-red-light transition-colors" title="Delete bill"
                          ><Trash2 size={12} /></button>
                        </>
                      )}
                    </div>
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

            {/* Expenses section */}
            {expenses.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between border-t border-red-light/15 pt-4">
                  <span className="text-[0.62rem] uppercase tracking-wider text-red-light/60">Counter Expenses</span>
                  <span className="font-display text-[0.82rem] font-bold text-red-light">−{rupee(expenses.reduce((a, e) => a + e.amount, 0))}</span>
                </div>
                <div className="space-y-1.5">
                  {expenses.map((e) => (
                    <div key={e._id} className="flex items-center justify-between rounded-lg border border-red-light/10 bg-red-light/[0.03] px-4 py-2.5">
                      <div>
                        <span className="text-[0.82rem] text-white/70">{e.note || 'Expense'}</span>
                        <div className="text-[0.62rem] text-white/30">{new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[0.85rem] font-bold text-red-light">{rupee(e.amount)}</span>
                        {admin && (
                          <button onClick={() => api.delete(`/expenses/${e._id}`).then(refreshExpenses).catch(() => {})} className="rounded p-1 text-white/15 hover:text-red-light transition-colors"><Trash2 size={11} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'canteen' && <CanteenTab canteen={canteen} onChange={refreshCanteen} />}
        {tab === 'shift' && <ShiftTab canteen={canteen} onSaved={refreshCanteen} />}
        {tab === 'khata' && <KhataTab onBillCreated={refreshBills} />}
        {tab === 'finance' && admin && <FinanceTab khata={khata} todayBills={bills} canteen={canteen} expenses={expenses} onShowReport={() => setShowReport(true)} />}
      </main>

      {startFor && <StartModal table={startFor} customers={customers} onStart={(o) => start(startFor, o)} onClose={() => setStartFor(null)} />}
      {billFor && sessions[billFor.id] && <BillModal table={billFor} session={sessions[billFor.id]} now={now} onProcess={(m, d, c, u, rcId, rcName) => processBill(billFor, m, d, c, u, rcId, rcName)} onClose={() => setBillFor(null)} />}
      {frameFor && sessions[frameFor] && <FrameModal session={sessions[frameFor]} onRecord={(w, l) => recordFrame(frameFor, w, l)} onClose={() => setFrameFor(null)} />}
      {cancelFor && sessions[cancelFor.id] && <CancelModal table={cancelFor} session={sessions[cancelFor.id]} now={now} onConfirm={() => cancel(cancelFor.id)} onClose={() => setCancelFor(null)} />}
      {addBill && <AddBillModal canteen={canteen} customers={customers} onAdd={saveManualBill} onClose={() => setAddBill(false)} />}
      {showReport && <ShiftReportModal canteen={canteen} onClose={() => setShowReport(false)} />}
      {pinGate && <PinGateModal onVerified={pinGate.onVerified} onClose={() => setPinGate(null)} />}
      {editBill && <EditBillModal bill={editBill} onSaved={refreshBills} onClose={() => setEditBill(null)} />}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      {addExpense && <AddExpenseModal onSaved={refreshExpenses} onClose={() => setAddExpense(false)} />}
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
function FinanceTab({ khata, todayBills, canteen, expenses, onShowReport }: { khata: any[]; todayBills: Bill[]; canteen: Item[]; expenses: Expense[]; onShowReport: () => void }) {
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
  const todayExp = expenses.reduce((a, e) => a + e.amount, 0)
  const netCash = todayCash - todayExp

  return (
    <div>
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

      {/* Galla Cash Position */}
      <div className="mb-5 rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-4">
        <h3 className="mb-3 font-display text-[0.72rem] font-bold uppercase tracking-widest text-green-400">💵 Counter Cash Position</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
            <span className="text-[0.78rem] text-white/60">Cash received (today)</span>
            <span className="font-display font-bold text-green-400">{rupee(todayCash)}</span>
          </div>
          {todayExp > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-red-light/[0.04] px-3 py-2">
              <span className="text-[0.78rem] text-white/60">Counter expenses</span>
              <span className="font-display font-bold text-red-light">−{rupee(todayExp)}</span>
            </div>
          )}
          <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${netCash < 0 ? 'bg-red-light/10 border border-red-light/20' : 'bg-green-500/10 border border-green-500/20'}`}>
            <span className="font-display text-[0.72rem] font-bold uppercase tracking-wider text-white/70">Net Cash in Counter</span>
            <span className={`font-display text-lg font-bold ${netCash < 0 ? 'text-red-light' : 'text-green-400'}`}>{rupee(netCash)}</span>
          </div>
        </div>
        {expenses.length > 0 && (
          <div className="mt-3 border-t border-white/8 pt-3">
            <div className="text-[0.6rem] uppercase tracking-wider text-white/30 mb-2">Today's Expenses</div>
            <div className="space-y-1.5">
              {expenses.map((e) => (
                <div key={e._id} className="flex items-center justify-between text-[0.78rem]">
                  <span className="text-white/50">{e.note || 'Expense'} <span className="text-white/25 text-[0.62rem]">{new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></span>
                  <span className="text-red-light">{rupee(e.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
              <div>
                <span className="text-white/85">{b.tableName}</span> <span className={`text-[0.66rem] uppercase ${b.paymentMethod === 'credit' ? 'text-red-light' : b.paymentMethod === 'cash' ? 'text-green-400' : 'text-white/35'}`}>{b.paymentMethod}</span>
                <div className="text-[0.64rem] text-white/35">
                  {b.customerName} · {new Date(b.createdAt).toLocaleDateString('en-IN')}
                  {b.timeIn && b.timeOut
                    ? <span className="ml-1.5 text-white/50">{b.timeIn} <span className="text-white/25">→</span> {b.timeOut}{b.duration ? <span className="ml-1 text-white/25">({b.duration}m)</span> : null}</span>
                    : <span className="ml-1.5">{new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  }
                </div>
              </div>
              <span className="font-display font-bold text-gold">{rupee(b.total)}</span>
            </div>
            {b.paymentMethod === 'split' && <div className="mt-1 flex gap-3 text-[0.65rem]"><span className="text-green-400">Cash {rupee(b.cashAmount || 0)}</span><span style={{ color: '#23c2ff' }}>UPI {rupee(b.upiAmount || 0)}</span></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
