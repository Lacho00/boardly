import Link from 'next/link'
import { MessageCard, actionClass } from '@/components/MessageCard'

export default function NotFound() {
  return (
    <MessageCard title="Page not found" message="This page does not exist or was removed.">
      <Link href="/" className={actionClass}>Back to dashboard</Link>
    </MessageCard>
  )
}
