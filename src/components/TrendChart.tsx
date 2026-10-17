export function TrendChart<T extends { checkedAt: string | Date }>({ title, data, map, color }: {
  title: string
  data: T[]
  map: (d: T) => number | null
  color: string
}) {
  const values = data.map(d => ({ date: new Date(d.checkedAt).toLocaleDateString('en-US'), value: map(d) })).filter(v => v.value != null)

  if (values.length < 2) {
    return (
      <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-400">At least 2 data points are needed to plot</p>
      </div>
    )
  }

  const max = Math.max(...values.map(v => v.value!))
  const min = Math.min(...values.map(v => v.value!))
  const range = max - min || 1
  const allSame = max === min

  const colorMap: Record<string, string> = { blue: 'bg-blue-500', emerald: 'bg-emerald-500' }

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="flex items-stretch gap-1 h-32">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center">
            <div
              className={`w-full ${colorMap[color] ?? 'bg-blue-500'} rounded-t min-h-[4px]`}
              style={{ height: allSame ? '100%' : `${((v.value! - min) / range) * 100}%` }}
              title={`${v.date}: ${v.value}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-zinc-400">
        <span>{values[0]?.date}</span>
        <span>{values[values.length - 1]?.date}</span>
      </div>
    </div>
  )
}
