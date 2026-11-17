import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addDays, addMonths, format, parseISO, startOfMonth } from 'date-fns'
import api, { getErrorMessage } from '../lib/api'
import AppointmentCalendar from '../components/AppointmentCalendar'

export default function PublicAppointment() {
  const { slug } = useParams()
  const [doctor, setDoctor] = useState(null)
  const [slots, setSlots] = useState({})
  const [month, setMonth] = useState(startOfMonth(new Date()))
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', email: '', reason: '' })
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadSlots = useCallback(async (activeMonth) => {
    setLoadingSlots(true)
    setError('')
    try {
      const from = format(startOfMonth(activeMonth), 'yyyy-MM-dd')
      const to = format(addDays(addMonths(startOfMonth(activeMonth), 1), -1), 'yyyy-MM-dd')
      // Also include a few days into next month for week overflow
      const toExtended = format(addDays(startOfMonth(addMonths(activeMonth, 1)), 6), 'yyyy-MM-dd')
      const { data } = await api.get(`/public/appointment/${slug}`, {
        params: { from, to: toExtended > to ? toExtended : to },
      })
      setDoctor(data.doctor)
      setSlots(data.slots || {})
      return data.slots || {}
    } catch (err) {
      setError(getErrorMessage(err, 'Appointment page unavailable'))
      return {}
    } finally {
      setLoadingSlots(false)
    }
  }, [slug])

  useEffect(() => {
    loadSlots(month).then((map) => {
      setDate((current) => {
        if (current && (map[current] || []).length) return current
        const firstOpen = Object.keys(map).find((key) => (map[key] || []).length > 0)
        return firstOpen || ''
      })
      setSelected(null)
    })
  }, [month, loadSlots])

  const daySlots = useMemo(() => (date ? (slots[date] || []) : []), [slots, date])

  function selectDate(next) {
    setDate(next)
    setSelected(null)
  }

  async function confirmAppointment(e) {
    e.preventDefault()
    if (!selected) return
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post(`/public/appointment/${slug}`, {
        ...form,
        starts_at: selected,
      })
      setDone(data)
    } catch (err) {
      setError(getErrorMessage(err, 'That time was just taken. Pick another slot.'))
      // Refresh so occupied slots disappear for this patient
      const map = await loadSlots(month)
      if (date && !(map[date] || []).some((s) => s.starts_at === selected)) {
        setSelected(null)
      }
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--page)] p-4">
        <div className="card max-w-lg p-8 text-center">
          <h1 className="text-2xl font-extrabold text-[var(--navy)]">Appointment confirmed</h1>
          <p className="mt-3 text-[var(--muted)]">Confirmation sent to your email and phone.</p>
          <p className="mt-4 font-semibold">{format(parseISO(done.appointment.starts_at), 'EEEE, MMM d · h:mm a')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--page)] p-4">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <div className="brand text-sm font-bold text-[var(--blue)]">AR Dental Care</div>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--navy)]">{doctor?.clinic_name || 'Book appointment'}</h1>
          <p className="mt-1 text-lg font-semibold">{doctor?.name}</p>
          <p className="text-sm text-[var(--muted)]">{doctor?.specialty}</p>
          <p className="mt-4 text-sm">{doctor?.clinic_address}</p>
          <p className="text-sm">{doctor?.visiting_hours}</p>
        </div>

        <div className="card p-5 md:p-6">
          <h2 className="text-xl font-bold">Select date & time</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Only open days and free times are shown.</p>

          <div className="mt-4">
            <AppointmentCalendar
              month={month}
              onMonthChange={setMonth}
              selectedDate={date}
              onSelectDate={selectDate}
              availability={slots}
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--navy)]">
                {date ? `Available times · ${format(parseISO(`${date}T12:00:00`), 'EEE, MMM d')}` : 'Pick a date'}
              </h3>
              {loadingSlots && <span className="text-xs text-[var(--muted)]">Updating…</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {daySlots.map((s) => (
                <button
                  key={s.starts_at}
                  type="button"
                  onClick={() => setSelected(s.starts_at)}
                  className={`btn-ghost w-full ${selected === s.starts_at ? '!border-[var(--blue)] !bg-blue-50 !text-[var(--blue)]' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {date && !daySlots.length && !loadingSlots && (
              <p className="mt-3 text-sm text-[var(--muted)]">No free slots on this date — every open time is already taken.</p>
            )}
          </div>

          <form className="mt-6 space-y-3" onSubmit={confirmAppointment}>
            <input className="input" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" required placeholder="BD phone 01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Reason (optional)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {error && <div className="alert-error">{error}</div>}
            <button className="btn-primary w-full" disabled={!selected || busy}>
              {busy ? 'Confirming…' : 'Confirm appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
