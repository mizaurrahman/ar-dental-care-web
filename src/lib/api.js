import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
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
  return error?.response?.data?.message
    || Object.values(error?.response?.data?.errors || {})?.[0]?.[0]
    || fallback
}
