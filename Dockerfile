# syntax=docker/dockerfile:1.7
#
# Next.js application image.
#
# The engine is consumed through pnpm's `link:../karirku-core` override, so it
# has to exist on disk next to the app rather than be downloaded from a
# registry. Copying it out of the already-built engine image keeps a single
# source of truth: the same dist/ and Prisma client run in the web server and
# in the workers.
#
# Build (from this directory):
#   docker build -t karirku-core:latest ../karirku-core
#   docker build -t karirku-web:latest .
#
# docker compose does both in the right order.

ARG NODE_VERSION=22
ARG CORE_IMAGE=karirku-core:latest

FROM ${CORE_IMAGE} AS core

# ---------------------------------------------------------------------------
# deps
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS deps

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable

# Must sit at ../karirku-core relative to /app for the override to resolve.
COPY --from=core /karirku-core /karirku-core

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store-web,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# build
# ---------------------------------------------------------------------------
FROM deps AS build

COPY tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs ./
COPY public ./public
COPY src ./src
COPY ai ./ai

# Type errors are caught by `pnpm typecheck` in CI; next.config.ts skips them
# during the build to keep peak memory down.
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

RUN --mount=type=cache,id=pnpm-store-web,target=/pnpm/store \
    pnpm prune --prod

# ---------------------------------------------------------------------------
# runtime
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3030 \
    HOSTNAME=0.0.0.0 \
    HUNTER_DATA_DIR=/data \
    HUNTER_DB=/data/hunter.db \
    HUNTER_SECRETS_DIR=/data/secrets

# Shipped whole rather than as a standalone bundle: the engine is a linked
# package with a native addon (better-sqlite3) and a generated Prisma client,
# which Next's file tracing routinely misses.
COPY --from=core --chown=nextjs:nodejs /karirku-core /karirku-core

WORKDIR /app
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/ai ./ai
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

RUN mkdir -p /data/secrets && chown -R nextjs:nodejs /data
USER nextjs

EXPOSE 3030

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3030/api/health || exit 1

CMD ["./node_modules/.bin/next", "start", "-p", "3030"]
