'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Receipt, Coffee, ClipboardCheck, BarChart3, Users, BookUser,
  LogOut, Play, Square, Pause, Plus, Trophy, RotateCcw, X, Clock, Plus as PlusIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/store/auth'
import { Logo } from '@/components/snooker/Logo'
import { TABLES, rupee, fmtDuration, timerAmount, type TableConfig } from '@/lib/manage'

// ── API session shape ──
type ApiSession = {
  tableId: string
  tableName: string
  mode: 'timer' | 'frames'
  startTime: number
  hourRate: number
  frameCharge: number
  players: string[]
  framesWonBy: number[]
  customerName?: string
  cart?: Array<{ itemId: string; name: string; price: number; qty: number }>
  selectedDuration?: number
}
type Item = { _id: string; name: string; price: number; stock: number }
type Bill = { _id: string; tableName: string; mode: string; amount: number; canteenAmount: number; total: number; paymentMethod: string; customerName?: string; createdAt: string; note?: string }

const frameTotals = (s: ApiSession) => {
  const owed: [number, number] = [0, 0]
  for (const w of s.framesWonBy || []) owed[w === 0 ? 1 : 0] += s.frameCharge
  return { owed, total: owed[0] + owed[1] }
}
const sessAmount = (t: TableConfig, s: ApiSession, now: number) =>
  s.mode === 'frames' ? frameTotals(s).total : timerAmount(s.hourRate || t.hour || 0, now - s.startTime)

// ── Start modal ──
function StartModal({ table, customers, onStart, onClose }: { table: TableConfig; customers: string[]; onStart: (o: any) => void; onClose: () => void }) {
  const [mode, setMode] = useState<'timer' | 'frames'>('timer')
  const [cust, setCust] = useState('Walk-in')
  const [p1, setP1] = useState('Player 1')
  const [p2, setP2] = useState('Player 2')
  const [hourRate, setHourRate] = useState(table.hour ?? 0)
  const [frameCharge, setFrameCharge] = useState(table.frame ?? 0)
  const [forgot, setForgot] = useState(false)
  const [agoMin, setAgoMin] = useState('0')

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl border border-gold/25 bg-ink-2 p-5">
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
          </div>
        ) : (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div><label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Player 1</label><input value={p1} onChange={(e) => setP1(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" /></div>
            <div><label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Player 2</label><input value={p2} onChange={(e) => setP2(e.target.value)} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" /></div>
            <div className="col-span-2"><label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Charge ₹/frame</label><input type="number" value={frameCharge} onChange={(e) => setFrameCharge(Number(e.target.value))} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white outline-none focus:border-gold" /></div>
          </div>
        )}

        <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wider text-white/40">Customer</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button onClick={() => setCust('Walk-in')} className={`rounded-md px-2.5 py-1 text-[0.72rem] ${cust === 'Walk-in' ? 'bg-felt text-white' : 'border border-white/12 text-white/55'}`} style={cust === 'Walk-in' ? { background: '#1f8a4c' } : undefined}>Walk-in</button>
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
          onClick={() => onStart({ mode, customerName: cust, hourRate, frameCharge, players: mode === 'frames' ? [p1, p2] : [], startTime: Date.now() - Number(agoMin || 0) * 60000 })}
          className="w-full rounded-lg bg-red py-3 font-display text-sm font-bold uppercase tracking-wider text-white"
        >
          🎱 Start Session
        </button>
      </div>
    </div>
  )
}

// ── Bill modal ──
function BillModal({ table, session, now, onProcess, onClose }: { table: TableConfig; session: ApiSession; now: number; onProcess: (m: string, disc: number) => void; onClose: () => void }) {
  const play = sessAmount(table, session, now)
  const canteen = (session.cart || []).reduce((a, c) => a + c.price * c.qty, 0)
  const [disc, setDisc] = useState('0')
  const [pm, setPm] = useState<'cash' | 'upi' | 'split'>('cash')
  const d = Math.min(Number(disc) || 0, play + canteen)
  const total = play + canteen - d
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
        <div className="mb-4 flex gap-2">
          {(['cash', 'upi', 'split'] as const).map((m) => <button key={m} onClick={() => setPm(m)} className={`flex-1 rounded-lg py-2 text-[0.75rem] font-bold uppercase ${pm === m ? 'bg-gold text-ink' : 'border border-white/12 text-white/50'}`}>{m}</button>)}
        </div>
        <button onClick={() => onProcess(pm, d)} className="w-full rounded-lg bg-red py-3 font-display text-sm font-bold uppercase tracking-wider text-white">✅ Collect {rupee(total)}</button>
      </div>
    </div>
  )
}

// ── Manual add-bill modal ──
function AddBillModal({ canteen, onAdd, onClose }: { canteen: Item[]; onAdd: (b: any) => void; onClose: () => void }) {
  const [kind, setKind] = useState<'table' | 'canteen'>('table')
  const [tableId, setTableId] = useState(TABLES[0].id)
  const [amount, setAmount] = useState('')
  const [cust, setCust] = useState('Walk-in')
  const [pm, setPm] = useState('cash')
  const [cart, setCart] = useState<Record<string, number>>({})
  const t = TABLES.find((x) => x.id === tableId)!
  const cAmt = canteen.reduce((a, i) => a + (cart[i._id] || 0) * i.price, 0)
  const play = kind === 'table' ? Number(amount) || t.hour || 0 : 0
  const total = play + cAmt
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
            <div><label className="mb-1 block text-[0.7rem] uppercase tracking-wider text-white/40">Amount ₹ (auto {t.hour})</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`${t.hour}`} className="w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" /></div>
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
        <input value={cust === 'Walk-in' ? '' : cust} onChange={(e) => setCust(e.target.value || 'Walk-in')} placeholder="Customer (Walk-in)" className="mb-3 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-sm text-white" />
        <div className="mb-3 flex gap-2">
          {['cash', 'upi', 'split', 'credit'].map((m) => <button key={m} onClick={() => setPm(m)} className={`flex-1 rounded-lg py-1.5 text-[0.68rem] font-bold uppercase ${pm === m ? 'bg-gold text-ink' : 'border border-white/12 text-white/50'}`}>{m}</button>)}
        </div>
        <div className="mb-3 flex justify-between rounded-lg bg-white/[0.03] px-3 py-2"><span className="text-[0.8rem] text-white/50">Total</span><span className="font-display font-bold text-gold">{rupee(total)}</span></div>
        <button
          onClick={() => {
            if (total <= 0) return
            const items = canteen.filter((i) => cart[i._id]).map((i) => ({ itemId: i._id, name: i.name, price: i.price, qty: cart[i._id] }))
            onAdd({ tableId: kind === 'canteen' ? 'counter' : tableId, tableName: kind === 'canteen' ? 'Counter' : t.name, mode: kind === 'canteen' ? 'canteen' : 'timer', amount: play, canteenAmount: cAmt, canteenItems: items, total, paymentMethod: pm, customerName: cust })
          }}
          className="w-full rounded-lg bg-red py-3 font-display text-sm font-bold uppercase tracking-wider text-white"
        >💾 Save Bill</button>
      </div>
    </div>
  )
}

export function StaffDashboard({ admin = false }: { admin?: boolean }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())
  const [sessions, setSessions] = useState<Record<string, ApiSession>>({})
  const [bills, setBills] = useState<Bill[]>([])
  const [canteen, setCanteen] = useState<Item[]>([])
  const [khata, setKhata] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tab, setTab] = useState<'tables' | 'bills' | 'canteen' | 'shift' | 'finance'>('tables')
  const [startFor, setStartFor] = useState<TableConfig | null>(null)
  const [billFor, setBillFor] = useState<TableConfig | null>(null)
  const [addBill, setAddBill] = useState(false)
  const polling = useRef(false)

  const refreshTables = async () => { try { const { data } = await api.get('/sessions'); const map: Record<string, ApiSession> = {}; for (const s of data) map[s.tableId] = s; setSessions(map) } catch {} }
  const refreshBills = async () => { try { const { data } = await api.get('/bills/today'); setBills(data) } catch {} }
  const refreshCanteen = async () => { try { const { data } = await api.get('/canteen'); setCanteen(data) } catch {} }

  useEffect(() => {
    refreshTables(); refreshBills(); refreshCanteen()
    if (admin) { api.get('/khata').then((r) => setKhata(r.data || [])).catch(() => {}); api.get('/customers').then(() => {}).catch(() => {}) }
    const t = setInterval(() => {
      setNow(Date.now())
      if (!polling.current) { polling.current = true; refreshTables().finally(() => { polling.current = false }) }
    }, 3000)
    return () => clearInterval(t)
  }, [admin])

  const customers = useMemo(() => Array.from(new Set(bills.map((b) => b.customerName).filter((c): c is string => !!c && c !== 'Walk-in' && c !== 'Counter'))), [bills])

  const start = async (t: TableConfig, o: any) => {
    setStartFor(null)
    await api.post('/sessions', { tableId: t.id, tableName: t.name, mode: o.mode, startTime: o.startTime, hourRate: o.hourRate, frameCharge: o.frameCharge, players: o.players, customerName: o.customerName, cart: [] }).catch(() => {})
    refreshTables()
  }
  const recordFrame = async (tableId: string, winner: number) => { setSessions((p) => ({ ...p, [tableId]: { ...p[tableId], framesWonBy: [...p[tableId].framesWonBy, winner] } })); await api.patch(`/sessions/${tableId}/frame`, { winner }).catch(() => {}) }
  const addToCart = async (tableId: string, item: Item) => {
    const s = sessions[tableId]; const cart = [...(s.cart || [])]; const line = cart.find((c) => c.itemId === item._id)
    if (line) line.qty += 1; else cart.push({ itemId: item._id, name: item.name, price: item.price, qty: 1 })
    setSessions((p) => ({ ...p, [tableId]: { ...p[tableId], cart } }))
    await api.patch(`/sessions/${tableId}`, { cart }).catch(() => {})
  }
  const cancel = async (tableId: string) => { setSessions((p) => { const n = { ...p }; delete n[tableId]; return n }); await api.delete(`/sessions/${tableId}`).catch(() => {}) }
  const processBill = async (t: TableConfig, method: string, disc: number) => {
    const s = sessions[t.id]; const play = sessAmount(t, s, Date.now()); const canteenAmt = (s.cart || []).reduce((a, c) => a + c.price * c.qty, 0)
    setBillFor(null); await cancel(t.id) // optimistic clear
    await api.post('/bills', { tableId: t.id, tableName: t.name, mode: s.mode, duration: Math.round((Date.now() - s.startTime) / 60000), frames: s.framesWonBy.length, players: s.players, amount: play, canteenAmount: canteenAmt, canteenItems: s.cart || [], discount: disc, total: play + canteenAmt - disc, paymentMethod: method, customerName: s.customerName }).catch(() => {})
    refreshBills(); refreshCanteen()
  }
  const saveManualBill = async (b: any) => { setAddBill(false); await api.post('/bills', b).catch(() => {}); refreshBills(); refreshCanteen() }

  const doLogout = () => { logout(); router.replace('/login') }

  // Galla (today)
  const galla = useMemo(() => {
    const cash = bills.filter((b) => b.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0)
    const upi = bills.filter((b) => b.paymentMethod === 'upi').reduce((a, b) => a + b.total, 0)
    const total = bills.reduce((a, b) => a + b.total, 0)
    return { cash, upi, total }
  }, [bills])

  const tabs = [
    { id: 'tables', label: 'Tables', icon: LayoutGrid },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'canteen', label: 'Canteen', icon: Coffee },
    { id: 'shift', label: 'Shift', icon: ClipboardCheck },
    ...(admin ? [{ id: 'finance', label: 'Finance', icon: BarChart3 } as const] : []),
  ] as const

  return (
    <div className="min-h-dvh bg-ink pb-16 text-white">
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-[0.85rem] font-bold uppercase"><span className="text-red">Star</span> <span className="text-gold">Snooker</span> <span className="hidden text-white/45 sm:inline">· {admin ? 'Admin' : 'Counter'}</span></span>
          </div>
          {/* Galla */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><div className="font-display text-sm font-bold text-green-400">{rupee(galla.cash)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">Cash</div></div>
            <div className="hidden text-right sm:block"><div className="font-display text-sm font-bold text-neon-blue" style={{ color: '#23c2ff' }}>{rupee(galla.upi)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">UPI</div></div>
            <div className="text-right"><div className="font-display text-base font-bold text-gold">{rupee(galla.total)}</div><div className="text-[0.5rem] uppercase tracking-wider text-white/40">Galla</div></div>
            <button onClick={doLogout} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 hover:border-red"><LogOut size={16} /></button>
          </div>
        </div>
        <div className="mx-auto flex max-w-content gap-1 overflow-x-auto px-2 pb-2 sm:px-5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-display text-[0.7rem] font-bold uppercase tracking-wider ${tab === t.id ? 'bg-gold text-ink' : 'text-white/55'}`}><t.icon size={14} /><span className="hidden sm:inline">{t.label}</span></button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-5 sm:px-6">
        {tab === 'tables' && (
          <>
            <div className="mb-4 flex justify-end"><button onClick={() => setAddBill(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 font-display text-[0.72rem] font-bold uppercase text-gold"><PlusIcon size={14} /> Add Bill</button></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TABLES.map((t) => {
                const s = sessions[t.id]
                if (!s) return (
                  <div key={t.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between"><span className="font-display text-[0.95rem] font-bold text-white">{t.name}</span><span className="text-[0.65rem] uppercase tracking-wider text-white/30">Open</span></div>
                    <div className="mt-1 text-[0.7rem] text-white/35">₹{t.frame}/frame · ₹{t.hour}/hr</div>
                    <button onClick={() => setStartFor(t)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-felt py-2.5 font-display text-[0.74rem] font-bold uppercase text-white" style={{ background: '#1f8a4c' }}><Play size={14} /> Start</button>
                  </div>
                )
                const amt = sessAmount(t, s, now)
                const ft = frameTotals(s)
                return (
                  <div key={t.id} className="gold-border rounded-2xl bg-gold/[0.04] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[0.95rem] font-bold text-white">{t.name}</span>
                      <span className="rounded bg-red/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-red-light">{s.mode}</span>
                    </div>
                    <div className="mt-1 text-[0.72rem] text-white/45">{s.customerName || 'Walk-in'}</div>
                    {s.mode === 'timer' ? (
                      <div className="mt-2 flex items-end justify-between">
                        <span className="font-display text-xl font-bold tabular-nums text-white">{fmtDuration(now - s.startTime)}</span>
                        <span className="font-display text-lg font-bold text-gold">{rupee(amt)}</span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex gap-2">
                          {[0, 1].map((i) => (
                            <button key={i} onClick={() => recordFrame(t.id, i)} className="flex-1 rounded-lg border border-white/12 bg-white/5 py-2 text-[0.72rem] font-bold text-white hover:border-gold">
                              <Trophy size={12} className="mx-auto mb-0.5 text-gold" />{s.players[i] || `P${i + 1}`}<div className="text-[0.62rem] text-white/45">owes {rupee(ft.owed[i])}</div>
                            </button>
                          ))}
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[0.7rem]">
                          <button onClick={() => recordFrame(t.id, s.framesWonBy.length ? s.framesWonBy[s.framesWonBy.length - 1] : 0)} className="hidden">x</button>
                          <span className="text-white/40">{s.framesWonBy.length} frames</span>
                          <span className="font-display font-bold text-gold">{rupee(ft.total)}</span>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      <button onClick={() => setBillFor(t)} className="rounded-lg bg-red py-2 text-[0.72rem] font-bold uppercase text-white"><Square size={11} className="mr-1 inline" />Bill</button>
                      <select onChange={(e) => { const it = canteen.find((c) => c._id === e.target.value); if (it) addToCart(t.id, it); e.target.value = '' }} defaultValue="" className="rounded-lg border border-white/12 bg-white/5 px-2 py-2 text-[0.7rem] text-white/70">
                        <option value="" disabled>+ Canteen</option>
                        {canteen.map((c) => <option key={c._id} value={c._id}>{c.name} ₹{c.price}</option>)}
                      </select>
                    </div>
                    {(s.cart || []).length > 0 && <div className="mt-1.5 text-[0.66rem] text-white/40">{(s.cart || []).map((c) => `${c.name}×${c.qty}`).join(', ')}</div>}
                    <button onClick={() => cancel(t.id)} className="mt-1.5 w-full text-[0.62rem] uppercase tracking-wider text-white/25 hover:text-red-light">Cancel session</button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab === 'bills' && (
          <div className="space-y-2">
            {bills.length === 0 ? <p className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.85rem] text-white/35">No bills today.</p> :
              bills.map((b) => (
                <div key={b._id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 text-[0.82rem]">
                  <div><span className="font-semibold text-white/85">{b.tableName}</span> <span className="text-[0.7rem] uppercase text-white/35">{b.paymentMethod}</span><div className="text-[0.68rem] text-white/35">{b.customerName} · {new Date(b.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div></div>
                  <span className="font-display font-bold text-gold">{rupee(b.total)}</span>
                </div>
              ))}
          </div>
        )}

        {tab === 'canteen' && <CanteenTab canteen={canteen} onChange={refreshCanteen} />}
        {tab === 'shift' && <ShiftTab canteen={canteen} onSaved={refreshCanteen} />}
        {tab === 'finance' && admin && <FinanceTab khata={khata} />}
      </main>

      {startFor && <StartModal table={startFor} customers={customers} onStart={(o) => start(startFor, o)} onClose={() => setStartFor(null)} />}
      {billFor && sessions[billFor.id] && <BillModal table={billFor} session={sessions[billFor.id]} now={now} onProcess={(m, d) => processBill(billFor, m, d)} onClose={() => setBillFor(null)} />}
      {addBill && <AddBillModal canteen={canteen} onAdd={saveManualBill} onClose={() => setAddBill(false)} />}
    </div>
  )
}

// ── Canteen tab (manage items + stock + add) ──
function CanteenTab({ canteen, onChange }: { canteen: Item[]; onChange: () => void }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [stock, setStock] = useState('')
  const add = async () => { if (!name || !price) return; await api.post('/canteen', { name, price: Number(price), stock: Number(stock) || 0 }).catch(() => {}); setName(''); setPrice(''); setStock(''); onChange() }
  const adjust = async (i: Item, delta: number) => { await api.put(`/canteen/${i._id}`, { stock: Math.max(0, i.stock + delta) }).catch(() => {}); onChange() }
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

// ── Admin finance ──
function FinanceTab({ khata }: { khata: any[] }) {
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [payment, setPayment] = useState('all')
  const [bills, setBills] = useState<Bill[]>([])
  const load = async () => {
    const params: any = {}; if (from) params.from = from; if (to) params.to = to; if (payment !== 'all') params.payment = payment
    try { const { data } = await api.get('/bills', { params }); setBills(data) } catch {}
  }
  useEffect(() => { load() }, [])
  const total = bills.reduce((a, b) => a + b.total, 0)
  const cash = bills.filter((b) => b.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0)
  const upi = bills.filter((b) => b.paymentMethod === 'upi').reduce((a, b) => a + b.total, 0)
  const credit = khata.reduce((a, k) => a + (k.outstandingBalance || k.balance || 0), 0)
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Total', total], ['Cash', cash], ['UPI', upi], ['Outstanding', credit]].map(([l, v]) => (
          <div key={l as string} className="gold-border rounded-xl bg-white/[0.02] px-3 py-4 text-center"><div className="font-display text-lg font-bold text-gold">{rupee(v as number)}</div><div className="text-[0.58rem] uppercase tracking-wider text-white/40">{l as string}</div></div>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div><label className="block text-[0.62rem] uppercase text-white/40">From</label><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-white/15 bg-ink-2 px-2 py-1.5 text-sm text-white" /></div>
        <div><label className="block text-[0.62rem] uppercase text-white/40">To</label><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-white/15 bg-ink-2 px-2 py-1.5 text-sm text-white" /></div>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className="rounded-lg border border-white/15 bg-ink-2 px-2 py-1.5 text-sm text-white"><option value="all">All</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="split">Split</option><option value="credit">Credit</option></select>
        <button onClick={load} className="rounded-lg bg-gold px-4 py-1.5 font-display text-[0.72rem] font-bold uppercase text-ink">Filter</button>
      </div>
      <div className="space-y-1.5">
        {bills.slice(0, 100).map((b) => (
          <div key={b._id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2 text-[0.8rem]"><div><span className="text-white/85">{b.tableName}</span> <span className="text-[0.66rem] uppercase text-white/35">{b.paymentMethod}</span><div className="text-[0.64rem] text-white/35">{b.customerName} · {new Date(b.createdAt).toLocaleDateString('en-IN')}</div></div><span className="font-display font-bold text-gold">{rupee(b.total)}</span></div>
        ))}
      </div>
    </div>
  )
}
