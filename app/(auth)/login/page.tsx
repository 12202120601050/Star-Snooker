'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/store/auth'
import { api } from '@/lib/api'
import { Logo } from '@/components/snooker/Logo'

export default function LoginPage() {
  const router = useRouter()
  const { loginStaff, loginCustomer } = useAuth()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    const p = phone.trim()
    try {
      // Auto-detect role: try staff/admin first, then fall back to member.
      let user
      try {
        user = await loginStaff(p, pin)
      } catch (staffErr: any) {
        // A network/CORS failure (no HTTP response) must not be masked as
        // "wrong PIN" — surface it. Only fall back to member on a real reply.
        if (!staffErr?.response) throw staffErr
        user = await loginCustomer(p, pin)
      }
      router.replace(`/${user.role}`)
    } catch (e: any) {
      if (!e?.response) {
        setErr(`Can't reach the server (${api.defaults.baseURL}). The site's API URL may be unset or it needs a redeploy.`)
      } else if (e.response.status === 401 || e.response.status === 400) {
        setErr('Wrong number or PIN. Please try again.')
      } else {
        setErr(`Login failed — HTTP ${e.response.status}.`)
      }
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
      <p className="mt-1 text-[0.8rem] text-white/45">Sign in with your number &amp; PIN</p>

      <form onSubmit={submit} className="mt-6 w-full max-w-xs space-y-3">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="numeric"
          autoFocus
          placeholder="Phone number"
          className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-sm text-white outline-none focus:border-gold"
        />
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="PIN"
          className="w-full rounded-lg border border-white/15 bg-ink-2 px-4 py-3 text-center text-sm tracking-[0.4em] text-white outline-none focus:border-gold"
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

      <p className="mt-4 text-[0.8rem] text-white/45">
        New here?{' '}
        <Link href="/register" className="font-semibold text-gold hover:underline">Create a member account</Link>
      </p>
      <Link href="/" className="mt-6 text-[0.75rem] text-white/35 hover:text-white/60">← Back to website</Link>
    </div>
  )
}
