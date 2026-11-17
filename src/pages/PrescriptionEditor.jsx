import { useEffect, useMemo, useState, useTransition } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import api, { getErrorMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import MedicinePickerModal from '../components/MedicinePickerModal'
import PrescriptionPad from '../components/PrescriptionPad'

export default function PrescriptionEditor() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showPicker, setShowPicker] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()
  const [form, setForm] = useState({
    patient: { name: '', phone: '', email: '', age: '' },
    prescribed_on: format(new Date(), 'yyyy-MM-dd'),
    patient_age: '',
    chief_complaints: '',
    on_examination: '',
    advice: '',
    follow_up_days: '',
    items: [],
  })
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    if (!isNew) {
      let alive = true
      api.get(`/prescriptions/${id}`).then((res) => {
        if (!alive) return
        const rx = res.data.prescription
        startTransition(() => {
          setSaved(rx)
          setForm({
            patient: {
              name: rx.patient?.name || '',
              phone: rx.patient?.phone || '',
              email: rx.patient?.email || '',
              age: rx.patient_age || '',
            },
            prescribed_on: rx.prescribed_on?.slice?.(0, 10) || rx.prescribed_on,
            patient_age: rx.patient_age || '',
            chief_complaints: rx.chief_complaints || '',
            on_examination: rx.on_examination || '',
            advice: rx.advice || '',
            follow_up_days: rx.follow_up_days || '',
            items: rx.items || [],
          })
        })
      })
      return () => { alive = false }
    }
  }, [id, isNew])

  const doctor = useMemo(() => saved?.user || user, [saved, user])

  async function save() {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const payload = {
        ...form,
        patient_age: form.patient_age ? Number(form.patient_age) : null,
        follow_up_days: form.follow_up_days ? Number(form.follow_up_days) : null,
        patient: {
          ...form.patient,
          age: form.patient.age ? Number(form.patient.age) : (form.patient_age ? Number(form.patient_age) : null),
        },
      }
      const { data } = isNew
        ? await api.post('/prescriptions', payload)
        : await api.put(`/prescriptions/${id}`, payload)
      setSaved(data.prescription)
      setMessage('Prescription saved.')
      if (isNew) navigate(`/prescriptions/${data.prescription.id}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function emailShare() {
    if (!saved) return
    setBusy(true)
    try {
      await api.post(`/prescriptions/${saved.id}/share-email`)
      setMessage('Prescription emailed to patient.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function whatsappShare() {
    if (!saved) return
    const text = encodeURIComponent(`Your prescription from ${doctor.clinic_name}: ${saved.share_url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="page-enter space-y-3">
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/prescriptions" className="text-sm font-semibold text-[var(--blue)] hover:underline">← Back</Link>
          <h1 className="text-xl font-extrabold text-[var(--navy)] md:text-2xl">
            {isNew ? 'New prescription' : 'Edit prescription'}
          </h1>
        </div>
        <div className="toolbar">
          <button type="button" className="btn-ghost" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
          {saved && (
            <>
              <button type="button" className="btn-ghost" onClick={() => window.print()}>Print</button>
              <button type="button" className="btn-ghost" disabled={busy} onClick={emailShare}>Email</button>
              <button type="button" className="btn-ghost" onClick={whatsappShare}>WhatsApp</button>
              <button
                type="button"
                className="btn-soft"
                onClick={() => {
                  navigator.clipboard.writeText(saved.share_url)
                  setMessage('Share link copied.')
                }}
              >
                Copy link
              </button>
            </>
          )}
        </div>
      </div>

      {message && <div className="no-print alert-ok">{message}</div>}
      {error && <div className="no-print alert-error">{error}</div>}

      <div className="no-print card grid gap-2 p-3 sm:grid-cols-2 md:grid-cols-4">
        <input className="input" placeholder="Patient name" value={form.patient.name} onChange={(e) => setForm({ ...form, patient: { ...form.patient, name: e.target.value } })} />
        <input className="input" placeholder="BD phone" value={form.patient.phone} onChange={(e) => setForm({ ...form, patient: { ...form.patient, phone: e.target.value } })} />
        <input className="input" placeholder="Email" value={form.patient.email} onChange={(e) => setForm({ ...form, patient: { ...form.patient, email: e.target.value } })} />
        <input className="input" placeholder="Age" value={form.patient_age} onChange={(e) => setForm({ ...form, patient_age: e.target.value })} />
      </div>

      <div className="fade-up">
        <PrescriptionPad
          doctor={doctor}
          form={form}
          setForm={setForm}
          onAddMedicine={() => setShowPicker(true)}
          onRemoveItem={(idx) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}
        />
      </div>

      {showPicker && (
        <MedicinePickerModal
          onClose={() => setShowPicker(false)}
          onAddMany={(items) => {
            setForm((prev) => ({ ...prev, items: [...prev.items, ...items] }))
            setMessage(`${items.length} medicine${items.length === 1 ? '' : 's'} added to prescription.`)
          }}
        />
      )}
    </div>
  )
}
