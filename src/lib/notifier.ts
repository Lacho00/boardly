import { prisma } from '@/lib/prisma'

export async function sendAlert(siteId: string, type: string, message: string, severity: string = 'warning') {
  await prisma.alert.create({
    data: { siteId, type, message, severity },
  })

  const config = await prisma.config.findUnique({ where: { id: 'global' } })
  if (!config?.slackWebhook) return

  const site = await prisma.site.findUnique({ where: { id: siteId } })

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: `⚠️ ${severity === 'critical' ? 'CRÍTICO' : 'Alerta'}: ${site?.name}` } },
    { type: 'section', text: { type: 'mrkdwn', text: message } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `<${site?.url}|${site?.url}>` }] },
  ]

  try {
    await fetch(config.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
  } catch {
    // silently fail
  }
}

export async function checkAndAlert() {
  const sites = await prisma.site.findMany({ where: { active: true } })

  for (const site of sites) {
    const lastTwo = await prisma.healthCheck.findMany({
      where: { siteId: site.id },
      orderBy: { checkedAt: 'desc' },
      take: 2,
    })

    if (lastTwo.length < 2) continue

    const [current, previous] = lastTwo
    if (current.status === 'error' && previous.status !== 'error') {
      await sendAlert(
        site.id,
        'downtime',
        `El sitio dejó de responder. Último check: ${current.responseTime ?? '?'}ms, HTTP ${current.status}`,
        'critical'
      )
    }

    if (current.status !== 'error' && previous.status === 'error') {
      await sendAlert(
        site.id,
        'recovery',
        `El sitio volvió a responder. Estado: ${current.status}, ${current.responseTime}ms`,
        'info'
      )
    }
  }

  const sslCheck = await prisma.sslCheck.findMany({
    where: { daysRemaining: { lte: 14 } },
    orderBy: { checkedAt: 'desc' },
    distinct: ['siteId'],
  })

  for (const ssl of sslCheck) {
    const alreadyAlerted = await prisma.alert.findFirst({
      where: { siteId: ssl.siteId, type: 'ssl_expiry', createdAt: { gte: new Date(Date.now() - 86400000) } },
    })
    if (!alreadyAlerted) {
      await sendAlert(
        ssl.siteId,
        'ssl_expiry',
        `El certificado SSL expira en ${ssl.daysRemaining} días (${ssl.expiresAt}).`,
        ssl.daysRemaining! <= 3 ? 'critical' : 'warning'
      )
    }
  }
}
