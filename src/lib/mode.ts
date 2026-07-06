/**
 * Satu sumber kebenaran untuk mode aktif aplikasi.
 *
 * Sejalan dengan `src/lib/db.ts`: app dianggap "production" (Postgres nyata)
 * semata berdasarkan `DATABASE_URL`. Auth (`src/lib/auth.ts`) sendiri sudah
 * selalu memakai sesi ber-DB (bukan lagi dual-mode) — Google OAuth adalah
 * opsi tambahan terpisah, bukan syarat mode aktif. Dipakai oleh modul yang
 * masih dual-mode: `entitlements.ts` dan halaman admin yang belum dipindah
 * penuh ke Prisma.
 */
export function isProductionMode(): boolean {
  return !!process.env.DATABASE_URL;
}
