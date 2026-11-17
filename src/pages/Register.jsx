import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('email')
  const [form, setForm] = useState({
    name: '',
    clinic_name: '',
    specialty: 'Oral and Dental Surgeon',
    clinic_phone: '',
    clinic_address: '',
    appointment_slug: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        clinic_name: form.clinic_name,
        specialty: form.specialty || undefined,
        clinic_phone: form.clinic_phone || undefined,
        clinic_address: form.clinic_address || undefined,
        appointment_slug: form.appointment_slug || undefined,
        password: form.password,
        password_confirmation: form.password_confirmation,
        ...(mode === 'email' ? { email: form.email } : { phone: form.phone }),
      }
      const { data } = await api.post('/auth/register', payload)
      navigate('/verify', {
        state: {
          channel: mode === 'email' ? 'email' : 'sms',
          email: form.email || undefined,
          phone: form.phone || undefined,
          dev_otp: data.verification?.dev_otp,
          appointment_url: data.appointment_url,
          clinic_name: data.user?.clinic_name,
        },
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="page-enter grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl md:grid-cols-2">
        <div className="hidden bg-[var(--blue)] p-10 text-white md:flex md:flex-col md:justify-center">
          <div className="brand text-2xl font-extrabold">AR Dental Care</div>
          <h2 className="mt-6 text-3xl font-bold">Register your own clinic</h2>
          <p className="mt-3 text-white/85">
            Every doctor gets a private dashboard, clinic profile, and a unique appointment link with QR code.
          </p>
        </div>
        <div className="max-h-[90vh] overflow-auto p-8 md:p-10">
          <h1 className="text-3xl font-extrabold text-[var(--navy)]">Sign Up</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Create your clinic account — not shared with other doctors.</p>

          <div className="mt-4 flex gap-2">
            {['email', 'phone'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === m ? 'bg-[var(--blue)] text-white' : 'bg-slate-100'}`}
              >
                {m === 'email' ? 'Email' : 'BD Phone'}
              </button>
            ))}
          </div>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="label">Doctor full name</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Clinic name</label>
              <input
                className="input"
                required
                placeholder="e.g. Smile Bright Dental"
                value={form.clinic_name}
                onChange={(e) => setForm({ ...form, clinic_name: e.target.value })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Specialty</label>
                <input className="input" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
              </div>
              <div>
                <label className="label">Appointment link slug (optional)</label>
                <input
                  className="input"
                  placeholder="auto from clinic name"
                  value={form.appointment_slug}
                  onChange={(e) => setForm({ ...form, appointment_slug: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Clinic address (optional)</label>
              <input className="input" value={form.clinic_address} onChange={(e) => setForm({ ...form, clinic_address: e.target.value })} />
            </div>
            <div>
              <label className="label">Clinic phone BD (optional)</label>
              <input className="input" placeholder="01XXXXXXXXX" value={form.clinic_phone} onChange={(e) => setForm({ ...form, clinic_phone: e.target.value })} />
            </div>

            {mode === 'email' ? (
              <div>
                <label className="label">Login email</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            ) : (
              <div>
                <label className="label">Login Bangladesh phone</label>
                <input className="input" required placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input className="input" type="password" required value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
              </div>
            </div>

            {error && <div className="alert-error">{error}</div>}
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create clinic account'}</button>
          </form>

          <p className="mt-5 text-sm text-[var(--muted)]">
            Already have an account? <Link className="font-semibold text-[var(--blue)]" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
