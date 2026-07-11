// Cross-process lock for mutating Hunter commands.
// SQLite transactions provide atomic reserve/claim/release across the Next.js
// server and detached CLI processes without a lockfile stale-removal race.
const { randomUUID } = require("crypto");
const { getDb } = require("./db");

const LOCK_NAME = "hunter-mutating";
const RESERVATION_TTL_MS = 30_000;

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error && error.code === "EPERM";
  }
}

function toLock(row) {
  if (!row) return null;
  return {
    ownerId: row.owner_id,
    pid: row.pid,
    command: row.command,
    startedAt: new Date(row.acquired_at).toISOString(),
  };
}

function rowIsActive(row, now) {
  if (!row) return false;
  if (row.pid !== null) return processIsAlive(row.pid);
  return now - row.acquired_at < RESERVATION_TTL_MS;
}

function acquireLock(command, options = {}) {
  const db = getDb();
  const ownerId = options.ownerId || randomUUID();
  const pid = options.pid === undefined ? process.pid : options.pid;
  const now = Date.now();

  const acquire = db.transaction(() => {
    const current = db
      .prepare(`SELECT * FROM command_locks WHERE name = ?`)
      .get(LOCK_NAME);

    // The detached child claims the reservation made by the API.
    if (current && current.owner_id === ownerId) {
      db.prepare(
        `UPDATE command_locks
         SET pid = ?, command = ?, acquired_at = ?
         WHERE name = ? AND owner_id = ?`,
      ).run(pid, String(command || "unknown"), now, LOCK_NAME, ownerId);
      return {
        ok: true,
        lock: toLock({
          ...current,
          pid,
          command: String(command || "unknown"),
          acquired_at: now,
        }),
      };
    }

    if (rowIsActive(current, now)) {
      return { ok: false, lock: toLock(current) };
    }

    if (current) {
      db.prepare(
        `DELETE FROM command_locks WHERE name = ? AND owner_id = ?`,
      ).run(LOCK_NAME, current.owner_id);
    }

    db.prepare(
      `INSERT INTO command_locks
       (name, owner_id, pid, command, acquired_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(LOCK_NAME, ownerId, pid, String(command || "unknown"), now);

    return {
      ok: true,
      lock: {
        ownerId,
        pid,
        command: String(command || "unknown"),
        startedAt: new Date(now).toISOString(),
      },
    };
  });

  return acquire();
}

/** Reserve before spawn; pid=null is active for 30s while child starts. */
function reserveLock(command) {
  return acquireLock(command, { pid: null });
}

function isLocked() {
  const db = getDb();
  const inspect = db.transaction(() => {
    const current = db
      .prepare(`SELECT * FROM command_locks WHERE name = ?`)
      .get(LOCK_NAME);
    if (!current) return null;
    if (rowIsActive(current, Date.now())) return toLock(current);
    db.prepare(
      `DELETE FROM command_locks WHERE name = ? AND owner_id = ?`,
    ).run(LOCK_NAME, current.owner_id);
    return null;
  });
  return inspect();
}

function releaseLock(ownerId) {
  if (!ownerId) return;
  getDb()
    .prepare(`DELETE FROM command_locks WHERE name = ? AND owner_id = ?`)
    .run(LOCK_NAME, ownerId);
}

module.exports = {
  LOCK_NAME,
  acquireLock,
  isLocked,
  releaseLock,
  reserveLock,
};
