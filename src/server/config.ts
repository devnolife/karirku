/**
 * Configuration for the control API.
 *
 * Everything is read from the environment so the same build can run bound to
 * loopback on a laptop or to a public interface on a server.
 */

export interface ServerConfig {
  host: string;
  port: number;
  /** Accepted bearer tokens. Empty means auth is disabled. */
  apiKeys: Set<string>;
  /** CORS allowlist. Empty means no browser origin is allowed. */
  allowedOrigins: string[];
  rateLimitPerMinute: number;
  rateLimitBurst: number;
  maxBodyBytes: number;
  requestTimeoutMs: number;
}

function env(name: string, fallback = ""): string {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} harus berupa angka non-negatif, dapat "${raw}"`);
  }
  return Math.floor(parsed);
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** A host that is not loopback is reachable by other machines. */
export function isPubliclyBound(host: string): boolean {
  return host !== "127.0.0.1" && host !== "::1" && host !== "localhost";
}

export function loadServerConfig(): ServerConfig {
  const host = env("CORE_HOST", "127.0.0.1");
  const apiKeys = new Set(splitCsv(env("CORE_API_KEYS")));

  // Binding beyond loopback without a key would hand the queues, the database
  // and the hunter process spawner to anyone who can reach the port.
  if (isPubliclyBound(host) && apiKeys.size === 0) {
    throw new Error(
      `CORE_HOST=${host} membuka port ini ke jaringan, tapi CORE_API_KEYS kosong. ` +
        "Set CORE_API_KEYS dulu (`openssl rand -hex 32`), atau pakai CORE_HOST=127.0.0.1.",
    );
  }

  for (const key of apiKeys) {
    if (key.length < 16) {
      throw new Error(
        "Setiap entri CORE_API_KEYS minimal 16 karakter; pakai `openssl rand -hex 32`.",
      );
    }
  }

  return {
    host,
    port: envInt("CORE_PORT", 4310),
    apiKeys,
    allowedOrigins: splitCsv(env("CORE_ALLOWED_ORIGINS")),
    rateLimitPerMinute: envInt("CORE_RATE_LIMIT_PER_MINUTE", 60),
    rateLimitBurst: envInt("CORE_RATE_LIMIT_BURST", 10),
    maxBodyBytes: envInt("CORE_MAX_BODY_BYTES", 64 * 1024),
    requestTimeoutMs: envInt("CORE_REQUEST_TIMEOUT_MS", 30_000),
  };
}

export function authEnabled(config: ServerConfig): boolean {
  return config.apiKeys.size > 0;
}
