import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
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
      await redis.connect().catch(() => {});
      return redis.ping();
    }),
    timed(async () => {
      const base = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1";
      const url = base.replace(/\/v1\/?$/, "") + "/api/tags";
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
  ]);

  const allOk = database.ok && redisStatus.ok && ollama.ok;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      services: { database, redis: redisStatus, ollama },
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
