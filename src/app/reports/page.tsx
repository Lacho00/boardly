'use client'

import { useEffect, useState } from 'react'

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

  async function fetchReports() {
    const data = await fetch('/api/reports').then(r => r.json())
    setReports(data)
  }

  useEffect(() => { fetchReports() }, [])

  async function generate() {
    setGenerating(true)
    await fetch('/api/reports', { method: 'POST' })
    await fetchReports()
    setGenerating(false)
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-blue-400 hover:underline text-sm">← Dashboard</a>
            <h1 className="text-xl font-bold">Reportes Mensuales</h1>
          </div>
          <div className="flex gap-2">
            <a href="/api/report-preview/general" target="_blank" className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm">PDF General</a>
            <button onClick={generate} disabled={generating} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm disabled:opacity-50">
              {generating ? 'Generando...' : 'Generar reporte mensual'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {Object.entries(grouped).length === 0 ? (
          <p className="text-zinc-500 text-center py-20">No hay reportes todavía</p>
        ) : (
          Object.entries(grouped).sort().reverse().map(([period, items]) => (
            <div key={period} className="mb-8">
              <h2 className="text-lg font-semibold mb-3">{period}</h2>
              <div className="grid gap-3">
                {items.map(r => (
                  <div key={r.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.site.name}</p>
                      <p className="text-xs text-zinc-400">{r.site.url}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                      <MetricBadge label="Rendimiento" value={r.avgPerformance} />
                      <MetricBadge label="SEO" value={r.avgSeo} />
                      <MetricBadge label="Accesibilidad" value={r.avgAccessibility} />
                      <MetricBadge label="Uptime" value={r.uptime} isUptime />
                      <a
                        href={`/api/report-preview/${r.siteId}`}
                        className="bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-xs ml-2"
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
        <span className="text-xs text-zinc-500">—</span>
        <span className="text-[10px] text-zinc-600 mt-0.5">{label}</span>
      </div>
    )
  }

  const color = isUptime
    ? value >= 100 ? 'text-green-400' : value >= 99.5 ? 'text-yellow-400' : 'text-red-400'
    : value >= 80 ? 'text-green-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="flex flex-col items-center min-w-[60px] bg-zinc-750 rounded-lg px-3 py-1.5 border border-zinc-700">
      <span className={`text-sm font-bold ${color}`}>{value.toFixed(isUptime ? 1 : 0)}%</span>
      <span className="text-[10px] text-zinc-500 mt-0.5">{label}</span>
    </div>
  )
}
