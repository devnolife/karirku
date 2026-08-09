// Gmail send helper via CDP + playwright-core (uses logged-in automation profile).
//   node _gmail.js compose   open compose deeplink (to/su/body) + attach CV, screenshot
//   node _gmail.js send      click Send, verify
const os = require("os");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");
const SHOTDIR = "C:\\Users\\devno\\.copilot\\session-state\\aaf576fe-7e2c-46f5-abba-d2403e09df74\\files";
const CV = "D:\\devnolife\\tools-ai-data\\studio\\documents\\gsi-apply\\CV_Andi Agung Dwi Arya.pdf";

const TO = "contact@amagi.io";
const SUBJECT = "Application: Software Developer (Data Engineering / Backend) - Andi Agung Dwi Arya";
const BODY = `Hi Amagi team,

Rather than wait for the right role to find me, I'm reaching out directly: your Software Developer opening (data engineering / DevOps / security) lines up closely with what I've built over the last 5+ years, and your focus on financial services is exactly where I've shipped real, in-production software.

I'm Andi Agung Dwi Arya, a full-stack & backend engineer based in Makassar, Indonesia (fully remote-ready, GMT+8, comfortable overlapping US hours). A few highlights mapped to what you're looking for:

- Fintech, in production (data security & integrity): I built Saku Sultan, an e-wallet live on both the App Store and Google Play (10,000+ downloads). Go backend with RabbitMQ (job queues / notifications / webhooks) and Kafka (transaction event streams), PostgreSQL, plus an admin dashboard - hands-on experience keeping money flows correct, auditable, and secure.
- Data engineering + AI: I built a production Go service (chi v5) running an LLM/RAG pipeline - PDF ingestion, chunking, embedding, retrieval - with rate limiting, metrics, and multi-stage Docker. It powers a live education platform (fokusngajar.id).
- Security & integrity: JWT auth, TOTP/OTP systems, and role-based access with audit trails - e.g., a real-time digital e-voting system I delivered for a regional government project (RBAC + tamper-evident audit logging).
- Modern cloud, REST APIs, modern languages: Go, Python (FastAPI), TypeScript/Node.js, PostgreSQL, Docker, AWS; REST APIs across 205+ original repositories on GitHub.

If I had to pick one specialization it would be data engineering / backend with a strong focus on data security and integrity, though I'm equally comfortable across DevOps and security.

Portfolio:
- GitHub: https://github.com/devnolife
- Saku Sultan (fintech, live): https://apps.apple.com/id/app/saku-sultan/id6444094885 and https://play.google.com/store/apps/details?id=com.saku_sultan
- SINTEKMu (institutional system, live): https://simtekmu.teknik.unismuh.ac.id
- Production backend repos (e.g. the Go LLM/RAG service) are private but I'm happy to walk through them on a call.

My resume is attached (PDF).

Availability for interview: any weekday, ~09:00-21:00 GMT+8 (flexible to overlap Dallas/Houston/Miami business hours). I can start quickly.

Thank you for considering my application - I'd welcome the chance to talk about how I can help Amagi's financial-services and healthcare clients ship secure, reliable software.

Best regards,
Andi Agung Dwi Arya
Full-Stack & AI/ML Engineer
andiagung193@gmail.com | WhatsApp +62 851 7107 9607
github.com/devnolife`;

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
    let page = ctx.pages().find((p) => p.url().includes("mail.google.com")) || ctx.pages()[0] || (await ctx.newPage());
    if (url) { await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.waitForTimeout(6000); }
    return await fn(page, ctx);
  } finally { await browser.close(); }
}
async function cdpShot(page, name) {
  try { const cdp = await page.context().newCDPSession(page); const { data } = await cdp.send("Page.captureScreenshot", { format: "png" }); require("fs").writeFileSync(path.join(SHOTDIR, `gmail-${name}.png`), Buffer.from(data, "base64")); return true; } catch (e) { return false; }
}

async function compose() {
  const link = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TO)}&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  return withPage(async (page) => {
    const log = [];
    await page.waitForTimeout(3000);
    // attach CV via the compose file input
    let attached = false;
    try {
      const fileInput = page.locator("input[type='file']").last();
      await fileInput.setInputFiles(CV, { timeout: 15000 });
      log.push("setInputFiles called");
      // wait for attachment chip (filename appears)
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1500);
        const has = await page.evaluate(() => /CV_Andi Agung Dwi Arya\.pdf/i.test(document.body.innerText));
        if (has) { attached = true; break; }
      }
      log.push("attached=" + attached);
    } catch (e) { log.push("attach ERR:" + e.message.slice(0, 60)); }
    await page.waitForTimeout(1500);
    await cdpShot(page, "compose");
    const st = await page.evaluate(() => ({
      to: /contact@amagi\.io/.test(document.body.innerText),
      subj: /Application: Software Developer/i.test(document.body.innerText),
      body: /Rather than wait for the right role/i.test(document.body.innerText),
      cv: /CV_Andi Agung Dwi Arya\.pdf/i.test(document.body.innerText),
      sendBtn: [...document.querySelectorAll("[role='button']")].some((b) => b.offsetParent && /^Send\b/i.test((b.getAttribute("aria-label") || b.innerText || "").trim())),
    }));
    return { log, st };
  }, link);
}

async function send() {
  return withPage(async (page) => {
    const log = [];
    const clicked = await page.evaluate(() => {
      const b = [...document.querySelectorAll("[role='button']")].find((x) => x.offsetParent && /^(Kirim|Send)\b/i.test((x.getAttribute("aria-label") || x.innerText || "").trim()));
      if (b) { b.click(); return (b.getAttribute("aria-label") || b.innerText).trim(); }
      return null;
    });
    log.push("sendClick=" + clicked);
    await page.waitForTimeout(6000);
    await cdpShot(page, "after-send");
    const st = await page.evaluate(() => ({
      sentToast: /Message sent|Your message has been sent|Pesan telah dikirim|telah dikirim/i.test(document.body.innerText),
      composeGone: ![...document.querySelectorAll("[role='button']")].some((b) => b.offsetParent && /^(Kirim|Send)\b/i.test((b.getAttribute("aria-label") || b.innerText || "").trim())),
    }));
    return { log, st };
  });
}

(async () => {
  const cmd = process.argv[2] || "compose";
  let res;
  if (cmd === "compose") res = await compose();
  else if (cmd === "send") res = await send();
  else res = { error: "unknown" };
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
