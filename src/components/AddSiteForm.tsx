'use client'

import { useActionState, useState } from 'react'
import { createSiteAction } from '@/app/actions'
import { ActionMessage } from '@/components/ActionMessage'
import { SubmitButton } from '@/components/SubmitButton'
import type { ActionState } from '@/lib/types'

export function AddSiteForm() {
  const [state, formAction] = useActionState(createSiteAction, null)
  // `openedFor` is the action state when the form was opened. A newer successful
  // state closes the form, so no effect or render-phase setState is needed.
  const [openedFor, setOpenedFor] = useState<ActionState | undefined>(undefined)
  const open = openedFor !== undefined && !(state?.ok && state !== openedFor)

  if (!open) {
    return (
      <button onClick={() => setOpenedFor(state)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium">
        + Add site
      </button>
    )
  }

  return (
    <form action={formAction} className="flex flex-wrap gap-2 items-center">
      <input name="name" aria-label="Site name" autoComplete="off" placeholder="Name" defaultValue={state?.fields?.name} required className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm w-40" />
      <input name="url" aria-label="Site URL" autoComplete="off" spellCheck={false} placeholder="https://example.com" defaultValue={state?.fields?.url} required type="url" className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm w-60" />
      <SubmitButton pendingLabel="Saving…" className="bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded text-sm">Save</SubmitButton>
      <button type="button" onClick={() => setOpenedFor(undefined)} className="text-zinc-400 hover:text-zinc-200 text-sm">Cancel</button>
      {!state?.ok && <ActionMessage state={state} />}
    </form>
  )
}
