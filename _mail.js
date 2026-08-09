// Self-contained email application runner (engine lives in karirku-core,
// absent locally). Reuses the automation Chrome profile via CDP, same pattern
// as _indeed.js / _fl.js / _linque.js. Generalises the one-off _gmail.js into
// a JSON-driven sender.
//
//   node _mail.js list                       list available .mail.json drafts
//   node _mail.js whoami                     which Gmail account is signed in
//   node _mail.js compose <draft>            open compose + attach CV (never sends)
//   node _mail.js send <draft> --yes         click Send, verify, record in hunter.db
//
// Drafts live in applications/letters/*.mail.json.
//
// SENDER GUARD: the draft declares `from`. If the signed-in Gmail account is a
// different address the runner refuses, because sending from the wrong account
// (e.g. the university inbox with 24k unread) means the reply is missed and the
// address no longer matches the CV. Override consciously with --any-account.
const os = require("os");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = process.env.HUNTER_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const DB_PATH = process.env.HUNTER_DB || path.join(__dirname, "data", "hunter.db");
const LETTERS = path.join(__dirname, "applications", "letters");
const SHOTS = path.join(__dirname, "data");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------- chrome --------------------------------- */
function cdpAlive() {
  return new Promise((resolve) => {
    const req = http.get({ host: "127.0.0.1", port: CDP_PORT, path: "/json/version", timeout: 3000 }, (res) => {
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
async function withPage(fn, url, opts = {}) {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    const gmail = ctx.pages().filter((p) => p.url().includes("mail.google.com"));
    let page = null;
    // Several Gmail tabs are usually open; the compose window lives in exactly
    // one of them, so pick by content rather than by tab order.
    if (!url && opts.composeFor) {
      for (const p of gmail) {
        const match = await p
          .evaluate(
            (to) =>
              document.body.innerText.includes(to) &&
              [...document.querySelectorAll("[role='button']")].some(
                (b) => b.offsetParent && /^(Kirim|Send)\b/i.test((b.getAttribute("aria-label") || b.innerText || "").trim()),
              ),
            opts.composeFor,
          )
          .catch(() => false);
        if (match) { page = p; break; }
      }
    }
    if (!page) page = gmail[0] || (await ctx.newPage());
    if (url) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(8000);
    }
    await page.bringToFront();
    return await fn(page);
  } finally {
    await browser.close();
  }
}
async function shot(page, name) {
  try {
    const cdp = await page.context().newCDPSession(page);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(SHOTS, `mail-${name}.png`), Buffer.from(data, "base64"));
    return true;
  } catch {
    return false;
  }
}

/* ---------------------------------- drafts --------------------------------- */
function draftPath(name) {
  const file = name.endsWith(".mail.json") ? name : `${name}.mail.json`;
  return path.join(LETTERS, path.basename(file));
}
function loadDraft(name) {
  if (!name) throw new Error("draft name required — see: node _mail.js list");
  const p = draftPath(name);
  if (!fs.existsSync(p)) throw new Error("draft not found: " + p);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const k of ["from", "to", "subject", "body"]) {
    if (!d[k]) throw new Error(`draft missing "${k}"`);
  }
  d.attachments = (d.attachments || []).map((a) => (path.isAbsolute(a) ? a : path.join(__dirname, a)));
  for (const a of d.attachments) {
    if (!fs.existsSync(a)) throw new Error("attachment missing: " + a);
  }
  d._file = p;
  return d;
}
function list() {
  const files = fs.readdirSync(LETTERS).filter((f) => f.endsWith(".mail.json"));
  if (!files.length) { console.log("no drafts in applications/letters/"); return; }
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(LETTERS, f), "utf8"));
    console.log(`${f.replace(".mail.json", "").padEnd(34)} ${d.from} -> ${d.to}  |  ${d.subject}`);
  }
}

/* ---------------------------------- account -------------------------------- */
async function readAccount(page) {
  return page.evaluate(() => {
    const t = document.title || "";
    const m = t.match(/[\w.+-]+@[\w.-]+\.[a-z.]{2,}/i);
    return m ? m[0] : null;
  });
}
async function whoami() {
  return withPage(async (page) => {
    const acct = await readAccount(page);
    console.log("signed in as:", acct || "(unknown — open Gmail manually)");
    return acct;
  }, "https://mail.google.com/mail/u/0/#inbox");
}
function guardAccount(acct, draft, argv) {
  if (!acct) {
    console.log("Could not read the signed-in Gmail account. Open Gmail and retry.");
    return false;
  }
  if (acct.toLowerCase() === draft.from.toLowerCase()) return true;
  console.log(`\nWRONG ACCOUNT: signed in as ${acct}, draft wants ${draft.from}.`);
  console.log("Sending from the wrong address means the reply lands in an inbox you do not read,");
  console.log("and the sender no longer matches the address printed on your CV.");
  console.log(`Fix: sign in to ${draft.from} in the automation Chrome, then retry.`);
  console.log("Override only if you truly mean it:  --any-account");
  return argv.includes("--any-account");
}

/* --------------------------------- compose --------------------------------- */
async function compose(name, argv) {
  const draft = loadDraft(name);
  const link =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(draft.to)}` +
    `&su=${encodeURIComponent(draft.subject)}` +
    `&body=${encodeURIComponent(draft.body)}`;
  return withPage(async (page) => {
    const acct = await readAccount(page);
    if (!guardAccount(acct, draft, argv)) {
      process.exitCode = 1;
      return;
    }
    let attached = draft.attachments.length === 0;
    if (draft.attachments.length) {
      await page.locator("input[type='file']").last().setInputFiles(draft.attachments, { timeout: 20000 });
      const names = draft.attachments.map((a) => path.basename(a));
      for (let i = 0; i < 20 && !attached; i++) {
        await page.waitForTimeout(1500);
        attached = await page.evaluate((ns) => ns.every((n) => document.body.innerText.includes(n)), names);
      }
    }
    await page.waitForTimeout(1500);
    await shot(page, draft.id || "compose");
    const state = await page.evaluate(
      ({ to, subject, probe }) => {
        const t = document.body.innerText;
        const sub = document.querySelector("input[name='subjectbox']");
        return {
          to: t.includes(to),
          // Gmail keeps the subject in an <input>, whose value never appears in innerText.
          subject: sub ? sub.value === subject : false,
          subjectValue: sub ? sub.value : null,
          body: t.includes(probe),
          sendBtn: [...document.querySelectorAll("[role='button']")].some(
            (b) => b.offsetParent && /^(Kirim|Send)\b/i.test((b.getAttribute("aria-label") || b.innerText || "").trim()),
          ),
        };
      },
      { to: draft.to, subject: draft.subject, probe: draft.body.slice(0, 40) },
    );
    console.log(JSON.stringify({ account: acct, attached, ...state }, null, 1));
    const ready = state.to && state.subject && state.body && state.sendBtn && attached;
    console.log(ready ? "\nReady. NOT SENT — review, then: node _mail.js send " + (draft.id || name) + " --yes" : "\nNOT READY — check the compose window.");
    return state;
  }, link);
}

/* ----------------------------------- send ---------------------------------- */
// Opens Sent in a throwaway tab and counts messages carrying the subject.
// Returns copies>1 when the same mail went out more than once.
async function verifySent(page, subject) {
  const probe = await page.context().newPage();
  try {
    await probe.goto("https://mail.google.com/mail/u/0/#sent", { waitUntil: "domcontentloaded", timeout: 60000 });
    await probe.waitForTimeout(9000);
    return await probe.evaluate(
      (su) => ({
        copies: [...document.querySelectorAll("tr")].map((r) => r.innerText || "").filter((t) => t.includes(su)).length,
      }),
      subject,
    );
  } catch (e) {
    return { copies: 0, verifyError: e.message.slice(0, 80) };
  } finally {
    await probe.close().catch(() => {});
  }
}

function record(draft, notes) {
  if (!draft.track) return null;
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(DB_PATH);
  const t = draft.track;
  db.prepare(
    `INSERT INTO jobs (platform, external_id, title, company, url, location, remote, currency, description, match_score, status)
     VALUES (?,?,?,?,?,?,1,'IDR',?,?, 'applied')
     ON CONFLICT(platform, external_id) DO UPDATE SET status='applied'`,
  ).run(t.platform, t.external_id, t.title, t.company || null, t.url || "", t.location || "Remote", t.description || draft.subject, t.match_score || 0);
  const job = db.prepare("SELECT id FROM jobs WHERE platform=? AND external_id=?").get(t.platform, t.external_id);
  db.prepare(
    `INSERT INTO applications (job_id, platform, title, company, url, channel, cover_letter, notes)
     VALUES (?,?,?,?,?, 'auto', ?, ?)`,
  ).run(job.id, t.platform, t.title, t.company || null, t.url || "", draft.body, notes);
  db.close();
  return job.id;
}

async function send(name, argv) {
  const draft = loadDraft(name);
  if (!argv.includes("--yes")) {
    console.log("Refusing to send without --yes. Review first:  node _mail.js compose " + (draft.id || name));
    process.exitCode = 1;
    return;
  }
  return withPage(async (page) => {
    const acct = await readAccount(page);
    if (!guardAccount(acct, draft, argv)) {
      process.exitCode = 1;
      return;
    }
    const pre = await page.evaluate(
      (to) => ({
        composeOpen: [...document.querySelectorAll("[role='button']")].some(
          (b) => b.offsetParent && /^(Kirim|Send)\b/i.test((b.getAttribute("aria-label") || b.innerText || "").trim()),
        ),
        hasTo: document.body.innerText.includes(to),
      }),
      draft.to,
    );
    if (!pre.composeOpen || !pre.hasTo) {
      console.log("No prepared compose window found. Run:  node _mail.js compose " + (draft.id || name));
      process.exitCode = 1;
      return;
    }
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll("[role='button']")].find(
        (x) => x.offsetParent && /^(Kirim|Send)\b/i.test((x.getAttribute("aria-label") || x.innerText || "").trim()),
      );
      if (!b) return null;
      b.click();
      return (b.getAttribute("aria-label") || b.innerText).trim();
    });
    await page.waitForTimeout(7000);
    await shot(page, (draft.id || "draft") + "-sent");
    // Gmail's "Message sent" toast is easy to miss and the compose tab may
    // linger, so the authoritative check is whether the mail reached Sent.
    const local = await page.evaluate(() => ({
      toast: /Message sent|Your message has been sent|Pesan telah dikirim|telah dikirim/i.test(document.body.innerText),
      composeGone: ![...document.querySelectorAll("[role='button']")].some(
        (b) => b.offsetParent && /^(Kirim|Send)\b/i.test((b.getAttribute("aria-label") || b.innerText || "").trim()),
      ),
    }));
    const sent = await verifySent(page, draft.subject);
    const ok = sent.copies > 0;
    console.log(JSON.stringify({ account: acct, clicked, ...local, ...sent, ok }, null, 1));
    if (ok) {
      if (sent.copies > 1) console.log(`WARNING: ${sent.copies} copies in Sent — the mail may have gone out more than once.`);
      const jobId = record(draft, `Emailed ${draft.to} from ${acct} via _mail.js.`);
      console.log(jobId ? "Recorded in hunter.db as job " + jobId : "Sent (no track block in draft, nothing recorded).");
    } else {
      console.log("Not found in Sent — check data/mail-*.png before retrying.");
      process.exitCode = 1;
    }
    return { ...local, ...sent };
  }, null, { composeFor: draft.to });
}

/* ----------------------------------- main ---------------------------------- */
(async () => {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const name = argv[1];
  if (cmd === "list") list();
  else if (cmd === "whoami") await whoami();
  else if (cmd === "compose") await compose(name, argv);
  else if (cmd === "send") await send(name, argv);
  else {
    console.log("usage: node _mail.js list | whoami | compose <draft> | send <draft> --yes");
    process.exitCode = 1;
  }
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
