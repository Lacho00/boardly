// Small fetch helpers for client components: check r.ok and surface the API error message.
export async function readJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null
  return (await res.json().catch(() => null)) as T | null
}

export async function writeOk(res: Response): Promise<boolean> {
  if (res.ok) return true
  const body = await res.json().catch(() => null)
  window.alert(body?.error ?? `Request failed (${res.status})`)
  return false
}
