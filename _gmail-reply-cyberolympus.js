// Buat draft REPLY di thread Cyber Olympus (tidak dikirim).
const { withPage, sleep } = require("./hunter/browser");

const BODY = `Dear Cyber Olympus Team,

Thank you for getting back to me. Happy to clarify both points.

1. Graduation - Yes. I earned my Bachelor of Engineering in Informatics from Universitas Muhammadiyah Makassar in October 2022, graduating with a 3.92/4.00 GPA as Best Graduate of the Faculty of Engineering. I am currently pursuing a Master's in Informatics Engineering at Universitas Hasanuddin alongside my work.

2. Previous companies - Fair question, and I should have been clearer: I have spent my career (5+ years of daily engineering) as an independent contractor under my own studio, devnolife studio, engaging directly with companies and institutions on long-term contracts rather than as a salaried employee. My main engagements:

- Saku Sultan (Indonesian fintech) - long-term contract as full-stack and mobile engineer for their e-wallet product, live on Google Play and the App Store (10K+ installs, 4.7 rating). I built the React Native app, worked on the Go backend - including RabbitMQ for job queues/notifications and Kafka for transaction event streams - and the admin dashboard.

- Faculty of Engineering, Universitas Muhammadiyah Makassar - built and still maintain SINTEKMu, the faculty's integrated information system with 6 role levels, live at simtekmu.teknik.unismuh.ac.id (580+ commits).

- LPKA (state juvenile correctional institution) - institutional management system with complex relational data, maintained in production for 12 months.

- GuruPintar / Fokus Ngajar (education SaaS) - multi-tenant AI teaching platform; I built the production Go backend (LLM/RAG pipeline with PDF ingestion, chunking, embedding and retrieval) that powers fokusngajar.id.

So rather than a list of employers, my track record is a list of production systems and the organizations that rely on them - several maintained live for 12-16 months. I am happy to provide client references or do a live walkthrough of any of these systems in a call.

Best regards,
Andi Agung Dwi Arya
GitHub: github.com/devnolife`;

(async () => {
  await withPage(async (_p, ctx) => {
    const page = await ctx.newPage();
    await page.goto("https://mail.google.com/mail/u/0/#search/" + encodeURIComponent("Remote Python Developer"), { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(10000);

    const rows = page.locator("tr.zA");
    const n = await rows.count();
    console.log("Baris hasil pencarian:", n);
    if (!n) {
      console.log(await page.locator("body").innerText().then((t) => t.slice(0, 400)));
      throw new Error("Thread Cyber Olympus tidak ditemukan di hasil pencarian");
    }
    await rows.first().locator("span.bog").first().click();
    await sleep(6000);
    await sleep(5000);
    console.log("Thread terbuka:", await page.title());

    // klik tombol Balas — coba beberapa varian selector Gmail
    const candidates = [
      page.locator('div[aria-label="Balas"], div[aria-label="Reply"]').last(),
      page.locator('span.ams.bkH').last(), // tombol "Balas" di footer thread
      page.locator('div[role="button"]', { hasText: /^Balas$|^Reply$/ }).last(),
    ];
    let clicked = false;
    for (const c of candidates) {
      if (await c.count().catch(() => 0)) {
        await c.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      // fallback: keyboard shortcut reply
      await page.keyboard.press("r");
      await sleep(3000);
      clicked = (await page.locator('div[role="textbox"][contenteditable="true"]').count()) > 0;
    }
    if (!clicked) {
      const labels = await page.evaluate(() =>
        [...document.querySelectorAll('div[role="button"], span[role="link"]')]
          .map((b) => (b.getAttribute("aria-label") || b.innerText || "").trim())
          .filter((t) => t && t.length < 40).slice(0, 60));
      console.log("Tombol terlihat:", JSON.stringify(labels));
      await page.screenshot({ path: "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/gmail-thread-debug.png" });
      throw new Error("Tombol Balas tidak ditemukan");
    }
    await sleep(4000);

    const body = page.locator('div[role="textbox"][contenteditable="true"]').last();
    await body.waitFor({ timeout: 15000 });
    await body.click();
    await body.fill(BODY);
    await sleep(1000);

    await page.keyboard.press("Control+s");
    await sleep(3000);
    await page.screenshot({ path: "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/gmail-reply-draft.png" });
    console.log("Draft reply tersimpan di thread. TIDAK dikirim.");
    await page.close();
  });
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
