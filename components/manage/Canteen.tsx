'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { rupee } from '@/lib/manage'
import { useStore } from './Provider'

export function Canteen() {
  const { db, addCanteenItem, updateCanteenItem, deleteCanteenItem, sellItem } = useStore()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  const add = () => {
    const p = Number(price)
    if (!name.trim() || !p) return
    addCanteenItem(name.trim(), p, Number(stock) || 0)
    setName('')
    setPrice('')
    setStock('')
  }

  return (
    <div className="space-y-6">
      {/* Add new item */}
      <div className="gold-border rounded-2xl bg-white/[0.02] p-5">
        <h3 className="mb-3 font-display text-[0.9rem] font-bold uppercase tracking-wider text-gold">Add New Item</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name (e.g. Cigarette)" className="flex-1 rounded-md border border-white/12 bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-gold" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price ₹" className="w-full rounded-md border border-white/12 bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-gold sm:w-28" />
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock" className="w-full rounded-md border border-white/12 bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-gold sm:w-24" />
          <button onClick={add} className="flex items-center justify-center gap-1.5 rounded-md bg-gold px-4 py-2.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-ink hover:opacity-90">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {/* Item list */}
      <div className="overflow-hidden rounded-2xl border border-white/8">
        <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-[0.66rem] font-bold uppercase tracking-wider text-white/50 sm:px-5">
          <span>Item</span>
          <span className="w-16 text-right sm:w-20">Price</span>
          <span className="w-24 text-center sm:w-32">Stock</span>
          <span className="w-px" />
        </div>
        {db.canteen.map((it) => (
          <div key={it.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <input
                value={it.name}
                onChange={(e) => updateCanteenItem(it.id, { name: e.target.value })}
                className="w-full truncate bg-transparent text-[0.9rem] font-medium text-white outline-none focus:text-gold"
              />
            </div>
            <div className="w-16 text-right sm:w-20">
              <input
                type="number"
                value={it.price}
                onChange={(e) => updateCanteenItem(it.id, { price: Number(e.target.value) })}
                className="w-full bg-transparent text-right text-[0.88rem] font-semibold tabular-nums text-gold outline-none"
              />
            </div>
            <div className="flex w-24 items-center justify-center gap-1.5 sm:w-32">
              <button onClick={() => updateCanteenItem(it.id, { stock: it.stock - 1 })} className="flex h-6 w-6 items-center justify-center rounded border border-white/12 text-white/60 hover:border-red"><Minus size={12} /></button>
              <span className={`w-9 text-center font-display text-[0.95rem] font-bold tabular-nums ${it.stock <= 5 ? 'text-red-light' : 'text-white'}`}>{it.stock}</span>
              <button onClick={() => updateCanteenItem(it.id, { stock: it.stock + 1 })} className="flex h-6 w-6 items-center justify-center rounded border border-white/12 text-white/60 hover:border-gold"><Plus size={12} /></button>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => sellItem(it, 1)} aria-label={`Sell ${it.name}`} title="Sell 1 (counter)" className="flex h-7 w-7 items-center justify-center rounded-md bg-felt/90 text-white hover:opacity-90" style={{ background: '#1f8a4c' }}>
                <ShoppingCart size={13} />
              </button>
              <button onClick={() => { if (confirm(`Delete ${it.name}?`)) deleteCanteenItem(it.id) }} aria-label={`Delete ${it.name}`} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/12 text-white/40 hover:border-red hover:text-red-light">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[0.72rem] text-white/35">
        Edit name/price/stock inline · <ShoppingCart size={11} className="inline" /> = sell 1 at the counter · low stock (≤5) shows red
      </p>
    </div>
  )
}
