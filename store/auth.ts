import { create } from 'zustand'
import { api } from '@/lib/api'

export type Role = 'admin' | 'staff' | 'customer'
export type User = { id?: string; _id?: string; name: string; phone: string; role: Role }

type AuthState = {
  token: string | null
  user: User | null
  ready: boolean
  hydrate: () => void
  loginStaff: (phone: string, password: string) => Promise<User>
  loginCustomer: (phone: string, pin: string) => Promise<User>
  registerCustomer: (name: string, phone: string, pin: string) => Promise<User>
  logout: () => void
}

function persist(token: string, user: User) {
  localStorage.setItem('ss_token', token)
  localStorage.setItem('ss_user', JSON.stringify(user))
}

// Backend may return { token, user } or a flattened { token, ...user }.
function normalize(data: any): { token: string; user: User } {
  const token = data.token
  const user: User = data.user ?? { name: data.name, phone: data.phone, role: data.role, id: data._id ?? data.id }
  return { token, user }
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  ready: false,

  hydrate: () => {
    try {
      const token = localStorage.getItem('ss_token')
      const raw = localStorage.getItem('ss_user')
      set({ token, user: raw ? JSON.parse(raw) : null, ready: true })
    } catch {
      set({ ready: true })
    }
  },

  loginStaff: async (phone, password) => {
    const { data } = await api.post('/auth/login', { phone, password })
    const { token, user } = normalize(data)
    persist(token, user)
    set({ token, user })
    return user
  },

  loginCustomer: async (phone, pin) => {
    const { data } = await api.post('/customers/login', { phone, pin })
    const token = data.token
    const raw = data.customer ?? data.user ?? data
    const user: User = { name: raw.name, phone: raw.phone, role: 'customer', id: raw._id ?? raw.id }
    persist(token, user)
    set({ token, user })
    return user
  },

  registerCustomer: async (name, phone, pin) => {
    const { data } = await api.post('/customers/register', { name, phone, pin })
    const { token, user } = normalize(data)
    persist(token, { ...user, role: 'customer' })
    set({ token, user: { ...user, role: 'customer' } })
    return user
  },

  logout: () => {
    localStorage.removeItem('ss_token')
    localStorage.removeItem('ss_user')
    set({ token: null, user: null })
  },
}))
