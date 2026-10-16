import { NextResponse } from 'next/server'
import { collectAllSites } from '@/lib/collector'

export const maxDuration = 300

export async function GET() {
  await collectAllSites()
  return NextResponse.json({ ok: true })
}
