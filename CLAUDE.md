# down-detector

A status page that pings real service endpoints instead of trusting vendor status pages. Deployed on Cloudflare Workers.

## Stack

- **Runtime**: Cloudflare Workers (no Node.js APIs)
- **Framework**: Hono — routing, CORS middleware, JSX server-side rendering
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Scheduler**: Cloudflare Cron Triggers — checks run every 5 minutes
- **Language**: TypeScript throughout

## Commands

```bash
npm run dev              # local dev server (wrangler dev)
npm run deploy           # deploy to Cloudflare
npm run db:migrate       # apply schema.sql to local D1
npm run db:migrate:remote  # apply schema.sql to production D1
npm run type-check       # tsc --noEmit
```

## Architecture

```
src/
  index.tsx         # Worker entry — HTTP routes + scheduled() cron handler
  types.ts          # Shared interfaces: Env, Service, CheckResult, ServiceStatus, CheckStatus
  checker.ts        # HEAD request with AbortController timeout; classifies up/degraded/down
  db.ts             # D1 query helpers (getAllServices, insertChecks, buildServiceStatuses, etc.)
  status-page.ts    # Fetches vendor status page APIs; parses Atlassian Statuspage + GCP formats
  ui/
    page.tsx        # Main status page (index route)
    detail.tsx      # Per-service detail page with check history + notifications
    components.tsx  # ServiceRow, HistoryBars (shared between pages)
    styles.ts       # Single CSS string inlined into every page's <style> tag
schema.sql          # D1 schema + seed data (INSERT OR IGNORE)
wrangler.toml       # Cloudflare config: D1 binding, cron schedule
```

## Key Behaviours

**Health check classification** (`src/checker.ts`):
- `up` — HTTP 2xx/3xx, response time < 3000ms
- `degraded` — HTTP 4xx OR latency ≥ 3000ms
- `down` — HTTP 5xx, timeout (> 5000ms AbortController), or connection error
- All checks use `HEAD` with `redirect: follow`

**Cron handler** (`src/index.tsx` → `runChecks`):
- Fetches all services from D1, runs all checks concurrently with `Promise.all`
- Writes results with `db.batch()` (single round-trip)
- Prunes checks older than 7 days in the same tick

**JSX rendering**:
- Pages are rendered server-side with Hono JSX; no client-side framework
- Every HTML response is prefixed with `<!DOCTYPE html>` manually in the route handler (`'<!DOCTYPE html>' + <Component />`) — this is required to avoid browser quirks mode
- CSS is a single string in `src/ui/styles.ts`, inlined into every page via `dangerouslySetInnerHTML`
- Pages poll their own URL every 30 seconds with a `fetch()` + `DOMParser` swap — no full-page reload flash

**Status page notifications** (`src/status-page.ts`):
- Fetched live when a detail page loads, in parallel with D1 queries
- 4-second timeout; returns empty array on any error
- Uses Cloudflare edge cache (120s TTL) to avoid hammering upstream APIs
- Coverage: GitHub, GCP Console, Google Accounts, Cloudflare, Vercel, npm
- Azure and Stripe.js CDN have status page links but no scrapeable JSON API

## API Routes

All `/api/*` routes have CORS headers.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | Endpoint index |
| GET | `/api/services` | All monitored services |
| GET | `/api/services/:id` | Single service + latest + 10-check history |
| GET | `/api/checks` | All services with status; `?status=up\|degraded\|down` filter |
| POST | `/api/trigger` | Run all checks immediately |

## Adding or Changing Services

Services are seeded in `schema.sql`. To change a service in production, the easiest path is a temporary migration route (see history of how `azure-mgmt`, `googleapis`, and `stripe-api` endpoints were fixed) since `wrangler d1 execute --remote` requires elevated account permissions that may not be available.

## D1 Database

- `services` table — static list of services, seeded via `schema.sql`
- `checks` table — time-series of check results; indexed on `(service_id, checked_at DESC)`
- `database_id` in `wrangler.toml`: `f72edb76-3839-4cd7-926f-164a712e23c7`
- Account: `partavocado@icloud.com` / Cloudflare account ID `21d9cc3d408c42ff442129f4da502973`

## Deployment

- Worker URL: `https://down-detector.partavocado.workers.dev`
- GitHub remote: `https://github.com/part-avocado/down-detector.git`
