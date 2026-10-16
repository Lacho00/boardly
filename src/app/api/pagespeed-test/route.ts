import { NextRequest, NextResponse } from 'next/server'
import { fetchPageSpeed } from '@/lib/pagespeed'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing ?url=' }, { status: 400 })

  try {
    const result = await fetchPageSpeed(url)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
