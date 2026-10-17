import Link from 'next/link'
import ScoreRing from '@/components/ScoreRing'
import Sparkline from '@/components/Sparkline'
import SeverityTag, { severityClass } from '@/components/SeverityTag'
import UptimeStrip from '@/components/UptimeStrip'
import { lcpTone, scoreTone, sslTone, type Tone } from '@/lib/scores'
import type { Severity } from '@/lib/severity'
import type { HomeSite } from '@/lib/types'
import { bucketChecks } from '@/lib/uptime'
import { figureClass, formatResponse, formatUptime, uptimeTone } from './figures'

const EDGE: Record<Severity, string> = {
  critical: 'before:bg-crit',
  warning: 'before:bg-warn',
  healthy: 'before:bg-ok',
  unknown: 'before:bg-dim',
}

const SSL_BAR: Record<Tone, string> = { good: 'bg-ok', warn: 'bg-warn', bad: 'bg-crit', none: 'bg-dim' }

function Figure({ label, value, tone, className = '' }: { label: string; value: string; tone: Tone; className?: string }) {
  return (
    <div className={className}>
      <small className="block text-[10px] uppercase tracking-[0.1em] text-dim">{label}</small>
      <b data-figure className={`block text-base font-medium tabular-nums ${figureClass(tone)}`}>{value}</b>
    </div>
  )
}

export default function SiteRow({ site, now }: { site: HomeSite; now: Date }) {
  const h = site.healthChecks[0]
  const p = site.performanceSnapshots[0]
  const a = site.accessibilityScores[0]
  const seo = site.seoAudits[0]
  const s = site.sslChecks[0]
  const sev = site.severity
  const c = severityClass[sev]
  const slots = bucketChecks(site.recent, now)
  const response = site.recent.flatMap(r => (r.responseTime == null ? [] : [r.responseTime]))
  const sslDays = s?.daysRemaining ?? null
  const critical = sev === 'critical'

  return (
    <Link
      href={`/sites/${site.id}`}
      data-row="full"
      className={`relative mb-2.5 grid grid-cols-[60px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-lg border bg-panel py-3.5 pl-[18px] pr-4 transition-colors before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-[3px] before:rounded-r-[2px] before:content-[''] hover:border-dim sm:grid-cols-[150px_62px_minmax(0,1fr)] xl:grid-cols-[150px_62px_minmax(0,1fr)_190px] ${EDGE[sev]} ${
        critical
          ? 'border-crit/40 shadow-[0_0_0_1px_color-mix(in_oklab,var(--crit)_18%,transparent),0_0_28px_-8px_var(--crit)]'
          : 'border-line'
      }`}
    >
      <div className="order-2 min-w-0 sm:order-none">
        <h2 className="truncate font-display text-[17px] font-bold tracking-tight text-ink">{site.name}</h2>
        <p className="mt-0.5 truncate text-[11px] text-dim">{site.url.replace(/^https?:\/\//, '')}</p>
        <div className="mt-2"><SeverityTag severity={sev} /></div>
      </div>

      <div className="order-1 sm:order-none sm:justify-self-center">
        <ScoreRing value={p?.score ?? null} severity={sev} />
      </div>

      <div className="order-3 col-span-2 min-w-0 sm:order-none sm:col-span-1">
        <div className="mb-2 grid grid-cols-[repeat(2,auto)] justify-between gap-2 sm:grid-cols-[repeat(6,auto)]">
          <Figure className="hidden sm:block" label="Perf" value={p?.score != null ? String(p.score) : '-'} tone={scoreTone(p?.score)} />
          <Figure className="hidden sm:block" label="A11y" value={a?.score != null ? String(a.score) : '-'} tone={scoreTone(a?.score)} />
          <Figure className="hidden sm:block" label="Best" value={p?.bestPractices != null ? String(p.bestPractices) : '-'} tone={scoreTone(p?.bestPractices)} />
          <Figure className="hidden sm:block" label="SEO" value={seo?.score != null ? String(seo.score) : '-'} tone={scoreTone(seo?.score)} />
          <Figure label="LCP" value={p?.lcp != null ? `${p.lcp.toFixed(1)}s` : '-'} tone={lcpTone(p?.lcp)} />
          <Figure label="Uptime" value={formatUptime(site.uptime30)} tone={uptimeTone(site.uptime30)} />
        </div>
        <div className="hidden sm:block"><UptimeStrip slots={slots} /></div>
        <div aria-hidden="true" className="sm:hidden [&_[role=img]]:pointer-events-none">
          <UptimeStrip slots={bucketChecks(site.recent, now, 16)} />
        </div>
      </div>

      <div className="hidden min-w-0 xl:block">
        <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.1em] text-dim">
          <small>Response</small>
          <strong data-figure className={`font-display text-xl font-bold normal-case tracking-normal ${c.text}`}>
            {formatResponse(h?.responseTime)}
          </strong>
        </div>
        <div className="my-1 mb-2"><Sparkline values={response} severity={sev} zeroBased /></div>
        <div className="h-1 overflow-hidden rounded-[2px] bg-line">
          <div
            className={`h-full ${SSL_BAR[sslTone(sslDays)]}`}
            style={{ width: `${sslDays == null ? 0 : Math.max(2, Math.min(100, (sslDays / 90) * 100))}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-dim">
          <span>SSL</span>
          <span className={sslDays == null ? '' : figureClass(sslTone(sslDays))}>
            {sslDays == null ? '-' : `${sslDays} ${sslDays === 1 ? 'day' : 'days'}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
