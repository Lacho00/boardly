import { describe, expect, it } from 'vitest'
import { bucketChecks, uptimePercent } from './uptime'

const now = new Date('2026-10-17T12:00:00Z')
const ago = (h: number) => new Date(now.getTime() - h * 3_600_000)

describe('bucketChecks', () => {
  it('gives 48 empty slots without checks', () => {
    const slots = bucketChecks([], now)
    expect(slots).toHaveLength(48)
    expect(slots.every(s => s === 'none')).toBe(true)
  })
  it('takes the worst status of a slot', () => {
    const slots = bucketChecks(
      [
        { status: 'warning', checkedAt: ago(1) },
        { status: 'error', checkedAt: ago(1) },
      ],
      now,
    )
    expect(slots.filter(s => s === 'crit')).toHaveLength(1)
    expect(slots).not.toContain('warn')
  })
  it('maps healthy, warning and critical', () => {
    const slots = bucketChecks(
      [
        { status: 'healthy', checkedAt: ago(20) },
        { status: 'warning', checkedAt: ago(10) },
        { status: 'critical', checkedAt: ago(5) },
      ],
      now,
    )
    expect(slots).toContain('ok')
    expect(slots).toContain('warn')
    expect(slots).toContain('crit')
  })
  it('ignores checks outside the window', () => {
    const slots = bucketChecks([{ status: 'error', checkedAt: ago(25) }], now)
    expect(slots.every(s => s === 'none')).toBe(true)
  })
  it('puts a check made at now in the last slot', () => {
    const slots = bucketChecks([{ status: 'healthy', checkedAt: now }], now)
    expect(slots[47]).toBe('ok')
  })
})

describe('uptimePercent', () => {
  it('is null without checks', () => {
    expect(uptimePercent({ total: 0, down: 0 })).toBeNull()
  })
  it('computes the share of checks that were up', () => {
    expect(uptimePercent({ total: 200, down: 2 })).toBe(99)
  })
})
