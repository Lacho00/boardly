const PSI_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

export interface PageSpeedResult {
  performance: number | null
  accessibility: number | null
  seo: number | null
  bestPractices: number | null
  lcp: number | null
  cls: number | null
  ttfb: number | null
}

export async function fetchPageSpeed(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedResult> {
  const key = process.env.GOOGLE_PSI_API_KEY
  if (!key) throw new Error('Missing GOOGLE_PSI_API_KEY')

  const params = new URLSearchParams({ url, key, strategy })
  for (const cat of ['PERFORMANCE', 'ACCESSIBILITY', 'SEO', 'BEST_PRACTICES']) {
    params.append('category', cat)
  }

  const res = await fetch(`${PSI_URL}?${params}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PageSpeed API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const lighthouse = data.lighthouseResult

  return {
    performance: lighthouse?.categories?.performance?.score != null
      ? Math.round(lighthouse.categories.performance.score * 100) : null,
    accessibility: lighthouse?.categories?.accessibility?.score != null
      ? Math.round(lighthouse.categories.accessibility.score * 100) : null,
    seo: lighthouse?.categories?.seo?.score != null
      ? Math.round(lighthouse.categories.seo.score * 100) : null,
    bestPractices: lighthouse?.categories?.['best-practices']?.score != null
      ? Math.round(lighthouse.categories['best-practices'].score * 100) : null,
    lcp: lighthouse?.audits?.['largest-contentful-paint']?.numericValue ?? null,
    cls: lighthouse?.audits?.['cumulative-layout-shift']?.numericValue ?? null,
    ttfb: lighthouse?.audits?.['server-response-time']?.numericValue ?? null,
  }
}
