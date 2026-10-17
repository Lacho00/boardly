export type SlotState = 'ok' | 'warn' | 'crit' | 'none'

const RANK: Record<SlotState, number> = { none: 0, ok: 1, warn: 2, crit: 3 }

function stateOf(status: string): SlotState {
  if (status === 'error' || status === 'critical') return 'crit'
  if (status === 'warning') return 'warn'
  if (status === 'healthy') return 'ok'
  return 'none'
}

/** Worst status per slot over the window ending at `now`; checks outside it are ignored. */
export function bucketChecks(
  checks: { status: string; checkedAt: Date }[],
  now: Date,
  slots = 48,
  windowMs = 86_400_000,
): SlotState[] {
  const result: SlotState[] = Array.from({ length: slots }, () => 'none')
  const start = now.getTime() - windowMs
  const slotMs = windowMs / slots
  for (const c of checks) {
    const t = c.checkedAt.getTime()
    if (t < start || t > now.getTime()) continue
    const i = Math.min(slots - 1, Math.floor((t - start) / slotMs))
    const s = stateOf(c.status)
    if (RANK[s] > RANK[result[i]]) result[i] = s
  }
  return result
}

/** Share of checks that were up, to two decimals; null without checks. */
export function uptimePercent(counts: { total: number; down: number }): number | null {
  if (counts.total <= 0) return null
  return Math.round(((counts.total - counts.down) / counts.total) * 10_000) / 100
}
