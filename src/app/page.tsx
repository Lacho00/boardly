import Link from 'next/link'
import { RefreshButton } from '@/components/RefreshButton'
import { AddSiteForm } from '@/components/AddSiteForm'
import { getCriticalAlertCount, getSites } from '@/lib/queries'
import { lcpTone, responseTone, scoreTone, sslTone, toneClass, type Tone } from '@/lib/scores'
import type { SiteSummaryData } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [sites, alerts] = await Promise.all([getSites(), getCriticalAlertCount()])

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-y-3">
          <h1 className="text-xl font-bold">Central Dashboard</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/alerts" className="text-xs relative">
              {alerts > 0
                ? <span className="text-red-400 font-bold"><span aria-hidden="true">🔔</span> {alerts} {alerts === 1 ? 'alert' : 'alerts'}</span>
                : <span className="text-zinc-400 hover:text-zinc-200">Alerts</span>}
            </Link>
            <Link href="/reports" className="text-xs text-zinc-400 hover:text-zinc-200">Reports</Link>
            <a href="/api/report-preview/general" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-200">General PDF</a>
            <Link href="/settings" className="text-xs text-zinc-400 hover:text-zinc-200">Settings</Link>
            <RefreshButton />
            <AddSiteForm />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {sites.length === 0 ? (
          <p className="text-zinc-400 text-center py-20">No sites yet</p>
        ) : (
          <div className="grid gap-4">
            {sites.map(site => <SiteCard key={site.id} site={site} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function SiteCard({ site }: { site: SiteSummaryData }) {
  const h = site.healthChecks?.[0]
  const p = site.performanceSnapshots?.[0]
  const a = site.accessibilityScores?.[0]
  const s = site.sslChecks?.[0]

  return (
    <Link href={`/sites/${site.id}`} className="block bg-zinc-800 rounded-lg p-5 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-750 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{site.name}</h2>
          <span className="text-sm text-zinc-400">{site.url}</span>
        </div>
        <div className="flex gap-2 items-center">
          {s && <span role="img" aria-label={`SSL: ${s.valid ? 'valid' : 'invalid'}, ${s.daysRemaining ?? '?'} days left`} title={`SSL: ${s.daysRemaining ?? '?'} days`} className={`w-2 h-2 rounded-full ${s.valid ? 'bg-green-500' : 'bg-red-500'}`} />}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            h?.status === 'healthy' ? 'bg-green-900 text-green-300'
            : h?.status === 'warning' ? 'bg-yellow-900 text-yellow-300'
            : h?.status === 'critical' ? 'bg-red-900 text-red-300'
            : 'bg-zinc-700 text-zinc-400'
          }`}>{h?.status ?? 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
        <Metric label="Performance" value={p?.score != null ? `${p.score}/100` : '-'} tone={scoreTone(p?.score)} />
        <Metric label="Best Practices" value={p?.bestPractices != null ? `${p.bestPractices}/100` : '-'} tone={scoreTone(p?.bestPractices)} />
        <Metric label="Accessibility" value={a?.score != null ? `${a.score}/100` : '-'} tone={scoreTone(a?.score)} />
        <Metric label="LCP" value={p?.lcp != null ? `${p.lcp.toFixed(1)}s` : '-'} tone={lcpTone(p?.lcp)} />
        <Metric label="Response time" value={h?.responseTime != null ? `${h.responseTime}ms` : '-'} tone={responseTone(h?.responseTime)} />
        <Metric label="SSL" value={s?.daysRemaining != null ? `${s.daysRemaining}d` : '-'} tone={sslTone(s?.daysRemaining)} />
      </div>
    </Link>
  )
}

function Metric({ label, value, tone = 'none' }: { label: string; value: string; tone?: Tone }) {
  return (
    <div>
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className={`text-base font-semibold tabular-nums ${toneClass[tone]}`}>{value}</p>
    </div>
  )
}
