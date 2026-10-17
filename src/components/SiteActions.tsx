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
      <a href={`/api/report-preview/${siteId}`} target="_blank" rel="noopener noreferrer" className="rounded-[3px] border border-line px-3 py-2 text-sm text-dim hover:text-ink whitespace-nowrap">PDF</a>
      <form action={collect}>
        <SubmitButton pendingLabel="Collecting…" className="rounded-[3px] border border-ok px-4 py-2 text-sm text-ok hover:bg-ok/10 whitespace-nowrap">Collect now</SubmitButton>
      </form>
      <ActionMessage state={collectState} />
      <form
        action={remove}
        onSubmit={e => { if (!confirm('Delete this site and all its data?')) e.preventDefault() }}
      >
        <SubmitButton pendingLabel="Deleting…" className="rounded-[3px] border border-crit px-4 py-2 text-sm text-crit hover:bg-crit/10 whitespace-nowrap">Delete</SubmitButton>
      </form>
      <ActionMessage state={deleteState} />
    </>
  )
}
