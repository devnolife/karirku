import { prisma } from "@devnolife/karirku-core/db";
import { redis } from "@devnolife/karirku-core/redis";
import { NextResponse } from "next/server";

interface ServiceStatus {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

async function timed<T>(fn: () => Promise<T>): Promise<ServiceStatus> {
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

export async function GET() {
  const [database, redisStatus, ollama] = await Promise.all([
    timed(() => prisma.$queryRaw`SELECT 1`),
    timed(async () => {
      await redis.connect().catch(() => { });
      return redis.ping();
    }),
    timed(async () => {
      const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
      const url = base.replace(/\/v1\/?$/, "") + "/api/tags";
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
  ]);

  // Only the database decides the status code. Redis and the LLM backend
  // degrade features — queued work piles up, AI answers fall back — but pages
  // still render, so reporting 503 would take a working deployment out of the
  // load balancer over an optional dependency.
  const healthy = database.ok;
  const degraded = !redisStatus.ok || !ollama.ok;

  return NextResponse.json(
    {
      status: !healthy ? "down" : degraded ? "degraded" : "ok",
      services: { database, redis: redisStatus, ollama },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
