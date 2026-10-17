import { describe, expect, it } from 'vitest'
import { parseTheme, THEME_COOKIE } from './theme'

describe('parseTheme', () => {
  it('accepts dark and light', () => {
    expect(parseTheme('dark')).toBe('dark')
    expect(parseTheme('light')).toBe('light')
  })
  it('returns null for anything else', () => {
    for (const v of [undefined, null, '', 'blue', 'DARK']) expect(parseTheme(v)).toBeNull()
  })
  it('names the cookie', () => {
    expect(THEME_COOKIE).toBe('boardly-theme')
  })
})
