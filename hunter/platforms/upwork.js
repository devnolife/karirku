// hunter/platforms/upwork.js — scan/shortlist only.
// Applying costs Connects and the account still needs identity verification,
// so jobs are stored for manual review in the dashboard.
const { withPage, goto } = require("../browser");
const { upsertJob, getDb } = require("../db");
const { scoreJob } = require("../matcher");

const SEARCHES = [
  "https://www.upwork.com/nx/search/jobs/?q=next.js%20react&sort=recency",
  "https://www.upwork.com/nx/search/jobs/?q=react%20native&sort=recency",
  "https://www.upwork.com/nx/search/jobs/?q=fastapi%20python&sort=recency",
];

async function scan({ log = console.log } = {}) {
  return withPage(async (page) => {
    await goto(page, "https://www.upwork.com/nx/find-work/best-matches", 8000);
    const t = await page.evaluate(() => document.body.innerText.slice(0, 400));
    const loggedIn = !/Log in to Upwork|Continue with Google/i.test(t);
    getDb().prepare(`UPDATE accounts SET login_status=?, last_checked=datetime('now') WHERE platform='upwork'`)
      .run(loggedIn ? "ok" : "expired");
    if (!loggedIn) throw new Error("Upwork session expired — login manual di Chrome otomasi.");

    const seen = new Set();
    let found = 0, added = 0;
    for (const url of SEARCHES) {
      await goto(page, url, 7000).catch(() => {});
      const jobs = await page.evaluate(() => {
        const arts = [...document.querySelectorAll("article, section[data-ev-label], div[data-test='JobTile']")];
        const out = [];
        for (const a of arts) {
          const link = a.querySelector("a[href*='/jobs/']");
          if (!link) continue;
          const href = (link.getAttribute("href") || "").split("?")[0];
          const idm = href.match(/~[0-9a-f]+/);
          out.push({
            external_id: idm ? idm[0] : href,
            title: link.innerText.trim().slice(0, 80),
            url: href.startsWith("http") ? href : "https://www.upwork.com" + href,
            snippet: (a.innerText || "").slice(0, 300),
          });
        }
        return out.filter((j) => j.title);
      });
      for (const j of jobs) {
        if (seen.has(j.external_id)) continue;
        seen.add(j.external_id); found++;
        const row = upsertJob({
          platform: "upwork", external_id: j.external_id, title: j.title, url: j.url,
          remote: 1, currency: "USD", description: j.snippet,
          match_score: scoreJob({ title: j.title, description: j.snippet, remote: 1 }),
        });
        if (row._isNew) added++;
      }
    }
    log(`upwork scan: ${found} jobs, ${added} new (apply = manual, needs Connects + ID verify)`);
    return { found, added };
  }, { urlHint: "upwork" });
}

module.exports = { scan };
