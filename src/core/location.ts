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

// Pemetaan kata kunci lokasi → emoji bendera (urut: paling spesifik dulu).
const COUNTRY_FLAGS: Array<[RegExp, string]> = [
  [/indonesia|jakarta|bandung|surabaya|makassar|yogya|jogja|bekasi|tangerang|depok|bogor|denpasar|\bbali\b|medan|semarang|malang|batam|palembang|bsd|serpong/i, "🇮🇩"],
  [/singapore/i, "🇸🇬"],
  [/malaysia|kuala lumpur/i, "🇲🇾"],
  [/philippines|manila/i, "🇵🇭"],
  [/thailand|bangkok/i, "🇹🇭"],
  [/hong kong/i, "🇭🇰"],
  [/taiwan|taipei/i, "🇹🇼"],
  [/\bchina\b|beijing|shanghai|shenzhen/i, "🇨🇳"],
  [/\bindia\b|bengaluru|bangalore|mumbai|\bdelhi\b/i, "🇮🇳"],
  [/japan|tokyo/i, "🇯🇵"],
  [/germany|berlin|munich/i, "🇩🇪"],
  [/\bfrance\b|paris/i, "🇫🇷"],
  [/united kingdom|\buk\b|england|london|scotland/i, "🇬🇧"],
  [/ireland|dublin/i, "🇮🇪"],
  [/netherlands|amsterdam/i, "🇳🇱"],
  [/\bspain\b|madrid|barcelona/i, "🇪🇸"],
  [/\bitaly\b|\brome\b|milan/i, "🇮🇹"],
  [/austria|vienna/i, "🇦🇹"],
  [/poland|warsaw/i, "🇵🇱"],
  [/israel|tel aviv/i, "🇮🇱"],
  [/canada|toronto|vancouver/i, "🇨🇦"],
  [/mexico/i, "🇲🇽"],
  [/united states|\bu\.?s\.?a?\.?\b|new york|\bny\b|san francisco|\bca\b|seattle|austin|\bboston\b|chicago/i, "🇺🇸"],
  [/\beurope\b|\bemea\b|\bapac\b|americas|worldwide|\bglobal\b/i, "🌍"],
];

/** Emoji bendera/representasi untuk satu teks lokasi. Remote→💻, tak dikenal→📍. */
export function locationFlag(location: string | null | undefined): string {
  if (!location) return "📍";
  for (const [re, flag] of COUNTRY_FLAGS) {
    if (re.test(location)) return flag;
  }
  if (/\bremote\b/i.test(location)) return "💻";
  return "📍";
}

export type ParsedLocation = {
  /** Lokasi utama (sudah dibersihkan), mis. "Bangkok, Thailand". */
  primary: string;
  /** Semua lokasi unik dari string sumber (multi-lokasi dipisah ; atau •). */
  all: string[];
  /** Jumlah lokasi tambahan selain primary. */
  extraCount: number;
  /** Bendera emoji untuk lokasi utama. */
  flag: string;
};

/**
 * Bersihkan & pecah string lokasi sumber yang sering berantakan
 * (mis. "New York, NY; San Francisco, CA • United States" atau
 * "Remote, EMEA; Remote, France; ..."), agar lokasi asli tetap tampil rapi.
 */
export function parseLocation(raw: string | null | undefined): ParsedLocation {
  if (!raw || !raw.trim()) {
    return { primary: "Remote", all: ["Remote"], extraCount: 0, flag: "💻" };
  }
  const parts = raw
    .split(/[;•]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const all: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      all.push(p);
    }
  }
  const primary = all[0] ?? raw.trim();
  return { primary, all, extraCount: Math.max(0, all.length - 1), flag: locationFlag(primary) };
}
