import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import fs from "node:fs";
import { test, after } from "node:test";
import assert from "node:assert/strict";

import { actionToArgs } from "@/lib/hunter";
import { hunterAccessStatus } from "@/lib/hunter-access";

test("Hunter access hanya mengizinkan admin", () => {
  assert.equal(hunterAccessStatus(null), 401);
  assert.equal(hunterAccessStatus({ role: "jobseeker" }), 403);
  assert.equal(hunterAccessStatus({ role: "freelancer" }), 403);
  assert.equal(hunterAccessStatus({ role: "company" }), 403);
  assert.equal(hunterAccessStatus({ role: "admin" }), 200);
});

test("auto-apply admin tetap memerlukan entitlement", () => {
  assert.equal(
    hunterAccessStatus({ role: "admin" }, { requireAutoApply: true }, false),
    403,
  );
  assert.equal(
    hunterAccessStatus({ role: "admin" }, { requireAutoApply: true }, true),
    200,
  );
});

test("actionToArgs allowlist platform dan membatasi parameter", () => {
  assert.deepEqual(actionToArgs("scan", {}), ["scan", "all"]);
  assert.deepEqual(actionToArgs("scan", { platform: "jobstreet" }), [
    "scan",
    "jobstreet",
  ]);
  assert.equal(actionToArgs("scan", { platform: "../../bin/sh" }), null);

  assert.deepEqual(actionToArgs("apply", { jobId: 42 }), [
    "apply",
    "--job",
    "42",
  ]);
  assert.equal(actionToArgs("apply", { jobId: -1 }), null);
  assert.equal(actionToArgs("apply", { limit: 21 }), null);
  assert.equal(actionToArgs("apply", { limit: "2abc" }), null);
  assert.deepEqual(actionToArgs("sync-email", { days: 90 }), [
    "sync-email",
    "--days",
    "90",
  ]);
  assert.equal(actionToArgs("sync-email", { days: 91 }), null);
  assert.equal(actionToArgs("unknown", {}), null);
});

const hunterDbPath = path.join(
  tmpdir(),
  `karirku-hunter-lock-${process.pid}-${Date.now()}.db`,
);
process.env.HUNTER_DB = hunterDbPath;
const require = createRequire(import.meta.url);
const lock = require("../../hunter/lock.js") as {
  acquireLock(
    command: string,
    options?: { ownerId?: string; pid?: number | null },
  ):
    | { ok: true; lock: { pid: number } }
    | { ok: false; lock: { pid: number | null } | null };
  reserveLock(command: string):
    | { ok: true; lock: { ownerId: string; pid: null } }
    | { ok: false; lock: { pid: number | null } | null };
  isLocked(): { pid: number | null; command: string } | null;
  releaseLock(ownerId: string): void;
};
const hunterDb = require("../../hunter/db.js") as {
  getDb(): { close(): void };
};

after(() => {
  hunterDb.getDb().close();
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(`${hunterDbPath}${suffix}`, { force: true });
  }
});

test("Hunter API reservation menolak command kedua lalu diklaim child", () => {
  const first = lock.reserveLock("scan");
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(lock.isLocked()?.pid, null);

  const second = lock.reserveLock("apply");
  assert.equal(second.ok, false);

  const claimed = lock.acquireLock("scan", {
    ownerId: first.lock.ownerId,
    pid: process.pid,
  });
  assert.equal(claimed.ok, true);
  assert.equal(lock.isLocked()?.pid, process.pid);

  lock.releaseLock(first.lock.ownerId);
  assert.equal(lock.isLocked(), null);
});

test("Hunter process lock membersihkan stale PID", () => {
  const stale = lock.acquireLock("stale", { pid: 2_147_483_647 });
  assert.equal(stale.ok, true);
  assert.equal(lock.isLocked(), null);
});
