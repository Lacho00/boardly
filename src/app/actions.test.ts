import { beforeEach, describe, expect, it, vi } from 'vitest'

const prisma = vi.hoisted(() => ({ site: { create: vi.fn(), delete: vi.fn(), update: vi.fn() } }))
const collect = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
const redirect = vi.hoisted(() => vi.fn(() => { throw new Error('NEXT_REDIRECT') }))
const demo = vi.hoisted(() => ({ isDemo: false }))

vi.mock('@/lib/prisma', () => ({ prisma }))
vi.mock('@/lib/collector', () => ({ collectMetricsForSite: collect }))
vi.mock('@/lib/demo', () => demo)
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('next/navigation', () => ({ redirect }))

import { collectSiteAction, createSiteAction, deleteSiteAction, saveSettingsAction } from './actions'

const form = (entries: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(entries)) f.set(k, v)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  demo.isDemo = false
})

describe('createSiteAction', () => {
  it('rejects an empty name and echoes the fields', async () => {
    const r = await createSiteAction(null, form({ name: ' ', url: 'https://a.test' }))
    expect(r).toMatchObject({ ok: false, message: 'Name is required.', fields: { name: '', url: 'https://a.test' } })
    expect(prisma.site.create).not.toHaveBeenCalled()
  })

  it('rejects a non-http URL', async () => {
    const r = await createSiteAction(null, form({ name: 'Acme', url: 'ftp://a.test' }))
    expect(r).toMatchObject({ ok: false, message: 'URL must be a valid http(s) URL.' })
  })

  it('creates the site and revalidates home', async () => {
    prisma.site.create.mockResolvedValue({})
    const r = await createSiteAction(null, form({ name: ' Acme ', url: 'https://acme.test' }))
    expect(prisma.site.create).toHaveBeenCalledWith({ data: { name: 'Acme', url: 'https://acme.test' } })
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(r).toEqual({ ok: true, message: 'Site added.' })
  })

  it('reports a duplicate URL', async () => {
    prisma.site.create.mockRejectedValue({ code: 'P2002' })
    const r = await createSiteAction(null, form({ name: 'Acme', url: 'https://acme.test' }))
    expect(r).toMatchObject({ ok: false, message: 'A site with this URL already exists.' })
  })

  it('rethrows unknown errors', async () => {
    prisma.site.create.mockRejectedValue(new Error('boom'))
    await expect(createSiteAction(null, form({ name: 'Acme', url: 'https://acme.test' }))).rejects.toThrow('boom')
  })
})

describe('collectSiteAction', () => {
  it('collects and revalidates', async () => {
    collect.mockResolvedValue(undefined)
    expect(await collectSiteAction('s1')).toEqual({ ok: true, message: 'Data collected' })
    expect(revalidatePath).toHaveBeenCalledWith('/sites/s1')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns an error state when collection fails', async () => {
    collect.mockRejectedValue(new Error('down'))
    expect(await collectSiteAction('s1')).toMatchObject({ ok: false })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('deleteSiteAction', () => {
  it('deletes, revalidates and redirects home', async () => {
    prisma.site.delete.mockResolvedValue({})
    await expect(deleteSiteAction('s1')).rejects.toThrow('NEXT_REDIRECT')
    expect(prisma.site.delete).toHaveBeenCalledWith({ where: { id: 's1' } })
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('still redirects when the site is already gone', async () => {
    prisma.site.delete.mockRejectedValue({ code: 'P2025' })
    await expect(deleteSiteAction('s1')).rejects.toThrow('NEXT_REDIRECT')
  })

  it('returns an error on other failures', async () => {
    prisma.site.delete.mockRejectedValue(new Error('x'))
    expect(await deleteSiteAction('s1')).toMatchObject({ ok: false })
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('saveSettingsAction', () => {
  it('updates only the fields present', async () => {
    prisma.site.update.mockResolvedValue({})
    await saveSettingsAction('s1', null, form({ useLocalLighthouse: 'true' }))
    expect(prisma.site.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { useLocalLighthouse: true } })
  })

  it('stores an empty password as null', async () => {
    prisma.site.update.mockResolvedValue({})
    await saveSettingsAction('s1', null, form({ wpAppPassword: '' }))
    expect(prisma.site.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { wpAppPassword: null } })
  })

  it('maps a missing site to a message', async () => {
    prisma.site.update.mockRejectedValue({ code: 'P2025' })
    expect(await saveSettingsAction('s1', null, form({}))).toEqual({ ok: false, message: 'Site not found.' })
  })
})

describe('demo mode', () => {
  it('blocks every action before touching Prisma', async () => {
    demo.isDemo = true
    const blocked = { ok: false, message: expect.stringContaining('Disabled in the public demo') }
    expect(await createSiteAction(null, form({ name: 'A', url: 'https://a.test' }))).toMatchObject(blocked)
    expect(await collectSiteAction('s1')).toMatchObject(blocked)
    expect(await deleteSiteAction('s1')).toMatchObject(blocked)
    expect(await saveSettingsAction('s1', null, form({}))).toMatchObject(blocked)
    expect(prisma.site.create).not.toHaveBeenCalled()
    expect(prisma.site.delete).not.toHaveBeenCalled()
    expect(prisma.site.update).not.toHaveBeenCalled()
    expect(collect).not.toHaveBeenCalled()
  })
})
