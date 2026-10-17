import { toneClass, type Tone } from '@/lib/scores'

export function StatCard({ label, value, sub, tone = 'none' }: { label: string; value: string; sub?: string; tone?: Tone }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
      <p className="text-xs text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${toneClass[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
}
