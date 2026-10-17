/** SVG `points` for a polyline; empty below two values, flat series centred. */
export function sparkPoints(
  values: number[],
  opts: { width: number; height: number; zeroBased?: boolean },
): string {
  if (values.length < 2) return ''
  const { width, height, zeroBased } = opts
  const max = Math.max(...values)
  const min = zeroBased ? 0 : Math.min(...values)
  const range = max - min
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = range === 0 ? height / 2 : height - ((v - min) / range) * height
      return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`
    })
    .join(' ')
}
