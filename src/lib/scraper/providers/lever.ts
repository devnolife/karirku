/**
 * Lever provider — hit endpoint postings publik.
 * Port dari career-ops/providers/lever.mjs (TS + allowlist SSRF).
 */

import type { HttpCtx, PortalEntry, Provider, RawListing } from "./types";
import { cleanRichText } from "@/lib/html";

const ALLOWED_HOSTS = new Set(["api.lever.co"]);

function assertHost(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`lever: invalid URL: ${url}`);
  }
  if (parsed.protocol !== "https:") throw new Error(`lever: URL must use HTTPS: ${url}`);
  if (!ALLOWED_HOSTS.has(parsed.hostname))
    throw new Error(`lever: untrusted hostname "${parsed.hostname}"`);
  return url;
}

function resolveApiUrl(entry: PortalEntry): string | null {
  const url = entry.careersUrl ?? "";
  const match = url.match(/jobs\.lever\.co\/([^/?#]+)/);
  if (!match) return null;
  return `https://api.lever.co/v0/postings/${match[1]}`;
}

interface LeverJob {
  id?: string;
  text?: string;
  hostedUrl?: string;
  categories?: { location?: string; commitment?: string };
  createdAt?: number;
  descriptionPlain?: string;
  description?: string;
  additionalPlain?: string;
  lists?: { text?: string; content?: string }[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    interval?: string;
  };
}

function inferType(location: string, commitment = ""): RawListing["type"] {
  const value = `${location} ${commitment}`.toLowerCase();
  if (value.includes("part-time") || value.includes("part time")) return "parttime";
  if (value.includes("contract")) return "contract";
  if (value.includes("hybrid")) return "hybrid";
  if (value.includes("remote")) return "remote";
  if (value.includes("on-site") || value.includes("onsite")) return "onsite";
  return "fulltime";
}

function salaryFields(job: LeverJob): Partial<RawListing> {
  const range = job.salaryRange;
  if (!range) return {};
  const interval = (range.interval ?? "").toLowerCase();
  if (/(hour|day|week)/.test(interval)) return {};
  const divisor = /(annual|year)/.test(interval) ? 12 : 1;
  const min = typeof range.min === "number" && range.min > 0 ? Math.round(range.min / divisor) : undefined;
  const max = typeof range.max === "number" && range.max > 0 ? Math.round(range.max / divisor) : undefined;
  if (min === undefined && max === undefined) return {};
  return {
    ...(min !== undefined ? { salaryMin: min } : {}),
    ...(max !== undefined ? { salaryMax: max } : {}),
    ...(range.currency ? { currency: range.currency.toUpperCase() } : {}),
  };
}

const provider: Provider = {
  id: "lever",

  detect(entry) {
    const apiUrl = resolveApiUrl(entry);
    return apiUrl ? { url: apiUrl } : null;
  },

  async fetch(entry: PortalEntry, ctx: HttpCtx): Promise<RawListing[]> {
    const apiUrl = resolveApiUrl(entry);
    if (!apiUrl) throw new Error(`lever: cannot derive API URL for ${entry.name}`);
    assertHost(apiUrl);
    const json = await ctx.fetchJson(apiUrl, { redirect: "error" });
    if (!Array.isArray(json)) return [];
    return (json as LeverJob[])
      .filter((j) => j.hostedUrl)
      .map((j) => {
        const location = j.categories?.location ?? "";
        const description = [
          cleanRichText(j.descriptionPlain ?? j.description ?? ""),
          ...(j.lists ?? []).map((list) =>
            [list.text?.trim(), cleanRichText(list.content ?? "")].filter(Boolean).join("\n"),
          ),
          cleanRichText(j.additionalPlain ?? ""),
        ]
          .filter(Boolean)
          .join("\n\n");
        return {
          title: (j.text ?? "").trim(),
          url: j.hostedUrl as string,
          ...(j.id ? { externalId: j.id } : {}),
          company: entry.name,
          location,
          type: inferType(location, j.categories?.commitment),
          ...(description ? { description } : {}),
          ...(typeof j.createdAt === "number" && Number.isFinite(j.createdAt)
            ? { postedAt: new Date(j.createdAt).toISOString() }
            : {}),
          ...salaryFields(j),
        };
      });
  },
};

export default provider;
