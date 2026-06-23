import axios from 'axios'

// Known production backend (public Railway URL). Used as the default so the
// app works even if NEXT_PUBLIC_API_URL is unset or set incorrectly on Vercel.
const PROD_API = 'https://star-snooker-production.up.railway.app/api'

// Resolve the base URL robustly:
//  - empty / no protocol  → fall back to PROD_API
//  - trailing slash       → trimmed
//  - missing /api suffix  → appended
function resolveBaseURL(): string {
  let b = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  if (!b || !/^https?:\/\//i.test(b)) return PROD_API
  b = b.replace(/\/+$/, '')
  if (!/\/api$/i.test(b)) b += '/api'
  return b
}

export const api = axios.create({ baseURL: resolveBaseURL() })

// Attach the JWT (saved by the auth store) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ss_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
