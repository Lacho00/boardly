import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const config = await prisma.config.findUnique({ where: { id: 'global' } })
  if (!config?.slackWebhook) {
    return NextResponse.json({ ok: false, error: 'No hay webhook configurado. Ve a /settings primero.' }, { status: 400 })
  }

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🧪 Alerta de prueba' } },
    { type: 'section', text: { type: 'mrkdwn', text: 'Si ves esto, las notificaciones del Dashboard funcionan correctamente.' } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `Enviado el ${new Date().toLocaleString()}` }] },
  ]

  try {
    const res = await fetch(config.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Webhook respondió ${res.status}` }, { status: 500 })
    }
    return NextResponse.json({ ok: true, message: 'Alerta de prueba enviada a Slack' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}