import { AppHeader } from '@/components/AppHeader'
import { ReportsView } from './ReportsView'

export const dynamic = 'force-dynamic'

export default function ReportsPage() {
  return <ReportsView header={<AppHeader active="reports" />} />
}
