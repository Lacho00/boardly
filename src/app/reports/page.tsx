'use client'

import { useEffect, useState } from 'react'
import { readJson, writeError } from '@/lib/api-client'
import Link from 'next/link'
import { ActionMessage } from '@/components/ActionMessage'

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

export default function ReportsPage() {
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
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="text-blue-400 hover:underline text-sm py-2"><span aria-hidden="true">←</span> Dashboard</Link>
            <h1 className="text-xl font-bold">Monthly Reports</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/api/report-preview/general" target="_blank" rel="noopener noreferrer" className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm whitespace-nowrap">General PDF</a>
            <button onClick={generate} disabled={generating} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm whitespace-nowrap disabled:opacity-50">
              {generating ? 'Generating…' : 'Generate monthly report'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <ActionMessage state={error ? { ok: false, message: error } : null} className="block mb-4 text-sm" />
        {Object.entries(grouped).length === 0 ? (
          <p className="text-zinc-400 text-center py-20">No reports yet</p>
        ) : (
          Object.entries(grouped).sort().reverse().map(([period, items]) => (
            <div key={period} className="mb-8">
              <h2 className="text-lg font-semibold mb-3">{period}</h2>
              <div className="grid gap-3">
                {items.map(r => (
                  <div key={r.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{r.site.name}</p>
                      <p className="text-xs text-zinc-400">{r.site.url}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <MetricBadge label="Performance" value={r.avgPerformance} />
                      <MetricBadge label="SEO" value={r.avgSeo} />
                      <MetricBadge label="Accessibility" value={r.avgAccessibility} />
                      <MetricBadge label="Uptime" value={r.uptime} isUptime />
                      <a
                        href={`/api/report-preview/${r.siteId}`}
                        className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-xs ml-2"
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
        <span className="text-xs text-zinc-400">—</span>
        <span className="text-xs text-zinc-400 mt-0.5">{label}</span>
      </div>
    )
  }

  // Colour by the value as displayed, so 99.98 (shown as 100.0%) is not yellow.
  const shown = Number(value.toFixed(isUptime ? 1 : 0))
  const color = isUptime
    ? shown >= 100 ? 'text-green-400' : shown >= 99.5 ? 'text-yellow-400' : 'text-red-400'
    : shown >= 80 ? 'text-green-400' : shown >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex flex-col items-center min-w-[60px] bg-zinc-750 rounded-lg px-3 py-1.5 border border-zinc-700">
      <span className={`text-sm font-bold ${color}`}>{shown.toFixed(isUptime ? 1 : 0)}%</span>
      <span className="text-xs text-zinc-400 mt-0.5">{label}</span>
    </div>
  )
}
