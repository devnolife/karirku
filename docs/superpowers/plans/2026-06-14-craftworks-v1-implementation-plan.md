# CraftWorks — Implementation Plan (Fase 0 + Fase 1)

> **Sumber desain:** `docs/superpowers/specs/2026-06-14-craftworks-career-studio-design.md`
> **Cakupan plan ini:** Fase 0 (rebrand + restore full-stack) & Fase 1 (wedge v1: job board + matching + talent search).
> **Status repo saat ini:** UI/UX mock mode — `src/lib/db.ts` & `src/lib/auth.ts` di-stub, data di `src/lib/mock/data.ts`.
> Branch aktif: `ui-ux-mock`.

## Konvensi

- Tiap milestone punya **Tujuan**, **Tugas**, **Verifikasi**. Jangan tandai selesai sebelum Verifikasi lulus.
- Verifikasi default: `pnpm typecheck` lulus + `pnpm lint` bersih + alur manual yang disebut jalan.
- Keputusan teknis yang masih terbuka ditandai **[DECISION]** — selesaikan sebelum coding milestone terkait.

---

## Keputusan yang harus dikunci dulu

- **[DECISION] Embedding model & dimensi:** `nomic-embed-text` (768) vs `BGE-M3` (1024).
  Rekomendasi: **BGE-M3 (1024)** (lebih kuat Bahasa Indonesia). Konsekuensi: semua kolom
  `vector(...)` di `prisma/schema.prisma` harus 1024 sejak migrasi pertama.
- **[DECISION] Restore auth:** Google OAuth penuh sekarang, atau email/credentials dulu untuk dev?
  Rekomendasi: pertahankan Google + tambah jalur demo-login khusus dev.
- **[DECISION] Lingkup rebrand visual:** apakah landing page (`Landing V4`) ikut di-rebrand penuh
  ke CraftWorks di Fase 0, atau hanya wordmark/metadata dulu?

---

## FASE 0 — Rebrand & Fondasi

### M0.1 — Restore full-stack dari mock mode
**Tujuan:** aplikasi jalan dengan Postgres + Prisma + NextAuth asli (keluar dari mock).

**Tugas:**
- Pulihkan `src/lib/db.ts` (PrismaClient asli; saat ini stub Proxy yang selalu throw).
- Pulihkan `src/lib/auth.ts` (NextAuth v5 + `PrismaAdapter` + Google provider; `@auth/prisma-adapter` sudah ada di deps).
- Pulihkan `src/app/api/auth/[...nextauth]/route.ts` ke handler NextAuth asli.
- Pertahankan jalur **demo login** sebagai opsi dev (flag env), bukan default.
- Verifikasi `docker-compose.yml` menyediakan Postgres+pgvector, Redis, MinIO; jalankan `scripts/dev-setup` bila ada.
- Set `.env.local` dari `.env.example`.

**Verifikasi:** `pnpm dev` jalan, `GET /api/health` hijau (DB/Redis/AI), login menghasilkan user di DB.

### M0.2 — Skema Prisma: kunci dimensi embedding + entitas inti
**Tujuan:** schema final untuk v1 (CareerProfile, CompanyProfile, Listing, Application).

**Tugas:**
- Terapkan **[DECISION] embedding** ke seluruh kolom `vector(...)`.
- Pastikan entitas: `User`, `Profile`/`CareerProfile`, `UserSkill`, `SkillTaxonomy`,
  `CompanyProfile`, `Listing` (v1: `kind=job`), `Application` (mode `native`|`external`).
- Tambah field: `CareerProfile.readinessScore`, `UserSkill.verified`, preferensi.
- `prisma migrate dev` + `prisma generate`.
- Sesuaikan `prisma/seed.ts` (skill taxonomy) bila perlu.

**Verifikasi:** `pnpm db:migrate` sukses, `pnpm db:studio` menampilkan tabel, `pnpm typecheck` lulus.

### M0.3 — Rebrand Karir.ai → CraftWorks
**Tujuan:** identitas produk konsisten ke CraftWorks.

**Tugas:**
- `package.json` `name` → `craftworks` (opsional; tidak wajib rename folder repo).
- Metadata app (`src/app/layout.tsx` title/description), wordmark di nav/sidebar, copy user-facing.
- Ganti referensi "Karir.ai"/"karir.ai" user-facing → "CraftWorks". Pesan stub internal boleh menyusul.
- README: tambah catatan rebrand + pointer ke spec baru. `plan.md` ditandai arsip.
- (Sesuai **[DECISION] lingkup rebrand visual**) landing page wordmark/CTA.

**Verifikasi:** grep "Karir.ai" tidak menyisakan teks user-facing; app render "CraftWorks".

---

## FASE 1 — Wedge v1 (Job Board + Matching + Talent Search)

### M1.1 — CareerProfile end-to-end (sisi talent)
**Tujuan:** talent bisa membangun profil yang jadi aset marketplace.

**Tugas:**
- Onboarding (`(app)/onboarding`) tulis ke DB: skill inventory, target role, preferensi.
- Halaman profil/studio: edit identity, experience, skills, upload/isi portfolio.
- Generate embedding profil (via `src/lib/ai`) saat profil disimpan → simpan ke kolom vector.
- Wire `(app)/skills` & `(app)/dashboard` ke data DB (lepas dari `src/lib/mock/data.ts`).

**Verifikasi:** user baru menyelesaikan onboarding → row `CareerProfile` + embedding ada; dashboard menampilkan data nyata.

### M1.2 — Skill verification ringan (pembeda inti)
**Tujuan:** flag `verified` pada skill via mini-quiz AI.

**Tugas:**
- Generator mini-quiz per skill (prompt di `src/lib/ai/prompts.ts`).
- Alur ambil quiz → nilai → set `UserSkill.verified=true` + `verifiedBy='quiz'`.
- Badge "verified" tampil di profil.

**Verifikasi:** menyelesaikan quiz mengubah status skill jadi verified di DB & UI.

### M1.3 — Pipeline job: scrape → enrich → embed → index
**Tujuan:** katalog lowongan terisi & ter-embed (hybrid: scraped).

**Tugas:**
- Aktifkan worker (`src/server/workers`) + queue (`src/lib/queue`).
- Provider scraped yang sudah ada (Greenhouse/Ashby/Lever) → `Listing(kind=job)`.
- AI enrichment: ekstrak skill/level → simpan; generate embedding job.
- `pgvector` index untuk Listing.

**Verifikasi:** `pnpm scan` + `pnpm worker` mengisi `Listing` dengan skill ter-ekstrak & embedding; dedupe via `sourceUrl`.

### M1.4 — Matching engine bersama
**Tujuan:** satu mesin match (semantic + skill coverage + readiness).

**Tugas:**
- Reuse `src/lib/match/score.ts` (`skillCoverageScore`) sebagai komponen deterministik.
- Tambah `semanticSimilarity` via pgvector cosine (profil ↔ listing).
- Hitung `readinessScore` (skill match + portfolio + verified) per target role.
- Composite score + bobot `w1/w2/w3` (mulai dengan bobot konstan, dokumentasikan).

**Verifikasi:** unit test untuk composite scorer; hasil match deterministik untuk fixture.

### M1.5 — Job browse (sisi talent)
**Tujuan:** talent lihat lowongan dengan badge match%/ready%.

**Tugas:**
- `(app)/jobs` query DB + jalankan matching untuk user aktif.
- Badge match% / readiness% per kartu; filter (lokasi, tipe, remote, gaji).
- Apply: `native` → buat `Application(mode=native)`; `external` → redirect `sourceUrl`.

**Verifikasi:** daftar lowongan tampil dengan skor; apply native membuat row Application; apply external redirect benar.

### M1.6 — Sisi perusahaan: posting native + talent search
**Tujuan:** perusahaan posting lowongan & menemukan talent pre-qualified.

**Tugas:**
- Registrasi `CompanyProfile` + form posting (`(app)/company/jobs`) → `Listing(kind=job, source=native)` + enrich/embed.
- **Talent search** (`(app)/company/candidates`): reverse match listing ↔ CareerProfile, tampil ready% + verified skills.
- Kelola lamaran native: pipeline `Applied → Review → Contact`.

**Verifikasi:** perusahaan posting lowongan → muncul di browse talent; talent search menampilkan kandidat ber-ranking; status lamaran bisa diubah.

### M1.7 — Guidance pendukung (versi minimal)
**Tujuan:** skill gap ringan + saran course (read-only) untuk menaikkan readiness.

**Tugas:**
- Dari `missing` skills (hasil matching) tampilkan "skill yang kurang untuk role X".
- Daftar course terkait (read-only) dari data course yang ada/seed. Generator learning path penuh = fase berikut.

**Verifikasi:** halaman target role menampilkan gap + saran course tanpa error.

---

## Go/No-Go setelah Fase 1

- ≥1 perusahaan native menemukan & menghubungi talent relevan via talent search.
- ≥1 talent menyelesaikan profil **terverifikasi** end-to-end.
- Jika tidak tercapai → sederhanakan scope sebelum lanjut Fase 2.

## Tidak termasuk (fase berikutnya)

Freelance/proposal, mentorship, kolaborasi, learning path generator penuh, portfolio publik
`craft.works/@username`, monetisasi penuh, ATS lanjutan, API B2B. (Lihat spec §4.2 & §10.)

---

## Urutan eksekusi yang disarankan

```
M0.1 → M0.2 → M0.3   (fondasi & rebrand)
   → M1.1 → M1.2     (profil + verifikasi)
   → M1.3 → M1.4     (katalog + matching)
   → M1.5 → M1.6     (browse + sisi perusahaan)
   → M1.7            (guidance pendukung)
```

*Plan ini diiterasi seiring temuan saat implementasi.*
