export const RANGES = [7, 30] as const
export type Range = (typeof RANGES)[number]
export const DEFAULT_RANGE: Range = 30

/** Reads `?range=` from searchParams; anything but a known value falls back to the default. */
export function parseRange(value: string | string[] | undefined): Range {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(raw)
  return RANGES.find(r => r === n) ?? DEFAULT_RANGE
}
