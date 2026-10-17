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
          className={`px-3 py-2 rounded-[3px] border text-sm ${r === current ? 'border-ok text-ok' : 'border-line text-dim hover:text-ink'}`}
        >
          {r}d
        </Link>
      ))}
    </nav>
  )
}
