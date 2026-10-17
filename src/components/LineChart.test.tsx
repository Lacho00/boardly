import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { LineChart } from './LineChart'
import { WEB_VITALS } from '@/lib/chart'

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const day = 86_400_000
const series = (values: (number | null)[]) => [
  { key: 'lcp', label: 'LCP', color: '#3b82f6', points: values.map((v, i) => ({ t: Date.UTC(2026, 0, 1) + i * day, v })) },
]

describe('LineChart', () => {
  it('shows an empty state with no points', () => {
    render(<LineChart title="LCP" series={series([])} />)
    expect(screen.getAllByText(/no data in this range/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('draws one dot for a single point', () => {
    const { container } = render(<LineChart title="LCP" unit="s" series={series([1.2])} />)
    expect(screen.getByRole('img')).toHaveAccessibleName(/one reading, 1.20s/)
    expect(container.querySelectorAll('svg circle')).toHaveLength(1)
  })

  it('draws a path and a data table row per point with N points', () => {
    const { container } = render(<LineChart title="LCP" unit="s" series={series([1, 2, 3])} thresholds={WEB_VITALS.lcp} />)
    expect(container.querySelector('svg path')?.getAttribute('d')).toMatch(/^M.*L.*L/)
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
    expect(screen.getByText(/Poor > 4s/)).toBeInTheDocument()
  })

  it('reads values with the arrow keys', () => {
    render(<LineChart title="LCP" unit="s" series={series([1, 2, 3])} />)
    const group = screen.getByLabelText(/arrow keys/)
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(screen.getByText(/LCP: 1.00s/)).toBeInTheDocument()
    fireEvent.keyDown(group, { key: 'End' })
    expect(screen.getByText(/LCP: 3.00s/)).toBeInTheDocument()
    fireEvent.keyDown(group, { key: 'Escape' })
    expect(screen.queryByText(/LCP: 3.00s/)).not.toBeInTheDocument()
  })
})
