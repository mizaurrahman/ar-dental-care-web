import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addDays, addMonths, format, parseISO, startOfMonth } from 'date-fns'
import api, { getErrorMessage } from '../lib/api'
import AppointmentCalendar from '../components/AppointmentCalendar'

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'DR'
}

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
  const clinicTitle = doctor?.clinic_name || 'Book appointment'

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
      <div className="public-appt grid min-h-screen place-items-center p-4">
        <div className="page-enter w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200/80">
          <ClinicBanner doctor={doctor} compact />
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-600">✓</div>
            <h1 className="text-2xl font-extrabold text-[var(--navy)]">Appointment confirmed</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Confirmation sent to your email and phone.</p>
            <p className="mt-4 text-base font-semibold text-[var(--navy)]">
              {format(parseISO(done.appointment.starts_at), 'EEEE, MMM d · h:mm a')}
            </p>
            {doctor?.name && (
              <p className="mt-1 text-sm text-[var(--muted)]">with {doctor.name}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-appt min-h-screen p-3 sm:p-5">
      <div className="page-enter mx-auto grid max-w-6xl gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-5">
        {/* Clinic identity panel */}
        <aside className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200/70">
          <ClinicBanner doctor={doctor} />

          <div className="relative px-6 pb-7 pt-0 sm:px-7 md:px-8">
            {/* Avatar overlaps banner; title stacks below so nothing collides */}
            <div className="-mt-11 mb-5 sm:-mt-12">
              <DoctorAvatar doctor={doctor} />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold leading-snug text-[var(--navy)] sm:text-[1.75rem]">
                {clinicTitle}
              </h1>
              <p className="text-base font-semibold text-slate-700">{doctor?.name || '…'}</p>
            </div>

            {doctor?.specialty && (
              <p className="mt-3 text-sm font-medium text-[var(--blue)]">{doctor.specialty}</p>
            )}
            {doctor?.qualifications && (
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{doctor.qualifications}</p>
            )}
            {doctor?.bmdc_reg && (
              <p className="mt-3 inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                BMDC {doctor.bmdc_reg}
              </p>
            )}

            <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5 text-sm">
              {doctor?.clinic_address && (
                <InfoRow label="Clinic" value={doctor.clinic_address} />
              )}
              {doctor?.visiting_hours && (
                <InfoRow label="Hours" value={doctor.visiting_hours} />
              )}
              {doctor?.clinic_phone && (
                <InfoRow
                  label="Phone"
                  value={
                    <a className="font-semibold text-[var(--blue)] hover:underline" href={`tel:${doctor.clinic_phone}`}>
                      {doctor.clinic_phone}
                    </a>
                  }
                />
              )}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
              Pick an open day and free time — occupied slots are hidden automatically.
            </p>
          </div>
        </aside>

        {/* Booking panel */}
        <section className="rounded-[28px] bg-white p-6 shadow-xl ring-1 ring-slate-200/70 sm:p-7 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-[var(--navy)]">Select date & time</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Only open days and free times are shown.</p>
            </div>
            {doctor?.logo_url && (
              <img
                src={doctor.logo_url}
                alt=""
                className="hidden h-9 w-auto max-w-[100px] shrink-0 object-contain opacity-70 sm:block"
              />
            )}
          </div>

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
            <div className="mb-2 flex items-center justify-between gap-2">
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
            <div className="mb-1 text-sm font-bold text-[var(--navy)]">Your details</div>
            <input className="input" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" required placeholder="BD phone 01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Reason (optional)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {error && <div className="alert-error">{error}</div>}
            <button className="btn-primary w-full" disabled={!selected || busy}>
              {busy ? 'Confirming…' : 'Confirm appointment'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function ClinicBanner({ doctor, compact = false }) {
  const hasLogo = Boolean(doctor?.logo_url)
  const height = compact ? 'h-28' : 'h-36 sm:h-40'

  return (
    <div className={`relative ${height} overflow-hidden bg-[var(--navy)]`}>
      {hasLogo ? (
        <>
          <img
            src={doctor.logo_url}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy)]/85 via-[var(--navy-soft)]/75 to-[var(--blue)]/45" />
          <div className="relative z-[1] flex h-full items-center justify-center px-8 py-6">
            <img
              src={doctor.logo_url}
              alt={doctor?.clinic_name || 'Clinic logo'}
              className={`${compact ? 'max-h-12' : 'max-h-16 sm:max-h-20'} max-w-[65%] object-contain drop-shadow-lg`}
            />
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col justify-between bg-gradient-to-br from-[var(--navy)] via-[var(--navy-soft)] to-[var(--blue)] px-6 py-5 sm:px-7 sm:py-6">
          <div className="brand text-sm font-bold text-white/90">AR Dental Care</div>
          <div>
            <div className={`${compact ? 'text-lg' : 'text-2xl sm:text-3xl'} font-extrabold text-white`}>
              {doctor?.clinic_name || 'Dental clinic'}
            </div>
            {!compact && doctor?.specialty && (
              <div className="mt-1 text-sm text-white/75">{doctor.specialty}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )

function DoctorAvatar({ doctor }) {
  if (doctor?.avatar_url) {
    return (
      <img
        src={doctor.avatar_url}
        alt={doctor?.name || 'Doctor'}
        className="h-[88px] w-[88px] rounded-2xl object-cover shadow-lg ring-[3px] ring-white sm:h-24 sm:w-24"
      />
    )
  }

  return (
    <div
      className="grid h-[88px] w-[88px] place-items-center rounded-2xl bg-[var(--blue-soft)] text-lg font-extrabold text-[var(--blue)] shadow-lg ring-[3px] ring-white sm:h-24 sm:w-24 sm:text-xl"
      aria-hidden
    >
      {initials(doctor?.name)}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-start gap-x-3 sm:grid-cols-[5rem_1fr] sm:gap-x-4">
      <div className="pt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="min-w-0 break-words text-slate-700">{value}</div>
    </div>
  )
}
