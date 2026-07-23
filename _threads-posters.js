// Scrape Threads: post loker + unduh gambar poster di tiap post
const fs = require("fs");
const path = require("path");
const { withPage, sleep } = require("./hunter/browser");

const KEYWORDS = ["loker developer", "loker IT wfh", "lowongan programmer remote"];
const DIR = "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/posters";
fs.mkdirSync(DIR, { recursive: true });

async function extractPostsWithImages(page) {
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
        if (node && node.innerText && node.innerText.length > 80) { text = node.innerText; break; }
      }
      // cari gambar konten (bukan avatar) di container post
      const imgs = [];
      if (node) {
        for (const im of node.querySelectorAll("img")) {
          const w = im.naturalWidth || im.width || 0;
          const alt = im.getAttribute("alt") || "";
          if (w >= 200 && !/foto profil|profile picture/i.test(alt)) {
            imgs.push({ src: im.src, alt: alt.slice(0, 120) });
          }
        }
      }
      const user = (href.match(/@([^/]+)\/post/) || [])[1] || "";
      seen.set(href, { user, href, when: t.getAttribute("datetime") || "", text: text.slice(0, 350), imgs: imgs.slice(0, 3) });
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
      for (let s = 0; s < 6; s++) { await page.mouse.wheel(0, 2200); await sleep(2000); }
      const posts = await extractPostsWithImages(page);
      for (const p of posts) if (!all.has(p.href)) all.set(p.href, { ...p, kw });
      console.log(`[${kw}] posts: ${posts.length}, dengan gambar: ${posts.filter((p) => p.imgs.length).length}`);
    }

    // unduh poster: hanya post yang teksnya berbau loker & punya gambar
    const rx = /loker|lowongan|hiring|dibutuhkan|dicari|we.?re hiring|open recruitment|wfh|remote/i;
    const cand = [...all.values()].filter((p) => p.imgs.length && rx.test(p.text)).slice(0, 14);
    console.log("\nKandidat poster:", cand.length);
    let n = 0;
    const manifest = [];
    for (const p of cand) {
      for (const im of p.imgs.slice(0, 2)) {
        n++;
        const file = `${String(n).padStart(2, "0")}-${p.user.replace(/[^a-z0-9._-]/gi, "")}.jpg`;
        try {
          const b64 = await page.evaluate(async (src) => {
            const r = await fetch(src);
            const b = await r.blob();
            return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(",")[1]); fr.readAsDataURL(b); });
          }, im.src);
          fs.writeFileSync(path.join(DIR, file), Buffer.from(b64, "base64"));
          manifest.push({ file, user: p.user, href: p.href, when: p.when, alt: im.alt, text: p.text.replace(/\n+/g, " | ").slice(0, 200) });
          console.log("saved", file, "| alt:", im.alt.slice(0, 60));
        } catch (e) { console.log("gagal", file, e.message); }
      }
    }
    fs.writeFileSync(path.join(DIR, "_manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("\nTotal poster tersimpan:", manifest.length, "->", DIR);
    await page.close();
  });
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
