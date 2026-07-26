"use server";

import { redirect } from "next/navigation";
import { signIn, signInWithIdentifier } from "@/lib/auth";
import { homeForRole, type UserRole } from "@/lib/roles";

/** Login dev/demo: buat sesi untuk user seed dengan role terpilih. */
export async function signInAction(role: UserRole): Promise<void> {
  await signIn(role);
}

export type IdentifierResult = { ok: false; error: string };

/**
 * Login memakai email ATAU username.
 *
 * Cocok dengan user nyata → langsung redirect ke workspace-nya (tidak pernah
 * return). Tidak cocok → kembalikan pesan error supaya UI menawarkan pilih
 * role (jalur demo lama tetap hidup).
 */
export async function signInWithIdentifierAction(
  identifier: string,
): Promise<IdentifierResult> {
  if (!identifier.trim()) {
    return { ok: false, error: "Email atau username wajib diisi." };
  }

  const role = await signInWithIdentifier(identifier);
  if (!role) {
    return {
      ok: false,
      error: "Akun tidak ditemukan. Pilih role di bawah untuk masuk mode demo.",
    };
  }

  redirect(homeForRole(role));
}
