import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export interface LocalLighthouseResult {
  performance: number | null
  accessibility: number | null
  seo: number | null
  bestPractices: number | null
  lcp: number | null
  cls: number | null
  ttfb: number | null
}

export async function runLocalLighthouse(url: string): Promise<LocalLighthouseResult> {
  try {
    const lighthouseBin = `${process.cwd()}/node_modules/.bin/lighthouse`

    // execFile with an argument array: the URL never reaches a shell.
    const { stdout: out } = await execFileAsync(
      lighthouseBin,
      [
        url,
        '--chrome-flags=--headless --no-sandbox --disable-gpu',
        '--output=json',
        '--quiet',
        '--only-categories=performance,accessibility,seo,best-practices',
      ],
      { encoding: 'utf-8', timeout: 120000, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, CHROME_PATH: '/usr/bin/chromium' } }
    )

    const r = JSON.parse(out)
    if (!r?.categories) {
      return { performance: null, accessibility: null, seo: null, bestPractices: null, lcp: null, cls: null, ttfb: null }
    }

    const getScore = (cat: string) => {
      const c = r.categories[cat]
      return c?.score != null ? Math.round(c.score * 100) : null
    }

    const getAudit = (id: string) => r.audits?.[id]?.numericValue ?? null

    return {
      performance: getScore('performance'),
      accessibility: getScore('accessibility'),
      seo: getScore('seo'),
      bestPractices: getScore('best-practices'),
      lcp: getAudit('largest-contentful-paint'),
      cls: getAudit('cumulative-layout-shift'),
      ttfb: getAudit('server-response-time'),
    }
  } catch (e) {
    console.error('Local Lighthouse failed:', e)
    return { performance: null, accessibility: null, seo: null, bestPractices: null, lcp: null, cls: null, ttfb: null }
  }
}
