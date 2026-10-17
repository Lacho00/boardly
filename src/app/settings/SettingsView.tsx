'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { readJson, writeError } from '@/lib/api-client'
import Link from 'next/link'
import { ActionMessage } from '@/components/ActionMessage'

export function SettingsView({ header }: { header: ReactNode }) {
  const [webhook, setWebhook] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/config').then(r => readJson<{ slackWebhook?: string }>(r)).then(d => setWebhook(d?.slackWebhook ?? ''))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slackWebhook: webhook }),
    })
    const message = await writeError(res)
    setError(message)
    if (message) return
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {header}
      <div className="border-b border-line px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="py-2 text-sm text-dim hover:text-ink"><span aria-hidden="true">←</span> Dashboard</Link>
          <h1 className="font-display text-xl font-bold tracking-tight">Settings</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-6">
        <form onSubmit={save} className="rounded-lg border border-line bg-panel p-6 space-y-4">
          <div>
            <label htmlFor="slackWebhook" className="mb-1 block text-[10px] uppercase tracking-[0.1em] text-dim">Slack / Discord Webhook URL</label>
            <input
              id="slackWebhook"
              name="slackWebhook"
              type="url"
              autoComplete="off"
              spellCheck={false}
              value={webhook}
              onChange={e => setWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
              className="w-full rounded-[3px] border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-dim"
            />
            <p className="mt-1 text-xs text-dim">
              You will receive alerts when a site stops responding or its SSL certificate is about to expire.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-[3px] border border-ok px-4 py-2 text-sm text-ok enabled:hover:bg-ok/10">Save</button>
            {saved && <span role="status" className="text-ok text-sm">✓ Saved</span>}
            <ActionMessage state={error ? { ok: false, message: error } : null} />
          </div>
        </form>
      </main>
    </div>
  )
}
