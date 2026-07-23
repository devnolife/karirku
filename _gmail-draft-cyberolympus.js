// Buat draft Gmail: lamaran Cyber Olympus + attach resume.pdf
const { withPage, sleep } = require("./hunter/browser");

const TO = "info@cyberolympus.com";
const SUBJECT = "Application: Remote Python Developer - Andi Agung Dwi Arya";
const CV = "D:\\devnolife\\tools-ai-data\\studio\\documents\\resume.pdf";
const BODY = `Dear Cyber Olympus Hiring Team,

I am writing to apply for the Remote Python Developer position I found through your Threads post. I am a full-stack engineer from Makassar, Indonesia, with 5+ years of daily hands-on development since 2021 and 205 original repositories on GitHub (github.com/devnolife), 36 of them in Python.

How my experience maps to your requirements:

- Python: I build production REST backends with FastAPI + Pydantic (public repos: aethra, amertasign-llm), plus extensive Python work in NLP, OCR, and computer vision.
- Messaging (RabbitMQ/Kafka): I worked on the backend ecosystem of Saku Sultan, a fintech e-wallet live on the App Store and Play Store, which uses RabbitMQ for job queues/notifications/webhooks and Kafka for transaction event streams.
- Microservices & containers: I ship Dockerized services (multi-stage builds) in production, including an LLM/RAG pipeline backend currently powering a live product.
- Databases: PostgreSQL daily (schema design, query optimization); working experience with NoSQL stores.
- WebSockets: built real-time features in production, including live vote tallying for a digital election platform.
- SDLC & quality: unit/integration testing, code reviews, Git + CI/CD across 200+ shipped projects; several systems maintained live for 12-16 months.
- PHP: my early professional years were PHP-based, so I am comfortable maintaining PHP code.

I hold a B.Eng. in Informatics Engineering (GPA 3.92, Best Graduate of the Faculty of Engineering) and am currently pursuing an M.Sc. at Universitas Hasanuddin. I work comfortably in English, fully remote, and can start immediately.

My CV is attached. Portfolio highlights: fintech app live on both app stores (Saku Sultan), enterprise dashboard in production (simtekmu.teknik.unismuh.ac.id), and FastAPI/LLM backends. I would welcome the chance to discuss how I can contribute to your team.

Best regards,
Andi Agung Dwi Arya
GitHub: github.com/devnolife
Email: andi_agung@student.unismuh.ac.id
Location: Makassar, Indonesia (remote)`;

(async () => {
  await withPage(async (_p, ctx) => {
    const page = await ctx.newPage();
    await page.goto("https://mail.google.com/mail/u/0/#inbox?compose=new", { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(8000);

    // Tunggu dialog compose
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

    // Attach CV via hidden file input
    const fileInput = page.locator('input[type="file"]').last();
    await fileInput.setInputFiles(CV);
    console.log("Menunggu upload attachment...");
    await sleep(12000);

    // Paksa save draft: Ctrl+S lalu tutup compose (Gmail auto-save saat close)
    await page.keyboard.press("Control+s");
    await sleep(3000);
    await page.screenshot({ path: "C:/Users/devno/.copilot/session-state/aaf576fe-7e2c-46f5-abba-d2403e09df74/files/gmail-draft.png" });

    const hasAttach = await page.locator('div[aria-label*="resume.pdf" i], span:has-text("resume.pdf")').count();
    console.log("Attachment terdeteksi di compose:", hasAttach > 0 ? "YA" : "CEK MANUAL");
    console.log("Draft dibuat. JANGAN dikirim otomatis (apply_mode=manual).");
    await page.close();
  });
})().catch((e) => { console.error("ERR:", e.message); process.exit(1); });
