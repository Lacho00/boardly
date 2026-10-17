# Boardly

Dashboard that monitors uptime, performance, SSL and SEO for several websites. See `README.md` for features and `HANDOFF.md` for the current task (public demo on Vercel).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma 5 + SQLite, Lighthouse, pdfkit / pdf-lib.

## Commands

- `npm run dev`: dev server on http://localhost:3000
- `npm run build`: production build
- `npm run lint`: ESLint
- `npm run db:push` / `npm run db:seed`: create and seed the SQLite database
- `npm run build:demo`: seed `prisma/demo.db` and build (used by Vercel, see `vercel.json`)

## Layout

- `src/app/`: pages and API routes. Cron endpoints live in `src/app/api/cron/`.
- `src/lib/`: one module per check (health, SSL, SEO, PageSpeed, Lighthouse), plus `demo.ts`, `prisma.ts`, `notifier.ts`, `pdf-helper.ts`.
- `src/proxy.ts`: blocks writes and cron routes when `DEMO_MODE=1`.
- `prisma/schema.prisma`: data model.

## Documentation

Use the context7 MCP server (`resolve-library-id`, then `query-docs`) for Next.js, React, Prisma and Tailwind questions before answering from memory. Versions matter here: Next.js 16, React 19, Prisma 5, Tailwind 4.

The `prisma-cli` skill documents Prisma 7. This project is on Prisma 5, so check commands and options against context7 before using them.

## Rules

- Demo data is fictional (Acme, Northwind, Globex, Initech). Never put client names in commits, PRs, README or code.
- No Claude attribution lines (`Co-Authored-By`, "Generated with Claude Code") in commits or PRs.
- Branch off `dev`, open PRs into `dev`. No direct pushes to `master`.
- Run `npm run lint` and `npm run build` before opening a PR.
