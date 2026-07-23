const { withPage } = require("./hunter/browser");
(async () => {
  await withPage(async (page) => {
    await page.goto("https://www.linkedin.com/jobs/view/4425599649/apply/?openSDUIApplyFlow=true", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(10000);
    // step 1 -> 2 (contact pre-filled)
    await page.locator("[role='dialog'] button:has-text('Berikutnya')").first().click();
    await page.waitForTimeout(5000);
    // step 2 -> 3 (resume already selected: CV-Andi-Agung-Dwi-Arya.pdf)
    await page.locator("[role='dialog'] button:has-text('Berikutnya')").first().click();
    await page.waitForTimeout(5000);
    // step 3: salary question
    const q = page.locator("[role='dialog'] input[type='text']").first();
    await q.click();
    await q.fill("Currently on freelance/contract engagements (project-based). Expected salary: Rp 18-25 million/month, negotiable depending on total compensation and scope.");
    await page.waitForTimeout(1500);
    // -> Tinjau (review)
    await page.locator("[role='dialog'] button:has-text('Tinjau')").first().click();
    await page.waitForTimeout(6000);
    const review = await page.evaluate(() => {
      const m = document.querySelector("[role='dialog']");
      return { txt: m ? m.innerText.replace(/\s+/g," ").slice(0, 800) : "NO_MODAL", btns: m ? [...m.querySelectorAll("button")].map(b=>b.innerText.trim()).filter(Boolean) : [] };
    });
    console.log("REVIEW:", JSON.stringify(review, null, 1));
    // submit
    const submit = page.locator("[role='dialog'] button:has-text('Kirim lamaran'), [role='dialog'] button:has-text('Kirim'), [role='dialog'] button:has-text('Submit')").first();
    if (await submit.count()) {
      await submit.click();
      await page.waitForTimeout(8000);
      const after = await page.evaluate(() => document.body.innerText.replace(/\s+/g," ").slice(0, 400));
      console.log("AFTER_SUBMIT:", after);
      await page.screenshot({ path: "data/li-147-submitted.png" });
    } else {
      console.log("NO_SUBMIT_BUTTON_FOUND");
      await page.screenshot({ path: "data/li-147-review.png" });
    }
  }, { urlHint: "linkedin" });
  process.exit(0);
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
