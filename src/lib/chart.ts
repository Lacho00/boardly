// Pure helpers behind LineChart: no React, no DOM, so they can be unit tested.

export type Point = { t: number; v: number | null }

export type Thresholds = { good: number; poor: number }

export type Rating = 'good' | 'needs-improvement' | 'poor'

/** Core Web Vitals limits: a value up to `good` is good, above `poor` is poor. */
export const WEB_VITALS = {
  lcp: { good: 2.5, poor: 4 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 0.8, poor: 1.8 },
} satisfies Record<string, Thresholds>

export function rate(value: number, { good, poor }: Thresholds): Rating {
  if (value <= good) return 'good'
  return value <= poor ? 'needs-improvement' : 'poor'
}

/** Maps `domain` onto `range`. A zero-width domain maps to the middle of the range. */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  return (x: number) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((x - d0) / (d1 - d0)) * (r1 - r0))
}

/** Rounds a step up to 1, 2, 2.5, 5 or 10 times a power of ten. */
function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw))
  const f = raw / pow
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow
}

/** Evenly spaced tick values covering [min, max], starting at a multiple of the step. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!(max > min)) return [min]
  const step = niceStep((max - min) / count)
  const first = Math.ceil(min / step - 1e-9) * step
  const ticks: number[] = []
  for (let v = first; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(12)))
  return ticks
}

/** Upper end of the y axis: room for the data and for the whole "poor" band start. */
export function yMax(values: number[], thresholds?: Thresholds) {
  const top = Math.max(0, ...values, thresholds ? thresholds.poor : 0)
  const padded = top * 1.1 || 1
  const ticks = niceTicks(0, padded, 4)
  return ticks[ticks.length - 1] >= padded ? ticks[ticks.length - 1] : ticks[ticks.length - 1] + (ticks[1] - ticks[0])
}

/** SVG path through the points. A null value breaks the line into separate segments. */
export function linePath(points: { x: number; y: number | null }[]): string {
  let d = ''
  let open = false
  for (const { x, y } of points) {
    if (y === null) { open = false; continue }
    d += `${open ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    open = true
  }
  return d
}

/** Index of the point whose x is closest to `x`, or -1 when there are none. */
export function nearestIndex(xs: number[], x: number): number {
  let best = -1
  let dist = Infinity
  xs.forEach((px, i) => {
    const d = Math.abs(px - x)
    if (d < dist) { best = i; dist = d }
  })
  return best
}

export type ChartSeries = {
  key: string
  label: string
  color: string
  points: Point[]
}

export type Layout = { width: number; height: number; left: number; right: number; top: number; bottom: number }

export type Geometry = {
  xs: number[]
  yTicks: number[]
  yTop: number
  y: (v: number) => number
  paths: { key: string; d: string; dots: { x: number; y: number }[] }[]
  bands: { rating: Rating; y: number; height: number }[]
}

/** Everything LineChart draws, computed from data and layout alone. */
export function buildGeometry(series: ChartSeries[], layout: Layout, thresholds?: Thresholds): Geometry {
  const times = [...new Set(series.flatMap(s => s.points.map(p => p.t)))].sort((a, b) => a - b)
  const values = series.flatMap(s => s.points.flatMap(p => (p.v === null ? [] : [p.v])))
  const yTop = yMax(values, thresholds)
  const plotLeft = layout.left
  const plotRight = layout.width - layout.right
  const plotTop = layout.top
  const plotBottom = layout.height - layout.bottom

  const x = linearScale([times[0] ?? 0, times[times.length - 1] ?? 0], [plotLeft, plotRight])
  const y = linearScale([0, yTop], [plotBottom, plotTop])

  const paths = series.map(s => {
    const projected = s.points.map(p => ({ x: x(p.t), y: p.v === null ? null : y(p.v) }))
    return {
      key: s.key,
      d: linePath(projected),
      dots: projected.flatMap(p => (p.y === null ? [] : [{ x: p.x, y: p.y }])),
    }
  })

  const bands = thresholds
    ? [
        { rating: 'good' as const, y: y(thresholds.good), height: y(0) - y(thresholds.good) },
        { rating: 'needs-improvement' as const, y: y(thresholds.poor), height: y(thresholds.good) - y(thresholds.poor) },
        { rating: 'poor' as const, y: y(yTop), height: y(thresholds.poor) - y(yTop) },
      ]
    : []

  return { xs: times.map(x), yTicks: niceTicks(0, yTop, 4), yTop, y, paths, bands }
}

/** One-sentence description for screen readers. */
export function summarize(label: string, unit: string, points: Point[], format: (v: number) => string, thresholds?: Thresholds): string {
  const real = points.filter((p): p is { t: number; v: number } => p.v !== null)
  if (real.length === 0) return `${label}: no data in this range.`
  const first = real[0].v
  const last = real[real.length - 1].v
  const min = Math.min(...real.map(p => p.v))
  const max = Math.max(...real.map(p => p.v))
  const status = thresholds ? ` Latest value is ${rate(last, thresholds).replace('-', ' ')}.` : ''
  if (real.length === 1) return `${label}: one reading, ${format(last)}${unit}.${status}`
  return `${label}: ${real.length} readings from ${format(first)}${unit} to ${format(last)}${unit}, lowest ${format(min)}${unit}, highest ${format(max)}${unit}.${status}`
}
