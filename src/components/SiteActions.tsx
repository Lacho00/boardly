'use client'

import { useActionState } from 'react'
import { collectSiteAction, deleteSiteAction } from '@/app/actions'
import { ActionMessage } from '@/components/ActionMessage'
import { SubmitButton } from '@/components/SubmitButton'

// Next runs a client's Server Actions one at a time, so a slow collection
// (local Lighthouse takes ~30s) holds back any other action started meanwhile.
export function SiteActions({ siteId }: { siteId: string }) {
  const [collectState, collect] = useActionState(collectSiteAction.bind(null, siteId), null)
  const [deleteState, remove] = useActionState(deleteSiteAction.bind(null, siteId), null)

  return (
    <>
      <a href={`/api/report-preview/${siteId}`} target="_blank" rel="noopener noreferrer" className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-sm">PDF</a>
      <form action={collect}>
        <SubmitButton pendingLabel="Collecting…" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-sm">Collect now</SubmitButton>
      </form>
      <ActionMessage state={collectState} />
      <form
        action={remove}
        onSubmit={e => { if (!confirm('Delete this site and all its data?')) e.preventDefault() }}
      >
        <SubmitButton pendingLabel="Deleting…" className="bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-sm">Delete</SubmitButton>
      </form>
      <ActionMessage state={deleteState} />
    </>
  )
}
