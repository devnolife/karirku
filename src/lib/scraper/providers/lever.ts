/**
 * Lever provider — hit endpoint postings publik.
 * Port dari career-ops/providers/lever.mjs (TS + allowlist SSRF).
 */

import type { HttpCtx, PortalEntry, Provider, RawListing } from "./types";

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
  text?: string;
  hostedUrl?: string;
  categories?: { location?: string };
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
      .map((j) => ({
        title: (j.text ?? "").trim(),
        url: j.hostedUrl as string,
        company: entry.name,
        location: j.categories?.location ?? "",
      }));
  },
};

export default provider;
