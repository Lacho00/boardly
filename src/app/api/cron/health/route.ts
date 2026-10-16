import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkWordPressHealth } from '@/lib/health-check'
import { checkSsl } from '@/lib/ssl-check'
import { checkAndAlert } from '@/lib/notifier'

export const maxDuration = 60

export async function GET() {
  const sites = await prisma.site.findMany({ where: { active: true } })

  const results = await Promise.allSettled(
    sites.map(async (site) => {
      const [health, ssl] = await Promise.allSettled([
        checkWordPressHealth(site.url),
        checkSsl(site.url),
      ])

      if (health.status === 'fulfilled') {
        await prisma.healthCheck.create({
          data: {
            siteId: site.id,
            status: health.value.status,
            wpVersion: health.value.wpVersion,
            plugins: health.value.pluginsDetected,
            responseTime: health.value.responseTimeMs,
            checkedAt: new Date(),
          },
        })
      }

      if (ssl.status === 'fulfilled') {
        await prisma.sslCheck.create({
          data: {
            siteId: site.id,
            valid: ssl.value.valid,
            expiresAt: ssl.value.expiresAt,
            daysRemaining: ssl.value.daysRemaining,
            issuer: ssl.value.issuer,
            checkedAt: new Date(),
          },
        })
      }
    })
  )

  await checkAndAlert()

  return NextResponse.json({
    ok: true,
    checked: sites.length,
    errors: results.filter(r => r.status === 'rejected').length,
  })
}
