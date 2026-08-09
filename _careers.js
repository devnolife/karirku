// Career-page finder: kasih daftar website perusahaan, script ini nyari halaman
// "career/karir/jobs/lowongan"-nya lalu narik daftar lowongannya ke hunter.db.
// Strategi hemat: heuristik dulu (link homepage -> tebak path -> sitemap -> ATS),
// browser (Playwright CDP) cuma dipakai kalau situsnya SPA dan --browser diaktifkan.
//   node _careers.js seed [--file sites.txt]        daftarkan domain ke company_sites
//   node _careers.js find <domain|url> [...]        cari halaman career (tanpa nyimpan job)
//   node _careers.js scan [--limit N] [--browser]   cari + ekstrak lowongan untuk site pending
//   node _careers.js jobs <domain> [--browser]      ekstrak lowongan dari career page yg sudah ketemu
//   node _careers.js list [--status found|none|error]
// Flag umum: --json, --concurrency N, --force, --all
const os = require("os");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const { DatabaseSync } = require("node:sqlite");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = process.env.HUNTER_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const DB_PATH = process.env.HUNTER_DB || path.join(__dirname, "data", "hunter.db");
const PLATFORM = "career";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const MAX_BODY = 1_500_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------- http ----------------------------------- */
async function get(url, { timeout = 15000, method = "GET", retries = 2 } = {}) {
  let last = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        headers: {
          "user-agent": UA,
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(timeout),
      });
      const ct = res.headers.get("content-type") || "";
      // 429/503 = kena rate limit karena probing paralel; tunggu lalu ulangi.
      if ((res.status === 429 || res.status === 503) && attempt < retries) {
        res.body?.cancel?.();
        const wait = Math.min(8000, (parseInt(res.headers.get("retry-after") || "0", 10) * 1000) || (attempt + 1) * 2500);
        await sleep(wait);
        last = { ok: false, status: res.status, url, body: "", ct, error: `http ${res.status}` };
        continue;
      }
      let body = "";
      if (method !== "HEAD" && /text|html|xml|json|javascript/i.test(ct)) body = (await res.text()).slice(0, MAX_BODY);
      return { ok: res.ok, status: res.status, url: res.url, body, ct };
    } catch (e) {
      last = { ok: false, status: 0, url, body: "", ct: "", error: String(e?.message || e?.cause?.message || e) };
      if (attempt < retries && /timeout|aborted|ECONNRESET|socket/i.test(last.error)) { await sleep(1200); continue; }
      return last;
    }
  }
  return last;
}
async function getJson(url, timeout = 15000) {
  const r = await get(url, { timeout });
  if (!r.ok || !r.body) return null;
  try { return JSON.parse(r.body); } catch { return null; }
}
async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) { const n = i++; out[n] = await fn(items[n], n); }
  }));
  return out;
}

/* --------------------------------- patterns -------------------------------- */
// Pakai batas kata supaya "edukarier"/"jobstreet" di URL promo tidak ikut kepilih.
const CAREER_CORE = "careers?|karir|karier|jobs?|lowongan|loker|rekrutmen|recruitment|hiring|join[-_\\s]?us|work[-_\\s]?with[-_\\s]?us|bergabung|vacanc(?:y|ies)|opportunit(?:y|ies)|talent|life[-_\\s]?at";
const CAREER_WORD = new RegExp(`(?:^|[^a-z0-9])(?:${CAREER_CORE})(?:[^a-z0-9]|$)`, "i");
const JOB_TITLE_WORD = /\b(engineer|developer|programmer|designer|manager|analyst|specialist|officer|intern|magang|staff|lead|architect|scientist|consultant|associate|executive|director|supervisor|qa|devops|akuntan|marketing|sales|admin|hr)\b/i;
const NOT_FOUND = /(^|\b)(404|not found|halaman tidak ditemukan|page not found|tidak dapat ditemukan)\b/i;
const BOT_WALL = /(security checkpoint|just a moment|attention required|access denied|verify you are human|cf-browser-verification|are you a robot|access verification|slide to (?:verify|complete)|please verify|geetest|recaptcha|hcaptcha|^verification$)/i;

const PROBE_PATHS = [
  "/careers", "/career", "/jobs", "/karir", "/karier", "/lowongan",
  "/join-us", "/work-with-us", "/hiring", "/rekrutmen", "/recruitment",
  "/id/careers", "/en/careers", "/id/karir", "/en/career", "/id/career",
  "/about/careers", "/about-us/careers", "/company/careers", "/careers/jobs",
  "/opportunities", "/vacancies", "/job", "/join", "/talent", "/page/karir",
];

// Job board pihak ketiga: kalau homepage nge-link ke sini, itu halaman career-nya.
const ATS = [
  { name: "greenhouse", re: /(?:boards|job-boards)\.greenhouse\.io\/([a-z0-9_-]+)/i },
  { name: "lever", re: /jobs\.lever\.co\/([a-z0-9_-]+)/i },
  { name: "ashby", re: /jobs\.ashbyhq\.com\/([a-z0-9_-]+)/i },
  { name: "workable", re: /apply\.workable\.com\/(?!j\/)([a-z0-9_-]+)/i },
  { name: "workable", re: /\/\/(?!apply\.)([a-z0-9_-]+)\.workable\.com/i },
  { name: "recruitee", re: /([a-z0-9_-]+)\.recruitee\.com/i },
  { name: "teamtailor", re: /([a-z0-9_-]+)\.teamtailor\.com/i },
  { name: "smartrecruiters", re: /careers\.smartrecruiters\.com\/([a-z0-9_-]+)/i },
  { name: "workday", re: /([a-z0-9_-]+)\.wd\d+\.myworkdayjobs\.com/i },
  { name: "bamboohr", re: /([a-z0-9_-]+)\.bamboohr\.com\/(?:jobs|careers)/i },
  { name: "kalibrr", re: /kalibrr\.com\/(?:[a-z-]+\/)?c\/([a-z0-9_.-]+)/i },
  { name: "dealls", re: /dealls\.com\/(?:perusahaan|company)\/([a-z0-9_-]+)/i },
  { name: "glints", re: /glints\.com\/(?:[a-z]{2}\/)?companies\/([a-z0-9_-]+)/i },
  { name: "jobstreet", re: /jobstreet\.co(?:m|\.id)\/[^"'\s]*compan(?:y|ies)\/([a-z0-9_-]+)/i },
  { name: "linkedin", re: /linkedin\.com\/company\/([a-z0-9_-]+)\/jobs/i },
];
function detectAts(url) {
  for (const a of ATS) { const m = a.re.exec(url); if (m) return { ats: a.name, slug: m[1] }; }
  return null;
}

/* ---------------------------------- parsing -------------------------------- */
const decodeEntities = (s) => String(s)
  .replace(/&(?:amp|#38);/gi, "&")
  .replace(/&(?:lt|#60);/gi, "<")
  .replace(/&(?:gt|#62);/gi, ">")
  .replace(/&(?:quot|#34);/gi, '"')
  .replace(/&(?:apos|#39|rsquo|#8217);/gi, "'")
  .replace(/&(?:nbsp|#160);/gi, " ")
  .replace(/&(?:ndash|#8211);/gi, "-")
  .replace(/&(?:mdash|#8212);/gi, "\u2014")
  .replace(/&#(\d{2,5});/g, (_, d) => { try { return String.fromCodePoint(+d); } catch { return _; } });

function anchors(html, baseUrl) {
  const out = [];
  // Ambil href dulu, teksnya menyusul: konten <a> di situs modern sering berisi
  // kartu/SVG panjang sehingga pola <a>...</a> yang kaku kelewat.
  const re = /<a\b([^>]{0,600}?)href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+))([^>]{0,600})>/gi;
  let m;
  while ((m = re.exec(html)) && out.length < 4000) {
    const href = (m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (!href || href.startsWith("#") || /^(javascript|mailto|tel|data):/i.test(href)) continue;
    let abs;
    try { abs = new URL(href.replace(/&amp;/g, "&"), baseUrl).toString(); } catch { continue; }
    const attrs = m[1] + m[5];
    const close = html.indexOf("</a", re.lastIndex);
    const inner = close > -1 && close - re.lastIndex < 8000 ? html.slice(re.lastIndex, close) : "";
    const titleM = /(?:title|aria-label)\s*=\s*"([^"]*)"/i.exec(attrs);
    // Kartu lowongan = satu <a> berisi banyak <div>; baris pertama biasanya judulnya.
    const lines = decodeEntities(inner
      .replace(/<(?:script|style|svg)[\s\S]*?<\/(?:script|style|svg)>/gi, " ")
      .replace(/<\/(?:div|p|li|h[1-6]|section|article|tr|td|dd|dt)\s*>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, " "))
      .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
    const first = (lines[0] || titleM?.[1] || "").slice(0, 120);
    const text = (lines.join(" ") || titleM?.[1] || "").slice(0, 220);
    out.push({ url: abs, text, first, sub: (lines[1] || "").slice(0, 60) });
  }
  return out;
}

// Situs SPA sering menyimpan URL di payload JSON (__NEXT_DATA__) alih-alih <a href>.
function urlsInHtml(html, baseUrl) {
  const out = new Set();
  const raw = html.slice(0, 800_000).replace(/\\\//g, "/").replace(/&amp;/g, "&");
  for (const m of raw.matchAll(/https?:\/\/[^\s"'<>\\)\]}]{4,200}/g)) {
    if (out.size >= 8000) break;
    out.add(m[0]);
  }
  for (const m of raw.matchAll(/["'(](\/[a-z0-9][a-z0-9/_-]{2,80})["')]/gi)) {
    if (out.size >= 12000) break;
    try { out.add(new URL(m[1], baseUrl).toString()); } catch { /* skip */ }
  }
  return [...out];
}
const titleOf = (html) => decodeEntities((/<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html)?.[1] || "").replace(/\s+/g, " ").trim());
const textOf = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

function jsonLdBlocks(html) {
  const out = [];
  const re = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1].trim().replace(/^\uFEFF/, ""))); } catch { /* skip invalid ld+json */ }
  }
  return out;
}
function walkJobPostings(node, acc = []) {
  if (!node || typeof node !== "object") return acc;
  if (Array.isArray(node)) { for (const n of node) walkJobPostings(n, acc); return acc; }
  const type = node["@type"];
  const isJob = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
  if (isJob) acc.push(node);
  for (const v of Object.values(node)) if (v && typeof v === "object") walkJobPostings(v, acc);
  return acc;
}

/* -------------------------------- discovery -------------------------------- */
function normalizeSite(input) {
  let s = String(input).trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s.replace(/^\/+/, "");
  try {
    const u = new URL(s);
    return { origin: u.origin, domain: u.hostname.replace(/^www\./, "").toLowerCase() };
  } catch { return null; }
}

// Skor kandidat: makin spesifik sinyalnya makin tinggi (0..100).
const EXACT_SEG = /^(careers?|karir|karier|jobs?|lowongan|loker|rekrutmen|recruitment|hiring|vacancies|opportunities|join-us|work-with-us|join)$/i;
function scoreCandidate(c) {
  let s = c.base;
  if (c.pathHit) s += 10;
  if (c.textHit) s += 8;
  if (c.sameHost) s += 4;
  let segs = [];
  try { segs = new URL(c.url).pathname.split("/").filter(Boolean); } catch { /* abaikan */ }
  // "/careers" jauh lebih meyakinkan daripada "/id/eva-recruitment-management".
  if (segs.length && EXACT_SEG.test(segs[segs.length - 1])) s += 8;
  else if (c.pathHit && segs.length) s -= 6;
  s -= Math.max(0, segs.length - 2) * 5;
  return Math.max(0, Math.min(100, s));
}

async function verify(url, homeUrl) {
  const r = await get(url);
  const blockedStatus = r.status === 403 || r.status === 429 || r.status === 503;
  if (!r.ok) return { ok: false, reason: blockedStatus ? `bot-protection (http ${r.status})` : `http ${r.status}${r.error ? " " + r.error : ""}`, status: r.status, blocked: blockedStatus };
  let finalU, homeU;
  try { finalU = new URL(r.url); homeU = new URL(homeUrl); } catch { return { ok: false, reason: "bad url", status: r.status }; }
  const finalPath = finalU.pathname.replace(/\/+$/, "");
  const sameHost = finalU.hostname.replace(/^www\./, "") === homeU.hostname.replace(/^www\./, "");
  // "/", "/id", "/en-id" = homepage terselubung, bukan halaman career.
  if (sameHost && (!finalPath || /^\/[a-z]{2}([-_][a-z]{2})?$/i.test(finalPath))) return { ok: false, reason: "redirect ke homepage", status: r.status };
  const title = titleOf(r.body);
  if (BOT_WALL.test(title)) return { ok: false, reason: "bot-protection", status: r.status, blocked: true };
  if (NOT_FOUND.test(title)) return { ok: false, reason: "soft 404", status: r.status };
  const body = textOf(r.body).slice(0, 200_000);
  if (BOT_WALL.test(body.slice(0, 1500))) return { ok: false, reason: "bot-protection", status: r.status, blocked: true };
  const careerHits = (body.match(new RegExp(CAREER_WORD.source, "gi")) || []).length;
  const titleHit = CAREER_WORD.test(title);
  const jobHits = (body.match(new RegExp(JOB_TITLE_WORD.source, "gi")) || []).length;
  const signal = careerHits + (titleHit ? 6 : 0) + Math.min(jobHits, 12);
  return { ok: true, status: r.status, url: r.url, title, html: r.body, signal, soft: signal < 3 };
}

async function fromSitemap(origin) {
  const found = [];
  const seeds = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const robots = await get(`${origin}/robots.txt`, { timeout: 8000 });
  if (robots.ok) for (const m of robots.body.matchAll(/^\s*sitemap:\s*(\S+)/gim)) seeds.push(m[1]);
  const seen = new Set();
  let queue = [...new Set(seeds)].slice(0, 4);
  for (let depth = 0; depth < 2 && queue.length; depth++) {
    const next = [];
    const pages = await pool(queue, 4, (u) => get(u, { timeout: 12000 }));
    for (const p of pages) {
      if (!p.ok || !/xml/i.test(p.ct + p.body.slice(0, 200))) continue;
      const isIndex = /<sitemapindex/i.test(p.body);
      for (const m of p.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
        const loc = m[1];
        if (seen.has(loc)) continue;
        seen.add(loc);
        if (isIndex) { if (CAREER_WORD.test(loc) && next.length < 4) next.push(loc); }
        else if (CAREER_WORD.test(loc)) found.push(loc);
      }
    }
    queue = next;
  }
  return found.slice(0, 20);
}

// Satu koneksi CDP dipakai bergantian: render paralel bikin sesi saling menutup.
let renderQueue = Promise.resolve();
let cdpBrowser = null;
const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms).unref?.()),
]);
function renderHtml(url, opts = {}) {
  const run = () => withTimeout(renderHtmlNow(url, opts), 90000, "render");
  const next = renderQueue.then(run, run);
  renderQueue = next.catch(() => {});
  return next;
}
async function cdpConnect() {
  if (cdpBrowser?.isConnected()) return cdpBrowser;
  const { chromium } = require("playwright-core");
  await ensureChrome();
  cdpBrowser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  return cdpBrowser;
}
async function renderHtmlNow(url, { scroll = true } = {}) {
  const browser = await cdpConnect();
  const ctx = browser.contexts()[0] || (await browser.newContext());
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(2000);
    // Daftar lowongan sering lazy-load / infinite scroll.
    if (scroll) for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 1600); await page.waitForTimeout(700); }
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(800);
    return { url: page.url(), html: await page.content() };
  } finally { await page.close().catch(() => {}); }
}
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
  throw new Error("Chrome CDP tidak naik di port " + CDP_PORT);
}

// Inti: cari halaman career untuk satu website.
async function findCareerPage(input, opts = {}) {
  const site = normalizeSite(input);
  if (!site) return { input, status: "error", notes: "domain tidak valid" };
  const res = { domain: site.domain, home_url: site.origin, status: "none", career_url: null, ats: null, method: null, confidence: 0, http_status: null, notes: null };

  // 1) homepage
  let home = await get(site.origin);
  if (!home.ok && !/^https:\/\/www\./.test(site.origin)) home = await get(site.origin.replace("://", "://www."));
  res.http_status = home.status;
  if (!home.ok && !opts.browser) {
    res.status = "error";
    res.notes = home.error ? home.error.slice(0, 120) : `http ${home.status}`;
    return res;
  }
  let homeUrl = home.ok ? home.url : site.origin;
  let homeHtml = home.body;
  let blocked = !home.ok && (home.status === 403 || home.status === 429);
  const homeError = home.ok ? null : (home.error ? home.error.slice(0, 120) : `http ${home.status}`);

  const seen = new Set();
  const homeHost = new URL(homeUrl).hostname.replace(/^www\./, "");
  // "gojek.com" -> "gojek": banyak perusahaan taruh career di domain saudara
  // (gojek.io/careers, gojek.jobs), bukan subdomain, jadi sameHost saja tidak cukup.
  const brand = homeHost.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const hostKin = (u) => {
    const h = u.hostname.replace(/^www\./, "").toLowerCase();
    if (h === homeHost || h.endsWith("." + homeHost)) return "same";
    if (brand.length >= 4 && (h.startsWith(brand + ".") || h.includes("." + brand + ".") || h.includes(brand))) return "kin";
    if (/\.jobs$/i.test(h) && brand.length >= 4 && h.includes(brand)) return "kin";
    return "foreign";
  };
  const dedupe = (list) => list.filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true)));
  const rank = (list) => dedupe(list).map((c) => ({ ...c, score: scoreCandidate(c) })).sort((a, b) => b.score - a.score);

  const fromHomepage = () => {
    const out = [];
    for (const a of anchors(homeHtml || "", homeUrl)) {
      let u;
      try { u = new URL(a.url); } catch { continue; }
      const hit = detectAts(a.url);
      const pathHit = CAREER_WORD.test(u.pathname + u.search);
      const textHit = CAREER_WORD.test(a.text);
      if (hit) { out.push({ url: a.url, base: 88, pathHit, textHit, sameHost: false, method: "ats", ats: hit.ats, slug: hit.slug }); continue; }
      const kin = hostKin(u);
      const hostHit = CAREER_WORD.test(u.hostname); // careers.perusahaan.com / perusahaan.jobs
      if (!pathHit && !textHit && !(hostHit && kin !== "foreign")) continue;
      if (kin === "foreign") continue; // link career ke domain asing (mis. blog/agregator) -> abaikan
      out.push({ url: a.url, base: kin === "same" ? 62 : 66, pathHit: pathHit || hostHit, textHit, sameHost: kin === "same" });
      out[out.length - 1].method = kin === "same" ? "homepage-link" : "brand-domain";
    }
    // ATS sering ditanam di blob JS/JSON, bukan cuma di <a href>.
    for (const a of ATS) {
      const m = a.re.exec(homeHtml || "");
      if (!m) continue;
      const raw = m[0].startsWith("http") ? m[0] : "https://" + m[0];
      out.push({ url: raw, base: 84, pathHit: true, textHit: false, sameHost: false, method: "ats-embed", ats: a.name, slug: m[1] });
    }
    return out;
  };
  const fromHtmlScan = () => {
    const out = [];
    for (const raw of urlsInHtml(homeHtml || "", homeUrl)) {
      let u;
      try { u = new URL(raw); } catch { continue; }
      const hit = detectAts(raw);
      if (hit) { out.push({ url: raw, base: 84, pathHit: true, textHit: false, sameHost: false, method: "ats-embed", ats: hit.ats, slug: hit.slug }); continue; }
      const kin = hostKin(u);
      if (kin === "foreign") continue;
      const pathHit = CAREER_WORD.test(u.pathname);
      const hostHit = CAREER_WORD.test(u.hostname);
      if (!pathHit && !hostHit) continue;
      if (/\.(png|jpe?g|svg|webp|css|js|ico|woff2?|mp4|pdf)$/i.test(u.pathname)) continue;
      out.push({ url: raw, base: kin === "same" ? 56 : 60, pathHit: true, textHit: false, sameHost: kin === "same", method: "html-scan" });
    }
    return out;
  };
  const fromProbes = async () => {
    // Situs multi-bahasa sering me-redirect ke prefix locale (/en-id), jadi coba juga di situ.
    let prefix = "";
    try {
      const seg = new URL(homeUrl).pathname.split("/").filter(Boolean)[0];
      if (seg && /^[a-z]{2}([-_][a-z]{2})?$/i.test(seg)) prefix = "/" + seg;
    } catch { /* abaikan */ }
    const paths = [...PROBE_PATHS];
    if (prefix) for (const p of ["/careers", "/career", "/jobs", "/karir", "/lowongan"]) paths.push(prefix + p);
    const probes = await pool(paths.map((p) => site.origin + p), Number(opts.concurrency) || 5, async (u) => {
      const r = await get(u, { timeout: 10000, retries: 1 });
      return r.ok ? r.url : null;
    });
    return probes.filter(Boolean).map((u) => ({ url: u, base: 58, pathHit: true, textHit: false, sameHost: true, method: "path-probe" }));
  };
  const fromMap = async () => (await fromSitemap(site.origin))
    .map((u) => ({ url: u, base: 52, pathHit: true, textHit: false, sameHost: true, method: "sitemap" }));
  // Banyak perusahaan pakai careers.<domain> tapi tidak me-link-nya dari homepage.
  const fromSubdomains = async () => {
    const subs = ["careers", "career", "jobs", "karir", "karier", "recruitment", "hiring", "talent", "join"];
    const hits = await pool(subs.map((s) => `https://${s}.${homeHost}/`), Number(opts.concurrency) || 5, async (u) => {
      const r = await get(u, { timeout: 8000, retries: 0 });
      return r.ok || r.status === 403 || r.status === 429 ? u : null;
    });
    return hits.filter(Boolean).map((u) => ({ url: u, base: 72, pathHit: true, textHit: false, sameHost: true, method: "subdomain" }));
  };
  // Situs SPA (link career cuma ada setelah JS jalan) atau kena bot-wall: render homepage-nya.
  const fromBrowserHome = async () => {
    if (!opts.browser) return [];
    try {
      const rr = await renderHtml(homeUrl);
      homeUrl = rr.url;
      homeHtml = rr.html;
      return [...fromHomepage(), ...fromHtmlScan()].map((c) => ({ ...c, method: c.method + "+browser" }));
    } catch (e) { res.notes = String(e.message).slice(0, 120); return []; }
  };

  const accept = (c, v) => {
    res.status = "found";
    res.career_url = v.url;
    res.method = c.method;
    res.ats = c.ats || detectAts(v.url)?.ats || null;
    res.slug = c.slug || detectAts(v.url)?.slug || null;
    res.confidence = Math.min(100, c.score + Math.min(12, v.signal));
    res.http_status = v.status;
    res.title = v.title;
    res.html = v.html;
    res.notes = null;
    return res;
  };

  // Bertahap: link homepage -> scan HTML mentah -> tebak path -> sitemap -> render browser.
  // Berhenti begitu ada kandidat yang lolos verifikasi.
  const stages = [fromHomepage, fromHtmlScan, fromSubdomains, fromProbes, fromMap, fromBrowserHome];
  for (const stage of stages) {
    const ranked = rank(await stage());
    if (opts.debug) console.error(`  [${stage.name}] ${ranked.slice(0, 6).map((c) => `${c.url}(${c.score})`).join(" ") || "-"}`);
    for (const c of ranked.slice(0, 4)) {
      const v = await verify(c.url, homeUrl);
      if (!v.ok) {
        if (v.blocked) blocked = true;
        // Bot-wall bisa ditembus dengan Chrome asli (profil punya cookie & TLS fingerprint normal).
        if (opts.browser && (v.blocked || v.status === 0)) {
          try {
            const rr = await renderHtml(c.url);
            const title = titleOf(rr.html);
            if (!BOT_WALL.test(title) && !NOT_FOUND.test(title)) {
              const sig = (textOf(rr.html).match(new RegExp(CAREER_WORD.source, "gi")) || []).length + (JOB_TITLE_WORD.test(textOf(rr.html)) ? 6 : 0);
              if (sig >= 2 || CAREER_WORD.test(new URL(rr.url).pathname + new URL(rr.url).hostname)) {
                return accept({ ...c, method: c.method + "+browser" }, { url: rr.url, status: 200, title, html: rr.html, signal: sig });
              }
            }
          } catch { /* browser gagal, lanjut kandidat berikutnya */ }
        }
        res.notes = `${c.url} -> ${v.reason}`;
        continue;
      }
      if (v.soft && !String(c.method).startsWith("ats") && opts.browser) {
        try {
          const rr = await renderHtml(c.url);
          // Hitung ulang sinyalnya: halaman SPA baru "berisi" setelah JS jalan.
          const body = textOf(rr.html).slice(0, 200_000);
          v.title = titleOf(rr.html) || v.title;
          if (BOT_WALL.test(v.title) || BOT_WALL.test(body.slice(0, 1500))) {
            blocked = true;
            v.wall = true;
          } else {
            const careerHits = (body.match(new RegExp(CAREER_WORD.source, "gi")) || []).length;
            const jobHits = (body.match(new RegExp(JOB_TITLE_WORD.source, "gi")) || []).length;
            v.html = rr.html;
            v.url = rr.url;
            v.signal = careerHits + (CAREER_WORD.test(v.title) ? 6 : 0) + Math.min(jobHits, 12);
            v.soft = v.signal < 3;
          }
        } catch { /* biarkan hasil statis */ }
      }
      if (v.wall) { res.notes = `${c.url} -> bot-protection`; continue; }
      // Halaman "sepi sinyal" masih diterima kalau kandidatnya dari link/host yang
      // memang menyatakan career (SPA sering kosong saat di-fetch statis).
      const trusted = ["homepage-link", "brand-domain"].includes(c.method.replace("+browser", "")) || String(c.method).startsWith("ats") || CAREER_WORD.test(new URL(v.url).hostname);
      if (v.soft && !trusted) { res.notes = `${c.url} -> halaman tanpa sinyal karir`; continue; }
      return accept(c, v);
    }
  }
  if (blocked && res.status === "none") {
    res.status = "blocked";
    if (!/bot-protection/.test(res.notes || "")) res.notes = (res.notes ? res.notes + " | " : "") + "bot-protection";
    if (!opts.browser) res.notes += ", coba --browser";
  }
  // Homepage-nya sendiri tidak bisa diambil (DNS/TLS mati) = error, bukan "tidak punya career page".
  if (homeError && res.status === "none" && !seen.size) {
    res.status = "error";
    res.notes = homeError;
    return res;
  }
  if (!seen.size) res.notes = res.notes || (opts.browser ? "tidak ada kandidat" : "tidak ada kandidat (situs SPA? coba --browser)");
  return res;
}

/* ------------------------------ ekstraksi job ------------------------------ */
async function atsJobs(ats, slug) {
  const out = [];
  const add = (title, url, location, description) => { if (title && url) out.push({ title: String(title).trim(), url, location: location || null, description: description || null }); };
  try {
    if (ats === "greenhouse") {
      const j = await getJson(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
      for (const x of j?.jobs || []) add(x.title, x.absolute_url, x.location?.name, x.content?.replace(/<[^>]*>/g, " ").slice(0, 4000));
    } else if (ats === "lever") {
      const j = await getJson(`https://api.lever.co/v0/postings/${slug}?mode=json`);
      for (const x of j || []) add(x.text, x.hostedUrl, x.categories?.location, x.descriptionPlain?.slice(0, 4000));
    } else if (ats === "ashby") {
      const j = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`);
      for (const x of j?.jobs || []) add(x.title, x.jobUrl, x.location, x.descriptionPlain?.slice(0, 4000));
    } else if (ats === "recruitee") {
      const j = await getJson(`https://${slug}.recruitee.com/api/offers/`);
      for (const x of j?.offers || []) add(x.title, x.careers_url || x.careers_apply_url, x.location, x.description?.replace(/<[^>]*>/g, " ").slice(0, 4000));
    } else if (ats === "workable") {
      const j = await getJson(`https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`);
      for (const x of j?.jobs || []) add(x.title, x.url || x.application_url, x.location?.city || x.city, x.description?.replace(/<[^>]*>/g, " ").slice(0, 4000));
    } else if (ats === "smartrecruiters") {
      const j = await getJson(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`);
      for (const x of j?.content || []) add(x.name, `https://jobs.smartrecruiters.com/${slug}/${x.id}`, x.location?.city, null);
    } else if (ats === "teamtailor") {
      const j = await getJson(`https://${slug}.teamtailor.com/jobs.json`);
      for (const x of j?.jobs || j || []) add(x.title, x.url, x.location, null);
    }
  } catch { /* ATS API opsional, jangan gagalkan scan */ }
  return out;
}

function jobsFromHtml(html, pageUrl) {
  const out = [];
  const seen = new Set();
  const add = (title, url, location, description) => {
    if (!title || !url) return;
    const t = decodeEntities(String(title)).replace(/\s+/g, " ").trim();
    if (t.length < 3 || t.length > 120) return;
    const key = url.split("#")[0];
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ title: t, url: key, location: location || null, description: description || null });
  };

  for (const block of jsonLdBlocks(html)) {
    for (const jp of walkJobPostings(block)) {
      const loc = jp.jobLocation?.address?.addressLocality || jp.jobLocation?.[0]?.address?.addressLocality || (typeof jp.jobLocation === "string" ? jp.jobLocation : null);
      let url = jp.url || jp.sameAs || pageUrl;
      try { url = new URL(url, pageUrl).toString(); } catch { url = pageUrl; }
      add(jp.title, url, loc, String(jp.description || "").replace(/<[^>]*>/g, " ").slice(0, 4000));
    }
  }
  if (out.length) return out;

  // fallback: anchor yang polanya kayak detail lowongan
  const detailPath = /\/(job|jobs|career|careers|karir|karier|lowongan|position|positions|vacanc\w*|opening|openings|opportunit\w*|apply)\/[^/?#]{3,}/i;
  for (const a of anchors(html, pageUrl)) {
    let u;
    try { u = new URL(a.url); } catch { continue; }
    const looksDetail = detailPath.test(u.pathname) || detectAts(a.url);
    if (!looksDetail) continue;
    const title = a.first || a.text;
    if (!title || !JOB_TITLE_WORD.test(title)) continue;
    const sub = /^(department|read more|selengkapnya|lihat|apply|lamar|full[- ]?time|part[- ]?time|contract|internship)$/i.test(a.sub) ? "" : a.sub;
    add(title, a.url, sub || null, null);
  }
  return out;
}

async function extractJobs(site, opts = {}, depth = 0) {
  if (site.ats && site.slug) {
    const j = await atsJobs(site.ats, site.slug);
    if (j.length) return { jobs: j, via: `ats:${site.ats}` };
  }
  let html = site.html;
  let url = site.career_url;
  if (!html) { const r = await get(url); html = r.body; url = r.url || url; }
  let jobs = jobsFromHtml(html || "", url);
  if (opts.debug) console.error(`  [extract d${depth}] ${url} static=${jobs.length} len=${(html || "").length}`);
  if (jobs.length) return { jobs, via: depth ? "drill" : "html" };

  // Halaman career sering cuma "etalase"; daftar lowongannya di ATS pihak ketiga.
  const seenAts = new Set();
  for (const raw of urlsInHtml(html || "", url)) {
    const hit = detectAts(raw);
    if (!hit || seenAts.has(hit.ats + hit.slug)) continue;
    seenAts.add(hit.ats + hit.slug);
    const j = await atsJobs(hit.ats, hit.slug);
    if (j.length) return { jobs: j, via: `ats:${hit.ats}` };
    if (seenAts.size >= 4) break;
  }

  if (opts.browser) {
    try {
      const r = await renderHtml(url);
      jobs = jobsFromHtml(r.html, r.url);
      if (opts.debug) console.error(`  [extract d${depth}] rendered ${r.url} len=${r.html.length} jobs=${jobs.length}`);
      if (jobs.length) return { jobs, via: "browser" };
      html = r.html;
      url = r.url;
    } catch (e) { if (opts.debug) console.error(`  [extract d${depth}] render gagal: ${e.message}`); }
  }

  // Turun satu level ke sub-halaman daftar lowongan (/careers -> /careers/jobs).
  if (depth < 1) {
    let host;
    try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { host = ""; }
    const subRe = /\/(jobs|openings|positions|vacanc\w*|lowongan|opportunities|search|all-jobs|open-positions)\b/i;
    const subs = [];
    const subPaths = new Set();
    for (const a of anchors(html || "", url)) {
      let u;
      try { u = new URL(a.url); } catch { continue; }
      if (u.toString().replace(/\/+$/, "") === String(url).replace(/\/+$/, "")) continue;
      if (!subRe.test(u.pathname) && !subRe.test(a.text)) continue;
      if (u.hostname.replace(/^www\./, "") !== host) continue;
      if (subPaths.has(u.pathname)) continue; // /jobs?location=AU dst. = halaman yang sama
      subPaths.add(u.pathname);
      subs.push(u.origin + u.pathname);
      if (subs.length >= 3) break;
    }
    for (const s of subs) {
      if (opts.debug) console.error(`  [drill] ${s}`);
      const r = await extractJobs({ career_url: s }, opts, depth + 1);
      if (r.jobs.length) return { jobs: r.jobs, via: `drill:${r.via}` };
    }
  }
  return { jobs: [], via: "none" };
}

/* ------------------------------------ db ----------------------------------- */
function db() {
  const d = new DatabaseSync(DB_PATH);
  d.exec("PRAGMA journal_mode=WAL");
  d.exec(`create table if not exists company_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL UNIQUE,
    name TEXT,
    home_url TEXT,
    career_url TEXT,
    ats TEXT,
    ats_slug TEXT,
    method TEXT,
    confidence INTEGER NOT NULL DEFAULT 0,
    http_status INTEGER,
    jobs_found INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    checked_at TEXT
  )`);
  d.exec("create index if not exists idx_company_sites_status on company_sites(status)");
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

const OFF_ROLE = /\b(sales|marketing|akunting|akuntan|admin gudang|driver|kurir|perawat|guru|teacher|customer service|telemarketing|hrd|recruiter|host live|content creator|video editor|designer grafis|barista|kasir|security|satpam|cleaning)\b/i;
const wordRe = (term) => new RegExp(`(^|[^a-z0-9+#.])${term.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9+#]|$)`, "i");
const reCache = new Map();
const matches = (term, text) => {
  let re = reCache.get(term);
  if (!re) { re = wordRe(term); reCache.set(term, re); }
  return re.test(text);
};
// Selaras dengan scoring _indeed.js: judul jauh lebih berbobot daripada body.
function score(job, cfg) {
  const hay = `${job.title} ${job.company || ""} ${job.description || ""}`;
  const title = job.title || "";
  let s = 0;
  for (const k of cfg.keywords) { if (!matches(k, hay)) continue; s += matches(k, title) ? 15 : 7; }
  s = Math.min(s, 72);
  const avoidedInTitle = cfg.avoid.filter((a) => matches(a, title));
  const avoided = cfg.avoid.filter((a) => matches(a, hay));
  s -= avoidedInTitle.length * 22 + (avoided.length - avoidedInTitle.length) * 4;
  if (job.remote) s += 12;
  if (OFF_ROLE.test(title)) s -= 45;
  if (!/\b(developer|engineer|programmer|software|frontend|front-end|backend|back-end|fullstack|full stack|full-stack|mobile|web|it|ai|ml|data)\b/i.test(title)) s -= 12;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function saveJobs(d, cfg, company, jobs) {
  const ins = d.prepare(`insert into jobs (platform, external_id, title, company, url, location, remote, salary_min, salary_max, currency, description, match_score, status)
    values (?, ?, ?, ?, ?, ?, ?, null, null, 'IDR', ?, ?, 'new')
    on conflict(platform, external_id) do update set
      title=excluded.title, company=excluded.company, location=excluded.location,
      description=coalesce(excluded.description, jobs.description), match_score=excluded.match_score`);
  let saved = 0;
  for (const j of jobs) {
    const remote = /\b(remote|wfh|work from home|anywhere)\b/i.test(`${j.title} ${j.location || ""} ${j.description || ""}`) ? 1 : 0;
    const rec = { title: j.title, company, description: j.description, remote };
    ins.run(PLATFORM, j.url, j.title, company, j.url, j.location, remote, j.description || null, score(rec, cfg));
    saved++;
  }
  return saved;
}

function upsertSite(d, r) {
  d.prepare(`insert into company_sites (domain, name, home_url, career_url, ats, ats_slug, method, confidence, http_status, jobs_found, status, notes, checked_at)
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    on conflict(domain) do update set
      name=coalesce(excluded.name, company_sites.name), home_url=excluded.home_url, career_url=excluded.career_url,
      ats=excluded.ats, ats_slug=excluded.ats_slug, method=excluded.method, confidence=excluded.confidence,
      http_status=excluded.http_status, jobs_found=excluded.jobs_found, status=excluded.status,
      notes=excluded.notes, checked_at=datetime('now')`)
    .run(r.domain, r.name || null, r.home_url || null, r.career_url || null, r.ats || null, r.slug || null,
      r.method || null, r.confidence || 0, r.http_status ?? null, r.jobs_found || 0, r.status, r.notes || null);
}

/* --------------------------------- commands -------------------------------- */
const DEFAULT_SEED = [
  "gojek.com", "tokopedia.com", "traveloka.com", "bukalapak.com", "blibli.com", "shopee.co.id",
  "grab.com", "dana.id", "ovo.id", "linkaja.id", "xendit.co", "midtrans.com", "flip.id",
  "ajaib.co.id", "bibit.id", "stockbit.com", "pintu.co.id", "kredivo.com", "akulaku.com",
  "amartha.com", "investree.id", "koinworks.com", "modalku.co.id", "julo.co.id",
  "ruangguru.com", "zenius.net", "sekolah.mu", "pijarmahir.id", "dicoding.com",
  "halodoc.com", "alodokter.com", "gooddoctor.co.id", "prosehat.com",
  "efishery.com", "sayurbox.com", "tanihub.com", "segari.id", "astro.id",
  "mekari.com", "hashmicro.com", "qontak.com", "majoo.id", "moka.co", "jurnal.id",
  "kata.ai", "prosa.ai", "nodeflux.io", "bahasa.ai", "widya.ai",
  "telkom.co.id", "bri.co.id", "bca.co.id", "mandiri.co.id", "bni.co.id", "pegadaian.co.id",
  "vidio.com", "kompas.com", "detik.com", "IDN.media", "kumparan.com",
  "sicepat.com", "anteraja.id", "jne.co.id", "waresix.com", "kargo.tech", "logisly.com",
];

function parseArgs(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      const key = k.replace(/-/g, "_");
      if (v !== undefined) flags[key] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) flags[key] = argv[++i];
      else flags[key] = true;
    } else rest.push(a);
  }
  return { flags, rest };
}
const pad = (s, n) => String(s ?? "").slice(0, n).padEnd(n);

function readSites(file) {
  return fs.readFileSync(file, "utf8").split(/\r?\n/)
    .map((l) => l.split("#")[0].trim()).filter(Boolean);
}

async function cmdSeed(flags, rest) {
  const d = db();
  const list = flags.file ? readSites(flags.file) : (rest.length ? rest : DEFAULT_SEED);
  let added = 0;
  const stmt = d.prepare("insert into company_sites (domain, home_url, status) values (?, ?, 'pending') on conflict(domain) do nothing");
  for (const raw of list) {
    const s = normalizeSite(raw);
    if (!s) continue;
    const before = d.prepare("select count(*) c from company_sites").get().c;
    stmt.run(s.domain, s.origin);
    if (d.prepare("select count(*) c from company_sites").get().c > before) added++;
  }
  console.log(`seed: ${added} domain baru, total ${d.prepare("select count(*) c from company_sites").get().c}`);
}

async function runFind(targets, opts) {
  const conc = Number(opts.concurrency) || 4;
  return pool(targets, conc, async (t) => {
    const r = await findCareerPage(t, opts);
    const tag = r.status === "found" ? "OK " : r.status === "error" ? "ERR" : r.status === "blocked" ? "BOT" : "-- ";
    console.log(`${tag} ${pad(r.domain || t, 26)} ${pad(r.career_url || r.notes || "", 62)} ${r.method || ""}${r.ats ? "/" + r.ats : ""} ${r.confidence || ""}`);
    return r;
  });
}

async function cmdFind(flags, rest) {
  const targets = flags.file ? readSites(flags.file) : rest;
  if (!targets.length) { console.error("kasih domain, mis: node _careers.js find gojek.com"); process.exit(1); }
  const results = await runFind(targets, flags);
  if (flags.json) console.log(JSON.stringify(results.map((r) => { const c = { ...r }; delete c.html; return c; }), null, 2));
  const okc = results.filter((r) => r.status === "found").length;
  console.log(`\nketemu ${okc}/${results.length}`);
}

async function cmdScan(flags) {
  const d = db();
  const cfg = settings(d);
  const limit = parseInt(flags.limit || "20", 10);
  const where = flags.force || flags.all ? "1=1" : "status in ('pending','error') or career_url is null";
  const rows = d.prepare(`select domain, home_url from company_sites where ${where} order by checked_at is not null, id limit ?`).all(limit);
  if (!rows.length) { console.log("tidak ada site pending. jalankan: node _careers.js seed"); return; }
  console.log(`scan ${rows.length} site (browser=${flags.browser ? "on" : "off"})\n`);
  const started = Date.now();
  let found = 0, totalJobs = 0;
  const results = await pool(rows, Number(flags.concurrency) || 3, async (row) => {
    const r = await findCareerPage(row.home_url || row.domain, flags);
    r.domain = row.domain;
    if (r.status === "found") {
      const { jobs, via } = await extractJobs(r, flags);
      r.jobs_found = jobs.length;
      r.via = via;
      if (jobs.length) totalJobs += saveJobs(d, cfg, row.domain, jobs);
      found++;
    }
    delete r.html;
    upsertSite(d, r);
    const tag = r.status === "found" ? "OK " : r.status === "error" ? "ERR" : r.status === "blocked" ? "BOT" : "-- ";
    console.log(`${tag} ${pad(r.domain, 24)} ${pad(r.career_url || r.notes || "", 58)} ${pad((r.method || "") + (r.ats ? "/" + r.ats : ""), 18)} jobs=${r.jobs_found || 0}`);
    return r;
  });
  const stats = { sites: rows.length, found, jobs: totalJobs, secs: Math.round((Date.now() - started) / 1000) };
  d.prepare("insert into runs (type, platform, finished_at, ok, stats_json) values ('scan', ?, datetime('now'), 1, ?)")
    .run(PLATFORM, JSON.stringify(stats));
  console.log(`\nselesai: ${found}/${rows.length} career page ketemu, ${totalJobs} lowongan tersimpan (${stats.secs}s)`);
  if (flags.json) console.log(JSON.stringify(results, null, 2));
}

async function cmdJobs(flags, rest) {
  const d = db();
  const cfg = settings(d);
  const rows = rest.length
    ? rest.map((x) => d.prepare("select * from company_sites where domain = ?").get(normalizeSite(x)?.domain || x)).filter(Boolean)
    : d.prepare("select * from company_sites where status='found' and career_url is not null order by jobs_found asc, confidence desc limit ?").all(parseInt(flags.limit || "10", 10));
  if (!rows.length) { console.error("tidak ada career page tersimpan; jalankan scan dulu"); process.exit(1); }
  let total = 0;
  for (const row of rows) {
    const { jobs, via } = await extractJobs({ career_url: row.career_url, ats: row.ats, slug: row.ats_slug }, flags);
    const saved = jobs.length ? saveJobs(d, cfg, row.domain, jobs) : 0;
    total += saved;
    d.prepare("update company_sites set jobs_found = ?, checked_at = datetime('now') where domain = ?").run(jobs.length, row.domain);
    console.log(`${pad(row.domain, 24)} ${pad(via, 14)} ${jobs.length} lowongan`);
    for (const j of jobs.slice(0, flags.json ? 0 : 8)) console.log(`   - ${pad(j.title, 58)} ${j.location || ""}`);
    if (flags.json) console.log(JSON.stringify(jobs, null, 2));
  }
  console.log(`\ntotal ${total} lowongan masuk hunter.db (platform='${PLATFORM}')`);
}

// Skor awal cuma dari judul; ambil deskripsi detail lalu hitung ulang (pola sama
// dengan `_indeed.js enrich`).
async function cmdEnrich(flags) {
  const d = db();
  const cfg = settings(d);
  const limit = parseInt(flags.limit || "25", 10);
  const rows = d.prepare(`select id, url, title, company from jobs
    where platform = ? and (description is null or length(description) < 200)
    order by match_score desc, id desc limit ?`).all(PLATFORM, limit);
  if (!rows.length) { console.log("tidak ada lowongan yang perlu di-enrich"); return; }
  const upd = d.prepare("update jobs set description = ?, remote = ?, match_score = ? where id = ?");
  let n = 0;
  for (const r of rows) {
    const res = await get(r.url, { timeout: 15000, retries: 1 });
    let desc = "";
    for (const b of jsonLdBlocks(res.body || "")) {
      for (const jp of walkJobPostings(b)) if (jp.description) desc = String(jp.description).replace(/<[^>]*>/g, " ");
    }
    if (!desc) desc = textOf(res.body || "");
    desc = decodeEntities(desc).replace(/\s+/g, " ").trim().slice(0, 6000);
    if (desc.length < 150) continue;
    const remote = /\b(remote|wfh|work from home|anywhere)\b/i.test(`${r.title} ${desc}`) ? 1 : 0;
    const s = score({ title: r.title, company: r.company, description: desc, remote }, cfg);
    upd.run(desc, remote, s, r.id);
    n++;
    console.log(`${pad(r.company, 20)} ${pad(r.title, 46)} score ${s}`);
  }
  console.log(`\nenrich: ${n}/${rows.length} lowongan diperbarui`);
}

function cmdList(flags) {
  const d = db();
  const rows = flags.status
    ? d.prepare("select * from company_sites where status = ? order by confidence desc").all(flags.status)
    : d.prepare("select * from company_sites order by status desc, confidence desc").all();
  if (flags.json) { console.log(JSON.stringify(rows, null, 2)); return; }
  console.log(`${pad("domain", 24)} ${pad("status", 8)} ${pad("career_url", 58)} ${pad("via", 18)} jobs`);
  for (const r of rows) console.log(`${pad(r.domain, 24)} ${pad(r.status, 8)} ${pad(r.career_url || r.notes || "", 58)} ${pad((r.method || "") + (r.ats ? "/" + r.ats : ""), 18)} ${r.jobs_found}`);
  const agg = d.prepare("select status, count(*) c from company_sites group by status").all();
  console.log("\n" + agg.map((a) => `${a.status}=${a.c}`).join("  "));
}

async function main() {
  const [cmd, ...argv] = process.argv.slice(2);
  const { flags, rest } = parseArgs(argv);
  try {
    switch (cmd) {
      case "seed": return await cmdSeed(flags, rest);
      case "find": return await cmdFind(flags, rest);
      case "scan": return await cmdScan(flags);
      case "jobs": return await cmdJobs(flags, rest);
      case "enrich": return await cmdEnrich(flags);
      case "list": return cmdList(flags);
      default:
        console.log(`node _careers.js seed [--file sites.txt] [domain...]
node _careers.js find <domain|url> [...] [--browser] [--json] [--concurrency N]
node _careers.js scan [--limit N] [--browser] [--force] [--concurrency N]
node _careers.js jobs [domain...] [--browser] [--limit N] [--json]
node _careers.js enrich [--limit N]
node _careers.js list [--status found|none|blocked|error|pending] [--json]`);
    }
  } finally {
    if (cdpBrowser?.isConnected()) await cdpBrowser.close().catch(() => {});
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
