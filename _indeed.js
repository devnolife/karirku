// Self-contained Indeed Indonesia runner (engine lives in karirku-core, absent locally).
// Reuses the proven automation Chrome profile via CDP, same pattern as _fl.js.
//   node _indeed.js scan [--easy] [--pages N]  scan id.indeed.com and store into hunter.db
//   node _indeed.js list [--min N] [--limit N] rank stored Indeed jobs that are still `new`
//   node _indeed.js detail <jk|jobId>          pull the full job description
//   node _indeed.js enrich [--limit N]         fetch descriptions for top unscored jobs
//   node _indeed.js login                      open Indeed and report account status
const os = require("os");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { DatabaseSync } = require("node:sqlite");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = process.env.HUNTER_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const DB_PATH = process.env.HUNTER_DB || path.join(__dirname, "data", "hunter.db");
const BASE = "https://id.indeed.com";
const PLATFORM = "indeed";
// Indeed's "Lamar dengan mudah" (Indeed Apply) facet — the only jobs we can auto-apply to.
const EASY_APPLY_FACET = "0kf:attr(DSQF7);";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------- chrome --------------------------------- */
function cdpAlive() {
  return new Promise((resolve) => {
    const req = http.get({ host: "localhost", port: CDP_PORT, path: "/json/version", timeout: 3000 }, (res) => { res.resume(); resolve(res.statusCode === 200); });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}
async function ensureChrome() {
  if (await cdpAlive()) return;
  spawn(CHROME, [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${PROFILE}`, "--no-first-run", "--no-default-browser-check", "--window-size=1400,950", "about:blank"], { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 30; i++) { await sleep(1000); if (await cdpAlive()) return; }
  throw new Error("Chrome CDP did not come up on port " + CDP_PORT);
}
async function withPage(fn) {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    const page = ctx.pages().find((p) => p.url().includes("indeed")) || ctx.pages()[0] || (await ctx.newPage());
    return await fn(page);
  } finally { await browser.close(); }
}

/* ------------------------------------ db ----------------------------------- */
function db() {
  const d = new DatabaseSync(DB_PATH);
  d.exec("PRAGMA journal_mode=WAL");
  return d;
}
function settings(d) {
  const out = {};
  for (const r of d.prepare("select key, value from settings").all()) out[r.key] = r.value;
  const parse = (k, fb) => { try { return JSON.parse(out[k]); } catch { return fb; } };
  return {
    keywords: parse("keywords", []),
    avoid: parse("avoid_keywords", []),
    floor: parseInt(out.salary_floor_juta || "10", 10),
    threshold: parseInt(out.match_threshold || "60", 10),
  };
}

/* --------------------------------- scoring --------------------------------- */
// Salary text is Indonesian: "Rp21.500.000 - Rp36.500.000 per bulan" (dot = thousands).
function parseSalary(text) {
  if (!text) return { min: null, max: null };
  const t = text.replace(/\u00a0/g, " ");
  const nums = [...t.matchAll(/Rp\s?([\d.]+)(?:,\d+)?/gi)].map((m) => parseInt(m[1].replace(/\./g, ""), 10)).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return { min: null, max: null };
  let [min, max] = [Math.min(...nums), Math.max(...nums)];
  if (/per tahun|setahun|a year/i.test(t)) { min /= 12; max /= 12; }
  else if (/per jam|per hour/i.test(t)) { min *= 173; max *= 173; }
  else if (/per hari|per day/i.test(t)) { min *= 22; max *= 22; }
  else if (/per minggu|per week/i.test(t)) { min *= 4.33; max *= 4.33; }
  const juta = (n) => Math.round(n / 1e6);
  // Ignore nonsense rows (e.g. a stray "Rp1.000" that is not a real monthly wage).
  if (max < 1e6) return { min: null, max: null };
  return { min: juta(min) || null, max: juta(max) || null };
}

// Titles that are clearly not a software engineering role for devnolife.
const OFF_ROLE = /\b(sales|marketing|akunting|akuntan|admin gudang|driver|kurir|perawat|guru|teacher|customer service|telemarketing|hrd|recruiter|host live|content creator|video editor|designer grafis|barista|kasir toko|security|satpam|cleaning)\b/i;
const SENIOR_HINT = /\b(senior|lead|principal|staff|head of)\b/i;

// Whole-word matching: plain `includes` made "ai" hit "email"/"training" and
// inflate the score of unrelated roles.
const wordRe = (term) => new RegExp(`(^|[^a-z0-9+#.])${term.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#]|$)`, "i");
const reCache = new Map();
const matches = (term, text) => {
  let re = reCache.get(term);
  if (!re) { re = wordRe(term); reCache.set(term, re); }
  return re.test(text);
};

function score(job, cfg) {
  const hay = `${job.title} ${job.company || ""} ${job.snippet || ""} ${job.description || ""}`;
  const title = job.title || "";
  let s = 0;
  const hits = [];
  for (const k of cfg.keywords) {
    if (!matches(k, hay)) continue;
    hits.push(k);
    s += matches(k, title) ? 15 : 7; // title match counts far more than body match
  }
  s = Math.min(s, 72);

  const avoided = cfg.avoid.filter((a) => matches(a, hay));
  // Only punish when the stack we avoid is the headline of the role.
  const avoidedInTitle = cfg.avoid.filter((a) => matches(a, title));
  s -= avoidedInTitle.length * 22 + (avoided.length - avoidedInTitle.length) * 4;

  if (job.remote) s += 12;
  if (job.easyApply) s += 8; // we can actually auto-apply to these
  const sal = job.salary_max || job.salary_min;
  if (sal) s += sal >= cfg.floor ? 12 : -18;
  if (SENIOR_HINT.test(title)) s += 4;
  if (OFF_ROLE.test(title)) s -= 45;
  if (!/\b(developer|engineer|programmer|software|frontend|front-end|backend|back-end|fullstack|full stack|full-stack|mobile|web|it |ai|ml|data)\b/i.test(title)) s -= 12;

  return { score: Math.max(0, Math.min(100, Math.round(s))), hits, avoided };
}

/* ---------------------------------- scan ----------------------------------- */
const QUERIES = [
  "react native developer", "react developer", "next.js developer", "full stack developer",
  "frontend developer", "backend developer", "node.js developer", "typescript developer",
  "python developer", "mobile developer", "software engineer", "web developer",
  "ai engineer", "machine learning engineer", "golang developer",
];

async function scrapeList(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3500 + Math.floor(Math.random() * 1500));
  if (page.url().includes("secure.indeed.com")) return { blocked: "login", jobs: [] };
  if (/Just a moment|Additional Verification/i.test(await page.title())) return { blocked: "cloudflare", jobs: [] };
  const jobs = await page.evaluate(() => {
    const seen = new Set();
    return [...document.querySelectorAll("a.jcs-JobTitle[data-jk], a[data-jk][id^='job_']")].map((a) => {
      const jk = a.getAttribute("data-jk");
      if (!jk || seen.has(jk)) return null;
      seen.add(jk);
      const root = a.closest(".job_seen_beacon") || a.closest("li") || a.parentElement;
      const txt = root ? root.innerText.replace(/\s+/g, " ").trim() : "";
      const pick = (sel) => root?.querySelector(sel)?.innerText?.trim() || null;
      const salaryEl = [...(root?.querySelectorAll('[data-testid="attribute_snippet_testid"], .salary-snippet-container, .metadata') || [])]
        .map((x) => x.innerText).find((x) => /Rp/i.test(x));
      return {
        jk,
        title: a.querySelector("span[title]")?.getAttribute("title") || a.innerText.trim(),
        company: pick('[data-testid="company-name"]'),
        location: pick('[data-testid="text-location"]'),
        salaryText: salaryEl || (txt.match(/Rp[\d.,]+(?:\s*-\s*Rp[\d.,]+)?\s*per \w+/i) || [null])[0],
        snippet: pick('[data-testid="belowJobSnippet"], .job-snippet') || txt.slice(0, 260),
        easyApply: /Lamar dengan mudah|Easily apply|Mudah melamar/i.test(txt),
      };
    }).filter(Boolean);
  });
  return { blocked: null, jobs };
}

async function scan(opts) {
  const d = db();
  const cfg = settings(d);
  const stats = { queries: 0, seen: 0, inserted: 0, updated: 0, blocked: null };
  const started = new Date().toISOString().replace("T", " ").slice(0, 19);

  const ins = d.prepare(`insert into jobs (platform, external_id, title, company, url, location, remote, salary_min, salary_max, currency, description, match_score, status)
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IDR', ?, ?, 'new')
    on conflict(platform, external_id) do update set
      title=excluded.title, company=excluded.company, location=excluded.location,
      remote=excluded.remote, salary_min=excluded.salary_min, salary_max=excluded.salary_max,
      description=excluded.description, match_score=excluded.match_score
    where jobs.status='new'`);
  const existed = new Set(d.prepare("select external_id from jobs where platform=?").all(PLATFORM).map((r) => r.external_id));

  await withPage(async (page) => {
    for (const q of QUERIES) {
      for (let p = 0; p < opts.pages; p++) {
        const params = new URLSearchParams({ q, l: "Indonesia", start: String(p * 10), fromage: String(opts.fromage) });
        if (opts.easy) params.set("sc", EASY_APPLY_FACET);
        const { blocked, jobs } = await scrapeList(page, `${BASE}/jobs?${params}`);
        if (blocked) { stats.blocked = blocked; console.error(`  ! blocked (${blocked}) on "${q}" p${p}`); break; }
        stats.queries++;
        stats.seen += jobs.length;
        for (const j of jobs) {
          const sal = parseSalary(j.salaryText);
          const remote = /remote|wfh|work from home|jarak jauh/i.test(`${j.location || ""} ${j.title} ${j.snippet || ""}`) ? 1 : 0;
          const sc = score({ ...j, remote, salary_min: sal.min, salary_max: sal.max }, cfg);
          ins.run(PLATFORM, j.jk, j.title, j.company, `${BASE}/viewjob?jk=${j.jk}`, j.location, remote,
            sal.min, sal.max, j.snippet || null, sc.score);
          if (existed.has(j.jk)) stats.updated++; else { stats.inserted++; existed.add(j.jk); }
        }
        console.error(`  ${q} p${p}: ${jobs.length} cards`);
        if (jobs.length === 0) break;
        await sleep(1200 + Math.floor(Math.random() * 900));
      }
      if (stats.blocked) break;
    }
  });

  d.prepare("insert into runs (type, platform, started_at, finished_at, ok, stats_json) values ('scan', ?, ?, datetime('now'), ?, ?)")
    .run(PLATFORM, started, stats.blocked ? 0 : 1, JSON.stringify(stats));
  const top = d.prepare(`select id, external_id, title, company, location, remote, salary_min, salary_max, match_score
    from jobs where platform=? and status='new' order by match_score desc, id desc limit 15`).all(PLATFORM);
  d.close();
  return { ...stats, threshold: cfg.threshold, top };
}

/* ---------------------------------- detail --------------------------------- */
async function detail(ref) {
  const d = db();
  const row = /^\d+$/.test(ref)
    ? d.prepare("select * from jobs where id=? and platform=?").get(parseInt(ref, 10), PLATFORM)
    : d.prepare("select * from jobs where external_id=? and platform=?").get(ref, PLATFORM);
  const jk = row ? row.external_id : ref;
  const out = await withPage(async (page) => {
    await page.goto(`${BASE}/viewjob?jk=${jk}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);
    return page.evaluate(() => ({
      title: document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"], .jobsearch-JobInfoHeader-title')?.innerText?.trim(),
      company: document.querySelector('[data-testid="inlineHeader-companyName"], [data-company-name]')?.innerText?.trim(),
      location: document.querySelector('[data-testid="inlineHeader-companyLocation"], [data-testid="job-location"]')?.innerText?.trim(),
      salary: [...document.querySelectorAll('#salaryInfoAndJobType, [data-testid="attribute_snippet_testid"]')].map((x) => x.innerText.trim()).find((x) => /Rp/i.test(x)) || null,
      easyApply: !!document.querySelector('#indeedApplyButton, [data-testid="indeedApplyButton"], .ia-IndeedApplyButton'),
      applyHref: document.querySelector('#applyButtonLinkContainer a, [id*="applyButton"] a')?.href || null,
      description: document.querySelector("#jobDescriptionText")?.innerText?.trim()?.slice(0, 6000) || null,
    }));
  });
  if (row && out.description) {
    const cfg = settings(d);
    const sc = score({ ...row, snippet: row.description, description: out.description, easyApply: out.easyApply }, cfg);
    d.prepare("update jobs set description=?, match_score=? where id=?").run(out.description.slice(0, 4000), sc.score, row.id);
    out.rescored = sc;
  }
  d.close();
  return { jk, dbId: row ? row.id : null, ...out };
}

/* ---------------------------------- enrich --------------------------------- */
async function enrich(limit) {
  const d = db();
  const cfg = settings(d);
  const rows = d.prepare(`select * from jobs where platform=? and status='new' and (description is null or length(description) < 400)
    order by match_score desc limit ?`).all(PLATFORM, limit);
  const upd = d.prepare("update jobs set description=?, match_score=? where id=?");
  const done = [];
  await withPage(async (page) => {
    for (const r of rows) {
      try {
        await page.goto(`${BASE}/viewjob?jk=${r.external_id}`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(2500 + Math.floor(Math.random() * 1200));
        const got = await page.evaluate(() => ({
          desc: document.querySelector("#jobDescriptionText")?.innerText?.trim() || null,
          easyApply: !!document.querySelector('#indeedApplyButton, [data-testid="indeedApplyButton"], .ia-IndeedApplyButton'),
        }));
        if (!got.desc) { done.push({ id: r.id, title: r.title, ok: false }); continue; }
        const sc = score({ ...r, description: got.desc, easyApply: got.easyApply }, cfg);
        upd.run(got.desc.slice(0, 4000), sc.score, r.id);
        done.push({ id: r.id, title: r.title, was: r.match_score, now: sc.score, easyApply: got.easyApply, ok: true });
      } catch (e) { done.push({ id: r.id, title: r.title, ok: false, err: e.message.slice(0, 60) }); }
    }
  });
  d.close();
  return { requested: rows.length, done };
}

/* ----------------------------------- list ---------------------------------- */
function list(min, limit) {
  const d = db();
  const cfg = settings(d);
  const floor = min === null ? cfg.threshold : min;
  const rows = d.prepare(`select id, external_id, title, company, location, remote, salary_min, salary_max, match_score, url,
      case when length(coalesce(description,'')) > 400 then 1 else 0 end as enriched
    from jobs where platform=? and status='new' and match_score >= ?
    order by match_score desc, id desc`).all(PLATFORM, floor);
  // Indeed reposts the same opening under several job keys — keep the best row per opening.
  const best = new Map();
  for (const r of rows) {
    const key = `${(r.title || "").toLowerCase().trim()}|${(r.company || "").toLowerCase().trim()}`;
    if (!best.has(key)) best.set(key, r);
  }
  const jobs = [...best.values()].slice(0, limit);
  const counts = d.prepare("select status, count(*) n from jobs where platform=? group by status").all(PLATFORM);
  d.close();
  return { threshold: floor, counts, unique: best.size, rawMatches: rows.length, jobs };
}

async function loginStatus() {
  return withPage(async (page) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);
    return page.evaluate(() => {
      const t = document.body.innerText;
      return {
        url: location.href,
        cloudflare: /Just a moment|Additional Verification/i.test(document.title),
        loggedIn: /Pesan|Profil|Keluar|My Indeed/i.test(t) && !/Masuk\b(?!.*Keluar)/i.test(t.slice(0, 120)),
        email: (t.match(/[\w.+-]+@[\w.-]+\.\w+/) || [])[0] || null,
        head: t.slice(0, 200).replace(/\s+/g, " "),
      };
    });
  });
}

/* ----------------------------------- cli ----------------------------------- */
(async () => {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const flag = (n, fb) => { const i = argv.indexOf("--" + n); return i >= 0 ? argv[i + 1] : fb; };
  let res;
  if (cmd === "scan") {
    res = await scan({
      easy: argv.includes("--easy"),
      pages: parseInt(flag("pages", "2"), 10),
      fromage: parseInt(flag("fromage", "14"), 10),
    });
  } else if (cmd === "list") {
    res = list(argv.includes("--min") ? parseInt(flag("min", "0"), 10) : null, parseInt(flag("limit", "30"), 10));
  } else if (cmd === "detail") {
    res = await detail(argv[1]);
  } else if (cmd === "enrich") {
    res = await enrich(parseInt(flag("limit", "10"), 10));
  } else if (cmd === "login") {
    res = await loginStatus();
  } else {
    res = { error: "unknown cmd", usage: ["scan [--easy] [--pages N] [--fromage D]", "list [--min N] [--limit N]", "detail <jk|id>", "enrich [--limit N]", "login"] };
  }
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
