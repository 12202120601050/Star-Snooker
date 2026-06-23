'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import {
  cartTotal,
  emptyDB,
  framesTotals,
  loadDB,
  saveDB,
  timerAmount,
  uid,
  type CanteenItem,
  type DB,
  type Sale,
  type Session,
  type StockCount,
  type TableConfig,
} from '@/lib/manage'

type Store = {
  db: DB
  now: number
  online: boolean
  startTimer: (t: TableConfig) => void
  startFrames: (t: TableConfig, players: [string, string], frameCharge: number) => void
  addFrameWin: (tableId: string, winner: number) => void
  undoFrame: (tableId: string) => void
  addToCart: (tableId: string, item: CanteenItem) => void
  decFromCart: (tableId: string, itemId: string) => void
  cancelSession: (tableId: string) => void
  checkout: (t: TableConfig) => void
  sellItem: (item: CanteenItem, qty: number) => void
  addCanteenItem: (name: string, price: number, stock: number) => void
  updateCanteenItem: (id: string, patch: Partial<CanteenItem>) => void
  deleteCanteenItem: (id: string) => void
  saveStockCount: (sc: StockCount) => void
  setPin: (pin: string) => void
}

const Ctx = createContext<Store | null>(null)
export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used within ManageProvider')
  return s
}

// ── Mappers between the backend shapes and the local Session shape ──
function apiToSession(s: any): Session {
  return {
    tableId: s.tableId,
    mode: s.mode === 'frames' ? 'frames' : 'timer',
    startedAt: Number(s.startTime) || Date.now(),
    players: [s.players?.[0] || 'Player 1', s.players?.[1] || 'Player 2'],
    frameCharge: Number(s.frameCharge) || 0,
    framesWonBy: Array.isArray(s.framesWonBy) ? s.framesWonBy : [],
    cart: Array.isArray(s.cart) ? s.cart : [],
  }
}
const apiToItem = (i: any): CanteenItem => ({ id: i._id || i.id, name: i.name, price: i.price, stock: i.stock ?? 0 })
const apiToSale = (b: any): Sale => ({
  id: b._id || uid('s-'),
  at: new Date(b.createdAt || Date.now()).getTime(),
  tableName: b.tableName || 'Table',
  mode: b.mode || 'timer',
  play: b.amount || 0,
  canteen: b.canteenAmount || 0,
  total: b.total || 0,
  note: b.note,
})

export function ManageProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(emptyDB)
  const [now, setNow] = useState(0)
  const [online, setOnline] = useState(false)
  const onlineRef = useRef(false)
  const loaded = useRef(false)

  const mutate = (fn: (d: DB) => DB) => setDb((d) => fn(structuredClone(d)))
  // Fire an API call; on success run onOk. Network/API errors keep us in
  // offline (local-first) mode so the counter never blocks.
  const fire = (p: Promise<any>, onOk?: () => void) => {
    p.then(() => onOk && onOk()).catch(() => {})
  }

  // ── Server sync ──
  const syncCanteen = async () => {
    const { data } = await api.get('/canteen')
    if (Array.isArray(data)) mutate((d) => ((d.canteen = data.map(apiToItem)), d))
  }
  const syncTables = async () => {
    const { data } = await api.get('/sessions')
    if (Array.isArray(data)) {
      mutate((d) => {
        d.sessions = {}
        for (const s of data) d.sessions[s.tableId] = apiToSession(s)
        return d
      })
    }
  }
  const syncSales = async () => {
    const { data } = await api.get('/bills/today')
    if (Array.isArray(data)) mutate((d) => ((d.sales = data.map(apiToSale)), d))
  }

  useEffect(() => {
    setDb(loadDB())
    setNow(Date.now())
    loaded.current = true
    // Probe the backend; if reachable, switch to synced mode.
    Promise.allSettled([syncCanteen(), syncTables(), syncSales()]).then((rs) => {
      const ok = rs.some((r) => r.status === 'fulfilled')
      onlineRef.current = ok
      setOnline(ok)
    })
  }, [])

  // Persist locally (offline cache) after load.
  useEffect(() => {
    if (loaded.current) saveDB(db)
  }, [db])

  // Clock + cross-device polling.
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
      if (onlineRef.current) {
        syncTables().catch(() => {})
      }
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const store = useMemo<Store>(() => {
    const ON = () => onlineRef.current

    const startTimer = (t: TableConfig) => {
      mutate((d) => {
        d.sessions[t.id] = { tableId: t.id, mode: 'timer', startedAt: Date.now(), players: ['', ''], frameCharge: 0, framesWonBy: [], cart: [] }
        return d
      })
      if (ON()) fire(api.post('/sessions', { tableId: t.id, tableName: t.name, mode: 'timer', startTime: Date.now(), hourRate: t.hour || 0 }))
    }

    const startFrames = (t: TableConfig, players: [string, string], frameCharge: number) => {
      mutate((d) => {
        d.sessions[t.id] = { tableId: t.id, mode: 'frames', startedAt: Date.now(), players, frameCharge, framesWonBy: [], cart: [] }
        return d
      })
      if (ON()) fire(api.post('/sessions', { tableId: t.id, tableName: t.name, mode: 'frames', startTime: Date.now(), frameCharge, players }))
    }

    const addFrameWin = (tableId: string, winner: number) => {
      mutate((d) => (d.sessions[tableId]?.framesWonBy.push(winner), d))
      if (ON()) fire(api.patch(`/sessions/${tableId}/frame`, { winner }))
    }

    const undoFrame = (tableId: string) => {
      let next: number[] = []
      mutate((d) => {
        const s = d.sessions[tableId]
        if (s) { s.framesWonBy.pop(); next = s.framesWonBy }
        return d
      })
      if (ON()) fire(api.patch(`/sessions/${tableId}`, { framesWonBy: next }))
    }

    const pushCart = (tableId: string) => {
      const s = db.sessions[tableId]
      if (ON() && s) fire(api.patch(`/sessions/${tableId}`, { cart: s.cart }))
    }

    const addToCart = (tableId: string, item: CanteenItem) => {
      mutate((d) => {
        const s = d.sessions[tableId]
        if (!s) return d
        const line = s.cart.find((c) => c.itemId === item.id)
        if (line) line.qty += 1
        else s.cart.push({ itemId: item.id, name: item.name, price: item.price, qty: 1 })
        if (ON()) fire(api.patch(`/sessions/${tableId}`, { cart: s.cart }))
        return d
      })
    }

    const decFromCart = (tableId: string, itemId: string) => {
      mutate((d) => {
        const s = d.sessions[tableId]
        if (!s) return d
        const line = s.cart.find((c) => c.itemId === itemId)
        if (!line) return d
        line.qty -= 1
        if (line.qty <= 0) s.cart = s.cart.filter((c) => c.itemId !== itemId)
        if (ON()) fire(api.patch(`/sessions/${tableId}`, { cart: s.cart }))
        return d
      })
    }

    const cancelSession = (tableId: string) => {
      mutate((d) => (delete d.sessions[tableId], d))
      if (ON()) fire(api.delete(`/sessions/${tableId}`))
    }

    const checkout = (t: TableConfig) => {
      let payload: any = null
      mutate((d) => {
        const s = d.sessions[t.id]
        if (!s) return d
        const play = s.mode === 'timer' ? timerAmount(t.hour ?? 0, Date.now() - s.startedAt) : framesTotals(s).total
        const canteen = cartTotal(s.cart)
        for (const line of s.cart) {
          const it = d.canteen.find((c) => c.id === line.itemId)
          if (it) it.stock -= line.qty
        }
        const total = play + canteen
        payload = {
          tableId: t.id, tableName: t.name, mode: s.mode,
          duration: Math.round((Date.now() - s.startedAt) / 60000), frames: s.framesWonBy.length, players: s.players,
          amount: play, canteenAmount: canteen, canteenItems: s.cart, total, paymentMethod: 'cash',
        }
        d.sales.unshift({ id: uid('s-'), at: Date.now(), tableName: t.name, mode: s.mode, play, canteen, total })
        delete d.sessions[t.id]
        return d
      })
      if (ON() && payload) fire(Promise.all([api.post('/bills', payload), api.delete(`/sessions/${t.id}`)]), () => { syncSales(); syncCanteen() })
    }

    const sellItem = (item: CanteenItem, qty: number) => {
      mutate((d) => {
        const it = d.canteen.find((c) => c.id === item.id)
        if (it) it.stock -= qty
        d.sales.unshift({ id: uid('s-'), at: Date.now(), tableName: 'Counter', mode: 'canteen', play: 0, canteen: item.price * qty, total: item.price * qty, note: `${qty} × ${item.name}` })
        return d
      })
      if (ON()) fire(api.post('/bills', { tableId: 'counter', tableName: 'Counter', mode: 'canteen', amount: 0, canteenAmount: item.price * qty, canteenItems: [{ itemId: item.id, name: item.name, price: item.price, qty }], total: item.price * qty, paymentMethod: 'cash' }), () => { syncSales(); syncCanteen() })
    }

    const addCanteenItem = (name: string, price: number, stock: number) => {
      mutate((d) => (d.canteen.push({ id: uid('c-'), name, price, stock }), d))
      if (ON()) fire(api.post('/canteen', { name, price, stock }), syncCanteen)
    }

    const updateCanteenItem = (id: string, patch: Partial<CanteenItem>) => {
      mutate((d) => {
        const it = d.canteen.find((c) => c.id === id)
        if (it) Object.assign(it, patch)
        return d
      })
      if (ON()) fire(api.put(`/canteen/${id}`, patch))
    }

    const deleteCanteenItem = (id: string) => {
      mutate((d) => ((d.canteen = d.canteen.filter((c) => c.id !== id)), d))
      if (ON()) fire(api.delete(`/canteen/${id}`))
    }

    const saveStockCount = (sc: StockCount) => {
      mutate((d) => {
        for (const row of sc.rows) {
          const it = d.canteen.find((c) => c.id === row.itemId)
          if (it) it.stock = row.counted
        }
        d.stockCounts.unshift(sc)
        return d
      })
      if (ON()) fire(api.post('/stock', { shift: sc.shift, rows: sc.rows }), syncCanteen)
    }

    const setPin = (pin: string) => mutate((d) => ((d.pin = pin), d))

    return {
      db, now, online,
      startTimer, startFrames, addFrameWin, undoFrame, addToCart, decFromCart,
      cancelSession, checkout, sellItem, addCanteenItem, updateCanteenItem,
      deleteCanteenItem, saveStockCount, setPin,
    }
  }, [db, now, online])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
