'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function RefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => router.refresh())} disabled={pending} className="text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-50">
      ↻ Refresh
    </button>
  )
}
