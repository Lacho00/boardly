'use client'

import { useEffect, useState } from 'react'
import { readJson, writeOk } from '@/lib/api-client'

type Snapshot = { score: number | null; bestPractices: number | null; lcp: number | null; cls: number | null; checkedAt: string }
type Health = { status: string; responseTime: number | null; wpVersion: string | null; checkedAt: string }
type Seo = { title: string | null; description: string | null; h1Count: number | null; imgNoAlt: number | null }
type A11y = { score: number | null; issues: number | null }
type Ssl = { valid: boolean; daysRemaining: number | null; expiresAt: string | null }

type Site = {
  id: string; name: string; url: string; type: string; active: boolean
  healthChecks: Health[]
  performanceSnapshots: Snapshot[]
  seoAudits: Seo[]
  accessibilityScores: A11y[]
  sslChecks: Ssl[]
}

export default function Home() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<number>(0)

  useEffect(() => { fetchSites(); fetchAlerts() }, [])

  async function fetchSites() {
    setLoading(true)
    try {
      const data = await fetch('/api/sites').then(r => readJson<Site[]>(r))
      setSites(Array.isArray(data) ? data : [])
    } catch {
      setSites([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchAlerts() {
    const data = await fetch('/api/alerts').then(r => readJson<{ severity: string }[]>(r)).catch(() => null)
    setAlerts(Array.isArray(data) ? data.filter(a => a.severity === 'critical').length : 0)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard Centralizado</h1>
          <div className="flex gap-3 items-center">
            <a href="/alerts" className="text-xs relative">
              {alerts > 0
                ? <span className="text-red-400 font-bold">🔔 {alerts} alertas</span>
                : <span className="text-zinc-400 hover:text-zinc-200">Alertas</span>}
            </a>
            <a href="/reports" className="text-xs text-zinc-400 hover:text-zinc-200">Reportes</a>
            <a href="/api/report-preview/general" target="_blank" className="text-xs text-zinc-400 hover:text-zinc-200">PDF General</a>
            <a href="/settings" className="text-xs text-zinc-400 hover:text-zinc-200">Config</a>
            <button onClick={fetchSites} className="text-xs text-zinc-400 hover:text-zinc-200">↻ Refrescar</button>
            <AddSiteForm onAdded={fetchSites} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <p className="text-zinc-400">Cargando sitios...</p>
        ) : sites.length === 0 ? (
          <p className="text-zinc-500 text-center py-20">No hay sitios todavía</p>
        ) : (
          <div className="grid gap-4">
            {sites.map(site => <SiteCard key={site.id} site={site} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function SiteCard({ site }: { site: Site }) {
  const h = site.healthChecks?.[0]
  const p = site.performanceSnapshots?.[0]
  const a = site.accessibilityScores?.[0]
  const s = site.sslChecks?.[0]

  return (
    <a href={`/sites/${site.id}`} className="block bg-zinc-800 rounded-lg p-5 border border-zinc-700 hover:border-zinc-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{site.name}</h2>
          <span className="text-sm text-zinc-400">{site.url}</span>
        </div>
        <div className="flex gap-2 items-center">
          {s && <span title={`SSL: ${s.daysRemaining ?? '?'} días`} className={`w-2 h-2 rounded-full ${s.valid ? 'bg-green-500' : 'bg-red-500'}`} />}
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            h?.status === 'healthy' ? 'bg-green-900 text-green-300'
            : h?.status === 'warning' ? 'bg-yellow-900 text-yellow-300'
            : h?.status === 'critical' ? 'bg-red-900 text-red-300'
            : 'bg-zinc-700 text-zinc-400'
          }`}>{h?.status ?? 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
        <Metric label="Performance" value={p?.score != null ? `${p.score}/100` : '-'} />
        <Metric label="Best Practices" value={p?.bestPractices != null ? `${p.bestPractices}/100` : '-'} />
        <Metric label="Accesibilidad" value={a?.score != null ? `${a.score}/100` : '-'} />
        <Metric label="LCP" value={p?.lcp != null ? `${p.lcp.toFixed(1)}s` : '-'} />
        <Metric label="T. respuesta" value={h?.responseTime != null ? `${h.responseTime}ms` : '-'} />
        <Metric label="SSL" value={s?.daysRemaining != null ? `${s.daysRemaining}d` : '-'} />
      </div>
    </a>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function AddSiteForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    })
    if (!(await writeOk(res))) return
    setName(''); setUrl(''); setOpen(false); onAdded()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium">
        + Añadir sitio
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm w-40" />
      <input placeholder="https://ejemplo.com" value={url} onChange={e => setUrl(e.target.value)} required type="url" className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm w-60" />
      <button type="submit" className="bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded text-sm">Guardar</button>
      <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-200 text-sm">Cancelar</button>
    </form>
  )
}
