export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical' | 'error'
  wpVersion: string | null
  pluginsDetected: number | null
  responseTimeMs: number | null
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<{ ok: boolean; status: number; text: string; time: number }> {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeout),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text, time: Date.now() - start }
  } catch {
    return { ok: false, status: 0, text: '', time: Date.now() - start }
  }
}

export async function checkWordPressHealth(url: string): Promise<HealthCheckResult> {
  const base = url.replace(/\/$/, '')

  const [homepage, wpJson, readme] = await Promise.all([
    fetchWithTimeout(base, 8000),
    fetchWithTimeout(`${base}/wp-json/`, 5000),
    fetchWithTimeout(`${base}/readme.html`, 5000),
  ])

  const responseTimeMs = homepage.time

  const isWp = homepage.text.includes('wp-content')
    || homepage.text.includes('wp-json')
    || homepage.text.includes('/wp-includes/')
    || wpJson.ok
    || readme.text.includes('WordPress')

  // Availability first: no response or a 5xx is downtime, whatever the site runs.
  if (homepage.status === 0 || homepage.status >= 500) {
    return { status: 'error', wpVersion: null, pluginsDetected: null, responseTimeMs }
  }

  // Site answers but WordPress markers are missing: flag it, do not call it down.
  if (!isWp) {
    return { status: 'warning', wpVersion: null, pluginsDetected: null, responseTimeMs }
  }

  let wpVersion: string | null = null
  if (wpJson.ok) {
    try {
      const data = JSON.parse(wpJson.text)
      wpVersion = data?.info?.version ?? null
    } catch {}
  }
  if (!wpVersion) {
    wpVersion = homepage.text.match(/<meta[^>]+name=["']generator["'][^>]+content=["']WordPress\s+([\d.]+)/i)?.[1]
      ?? readme.text.match(/WordPress\s+(version\s+)?([\d.]+)/i)?.[2]
      ?? null
  }

  let pluginsDetected: number | null = null
  if (wpJson.ok) {
    try {
      const data = JSON.parse(wpJson.text)
      if (data?.info?.plugins?.active != null) {
        pluginsDetected = data.info.plugins.active
      }
    } catch {}
  }

  const status: 'healthy' | 'warning' | 'critical' | 'error' =
    !homepage.ok ? 'warning'
    : homepage.time > 3000 ? 'warning'
    : 'healthy'

  return { status, wpVersion, pluginsDetected, responseTimeMs }
}
