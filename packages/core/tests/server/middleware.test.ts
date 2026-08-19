import { test } from "node:test";
import assert from "node:assert/strict";
import type { IncomingMessage } from "node:http";

import type { ServerConfig } from "../../src/server/config.js";
import {
  acceptsKey,
  authenticate,
  bearerFrom,
  clientIp,
  corsOrigin,
  createRateLimiter,
  parseJsonBody,
} from "../../src/server/middleware.js";

const KEY = "k".repeat(32);
const OTHER = "z".repeat(32);

function config(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    host: "127.0.0.1",
    port: 4310,
    apiKeys: new Set(),
    allowedOrigins: [],
    rateLimitPerMinute: 60,
    rateLimitBurst: 10,
    maxBodyBytes: 65536,
    requestTimeoutMs: 30000,
    ...overrides,
  };
}

function req(headers: Record<string, string> = {}, remoteAddress = "1.2.3.4"): IncomingMessage {
  return { headers, socket: { remoteAddress } } as unknown as IncomingMessage;
}

test("acceptsKey matches only exact keys", () => {
  const keys = new Set([KEY, OTHER]);
  assert.equal(acceptsKey(keys, KEY), true);
  assert.equal(acceptsKey(keys, OTHER), true);
  assert.equal(acceptsKey(keys, "k".repeat(31)), false, "prefix must not pass");
  assert.equal(acceptsKey(keys, `${KEY}x`), false, "extension must not pass");
  assert.equal(acceptsKey(keys, ""), false);
  assert.equal(acceptsKey(new Set(), KEY), false);
});

test("bearerFrom only accepts the Bearer scheme", () => {
  assert.equal(bearerFrom(req({ authorization: `Bearer ${KEY}` })), KEY);
  assert.equal(bearerFrom(req({ authorization: `Bearer   ${KEY}  ` })), KEY);
  assert.equal(bearerFrom(req({ authorization: `Basic ${KEY}` })), "");
  assert.equal(bearerFrom(req({ authorization: KEY })), "");
  assert.equal(bearerFrom(req()), "");
});

test("authenticate rejects missing and wrong keys when auth is on", () => {
  const cfg = config({ apiKeys: new Set([KEY]) });

  const missing = authenticate(cfg, req());
  assert.equal(missing.ok, false);
  assert.equal(missing.ok === false && missing.status, 401);

  const wrong = authenticate(cfg, req({ authorization: `Bearer ${OTHER}` }));
  assert.equal(wrong.ok, false);

  const good = authenticate(cfg, req({ authorization: `Bearer ${KEY}` }));
  assert.equal(good.ok, true);
});

test("authenticate falls back to the peer address when auth is off", () => {
  const result = authenticate(config(), req({}, "9.9.9.9"));
  assert.equal(result.ok, true);
  assert.equal(result.ok && result.client, "anon:9.9.9.9");
});

test("client identity never carries the full key", () => {
  const result = authenticate(config({ apiKeys: new Set([KEY]) }), req({
    authorization: `Bearer ${KEY}`,
  }));
  assert.equal(result.ok, true);
  assert.ok(result.ok && !result.client.includes(KEY));
});

test("clientIp prefers proxy headers", () => {
  assert.equal(clientIp(req({ "x-real-ip": "5.5.5.5" })), "5.5.5.5");
  assert.equal(clientIp(req({ "x-forwarded-for": "6.6.6.6, 7.7.7.7" })), "6.6.6.6");
  assert.equal(clientIp(req({}, "8.8.8.8")), "8.8.8.8");
});

test("rate limiter allows the burst then refuses", () => {
  const limiter = createRateLimiter(60, 3);
  assert.equal(limiter.take("a").allowed, true);
  assert.equal(limiter.take("a").allowed, true);
  assert.equal(limiter.take("a").allowed, true);

  const blocked = limiter.take("a");
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);

  // Buckets are per client, so one caller cannot starve another.
  assert.equal(limiter.take("b").allowed, true);
});

test("rate limiter is disabled at zero", () => {
  const limiter = createRateLimiter(0, 1);
  for (let i = 0; i < 100; i += 1) assert.equal(limiter.take("a").allowed, true);
});

test("rate limiter drops idle buckets", () => {
  const limiter = createRateLimiter(60, 2);
  limiter.take("a");
  assert.equal(limiter.size(), 1);
  limiter.sweep(Date.now() + 31 * 60_000);
  assert.equal(limiter.size(), 0);
});

test("cors only echoes allowlisted origins", () => {
  const cfg = config({ allowedOrigins: ["http://ok.test"] });
  assert.equal(corsOrigin(cfg, "http://ok.test"), "http://ok.test");
  assert.equal(corsOrigin(cfg, "http://evil.test"), null);
  assert.equal(corsOrigin(cfg, undefined), null);
  assert.equal(corsOrigin(config(), "http://ok.test"), null, "empty allowlist blocks everything");
  assert.equal(corsOrigin(config({ allowedOrigins: ["*"] }), "http://any.test"), "*");
});

test("parseJsonBody accepts objects and empty bodies only", () => {
  assert.deepEqual(parseJsonBody(""), { ok: true, body: {} });
  assert.deepEqual(parseJsonBody('{"a":1}'), { ok: true, body: { a: 1 } });
  assert.equal(parseJsonBody("[]").ok, false);
  assert.equal(parseJsonBody("null").ok, false);
  assert.equal(parseJsonBody('"str"').ok, false);
  assert.equal(parseJsonBody("{oops}").ok, false);
});
