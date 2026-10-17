import { AppHeader } from '@/components/AppHeader'
import { AlertsView } from './AlertsView'

export const dynamic = 'force-dynamic'

export default function AlertsPage() {
  return <AlertsView header={<AppHeader active="alerts" />} />
}
