import type { Severity } from '@/lib/severity'
import { severityClass } from './SeverityTag'

export default function ScoreRing({
  value,
  severity,
  size = 60,
}: {
  value: number | null
  severity: Severity
  size?: number
}) {
  const c = severityClass[severity]
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value))
  const inner = Math.round((size * 48) / 60)
  return (
    <div
      role="img"
      aria-label={value == null ? 'Performance no data' : `Performance ${value} of 100`}
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${c.cssVar} ${pct}%, var(--line) 0)`,
      }}
    >
      <span
        className={`grid place-items-center rounded-full bg-panel font-display font-bold tabular-nums ${c.text}`}
        style={{ width: inner, height: inner, fontSize: Math.round((size * 18) / 60) }}
      >
        {value == null ? '-' : value}
      </span>
    </div>
  )
}
