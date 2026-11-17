import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import api, { getErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        clinic_name: user.clinic_name || 'AR Dental Care',
        specialty: user.specialty || '',
        qualifications: user.qualifications || '',
        bmdc_reg: user.bmdc_reg || '',
        clinic_address: user.clinic_address || '',
        clinic_phone: user.clinic_phone || '',
        visiting_hours: user.visiting_hours || '',
        appointment_slug: user.appointment_slug || '',
      })
    }
  }, [user])

  async function save(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const { data } = await api.put('/profile', form)
      setUser(data.user)
      setMessage('Profile saved. Prescription headers and appointment link updated.')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function upload(kind, file) {
    const body = new FormData()
    body.append(kind, file)
    const { data } = await api.post(`/profile/${kind}`, body)
    setUser(data.user)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <form className="card space-y-4 p-4 sm:p-5" onSubmit={save}>
        <h1 className="text-xl font-extrabold text-[var(--navy)] sm:text-2xl">Profile & clinic settings</h1>
        <p className="text-sm text-[var(--muted)]">These details appear on your prescription pad and public appointment page.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['name', 'Doctor name'],
            ['email', 'Email'],
            ['phone', 'Phone (BD)'],
            ['clinic_name', 'Clinic name'],
            ['specialty', 'Specialty'],
            ['bmdc_reg', 'BMDC Reg No'],
            ['clinic_phone', 'Clinic phone'],
            ['appointment_slug', 'Appointment slug'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="label">Qualifications</label>
            <textarea className="input min-h-20" value={form.qualifications || ''} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Clinic address</label>
            <input className="input" value={form.clinic_address || ''} onChange={(e) => setForm({ ...form, clinic_address: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Visiting hours</label>
            <input className="input" value={form.visiting_hours || ''} onChange={(e) => setForm({ ...form, visiting_hours: e.target.value })} />
          </div>
        </div>
        {message && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        <button className="btn-primary">Save profile</button>
      </form>

      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Photos</h2>
          <label className="label">Doctor image</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload('avatar', e.target.files[0])} />
          {user?.avatar_url && <img src={user.avatar_url} alt="" className="mt-3 h-24 w-24 rounded-2xl object-cover" />}
          <label className="label mt-4">Clinic logo</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload('logo', e.target.files[0])} />
          {user?.logo_url && <img src={user.logo_url} alt="" className="mt-3 h-20 object-contain" />}
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Appointment link + QR</h2>
          <p className="break-all text-sm text-[var(--muted)]">{user?.appointment_url}</p>
          {user?.appointment_url && <div className="mt-4 inline-block rounded-2xl bg-white p-3 ring-1 ring-slate-200"><QRCodeSVG value={user.appointment_url} size={160} /></div>}
          <button className="btn-primary mt-4" type="button" onClick={() => navigator.clipboard.writeText(user?.appointment_url || '')}>Copy link</button>
        </div>
      </div>
    </div>
  )
}
