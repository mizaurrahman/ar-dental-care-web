export default function PrescriptionPad({
  doctor,
  form,
  setForm,
  onRemoveItem,
  onAddMedicine,
  readOnly = false,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-orange-200/80 bg-white shadow-[0_16px_40px_rgba(249,115,22,0.08)]">
      <div className="grid gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50/40 p-4 md:grid-cols-[1.2fr_0.8fr] md:p-5">
        <div>
          <div className="text-xl font-extrabold text-orange-600 md:text-2xl">{doctor?.clinic_name || 'AR Dental Care'}</div>
          <div className="mt-1 text-sm text-slate-600">{doctor?.clinic_address}</div>
          <div className="text-sm text-slate-600">Mobile: {doctor?.clinic_phone}</div>
          {doctor?.visiting_hours && (
            <div className="mt-2 inline-block rounded-lg border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-[11px] font-semibold text-orange-700">
              Visiting hours: {doctor.visiting_hours}
            </div>
          )}
        </div>
        <div className="text-right">
          {doctor?.logo_url && <img src={doctor.logo_url} alt="" className="ml-auto mb-2 h-10 object-contain" />}
          <div className="text-lg font-extrabold text-orange-600 md:text-xl">{doctor?.name}</div>
          <div className="text-sm font-semibold text-slate-700">{doctor?.specialty}</div>
          <div className="text-xs text-slate-500">{doctor?.qualifications}</div>
          <div className="text-xs text-slate-500">BMDC: {doctor?.bmdc_reg}</div>
        </div>
      </div>

      <div className="grid gap-2 bg-[#2f6fed] px-4 py-2.5 text-sm text-white md:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="opacity-80">Name:</span>
          {readOnly ? form.patient?.name : (
            <input className="min-w-0 flex-1 rounded-md px-2 py-1 text-slate-900" value={form.patient?.name || ''} onChange={(e) => setForm({ ...form, patient: { ...form.patient, name: e.target.value } })} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-80">Age:</span>
          {readOnly ? (form.patient_age || '—') : (
            <input className="w-16 rounded-md px-2 py-1 text-slate-900" value={form.patient_age || ''} onChange={(e) => setForm({ ...form, patient_age: e.target.value })} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-80">Date:</span>
          {readOnly ? form.prescribed_on : (
            <input type="date" className="rounded-md px-2 py-1 text-slate-900" value={form.prescribed_on || ''} onChange={(e) => setForm({ ...form, prescribed_on: e.target.value })} />
          )}
        </div>
      </div>

      <div className="grid min-h-[380px] md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 border-r border-blue-100 p-4">
          {[
            ['chief_complaints', 'C/C'],
            ['on_examination', 'O/E'],
            ['advice', 'Adv'],
          ].map(([key, label]) => (
            <div key={key}>
              <div className="mb-1 text-sm font-bold text-[#2f6fed]">{label}</div>
              {readOnly ? (
                <div className="min-h-14 whitespace-pre-wrap text-sm text-slate-700">{form[key] || '—'}</div>
              ) : (
                <textarea
                  className="input min-h-16"
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <div className="relative flex flex-col p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="text-3xl font-serif leading-none text-slate-300">℞</div>
            {!readOnly && (
              <button
                type="button"
                className="btn-primary no-print shrink-0 shadow-md"
                onClick={onAddMedicine}
              >
                + Add medicine
              </button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {(form.items || []).map((item, idx) => (
              <div
                key={`${item.brand_name}-${idx}`}
                className="rounded-xl border border-slate-100 bg-slate-50/90 p-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                style={{ animation: `fadeUp 320ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 40}ms both` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold">{idx + 1}. {item.brand_name} {item.strength} {item.form}</div>
                    <div className="text-xs text-slate-600">
                      {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ')}
                    </div>
                    {item.instructions && <div className="text-[11px] text-slate-500">{item.instructions}</div>}
                  </div>
                  {!readOnly && (
                    <button type="button" className="btn-danger-text" onClick={() => onRemoveItem(idx)}>Remove</button>
                  )}
                </div>
              </div>
            ))}

            {!form.items?.length && (
              <button
                type="button"
                className="no-print grid w-full place-items-center rounded-xl border border-dashed border-blue-200 bg-blue-50/40 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
                onClick={onAddMedicine}
                disabled={readOnly}
              >
                <div className="text-sm font-semibold text-[var(--blue)]">No medicines yet</div>
                <div className="mt-1 text-xs text-[var(--muted)]">Click to open the multi-medicine builder</div>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-orange-100 bg-orange-50 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2">
          <span>Follow up:</span>
          {readOnly ? (form.follow_up_days ? `${form.follow_up_days} days later` : '—') : (
            <>
              <input className="w-20 rounded-md border px-2 py-1" value={form.follow_up_days || ''} onChange={(e) => setForm({ ...form, follow_up_days: e.target.value })} />
              <span>days later</span>
            </>
          )}
        </div>
        <div className="h-7 w-7 rounded-tl-2xl bg-emerald-500/80" />
      </div>
    </div>
  )
}
