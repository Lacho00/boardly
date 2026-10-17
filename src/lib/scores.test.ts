import { describe, expect, it } from 'vitest'
import { lcpTone, responseTone, scoreTone, sslTone } from './scores'

describe('scores', () => {
  it('bands a Lighthouse score', () => {
    expect([scoreTone(95), scoreTone(90), scoreTone(89), scoreTone(50), scoreTone(49)]).toEqual(['good', 'good', 'warn', 'warn', 'bad'])
  })
  it('bands LCP seconds', () => {
    expect([lcpTone(1.2), lcpTone(2.5), lcpTone(3), lcpTone(4), lcpTone(4.1)]).toEqual(['good', 'good', 'warn', 'warn', 'bad'])
  })
  it('bands response time', () => {
    expect([responseTone(200), responseTone(800), responseTone(1000), responseTone(1800), responseTone(2500)]).toEqual(['good', 'good', 'warn', 'warn', 'bad'])
  })
  it('bands SSL days', () => {
    expect([sslTone(60), sslTone(30), sslTone(29), sslTone(7), sslTone(6)]).toEqual(['good', 'good', 'warn', 'warn', 'bad'])
  })
  it('returns none for missing values', () => {
    expect([scoreTone(null), lcpTone(undefined), responseTone(null), sslTone(undefined)]).toEqual(['none', 'none', 'none', 'none'])
  })
})
