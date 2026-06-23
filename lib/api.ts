import axios from 'axios'

// Base URL of the Star Snooker backend. Set NEXT_PUBLIC_API_URL in the
// frontend env (e.g. https://api.starsnooker.app/api) once the backend is live.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
})

// Attach the JWT (saved by the auth store) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ss_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
