import { Bar, PageShell } from '@/components/Skeleton'

export default function Loading() {
  return (
    <PageShell>
      <div className="grid gap-4" aria-busy="true" aria-label="Loading sites">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-2">
                <Bar className="h-6 w-40" />
                <Bar className="h-4 w-56" />
              </div>
              <Bar className="h-5 w-16" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[0, 1, 2, 3, 4, 5].map(j => (
                <div key={j} className="space-y-1">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-5 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
