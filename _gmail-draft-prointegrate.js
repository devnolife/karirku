// Draft Gmail: lamaran Pro Integrate (Sr. Fullstack Go + RN) + attach resume.pdf
const { withPage, sleep } = require("./hunter/browser");

const TO = "aubrey@prointegrate.net";
const SUBJECT = "Application: Sr. Fullstack Engineer (Go + React Native) - Andi Agung Dwi Arya";
const CV = "D:\\devnolife\\tools-ai-data\\studio\\documents\\resume.pdf";
const BODY = `Dear Aubrey and the Pro Integrate team,

I am applying for the Sr. Fullstack Engineer (Go + React Native) contract position for the QSR platform project. I am an Indonesian full-stack engineer based in Makassar with 5+ years of daily hands-on development, and this role matches my strongest stack almost point by point.

How I map to your requirements:

- Go backend: I work on production Go services - a fintech backend (Gin + pgx) and an LLM/RAG backend in Go 1.25 (chi v5, rate limiting, metrics, multi-stage Docker) that currently powers a live product.
- React Native + TypeScript: I built and shipped Saku Sultan, a production e-wallet live on both Google Play and the App Store (10K+ installs, 4.7 rating) - React Native app, Go backend, and admin dashboard.
- Payments: Saku Sultan covers top-up, transfers, and bill payments with a real-time ledger - directly relevant to POS and payment gateway integration work.
- Databases: PostgreSQL daily (schema design, tuning); working experience with MongoDB and Redis caching.
- Architecture: REST APIs and microservices in production; familiar with gRPC concepts and can be productive with it quickly.
- Messaging (nice-to-have): the Saku Sultan ecosystem uses RabbitMQ for job queues/notifications and Kafka for transaction event streams.
- Expo & SQLite (nice-to-have): 4 years with React Native/Expo (Expo Router, EAS build/submit); SQLite in several tools.
- AI-assisted workflow: I use GitHub Copilot (own subscription), Claude Code, and Cursor daily - comfortable in AI-augmented sprints from day one.

I work fully remote with minimal onboarding - most of my career has been long-term contract engagements where I owned features end-to-end: requirements, backend, mobile UI, deployment, and production support (several systems maintained live for 12-16 months).

Verifiable work: Saku Sultan on Google Play (id=com.saku_sultan) and the App Store (id6444094885), simtekmu.teknik.unismuh.ac.id (live faculty platform), github.com/devnolife (205 original repos). Private Go codebases can be walked through in a call.

My CV is attached. I am available to start immediately and would be glad to discuss the project scope.

Best regards,
Andi Agung Dwi Arya
GitHub: github.com/devnolife
Email: andi_agung@student.unismuh.ac.id
Location: Makassar, Indonesia (WIB, UTC+8)`;

(async () => {
  await withPage(async (_p, ctx) => {
    const page = await ctx.newPage();
    await page.goto("https://mail.google.com/mail/u/0/#inbox?compose=new", { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(8000);

    const to = page.locator('input[aria-label*="enerima" i], input[aria-label*="To recipients" i], input[peoplekit-id]').first();
    await to.waitFor({ timeout: 30000 });
    await to.fill(TO);
    await sleep(800);
    await page.keyboard.press("Enter");

    const subj = page.locator('input[name="subjectbox"]').first();
    await subj.fill(SUBJECT);

    const body = page.locator('div[aria-label*="Message Body" i], div[aria-label*="Isi Pesan" i], div[role="textbox"][contenteditable="true"]').last();
    await body.click();
    await body.fill(BODY);
    await sleep(500);

    const fileInput = page.locator('input[type="file"]').last();
    await fileInput.setInputFiles(CV);
    console.log("Menunggu upload attachment...");
    await sleep(12000);

    await page.keyboard.press("Control+s");
    await sleep(3000);
    await page.screenshot({ path: "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/gmail-draft-prointegrate.png" });

    const hasAttach = await page.locator('div[aria-label*="resume.pdf" i], span:has-text("resume.pdf")').count();
    console.log("Attachment terdeteksi:", hasAttach > 0 ? "YA" : "CEK MANUAL");
    console.log("Draft dibuat. TIDAK dikirim (apply_mode=manual).");
    await page.close();
  });
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
