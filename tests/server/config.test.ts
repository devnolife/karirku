import { test } from "node:test";
import assert from "node:assert/strict";

import { loadServerConfig, isPubliclyBound, authEnabled } from "../../src/server/config.js";

const KEY_A = "a".repeat(32);
const KEY_B = "b".repeat(32);

function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const CLEAN: Record<string, string | undefined> = {
  CORE_HOST: undefined,
  CORE_PORT: undefined,
  CORE_API_KEYS: undefined,
  CORE_ALLOWED_ORIGINS: undefined,
  CORE_RATE_LIMIT_PER_MINUTE: undefined,
  CORE_RATE_LIMIT_BURST: undefined,
  CORE_MAX_BODY_BYTES: undefined,
  CORE_REQUEST_TIMEOUT_MS: undefined,
};

test("default config binds loopback with auth disabled", () => {
  const cfg = withEnv(CLEAN, () => loadServerConfig());
  assert.equal(cfg.host, "127.0.0.1");
  assert.equal(cfg.port, 4310);
  assert.equal(authEnabled(cfg), false);
  assert.equal(isPubliclyBound(cfg.host), false);
});

test("binding to a public interface without keys is refused", () => {
  assert.throws(
    () => withEnv({ ...CLEAN, CORE_HOST: "0.0.0.0" }, () => loadServerConfig()),
    /CORE_API_KEYS kosong/,
  );
  assert.throws(
    () => withEnv({ ...CLEAN, CORE_HOST: "10.33.33.11" }, () => loadServerConfig()),
    /CORE_API_KEYS kosong/,
  );
});

test("binding to a public interface with keys is allowed", () => {
  const cfg = withEnv({ ...CLEAN, CORE_HOST: "0.0.0.0", CORE_API_KEYS: KEY_A }, () =>
    loadServerConfig(),
  );
  assert.equal(cfg.host, "0.0.0.0");
  assert.equal(authEnabled(cfg), true);
  assert.equal(isPubliclyBound(cfg.host), true);
});

test("short keys are rejected so a typo cannot become the password", () => {
  assert.throws(
    () => withEnv({ ...CLEAN, CORE_API_KEYS: "secret" }, () => loadServerConfig()),
    /minimal 16 karakter/,
  );
});

test("csv fields are split and trimmed", () => {
  const cfg = withEnv(
    {
      ...CLEAN,
      CORE_API_KEYS: ` ${KEY_A} , ${KEY_B} `,
      CORE_ALLOWED_ORIGINS: "http://a.test, http://b.test",
    },
    () => loadServerConfig(),
  );
  assert.equal(cfg.apiKeys.size, 2);
  assert.ok(cfg.apiKeys.has(KEY_A));
  assert.ok(cfg.apiKeys.has(KEY_B));
  assert.deepEqual(cfg.allowedOrigins, ["http://a.test", "http://b.test"]);
});

test("numeric env vars are validated", () => {
  assert.throws(
    () => withEnv({ ...CLEAN, CORE_PORT: "abc" }, () => loadServerConfig()),
    /angka non-negatif/,
  );
  const cfg = withEnv({ ...CLEAN, CORE_RATE_LIMIT_PER_MINUTE: "5" }, () => loadServerConfig());
  assert.equal(cfg.rateLimitPerMinute, 5);
});
