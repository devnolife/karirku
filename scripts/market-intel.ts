/**
 * Enqueue exactly one daily market-intelligence aggregation.
 *
 * Run: pnpm market:intel
 * Historical dates are intentionally unsupported until as-of job lifecycle
 * history exists; backdating current jobs would create false trends.
 */
import "dotenv/config";
import { marketIntelQueue } from "@/lib/queue";

async function main(): Promise<void> {
  if (process.argv.slice(2).length) {
    throw new Error("market:intel tidak menerima tanggal historis");
  }
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const jobId = `market-intel-${snapshotDate}`;
  const existing = await marketIntelQueue.getJob(jobId);
  if (existing) {
    const state = await existing.getState();
    if (state === "failed") {
      await existing.remove();
    } else {
      console.log(`ℹ️ Market-intel ${snapshotDate} already queued (${state}); no-op.`);
      return;
    }
  }

  const job = await marketIntelQueue.add(
    "aggregate-daily",
    { snapshotDate },
    {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: { age: 120 * 86_400, count: 180 },
      removeOnFail: { age: 120 * 86_400, count: 180 },
    },
  );
  console.log(`✅ Enqueued market-intel job ${job.id} for ${snapshotDate}.`);
  console.log("   Jalankan `pnpm worker` untuk memprosesnya.");
}

main()
  .catch((error) => {
    console.error("❌ gagal enqueue market-intel:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await marketIntelQueue.close();
    process.exit(process.exitCode ?? 0);
  });
