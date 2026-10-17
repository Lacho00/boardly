import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ThemeToggle from './ThemeToggle'

afterEach(() => {
  delete document.documentElement.dataset.theme
  document.cookie = 'boardly-theme=; max-age=0; path=/'
  vi.unstubAllGlobals()
})

describe('ThemeToggle', () => {
  it('switches dark to light and persists the cookie', () => {
    render(<ThemeToggle initial="dark" />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.cookie).toContain('boardly-theme=light')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeTruthy()
  })

  it('without a saved theme, flips the system scheme', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('light'), media: q }))
    render(<ThemeToggle initial={null} />)
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.cookie).toContain('boardly-theme=dark')
  })
})
