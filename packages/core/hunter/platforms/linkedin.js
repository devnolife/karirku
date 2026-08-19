// hunter/platforms/linkedin.js — scan/shortlist only.
// Easy Apply is bot-blocked (proven in-session), so jobs land in the DB as
// `new` for one-click manual apply from the dashboard.
const { withPage, goto } = require("../browser");
const { upsertJob, getDb } = require("../db");
const { scoreJob } = require("../matcher");

const SEARCHES = [
  { kw: "Full Stack Developer", loc: "Indonesia", easy: true, remote: false },
  { kw: "React Developer", loc: "Indonesia", easy: true, remote: false },
  { kw: "Full Stack Developer", loc: "", easy: true, remote: true },
  { kw: "React Native", loc: "", easy: true, remote: true },
];

async function scan({ log = console.log } = {}) {
  return withPage(async (page) => {
    // login check via feed
    await goto(page, "https://www.linkedin.com/feed/", 6000);
    const loggedIn = !page.url().includes("/login") && !(await page.evaluate(() => /Sign in|Masuk sekarang/i.test(document.body.innerText.slice(0, 300))));
    getDb().prepare(`UPDATE accounts SET login_status=?, last_checked=datetime('now') WHERE platform='linkedin'`)
      .run(loggedIn ? "ok" : "expired");
    if (!loggedIn) throw new Error("LinkedIn session expired — login manual di Chrome otomasi.");

    const seen = new Set();
    let found = 0, added = 0;
    for (const s of SEARCHES) {
      let url = "https://www.linkedin.com/jobs/search/?keywords=" + encodeURIComponent(s.kw) + "&sortBy=DD";
      if (s.loc) url += "&location=" + encodeURIComponent(s.loc);
      if (s.easy) url += "&f_AL=true";
      if (s.remote) url += "&f_WT=2";
      await goto(page, url, 6000).catch(() => {});
      const jobs = await page.evaluate(() => {
        const cards = [...document.querySelectorAll("li[data-occludable-job-id]")];
        return cards.map((c) => {
          const id = c.getAttribute("data-occludable-job-id");
          const title = (c.querySelector(".job-card-list__title--link, a.job-card-container__link, strong") || {}).innerText || "";
          const comp = (c.querySelector(".artdeco-entity-lockup__subtitle") || {}).innerText || "";
          const loc = (c.querySelector(".job-card-container__metadata-wrapper, .artdeco-entity-lockup__caption") || {}).innerText || "";
          return { id, title: title.trim().split("\n")[0].slice(0, 80), company: comp.trim().slice(0, 60), location: loc.trim().slice(0, 60) };
        }).filter((j) => j.id && j.title);
      });
      for (const j of jobs) {
        if (seen.has(j.id)) continue;
        seen.add(j.id); found++;
        const remote = /jarak jauh|remote/i.test(j.location) ? 1 : 0;
        const row = upsertJob({
          platform: "linkedin", external_id: j.id, title: j.title, company: j.company,
          location: j.location, url: `https://www.linkedin.com/jobs/view/${j.id}/`,
          remote, match_score: scoreJob({ title: j.title, remote }),
        });
        if (row._isNew) added++;
      }
    }
    log(`linkedin scan: ${found} jobs, ${added} new (apply = manual, Easy Apply bot-blocked)`);
    return { found, added };
  }, { urlHint: "linkedin" });
}

module.exports = { scan };
