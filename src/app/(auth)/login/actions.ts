"use server";

import { redirect } from "next/navigation";
import { landingFor, signIn, signInWithIdentifier } from "@/lib/auth";
import type { UserRole } from "@devnolife/karirku-core/roles";

/** Login dev/demo: buat sesi untuk user seed dengan role terpilih. */
export async function signInAction(role: UserRole): Promise<void> {
  await signIn(role);
}

export type IdentifierResult = { ok: false; error: string };

/**
 * Login memakai email ATAU username.
 *
 * Cocok dengan user nyata → redirect ke tujuannya (dashboard, atau /onboarding
 * kalau ini login pertama). Tidak cocok → kembalikan pesan error supaya UI
 * menawarkan pilih role (jalur demo lama tetap hidup).
 */
export async function signInWithIdentifierAction(
  identifier: string,
): Promise<IdentifierResult> {
  if (!identifier.trim()) {
    return { ok: false, error: "Email atau username wajib diisi." };
  }

  const result = await signInWithIdentifier(identifier);
  if (!result) {
    return {
      ok: false,
      error: "Akun tidak ditemukan. Pilih role di bawah untuk masuk mode demo.",
    };
  }

  redirect(landingFor(result.role, result.onboarded));
}
