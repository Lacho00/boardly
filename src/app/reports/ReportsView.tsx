'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { readJson, writeError } from '@/lib/api-client'
import Link from 'next/link'
import { ActionMessage } from '@/components/ActionMessage'
import { toneClass, type Tone } from '@/lib/scores'

type Report = {
  id: string
  siteId: string
  month: number
  year: number
  avgPerformance: number | null
  avgSeo: number | null
  avgAccessibility: number | null
  uptime: number | null
  createdAt: string
  site: { name: string; url: string }
}

export function ReportsView({ header }: { header: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchReports() {
    const data = await fetch('/api/reports').then(r => readJson<Report[]>(r)).catch(() => null)
    return Array.isArray(data) ? data : []
  }

  useEffect(() => {
    fetchReports().then(setReports)
  }, [])

  async function generate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports', { method: 'POST' })
      const message = await writeError(res)
      setError(message)
      if (!message) setReports(await fetchReports())
    } finally {
      setGenerating(false)
    }
  }

  const grouped = reports.reduce<Record<string, Report[]>>((acc, r) => {
    const key = `${r.year}-${String(r.month).padStart(2, '0')}`
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-bg text-ink">
      {header}
      <div className="border-b border-line px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="py-2 text-sm text-dim hover:text-ink"><span aria-hidden="true">←</span> Dashboard</Link>
            <h1 className="font-display text-xl font-bold tracking-tight">Monthly Reports</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/api/report-preview/general" target="_blank" rel="noopener noreferrer" className="rounded-[3px] border border-line px-3 py-2 text-sm text-dim hover:text-ink whitespace-nowrap">General PDF</a>
            <button onClick={generate} disabled={generating} className="rounded-[3px] border border-ok px-4 py-2 text-sm text-ok enabled:hover:bg-ok/10 whitespace-nowrap disabled:opacity-50">
              {generating ? 'Generating…' : 'Generate monthly report'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        <ActionMessage state={error ? { ok: false, message: error } : null} className="block mb-4 text-sm" />
        {Object.entries(grouped).length === 0 ? (
          <p className="text-dim text-center py-20">No reports yet</p>
        ) : (
          Object.entries(grouped).sort().reverse().map(([period, items]) => (
            <div key={period} className="mb-8">
              <h2 className="mb-3 font-display text-lg font-bold tracking-tight">{period}</h2>
              <div className="grid gap-3">
                {items.map(r => (
                  <div key={r.id} className="rounded-lg border border-line bg-panel p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-bold tracking-tight">{r.site.name}</p>
                      <p className="truncate text-xs text-dim">{r.site.url}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <MetricBadge label="Performance" value={r.avgPerformance} />
                      <MetricBadge label="SEO" value={r.avgSeo} />
                      <MetricBadge label="Accessibility" value={r.avgAccessibility} />
                      <MetricBadge label="Uptime" value={r.uptime} isUptime />
                      <a
                        href={`/api/report-preview/${r.siteId}`}
                        className="ml-2 rounded-[3px] border border-line px-3 py-2 text-xs text-dim hover:text-ink"
                        target="_blank"
                      >
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}

function MetricBadge({ label, value, isUptime }: { label: string; value: number | null; isUptime?: boolean }) {
  if (value == null) {
    return (
      <div className="flex flex-col items-center min-w-[60px]">
        <span className="text-xs text-dim">—</span>
        <span className="text-xs text-dim mt-0.5">{label}</span>
      </div>
    )
  }

  // Colour by the value as displayed, so 99.98 (shown as 100.0%) is not yellow.
  const shown = Number(value.toFixed(isUptime ? 1 : 0))
  const tone: Tone = isUptime
    ? shown >= 100 ? 'good' : shown >= 99.5 ? 'warn' : 'bad'
    : shown >= 80 ? 'good' : shown >= 50 ? 'warn' : 'bad'

  return (
    <div className="flex flex-col items-center min-w-[60px] rounded-lg border border-line bg-panel px-3 py-1.5">
      <span className={`font-display text-sm font-bold tabular-nums ${toneClass[tone]}`}>{shown.toFixed(isUptime ? 1 : 0)}%</span>
      <span className="text-xs text-dim mt-0.5">{label}</span>
    </div>
  )
}
