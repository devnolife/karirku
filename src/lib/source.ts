/**
 * Deskripsi sumber lowongan & tujuan lamaran. Client-safe (no Prisma).
 *
 * Dipakai untuk memberi tahu user dari mana sebuah lowongan berasal (platform/
 * ATS) dan ke mana mereka akan diarahkan saat menekan "Lamar" (situs resmi).
 */

export type JobSourceKind = "native" | "external" | "seed";

export type JobSourceInfo = {
  /** native = posting in-platform; external = ATS pihak ketiga; seed = data contoh. */
  kind: JobSourceKind;
  /** Nama platform/ATS yang ramah dibaca, mis. "Greenhouse", "KarirKu". */
  platform: string;
  /** Host tujuan lamaran (mis. "job-boards.greenhouse.io"), null kalau in-platform. */
  host: string | null;
  /** True bila menekan Lamar akan mengarahkan keluar ke situs resmi (host). */
  redirectsOut: boolean;
};

// Kode source internal → label platform yang ramah dibaca.
const PLATFORM_BY_SOURCE: Record<string, string> = {
  greenhouse: "Greenhouse",
  lever: "Lever",
  ashby: "Ashby",
  http: "Situs perusahaan",
};

/** Ambil host bersih (tanpa www.) dari URL http/https. null kalau bukan URL valid. */
export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Jelaskan sumber lowongan + perilaku lamaran.
 * - isNative (companyProfileId terisi) → lamar in-platform di KarirKu.
 * - punya applyUrl http(s) valid → lamar mengarah ke ATS/situs resmi (host).
 * - selain itu (seed sintetis) → data contoh, lamar in-platform.
 */
export function describeJobSource(
  source: string,
  applyUrl: string | null | undefined,
  isNative: boolean,
): JobSourceInfo {
  if (isNative) {
    return { kind: "native", platform: "KarirKu", host: null, redirectsOut: false };
  }
  const host = hostFromUrl(applyUrl);
  if (host) {
    return {
      kind: "external",
      platform: PLATFORM_BY_SOURCE[source] ?? host,
      host,
      redirectsOut: true,
    };
  }
  return { kind: "seed", platform: "Data contoh", host: null, redirectsOut: false };
}
