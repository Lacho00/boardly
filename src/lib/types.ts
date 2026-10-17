import type { Prisma } from '@prisma/client'

const latest = (take: number) => ({ orderBy: { checkedAt: 'desc' as const }, take })

/** Latest row of each check: enough for the home cards. */
export const siteListInclude = {
  healthChecks: latest(1),
  performanceSnapshots: latest(1),
  seoAudits: latest(1),
  accessibilityScores: latest(1),
  sslChecks: latest(1),
} satisfies Prisma.SiteInclude

/** History of each check: the site detail page and its charts. */
export const siteDetailInclude = {
  healthChecks: latest(30),
  performanceSnapshots: latest(30),
  seoAudits: latest(30),
  accessibilityScores: latest(30),
  sslChecks: latest(10),
} satisfies Prisma.SiteInclude

/** What `JSON.stringify` does to a type: Date becomes string. */
export type Jsonify<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Jsonify<U>[]
    : T extends object
      ? { [K in keyof T]: Jsonify<T[K]> }
      : T

type WithoutSecret<T extends { wpAppPassword: string | null }> = Omit<T, 'wpAppPassword'> & {
  hasWpAppPassword: boolean
}

type SiteListRow = Prisma.SiteGetPayload<{ include: typeof siteListInclude }>
type SiteDetailRow = Prisma.SiteGetPayload<{ include: typeof siteDetailInclude }>

/** Site as the API sends it: no password, dates as strings. */
export type SiteSummary = Jsonify<WithoutSecret<SiteListRow>>
export type SiteDetail = Jsonify<WithoutSecret<SiteDetailRow>>
export type Snapshot = SiteDetail['performanceSnapshots'][number]

/** Same shapes with Date kept: what server components read straight from Prisma. */
export type SiteSummaryData = WithoutSecret<SiteListRow>
export type SiteDetailData = WithoutSecret<SiteDetailRow>
