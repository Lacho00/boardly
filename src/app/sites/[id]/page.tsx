import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/AppHeader'
import { StatCard } from '@/components/StatCard'
import { TrendChart } from '@/components/TrendChart'
import { LineChart } from '@/components/LineChart'
import { RangeSelector } from '@/components/RangeSelector'
import { SiteActions } from '@/components/SiteActions'
import { LocalLighthouseToggle, WpPasswordForm } from '@/components/SiteSettingsForms'
import { getSite, getSnapshotHistory } from '@/lib/queries'
import { parseRange } from '@/lib/range'
import ScoreRing from '@/components/ScoreRing'
import SeverityTag from '@/components/SeverityTag'
import { siteSeverity } from '@/lib/severity'
import { lcpTone, scoreTone, sslTone } from '@/lib/scores'
import { WEB_VITALS, type ChartSeries } from '@/lib/chart'

export const dynamic = 'force-dynamic'

export default async function SitePage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ range?: string | string[] }>
}) {
  const { id } = await params
  const range = parseRange((await searchParams).range)
  const [site, history] = await Promise.all([getSite(id), getSnapshotHistory(id, range)])
  if (!site) notFound()

  const vital = (key: string, label: string, color: string, pick: (d: (typeof history)[number]) => number | null): ChartSeries => ({
    key, label, color, points: history.map(d => ({ t: d.checkedAt.getTime(), v: pick(d) })),
  })

  const h = site.healthChecks[0]
  const p = site.performanceSnapshots[0]
  const a = site.accessibilityScores[0]
  const seo = site.seoAudits[0]
  const s = site.sslChecks[0]

  const severity = siteSeverity({ health: h?.status, sslValid: s?.valid, sslDays: s?.daysRemaining })

  return (
    <div className="min-h-screen bg-bg text-ink">
      <AppHeader active="sites" />
      <div className="border-b border-line px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="py-2 text-sm text-dim hover:text-ink"><span aria-hidden="true">←</span> Back</Link>
            <ScoreRing value={p?.score ?? null} severity={severity} size={44} />
            <h1 className="min-w-0 truncate font-display text-xl font-bold tracking-tight">{site.name}</h1>
            <SeverityTag severity={severity} />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <SiteActions siteId={site.id} />
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Performance" value={p?.score != null ? `${p.score}/100` : '-'} tone={scoreTone(p?.score)} sub={p?.checkedAt ? new Date(p.checkedAt).toLocaleString('en-US') : ''} />
          <StatCard label="Accessibility" value={a?.score != null ? `${a.score}/100` : '-'} tone={scoreTone(a?.score)} sub={`Best Pract: ${p?.bestPractices ?? '-'}/100`} />
          <StatCard label="SEO" value={seo?.score != null ? `${seo.score}/100` : '-'} tone={scoreTone(seo?.score)} sub="" />
          <StatCard label="WP Health" value={h?.status ?? '-'} sub={h?.wpVersion ? `WP ${h.wpVersion}` : h?.responseTime ? `${h.responseTime}ms` : ''} />
          <StatCard label="LCP" value={p?.lcp != null ? `${p.lcp.toFixed(2)}s` : '-'} tone={lcpTone(p?.lcp)} sub="Largest Contentful Paint" />
          <StatCard label="CLS" value={p?.cls != null ? p.cls.toFixed(3) : '-'} sub="Cumulative Layout Shift" />
          <StatCard label="TTFB" value={p?.ttfb != null ? `${p.ttfb.toFixed(2)}s` : '-'} sub="Time to First Byte" />
          <StatCard label="SSL" value={s?.valid ? `${s.daysRemaining ?? '?'} days` : 'Invalid'} tone={s?.valid ? sslTone(s.daysRemaining) : 'bad'} sub={s?.issuer ?? ''} />
        </div>

        <section aria-labelledby="trends-heading" className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 id="trends-heading" className="font-display font-semibold">Trends</h2>
            <RangeSelector current={range} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart title="Performance Score" data={history} map={d => d.score} color="var(--ok)" />
            <LineChart title="LCP" unit="s" series={[vital('lcp', 'LCP', 'var(--series-a)', d => d.lcp)]} thresholds={WEB_VITALS.lcp} />
            <LineChart title="CLS" decimals={3} series={[vital('cls', 'CLS', 'var(--ink)', d => d.cls)]} thresholds={WEB_VITALS.cls} />
            <LineChart title="TTFB" unit="s" series={[vital('ttfb', 'TTFB', 'var(--series-b)', d => d.ttfb)]} thresholds={WEB_VITALS.ttfb} />
          </div>
        </section>

        {seo?.title && (
          <div className="rounded-lg border border-line bg-panel p-5">
            <h3 className="mb-2 font-display font-semibold">SEO - Latest scan</h3>
            <p className="text-sm"><span className="text-dim">Title:</span> {seo.title}</p>
            {seo.description && <p className="text-sm"><span className="text-dim">Description:</span> {seo.description}</p>}
          </div>
        )}

        <div className="rounded-lg border border-line bg-panel p-5 space-y-4">
          <div>
            <h3 className="mb-2 font-display font-semibold">Site credentials</h3>
            <p className="text-xs text-dim mb-2">
              WordPress Application Password for the REST API. If the site sits behind Cloudflare, this lets Boardly read the real SEO data.
            </p>
            <WpPasswordForm siteId={site.id} currentPassword={site.hasWpAppPassword} />
          </div>
          <div className="border-t border-line pt-4">
            <h3 className="mb-2 font-display font-semibold">Data source</h3>
            <LocalLighthouseToggle siteId={site.id} enabled={site.useLocalLighthouse} />
          </div>
        </div>
      </main>
    </div>
  )
}
