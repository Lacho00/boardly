import { NextResponse, type NextRequest } from 'next/server'
import { isDemo } from '@/lib/demo'

// In demo mode the data is read-only: no writes, no scans, no outbound alerts.
export function proxy(req: NextRequest) {
  if (!isDemo) return NextResponse.next()
  const { pathname } = req.nextUrl
  // GET routes that still trigger outbound scans or cron work stay blocked.
  const isScan = pathname.startsWith('/api/cron/') || pathname.startsWith('/api/pagespeed-test')
  if (req.method === 'GET' && !isScan) return NextResponse.next()
  return NextResponse.json(
    { error: 'Disabled in the public demo. Run Boardly locally to use this.' },
    { status: 403 },
  )
}

export const config = { matcher: '/api/:path*' }
