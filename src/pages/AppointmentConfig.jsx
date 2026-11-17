import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../lib/api'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AppointmentConfig() {
  const [rules, setRules] = useState([])
  const [exceptions, setExceptions] = useState([])
  const [form, setForm] = useState({ day_of_week: 0, start_time: '10:00', end_time: '14:00', slot_minutes: 30 })
  const [exceptionForm, setExceptionForm] = useState({ date: '', is_closed: true, reason: '' })
  const [error, setError] = useState('')

  async function load() {
    const [r, e] = await Promise.all([
      api.get('/availability/rules'),
      api.get('/availability/exceptions'),
    ])
    setRules(r.data.rules)
    setExceptions(e.data.exceptions)
  }

  useEffect(() => { load().catch((err) => setError(getErrorMessage(err))) }, [])

  async function addRule(e) {
    e.preventDefault()
    await api.post('/availability/rules', form)
    await load()
  }

  async function addException(e) {
    e.preventDefault()
    await api.post('/availability/exceptions', exceptionForm)
    await load()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-5">
        <h1 className="text-2xl font-extrabold text-[var(--navy)]">Appointment configuration</h1>
        <p className="mb-4 text-sm text-[var(--muted)]">Set weekly hours patients can use on your public appointment link.</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={addRule}>
          <div>
            <label className="label">Day</label>
            <select className="input" value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })}>
              {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Slot minutes</label>
            <input className="input" type="number" value={form.slot_minutes} onChange={(e) => setForm({ ...form, slot_minutes: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Start</label>
            <input className="input" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          </div>
          <div>
            <label className="label">End</label>
            <input className="input" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <button className="btn-primary sm:col-span-2">Add hours</button>
        </form>
        <div className="mt-5 space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span>{days[r.day_of_week]} · {String(r.start_time).slice(0, 5)} – {String(r.end_time).slice(0, 5)} · {r.slot_minutes}m</span>
              <button className="text-rose-600" onClick={async () => { await api.delete(`/availability/rules/${r.id}`); await load() }}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-bold">Day off / exceptions</h2>
        <form className="mt-4 grid gap-3" onSubmit={addException}>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" required value={exceptionForm.date} onChange={(e) => setExceptionForm({ ...exceptionForm, date: e.target.value })} />
          </div>
          <div>
            <label className="label">Reason</label>
            <input className="input" value={exceptionForm.reason} onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })} />
          </div>
          <button className="btn-primary">Mark closed</button>
        </form>
        <div className="mt-5 space-y-2">
          {exceptions.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span>{ex.date?.slice?.(0, 10) || ex.date} {ex.reason ? `· ${ex.reason}` : ''}</span>
              <button className="text-rose-600" onClick={async () => { await api.delete(`/availability/exceptions/${ex.id}`); await load() }}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
