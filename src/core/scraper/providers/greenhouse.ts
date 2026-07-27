/**
 * Greenhouse provider — hit endpoint JSON publik boards-api.
 * Port dari career-ops/providers/greenhouse.mjs (TS + allowlist SSRF dipertahankan).
 */

import type { HttpCtx, PortalEntry, Provider, RawListing } from "./types";
import { cleanRichText } from "@/core/html";

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
    const url = new URL(entry.api);
    url.searchParams.set("content", "true");
    return url.toString();
  }
  const url = entry.careersUrl ?? "";
  const match = url.match(/job-boards(?:\.eu)?\.greenhouse\.io\/([^/?#]+)/);
  if (match) return `https://boards-api.greenhouse.io/v1/boards/${match[1]}/jobs?content=true`;
  return null;
}

interface GreenhouseJob {
  id?: number;
  title?: string;
  absolute_url?: string;
  location?: { name?: string };
  content?: string;
  first_published?: string;
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
      .map((j) => {
        const description = cleanRichText(j.content ?? "");
        return {
          title: (j.title ?? "").trim(),
          url: j.absolute_url as string,
          ...(j.id !== undefined ? { externalId: String(j.id) } : {}),
          company: entry.name,
          location: j.location?.name ?? "",
          ...(description ? { description } : {}),
          ...(j.first_published ? { postedAt: j.first_published } : {}),
        };
      });
  },
};

export default provider;
