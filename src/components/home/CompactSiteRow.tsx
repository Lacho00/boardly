import Link from 'next/link'
import SeverityTag, { severityClass } from '@/components/SeverityTag'
import { lcpTone } from '@/lib/scores'
import type { Severity } from '@/lib/severity'
import type { HomeSite } from '@/lib/types'
import { figureClass, formatUptime, uptimeTone } from './figures'

const EDGE: Record<Severity, string> = {
  critical: 'before:bg-crit',
  warning: 'before:bg-warn',
  healthy: 'before:bg-ok',
  unknown: 'before:bg-dim',
}

export default function CompactSiteRow({ site }: { site: HomeSite }) {
  const p = site.performanceSnapshots[0]
  const sev = site.severity
  return (
    <Link
      href={`/sites/${site.id}`}
      data-row="compact"
      className={`relative mb-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg border border-line bg-panel py-2 pl-[18px] pr-3 transition-colors before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r-[2px] before:content-[''] hover:border-dim sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] sm:gap-x-5 ${EDGE[sev]}`}
    >
      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-bold text-ink">{site.name}</span>
      </span>
      <span className={`hidden text-sm tabular-nums sm:inline ${severityClass[sev].text}`} data-figure>
        {p?.score != null ? p.score : '-'}
      </span>
      <span className={`hidden text-sm tabular-nums sm:inline ${figureClass(lcpTone(p?.lcp))}`} data-figure>
        {p?.lcp != null ? `${p.lcp.toFixed(1)}s` : '-'}
      </span>
      <span className={`hidden text-sm tabular-nums sm:inline ${figureClass(uptimeTone(site.uptime30))}`} data-figure>
        {formatUptime(site.uptime30)}
      </span>
      <SeverityTag severity={sev} />
    </Link>
  )
}
