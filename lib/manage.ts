// Local-first data layer for the Star Snooker staff app. Everything is stored
// in the browser (localStorage) on the counter device — no server needed.
// Trade-off: data lives on that one device; it is not synced across devices.

export type TableConfig = {
  id: string
  name: string
  frame: number | null // per-frame (30-min) charge
  hour: number | null  // per-hour charge
  playerRates?: Record<number, { frame: number; hour: number }> // variable by player count
}

// Mirrors the club's price list. Carrom/TT frame charge is editable at start
// (2 vs 4 players) since it varies; the value here is the 2-player default.
// The venue's 9 tables (2 big snooker, 3 mini snooker, 4 pool) plus the other
// games. Frame charge is editable when starting a frames/loser-pays session
// (e.g. carrom/TT 2-vs-4 players).
export const TABLES: TableConfig[] = [
  { id: 'big1', name: 'Royal Snooker 1', frame: 120, hour: 240 },
  { id: 'big2', name: 'Royal Snooker 2', frame: 120, hour: 200 },
  { id: 'mini1', name: 'Mini Snooker 1', frame: 80, hour: 150 },
  { id: 'mini2', name: 'Mini Snooker 2', frame: 80, hour: 150 },
  { id: 'mini3', name: 'Mini Snooker 3', frame: 80, hour: 150 },
  { id: 'pool1', name: 'Pool 1', frame: 80, hour: 150 },
  { id: 'pool2', name: 'Pool 2', frame: 80, hour: 150 },
  { id: 'pool3', name: 'Pool 3', frame: 80, hour: 150 },
  { id: 'pool4', name: 'Pool 4', frame: 80, hour: 150 },
  { id: 'carrom',    name: 'Carrom',        frame: 60, hour: 100, playerRates: { 2: { frame: 60, hour: 100 }, 4: { frame: 80, hour: 150 } } },
  { id: 'tt',        name: 'Table Tennis',  frame: 60, hour: 100, playerRates: { 2: { frame: 60, hour: 100 }, 4: { frame: 80, hour: 150 } } },
  { id: 'chess',     name: 'Chess',         frame: 50, hour: 50 },
  { id: 'zapminton', name: 'Zapminton',     frame: 60, hour: 100, playerRates: { 2: { frame: 60, hour: 100 }, 4: { frame: 80, hour: 150 } } },
]

export type CartItem = { itemId: string; name: string; price: number; qty: number }

export type Session = {
  tableId: string
  mode: 'timer' | 'frames'
  startedAt: number // epoch ms
  // frames / loser-pays mode
  players: [string, string]
  frameCharge: number
  framesWonBy: number[] // each entry = index (0/1) of the winner; loser owes
  // shared
  cart: CartItem[]
}

export type CanteenItem = { id: string; name: string; price: number; stock: number }

export const DEFAULT_CANTEEN: CanteenItem[] = [
  { id: 'c-cold', name: 'Cold Drink', price: 25, stock: 0 },
  { id: 'c-water', name: 'Water Bottle', price: 20, stock: 0 },
  { id: 'c-redbull', name: 'Red Bull', price: 130, stock: 0 },
  { id: 'c-hell', name: 'Hell Energy', price: 65, stock: 0 },
  { id: 'c-cig', name: 'Cigarette', price: 20, stock: 0 },
  { id: 'c-chips', name: 'Chips', price: 20, stock: 0 },
]

export type Sale = {
  id: string
  at: number
  tableName: string
  mode: Session['mode'] | 'canteen'
  play: number // play charge (timer/frames)
  canteen: number
  total: number
  note?: string
}

export type StockCount = {
  id: string
  at: number
  shift: string
  rows: Array<{ itemId: string; name: string; system: number; counted: number }>
}

export type DB = {
  sessions: Record<string, Session> // keyed by tableId
  canteen: CanteenItem[]
  sales: Sale[]
  stockCounts: StockCount[]
  pin: string
}

const KEY = 'starsnooker.db.v1'

export function emptyDB(): DB {
  return { sessions: {}, canteen: DEFAULT_CANTEEN, sales: [], stockCounts: [], pin: '1234' }
}

export function loadDB(): DB {
  if (typeof window === 'undefined') return emptyDB()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyDB()
    return { ...emptyDB(), ...JSON.parse(raw) }
  } catch {
    return emptyDB()
  }
}

export function saveDB(db: DB) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(db))
}

// ── Helpers ──────────────────────────────────────────────────────────
export const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// Fixed-duration billing: full hours × hourRate, remaining 30 min → frameRate.
// e.g. 1.5 hr: 1×150 + 1×80 = ₹230  |  2 hr: 2×150 = ₹300
export function fixedSessionAmount(durationMin: number, hourRate: number, frameRate: number): number {
  const hours = Math.floor(durationMin / 60)
  const hasHalf = durationMin % 60 === 30
  return hours * hourRate + (hasHalf ? frameRate : 0)
}

// Timer bill — prorated at hourly rate, minimum = frame (30-min) price.
// e.g. Pool: frame=80, hour=150 → 30min=₹80, 1hr=₹150, 45min=₹113
export function timerAmount(hourRate: number, frameRate: number, ms: number): number {
  const byHour = Math.round(hourRate * ms / 3_600_000)
  return Math.max(frameRate, byHour)
}

// Loser-pays: each frame, the loser owes the frame charge. Returns per-player
// owed amounts + table total.
export function framesTotals(s: Session): { owed: [number, number]; total: number; frames: number } {
  const owed: [number, number] = [0, 0]
  for (const winner of s.framesWonBy) {
    const loser = winner === 0 ? 1 : 0
    owed[loser] += s.frameCharge
  }
  return { owed, total: owed[0] + owed[1], frames: s.framesWonBy.length }
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0)
}

export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 9)
}
