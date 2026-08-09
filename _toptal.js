// Toptal signup helper — reuses the automation Chrome profile via CDP.
//   node _toptal.js probe     open apply page, dump form structure + screenshot
//   node _toptal.js shot <name>   screenshot current page
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
    let page = ctx.pages().find((p) => p.url().includes("toptal")) || ctx.pages()[0] || (await ctx.newPage());
    if (url) { await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.waitForTimeout(4000); }
    return await fn(page, ctx);
  } finally { await browser.close(); }
}

async function probe() {
  return withPage(async (page) => {
    const info = await page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const fields = [...document.querySelectorAll("input,select,textarea")].filter(vis).map((e) => ({
        tag: e.tagName, type: e.type || null, name: e.name || null, id: e.id || null,
        placeholder: e.placeholder || null,
        label: (e.labels && e.labels[0] ? e.labels[0].innerText : "").slice(0, 60),
      }));
      const buttons = [...document.querySelectorAll("button,a[role='button'],[type='submit']")].filter(vis).map((b) => (b.innerText || b.value || "").trim()).filter(Boolean).slice(0, 30);
      const social = [...document.querySelectorAll("a,button")].filter(vis).map((e) => (e.innerText || "").trim()).filter((t) => /google|linkedin|github|apple/i.test(t)).slice(0, 10);
      return { url: location.href, title: document.title, fields, buttons, social, bodySnippet: document.body.innerText.slice(0, 600) };
    });
    await page.screenshot({ path: path.join(SHOTDIR, "toptal-probe.png"), fullPage: false });
    return info;
  }, "https://www.toptal.com/talent/apply");
}

async function inspect2() {
  return withPage(async (page) => page.evaluate(() => {
    const vis = (e) => e.offsetParent !== null;
    const selects = [...document.querySelectorAll("select")].map((s) => ({
      name: s.name, id: s.id, visible: vis(s),
      options: [...s.options].map((o) => o.text.trim()).filter(Boolean),
    }));
    const customDd = [...document.querySelectorAll("[class*='select'],[class*='dropdown'],[role='combobox']")].filter(vis).map((e) => (e.innerText || "").trim().slice(0, 40)).filter(Boolean).slice(0, 8);
    const liBtn = [...document.querySelectorAll("a,button")].find((b) => vis(b) && /linkedin/i.test(b.innerText));
    return { selects, customDd, hasLinkedInBtn: !!liBtn, linkedInText: liBtn ? liBtn.innerText.trim() : null };
  }), "https://www.toptal.com/talent/apply");
}

async function signupLinkedIn(role) {
  return withPage(async (page, ctx) => {
    const log = [];
    const roleSet = await page.evaluate((role) => {
      const s = [...document.querySelectorAll("select")][0];
      if (s) {
        const o = [...s.options].find((o) => new RegExp(role, "i").test(o.text));
        if (o) { s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); return "native:" + o.text; }
      }
      return null;
    }, role);
    log.push("roleSet=" + roleSet);
    await page.waitForTimeout(1000);

    const popupPromise = ctx.waitForEvent("page", { timeout: 15000 }).catch(() => null);
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("a,button")].find((x) => x.offsetParent && /sign up with linkedin/i.test(x.innerText));
      if (b) b.click();
    });
    const popup = await popupPromise;
    await page.waitForTimeout(5000);

    if (popup) {
      log.push("popup opened: " + popup.url().slice(0, 80));
      await popup.waitForLoadState("domcontentloaded").catch(() => {});
      await popup.waitForTimeout(4000);
      await popup.screenshot({ path: path.join(SHOTDIR, "toptal-li-popup.png") }).catch(() => {});
      const clicked = await popup.evaluate(() => {
        const b = [...document.querySelectorAll("button,a")].find((x) => x.offsetParent && /allow|authorize|sign in|continue|izinkan/i.test(x.innerText));
        if (b) { b.click(); return b.innerText.trim(); }
        return null;
      }).catch(() => null);
      log.push("popup authorize click=" + clicked);
      await popup.waitForEvent("close", { timeout: 20000 }).catch(() => {});
    } else {
      log.push("no popup (same-tab redirect or blocked)");
    }
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(SHOTDIR, "toptal-after-li.png"), fullPage: false }).catch(() => {});
    const state = await page.evaluate(() => ({ url: location.href, title: document.title, snippet: document.body.innerText.slice(0, 400) }));
    return { log, state };
  }, "https://www.toptal.com/talent/apply");
}

async function fill1() {
  return withPage(async (page) => {
    const log = [];
    async function typeahead(placeholder, value) {
      try {
        const el = page.getByPlaceholder(placeholder, { exact: false }).first();
        await el.click({ timeout: 8000 });
        await el.fill("");
        await el.type(value, { delay: 90 });
        await page.waitForTimeout(1800);
        // try click the first visible option in any listbox
        const opt = page.locator("[role='option'], li[class*='option'], [class*='menu'] [class*='option']").first();
        if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push(placeholder + "=picked option"); }
        else { await page.keyboard.press("Enter"); log.push(placeholder + "=Enter"); }
      } catch (e) { log.push(placeholder + " ERR:" + e.message.slice(0, 50)); }
      await page.waitForTimeout(600);
    }
    // 1. legal name
    try {
      const ln = page.locator("input[name='legal_name']");
      await ln.fill("Andi Agung Dwi Arya"); log.push("legal_name set");
    } catch (e) { log.push("legal_name ERR:" + e.message.slice(0, 40)); }
    // 2. location
    await typeahead("Country", "Indonesia");
    await typeahead("City", "Makassar");
    // 3. citizenship (placeholder e.g., Andorra)
    await typeahead("Andorra", "Indonesia");
    // 4. english proficiency = Advanced (honest: FDP writes/listens Sangat Baik, speaks/reads Baik)
    try {
      const adv = page.locator("input[name='english_proficiency'][value='Advanced']");
      await adv.check({ force: true }); log.push("english=Advanced");
    } catch (e) { log.push("english ERR:" + e.message.slice(0, 40)); }
    // 5. spoken languages
    await typeahead("Add a language", "English");
    await typeahead("Add a language", "Indonesian");
    await page.screenshot({ path: path.join(SHOTDIR, "toptal-fill1.png"), fullPage: false }).catch(() => {});
    // inspect the reason dropdown options
    let reasonOpts = [];
    try {
      const r = page.getByPlaceholder("Select a reason", { exact: false }).first();
      await r.click({ timeout: 6000 });
      await page.waitForTimeout(1200);
      reasonOpts = await page.evaluate(() => [...document.querySelectorAll("[role='option'], li")].filter((e) => e.offsetParent).map((e) => e.innerText.trim()).filter(Boolean).slice(0, 15));
    } catch (e) { reasonOpts = ["ERR:" + e.message.slice(0, 40)]; }
    return { log, reasonOpts };
  });
}

async function fix1() {
  return withPage(async (page) => {
    const log = [];
    // 1. English = Advanced (click the label text to be safe)
    try {
      await page.locator("label:has-text('Advanced'), text=Advanced").first().click({ timeout: 5000 });
      log.push("clicked Advanced");
    } catch (e) {
      try { await page.locator("input[value='Advanced']").check({ force: true }); log.push("checked Advanced(force)"); }
      catch (e2) { log.push("adv ERR:" + e2.message.slice(0, 40)); }
    }
    await page.waitForTimeout(500);
    // 2. Add Indonesian language — click the Spoken Languages box, type, pick option
    try {
      // click just right of the English chip within the languages control
      const langBox = page.locator("xpath=//*[contains(text(),'Spoken Languages')]/following::*[self::div or self::input][1]").first();
      await langBox.click({ timeout: 5000 }).catch(() => {});
      await page.keyboard.type("Indonesian", { delay: 100 });
      await page.waitForTimeout(1700);
      const opt = page.locator("[role='option'], li[class*='option'], [class*='menu'] li").filter({ hasText: "Indonesian" }).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("Indonesian picked"); }
      else { log.push("Indonesian no-option; leaving English only"); await page.keyboard.press("Escape"); }
    } catch (e) { log.push("lang ERR:" + e.message.slice(0, 50)); }
    await page.waitForTimeout(500);
    // 3. Re-select reason properly
    try {
      const r = page.getByPlaceholder("Select a reason", { exact: false }).first();
      await r.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
      const opt = page.locator("[role='option'], li").filter({ hasText: "higher quality or more diverse" }).first();
      await opt.click({ timeout: 4000 });
      log.push("reason re-picked");
    } catch (e) { log.push("reason ERR:" + e.message.slice(0, 50)); }
    await page.waitForTimeout(800);
    // re-assert Advanced in case language/reason clicks disturbed it
    try {
      const advChecked = await page.locator("input[value='Advanced']").isChecked().catch(() => false);
      if (!advChecked) { await page.locator("text=Advanced").first().click(); log.push("re-clicked Advanced"); }
    } catch (e) {}
    await page.screenshot({ path: path.join(SHOTDIR, "toptal-fix1.png"), fullPage: false }).catch(() => {});
    const st = await page.evaluate(() => ({
      english: ([...document.querySelectorAll("input[name='english_proficiency']")].find((r) => r.checked) || {}).value || null,
      langs: /Indonesian/.test(document.body.innerText),
      reasonShown: (([...document.querySelectorAll("input")].find((e) => /reason/i.test(e.placeholder || "")) || {}).value) || "n/a",
    }));
    return { log, st };
  });
}

async function fill1b() {
  return withPage(async (page) => {
    const log = [];
    // add Indonesian to spoken languages: click the languages box (has English chip) and type
    try {
      const box = page.locator("input").filter({ hasNot: page.locator("[name]") });
      // simpler: the spoken-languages input is the one near the English chip; click the container then type
      const langInput = page.getByPlaceholder("Add a language", { exact: false }).first();
      if (await langInput.isVisible().catch(() => false)) {
        await langInput.click(); await langInput.type("Indonesian", { delay: 90 });
      } else {
        // input may have lost placeholder; click the chip container area
        await page.locator("text=English").first().click();
        await page.keyboard.type("Indonesian", { delay: 90 });
      }
      await page.waitForTimeout(1600);
      const opt = page.locator("[role='option'], li[class*='option']").first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("Indonesian=picked"); }
      else { await page.keyboard.press("Enter"); log.push("Indonesian=Enter"); }
    } catch (e) { log.push("lang ERR:" + e.message.slice(0, 50)); }
    await page.waitForTimeout(600);
    // select reason
    try {
      const r = page.getByPlaceholder("Select a reason", { exact: false }).first();
      await r.click({ timeout: 6000 });
      await page.waitForTimeout(1000);
      const wanted = "higher quality or more diverse";
      const opt = page.locator(`text=${wanted}`).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click(); log.push("reason=diverse jobs"); }
      else {
        const anyOpt = page.locator("[role='option'], li").filter({ hasText: "higher quality" }).first();
        await anyOpt.click(); log.push("reason=fallback click");
      }
    } catch (e) { log.push("reason ERR:" + e.message.slice(0, 50)); }
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SHOTDIR, "toptal-fill1b.png"), fullPage: false }).catch(() => {});
    // verify state before continue
    const state = await page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const chips = [...document.querySelectorAll("[class*='chip'],[class*='tag'],[class*='multi']")].filter(vis).map((e) => e.innerText.trim()).filter(Boolean).slice(0, 6);
      const reasonInput = [...document.querySelectorAll("input,select")].find((e) => /reason/i.test(e.placeholder || "") || /reason/i.test(e.name || ""));
      return { chips, bodyHas: { indonesian: /Indonesian/.test(document.body.innerText) } };
    });
    return { log, state };
  });
}

async function continueWizard() {
  return withPage(async (page) => {
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /^continue$/i.test(x.innerText.trim())); if (b) b.click(); });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(SHOTDIR, "toptal-step2.png"), fullPage: false }).catch(() => {});
    return page.evaluate(() => ({ url: location.href, text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 800) }));
  });
}

async function wizard() {
  return withPage(async (page) => {
    await page.waitForTimeout(3000);
    return page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const fields = [...document.querySelectorAll("input,select,textarea")].filter(vis).map((e) => ({
        tag: e.tagName, type: e.type || null, name: e.name || null,
        placeholder: e.placeholder || null, value: (e.value || "").slice(0, 40),
      }));
      const buttons = [...document.querySelectorAll("button,a[role='button'],[type='submit']")].filter(vis).map((b) => (b.innerText || b.value || "").trim()).filter(Boolean).slice(0, 20);
      return { url: location.href, title: document.title, fields, buttons, text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 1500) };
    });
  });
}

async function tabs() {
  await ensureChrome();
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  try {
    const ctx = browser.contexts()[0];
    const pages = ctx.pages();
    const list = [];
    for (const p of pages) list.push({ url: p.url(), title: await p.title().catch(() => "?") });
    return { count: pages.length, tabs: list };
  } finally { await browser.close(); }
}

async function cdpShot(page, name) {
  try {
    const cdp = await page.context().newCDPSession(page);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
    require("fs").writeFileSync(path.join(SHOTDIR, `toptal-${name}.png`), Buffer.from(data, "base64"));
    return true;
  } catch (e) { return false; }
}

async function reload() {
  return withPage(async (page) => {
    await page.goto("https://www.toptal.com/screening_wizard/application", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000);
    await cdpShot(page, "reload");
    return page.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      const fields = [...document.querySelectorAll("input,select,textarea")].filter(vis).map((e) => ({
        name: e.name || null, type: e.type || null, placeholder: e.placeholder || null,
        value: (e.value || "").slice(0, 30), checked: e.type === "radio" ? e.checked : undefined,
      }));
      return { url: location.href, fields, text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 500) };
    });
  });
}

async function industries2() {
  return withPage(async (page) => {
    const log = [];
    async function addInd(value, pick) {
      // focus the industries combobox input via JS, then type with keyboard
      const focused = await page.evaluate(() => {
        const lab = document.querySelector("label[for='industries']");
        if (!lab) return false;
        // walk up until we find an ancestor that contains the combobox
        let container = lab;
        for (let i = 0; i < 5; i++) {
          container = container.parentElement;
          if (container && container.querySelector("[role='combobox']")) break;
        }
        if (!container) return false;
        const combo = container.querySelector("[role='combobox']");
        if (combo) combo.click();
        const inp = container.querySelector("input:not([type='hidden'])");
        if (inp) { inp.focus(); return true; }
        return false;
      });
      if (!focused) { log.push("no industries input for " + value); return; }
      await page.waitForTimeout(600);
      await page.keyboard.type(value, { delay: 90 });
      await page.waitForTimeout(1600);
      const opt = page.locator("[role='option'], li[class*='option'], [class*='menu'] li, ul li").filter({ hasText: pick || value }).first();
      if (await opt.isVisible().catch(() => false)) { await opt.click({ force: true }); log.push("industry+ " + (pick || value)); }
      else {
        // dump what options are visible for diagnosis
        const seen = await page.evaluate(() => [...document.querySelectorAll("[role='option'], li")].filter((e) => e.offsetParent).map((e) => e.innerText.trim()).filter(Boolean).slice(0, 12));
        log.push("no-opt '" + value + "' seen=" + JSON.stringify(seen).slice(0, 120));
        await page.keyboard.press("Escape");
      }
      await page.waitForTimeout(500);
    }
    await addInd("Financ", "Financ");
    await addInd("Educat", "Educat");
    await cdpShot(page, "industries2");
    return { log };
  });
}

async function industries() {
  return withPage(async (page) => {
    const log = [];
    // click the industries typeahead (the empty input under the industries label)
    async function addInd(value, pick) {
      try {
        // locate input following the "industries" label
        const inp = page.locator("xpath=//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'which industries')]/following::input[1]").first();
        await inp.click({ force: true, timeout: 6000 });
        await inp.pressSequentially(value, { delay: 90 });
        await page.waitForTimeout(1600);
        const opt = page.locator("[role='option'], li[class*='option'], [class*='menu'] li, [class*='option']").filter({ hasText: pick || value }).first();
        if (await opt.isVisible().catch(() => false)) { await opt.click({ force: true }); log.push("industry+ " + (pick || value)); }
        else { await page.keyboard.press("Enter"); log.push("industry Enter " + value); }
      } catch (e) { log.push("ind ERR " + value + ":" + e.message.slice(0, 35)); }
      await page.waitForTimeout(600);
    }
    await addInd("Financial", "Financial");
    await addInd("Education", "Education");
    await addInd("Information Tech", "Information");
    await cdpShot(page, "industries");
    const opts = await page.evaluate(() => [...document.querySelectorAll("[role='option'], li")].filter((e) => e.offsetParent).map((e) => e.innerText.trim()).filter(Boolean).slice(0, 20));
    return { log, visibleOptionsNow: opts };
  });
}

async function step2b() {
  return withPage(async (page) => {
    const log = [];
    // ensure skills box focused so suggested panel is visible
    try { await page.getByPlaceholder("select a skill", { exact: false }).first().click({ force: true, timeout: 5000 }); } catch (e) {}
    await page.waitForTimeout(1000);
    // click suggested-skill chips by exact text
    for (const s of ["Node.js", "JavaScript", "Python", "Docker"]) {
      try {
        const chip = page.locator("button, [class*='chip'], [class*='tag'], li, span").filter({ hasText: new RegExp("^" + s.replace(/\./g, "\\.") + "$", "i") }).first();
        await chip.click({ force: true, timeout: 4000 });
        log.push("skill+ " + s);
        await page.waitForTimeout(800);
      } catch (e) { log.push("skill ERR " + s + ":" + e.message.slice(0, 30)); }
    }
    // commitment = Part-time — click the radio input's label
    try {
      await page.evaluate(() => {
        const r = [...document.querySelectorAll("input[name='job_commitment_type']")].find((x) => /part-time/i.test(x.value));
        if (r) { r.click(); r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); }
      });
      log.push("commitment clicked");
    } catch (e) { log.push("commit ERR:" + e.message.slice(0, 30)); }
    await page.waitForTimeout(800);
    await cdpShot(page, "step2b");
    const st = await page.evaluate(() => {
      const chips = [...document.querySelectorAll("[class*='chip'],[class*='tag']")].map((e) => e.innerText.replace(/\s*×\s*/, "").trim()).filter(Boolean);
      return {
        skillChips: [...new Set(chips)].slice(0, 12),
        commitment: ([...document.querySelectorAll("input[name='job_commitment_type']")].find((r) => r.checked) || {}).value || null,
      };
    });
    return { log, st };
  });
}

async function step2() {
  return withPage(async (page) => {
    const log = [];
    const setNative = (name, val) => page.evaluate(({ name, val }) => {
      const el = document.querySelector(`input[name='${name}']`);
      if (!el) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }, { name, val });

    async function typeahead(placeholder, value, pickText) {
      try {
        const inp = page.getByPlaceholder(placeholder, { exact: false }).first();
        await inp.click({ force: true, timeout: 6000 });
        await inp.pressSequentially(value, { delay: 90 });
        await page.waitForTimeout(1700);
        const opt = page.locator("[role='option'], li[class*='option'], [class*='menu'] li, [class*='option']")
          .filter({ hasText: pickText || value }).first();
        if (await opt.isVisible().catch(() => false)) { await opt.click({ force: true }); log.push(placeholder + "=picked '" + (pickText || value) + "'"); }
        else { await page.keyboard.press("Enter"); log.push(placeholder + "=Enter"); }
      } catch (e) { log.push(placeholder + " ERR:" + e.message.slice(0, 45)); }
      await page.waitForTimeout(500);
    }

    // 1. years overall
    await typeahead("Select number of years", "5", "5");
    // 2. primary interest
    await typeahead("select an interest", "Full-stack", "Full-stack");
    // 3. years in primary interest (plain number)
    log.push("primary_years=" + await setNative("primary_interest_experience", "5"));
    // 4. skills
    for (const s of ["React", "React Native", "Node.js", "TypeScript", "Next.js", "Python", "PostgreSQL"]) {
      await typeahead("select a skill", s, s);
    }
    // 5. commitment = Part-time (honest: has ongoing Metito contract, wants project work)
    try { await page.locator("text=Part-time").first().click({ force: true, timeout: 5000 }); log.push("commitment=Part-time"); }
    catch (e) { log.push("commitment ERR:" + e.message.slice(0, 30)); }
    // 6. hourly rate (DEFAULT — user should review)
    log.push("rate=" + await setNative("hourly_rate", "45"));
    // 7. links
    log.push("linkedin=" + await setNative("linkedin", "https://www.linkedin.com/in/andi-agung-63522b224"));
    log.push("github=" + await setNative("github", "https://github.com/devnolife"));
    log.push("website=" + await setNative("personal_website", "https://github.com/devnolife"));
    await page.waitForTimeout(800);
    await cdpShot(page, "step2-filled");
    const st = await page.evaluate(() => {
      const g = (n) => (document.querySelector(`input[name='${n}']`) || {}).value || null;
      return {
        primary_years: g("primary_interest_experience"), rate: g("hourly_rate"),
        linkedin: g("linkedin"), github: g("github"),
        commitment: ([...document.querySelectorAll("input[name='job_commitment_type']")].find((r) => r.checked) || {}).value || null,
        skillsShown: /React/.test(document.body.innerText),
      };
    });
    return { log, st };
  });
}

async function goStep(nameRx) {
  return withPage(async (page) => {
    await page.evaluate((rx) => {
      const re = new RegExp(rx, "i");
      const el = [...document.querySelectorAll("a,button,li,div,span")].find((e) => e.offsetParent && re.test(e.innerText || "") && (e.innerText || "").length < 40);
      if (el) el.click();
    }, nameRx);
    await page.waitForTimeout(3500);
    await cdpShot(page, "goto-" + nameRx.replace(/\W/g, ""));
    return page.evaluate(() => ({
      url: location.href,
      english: ([...document.querySelectorAll("input[name='english_proficiency']")].find((r) => r.checked) || {}).value || null,
      hasLegalName: !!document.querySelector("input[name='legal_name']"),
      text: document.body.innerText.replace(/\n{2,}/g, "\n").slice(0, 200),
    }));
  });
}

async function shot(name) {
  return withPage(async (page) => {
    const ok = await cdpShot(page, name);
    return { url: page.url(), title: await page.title().catch(() => "?"), cdpShot: ok };
  });
}

(async () => {
  const [cmd, a] = process.argv.slice(2);
  let res;
  if (cmd === "probe") res = await probe();
  else if (cmd === "inspect2") res = await inspect2();
  else if (cmd === "linkedin") res = await signupLinkedIn(a || "Developer");
  else if (cmd === "industries2") res = await industries2();
  else if (cmd === "industries") res = await industries();
  else if (cmd === "step2b") res = await step2b();
  else if (cmd === "step2") res = await step2();
  else if (cmd === "gostep") res = await goStep(a || "Getting Started");
  else if (cmd === "reload") res = await reload();
  else if (cmd === "fix1") res = await fix1();
  else if (cmd === "fill1b") res = await fill1b();
  else if (cmd === "continue") res = await continueWizard();
  else if (cmd === "fill1") res = await fill1();
  else if (cmd === "wizard") res = await wizard();
  else if (cmd === "tabs") res = await tabs();
  else if (cmd === "shot") res = await shot(a || "now");
  else res = { error: "unknown cmd" };
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
