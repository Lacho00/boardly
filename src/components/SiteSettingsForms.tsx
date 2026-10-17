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
        <p className="text-xs text-dim">Runs Lighthouse with a local Chromium. Useful for localhost or internal networks. Slower (~30s per site) but needs no internet.</p>
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
          className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-ok' : 'bg-line'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${on ? 'bg-bg' : 'bg-ink'} ${on ? 'translate-x-6' : ''}`} />
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
        aria-label="WordPress application password"
        autoComplete="off"
        spellCheck={false}
        placeholder={currentPassword ? '•••••••• (leave empty to clear)' : 'user:app_password'}
        className="bg-bg border border-line rounded-[3px] px-3 py-1.5 text-sm text-ink placeholder:text-dim focus:border-ok flex-1 min-w-0"
      />
      <SubmitButton pendingLabel="Saving…" className="rounded-[3px] border border-ok text-ok enabled:hover:bg-ok/10 px-3 py-1.5 text-sm">Save</SubmitButton>
      <ActionMessage state={state} />
    </form>
  )
}
