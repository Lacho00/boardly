import type { Severity } from '@/lib/severity'
import type { HomeSite } from '@/lib/types'

export type HomeSummary = {
  counts: Record<Severity, number>
  uptime30: number | null
  avgPerformance: number | null
  medianLcp: number | null
  soonestSsl: { days: number; siteName: string } | null
}

function mean(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
}

export function summarizeHome(sites: HomeSite[]): HomeSummary {
  const counts: Record<Severity, number> = { critical: 0, warning: 0, healthy: 0, unknown: 0 }
  for (const s of sites) counts[s.severity]++

  const uptime = mean(sites.flatMap(s => (s.uptime30 == null ? [] : [s.uptime30])))
  const perf = mean(sites.flatMap(s => s.performanceSnapshots[0]?.score ?? []))

  const lcps = sites.flatMap(s => s.performanceSnapshots[0]?.lcp ?? []).sort((a, b) => a - b)
  const mid = Math.floor(lcps.length / 2)
  const medianLcp = lcps.length === 0 ? null : lcps.length % 2 ? lcps[mid] : (lcps[mid - 1] + lcps[mid]) / 2

  let soonestSsl: HomeSummary['soonestSsl'] = null
  for (const s of sites) {
    const days = s.sslChecks[0]?.daysRemaining
    if (days != null && (soonestSsl === null || days < soonestSsl.days)) soonestSsl = { days, siteName: s.name }
  }

  return {
    counts,
    uptime30: uptime == null ? null : Math.round(uptime * 100) / 100,
    avgPerformance: perf == null ? null : Math.round(perf),
    medianLcp,
    soonestSsl,
  }
}
