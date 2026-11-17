export default function WeekChart({ data = [] }) {
  const width = 560
  const height = 180
  const pad = 16
  const max = Math.max(1, ...data.map((d) => Number(d.total) || 0))
  const step = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = pad + i * step
    const y = height - pad - ((Number(d.total) || 0) / max) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const area = `${pad},${height - pad} ${points} ${pad + (data.length - 1) * step},${height - pad}`

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img" aria-label="Weekly appointments">
        <defs>
          <linearGradient id="weekFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6fed" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2f6fed" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#weekFill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#2f6fed"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = pad + i * step
          const y = height - pad - ((Number(d.total) || 0) / max) * (height - pad * 2)
          return <circle key={d.day} cx={x} cy={y} r="3.5" fill="#fff" stroke="#2f6fed" strokeWidth="2" />
        })}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] font-semibold text-[var(--muted)]">
        {data.map((d) => <span key={d.day}>{d.day}</span>)}
      </div>
    </div>
  )
}
