import type { Severity } from '@/lib/severity'

/** Token utility classes per severity; shared by the visual primitives. */
export const severityClass: Record<
  Severity,
  { text: string; border: string; bg: string; stroke: string; fill: string; cssVar: string }
> = {
  critical: { text: 'text-crit', border: 'border-crit', bg: 'bg-crit', stroke: 'stroke-crit', fill: 'fill-crit', cssVar: 'var(--crit)' },
  warning: { text: 'text-warn', border: 'border-warn', bg: 'bg-warn', stroke: 'stroke-warn', fill: 'fill-warn', cssVar: 'var(--warn)' },
  healthy: { text: 'text-ok', border: 'border-ok', bg: 'bg-ok', stroke: 'stroke-ok', fill: 'fill-ok', cssVar: 'var(--ok)' },
  unknown: { text: 'text-dim', border: 'border-dim', bg: 'bg-dim', stroke: 'stroke-dim', fill: 'fill-dim', cssVar: 'var(--dim)' },
}

export const severityLabel: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  healthy: 'Healthy',
  unknown: 'No data',
}

export default function SeverityTag({ severity }: { severity: Severity }) {
  const c = severityClass[severity]
  return (
    <span
      className={`inline-block rounded-[2px] border px-[7px] py-px text-[10px] uppercase tracking-[0.1em] ${c.text} ${c.border}`}
    >
      {severityLabel[severity]}
    </span>
  )
}
