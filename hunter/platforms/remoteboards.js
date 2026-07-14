// hunter/platforms/remoteboards.js — scan remote job boards via public APIs (no login).
// Sources: RemoteOK (JSON API), Remotive (JSON API), WeWorkRemotely (RSS).
// Scan-only: apply links are external (email/site), stored for manual/assisted apply.
const https = require("https");
const { upsertJob, getDb } = require("../db");
const { scoreJob } = require("../matcher");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (job-search)" } }, (res) => {
      if (res.statusCode >= 300 && res.headers.location) return resolve(fetchUrl(res.headers.location));
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function scanRemoteOK(log) {
  const raw = await fetchUrl("https://remoteok.com/api");
  const arr = JSON.parse(raw).filter((x) => x.id && x.position);
  let found = 0, added = 0;
  for (const j of arr) {
    const title = j.position.slice(0, 90);
    const desc = ((j.tags || []).join(" ") + " " + (j.description || "")).slice(0, 1500);
    const salMin = j.salary_min ? Math.round(j.salary_min / 1000) : null; // k USD/yr
    found++;
    const row = upsertJob({
      platform: "remoteok", external_id: String(j.id), title,
      company: (j.company || "").slice(0, 60), url: j.url || ("https://remoteok.com/l/" + j.id),
      remote: 1, currency: "USD", salary_min: salMin,
      location: (j.location || "Worldwide").slice(0, 50),
      description: desc, match_score: scoreJob({ title, description: desc, remote: 1 }),
    });
    if (row._isNew) added++;
  }
  log(`remoteok: ${found} jobs, ${added} new`);
  return { found, added };
}

async function scanRemotive(log) {
  const raw = await fetchUrl("https://remotive.com/api/remote-jobs?category=software-dev&limit=100");
  const arr = (JSON.parse(raw).jobs || []);
  let found = 0, added = 0;
  for (const j of arr) {
    const title = j.title.slice(0, 90);
    const desc = ((j.tags || []).join(" ") + " " + (j.description || "").replace(/<[^>]+>/g, " ")).slice(0, 1500);
    found++;
    const row = upsertJob({
      platform: "remotive", external_id: String(j.id), title,
      company: (j.company_name || "").slice(0, 60), url: j.url,
      remote: 1, currency: "USD",
      location: (j.candidate_required_location || "Worldwide").slice(0, 60),
      description: desc + (j.job_type ? " | type:" + j.job_type : ""),
      match_score: scoreJob({ title, description: desc, remote: 1 }),
    });
    if (row._isNew) added++;
  }
  log(`remotive: ${found} jobs, ${added} new`);
  return { found, added };
}

async function scanWWR(log) {
  const raw = await fetchUrl("https://weworkremotely.com/categories/remote-programming-jobs.rss");
  const items = [...raw.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  let found = 0, added = 0;
  for (const it of items) {
    const get = (tag) => {
      const m = it.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
      return m ? m[1].trim() : "";
    };
    const rawTitle = get("title"); // "Company: Position"
    const link = get("link");
    const idm = link.match(/remote-jobs\/([^/]+)/);
    if (!rawTitle || !link) continue;
    const [company, ...rest] = rawTitle.split(":");
    const title = (rest.join(":").trim() || rawTitle).slice(0, 90);
    const desc = get("description").replace(/<[^>]+>/g, " ").slice(0, 1200);
    found++;
    const row = upsertJob({
      platform: "wwr", external_id: idm ? idm[1] : link, title,
      company: company.trim().slice(0, 60), url: link, remote: 1, currency: "USD",
      description: desc, match_score: scoreJob({ title, description: desc, remote: 1 }),
    });
    if (row._isNew) added++;
  }
  log(`weworkremotely: ${found} jobs, ${added} new`);
  return { found, added };
}

async function scan({ log = console.log } = {}) {
  const out = {};
  for (const [name, fn] of [["remoteok", scanRemoteOK], ["remotive", scanRemotive], ["wwr", scanWWR]]) {
    try { out[name] = await fn(log); }
    catch (e) { out[name] = { error: e.message.slice(0, 80) }; log(`${name} FAILED: ${e.message.slice(0, 80)}`); }
  }
  getDb().prepare(`INSERT OR IGNORE INTO accounts (platform, username, can_auto_apply, login_status, notes)
    VALUES ('remoteboards', 'public-api', 0, 'ok', 'RemoteOK+Remotive+WWR via API/RSS, scan-only, apply eksternal')`).run();
  return out;
}

module.exports = { scan };
