/**
 * Rule engine adapter — mencocokkan field form ke data profil secara
 * deterministik. Dipakai oleh semua adapter portal + adapter generic.
 */

import type {
  AdapterRule,
  FieldMapping,
  FormFieldInfo,
  ProfileData,
} from "./types.js";

/** Gabungan atribut field sebagai teks pencarian (lowercase). */
export function fieldHaystack(f: FormFieldInfo): string {
  return [f.name, f.id, f.label, f.autocomplete, f.placeholder]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Untuk select/radio: cari opsi yang paling cocok dengan nilai profil.
 * Return teks opsi persis (yang terlihat user) atau undefined bila tak yakin.
 */
export function matchOption(options: string[], value: string): string | undefined {
  const v = value.toLowerCase().trim();
  const exact = options.find((o) => o.toLowerCase().trim() === v);
  if (exact) return exact;
  const partial = options.find(
    (o) => o.toLowerCase().includes(v) || v.includes(o.toLowerCase().trim()),
  );
  return partial;
}

export interface ApplyResult {
  mappings: FieldMapping[];
  /** Field yang tidak berhasil dipetakan aturan — kandidat LLM fallback. */
  remaining: FormFieldInfo[];
}

/**
 * Terapkan aturan ke daftar field. Field `file` selalu dilewati (ditangani
 * extension via DataTransfer, bukan mapping nilai). Field select/radio hanya
 * dipetakan bila ada opsi yang cocok — lebih baik kosong daripada salah.
 */
export function applyRules(
  fields: FormFieldInfo[],
  rules: AdapterRule[],
  profile: ProfileData,
): ApplyResult {
  const mappings: FieldMapping[] = [];
  const remaining: FormFieldInfo[] = [];

  for (const field of fields) {
    if (field.type === "file") continue; // ditangani terpisah oleh extension

    const hay = fieldHaystack(field);
    let mapped = false;

    for (const rule of rules) {
      if (!rule.match.test(hay)) continue;
      const raw = rule.get(profile);
      if (raw === undefined || raw === "") continue;

      let value = raw;
      if (
        (field.type === "select" || field.type === "radio") &&
        field.options?.length
      ) {
        const opt = matchOption(field.options, raw);
        if (!opt) continue; // tidak menebak opsi
        value = opt;
      }

      mappings.push({
        selector: field.selector,
        value,
        confidence: 1.0,
        source: "adapter",
      });
      mapped = true;
      break;
    }

    if (!mapped) remaining.push(field);
  }

  return { mappings, remaining };
}

/**
 * Aturan generik lintas portal — heuristik atribut/label standar
 * (EN + ID). Dipakai sebagai lapisan setelah adapter portal dan sebelum LLM.
 */
export const GENERIC_RULES: AdapterRule[] = [
  // — identitas —
  { match: /first[\s_-]?name|given[\s_-]?name|nama\s*depan/, get: (p) => p.firstName },
  { match: /last[\s_-]?name|family[\s_-]?name|surname|nama\s*belakang/, get: (p) => p.lastName },
  // Sengaja TIDAK memakai \bname\b/\bnama\b telanjang — terlalu rakus
  // (menangkap "nama universitas", "company name", dst). Adapter portal
  // boleh memakai pola longgar karena konteks field-nya sudah pasti.
  { match: /full[\s_-]?name|nama\s*lengkap|your\s*name/, get: (p) => p.fullName },
  { match: /e-?mail|surel/, get: (p) => p.email },
  { match: /phone|mobile|whatsapp|telepon|telp|\bhp\b|ponsel|no\.?\s*(hp|telp)/, get: (p) => p.phone },
  // — lokasi —
  { match: /city|kota|domisili/, get: (p) => p.city },
  { match: /country|negara/, get: (p) => p.country },
  { match: /location|lokasi/, get: (p) => [p.city, p.country].filter(Boolean).join(", ") || undefined },
  // — tautan —
  { match: /linked[\s_-]?in/, get: (p) => p.linkedinUrl },
  { match: /git[\s_-]?hub/, get: (p) => p.githubUrl },
  { match: /portfolio|portofolio|personal\s*(web)?site|website/, get: (p) => p.portfolioUrl },
  // — pekerjaan —
  { match: /current\s*(job\s*)?title|jabatan|posisi\s*(saat\s*ini)?|headline/, get: (p) => p.currentTitle ?? p.headline },
  { match: /current\s*(company|employer)|perusahaan\s*(saat\s*ini)?/, get: (p) => p.currentCompany },
  {
    match: /years?\s*(of)?\s*experience|pengalaman\s*(kerja)?\s*\(?tahun\)?|lama\s*pengalaman/,
    get: (p) => (p.yearsExperience !== undefined ? String(p.yearsExperience) : undefined),
  },
  {
    match: /salary|gaji|ekspektasi/,
    get: (p) => (p.expectedSalaryIdr !== undefined ? String(p.expectedSalaryIdr) : undefined),
  },
  { match: /skills?|keahlian|keterampilan/, get: (p) => (p.skills.length ? p.skills.join(", ") : undefined) },
];
