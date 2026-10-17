'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { writeOk } from '@/lib/api-client'

export function SiteActions({ siteId }: { siteId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleCollect() {
    setCollecting(true)
    setMsg(null)
    try {
      const res = await fetch('/api/collect', { method: 'POST', body: JSON.stringify({ siteId }), headers: { 'Content-Type': 'application/json' } })
      if (await writeOk(res)) {
        router.refresh()
        setMsg('Data collected')
        setTimeout(() => setMsg(null), 4000)
      }
    } finally {
      setCollecting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this site and all its data?')) return
    setDeleting(true)
    const res = await fetch(`/api/sites/${siteId}`, { method: 'DELETE' })
    if (!(await writeOk(res))) { setDeleting(false); return }
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <a href={`/api/report-preview/${siteId}`} target="_blank" className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm">PDF</a>
      <button onClick={handleCollect} disabled={collecting} className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm disabled:opacity-50">
        {collecting ? 'Collecting...' : 'Collect now'}
      </button>
      {msg && <span className="text-green-400 text-sm animate-pulse">{msg}</span>}
      <button onClick={handleDelete} disabled={deleting} className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-sm disabled:opacity-50">Delete</button>
    </>
  )
}
