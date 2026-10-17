'use client'

import { useActionState, useOptimistic } from 'react'
import { saveSettingsAction } from '@/app/actions'
import { ActionMessage } from '@/components/ActionMessage'
import { SubmitButton } from '@/components/SubmitButton'

export function LocalLighthouseToggle({ siteId, enabled }: { siteId: string; enabled: boolean }) {
  const [state, formAction] = useActionState(saveSettingsAction.bind(null, siteId), null)
  const [on, setOn] = useOptimistic(enabled)

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Use local Lighthouse</p>
        <p className="text-xs text-zinc-400">Runs Lighthouse with a local Chromium. Useful for localhost or internal networks. Slower (~30s per site) but needs no internet.</p>
      </div>
      <form
        action={fd => { setOn(!on); return formAction(fd) }}
        className="flex items-center gap-2"
      >
        <ActionMessage state={state} className="text-xs" />
        <input type="hidden" name="useLocalLighthouse" value={String(!on)} />
        <button
          type="submit"
          role="switch"
          aria-checked={on}
          aria-label="Use local Lighthouse"
          className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-zinc-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-6' : ''}`} />
        </button>
      </form>
    </div>
  )
}

export function WpPasswordForm({ siteId, currentPassword }: { siteId: string; currentPassword: boolean }) {
  const [state, formAction] = useActionState(saveSettingsAction.bind(null, siteId), null)

  return (
    <form action={formAction} className="flex gap-2 items-center">
      <input
        type="password"
        name="wpAppPassword"
        placeholder={currentPassword ? '•••••••• (leave empty to clear)' : 'user:app_password'}
        className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm flex-1"
      />
      <SubmitButton pendingLabel="Saving..." className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded text-sm">Save</SubmitButton>
      <ActionMessage state={state} />
    </form>
  )
}
