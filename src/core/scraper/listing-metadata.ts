import { createHash } from "node:crypto";

export const EXTRACTION_VERSION = "registry-enrich-v1";

export interface ListingMetadataInput {
  sourceUrl: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  requirements?: string[];
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedAt?: string | Date;
}

export type QualityBreakdown = {
  title: number;
  sourceUrl: number;
  company: number;
  location: number;
  description: number;
  requirements: number;
  salary: number;
  postedAt: number;
};

export function normalizeListingText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

const TRACKING_PARAM = /^(utm_[a-z]+|gh_src|source|ref|referrer)$/i;

/** Canonical identity URL: strip fragments and known tracking parameters. */
export function canonicalJobUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAM.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function stableNumber(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : null;
}

function stableDate(value: string | Date | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** SHA-256 over a fixed-key, normalized representation of listing content. */
export function computeListingContentHash(input: ListingMetadataInput): string {
  const requirements = [...new Set((input.requirements ?? []).map(normalizeListingText).filter(Boolean))]
    .sort(compareText);
  const canonical = {
    title: normalizeListingText(input.title),
    company: normalizeListingText(input.company),
    location: normalizeListingText(input.location),
    description: normalizeListingText(input.description),
    requirements,
    type: normalizeListingText(input.type),
    salaryMin: stableNumber(input.salaryMin),
    salaryMax: stableNumber(input.salaryMax),
    currency: normalizeListingText(input.currency),
    postedAt: stableDate(input.postedAt),
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

function hasValidSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function scoreListingQuality(input: ListingMetadataInput): {
  score: number;
  breakdown: QualityBreakdown;
} {
  const descriptionLength = normalizeListingText(input.description).length;
  const requirements = (input.requirements ?? []).filter((item) => normalizeListingText(item));
  const hasMin = stableNumber(input.salaryMin) !== null;
  const hasMax = stableNumber(input.salaryMax) !== null;

  const breakdown: QualityBreakdown = {
    title: normalizeListingText(input.title) ? 20 : 0,
    sourceUrl: hasValidSourceUrl(input.sourceUrl) ? 15 : 0,
    company: normalizeListingText(input.company) ? 15 : 0,
    location: normalizeListingText(input.location) ? 10 : 0,
    description: descriptionLength >= 300 ? 20 : descriptionLength >= 80 ? 12 : descriptionLength > 0 ? 5 : 0,
    requirements: requirements.length >= 3 ? 10 : requirements.length > 0 ? 5 : 0,
    salary: hasMin && hasMax ? 5 : hasMin || hasMax ? 3 : 0,
    postedAt: stableDate(input.postedAt) ? 5 : 0,
  };
  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return { score: Math.max(0, Math.min(100, score)), breakdown };
}
