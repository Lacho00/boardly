// Run: node scripts/run-lighthouse.mjs <siteId>
// Or from npm: npm run lighthouse <siteId>
import { PrismaClient } from '@prisma/client'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'

const prisma = new PrismaClient()

async function main() {
  const siteId = process.argv[2]
  if (!siteId) {
    console.error('Usage: node scripts/run-lighthouse.mjs <siteId>')
    process.exit(1)
  }

  const site = await prisma.site.findUnique({ where: { id: siteId } })
  if (!site) {
    console.error(`Site ${siteId} not found`)
    process.exit(1)
  }

  console.log(`Running Lighthouse for ${site.name} (${site.url})...`)

  const chrome = await launch({
    chromePath: '/usr/bin/chromium',
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })

  let result
  try {
    result = await lighthouse(site.url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
    })
  } finally {
    await chrome.kill()
  }

  const r = result?.lhr
  if (!r?.categories) {
    console.error('Lighthouse failed to produce results')
    await prisma.$disconnect()
    process.exit(1)
  }

  const getScore = (cat) => {
    const c = r.categories[cat]
    return c?.score != null ? Math.round(c.score * 100) : null
  }
  const getAudit = (id) => r.audits?.[id]?.numericValue ?? null

  const now = new Date()

  await prisma.performanceSnapshot.create({
    data: {
      siteId: site.id,
      lcp: getAudit('largest-contentful-paint') ? getAudit('largest-contentful-paint') / 1000 : null,
      cls: getAudit('cumulative-layout-shift'),
      ttfb: getAudit('server-response-time') ? getAudit('server-response-time') / 1000 : null,
      score: getScore('performance'),
      bestPractices: getScore('best-practices'),
      checkedAt: now,
    },
  })

  await prisma.accessibilityScore.create({
    data: { siteId: site.id, score: getScore('accessibility'), checkedAt: now },
  })

  await prisma.seoAudit.create({
    data: { siteId: site.id, score: getScore('seo'), checkedAt: now },
  })

  console.log(`✓ Done — Performance: ${getScore('performance')}, Accessibility: ${getScore('accessibility')}, SEO: ${getScore('seo')}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
