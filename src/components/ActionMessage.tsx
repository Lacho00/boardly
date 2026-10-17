import type { ActionState } from '@/lib/types'

export function ActionMessage({ state, className = 'text-sm' }: { state: ActionState; className?: string }) {
  if (!state?.message) return null
  return (
    <span role={state.ok ? 'status' : 'alert'} className={`${className} ${state.ok ? 'text-green-400' : 'text-red-400'}`}>
      {state.message}
    </span>
  )
}
