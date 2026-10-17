'use client'

import { useEffect, useState, use } from 'react'
import { readJson, writeOk } from '@/lib/api-client'
import Link from 'next/link'
import { StatCard } from '@/components/StatCard'
import { TrendChart } from '@/components/TrendChart'
import { LocalLighthouseToggle, WpPasswordForm } from '@/components/SiteSettingsForms'
import type { SiteDetail } from '@/lib/types'

export default function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [site, setSite] = useState<SiteDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [collectMsg, setCollectMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/sites/${id}`)
      .then(r => readJson<SiteDetail>(r))
      .then(d => (d ? setSite(d) : setNotFound(true)))
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) return <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">Sitio no encontrado</div>
  if (!site) return <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">Cargando...</div>

  const h = site.healthChecks?.[0]
  const p = site.performanceSnapshots?.[0]
  const a = site.accessibilityScores?.[0]
  const seo = site.seoAudits?.[0]
  const s = site.sslChecks?.[0]

  async function handleCollect() {
    setCollecting(true)
    setCollectMsg(null)
    try {
      const res = await fetch('/api/collect', { method: 'POST', body: JSON.stringify({ siteId: id }), headers: { 'Content-Type': 'application/json' } })
      if (await writeOk(res)) {
        const data = await fetch(`/api/sites/${id}`).then(r => readJson<SiteDetail>(r))
        if (data) setSite(data)
        setCollectMsg('Datos recolectados correctamente')
        setTimeout(() => setCollectMsg(null), 4000)
      }
    } finally {
      setCollecting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este sitio y todos sus datos?')) return
    setDeleting(true)
    const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    if (!(await writeOk(res))) { setDeleting(false); return }
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-400 hover:underline text-sm">← Volver</Link>
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
            <WpPasswordForm siteId={site.id} currentPassword={site.hasWpAppPassword} />
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
