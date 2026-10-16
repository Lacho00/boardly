import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib'

export const M = 45
export const W = 595
export const H = 842
export const CW = W - M * 2

export function clr(c: [number, number, number]) {
  return rgb(c[0], c[1], c[2])
}

export const C = {
  tx: [0.12, 0.12, 0.12] as [number, number, number],
  mt: [0.45, 0.45, 0.45] as [number, number, number],
  bd: [0.82, 0.82, 0.82] as [number, number, number],
  hd: [0.22, 0.22, 0.22] as [number, number, number],
  hf: [1, 1, 1] as [number, number, number],
  gr: [0.09, 0.63, 0.22] as [number, number, number],
  yw: [0.79, 0.54, 0.03] as [number, number, number],
  rd: [0.86, 0.15, 0.15] as [number, number, number],
  bl: [0.12, 0.44, 0.78] as [number, number, number],
  bg: [0.96, 0.96, 0.96] as [number, number, number],
  wh: [1, 1, 1] as [number, number, number],
}

export function statClr(s?: string) {
  if (s === 'healthy') return C.gr
  if (s === 'error' || s === 'critical') return C.rd
  if (s === 'warning') return C.yw
  return C.mt
}

export function scoreClr(s?: number | null) {
  if (s == null) return C.mt
  if (s >= 80) return C.gr
  if (s >= 50) return C.yw
  return C.rd
}

export function lcpClr(lcp?: number | null) {
  if (lcp == null) return C.mt
  if (lcp <= 2.5) return C.gr
  if (lcp <= 4) return C.yw
  return C.rd
}

export function daysClr(d?: number | null) {
  if (d == null) return C.mt
  if (d > 30) return C.gr
  if (d > 14) return C.yw
  return C.rd
}

export function box(page: PDFPage, x: number, y: number, w: number, h: number, color: [number, number, number]) {
  page.drawRectangle({ x, y, width: w, height: h, color: clr(color) })
}

export function label(page: PDFPage, font: PDFFont, x: number, y: number, text: string) {
  page.drawText(text, { x, y, size: 7, font, color: clr(C.mt) })
}

export function val(page: PDFPage, bold: PDFFont, x: number, y: number, text: string, color?: [number, number, number]) {
  page.drawText(text, { x, y, size: 15, font: bold, color: color ? clr(color) : clr(C.tx) })
}

export function secTitle(page: PDFPage, bold: PDFFont, x: number, y: number, text: string) {
  page.drawText(text, { x, y, size: 13, font: bold, color: clr(C.tx) })
  page.drawLine({ start: { x, y: y - 4 }, end: { x: x + text.length * 6 + 20, y: y - 4 }, thickness: 2, color: clr(C.bl) })
}

export function card(page: PDFPage, font: PDFFont, bold: PDFFont, x: number, y: number, w: number, h: number, labelText: string, valueText: string, color?: [number, number, number]) {
  box(page, x, y - h, w, h, C.bg)
  val(page, bold, x + 10, y - h + 12, valueText, color)
  label(page, font, x + 10, y - 10, labelText)
}

export async function createDoc() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  return { doc, font, bold }
}