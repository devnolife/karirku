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

interface HunterLock {
  ownerId: string;
  pid: number | null;
  command: string;
  startedAt: string;
}

interface HunterLockModule {
  reserveLock(command: string):
    | { ok: true; lock: HunterLock }
    | { ok: false; lock: HunterLock | null };
  isLocked(): HunterLock | null;
  releaseLock(ownerId: string): void;
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
export function spawnHunter(
  args: string[],
  lockOwnerId?: string,
): { pid: number | undefined } {
  const child = spawn(process.execPath, ["hunter/run.js", ...args], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
    env: lockOwnerId
      ? { ...process.env, HUNTER_LOCK_OWNER: lockOwnerId }
      : process.env,
  });
  child.unref();
  return { pid: child.pid };
}

export function hunterBusy(): HunterLock | null {
  const locks = projectRequire("./hunter/lock.js") as HunterLockModule;
  return locks.isLocked();
}

export function reserveHunter(command: string):
  | { ok: true; lock: HunterLock }
  | { ok: false; lock: HunterLock | null } {
  const locks = projectRequire("./hunter/lock.js") as HunterLockModule;
  return locks.reserveLock(command);
}

export function releaseHunter(ownerId: string): void {
  const locks = projectRequire("./hunter/lock.js") as HunterLockModule;
  locks.releaseLock(ownerId);
}

const SCAN_PLATFORMS = new Set([
  "all",
  "freelancer",
  "jobstreet",
  "linkedin",
  "upwork",
]);

function integerInRange(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number | null {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number(String(value));
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

const ALLOWED_ACTIONS: Record<string, (body: Row) => string[] | null> = {
  scan: (b) => {
    const platform =
      typeof b.platform === "string" ? b.platform.toLowerCase() : "all";
    return SCAN_PLATFORMS.has(platform) ? ["scan", platform] : null;
  },
  apply: (b) => {
    if (b.jobId !== undefined) {
      const jobId = integerInRange(b.jobId, 0, 1, Number.MAX_SAFE_INTEGER);
      return jobId ? ["apply", "--job", String(jobId)] : null;
    }
    const limit = integerInRange(b.limit, 3, 1, 20);
    return limit ? ["apply", "--auto", "--limit", String(limit)] : null;
  },
  "sync-email": (b) => {
    const days = integerInRange(b.days, 30, 1, 90);
    return days ? ["sync-email", "--days", String(days)] : null;
  },
  "import-applied": () => ["import-applied"],
  full: () => ["full"],
};

export function actionToArgs(action: string, body: Row): string[] | null {
  const fn = ALLOWED_ACTIONS[action];
  return fn ? fn(body) : null;
}
