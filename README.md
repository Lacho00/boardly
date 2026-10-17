# Boardly

[![CI](https://github.com/Lacho00/boardly/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/Lacho00/boardly/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Monitor performance, uptime, SSL and SEO for several websites from one dashboard. Built with Next.js, React and Prisma.

**[Live demo](https://boardly-silk.vercel.app)**: read-only, with fictional data. Scans, edits and alerts are disabled.

![Dashboard](docs/screenshots/dashboard.jpg)

## What it does

- **Uptime and health checks** on a schedule, with WordPress version and plugin count when the site exposes them.
- **Performance** from PageSpeed Insights (LCP, CLS, TTFB, best practices), or from a local Lighthouse run for sites behind a firewall or on a local domain.
- **SEO and accessibility audits**: title, description, H1 count, images without alt text, accessibility score.
- **SSL monitoring**: validity, issuer and days until expiry.
- **Alerts** inside the app and through a Slack webhook when a site goes down, its certificate is about to expire, or its score drops.
- **Monthly PDF reports** per site and a general report across all sites.

| Alerts | Reports |
|---|---|
| ![Alerts](docs/screenshots/alerts.jpg) | ![Reports](docs/screenshots/reports.jpg) |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 5 + SQLite · Lighthouse · pdfkit / pdf-lib

The UI is a set of React server and client components. Data collection lives in `src/lib/` (one module per check) and runs from the cron routes in `src/app/api/cron/`.

## Run it locally

```bash
npm install
cp .env.example .env
npm run db:push     # create the SQLite database
npm run db:seed     # optional: four fictional sites with 30 days of metrics
npm run dev
```

Open http://localhost:3000. `GOOGLE_PSI_API_KEY` is optional and raises the PageSpeed Insights quota.

To collect real data, add your sites in the app and call `GET /api/cron/collect` and `GET /api/cron/health` from any scheduler. Set `CRON_SECRET` to require `Authorization: Bearer <secret>` on those routes. Set the Slack webhook under Config.

Boardly has no user authentication. Do not expose a non-demo instance to the public internet without putting it behind your own auth (reverse proxy, VPN or similar).

## Project layout

```
prisma/schema.prisma   data model: Site, HealthCheck, PerformanceSnapshot, SeoAudit, SslCheck, Alert, MonthlyReport
src/app/               pages (dashboard, alerts, reports, settings) and API routes
src/lib/               collectors, notifier, PDF helpers
scripts/               local Lighthouse runner
```

## License

[MIT](LICENSE)
