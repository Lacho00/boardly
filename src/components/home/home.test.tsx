import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { HomeSite } from '@/lib/types'
import { summarizeHome } from '@/lib/home-summary'
import SiteRow from './SiteRow'
import CompactSiteRow from './CompactSiteRow'
import SummaryStrip from './SummaryStrip'
import SiteList from './SiteList'
import { COMPACT_AFTER } from './layout'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

const NOW = new Date('2026-10-17T12:00:00Z')

function site(id: string, over: Partial<HomeSite> = {}, withChecks = true): HomeSite {
  const at = new Date(NOW.getTime() - 60_000)
  return {
    id,
    name: `Site ${id}`,
    url: `https://site-${id}.test`,
    healthChecks: withChecks ? [{ status: 'healthy', responseTime: 180, checkedAt: at }] : [],
    performanceSnapshots: withChecks ? [{ score: 96, bestPractices: 100, lcp: 1.2, checkedAt: at }] : [],
    seoAudits: withChecks ? [{ score: 100, checkedAt: at }] : [],
    accessibilityScores: withChecks ? [{ score: 98, checkedAt: at }] : [],
    sslChecks: withChecks ? [{ valid: true, daysRemaining: 62, checkedAt: at }] : [],
    recent: withChecks
      ? Array.from({ length: 12 }, (_, i) => ({
          status: 'healthy',
          responseTime: 170 + i,
          checkedAt: new Date(NOW.getTime() - (12 - i) * 1_800_000),
        }))
      : [],
    uptime30: withChecks ? 99.98 : null,
    severity: withChecks ? 'healthy' : 'unknown',
    ...over,
  } as unknown as HomeSite
}

describe('SiteList', () => {
  it('renders full rows in the given order with one link per site', () => {
    const sites = [
      site('a', { severity: 'critical' }),
      site('b', { severity: 'warning' }),
      site('c'),
      site('d'),
    ]
    render(<SiteList sites={sites} now={NOW} />)
    const links = screen.getAllByRole('link')
    expect(links.map(l => l.getAttribute('href'))).toEqual(['/sites/a', '/sites/b', '/sites/c', '/sites/d'])
    expect(document.querySelectorAll('[data-row="full"]').length).toBe(4)
    expect(screen.getAllByText('Critical').length).toBe(1)
  })

  it('uses compact rows without sparklines past the threshold, still one link each', () => {
    const sites = Array.from({ length: COMPACT_AFTER + 7 }, (_, i) => site(String(i)))
    render(<SiteList sites={sites} now={NOW} />)
    expect(screen.getAllByRole('link').length).toBe(sites.length)
    expect(document.querySelectorAll('[data-row="full"]').length).toBe(COMPACT_AFTER)
    expect(document.querySelectorAll('[data-row="compact"]').length).toBe(7)
    const compact = document.querySelector('[data-row="compact"]')!
    expect(compact.querySelector('svg')).toBeNull()
  })

  it('shows the empty message and no strip for zero sites', () => {
    render(<SiteList sites={[]} now={NOW} />)
    expect(screen.getByText('No sites yet')).toBeTruthy()
    expect(screen.queryAllByRole('link').length).toBe(0)
  })
})

describe('SiteRow', () => {
  it('shows dashes and a No data tag for a site without checks', () => {
    render(<SiteRow site={site('x', {}, false)} now={NOW} />)
    expect(screen.getByText('No data')).toBeTruthy()
    const row = document.querySelector('[data-row="full"]')!
    expect(row.textContent).not.toMatch(/undefined|NaN|null/)
    expect(row.querySelectorAll('[data-figure]').length).toBeGreaterThan(0)
    row.querySelectorAll('[data-figure]').forEach(el => expect(el.textContent).toBe('-'))
  })

  it('truncates a very long name', () => {
    const name = 'N'.repeat(120)
    render(<SiteRow site={site('long', { name })} now={NOW} />)
    expect(screen.getByText(name).className).toContain('truncate')
  })

  it('links to the site detail page', () => {
    render(<SiteRow site={site('abc')} now={NOW} />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/sites/abc')
  })
})

describe('CompactSiteRow', () => {
  it('links to the site and truncates the name', () => {
    render(<CompactSiteRow site={site('q', { name: 'M'.repeat(120) })} />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/sites/q')
    expect(screen.getByText('M'.repeat(120)).className).toContain('truncate')
  })
})

describe('SummaryStrip', () => {
  it('shows the four figures', () => {
    render(<SummaryStrip summary={summarizeHome([site('a'), site('b')])} />)
    expect(screen.getByText('99.98%')).toBeTruthy()
    expect(screen.getByText('96')).toBeTruthy()
    expect(screen.getByText('1.2s')).toBeTruthy()
    expect(screen.getByText('62 d')).toBeTruthy()
  })
})
