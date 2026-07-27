/**
 * Tipe & konstanta client-safe untuk fitur "Asisten Lamar".
 *
 * TIDAK boleh mengimpor Prisma / node-only modules — dipakai baik di server
 * action maupun di komponen client (wizard). Semua bentuk data yang mengalir
 * antara client ↔ server action didefinisikan di sini.
 */

/** Cara user memasukkan lowongan. */
export type ImportMode = "link" | "text" | "image";

/** Nada pesan lamaran yang dihasilkan. */
export type ApplyTone = "formal" | "ramah" | "antusias";

/** Kanal / bentuk pesan lamaran. */
export type ApplyChannel = "email" | "whatsapp" | "surat";

export const TONE_OPTIONS: { value: ApplyTone; label: string; hint: string }[] = [
  { value: "formal", label: "Formal", hint: "Sopan & profesional" },
  { value: "ramah", label: "Ramah", hint: "Hangat tapi tetap rapi" },
  { value: "antusias", label: "Antusias", hint: "Bersemangat & percaya diri" },
];

export const CHANNEL_OPTIONS: { value: ApplyChannel; label: string; hint: string }[] = [
  { value: "email", label: "Email", hint: "Subjek + isi email lamaran" },
  { value: "whatsapp", label: "WhatsApp", hint: "Pesan singkat langsung ke HRD" },
  { value: "surat", label: "Surat Lamaran", hint: "Cover letter formal" },
];

/** Lowongan terstruktur hasil ekstraksi AI dari gambar/link/teks. */
export type ExtractedJob = {
  title: string;
  company: string;
  location: string;
  /** Tipe kerja bebas-teks hasil ekstraksi (mis. "Full-time · Hybrid"). */
  employmentType: string;
  level: string;
  description: string;
  requirements: string[];
  skills: string[];
  /** Info gaji bebas-teks (mis. "Rp 10–15 jt"), string kosong bila tak ada. */
  salaryText: string;
  /** Email tujuan lamaran bila tercantum, string kosong bila tidak. */
  applyEmail: string;
  /** URL lamaran/loker asli bila ada, string kosong bila tidak. */
  applyUrl: string;
};

/** Dari mana lowongan ini diambil (untuk atribusi di UI). */
export type ImportOrigin = {
  mode: ImportMode;
  /** Label ramah: host untuk link, "Gambar" / "Deskripsi" untuk lainnya. */
  label: string;
};

/** Hasil analisis input → lowongan + kecocokan skill dengan profil user. */
export type AnalyzeResult =
  | {
      ok: true;
      job: ExtractedJob;
      origin: ImportOrigin;
      /** Skill user yang cocok dengan kebutuhan lowongan (nama asli). */
      matchedSkills: string[];
      /** Skill lowongan yang belum dimiliki user. */
      missingSkills: string[];
    }
  | { ok: false; error: string };

/** Pesan lamaran hasil generate AI. */
export type ApplicationDraft = {
  /** Subjek email (kosong untuk WhatsApp). */
  subject: string;
  /** Isi pesan lamaran siap salin. */
  message: string;
  /** Poin-poin kunci yang dipakai (untuk ditampilkan sebagai ringkasan). */
  highlights: string[];
};

export type DraftResult =
  | { ok: true; draft: ApplicationDraft }
  | { ok: false; error: string };

export type SaveResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string };
