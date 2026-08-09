// Lemon.io profile helper — reuses automation Chrome profile via CDP.
//   node _lemon.js probe     open me.lemon.io/profile, dump structure + screenshot
//   node _lemon.js shot <name>
//   node _lemon.js tabs
const os = require("os");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const SHOTDIR = "C:\\Users\\devno\\.copilot\\session-state\\aaf576fe-7e2c-46f5-abba-d2403e09df74\\files";

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
async function withPage(fn, url) {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    let page = ctx.pages().find((p) => p.url().includes("lemon.io")) || ctx.pages()[0] || (await ctx.newPage());
    if (url) { await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.waitForTimeout(4500); }
    return await fn(page, ctx);
  } finally { await browser.close(); }
}
async function cdpShot(page, name) {
  try {
    const cdp = await page.context().newCDPSession(page);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
    require("fs").writeFileSync(path.join(SHOTDIR, `lemon-${name}.png`), Buffer.from(data, "base64"));
    return true;
  } catch (e) { return false; }
}

async function probe() {
  return withPage(async (page) => {
    await cdpShot(page, "probe");
    return page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const fields = [...document.querySelectorAll("input,select,textarea")].filter(vis).map((e) => ({
        tag: e.tagName, type: e.type || null, name: e.name || null, id: e.id || null,
        placeholder: e.placeholder || null, value: (e.value || "").slice(0, 40),
      }));
      const buttons = [...document.querySelectorAll("button,a[role='button'],[type='submit']")].filter(vis).map((b) => (b.innerText || b.value || "").trim()).filter(Boolean).slice(0, 30);
      return { url: location.href, title: document.title, fieldCount: fields.length, fields, buttons, text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 1800) };
    });
  }, "https://me.lemon.io/profile");
}

async function googleLogin() {
  return withPage(async (page, ctx) => {
    const log = [];
    // dismiss cookie banner
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /got it/i.test(x.innerText)); if (b) b.click(); }).catch(() => {});
    await page.waitForTimeout(800);
    const popupPromise = ctx.waitForEvent("page", { timeout: 15000 }).catch(() => null);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find((x) => x.offsetParent && /continue with google/i.test(x.innerText)); if (b) b.click(); });
    const popup = await popupPromise;
    await page.waitForTimeout(4000);
    if (popup) {
      log.push("popup: " + popup.url().slice(0, 70));
      await popup.waitForLoadState("domcontentloaded").catch(() => {});
      await popup.waitForTimeout(3500);
      await cdpShotP(popup, "google-chooser");
      // pick the account (andiagung193) if account chooser appears
      const picked = await popup.evaluate(() => {
        const acc = [...document.querySelectorAll("[data-identifier], [data-email], div[role='link'], li")].find((e) => e.offsetParent && /andiagung|andi/i.test(e.innerText || e.getAttribute("data-identifier") || ""));
        if (acc) { acc.click(); return (acc.innerText || "").slice(0, 40); }
        return null;
      }).catch(() => null);
      log.push("picked=" + picked);
      await popup.waitForEvent("close", { timeout: 20000 }).catch(() => {});
    } else { log.push("no popup (same-tab or already authed)"); }
    await page.waitForTimeout(6000);
    // navigate to profile explicitly
    await page.goto("https://me.lemon.io/profile", { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(5000);
    await cdpShot(page, "after-login");
    return { log, state: await page.evaluate(() => ({ url: location.href, title: document.title, text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 500) })) };
  }, "https://me.lemon.io/profile");
}
async function cdpShotP(p, name) {
  try { const cdp = await p.context().newCDPSession(p); const { data } = await cdp.send("Page.captureScreenshot", { format: "png" }); require("fs").writeFileSync(path.join(SHOTDIR, `lemon-${name}.png`), Buffer.from(data, "base64")); return true; } catch (e) { return false; }
}

async function dump() {
  return withPage(async (page) => {
    await page.waitForTimeout(2000);
    await cdpShot(page, "profile-full");
    return page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const buttons = [...document.querySelectorAll("button,a[role='button']")].filter(vis).map((b) => (b.innerText || "").trim()).filter(Boolean).slice(0, 40);
      // look for empty-state markers
      const addPrompts = [...document.querySelectorAll("*")].filter((e) => vis(e) && e.children.length === 0 && /^(add|complete|missing|required|empty|tell us|no .* yet)/i.test((e.innerText || "").trim())).map((e) => e.innerText.trim()).slice(0, 20);
      return { url: location.href, buttons, addPrompts, fullText: document.body.innerText.replace(/\n{2,}/g, "\n") };
    });
  }, "https://me.lemon.io/profile");
}

async function clickDump(btnRx) {
  return withPage(async (page) => {
    await page.waitForTimeout(1500);
    const clicked = await page.evaluate((rx) => {
      const re = new RegExp(rx, "i");
      const b = [...document.querySelectorAll("button,a[role='button'],a")].find((x) => x.offsetParent && re.test((x.innerText || "").trim()) && (x.innerText || "").length < 30);
      if (b) { b.click(); return b.innerText.trim(); }
      return null;
    }, btnRx);
    await page.waitForTimeout(2500);
    await cdpShot(page, "after-" + btnRx.replace(/\W/g, ""));
    const info = await page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const fields = [...document.querySelectorAll("input,select,textarea")].filter(vis).map((e) => ({
        tag: e.tagName, type: e.type || null, name: e.name || null, id: e.id || null,
        placeholder: e.placeholder || null, ariaLabel: e.getAttribute("aria-label"),
        label: (() => { let c = e; for (let i = 0; i < 4 && c; i++) { c = c.parentElement; const l = c && c.querySelector("label"); if (l) return l.innerText.slice(0, 40); } return null; })(),
        value: (e.value || "").slice(0, 30),
      }));
      const buttons = [...document.querySelectorAll("button,[role='button']")].filter(vis).map((b) => (b.innerText || "").trim()).filter(Boolean).slice(0, 20);
      return { clicked: true, fieldCount: fields.length, fields, buttons };
    });
    return { clicked, info };
  }, "https://me.lemon.io/profile");
}

async function fillSaku() {
  return withPage(async (page) => {
    const log = [];
    // open the Add project form (navigation reset it)
    await page.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find((x) => x.offsetParent && /^add project$/i.test((x.innerText || "").trim())); if (b) b.click(); });
    await page.waitForTimeout(2500);
    async function byLabel(label, value) {
      try {
        const el = page.getByLabel(label, { exact: false }).first();
        await el.click({ timeout: 6000 });
        await el.fill(value);
        log.push(label + "=ok");
        return el;
      } catch (e) { log.push(label + " ERR:" + e.message.slice(0, 40)); return null; }
    }
    // text fields
    await byLabel("Project or company name", "Saku Sultan (e-wallet fintech)");
    await byLabel("Project link", "https://apps.apple.com/id/app/saku-sultan/id6444094885");
    await byLabel("Your official role", "Full-Stack & Mobile Developer");
    // dates — try typing
    await byLabel("Start date", "2022");
    await page.waitForTimeout(400);
    await byLabel("End date", "2025");
    await page.waitForTimeout(400);
    // technologies — type + Enter each
    try {
      const tech = page.getByLabel("Technologies you used", { exact: false }).first();
      for (const t of ["React Native", "Go", "PostgreSQL", "TypeScript", "Node.js"]) {
        await tech.click({ timeout: 5000 }); await tech.type(t, { delay: 70 });
        await page.waitForTimeout(1200);
        const opt = page.locator("[role='option'], li").filter({ hasText: t }).first();
        if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("tech+" + t); }
        else { await page.keyboard.press("Enter"); log.push("tech Enter " + t); }
        await page.waitForTimeout(500);
      }
    } catch (e) { log.push("tech ERR:" + e.message.slice(0, 40)); }
    // tag (industry)
    try {
      const tag = page.getByLabel("Type or choose tag", { exact: false }).first();
      await tag.click({ timeout: 5000 }); await tag.type("Fintech", { delay: 80 });
      await page.waitForTimeout(1200);
      const opt = page.locator("[role='option'], li").filter({ hasText: /fintech|financial/i }).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("tag Fintech"); }
      else { await page.keyboard.press("Enter"); log.push("tag Enter"); }
    } catch (e) { log.push("tag ERR:" + e.message.slice(0, 40)); }
    await page.waitForTimeout(800);
    await cdpShot(page, "saku-filled");
    return { log };
  }, "https://me.lemon.io/profile");
}

async function fixSaku() {
  return withPage(async (page) => {
    const log = [];
    // 1. remove wrong "Agora.io" chip
    try {
      const rm = page.locator("button, [role='button'], span").filter({ hasText: /^Agora\.io/ }).locator("xpath=.//*[text()='×'] | xpath=..//button").first();
      // simpler: click the × next to Agora.io
      await page.evaluate(() => {
        const chip = [...document.querySelectorAll("*")].find((e) => e.offsetParent && /^Agora\.io\s*×?$/.test((e.innerText || "").trim()) && e.children.length <= 2);
        if (chip) { const x = chip.querySelector("button, svg, span:last-child") || chip; x.click(); }
      });
      log.push("removed Agora.io (attempt)");
    } catch (e) { log.push("rm ERR:" + e.message.slice(0, 30)); }
    await page.waitForTimeout(800);
    // 2. add Go correctly (pick exact "Go" or "Golang")
    try {
      const tech = page.getByLabel("Technologies you used", { exact: false }).first();
      await tech.click({ timeout: 5000 }); await tech.type("Golang", { delay: 90 });
      await page.waitForTimeout(1300);
      let opt = page.locator("[role='option'], li").filter({ hasText: /^Golang$|^Go$|Golang/i }).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("added Golang"); }
      else { await tech.fill(""); await tech.type("Go", { delay: 100 }); await page.waitForTimeout(1300);
        opt = page.locator("[role='option'], li").filter({ hasText: /^Go$/ }).first();
        if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("added Go(exact)"); } else { log.push("Go not found"); await page.keyboard.press("Escape"); }
      }
    } catch (e) { log.push("go ERR:" + e.message.slice(0, 40)); }
    await page.waitForTimeout(600);
    // 3. fill Accomplishments (required)
    try {
      const acc = page.getByPlaceholder("Tell us what you worked on", { exact: false }).first();
      await acc.click({ timeout: 5000 });
      await acc.fill("Built and shipped Saku Sultan, a fintech e-wallet, live on the App Store & Google Play with 10,000+ downloads (4.7 rating). Developed the React Native/Expo mobile app end-to-end; built the Go backend (Gin, pgx) with RabbitMQ for job queues/notifications and Kafka for transaction event streams; created the admin dashboard. Handled EAS build/submit and passed both Apple and Google review.");
      log.push("accomplishments=ok");
    } catch (e) { log.push("acc ERR:" + e.message.slice(0, 40)); }
    await page.waitForTimeout(700);
    await cdpShot(page, "saku-fixed");
    return { log };
  });
}

async function fixSaku2() {
  return withPage(async (page) => {
    const log = [];
    // 1. remove Agora.io chip via its × button
    try {
      const removed = await page.evaluate(() => {
        const chip = [...document.querySelectorAll("div,span,li")].find((e) => e.offsetParent && /^Agora\.io\s*×?$/.test((e.innerText || "").trim()) && e.querySelector("button,svg"));
        if (chip) { const x = chip.querySelector("button") || chip.querySelector("svg"); if (x) { (x.closest("button") || x).dispatchEvent(new MouseEvent("click", { bubbles: true })); return true; } }
        return false;
      });
      log.push("agora removed=" + removed);
    } catch (e) { log.push("rm ERR:" + e.message.slice(0, 40)); }
    await page.waitForTimeout(1000);
    // if still there, try Playwright locator click on the × after Agora.io
    try {
      const chip = page.locator("*", { hasText: /^Agora\.io/ }).filter({ has: page.locator("button,svg") }).last();
      const x = chip.locator("button, svg").last();
      if (await x.isVisible().catch(() => false)) { await x.click({ force: true, timeout: 3000 }); log.push("agora ×2 clicked"); }
    } catch (e) { log.push("rm2:" + e.message.slice(0, 25)); }
    await page.waitForTimeout(800);
    // 2. fill accomplishments contenteditable
    try {
      const acc = page.locator("[contenteditable='true']").first();
      await acc.click({ timeout: 5000 });
      await page.keyboard.type("Built and shipped Saku Sultan, a fintech e-wallet, live on the App Store & Google Play with 10,000+ downloads (4.7 rating). Developed the React Native/Expo mobile app end-to-end; built the Go backend (Gin, pgx) with RabbitMQ for job queues/notifications and Kafka for transaction event streams; delivered the admin dashboard. Handled EAS build/submit and passed Apple and Google review.", { delay: 4 });
      log.push("accomplishments typed");
    } catch (e) { log.push("acc ERR:" + e.message.slice(0, 40)); }
    await page.waitForTimeout(800);
    await cdpShot(page, "saku-fixed2");
    return { log };
  });
}

async function recoverDate() {
  return withPage(async (page) => {
    const log = [];
    // 1. re-fill project name (got cleared)
    try {
      const name = page.getByLabel("Project or company name", { exact: false }).first();
      await name.click({ timeout: 5000 }); await name.fill("Saku Sultan (e-wallet fintech)");
      log.push("name restored");
    } catch (e) { log.push("name ERR:" + e.message.slice(0, 40)); }
    // 2. clear corrupted start date: find input by its bad value
    try {
      const bad = page.locator("input").filter({ hasText: "" });
      const startInp = page.locator("input[value*='2001022'], input[value*='Feb 200']").first();
      if (await startInp.count()) {
        await startInp.click(); await startInp.press("Control+a"); await startInp.press("Delete");
        log.push("cleared bad date");
      } else {
        // fallback: locate by the value we see
        await page.evaluate(() => {
          const inp = [...document.querySelectorAll("input")].find((e) => /2001022|Feb 200/.test(e.value));
          if (inp) { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; s.call(inp, ""); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.focus(); }
        });
        log.push("cleared bad date (js by value)");
      }
    } catch (e) { log.push("clear ERR:" + e.message.slice(0, 40)); }
    await page.waitForTimeout(800);
    // 3. open the calendar: click the now-empty start date input
    await page.evaluate(() => {
      const inp = [...document.querySelectorAll("input")].find((e) => { const lab = e.closest("*") && e.parentElement; return false; });
    });
    // click via the field that had the date — locate the start-date input: it's the one before the "Jan 2025" (end date) input
    try {
      const startInp = page.locator("xpath=(//input)[3]"); // name=1, link=2, start=3 (best-effort)
      // safer: find input whose sibling label text includes Start date
      await page.evaluate(() => {
        const labels = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /^Start date\s*\*?$/.test((e.innerText || "").trim()) && e.children.length === 0);
        const lab = labels[0]; if (!lab) return;
        // the input is within the same field wrapper (go up to wrapper that has exactly one input)
        let c = lab; for (let i = 0; i < 6; i++) { c = c.parentElement; if (!c) break; const inps = c.querySelectorAll("input"); if (inps.length === 1) { inps[0].click(); return; } }
      });
      log.push("calendar open attempt");
    } catch (e) { log.push("open ERR:" + e.message.slice(0, 30)); }
    await page.waitForTimeout(1200);
    await cdpShot(page, "recover-date");
    return { log };
  });
}

async function fillAccomp() {
  return withPage(async (page) => {
    const log = [];
    // the 2nd contenteditable is Accomplishments (1st is Project overview)
    try {
      const eds = page.locator("[contenteditable='true']");
      const n = await eds.count();
      log.push("contenteditables=" + n);
      const acc = eds.nth(n >= 2 ? 1 : 0);
      await acc.click({ timeout: 5000 });
      // ensure empty then type
      await page.keyboard.press("Control+a"); await page.keyboard.press("Delete");
      await page.keyboard.type("Led end-to-end development of the mobile app and Go backend. Implemented secure wallet flows (top-up, transfer, transaction history). Set up RabbitMQ for notification/webhook job queues and Kafka event streams for transaction processing. Built the admin dashboard for operations and monitoring. Managed EAS builds and successful App Store + Google Play submissions, passing Apple and Google review.", { delay: 4 });
      log.push("accomplishments typed");
    } catch (e) { log.push("acc ERR:" + e.message.slice(0, 50)); }
    await page.waitForTimeout(800);
    await cdpShot(page, "accomp-filled");
    // report validation state of required fields
    const st = await page.evaluate(() => {
      const val = (rx) => { const inp = [...document.querySelectorAll("input")].find((e) => { let c = e; for (let i = 0; i < 6 && c; i++) { c = c.parentElement; if (c && rx.test(c.innerText || "") && c.querySelectorAll("input").length === 1) return true; } return false; }); return inp ? inp.value : null; };
      const eds = [...document.querySelectorAll("[contenteditable='true']")].map((e) => (e.innerText || "").trim().length);
      const errors = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /required|must contain|Invalid|couldn't end/i.test((e.innerText || "").trim()) && e.children.length === 0).map((e) => e.innerText.trim()).slice(0, 6);
      return { start: val(/Start date/), end: val(/End date/), editLens: eds, errors };
    });
    return { log, st };
  });
}

async function saveProject() {
  return withPage(async (page) => {
    const log = [];
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /^save project/i.test((x.innerText || "").trim()));
      if (b) { b.scrollIntoView({ block: "center" }); b.click(); }
    });
    await page.waitForTimeout(4000);
    await cdpShot(page, "after-save");
    const st = await page.evaluate(() => {
      const formOpen = !![...document.querySelectorAll("button")].find((x) => x.offsetParent && /^save project/i.test((x.innerText || "").trim()));
      const errors = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /required|must contain|Invalid|couldn't end|is required/i.test((e.innerText || "").trim()) && e.children.length === 0).map((e) => e.innerText.trim()).slice(0, 6);
      const hasSaku = /Saku Sultan/.test(document.body.innerText);
      return { formStillOpen: formOpen, errors, hasSaku };
    });
    return { log, st };
  });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function addProject(data) {
  return withPage(async (page) => {
    const log = [];
    // open Add project
    await page.evaluate(() => { const b = [...document.querySelectorAll("button,a")].find((x) => x.offsetParent && /^add project$/i.test((x.innerText || "").trim())); if (b) b.click(); });
    await page.waitForTimeout(2500);
    async function byLabel(label, value) {
      try { const el = page.getByLabel(label, { exact: false }).first(); await el.click({ timeout: 6000 }); await el.fill(value); log.push(label + "=ok"); }
      catch (e) { log.push(label + " ERR:" + e.message.slice(0, 35)); }
    }
    await byLabel("Project or company name", data.name);
    await byLabel("Project link", data.link);
    await byLabel("Your official role", data.role);
    // set a date via getByLabel (correct field) + calendar navigation (clean value)
    async function setCal(labelRx, year, month) {
      try {
        const fld = page.getByLabel(labelRx, { exact: false }).first();
        await fld.click({ force: true, timeout: 8000 });
        await page.keyboard.press("Control+a"); await page.keyboard.press("Delete");
        await page.waitForTimeout(400);
        await fld.click({ force: true });
        await page.waitForTimeout(1000);
        const calYear = () => page.evaluate(() => { const cont = [...document.querySelectorAll("div")].find((e) => e.offsetParent && /\b20\d\d\b/.test(e.innerText || "") && /Jan/.test(e.innerText || "") && /Dec/.test(e.innerText || "") && e.innerText.length < 80); return cont ? (cont.innerText.match(/20\d\d/) || [])[0] : null; });
        let yr = await calYear();
        for (let k = 0; k < 12 && yr && yr !== String(year); k++) {
          const prev = parseInt(yr, 10) > year;
          await page.evaluate((p) => { const cont = [...document.querySelectorAll("div")].find((e) => e.offsetParent && /\b20\d\d\b/.test(e.innerText || "") && /Jan/.test(e.innerText || "") && /Dec/.test(e.innerText || "") && e.innerText.length < 80); if (!cont) return; const btns = [...cont.querySelectorAll("button")].filter((x) => x.offsetParent); btns.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left); const t = p ? btns[0] : btns[btns.length - 1]; if (t) t.click(); }, prev);
          await page.waitForTimeout(470); yr = await calYear();
        }
        const ok = await page.evaluate((m) => { const cont = [...document.querySelectorAll("div")].find((e) => e.offsetParent && /\b20\d\d\b/.test(e.innerText || "") && /Jan/.test(e.innerText || "") && /Dec/.test(e.innerText || "") && e.innerText.length < 80); if (!cont) return false; const cell = [...cont.querySelectorAll("*")].find((e) => e.offsetParent && new RegExp("^" + m + "$").test((e.innerText || "").trim()) && e.children.length === 0); if (cell) { cell.click(); return true; } return false; }, month);
        log.push(labelRx + "=" + month + " " + year + " (" + ok + ")");
      } catch (e) { log.push(labelRx + " cal ERR:" + e.message.slice(0, 30)); }
      await page.waitForTimeout(500);
    }
    await setCal("Start date", data.startY, data.startM);
    await setCal("End date", data.endY, data.endM);
    // project overview (1st contenteditable) + accomplishments (2nd)
    try {
      const eds = page.locator("[contenteditable='true']");
      await eds.nth(0).click({ timeout: 5000 }); await page.keyboard.press("Control+a"); await page.keyboard.press("Delete"); await page.keyboard.type(data.overview, { delay: 3 });
      log.push("overview ok");
      await eds.nth(1).click({ timeout: 5000 }); await page.keyboard.press("Control+a"); await page.keyboard.press("Delete"); await page.keyboard.type(data.accomp, { delay: 3 });
      log.push("accomp ok");
    } catch (e) { log.push("editable ERR:" + e.message.slice(0, 35)); }
    // tech
    try {
      const tech = page.getByLabel("Technologies you used", { exact: false }).first();
      for (const t of data.tech) {
        await tech.click({ timeout: 5000 }); await tech.type(t, { delay: 70 }); await page.waitForTimeout(1200);
        const opt = page.locator("[role='option'], li").filter({ hasText: new RegExp("^" + t.replace(/[.+]/g, "\\$&") + "$", "i") }).first();
        if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("tech+" + t); }
        else { const opt2 = page.locator("[role='option'], li").filter({ hasText: new RegExp(t.replace(/[.+]/g, "\\$&"), "i") }).first(); if (await opt2.isVisible().catch(() => false)) { await opt2.click(); log.push("tech~" + t); } else { await page.keyboard.press("Escape"); log.push("tech skip " + t); } }
        await page.waitForTimeout(400);
      }
    } catch (e) { log.push("tech ERR:" + e.message.slice(0, 30)); }
    // tag
    try {
      const tag = page.getByLabel("Type or choose tag", { exact: false }).first();
      await tag.click({ timeout: 5000 }); await tag.type(data.tag, { delay: 80 }); await page.waitForTimeout(1200);
      const opt = page.locator("[role='option'], li").filter({ hasText: new RegExp(data.tag, "i") }).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("tag " + data.tag); } else { await page.keyboard.press("Enter"); log.push("tag Enter"); }
    } catch (e) { log.push("tag ERR:" + e.message.slice(0, 30)); }
    await page.waitForTimeout(600);
    // save
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /^save project/i.test((x.innerText || "").trim())); if (b) { b.scrollIntoView({ block: "center" }); b.click(); } });
    await page.waitForTimeout(4000);
    await cdpShot(page, "proj-" + data.name.slice(0, 8).replace(/\W/g, ""));
    const st = await page.evaluate((nm) => ({
      saved: ![...document.querySelectorAll("button")].some((x) => x.offsetParent && /^save project/i.test((x.innerText || "").trim())),
      present: new RegExp(nm.slice(0, 10).replace(/[.()]/g, ".")).test(document.body.innerText),
    }), data.name);
    return { log, st };
  });
}

async function additionalInfo() {
  return withPage(async (page) => {
    const log = [];
    // click Edit on Additional info section
    await page.evaluate(() => {
      const heads = [...document.querySelectorAll("*")].filter((e) => e.offsetParent && /^Additional info$/.test((e.innerText || "").trim()) && e.children.length === 0);
      const h = heads[0]; if (!h) return;
      // find nearby Edit button
      let c = h; for (let i = 0; i < 5; i++) { c = c.parentElement; if (!c) break; const btn = [...c.querySelectorAll("button")].find((b) => /^edit$/i.test(b.innerText.trim())); if (btn) { btn.click(); return; } }
    });
    await page.waitForTimeout(2000);
    // GitHub (React-friendly)
    try {
      const gh = page.locator("#codesamples_link");
      await gh.click({ timeout: 5000 }); await gh.fill(""); await gh.type("https://github.com/devnolife", { delay: 30 });
      log.push("github typed");
    } catch (e) { log.push("gh ERR:" + e.message.slice(0, 35)); }
    // LinkedIn if empty
    try {
      const li = page.locator("#linkedin");
      if (!(await li.inputValue().catch(() => ""))) { await li.click(); await li.type("https://www.linkedin.com/in/andi-agung-63522b224", { delay: 25 }); log.push("linkedin typed"); }
      else log.push("linkedin already set");
    } catch (e) { log.push("li ERR:" + e.message.slice(0, 30)); }
    // Additional languages: add Indonesian
    try {
      const langLabel = page.getByText("Additional languages", { exact: false }).first();
      // find an input near it
      const langInput = page.locator("xpath=//*[contains(text(),'Additional languages')]/following::input[1]").first();
      await langInput.click({ timeout: 5000 }); await langInput.type("Indonesian", { delay: 80 });
      await page.waitForTimeout(1300);
      const opt = page.locator("[role='option'], li").filter({ hasText: /Indonesian/i }).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("Indonesian added"); }
      else { await page.keyboard.press("Enter"); log.push("Indonesian Enter"); }
    } catch (e) { log.push("lang ERR:" + e.message.slice(0, 35)); }
    await page.waitForTimeout(600);
    // Save the section
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /^save/i.test((x.innerText || "").trim())); if (b) b.click(); });
    await page.waitForTimeout(3000);
    await cdpShot(page, "addinfo-saved");
    const st = await page.evaluate(() => ({
      github: (document.querySelector("#codesamples_link") || {}).value || (/github\.com\/devnolife/.test(document.body.innerText) ? "shown" : null),
      hasIndonesian: /Indonesian/.test(document.body.innerText),
    }));
    return { log, st };
  });
}

async function shot(name) {
  return withPage(async (page) => ({ url: page.url(), title: await page.title().catch(() => "?"), ok: await cdpShot(page, name || "now") }));
}
async function tabs() {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0]; const pages = ctx.pages(); const list = [];
    for (const p of pages) list.push({ url: p.url(), title: await p.title().catch(() => "?") });
    return { count: pages.length, tabs: list };
  } finally { await browser.close(); }
}

(async () => {
  const [cmd, a] = process.argv.slice(2);
  let res;
  if (cmd === "probe") res = await probe();
  else if (cmd === "login") res = await googleLogin();
  else if (cmd === "dump") res = await dump();
  else if (cmd === "click") res = await clickDump(a);
  else if (cmd === "fillsaku") res = await fillSaku();
  else if (cmd === "fixsaku") res = await fixSaku();
  else if (cmd === "fixsaku2") res = await fixSaku2();
  else if (cmd === "recoverdate") res = await recoverDate();
  else if (cmd === "fillaccomp") res = await fillAccomp();
  else if (cmd === "addinfo") res = await additionalInfo();
  else if (cmd === "save") res = await saveProject();
  else if (cmd === "addproj") {
    const PROJECTS = {
      sintekmu: { name: "SINTEKMu (Faculty Info System)", link: "https://simtekmu.teknik.unismuh.ac.id", role: "Full-Stack Developer", startY: 2022, startM: "Jul", endY: 2025, endM: "Jan", tag: "Education", tech: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL"], overview: "Built SINTEKMu, the information system for the Faculty of Engineering at Universitas Muhammadiyah Makassar, live in production at simtekmu.teknik.unismuh.ac.id with 580+ commits. It serves students, lecturers, and administrators across 6 role-based access levels.", accomp: "Designed and built the full system end-to-end with Next.js, React and a Node.js/PostgreSQL backend. Implemented role-based access control across 6 user levels, dashboards, and reporting. Shipped to production and maintained it over 12+ months (debugging, hardening, feature additions)." },
      fokusngajar: { name: "fokusngajar.id (AI/LLM platform)", link: "https://fokusngajar.id", role: "AI Engineer", startY: 2023, startM: "Jan", endY: 2025, endM: "Dec", tag: "Education", tech: ["Golang", "Python", "PostgreSQL", "Docker"], overview: "Built core-llm, the production Go backend powering fokusngajar.id (live). It implements an LLM/RAG pipeline: PDF ingestion, chunking, embedding, and retrieval, exposed via a chi v5 HTTP API with rate limiting and metrics, deployed via multi-stage Docker.", accomp: "Engineered the RAG pipeline end-to-end in Go (chi v5): document ingestion, chunking, embeddings, and retrieval with go-openai. Added rate limiting (x/time), Prometheus-style metrics, and multi-stage Docker builds. Integrated LLM APIs into a live education product used by teachers." },
      pemilu: { name: "PemiluDigital (e-voting system)", link: "https://github.com/devnolife", role: "Full-Stack Developer", startY: 2023, startM: "Oct", endY: 2024, endM: "Mar", tag: "Government", tech: ["TypeScript", "Node.js", "React", "PostgreSQL"], overview: "Digital e-voting system delivered for a regional legislative project (DPRD, Sinjai). Handles real-time vote counting with role-based access control and a full audit trail. Backend built in TypeScript (~224MB codebase).", accomp: "Built the full e-voting platform: real-time vote tallying, RBAC, and tamper-evident audit logging. Delivered to spec on a fixed timeline and handed over to the client." },
    };
    const key = a;
    if (PROJECTS[key]) res = await addProject(PROJECTS[key]);
    else res = { error: "unknown project key; use: " + Object.keys(PROJECTS).join(", ") };
  }
  else if (cmd === "shot") res = await shot(a);
  else if (cmd === "tabs") res = await tabs();
  else res = { error: "unknown cmd" };
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
