import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import WeekChart from '../components/WeekChart'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    let alive = true
    api.get('/dashboard', { params: { date: selectedDate } }).then((res) => {
      if (alive) setData(res.data)
    })
    return () => { alive = false }
  }, [selectedDate])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  if (!data) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-10 w-72" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24" />)}
        </div>
        <div className="skeleton h-56" />
      </div>
    )
  }

  const stats = [
    { label: 'Total Appointments', value: data.stats.total_appointments, color: 'bg-violet-100 text-violet-700' },
    { label: "Today's Appointments", value: data.stats.today_appointments, color: 'bg-rose-100 text-rose-700' },
    { label: 'Prescriptions', value: data.stats.prescriptions, color: 'bg-amber-100 text-amber-700' },
    { label: 'New Patients', value: data.stats.new_patients, color: 'bg-emerald-100 text-emerald-700' },
  ]

  return (
    <div className="page-enter space-y-3">
      <div className="fade-up">
        <h1 className="text-2xl font-extrabold text-[var(--navy)] md:text-3xl">{greeting}, {user?.name}</h1>
        <p className="text-sm text-[var(--muted)]">Here is what is happening at AR Dental Care today.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`card fade-up fade-up-delay-${i + 1} p-4`}>
            <div className={`mb-2 inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold ${s.color}`}>{s.label}</div>
            <div className="text-2xl font-extrabold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="card fade-up p-4">
          <h2 className="mb-2 text-base font-bold">Your patients this week</h2>
          <WeekChart data={data.weekly_chart || []} />
        </div>

        <div className="card fade-up fade-up-delay-2 p-4">
          <h2 className="mb-2 text-base font-bold">Calendar</h2>
          <input type="date" className="input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <div className="mt-3 space-y-2">
            {(data.patients_today || []).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 transition hover:bg-blue-50">
                <div>
                  <div className="text-sm font-semibold">{a.patient?.name}</div>
                  <div className="text-[11px] text-[var(--muted)]">{a.reason || 'Consultation'}</div>
                </div>
                <div className="text-xs font-bold text-[var(--blue)]">{format(parseISO(a.starts_at), 'h:mm a')}</div>
              </div>
            ))}
            {!data.patients_today?.length && <p className="text-sm text-[var(--muted)]">No patients on this date.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card fade-up p-4">
          <h2 className="mb-2 text-base font-bold">Upcoming appointments</h2>
          <div className="space-y-2">
            {data.upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <div className="text-sm font-semibold">{a.patient?.name}</div>
                  <div className="text-[11px] text-[var(--muted)]">{format(parseISO(a.starts_at), 'MMM d, h:mm a')}</div>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[var(--blue)]">{a.status}</span>
              </div>
            ))}
            {!data.upcoming.length && <p className="text-sm text-[var(--muted)]">No upcoming appointments.</p>}
          </div>
          <Link to="/appointments" className="mt-3 inline-block text-sm font-semibold text-[var(--blue)] hover:underline">View all →</Link>
        </div>

        <div className="card fade-up fade-up-delay-2 p-4">
          <h2 className="mb-2 text-base font-bold">Appointment link & QR</h2>
          {data.clinic_name && <p className="mb-1 text-sm font-semibold text-[var(--navy)]">{data.clinic_name}</p>}
          <p className="break-all text-xs text-[var(--muted)]">{data.appointment_url}</p>
          {data.appointment_url && (
            <div className="mt-3 inline-flex rounded-2xl bg-white p-2.5 ring-1 ring-slate-200 transition hover:scale-[1.02]">
              <QRCodeSVG value={data.appointment_url} size={120} />
            </div>
          )}
          <div className="toolbar mt-3">
            <button type="button" className="btn-primary" onClick={() => navigator.clipboard.writeText(data.appointment_url || '')}>Copy link</button>
            <Link className="btn-ghost" to="/profile">Profile settings</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
