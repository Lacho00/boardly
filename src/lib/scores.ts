// Text colour for a metric. scoreTone bands (90/50) drive the home page; the reports page applies its own 80/50 bands.
export type Tone = 'good' | 'warn' | 'bad' | 'none'

export const toneClass: Record<Tone, string> = {
  good: 'text-ok',
  warn: 'text-warn',
  bad: 'text-crit',
  none: 'text-ink',
}

/** Lighthouse bands: 90+ good, 50-89 needs work, below 50 poor. */
export function scoreTone(score: number | null | undefined): Tone {
  if (score == null) return 'none'
  return score >= 90 ? 'good' : score >= 50 ? 'warn' : 'bad'
}

/** Core Web Vitals LCP in seconds: 2.5 good, 4 poor. */
export function lcpTone(seconds: number | null | undefined): Tone {
  if (seconds == null) return 'none'
  return seconds <= 2.5 ? 'good' : seconds <= 4 ? 'warn' : 'bad'
}

/** Server response time in ms: 800 good, 1800 poor (same bands as the TTFB chart). */
export function responseTone(ms: number | null | undefined): Tone {
  if (ms == null) return 'none'
  return ms <= 800 ? 'good' : ms <= 1800 ? 'warn' : 'bad'
}

/** Days until the SSL certificate expires: under 7 poor, under 30 needs work. */
export function sslTone(days: number | null | undefined): Tone {
  if (days == null) return 'none'
  return days < 7 ? 'bad' : days < 30 ? 'warn' : 'good'
}
