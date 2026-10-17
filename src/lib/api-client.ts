// Small fetch helpers for client components: check r.ok and surface the API error message.
export async function readJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null
  return (await res.json().catch(() => null)) as T | null
}

// Returns null on success, otherwise the API error message to show inline.
export async function writeError(res: Response): Promise<string | null> {
  if (res.ok) return null
  const body = await res.json().catch(() => null)
  return body?.error ?? `Request failed (${res.status})`
}
