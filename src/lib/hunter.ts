// Bridge between Next.js route handlers and the CommonJS hunter engine.
// Loaded via createRequire from the project root so better-sqlite3 (native)
// is resolved at runtime instead of being bundled.
import path from "path";
import { createRequire } from "module";
import { spawn } from "child_process";

const projectRequire = createRequire(path.join(process.cwd(), "package.json"));

type Row = Record<string, unknown>;

interface HunterDbModule {
  getDb(): {
    prepare(sql: string): {
      all(...params: unknown[]): Row[];
      get(...params: unknown[]): Row | undefined;
      run(...params: unknown[]): unknown;
    };
  };
  getSetting(key: string, fallback?: string): string;
  setSetting(key: string, value: string): void;
}

let cached: HunterDbModule | null = null;

export function hunterDb(): HunterDbModule {
  if (!cached) cached = projectRequire("./hunter/db.js") as HunterDbModule;
  return cached;
}

export function gmailStatus(): Row {
  const gmail = projectRequire("./hunter/email/gmail.js") as { status(): Row };
  return gmail.status();
}

/** Fire-and-forget a hunter CLI command; the engine logs into the runs table. */
export function spawnHunter(args: string[]): { pid: number | undefined } {
  const child = spawn(process.execPath, ["hunter/run.js", ...args], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return { pid: child.pid };
}

const ALLOWED_ACTIONS: Record<string, (body: Row) => string[]> = {
  scan: (b) => ["scan", typeof b.platform === "string" ? b.platform : "all"],
  apply: (b) =>
    typeof b.jobId === "number" ? ["apply", "--job", String(b.jobId)] : ["apply", "--auto", "--limit", String(b.limit ?? 3)],
  "sync-email": (b) => ["sync-email", "--days", String(b.days ?? 30)],
  "import-applied": () => ["import-applied"],
  full: () => ["full"],
};

export function actionToArgs(action: string, body: Row): string[] | null {
  const fn = ALLOWED_ACTIONS[action];
  return fn ? fn(body) : null;
}
