# CraftWorks — Career Studio Marketplace (Design Blueprint)

> **Status:** Draft for review · **Tanggal:** 2026-06-14
> **Menggantikan posisi:** `plan.md` (Karir.ai). Dokumen ini me-reframe produk dari
> "AI Career Copilot" menjadi **career studio + marketplace dua sisi** dengan brand baru **CraftWorks**.
> **Scope dokumen:** blueprint produk (keputusan arah & arsitektur). Rencana implementasi
> teknis per-sprint disusun terpisah (lihat §10).

---

## 1. Ringkasan Keputusan (hasil brainstorming)

| Keputusan | Pilihan |
|---|---|
| Konsep | Career studio + **marketplace dua sisi** |
| Brand | **CraftWorks** (domain `craft.works`) — menggantikan "Karir.ai" |
| Tagline | *"Craft your career, and it works."* |
| Bentuk pertukaran | Kerja tetap · Project freelance · Mentorship · Kolaborasi antar-talent · Build-as-etalase (challenge/bounty **di-skip**) |
| Wedge v1 | **Job board tetap + AI matching/readiness** |
| Peran AI guidance loop | **Pendukung** (menaikkan kualitas supply talent & akurasi matching), bukan jualan utama |
| Sisi perusahaan v1 | **Hybrid** — lowongan scraped (apply offsite) + akun native (posting + cari talent in-platform) |
| Arsitektur | **Pendekatan A** — satu *Living Career Profile* sebagai tulang punggung; tiap permukaan = "lensa" yang query objek yang sama |

---

## 2. Positioning

**CraftWorks** adalah *career studio* tempat talent **membangun (craft)** aset karir mereka,
yang lalu otomatis dipertemukan dengan peluang di **marketplace dua sisi**.

> Di job board biasa, perusahaan menerima tumpukan CV mentah. Di CraftWorks, perusahaan
> melihat talent yang **sudah pre-qualified**: skill terverifikasi + **readiness score** +
> portfolio nyata (*proof of work*).

**Pergeseran dari `plan.md`:** AI guidance loop (assess → gap → roadmap → course → ready → apply)
bukan lagi tulang punggung. Ia jadi **mesin di belakang** yang menaikkan kualitas profil talent
sehingga supply marketplace lebih berkualitas dan matching lebih akurat. Tulang punggung baru =
**marketplace + CareerProfile**.

### Tiga pemain

- **Talent** (jobseeker / freelancer) — build profil di studio, di-match ke peluang.
- **Perusahaan / Klien** — cari & kontak talent, posting lowongan native, atau melihat lowongan teragregasi (scraped).
- **Mentor / Peer** (fase lanjutan) — bimbingan & kolaborasi antar-talent.

### Diferensiasi inti (versi marketplace-first)

| Kompetitor | Kelemahan | CraftWorks menang di |
|---|---|---|
| Jobstreet / Kalibrr | CV mentah, tanpa kualifikasi | Talent pre-qualified + readiness score |
| LinkedIn | Mahal, tidak lokal, sinyal skill lemah | Skill terverifikasi + konteks Indonesia |
| Upwork / Sribulancer | Hanya freelance, trust lemah | Bridge formal + freelance, profil terverifikasi |
| Glints | Tidak ada studio build / readiness | Build-as-etalase + matching dua arah |

---

## 3. Arsitektur Inti — Living Career Profile (Pendekatan A)

### 3.1 Objek sentral: `CareerProfile`

Satu aset hidup per talent, dibangun & diperkaya di studio.

| Komponen | Sumber | Dipakai untuk |
|---|---|---|
| Identity & headline | input user | tampilan etalase |
| Skills + level + `verified` | self-report → quiz/project AI verify | matching & filter perusahaan |
| Portfolio / karya | upload + output learning path | *proof of work* |
| Experience & education | input / parse CV | konteks matching |
| Readiness score (per target role) | skill match + portfolio + milestone | ranking & badge "ready X%" |
| Embedding vector | digenerate dari profil | semantic search dua arah |
| Preferensi | onboarding | filter (remote, gaji, full-time/freelance) |

**Prinsip:** *build once → surface everywhere*. Semua permukaan marketplace hanya **lensa**
yang membaca objek yang sama.

### 3.2 Diagram

```
        ┌─────────────────────────────┐
        │     STUDIO (build tools)     │
        │  resume · portfolio · skill  │
        │  verify · roadmap/guidance   │
        └──────────────┬──────────────┘
                       │ menulis & memperkaya
                       ▼
        ┌─────────────────────────────┐
        │      CareerProfile (inti)    │
        │   skills · portfolio ·       │
        │   readiness · embedding      │
        └──────────────┬──────────────┘
            membaca via "lensa" berbeda
   ┌───────────┬───────┴───────┬───────────────┐
   ▼           ▼               ▼               ▼
[Jobs v1]  [Freelance]    [Mentorship]   [Kolaborasi]
talent↔    freelancer↔     mentee↔        peer↔
perusahaan klien          mentor          peer
```

### 3.3 Satu matching engine bersama

Satu mesin melayani semua permukaan:

```
match_score = w1 · semantic_similarity(pgvector cosine)
            + w2 · skill_coverage(userSkills, listingSkills)   // deterministik, sudah ada di src/lib/match/score.ts
            + w3 · readiness_signal
```

Tiap permukaan hanya beda **query target** (`Job` / `Project` / `Mentor` / `Peer`) dan **filter**.
Bukan 4 mesin matching terpisah → hemat & koheren.

### 3.4 Sisi perusahaan

Objek paralel: `CompanyProfile` + `Listing` (job/project). Perusahaan bisa melakukan
**reverse search**: query `CareerProfile` yang cocok dengan listing mereka (talent search).

---

## 4. Scope v1 (Wedge: Job Board + Matching)

### 4.1 Termasuk di v1

**Sisi Talent**
- Onboarding → bangun `CareerProfile` (skill inventory, preferensi, target role).
- Studio minimal: build profil + upload/isi portfolio + resume dasar.
- Skill verification ringan (mini-quiz AI) untuk flag `verified` (pembeda inti).
- Browse lowongan (scraped + native) dengan badge **match % / readiness %**.
- Apply: native listing → lamaran in-platform; scraped listing → redirect `sourceUrl`.

**Sisi Perusahaan**
- Registrasi `CompanyProfile` + posting lowongan native.
- **Talent search** (reverse matching) — lihat talent pre-qualified yang cocok.
- Terima & kelola lamaran native (pipeline sederhana: Applied → Review → Contact).

**Mesin & Data**
- Pipeline scraped jobs (sudah ada: Greenhouse/Ashby/Lever + skeleton Jobstreet/Dicoding/Prakerja).
- AI enrichment (ekstrak skill/level dari job) + embedding + `pgvector` index.
- Matching engine bersama (semantic + skill coverage + readiness).
- **Wire-up backend asli** menggantikan mock mode untuk alur job + profil.

**Guidance (pendukung, versi minimal di v1)**
- Skill gap ringan: "untuk role X kamu kurang skill A, B" + saran course (read-only list).
- Readiness score dasar.

### 4.2 DITUNDA (fase berikutnya — tetap di blueprint)

- Permukaan **Freelance** (project + proposal + rate calculator).
- Permukaan **Mentorship** & **Kolaborasi antar-talent**.
- Learning path generator penuh + adaptive re-planning + WhatsApp nudge.
- ATS lanjutan + AI candidate screening mendalam.
- Portfolio publik `craft.works/@username`.
- Monetisasi penuh (paywall, featured listing, API B2B).

### 4.3 YAGNI / dibuang

- Challenge/bounty skill (tidak dipilih).
- Otomasi pelamaran massal.

---

## 5. Alur Utama (v1)

### 5.1 Talent
```
Daftar → Onboarding (skill + target role + preferensi)
      → Studio: lengkapi profil + portfolio + verifikasi skill
      → CareerProfile + embedding terbentuk
      → Browse jobs (badge match%/ready%)
      → Apply (native in-platform / scraped offsite)
```

### 5.2 Perusahaan
```
Daftar (CompanyProfile) → Posting lowongan native (di-enrich AI)
      → Talent search (reverse match: lihat profil cocok + ready%)
      → Kelola lamaran (Applied → Review → Contact)
```

### 5.3 Flywheel
```
Lebih banyak talent build profil → supply berkualitas (verified + ready)
   → perusahaan dapat hasil match bagus → lebih banyak perusahaan native
   → lebih banyak lowongan & lamaran → lebih banyak talent → ...
```

---

## 6. Pemetaan ke Kode yang Sudah Ada

Sebagian besar fondasi sudah ada — v1 banyak **reuse + wire-up**, bukan dari nol.

| Kebutuhan v1 | Aset yang sudah ada | Aksi |
|---|---|---|
| Job catalog | `prisma` schema `jobs`, scraper providers | reuse, wire dari mock → DB |
| Match score | `src/lib/match/score.ts` (`skillCoverageScore`) | reuse, tambah readiness re-rank |
| AI enrich/embed | `src/lib/ai/*` (client/models/prompts) | reuse |
| Profil & skills | schema `profiles`, `user_skills`, `skill_taxonomy` | reuse sebagai basis `CareerProfile` |
| App pages | `(app)/jobs`, `dashboard`, `skills`, `onboarding`, `company/*`, `proposals` | reuse; rebrand & re-flow ke marketplace |
| Auth | NextAuth (di-stub di mock) | restore full-stack |
| Queue/worker | BullMQ (`src/lib/queue`, `src/server/workers`) | reuse |

**Catatan schema:** `CareerProfile` = penyatuan logis `profiles` + `user_skills` + `career_goals`
+ readiness. Tidak perlu tabel baru besar; tambah field readiness/verified & view agregat.
Permukaan freelance/mentor/kolab memakai pola tabel `Listing` generik (kind: job|project|mentorship|collab).

---

## 7. Model Data (perubahan inti, ringkas)

- `Listing` generik bertipe `kind` (`job` | `project` | `mentorship` | `collab`) menggantikan
  duplikasi `jobs`/`projects` di masa depan; v1 tetap fokus `kind=job` (boleh dipetakan dari `jobs` yang ada).
- `CareerProfile`: tambah `readiness_score` (per target role), pastikan `skills.verified`,
  `embedding`, `preferences`.
- `CompanyProfile`: entitas sisi perusahaan + relasi ke `Listing` native.
- `Application`: dukung dua mode — `native` (in-platform) & `external` (redirect `sourceUrl`).
- Konsistensi dimensi embedding (768 nomic vs 1024 BGE-M3) — **pilih satu di awal v1** (lihat catatan `plan.md` §7).

> Detail kolom final disusun di tahap writing-plans, mengikuti `prisma/schema.prisma` yang ada.

---

## 8. Monetisasi (arah; detail menyusul)

Marketplace-first menggeser fokus pendapatan ke **sisi perusahaan**:

- **Free** talent — build profil, browse, apply.
- **Perusahaan**: posting native + talent search (tier berbayar), featured listing.
- **Talent Pro** (fase lanjut): unlimited resume/proposal, priority matching, portfolio publik.
- Affiliate course (pendukung guidance) — sekunder.

> Pricing detail mewarisi `plan.md` §10, di-adjust setelah v1 tervalidasi.

---

## 9. Rebrand Karir.ai → CraftWorks

Pekerjaan rebrand (di-eksekusi saat implementasi, bukan sekarang):

- Wordmark & metadata: `README.md`, `package.json` name, app `<title>`/metadata, landing copy.
- Ganti referensi "Karir.ai" / "karirku" yang user-facing → "CraftWorks".
- Domain produksi: `craft.works` (amankan/registrasi dulu sebelum commit brand penuh).
- Pertahankan struktur repo/folder internal (tidak perlu rename folder repo).
- `plan.md` lama tetap disimpan sebagai arsip; dokumen ini jadi sumber kebenaran baru.

---

## 10. Roadmap (fase, bukan tanggal pasti)

1. **Fase 0 — Rebrand & fondasi:** CraftWorks branding + restore full-stack (DB/auth) dari mock.
2. **Fase 1 (Wedge v1):** CareerProfile + studio minimal + skill verify + job board (scraped+native) + matching engine + talent search + lamaran native.
3. **Fase 2:** Guidance pendukung penuh (learning path, readiness lanjut), portfolio publik.
4. **Fase 3:** Permukaan Freelance (project + proposal).
5. **Fase 4:** Mentorship & Kolaborasi antar-talent.
6. **Fase 5:** Monetisasi penuh + ATS lanjutan + API B2B.

### Kriteria Go/No-Go

- **Setelah Fase 1:** ≥1 perusahaan native berhasil menemukan & menghubungi talent yang relevan via talent search; ≥1 talent menyelesaikan profil terverifikasi end-to-end. Jika tidak → sederhanakan.

---

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| **Cold-start dua sisi** | Hybrid: scraped jobs isi katalog & beri nilai ke talent dulu; onboard perusahaan native bertahap |
| Scope melebar (5 permukaan) | Wedge ketat di job board; permukaan lain ditunda eksplisit (§4.2) |
| Kualitas verifikasi skill (kepercayaan perusahaan) | Mulai mini-quiz AI; perkuat dengan project review di fase berikut |
| Legal scraping | Pertahankan kebijakan `sourceUrl`, rate limit, robots.txt (warisan `plan.md` §5) |
| Domain gratis 1 tahun hilang | Rencana perpanjangan/registrasi `craft.works` resmi sebelum brand dibangun penuh |
| Konsistensi embedding (768 vs 1024) | Kunci satu model di awal Fase 1 |

---

*Blueprint awal CraftWorks. Akan diiterasi berdasarkan feedback & validasi pasar.*
*Versi: 1.0*
