// hunter/browser.js — Chrome CDP attach/launch helper.
// Reuses the proven automation profile that holds live logins for
// Freelancer, Upwork, LinkedIn, JobStreet and Google.
const os = require("os");
const path = require("path");
const { spawn, execFile } = require("child_process");
const http = require("http");
const { chromium } = require("playwright-core");

const CDP_PORT = parseInt(process.env.HUNTER_CDP_PORT || "9333", 10);
const CHROME = process.env.HUNTER_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = process.env.HUNTER_PROFILE || path.join(os.homedir(), ".copilot", "form-bot", "chrome-profile");

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

async function ensureChrome(startUrl = "about:blank") {
  if (await cdpAlive()) return true;
  spawn(CHROME, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${PROFILE}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1400,900",
    startUrl,
  ], { detached: true, stdio: "ignore" }).unref();
  // wait up to 30s for CDP
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    if (await cdpAlive()) return true;
  }
  throw new Error("Chrome CDP did not come up on port " + CDP_PORT);
}

/**
 * Connect and hand a page to `fn(page, ctx)`. Always closes the CDP
 * connection (not Chrome itself) afterwards.
 */
async function withPage(fn, { urlHint } = {}) {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    let page = urlHint
      ? ctx.pages().find((p) => p.url().includes(urlHint))
      : ctx.pages()[0];
    if (!page) page = ctx.pages()[0] || (await ctx.newPage());
    return await fn(page, ctx);
  } finally {
    await browser.close(); // detaches CDP; Chrome keeps running
  }
}

async function goto(page, url, wait = 5000) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(wait);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Kill all Chrome processes that belong to the automation profile. */
function stopChrome() {
  return new Promise((resolve) => {
    execFile("powershell", ["-NoProfile", "-Command",
      `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*form-bot*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`,
    ], () => resolve());
  });
}

module.exports = { CDP_PORT, PROFILE, cdpAlive, ensureChrome, withPage, goto, sleep, stopChrome };
