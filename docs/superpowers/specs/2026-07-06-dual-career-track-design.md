# Desain: Mode Karir Ganda (Full-time + Freelance)

**Tanggal:** 2026-07-06
**Status:** Disetujui

## Latar Belakang

Satu orang bisa mengejar pekerjaan tetap sekaligus project freelance. Data model
sudah punya field ini (`MockGoal.targetTrack: "fulltime" | "freelance" | "both"`,
dipilih di Onboarding via "Mode karir") tapi nilai `"both"` belum berefek apa pun —
nav dan dashboard murni mengikuti `role` akun (jobseeker/freelancer), bukan goal.

## Keputusan Kunci

| Keputusan | Pilihan |
|---|---|
| Model | Satu profil, satu `role` primer (tak berubah) + `targetTrack` sebagai preferensi |
| Dashboard saat "both" | Dashboard utama tetap ikut role primer; mode kedua tampil sebagai satu kartu ringkas (bukan dashboard penuh) |
| Nav saat "both" | Menu utama tak berubah + satu grup tambahan kecil (2 item) untuk mode kedua |
| Tempat mengatur | Onboarding (field "Mode karir" yang sudah ada — tinggal diaktifkan efeknya) |

`role` (jobseeker/freelancer/company/admin) tetap sumber kebenaran untuk dashboard
& nav utama — tidak diubah. `targetTrack === "both"` hanya menambah, tidak pernah
mengganti, elemen UI.

## Perubahan

### 1. Nav (`src/app/(app)/layout.tsx`)
Untuk role `jobseeker`/`freelancer`, baca `getGoal()`. Jika `targetTrack === "both"`,
tambahkan satu `NavGroup` di akhir:
- Primer jobseeker → grup "Freelance": Projects, Proposal
- Primer freelancer → grup "Full-time": Lowongan, Skill-gap

Role `company`/`admin` tidak terpengaruh (konsep track tidak berlaku).

### 2. Dashboard (`dashboard/page.tsx`, `FreelancerDashboard.tsx`)
Komponen baru `SecondaryModeCard` (`_dash/parts.tsx`): satu baris kartu ringkas
(chip label + judul + 2 mini-stat + panah), linking ke halaman mode kedua.
- Jobseeker + both → kartu ringkas freelance (earnings, match project terbaik) → `/projects`
- Freelancer + both → kartu ringkas full-time (readiness, match lowongan terbaik) → `/jobs`
Muncul sebagai satu baris tambahan di bagian bawah bento, hanya saat `targetTrack === "both"`.

### 3. Onboarding (`onboarding/page.tsx`)
Perjelas helper text pada field "Mode karir" bahwa memilih "Dua-duanya" akan
menampilkan menu & ringkasan kedua mode di dashboard.

## Default & Kompatibilitas

`MOCK_GOAL.targetTrack` default `"fulltime"` — perilaku lama (satu mode) tetap
menjadi default untuk semua akun yang belum eksplisit memilih "Dua-duanya".
Company & Admin sama sekali tidak terpengaruh.

## Verifikasi

- typecheck + build hijau
- Playwright: submit onboarding dengan `targetTrack=both` sebagai jobseeker →
  nav grup "Freelance" muncul, kartu ringkas freelance muncul di dashboard
- Sama untuk role freelancer → grup "Full-time" + kartu ringkas jobseeker
