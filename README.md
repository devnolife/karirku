# Karir.ai

> **AI Career Copilot** untuk pasar kerja Indonesia — dari assess skill, roadmap belajar, course recommendation, sampai bantu apply ke lowongan/project.
>
> Blueprint produk lengkap ada di [`plan.md`](./plan.md).

---

## Status

**Full-stack mode** — aplikasi memakai **data real dari PostgreSQL** (pgvector) untuk
semua halaman: dashboard, skill-gap, job match, roadmap, course rec, kandidat,
project, dan admin. Auth memakai **sesi ber-DB** (tabel `sessions`); tidak ada lagi
mock data.

Fitur premium (add-on terpisah dari tier Pro, mis. **Auto-Apply**) dikontrol lewat
tabel `entitlements` (`src/lib/entitlements.ts`) — admin toggle per user di
`/admin/users`. Akun admin (`admin@craft.works`) sudah ter-seed via
`seedUsers()` (lihat `prisma/seed/users.ts`); login lewat tombol role di
halaman login (`signInAs`) atau GitHub OAuth. Hunter adalah alat internal
single-operator: halaman dan seluruh API-nya admin-only, sedangkan apply juga
memerlukan entitlement. Detail desain:
`docs/superpowers/specs/2026-07-06-hunter-premium-foundation-design.md`.

Rekomendasi lowongan saat ini memakai **V1 sebagai ranking aktif** dan
**Recommendation V2 dalam shadow mode**. V2 menghitung skill, semantic match,
readiness per-job, preferensi, freshness, kualitas data, dan feedback, tetapi
tidak mengganti ranking sebelum metrik admin memenuhi gate. Jalankan
`pnpm recommendation:evaluate` untuk evaluasi offline.

Quick start:

```bash
pnpm install
cp .env.example .env.local   # isi DATABASE_URL, REDIS_URL, OLLAMA_*, dst.
docker compose up -d         # Postgres + Redis + MinIO + Ollama
pnpm exec prisma migrate deploy
pnpm db:seed                 # skill taxonomy + 4 user (1/role) + marketplace + admin
pnpm embed:all               # generate embedding (768d) untuk jobs/courses/profiles
pnpm market:intel            # enqueue snapshot pasar harian
pnpm dev                     # → http://localhost:3030
```

### Lowongan live (data asli)

Selain seed, aplikasi bisa menarik **lowongan asli** dari job board publik
(Greenhouse) lengkap dengan deskripsi + URL lamaran nyata:

```bash
pnpm ingest:live   # scrape GitLab/Figma/Dropbox → ekstraksi skill → embed
```

Lowongan live (`source=greenhouse`) tampil di `/jobs` dengan tombol **Lamar**
ke URL asli. Tambah/ubah perusahaan target di
[`scripts/ingest-live.ts`](./scripts/ingest-live.ts) atau lewat pipeline BullMQ
([`src/lib/scraper/portals.ts`](./src/lib/scraper/portals.ts) + `pnpm worker` +
`pnpm scan`).

Login page punya tombol **"Masuk sebagai {role}"** (jobseeker / freelancer /
company / admin) untuk user hasil seed, serta GitHub OAuth untuk akun nyata.
Gmail OAuth terpisah dan hanya meminta `gmail.readonly` untuk menyarankan status
lamaran; user tetap wajib mengonfirmasi. Konten editorial (panduan & bank soal interview) bersifat
statis di [`src/lib/content/`](./src/lib/content/).

Blueprint produk lengkap ada di [`plan.md`](./plan.md).
Fitur guidance loop (AI roadmap, scraper, worker) aktif di Sprint 3-4.

## Prasyarat

- Node.js 20+
- pnpm 10+ (`corepack enable pnpm`)
- Docker + Docker Compose
- **Akses Docker** — user harus anggota grup `docker`:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```
- Disk ~10GB (model Ollama ~5GB)

## Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | TailwindCSS 4 |
| Auth | DB session + GitHub OAuth; Gmail OAuth read-only terpisah |
| DB | PostgreSQL 16 + pgvector |
| ORM | Prisma 7 |
| Cache / Queue | Redis 7 + BullMQ |
| Storage | MinIO (S3-compatible) |
| AI (dev) | **Ollama** — `llama3.1:8b` + `nomic-embed-text` |
| AI (prod) | vLLM + LLaMA 3.3 70B + BGE-M3 (swap via env) |
| Scraper | Crawlee + Playwright (skeleton) |

## Quick start

```bash
# satu kali — start docker stack + migrate + seed + pull AI models
./scripts/dev-setup.sh

# development
pnpm dev              # Next.js di http://localhost:3030
pnpm worker           # BullMQ workers (terminal terpisah)

# utility
pnpm ai:smoke         # test koneksi AI
pnpm scan             # enqueue scan lowongan (portal ATS) → scraperQueue
pnpm market:intel     # enqueue agregasi RoleMarketStat harian
pnpm recommendation:evaluate # evaluasi V1 vs V2 shadow
pnpm db:studio        # Prisma Studio GUI
pnpm typecheck        # TypeScript check
pnpm lint
pnpm build
```

## Job scanner (portal ATS)

Scanner "zero-token" menarik daftar lowongan langsung dari JSON API publik
**Greenhouse / Ashby / Lever** — tanpa scraping HTML, tanpa token AI. Career
page lain dapat memakai provider Firecrawl lokal. Registry sumber berada di
tabel `job_sources` dan dikelola dari `/admin/scraper`; seed/fallback
deterministik ada di [`src/lib/scraper/source-seed.ts`](./src/lib/scraper/source-seed.ts).

```bash
# 1) aktifkan sumber dari /admin/scraper atau seed JobSource
pnpm scan          # enqueue scan registry aktif
pnpm worker        # scan → dedupe/hash → enrich → embed
pnpm market:intel  # snapshot role/lokasi/skill/gaji/trend
```

Provider mendeteksi portal otomatis dari pola URL (`job-boards.greenhouse.io/<slug>`,
`jobs.ashbyhq.com/<slug>`, `jobs.lever.co/<slug>`) dan punya allowlist hostname
(proteksi SSRF). Scraper HTML untuk portal Indonesia (Jobstreet/Dicoding/Prakerja)
masih skeleton.

**Filosofi**: Karir.ai = **lapisan keputusan dan bantuan apply yang terkendali**,
bukan pengganti LinkedIn/JobStreet. Setiap lowongan menyimpan `sourceUrl`; user
melamar di situs resmi. Extension boleh mengisi form, memasang CV, dan memakai
ulang jawaban yang telah disetujui, tetapi **tidak pernah auto-submit**. Setiap
sesi autofill dicatat dan ditampilkan kembali ke user di panel **Aktivitas
autofill** halaman Lamaran ([`src/server/queries/autofill.ts`](./src/server/queries/autofill.ts))
— transparansi atas apa yang dibantu isi. Yang kita ukur dan jelaskan:
[`src/lib/match/score.ts`](./src/lib/match/score.ts) → `skillCoverageScore(userSkills, jobSkills)`
menghasilkan `matchPct` + skill `matched`/`missing`; V2 menambahkan confidence,
readiness per-job, freshness, data quality, dan preference fit.

## Service endpoints (lokal)

| Service | URL |
|---------|-----|
| Next.js | http://localhost:3030 |
| Health check | http://localhost:3030/api/health |
| Postgres | localhost:5432 (`karirku` / `karirku`) |
| Redis | localhost:6379 |
| MinIO console | http://localhost:9001 (`karirku` / `karirku-dev-secret`) |
| Ollama | http://localhost:11434 |

## Struktur

```
src/
├── app/                 Next.js App Router
│   ├── (auth)/login
│   ├── (app)/           layout authenticated
│   │   ├── dashboard
│   │   └── onboarding
│   └── api/
│       ├── auth         NextAuth handler
│       └── health       cek DB/Redis/Ollama
├── lib/
│   ├── ai/              client + models + prompts
│   ├── queue/           BullMQ queue definitions
│   ├── scraper/         providers/ (Greenhouse/Ashby/Lever) + skeleton Jobstreet/Dicoding/Prakerja
│   ├── auth.ts
│   ├── db.ts
│   └── redis.ts
├── server/workers       BullMQ workers entrypoint
└── middleware.ts
prisma/
├── schema.prisma        full schema (blueprint §8)
└── seed.ts              skill taxonomy seed
```

## Setup OAuth

### GitHub login

1. Buat GitHub OAuth App.
2. Callback: `http://localhost:3030/api/auth/github/callback`.
3. Isi `GITHUB_CLIENT_ID` dan `GITHUB_CLIENT_SECRET`.

### Gmail outcome assistant

1. Buka [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `http://localhost:3030/api/auth/gmail/callback`
4. Isi Client ID, Secret, dan encryption key di `.env.local`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   OAUTH_TOKEN_ENCRYPTION_KEY="hasil-openssl-rand-base64-32"
   ```

Gmail hanya dibaca sebagai metadata minimum untuk membuat saran
`screened/interview/offered/rejected`; status aplikasi tidak berubah sebelum
user menekan **Konfirmasi**.

## Troubleshooting

### `permission denied` saat `docker compose up`
User kamu belum di grup `docker`:
```bash
sudo usermod -aG docker $USER
newgrp docker   # atau logout & login
```

### Ollama pull lambat / gagal
- Pastikan container running: `docker ps | grep ollama`
- Manual pull: `docker exec -it karirku-ollama ollama pull llama3.1:8b`
- Model ~5GB — butuh koneksi stabil

### Embedding dimension mismatch
Dev memakai `nomic-embed-text` (dim 768). Kalau ganti ke BGE-M3 (1024), edit `src/lib/ai/models.ts` **dan** `prisma/schema.prisma` (semua `vector(768)` → `vector(1024)`), lalu re-migrate + re-embed semua data.

## Lisensi

Private — internal Karir.ai.
