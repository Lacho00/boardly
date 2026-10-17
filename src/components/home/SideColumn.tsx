import type { ReactNode } from 'react'
import { lcpTone, sslTone, type Tone } from '@/lib/scores'
import type { Severity } from '@/lib/severity'
import type { HomeSite } from '@/lib/types'
import { severityClass } from '@/components/SeverityTag'
import { figureClass } from './figures'

type Alert = { id: string; message: string; severity: string; createdAt: Date; siteName: string }

const LCP_TARGET = 2.5
const BAR: Record<Tone, string> = { good: 'bg-ok', warn: 'bg-warn', bad: 'bg-crit', none: 'bg-dim' }

function Panel({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="mb-2.5 rounded-lg border border-line bg-panel px-3.5 py-3">
      <h3 className="mb-2 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
        <span>{title}</span>
        <span>{hint}</span>
      </h3>
      {children}
    </section>
  )
}

function alertSeverity(s: string): Severity {
  return s === 'critical' ? 'critical' : s === 'warning' ? 'warning' : 'healthy'
}

/** Time for today's alerts, date for older ones; UTC so server and client agree. */
function time(d: Date, now: Date): string {
  const opts = { timeZone: 'UTC' } as const
  if (d.toLocaleDateString('en-GB', opts) === now.toLocaleDateString('en-GB', opts)) {
    return d.toLocaleTimeString('en-GB', { ...opts, hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-GB', { ...opts, day: 'numeric', month: 'short' })
}

export default function SideColumn({ alerts, sites, now = new Date() }: { alerts: Alert[]; sites: HomeSite[]; now?: Date }) {
  const ssl = sites
    .flatMap(s => (s.sslChecks[0]?.daysRemaining == null ? [] : [{ id: s.id, url: s.url, days: s.sslChecks[0].daysRemaining as number }]))
    .sort((a, b) => a.days - b.days)
    .slice(0, 6)
  const lcp = sites
    .flatMap(s => (s.performanceSnapshots[0]?.lcp == null ? [] : [{ id: s.id, name: s.name, value: s.performanceSnapshots[0].lcp as number }]))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
  const max = Math.max(LCP_TARGET, ...lcp.map(l => l.value))

  return (
    <aside className="min-w-0">
      <Panel title="Activity" hint="latest">
        {alerts.length === 0 ? (
          <p className="text-[11px] text-dim">No recent alerts</p>
        ) : (
          alerts.map(a => (
            <p key={a.id} className="border-b border-dashed border-line py-1.5 text-[11px] leading-snug text-dim last:border-0">
              <span className="mr-1.5 text-dim">{time(a.createdAt, now)}</span>
              <em className={`not-italic ${severityClass[alertSeverity(a.severity)].text}`}>{a.siteName}</em>{' '}
              {a.message}
            </p>
          ))
        )}
      </Panel>

      <Panel title="SSL expiries" hint="soonest">
        {ssl.length === 0 ? (
          <p className="text-[11px] text-dim">No certificates checked</p>
        ) : (
          ssl.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-1 text-[11px]">
              <span className="min-w-0 truncate text-ink">{r.url.replace(/^https?:\/\//, '')}</span>
              <b className={`shrink-0 tabular-nums ${figureClass(sslTone(r.days))}`}>{r.days} d</b>
            </div>
          ))
        )}
      </Panel>

      <Panel title="LCP by site" hint="┆ target 2.5s">
        {lcp.length === 0 ? (
          <p className="text-[11px] text-dim">No data</p>
        ) : (
          lcp.map(r => (
            <div key={r.id} className="grid grid-cols-[62px_minmax(0,1fr)_30px] items-center gap-2 py-1 text-[11px] text-dim">
              <span className="truncate">{r.name}</span>
              <div className="relative flex h-full items-center">
                <s
                  className={`block h-1.5 rounded-[1px] no-underline ${BAR[lcpTone(r.value)]}`}
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 -top-1 border-l border-dashed border-ink opacity-50"
                  style={{ left: `${(LCP_TARGET / max) * 100}%` }}
                />
              </div>
              <span className="text-right tabular-nums">{r.value.toFixed(1)}</span>
            </div>
          ))
        )}
      </Panel>
    </aside>
  )
}
