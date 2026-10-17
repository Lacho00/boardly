import { RefreshButton } from '@/components/RefreshButton'
import { AddSiteForm } from '@/components/AddSiteForm'
import { AppHeader } from '@/components/AppHeader'
import SideColumn from '@/components/home/SideColumn'
import SiteList from '@/components/home/SiteList'
import SummaryStrip from '@/components/home/SummaryStrip'
import { summarizeHome } from '@/lib/home-summary'
import { getDataNow, getHomeSites, getRecentAlerts } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const now = await getDataNow()
  const [sites, alerts] = await Promise.all([getHomeSites(now), getRecentAlerts()])
  const summary = summarizeHome(sites)
  const { counts } = summary

  return (
    <div className="min-h-screen bg-bg text-ink">
      <AppHeader
        active="sites"
        summary={{ critical: counts.critical, warning: counts.warning, healthy: counts.healthy }}
      />
      <main className="mx-auto max-w-6xl px-6 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h1 className="font-display text-xl font-bold tracking-tight">Central Dashboard</h1>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/report-preview/general"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 text-xs text-dim hover:text-ink"
            >
              General PDF
            </a>
            <RefreshButton />
            <AddSiteForm />
          </div>
        </div>

        {sites.length === 0 ? (
          <SiteList sites={sites} now={now} />
        ) : (
          <div className="grid gap-x-3.5 lg:grid-cols-[minmax(0,1fr)_270px]">
            <div className="min-w-0">
              <SummaryStrip summary={summary} />
              <SiteList sites={sites} now={now} />
            </div>
            <SideColumn alerts={alerts} sites={sites} now={now} />
          </div>
        )}
      </main>
    </div>
  )
}
