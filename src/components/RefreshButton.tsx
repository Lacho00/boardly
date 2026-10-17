'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function RefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => router.refresh())} disabled={pending} className="py-1 text-xs text-dim hover:text-ink disabled:opacity-50">
      ↻ Refresh
    </button>
  )
}
