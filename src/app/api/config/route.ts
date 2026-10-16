import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const config = await prisma.config.findUnique({ where: { id: 'global' } })
  return NextResponse.json(config ?? {})
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const config = await prisma.config.upsert({
    where: { id: 'global' },
    update: { slackWebhook: body.slackWebhook ?? null },
    create: { id: 'global', slackWebhook: body.slackWebhook ?? null },
  })
  return NextResponse.json(config)
}
