import { toneClass, type Tone } from '@/lib/scores'

/** Figure colour: only problems are tinted, good values keep the ink colour (as in the mockup). */
export function figureClass(tone: Tone): string {
  return tone === 'good' || tone === 'none' ? 'text-ink' : toneClass[tone]
}

/** Uptime over 30 days: 98 and below is poor, below 99.5 needs work. */
export function uptimeTone(pct: number | null | undefined): Tone {
  if (pct == null) return 'none'
  return pct < 98 ? 'bad' : pct < 99.5 ? 'warn' : 'good'
}

export function formatUptime(pct: number | null | undefined): string {
  if (pct == null) return '-'
  return `${pct}%`
}

export function formatResponse(ms: number | null | undefined): string {
  if (ms == null) return '-'
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}
