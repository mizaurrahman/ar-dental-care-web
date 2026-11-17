import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import api, { getErrorMessage } from '../lib/api'

export default function Appointments() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  async function load() {
    const { data } = await api.get('/appointments')
    setItems(data.appointments.data || data.appointments)
  }

  useEffect(() => { load().catch((e) => setError(getErrorMessage(e))) }, [])

  async function updateStatus(id, status) {
    await api.patch(`/appointments/${id}`, { status })
    await load()
  }

  return (
    <div className="page-enter card p-4 md:p-5">
      <h1 className="text-xl font-extrabold text-[var(--navy)] md:text-2xl">Appointments</h1>
      <p className="mb-4 text-sm text-[var(--muted)]">Manage scheduled visits and mark them completed or cancelled.</p>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-[var(--muted)]">
            <tr>
              <th className="py-3 pr-4">Patient</th>
              <th className="py-3 pr-4">When</th>
              <th className="py-3 pr-4">Reason</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="py-3 pr-4 font-semibold">{a.patient?.name}<div className="text-xs font-normal text-[var(--muted)]">{a.patient?.phone}</div></td>
                <td className="py-3 pr-4">{format(parseISO(a.starts_at), 'MMM d, yyyy h:mm a')}</td>
                <td className="py-3 pr-4">{a.reason || '—'}</td>
                <td className="py-3 pr-4"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{a.status}</span></td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-soft !bg-emerald-50 !text-emerald-700" onClick={() => updateStatus(a.id, 'completed')}>Complete</button>
                    <button type="button" className="btn-soft !bg-amber-50 !text-amber-700" onClick={() => updateStatus(a.id, 'no_show')}>No show</button>
                    <button type="button" className="btn-soft !bg-rose-50 !text-rose-700" onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="py-8 text-center text-sm text-[var(--muted)]">No appointments yet.</p>}
      </div>
    </div>
  )
}
