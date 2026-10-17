import { Bar, PageShell } from '@/components/Skeleton'

export default function Loading() {
  return (
    <PageShell>
      <div className="grid gap-6" aria-busy="true" aria-label="Loading site">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 space-y-2">
              <Bar className="h-4 w-20" />
              <Bar className="h-8 w-24" />
              <Bar className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[0, 1].map(i => (
            <div key={i} className="bg-zinc-800 rounded-lg p-5 border border-zinc-700 space-y-3">
              <Bar className="h-5 w-40" />
              <Bar className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
