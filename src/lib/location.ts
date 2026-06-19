/**
 * Deteksi relevansi lokasi untuk pasar kerja Indonesia. Client-safe (no Prisma).
 *
 * Dipakai untuk mengurutkan lowongan Indonesia lebih dulu (sesuai target user
 * yang umumnya berbasis di Indonesia) dan untuk filter region di /jobs.
 */

// Kota & kata kunci Indonesia (lowercase).
const ID_KEYWORDS = [
  "indonesia",
  "jakarta",
  "jabodetabek",
  "bandung",
  "surabaya",
  "makassar",
  "yogyakarta",
  "yogya",
  "jogja",
  "bekasi",
  "tangerang",
  "depok",
  "bogor",
  "bali",
  "denpasar",
  "medan",
  "semarang",
  "malang",
  "batam",
  "palembang",
  "bsd",
  "serpong",
];

// Sumber yang seluruhnya lowongan Indonesia (seed sintetis + native in-platform).
const ID_SOURCES = new Set(["seed", "native"]);

export type JobRegion = "indonesia" | "remote" | "foreign";

/** Apakah teks lokasi menyebut kota/area Indonesia? */
export function locationIsIndonesian(location: string | null | undefined): boolean {
  if (!location) return false;
  const l = location.toLowerCase();
  return ID_KEYWORDS.some((k) => l.includes(k));
}

/** Apakah lokasi murni "remote" (tanpa negara/kota spesifik asing)? */
export function locationIsRemote(location: string | null | undefined): boolean {
  if (!location) return false;
  return /\bremote\b/i.test(location);
}

/**
 * Klasifikasi region lowongan untuk ranking & filter.
 * - indonesia: sumber ID (seed/native) atau lokasi menyebut Indonesia.
 * - remote: remote tapi tidak spesifik Indonesia (bisa diakses dari ID).
 * - foreign: onsite di luar negeri (paling tidak relevan utk target ID).
 */
export function classifyJobRegion(
  location: string | null | undefined,
  source: string,
): JobRegion {
  if (ID_SOURCES.has(source) || locationIsIndonesian(location)) return "indonesia";
  if (locationIsRemote(location)) return "remote";
  return "foreign";
}

/** Bobot prioritas region (besar = tampil lebih dulu). */
export function regionRank(region: JobRegion): number {
  if (region === "indonesia") return 2;
  if (region === "remote") return 1;
  return 0;
}
