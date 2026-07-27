/**
 * HTTP control API for karirku-core.
 *
 * Lets you drive the engine — queues, scrapes, embeddings, the hunter — from
 * another machine over the network instead of shelling into this one.
 *
 * Start with `pnpm serve`. Bind beyond loopback only with CORE_API_KEYS set;
 * loadServerConfig() refuses otherwise.
 */
import http from "node:http";
import { randomUUID } from "node:crypto";

import { authEnabled, loadServerConfig, isPubliclyBound, type ServerConfig } from "./config.js";
import {
  authenticate,
  clientIp,
  corsOrigin,
  createRateLimiter,
  parseJsonBody,
  readBody,
  type RateLimiter,
} from "./middleware.js";
import { matchRoute } from "./routes.js";

export { loadServerConfig, type ServerConfig } from "./config.js";
export { routes, matchRoute } from "./routes.js";

function log(level: "info" | "warn" | "error", msg: string, fields: Record<string, unknown> = {}) {
  const line = { level, msg, time: new Date().toISOString(), ...fields };
  const out = level === "error" ? process.stderr : process.stdout;
  out.write(`${JSON.stringify(line)}\n`);
}

export function createControlServer(
  config: ServerConfig,
  limiter: RateLimiter = createRateLimiter(config.rateLimitPerMinute, config.rateLimitBurst),
): http.Server {
  const server = http.createServer((req, res) => {
    const requestId = randomUUID();
    const started = Date.now();

    const send = (status: number, payload: unknown, headers: Record<string, string> = {}) => {
      const origin = corsOrigin(config, req.headers.origin);
      const body = JSON.stringify(payload ?? {});
      res.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
        "x-request-id": requestId,
        // The control API is a machine interface; never let a browser or proxy
        // reuse a queue snapshot or a health probe.
        "cache-control": "no-store",
        ...(origin ? { "access-control-allow-origin": origin, vary: "Origin" } : {}),
        ...headers,
      });
      res.end(body);
      log(status >= 500 ? "error" : "info", "request", {
        requestId,
        method: req.method,
        path: req.url,
        status,
        durationMs: Date.now() - started,
        ip: clientIp(req),
      });
    };

    void (async () => {
      try {
        const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
        const method = req.method ?? "GET";

        if (method === "OPTIONS") {
          const origin = corsOrigin(config, req.headers.origin);
          res.writeHead(origin ? 204 : 403, {
            "x-request-id": requestId,
            ...(origin
              ? {
                  "access-control-allow-origin": origin,
                  "access-control-allow-methods": "GET, POST, OPTIONS",
                  "access-control-allow-headers": "authorization, content-type",
                  "access-control-max-age": "600",
                  vary: "Origin",
                }
              : {}),
          });
          res.end();
          return;
        }

        const matched = matchRoute(method, url.pathname);
        if (matched === null) {
          send(404, { error: "not_found", message: `Tidak ada rute ${method} ${url.pathname}.` });
          return;
        }
        if ("methodMismatch" in matched) {
          send(405, { error: "method_not_allowed", message: `${method} tidak didukung di sini.` });
          return;
        }

        if (!matched.route.open) {
          const auth = authenticate(config, req);
          if (!auth.ok) {
            send(auth.status, { error: auth.error, message: auth.message });
            return;
          }
          const rate = limiter.take(auth.client);
          if (!rate.allowed) {
            send(
              429,
              { error: "rate_limited", message: "Terlalu banyak request; coba lagi sebentar." },
              { "retry-after": String(rate.retryAfterSeconds) },
            );
            return;
          }
        }

        let body = {};
        if (method === "POST") {
          const raw = await readBody(req, config.maxBodyBytes);
          if (!raw.ok) {
            // The request stream was left unread, so this connection can no
            // longer be reused for a subsequent keep-alive request.
            send(raw.status, { error: raw.error, message: raw.message }, { connection: "close" });
            res.on("finish", () => req.socket.destroy());
            return;
          }
          const parsed = parseJsonBody(raw.raw);
          if (!parsed.ok) {
            send(400, { error: "invalid_json", message: "Body harus objek JSON." });
            return;
          }
          body = parsed.body;
        }

        const result = await matched.route.handler({
          params: matched.params,
          body,
          query: url.searchParams,
        });
        send(result.status, result.body);
      } catch (err) {
        log("error", "handler failed", {
          requestId,
          path: req.url,
          error: err instanceof Error ? err.stack : String(err),
        });
        // Never leak internals (connection strings, file paths) to the caller.
        send(500, { error: "internal_error", message: "Terjadi kesalahan internal." });
      }
    })();
  });

  server.requestTimeout = config.requestTimeoutMs;
  server.headersTimeout = config.requestTimeoutMs + 5_000;
  return server;
}

export async function startControlServer(config = loadServerConfig()): Promise<http.Server> {
  const limiter = createRateLimiter(config.rateLimitPerMinute, config.rateLimitBurst);
  const sweeper = setInterval(() => limiter.sweep(), 10 * 60_000);
  sweeper.unref();

  const server = createControlServer(config, limiter);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, () => {
      server.removeListener("error", reject);
      resolve();
    });
  });

  log("info", "control api listening", {
    host: config.host,
    port: config.port,
    auth: authEnabled(config) ? `${config.apiKeys.size} key` : "DISABLED",
    exposed: isPubliclyBound(config.host),
    rateLimitPerMinute: config.rateLimitPerMinute,
    allowedOrigins: config.allowedOrigins,
  });

  const shutdown = (signal: string) => {
    log("info", "shutting down", { signal });
    server.close(() => process.exit(0));
    // Don't hang forever on keep-alive connections.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return server;
}
