/**
 * End-to-end checks against a real listening server.
 *
 * Every case here is decided before a route handler touches Redis or Postgres,
 * so the suite runs without any infrastructure.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import type { ServerConfig } from "../../src/server/config.js";
import { createControlServer } from "../../src/server/index.js";

const KEY = "e".repeat(32);
const ORIGIN = "http://allowed.test";

let server: Server;
let base: string;

const config: ServerConfig = {
  host: "127.0.0.1",
  port: 0,
  apiKeys: new Set([KEY]),
  allowedOrigins: [ORIGIN],
  rateLimitPerMinute: 60,
  rateLimitBurst: 3,
  maxBodyBytes: 256,
  requestTimeoutMs: 5000,
};

before(async () => {
  server = createControlServer(config);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));

  // The health probe opens a real Redis handle; without closing it the test
  // process stays alive after the last assertion. Prisma is a throwing stub
  // when DATABASE_URL is unset, which is the normal case for this suite.
  try {
    const { prisma } = await import("../../src/db.js");
    await prisma.$disconnect();
  } catch {
    /* stub client, or never connected */
  }
  try {
    const { redis } = await import("../../src/redis.js");
    await redis.quit();
  } catch {
    /* never connected */
  }
});

const auth = { authorization: `Bearer ${KEY}` };

/** Rejected by the embed handler before any queue import — cheap and infra-free. */
function badEmbed(headers: Record<string, string> = {}) {
  return fetch(`${base}/api/jobs/embed`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ table: "nope" }),
  });
}

test("no credentials is rejected", async () => {
  const res = await fetch(`${base}/api/status`);
  assert.equal(res.status, 401);
  assert.equal(((await res.json()) as { error: string }).error, "unauthorized");
});

test("a wrong key is rejected", async () => {
  const res = await fetch(`${base}/api/status`, {
    headers: { authorization: `Bearer ${"x".repeat(32)}` },
  });
  assert.equal(res.status, 401);
});

test("a valid key reaches the handler", async () => {
  const res = await badEmbed(auth);
  assert.equal(res.status, 400);
  assert.equal(((await res.json()) as { error: string }).error, "invalid_request");
});

test("health needs no key", async () => {
  const res = await fetch(`${base}/health`);
  assert.ok([200, 503].includes(res.status), `unexpected ${res.status}`);
  const body = (await res.json()) as { status: string; services: Record<string, unknown> };
  assert.ok(["ok", "degraded"].includes(body.status));
  assert.deepEqual(Object.keys(body.services).sort(), ["database", "ollama", "redis"]);
});

test("unknown routes are 404 and wrong verbs are 405", async () => {
  const missing = await fetch(`${base}/nope`, { headers: auth });
  assert.equal(missing.status, 404);

  const wrongVerb = await fetch(`${base}/api/jobs/scan`, { headers: auth });
  assert.equal(wrongVerb.status, 405);
});

test("malformed json is rejected", async () => {
  const res = await fetch(`${base}/api/jobs/embed`, {
    method: "POST",
    headers: { "content-type": "application/json", ...auth },
    body: "{not json",
  });
  assert.equal(res.status, 400);
  assert.equal(((await res.json()) as { error: string }).error, "invalid_json");
});

test("oversized bodies are cut off", async () => {
  const res = await fetch(`${base}/api/jobs/embed`, {
    method: "POST",
    headers: { "content-type": "application/json", ...auth },
    body: JSON.stringify({ table: "jobs", id: "x".repeat(2000) }),
  });
  assert.equal(res.status, 413);
});

test("cors echoes only the allowlisted origin", async () => {
  const allowed = await fetch(`${base}/health`, { headers: { origin: ORIGIN } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), ORIGIN);

  const denied = await fetch(`${base}/health`, { headers: { origin: "http://evil.test" } });
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
});

test("preflight is answered for allowed origins and refused otherwise", async () => {
  const allowed = await fetch(`${base}/api/status`, {
    method: "OPTIONS",
    headers: { origin: ORIGIN, "access-control-request-method": "GET" },
  });
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("access-control-allow-origin"), ORIGIN);

  const denied = await fetch(`${base}/api/status`, {
    method: "OPTIONS",
    headers: { origin: "http://evil.test", "access-control-request-method": "GET" },
  });
  assert.equal(denied.status, 403);
});

test("responses carry a request id and are never cached", async () => {
  const res = await fetch(`${base}/health`);
  assert.match(res.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("bursting past the limit returns 429 with Retry-After", async () => {
  // A dedicated server so the shared limiter state cannot leak between tests.
  const local = createControlServer({ ...config, rateLimitPerMinute: 60, rateLimitBurst: 2 });
  await new Promise<void>((resolve) => local.listen(0, "127.0.0.1", resolve));
  const localBase = `http://127.0.0.1:${(local.address() as AddressInfo).port}`;

  const hit = () =>
    fetch(`${localBase}/api/jobs/embed`, {
      method: "POST",
      headers: { "content-type": "application/json", ...auth },
      body: JSON.stringify({ table: "nope" }),
    });

  try {
    assert.equal((await hit()).status, 400);
    assert.equal((await hit()).status, 400);

    const limited = await hit();
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) >= 1);

    // Health is open, so throttling a key must not take the probe down with it.
    const health = await fetch(`${localBase}/health`);
    assert.notEqual(health.status, 429);
  } finally {
    await new Promise<void>((resolve) => local.close(() => resolve()));
  }
});
