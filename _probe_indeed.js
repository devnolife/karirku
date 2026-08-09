const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.connectOverCDP("http://localhost:9333");
  const ctx = b.contexts()[0] || await b.newContext();
  const page = ctx.pages()[0] || await ctx.newPage();
  // easy-apply filter param test + pagination
  const u = "https://id.indeed.com/jobs?q=developer&l=Indonesia&sc=0kf%3Aattr(DSQF7)%3B&start=10";
  await page.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(6000);
  const out = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("a.jcs-JobTitle[data-jk]")].slice(0,4).map(a => {
      const root = a.closest(".job_seen_beacon") || a.closest("li");
      const txt = root ? root.innerText : "";
      return {
        jk: a.getAttribute("data-jk"),
        title: a.querySelector("span[title]")?.getAttribute("title"),
        company: root?.querySelector('[data-testid="company-name"]')?.innerText,
        loc: root?.querySelector('[data-testid="text-location"]')?.innerText,
        attrs: [...(root?.querySelectorAll('[data-testid="attribute_snippet_testid"]')||[])].map(x=>x.innerText),
        easyApply: /Lamar dengan mudah|Easily apply|Mudah melamar/i.test(txt),
        allText: txt.replace(/\s+/g," ").slice(0,220),
      };
    });
    return { count: document.querySelectorAll("a.jcs-JobTitle[data-jk]").length, title: document.title, cards };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
