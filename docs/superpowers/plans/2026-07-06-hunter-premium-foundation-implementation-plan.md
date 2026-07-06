# Hunter Premium Foundation — Implementation Plan

> **Sumber desain:** `docs/superpowers/specs/2026-07-06-hunter-premium-foundation-design.md`
> **Cakupan plan ini:** auth dual-mode + model Entitlement + admin toggle.
> **Batasan sesi ini:** tidak setup Docker/Postgres nyata — semua verifikasi jalan di **mock-mode**.
>   Migration SQL ditulis manual (siap pakai), tapi TIDAK dijalankan (`prisma migrate`) sampai
>   ada Postgres nyata di server.

## Konvensi

- Tiap milestone: **Tujuan**, **Tugas**, **Verifikasi**. Verifikasi default: `pnpm typecheck` +
  `pnpm lint` + `pnpm test` bersih, ditambah cek manual bila relevan.

---

### M1 — `src/lib/mode.ts` + `src/lib/auth.ts` dual-mode

**Tujuan:** satu sumber kebenaran mode aktif; auth beralih otomatis mock↔production.

**Tugas:**
- Buat `src/lib/mode.ts`: `isProductionMode()`.
- Tulis ulang `src/lib/auth.ts`: cabang production (NextAuth v5 + PrismaAdapter + Google,
  session callback isi `user.id`/`user.role`) vs mock (implementasi sekarang, dipertahankan).
- Tidak ubah signature export (`auth`, `signIn`, `signOut`, `handlers`).

**Verifikasi:** `pnpm typecheck`, `pnpm lint`, `pnpm dev` tanpa `.env.local` → demo login jalan seperti sebelumnya.

### M2 — Prisma schema: model `Entitlement` (schema + migration manual, tidak dijalankan)

**Tujuan:** struktur data entitlement siap dipakai begitu Postgres nyata tersedia.

**Tugas:**
- Tambah enum `EntitlementStatus`, `EntitlementSource` + model `Entitlement` ke `prisma/schema.prisma`.
- Tambah relasi `entitlements Entitlement[]` ke `model User`.
- Tulis manual `prisma/migrations/<timestamp>_entitlements/migration.sql` mengikuti konvensi
  migration existing (lihat `20260706000000_autofill_extension`).
- **Tidak** menjalankan `prisma migrate dev` / `db:generate` terhadap DB nyata (belum ada Postgres).
  Cukup pastikan schema valid secara sintaks.

**Verifikasi:** review manual kesesuaian schema+SQL; `npx prisma format` / `validate` bila bisa jalan tanpa koneksi DB.

### M3 — Mock entitlement store + `src/lib/entitlements.ts`

**Tujuan:** `hasEntitlement`/`grantEntitlement`/`revokeEntitlement` jalan penuh di mock-mode.

**Tugas:**
- Tambah `MOCK_ENTITLEMENTS` + baca/tulis state (pola sama seperti `_overrides` admin) di `src/lib/mock/`.
- Buat `src/lib/entitlements.ts`: dual-mode, cabang production memanggil Prisma (kode ditulis,
  tidak dieksekusi terhadap DB nyata sesi ini), cabang mock aktif dipakai & ditest sekarang.
- Feature key pertama: `"hunter_auto_apply"`.

**Verifikasi:** unit test baru `tests/entitlements/*.test.ts` (pola `tsx --test`) — grant → hasEntitlement true → revoke → false. `pnpm test` lulus.

### M4 — Admin UI: `/admin/users` dual-mode + toggle Auto-Apply

**Tujuan:** admin bisa aktifkan/cabut entitlement per user dari dashboard (mock-mode dulu).

**Tugas:**
- `(admin)/admin/users/page.tsx`: dual-mode data source (production query disiapkan di kode,
  mock tetap jalur aktif & ditest).
- Kolom chip "Auto-Apply" (Aktif/Nonaktif) dari `hasEntitlement`.
- Server action baru (pola `_actions.ts` + `ActionButton` existing) + guard `role === "admin"`.

**Verifikasi:** manual `pnpm dev` → `/admin/users` → toggle terlihat berubah & persist antar reload (mock state).

### M5 — Seed admin dari env + dokumentasi setup

**Tujuan:** siap dipakai di server nanti tanpa langkah manual tambahan.

**Tugas:**
- `prisma/seed.ts`: tambah `seedAdminFromEnv()` (upsert user `ADMIN_EMAIL` → role admin), no-op kalau env kosong.
- README: tambah section langkah mock→production (docker compose, env, `db:migrate`, `db:seed`).

**Verifikasi:** baca ulang kode `seedAdminFromEnv` — aman dipanggil tanpa `ADMIN_EMAIL`/`DATABASE_URL` (tidak crash proses seed lain). Dokumentasi direview manual.

---

## Di luar plan ini

- Menjalankan `docker compose up`, `prisma migrate dev` terhadap Postgres nyata, dan test Google
  OAuth sungguhan — ditunda sampai ada server/infra nyata (instruksi user: jangan pakai Docker dulu).
- Sub-proyek #2 (Hunter Cloud Control Plane) dan #3 (Local Companion Agent).
