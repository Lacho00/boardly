'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { readJson } from '@/lib/api-client'
import Link from 'next/link'
import SeverityTag from '@/components/SeverityTag'
import { BellIcon } from '@/components/icons'
import type { Severity } from '@/lib/severity'

type AlertItem = {
  id: string
  type: string
  message: string
  severity: string
  read: boolean
  createdAt: string
  site: { name: string; url: string }
}

const rowTone: Record<string, { border: string; severity: Severity; label?: string }> = {
  critical: { border: 'border-l-crit', severity: 'critical' },
  warning: { border: 'border-l-warn', severity: 'warning' },
  info: { border: 'border-l-dim', severity: 'unknown', label: 'Info' },
}

export function AlertsView({ header }: { header: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => readJson<AlertItem[]>(r))
      .then(d => setAlerts(Array.isArray(d) ? d : []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  const criticalCount = alerts.filter(a => a.severity === 'critical').length

  return (
    <div className="min-h-screen bg-bg text-ink">
      {header}
      <div className="border-b border-line px-6 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/" className="py-2 text-sm text-dim hover:text-ink"><span aria-hidden="true">←</span> Dashboard</Link>
          <h1 className="font-display text-xl font-bold tracking-tight">Alerts</h1>
          {criticalCount > 0 && (
            <span className="rounded-[2px] border border-crit px-[7px] py-px text-[10px] uppercase tracking-[0.1em] text-crit">
              {criticalCount} critical
            </span>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p className="text-dim text-center py-20" role="status">Loading…</p>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-dim">
            <BellIcon className="h-6 w-6" />
            <p className="text-center">No alerts recorded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => {
              const tone = rowTone[a.severity] ?? rowTone.info
              return (
                <div key={a.id} className={`rounded-lg border border-l-[3px] border-line bg-panel p-4 ${tone.border}`}>
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <div className="min-w-0">
                      <p className="truncate font-display text-[15px] font-bold tracking-tight">{a.site.name}</p>
                      <p className="truncate text-xs text-dim">{a.site.url}</p>
                    </div>
                    <span className="text-xs text-dim">{new Date(a.createdAt).toLocaleString('en-US')}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SeverityTag severity={tone.severity} label={tone.label} />
                    {!a.read && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink">
                        <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
                        New
                      </span>
                    )}
                    <p className="min-w-0 text-sm">{a.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
