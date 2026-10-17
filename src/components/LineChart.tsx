'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  buildGeometry, nearestIndex, rate, summarize,
  type ChartSeries, type Layout, type Rating, type Thresholds,
} from '@/lib/chart'

const BASE: Layout = { width: 640, height: 192, left: 44, right: 12, top: 10, bottom: 24 }

const BAND_FILL: Record<Rating, string> = {
  good: 'var(--ok)',
  'needs-improvement': 'var(--warn)',
  poor: 'var(--crit)',
}
const BAND_LABEL: Record<Rating, string> = { good: 'Good', 'needs-improvement': 'Needs improvement', poor: 'Poor' }

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

type Props = {
  title: string
  unit?: string
  decimals?: number
  series: ChartSeries[]
  thresholds?: Thresholds
}

export function LineChart({ title, unit = '', decimals = 2, series, thresholds }: Props) {
  const id = useId()
  const [active, setActive] = useState<number | null>(null)
  const format = (v: number) => v.toFixed(decimals)

  // Draw at the real pixel width so text keeps its size: 192px tall, any width.
  const frame = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(BASE.width)
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const LAYOUT: Layout = { ...BASE, width }

  const geo = buildGeometry(series, LAYOUT, thresholds)
  const plotBottom = LAYOUT.height - LAYOUT.bottom
  const plotRight = LAYOUT.width - LAYOUT.right
  const times = [...new Set(series.flatMap(s => s.points.map(p => p.t)))].sort((a, b) => a - b)
  const hasData = geo.paths.some(p => p.dots.length > 0)
  const summary = series.map(s => summarize(s.label, unit, s.points, format, thresholds)).join(' ')

  function moveTo(clientX: number, svg: SVGSVGElement) {
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return
    const x = ((clientX - rect.left) / rect.width) * LAYOUT.width
    const i = nearestIndex(geo.xs, x)
    setActive(i === -1 ? null : i)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const last = times.length - 1
    if (last < 0) return
    const keys: Record<string, number> = {
      ArrowRight: active === null ? 0 : Math.min(last, active + 1),
      ArrowLeft: active === null ? last : Math.max(0, active - 1),
      Home: 0,
      End: last,
    }
    if (e.key === 'Escape') return setActive(null)
    if (e.key in keys) { e.preventDefault(); setActive(keys[e.key]) }
  }

  const activeTime = active === null ? null : times[active]
  const readings = activeTime === null ? [] : series.map(s => ({ s, p: s.points.find(p => p.t === activeTime) }))
  const tipX = active === null ? 0 : geo.xs[active]
  const tipLeft = `${(tipX / LAYOUT.width) * 100}%`
  const flip = tipX > LAYOUT.width * 0.6

  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <h3 className="font-semibold mb-3">{title}</h3>

      <div ref={frame}>
      {!hasData ? (
        <p className="text-sm text-dim">No data in this range</p>
      ) : (
        <div
          role="group"
          aria-roledescription="line chart"
          className="relative rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          tabIndex={0}
          aria-label={`${title} chart. Use the left and right arrow keys to read each value.`}
          aria-describedby={`${id}-summary ${id}-reading`}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          <svg
            role="img"
            aria-label={summary}
            width={LAYOUT.width}
            height={LAYOUT.height}
            viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`}
            className="block"
            onMouseMove={e => moveTo(e.clientX, e.currentTarget)}
            onMouseLeave={() => setActive(null)}
          >
            {geo.bands.map(b => (
              <rect key={b.rating} x={LAYOUT.left} width={plotRight - LAYOUT.left} y={b.y} height={Math.max(0, b.height)} fill={BAND_FILL[b.rating]} fillOpacity={0.11} />
            ))}
            {geo.yTicks.map(t => (
              <g key={t}>
                <line x1={LAYOUT.left} x2={plotRight} y1={geo.y(t)} y2={geo.y(t)} className="stroke-line" strokeWidth={1} />
                <text x={LAYOUT.left - 6} y={geo.y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} className="fill-dim">{format(t)}</text>
              </g>
            ))}
            {[0, times.length - 1].filter((v, i, a) => times.length > 0 && a.indexOf(v) === i).map(i => (
              <text key={i} x={geo.xs[i]} y={plotBottom + 16} textAnchor={i === 0 && times.length > 1 ? 'start' : times.length > 1 ? 'end' : 'middle'} fontSize={11} className="fill-dim">
                {dateFormat.format(times[i])}
              </text>
            ))}
            {series.map((s, si) => (
              <g key={s.key} stroke={s.color} fill={s.color}>
                <path d={geo.paths[si].d} fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {geo.paths[si].dots.length === 1 && <circle cx={geo.paths[si].dots[0].x} cy={geo.paths[si].dots[0].y} r={3.5} stroke="none" />}
              </g>
            ))}
            {active !== null && (
              <g>
                <line x1={tipX} x2={tipX} y1={LAYOUT.top} y2={plotBottom} className="stroke-dim" strokeWidth={1} strokeDasharray="3 3" />
                {readings.map(({ s, p }) => p && p.v !== null && (
                  <circle key={s.key} cx={tipX} cy={geo.y(p.v)} r={4} fill={s.color} className="stroke-panel" strokeWidth={2} />
                ))}
              </g>
            )}
          </svg>

          {active !== null && activeTime !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 rounded border border-line bg-bg px-2 py-1 text-xs shadow"
              style={{ left: tipLeft, transform: `translateX(${flip ? 'calc(-100% - 8px)' : '8px'})` }}
            >
              <p className="text-dim">{dateFormat.format(activeTime)}</p>
              {readings.map(({ s, p }) => (
                <p key={s.key} className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span>{s.label}: {p && p.v !== null ? `${format(p.v)}${unit}` : '-'}</span>
                  {thresholds && p && p.v !== null && <span className="text-dim">({BAND_LABEL[rate(p.v, thresholds)]})</span>}
                </p>
              ))}
            </div>
          )}

          <p id={`${id}-summary`} className="sr-only">{summary}</p>
          <p id={`${id}-reading`} className="sr-only" aria-live="polite">
            {active !== null && activeTime !== null
              ? `${dateFormat.format(activeTime)}: ${readings.map(({ s, p }) => `${s.label} ${p && p.v !== null ? format(p.v) + unit : 'no data'}`).join(', ')}`
              : ''}
          </p>
        </div>
      )}
      </div>

      {hasData && thresholds && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
          {(['good', 'needs-improvement', 'poor'] as const).map(r => (
            <li key={r} className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-3 rounded-sm" style={{ background: BAND_FILL[r], opacity: 0.5 }} />
              {BAND_LABEL[r]}{r === 'good' ? ` ≤ ${thresholds.good}${unit}` : r === 'poor' ? ` > ${thresholds.poor}${unit}` : ''}
            </li>
          ))}
        </ul>
      )}

      <details className="mt-3 text-xs text-dim">
        <summary className="cursor-pointer hover:text-ink">View data table</summary>
        {hasData ? (
          <table className="mt-2 w-full text-left">
            <thead>
              <tr className="text-dim">
                <th scope="col" className="py-1 pr-4 font-medium">Date</th>
                {series.map(s => <th key={s.key} scope="col" className="py-1 pr-4 font-medium">{s.label}{unit && ` (${unit})`}</th>)}
              </tr>
            </thead>
            <tbody>
              {times.map(t => (
                <tr key={t} className="border-t border-line">
                  <th scope="row" className="py-1 pr-4 font-normal">{dateFormat.format(t)}</th>
                  {series.map(s => {
                    const v = s.points.find(p => p.t === t)?.v
                    return <td key={s.key} className="py-1 pr-4">{v == null ? '-' : format(v)}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-2">No data in this range.</p>
        )}
      </details>
    </div>
  )
}
