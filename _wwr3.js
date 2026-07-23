const { withPage } = require("./hunter/browser");
(async () => {
  await withPage(async (page) => {
    // Zensors: find apply CTA (may be behind "Apply" button lower on page)
    await page.goto("https://weworkremotely.com/remote-jobs/zensors-frontend-web-developer-react-typescript-remote", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(5000);
    const z = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("a, button")].map(b => ({ t: (b.innerText||"").trim().slice(0,40), h: b.href || "" })).filter(x => /apply/i.test(x.t));
      const body = document.body.innerText.replace(/\s+/g," ");
      const m = body.match(/(?:\$|USD ?)[\d,]+(?:k)?(?:\s*[-–]\s*(?:\$|USD ?)?[\d,]+k?)?(?:\s*\/?\s*(?:yr|year|annual))?/i);
      return { btns, sal: m ? m[0] : "-" };
    });
    console.log("ZENSORS:", JSON.stringify(z, null, 1));

    // Quinncia via remotive
    await page.goto("https://remotive.com/remote-jobs/software-development/frontend-developer-2090991", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(6000);
    const q = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("a, button")].map(b => ({ t: (b.innerText||"").trim().slice(0,40), h: b.href || "" })).filter(x => /apply/i.test(x.t));
      const body = document.body.innerText.replace(/\s+/g," ");
      const m = body.match(/(?:\$|USD ?)[\d,]+k?(?:\s*[-–]\s*(?:\$|USD ?)?[\d,]+k?)?/i);
      return { btns: btns.slice(0,5), sal: m ? m[0] : "-", loc: (body.match(/Location[^.]{0,80}/i)||[])[0] };
    });
    console.log("QUINNCIA:", JSON.stringify(q, null, 1));
  }, { urlHint: "upwork" });
  process.exit(0);
})().catch(e => { console.error("FATAL", e.message); process.exit(1); });
