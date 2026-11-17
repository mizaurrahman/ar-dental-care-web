import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function AppointmentCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  availability = {},
}) {
  const monthStart = startOfMonth(month)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(endOfMonth(monthStart))
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const today = startOfDay(new Date())

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="btn-ghost" onClick={() => onMonthChange(subMonths(month, 1))}>
          ‹
        </button>
        <div className="text-sm font-extrabold text-[var(--navy)]">{format(month, 'MMMM yyyy')}</div>
        <button type="button" className="btn-ghost" onClick={() => onMonthChange(addMonths(month, 1))}>
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
        {weekdays.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, monthStart)
          const past = isBefore(day, today)
          const freeCount = (availability[key] || []).length
          const hasSlots = freeCount > 0
          const selected = selectedDate && isSameDay(day, parseDate(selectedDate))
          const disabled = past || !inMonth || !hasSlots

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(key)}
              className={[
                'relative flex h-11 flex-col items-center justify-center rounded-xl text-sm font-semibold transition sm:h-10',
                !inMonth ? 'text-slate-300' : '',
                past && inMonth ? 'cursor-not-allowed text-slate-300' : '',
                !past && inMonth && !hasSlots ? 'cursor-not-allowed text-slate-400' : '',
                !disabled && !selected ? 'hover:bg-blue-50 hover:text-[var(--blue)]' : '',
                selected ? 'bg-[var(--blue)] text-white shadow-md' : '',
                !disabled && !selected && hasSlots ? 'bg-slate-50 text-[var(--navy)]' : '',
              ].join(' ')}
              title={hasSlots ? `${freeCount} open slot${freeCount === 1 ? '' : 's'}` : 'No open slots'}
            >
              {format(day, 'd')}
              {hasSlots && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--blue)]" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--blue)]" /> Open day</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> Unavailable</span>
      </div>
    </div>
  )
}

function parseDate(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}
