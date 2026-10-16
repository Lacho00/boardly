import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const siteInclude = {
  healthChecks: { orderBy: { checkedAt: 'desc' as const }, take: 30 },
  performanceSnapshots: { orderBy: { checkedAt: 'desc' as const }, take: 30 },
  seoAudits: { orderBy: { checkedAt: 'desc' as const }, take: 30 },
  accessibilityScores: { orderBy: { checkedAt: 'desc' as const }, take: 30 },
  sslChecks: { orderBy: { checkedAt: 'desc' as const }, take: 10 },
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const site = await prisma.site.findUnique({
    where: { id },
    include: siteInclude,
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(site)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const data: any = {}
  if (body.wpAppPassword !== undefined) data.wpAppPassword = body.wpAppPassword || null
  if (body.useLocalLighthouse !== undefined) data.useLocalLighthouse = body.useLocalLighthouse
  if (body.url !== undefined) data.url = body.url
  if (body.name !== undefined) data.name = body.name
  const site = await prisma.site.update({ where: { id }, data })
  return NextResponse.json(site)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.site.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
