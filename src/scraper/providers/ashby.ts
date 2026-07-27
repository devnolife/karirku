/**
 * Ashby provider — hit endpoint posting-api publik.
 * Port dari career-ops/providers/ashby.mjs (TS + allowlist SSRF).
 */

import type { HttpCtx, PortalEntry, Provider, RawListing } from "./types.js";
import { cleanRichText } from "../../html.js";

const ALLOWED_HOSTS = new Set(["api.ashbyhq.com"]);

function assertHost(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`ashby: invalid URL: ${url}`);
  }
  if (parsed.protocol !== "https:") throw new Error(`ashby: URL must use HTTPS: ${url}`);
  if (!ALLOWED_HOSTS.has(parsed.hostname))
    throw new Error(`ashby: untrusted hostname "${parsed.hostname}"`);
  return url;
}

function resolveApiUrl(entry: PortalEntry): string | null {
  const url = entry.careersUrl ?? "";
  const match = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)/);
  if (!match) return null;
  return `https://api.ashbyhq.com/posting-api/job-board/${match[1]}?includeCompensation=true`;
}

interface AshbyJob {
  id?: string;
  title?: string;
  jobUrl?: string;
  location?: string;
  employmentType?: string;
  isRemote?: boolean;
  publishedAt?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
}

function inferType(job: AshbyJob): RawListing["type"] {
  const value = `${job.location ?? ""} ${job.employmentType ?? ""}`.toLowerCase();
  if (value.includes("part-time") || value.includes("part time")) return "parttime";
  if (value.includes("contract")) return "contract";
  if (value.includes("hybrid")) return "hybrid";
  if (job.isRemote || value.includes("remote")) return "remote";
  if (value.includes("on-site") || value.includes("onsite")) return "onsite";
  return "fulltime";
}

const provider: Provider = {
  id: "ashby",

  detect(entry) {
    const apiUrl = resolveApiUrl(entry);
    return apiUrl ? { url: apiUrl } : null;
  },

  async fetch(entry: PortalEntry, ctx: HttpCtx): Promise<RawListing[]> {
    const apiUrl = resolveApiUrl(entry);
    if (!apiUrl) throw new Error(`ashby: cannot derive API URL for ${entry.name}`);
    assertHost(apiUrl);
    const json = (await ctx.fetchJson(apiUrl, { redirect: "error" })) as { jobs?: AshbyJob[] };
    const jobs = Array.isArray(json?.jobs) ? json.jobs : [];
    return jobs
      .filter((j) => j.jobUrl)
      .map((j) => {
        const description = cleanRichText(j.descriptionHtml ?? j.descriptionPlain ?? "");
        return {
          title: (j.title ?? "").trim(),
          url: j.jobUrl as string,
          ...(j.id ? { externalId: j.id } : {}),
          company: entry.name,
          location: j.location ?? "",
          type: inferType(j),
          ...(description ? { description } : {}),
          ...(j.publishedAt ? { postedAt: j.publishedAt } : {}),
        };
      });
  },
};

export default provider;
