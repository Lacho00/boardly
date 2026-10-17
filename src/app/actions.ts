'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { collectMetricsForSite } from '@/lib/collector'
import { isDemo } from '@/lib/demo'
import { isPrismaNotFound, isPrismaUniqueViolation, parseHttpUrl } from '@/lib/security'
import type { ActionState } from '@/lib/types'

// Server Actions are POSTs to the page, so the /api proxy never sees them.
const DEMO_BLOCKED: NonNullable<ActionState> = {
  ok: false,
  message: 'Disabled in the public demo. Run Boardly locally to use this.',
}

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function createSiteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = text(formData, 'name').trim()
  const rawUrl = text(formData, 'url')
  const fields = { name, url: rawUrl }
  if (isDemo) return { ...DEMO_BLOCKED, fields }
  if (!name) return { ok: false, message: 'Name is required.', fields }
  const url = parseHttpUrl(rawUrl)
  if (!url) return { ok: false, message: 'URL must be a valid http(s) URL.', fields }
  try {
    await prisma.site.create({ data: { name, url } })
  } catch (e) {
    if (isPrismaUniqueViolation(e)) return { ok: false, message: 'A site with this URL already exists.', fields }
    throw e
  }
  revalidatePath('/')
  return { ok: true, message: 'Site added.' }
}

export async function collectSiteAction(siteId: string): Promise<ActionState> {
  if (isDemo) return DEMO_BLOCKED
  try {
    await collectMetricsForSite(siteId)
  } catch {
    return { ok: false, message: 'Collection failed. Try again in a moment.' }
  }
  revalidatePath(`/sites/${siteId}`)
  revalidatePath('/')
  return { ok: true, message: 'Data collected' }
}

export async function deleteSiteAction(siteId: string): Promise<ActionState> {
  if (isDemo) return DEMO_BLOCKED
  try {
    await prisma.site.delete({ where: { id: siteId } })
  } catch (e) {
    if (!isPrismaNotFound(e)) return { ok: false, message: 'Could not delete the site.' }
  }
  revalidatePath('/')
  redirect('/')
}

/** Updates only the settings present in the form: the password field and/or the Lighthouse switch. */
export async function saveSettingsAction(siteId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemo) return DEMO_BLOCKED
  const data: { wpAppPassword?: string | null; useLocalLighthouse?: boolean } = {}
  if (formData.has('wpAppPassword')) data.wpAppPassword = text(formData, 'wpAppPassword') || null
  if (formData.has('useLocalLighthouse')) data.useLocalLighthouse = text(formData, 'useLocalLighthouse') === 'true'
  try {
    await prisma.site.update({ where: { id: siteId }, data })
  } catch (e) {
    return { ok: false, message: isPrismaNotFound(e) ? 'Site not found.' : 'Could not save the settings.' }
  }
  revalidatePath(`/sites/${siteId}`)
  return { ok: true, message: 'Saved' }
}
