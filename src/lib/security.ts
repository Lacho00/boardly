import { NextResponse } from 'next/server'

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Returns the trimmed URL when it is a valid http(s) URL, otherwise null. */
export function parseHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const trimmed = value.trim()
    const u = new URL(trimmed)
    return u.protocol === 'http:' || u.protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}

export function isSlackWebhook(value: string): boolean {
  return value.startsWith('https://hooks.slack.com/')
}

export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null
  return value.length <= 12 ? '••••••••' : `${value.slice(0, 8)}••••••••${value.slice(-4)}`
}

/** ASCII-only file name safe for a Content-Disposition header. */
export function safeFilename(name: string): string {
  return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file'
}

/** When CRON_SECRET is set, cron routes require `Authorization: Bearer <secret>`. */
export function rejectUnauthorizedCron(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret) return null
  if (req.headers.get('authorization') === `Bearer ${secret}`) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function prismaCode(e: unknown): string | undefined {
  return typeof e === 'object' && e !== null ? (e as { code?: string }).code : undefined
}

export const isPrismaNotFound = (e: unknown) => prismaCode(e) === 'P2025'
export const isPrismaUniqueViolation = (e: unknown) => prismaCode(e) === 'P2002'
