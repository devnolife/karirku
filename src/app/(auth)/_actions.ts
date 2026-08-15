"use server";

import { redirect } from "next/navigation";
import { landingFor } from "@/lib/auth";
import {
  signInWithPassword,
  registerUser,
  isSignupRole,
  type AuthResult,
} from "@/lib/credentials";

export type FormError = { ok: false; error: string; field?: string };

/** Login email/username + password. Sukses → redirect; gagal → pesan error. */
export async function loginAction(formData: FormData): Promise<FormError> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await signInWithPassword(identifier, password);
  if (!res.ok) return { ok: false, error: res.error, field: res.field };

  redirect(landingFor(res.role, res.onboarded));
}

/** Daftar akun baru. Sukses → langsung masuk & redirect ke onboarding. */
export async function registerAction(formData: FormData): Promise<FormError> {
  const role = String(formData.get("role") ?? "jobseeker");
  if (!isSignupRole(role)) {
    return { ok: false, error: "Pilih role terlebih dahulu.", field: "role" };
  }

  const res: AuthResult = await registerUser({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    role,
  });

  if (!res.ok) return { ok: false, error: res.error, field: res.field };

  redirect(landingFor(res.role, res.onboarded));
}
