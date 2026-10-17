import { AppHeader } from '@/components/AppHeader'
import { SettingsView } from './SettingsView'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return <SettingsView header={<AppHeader active="settings" />} />
}
