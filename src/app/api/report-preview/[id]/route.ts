import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function scoreClass(sc?: number | null) {
  if (sc == null) return 'score-poor'
  if (sc >= 80) return 'score-good'
  if (sc >= 50) return 'score-average'
  return 'score-poor'
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
      performanceSnapshots: { orderBy: { checkedAt: 'desc' }, take: 1 },
      seoAudits: { orderBy: { checkedAt: 'desc' }, take: 1 },
      accessibilityScores: { orderBy: { checkedAt: 'desc' }, take: 1 },
      sslChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const h = site.healthChecks[0]
  const p = site.performanceSnapshots[0]
  const seo = site.seoAudits[0]
  const a = site.accessibilityScores[0]
  const s = site.sslChecks[0]

  const now = new Date()
  const dateStr = now.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })
  const fullDateStr = now.toLocaleString()

  const lcpGood = p?.lcp != null && p.lcp <= 2.5
  const lcpAvg = p?.lcp != null && p.lcp > 2.5 && p.lcp <= 4
  const clsGood = p?.cls != null && p.cls <= 0.1
  const clsAvg = p?.cls != null && p.cls > 0.1 && p.cls <= 0.25
  const ttfbGood = p?.ttfb != null && p.ttfb <= 0.4
  const ttfbAvg = p?.ttfb != null && p.ttfb > 0.4 && p.ttfb <= 0.8

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte - ${site.name}</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
@page {
  size: A4;
  margin: 15mm 12mm;
  @bottom-right {
    content: "Página " counter(page);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 8pt;
    color: #94a3b8;
  }
}
body {
  margin: 0; padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1e293b;
  background-color: #f8fafc;
  line-height: 1.4;
  font-size: 10pt;
  overflow-x: hidden;
  max-width: 100vw;
}
.header-banner {
  margin: -15mm -12mm 20px -12mm;
  padding: 20px 12mm;
  background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
  color: #ffffff;
}
.header-grid { display: flex; align-items: center; justify-content: space-between; }
.header-right { text-align: right; }
.project-title { font-size: 20pt; font-weight: bold; margin: 0; letter-spacing: -0.5px; }
.project-url { font-size: 11pt; color: #93c5fd; margin: 4px 0 0 0; }
.meta-date { font-size: 9pt; color: #cbd5e1; margin: 0; }
.meta-generated { font-size: 8pt; color: #94a3b8; margin: 4px 0 0 0; }
.status-container {
  display: table; width: 100%; margin-bottom: 20px;
  background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;
}
.status-column { display: table-cell; width: 33.33%; padding: 0 10px; vertical-align: middle; }
.status-column:not(:last-child) { border-right: 1px solid #e2e8f0; }
.stat-label { font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
.stat-value { font-size: 14pt; font-weight: bold; color: #0f172a; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 11pt; font-weight: bold; display: inline-block; }
.badge-healthy { background-color: #dcfce7; color: #15803d; }
.badge-warning { background-color: #fef9c3; color: #a16207; }
.badge-error { background-color: #fee2e2; color: #b91c1c; }
.section-title {
  font-size: 12pt; font-weight: 700; color: #0f172a;
  margin: 20px 0 10px 0; padding-bottom: 6px;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase; letter-spacing: 0.5px;
  page-break-after: avoid;
}
.scores-container { display: table; width: 100%; margin-bottom: 15px; }
.score-block { display: table-cell; width: 25%; padding: 0 6px; }
.score-block:first-child { padding-left: 0; }
.score-block:last-child { padding-right: 0; }
.score-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 10px; text-align: center; }
.score-circle {
  width: 55px; height: 55px; border-radius: 50%; margin: 0 auto 10px auto;
  line-height: 51px; font-size: 13pt; font-weight: 700; border: 3px solid #e2e8f0;
}
.score-good { border-color: #22c55e; color: #15803d; background-color: #f0fdf4; }
.score-average { border-color: #eab308; color: #a16207; background-color: #fefce8; }
.score-poor { border-color: #ef4444; color: #b91c1c; background-color: #fef2f2; }
.score-name { font-size: 9pt; font-weight: 600; color: #334155; }
.metrics-table { display: table; width: 100%; margin-bottom: 20px; }
.metrics-row { display: table-row; }
.metrics-cell { display: table-cell; width: 33.33%; padding: 0 8px; }
.metrics-cell:first-child { padding-left: 0; }
.metrics-cell:last-child { padding-right: 0; }
.metric-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
.metric-card-title { font-size: 9pt; color: #64748b; font-weight: 600; margin-bottom: 6px; }
.metric-card-value { font-size: 16pt; font-weight: 700; color: #0f172a; }
.metric-card-desc { font-size: 8pt; color: #94a3b8; margin-top: 4px; }
.details-table {
  width: 100%; border-collapse: collapse;
  background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 25px;
}
.details-table th {
  background-color: #f1f5f9; color: #475569; font-weight: 600; font-size: 8.5pt;
  text-transform: uppercase; padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0;
}
.details-table td {
  padding: 10px 14px; font-size: 9.5pt; border-bottom: 1px solid #f1f5f9; color: #334155;
}
.details-table tr:last-child td { border-bottom: none; }
.text-right { text-align: right; }
.font-mono { font-family: monospace; font-size: 10pt; }
.report-container { max-width: 210mm; margin: 0 auto; padding: 15mm 12mm; }
.print-btn {
  position: fixed; bottom: 24px; right: 24px;
  background: #0f172a; color: white; border: none;
  padding: 12px 24px; border-radius: 12px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100;
  transition: all 0.15s ease;
}
.print-btn:hover { background: #1e3a8a; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
@media print { .print-btn { display: none; } }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">Descargar PDF</button>

<div class="report-container">
<div class="header-banner">
  <div class="header-grid">
    <div class="header-cell">
      <h1 class="project-title">${site.name}</h1>
      <p class="project-url">${site.url}</p>
    </div>
    <div class="header-cell header-right">
      <p class="meta-date">${dateStr}</p>
      <p class="meta-generated">Dashboard Centralizado · Generado el ${fullDateStr}</p>
    </div>
  </div>
</div>

<div class="status-container">
  <div class="status-column">
    <div class="stat-label">Estado del Sitio</div>
    <div class="stat-value">
      <span class="badge badge-${h?.status === 'healthy' ? 'healthy' : h?.status === 'warning' ? 'warning' : 'error'}">${(h?.status ?? 'Sin datos').toUpperCase()}</span>
    </div>
  </div>
  <div class="status-column">
    <div class="stat-label">Tiempo de Respuesta</div>
    <div class="stat-value">${h?.responseTime != null ? `${h.responseTime} ms` : 'N/A'}</div>
  </div>
  <div class="status-column">
    <div class="stat-label">Seguridad SSL</div>
    <div class="stat-value">
      <span class="badge badge-${s?.valid ? 'healthy' : 'error'}">${s?.valid ? (s.daysRemaining != null ? `${s.daysRemaining} días` : 'Válido') : 'No Válido / No Disp.'}</span>
    </div>
  </div>
</div>

<div class="section-title">Puntuaciones de Rendimiento y Auditoría</div>

<div class="scores-container">
  <div class="score-block">
    <div class="score-card">
      <div class="score-circle ${scoreClass(p?.score)}">${p?.score ?? '—'}</div>
      <div class="score-name">Rendimiento</div>
    </div>
  </div>
  <div class="score-block">
    <div class="score-card">
      <div class="score-circle ${scoreClass(p?.bestPractices)}">${p?.bestPractices ?? '—'}</div>
      <div class="score-name">Best Practices</div>
    </div>
  </div>
  <div class="score-block">
    <div class="score-card">
      <div class="score-circle ${scoreClass(a?.score)}">${a?.score ?? '—'}</div>
      <div class="score-name">Accesibilidad</div>
    </div>
  </div>
  <div class="score-block">
    <div class="score-card">
      <div class="score-circle ${scoreClass(seo?.score)}">${seo?.score ?? '—'}</div>
      <div class="score-name">SEO</div>
    </div>
  </div>
</div>

<div class="section-title">Métricas de Carga Clave (Core Web Vitals)</div>

<div class="metrics-table">
  <div class="metrics-row">
    <div class="metrics-cell">
      <div class="metric-card">
        <div class="metric-card-title">LCP (Largest Contentful Paint)</div>
        <div class="metric-card-value" style="color: ${lcpGood ? '#15803d' : lcpAvg ? '#a16207' : '#b91c1c'};">${p?.lcp != null ? `${p.lcp.toFixed(2)}s` : '—'}</div>
        <div class="metric-card-desc">Carga del elemento principal</div>
      </div>
    </div>
    <div class="metrics-cell">
      <div class="metric-card">
        <div class="metric-card-title">CLS (Cumulative Layout Shift)</div>
        <div class="metric-card-value" style="color: ${clsGood ? '#15803d' : clsAvg ? '#a16207' : '#b91c1c'};">${p?.cls != null ? p.cls.toFixed(3) : '—'}</div>
        <div class="metric-card-desc">Estabilidad visual de la página</div>
      </div>
    </div>
    <div class="metrics-cell">
      <div class="metric-card">
        <div class="metric-card-title">TTFB (Time to First Byte)</div>
        <div class="metric-card-value" style="color: ${ttfbGood ? '#15803d' : ttfbAvg ? '#a16207' : '#b91c1c'};">${p?.ttfb != null ? `${p.ttfb.toFixed(2)}s` : '—'}</div>
        <div class="metric-card-desc">Tiempo de respuesta del servidor</div>
      </div>
    </div>
  </div>
</div>

<div class="section-title">Resumen Técnico de Diagnóstico</div>
<table class="details-table">
  <thead>
    <tr>
      <th>Métrica / Parámetro</th>
      <th>Estado actual</th>
      <th class="text-right">Valor Registrado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Estado General del Host</strong></td>
      <td><span style="color: ${h?.status === 'healthy' ? '#16a34a' : h?.status === 'warning' ? '#ca8a04' : '#dc2626'}; font-weight: bold;">${h?.status === 'healthy' ? '✔ Operacional' : h?.status === 'warning' ? '⚠ Advertencia' : '❌ Error'}</span></td>
      <td class="text-right font-mono">${(h?.status ?? 'N/A').toUpperCase()}</td>
    </tr>
    <tr>
      <td><strong>Tiempo de Respuesta Medio</strong></td>
      <td><span style="color: ${h?.responseTime != null && h.responseTime < 500 ? '#16a34a' : h?.responseTime != null && h.responseTime < 2000 ? '#ca8a04' : '#dc2626'}; font-weight: bold;">${h?.responseTime != null && h.responseTime < 500 ? '✔ Excelente' : h?.responseTime != null && h.responseTime < 2000 ? '⚠ Moderado' : '❌ Lento'}</span></td>
      <td class="text-right font-mono">${h?.responseTime != null ? `${h.responseTime}ms` : 'N/A'}</td>
    </tr>
    <tr>
      <td><strong>Largest Contentful Paint (LCP)</strong></td>
      <td><span style="color: ${lcpGood ? '#16a34a' : lcpAvg ? '#ca8a04' : '#dc2626'}; font-weight: bold;">${lcpGood ? '✔ Óptimo' : lcpAvg ? '⚠ Regular' : '❌ Requiere Mejora'}</span></td>
      <td class="text-right font-mono">${p?.lcp != null ? `${p.lcp.toFixed(2)}s` : 'N/A'}</td>
    </tr>
    <tr>
      <td><strong>Cumulative Layout Shift (CLS)</strong></td>
      <td><span style="color: ${clsGood ? '#16a34a' : clsAvg ? '#ca8a04' : '#dc2626'}; font-weight: bold;">${clsGood ? '✔ Óptimo' : clsAvg ? '⚠ Regular' : '❌ Requiere Mejora'}</span></td>
      <td class="text-right font-mono">${p?.cls != null ? p.cls.toFixed(3) : 'N/A'}</td>
    </tr>
    <tr>
      <td><strong>Time to First Byte (TTFB)</strong></td>
      <td><span style="color: ${ttfbGood ? '#16a34a' : ttfbAvg ? '#ca8a04' : '#dc2626'}; font-weight: bold;">${ttfbGood ? '✔ Óptimo' : ttfbAvg ? '⚠ Regular' : '❌ Requiere Mejora'}</span></td>
      <td class="text-right font-mono">${p?.ttfb != null ? `${p.ttfb.toFixed(2)}s` : 'N/A'}</td>
    </tr>
    <tr>
      <td><strong>Cifrado de Seguridad (SSL)</strong></td>
      <td><span style="color: ${s?.valid ? '#16a34a' : '#dc2626'}; font-weight: bold;">${s?.valid ? '✔ Seguro' : '❌ Inseguro'}</span></td>
      <td class="text-right font-mono">${s?.valid ? (s.daysRemaining != null ? `${s.daysRemaining} días` : 'Válido') : 'No Válido'}</td>
    </tr>
  </tbody>
</table>

</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}