// _apply-upwork.js — generic Upwork proposal automation (inspect + submit).
// Usage:
//   node _apply-upwork.js inspect <external_id>
//   node _apply-upwork.js submit <external_id> <payload.json>
// payload.json: { coverFile, hourlyRate?, milestoneDesc?, milestoneAmount?,
//                 durationLabel?, answersFile? (JSON array of strings) }
const fs = require("fs");
const { withPage } = require("./hunter/browser");

const mode = process.argv[2];
const extId = process.argv[3];
const payloadFile = process.argv[4];

async function setNativeValue(page, selector, value) {
  return page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) return false;
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, { selector, value });
}

async function dumpForm(page) {
  return page.evaluate(() => {
    const out = { url: location.href, connects: null, questions: [], textareas: [], inputs: [], dropdowns: [], buttons: [] };
    const m = document.body.innerText.match(/(?:for|requires?):?\s*([0-9]+)\s*Connects/i);
    if (m) out.connects = m[1];
    document.querySelectorAll("textarea").forEach((t, i) => {
      const label = t.closest("[class*='form-group'], .air3-form-group, div")?.querySelector("label")?.innerText
        || t.getAttribute("aria-label") || t.placeholder || "";
      out.textareas.push({ i, label: label.trim().slice(0, 160), name: t.name || null, id: t.id || null, value: (t.value||"").slice(0,60) });
    });
    document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio])").forEach((inp, i) => {
      const label = inp.closest("[class*='form-group'], .air3-form-group, div")?.querySelector("label")?.innerText
        || inp.getAttribute("aria-label") || inp.placeholder || "";
      out.inputs.push({ i, label: label.trim().slice(0, 120), name: inp.name || null, id: inp.id || null, type: inp.type, value: (inp.value||"").slice(0,40) });
    });
    document.querySelectorAll(".air3-dropdown-toggle, [role='combobox']").forEach((d, i) => {
      out.dropdowns.push({ i, text: d.innerText.trim().slice(0, 80) });
    });
    document.querySelectorAll("button").forEach((b) => {
      const t = b.innerText.trim();
      if (t && /submit|send|apply|continue|next/i.test(t)) out.buttons.push(t.slice(0, 50));
    });
    // Screening questions usually render as label/legend above each answer textarea
    document.querySelectorAll(".fe-proposal-job-questions label, [data-test*='question'], legend").forEach((q) => {
      const t = q.innerText.trim();
      if (t.length > 10) out.questions.push(t.slice(0, 300));
    });
    return out;
  });
}

(async () => {
  const applyUrl = `https://www.upwork.com/nx/proposals/job/${extId}/apply/`;
  await withPage(async (page) => {
    await page.goto(applyUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(9000);

    if (mode === "inspect") {
      const form = await dumpForm(page);
      console.log(JSON.stringify(form, null, 1));
      await page.screenshot({ path: `data/apply-${extId.replace("~","")}-inspect.png`, fullPage: true });
      console.log("SCREENSHOT data/apply-" + extId.replace("~","") + "-inspect.png");
      return;
    }

    const p = JSON.parse(fs.readFileSync(payloadFile, "utf-8"));
    const cover = fs.readFileSync(p.coverFile, "utf-8").trim();

    // 1. Cover letter: the big textarea (aria-label/label contains "Cover")
    const coverOk = await page.evaluate((cover) => {
      const tas = [...document.querySelectorAll("textarea")];
      const ta = tas.find(t => /cover/i.test(t.getAttribute("aria-label") || t.closest("div")?.querySelector("label")?.innerText || "")) || tas.sort((a,b)=>b.offsetHeight-a.offsetHeight)[0];
      if (!ta) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
      setter.call(ta, cover);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }, cover);
    console.log("cover letter set:", coverOk);

    // 2. Screening answers: remaining empty textareas in DOM order
    if (p.answersFile) {
      const answers = JSON.parse(fs.readFileSync(p.answersFile, "utf-8"));
      const n = await page.evaluate((answers) => {
        const tas = [...document.querySelectorAll("textarea")].filter(t => !t.value);
        let done = 0;
        for (let i = 0; i < tas.length && i < answers.length; i++) {
          const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
          setter.call(tas[i], answers[i]);
          tas[i].dispatchEvent(new Event("input", { bubbles: true }));
          done++;
        }
        return done;
      }, answers);
      console.log("screening answers filled:", n);
    }

    // 3. Hourly rate (Upwork renders it as #step-rate with a currency mask —
    //    click + keyboard-type so the masked input registers trusted events)
    if (p.hourlyRate) {
      const rateInp = page.locator("#step-rate");
      await rateInp.click({ timeout: 8000 });
      await page.keyboard.press("Control+A");
      await page.keyboard.type(String(p.hourlyRate), { delay: 60 });
      await page.keyboard.press("Tab");
      await page.waitForTimeout(1000);
      const val = await page.locator("#step-rate").inputValue();
      console.log("hourly rate now:", val);
    }

    // 3b. Rate-increase dropdowns (frequency + percent) when present
    if (p.rateIncrease) {
      try {
        const freq = page.locator(".air3-dropdown-toggle", { hasText: "Select a frequency" }).first();
        if (await freq.count()) {
          await freq.click();
          await page.waitForTimeout(800);
          await page.locator("li, [role='option']").filter({ hasText: p.rateIncrease.frequency }).first().click();
          await page.waitForTimeout(800);
          const pct = page.locator(".air3-dropdown-toggle", { hasText: "Select a percent" }).first();
          await pct.click();
          await page.waitForTimeout(800);
          await page.locator("li, [role='option']").filter({ hasText: p.rateIncrease.percent }).first().click();
          console.log("rate increase set:", p.rateIncrease.frequency, p.rateIncrease.percent);
        }
      } catch (e) { console.log("rate-increase skip:", e.message.slice(0, 80)); }
    }

    // 4. Fixed-price milestone
    if (p.milestoneDesc) {
      const descInp = page.locator("input[placeholder*='escription'], input[aria-label*='escription']").first();
      await descInp.click({ timeout: 8000 }).catch(()=>{});
      await page.keyboard.type(p.milestoneDesc, { delay: 12 });
      const amtInp = page.locator("input[placeholder*='mount'], input[aria-label*='mount'], input[data-test*='amount']").first();
      await amtInp.click({ timeout: 8000 }).catch(()=>{});
      await page.keyboard.type(String(p.milestoneAmount), { delay: 40 });
      console.log("milestone typed:", p.milestoneDesc.slice(0,40), p.milestoneAmount);
    }
    if (p.durationLabel) {
      const dd = page.locator(".air3-dropdown-toggle", { hasText: /duration|select/i }).first();
      try {
        await dd.click({ timeout: 6000 });
        await page.waitForTimeout(1200);
        await page.locator(`li:has-text("${p.durationLabel}"), [role='option']:has-text("${p.durationLabel}")`).first().click({ timeout: 6000 });
        console.log("duration set:", p.durationLabel);
      } catch (e) { console.log("duration skip:", e.message.slice(0,80)); }
    }

    await page.screenshot({ path: `data/apply-${extId.replace("~","")}-filled.png`, fullPage: true });

    // 5. Submit
    const submitBtn = page.locator("button:has-text('Submit proposal'), button:has-text('Send proposal'), button:has-text('Send')").last();
    await submitBtn.click({ timeout: 10000 });
    await page.waitForTimeout(6000);

    // 6. Safety dialog if shown
    try {
      const dlg = page.locator(".air3-modal, [role='dialog']");
      if (await dlg.count()) {
        const cb = dlg.locator("input[type=checkbox]").first();
        if (await cb.count()) await cb.check({ force: true }).catch(()=>{});
        await dlg.locator("button:has-text('Send'), button:has-text('Submit')").last().click({ timeout: 8000 });
        await page.waitForTimeout(6000);
        console.log("safety dialog handled");
      }
    } catch (e) { console.log("no safety dialog:", e.message.slice(0,60)); }

    await page.waitForTimeout(4000);
    const finalUrl = page.url();
    await page.screenshot({ path: `data/apply-${extId.replace("~","")}-final.png`, fullPage: false });
    console.log("FINAL_URL:", finalUrl);
    console.log(finalUrl.includes("success") ? "PROPOSAL_SUBMITTED" : "CHECK_SCREENSHOT");
  }, { urlHint: "upwork" });
  process.exit(0);
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
