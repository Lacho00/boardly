import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf8')

/** Body of the first rule whose selector line matches, as a name -> value map. */
function vars(selector: string): Record<string, string> {
  const start = css.indexOf(selector)
  if (start === -1) throw new Error(`selector not found: ${selector}`)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  const out: Record<string, string> = {}
  for (const m of css.slice(open + 1, close).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim()
  }
  return out
}

const themes = {
  dark: vars(':root {'),
  light: vars(':root[data-theme="light"]'),
}
const lightMedia = vars(':root:not([data-theme])')

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })
  it('is 1 for identical colours', () => {
    expect(contrastRatio('#7cffb2', '#7cffb2')).toBeCloseTo(1, 5)
  })
})

describe('light theme blocks', () => {
  it('prefers-color-scheme block matches the data-theme block', () => {
    expect(lightMedia).toEqual(themes.light)
  })
})

describe.each(Object.entries(themes))('%s theme text contrast', (_name, t) => {
  for (const surface of ['bg', 'panel']) {
    for (const fg of ['ink', 'dim', 'ok', 'warn', 'crit']) {
      it(`${fg} on ${surface} is at least 4.5`, () => {
        expect(contrastRatio(t[fg], t[surface])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
