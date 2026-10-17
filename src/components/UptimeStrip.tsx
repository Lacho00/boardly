import type { SlotState } from '@/lib/uptime'

const SLOT_CLASS: Record<SlotState, string> = {
  ok: 'bg-ok opacity-45',
  warn: 'bg-warn',
  crit: 'bg-crit shadow-[0_0_6px_-1px_var(--crit)]',
  none: 'bg-line',
}

export default function UptimeStrip({ slots }: { slots: SlotState[] }) {
  const incidents = slots.filter((s) => s === 'warn' || s === 'crit').length
  const hasData = slots.some((s) => s !== 'none')
  const label = !hasData
    ? 'Last 24 hours: no data'
    : incidents === 0
      ? 'Last 24 hours: no incidents'
      : `Last 24 hours: ${incidents} ${incidents === 1 ? 'incident' : 'incidents'}`
  return (
    <div>
      <div role="img" aria-label={label} className="flex h-[22px] items-stretch gap-0.5">
        {slots.map((s, i) => (
          <b key={i} data-slot={s} className={`flex-1 rounded-[1px] ${SLOT_CLASS[s]}`} />
        ))}
      </div>
      <div aria-hidden="true" className="mt-[3px] flex justify-between text-[9px] tracking-[0.08em] text-dim">
        <span>-24 h</span>
        <span>-12 h</span>
        <span>now</span>
      </div>
    </div>
  )
}
