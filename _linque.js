// Self-contained Linque Resourcing application runner (engine lives in
// karirku-core, absent locally). Reuses the automation Chrome profile via CDP,
// same pattern as _indeed.js / _fl.js.
//   node _linque.js fill              open the posting and fill every field (never submits)
//   node _linque.js status            dump what is currently in the form
//   node _linque.js submit --yes      click "Submit application" and record it in hunter.db
//
// The form is shadcn/Radix: the visible selects and checkbox are custom
// buttons backed by hidden native inputs, so we drive the real UI (click
// trigger -> click option). Writing to the native <select> would not sync
// React state and the field would post back empty.
const os = require("os");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = process.env.HUNTER_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const DB_PATH = process.env.HUNTER_DB || path.join(__dirname, "data", "hunter.db");

const URL = "https://linqueresourcing.com/jobs/software-engineer";
const PLATFORM = "linque";
const EXTERNAL_ID = "software-engineer";
const TITLE = "Software Engineer";
const COMPANY = "Linque Resourcing (undisclosed client)";
const CV = path.join(__dirname, "applications", "cv", "CV-Andi-Agung-Dwi-Arya.pdf");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------- chrome --------------------------------- */
function cdpAlive() {
  return new Promise((resolve) => {
    const req = http.get({ host: "localhost", port: CDP_PORT, path: "/json/version", timeout: 3000 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}
async function ensureChrome() {
  if (await cdpAlive()) return;
  spawn(CHROME, [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${PROFILE}`, "--no-first-run", "--no-default-browser-check", "--window-size=1400,950", "about:blank"], { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    if (await cdpAlive()) return;
  }
  throw new Error("Chrome CDP did not come up on port " + CDP_PORT);
}
async function withPage(fn, { reload = false } = {}) {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    let page = ctx.pages().find((p) => p.url().includes("linqueresourcing"));
    if (!page) {
      page = await ctx.newPage();
      reload = true;
    }
    if (reload) {
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(4000);
    }
    await page.bringToFront();
    return await fn(page);
  } finally {
    await browser.close();
  }
}

/* ---------------------------------- answers -------------------------------- */
const WHY = `I have spent the last five years building production TypeScript/Next.js/React systems and Python AI services end to end — 205+ original repositories, with several client platforms maintained in production for 12-16 months (a plagiarism-detection platform, a multi-tenant education SaaS, and an enterprise operations dashboard that is live today).

My workflow is already AI-native rather than AI-curious: I work daily inside agentic coding CLIs and use them to ship real systems, not demos. Recent proof: a Go + RAG backend (PDF ingestion -> chunking -> embedding -> retrieval) powering a live product, and a React Native fintech wallet I engineered that passed review on both the App Store and Google Play.

What draws me to this role is that it pairs client-facing scoping with hands-on engineering. In my freelance work I already run that full loop — talk to the client, write the scope and deliverables down, then build, ship and maintain the system myself — so drafting SOWs and owning delivery is familiar territory, and your AI-native automation / B2B SaaS focus is exactly where my Next.js, Python and LLM experience overlaps.

One thing I want to be upfront about: I am based in Makassar, Indonesia (UTC+8) and I am not authorized to work in the United States, so I would be engaging as an international contractor. I have a long track record of async remote delivery and I am flexible on overlap hours.`;

const TEXT = {
  fullName: "Andi Agung Dwi Arya",
  email: "andiagung193@gmail.com",
  phone: "+62 851 7107 9607",
  desiredPay: "$1,000/month base + 10% project profit share (per posted range)",
  address: "Makassar, South Sulawesi, Indonesia (remote, UTC+8)",
  availableStartDate: "2026-08-10",
  whyInterested: WHY,
  "screeningAnswers.years_experience": "5",
};

// [label substring (lowercase), exact option text to click]
// Work authorization is answered honestly: devnolife is Indonesia-based and
// this is a US 1099 contract. Do not flip this to "yes".
const CHOICES = [
  ["work authorization", "No, I am not currently authorized to work in the United States"],
  ["highest education", "Bachelor's degree"],
  ["background screening", "Yes, I am willing to undergo a background screening"],
  ["how proficient are you", "4"],
  ["high-speed internet", "Yes"],
  ["flexible schedule", "Yes"],
];

/* ----------------------------------- probe --------------------------------- */
const READ_STATE = () => {
  const val = (n) => {
    const el = document.querySelector(`[name="${n}"]`);
    return el ? el.value : null;
  };
  const labelOf = (el) => {
    let n = el;
    for (let h = 0; h < 4 && n; h++) {
      n = n.parentElement;
      const lab = n && n.querySelector("label");
      if (lab && lab.innerText.trim()) return lab.innerText.trim();
    }
    return "";
  };
  return {
    fullName: val("fullName"),
    email: val("email"),
    phone: val("phone"),
    desiredPay: val("desiredPay"),
    address: val("address"),
    startDate: val("availableStartDate"),
    yearsIT: val("screeningAnswers.years_experience"),
    whyChars: (val("whyInterested") || "").length,
    combos: [...document.querySelectorAll('button[role="combobox"]')].map((b) => ({
      label: labelOf(b).slice(0, 45),
      picked: b.innerText.trim().slice(0, 60),
    })),
    futureRoles: document.querySelector('button[role="checkbox"]').getAttribute("aria-checked"),
    resume: (document.body.innerText.match(/No resume selected yet\.|CV-[\w-]+\.pdf/) || ["?"])[0],
  };
};

function complete(state) {
  const missing = [];
  for (const k of ["fullName", "email", "phone", "desiredPay", "address", "startDate", "yearsIT"]) {
    if (!state[k]) missing.push(k);
  }
  if (state.whyChars < 100) missing.push("whyInterested");
  if (state.resume.startsWith("No resume")) missing.push("resume");
  for (const c of state.combos) {
    if (/^select /i.test(c.picked) || !c.picked) missing.push(c.label || "select");
  }
  return missing;
}

/* ----------------------------------- fill ---------------------------------- */
async function fill() {
  return withPage(async (page) => {
    for (const [name, value] of Object.entries(TEXT)) {
      const loc = page.locator(`[name="${name}"]`).first();
      await loc.scrollIntoViewIfNeeded();
      await loc.fill(value);
    }

    const labels = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button[role="combobox"]').forEach((btn, i) => {
        let label = "";
        let n = btn;
        for (let h = 0; h < 4 && n; h++) {
          n = n.parentElement;
          const lab = n && n.querySelector("label");
          if (lab && lab.innerText.trim()) { label = lab.innerText.trim(); break; }
        }
        btn.setAttribute("data-kai-idx", String(i));
        out.push({ i, label });
      });
      return out;
    });

    for (const [needle, option] of CHOICES) {
      const hit = labels.find((l) => l.label.toLowerCase().includes(needle));
      if (!hit) { console.log("SKIP (label not found):", needle); continue; }
      const trigger = page.locator(`button[data-kai-idx="${hit.i}"]`);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      await page.locator('[role="option"]', { hasText: new RegExp(`^${escaped}$`) }).first().click();
      await page.waitForTimeout(300);
    }

    const box = page.locator('button[role="checkbox"]').first();
    await box.scrollIntoViewIfNeeded();
    if ((await box.getAttribute("aria-checked")) !== "true") await box.click();

    await page.locator('input[type="file"]').first().setInputFiles(CV);
    await page.waitForTimeout(2500);

    const state = await page.evaluate(READ_STATE);
    console.log(JSON.stringify(state, null, 1));
    const missing = complete(state);
    await page.locator("form").first().screenshot({ path: path.join(__dirname, "data", "linque-filled.png") });
    console.log(missing.length ? "\nINCOMPLETE: " + missing.join(", ") : "\nAll required fields filled.");
    console.log("NOT SUBMITTED — review the tab, then: node _linque.js submit --yes");
    return state;
  }, { reload: true });
}

async function status() {
  return withPage(async (page) => {
    const state = await page.evaluate(READ_STATE);
    console.log(JSON.stringify(state, null, 1));
    const missing = complete(state);
    console.log(missing.length ? "INCOMPLETE: " + missing.join(", ") : "Ready to submit.");
    return state;
  });
}

/* ---------------------------------- submit --------------------------------- */
function record(notes) {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON");
  db.prepare(
    `INSERT INTO jobs (platform, external_id, title, company, url, location, remote, salary_min, salary_max, currency, match_score, status)
     VALUES (?,?,?,?,?,?,1,1000,1000,'USD',?, 'applied')
     ON CONFLICT(platform, external_id) DO UPDATE SET status='applied'`,
  ).run(PLATFORM, EXTERNAL_ID, TITLE, COMPANY, URL, "Remote", 72);
  const job = db.prepare("SELECT id FROM jobs WHERE platform=? AND external_id=?").get(PLATFORM, EXTERNAL_ID);
  db.prepare(
    `INSERT INTO applications (job_id, platform, title, company, url, channel, salary_offered, cover_letter, notes)
     VALUES (?,?,?,?,?, 'auto', ?, ?, ?)`,
  ).run(job.id, PLATFORM, TITLE, COMPANY, URL, "$1,000/mo + 8-12% profit share", WHY, notes);
  db.close();
  return job.id;
}

async function submit(argv) {
  if (!argv.includes("--yes")) {
    console.log("Refusing to submit without --yes. Review the form first:  node _linque.js status");
    process.exitCode = 1;
    return;
  }
  return withPage(async (page) => {
    const before = await page.evaluate(READ_STATE);
    const missing = complete(before);
    if (missing.length) {
      console.log("Refusing to submit — INCOMPLETE: " + missing.join(", "));
      console.log("Run:  node _linque.js fill");
      process.exitCode = 1;
      return;
    }
    const btn = page.locator('button[type="submit"]', { hasText: /submit application/i }).first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(6000);
    const after = await page.evaluate(() => ({
      url: location.href,
      body: (document.body.innerText || "").slice(0, 1200),
    }));
    await page.screenshot({ path: path.join(__dirname, "data", "linque-submitted.png"), fullPage: false });
    const ok = /thank you|received|submitted|success|we'll be in touch/i.test(after.body);
    console.log(JSON.stringify({ ok, url: after.url, head: after.body.slice(0, 400) }, null, 1));
    if (ok) {
      const jobId = record("Applied via _linque.js. US 1099 contract; answered work authorization honestly = NO (Indonesia-based).");
      console.log("Recorded in hunter.db as job " + jobId + " / applications row.");
    } else {
      console.log("Could not confirm success — check data/linque-submitted.png before recording.");
    }
    return after;
  });
}

/* ----------------------------------- main ---------------------------------- */
(async () => {
  const argv = process.argv.slice(2);
  const cmd = argv[0] || "fill";
  if (cmd === "fill") await fill();
  else if (cmd === "status") await status();
  else if (cmd === "submit") await submit(argv);
  else {
    console.log("usage: node _linque.js fill | status | submit --yes");
    process.exitCode = 1;
  }
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
