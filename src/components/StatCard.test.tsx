import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders label, value and sub with the display font on the value', () => {
    render(<StatCard label="LCP" value="1.20s" sub="Largest Contentful Paint" />)
    expect(screen.getByText('LCP')).toBeTruthy()
    expect(screen.getByText('Largest Contentful Paint')).toBeTruthy()
    const value = screen.getByText('1.20s')
    expect(value.className).toContain('font-display')
    expect(value.className).toContain('tabular-nums')
  })
  it('colours the value text-crit for tone bad', () => {
    render(<StatCard label="SSL" value="Invalid" tone="bad" />)
    expect(screen.getByText('Invalid').className).toContain('text-crit')
  })
  it('renders no sub paragraph when sub is missing or empty', () => {
    const { container, rerender } = render(<StatCard label="CLS" value="0.1" />)
    expect(container.querySelectorAll('p').length).toBe(2)
    rerender(<StatCard label="CLS" value="0.1" sub="" />)
    expect(container.querySelectorAll('p').length).toBe(2)
  })
})
