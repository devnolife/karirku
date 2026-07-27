/**
 * Security middleware for the control API: bearer auth, per-client rate
 * limiting, CORS and a request body cap.
 *
 * Kept dependency-free on purpose — this package must stay framework-agnostic,
 * and everything here is a few dozen lines of standard Node.
 */
import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

import { authEnabled, type ServerConfig } from "./config.js";

/** Compare against every accepted key in constant time. */
export function acceptsKey(keys: Set<string>, presented: string): boolean {
  const presentedBuf = Buffer.from(presented, "utf8");
  let hit = false;
  for (const key of keys) {
    const keyBuf = Buffer.from(key, "utf8");
    // timingSafeEqual throws on length mismatch, so the length check has to
    // come first. Key length is not a secret worth protecting here.
    if (keyBuf.length === presentedBuf.length && timingSafeEqual(keyBuf, presentedBuf)) {
      hit = true;
    }
  }
  return hit;
}

export function bearerFrom(req: IncomingMessage): string {
  const header = req.headers.authorization;
  if (typeof header !== "string") return "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return "";
  return header.slice(prefix.length).trim();
}

export function clientIp(req: IncomingMessage): string {
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.trim()) return real.trim();

  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    const first = forwarded.split(",")[0];
    if (first && first.trim()) return first.trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

export type AuthResult =
  | { ok: true; client: string }
  | { ok: false; status: 401; error: string; message: string };

/**
 * Identify the caller. When auth is disabled the client identity falls back to
 * the peer address so the rate limiter still has something to key on.
 */
export function authenticate(config: ServerConfig, req: IncomingMessage): AuthResult {
  if (!authEnabled(config)) {
    return { ok: true, client: `anon:${clientIp(req)}` };
  }
  const token = bearerFrom(req);
  if (!token || !acceptsKey(config.apiKeys, token)) {
    return {
      ok: false,
      status: 401,
      error: "unauthorized",
      message: "Sertakan header `Authorization: Bearer <CORE_API_KEY>`.",
    };
  }
  // Key the rate limiter on a short prefix so full tokens never reach logs.
  return { ok: true, client: `key:${token.slice(0, 8)}` };
}

interface Bucket {
  tokens: number;
  updatedAt: number;
  seenAt: number;
}

export interface RateLimiter {
  take(client: string): { allowed: boolean; retryAfterSeconds: number };
  /** Drops buckets untouched for a while; exposed so tests can run it directly. */
  sweep(now?: number): void;
  size(): number;
}

/**
 * Token bucket, refilled continuously at perMinute/60 per second.
 * perMinute <= 0 disables limiting entirely.
 */
export function createRateLimiter(perMinute: number, burst: number): RateLimiter {
  if (perMinute <= 0) {
    return {
      take: () => ({ allowed: true, retryAfterSeconds: 0 }),
      sweep: () => {},
      size: () => 0,
    };
  }
  const capacity = Math.max(1, burst);
  const refillPerMs = perMinute / 60_000;
  const buckets = new Map<string, Bucket>();
  const idleMs = 30 * 60_000;

  return {
    take(client) {
      const now = Date.now();
      let bucket = buckets.get(client);
      if (!bucket) {
        bucket = { tokens: capacity, updatedAt: now, seenAt: now };
        buckets.set(client, bucket);
      }
      bucket.tokens = Math.min(
        capacity,
        bucket.tokens + (now - bucket.updatedAt) * refillPerMs,
      );
      bucket.updatedAt = now;
      bucket.seenAt = now;

      if (bucket.tokens < 1) {
        const waitMs = (1 - bucket.tokens) / refillPerMs;
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)) };
      }
      bucket.tokens -= 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
    sweep(now = Date.now()) {
      for (const [client, bucket] of buckets) {
        if (now - bucket.seenAt > idleMs) buckets.delete(client);
      }
    },
    size: () => buckets.size,
  };
}

/** Returns the value for Access-Control-Allow-Origin, or null to omit it. */
export function corsOrigin(config: ServerConfig, origin: string | undefined): string | null {
  if (!origin) return null;
  if (config.allowedOrigins.includes("*")) return "*";
  return config.allowedOrigins.includes(origin) ? origin : null;
}

export type BodyResult =
  | { ok: true; raw: string }
  | { ok: false; status: 413 | 400; error: string; message: string };

/** Read the request body, stopping as soon as the cap is exceeded. */
export function readBody(req: IncomingMessage, maxBytes: number): Promise<BodyResult> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let settled = false;

    const finish = (result: BodyResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxBytes) {
        // Stop buffering, but leave the socket alive: destroying it here would
        // kill the connection before the 413 could be written, and the caller
        // would see a transport error instead of a clear status. The route
        // layer closes the connection once the response is flushed.
        req.pause();
        finish({
          ok: false,
          status: 413,
          error: "payload_too_large",
          message: `Body melebihi ${maxBytes} byte.`,
        });
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => finish({ ok: true, raw: Buffer.concat(chunks).toString("utf8") }));
    req.on("error", () =>
      finish({ ok: false, status: 400, error: "bad_request", message: "Gagal membaca body." }),
    );
    req.on("aborted", () =>
      finish({ ok: false, status: 400, error: "bad_request", message: "Request dibatalkan." }),
    );
  });
}

export type JsonBody = Record<string, unknown>;

export function parseJsonBody(raw: string): { ok: true; body: JsonBody } | { ok: false } {
  if (raw.trim() === "") return { ok: true, body: {} };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false };
    }
    return { ok: true, body: parsed as JsonBody };
  } catch {
    return { ok: false };
  }
}
