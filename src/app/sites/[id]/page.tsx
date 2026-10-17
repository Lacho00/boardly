import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StatCard } from '@/components/StatCard'
import { TrendChart } from '@/components/TrendChart'
import { LineChart } from '@/components/LineChart'
import { RangeSelector } from '@/components/RangeSelector'
import { SiteActions } from '@/components/SiteActions'
import { LocalLighthouseToggle, WpPasswordForm } from '@/components/SiteSettingsForms'
import { getSite, getSnapshotHistory } from '@/lib/queries'
import { parseRange } from '@/lib/range'
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

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="text-blue-400 hover:underline text-sm py-2"><span aria-hidden="true">←</span> Back</Link>
            <h1 className="text-xl font-bold">{site.name}</h1>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <SiteActions siteId={site.id} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid gap-6">
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
            <h2 id="trends-heading" className="font-semibold">Trends</h2>
            <RangeSelector current={range} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart title="Performance Score" data={history} map={d => d.score} color="blue" />
            <LineChart title="LCP" unit="s" series={[vital('lcp', 'LCP', '#60a5fa', d => d.lcp)]} thresholds={WEB_VITALS.lcp} />
            <LineChart title="CLS" decimals={3} series={[vital('cls', 'CLS', '#a78bfa', d => d.cls)]} thresholds={WEB_VITALS.cls} />
            <LineChart title="TTFB" unit="s" series={[vital('ttfb', 'TTFB', '#fbbf24', d => d.ttfb)]} thresholds={WEB_VITALS.ttfb} />
          </div>
        </section>

        {seo?.title && (
          <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
            <h3 className="font-semibold mb-2">SEO - Latest scan</h3>
            <p className="text-sm"><span className="text-zinc-400">Title:</span> {seo.title}</p>
            {seo.description && <p className="text-sm"><span className="text-zinc-400">Description:</span> {seo.description}</p>}
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Site credentials</h3>
            <p className="text-xs text-zinc-400 mb-2">
              WordPress Application Password for the REST API. If the site sits behind Cloudflare, this lets Boardly read the real SEO data.
            </p>
            <WpPasswordForm siteId={site.id} currentPassword={site.hasWpAppPassword} />
          </div>
          <div className="border-t border-zinc-700 pt-4">
            <h3 className="font-semibold mb-2">Data source</h3>
            <LocalLighthouseToggle siteId={site.id} enabled={site.useLocalLighthouse} />
          </div>
        </div>
      </main>
    </div>
  )
}
