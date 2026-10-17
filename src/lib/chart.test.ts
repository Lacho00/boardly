import { describe, expect, it } from 'vitest'
import {
  buildGeometry, linePath, linearScale, nearestIndex, niceTicks, rate, summarize, yMax, WEB_VITALS,
  type ChartSeries, type Layout,
} from './chart'

const layout: Layout = { width: 200, height: 100, left: 20, right: 10, top: 10, bottom: 20 }

describe('rate', () => {
  it('uses inclusive limits', () => {
    expect(rate(2.5, WEB_VITALS.lcp)).toBe('good')
    expect(rate(2.6, WEB_VITALS.lcp)).toBe('needs-improvement')
    expect(rate(4, WEB_VITALS.lcp)).toBe('needs-improvement')
    expect(rate(4.1, WEB_VITALS.lcp)).toBe('poor')
  })
})

describe('linearScale', () => {
  it('maps domain ends to range ends', () => {
    const s = linearScale([0, 10], [100, 0])
    expect(s(0)).toBe(100)
    expect(s(10)).toBe(0)
    expect(s(5)).toBe(50)
  })
  it('maps a zero-width domain to the middle', () => {
    expect(linearScale([3, 3], [0, 100])(3)).toBe(50)
  })
})

describe('niceTicks', () => {
  it('rounds the step to a nice number', () => {
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10])
    expect(niceTicks(0, 1, 4)).toEqual([0, 0.25, 0.5, 0.75, 1])
  })
  it('returns the single value for an empty domain', () => {
    expect(niceTicks(5, 5)).toEqual([5])
  })
  it('starts at a multiple of the step', () => {
    expect(niceTicks(3, 20, 4)[0]).toBe(5)
  })
})

describe('yMax', () => {
  it('covers data and the poor threshold', () => {
    expect(yMax([1], WEB_VITALS.lcp)).toBeGreaterThanOrEqual(4)
    expect(yMax([10], WEB_VITALS.lcp)).toBeGreaterThanOrEqual(11)
  })
  it('falls back to a positive value with no data', () => {
    expect(yMax([])).toBeGreaterThan(0)
  })
})

describe('linePath', () => {
  it('draws one segment', () => {
    expect(linePath([{ x: 0, y: 1 }, { x: 10, y: 2 }])).toBe('M0.0 1.0L10.0 2.0')
  })
  it('breaks the line at a null value', () => {
    expect(linePath([{ x: 0, y: 1 }, { x: 5, y: null }, { x: 10, y: 2 }])).toBe('M0.0 1.0M10.0 2.0')
  })
  it('is empty with no points', () => {
    expect(linePath([])).toBe('')
  })
})

describe('nearestIndex', () => {
  it('finds the closest x', () => {
    expect(nearestIndex([0, 10, 20], 12)).toBe(1)
  })
  it('returns -1 when empty', () => {
    expect(nearestIndex([], 5)).toBe(-1)
  })
})

describe('buildGeometry', () => {
  const series = (points: ChartSeries['points']): ChartSeries[] => [{ key: 'a', label: 'A', color: '#fff', points }]

  it('handles no points', () => {
    const g = buildGeometry(series([]), layout)
    expect(g.xs).toEqual([])
    expect(g.paths[0].d).toBe('')
  })
  it('puts a single point in the middle of the plot', () => {
    const g = buildGeometry(series([{ t: 1, v: 1 }]), layout)
    expect(g.xs).toEqual([(20 + 190) / 2])
    expect(g.paths[0].dots).toHaveLength(1)
  })
  it('spans the plot width with N points and skips nulls in dots', () => {
    const g = buildGeometry(series([{ t: 1, v: 1 }, { t: 2, v: null }, { t: 3, v: 2 }]), layout)
    expect(g.xs[0]).toBe(20)
    expect(g.xs[2]).toBe(190)
    expect(g.paths[0].dots).toHaveLength(2)
  })
  it('builds three bands that tile the plot height', () => {
    const g = buildGeometry(series([{ t: 1, v: 1 }]), layout, WEB_VITALS.lcp)
    expect(g.bands.map(b => b.rating)).toEqual(['good', 'needs-improvement', 'poor'])
    const total = g.bands.reduce((sum, b) => sum + b.height, 0)
    expect(total).toBeCloseTo(100 - 10 - 20)
  })
  it('has no bands without thresholds', () => {
    expect(buildGeometry(series([{ t: 1, v: 1 }]), layout).bands).toEqual([])
  })
})

describe('summarize', () => {
  const fmt = (v: number) => v.toFixed(1)
  it('reports no data', () => {
    expect(summarize('LCP', 's', [{ t: 1, v: null }], fmt)).toBe('LCP: no data in this range.')
  })
  it('reports a single reading with its rating', () => {
    expect(summarize('LCP', 's', [{ t: 1, v: 3 }], fmt, WEB_VITALS.lcp)).toBe(
      'LCP: one reading, 3.0s. Latest value is needs improvement.',
    )
  })
  it('reports range, min and max', () => {
    expect(summarize('LCP', 's', [{ t: 1, v: 1 }, { t: 2, v: 5 }], fmt, WEB_VITALS.lcp)).toBe(
      'LCP: 2 readings from 1.0s to 5.0s, lowest 1.0s, highest 5.0s. Latest value is poor.',
    )
  })
})
