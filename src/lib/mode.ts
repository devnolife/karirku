/**
 * Satu sumber kebenaran untuk mode aktif aplikasi.
 *
 * - `isProductionMode() === false` (default, tanpa setup apa pun) → semua modul
 *   dual-mode (`auth.ts`, `entitlements.ts`, halaman admin) memakai jalur MOCK:
 *   data statis/cookie, tanpa Postgres/Google OAuth nyata.
 * - `isProductionMode() === true` → env auth (`DATABASE_URL` + Google OAuth)
 *   lengkap terisi → modul dual-mode beralih ke Prisma + NextAuth asli.
 *
 * Sengaja mensyaratkan SEMUA env terisi sekaligus: kalau cuma sebagian yang
 * di-set (mis. DATABASE_URL ada tapi Google OAuth belum), aplikasi tetap jalan
 * di mock mode alih-alih crash setengah-jalan.
 */
export function isProductionMode(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
}
