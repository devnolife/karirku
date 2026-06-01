/**
 * Greenhouse provider — hit endpoint JSON publik boards-api.
 * Port dari career-ops/providers/greenhouse.mjs (TS + allowlist SSRF dipertahankan).
 */

import type { HttpCtx, PortalEntry, Provider, RawListing } from "./types";

const ALLOWED_HOSTS = new Set([
  "boards-api.greenhouse.io",
  "boards.greenhouse.io",
  "job-boards.greenhouse.io",
  "job-boards.eu.greenhouse.io",
]);

function assertGreenhouseUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`greenhouse: invalid URL: ${url}`);
  }
  if (parsed.protocol !== "https:") throw new Error(`greenhouse: URL must use HTTPS: ${url}`);
  if (!ALLOWED_HOSTS.has(parsed.hostname))
    throw new Error(
      `greenhouse: untrusted hostname "${parsed.hostname}" — must be one of: ${[...ALLOWED_HOSTS].join(", ")}`,
    );
  return url;
}

function resolveApiUrl(entry: PortalEntry): string | null {
  if (entry.api) {
    assertGreenhouseUrl(entry.api);
    return entry.api;
  }
  const url = entry.careersUrl ?? "";
  const match = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (match) return `https://boards-api.greenhouse.io/v1/boards/${match[1]}/jobs`;
  return null;
}

interface GreenhouseJob {
  title?: string;
  absolute_url?: string;
  location?: { name?: string };
}

const provider: Provider = {
  id: "greenhouse",

  detect(entry) {
    try {
      const apiUrl = resolveApiUrl(entry);
      return apiUrl ? { url: apiUrl } : null;
    } catch {
      return null;
    }
  },

  async fetch(entry: PortalEntry, ctx: HttpCtx): Promise<RawListing[]> {
    const apiUrl = resolveApiUrl(entry);
    if (!apiUrl) throw new Error(`greenhouse: cannot derive API URL for ${entry.name}`);
    assertGreenhouseUrl(apiUrl);
    // redirect:'error' mencegah SSRF lewat redirect server-side; dikombinasi
    // dengan allowlist di atas, hostname final dijamin tetap tepercaya.
    const json = (await ctx.fetchJson(apiUrl, { redirect: "error" })) as { jobs?: GreenhouseJob[] };
    const jobs = Array.isArray(json?.jobs) ? json.jobs : [];
    return jobs
      .filter((j) => j.absolute_url)
      .map((j) => ({
        title: (j.title ?? "").trim(),
        url: j.absolute_url as string,
        company: entry.name,
        location: j.location?.name ?? "",
      }));
  },
};

export default provider;
