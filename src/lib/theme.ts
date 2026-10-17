export const THEME_COOKIE = 'boardly-theme'

export type Theme = 'dark' | 'light'

export function parseTheme(value: string | undefined | null): Theme | null {
  return value === 'dark' || value === 'light' ? value : null
}
