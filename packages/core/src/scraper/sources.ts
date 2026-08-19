import { prisma } from "../db.js";
import type { PortalEntry, ScanResult } from "./providers/index.js";
import { DEFAULT_JOB_SOURCE_SEEDS, fallbackPortals } from "./source-seed.js";

type JobSourceRow = {
  id: string;
  name: string;
  provider: string;
  careersUrl: string;
  region: string | null;
  enabled: boolean;
  config: unknown;
};

export type PortalRegistryResult = {
  portals: PortalEntry[];
  origin: "database" | "fallback";
  fallbackReason?: string;
};

function configApi(config: unknown): string | undefined {
  if (!config || typeof config !== "object" || Array.isArray(config)) return undefined;
  const api = (config as Record<string, unknown>).api;
  return typeof api === "string" && api.trim() ? api.trim() : undefined;
}

export function jobSourceToPortalEntry(source: JobSourceRow): PortalEntry {
  const api = configApi(source.config);
  return {
    jobSourceId: source.id,
    name: source.name,
    provider: source.provider,
    careersUrl: source.careersUrl,
    region: source.region,
    enabled: source.enabled,
    ...(api ? { api } : {}),
  };
}

async function bootstrapDefaultSources(): Promise<void> {
  await Promise.all(
    DEFAULT_JOB_SOURCE_SEEDS.map((source) =>
      prisma.jobSource.upsert({
        where: { careersUrl: source.careersUrl },
        create: {
          name: source.name,
          provider: source.provider,
          careersUrl: source.careersUrl,
          region: source.region,
          enabled: source.enabled,
        },
        update: {
          name: source.name,
          provider: source.provider,
          region: source.region,
        },
      }),
    ),
  );
}

/**
 * Load the authoritative registry. An empty table is bootstrapped once; an
 * intentionally all-disabled registry remains empty. In-memory defaults are
 * used only when the database itself is unavailable.
 */
export async function loadEnabledPortalRegistry(): Promise<PortalRegistryResult> {
  try {
    let sources = await prisma.jobSource.findMany({
      orderBy: [{ name: "asc" }, { careersUrl: "asc" }],
    });
    if (sources.length === 0) {
      await bootstrapDefaultSources();
      sources = await prisma.jobSource.findMany({
        orderBy: [{ name: "asc" }, { careersUrl: "asc" }],
      });
    }
    return {
      portals: sources.filter((source) => source.enabled).map(jobSourceToPortalEntry),
      origin: "database",
    };
  } catch (error) {
    return {
      portals: fallbackPortals(),
      origin: "fallback",
      fallbackReason: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Persist health fields for DB-backed entries without affecting fallback runs. */
export async function recordSourceScanResults(
  results: ScanResult[],
  scannedAt = new Date(),
): Promise<void> {
  const updates = results.flatMap((result) => {
    const id = result.entry.jobSourceId;
    if (!id) return [];
    return [
      prisma.jobSource.updateMany({
        where: { id },
        data: result.error
          ? {
              lastScanAt: scannedAt,
              lastError: result.error,
            }
          : {
              lastScanAt: scannedAt,
              lastSuccessAt: scannedAt,
              lastError: null,
            },
      }),
    ];
  });
  await Promise.all(updates);
}
