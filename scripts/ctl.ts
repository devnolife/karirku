/**
 * Remote control CLI for the karirku-core control API.
 *
 * Talks to a running server over HTTP, so it works the same whether that
 * server is on this machine or reachable through a public address:
 *
 *   CORE_URL=https://core.example.com CORE_API_KEY=... pnpm ctl status
 *
 * Run: pnpm ctl <command> [flags]
 */
import { config as loadEnv } from "dotenv";

// quiet: the CLI's stdout is meant to be piped into jq or a script, so the
// dotenv banner must not end up mixed into the JSON.
loadEnv({ path: ".env", quiet: true });
loadEnv({ path: ".env.local", override: true, quiet: true });

const BASE_URL = (process.env.CORE_URL ?? "http://127.0.0.1:4310").replace(/\/+$/, "");
const API_KEY = process.env.CORE_API_KEY ?? "";

const USAGE = `karirku-core control CLI

  pnpm ctl health                      probe database / redis / ollama (no key needed)
  pnpm ctl status                      full snapshot: services, queues, hunter lock
  pnpm ctl queues                      job counts per queue
  pnpm ctl pause <queue>               stop a queue (scraper|enrich|embed|market-intel)
  pnpm ctl resume <queue>              restart it
  pnpm ctl scan                        enqueue a portal scrape
  pnpm ctl market-intel                enqueue today's aggregation
  pnpm ctl embed --table jobs --id <id>  enqueue one embedding
  pnpm ctl job <queue> <id>            inspect a job
  pnpm ctl hunter status               lock + gmail state
  pnpm ctl hunter runs [--limit n]     recent hunter runs
  pnpm ctl hunter run <action> [...]   scan|apply|sync-email|import-applied|full

Environment:
  CORE_URL       base URL of the control API (default http://127.0.0.1:4310)
  CORE_API_KEY   bearer token; must match one entry of the server's CORE_API_KEYS
`;

interface Flags {
  positional: string[];
  options: Record<string, string>;
}

function parseArgs(argv: string[]): Flags {
  const positional: string[] = [];
  const options: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] as string;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        options[key] = next;
        i += 1;
      } else {
        options[key] = "true";
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, options };
}

async function request(method: "GET" | "POST", path: string, body?: unknown): Promise<number> {
  const url = `${BASE_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(API_KEY ? { authorization: `Bearer ${API_KEY}` } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error(`✖ tidak bisa menghubungi ${url}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    console.error("  Pastikan server jalan (`pnpm serve`) dan CORE_URL benar.");
    return 1;
  }

  const text = await res.text();
  let payload: unknown = text;
  try {
    payload = JSON.parse(text);
  } catch {
    /* keep raw text */
  }

  if (!res.ok) {
    console.error(`✖ HTTP ${res.status}`);
    console.error(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
    if (res.status === 401) {
      console.error("  Set CORE_API_KEY agar cocok dengan CORE_API_KEYS di server.");
    }
    return 1;
  }

  console.log(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  return 0;
}

function requireArg(value: string | undefined, name: string): string {
  if (!value) {
    console.error(`✖ argumen \`${name}\` wajib diisi.`);
    process.exit(2);
  }
  return value;
}

async function main(): Promise<number> {
  const { positional, options } = parseArgs(process.argv.slice(2));
  const command = positional[0];

  if (!command || command === "help" || options.help) {
    console.log(USAGE);
    return command ? 0 : 2;
  }

  switch (command) {
    case "health":
      return request("GET", "/health");
    case "status":
      return request("GET", "/api/status");
    case "queues":
      return request("GET", "/api/queues");
    case "pause":
      return request("POST", `/api/queues/${requireArg(positional[1], "queue")}/pause`);
    case "resume":
      return request("POST", `/api/queues/${requireArg(positional[1], "queue")}/resume`);
    case "scan":
      return request("POST", "/api/jobs/scan", {});
    case "market-intel":
      return request("POST", "/api/jobs/market-intel", {});
    case "embed":
      return request("POST", "/api/jobs/embed", {
        table: requireArg(options.table, "--table"),
        id: requireArg(options.id, "--id"),
      });
    case "job":
      return request(
        "GET",
        `/api/jobs/${requireArg(positional[1], "queue")}/${requireArg(positional[2], "id")}`,
      );
    case "hunter": {
      const sub = positional[1];
      if (sub === "status") return request("GET", "/api/hunter/status");
      if (sub === "runs") {
        const limit = options.limit ? `?limit=${encodeURIComponent(options.limit)}` : "";
        return request("GET", `/api/hunter/runs${limit}`);
      }
      if (sub === "run") {
        const body: Record<string, unknown> = { action: requireArg(positional[2], "action") };
        for (const [key, value] of Object.entries(options)) {
          const asNumber = Number(value);
          body[key] = value !== "true" && Number.isFinite(asNumber) ? asNumber : value;
        }
        return request("POST", "/api/hunter/actions", body);
      }
      console.error("✖ subcommand hunter: status | runs | run");
      return 2;
    }
    default:
      console.error(`✖ command tidak dikenal: ${command}\n`);
      console.log(USAGE);
      return 2;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
