/**
 * Route table for the control API.
 *
 * Handlers import the heavy modules (queues, Prisma, the hunter engine) lazily
 * so that requiring this file — in tests, or just to list routes — does not
 * open a Redis connection or a database pool.
 */
import { actionToArgs } from "../hunter.js";
import type { JsonBody } from "./middleware.js";

export interface RouteContext {
  params: Record<string, string>;
  body: JsonBody;
  query: URLSearchParams;
}

export interface RouteResponse {
  status: number;
  body: unknown;
}

export interface Route {
  method: "GET" | "POST";
  /** Pattern segments; ":name" captures into params. */
  pattern: string;
  /** Health is intentionally reachable without a key, for uptime probes. */
  open?: boolean;
  handler: (ctx: RouteContext) => Promise<RouteResponse>;
}

const QUEUE_KEYS = ["scraper", "enrich", "embed", "market-intel"] as const;
type QueueKey = (typeof QUEUE_KEYS)[number];

function isQueueKey(value: string): value is QueueKey {
  return (QUEUE_KEYS as readonly string[]).includes(value);
}

async function queueByKey(key: QueueKey) {
  const queues = await import("../queue/index.js");
  switch (key) {
    case "scraper":
      return queues.scraperQueue;
    case "enrich":
      return queues.enrichQueue;
    case "embed":
      return queues.embedQueue;
    case "market-intel":
      return queues.marketIntelQueue;
  }
}

async function timed(fn: () => Promise<unknown>) {
  const start = Date.now();
  try {
    await fn();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkDatabase() {
  return timed(async () => {
    const { prisma } = await import("../db.js");
    await prisma.$queryRaw`SELECT 1`;
  });
}

async function checkRedis() {
  return timed(async () => {
    const { redis } = await import("../redis.js");
    await redis.connect().catch(() => {});
    await redis.ping();
  });
}

async function checkOllama() {
  return timed(async () => {
    const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
    const url = base.replace(/\/v1\/?$/, "") + "/api/tags";
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });
}

async function queueCounts() {
  const out: Record<string, unknown> = {};
  for (const key of QUEUE_KEYS) {
    const queue = await queueByKey(key);
    const [counts, paused] = await Promise.all([
      queue.getJobCounts("waiting", "active", "completed", "failed", "delayed"),
      queue.isPaused(),
    ]);
    out[key] = { ...counts, paused };
  }
  return out;
}

function badRequest(message: string): RouteResponse {
  return { status: 400, body: { error: "invalid_request", message } };
}

export const routes: Route[] = [
  {
    method: "GET",
    pattern: "/health",
    open: true,
    handler: async () => {
      const [database, redis, ollama] = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkOllama(),
      ]);
      const ok = database.ok && redis.ok && ollama.ok;
      return {
        status: ok ? 200 : 503,
        body: {
          status: ok ? "ok" : "degraded",
          services: { database, redis, ollama },
          timestamp: new Date().toISOString(),
        },
      };
    },
  },

  {
    method: "GET",
    pattern: "/api/status",
    handler: async () => {
      const [database, redis, ollama, queues] = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkOllama(),
        queueCounts().catch((err: unknown) => ({
          error: err instanceof Error ? err.message : String(err),
        })),
      ]);
      const { hunterBusy } = await import("../hunter.js");
      let hunter: unknown;
      try {
        hunter = { lock: hunterBusy() };
      } catch (err) {
        hunter = { error: err instanceof Error ? err.message : String(err) };
      }
      return {
        status: 200,
        body: {
          services: { database, redis, ollama },
          queues,
          hunter,
          uptimeSeconds: Math.round(process.uptime()),
          timestamp: new Date().toISOString(),
        },
      };
    },
  },

  {
    method: "GET",
    pattern: "/api/queues",
    handler: async () => ({ status: 200, body: { queues: await queueCounts() } }),
  },

  {
    method: "POST",
    pattern: "/api/queues/:name/pause",
    handler: async ({ params }) => {
      const name = params.name ?? "";
      if (!isQueueKey(name)) return badRequest(`Queue tidak dikenal: ${name}`);
      const queue = await queueByKey(name);
      await queue.pause();
      return { status: 200, body: { ok: true, queue: name, paused: true } };
    },
  },

  {
    method: "POST",
    pattern: "/api/queues/:name/resume",
    handler: async ({ params }) => {
      const name = params.name ?? "";
      if (!isQueueKey(name)) return badRequest(`Queue tidak dikenal: ${name}`);
      const queue = await queueByKey(name);
      await queue.resume();
      return { status: 200, body: { ok: true, queue: name, paused: false } };
    },
  },

  {
    method: "POST",
    pattern: "/api/jobs/scan",
    handler: async () => {
      const { scraperQueue } = await import("../queue/index.js");
      const { loadEnabledPortalRegistry } = await import("../scraper/sources.js");
      const registry = await loadEnabledPortalRegistry();
      const job = await scraperQueue.add("scan-portals", {});
      return {
        status: 202,
        body: {
          ok: true,
          jobId: job.id,
          queue: "scraper",
          sources: registry.portals.length,
          registryOrigin: registry.origin,
        },
      };
    },
  },

  {
    method: "POST",
    pattern: "/api/jobs/market-intel",
    handler: async () => {
      const { marketIntelQueue } = await import("../queue/index.js");
      const snapshotDate = new Date().toISOString().slice(0, 10);
      const jobId = `market-intel-${snapshotDate}`;

      // Same de-duplication the CLI does: one aggregation per day, unless the
      // previous attempt failed.
      const existing = await marketIntelQueue.getJob(jobId);
      if (existing) {
        const state = await existing.getState();
        if (state !== "failed") {
          return {
            status: 200,
            body: { ok: true, jobId, queue: "market-intel", state, deduplicated: true },
          };
        }
        await existing.remove();
      }

      const job = await marketIntelQueue.add(
        "aggregate-daily",
        { snapshotDate },
        {
          jobId,
          attempts: 3,
          backoff: { type: "exponential", delay: 5_000 },
          removeOnComplete: { age: 120 * 86_400, count: 180 },
          removeOnFail: { age: 120 * 86_400, count: 180 },
        },
      );
      return {
        status: 202,
        body: { ok: true, jobId: job.id, queue: "market-intel", snapshotDate },
      };
    },
  },

  {
    method: "POST",
    pattern: "/api/jobs/embed",
    handler: async ({ body }) => {
      const table = typeof body.table === "string" ? body.table : "";
      const id = typeof body.id === "string" ? body.id : "";
      if (!["jobs", "courses", "profiles"].includes(table)) {
        return badRequest("`table` harus salah satu dari jobs|courses|profiles.");
      }
      if (!id) return badRequest("`id` wajib diisi.");
      const { embedQueue } = await import("../queue/index.js");
      const job = await embedQueue.add("embed", { table, id });
      return { status: 202, body: { ok: true, jobId: job.id, queue: "embed", table, id } };
    },
  },

  {
    method: "GET",
    pattern: "/api/jobs/:queue/:id",
    handler: async ({ params }) => {
      const name = params.queue ?? "";
      if (!isQueueKey(name)) return badRequest(`Queue tidak dikenal: ${name}`);
      const queue = await queueByKey(name);
      const job = await queue.getJob(params.id ?? "");
      if (!job) return { status: 404, body: { error: "not_found", message: "Job tidak ada." } };
      return {
        status: 200,
        body: {
          id: job.id,
          name: job.name,
          state: await job.getState(),
          attemptsMade: job.attemptsMade,
          data: job.data,
          returnValue: job.returnvalue,
          failedReason: job.failedReason,
          timestamp: job.timestamp,
          finishedOn: job.finishedOn,
        },
      };
    },
  },

  {
    method: "GET",
    pattern: "/api/hunter/status",
    handler: async () => {
      const { hunterBusy, gmailStatus } = await import("../hunter.js");
      let gmail: unknown = null;
      try {
        gmail = gmailStatus();
      } catch (err) {
        gmail = { error: err instanceof Error ? err.message : String(err) };
      }
      return { status: 200, body: { lock: hunterBusy(), gmail } };
    },
  },

  {
    method: "GET",
    pattern: "/api/hunter/runs",
    handler: async ({ query }) => {
      const rawLimit = Number(query.get("limit") ?? "50");
      const limit = Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 200 ? rawLimit : 50;
      const { hunterDb } = await import("../hunter.js");
      const runs = hunterDb()
        .getDb()
        .prepare(
          "SELECT id, type, platform, ok, stats_json, started_at, finished_at " +
            "FROM runs ORDER BY id DESC LIMIT ?",
        )
        .all(limit);
      return { status: 200, body: { runs } };
    },
  },

  {
    method: "POST",
    pattern: "/api/hunter/actions",
    handler: async ({ body }) => {
      const action = typeof body.action === "string" ? body.action : "";
      const args = actionToArgs(action, body);
      if (!args) {
        return {
          status: 400,
          body: { error: "invalid_action", message: "Action atau parameter tidak valid." },
        };
      }
      const { reserveHunter, releaseHunter, spawnHunter } = await import("../hunter.js");
      const reservation = reserveHunter(action);
      if (!reservation.ok) {
        return {
          status: 409,
          body: {
            error: "hunter_busy",
            message: `Hunter sedang menjalankan ${reservation.lock?.command ?? "command lain"}.`,
            lock: reservation.lock,
          },
        };
      }
      try {
        const { pid } = spawnHunter(args, reservation.lock.ownerId);
        return { status: 202, body: { ok: true, pid, args } };
      } catch (err) {
        releaseHunter(reservation.lock.ownerId);
        throw err;
      }
    },
  },
];

export interface MatchedRoute {
  route: Route;
  params: Record<string, string>;
}

/** Exact-length segment match; ":name" segments capture. */
export function matchRoute(
  method: string,
  pathname: string,
): MatchedRoute | { methodMismatch: true } | null {
  const parts = pathname.split("/").filter((p) => p !== "");
  let methodMismatch = false;

  for (const route of routes) {
    const patternParts = route.pattern.split("/").filter((p) => p !== "");
    if (patternParts.length !== parts.length) continue;

    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < patternParts.length; i += 1) {
      const expected = patternParts[i] as string;
      const actual = parts[i] as string;
      if (expected.startsWith(":")) {
        params[expected.slice(1)] = decodeURIComponent(actual);
      } else if (expected !== actual) {
        matched = false;
        break;
      }
    }
    if (!matched) continue;
    if (route.method !== method) {
      methodMismatch = true;
      continue;
    }
    return { route, params };
  }
  return methodMismatch ? { methodMismatch: true } : null;
}
