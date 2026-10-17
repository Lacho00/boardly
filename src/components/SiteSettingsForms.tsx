'use client'

import { useState } from 'react'
import { writeOk } from '@/lib/api-client'

export function LocalLighthouseToggle({ siteId, enabled }: { siteId: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled)
  const [saved, setSaved] = useState(false)

  async function toggle() {
    const next = !on
    const res = await fetch(`/api/sites/${siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useLocalLighthouse: next }),
    })
    if (!(await writeOk(res))) return
    setOn(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Use local Lighthouse</p>
        <p className="text-xs text-zinc-400">Runs Lighthouse with a local Chromium. Useful for localhost or internal networks. Slower (~30s per site) but needs no internet.</p>
      </div>
      <div className="flex items-center gap-2">
        {saved && <span className="text-green-400 text-xs">✓</span>}
        <button
          onClick={toggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-zinc-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-6' : ''}`} />
        </button>
      </div>
    </div>
  )
}

export function WpPasswordForm({ siteId, currentPassword }: { siteId: string; currentPassword: boolean }) {
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/sites/${siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wpAppPassword: password || null }),
    })
    if (!(await writeOk(res))) return
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={savePassword} className="flex gap-2 items-center">
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={currentPassword ? '•••••••• (leave empty to clear)' : 'user:app_password'}
        className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm flex-1"
      />
      <button type="submit" className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-sm">Save</button>
      {saved && <span className="text-green-400 text-sm">✓</span>}
    </form>
  )
}
