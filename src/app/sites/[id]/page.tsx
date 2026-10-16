'use client'

import { useEffect, useState, use } from 'react'

type Snapshot = { score: number | null; bestPractices: number | null; lcp: number | null; cls: number | null; ttfb: number | null; checkedAt: string }
type Health = { status: string; responseTime: number | null; wpVersion: string | null; plugins: number | null; checkedAt: string }
type Seo = { title: string | null; description: string | null; h1Count: number | null; imgNoAlt: number | null; score: number | null }
type A11y = { score: number | null; issues: number | null }
type Ssl = { valid: boolean; daysRemaining: number | null; issuer: string | null; expiresAt: string | null }

type SiteDetail = {
  id: string; name: string; url: string; type: string; active: boolean; wpAppPassword: string | null; useLocalLighthouse: boolean
  healthChecks: Health[]
  performanceSnapshots: Snapshot[]
  seoAudits: Seo[]
  accessibilityScores: A11y[]
  sslChecks: Ssl[]
}

export default function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [site, setSite] = useState<SiteDetail | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [collectMsg, setCollectMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/sites/${id}`).then(r => r.json()).then(setSite)
  }, [id])

  if (!site) return <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">Cargando...</div>

  const h = site.healthChecks?.[0]
  const p = site.performanceSnapshots?.[0]
  const a = site.accessibilityScores?.[0]
  const seo = site.seoAudits?.[0]
  const s = site.sslChecks?.[0]

  async function handleCollect() {
    setCollecting(true)
    setCollectMsg(null)
    await fetch('/api/collect', { method: 'POST', body: JSON.stringify({ siteId: id }), headers: { 'Content-Type': 'application/json' } })
    const data = await fetch(`/api/sites/${id}`).then(r => r.json())
    setSite(data)
    setCollecting(false)
    setCollectMsg('Datos recolectados correctamente')
    setTimeout(() => setCollectMsg(null), 4000)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este sitio y todos sus datos?')) return
    setDeleting(true)
    await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-blue-400 hover:underline text-sm">← Volver</a>
            <h1 className="text-xl font-bold">{site.name}</h1>
          </div>
          <div className="flex gap-3 items-center">
            <a href={`/api/report-preview/${site.id}`} target="_blank" className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm">PDF</a>
            <button onClick={handleCollect} disabled={collecting} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm disabled:opacity-50">
              {collecting ? 'Recolectando...' : 'Recolectar ahora'}
            </button>
            {collectMsg && <span className="text-green-400 text-sm animate-pulse">{collectMsg}</span>}
            <button onClick={handleDelete} disabled={deleting} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-sm disabled:opacity-50">Eliminar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Rendimiento" value={p?.score != null ? `${p.score}/100` : '-'} sub={p?.checkedAt ? new Date(p.checkedAt).toLocaleString() : ''} />
          <StatCard label="Accesibilidad" value={a?.score != null ? `${a.score}/100` : '-'} sub={`Best Pract: ${p?.bestPractices ?? '-'}/100`} />
          <StatCard label="SEO" value={seo?.score != null ? `${seo.score}/100` : '-'} sub="" />
          <StatCard label="WP Health" value={h?.status ?? '-'} sub={h?.wpVersion ? `WP ${h.wpVersion}` : h?.responseTime ? `${h.responseTime}ms` : ''} />
          <StatCard label="LCP" value={p?.lcp != null ? `${p.lcp.toFixed(2)}s` : '-'} sub="Largest Contentful Paint" />
          <StatCard label="CLS" value={p?.cls != null ? p.cls.toFixed(3) : '-'} sub="Cumulative Layout Shift" />
          <StatCard label="TTFB" value={p?.ttfb != null ? `${p.ttfb.toFixed(2)}s` : '-'} sub="Time to First Byte" />
          <StatCard label="SSL" value={s?.valid ? `${s.daysRemaining ?? '?'} días` : 'Inválido'} sub={s?.issuer ?? ''} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            title="Performance Score"
            data={site.performanceSnapshots.toReversed()}
            map={d => d.score}
            color="blue"
          />
          <TrendChart
            title="LCP (segundos)"
            data={site.performanceSnapshots.toReversed()}
            map={d => d.lcp}
            color="emerald"
          />
        </div>

        {seo?.title && (
          <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
            <h3 className="font-semibold mb-2">SEO - Último escaneo</h3>
            <p className="text-sm"><span className="text-zinc-400">Title:</span> {seo.title}</p>
            {seo.description && <p className="text-sm"><span className="text-zinc-400">Description:</span> {seo.description}</p>}
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Credenciales del sitio</h3>
            <p className="text-xs text-zinc-400 mb-2">
              Application Password de WordPress para acceder a la API REST. Si el sitio tiene Cloudflare, esto permite obtener el SEO real.
            </p>
            <WpPasswordForm siteId={site.id} currentPassword={site.wpAppPassword} />
          </div>
          <div className="border-t border-zinc-700 pt-4">
            <h3 className="font-semibold mb-2">Origen de datos</h3>
            <LocalLighthouseToggle siteId={site.id} enabled={site.useLocalLighthouse} />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
}

function LocalLighthouseToggle({ siteId, enabled }: { siteId: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled)
  const [saved, setSaved] = useState(false)

  async function toggle() {
    const next = !on
    await fetch(`/api/sites/${siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useLocalLighthouse: next }),
    })
    setOn(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Usar Lighthouse local</p>
        <p className="text-xs text-zinc-400">Ejecuta Lighthouse con Chromium local. Útil para sitios en localhost o redes internas. Más lento (~30s por sitio) pero no requiere internet.</p>
      </div>
      <div className="flex items-center gap-2">
        {saved && <span className="text-green-400 text-xs">✓</span>}
        <button
          onClick={toggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-zinc-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-6' : ''}`} />
        </button>
      </div>
    </div>
  )
}

function WpPasswordForm({ siteId, currentPassword }: { siteId: string; currentPassword: string | null }) {
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/sites/${siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wpAppPassword: password || null }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={savePassword} className="flex gap-2 items-center">
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={currentPassword ? '•••••••• (dejar vacío para borrar)' : 'usuario:app_password'}
        className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm flex-1"
      />
      <button type="submit" className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-sm">Guardar</button>
      {saved && <span className="text-green-400 text-sm">✓</span>}
    </form>
  )
}

function TrendChart({ title, data, map, color }: {
  title: string
  data: { checkedAt: string }[]
  map: (d: any) => number | null
  color: string
}) {
  const values = data.map(d => ({ date: new Date(d.checkedAt).toLocaleDateString(), value: map(d) })).filter(v => v.value != null)

  if (values.length < 2) {
    return (
      <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-500">Se necesitan al menos 2 puntos para graficar</p>
      </div>
    )
  }

  const max = Math.max(...values.map(v => v.value!))
  const min = Math.min(...values.map(v => v.value!))
  const range = max - min || 1
  const allSame = max === min

  const colorMap: Record<string, string> = { blue: 'bg-blue-500', emerald: 'bg-emerald-500' }

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="flex items-stretch gap-1 h-32">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center">
            <div
              className={`w-full ${colorMap[color] ?? 'bg-blue-500'} rounded-t min-h-[4px]`}
              style={{ height: allSame ? '100%' : `${((v.value! - min) / range) * 100}%` }}
              title={`${v.date}: ${v.value}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-zinc-500">
        <span>{values[0]?.date}</span>
        <span>{values[values.length - 1]?.date}</span>
      </div>
    </div>
  )
}
