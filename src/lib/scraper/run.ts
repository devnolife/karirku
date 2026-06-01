/**
 * Orkestrasi scan portal → dedupe → push ke enrich queue.
 *
 * Dipanggil oleh scraperWorker (BullMQ). Provider hanya menghasilkan listing
 * mentah; di sinilah listing yang belum ada di DB diteruskan ke pipeline
 * enrichment (normalisasi + ekstraksi skill + simpan ke Prisma).
 */

import { createHash } from "node:crypto";
import { enrichQueue } from "@/lib/queue";
import { isDuplicate } from "./base";
import { scanPortals, type PortalEntry, type RawListing } from "./providers";

export interface ScrapeJobData {
  portals: PortalEntry[];
}

export interface ScrapeRunSummary {
  scanned: number;
  found: number;
  enqueued: number;
  duplicates: number;
  errors: { portal: string; message: string }[];
}

/** Bentuk payload yang diteruskan ke enrich queue per listing. */
export interface EnrichJobData {
  source: string;
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
}

function toEnrichData(source: string, listing: RawListing): EnrichJobData {
  return {
    source,
    sourceUrl: listing.url,
    title: listing.title,
    company: listing.company,
    location: listing.location,
  };
}

export async function runScrape(data: ScrapeJobData): Promise<ScrapeRunSummary> {
  const portals = data.portals ?? [];
  const results = await scanPortals(portals);

  const summary: ScrapeRunSummary = {
    scanned: results.length,
    found: 0,
    enqueued: 0,
    duplicates: 0,
    errors: [],
  };

  for (const result of results) {
    if (result.error) {
      summary.errors.push({ portal: result.entry.name, message: result.error });
      continue;
    }
    for (const listing of result.listings) {
      summary.found += 1;
      if (await isDuplicate(listing.url)) {
        summary.duplicates += 1;
        continue;
      }
      await enrichQueue.add("enrich-listing", toEnrichData(result.provider, listing), {
        // jobId stabil dari URL → idempotent (BullMQ tolak duplikat jobId).
        jobId: createHash("sha1").update(listing.url).digest("hex"),
        removeOnComplete: true,
        removeOnFail: 100,
      });
      summary.enqueued += 1;
    }
  }

  return summary;
}
