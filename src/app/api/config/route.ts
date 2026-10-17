import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isSlackWebhook, maskSecret } from '@/lib/security'

function publicConfig(config: { slackWebhook: string | null } | null) {
  return { slackWebhook: maskSecret(config?.slackWebhook), hasSlackWebhook: !!config?.slackWebhook }
}

export async function GET() {
  const config = await prisma.config.findUnique({ where: { id: 'global' } })
  return NextResponse.json(publicConfig(config))
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })

  const current = await prisma.config.findUnique({ where: { id: 'global' } })
  const incoming = typeof body.slackWebhook === 'string' ? body.slackWebhook.trim() : ''

  // The GET response masks the webhook; saving the masked value back keeps the stored one.
  let slackWebhook: string | null = incoming || null
  if (incoming && incoming === maskSecret(current?.slackWebhook)) {
    slackWebhook = current?.slackWebhook ?? null
  } else if (incoming && !isSlackWebhook(incoming)) {
    return NextResponse.json({ error: 'Webhook must start with https://hooks.slack.com/' }, { status: 400 })
  }

  const config = await prisma.config.upsert({
    where: { id: 'global' },
    update: { slackWebhook },
    create: { id: 'global', slackWebhook },
  })
  return NextResponse.json(publicConfig(config))
}
