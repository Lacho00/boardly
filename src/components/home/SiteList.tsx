import type { HomeSite } from '@/lib/types'
import CompactSiteRow from './CompactSiteRow'
import SiteRow from './SiteRow'
import { COMPACT_AFTER } from './layout'

/** Full rows up to COMPACT_AFTER sites, compact rows after that. Order comes from the query (worst first). */
export default function SiteList({ sites, now }: { sites: HomeSite[]; now: Date }) {
  if (sites.length === 0) return <p className="py-20 text-center text-dim">No sites yet</p>
  return (
    <div>
      {sites.slice(0, COMPACT_AFTER).map(site => <SiteRow key={site.id} site={site} now={now} />)}
      {sites.slice(COMPACT_AFTER).map(site => <CompactSiteRow key={site.id} site={site} />)}
    </div>
  )
}
