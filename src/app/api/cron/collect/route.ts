import { NextRequest, NextResponse } from 'next/server'
import { rejectUnauthorizedCron } from '@/lib/security'
import { collectAllSites } from '@/lib/collector'

export const maxDuration = 300

export async function GET(req: NextRequest) {
  const denied = rejectUnauthorizedCron(req)
  if (denied) return denied
  await collectAllSites()
  return NextResponse.json({ ok: true })
}
