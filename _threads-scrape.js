// Scrape Threads search untuk loker remote indo
const fs = require("fs");
const { withPage, sleep } = require("./hunter/browser");

const KEYWORDS = ["butuh developer", "cari developer website", "butuh dibuatkan aplikasi", "need a web developer", "looking for developer", "butuh programmer", "cari jasa website"];
const OUT = "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/threads-projects.json";

async function extractPosts(page) {
  return page.evaluate(() => {
    const seen = new Map();
    for (const t of document.querySelectorAll('a[href*="/post/"] time')) {
      const a = t.closest("a");
      if (!a) continue;
      const href = a.href.split("?")[0];
      if (seen.has(href)) continue;
      let node = a, text = "";
      for (let i = 0; i < 10 && node; i++) {
        node = node.parentElement;
        if (node && node.innerText && node.innerText.length > 100) { text = node.innerText; break; }
      }
      const user = (href.match(/@([^/]+)\/post/) || [])[1] || "";
      seen.set(href, { user, href, when: t.getAttribute("datetime") || t.innerText, text: text.slice(0, 700) });
    }
    return [...seen.values()];
  });
}

(async () => {
  const all = new Map();
  await withPage(async (_p, ctx) => {
    const page = await ctx.newPage();
    for (const kw of KEYWORDS) {
      const url = `https://www.threads.com/search?q=${encodeURIComponent(kw)}&filter=recent`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(5000);
      for (let s = 0; s < 5; s++) {
        await page.mouse.wheel(0, 2500);
        await sleep(2000);
      }
      const posts = await extractPosts(page);
      for (const p of posts) if (!all.has(p.href)) all.set(p.href, { ...p, kw });
      console.log(`[${kw}] +${posts.length} posts (total unik: ${all.size})`);
    }
    await page.close();
  });
  const arr = [...all.values()];
  fs.writeFileSync(OUT, JSON.stringify(arr, null, 2));
  console.log("Saved:", OUT, "| total:", arr.length);
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
