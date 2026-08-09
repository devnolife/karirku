// Self-contained Freelancer runner (engine was moved to karirku-core, absent locally).
// Reuses the proven automation Chrome profile via CDP + Freelancer REST API.
//   node _fl.js scan-id        scan Indonesian projects (IDR + Indonesian-language)
//   node _fl.js mybids         list my active (non-retracted) bids
//   node _fl.js retract <bidId>   retract one bid
//   node _fl.js bid <projectId> <amount> [days]  place a bid
const os = require("os");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const SKILLS = [2376, 759, 1314, 2688, 2966, 2916, 979, 2435, 500, 13, 9, 44, 607, 2165];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function cdpAlive() {
  return new Promise((resolve) => {
    const req = http.get({ host: "localhost", port: CDP_PORT, path: "/json/version", timeout: 3000 }, (res) => { res.resume(); resolve(res.statusCode === 200); });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}
async function ensureChrome() {
  if (await cdpAlive()) return;
  spawn(CHROME, [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${PROFILE}`, "--no-first-run", "--no-default-browser-check", "--window-size=1400,900", "about:blank"], { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 30; i++) { await sleep(1000); if (await cdpAlive()) return; }
  throw new Error("Chrome CDP did not come up on port " + CDP_PORT);
}
async function withPage(fn) {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    let page = ctx.pages().find((p) => p.url().includes("freelancer")) || ctx.pages()[0] || (await ctx.newPage());
    await page.goto("https://www.freelancer.co.id/dashboard", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3500);
    return await fn(page);
  } finally { await browser.close(); }
}

// Indonesian-language signal: common ID words rarely present in English posts.
const ID_WORDS = /\b(aplikasi|website|sistem|toko|dengan|yang|untuk|saya|kami|butuh|membuat|pembuatan|perusahaan|penjualan|laporan|pengguna|fitur|desain|dan|atau|akan|bisa|harga|biaya|proyek|kerja|data|keuangan|sekolah|karyawan|absensi|kasir)\b/gi;
function idScore(t) { const m = (t || "").match(ID_WORDS); return m ? m.length : 0; }

async function scanID(debug) {
  return withPage(async (page) => {
    const out = await page.evaluate(async ({ skills }) => {
      const self = await fetch("/api/users/0.1/self?compact=true", { credentials: "include" });
      const sj = await self.json().catch(() => ({}));
      if (!sj.result) return { status: self.status, user: null };
      const now = Date.now() / 1000;
      const map = (p) => ({
        id: p.id, title: p.title, seo: p.seo_url,
        cur: p.currency ? p.currency.code : "?",
        country: p.location && p.location.country ? p.location.country.name : (p.currency ? p.currency.country : null),
        min: p.budget ? Math.round(p.budget.minimum) : null,
        max: p.budget && p.budget.maximum ? Math.round(p.budget.maximum) : null,
        type: p.type, bids: p.bid_stats ? p.bid_stats.bid_count : 0,
        hoursAgo: Math.round((now - p.time_submitted) / 3600),
        title_desc: (p.title || "") + " || " + (p.description || "").slice(0, 500),
      });
      const all = []; const seen = {}; const curCount = {};
      const push = (p) => { if (!seen[p.id]) { seen[p.id] = 1; all.push(map(p)); } };
      const fetchP = async (url) => { const r = await fetch(url, { credentials: "include" }); const j = await r.json().catch(() => ({})); return j.result ? j.result.projects : []; };
      const from = Math.floor(Date.now() / 1000) - 45 * 86400;
      const qs = skills.map((j) => "jobs[]=" + j).join("&");
      let ps = await fetchP(`/api/projects/0.1/projects/active/?${qs}&limit=100&from_time=${from}&job_details=true&full_description=true&location_details=true&compact=true`);
      ps.forEach((p) => { const c = p.currency ? p.currency.code : "?"; curCount[c] = (curCount[c] || 0) + 1; push(p); });
      for (const q of ["aplikasi", "website", "sistem informasi", "toko online", "absensi", "kasir", "pembuatan aplikasi"]) {
        ps = await fetchP(`/api/projects/0.1/projects/active/?query=${encodeURIComponent(q)}&limit=50&full_description=true&location_details=true&compact=true`);
        ps.forEach((p) => { const c = p.currency ? p.currency.code : "?"; curCount[c] = (curCount[c] || 0) + 1; push(p); });
      }
      return { status: 200, user: sj.result.username, total: all.length, curCount, projects: all };
    }, { skills: SKILLS });
    if (out.projects) {
      out.projects.forEach((p) => { p.idScore = idScore(p.title_desc); });
      const idn = out.projects.filter((p) => p.cur === "IDR" || p.idScore >= 4)
        .sort((a, b) => (b.cur === "IDR") - (a.cur === "IDR") || a.hoursAgo - b.hoursAgo);
      out.indonesian = idn.map((p) => ({ id: p.id, title: p.title, cur: p.cur, min: p.min, max: p.max, bids: p.bids, hoursAgo: p.hoursAgo, idScore: p.idScore, seo: p.seo }));
      out.indonesianCount = idn.length;
    }
    if (!debug) delete out.projects;
    return out;
  });
}

// Stack fit scoring for devnolife.
const STACK = /\b(react native|react|next\.?js|node\.?js|node|typescript|javascript|python|fastapi|flask|django|go\b|golang|laravel|php|postgres|postgresql|mysql|mongodb|firebase|supabase|api|rest|graphql|dashboard|admin panel|automation|automasi|whatsapp|telegram|bot|scraper|scraping|llm|openai|gpt|ai\b|machine learning|chatbot|mobile app|android|ios|kotlin|expo|flutter|e-?commerce|saas|payment|midtrans|stripe|webhook|integration|integrasi)\b/gi;
function stackScore(t) { const m = (t || "").match(STACK); return m ? new Set(m.map((x) => x.toLowerCase())).size : 0; }

async function quota() {
  return withPage(async (page) => page.evaluate(async () => {
    const r = await fetch("/api/users/0.1/self?compact=true&user_membership_details=true&user_status=true", { credentials: "include" });
    const j = await r.json().catch(() => ({}));
    const u = j.result || {};
    // Try the bid-limit endpoint used by the bid form.
    let limit = null;
    try {
      const r2 = await fetch("/api/projects/0.1/self/bid_limit/?compact=true", { credentials: "include" });
      limit = await r2.json().catch(() => null);
    } catch (e) { limit = { err: e.message }; }
    return {
      user: u.username, membership: u.membership_package ? u.membership_package.name : null,
      status: u.status || null, bid_limit: limit,
    };
  }));
}

async function scanFixed(debug) {
  return withPage(async (page) => {
    const out = await page.evaluate(async ({ skills }) => {
      const self = await fetch("/api/users/0.1/self?compact=true", { credentials: "include" });
      const sj = await self.json().catch(() => ({}));
      if (!sj.result) return { status: self.status, user: null };
      const now = Date.now() / 1000;
      const map = (p) => ({
        id: p.id, title: p.title, seo: p.seo_url,
        cur: p.currency ? p.currency.code : "?",
        min: p.budget ? Math.round(p.budget.minimum) : null,
        max: p.budget && p.budget.maximum ? Math.round(p.budget.maximum) : null,
        type: p.type, bids: p.bid_stats ? p.bid_stats.bid_count : 0,
        hoursAgo: Math.round((now - p.time_submitted) / 3600),
        title_desc: (p.title || "") + " || " + (p.description || "").slice(0, 600),
      });
      const all = []; const seen = {};
      const push = (p) => { if (!seen[p.id] && p.type === "fixed") { seen[p.id] = 1; all.push(map(p)); } };
      const fetchP = async (url) => { const r = await fetch(url, { credentials: "include" }); const j = await r.json().catch(() => ({})); return j.result ? j.result.projects : []; };
      const from = Math.floor(Date.now() / 1000) - 20 * 86400;
      const qs = skills.map((j) => "jobs[]=" + j).join("&");
      (await fetchP(`/api/projects/0.1/projects/active/?${qs}&project_types[]=fixed&limit=100&from_time=${from}&job_details=true&full_description=true&compact=true`)).forEach(push);
      for (const q of ["react native", "next.js", "react", "node.js", "python api", "laravel", "automation", "dashboard", "whatsapp", "ai chatbot"]) {
        (await fetchP(`/api/projects/0.1/projects/active/?query=${encodeURIComponent(q)}&project_types[]=fixed&limit=40&full_description=true&compact=true`)).forEach(push);
      }
      return { status: 200, user: sj.result.username, total: all.length, projects: all };
    }, { skills: SKILLS });
    if (out.projects) {
      out.projects.forEach((p) => { p.fit = stackScore(p.title_desc); p.idn = idScore(p.title_desc) >= 4 || p.cur === "IDR"; });
      // rank: strong fit, decent budget, not too saturated, recent
      const ranked = out.projects
        .filter((p) => p.fit >= 3 && (p.max || p.min || 0) > 0)
        .map((p) => ({ ...p, rankScore: p.fit * 10 - Math.min(p.bids, 60) * 0.4 - Math.min(p.hoursAgo, 480) * 0.02 }))
        .sort((a, b) => b.rankScore - a.rankScore)
        .slice(0, 25)
        .map((p) => ({ id: p.id, title: p.title, cur: p.cur, min: p.min, max: p.max, bids: p.bids, hoursAgo: p.hoursAgo, fit: p.fit, idn: p.idn, seo: p.seo }));
      out.ranked = ranked;
    }
    if (!debug) delete out.projects;
    return out;
  });
}

async function detail(ids) {
  return withPage(async (page) => page.evaluate(async (ids) => {
    const qs = ids.map((i) => "projects[]=" + i).join("&");
    const r = await fetch(`/api/projects/0.1/projects/?${qs}&full_description=true&job_details=true&user_details=true&location_details=true&upgrade_details=true&compact=true`, { credentials: "include" });
    const j = await r.json().catch(() => ({}));
    const ps = j.result ? j.result.projects : [];
    const users = j.result && j.result.users ? j.result.users : {};
    return ps.map((p) => {
      const o = users[p.owner_id] || {};
      const rep = o.employer_reputation && o.employer_reputation.entire_history ? o.employer_reputation.entire_history : {};
      return {
        id: p.id, title: p.title, cur: p.currency ? p.currency.code : "?",
        min: p.budget ? p.budget.minimum : null, max: p.budget ? p.budget.maximum : null,
        type: p.type, bids: p.bid_stats ? p.bid_stats.bid_count : 0,
        jobs: (p.jobs || []).map((x) => x.name).join(", "),
        owner: o.username, owner_country: o.location && o.location.country ? o.location.country.name : null,
        payment_verified: o.status ? o.status.payment_verified : null,
        deposit_made: o.status ? o.status.deposit_made : null,
        owner_reviews: rep.reviews || 0, owner_rating: rep.overall || null,
        owner_complete: rep.complete || 0,
        desc: p.description || "",
      };
    });
  }, ids));
}

async function myBids() {
  return withPage(async (page) => page.evaluate(async () => {
    const self = await fetch("/api/users/0.1/self?compact=true", { credentials: "include" });
    const sj = await self.json().catch(() => ({}));
    const uid = sj.result ? sj.result.id : null;
    if (!uid) return { status: self.status, user: null };
    const r = await fetch(`/api/projects/0.1/bids/?bidders[]=${uid}&limit=100&compact=true`, { credentials: "include" });
    const j = await r.json().catch(() => ({}));
    const bids = (j.result && j.result.bids ? j.result.bids : []).map((b) => ({
      bid_id: b.id, project_id: b.project_id, amount: b.amount, period: b.period,
      retracted: b.retracted, award: b.award_status, time: b.time_submitted,
    }));
    return { user: sj.result.username, uid, count: bids.length, bids };
  }));
}

async function retract(bidId) {
  return withPage(async (page) => page.evaluate(async (bidId) => {
    const get = (n) => (document.cookie.split("; ").find((c) => c.startsWith(n + "=")) || "").split("=").slice(1).join("=");
    const uid = get("GETAFREE_USER_ID");
    const auth = uid + ";" + decodeURIComponent(get("GETAFREE_AUTH_HASH_V2"));
    const r = await fetch(`/api/projects/0.1/bids/${bidId}/?action=retract&compact=true&new_errors=true`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json", "freelancer-auth-v2": auth },
      body: JSON.stringify({}),
    });
    return { status: r.status, body: (await r.text()).slice(0, 300) };
  }, bidId));
}

async function bid(projectId, amount, period) {
  return withPage(async (page) => page.evaluate(async ({ projectId, amount, period }) => {
    const get = (n) => (document.cookie.split("; ").find((c) => c.startsWith(n + "=")) || "").split("=").slice(1).join("=");
    const uid = get("GETAFREE_USER_ID");
    const auth = uid + ";" + decodeURIComponent(get("GETAFREE_AUTH_HASH_V2"));
    const description = "Halo, saya Andi - full-stack & mobile developer 5+ tahun (205+ repo). " +
      "Karya unggulan: Saku Sultan (e-wallet) live di App Store & Play Store, 10.000+ unduhan. " +
      "Stack: Next.js, React, TypeScript, Node.js, React Native, Python/FastAPI, PostgreSQL, plus integrasi AI/LLM. " +
      "Saya orang Indonesia (Makassar), komunikasi lancar Bahasa Indonesia, siap mulai segera. Terima kasih.";
    const r = await fetch("/api/projects/0.1/bids/?compact=true&new_errors=true", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json", "freelancer-auth-v2": auth },
      body: JSON.stringify({ project_id: parseInt(projectId, 10), bidder_id: parseInt(uid, 10), amount, period, milestone_percentage: 50, description }),
    });
    return { status: r.status, body: (await r.text()).slice(0, 400) };
  }, { projectId, amount, period }));
}

(async () => {
  const [cmd, a, b, c] = process.argv.slice(2);
  let res;
  if (cmd === "scan-id") res = await scanID(false);
  else if (cmd === "scan-id-debug") res = await scanID(true);
  else if (cmd === "scan-fixed") res = await scanFixed(false);
  else if (cmd === "quota") res = await quota();
  else if (cmd === "detail") res = await detail(process.argv.slice(3).map((x) => parseInt(x, 10)));
  else if (cmd === "mybids") res = await myBids();
  else if (cmd === "retract") res = await retract(a);
  else if (cmd === "bid") res = await bid(a, parseFloat(b), parseInt(c || "14", 10));
  else res = { error: "unknown cmd" };
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
