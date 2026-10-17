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

  // The rendered HTML is the source of truth for what search engines see (title, meta
  // description, h1 and img counts). The WordPress API only fills in what the HTML lacks.
  const [html, wp] = await Promise.all([
    scrapeHtml(baseUrl),
    tryWpApi(baseUrl, wpAppPassword ?? undefined),
  ])

  if (html) return { ...html, description: html.description ?? wp?.description ?? null, title: html.title ?? wp?.title ?? null }
  return wp ?? { title: null, description: null, h1Count: 0, imgNoAlt: 0 }
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

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' }

function decodeEntities(text: string | null): string | null {
  if (text == null) return null
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? m
  })
}

async function scrapeHtml(url: string): Promise<SeoResult | null> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const html = await res.text()

    const title = decodeEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null)

    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    const description = decodeEntities(descMatch?.[1]?.trim() ?? null)

    const h1Matches = html.match(/<h1[^>]*>/gi)
    const h1Count = h1Matches?.length ?? 0

    const imgTags = html.match(/<img[^>]*>/gi) ?? []
    let imgNoAlt = 0
    for (const img of imgTags) {
      if (!/alt\s*=/i.test(img)) imgNoAlt++
    }

    return { title, description, h1Count, imgNoAlt }
  } catch {
    return null
  }
}
