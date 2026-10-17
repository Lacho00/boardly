# Boardly redesign: design

Date: 2026-10-17. Status: awaiting owner review of this document.

## Intent

Boardly looks generic today: zinc-on-black cards, Geist, a blue focus ring, nothing that says "this is a monitoring tool". The owner wants a distinctive identity with more personality, without losing the density a dashboard needs. The redesign is visual and structural on the front end. It is not a change of features, data model or checks.

Chosen direction (after comparing three mockups): an "instrument panel" that mixes a terminal's precision (mono data, uppercase micro-labels, hairlines, dashed rules) with instrument-style graphics (score rings, uptime pulse strip, response sparkline). Final reference mockup: v4 of the brainstorm session (home page, dark and light, plus a compact mobile row).

## Goals

- A recognisable identity: warm near-black base, phosphor-green brand accent, mono for data, a geometric grotesk for names and big figures.
- Dark and light themes, both first-class. Follows `prefers-color-scheme` by default, with a manual toggle that overrides it and persists.
- Dense but readable: every site row uses its full width (6 metrics, 48-sample uptime strip with time axis, response trend, SSL bar). The home page gets a summary strip and a side column.
- Severity first: sites are sorted critical, warning, healthy. A critical site is visually elevated (coral edge and glow).
- Semantics stay unambiguous: green = OK and brand, amber = warning, coral = critical. Colour is never the only signal (labels, tags and numbers always accompany it).
- Same behaviour as today on every page.

## Non-goals and anti-goals

- No new features, checks, routes or schema changes.
- No chart library and no new runtime dependency. Rings, pulse strip and sparklines are CSS and inline SVG.
- No loss of accessibility: contrast AA in both themes, keyboard focus visible, touch targets at least 24x24 on mobile, reduced-motion respected (the live-dot pulse stops).
- Not a failure but to avoid: a redesign that only recolours the existing zinc layout, or one that looks good with 4 sites and breaks with 15.

## Scope

All five pages get the new system: home (`src/app/page.tsx`), site detail (`src/app/sites/[id]/page.tsx`), alerts, reports, settings. Shared pieces: layout, header/nav, `StatCard`, `LineChart`, `TrendChart`, `Skeleton`, `MessageCard`, form components, buttons. PDF output (`pdf-helper.ts`) is out of scope.

Delivery in blocks, each its own PR into `dev`:

1. Foundation: tokens, themes, fonts, toggle, header/nav shell.
2. Home page: summary strip, site rows, side column.
3. Site detail page and the two chart components.
4. Alerts, reports, settings, forms and empty/error/loading states.

## Design system

Tokens are CSS custom properties in `globals.css`, exposed to Tailwind 4 through `@theme`. Starting values (from the approved mockup):

| Token | Dark | Light |
|---|---|---|
| bg | `#0e0d0b` | `#f6f3ec` |
| panel | `#161512` | `#fffdf8` |
| line | `#2a2823` | `#ddd6c6` |
| ink | `#ece8dd` | `#1c1a15` |
| dim | `#8a8578` | `#7a7466` |
| ok | `#7cffb2` | `#0f9d58` |
| warn | `#ffb020` | `#b86e00` |
| crit | `#ff5a4f` | `#d6372b` |

Typography: JetBrains Mono for data, labels and body UI; Space Grotesk 500/700 for site names, headings and large figures. Both through `next/font/google` (replacing Geist). Micro-labels are 10px uppercase with wide tracking; metric values 16px; summary figures 27px.

Texture: a faint dot grid on the page background. Hairline 1px borders, radius 8px on panels, 3px status edge on site rows.

The existing `scores.ts` tones (`scoreTone`, `lcpTone`, `responseTone`, `sslTone`) keep their thresholds; only the colours they resolve to change.

## Home page

- Top status bar: live dot and a one-line summary ("1 critical, 1 warning, 2 healthy"), last check time, theme toggle. The dot is coral if any site is critical, amber if any warning, green otherwise.
- Nav: wordmark, Sites, Alerts (with critical count), Reports, Settings, Add site.
- Summary strip, 4 cells with a sparkline each: uptime (30 d), mean performance, median LCP, soonest SSL expiry.
- Site rows, sorted by severity then name: name, URL, status tag, performance ring, 6 metrics (performance, accessibility, best practices, SEO, LCP, uptime), 48-sample uptime strip with axis (-24 h, -12 h, now), response-time sparkline (zero-based scale), SSL bar and days left. Healthy samples are dimmed so incidents stand out.
- Side column: recent activity (from alerts), SSL expiries, upcoming checks, LCP ranking with a 2.5 s target marker.
- Footer status line.
- Mobile: the row collapses to ring plus name, key figures and a shorter pulse strip; the side column stacks below the list.
- Scale: with many sites the list stays a single column; a compact row variant (no sparkline, shorter strip) is acceptable above roughly 10 sites. See open calls.

## Behaviour that must not change

Demo mode (`DEMO_MODE=1`) still blocks writes and cron through `proxy.ts`. All links, actions, forms, PDF and report endpoints, refresh button and add-site flow work as today. `npm run lint`, tests and `npm run build` pass. `build:demo` still seeds and builds.

## Verification rule for this project

Any change of tag or classes is measured before and after in the browser (`getComputedStyle`: colour, background, font size and family, border, radius; `getBoundingClientRect`: width and height) on the real element, desktop and mobile, in both themes, and across every element that shares the class. Mismatches are fixed, not justified.

## Decisions delegated to me by the owner

- Site severity is the worse of two signals: the latest `HealthCheck` status (healthy, warning, critical) and the SSL tone (under 7 days critical, under 30 warning, as in `sslTone`). Lighthouse scores, LCP and response time colour their own figures but do not change a site's severity. One shared helper in `src/lib` feeds the sort order, status tag, row edge, header dot and summary count.
- The demo seed (`prisma/seed.mjs`) is extended to roughly 48 `HealthCheck` rows per site over the last 24 h, with a few incidents on two sites, and enough history for the 30 d uptime figure. No schema change. README screenshots are re-shot after block 2.

## Calls I made (not agreed with the owner)

- Home page data for the new panels comes from existing tables: uptime strip and response sparkline from `HealthCheck` bucketed into 48 slots over 24 h (empty slots render neutral, not green); activity feed from `Alert`; SSL list from latest `SslCheck`; LCP ranking from latest `PerformanceSnapshot`; uptime 30 d from `HealthCheck`. New query helpers in `src/lib`, no schema change.
- "Upcoming checks" panel is dropped: no cron schedule exists in the repo (`vercel.json` has only `buildCommand`). The side column has three panels: activity, SSL expiries, LCP ranking.
- The nav alert count and the activity feed keep today's definition: `getCriticalAlertCount` (critical among the 50 latest `Alert` rows, `Alert.severity`). It moves into the shared layout shell in block 1.
- Theme preference is stored in a cookie so the server can render the right theme with no flash; absent a cookie, `prefers-color-scheme` applies. Home and detail pages are already `force-dynamic`, so reading the cookie costs nothing there; any page that is currently static is checked in block 1.
- Spanish copy in the mockups is illustrative; UI language stays as it is today (English).
- Emoji in the UI (the alert bell) are replaced by inline SVG icons.
- The approved mockup is committed as `assets/redesign-mockup-v4.html` (fictional data, open it in a browser; the `tema` button toggles light and dark). It is the visual reference for proportions, ring size and column widths.
- Token values are a starting point. Block 1 measures contrast (WCAG AA) for every text and background pair in both themes and adjusts the minimum needed, for example `dim` on both backgrounds and `ok` as small text on light. The before and after values go in the PR description for the owner to review.
- The compact row variant is required: it applies above 8 sites (no sparkline, shorter strip, same severity edge). It is verified with a test render of 15 sites; the demo keeps its 4.

## Left to the builder

Component boundaries and file names; how uptime buckets are computed (SQL versus in memory); exact responsive breakpoints; icon set (inline SVG, no dependency); chart axis details on the detail page, following the same visual language; the compact row threshold.
