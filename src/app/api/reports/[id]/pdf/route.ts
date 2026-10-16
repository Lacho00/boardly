import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { StandardFonts } from 'pdf-lib'
import { M, W, H, CW, C, clr, scoreClr, box, card, secTitle, createDoc } from '@/lib/pdf-helper'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = await prisma.monthlyReport.findUnique({
    where: { id },
    include: { site: true },
  })
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { doc, font, bold } = await createDoc()
  const mono = await doc.embedFont(StandardFonts.Courier)
  const page = doc.addPage([W, H])
  let y: number

  const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][report.month - 1]

  // ── Header ──
  box(page, 0, H - 80, W, 80, C.hd)
  page.drawText('Reporte Mensual', { x: M, y: H - 50, size: 22, font: bold, color: clr(C.hf) })
  page.drawText(`${monthName} ${report.year}`, { x: M, y: H - 70, size: 11, font, color: clr(C.mt) })
  y = H - 100

  // ── Site info ──
  box(page, M, y - 10, CW, 36, C.bg)
  page.drawText(report.site.name, { x: M + 12, y: y - 2, size: 14, font: bold, color: clr(C.tx) })
  page.drawText(report.site.url, { x: M + 12, y: y - 18, size: 8, font: mono, color: clr(C.mt) })
  y -= 58

  // ── Metric cards ──
  secTitle(page, bold, M, y, 'Métricas del período')
  y -= 24

  const metrics = [
    { label: 'Rendimiento', value: report.avgPerformance != null ? `${report.avgPerformance.toFixed(0)}%` : '—', color: scoreClr(report.avgPerformance) },
    { label: 'SEO', value: report.avgSeo != null ? `${report.avgSeo.toFixed(0)}%` : '—', color: scoreClr(report.avgSeo) },
    { label: 'Accesibilidad', value: report.avgAccessibility != null ? `${report.avgAccessibility.toFixed(0)}%` : '—', color: scoreClr(report.avgAccessibility) },
    { label: 'Uptime', value: report.uptime != null ? `${report.uptime.toFixed(1)}%` : '—', color: report.uptime != null && report.uptime < 99.5 ? C.rd : report.uptime != null && report.uptime < 100 ? C.yw : C.gr },
  ]

  const cw = (CW - 24) / 4
  const ch = 54
  metrics.forEach((m, i) => {
    card(page, font, bold, M + i * (cw + 8), y, cw, ch, m.label, m.value, m.color)
  })
  y -= ch + 24

  // ── Details ──
  secTitle(page, bold, M, y, 'Detalles')
  y -= 22

  const details: [string, string][] = [
    ['Período', `${monthName} ${report.year}`],
    ['Sitio', report.site.name],
    ['Última actualización', report.createdAt ? new Date(report.createdAt).toLocaleString() : '—'],
  ]
  details.forEach(([l, v]) => {
    box(page, M + 8, y - 16, CW - 16, 16, C.bg)
    page.drawText(l, { x: M + 16, y: y - 11, size: 9, font, color: clr(C.mt) })
    page.drawText(v, { x: M + 140, y: y - 11, size: 9, font: bold, color: clr(C.tx) })
    y -= 19
  })

  // ── Footer ──
  page.drawLine({ start: { x: M, y: 42 }, end: { x: M + CW, y: 42 }, thickness: 0.5, color: clr(C.bd) })
  page.drawText(`Dashboard Centralizado · Generado el ${new Date().toLocaleString()}`, {
    x: M, y: 28, size: 7, font, color: clr(C.mt),
  })

  const pdfBytes = Buffer.from(await doc.save())
  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-${report.site.name}-${report.year}-${report.month}.pdf"`,
    },
  })
}