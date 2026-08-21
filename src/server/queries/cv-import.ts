/**
 * Impor data profil dari CV yang diunggah.
 *
 * Prinsip: **tidak pernah menimpa data yang sudah diisi user**. Field yang masih
 * kosong diisi otomatis; field yang sudah terisi tapi berbeda dengan CV
 * dikembalikan sebagai `conflicts` agar user memutuskan sendiri.
 */

import { prisma } from "@devnolife/karirku-core/db";
import { readCvProfile, CvExtractError, type CvProfile } from "@devnolife/karirku-core/cv";
import { findOrCreateSkills } from "@devnolife/karirku-core/skills/taxonomy";
import { getProfile, regenerateProfileEmbedding } from "./profile";

/** Field profil yang bisa diisi dari CV. */
export type CvField =
  | "headline"
  | "summary"
  | "phone"
  | "city"
  | "country"
  | "linkedinUrl"
  | "githubUrl"
  | "portfolioUrl"
  | "currentTitle"
  | "currentCompany"
  | "yearsExperience";

export const FIELD_LABEL: Record<CvField, string> = {
  headline: "Headline",
  summary: "Ringkasan",
  phone: "No. HP",
  city: "Kota",
  country: "Negara",
  linkedinUrl: "LinkedIn",
  githubUrl: "GitHub",
  portfolioUrl: "Portfolio",
  currentTitle: "Posisi saat ini",
  currentCompany: "Perusahaan saat ini",
  yearsExperience: "Lama pengalaman",
};

export type FieldConflict = {
  field: CvField;
  label: string;
  current: string;
  fromCv: string;
};

export type CvImportResult =
  | {
    ok: true;
    /** Field yang berhasil diisi otomatis (sebelumnya kosong). */
    applied: Array<{ field: CvField; label: string; value: string }>;
    /** Field terisi yang nilainya beda dengan CV — user yang memutuskan. */
    conflicts: FieldConflict[];
    /** Skill baru dari CV yang ditambahkan ke profil. */
    addedSkills: string[];
    /** Skill di CV yang sudah ada di profil. */
    keptSkills: string[];
    /** True bila AI tidak tersedia sehingga hanya kontak yang terbaca. */
    partial: boolean;
    /** Catatan kenapa hasilnya parsial. */
    note: string | null;
  }
  | { ok: false; error: string };

function asText(v: string | number | null): string {
  if (v === null) return "";
  return typeof v === "number" ? String(v) : v.trim();
}

/**
 * Baca CV user, isi field profil yang kosong, dan tambahkan skill baru.
 *
 * @param overwrite Field yang secara eksplisit disetujui user untuk ditimpa.
 */
export async function importProfileFromCv(
  userId: string,
  overwrite: CvField[] = [],
): Promise<CvImportResult> {
  const file = await prisma.resumeFile.findUnique({
    where: { userId },
    select: { data: true, mimeType: true },
  });
  if (!file) return { ok: false, error: "Belum ada file CV yang diunggah." };

  let cv: CvProfile;
  let partial = false;
  let note: string | null = null;
  try {
    const read = await readCvProfile(Buffer.from(file.data), file.mimeType);
    cv = read.profile;
    partial = read.partial;
    note = read.note;
  } catch (err) {
    if (err instanceof CvExtractError) return { ok: false, error: err.message };
    return {
      ok: false,
      error: "Gagal membaca data dari CV. Pastikan CV berformat teks (bukan hasil scan).",
    };
  }

  const profile = await getProfile(userId);
  const c = profile.contact;

  // Pasangkan nilai profil saat ini dengan nilai dari CV.
  const pairs: Array<[CvField, string, string]> = [
    ["headline", profile.headline, cv.headline],
    ["summary", profile.summary, cv.summary],
    ["phone", c.phone, cv.phone],
    ["city", c.city, cv.city],
    ["country", c.country, cv.country],
    ["linkedinUrl", c.linkedinUrl, cv.linkedinUrl],
    ["githubUrl", c.githubUrl, cv.githubUrl],
    ["portfolioUrl", c.portfolioUrl, cv.portfolioUrl],
    ["currentTitle", c.currentTitle, cv.currentTitle],
    ["currentCompany", c.currentCompany, cv.currentCompany],
    ["yearsExperience", asText(c.yearsExperience), asText(cv.yearsExperience)],
  ];

  const force = new Set(overwrite);
  const applied: Array<{ field: CvField; label: string; value: string }> = [];
  const conflicts: FieldConflict[] = [];
  const writes: Record<string, string | number | null> = {};

  for (const [field, current, fromCv] of pairs) {
    if (!fromCv) continue; // CV tidak punya data ini — jangan sentuh.

    const isEmpty = current.trim().length === 0;
    if (isEmpty || force.has(field)) {
      writes[field] =
        field === "yearsExperience" ? Number(fromCv) : fromCv;
      applied.push({ field, label: FIELD_LABEL[field], value: fromCv });
    } else if (current.trim() !== fromCv.trim()) {
      conflicts.push({ field, label: FIELD_LABEL[field], current, fromCv });
    }
  }

  if (Object.keys(writes).length > 0) {
    await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...writes },
      update: writes,
    });
  }

  // Skill: selalu aditif — tidak pernah menghapus skill yang sudah ada.
  const addedSkills: string[] = [];
  const keptSkills: string[] = [];

  if (cv.skills.length > 0) {
    const owned = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    const fresh = cv.skills.filter((s) => !owned.has(s.toLowerCase()));
    cv.skills.forEach((s) => {
      if (owned.has(s.toLowerCase())) keptSkills.push(s);
    });

    if (fresh.length > 0) {
      const rows = await findOrCreateSkills(fresh);
      const existingIds = new Set(profile.skills.map((s) => s.id));
      const toAdd = rows.filter((r) => !existingIds.has(r.id));

      if (toAdd.length > 0) {
        await prisma.userSkill.createMany({
          data: toAdd.map((r) => ({
            userId,
            skillId: r.id,
            proficiency: 2,
            verified: false,
          })),
          skipDuplicates: true,
        });
        addedSkills.push(...toAdd.map((r) => r.name));
      }
    }
  }

  if (applied.length > 0 || addedSkills.length > 0) {
    await regenerateProfileEmbedding(userId);
  }

  return { ok: true, applied, conflicts, addedSkills, keptSkills, partial, note };
}
