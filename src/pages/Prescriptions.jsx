import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import api from '../lib/api'

export default function Prescriptions() {
  const [items, setItems] = useState([])

  useEffect(() => {
    api.get('/prescriptions').then((res) => setItems(res.data.prescriptions.data || []))
  }, [])

  return (
    <div className="page-enter card p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--navy)] md:text-2xl">Prescriptions</h1>
          <p className="text-sm text-[var(--muted)]">Create pad-style prescriptions and share with patients.</p>
        </div>
        <Link to="/prescriptions/new" className="btn-primary">New prescription</Link>
      </div>
      <div className="space-y-2">
        {items.map((rx) => (
          <Link key={rx.id} to={`/prescriptions/${rx.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40">
            <div>
              <div className="font-semibold">{rx.patient?.name}</div>
              <div className="text-xs text-[var(--muted)]">{format(parseISO(rx.prescribed_on), 'MMM d, yyyy')} · {rx.items?.length || 0} medicines</div>
            </div>
            <span className="text-sm font-semibold text-[var(--blue)]">Open</span>
          </Link>
        ))}
        {!items.length && <p className="py-8 text-center text-sm text-[var(--muted)]">No prescriptions yet.</p>}
      </div>
    </div>
  )
}
