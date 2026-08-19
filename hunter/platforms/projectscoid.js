// hunter/platforms/projectscoid.js — scan Projects.co.id + place bids.
//
// Runs in its own isolated Chrome profile (browser.js PROFILES.projectscoid)
// so the Projects.co.id session belongs only to ACCOUNT_EMAIL and never mixes
// with the accounts stored in the older automation profile.
//
// Login is never scripted with a password: `login()` opens the login page and
// waits for the human to finish (Google button or email/password), then the
// session cookie lives in that dedicated profile for later runs.
const { withPage, goto, sleep } = require("../browser");
const { upsertJob, recordApplication, getDb, getSetting } = require("../db");
const { scoreJob } = require("../matcher");

const ACCOUNT_EMAIL = process.env.HUNTER_PCO_EMAIL || "andiagung193@gmail.com";
const BASE = "https://projects.co.id";
const LISTING = BASE + "/public/browse_projects/listing";
const PROFILE = "projectscoid";

// Categories where devnolife's stack actually competes.
const CATEGORIES = [
  { slug: "6_website-development", label: "Website Development" },
  { slug: "4_mobile-programming", label: "Mobile Programming" },
  { slug: "2_desktop-programming", label: "Desktop Programming" },
  { slug: "29_data-entry-and-data-mining", label: "Data Entry & Data Mining" },
  { slug: "22_others", label: "Others" },
];

// Extra weight for skills that are genuinely ours, on top of matcher keywords.
const STRENGTHS = [
  { rx: /next\.?js|react(?!\s*native)|typescript|javascript|node\.?js|express|nest\.?js/i, w: 16, tag: "web app (Next.js/React/Node)" },
  { rx: /react native|android|ios|aplikasi mobile|mobile app/i, w: 16, tag: "mobile app (React Native)" },
  { rx: /python|fastapi|django|flask|golang|go lang/i, w: 12, tag: "backend Python/Go" },
  { rx: /\bapi\b|rest api|integrasi|webhook|payment gateway|midtrans|xendit/i, w: 10, tag: "integrasi API" },
  { rx: /postgre|mysql|mariadb|mongodb|database|sql/i, w: 8, tag: "database" },
  { rx: /\bai\b|machine learning|deep learning|llm|chatgpt|openai|gemini|chatbot|nlp|ocr/i, w: 20, tag: "AI/LLM" },
  { rx: /scraping|scrapping|crawler|data mining|automation|otomasi|bot whatsapp|telegram bot/i, w: 14, tag: "scraping & automation" },
  { rx: /dashboard|sistem informasi|erp|pos\b|inventory|admin panel|saas/i, w: 10, tag: "dashboard & sistem informasi" },
];

// Postings that are not development work at all (account trading, gambling…).
const JUNK = /\b(wtb|wts)\b|akun adsense|beli akun|dibeli akun|jual akun|play\s?console|godev|judi|slot gacor|gacor|pinjol|pinjaman online|akun gmail|akun tiktok|top ?up|followers/i;

function num(s) {
  const n = String(s || "").replace(/[^\d]/g, "");
  return n ? parseInt(n, 10) : 0;
}

function intSetting(key, fallback) {
  const v = parseInt(getSetting(key, String(fallback)), 10);
  return Number.isFinite(v) ? v : fallback;
}

/** Score a project against our strengths. Returns {score, matched, junk}. */
function scoreProject(p) {
  const text = `${p.title} ${p.description || ""} ${(p.tags || []).join(" ")}`;
  const base = scoreJob({ title: p.title, description: `${p.description || ""} ${(p.tags || []).join(" ")}`, remote: 1 });
  let bonus = 0;
  const matched = [];
  for (const s of STRENGTHS) {
    if (s.rx.test(text)) { bonus += s.w; matched.push(s.tag); }
  }
  return {
    score: Math.max(0, Math.min(100, Math.round(base * 0.6 + bonus))),
    matched,
    junk: JUNK.test(text),
  };
}

/**
 * Bid amount inside the published budget: floor-aware, positioned at
 * `pco_bid_position` percent of the range, rounded to 100k.
 * Returns null when the budget can't clear our floor.
 */
function planBid(p) {
  const floor = intSetting("pco_bid_floor_idr", 1_000_000);
  const pos = Math.min(100, Math.max(0, intSetting("pco_bid_position_pct", 35))) / 100;
  const min = p.budget_min || 0;
  const max = p.budget_max || p.budget_min || 0;
  if (!max) return { amount: floor, days: p.finish_days || 14, note: "budget tidak tercantum → pakai floor" };
  if (max < floor) return null;
  const raw = Math.max(floor, Math.round((min || floor) + ((max - (min || floor)) * pos)));
  const amount = Math.min(max, Math.round(raw / 100_000) * 100_000);
  return { amount: Math.max(amount, Math.min(floor, max)), days: p.finish_days || 14, note: null };
}

function rupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

/** Proposal text tailored to what the project actually asks for. */
function buildProposal(p, matched, plan) {
  const focus = matched.length ? matched.slice(0, 3).join(", ") : "pengembangan aplikasi web";
  const lines = [
    `Halo, saya Andi — full-stack & mobile developer 5+ tahun (205+ repo publik).`,
    `Project "${p.title.slice(0, 90)}" ini masuk ke keahlian utama saya: ${focus}.`,
    ``,
    `Kenapa saya cocok:`,
    `• Stack harian: Next.js/React, TypeScript, Node.js, React Native, Python/FastAPI, PostgreSQL, plus integrasi AI/LLM.`,
    `• Portofolio produksi: Saku Sultan (aplikasi e-wallet) live di App Store & Play Store dengan 10.000+ unduhan.`,
    `• Terbiasa menangani end-to-end: rancang skema database → API → UI → deploy.`,
    ``,
    `Rencana kerja:`,
    `1. Konfirmasi detail kebutuhan & alur (hari 1).`,
    `2. Kerjakan bertahap dengan demo progres berkala agar mudah dikoreksi.`,
    `3. Serah terima: source code, dokumentasi singkat, dan pendampingan setelah selesai.`,
    ``,
    `Estimasi: ${plan.days} hari kerja, nilai bid ${rupiah(plan.amount)} (nego wajar sesuai scope final).`,
    `Silakan chat untuk diskusi detailnya. Terima kasih.`,
  ];
  return lines.join("\n");
}

// ---- session -------------------------------------------------------------

async function readLoginState(page) {
  return page.evaluate(() => {
    const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") || "");
    const loggedIn = links.some((h) => /logout/i.test(h));
    const nameEl = document.querySelector("a[href*='/user/dashboard'], .username, a[href*='browse_users/view']");
    return {
      url: location.href,
      loggedIn,
      username: nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim().slice(0, 60) : null,
    };
  });
}

function saveAccountState(state) {
  getDb().prepare(
    `UPDATE accounts SET login_status=?, username=COALESCE(?, username), last_checked=datetime('now') WHERE platform='projectscoid'`,
  ).run(state.loggedIn ? "ok" : "expired", state.username || null);
}

async function checkLogin({ log = console.log } = {}) {
  return withPage(async (page) => {
    await goto(page, BASE + "/user/dashboard", 3500);
    const state = await readLoginState(page);
    saveAccountState(state);
    log(`projectscoid: ${state.loggedIn ? "login OK" : "belum login"}${state.username ? " — " + state.username : ""}`);
    return state;
  }, { urlHint: "projects.co.id", profile: PROFILE, startUrl: BASE + "/user/dashboard" });
}

/**
 * Open the login page in the dedicated profile and wait for a human to sign in
 * as ACCOUNT_EMAIL. No password ever touches this repo.
 */
async function login({ waitMinutes = 10, log = console.log } = {}) {
  return withPage(async (page) => {
    let state = await readLoginState(page).catch(() => ({ loggedIn: false }));
    if (!state.loggedIn) {
      await goto(page, BASE + "/public/home/login", 2500);
      log(`Login manual sekali saja di jendela Chrome yang baru terbuka (profil khusus Projects.co.id).`);
      log(`Pakai akun: ${ACCOUNT_EMAIL}`);
      const deadline = Date.now() + waitMinutes * 60_000;
      while (Date.now() < deadline) {
        await sleep(5000);
        state = await readLoginState(page).catch(() => ({ loggedIn: false }));
        if (state.loggedIn) break;
      }
    }
    if (state.loggedIn) {
      await goto(page, BASE + "/user/dashboard", 2500).catch(() => {});
      state = await readLoginState(page);
      log(`projectscoid: login berhasil${state.username ? " — " + state.username : ""}`);
    } else {
      log("projectscoid: login belum selesai dalam batas waktu.");
    }
    saveAccountState(state);
    return state;
  }, { urlHint: "projects.co.id", profile: PROFILE, startUrl: BASE + "/public/home/login" });
}

// ---- scanning ------------------------------------------------------------

function parseCards(base) {
  const out = [];
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  for (const btn of document.querySelectorAll("a[href*='/place_new_bid/']")) {
    const btnRow = btn.closest(".row");
    const card = btnRow && btnRow.nextElementSibling;
    if (!card) continue;
    const href = btn.getAttribute("href") || "";
    const m = href.match(/place_new_bid\/([^/]+)\/([^/?#]+)/);
    if (!m) continue;
    const bidUrl = href.startsWith("http") ? href : base + href;
    const titleEl = card.querySelector("h2 a");
    const info = clean(card.innerText || card.textContent);
    const money = (label) => {
      const mm = info.match(new RegExp(label + "\\s*:?\\s*Rp\\s*([\\d.,]+)(?:\\s*-\\s*(?:Rp\\s*)?([\\d.,]+))?", "i"));
      return mm ? [mm[1], mm[2] || null] : [null, null];
    };
    const [bmin, bmax] = money("Published Budget");
    const numAfter = (label) => {
      const mm = info.match(new RegExp(label + "\\s*:?\\s*(\\d+)", "i"));
      return mm ? parseInt(mm[1], 10) : null;
    };
    const tagLinks = [...card.querySelectorAll(".tag a")];
    const tagEls = tagLinks.length ? tagLinks : [...card.querySelectorAll(".tag")];
    const owner = card.querySelector("a.short-username");
    const ratingM = info.match(/(\d+\.\d+)\/10\.00/);
    out.push({
      external_id: m[1],
      slug: m[2],
      bid_url: bidUrl,
      url: bidUrl.replace("/place_new_bid/", "/view/"),
      title: clean(titleEl ? titleEl.textContent : "").slice(0, 160),
      description: clean((card.querySelector("h2 + p") || {}).textContent).slice(0, 2000),
      tags: tagEls.map((t) => clean(t.textContent)).filter(Boolean).slice(0, 15),
      budget_raw: bmin ? "Rp " + bmin + (bmax ? " - " + bmax : "") : null,
      budget_min_raw: bmin,
      budget_max_raw: bmax,
      finish_days: numAfter("Finish Days"),
      bid_count: numAfter("Bid Count"),
      owner: clean(owner ? owner.textContent : ""),
      owner_rating: ratingM ? parseFloat(ratingM[1]) : null,
      status: (info.match(/Project Status:\s*([A-Za-z ]+)/i) || [])[1] || null,
    });
  }
  return out;
}

async function readListing(page, url) {
  await goto(page, url, 3000);
  return page.evaluate(`(${parseCards.toString()})(${JSON.stringify(BASE)})`);
}

async function scan({ pages = 2, log = console.log } = {}) {
  return withPage(async (page) => {
    await goto(page, LISTING, 3000);
    const state = await readLoginState(page);
    saveAccountState(state);
    if (!state.loggedIn) log("projectscoid: belum login — scan tetap jalan, bid butuh login.");

    const seen = new Set();
    let found = 0, added = 0, junk = 0;
    for (const cat of CATEGORIES) {
      for (let p = 1; p <= pages; p++) {
        const url = `${LISTING}/${cat.slug}${p > 1 ? `?page=${p}` : ""}`;
        let cards = [];
        try { cards = await readListing(page, url); } catch (e) { log(`  ${cat.label} p${p}: ${e.message}`); continue; }
        if (!cards.length) break;
        for (const c of cards) {
          if (seen.has(c.external_id)) continue;
          seen.add(c.external_id);
          found++;
          const { score, matched, junk: isJunk } = scoreProject(c);
          if (isJunk) junk++;
          const budget_min = num(c.budget_min_raw) || null;
          const budget_max = num(c.budget_max_raw) || null;
          const row = upsertJob({
            platform: "projectscoid",
            external_id: c.external_id,
            title: c.title,
            company: c.owner || null,
            url: c.url,
            location: `${cat.label} · ${c.bid_count ?? "?"} bids · ${c.finish_days ?? "?"} hari`,
            remote: 1,
            salary_min: budget_min,
            salary_max: budget_max,
            currency: "IDR",
            description: [c.description, c.tags.length ? "Skills: " + c.tags.join(", ") : "", `Bid URL: ${c.bid_url}`]
              .filter(Boolean).join("\n"),
            match_score: isJunk ? 0 : score,
          });
          if (isJunk) {
            getDb().prepare(`UPDATE jobs SET status='skipped', skip_reason='bukan project development (jual-beli akun/judi)' WHERE id=? AND status='new'`).run(row.id);
          } else if (matched.length) {
            getDb().prepare(`UPDATE jobs SET skip_reason=? WHERE id=?`).run("match: " + matched.join(", "), row.id);
          }
          if (row._isNew) added++;
        }
      }
    }
    log(`projectscoid scan: ${found} projects, ${added} new, ${junk} junk`);
    return { found, added, junk };
  }, { urlHint: "projects.co.id", profile: PROFILE, startUrl: LISTING });
}

// ---- bidding -------------------------------------------------------------

function fillBidForm(payload) {
  const { amount, days, proposal } = payload;
  const forms = [...document.querySelectorAll("form")].filter((f) => f.querySelector("textarea, input[type='text'], input[type='number']"));
  const form = forms.find((f) => /bid/i.test(f.getAttribute("action") || "") || /bid/i.test(f.innerText)) || forms[0];
  if (!form) return { ok: false, reason: "form bid tidak ditemukan", fields: [] };

  const setVal = (el, v) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const labelOf = (el) => {
    if (el.id) { const l = document.querySelector(`label[for='${el.id}']`); if (l) return l.innerText; }
    let c = el;
    for (let i = 0; i < 4 && c.parentElement; i++) {
      c = c.parentElement;
      const l = c.querySelector("label");
      if (l) return l.innerText;
    }
    return "";
  };

  const inputs = [...form.querySelectorAll("input, textarea, select")].filter((el) => el.type !== "hidden");
  const fields = inputs.map((el) => ({
    tag: el.tagName.toLowerCase(), type: el.type || null, name: el.name || null,
    id: el.id || null, label: (labelOf(el) || "").replace(/\s+/g, " ").trim().slice(0, 60),
    value: (el.value || "").slice(0, 40),
  }));

  const key = (el) => `${el.name || ""} ${el.id || ""} ${labelOf(el)}`.toLowerCase();
  const filled = {};

  const amountEl = inputs.find((el) => /value|amount|nilai|harga|bid/.test(key(el)) && !/day|hari|deadline/.test(key(el)) && (el.type === "text" || el.type === "number"));
  if (amountEl) { setVal(amountEl, amount); filled.amount = amountEl.name || amountEl.id; }

  const daysEl = inputs.find((el) => /day|hari|durasi|duration|finish/.test(key(el)) && (el.type === "text" || el.type === "number"));
  if (daysEl) { setVal(daysEl, days); filled.days = daysEl.name || daysEl.id; }

  const textEl = inputs.find((el) => el.tagName === "TEXTAREA");
  if (textEl) { setVal(textEl, proposal); filled.proposal = textEl.name || textEl.id; }

  for (const cb of inputs.filter((el) => el.type === "checkbox")) {
    if (/setuju|agree|syarat|terms|ketentuan/.test(key(cb)) && !cb.checked) cb.click();
  }

  return {
    ok: Boolean(amountEl && textEl),
    reason: amountEl ? (textEl ? null : "textarea proposal tidak ditemukan") : "input nilai bid tidak ditemukan",
    fields, filled,
    action: form.getAttribute("action") || location.href,
  };
}

function clickSubmit() {
  const forms = [...document.querySelectorAll("form")].filter((f) => f.querySelector("textarea"));
  const scope = forms[0] || document;
  const visible = (b) => b.offsetParent !== null;
  const label = (b) => (b.innerText || b.value || "").trim();
  const btns = [...scope.querySelectorAll("button, input[type='submit'], a.btn")].filter(visible);
  const exact = btns.find((b) => /place\s*(new\s*)?bid|kirim bid|submit bid/i.test(label(b)));
  const target = exact
    || btns.find((b) => b.type === "submit")
    || btns.find((b) => /^(submit|simpan|save|kirim)$/i.test(label(b)));
  if (!target) return false;
  target.click();
  return true;
}

function bidUrlFor(job) {
  const fromDesc = (job.description || "").match(/Bid URL:\s*(\S+)/);
  if (fromDesc) return fromDesc[1];
  return (job.url || "").replace("/view/", "/place_new_bid/");
}

/**
 * Place one bid. `dryRun` fills the form and reports the fields without
 * submitting, so a new form layout can be inspected safely.
 */
async function bid({ jobRowId, projectId, amount, days, dryRun = false, log = console.log }) {
  const db = getDb();
  const job = jobRowId
    ? db.prepare(`SELECT * FROM jobs WHERE id=?`).get(jobRowId)
    : db.prepare(`SELECT * FROM jobs WHERE platform='projectscoid' AND external_id=?`).get(String(projectId));
  if (!job) return { ok: false, reason: "project belum ada di DB — jalankan scan dulu" };

  const already = db.prepare(`SELECT 1 FROM applications WHERE platform='projectscoid' AND (job_id=? OR url=?)`).get(job.id, job.url);
  if (already) return { ok: false, reason: "sudah pernah bid" };

  const { score, matched, junk } = scoreProject({
    title: job.title, description: job.description, tags: [],
  });
  if (junk) {
    db.prepare(`UPDATE jobs SET status='skipped', skip_reason='bukan project development' WHERE id=?`).run(job.id);
    return { ok: false, reason: "bukan project development" };
  }

  const plan = planBid({
    budget_min: job.salary_min,
    budget_max: job.salary_max,
    finish_days: parseInt((job.location || "").match(/(\d+)\s*hari/)?.[1] || "", 10) || null,
  });
  if (!plan) {
    db.prepare(`UPDATE jobs SET status='skipped', skip_reason='budget di bawah floor' WHERE id=?`).run(job.id);
    return { ok: false, reason: "budget di bawah floor" };
  }
  if (amount) plan.amount = amount;
  if (days) plan.days = days;
  const proposal = buildProposal(job, matched, plan);

  return withPage(async (page) => {
    const url = bidUrlFor(job);
    await goto(page, url, 3000);
    const state = await readLoginState(page);
    saveAccountState(state);
    if (!state.loggedIn) return { ok: false, reason: "belum login — jalankan: node hunter/run.js pco-login" };

    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 4000));
    if (/anda sudah|already placed|sudah melakukan bid/i.test(bodyText)) {
      db.prepare(`UPDATE jobs SET status='applied' WHERE id=?`).run(job.id);
      return { ok: false, reason: "sudah pernah bid (menurut situs)" };
    }

    const res = await page.evaluate(`(${fillBidForm.toString()})(${JSON.stringify({ amount: plan.amount, days: plan.days, proposal })})`);
    if (!res.ok) {
      log(`projectscoid bid ${job.external_id}: form tidak dikenali — ${res.reason}`);
      return { ok: false, reason: res.reason, fields: res.fields };
    }
    if (dryRun) {
      log(`projectscoid bid ${job.external_id}: DRY RUN — ${rupiah(plan.amount)} / ${plan.days} hari`);
      return { ok: false, dryRun: true, amount: plan.amount, days: plan.days, fields: res.fields, filled: res.filled, proposal };
    }

    const clicked = await page.evaluate(`(${clickSubmit.toString()})()`);
    if (!clicked) return { ok: false, reason: "tombol submit tidak ditemukan", fields: res.fields };
    await page.waitForTimeout(6000);

    const after = await page.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(0, 2500) }));
    const ok = !/place_new_bid/.test(after.url) || /berhasil|success|terkirim|thank/i.test(after.text);
    if (ok) {
      recordApplication({
        job_id: job.id, platform: "projectscoid", title: job.title, company: job.company,
        url: job.url, channel: "auto", salary_offered: rupiah(plan.amount), cover_letter: proposal,
        notes: `score ${score}${matched.length ? " · " + matched.join(", ") : ""} · ${plan.days} hari`,
      });
      log(`projectscoid bid ${job.external_id}: OK — ${rupiah(plan.amount)} / ${plan.days} hari`);
    } else {
      const reason = ("gagal submit: " + after.text.replace(/\s+/g, " ").slice(0, 160)).trim();
      db.prepare(`UPDATE jobs SET status='skipped', skip_reason=? WHERE id=?`).run(reason, job.id);
      log(`projectscoid bid ${job.external_id}: ${reason}`);
    }
    return { ok, amount: plan.amount, days: plan.days, url: after.url };
  }, { urlHint: "projects.co.id", profile: PROFILE, startUrl: BASE });
}

/** Bid the best-matching open projects, highest score first. */
async function bidAuto({ limit = 3, minScore, dryRun = false, log = console.log } = {}) {
  const threshold = minScore ?? intSetting("pco_match_threshold", 45);
  const rows = getDb().prepare(
    `SELECT id, external_id, title, match_score FROM jobs
     WHERE platform='projectscoid' AND status IN ('new','queued') AND match_score >= ?
     ORDER BY match_score DESC, COALESCE(salary_max, salary_min, 0) DESC LIMIT ?`,
  ).all(threshold, limit);
  log(`projectscoid auto-bid: ${rows.length} kandidat (threshold ${threshold})`);
  const out = [];
  for (const r of rows) {
    try {
      const res = await bid({ jobRowId: r.id, dryRun, log });
      out.push({ id: r.id, title: r.title, score: r.match_score, ...res });
    } catch (e) {
      out.push({ id: r.id, title: r.title, ok: false, reason: e.message });
    }
    await sleep(4000);
  }
  return out;
}

module.exports = {
  ACCOUNT_EMAIL, CATEGORIES, PROFILE,
  scan, bid, bidAuto, login, checkLogin,
  scoreProject, planBid, buildProposal,
};
