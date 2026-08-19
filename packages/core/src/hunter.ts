// Bridge between HTTP route handlers and the CommonJS hunter engine.
// The engine is shipped inside this package (`hunter/`) and loaded through
// createRequire so better-sqlite3 (native) is resolved at runtime instead of
// being bundled. Paths are resolved relative to this module, not to
// process.cwd(), because consumers run from their own working directory.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const moduleRequire = createRequire(import.meta.url);

/** Package root — this file sits one level deep in both `src/` and `dist/`. */
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HUNTER_DIR = path.join(PACKAGE_ROOT, "hunter");

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
  if (!cached) cached = moduleRequire("../hunter/db.js") as HunterDbModule;
  return cached;
}

export function gmailStatus(): Row {
  const gmail = moduleRequire("../hunter/email/gmail.js") as { status(): Row };
  return gmail.status();
}

/** Fire-and-forget a hunter CLI command; the engine logs into the runs table. */
export function spawnHunter(
  args: string[],
  lockOwnerId?: string,
): { pid: number | undefined } {
  const child = spawn(process.execPath, [path.join(HUNTER_DIR, "run.js"), ...args], {
    cwd: PACKAGE_ROOT,
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
  const locks = moduleRequire("../hunter/lock.js") as HunterLockModule;
  return locks.isLocked();
}

export function reserveHunter(command: string):
  | { ok: true; lock: HunterLock }
  | { ok: false; lock: HunterLock | null } {
  const locks = moduleRequire("../hunter/lock.js") as HunterLockModule;
  return locks.reserveLock(command);
}

export function releaseHunter(ownerId: string): void {
  const locks = moduleRequire("../hunter/lock.js") as HunterLockModule;
  locks.releaseLock(ownerId);
}

const SCAN_PLATFORMS = new Set([
  "all",
  "freelancer",
  "jobstreet",
  "linkedin",
  "upwork",
  "projectscoid",
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
  "pco-scan": (b) => {
    const pages = integerInRange(b.pages, 2, 1, 10);
    return pages ? ["pco-scan", "--pages", String(pages)] : null;
  },
  "pco-bid": (b) => {
    const dry = b.dryRun ? ["--dry-run"] : [];
    if (b.jobId !== undefined) {
      const jobId = integerInRange(b.jobId, 0, 1, Number.MAX_SAFE_INTEGER);
      return jobId ? ["pco-bid", "--job", String(jobId), ...dry] : null;
    }
    const limit = integerInRange(b.limit, 3, 1, 20);
    return limit ? ["pco-bid", "--auto", "--limit", String(limit), ...dry] : null;
  },
  "import-applied": () => ["import-applied"],
  full: () => ["full"],
};

export function actionToArgs(action: string, body: Row): string[] | null {
  const fn = ALLOWED_ACTIONS[action];
  return fn ? fn(body) : null;
}
