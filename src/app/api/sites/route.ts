import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const siteInclude = {
  healthChecks: { orderBy: { checkedAt: 'desc' as const }, take: 1 },
  performanceSnapshots: { orderBy: { checkedAt: 'desc' as const }, take: 1 },
  seoAudits: { orderBy: { checkedAt: 'desc' as const }, take: 1 },
  accessibilityScores: { orderBy: { checkedAt: 'desc' as const }, take: 1 },
  sslChecks: { orderBy: { checkedAt: 'desc' as const }, take: 1 },
}

export async function GET() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    include: siteInclude,
  })
  return NextResponse.json(sites)
}

export async function POST(req: NextRequest) {
  const { name, url, type, wpAppPassword, useLocalLighthouse } = await req.json()
  const site = await prisma.site.create({
    data: { name, url, type: type ?? 'wordpress', wpAppPassword: wpAppPassword || null, useLocalLighthouse: useLocalLighthouse ?? false },
  })
  return NextResponse.json(site, { status: 201 })
}
