import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeFilename } from '@/lib/security'
import { StandardFonts } from 'pdf-lib'
import { M, W, H, CW, C, clr, statClr, scoreClr, lcpClr, daysClr, box, card, secTitle, createDoc } from '@/lib/pdf-helper'

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

  const { doc, font, bold } = await createDoc()
  const mono = await doc.embedFont(StandardFonts.Courier)
  const page = doc.addPage([W, H])
  let y: number

  // ── Header ──
  box(page, 0, H - 80, W, 80, C.hd)
  page.drawText(site.name, { x: M, y: H - 54, size: 22, font: bold, color: clr(C.hf) })
  page.drawText(site.url, { x: M, y: H - 74, size: 9, font: mono, color: clr(C.mt) })
  page.drawText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), {
    x: W - M - 150, y: H - 54, size: 9, font, color: clr(C.mt),
  })
  y = H - 100

  const h = site.healthChecks?.[0]
  const p = site.performanceSnapshots?.[0]
  const seo = site.seoAudits?.[0]
  const a = site.accessibilityScores?.[0]
  const s = site.sslChecks?.[0]

  // ── Status bar ──
  const st = h?.status ?? 'No data'
  const stC = statClr(h?.status)
  box(page, M, y - 10, CW, 32, C.bg)
  page.drawText('STATUS', { x: M + 12, y: y - 2, size: 7, font: bold, color: clr(C.mt) })
  box(page, M + 12, y - 22, st.length * 7 + 16, 18, stC)
  page.drawText(st.toUpperCase(), { x: M + 20, y: y - 17, size: 8, font: bold, color: clr(C.wh) })

  let xOff = M + 150
  const extras: [string, string][] = []
  if (h?.responseTime != null) extras.push(['Resp. Time', `${h.responseTime}ms`])
  if (h?.wpVersion) extras.push(['WordPress', h.wpVersion])
  extras.forEach(([l, v]) => {
    page.drawText(v, { x: xOff, y: y - 7, size: 10, font: bold, color: clr(C.tx) })
    page.drawText(l, { x: xOff, y: y - 20, size: 7, font, color: clr(C.mt) })
    xOff += 90
  })
  y -= 55

  // ── Performance ──
  secTitle(page, bold, M, y, 'Performance')
  y -= 24

  const perfCards = [
    { label: 'Performance', value: p?.score != null ? `${p.score}/100` : '—', color: scoreClr(p?.score) },
    { label: 'LCP', value: p?.lcp != null ? `${p.lcp.toFixed(2)}s` : '—', color: lcpClr(p?.lcp) },
    { label: 'CLS', value: p?.cls != null ? p.cls.toFixed(3) : '—', color: p?.cls != null && p.cls > 0.25 ? C.rd : p?.cls != null && p.cls > 0.1 ? C.yw : C.gr },
    { label: 'TTFB', value: p?.ttfb != null ? `${p.ttfb.toFixed(2)}s` : '—', color: p?.ttfb != null && p.ttfb > 0.8 ? C.rd : p?.ttfb != null && p.ttfb > 0.4 ? C.yw : C.gr },
    { label: 'Best Practices', value: p?.bestPractices != null ? `${p.bestPractices}/100` : '—', color: scoreClr(p?.bestPractices) },
  ]

  const cw = (CW - 20) / 3
  const ch = 50
  perfCards.forEach((c, i) => {
    const col = i % 3
    const ri = Math.floor(i / 3)
    card(page, font, bold, M + col * (cw + 10), y - ri * (ch + 10), cw, ch, c.label, c.value, c.color)
  })
  y -= Math.ceil(perfCards.length / 3) * (ch + 10) + 6

  // ── Accessibility & SEO ──
  secTitle(page, bold, M, y, 'Accessibility and SEO')
  y -= 24

  const hw = (CW - 10) / 2
  card(page, font, bold, M, y, hw, ch, 'Accessibility', a?.score != null ? `${a.score}/100` : '—', scoreClr(a?.score))
  card(page, font, bold, M + hw + 10, y, hw, ch, 'SEO', seo?.score != null ? `${seo.score}/100` : '—', scoreClr(seo?.score))
  y -= ch + 16

  // ── SSL ──
  secTitle(page, bold, M, y, 'SSL')
  y -= 24

  const sslCards = [
    { label: 'Valid', value: s?.valid ? 'Yes' : 'No', color: s?.valid ? C.gr : C.rd },
  ]
  if (s?.daysRemaining != null) sslCards.push({ label: 'Days left', value: `${s.daysRemaining} days`, color: daysClr(s.daysRemaining) })
  if (s?.issuer) sslCards.push({ label: 'Issuer', value: s.issuer, color: C.tx })

  const scw = (CW - (sslCards.length - 1) * 10) / sslCards.length
  sslCards.forEach((c, i) => {
    card(page, font, bold, M + i * (scw + 10), y, scw, ch, c.label, c.value, c.color)
  })

  // ── Footer ──
  page.drawLine({ start: { x: M, y: 42 }, end: { x: M + CW, y: 42 }, thickness: 0.5, color: clr(C.bd) })
  page.drawText(`Centralized Dashboard · Generated on ${new Date().toLocaleString('en-US')}`, {
    x: M, y: 28, size: 7, font, color: clr(C.mt),
  })

  const pdfBytes = Buffer.from(await doc.save())
  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename(site.name)}-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}