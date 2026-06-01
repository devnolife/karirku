/**
 * Enqueue satu job scrape ke BullMQ scraperQueue.
 *
 * Run: pnpm scan
 *
 * Memakai DEFAULT_PORTALS (src/lib/scraper/portals.ts). Worker (`pnpm worker`)
 * yang akan benar-benar memproses: scan portal → dedupe → push ke enrich queue.
 * Prereq: Redis berjalan (REDIS_URL).
 */
import "dotenv/config";
import { scraperQueue } from "@/lib/queue";
import { DEFAULT_PORTALS } from "@/lib/scraper/portals";

async function main() {
  const enabled = DEFAULT_PORTALS.filter((p) => p.enabled !== false);
  if (enabled.length === 0) {
    console.warn(
      "⚠ Tidak ada portal yang enabled di src/lib/scraper/portals.ts. " +
        "Set enabled: true pada minimal satu entry.",
    );
  }

  const job = await scraperQueue.add("scan-portals", { portals: DEFAULT_PORTALS });
  console.log(`✅ Enqueued scrape job ${job.id} (${enabled.length} portal aktif).`);
  console.log("   Jalankan `pnpm worker` untuk memprosesnya.");

  await scraperQueue.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ gagal enqueue:", err);
  process.exit(1);
});
