import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { M, W, H, CW, C, clr, statClr, scoreClr, lcpClr, box, card, createDoc } from '@/lib/pdf-helper'

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

  const { doc, font, bold } = await createDoc()
  let page = doc.addPage([W, H])
  let y: number
  let pageNum = 1

  function drawHeader() {
    box(page, 0, H - 80, W, 80, C.hd)
    page.drawText('Dashboard Centralizado', { x: M, y: H - 50, size: 20, font: bold, color: clr(C.hf) })
    page.drawText(`Reporte en vivo · ${new Date().toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' } as any)}`, {
      x: M, y: H - 70, size: 10, font, color: clr(C.mt),
    })
    page.drawText(`${sites.length} sitios`, { x: W - M - 60, y: H - 50, size: 9, font, color: clr(C.mt) })
    y = H - 100
  }

  function drawFooter() {
    page.drawLine({ start: { x: M, y: 42 }, end: { x: M + CW, y: 42 }, thickness: 0.5, color: clr(C.bd) })
    page.drawText(`Página ${pageNum} · Dashboard Centralizado · ${new Date().toLocaleString()}`, {
      x: M, y: 28, size: 7, font, color: clr(C.mt),
    })
  }

  function newPage() {
    drawFooter()
    pageNum++
    page = doc.addPage([W, H])
    drawHeader()
  }

  drawHeader()

  // ── Summary cards ──
  const total = sites.length
  const healthy = sites.filter(s => s.healthChecks?.[0]?.status === 'healthy').length
  const warning = sites.filter(s => s.healthChecks?.[0]?.status === 'warning').length
  const errors = sites.filter(s => s.healthChecks?.[0]?.status === 'error' || s.healthChecks?.[0]?.status === 'critical').length

  const scw = (CW - 24) / 4
  card(page, font, bold, M, y, scw, 50, 'Total', String(total), C.bl)
  card(page, font, bold, M + (scw + 8), y, scw, 50, 'Saludables', String(healthy), C.gr)
  card(page, font, bold, M + 2 * (scw + 8), y, scw, 50, 'Advertencia', String(warning), C.yw)
  card(page, font, bold, M + 3 * (scw + 8), y, scw, 50, 'Error', String(errors), C.rd)
  y -= 72

  // ── Table ──
  const cols = [M, M + 130, M + 205, M + 275, M + 340, M + 405]
  const colLabels = ['Sitio', 'Estado', 'Rend.', 'LCP', 'Acc.', 'SEO']
  const rowH = 26

  function drawTableHeader() {
    box(page, M, y - rowH, CW, rowH, C.hd)
    colLabels.forEach((l, i) => {
      page.drawText(l, { x: cols[i] + 8, y: y - rowH + 8, size: 8, font: bold, color: clr(C.hf) })
    })
    y -= rowH + 2
  }

  drawTableHeader()

  for (let i = 0; i < sites.length; i++) {
    if (y < 60) newPage()

    const site = sites[i]
    const h = site.healthChecks?.[0]
    const p = site.performanceSnapshots?.[0]
    const a = site.accessibilityScores?.[0]
    const seo = site.seoAudits?.[0]

    if (i % 2 === 0) box(page, M, y - rowH, CW, rowH, C.bg)

    page.drawText(site.name, { x: cols[0] + 8, y: y - rowH + 9, size: 9, font: bold, color: clr(C.tx) })
    page.drawText(site.url, { x: cols[0] + 8, y: y - rowH + 9 - 11, size: 6, font, color: clr(C.mt) })

    const sc = statClr(h?.status)
    page.drawText(h?.status ?? '—', { x: cols[1] + 8, y: y - rowH + 9, size: 9, font: bold, color: clr(sc) })

    page.drawText(p?.score != null ? `${p.score}` : '—', { x: cols[2] + 8, y: y - rowH + 9, size: 9, font: bold, color: clr(scoreClr(p?.score)) })
    page.drawText(p?.lcp != null ? `${p.lcp.toFixed(1)}s` : '—', { x: cols[3] + 8, y: y - rowH + 9, size: 9, font: bold, color: clr(lcpClr(p?.lcp)) })
    page.drawText(a?.score != null ? `${a.score}` : '—', { x: cols[4] + 8, y: y - rowH + 9, size: 9, font: bold, color: clr(scoreClr(a?.score)) })
    page.drawText(seo?.score != null ? `${seo.score}` : '—', { x: cols[5] + 8, y: y - rowH + 9, size: 9, font: bold, color: clr(scoreClr(seo?.score)) })

    y -= rowH + 1
  }

  drawFooter()

  const pdfBytes = Buffer.from(await doc.save())
  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="dashboard-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}