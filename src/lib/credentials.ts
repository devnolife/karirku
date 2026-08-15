/**
 * Kredensial: login dengan password & pendaftaran akun.
 *
 * Prinsip yang dijaga di sini:
 * - Pesan error tidak pernah membedakan "email tidak terdaftar" dari "password
 *   salah". Membedakannya memberi penyerang daftar email valid secara gratis.
 * - Waktu respons dibuat setara untuk kedua kasus (`fakeVerify`), karena
 *   selisih durasi membocorkan hal yang sama seperti pesan yang berbeda.
 * - Percobaan gagal dihitung per-akun (persisten) sekaligus per-IP (memori),
 *   supaya baik serangan terhadap satu akun maupun password spraying tertahan.
 */

import { headers, cookies } from "next/headers";
import { prisma } from "@devnolife/karirku-core/db";
import { isProductionMode } from "@devnolife/karirku-core/mode";
import type { UserRole } from "@devnolife/karirku-core/roles";
import {
  looksLikeEmail,
  normalizeIdentifier,
  normalizeUsername,
  USERNAME_PATTERN,
} from "@devnolife/karirku-core/username";
import {
  hashPassword,
  verifyPassword,
  fakeVerify,
  checkPasswordStrength,
  hitIp,
  clearIp,
  lockRemainingMs,
  formatWait,
  MAX_ATTEMPTS,
  LOCK_MS,
} from "@devnolife/karirku-core/auth";
import { createSessionForUser, roleNeedsOnboarding, SESSION_COOKIE } from "./auth";

/** Role yang boleh mendaftar sendiri. Admin hanya lewat CLI/OAuth. */
export const SELF_SIGNUP_ROLES = ["jobseeker", "freelancer", "company"] as const;
export type SignupRole = (typeof SELF_SIGNUP_ROLES)[number];

export function isSignupRole(value: string): value is SignupRole {
  return (SELF_SIGNUP_ROLES as readonly string[]).includes(value);
}

export type AuthResult =
  | { ok: true; role: UserRole; onboarded: boolean }
  | { ok: false; error: string; field?: "identifier" | "password" | "email" | "username" | "name" };

/** Pesan tunggal untuk semua kegagalan kredensial — sengaja tidak spesifik. */
const INVALID = "Email/username atau password salah.";

/**
 * IP pemanggil. Di belakang proxy, header pertama `x-forwarded-for` adalah
 * klien asli. Nilai ini hanya dipakai untuk rate limit, bukan otorisasi, jadi
 * risiko spoofing-nya terbatas pada penyerang yang membuang jatahnya sendiri.
 */
async function callerIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/* -------------------------------------------------------------------------- */
/*                                   LOGIN                                    */
/* -------------------------------------------------------------------------- */

/** Login dengan email/username + password. */
export async function signInWithPassword(
  identifier: string,
  password: string,
): Promise<AuthResult> {
  if (!isProductionMode()) {
    return {
      ok: false,
      error: "Login password butuh database. Set DATABASE_URL atau pakai mode demo.",
    };
  }

  const value = normalizeIdentifier(identifier);
  if (!value || !password) {
    return { ok: false, error: "Email/username dan password wajib diisi." };
  }

  const ip = await callerIp();
  const gate = hitIp(ip);
  if (!gate.allowed) {
    return {
      ok: false,
      error: `Terlalu banyak percobaan. Coba lagi dalam ${formatWait(gate.retryAfterMs)}.`,
    };
  }

  const user = await prisma.user.findFirst({
    where: looksLikeEmail(value) ? { email: value } : { username: value },
  });

  // Akun tidak ada: tetap jalankan verifikasi palsu supaya durasinya mirip
  // dengan jalur "akun ada tapi password salah".
  if (!user) {
    await fakeVerify(password);
    return { ok: false, error: INVALID };
  }

  const locked = lockRemainingMs(user.lockedUntil);
  if (locked > 0) {
    return {
      ok: false,
      error: `Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${formatWait(locked)}.`,
    };
  }

  // Akun lama / hasil OAuth belum punya password.
  if (!user.passwordHash) {
    await fakeVerify(password);
    return {
      ok: false,
      error: "Akun ini belum punya password. Masuk lewat GitHub, lalu atur password di Profil.",
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    const failed = user.failedLogins + 1;
    const shouldLock = failed >= MAX_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: shouldLock ? 0 : failed,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MS) : null,
      },
    });

    if (shouldLock) {
      return {
        ok: false,
        error: `Akun dikunci ${Math.round(LOCK_MS / 60000)} menit karena ${MAX_ATTEMPTS} percobaan gagal.`,
      };
    }
    return { ok: false, error: INVALID };
  }

  // Berhasil: bersihkan jejak percobaan gagal.
  if (user.failedLogins > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null },
    });
  }
  clearIp(ip);

  const role = user.role as UserRole;
  await createSessionForUser(user.id, role, user.onboardedAt);
  return {
    ok: true,
    role,
    onboarded: !roleNeedsOnboarding(role) || !!user.onboardedAt,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  REGISTER                                  */
/* -------------------------------------------------------------------------- */

export type RegisterInput = {
  name: string;
  email: string;
  username: string;
  password: string;
  role: SignupRole;
};

/** Daftar akun baru lalu langsung buatkan sesinya. */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  if (!isProductionMode()) {
    return {
      ok: false,
      error: "Pendaftaran butuh database. Set DATABASE_URL atau pakai mode demo.",
    };
  }

  const name = input.name.trim();
  const email = normalizeIdentifier(input.email);
  const username = normalizeUsername(input.username);

  if (name.length < 2) {
    return { ok: false, error: "Nama minimal 2 karakter.", field: "name" };
  }
  if (!email || !looksLikeEmail(email) || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return { ok: false, error: "Format email tidak valid.", field: "email" };
  }
  if (!username) {
    return {
      ok: false,
      error: `Username 3-50 karakter, hanya huruf kecil, angka, titik, garis bawah, atau strip (${USERNAME_PATTERN.source}).`,
      field: "username",
    };
  }
  if (!isSignupRole(input.role)) {
    return { ok: false, error: "Role tidak valid." };
  }

  const strength = checkPasswordStrength(input.password, { email, name, username });
  if (!strength.ok) {
    return { ok: false, error: strength.error, field: "password" };
  }

  // Batasi pendaftaran massal dari satu IP.
  const ip = await callerIp();
  const gate = hitIp(ip);
  if (!gate.allowed) {
    return {
      ok: false,
      error: `Terlalu banyak percobaan. Coba lagi dalam ${formatWait(gate.retryAfterMs)}.`,
    };
  }

  const taken = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (taken) {
    return taken.email === email
      ? { ok: false, error: "Email ini sudah terdaftar. Coba masuk saja.", field: "email" }
      : { ok: false, error: "Username ini sudah dipakai.", field: "username" };
  }

  const passwordHash = await hashPassword(input.password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        role: input.role,
        passwordHash,
        // Verifikasi email belum diaktifkan; ditandai terverifikasi agar alur
        // yang mensyaratkannya tidak memblokir user baru.
        emailVerified: new Date(),
      },
    });
  } catch {
    // Balapan antara pengecekan di atas dan create (dua submit bersamaan).
    return { ok: false, error: "Email atau username sudah terdaftar." };
  }

  clearIp(ip);
  const role = user.role as UserRole;
  await createSessionForUser(user.id, role, user.onboardedAt);
  return { ok: true, role, onboarded: !roleNeedsOnboarding(role) };
}

/* -------------------------------------------------------------------------- */
/*                              GANTI PASSWORD                                */
/* -------------------------------------------------------------------------- */

/**
 * Atur/ganti password user yang sedang login.
 * `currentPassword` wajib kalau akun sudah punya password.
 */
export async function changePassword(
  userId: string,
  newPassword: string,
  currentPassword?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Akun tidak ditemukan." };

  if (user.passwordHash) {
    if (!currentPassword) {
      return { ok: false, error: "Masukkan password lama." };
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Password lama salah." };
  }

  const strength = checkPasswordStrength(newPassword, {
    email: user.email,
    name: user.name ?? undefined,
    username: user.username ?? undefined,
  });
  if (!strength.ok) return { ok: false, error: strength.error };

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(newPassword),
      failedLogins: 0,
      lockedUntil: null,
    },
  });

  // Sesi LAIN milik user dicabut: kalau password diganti karena dicurigai
  // bocor, sesi penyerang harus ikut mati. Sesi yang sedang dipakai untuk
  // mengganti password dipertahankan supaya user tidak terlempar keluar.
  const current = (await cookies()).get(SESSION_COOKIE)?.value;
  await prisma.session.deleteMany({
    where: current
      ? { userId, NOT: { sessionToken: current } }
      : { userId },
  });

  return { ok: true };
}
