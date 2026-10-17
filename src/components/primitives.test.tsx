import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScoreRing from './ScoreRing'
import UptimeStrip from './UptimeStrip'
import Sparkline from './Sparkline'
import SeverityTag from './SeverityTag'
import type { SlotState } from '@/lib/uptime'

describe('ScoreRing', () => {
  it('shows the value and an aria-label', () => {
    render(<ScoreRing value={96} severity="healthy" />)
    const ring = screen.getByRole('img')
    expect(ring.getAttribute('aria-label')).toBe('Performance 96 of 100')
    expect(ring.textContent).toBe('96')
  })
  it('shows a dash for null', () => {
    render(<ScoreRing value={null} severity="unknown" />)
    expect(screen.getByRole('img').textContent).toBe('-')
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Performance no data')
  })
})

describe('UptimeStrip', () => {
  it('renders one item per slot and counts incidents', () => {
    const slots: SlotState[] = Array.from({ length: 48 }, () => 'ok')
    slots[3] = 'crit'
    slots[10] = 'warn'
    const { container } = render(<UptimeStrip slots={slots} />)
    expect(container.querySelectorAll('[data-slot]').length).toBe(48)
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/2 incidents/)
    expect(screen.getByText('-24 h')).toBeTruthy()
    expect(screen.getByText('-12 h')).toBeTruthy()
    expect(screen.getByText('now')).toBeTruthy()
  })
  it('labels no data when every slot is none', () => {
    render(<UptimeStrip slots={Array.from({ length: 48 }, () => 'none' as const)} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/no data/i)
  })
})

describe('SeverityTag', () => {
  it.each([
    ['critical', 'Critical'],
    ['warning', 'Warning'],
    ['healthy', 'Healthy'],
    ['unknown', 'No data'],
  ] as const)('%s reads %s', (severity, text) => {
    render(<SeverityTag severity={severity} />)
    expect(screen.getByText(text)).toBeTruthy()
  })
})

describe('Sparkline', () => {
  it('renders a polyline for several values', () => {
    const { container } = render(<Sparkline values={[1, 2, 3]} severity="healthy" />)
    expect(container.querySelector('polyline')).not.toBeNull()
  })
  it('renders no polyline for one value', () => {
    const { container } = render(<Sparkline values={[5]} severity="healthy" />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('polyline')).toBeNull()
  })
})
