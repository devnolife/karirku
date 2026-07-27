/**
 * Normalisasi identifier login — dipakai bersama oleh auth, seed, dan UI.
 *
 * Username disimpan SELALU lowercase di DB, sehingga unique index biasa
 * (`users_username_key`) sudah setara case-insensitive tanpa perlu
 * expression index yang tidak didukung Prisma.
 */

export const USERNAME_PATTERN = /^[a-z0-9._-]{3,50}$/;

/** true kalau string terlihat seperti email (bukan username). */
export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

/** Lowercase + trim. Mengembalikan null kalau kosong. */
export function normalizeIdentifier(value: string): string | null {
  const v = value.trim().toLowerCase();
  return v.length > 0 ? v : null;
}

/**
 * Normalisasi username ke bentuk kanonik siap simpan.
 * Mengembalikan null kalau tidak memenuhi USERNAME_PATTERN.
 */
export function normalizeUsername(value: string): string | null {
  const v = normalizeIdentifier(value);
  if (!v || !USERNAME_PATTERN.test(v)) return null;
  return v;
}
