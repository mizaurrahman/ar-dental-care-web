import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage, warmApi } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: 'doctor@ardental.local', password: 'password' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const [warming, setWarming] = useState(true)

  useEffect(() => {
    let alive = true
    setWarming(true)
    warmApi().then((ok) => {
      if (!alive) return
      setApiReady(ok)
      setWarming(false)
    })
    return () => { alive = false }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (!apiReady) {
        setWarming(true)
        await warmApi()
        setApiReady(true)
        setWarming(false)
      }
      await login(form.login, form.password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'))
    } finally {
      setBusy(false)
      setWarming(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-3 sm:p-4">
      <div className="page-enter grid w-full max-w-5xl overflow-hidden rounded-[22px] bg-white shadow-2xl sm:rounded-[28px] md:grid-cols-2">
        <div className="relative hidden md:block">
          <div
            className="h-1/2 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80)' }}
          />
          <div className="flex h-1/2 flex-col justify-center bg-[var(--blue)] p-10 text-white">
            <div className="brand mb-4 text-2xl font-extrabold">AR Dental Care</div>
            <div className="mb-2 h-16 w-1 rounded bg-white/70" />
            <h2 className="text-3xl font-bold leading-tight">Welcome to AR Dental Care</h2>
            <p className="mt-3 max-w-sm text-sm text-white/85">
              Appointments, prescriptions, and patient scheduling in one place for your dental clinic.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
          <div className="brand mb-2 text-base font-bold text-[var(--blue)] sm:text-lg">AR Dental Care</div>
          <h1 className="text-3xl font-extrabold text-[var(--navy)] sm:text-4xl">Login</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Enter your credentials to login to your account</p>

          {(warming || busy) && (
            <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {warming && !busy
                ? 'Connecting to server… free hosting may take up to a minute after idle.'
                : 'Signing in… if this is the first request after idle, please wait.'}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label">Email or BD phone</label>
              <input className="input" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="doctor@ardental.local" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]" onClick={() => setShow((v) => !v)}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--muted)]">
            Don&apos;t have an account? <Link className="font-semibold text-[var(--blue)]" to="/register">Sign Up</Link>
          </p>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-[var(--muted)]">
            Demo: <strong>doctor@ardental.local</strong> / <strong>password</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
