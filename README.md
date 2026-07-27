# @devnolife/karirku-core

Engine half of [Karirku](https://github.com/devnolife/karirku): LLM, OCR,
matching, scraping, queues, workers, and all data access.

This package is **framework-agnostic** — no Next.js, no React, no DOM. It is
consumed by the web app (`devnolife/karirku`) and can also run standalone as a
worker process. The dependency direction is one-way and enforced by ESLint:

```
devnolife/karirku  (Next.js app)  ──depends on──▶  @devnolife/karirku-core
```

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
| Hunter | `hunter/` + `src/hunter.ts` | CommonJS job-automation engine, spawned as a child process |

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

Publishing a version for every change is painful. Link the package locally
instead — from the web repo:

```bash
# devnolife/karirku
pnpm link ../karirku-core
```

…or add an override to the web app's `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "@devnolife/karirku-core": "link:../karirku-core"
    }
  }
}
```

Run `pnpm build` here after changing core code so the web app picks up the new
`dist/`. Undo the link before shipping.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm build` | Generate the Prisma client, then compile `src/` to `dist/` (ESM + `.d.ts`) |
| `pnpm typecheck` | `tsc --noEmit` across src, tests, scripts, prisma |
| `pnpm test` | Node test runner over `tests/` |
| `pnpm lint` | ESLint, including the "stay framework-agnostic" boundary rule |
| `pnpm db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma workflows |
| `pnpm scan` / `market:intel` / `ai:smoke` / `match:check` / `embed:all` / `ingest:live` | Engine one-off scripts |

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
