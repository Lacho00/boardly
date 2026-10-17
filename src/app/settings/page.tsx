'use client'

import { useEffect, useState } from 'react'
import { readJson, writeError } from '@/lib/api-client'
import Link from 'next/link'
import { ActionMessage } from '@/components/ActionMessage'

export default function SettingsPage() {
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
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <header className="border-b border-zinc-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-blue-400 hover:underline text-sm">← Dashboard</Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <form onSubmit={save} className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slack / Discord Webhook URL</label>
            <input
              type="url"
              value={webhook}
              onChange={e => setWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">
              You will receive alerts when a site stops responding or its SSL certificate is about to expire.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm">Save</button>
            {saved && <span className="text-green-400 text-sm">✓ Saved</span>}
            <ActionMessage state={error ? { ok: false, message: error } : null} />
          </div>
        </form>
      </main>
    </div>
  )
}
