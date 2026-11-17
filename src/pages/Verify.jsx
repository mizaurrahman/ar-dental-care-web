import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api, { getErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Verify() {
  const location = useLocation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [channel, setChannel] = useState(location.state?.channel || params.get('channel') || 'sms')
  const [code, setCode] = useState(params.get('token') || location.state?.dev_otp || '')
  const [email, setEmail] = useState(location.state?.email || '')
  const [phone, setPhone] = useState(location.state?.phone || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState(location.state?.dev_otp ? `Dev OTP: ${location.state.dev_otp}` : '')

  useEffect(() => {
    if (params.get('token') && params.get('channel') === 'email') {
      setChannel('email')
      setCode(params.get('token'))
    }
  }, [params])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post('/auth/verify', {
        channel,
        code,
        email: email || undefined,
        phone: phone || undefined,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Verification failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#dfe7f3] p-4">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-8 shadow-2xl">
        <div className="brand text-lg font-bold text-[var(--blue)]">AR Dental Care</div>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--navy)]">Verify account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {channel === 'email' ? 'Enter the email verification token from your inbox.' : 'Enter the OTP sent to your phone.'}
        </p>
        {location.state?.appointment_url && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
            <div className="font-semibold">{location.state.clinic_name || 'Your clinic'} appointment link is ready</div>
            <div className="mt-1 break-all">{location.state.appointment_url}</div>
            <div className="mt-1 text-xs text-emerald-700">After verify, open Profile or Dashboard for your QR code.</div>
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Channel</label>
            <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="sms">SMS OTP</option>
              <option value="email">Email link/token</option>
            </select>
          </div>
          {channel === 'email' ? (
            <div>
              <label className="label">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="label">Phone</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
          <div>
            <label className="label">{channel === 'email' ? 'Token' : 'OTP'}</label>
            <input className="input" required value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          {info && <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">{info}</div>}
          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</button>
        </form>
        <p className="mt-6 text-sm"><Link className="text-[var(--blue)]" to="/login">Back to login</Link></p>
      </div>
    </div>
  )
}
