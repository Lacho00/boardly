import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrendChart } from './TrendChart'
import { LineChart } from './LineChart'

type Row = { checkedAt: string; score: number | null }
const rows: Row[] = [
  { checkedAt: '2026-01-01T00:00:00Z', score: 50 },
  { checkedAt: '2026-01-02T00:00:00Z', score: 80 },
]

describe('TrendChart', () => {
  it('renders the title and bars with the given colour', () => {
    const { container } = render(<TrendChart title="Performance Score" data={rows} map={d => d.score} color="var(--ok)" />)
    expect(screen.getByText('Performance Score')).toBeInTheDocument()
    const bar = container.querySelector('[title]') as HTMLElement
    expect(bar.style.background || bar.getAttribute('style')).toContain('var(--ok)')
  })

  it('shows an empty state without enough data', () => {
    render(<TrendChart title="Performance Score" data={[]} map={d => (d as Row).score} color="var(--ok)" />)
    expect(screen.getByText(/at least 2 data points/i)).toBeInTheDocument()
  })

  it('uses token classes and no literal greys', () => {
    const { container } = render(<TrendChart title="T" data={rows} map={d => d.score} color="var(--ok)" />)
    expect(container.innerHTML).toContain('border-line')
    expect(container.innerHTML).not.toMatch(/#3f3f46|#71717a|zinc/)
  })
})

describe('LineChart tokens', () => {
  it('uses token classes for grid, labels and no literal greys', () => {
    globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
    const t = Date.UTC(2026, 0, 1)
    const { container } = render(
      <LineChart title="LCP" series={[{ key: 'a', label: 'LCP', color: 'var(--ok)', points: [{ t, v: 1 }, { t: t + 86400000, v: 2 }] }]} thresholds={{ good: 2.5, poor: 4 }} />,
    )
    const html = container.innerHTML
    expect(html).toContain('stroke-line')
    expect(html).toContain('fill-dim')
    expect(html).not.toMatch(/#3f3f46|#71717a|#a1a1aa|#27272a|zinc/)
    expect(html).toContain('var(--warn)')
  })
})
