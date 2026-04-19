import { Worker } from "bullmq";
import { createQueueConnection } from "@/lib/redis";
import { QUEUE_NAMES } from "@/lib/queue";

/**
 * BullMQ workers entrypoint.
 *
 * Jalankan terpisah dari Next.js: `pnpm worker`.
 *
 * Untuk Sprint 1-2 ini workers hanya log — implementasi nyata
 * (scraper handler, enrichment AI call, embedding) di Sprint 3-4.
 */

const connection = createQueueConnection();

const scraperWorker = new Worker(
  QUEUE_NAMES.scraper,
  async (job) => {
    console.log(`[scraper] job ${job.id} — ${job.name}`, job.data);
    // TODO: dispatch ke module scraper sesuai job.data.source
  },
  { connection, concurrency: 1 }
);

const enrichWorker = new Worker(
  QUEUE_NAMES.enrich,
  async (job) => {
    console.log(`[enrich] job ${job.id}`, job.data);
    // TODO: normalize → AI extract skill → update DB
  },
  { connection, concurrency: 5 }
);

const embedWorker = new Worker(
  QUEUE_NAMES.embed,
  async (job) => {
    console.log(`[embed] job ${job.id}`, job.data);
    // TODO: call ai.embeddings + update row
  },
  { connection, concurrency: 10 }
);

const marketIntelWorker = new Worker(
  QUEUE_NAMES.marketIntel,
  async (job) => {
    console.log(`[market-intel] job ${job.id}`, job.data);
    // TODO: aggregate role stats
  },
  { connection, concurrency: 1 }
);

const workers = [scraperWorker, enrichWorker, embedWorker, marketIntelWorker];

for (const w of workers) {
  w.on("ready", () => console.log(`✅ worker ready: ${w.name}`));
  w.on("failed", (job, err) =>
    console.error(`❌ worker ${w.name} job ${job?.id} failed:`, err)
  );
}

const shutdown = async () => {
  console.log("\n🛑 Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  await connection.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("🚀 Karir.ai workers started. Press Ctrl+C to stop.");
