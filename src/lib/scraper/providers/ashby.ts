/**
 * Ashby provider — hit endpoint posting-api publik.
 * Port dari career-ops/providers/ashby.mjs (TS + allowlist SSRF).
 */

import type { HttpCtx, PortalEntry, Provider, RawListing } from "./types";

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
  title?: string;
  jobUrl?: string;
  location?: string;
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
      .map((j) => ({
        title: (j.title ?? "").trim(),
        url: j.jobUrl as string,
        company: entry.name,
        location: j.location ?? "",
      }));
  },
};

export default provider;
