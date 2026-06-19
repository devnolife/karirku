/**
 * Generate embeddings (768d, nomic-embed-text) untuk semua row yang belum punya
 * embedding: jobs, courses, profiles. Idempotent — hanya proses yang NULL.
 *
 * Run: pnpm embed:all
 * Prereq: Ollama jalan + model AI_MODEL_EMBED ter-pull. DATABASE_URL valid.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

type Table = "jobs" | "courses" | "profiles";

const CONCURRENCY = 4;

async function main() {
  const { prisma } = await import("@/lib/db");
  const { handleEmbed } = await import("@/server/workers/handlers/embed");

  const tables: Table[] = ["jobs", "courses", "profiles"];
  let totalDone = 0;
  let totalFail = 0;

  for (const table of tables) {
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM ${table} WHERE embedding IS NULL`,
    );
    if (rows.length === 0) {
      console.log(`✓ ${table}: sudah lengkap (0 yang kosong)`);
      continue;
    }
    console.log(`→ ${table}: generate ${rows.length} embedding...`);

    let done = 0;
    let fail = 0;
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const batch = rows.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((r) => handleEmbed({ table, id: r.id })),
      );
      for (const res of results) {
        if (res.status === "fulfilled") done += 1;
        else {
          fail += 1;
          if (fail <= 3) console.warn(`  ⚠ gagal: ${res.reason}`);
        }
      }
      process.stdout.write(`\r  ${table}: ${done + fail}/${rows.length} (ok=${done} fail=${fail})`);
    }
    process.stdout.write("\n");
    totalDone += done;
    totalFail += fail;
  }

  // Ringkasan akhir.
  for (const table of ["jobs", "courses", "profiles"] as const) {
    const [{ n }] = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(
      `SELECT count(*)::bigint AS n FROM ${table} WHERE embedding IS NOT NULL`,
    );
    console.log(`✅ ${table}: ${Number(n)} row ber-embedding`);
  }
  console.log(`\nSelesai — ok=${totalDone} fail=${totalFail}`);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ embed:all gagal:", err);
  process.exit(1);
});
