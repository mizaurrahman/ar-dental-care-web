import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  // Render free tier can take 30–90s to wake from sleep
  timeout: 90000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const path = window.location.pathname
      if (!path.startsWith('/appointment') && !path.startsWith('/book') && !path.startsWith('/rx') && path !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api

export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.code === 'ECONNABORTED') {
    return 'Server is still waking up (free hosting). Wait a moment and try again.'
  }
  if (!error?.response && error?.message === 'Network Error') {
    return 'Cannot reach the API. If this is the first request after idle, wait ~1 minute and retry.'
  }
  return error?.response?.data?.message
    || Object.values(error?.response?.data?.errors || {})?.[0]?.[0]
    || fallback
}

/** Hit the API root health endpoint to wake a sleeping free-tier host. */
export async function warmApi() {
  const base = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '')
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 90000)
  try {
    await fetch(`${base}/up`, { signal: ctrl.signal, mode: 'cors' })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}
