// Local-first data layer for the Star Snooker staff app. Everything is stored
// in the browser (localStorage) on the counter device — no server needed.
// Trade-off: data lives on that one device; it is not synced across devices.

export type TableConfig = {
  id: string
  name: string
  frame: number | null // per-frame (half-hour) charge; null = no frame play
  hour: number | null // per-hour charge; null = frame-only
}

// Mirrors the club's price list. Carrom/TT frame charge is editable at start
// (2 vs 4 players) since it varies; the value here is the 2-player default.
export const TABLES: TableConfig[] = [
  { id: 't1', name: 'Royal Snooker T1', frame: 120, hour: 240 },
  { id: 't2', name: 'Royal Snooker T2', frame: 120, hour: 200 },
  { id: 't3', name: 'Royal Snooker T3', frame: 120, hour: 240 },
  { id: 'mini', name: 'Mini Snooker', frame: 80, hour: 150 },
  { id: 'pool', name: 'Pool', frame: 80, hour: 150 },
  { id: 'carrom', name: 'Carrom', frame: 60, hour: 100 },
  { id: 'tt', name: 'Table Tennis', frame: 60, hour: 150 },
  { id: 'chess', name: 'Chess', frame: 50, hour: 50 },
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

// Hourly bill, prorated to the minute.
export function timerAmount(hourRate: number, ms: number): number {
  const hours = ms / 3_600_000
  return Math.round(hours * hourRate)
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
