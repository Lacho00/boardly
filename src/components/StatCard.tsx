import { toneClass, type Tone } from '@/lib/scores'

export function StatCard({ label, value, sub, tone = 'none' }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <p className="text-[10px] uppercase leading-4 tracking-[0.1em] text-dim">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${toneClass[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-dim">{sub}</p>}
    </div>
  )
}
