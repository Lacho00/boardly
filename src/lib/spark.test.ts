import { describe, expect, it } from 'vitest'
import { sparkPoints } from './spark'

const parse = (s: string) => s.split(' ').map(p => p.split(',').map(Number))

describe('sparkPoints', () => {
  it('is empty for fewer than two values', () => {
    expect(sparkPoints([5], { width: 100, height: 20 })).toBe('')
    expect(sparkPoints([], { width: 100, height: 20 })).toBe('')
  })
  it('draws a flat series as a centred line without NaN', () => {
    const out = sparkPoints([4, 4, 4], { width: 100, height: 20 })
    expect(out).not.toContain('NaN')
    const ys = parse(out).map(p => p[1])
    expect(new Set(ys).size).toBe(1)
    expect(ys[0]).toBe(10)
  })
  it('spans the width and puts higher values higher up', () => {
    const pts = parse(sparkPoints([1, 3], { width: 100, height: 20 }))
    expect(pts[0][0]).toBe(0)
    expect(pts[1][0]).toBe(100)
    expect(pts[1][1]).toBeLessThan(pts[0][1])
  })
  it('keeps the minimum above the baseline when zero based', () => {
    const pts = parse(sparkPoints([10, 20], { width: 100, height: 20, zeroBased: true }))
    expect(pts[0][1]).toBeLessThan(20)
    expect(pts[1][1]).toBe(0)
  })
})
