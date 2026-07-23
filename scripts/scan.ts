/**
 * Enqueue satu job scrape ke BullMQ scraperQueue.
 *
 * Run: pnpm scan
 *
 * Sumber aktif dibaca dari registry JobSource. Worker (`pnpm worker`) membaca
 * ulang registry saat job diproses: scan portal → dedupe → push ke enrich queue.
 * Prereq: Redis berjalan (REDIS_URL).
 */
import "dotenv/config";
import { scraperQueue } from "@/lib/queue";
import { loadEnabledPortalRegistry } from "@/lib/scraper/sources";

async function main() {
  const registry = await loadEnabledPortalRegistry();
  if (registry.portals.length === 0) {
    console.warn("⚠ Registry JobSource tidak memiliki sumber aktif.");
  }
  if (registry.origin === "fallback") {
    console.warn(`⚠ DB registry tidak tersedia; fallback aktif: ${registry.fallbackReason}`);
  }

  const job = await scraperQueue.add("scan-portals", {});
  console.log(
    `✅ Enqueued scrape job ${job.id} (${registry.portals.length} sumber aktif; ${registry.origin}).`,
  );
  console.log("   Jalankan `pnpm worker` untuk memprosesnya.");

  await scraperQueue.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ gagal enqueue:", err);
  process.exit(1);
});
