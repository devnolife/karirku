"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/server/queries/profile";
import { getActiveGoal } from "@/server/queries/goal";
import { runCvAnalysis } from "@/server/queries/cv-analysis";
import { importProfileFromCv, type CvField, type CvImportResult } from "@/server/queries/cv-import";

/**
 * Jalankan analisis CV (skor ATS + review kekuatan) untuk user aktif.
 * Dipanggil dari tombol di halaman profil.
 */
export async function analyzeCvAction(): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  const [profile, goal] = await Promise.all([
    getProfile(user.id),
    getActiveGoal(user.id),
  ]);

  const result = await runCvAnalysis(user.id, {
    targetRole: goal?.targetRole ?? profile.headline ?? null,
    profileSkills: profile.skills.map((s) => s.name),
  });

  revalidatePath("/profile");
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

/**
 * Isi profil otomatis dari CV yang sudah diunggah.
 *
 * Field kosong diisi langsung; field yang sudah terisi dikembalikan sebagai
 * konflik kecuali disebut eksplisit di `overwrite`.
 */
export async function importCvToProfileAction(
  overwrite: CvField[] = [],
): Promise<CvImportResult> {
  const user = await requireUser();
  const result = await importProfileFromCv(user.id, overwrite);

  if (result.ok) {
    revalidatePath("/profile");
    revalidatePath("/skills");
  }
  return result;
}
