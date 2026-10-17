'use client'

import { useState } from 'react'
import { THEME_COOKIE, type Theme } from '@/lib/theme'

const ONE_YEAR = 60 * 60 * 24 * 365

export default function ThemeToggle({ initial }: { initial: Theme | null }) {
  const [theme, setTheme] = useState<Theme | null>(initial)

  function toggle() {
    const prefersLight =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    const current: Theme = theme ?? (prefersLight ? 'light' : 'dark')
    const next: Theme = current === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.cookie = `${THEME_COOKIE}=${next}; max-age=${ONE_YEAR}; path=/; SameSite=Lax`
    setTheme(next)
  }

  const label = theme === null ? 'Switch theme' : `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded border border-line text-dim hover:text-ink"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  )
}
