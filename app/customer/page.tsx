'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Clock, Phone, User as UserIcon, MapPin, History, Star, AlertTriangle, BookUser, TrendingDown, TrendingUp, MessageSquare } from 'lucide-react'
import { Guard } from '@/components/auth/Guard'
import { useAuth } from '@/store/auth'
import { api } from '@/lib/api'
import { Logo } from '@/components/snooker/Logo'
import { LINKS, SITE } from '@/lib/site'

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN')

type Bill = { _id: string; tableName: string; mode: string; total: number; paymentMethod: string; createdAt: string }

const LOYALTY_GOAL = 100

function CustomerHome() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [active, setActive] = useState<any>(null)
  const [visits, setVisits] = useState<Bill[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [tab, setTab] = useState<'home' | 'history' | 'khata'>('home')

  useEffect(() => {
    api.get('/sessions/my').then((r) => setActive(r.data)).catch(() => {})
    api.get('/bills', { params: { customer: user?.name, limit: 30 } })
      .then((r) => setVisits(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
    // Try /customers/me first, fall back to searching the list
    api.get('/customers/me')
      .then((r) => setProfile(r.data))
      .catch(() => {
        api.get('/customers').then((r) => {
          const me = (r.data || []).find((c: any) => c.phone === user?.phone || c.name === user?.name)
          if (me) setProfile(me)
        }).catch(() => {})
      })
  }, [user?.name, user?.phone])

  const doLogout = () => { logout(); router.replace('/login') }

  const loyalty: number = profile?.loyaltyPoints ?? (user as any)?.loyaltyPoints ?? 0
  const balance: number = profile?.outstandingBalance ?? (user as any)?.outstandingBalance ?? 0
  const totalSpent = visits.reduce((a, v) => a + v.total, 0)

  return (
    <div className="min-h-dvh bg-ink text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-[0.85rem] font-bold uppercase">
              <span className="text-red">Star</span> <span className="text-gold">Snooker</span>
            </span>
          </div>
          <button onClick={doLogout} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/60 hover:border-red hover:text-red-light">
            <LogOut size={16} />
          </button>
        </div>
        <div className="mx-auto flex max-w-md gap-1 px-3 pb-2">
          {([['home', 'My Club'], ['history', 'Visits'], ['khata', 'Khata']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-lg py-2 font-display text-[0.72rem] font-bold uppercase tracking-wider transition-colors ${tab === id ? 'bg-gold text-ink' : 'text-white/50 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-md px-5 py-6">

        {/* ── HOME TAB ── */}
        {tab === 'home' && (
          <>
            <h1 className="mb-5 font-display text-2xl font-bold text-white">
              Hi {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>

            {/* Outstanding balance warning */}
            {balance > 0 && (
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-light/30 bg-red-light/[0.06] px-4 py-3">
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-red-light" />
                <div>
                  <div className="text-[0.82rem] font-bold text-red-light">Outstanding Balance</div>
                  <div className="text-[0.72rem] text-white/50">You have {rupee(balance)} pending — please pay at the counter.</div>
                </div>
              </div>
            )}

            {/* Member card */}
            <div className="gold-border mb-4 rounded-2xl bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold">
                  <UserIcon size={16} />
                  <span className="font-display text-[0.72rem] font-bold uppercase tracking-wider">Member Card</span>
                </div>
                <div className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-display text-[0.6rem] font-bold uppercase tracking-wider text-gold">Active</div>
              </div>
              <div className="font-display text-xl font-bold text-white">{user?.name}</div>
              <div className="mt-0.5 text-[0.78rem] text-white/45">{user?.phone}</div>
              {totalSpent > 0 && (
                <div className="mt-3 flex items-center gap-1 text-[0.7rem] text-white/30">
                  <span>Total spent:</span>
                  <span className="font-display font-bold text-white/50">{rupee(totalSpent)}</span>
                </div>
              )}
            </div>

            {/* Loyalty points */}
            <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold">
                  <Star size={16} />
                  <span className="font-display text-[0.72rem] font-bold uppercase tracking-wider">Loyalty Points</span>
                </div>
                <span className="font-display text-lg font-bold text-gold">
                  {loyalty}
                  <span className="ml-1 text-[0.72rem] font-normal text-white/30">/ {LOYALTY_GOAL}</span>
                </span>
              </div>
              <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-yellow-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, (loyalty / LOYALTY_GOAL) * 100)}%` }}
                />
              </div>
              <p className="text-[0.7rem] text-white/35">
                {loyalty >= LOYALTY_GOAL
                  ? '🎉 You\'ve earned a free game! Visit the counter to redeem.'
                  : `${LOYALTY_GOAL - loyalty} more points to earn a free game`}
              </p>
            </div>

            {/* Active table */}
            <div className={`mb-4 rounded-2xl p-5 transition-all ${active ? 'border border-green-400/30 bg-green-400/[0.04]' : 'border border-white/8 bg-white/[0.02]'}`}>
              <div className="flex items-center gap-2 text-white/70">
                <Clock size={16} className={active ? 'text-green-400' : ''} />
                <span className="font-display text-[0.72rem] font-bold uppercase tracking-wider">Active Table</span>
                {active && (
                  <span className="ml-auto">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                    </span>
                  </span>
                )}
              </div>
              {active ? (
                <div className="mt-3">
                  <div className="font-display text-xl font-bold text-green-400">{active.tableName}</div>
                  <div className="mt-0.5 text-[0.78rem] text-white/45">
                    {active.mode === 'frames' ? 'Frames · loser pays' : 'Running on timer'}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[0.82rem] text-white/40">No active table right now.</p>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-red px-4 py-3.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-white"
              >
                <Phone size={15} /> Book Table
              </a>
              <a
                href={LINKS.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-gold/40 px-4 py-3.5 font-display text-[0.78rem] font-bold uppercase tracking-wider text-gold"
              >
                <MapPin size={15} /> Directions
              </a>
            </div>
            <p className="mt-4 text-center text-[0.72rem] text-white/30">{SITE.hours}</p>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-gold" />
                <h2 className="font-display text-lg font-bold text-white">Visit History</h2>
              </div>
              {visits.length > 0 && (
                <div className="text-right">
                  <div className="font-display text-sm font-bold text-gold">{rupee(totalSpent)}</div>
                  <div className="text-[0.58rem] uppercase tracking-wider text-white/35">Total spent</div>
                </div>
              )}
            </div>

            {visits.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-14 text-center">
                <History size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-[0.85rem] text-white/35">No visits recorded yet.</p>
                <p className="mt-1 text-[0.72rem] text-white/25">Your visit history will appear here after your first session.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visits.map((v) => (
                  <div key={v._id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div>
                      <div className="text-[0.85rem] font-semibold text-white/85">{v.tableName}</div>
                      <div className="mt-0.5 text-[0.68rem] text-white/35">
                        {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="mx-1.5 text-white/20">·</span>
                        {new Date(v.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[0.64rem] uppercase tracking-wider text-white/25">
                        <span>{v.mode}</span>
                        <span className="text-white/15">·</span>
                        <span>{v.paymentMethod}</span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-gold">{rupee(v.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── KHATA TAB ── */}
        {tab === 'khata' && (
          <>
            <div className="mb-5 flex items-center gap-2">
              <BookUser size={18} className="text-gold" />
              <h2 className="font-display text-lg font-bold text-white">My Khata</h2>
            </div>

            {/* Balance summary */}
            {profile?.balance != null ? (
              <div className={`mb-5 rounded-2xl p-5 text-center ${profile.balance > 0 ? 'border border-red-light/30 bg-red-light/[0.06]' : 'border border-green-400/20 bg-green-400/[0.04]'}`}>
                <div className={`font-display text-3xl font-bold ${profile.balance > 0 ? 'text-red-light' : 'text-green-400'}`}>
                  {rupee(Math.abs(profile.balance))}
                </div>
                <div className="mt-1 text-[0.72rem] text-white/45">
                  {profile.balance > 0 ? 'outstanding balance — please clear at the counter' : profile.balance < 0 ? 'credit balance' : 'your account is clear ✓'}
                </div>
                {profile.balance > 0 && (
                  <a
                    href="https://wa.me/917433928183"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red/20 px-4 py-2 font-display text-[0.72rem] font-bold uppercase text-red-light"
                  >
                    <MessageSquare size={13} /> Contact to Pay
                  </a>
                )}
              </div>
            ) : (
              <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-6 text-center text-[0.82rem] text-white/35">
                Loading account info…
              </div>
            )}

            {/* Transactions */}
            {!profile?.transactions?.length ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-10 text-center">
                <BookUser size={28} className="mx-auto mb-3 text-white/20" />
                <p className="text-[0.82rem] text-white/35">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(profile.transactions as any[]).map((t: any) => (
                  <div key={t._id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-3">
                      {t.type === 'gave'
                        ? <TrendingDown size={16} className="shrink-0 text-red-light" />
                        : <TrendingUp size={16} className="shrink-0 text-green-400" />
                      }
                      <div>
                        <div className={`text-[0.78rem] font-semibold ${t.type === 'gave' ? 'text-red-light' : 'text-green-400'}`}>
                          {t.type === 'gave' ? 'Credit given' : 'Payment received'}
                        </div>
                        {t.note && <div className="text-[0.65rem] text-white/35">{t.note}</div>}
                        <div className="text-[0.62rem] text-white/25">
                          {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <span className={`font-display text-sm font-bold ${t.type === 'gave' ? 'text-red-light' : 'text-green-400'}`}>
                      {t.type === 'gave' ? '+' : '−'}{rupee(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-5 text-center text-[0.68rem] text-white/25">
              For any disputes, contact us on WhatsApp.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function CustomerPage() {
  return (
    <Guard roles={['customer']}>
      <CustomerHome />
    </Guard>
  )
}
