import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const config = await prisma.config.findUnique({ where: { id: 'global' } })
  if (!config?.slackWebhook) {
    return NextResponse.json({ ok: false, error: 'No webhook configured. Go to /settings first.' }, { status: 400 })
  }

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🧪 Test alert' } },
    { type: 'section', text: { type: 'mrkdwn', text: 'If you see this, Dashboard notifications are working correctly.' } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `Sent on ${new Date().toLocaleString('en-US')}` }] },
  ]

  try {
    const res = await fetch(config.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Webhook responded with ${res.status}` }, { status: 500 })
    }
    return NextResponse.json({ ok: true, message: 'Test alert sent to Slack' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}