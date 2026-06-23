'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { Logo } from '@/components/snooker/Logo'

export default function LoginPage() {
  const router = useRouter()
  const { loginStaff, loginCustomer } = useAuth()
  const [tab, setTab] = useState<'staff' | 'member'>('staff')
  const [phone, setPhone] = useState('')
  const [secret, setSecret] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const user = tab === 'staff' ? await loginStaff(phone.trim(), secret) : await loginCustomer(phone.trim(), secret)
      router.replace(`/${user.role}`)
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Login failed. Check your number and PIN.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <Logo size={64} glow />
      <h1 className="mt-5 font-display text-xl font-bold uppercase tracking-wide">
        <span className="text-red">Star</span> <span className="text-gold">Snooker</span> <span className="text-white">Academy</span>
      </h1>
      <p className="mt-1 text-[0.8rem] text-white/45">Sign in to your account</p>

      {/* Role toggle */}
      <div className="mt-6 flex w-full max-w-xs gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        {(['staff', 'member'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setErr('') }}
            className={`flex-1 rounded-md py-2 font-display text-[0.74rem] font-bold uppercase tracking-wider transition-colors ${tab === t ? 'bg-gold text-ink' : 'text-white/55'}`}
          >
            {t === 'staff' ? 'Staff / Admin' : 'Member'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 w-full max-w-xs space-y-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="numeric"
          placeholder="Phone number"
          className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-sm text-white outline-none focus:border-gold"
        />
        <input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          type="password"
          placeholder={tab === 'staff' ? 'Password' : 'PIN'}
          className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-sm text-white outline-none focus:border-gold"
        />
        {err && <p className="text-[0.78rem] text-red-light">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink disabled:opacity-60"
        >
          <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {tab === 'member' && (
        <p className="mt-4 text-[0.8rem] text-white/45">
          New here?{' '}
          <Link href="/register" className="font-semibold text-gold hover:underline">
            Create a member account
          </Link>
        </p>
      )}
      <Link href="/" className="mt-6 text-[0.75rem] text-white/35 hover:text-white/60">← Back to website</Link>
    </div>
  )
}
