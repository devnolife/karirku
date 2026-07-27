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
import { prisma } from "@/core/db";
import type { Prisma } from "@prisma/client";
import { embedQueue } from "@/core/queue";
import { extractJobSkills } from "@/core/ai/extractors";
import { findOrCreateSkills } from "@/core/skills/taxonomy";
import {
  computeListingContentHash,
  EXTRACTION_VERSION,
  scoreListingQuality,
} from "@/core/scraper/listing-metadata";

export interface EnrichListingData {
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  jobSourceId?: string;
  sourceExternalId?: string;
  description?: string;
  requirements?: string[];
  type?: "fulltime" | "parttime" | "contract" | "remote" | "hybrid" | "onsite";
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedAt?: string;
  contentHash?: string;
  extractionVersion?: string;
  dataQualityScore?: number;
}

export async function handleEnrichListing(data: EnrichListingData): Promise<void> {
  const description = data.description?.trim();
  const requirements = data.requirements?.map((item) => item.trim()).filter(Boolean);
  const salaryMin = validSalary(data.salaryMin);
  const salaryMax = validSalary(data.salaryMax);
  const postedAt = validDate(data.postedAt);
  const currency = validCurrency(data.currency);
  const metadataInput = {
    sourceUrl: data.sourceUrl,
    title: data.title,
    company: data.company,
    location: data.location,
    description,
    requirements,
    type: data.type,
    salaryMin,
    salaryMax,
    currency,
    postedAt,
  };
  const computedHash = computeListingContentHash(metadataInput);
  const quality = scoreListingQuality(metadataInput).score;
  const contentHash = data.contentHash === computedHash ? data.contentHash : computedHash;
  const extractionVersion = data.extractionVersion?.trim() || EXTRACTION_VERSION;
  const dataQualityScore = Number.isInteger(data.dataQualityScore)
    ? Math.max(0, Math.min(100, data.dataQualityScore as number))
    : quality;
  const seenAt = new Date();
  const where: Prisma.JobWhereUniqueInput =
    data.jobSourceId && data.sourceExternalId
      ? {
          jobSourceId_sourceExternalId: {
            jobSourceId: data.jobSourceId,
            sourceExternalId: data.sourceExternalId,
          },
        }
      : { sourceUrl: data.sourceUrl };

  // 1. Upsert job (idempotent by sourceUrl).
  const job = await prisma.job.upsert({
    where,
    create: {
      source: data.source,
      sourceUrl: data.sourceUrl,
      jobSourceId: data.jobSourceId ?? null,
      sourceExternalId: data.sourceExternalId ?? null,
      title: data.title,
      company: data.company || null,
      location: data.location || null,
      type: data.type ?? null,
      description: description || null,
      requirements: requirements ?? [],
      skills: [],
      isActive: true,
      postedAt,
      lastSeenAt: seenAt,
      contentHash,
      extractionVersion,
      dataQualityScore,
      ...(salaryMin !== undefined ? { salaryMin } : {}),
      ...(salaryMax !== undefined ? { salaryMax } : {}),
      ...(currency ? { currency } : {}),
    },
    update: {
      source: data.source,
      sourceUrl: data.sourceUrl,
      title: data.title,
      company: data.company || null,
      location: data.location || null,
      isActive: true,
      lastSeenAt: seenAt,
      contentHash,
      extractionVersion,
      dataQualityScore,
      ...(data.jobSourceId ? { jobSourceId: data.jobSourceId } : {}),
      ...(data.sourceExternalId
        ? { sourceExternalId: data.sourceExternalId }
        : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.description !== undefined ? { description: description || null } : {}),
      ...(data.requirements !== undefined ? { requirements: requirements ?? [] } : {}),
      ...(salaryMin !== undefined ? { salaryMin } : {}),
      ...(salaryMax !== undefined ? { salaryMax } : {}),
      ...(currency ? { currency } : {}),
      ...(postedAt ? { postedAt } : {}),
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

function validSalary(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value);
}

function validDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function validCurrency(value: string | undefined): string | undefined {
  const currency = value?.trim().toUpperCase();
  return currency && /^[A-Z]{3,10}$/.test(currency) ? currency : undefined;
}
