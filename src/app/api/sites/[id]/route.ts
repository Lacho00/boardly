import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isPrismaNotFound, isPrismaUniqueViolation, parseHttpUrl } from '@/lib/security'
import { toPublicSite } from '@/lib/site-public'
import { siteDetailInclude } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const site = await prisma.site.findUnique({
    where: { id },
    include: siteDetailInclude,
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(toPublicSite(site))
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  const data: Prisma.SiteUpdateInput = {}
  if (body.wpAppPassword !== undefined) data.wpAppPassword = body.wpAppPassword || null
  if (body.useLocalLighthouse !== undefined) data.useLocalLighthouse = body.useLocalLighthouse === true
  if (body.url !== undefined) {
    const url = parseHttpUrl(body.url)
    if (!url) return NextResponse.json({ error: 'url must be a valid http(s) URL' }, { status: 400 })
    data.url = url
  }
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'name must not be empty' }, { status: 400 })
    }
    data.name = body.name.trim()
  }
  try {
    const site = await prisma.site.update({ where: { id }, data })
    return NextResponse.json(toPublicSite(site))
  } catch (e) {
    if (isPrismaNotFound(e)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (isPrismaUniqueViolation(e)) return NextResponse.json({ error: 'A site with this URL already exists' }, { status: 409 })
    throw e
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.site.delete({ where: { id } })
  } catch (e) {
    if (isPrismaNotFound(e)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    throw e
  }
  return NextResponse.json({ ok: true })
}
