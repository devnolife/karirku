# Desain: Perbaikan Fungsional Admin UI (Bagian A)

**Tanggal:** 2026-07-06
**Status:** Disetujui
**Konteks:** Admin panel (`src/app/(admin)/`) sudah punya 5 halaman dengan design
system "Clean Paper Desk", namun ada tiga lubang fungsional. Scope ini menambalnya
tanpa mengubah arah visual.

## Keputusan Kunci

| Keputusan | Pilihan |
|---|---|
| Navigasi mobile | Drawer dari kiri (hamburger di topbar) — konsisten dengan sidebar desktop |
| Loading state | `loading.tsx` per sub-halaman, meniru layout masing-masing |
| Tombol aksi | Server actions; penyimpanan cookie override (fake data), struktur siap ganti Prisma |

## 1. Drawer Navigasi Mobile

File: `src/app/(admin)/_nav.tsx` (extend) + `src/app/(admin)/layout.tsx`.

- Topbar mobile (`md:hidden`) mendapat tombol ☰ yang membuka drawer kiri:
  overlay gelap semi-transparan + panel putih ±280px.
- Isi drawer = 1:1 sidebar desktop: wordmark + chip "admin", 6 item nav
  (Overview, Users, Jobs, Courses, Scraper, Panduan), footer user + tombol Keluar.
- Client component. Menutup saat: link diklik, overlay diklik, tombol Esc.
- Transisi slide ringan; hormati `prefers-reduced-motion`.
- Body scroll dikunci saat drawer terbuka.

## 2. Skeleton Loading Sub-halaman

File baru: `admin/users/loading.tsx`, `admin/jobs/loading.tsx`,
`admin/courses/loading.tsx`, `admin/scraper/loading.tsx`.

- Memakai komponen `Sk` dari `src/app/(app)/_dash/skeleton.tsx` (pola yang sama
  dengan `admin/loading.tsx` yang sudah ada).
- Bentuk skeleton meniru layout halaman: header + baris tabel; khusus scraper:
  4 kartu stat + baris tabel.

## 3. Tombol Aksi Berfungsi

File baru: `src/app/(admin)/_actions.ts` (server actions) +
`src/app/(admin)/_action-button.tsx` (client button).

- Actions: `toggleJobStatus(jobId)` (active ⇄ expired) dan
  `toggleUserStatus(userId)` (active ⇄ suspended).
- Penyimpanan MOCK MODE: cookie `kai_admin_overrides` berisi JSON
  `{ jobs: {id: status}, users: {id: status} }` — pola sama dengan `saveGoal`
  di `src/lib/mock/session.ts`. Halaman membaca mock data lalu menerapkan
  override sehingga perubahan bertahan saat reload.
- Struktur dual-mode: helper `readOverrides()/writeOverride()` terisolasi di
  satu modul; saat `DATABASE_URL` aktif nanti, isi action diganti
  `prisma.job.update(...)` / `prisma.user.update(...)` tanpa menyentuh UI.
- Setelah action: `revalidatePath` halaman terkait.
- UI: tombol client kecil dengan status pending (disabled + label "…"),
  chip status di baris ikut berubah setelah refresh data.
- Halaman yang disentuh: `admin/jobs/page.tsx` (Aktifkan/Nonaktifkan),
  `admin/users/page.tsx` (Suspend/Aktifkan).

## Error Handling

- Action gagal parse cookie → anggap tidak ada override (fallback data mock asli).
- Cookie melebihi ukuran wajar → pangkas ke entri terbaru (cap 100 id per tipe).
- Drawer: fokus dikembalikan ke tombol ☰ saat ditutup.

## Verifikasi

- `pnpm typecheck` + `pnpm build` hijau.
- Cek manual: drawer di viewport mobile, skeleton muncul saat navigasi,
  toggle job/user bertahan setelah reload.

## Di Luar Scope

- Halaman monitoring autofill admin (Bagian B).
- Upgrade visual Overview (Bagian C).
- Detail drawer user/job (Bagian D).
- Aksi untuk halaman Courses dan Scraper.
