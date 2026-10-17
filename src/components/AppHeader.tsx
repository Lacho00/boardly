import Link from 'next/link'
import { cookies } from 'next/headers'
import ThemeToggle from '@/components/ThemeToggle'
import { getCriticalAlertCount } from '@/lib/queries'
import { THEME_COOKIE, parseTheme } from '@/lib/theme'

type Active = 'sites' | 'alerts' | 'reports' | 'settings'
type Summary = { critical: number; warning: number; healthy: number }

const NAV: { key: Active; href: string; label: string }[] = [
  { key: 'sites', href: '/', label: 'Sites' },
  { key: 'alerts', href: '/alerts', label: 'Alerts' },
  { key: 'reports', href: '/reports', label: 'Reports' },
  { key: 'settings', href: '/settings', label: 'Settings' },
]

function statusLine(summary: Summary): string {
  const parts: string[] = []
  if (summary.critical > 0) parts.push(`${summary.critical} ${summary.critical === 1 ? 'site' : 'sites'} critical`)
  if (summary.warning > 0) parts.push(`${summary.warning} ${summary.warning === 1 ? 'warning' : 'warnings'}`)
  parts.push(`${summary.healthy} healthy`)
  return parts.join(' · ')
}

export async function AppHeader({ active, summary }: { active: Active; summary?: Summary }) {
  const [alerts, jar] = await Promise.all([getCriticalAlertCount(), cookies()])
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value)

  const dotTone = !summary
    ? 'text-dim'
    : summary.critical > 0
      ? 'text-crit'
      : summary.warning > 0
        ? 'text-warn'
        : 'text-ok'

  return (
    <header>
      <div className="border-b border-line bg-bg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-6 py-2 text-[11px] uppercase tracking-wider text-dim">
          <span className={`flex min-w-0 items-center gap-2 ${dotTone}`}>
            <span className="live-dot shrink-0" aria-hidden="true" />
            <span className="truncate">{summary ? statusLine(summary) : 'Monitoring'}</span>
          </span>
          <ThemeToggle initial={theme} />
        </div>
      </div>
      <nav aria-label="Main" className="border-b border-line">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            boardly<span className="text-ok">_</span>
          </Link>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-dim">
            {NAV.map(item => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={item.key === active ? 'page' : undefined}
                  className={`inline-flex min-h-6 items-center gap-1.5 py-1 hover:text-ink ${
                    item.key === active ? 'text-ink border-b border-ok' : ''
                  }`}
                >
                  {item.label}
                  {item.key === 'alerts' && alerts > 0 && (
                    <span className="text-crit font-bold">
                      {alerts}
                      <span className="sr-only"> critical {alerts === 1 ? 'alert' : 'alerts'}</span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
