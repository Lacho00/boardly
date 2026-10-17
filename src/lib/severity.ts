export type Severity = 'critical' | 'warning' | 'healthy' | 'unknown'

const RANK: Record<Severity, number> = { critical: 0, warning: 1, healthy: 2, unknown: 3 }

/** Lower is worse; `unknown` ranks last because it carries no signal. */
export function severityRank(s: Severity): number {
  return RANK[s]
}

/** Worst severity of the list; an empty list is `unknown`. */
export function worst(list: Severity[]): Severity {
  let result: Severity = 'unknown'
  for (const s of list) if (RANK[s] < RANK[result]) result = s
  return result
}

function healthSeverity(health: string | null | undefined): Severity {
  if (health === 'error' || health === 'critical') return 'critical'
  if (health === 'warning') return 'warning'
  if (health === 'healthy') return 'healthy'
  return 'unknown'
}

function sslSeverity(valid: boolean | null | undefined, days: number | null | undefined): Severity {
  if (valid === false) return 'critical'
  if (days == null) return 'unknown'
  if (days < 7) return 'critical'
  if (days < 30) return 'warning'
  return 'healthy'
}

/** Site severity: the worse of the latest health status and the SSL tone. */
export function siteSeverity(input: {
  health?: string | null
  sslValid?: boolean | null
  sslDays?: number | null
}): Severity {
  return worst([healthSeverity(input.health), sslSeverity(input.sslValid, input.sslDays)])
}
