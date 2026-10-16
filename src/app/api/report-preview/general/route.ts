import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const scoreCls = (s?: number | null) => {
  if (s == null) return 'score-poor'
  if (s >= 80) return 'score-good'
  if (s >= 50) return 'score-avg'
  return 'score-poor'
}

const lcpCls = (lcp?: number | null) => {
  if (lcp == null) return 'score-poor'
  if (lcp <= 2.5) return 'score-good'
  if (lcp <= 4) return 'score-avg'
  return 'score-poor'
}

const badgeCls = (st?: string) => {
  if (st === 'healthy') return 'bg-healthy'
  if (st === 'warning') return 'bg-warning'
  return 'bg-error'
}

export async function GET() {
  const sites = await prisma.site.findMany({
    where: { active: true },
    include: {
      healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
      performanceSnapshots: { orderBy: { checkedAt: 'desc' }, take: 1 },
      seoAudits: { orderBy: { checkedAt: 'desc' }, take: 1 },
      accessibilityScores: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
  })

  const now = new Date()
  const dateStr = now.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })

  const total = sites.length
  const healthy = sites.filter(s => s.healthChecks?.[0]?.status === 'healthy').length
  const warning = sites.filter(s => s.healthChecks?.[0]?.status === 'warning').length
  const errorCount = sites.filter(s => s.healthChecks?.[0]?.status === 'error' || s.healthChecks?.[0]?.status === 'critical').length

  const rows = sites.map(site => {
    const h = site.healthChecks[0]
    const p = site.performanceSnapshots[0]
    const a = site.accessibilityScores[0]
    const seo = site.seoAudits[0]

    return `      <tr>
        <td>
          <p class="site-name">${site.name}</p>
          <p class="site-url">${site.url}</p>
        </td>
        <td class="text-center"><span class="badge ${badgeCls(h?.status)}">${h?.status ?? 'N/A'}</span></td>
        <td class="text-center score-indicator ${scoreCls(p?.score)}">${p?.score ?? '—'}</td>
        <td class="text-center ${lcpCls(p?.lcp)}">${p?.lcp != null ? `${p.lcp.toFixed(1)}s` : '—'}</td>
        <td class="text-center score-indicator ${scoreCls(a?.score)}">${a?.score ?? '—'}</td>
        <td class="text-center score-indicator ${scoreCls(seo?.score)}">${seo?.score ?? '—'}</td>
      </tr>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Centralizado - Reporte General</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        @page {
            size: A4;
            margin: 15mm 12mm;
            background-color: #fdfbf7;
            @bottom-right {
                content: "Página " counter(page);
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8pt;
                color: #8c8a82;
            }
        }
        body {
            margin: 0; padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #2d2a26;
            background-color: #fdfbf7;
            line-height: 1.35;
            font-size: 9pt;
            overflow-x: hidden;
            max-width: 100vw;
        }
        .header-banner {
            margin: -15mm -12mm 20px -12mm;
            padding: 22px 12mm;
            background: linear-gradient(135deg, #101b2b 0%, #1c3144 100%);
            color: #ffffff;
        }
        .header-grid { display: flex; align-items: center; justify-content: space-between; }
        .header-right { text-align: right; }
        .main-title { font-size: 18pt; font-weight: bold; margin: 0; letter-spacing: -0.3px; color: #f0ebd8; }
        .subtitle { font-size: 10pt; color: #a5b4fc; margin: 4px 0 0 0; font-weight: 500; }
        .stats-container {
            display: table;
            width: 100%;
            margin-bottom: 22px;
            border-collapse: separate;
            border-spacing: 10px 0;
        }
        .stat-box {
            display: table-cell;
            background-color: #ffffff;
            border: 1px solid #e2ddda;
            border-radius: 6px;
            padding: 12px 14px;
            text-align: center;
            vertical-align: middle;
        }
        .stat-box-total { border-top: 4px solid #475569; }
        .stat-box-healthy { border-top: 4px solid #16a34a; }
        .stat-box-warning { border-top: 4px solid #eab308; }
        .stat-box-error { border-top: 4px solid #dc2626; }
        .stat-num { font-size: 20pt; font-weight: 700; color: #1a1816; line-height: 1.1; }
        .stat-lbl { font-size: 8pt; text-transform: uppercase; font-weight: bold; color: #6e6a64; margin-top: 4px; letter-spacing: 0.3px; }
        .section-title {
            font-size: 11pt;
            font-weight: 700;
            color: #1c3144;
            margin: 15px 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-after: avoid;
        }
        .sites-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #ffffff;
            border: 1px solid #e2ddda;
            border-radius: 6px;
            overflow: hidden;
        }
        .sites-table th {
            background-color: #f2ede9;
            color: #4a4742;
            font-weight: 600;
            font-size: 8pt;
            text-transform: uppercase;
            padding: 8px 10px;
            text-align: left;
            border-bottom: 2px solid #e2ddda;
        }
        .sites-table td {
            padding: 8px 10px;
            font-size: 8.5pt;
            border-bottom: 1px solid #f2ede9;
            vertical-align: middle;
        }
        .sites-table tr:nth-child(even) { background-color: #faf8f5; }
        .sites-table tr:last-child td { border-bottom: none; }
        .badge {
            display: inline-block;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            text-align: center;
        }
        .bg-healthy { background-color: #dcfce7; color: #15803d; }
        .bg-warning { background-color: #fefce8; color: #a16207; }
        .bg-error { background-color: #fee2e2; color: #b91c1c; }
        .score-indicator { font-weight: bold; }
        .score-good { color: #16a34a; }
        .score-avg { color: #d97706; }
        .score-poor { color: #dc2626; }
        .site-name { font-weight: bold; color: #1a1816; font-size: 9pt; margin: 0; }
        .site-url { color: #6e6a64; font-size: 7.5pt; margin: 1px 0 0 0; font-family: monospace; }
        .text-center { text-align: center; }
        .print-btn {
            position: fixed; bottom: 24px; right: 24px;
            background: #101b2b; color: white; border: none;
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

<div class="report-container" style="max-width: 210mm; margin: 0 auto; padding: 15mm 12mm;">

    <div class="header-banner" style="margin: -15mm -12mm 20px -12mm; width: calc(100% + 24mm);">
        <div class="header-grid">
            <div class="header-cell">
                <h1 class="main-title">Dashboard Centralizado</h1>
                <p class="subtitle">Reporte en vivo de Infraestructura Web</p>
            </div>
            <div class="header-cell header-right">
                <p style="margin: 0; font-size: 10pt; font-weight: bold; color: #ffffff;">${dateStr}</p>
                <p style="margin: 3px 0 0 0; font-size: 7.5pt; color: #94a3b8;">Sistemas de Monitoreo Local</p>
            </div>
        </div>
    </div>

    <div class="stats-container">
        <div class="stat-box stat-box-total">
            <div class="stat-num">${total}</div>
            <div class="stat-lbl">Total Sitios</div>
        </div>
        <div class="stat-box stat-box-healthy">
            <div class="stat-num" style="color: #16a34a;">${healthy}</div>
            <div class="stat-lbl">Saludables</div>
        </div>
        <div class="stat-box stat-box-warning">
            <div class="stat-num" style="color: #d97706;">${warning}</div>
            <div class="stat-lbl">Advertencia</div>
        </div>
        <div class="stat-box stat-box-error">
            <div class="stat-num" style="color: #dc2626;">${errorCount}</div>
            <div class="stat-lbl">Error</div>
        </div>
    </div>

    <div class="section-title">Desglose General y Métricas Core Web Vitals</div>
    
    <table class="sites-table">
        <thead>
            <tr>
                <th style="width: 32%;">Sitio / Dominio</th>
                <th style="width: 15%; text-align: center;">Estado</th>
                <th style="width: 13%; text-align: center;">Rend.</th>
                <th style="width: 14%; text-align: center;">LCP</th>
                <th style="width: 13%; text-align: center;">Acc.</th>
                <th style="width: 13%; text-align: center;">SEO</th>
            </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
    </table>

</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}