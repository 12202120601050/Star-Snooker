'use client'

import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { rupee, uid, type StockCount } from '@/lib/manage'
import { useStore } from './Provider'

export function Stock() {
  const { db, saveStockCount } = useStore()
  const [shift, setShift] = useState('Evening')
  const [counts, setCounts] = useState<Record<string, string>>({})

  const setCount = (id: string, v: string) => setCounts((c) => ({ ...c, [id]: v }))

  const save = () => {
    const rows = db.canteen.map((it) => ({
      itemId: it.id,
      name: it.name,
      system: it.stock,
      counted: counts[it.id] === undefined || counts[it.id] === '' ? it.stock : Number(counts[it.id]),
    }))
    const sc: StockCount = { id: uid('sc-'), at: Date.now(), shift, rows }
    saveStockCount(sc)
    setCounts({})
    alert('Shift stock count saved. System stock updated to the counted figures.')
  }

  return (
    <div className="space-y-6">
      <div className="gold-border rounded-2xl bg-white/[0.02] p-5">
        <div className="mb-1 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-gold" />
          <h3 className="font-display text-[0.95rem] font-bold uppercase tracking-wider text-white">Shift Stock Count</h3>
        </div>
        <p className="mb-4 text-[0.78rem] text-white/45">
          At every shift change, count the physical stock of each item. The difference vs the system tells you what sold (or is missing). Saving updates the system stock to your counted figures.
        </p>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-[0.74rem] text-white/50">Shift:</span>
          {['Morning', 'Evening', 'Night'].map((sh) => (
            <button
              key={sh}
              onClick={() => setShift(sh)}
              className={`rounded-full px-3 py-1 text-[0.72rem] font-semibold ${shift === sh ? 'bg-gold text-ink' : 'border border-white/15 text-white/60'}`}
            >
              {sh}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-white/8">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-white/10 bg-white/5 px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-wider text-white/50">
            <span>Item</span>
            <span className="w-16 text-center">System</span>
            <span className="w-20 text-center">Counted</span>
            <span className="w-16 text-center">Diff</span>
          </div>
          {db.canteen.map((it) => {
            const raw = counts[it.id]
            const counted = raw === undefined || raw === '' ? null : Number(raw)
            const diff = counted === null ? null : counted - it.stock
            return (
              <div key={it.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-white/5 px-4 py-2.5">
                <span className="truncate text-[0.86rem] text-white/85">{it.name}</span>
                <span className="w-16 text-center font-display text-[0.9rem] tabular-nums text-white/55">{it.stock}</span>
                <input
                  type="number"
                  value={raw ?? ''}
                  onChange={(e) => setCount(it.id, e.target.value)}
                  placeholder={String(it.stock)}
                  className="w-20 rounded-md border border-white/12 bg-ink px-2 py-1.5 text-center text-[0.9rem] tabular-nums text-white outline-none focus:border-gold"
                />
                <span className={`w-16 text-center font-display text-[0.86rem] font-bold tabular-nums ${diff === null ? 'text-white/25' : diff < 0 ? 'text-red-light' : diff > 0 ? 'text-felt' : 'text-white/50'}`} style={diff !== null && diff > 0 ? { color: '#37d07a' } : undefined}>
                  {diff === null ? '—' : diff > 0 ? `+${diff}` : diff}
                </span>
              </div>
            )
          })}
        </div>

        <button onClick={save} className="mt-4 w-full rounded-md bg-red px-4 py-3 font-display text-[0.8rem] font-bold uppercase tracking-wider text-white hover:opacity-90">
          Save Shift Count
        </button>
      </div>

      {/* History */}
      {db.stockCounts.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-[0.85rem] font-bold uppercase tracking-wider text-white/70">Recent Counts</h3>
          <div className="space-y-2">
            {db.stockCounts.slice(0, 6).map((sc) => {
              const sold = sc.rows.reduce((a, r) => a + Math.max(0, r.system - r.counted), 0)
              return (
                <div key={sc.id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-4 py-2.5 text-[0.8rem]">
                  <span className="text-white/70">
                    <span className="font-semibold text-gold">{sc.shift}</span> · {new Date(sc.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-white/45">{sold} unit{sold === 1 ? '' : 's'} down</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
