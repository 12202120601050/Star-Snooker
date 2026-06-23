'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { Logo } from '@/components/snooker/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const { registerCustomer } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    if (pin.length < 4) return setErr('PIN must be at least 4 digits.')
    setBusy(true)
    try {
      await registerCustomer(name.trim(), phone.trim(), pin)
      router.replace('/customer')
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Could not create account. Try a different number.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <Logo size={64} glow />
      <h1 className="mt-5 font-display text-xl font-bold uppercase tracking-wide text-white">Become a Member</h1>
      <p className="mt-1 text-[0.8rem] text-white/45">Earn points every hour you play</p>

      <form onSubmit={submit} className="mt-6 w-full max-w-xs space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-sm text-white outline-none focus:border-gold" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" placeholder="Phone number" className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-sm text-white outline-none focus:border-gold" />
        <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" placeholder="Create a 4-digit PIN" className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-sm text-white outline-none focus:border-gold" />
        {err && <p className="text-[0.78rem] text-red-light">{err}</p>}
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red px-4 py-3 font-display text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60">
          <UserPlus size={16} /> {busy ? 'Creating…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-[0.8rem] text-white/45">
        Already a member?{' '}
        <Link href="/login" className="font-semibold text-gold hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
