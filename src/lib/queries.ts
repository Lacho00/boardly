import 'server-only'
import { prisma } from '@/lib/prisma'
import { toPublicSite } from '@/lib/site-public'
import { siteDetailInclude, siteListInclude } from '@/lib/types'

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
