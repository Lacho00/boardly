/** Strip secrets from a Site row before it leaves the server. */
export function toPublicSite<T extends { wpAppPassword: string | null }>(site: T) {
  const { wpAppPassword, ...rest } = site
  return { ...rest, hasWpAppPassword: wpAppPassword != null && wpAppPassword !== '' }
}
