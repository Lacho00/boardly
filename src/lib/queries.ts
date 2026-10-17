import 'server-only'
import { isDemo } from '@/lib/demo'
import { prisma } from '@/lib/prisma'
import { toPublicSite } from '@/lib/site-public'
import { severityRank, siteSeverity } from '@/lib/severity'
import { uptimePercent } from '@/lib/uptime'
import { siteDetailInclude, siteListInclude, type HomeSite } from '@/lib/types'

export async function getSites() {
  const sites = await prisma.site.findMany({ orderBy: { createdAt: 'desc' }, include: siteListInclude })
  return sites.map(toPublicSite)
}

export async function getSite(id: string) {
  const site = await prisma.site.findUnique({ where: { id }, include: siteDetailInclude })
  return site ? toPublicSite(site) : null
}

/** Critical alerts among the 50 most recent, same window as /api/alerts. */
export async function getCriticalAlertCount() {
  const recent = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: 50, select: { severity: true } })
  return recent.filter(a => a.severity === 'critical').length
}

/** Performance snapshots of the last `days` days, oldest first. */
export async function getSnapshotHistory(siteId: string, days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return prisma.performanceSnapshot.findMany({
    where: { siteId, checkedAt: { gte: since } },
    orderBy: { checkedAt: 'asc' },
  })
}

/** Sites with their last 24 h of checks (oldest first), 30-day uptime and severity; worst first, then by name. */
/**
 * The clock the home windows are measured against. The public demo is seeded once at
 * build time, so it anchors to its newest check; otherwise the 24 h strip empties a day later.
 */
export async function getDataNow(): Promise<Date> {
  if (!isDemo) return new Date()
  const latest = await prisma.healthCheck.findFirst({ orderBy: { checkedAt: 'desc' }, select: { checkedAt: true } })
  return latest?.checkedAt ?? new Date()
}

export async function getHomeSites(now = new Date()): Promise<HomeSite[]> {
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const [sites, recent, grouped] = await Promise.all([
    prisma.site.findMany({ include: siteListInclude }),
    prisma.healthCheck.findMany({
      where: { checkedAt: { gte: since24h, lte: now } },
      orderBy: { checkedAt: 'asc' },
      select: { siteId: true, status: true, responseTime: true, checkedAt: true },
    }),
    prisma.healthCheck.groupBy({
      by: ['siteId', 'status'],
      where: { checkedAt: { gte: since30d, lte: now } },
      _count: { _all: true },
    }),
  ])

  const recentBySite = new Map<string, HomeSite['recent']>()
  for (const { siteId, ...row } of recent) {
    const list = recentBySite.get(siteId)
    if (list) list.push(row)
    else recentBySite.set(siteId, [row])
  }
  const totals = new Map<string, { total: number; down: number }>()
  for (const g of grouped) {
    const t = totals.get(g.siteId) ?? { total: 0, down: 0 }
    t.total += g._count._all
    if (g.status === 'error' || g.status === 'critical') t.down += g._count._all
    totals.set(g.siteId, t)
  }

  return sites
    .map(toPublicSite)
    .map(site => ({
      ...site,
      recent: recentBySite.get(site.id) ?? [],
      uptime30: uptimePercent(totals.get(site.id) ?? { total: 0, down: 0 }),
      severity: siteSeverity({
        health: site.healthChecks[0]?.status,
        sslValid: site.sslChecks[0]?.valid,
        sslDays: site.sslChecks[0]?.daysRemaining,
      }),
    }))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.name.localeCompare(b.name))
}

export async function getRecentAlerts(take = 5) {
  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: { site: { select: { name: true } } },
  })
  return alerts.map(a => ({
    id: a.id,
    message: a.message,
    severity: a.severity,
    createdAt: a.createdAt,
    siteName: a.site.name,
  }))
}
