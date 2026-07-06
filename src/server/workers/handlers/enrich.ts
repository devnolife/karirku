/**
 * Handler enrich-listing: dipanggil scraperWorker → runScrape → enrichQueue.
 *
 * Payload = listing mentah dari provider ({source, sourceUrl, title, company,
 * location}). Handler:
 *  1. Upsert Job dari listing (idempotent by sourceUrl).
 *  2. Ekstraksi skill via AI (extractJobSkills) dari teks yang tersedia.
 *  3. Resolve ke SkillTaxonomy (alias-aware), simpan job.skills + level.
 *  4. Enqueue embed.
 *
 * Best-effort untuk AI: kalau ekstraksi gagal, job tetap tersimpan (skills
 * dikosongkan) dan embed tetap di-enqueue agar pipeline tidak macet.
 */
import { prisma } from "@/lib/db";
import { embedQueue } from "@/lib/queue";
import { extractJobSkills } from "@/lib/ai/extractors";
import { findOrCreateSkills } from "@/lib/skills/taxonomy";

export interface EnrichListingData {
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
}

export async function handleEnrichListing(data: EnrichListingData): Promise<void> {
  // 1. Upsert job (idempotent by sourceUrl).
  const job = await prisma.job.upsert({
    where: { sourceUrl: data.sourceUrl },
    create: {
      source: data.source,
      sourceUrl: data.sourceUrl,
      title: data.title,
      company: data.company || null,
      location: data.location || null,
      requirements: [],
      skills: [],
      isActive: true,
      postedAt: new Date(),
    },
    update: {
      title: data.title,
      company: data.company || null,
      location: data.location || null,
    },
  });

  // 2+3. AI extract skills (best-effort) → taxonomy → simpan.
  try {
    const extraction = await extractJobSkills({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
    });
    if (extraction.skills.length > 0) {
      const skills = await findOrCreateSkills(extraction.skills);
      await prisma.job.update({
        where: { id: job.id },
        data: {
          skills: skills.map((s) => s.name),
          level: extraction.level ?? job.level ?? undefined,
        },
      });
    }
  } catch (err) {
    console.warn(`[enrich] AI extract gagal untuk job ${job.id}:`, err instanceof Error ? err.message : err);
  }

  // 4. Enqueue embed.
  await embedQueue.add("embed-job", { table: "jobs", id: job.id });
}
