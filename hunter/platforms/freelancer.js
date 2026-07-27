// hunter/platforms/freelancer.js — scan active projects + place bids.
// Uses Freelancer's own REST API from inside the logged-in browser page,
// with the proven auth header: freelancer-auth-v2 = GETAFREE_USER_ID;GETAFREE_AUTH_HASH_V2.
const { withPage, goto } = require("../browser");
const { upsertJob, recordApplication, getDb } = require("../db");
const { scoreJob } = require("../matcher");
const { COVER_LETTER } = require("../apply-engine");

// Skill/job ids on Freelancer matching devnolife's stack (proven set).
const JOB_IDS = [2376, 759, 1314, 2688, 2966, 2916, 979, 2435, 500, 13, 9, 44, 607, 2165];

async function checkLogin(page) {
  const res = await page.evaluate(async () => {
    const r = await fetch("/api/users/0.1/self?compact=true", { credentials: "include" });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, user: j.result ? j.result.username : null };
  });
  return res.status === 200 ? res.user : null;
}

// Proven re-login: Freelancer login page renders a Google GSI button in an
// iframe; clicking it opens the account chooser where the saved Google
// session lets us pick the account without a password.
async function relogin(page, ctx, log = console.log) {
  await goto(page, "https://www.freelancer.co.id/login", 8000);
  const gsiFrame = page.frames().find((f) => f.url().includes("gsi/button"));
  if (!gsiFrame) { log("freelancer relogin: no GSI frame"); return null; }
  const popupPromise = ctx.waitForEvent("page", { timeout: 20000 }).catch(() => null);
  await gsiFrame.click("div[role='button']").catch(() => {});
  const popup = await popupPromise;
  if (popup) {
    await popup.waitForLoadState("domcontentloaded").catch(() => {});
    await popup.waitForTimeout(4000);
    const acct = popup.locator("[data-identifier]").first();
    if (await acct.isVisible().catch(() => false)) await acct.click();
    await popup.waitForEvent("close", { timeout: 20000 }).catch(() => {});
  }
  await page.waitForTimeout(8000);
  return checkLogin(page);
}

async function scan({ hoursMax = 72, log = console.log } = {}) {
  return withPage(async (page, ctx) => {
    await goto(page, "https://www.freelancer.co.id/dashboard", 4000);
    let user = await checkLogin(page);
    if (!user) {
      log("freelancer: session expired, trying Google relogin…");
      user = await relogin(page, ctx, log);
    }
    getDb().prepare(`UPDATE accounts SET login_status=?, last_checked=datetime('now') WHERE platform='freelancer'`)
      .run(user ? "ok" : "expired");
    if (!user) throw new Error("Freelancer session expired — login ulang di Chrome otomasi.");

    const fromTime = Math.floor(Date.now() / 1000) - hoursMax * 3600;
    const projects = await page.evaluate(async ({ jobIds, fromTime }) => {
      const qs = jobIds.map((j) => "jobs[]=" + j).join("&");
      const r = await fetch(`/api/projects/0.1/projects/active/?${qs}&limit=80&from_time=${fromTime}&job_details=true&full_description=true&compact=true`, { credentials: "include" });
      const j = await r.json();
      if (!j.result) return [];
      const now = Date.now() / 1000;
      return j.result.projects.map((p) => ({
        external_id: String(p.id),
        title: p.title,
        url: "https://www.freelancer.co.id/projects/" + p.seo_url,
        description: (p.description || "").slice(0, 2000),
        salary_min: p.budget ? Math.round(p.budget.minimum) : null,
        salary_max: p.budget && p.budget.maximum ? Math.round(p.budget.maximum) : null,
        currency: p.currency ? p.currency.code : "USD",
        type: p.type,
        bids: p.bid_stats ? p.bid_stats.bid_count : 0,
        hoursAgo: Math.round((now - p.time_submitted) / 3600),
      }));
    }, { jobIds: JOB_IDS, fromTime });

    let added = 0;
    for (const p of projects) {
      const match_score = scoreJob({ title: p.title, description: p.description, remote: 1 });
      const row = upsertJob({
        platform: "freelancer", external_id: p.external_id, title: p.title,
        url: p.url, remote: 1, salary_min: p.salary_min, salary_max: p.salary_max,
        currency: p.currency, description: p.description, match_score,
        location: p.type + " · " + p.bids + " bids · " + p.hoursAgo + "h ago",
      });
      if (row._isNew) added++;
    }
    log(`freelancer scan: ${projects.length} projects, ${added} new`);
    return { found: projects.length, added };
  }, { urlHint: "freelancer" });
}

/**
 * Place a bid on a project. amount in the project currency; period in days.
 * description defaults to the standard cover letter.
 */
async function bid({ projectId, amount, period = 14, description = COVER_LETTER, jobRowId = null, log = console.log }) {
  return withPage(async (page) => {
    await goto(page, "https://www.freelancer.co.id/dashboard", 4000);
    const res = await page.evaluate(async ({ projectId, amount, period, description }) => {
      const get = (n) => (document.cookie.split("; ").find((c) => c.startsWith(n + "=")) || "").split("=").slice(1).join("=");
      const uid = get("GETAFREE_USER_ID");
      const auth = uid + ";" + decodeURIComponent(get("GETAFREE_AUTH_HASH_V2"));
      const r = await fetch("/api/projects/0.1/bids/?compact=true&new_errors=true", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", "freelancer-auth-v2": auth },
        body: JSON.stringify({ project_id: parseInt(projectId, 10), bidder_id: parseInt(uid, 10), amount, period, milestone_percentage: 50, description }),
      });
      return { status: r.status, body: (await r.text()).slice(0, 300) };
    }, { projectId, amount, period, description });

    const ok = res.status === 200;
    log(`freelancer bid ${projectId}: HTTP ${res.status}`);
    if (ok) {
      const job = jobRowId
        ? getDb().prepare(`SELECT * FROM jobs WHERE id=?`).get(jobRowId)
        : getDb().prepare(`SELECT * FROM jobs WHERE platform='freelancer' AND external_id=?`).get(String(projectId));
      recordApplication({
        job_id: job ? job.id : null, platform: "freelancer",
        title: job ? job.title : "Project " + projectId,
        url: job ? job.url : null, channel: "auto",
        salary_offered: String(amount), cover_letter: description,
      });
    }
    return { ok, ...res };
  }, { urlHint: "freelancer" });
}

module.exports = { scan, bid, JOB_IDS };
