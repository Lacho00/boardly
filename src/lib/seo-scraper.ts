export interface SeoResult {
  title: string | null
  description: string | null
  h1Count: number
  imgNoAlt: number
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
}

export async function scrapeSeo(url: string, wpAppPassword?: string | null): Promise<SeoResult> {
  const baseUrl = url.replace(/\/$/, '')

  if (wpAppPassword) {
    const wpResult = await tryWpApi(baseUrl, wpAppPassword)
    if (wpResult) return wpResult
  }

  const wpPublic = await tryWpApi(baseUrl)
  if (wpPublic) return wpPublic

  return scrapeHtml(baseUrl)
}

async function tryWpApi(baseUrl: string, appPassword?: string): Promise<SeoResult | null> {
  try {
    const authHeaders: Record<string, string> = {}
    if (appPassword) {
      const credentials = Buffer.from(appPassword).toString('base64')
      authHeaders['Authorization'] = `Basic ${credentials}`
    }

    const res = await fetch(`${baseUrl}/wp-json/`, {
      headers: { ...headers, ...authHeaders },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()

    const title = data?.name ?? null
    const description = data?.description ?? null

    const postsRes = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=1`, {
      headers: { ...headers, ...authHeaders },
      signal: AbortSignal.timeout(5000),
    })
    let h1Count = 0
    if (postsRes.ok) {
      const posts = await postsRes.json()
      h1Count = Array.isArray(posts) ? posts.length : 0
    }

    return { title, description, h1Count, imgNoAlt: 0 }
  } catch {
    return null
  }
}

async function scrapeHtml(url: string): Promise<SeoResult> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) })
    const html = await res.text()

    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null

    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    const description = descMatch?.[1]?.trim() ?? null

    const h1Matches = html.match(/<h1[^>]*>/gi)
    const h1Count = h1Matches?.length ?? 0

    const imgTags = html.match(/<img[^>]*>/gi) ?? []
    let imgNoAlt = 0
    for (const img of imgTags) {
      if (!/alt\s*=/i.test(img)) imgNoAlt++
    }

    return { title, description, h1Count, imgNoAlt }
  } catch {
    return { title: null, description: null, h1Count: 0, imgNoAlt: 0 }
  }
}
