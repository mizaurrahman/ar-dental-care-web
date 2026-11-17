import { useEffect, useState } from 'react'
import api from '../lib/api'

const emptyDetails = {
  dosage: '1+0+1',
  frequency: 'After meal',
  duration: '5 days',
  instructions: '',
}

function makeItem(selected, q, details) {
  return {
    medicine_id: selected?.id || null,
    brand_name: selected?.brand_name || q,
    strength: selected?.strength || '',
    form: selected?.form || '',
    ...details,
  }
}

export default function MedicinePickerModal({ onClose, onAddMany }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [details, setDetails] = useState(emptyDetails)
  const [queue, setQueue] = useState([])
  const [flash, setFlash] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      api.get('/medicines', { params: { q } })
        .then((res) => setResults(res.data.medicines))
        .finally(() => setLoading(false))
    }, 140)
    return () => clearTimeout(t)
  }, [q])

  function resetComposer(keepOpen = true) {
    setQ('')
    setResults([])
    setSelected(null)
    setDetails(emptyDetails)
    if (keepOpen) {
      setFlash('Added — search the next medicine')
      setTimeout(() => setFlash(''), 1400)
    }
  }

  function addCurrentToQueue() {
    const brand = selected?.brand_name || q
    if (!brand.trim()) return
    setQueue((prev) => [...prev, makeItem(selected, q, details)])
    resetComposer()
  }

  function removeFromQueue(idx) {
    setQueue((prev) => prev.filter((_, i) => i !== idx))
  }

  function applyAll() {
    const brand = selected?.brand_name || q
    const pending = [...queue]
    if (brand.trim()) pending.push(makeItem(selected, q, details))
    if (!pending.length) return
    onAddMany(pending)
    onClose()
  }

  const canQueue = !!(selected?.brand_name || q.trim())

  return (
    <div className="modal-backdrop fixed inset-0 z-50 grid place-items-end bg-slate-900/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-3" onClick={onClose}>
      <div
        className="modal-panel flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--navy)]">Build medicine list</h2>
            <p className="text-xs text-[var(--muted)]">Add several medicines, then apply them all to the Rx</p>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
          {/* Composer */}
          <div className="min-h-0 overflow-auto border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">
            <label className="label">Search catalog</label>
            <input
              className="input"
              placeholder="Type brand or generic (e.g. Napa, Amoxicillin)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canQueue) {
                  e.preventDefault()
                  addCurrentToQueue()
                }
              }}
            />

            <div className="mt-2 max-h-36 overflow-auto rounded-xl border border-slate-200">
              {loading && <div className="p-2.5 text-sm text-[var(--muted)]">Searching…</div>}
              {!loading && results.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`flex w-full border-b border-slate-100 px-3 py-2 text-left text-sm transition hover:bg-blue-50 ${selected?.id === m.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelected(m)}
                >
                  <span>
                    <strong>{m.brand_name}</strong> {m.strength} {m.form}
                    <div className="text-[11px] text-[var(--muted)]">{m.generic_name} · {m.company}</div>
                  </span>
                </button>
              ))}
              {!loading && !results.length && q && (
                <div className="p-2.5 text-sm text-[var(--muted)]">No match — fill the fields below as free text.</div>
              )}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <label className="label">Brand</label>
                <input className="input" value={selected?.brand_name || q} onChange={(e) => setSelected({ ...(selected || {}), brand_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Strength</label>
                <input className="input" value={selected?.strength || ''} onChange={(e) => setSelected({ ...(selected || {}), strength: e.target.value })} />
              </div>
              <div>
                <label className="label">Form</label>
                <input className="input" value={selected?.form || ''} onChange={(e) => setSelected({ ...(selected || {}), form: e.target.value })} />
              </div>
              <div>
                <label className="label">Dosage</label>
                <input className="input" value={details.dosage} onChange={(e) => setDetails({ ...details, dosage: e.target.value })} />
              </div>
              <div>
                <label className="label">Frequency</label>
                <input className="input" value={details.frequency} onChange={(e) => setDetails({ ...details, frequency: e.target.value })} />
              </div>
              <div>
                <label className="label">Duration</label>
                <input className="input" value={details.duration} onChange={(e) => setDetails({ ...details, duration: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Instructions</label>
                <input className="input" value={details.instructions} onChange={(e) => setDetails({ ...details, instructions: e.target.value })} />
              </div>
            </div>

            {flash && <div className="mt-2 text-xs font-semibold text-emerald-600">{flash}</div>}

            <div className="toolbar mt-3">
              <button type="button" className="btn-primary" disabled={!canQueue} onClick={addCurrentToQueue}>
                + Add to list
              </button>
              <span className="text-[11px] text-[var(--muted)]">Enter also adds</span>
            </div>
          </div>

          {/* Smart list tray */}
          <div className="flex min-h-0 flex-col bg-slate-50/80 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--navy)]">Rx queue</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-[var(--blue)]">
                {queue.length} medicine{queue.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-auto">
              {queue.map((item, idx) => (
                <div
                  key={`${item.brand_name}-${idx}`}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
                  style={{ animation: `fadeUp 280ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 35}ms both` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[var(--blue)]">#{idx + 1}</div>
                      <div className="text-sm font-bold">{item.brand_name} {item.strength} {item.form}</div>
                      <div className="text-[11px] text-slate-600">
                        {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <button type="button" className="btn-danger-text" onClick={() => removeFromQueue(idx)}>Remove</button>
                  </div>
                </div>
              ))}
              {!queue.length && (
                <div className="grid h-40 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm text-[var(--muted)]">
                  Your medicine stack appears here — add one, then the next, like building a list.
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                className="btn-primary flex-1"
                disabled={!queue.length && !canQueue}
                onClick={applyAll}
              >
                Apply {Math.max(queue.length + (canQueue ? 1 : 0), 0) || ''} to prescription
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
