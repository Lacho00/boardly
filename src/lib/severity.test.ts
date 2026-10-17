import { describe, expect, it } from 'vitest'
import { severityRank, siteSeverity, worst } from './severity'

describe('siteSeverity', () => {
  it('healthy with a long-lived certificate is healthy', () => {
    expect(siteSeverity({ health: 'healthy', sslValid: true, sslDays: 90 })).toBe('healthy')
  })
  it('certificate under 30 days is warning', () => {
    expect(siteSeverity({ health: 'healthy', sslValid: true, sslDays: 29 })).toBe('warning')
  })
  it('certificate under 7 days is critical', () => {
    expect(siteSeverity({ health: 'healthy', sslValid: true, sslDays: 6 })).toBe('critical')
  })
  it('thresholds are exclusive at 7 and 30 days', () => {
    expect(siteSeverity({ health: 'healthy', sslDays: 7 })).toBe('warning')
    expect(siteSeverity({ health: 'healthy', sslDays: 30 })).toBe('healthy')
  })
  it('invalid certificate is critical', () => {
    expect(siteSeverity({ health: 'healthy', sslValid: false })).toBe('critical')
  })
  it('health error is critical', () => {
    expect(siteSeverity({ health: 'error' })).toBe('critical')
  })
  it('health critical is critical', () => {
    expect(siteSeverity({ health: 'critical' })).toBe('critical')
  })
  it('health warning with a long certificate is warning', () => {
    expect(siteSeverity({ health: 'warning', sslDays: 60 })).toBe('warning')
  })
  it('no input is unknown', () => {
    expect(siteSeverity({})).toBe('unknown')
    expect(siteSeverity({ health: null, sslValid: null, sslDays: null })).toBe('unknown')
  })
  it('valid certificate with null days gives no SSL signal', () => {
    expect(siteSeverity({ health: 'healthy', sslDays: null, sslValid: true })).toBe('healthy')
    expect(siteSeverity({ sslDays: null, sslValid: true })).toBe('unknown')
  })
  it('unrecognised health status gives no health signal', () => {
    expect(siteSeverity({ health: 'weird' })).toBe('unknown')
  })
})

describe('severityRank', () => {
  it('orders critical lowest', () => {
    expect(severityRank('critical')).toBeLessThan(severityRank('warning'))
    expect(severityRank('warning')).toBeLessThan(severityRank('healthy'))
    expect(severityRank('healthy')).toBeLessThan(severityRank('unknown'))
  })
})

describe('worst', () => {
  it('picks the worst', () => {
    expect(worst(['healthy', 'warning'])).toBe('warning')
    expect(worst(['healthy', 'critical', 'warning'])).toBe('critical')
  })
  it('empty list is unknown', () => {
    expect(worst([])).toBe('unknown')
  })
})
