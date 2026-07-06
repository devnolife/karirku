# Desain: Redesign Layout App-Wide (gaya "Donezo")

**Tanggal:** 2026-07-06
**Status:** Disetujui
**Referensi:** Dashboard "Donezo" (sidebar grouped + indikator aktif kiri +
kartu promo, topbar persisten dengan search/notifikasi/profil, bento grid,
kartu stat highlight, donut + legend, bar bertekstur arsir).

## Keputusan Kunci

| Keputusan | Pilihan |
|---|---|
| Scope | Seluruh app: shell (app) + admin + dashboard flagship |
| Warna | Tetap palet CraftWorks ("Clean Paper Desk"), hanya struktur Donezo yang diadopsi |

## Prinsip

Adopsi **anatomi** Donezo, bukan warnanya. Semua warna tetap pakai token
`--act-*` yang ada (biru/iris/magenta/mint + onyx). Tidak ada token warna baru.

## 1. Sidebar (app + admin)

File: `src/app/(app)/_sidebar.tsx`, `_shell.tsx`, `layout.tsx`;
padanan admin: `(admin)/_nav.tsx`, `_mobile-nav.tsx`, `layout.tsx`.

- **Grouping**: menu dibagi bersection label (`MENU`, `GENERAL`) memakai
  `act-kicker`. Struktur nav diubah dari `SideItem[]` → `NavGroup[]`
  (`{ label?: string; items: SideItem[] }`).
  - jobseeker MENU: Overview, Skill-gap, Roadmap, Lowongan, Belajar ·
    GENERAL: Goal, Panduan
  - freelancer/company/admin dibagi serupa (fungsional vs umum).
- **Indikator aktif kiri**: item aktif = latar mist lembut + teks/ikon onyx tebal
  + **bar vertikal biru** (`--act-blue`) di tepi kiri (rounded), menggantikan
  fill onyx penuh. Idle: charcoal + hover wash.
- **Kartu promo** di dasar sidebar (di atas blok user): kartu gelap
  (`--act-onyx`) mengajak pasang **Extension Auto-Fill** (menghubungkan ke fitur
  yang sudah dibangun) dengan tombol pill terang. Komponen baru `SidebarPromo`.
  Disembunyikan saat sidebar collapsed.

## 2. Topbar Persisten

File: `_shell.tsx`.

- Header desktop menjadi **sticky** (tidak scroll hilang), kartu mengambang
  `rounded-[18px]`.
- Isi: tombol toggle sidebar · **search pill** lebar dengan ikon + placeholder
  "Cari…" + hint `⌘F` (chip `act-chip-mute`) · di kanan: ikon **mail** + **bell**
  (bulat, hover wash) + **profil user** (avatar + nama + email, seperti Donezo).
- Mobile: topbar `act-glass` tetap; tambah baris search di bawah tab nav.

## 3. Component Kit Baru

File: `src/app/(app)/_dash/parts.tsx` (tambahan).

- **`StatCard`** — kartu stat gaya Donezo: `act-kicker` label + ikon panah
  kanan-atas (↗) + angka besar `act-display` + chip delta "naik dari bln lalu".
  Varian **`featured`**: latar onyx solid, teks putih (seperti "Total Projects 24").
- **`DonutProgress`** — donut (SVG, reuse pola `ReadinessCard`) dengan angka
  tengah + **legend** (Completed / In Progress / Pending) memakai `--act-*`.
- **`HatchedBars`** — bar chart vertikal dengan bar rounded; bar "kosong/mendatang"
  memakai tekstur arsir `.act-hatch`; satu bar aktif boleh diberi badge %.

## 4. CSS Utilities Baru

File: `src/app/globals.css`.

- `.act-hatch` — tekstur arsir diagonal (`repeating-linear-gradient`) untuk bar
  kosong. Hormati `prefers-reduced-motion` (statis, tak perlu animasi).
- `.act-navbar-ind` (opsional) — bar indikator kiri; boleh inline di komponen.
- Tidak ada token warna baru.

## 5. Penerapan Bento

- **Jobseeker dashboard** (`dashboard/page.tsx`): header + tombol CTA (Add/Import
  gaya Donezo → "Ubah goal" + "Lihat lowongan"); baris 4 `StatCard`
  (pertama `featured`); bento grid: `HatchedBars` (aktivitas) + kartu reminder
  (milestone berikutnya + CTA) + daftar item (lowongan cocok) + `DonutProgress`
  (readiness/komposisi) + kartu gelap kecil.
- **Admin overview** (`admin/page.tsx`): baris 4 `StatCard` (pertama featured:
  Total users), bento: `HatchedBars` pertumbuhan + `DonutProgress` komposisi role
  + daftar pipeline.
- Halaman list lain (skills, jobs, roadmap, learn, projects, proposals,
  company/*, admin sub-pages) otomatis dapat shell + topbar baru; konten mereka
  tidak diubah pada scope ini.

## Verifikasi

- `pnpm typecheck` + `pnpm build` hijau.
- Cek visual via Playwright: screenshot dashboard + admin overview (desktop &
  mobile), pastikan sidebar grouped, indikator aktif kiri, topbar persisten,
  bento render.

## Di Luar Scope

- Rebrand warna ke hijau.
- Redesign konten tiap halaman list (hanya shell yang berubah untuk mereka).
- Search & notifikasi fungsional (UI dulu, tanpa backend).
- Chart library (semua tetap SVG/CSS hand-rolled).
