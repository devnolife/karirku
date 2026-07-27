import { Worker } from "bullmq";
import { createQueueConnection } from "@/core/redis";
import { QUEUE_NAMES } from "@/core/queue";
import { runScrape, type ScrapeJobData } from "@/core/scraper/run";
import { handleEmbed, type EmbedData } from "./handlers/embed";
import { handleEnrichListing, type EnrichListingData } from "./handlers/enrich";
import {
  handleMarketIntel,
  type MarketIntelJobData,
} from "./handlers/market-intel";

/**
 * BullMQ workers entrypoint.
 *
 * Jalankan terpisah dari Next.js: `pnpm worker`.
 *
 * Untuk Sprint 1-2 ini workers hanya log — implementasi nyata
 * (scraper handler, enrichment AI call, embedding) di Sprint 3-4.
 */

const connection = createQueueConnection();

const scraperWorker = new Worker<ScrapeJobData>(
  QUEUE_NAMES.scraper,
  async (job) => {
    console.log(`[scraper] job ${job.id} — ${job.name}`, job.data);
    const summary = await runScrape(job.data);
    console.log(
      `[scraper] job ${job.id} done — scanned=${summary.scanned} found=${summary.found} ` +
        `enqueued=${summary.enqueued} duplicates=${summary.duplicates} ` +
        `deactivated=${summary.deactivated} errors=${summary.errors.length}`,
    );
    if (summary.errors.length) {
      for (const e of summary.errors) console.warn(`[scraper]   ⚠ ${e.portal}: ${e.message}`);
    }
    return summary;
  },
  { connection, concurrency: 1 }
);

const enrichWorker = new Worker<EnrichListingData>(
  QUEUE_NAMES.enrich,
  async (job) => {
    console.log(`[enrich] job ${job.id} — ${job.data.title}`);
    await handleEnrichListing(job.data);
  },
  { connection, concurrency: 3 }
);

const embedWorker = new Worker<EmbedData>(
  QUEUE_NAMES.embed,
  async (job) => {
    console.log(`[embed] job ${job.id} — ${job.data.table}:${job.data.id}`);
    await handleEmbed(job.data);
  },
  { connection, concurrency: 4 }
);

const marketIntelWorker = new Worker<MarketIntelJobData>(
  QUEUE_NAMES.marketIntel,
  async (job) => {
    console.log(`[market-intel] job ${job.id}`, job.data);
    const summary = await handleMarketIntel(job.data);
    console.log(
      `[market-intel] job ${job.id} done — date=${summary.snapshotDate} ` +
        `jobs=${summary.jobs} groups=${summary.groups}`,
    );
    return summary;
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

console.log("🚀 CraftWorks workers started. Press Ctrl+C to stop.");
