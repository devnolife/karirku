#!/usr/bin/env node
// hunter/run.js — CLI entrypoint for the Hunter engine.
//
//   node hunter/run.js scan [freelancer|jobstreet|linkedin|upwork|all]
//   node hunter/run.js apply --job <jobRowId>        one JobStreet quick-apply
//   node hunter/run.js apply --auto [--limit N]      auto-apply best matches (jobstreet)
//   node hunter/run.js bid --project <id> --amount <n> [--period d]  freelancer bid
//   node hunter/run.js sync-email [--days N]
//   node hunter/run.js gmail-auth                    one-time OAuth
//   node hunter/run.js import-applied                import JobStreet history
//   node hunter/run.js status                        accounts + counters
//   node hunter/run.js full                          scan all + sync-email
const { getDb, startRun, finishRun, getSetting } = require("./db");
const freelancer = require("./platforms/freelancer");
const jobstreet = require("./platforms/jobstreet");
const linkedin = require("./platforms/linkedin");
const upwork = require("./platforms/upwork");
const gmail = require("./email/gmail");
const { acquireLock, releaseLock } = require("./lock");

const args = process.argv.slice(2);
const cmd = args[0] || "status";
const MUTATING_COMMANDS = new Set([
  "scan",
  "apply",
  "bid",
  "sync-email",
  "gmail-auth",
  "import-applied",
  "full",
]);
let lockHeld = false;
let lockOwnerId = null;

if (MUTATING_COMMANDS.has(cmd)) {
  const acquired = acquireLock(cmd, {
    ownerId: process.env.HUNTER_LOCK_OWNER || undefined,
    pid: process.pid,
  });
  if (!acquired.ok) {
    const owner = acquired.lock;
    console.error(
      `Hunter sedang menjalankan ${owner?.command || "command lain"}` +
        `${owner?.pid ? ` (pid ${owner.pid})` : ""}.`,
    );
    process.exit(3);
  }
  lockHeld = true;
  lockOwnerId = acquired.lock.ownerId;
}

function cleanupLock() {
  if (!lockHeld) return;
  releaseLock(lockOwnerId);
  lockHeld = false;
  lockOwnerId = null;
}

process.once("exit", cleanupLock);
process.once("SIGINT", () => {
  cleanupLock();
  process.exit(130);
});
process.once("SIGTERM", () => {
  cleanupLock();
  process.exit(143);
});

function flag(name, fallback) {
  const i = args.indexOf("--" + name);
  return i >= 0 ? args[i + 1] : fallback;
}

const logLines = [];
const log = (...a) => { const s = a.join(" "); logLines.push(s); console.log(s); };

async function scan(target) {
  const scanners = { freelancer, jobstreet, linkedin, upwork };
  const list = target && target !== "all" ? [target] : Object.keys(scanners);
  const stats = {};
  for (const name of list) {
    const runId = startRun("scan", name);
    try {
      stats[name] = await scanners[name].scan({ log });
      finishRun(runId, true, stats[name], logLines.join("\n"));
    } catch (e) {
      stats[name] = { error: e.message };
      log(`${name} scan FAILED: ${e.message}`);
      finishRun(runId, false, stats[name], logLines.join("\n"));
    }
  }
  return stats;
}

async function applyAuto(limit) {
  const threshold = parseInt(getSetting("match_threshold", "60"), 10);
  const rows = getDb().prepare(
    `SELECT id, title, match_score FROM jobs
     WHERE platform='jobstreet' AND status IN ('new','queued') AND match_score >= ?
     ORDER BY status='queued' DESC, match_score DESC, salary_min DESC LIMIT ?`
  ).all(threshold, limit);
  log(`auto-apply: ${rows.length} candidates (threshold ${threshold})`);
  const out = [];
  for (const r of rows) {
    const runId = startRun("apply", "jobstreet");
    try {
      const res = await jobstreet.apply({ jobRowId: r.id, log });
      out.push({ id: r.id, title: r.title, ...res });
      finishRun(runId, !!res.ok, res, logLines.join("\n"));
    } catch (e) {
      out.push({ id: r.id, title: r.title, ok: false, reason: e.message });
      finishRun(runId, false, { error: e.message }, logLines.join("\n"));
    }
  }
  return out;
}

(async () => {
  switch (cmd) {
    case "scan": {
      const stats = await scan(args[1] || "all");
      console.log("\n== SCAN SUMMARY ==\n" + JSON.stringify(stats, null, 1));
      break;
    }
    case "apply": {
      if (flag("job")) {
        const runId = startRun("apply", "jobstreet");
        const res = await jobstreet.apply({ jobRowId: parseInt(flag("job"), 10), log });
        finishRun(runId, !!res.ok, res, logLines.join("\n"));
        console.log(JSON.stringify(res));
      } else if (args.includes("--auto")) {
        const res = await applyAuto(parseInt(flag("limit", "5"), 10));
        console.log("\n== APPLY SUMMARY ==\n" + JSON.stringify(res, null, 1));
      } else {
        console.log("Usage: apply --job <id> | apply --auto [--limit N]");
        process.exitCode = 2;
      }
      break;
    }
    case "bid": {
      const runId = startRun("apply", "freelancer");
      const res = await freelancer.bid({
        projectId: flag("project"), amount: parseFloat(flag("amount")),
        period: parseInt(flag("period", "14"), 10), log,
      });
      finishRun(runId, !!res.ok, res, logLines.join("\n"));
      console.log(JSON.stringify(res));
      break;
    }
    case "sync-email": {
      const runId = startRun("sync-email", "gmail");
      try {
        const res = await gmail.sync({ days: parseInt(flag("days", "30"), 10), log });
        finishRun(runId, true, res, logLines.join("\n"));
        console.log(JSON.stringify(res));
      } catch (e) {
        finishRun(runId, false, { error: e.message }, logLines.join("\n"));
        console.error(e.message);
        process.exitCode = 1;
      }
      break;
    }
    case "gmail-auth":
      await gmail.authorize();
      break;
    case "import-applied": {
      const res = await jobstreet.importApplied({ log });
      console.log(JSON.stringify(res));
      break;
    }
    case "status": {
      const d = getDb();
      const accounts = d.prepare(`SELECT platform, username, can_auto_apply, login_status, last_checked FROM accounts`).all();
      const jobs = d.prepare(`SELECT platform, status, COUNT(*) n FROM jobs GROUP BY platform, status`).all();
      const apps = d.prepare(`SELECT platform, reply_status, COUNT(*) n FROM applications GROUP BY platform, reply_status`).all();
      console.log(JSON.stringify({ gmail: gmail.status(), accounts, jobs, applications: apps }, null, 1));
      break;
    }
    case "full": {
      const stats = await scan("all");
      let email = null;
      try { email = await gmail.sync({ log }); } catch (e) { email = { error: e.message }; }
      console.log("\n== FULL RUN ==\n" + JSON.stringify({ scan: stats, email }, null, 1));
      break;
    }
    default:
      console.log("Unknown command: " + cmd);
      process.exitCode = 2;
  }
})()
  .catch((e) => {
    console.error("FATAL:", e.message);
    process.exitCode = 1;
  })
  .finally(cleanupLock);
