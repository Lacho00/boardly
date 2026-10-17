import Link from 'next/link'
import { RANGES, type Range } from '@/lib/range'

export function RangeSelector({ current }: { current: Range }) {
  return (
    <nav aria-label="Chart range" className="flex gap-2">
      {RANGES.map(r => (
        <Link
          key={r}
          href={`?range=${r}`}
          scroll={false}
          aria-current={r === current ? 'true' : undefined}
          className={`px-3 py-2 rounded text-sm ${r === current ? 'bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'}`}
        >
          {r}d
        </Link>
      ))}
    </nav>
  )
}
