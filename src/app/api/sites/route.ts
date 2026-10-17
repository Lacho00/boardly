import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPrismaUniqueViolation, parseHttpUrl } from '@/lib/security'
import { toPublicSite } from '@/lib/site-public'
import { siteListInclude } from '@/lib/types'

export async function GET() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: 'desc' },
    include: siteListInclude,
  })
  return NextResponse.json(sites.map(toPublicSite))
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  const url = parseHttpUrl(body.url)
  if (!url) return NextResponse.json({ error: 'url must be a valid http(s) URL' }, { status: 400 })
  try {
    const site = await prisma.site.create({
      data: {
        name: body.name.trim(),
        url,
        type: typeof body.type === 'string' ? body.type : 'wordpress',
        wpAppPassword: body.wpAppPassword || null,
        useLocalLighthouse: body.useLocalLighthouse === true,
      },
    })
    return NextResponse.json(toPublicSite(site), { status: 201 })
  } catch (e) {
    if (isPrismaUniqueViolation(e)) return NextResponse.json({ error: 'A site with this URL already exists' }, { status: 409 })
    throw e
  }
}
