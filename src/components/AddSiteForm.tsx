'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { writeOk } from '@/lib/api-client'

export function AddSiteForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    })
    if (!(await writeOk(res))) return
    setName(''); setUrl(''); setOpen(false); router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium">
        + Add site
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm w-40" />
      <input placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} required type="url" className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm w-60" />
      <button type="submit" className="bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded text-sm">Save</button>
      <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-200 text-sm">Cancel</button>
    </form>
  )
}
