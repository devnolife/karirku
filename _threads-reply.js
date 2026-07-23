// Post reply ke 3 post project di Threads + verifikasi
const { withPage, sleep } = require("./hunter/browser");

const TARGETS = [
  {
    id: 1576, user: "singh.praxhant",
    url: "https://www.threads.com/@singh.praxhant/post/Da0H_iejEor",
    text: "Hi! Full-stack developer (5+ yrs) - I can build your clothing store with that Gucci-level clean look: custom Next.js storefront, product catalog, cart & payments, fast and mobile-first. Live work you can check now: simtekmu.teknik.unismuh.ac.id and github.com/devnolife. I can start this week - happy to discuss scope in DM.",
    verify: "Gucci-level clean look",
  },
];

(async () => {
  const results = [];
  await withPage(async (_p, ctx) => {
    const page = await ctx.newPage();
    for (const t of TARGETS) {
      try {
        await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await sleep(6000);

        // composer inline: langsung fokus ke lexical editor
        const box = page.locator(`div[contenteditable="true"][data-lexical-editor="true"][aria-placeholder*="Balas ke"]`).first();
        if (!(await box.count())) throw new Error("Composer lexical tidak ditemukan");
        await box.click({ force: true });
        await sleep(1500);
        await page.keyboard.type(t.text, { delay: 12 });
        await sleep(1500);

        // tombol kirim = lingkaran panah di kanan composer (tanpa teks)
        const pos = await page.evaluate(() => {
          const ce = document.querySelector('div[contenteditable="true"][data-lexical-editor="true"][aria-placeholder*="Balas ke"]');
          if (!ce) return null;
          const ceR = ce.getBoundingClientRect();
          // tombol kirim: svg aria-label "Balas"/"Reply" DI KANAN composer (bukan ikon reply post di kiri)
          for (const s of document.querySelectorAll('svg[aria-label="Balas"], svg[aria-label="Reply"], svg[aria-label="Posting"], svg[aria-label="Post"]')) {
            const r = s.getBoundingClientRect();
            if (!r.width) continue;
            const cy = r.y + r.height / 2;
            if (r.x > ceR.right + 20 && cy >= ceR.top - 30 && cy <= ceR.bottom + 60) {
              const btn = s.closest('div[role="button"]') || s;
              const br = btn.getBoundingClientRect();
              return { x: br.x + br.width / 2, y: br.y + br.height / 2 };
            }
          }
          return null;
        });
        if (!pos) {
          await page.screenshot({ path: `C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/fail-${t.id}.png` });
          throw new Error("Tombol kirim (panah) tidak ditemukan");
        }
        await page.mouse.click(pos.x, pos.y);
        const posted = true;
        await sleep(8000);

        // verifikasi cepat: composer kosong lagi = terkirim
        const after = await page.locator('div[contenteditable="true"][data-lexical-editor="true"][aria-placeholder*="Balas ke"]').first().innerText().catch(() => "?");
        console.log(`[${t.user}] posted=${posted} composerAfter=${JSON.stringify(after.slice(0, 40))}`);
        await page.screenshot({ path: `C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/reply-${t.id}.png` });
        results.push({ id: t.id, user: t.user, ok: posted && after.trim() === "" });
      } catch (e) {
        console.log(`[${t.user}] GAGAL: ${e.message}`);
        results.push({ id: t.id, user: t.user, ok: false, err: e.message });
      }
    }
    // verifikasi akhir: halaman Balasan profil sendiri
    const profHref = await page.evaluate(() => {
      const a = [...document.querySelectorAll("a[href^='/@']")].find((x) => x.innerText.trim() === "Profil");
      return a ? a.getAttribute("href") : null;
    });
    if (profHref) {
      await page.goto(`https://www.threads.com${profHref.replace(/\/$/, "")}/replies`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await sleep(7000);
      const body = await page.evaluate(() => document.body.innerText);
      for (const r of results) {
        const t = TARGETS.find((x) => x.id === r.id);
        r.onProfile = body.includes(t.verify);
      }
      await page.screenshot({ path: "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/replies-profile.png" });
    }
    await page.close();
  });
  console.log("RESULTS:", JSON.stringify(results));
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
