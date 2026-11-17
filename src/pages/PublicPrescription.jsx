import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../lib/api'
import PrescriptionPad from '../components/PrescriptionPad'

export default function PublicPrescription() {
  const { token } = useParams()
  const [rx, setRx] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/public/prescriptions/${token}`)
      .then((res) => setRx(res.data.prescription))
      .catch((err) => setError(getErrorMessage(err, 'Prescription not found')))
  }, [token])

  if (error) return <div className="grid min-h-screen place-items-center text-red-600">{error}</div>
  if (!rx) return <div className="grid min-h-screen place-items-center text-[var(--muted)]">Loading prescription…</div>

  const form = {
    patient: rx.patient,
    patient_age: rx.patient_age,
    prescribed_on: rx.prescribed_on,
    chief_complaints: rx.chief_complaints,
    on_examination: rx.on_examination,
    advice: rx.advice,
    follow_up_days: rx.follow_up_days,
    items: rx.items,
  }

  return (
    <div className="min-h-screen bg-[var(--page)] p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="no-print flex justify-end">
          <button className="btn-primary" onClick={() => window.print()}>Print</button>
        </div>
        <PrescriptionPad doctor={rx.doctor} form={form} setForm={() => {}} readOnly />
      </div>
    </div>
  )
}
