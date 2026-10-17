'use client'

import { MessageCard, actionClass } from '@/components/MessageCard'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <MessageCard
      tone="error"
      title="Something went wrong"
      message={error.digest ? `Could not load this page (ref ${error.digest}).` : 'Could not load this page.'}
    >
      <button onClick={reset} className={actionClass}>Try again</button>
    </MessageCard>
  )
}
