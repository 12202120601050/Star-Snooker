'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type Role } from '@/store/auth'
import { Logo } from '@/components/snooker/Logo'

// Client-side route guard: requires a logged-in user with an allowed role,
// otherwise redirects to /login (or the user's own dashboard).
export function Guard({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const router = useRouter()
  const { user, ready, hydrate } = useAuth()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!ready) return
    if (!user) router.replace('/login')
    else if (!roles.includes(user.role)) router.replace(`/${user.role}`)
  }, [ready, user, roles, router])

  if (!ready || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink">
        <Logo size={56} glow className="animate-pulse" />
      </div>
    )
  }
  return <>{children}</>
}
