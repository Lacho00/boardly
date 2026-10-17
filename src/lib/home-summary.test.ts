import { describe, expect, it } from 'vitest'
import { summarizeHome } from './home-summary'
import type { HomeSite } from './types'

function site(o: {
  name?: string
  severity?: HomeSite['severity']
  uptime30?: number | null
  perf?: number | null
  lcp?: number | null
  ssl?: number | null
}): HomeSite {
  return {
    name: o.name ?? 'Acme',
    severity: o.severity ?? 'healthy',
    uptime30: o.uptime30 ?? null,
    performanceSnapshots: o.perf === undefined && o.lcp === undefined ? [] : [{ score: o.perf ?? null, lcp: o.lcp ?? null }],
    sslChecks: o.ssl == null ? [] : [{ daysRemaining: o.ssl }],
  } as unknown as HomeSite
}

describe('summarizeHome', () => {
  it('returns zeros and nulls for no sites', () => {
    expect(summarizeHome([])).toEqual({
      counts: { critical: 0, warning: 0, healthy: 0, unknown: 0 },
      uptime30: null,
      avgPerformance: null,
      medianLcp: null,
      soonestSsl: null,
    })
  })
  it('summarizes four sites', () => {
    const s = summarizeHome([
      site({ name: 'Acme', severity: 'critical', uptime30: 98, perf: 40, lcp: 5, ssl: 40 }),
      site({ name: 'Northwind', severity: 'warning', uptime30: 100, perf: 80, lcp: 3, ssl: 12 }),
      site({ name: 'Globex', severity: 'healthy', uptime30: 100, perf: null, lcp: 1, ssl: 90 }),
      site({ name: 'Initech', severity: 'healthy', uptime30: null, perf: 90, lcp: 2, ssl: null }),
    ])
    expect(s.counts).toEqual({ critical: 1, warning: 1, healthy: 2, unknown: 0 })
    expect(s.medianLcp).toBe(2.5)
    expect(s.soonestSsl).toEqual({ days: 12, siteName: 'Northwind' })
    expect(s.avgPerformance).toBe(70)
    expect(s.uptime30).toBeCloseTo(99.33, 1)
  })
})
