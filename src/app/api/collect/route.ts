import { NextRequest, NextResponse } from 'next/server'
import { collectAllSites, collectMetricsForSite } from '@/lib/collector'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.siteId) {
    await collectMetricsForSite(body.siteId)
  } else {
    await collectAllSites()
  }
  return NextResponse.json({ ok: true })
}
