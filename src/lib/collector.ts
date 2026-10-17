import { prisma } from '@/lib/prisma'
import { fetchPageSpeed } from '@/lib/pagespeed'
import { checkWordPressHealth } from '@/lib/health-check'
import { runLocalLighthouse } from '@/lib/local-lighthouse'

export async function collectMetricsForSite(siteId: string) {
  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (!site || !site.active) return

  const perfSource = site.useLocalLighthouse
    ? runLocalLighthouse(site.url)
    : fetchPageSpeed(site.url)

  const [psi, health] = await Promise.allSettled([
    perfSource,
    checkWordPressHealth(site.url),
  ])

  if (psi.status === 'fulfilled') {
    const d = psi.value
    if (d.performance != null || d.lcp != null) {
      await prisma.performanceSnapshot.create({
        data: {
          siteId: site.id,
          lcp: d.lcp != null ? (site.useLocalLighthouse ? d.lcp / 1000 : Math.round(d.lcp) / 1000) : null,
          cls: d.cls,
          ttfb: d.ttfb != null ? (site.useLocalLighthouse ? d.ttfb / 1000 : Math.round(d.ttfb) / 1000) : null,
          score: d.performance,
          bestPractices: d.bestPractices,
          checkedAt: new Date(),
        },
      })
    }
    if (d.accessibility != null) {
      await prisma.accessibilityScore.create({
        data: {
          siteId: site.id,
          score: d.accessibility,
          checkedAt: new Date(),
        },
      })
    }
    if (d.seo != null) {
      await prisma.seoAudit.create({
        data: {
          siteId: site.id,
          score: d.seo,
          checkedAt: new Date(),
        },
      })
    }
  }

  if (health.status === 'fulfilled') {
    const d = health.value
    await prisma.healthCheck.create({
      data: {
        siteId: site.id,
        status: d.status,
        wpVersion: d.wpVersion,
        plugins: d.pluginsDetected,
        responseTime: d.responseTimeMs,
        checkedAt: new Date(),
      },
    })
  }
}

export async function collectAllSites() {
  const sites = await prisma.site.findMany({ where: { active: true } })
  for (const site of sites) {
    try {
      await collectMetricsForSite(site.id)
    } catch (e) {
      console.error(`Collection failed for site ${site.id}:`, e)
    }
  }
}
