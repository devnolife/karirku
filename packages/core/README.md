# @devnolife/karirku-core

Engine half of [Karirku](https://github.com/devnolife/karirku): LLM, OCR,
matching, scraping, queues, workers, and all data access.

This package is **framework-agnostic** — no Next.js, no React, no DOM. It lives
at `packages/core` in the Karirku monorepo, is consumed by the Next.js app at
the workspace root, and can also run standalone as a worker process. The
dependency direction is one-way and enforced by ESLint:

```
karirku (root, Next.js app)  ──depends on──▶  @devnolife/karirku-core (packages/core)
```

Run its scripts from the workspace root with `pnpm --filter
@devnolife/karirku-core <script>`, or through the root proxies (`pnpm worker`,
`pnpm serve`, `pnpm hunter`, `pnpm db:*`, `pnpm core:build`).

## What lives here

| Area | Path | Notes |
| --- | --- | --- |
| Data access | `src/db.ts` | Owns the Prisma client. This package is the sole owner of the database. |
| Schema & migrations | `prisma/` | `schema.prisma`, migrations, seed |
| AI | `src/ai/` | OpenAI-compatible client, embeddings, extractors, quiz, path generator |
| OCR | `src/ocr.ts` | Tesseract bridge |
| Matching | `src/match/` | score, readiness, composite, evaluation, v2 |
| Scraping | `src/scraper/` | Crawlee-based providers and runner |
| Queues | `src/queue/` | BullMQ queue definitions |
| Workers | `src/workers/` | Job handlers + worker entrypoint |
| Autofill | `src/autofill/` | Extension autofill engine, adapters, rules |
| Control API | `src/server/` | HTTP surface for driving the engine remotely (`pnpm serve`) |
| Hunter | `hunter/` + `src/hunter.ts` | CommonJS job-automation engine, spawned as a child process |

## Why the database lives here, not in the web app

A reasonable question, especially next to guru-pintar, where the layout is the
opposite: Prisma sits in `saas-gurupintar/`, and the Go `core-llm` service has
no database code at all.

The difference is what the two engines *are*:

| | guru-pintar `core-llm` | `karirku-core` |
| --- | --- | --- |
| Shape | text in → text out | data pipeline |
| Owns data? | no — nothing to persist | yes — it *produces* the job corpus |

This package scrapes job postings, embeds them into pgvector, enriches them and
aggregates market statistics. Six tables — `Job`, `JobSource`, `CompanyProfile`,
`SkillTaxonomy`, `Course`, `RoleMarketStat` — are written by the engine and only
read by the web app. Schema ownership follows the writer, so they belong here,
and once they are here the migrations have to be here too: Prisma expects a
single owner, and splitting the schema across two packages means two generated
clients drifting out of sync.

Moving everything to the web app would also force the scraper, the BullMQ
workers and Hunter to move with it, since they cannot function without the
database. Those are long-running Node processes; folding them into the Next.js
package is exactly the split this project moved *away* from — the two halves now
share a folder, but not a package boundary.

### What the engine actually touches

It is still worth keeping the blast radius small, because `pnpm serve` can put
this package on a public network:

- **Owns** the six engine tables above.
- **Reads** `Profile` and `UserSkill` for matching and embeddings, and
  `Application` for Hunter — genuinely required, no way around it.
- **Never touches** `Account`, `Session`, `VerificationToken` or `OAuthState`.
  Credentials and auth state are the web app's business alone.

The control API reflects that: no endpoint returns profile content, `/api/hunter/runs`
selects an explicit column list rather than `SELECT *`, and the embed endpoint
takes an opaque row id rather than any text. If you ever need to harden this
further, the next step is a dedicated Postgres role for the engine with no grants
on the auth tables — not a repo reshuffle.

## Install

The package is published to GitHub Packages, so consumers need a registry
mapping and a token with `read:packages`:

```
# .npmrc
@devnolife:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
pnpm add @devnolife/karirku-core
```

## Usage

Import through **public subpaths**. The root export is deliberately limited to
pure, side-effect-free helpers so that pulling in one module never opens a
database connection or a Redis socket:

```ts
import { prisma }        from "@devnolife/karirku-core/db";
import { embed }         from "@devnolife/karirku-core/ai/embeddings";
import { scoreMatch }    from "@devnolife/karirku-core/match/score";
import { runScraper }    from "@devnolife/karirku-core/scraper/run";
import { spawnHunter }   from "@devnolife/karirku-core/hunter";
import type { User }     from "@devnolife/karirku-core/prisma";
```

`@devnolife/karirku-core/prisma` re-exports the generated Prisma client types.
The client is generated into `generated/prisma` and **shipped inside this
package**, which is what guarantees the app and the engine share exactly one
`@prisma/client` instance.

## Development

```bash
pnpm install
cp .env.example .env.local     # fill in DATABASE_URL, REDIS_URL, …
pnpm db:generate               # generate the Prisma client
pnpm typecheck
pnpm test
pnpm build                     # db:generate + tsc -> dist/
```

Run the worker:

```bash
pnpm worker          # tsx watch, for development
pnpm worker:start    # node dist/workers/index.js, for production
```

Infrastructure (Postgres + pgvector, Redis, MinIO, Ollama):

```bash
docker compose up -d
pnpm db:deploy
pnpm db:seed
```

### Working on core and web at the same time

Nothing to set up: both halves live in one pnpm workspace, and the root app
depends on this package with `"@devnolife/karirku-core": "workspace:*"`, so
`node_modules/@devnolife/karirku-core` is a symlink to this directory.

The app imports `dist/`, so rebuild after changing `src/`:

```bash
pnpm core:build   # from the workspace root
```

`pnpm build` at the root does this for you before `next build`.

## Control API — driving the engine over the network

The web app embeds this package in-process. That is fine when both run on the
same box, but it means the only way to trigger a scrape or pause a queue is to
open a shell on that box.

`pnpm serve` starts a small HTTP control API so the engine can be driven from
anywhere — the same shape as the `core-llm` service in guru-pintar: bearer-key
auth, a CORS allowlist, a per-key rate limit and an open `/health` probe.

```bash
pnpm serve            # 127.0.0.1 only — default, nothing is exposed
pnpm serve --public   # bind 0.0.0.0, reachable at http://<ip>:4310
pnpm serve --tunnel   # loopback + cloudflared, gives a public https URL
```

`--public` and `--tunnel` generate a key into `.env.local` on first run and
print it. **The server refuses to bind anywhere but loopback while
`CORE_API_KEYS` is empty**, so a public port can never be left unauthenticated.

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | database / redis / ollama probe — **no key required** |
| `GET` | `/api/status` | services + queue counts + hunter lock, in one call |
| `GET` | `/api/queues` | job counts and paused flag per queue |
| `POST` | `/api/queues/:name/pause` · `/resume` | stop and restart a queue |
| `POST` | `/api/jobs/scan` | enqueue a portal scrape |
| `POST` | `/api/jobs/market-intel` | enqueue today's aggregation (deduplicated) |
| `POST` | `/api/jobs/embed` | enqueue one embedding — `{ table, id }` |
| `GET` | `/api/jobs/:queue/:id` | inspect a job |
| `GET` | `/api/hunter/status` · `/runs` | lock and gmail state, recent runs |
| `POST` | `/api/hunter/actions` | `scan` · `apply` · `sync-email` · `import-applied` · `full` |

Everything except `/health` needs `Authorization: Bearer <key>`.

### Client

`pnpm ctl` speaks to the API and prints raw JSON, so it pipes into `jq`:

```bash
export CORE_URL=https://your-host.example.com
export CORE_API_KEY=...

pnpm ctl status
pnpm ctl scan
pnpm ctl pause scraper
pnpm ctl hunter run apply --limit 3
pnpm ctl queues | jq '.queues.scraper.waiting'
```

Or plain curl:

```bash
curl -H "Authorization: Bearer $CORE_API_KEY" "$CORE_URL/api/status"
```

### Choosing an exposure mode

| | Reachability | Cost |
| --- | --- | --- |
| `--public` | needs a routable IP, plus a firewall/NAT rule for the port | plain HTTP — put it behind a TLS proxy before using it for real |
| `--tunnel` | works behind NAT with no port opened at all | depends on cloudflared; the quick-tunnel URL changes on restart |

For anything long-lived, prefer a named cloudflared tunnel or a reverse proxy
that terminates TLS, and keep `CORE_HOST=127.0.0.1` so the port is only
reachable through it.

### Security notes

- Keys are compared in constant time, and only an 8-character prefix is ever
  used for rate-limit bookkeeping — full tokens never reach the logs.
- Rate limiting is per key, so one throttled client cannot lock out another,
  and `/health` stays reachable while a key is being throttled.
- `CORE_ALLOWED_ORIGINS` is empty by default: no browser origin is allowed
  until you name one.
- `/api/hunter/actions` reuses the same argument allowlist as the web route, so
  the API cannot be used to smuggle arbitrary arguments into the engine.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm build` | Generate the Prisma client, then compile `src/` to `dist/` (ESM + `.d.ts`) |
| `pnpm typecheck` | `tsc --noEmit` across src, tests, scripts, prisma |
| `pnpm test` | Node test runner over `tests/` |
| `pnpm lint` | ESLint, including the "stay framework-agnostic" boundary rule |
| `pnpm serve` | Control API — add `--public` or `--tunnel` to expose it |
| `pnpm serve:start` | Control API from the built `dist/` (production) |
| `pnpm ctl <cmd>` | Remote control client; `pnpm ctl help` lists commands |
| `pnpm worker` | BullMQ workers |
| `pnpm db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma workflows |
| `pnpm scan` / `market:intel` / `ai:smoke` / `match:check` / `embed:all` / `ingest:live` | Engine one-off scripts |

## Hunter: Projects.co.id

Projects.co.id runs in **its own Chrome profile** (`~/.copilot/hunter/projectscoid-profile`,
CDP port 9334) so the session belongs only to that account and never mixes with
the older automation profile. Passwords are never scripted — log in by hand once
and the cookie stays in that profile.

```bash
node hunter/run.js pco-login [--wait 10]                  # opens the login page, waits for you
node hunter/run.js pco-scan [--pages 2]                   # scan dev-relevant categories, score, store
node hunter/run.js pco-bid --auto --limit 3 --dry-run     # fill the bid form without submitting
node hunter/run.js pco-bid --auto --limit 3               # place bids on the best matches
node hunter/run.js pco-bid --project <externalId>         # one specific project
```

Scoring combines the shared keyword matcher with a Projects.co.id strength list
(web, mobile, Python/Go, API, database, AI/LLM, scraping/automation, dashboards).
Postings that are not development work — account trading, gambling, follower
services — are marked `skipped` and never bid on. Bid amounts stay inside the
owner's published budget at `pco_bid_position_pct` of the range, never below
`pco_bid_floor_idr`, and each proposal names the strengths that actually matched.

| Setting | Default | Meaning |
| --- | --- | --- |
| `pco_match_threshold` | `45` | minimum score for auto-bid |
| `pco_bid_floor_idr` | `1000000` | never bid below this (full rupiah) |
| `pco_bid_position_pct` | `35` | position inside the owner's budget range |

## Releasing

Tag a version and let CI publish it:

```bash
pnpm version minor
git push --follow-tags
```

`.github/workflows/release.yml` runs lint, typecheck, tests, and build before
publishing to GitHub Packages.

## Conventions

- ESM only (`"type": "module"`); relative imports carry explicit `.js`
  extensions because the package uses `NodeNext` resolution.
- Never import `@prisma/client` directly — import the generated client
  (`../generated/prisma/index.js`). ESLint enforces this.
- Never import `next`, `react`, or `server-only`. ESLint enforces this too.
- Hunter runtime state (`data/`, `secrets/`) is configured through
  `HUNTER_DATA_DIR`, `HUNTER_DB`, and `HUNTER_SECRETS_DIR` so it never lives
  inside `node_modules`.
