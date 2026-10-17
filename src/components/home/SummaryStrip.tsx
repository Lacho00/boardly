import { lcpTone, scoreTone, sslTone, type Tone } from '@/lib/scores'
import type { HomeSummary } from '@/lib/home-summary'
import { figureClass, formatUptime, uptimeTone } from './figures'

function Cell({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="bg-panel px-3.5 py-2.5">
      <small className="block text-[10px] uppercase tracking-[0.1em] text-dim">{label}</small>
      <strong className={`mt-0.5 block font-display text-[27px] font-bold leading-none tabular-nums ${figureClass(tone)}`}>
        {value}
      </strong>
    </div>
  )
}

export default function SummaryStrip({ summary }: { summary: HomeSummary }) {
  const { uptime30, avgPerformance, medianLcp, soonestSsl } = summary
  return (
    <div className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
      <Cell label="Uptime 30 d" value={formatUptime(uptime30)} tone={uptimeTone(uptime30)} />
      <Cell label="Avg performance" value={avgPerformance == null ? '-' : String(avgPerformance)} tone={scoreTone(avgPerformance)} />
      <Cell label="Median LCP" value={medianLcp == null ? '-' : `${medianLcp.toFixed(1)}s`} tone={lcpTone(medianLcp)} />
      <Cell label="Next SSL" value={soonestSsl ? `${soonestSsl.days} d` : '-'} tone={sslTone(soonestSsl?.days)} />
    </div>
  )
}
