# Desain: Fondasi Multi-Tenant untuk Hunter sebagai Fitur Premium

**Tanggal:** 2026-07-06
**Status:** Disetujui
**Sub-proyek:** #1 dari 4 (lihat "Roadmap Selanjutnya" di bawah)

## Ringkasan

Hunter (`hunter/`, `/hunter` dashboard) saat ini adalah tool otomasi lamaran kerja
**single-user, lokal, tanpa konsep `userId`** — dibangun untuk satu operator
(devnolife) memakai satu profil Chrome yang login dengan akun pribadinya sendiri
di JobStreet/LinkedIn/Freelancer/Upwork.

Tujuan akhir (di luar spec ini): menjadikan kemampuan auto-apply Hunter sebagai
**add-on premium terpisah** ("Auto-Apply") di karirku, dipakai banyak user, dengan
eksekusi browser tetap terjadi di komputer masing-masing user sendiri lewat
**local companion agent** (lihat §"Roadmap Selanjutnya").

Spec ini HANYA mencakup **fondasi**-nya: mekanisme auth multi-user yang nyata dan
model data "entitlement" (hak akses fitur premium) — keduanya dibangun dengan pola
**dual-mode** yang sudah dipakai di `src/lib/db.ts`: jalan penuh di **mock-mode**
sekarang (tanpa perlu Postgres/Google OAuth nyata di mesin dev), dan berpindah ke
**production-mode** otomatis begitu env var (`DATABASE_URL`,
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`) diisi di server — tanpa ubah kode.

Spec ini TIDAK menyentuh: engine `hunter/*.js`, dashboard `/hunter/*`, atau logika
scan/apply itu sendiri. Itu sub-proyek #2 dan #3.

## Keputusan Kunci

| Keputusan | Pilihan |
|---|---|
| Model eksekusi akhir (di luar spec ini) | Local companion agent per user, bukan browser server-side |
| Cakupan platform auto-apply (nanti) | Semua platform (JobStreet, Freelancer; LinkedIn/Upwork tetap scan-only) |
| Scan lowongan (nanti) | Disentralisasi di cloud (satu job pool bersama), personalisasi skor per user |
| Model billing | Add-on terpisah "Auto-Apply", bukan bagian tier Pro yang sudah ada |
| Status pembayaran v1 | Tidak ada payment gateway — entitlement di-toggle manual oleh admin |
| **Mode kerja spec ini** | **Mock-mode dulu** (jalan tanpa DB/OAuth nyata); production-mode = ganti env var, bukan ganti kode |
| Auth | NextAuth v5 dual-mode: real (PrismaAdapter + Google) kalau env lengkap, else mock session yang sudah ada |
| Model entitlement | Generic per-feature flag (`Entitlement.feature: string`), bukan tabel `Subscription` bertingkat |

## Arsitektur

```
                    ┌─────────────────────────────────────┐
                    │      src/lib/mode.ts (BARU)          │
                    │  isProductionMode(): boolean         │
                    │  = !!(DATABASE_URL && GOOGLE_CLIENT_*)│
                    └───────────────┬───────────────────────┘
                                    │ dipakai oleh
              ┌─────────────────────┼─────────────────────────┐
              ▼                     ▼                         ▼
     src/lib/auth.ts        src/lib/entitlements.ts     (admin)/admin/users
     dual-mode NextAuth      dual-mode grant/revoke       dual-mode read + UI
              │                     │                         │
     mock ─────────── mock/session.ts, mock/data.ts (extended: MOCK_ENTITLEMENTS)
              │                     │
   production ────── PrismaAdapter + Google  ──────  prisma.entitlement (BARU)
                      (schema.prisma sudah ada         (migration baru ditambahkan
                       User/Account/Session)            ke schema yang sudah ada)
```

### Alur Kerja

1. **Mock-mode (default, sekarang)**: `DATABASE_URL`/Google OAuth env kosong →
   `isProductionMode()` = `false` → `auth.ts` dan `entitlements.ts` memakai
   implementasi mock (cookie session yang sudah ada + `MOCK_ENTITLEMENTS` map baru).
   Perilaku app persis seperti sekarang, tidak ada regresi.
2. **Production-mode (nanti, di server)**: env lengkap diisi → `isProductionMode()`
   = `true` tanpa restart kode → `auth.ts` pakai NextAuth asli (Google OAuth +
   PrismaAdapter, tabel `User`/`Account`/`Session` yang sudah ada di
   `prisma/schema.prisma`) → `entitlements.ts` baca/tulis tabel `Entitlement` baru
   via Prisma.
3. Admin login → buka `/admin/users` → lihat kolom "Auto-Apply" per user → klik
   "Aktifkan"/"Cabut" → `grantEntitlement`/`revokeEntitlement` dipanggil, otomatis
   ke jalur mock atau Prisma sesuai mode aktif saat itu.
4. Kode pemanggil lain (nanti: Hunter dashboard) cukup panggil
   `hasEntitlement(userId, "hunter_auto_apply")` — tidak perlu tahu mode aktif.

### Prinsip

- **Satu sumber kebenaran mode**: `isProductionMode()` di `src/lib/mode.ts` dipakai
  di semua tempat (auth, entitlements, admin page) — tidak ada pengecekan env var
  yang di-duplikasi di banyak file (`db.ts` yang sudah ada tetap dipertahankan
  logikanya sendiri karena sudah teruji, tapi disarankan pindah ke helper yang sama
  di iterasi berikutnya).
- **Tidak ada state ganda**: saat production-mode aktif, admin page WAJIB baca dari
  Prisma (bukan campur mock+real) — mode ditentukan sekali per request, bukan per
  komponen.
- **Fail-safe**: kalau hanya sebagian env auth terisi (mis. `DATABASE_URL` ada tapi
  Google OAuth belum), tetap fallback ke mock + `console.warn`, bukan crash.
- **Guard ganda**: aksi grant/revoke entitlement dicek ulang di server action
  (`role === "admin"`), tidak hanya disembunyikan di UI.

## Komponen

### 1. `src/lib/mode.ts` (baru)

```ts
export function isProductionMode(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
}
```

### 2. `src/lib/auth.ts` (dual-mode, ganti isi)

- Kalau `isProductionMode()` → build NextAuth v5 config: `PrismaAdapter(prisma)` +
  `GoogleProvider`, `session` callback menambahkan `user.id` + `user.role` dari
  tabel `users` ke session object.
- Kalau tidak → fallback ke implementasi mock yang sudah ada (`getMockSession`,
  `signInDemo`, `signOutDemo`) — dipertahankan, bukan dihapus.
- Signature export (`auth`, `signIn`, `signOut`, `handlers`) tidak berubah, supaya
  `api/auth/[...nextauth]/route.ts` dan semua pemanggil lain tidak perlu disentuh.

### 3. Prisma schema — model `Entitlement` (baru)

```prisma
enum EntitlementStatus {
  active
  revoked
}

enum EntitlementSource {
  manual
  payment
}

model Entitlement {
  id          String            @id @default(cuid())
  userId      String            @map("user_id") @db.Uuid
  feature     String            // mis. "hunter_auto_apply"
  status      EntitlementStatus @default(active)
  source      EntitlementSource @default(manual)
  activatedAt DateTime          @default(now()) @map("activated_at")
  expiresAt   DateTime?         @map("expires_at")
  notes       String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, feature])
  @@map("entitlements")
}
```

Tambah relasi `entitlements Entitlement[]` ke `model User`. Migration baru
ditambahkan ke `prisma/migrations/` (mengikuti migration existing, tidak mengubah
yang sudah ada).

### 4. `src/lib/mock/data.ts` + mock entitlement store (baru)

- `MOCK_ENTITLEMENTS: Record<userId, string[]>` — daftar feature aktif per mock
  user, seed awal kosong (semua mock user belum py Auto-Apply).
- State mutable disimpan dengan pola yang sama seperti `_overrides` admin yang
  sudah ada (file kecil di `.mock-state/` atau in-memory + cookie untuk sesi demo),
  supaya toggle di admin page kelihatan efeknya walau tanpa DB nyata.

### 5. `src/lib/entitlements.ts` (baru — satu-satunya pintu masuk)

```ts
export async function hasEntitlement(userId: string, feature: string): Promise<boolean>
export async function grantEntitlement(userId: string, feature: string, notes?: string): Promise<void>
export async function revokeEntitlement(userId: string, feature: string): Promise<void>
```

Setiap fungsi bercabang `isProductionMode()` di dalamnya: production → query/
mutate Prisma `Entitlement`; mock → baca/tulis mock store di atas.

### 6. `(admin)/admin/users/page.tsx` (dual-mode)

- Data source: `isProductionMode()` ? `prisma.user.findMany({ include: { entitlements: true } })` : `MOCK_ADMIN_USERS` (perilaku sekarang).
- Kolom baru **"Auto-Apply"**: chip hijau "Aktif" / abu-abu "Nonaktif" berdasarkan
  `hasEntitlement(user.id, "hunter_auto_apply")`.
- Tombol aksi baru (pola sama seperti `ActionButton` + `toggleUserStatus` yang
  sudah ada di `_actions.ts`): **"Aktifkan Auto-Apply"** / **"Cabut Auto-Apply"**.
- Server action memvalidasi ulang `session.user.role === "admin"` sebelum
  memanggil `grantEntitlement`/`revokeEntitlement`.

### 7. `prisma/seed.ts` (tambahan kecil)

- Tambah fungsi `seedAdminFromEnv()`: kalau env `ADMIN_EMAIL` di-set, upsert user
  tersebut dengan `role: admin`. Dipanggil di `main()` setelah seed yang sudah ada.
  Tujuannya: begitu server production dinyalakan pertama kali dan admin login via
  Google, akun itu sudah berstatus admin tanpa perlu edit manual lewat
  `prisma studio`.

### 8. Dokumentasi setup (README.md, tambahan section)

Langkah pindah mock → production:
1. `docker compose up -d postgres`
2. `cp .env.example .env.local`, isi `DATABASE_URL`, `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAIL`
3. `pnpm db:migrate`
4. `pnpm db:seed`
5. Restart `pnpm dev` — app otomatis production-mode, tidak ada flag manual lain.

## Testing

- **Regresi mock-mode**: `pnpm dev` tanpa `.env.local` sama sekali → semua
  perilaku sekarang (demo login, admin users mock) tetap identik.
- **Unit test baru** (`tests/entitlements/*.test.ts`, pola `tsx --test` yang
  sudah dipakai `tests/autofill/`): `hasEntitlement`/`grantEntitlement`/
  `revokeEntitlement` di jalur mock (tidak butuh DB nyata, jalan di CI).
- **Manual test production-mode** (butuh Postgres lokal via docker-compose):
  sign-in Google sungguhan → cek row di tabel `users` → toggle entitlement di
  `/admin/users` → cek row di tabel `entitlements` → `hasEntitlement()` balik
  `true`.
- `pnpm typecheck` dan `pnpm lint` harus tetap bersih setelah perubahan.

## Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Env auth terisi sebagian (mis. `DATABASE_URL` ada, Google OAuth belum) | `isProductionMode()` mengharuskan SEMUA env terisi; kalau tidak, fallback mock + `console.warn`, bukan crash |
| Admin page campur data mock+real dalam satu response | Mode ditentukan sekali per request lewat `isProductionMode()`, tidak per komponen |
| Toggle entitlement dipanggil user non-admin lewat request langsung ke server action | Validasi ulang `role === "admin"` di server action, bukan cuma disembunyikan di UI |
| Prisma schema drift antara migration baru dan schema.prisma | Migration ditulis manual mengikuti konvensi migration existing, di-review sebelum `db:migrate` dijalankan di server nyata |

## Roadmap Selanjutnya (di luar spec ini)

1. ~~#1 Fondasi multi-tenant~~ ← spec ini
2. **#2 Hunter Cloud Control Plane** — pindahkan job pool & scoring Hunter dari
   SQLite lokal ke Postgres multi-user; scan disentralisasi; dashboard `/hunter`
   di-gate `hasEntitlement(userId, "hunter_auto_apply")`. Belum ada auto-apply
   untuk user lain di tahap ini.
3. **#3 Local Companion Agent** — bungkus `hunter/` engine jadi installer/CLI
   ber-pairing token, jalan di komputer user sendiri, tarik antrean apply dari
   cloud, submit via Chrome lokal mereka, push hasil balik.
4. **#4 Gmail reply tracking per-user** — tiap user connect Gmail sendiri via
   OAuth, disinkron di cloud (tidak perlu local agent).
