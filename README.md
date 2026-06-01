# Karir.ai

> **AI Career Copilot** untuk pasar kerja Indonesia — dari assess skill, roadmap belajar, course recommendation, sampai bantu apply ke lowongan/project.
>
> Blueprint produk lengkap ada di [`plan.md`](./plan.md).

---

## Status

**UI/UX Mock Mode** — project saat ini fokus di presentasi UI/UX. Semua data di-mock di
[`src/lib/mock/data.ts`](./src/lib/mock/data.ts); `prisma` dan `next-auth` di-stub di
[`src/lib/db.ts`](./src/lib/db.ts) & [`src/lib/auth.ts`](./src/lib/auth.ts) supaya
aplikasi bisa jalan **tanpa** database, Redis, Ollama, atau Google OAuth.

Quick start (mode mock):

```bash
pnpm install
pnpm dev     # → http://localhost:3000
```

Login page punya tombol **"Masuk sebagai demo user"** yang langsung set cookie
demo dan redirect ke dashboard. Dashboard, roadmap, job match, course rec, dan
market trend semuanya pakai fixtures — zero backend dependency.

Untuk kembali ke mode full-stack (DB + auth), kembalikan `src/lib/db.ts` &
`src/lib/auth.ts` dari git history dan jalankan `./scripts/dev-setup.sh` sesuai
Quick Start di bawah.

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
| Auth | NextAuth v5 (Auth.js) + Google |
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
pnpm dev              # Next.js di http://localhost:3000
pnpm worker           # BullMQ workers (terminal terpisah)

# utility
pnpm ai:smoke         # test koneksi AI
pnpm scan             # enqueue scan lowongan (portal ATS) → scraperQueue
pnpm db:studio        # Prisma Studio GUI
pnpm typecheck        # TypeScript check
pnpm lint
pnpm build
```

## Job scanner (portal ATS)

Scanner "zero-token" menarik daftar lowongan langsung dari JSON API publik
**Greenhouse / Ashby / Lever** — tanpa scraping HTML, tanpa token AI. Provider
ada di [`src/lib/scraper/providers/`](./src/lib/scraper/providers); tambah portal
target di [`src/lib/scraper/portals.ts`](./src/lib/scraper/portals.ts).

```bash
# 1) set enabled:true + slug perusahaan di src/lib/scraper/portals.ts
pnpm scan       # enqueue job ke scraperQueue
pnpm worker     # worker memproses: scan → dedupe (Job.sourceUrl) → enrichQueue
```

Provider mendeteksi portal otomatis dari pola URL (`job-boards.greenhouse.io/<slug>`,
`jobs.ashbyhq.com/<slug>`, `jobs.lever.co/<slug>`) dan punya allowlist hostname
(proteksi SSRF). Scraper HTML untuk portal Indonesia (Jobstreet/Dicoding/Prakerja)
masih skeleton.

**Filosofi**: Karir.ai = **1 platform agregasi + pengukur kecocokan**, bukan
otomasi lamaran. Setiap lowongan menyimpan `sourceUrl` (link posting asli) —
user melamar langsung di website perusahaan. Yang kita bantu adalah *mengukur*:
[`src/lib/match/score.ts`](./src/lib/match/score.ts) → `skillCoverageScore(userSkills, jobSkills)`
menghasilkan `matchPct` + daftar skill `matched`/`missing` (deterministik, untuk
skill-gap & rekomendasi course). Nanti dapat dilengkapi semantic similarity via
`Job.embedding` sebagai composite score.

## Service endpoints (lokal)

| Service | URL |
|---------|-----|
| Next.js | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |
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

## Setup Google OAuth

1. Buka [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID & Secret ke `.env.local`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

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
