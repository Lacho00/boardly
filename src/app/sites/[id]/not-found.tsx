import Link from 'next/link'
import { MessageCard, actionClass } from '@/components/MessageCard'

export default function SiteNotFound() {
  return (
    <MessageCard title="Site not found" message="This site does not exist or was deleted.">
      <Link href="/" className={actionClass}>Back to dashboard</Link>
    </MessageCard>
  )
}
