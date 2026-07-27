/**
 * Firecrawl provider — scrape halaman karier perusahaan (HTML/JS-rendered)
 * via service FastAPI lokal (~/firecrawl-project) yang membungkus Firecrawl.
 *
 * Untuk career pages lokal tanpa JSON API (celah yang tidak bisa ditangani
 * provider greenhouse/lever/ashby). Entry portal cukup:
 *   { name: "PT Contoh", careersUrl: "https://contoh.co.id/karir", provider: "firecrawl" }
 *
 * Env: FIRECRAWL_SERVICE_URL (default http://localhost:8000)
 *
 * Ekstraksi listing dari markdown bersifat heuristik: ambil link yang path/teks-nya
 * mengindikasikan lowongan. Detail (deskripsi, salary) dilengkapi downstream
 * oleh enrich worker seperti listing sumber lain.
 */

import type { PortalEntry, Provider, RawListing } from "./types";

const SERVICE_URL = () =>
  process.env.FIRECRAWL_SERVICE_URL ?? "http://localhost:8000";

/** Pola path URL yang biasanya menunjuk detail lowongan. */
const JOB_PATH_RE =
  /\/(careers?|karir|jobs?|lowongan|vacanc(?:y|ies)|positions?|openings?)\/[^/?#]+/i;

/** Kata pada teks link yang menunjukkan judul lowongan (bukan nav umum). */
const NAV_NOISE_RE =
  /^(home|beranda|about|tentang|contact|kontak|login|apply now|lamar|karir|careers?|jobs?|lowongan|selengkapnya|read more|learn more|lihat semua)$/i;

interface ScrapeResponse {
  url: string;
  markdown: string | null;
  links: string[] | null;
}

/** Ekstrak kandidat lowongan dari link markdown `[teks](url)`. */
export function extractListingsFromMarkdown(
  markdown: string,
  baseUrl: string,
  company: string,
): RawListing[] {
  const seen = new Set<string>();
  const listings: RawListing[] = [];

  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(markdown)) !== null) {
    const text = m[1].replace(/[*_`#]/g, "").trim();
    let url: string;
    try {
      url = new URL(m[2], baseUrl).toString();
    } catch {
      continue;
    }

    if (!JOB_PATH_RE.test(new URL(url).pathname)) continue;
    if (text.length < 4 || text.length > 120) continue;
    if (NAV_NOISE_RE.test(text)) continue;
    if (seen.has(url)) continue;

    seen.add(url);
    listings.push({ title: text, url, company, location: "" });
  }
  return listings;
}

const provider: Provider = {
  id: "firecrawl",

  // Tidak ikut auto-detect — harus dipilih eksplisit via `provider: "firecrawl"`.
  detect() {
    return null;
  },

  async fetch(entry: PortalEntry): Promise<RawListing[]> {
    const careersUrl = entry.careersUrl;
    if (!careersUrl) throw new Error(`firecrawl: entry "${entry.name}" tanpa careersUrl`);

    const res = await fetch(`${SERVICE_URL()}/api/v1/firecrawl/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: careersUrl,
        formats: ["markdown", "links"],
        only_main_content: true,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      throw new Error(`firecrawl: service ${res.status} untuk ${careersUrl}`);
    }
    const data = (await res.json()) as ScrapeResponse;
    if (!data.markdown) return [];

    return extractListingsFromMarkdown(data.markdown, careersUrl, entry.name);
  },
};

export default provider;
