/**
 * Satu sumber kebenaran untuk mode aktif aplikasi.
 *
 * App dianggap "production" (Postgres nyata) semata berdasarkan `DATABASE_URL`.
 * Saat kosong → DEMO MODE: auth memakai sesi cookie (`src/lib/auth.ts`),
 * seluruh query di `src/server/queries/*` mengembalikan fixture dari
 * `src/lib/mock/demo.ts`, dan interaksi ringan (goal, apply) dipersist ke
 * cookie via `src/lib/mock/demo-store.ts`. Google OAuth adalah opsi tambahan
 * terpisah, bukan syarat mode aktif.
 */
export function isProductionMode(): boolean {
  return !!process.env.DATABASE_URL;
}
