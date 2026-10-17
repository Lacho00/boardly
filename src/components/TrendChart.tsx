export function TrendChart<T extends { checkedAt: string | Date }>({ title, data, map, color }: {
  title: string
  data: T[]
  map: (d: T) => number | null
  color: string
}) {
  const values = data.map(d => ({ date: new Date(d.checkedAt).toLocaleDateString('en-US'), value: map(d) })).filter(v => v.value != null)

  if (values.length < 2) {
    return (
      <div className="rounded-lg border border-line bg-panel p-5">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-dim">At least 2 data points are needed to plot</p>
      </div>
    )
  }

  const max = Math.max(...values.map(v => v.value!))
  const min = Math.min(...values.map(v => v.value!))
  const range = max - min || 1
  const allSame = max === min

  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="flex items-stretch gap-1 h-32">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center">
            <div
              className="w-full rounded-t min-h-[4px]"
              style={{ background: color, height: allSame ? '100%' : `${((v.value! - min) / range) * 100}%` }}
              title={`${v.date}: ${v.value}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-dim">
        <span>{values[0]?.date}</span>
        <span>{values[values.length - 1]?.date}</span>
      </div>
    </div>
  )
}
