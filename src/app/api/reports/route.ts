import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const reports = await prisma.monthlyReport.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: { site: { select: { name: true, url: true } } },
  })
  return NextResponse.json(reports)
}

export async function POST() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const sites = await prisma.site.findMany({ where: { active: true } })

  for (const site of sites) {
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

    const perf = await prisma.performanceSnapshot.findMany({
      where: { siteId: site.id, checkedAt: { gte: startOfMonth, lte: endOfMonth } },
    })
    const a11y = await prisma.accessibilityScore.findMany({
      where: { siteId: site.id, checkedAt: { gte: startOfMonth, lte: endOfMonth } },
    })
    const health = await prisma.healthCheck.findMany({
      where: { siteId: site.id, checkedAt: { gte: startOfMonth, lte: endOfMonth } },
    })

    const avgPerformance = perf.length > 0
      ? perf.reduce((s, r) => s + (r.score ?? 0), 0) / perf.length : null
    const avgSeo = perf.length > 0
      ? perf.reduce((s, r) => s + (r.score ?? 0), 0) / perf.length : null
    const avgAccessibility = a11y.length > 0
      ? a11y.reduce((s, r) => s + (r.score ?? 0), 0) / a11y.length : null
    const uptime = health.length > 0
      ? (health.filter(h => h.status !== 'error').length / health.length) * 100 : null

    await prisma.monthlyReport.upsert({
      where: { siteId_month_year: { siteId: site.id, month, year } },
      update: { avgPerformance, avgSeo, avgAccessibility, uptime },
      create: { siteId: site.id, month, year, avgPerformance, avgSeo, avgAccessibility, uptime },
    })
  }

  return NextResponse.json({ ok: true, month, year })
}
