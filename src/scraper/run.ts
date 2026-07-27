/**
 * Orkestrasi scan portal → dedupe → push ke enrich queue.
 *
 * Dipanggil oleh scraperWorker (BullMQ). Provider hanya menghasilkan listing
 * mentah; di sinilah listing yang belum ada di DB diteruskan ke pipeline
 * enrichment (normalisasi + ekstraksi skill + simpan ke Prisma).
 */

import { createHash } from "node:crypto";
import { prisma } from "../db.js";
import { enrichQueue } from "../queue/index.js";
import { scanPortals, type PortalEntry, type RawListing } from "./providers/index.js";
import {
  canonicalJobUrl,
  computeListingContentHash,
  EXTRACTION_VERSION,
  scoreListingQuality,
} from "./listing-metadata.js";
import {
  loadEnabledPortalRegistry,
  recordSourceScanResults,
} from "./sources.js";

export interface ScrapeJobData {
  /** Explicit entries are supported for focused runs/tests; workers default to DB registry. */
  portals?: PortalEntry[];
}

export interface ScrapeRunSummary {
  scanned: number;
  found: number;
  enqueued: number;
  duplicates: number;
  deactivated: number;
  errors: { portal: string; message: string }[];
}

/** Bentuk payload yang diteruskan ke enrich queue per listing. */
export interface EnrichJobData {
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  jobSourceId?: string;
  sourceExternalId?: string;
  description?: string;
  requirements?: string[];
  type?: RawListing["type"];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedAt?: string;
  contentHash: string;
  extractionVersion: string;
  dataQualityScore: number;
}

export function toEnrichData(
  source: string,
  entry: PortalEntry,
  listing: RawListing,
): EnrichJobData {
  const sourceUrl = canonicalJobUrl(listing.url);
  const metadata = {
    sourceUrl,
    title: listing.title,
    company: listing.company,
    location: listing.location,
    description: listing.description,
    requirements: listing.requirements,
    type: listing.type,
    salaryMin: listing.salaryMin,
    salaryMax: listing.salaryMax,
    currency: listing.currency,
    postedAt: listing.postedAt,
  };
  return {
    source,
    sourceUrl,
    title: listing.title,
    company: listing.company,
    location: listing.location,
    ...(entry.jobSourceId ? { jobSourceId: entry.jobSourceId } : {}),
    ...(listing.externalId
      ? { sourceExternalId: listing.externalId }
      : {}),
    ...(listing.description !== undefined ? { description: listing.description } : {}),
    ...(listing.requirements !== undefined ? { requirements: listing.requirements } : {}),
    ...(listing.type !== undefined ? { type: listing.type } : {}),
    ...(listing.salaryMin !== undefined ? { salaryMin: listing.salaryMin } : {}),
    ...(listing.salaryMax !== undefined ? { salaryMax: listing.salaryMax } : {}),
    ...(listing.currency !== undefined ? { currency: listing.currency } : {}),
    ...(listing.postedAt !== undefined ? { postedAt: listing.postedAt } : {}),
    contentHash: computeListingContentHash(metadata),
    extractionVersion: EXTRACTION_VERSION,
    dataQualityScore: scoreListingQuality(metadata).score,
  };
}

export async function runScrape(data: ScrapeJobData = {}): Promise<ScrapeRunSummary> {
  const registry = data.portals
    ? { portals: data.portals, origin: "payload" as const }
    : await loadEnabledPortalRegistry();
  const portals = registry.portals;
  if (registry.origin === "fallback") {
    console.warn(`[scraper] JobSource registry unavailable; using deterministic fallback: ${registry.fallbackReason}`);
  }
  const results = await scanPortals(portals);
  try {
    await recordSourceScanResults(results);
  } catch (error) {
    console.warn(
      "[scraper] gagal menyimpan status JobSource:",
      error instanceof Error ? error.message : error,
    );
  }

  const summary: ScrapeRunSummary = {
    scanned: results.length,
    found: 0,
    enqueued: 0,
    duplicates: 0,
    deactivated: 0,
    errors: [],
  };

  for (const result of results) {
    if (result.error) {
      summary.errors.push({ portal: result.entry.name, message: result.error });
      continue;
    }
    for (const listing of result.listings) {
      summary.found += 1;
      const enrichData = toEnrichData(result.provider, result.entry, listing);
      const existing = await prisma.job.findFirst({
        where: {
          OR: [
            { sourceUrl: enrichData.sourceUrl },
            ...(enrichData.jobSourceId && enrichData.sourceExternalId
              ? [
                  {
                    jobSourceId: enrichData.jobSourceId,
                    sourceExternalId: enrichData.sourceExternalId,
                  },
                ]
              : []),
          ],
        },
        select: { id: true, contentHash: true, extractionVersion: true },
      });
      if (existing) {
        await prisma.job.update({
          where: { id: existing.id },
          data: {
            lastSeenAt: new Date(),
            isActive: true,
            ...(enrichData.jobSourceId ? { jobSourceId: enrichData.jobSourceId } : {}),
            ...(enrichData.sourceExternalId
              ? { sourceExternalId: enrichData.sourceExternalId }
              : {}),
          },
        });
      }
      if (
        existing?.contentHash === enrichData.contentHash &&
        existing.extractionVersion === enrichData.extractionVersion
      ) {
        summary.duplicates += 1;
        continue;
      }
      await enrichQueue.add("enrich-listing", enrichData, {
        // jobId stabil dari URL → idempotent (BullMQ tolak duplikat jobId).
        jobId: createHash("sha1")
          .update(
            enrichData.jobSourceId && enrichData.sourceExternalId
              ? `${enrichData.jobSourceId}:${enrichData.sourceExternalId}`
              : enrichData.sourceUrl,
          )
          .digest("hex"),
        removeOnComplete: true,
        removeOnFail: 100,
      });
      summary.enqueued += 1;
    }

    // Only a successful, registry-backed full scan may deactivate missing
    // listings. Failed scans never change availability.
    if (result.entry.jobSourceId && result.listings.length > 0) {
      const urls = result.listings.map((listing) =>
        canonicalJobUrl(listing.url),
      );
      const externalIds = result.listings.flatMap((listing) =>
        listing.externalId ? [listing.externalId] : [],
      );
      const deactivated = await prisma.job.updateMany({
        where: {
          jobSourceId: result.entry.jobSourceId,
          isActive: true,
          OR: [
            {
              sourceExternalId: { not: null },
              ...(externalIds.length
                ? { sourceExternalId: { notIn: externalIds } }
                : {}),
            },
            {
              sourceExternalId: null,
              ...(urls.length ? { sourceUrl: { notIn: urls } } : {}),
            },
          ],
        },
        data: { isActive: false },
      });
      summary.deactivated += deactivated.count;
    }
  }

  return summary;
}
