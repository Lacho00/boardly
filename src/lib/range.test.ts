import { describe, expect, it } from 'vitest'
import { DEFAULT_RANGE, parseRange } from './range'

describe('parseRange', () => {
  it('accepts known values', () => {
    expect(parseRange('7')).toBe(7)
    expect(parseRange('30')).toBe(30)
  })
  it('takes the first of an array', () => {
    expect(parseRange(['7', '30'])).toBe(7)
  })
  it('falls back to the default', () => {
    expect(parseRange(undefined)).toBe(DEFAULT_RANGE)
    expect(parseRange('14')).toBe(DEFAULT_RANGE)
    expect(parseRange('abc')).toBe(DEFAULT_RANGE)
  })
})
