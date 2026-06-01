/**
 * Provider registry + runner.
 *
 * Berbeda dengan career-ops yang memuat provider dari filesystem saat runtime,
 * di sini registry statis (eksplisit) supaya aman untuk bundler Next/Turbopack
 * dan ramah typecheck.
 */

import ashby from "./ashby";
import greenhouse from "./greenhouse";
import { makeHttpCtx } from "./http";
import lever from "./lever";
import type { PortalEntry, Provider, RawListing } from "./types";

export type { PortalEntry, Provider, RawListing } from "./types";

const PROVIDERS: Provider[] = [greenhouse, ashby, lever];

const BY_ID = new Map(PROVIDERS.map((p) => [p.id, p]));

/**
 * Pilih provider untuk sebuah entry: pakai `provider:` eksplisit kalau ada,
 * kalau tidak jalankan detect() tiap provider (urutan registry = prioritas).
 */
export function resolveProvider(entry: PortalEntry): Provider | null {
  if (entry.provider) return BY_ID.get(entry.provider) ?? null;
  for (const p of PROVIDERS) {
    if (p.detect(entry)) return p;
  }
  return null;
}

/** Tarik daftar lowongan untuk satu portal. Lempar kalau provider tak ketemu. */
export async function scanPortal(entry: PortalEntry): Promise<RawListing[]> {
  const provider = resolveProvider(entry);
  if (!provider) throw new Error(`scanPortal: no provider for "${entry.name}" (${entry.careersUrl ?? entry.api ?? "?"})`);
  return provider.fetch(entry, makeHttpCtx());
}

export interface ScanResult {
  entry: PortalEntry;
  provider: string;
  listings: RawListing[];
  error?: string;
}

/**
 * Scan banyak portal. Tidak melempar per-portal — error dikumpulkan di
 * `ScanResult.error` supaya satu portal rusak tidak menghentikan batch.
 * Listing dedupe lintas portal berdasarkan URL.
 */
export async function scanPortals(entries: PortalEntry[]): Promise<ScanResult[]> {
  const enabled = entries.filter((e) => e.enabled !== false);
  const results = await Promise.all(
    enabled.map(async (entry): Promise<ScanResult> => {
      const provider = resolveProvider(entry);
      if (!provider) {
        return { entry, provider: "", listings: [], error: "no provider matched" };
      }
      try {
        const listings = await provider.fetch(entry, makeHttpCtx());
        return { entry, provider: provider.id, listings };
      } catch (err) {
        return {
          entry,
          provider: provider.id,
          listings: [],
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }),
  );

  const seen = new Set<string>();
  for (const r of results) {
    r.listings = r.listings.filter((l) => {
      if (!l.url || seen.has(l.url)) return false;
      seen.add(l.url);
      return true;
    });
  }
  return results;
}
