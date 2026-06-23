import axios from 'axios'

// Resolve the backend base URL robustly: trim trailing slashes and ensure it
// ends with /api — so it works whether NEXT_PUBLIC_API_URL is set as
// "https://host" or "https://host/api" or "https://host/".
function resolveBaseURL(): string {
  let b = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '')
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
