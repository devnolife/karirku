# Karir.ai

> **AI Career Copilot** untuk pasar kerja Indonesia — dari assess skill, roadmap belajar, course recommendation, sampai bantu apply ke lowongan/project.
>
> Blueprint produk lengkap ada di [`plan.md`](./plan.md).

---

## Struktur monorepo

Produk ini satu repository dengan **dua package** (pnpm workspace):

| Package | Path | Isi | Dipublikasikan sebagai |
| --- | --- | --- | --- |
| `karirku` (workspace root) | `./` | Aplikasi Next.js: UI, routing, server actions, query layer, session/auth | — |
| `@devnolife/karirku-core` | [`packages/core/`](./packages/core) | Engine: LLM, OCR, matching, scraper, queue, workers, Hunter, **dan seluruh akses data** (Prisma schema + migrations + seed) | `@devnolife/karirku-core` di GitHub Packages |

Arah dependensi **satu arah**: web → core, tidak pernah sebaliknya.

```
karirku (root, Next.js)  ──depends on──▶  @devnolife/karirku-core (packages/core)
```

Konsekuensi praktis:

- **Database dimiliki core.** `prisma migrate`, `db:seed`, dan `prisma studio`
  tetap milik package core; dari root jalankan lewat script proxy (`pnpm db:migrate`,
  `pnpm db:seed`, `pnpm db:studio`) yang meneruskannya ke `packages/core`.
  Alasannya: engine yang *menghasilkan* data lowongan (scraper, embedding, market
  stats), jadi kepemilikan schema mengikuti penulisnya — penjelasan lengkap ada di
  bagian "Why the database lives here" pada [README core](./packages/core/README.md).
  Ini berbeda dari guru-pintar, di mana Prisma ada di frontend karena service Go-nya
  murni teks-masuk-teks-keluar dan tidak menyimpan apa pun.
- **Worker milik core** — dari root: `pnpm worker`.
- Root mengimpor engine lewat subpath publik saja, mis.
  `@devnolife/karirku-core/db`. ESLint memblokir impor ke `dist/`, `src/`, atau
  `generated/` milik package, dan memblokir `@prisma/client` langsung supaya
  tidak pernah ada dua instance PrismaClient. Batas ini tetap dijaga meski kedua
  package kini satu folder — jangan mengimpor lewat path relatif ke `packages/core`.

---

## Status

**Full-stack mode** — aplikasi memakai **data real dari PostgreSQL** (pgvector) untuk
semua halaman: dashboard, skill-gap, job match, roadmap, course rec, kandidat,
project, dan admin. Auth memakai **sesi ber-DB** (tabel `sessions`); tidak ada lagi
mock data.

Fitur premium (add-on terpisah dari tier Pro, mis. **Auto-Apply**) dikontrol lewat
tabel `entitlements` (`src/lib/entitlements.ts`) — admin toggle per user di
`/admin/users`. Akun admin (`admin@craft.works`) sudah ter-seed via
`seedUsers()` (lihat `prisma/seed/users.ts` di repo core); login lewat tombol role di
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
# 1) sekali saja — dependency seluruh workspace
pnpm install
cp .env.example .env.local                 # web
cp packages/core/.env.example packages/core/.env.local   # engine: DATABASE_URL, REDIS_URL, OLLAMA_*, dst.

# 2) infra + database + engine
docker compose -f packages/core/docker-compose.yml up -d  # Postgres + Redis + MinIO + Ollama
pnpm db:deploy
pnpm db:seed                 # skill taxonomy + 4 user (1/role) + marketplace + admin
pnpm core:build              # wajib: web mengimpor dist/ milik core
pnpm --filter @devnolife/karirku-core embed:all      # embedding (768d) jobs/courses/profiles
pnpm --filter @devnolife/karirku-core market:intel   # enqueue snapshot pasar harian

# 3) aplikasi web
pnpm dev                     # → http://localhost:3030
```

Atau jalankan `./scripts/dev-setup.sh` yang melakukan semuanya sekaligus.

### Lowongan live (data asli)

Selain seed, aplikasi bisa menarik **lowongan asli** dari job board publik
(Greenhouse) lengkap dengan deskripsi + URL lamaran nyata:

```bash
pnpm --filter @devnolife/karirku-core ingest:live
```

Lowongan live (`source=greenhouse`) tampil di `/jobs` dengan tombol **Lamar**
ke URL asli. Tambah/ubah perusahaan target di `packages/core/scripts/ingest-live.ts`
atau lewat pipeline BullMQ (`packages/core/src/scraper/portals.ts` + `pnpm worker`
+ `pnpm --filter @devnolife/karirku-core scan`).

Login page punya tombol **"Masuk sebagai {role}"** (jobseeker / freelancer /
company / admin) untuk user hasil seed, serta GitHub OAuth untuk akun nyata.
Gmail OAuth terpisah dan hanya meminta `gmail.readonly` untuk menyarankan status
lamaran; user tetap wajib mengonfirmasi. Konten editorial (panduan & bank soal interview) bersifat
statis di `packages/core/src/content/`.

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
# satu kali — docker stack, migrate, seed, pull AI models
./scripts/dev-setup.sh

# development (semua dari root repo)
pnpm dev              # Next.js di http://localhost:3030
pnpm typecheck        # TypeScript check (app)
pnpm test
pnpm lint
pnpm build            # core:build + next build
pnpm recommendation:evaluate  # evaluasi V1 vs V2 shadow

# engine — script proxy ke packages/core (terminal terpisah)
pnpm worker           # BullMQ workers
pnpm serve            # Control API engine
pnpm hunter status    # Hunter CLI
pnpm db:studio        # Prisma Studio GUI
pnpm core:build       # tsc build engine → packages/core/dist
pnpm core:test        # test engine
pnpm --filter @devnolife/karirku-core ai:smoke      # test koneksi AI
pnpm --filter @devnolife/karirku-core scan          # enqueue scan lowongan → scraperQueue
pnpm --filter @devnolife/karirku-core market:intel  # enqueue agregasi RoleMarketStat harian
```

### Mengerjakan web dan engine bersamaan

Keduanya satu workspace, jadi tidak perlu menerbitkan versi core untuk dev
lokal: root memakai protokol workspace,

```json
{
  "dependencies": {
    "@devnolife/karirku-core": "workspace:*"
  }
}
```

dan pnpm menautkan `node_modules/@devnolife/karirku-core` → `packages/core`.
Alurnya: ubah kode di `packages/core` → `pnpm core:build` → perubahan langsung
terpakai di root. Karena web mengimpor `dist/`, build engine tetap wajib setelah
mengubah `packages/core/src` (`pnpm build` sudah menjalankannya lebih dulu).

Autentikasi registry hanya dibutuhkan saat **menerbitkan** core (token dengan
`write:packages`) atau saat repo lain mengonsumsinya (`read:packages`):

```bash
npm config set //npm.pkg.github.com/:_authToken <TOKEN>
```

`.npmrc` di root sudah memetakan scope `@devnolife` ke GitHub Packages.

## Job scanner (portal ATS)

Scanner "zero-token" menarik daftar lowongan langsung dari JSON API publik
**Greenhouse / Ashby / Lever** — tanpa scraping HTML, tanpa token AI. Career
page lain dapat memakai provider Firecrawl lokal. Registry sumber berada di
tabel `job_sources` dan dikelola dari `/admin/scraper`; seed/fallback
deterministik ada di `packages/core/src/scraper/source-seed.ts`.

```bash
# 1) aktifkan sumber dari /admin/scraper atau seed JobSource
# 2) sisanya milik engine (packages/core):
pnpm --filter @devnolife/karirku-core scan   # enqueue scan registry aktif
pnpm worker                                  # scan → dedupe/hash → enrich → embed
pnpm --filter @devnolife/karirku-core market:intel  # snapshot role/lokasi/skill/gaji/trend
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
`src/match/score.ts` di repo core → `skillCoverageScore(userSkills, jobSkills)`
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

Repo ini **hanya** berisi lapisan Next.js. Engine ada di repo terpisah dan
masuk lewat `node_modules`.

```
karirku/                      [workspace root — aplikasi Next.js]
├── src/
│   ├── app/                  Next.js App Router
│   │   ├── (auth)/login
│   │   ├── (marketing)/      halaman publik: about/careers/contact/terms/privacy
│   │   ├── (app)/            layout authenticated (dashboard, onboarding, …)
│   │   └── api/              NextAuth handler, health, newsletter, hunter, …
│   ├── components/           UI (landing, dashboard, shared)
│   ├── server/               actions/ queries/ services/
│   ├── lib/                  glue yang butuh Next: auth.ts, entitlements.ts,
│   │                         hunter-access.ts, mock/, site.ts, view-models.ts
│   └── types/
├── ai/                       script AI CLI (intake, eval, tailor CV, cover letter)
├── applications/             berkas lamaran (CV, surat, portfolio data)
├── extension/                browser extension (bicara ke API web)
├── tests/                    entitlements, gmail, hunter (access), match (v2)
└── packages/
    └── core/                 [@devnolife/karirku-core — engine]
        ├── src/
        │   ├── ai/           client + models + prompts + embeddings + extractors
        │   ├── ocr.ts        OCR poster/screenshot lowongan (tesseract)
        │   ├── match/        scoring, readiness, composite, evaluation
        │   ├── scraper/      providers/ (Greenhouse/Ashby/Lever) + portal ID
        │   ├── queue/        BullMQ queue definitions
        │   ├── workers/      BullMQ workers entrypoint
        │   ├── autofill/     engine autofill + adapters ATS
        │   ├── content/      konten statis (panduan, roadmap reference)
        │   ├── server/       Control API (pnpm serve)
        │   ├── db.ts         Prisma client (pemilik tunggal DB)
        │   └── redis.ts
        ├── prisma/           schema + migrations + seed
        ├── hunter/           engine CommonJS (job automation)
        ├── data/             state runtime engine (hunter.db) — gitignored
        └── docker-compose.yml  Postgres/pgvector, Redis, MinIO, Ollama
```

Batas ini ditegakkan ESLint. Aturan `no-restricted-imports` di
[`eslint.config.mjs`](./eslint.config.mjs) memblokir:

- impor ke internal package (`@devnolife/karirku-core/dist`, `/src`, `/generated`)
  — pakai subpath publik saja, mis. `@devnolife/karirku-core/db`;
- `@prisma/client` langsung — DB dimiliki core, jadi client diambil dari
  `@devnolife/karirku-core/db` dan tipenya dari `@devnolife/karirku-core/prisma`.
  Ini yang menjamin hanya ada **satu** instance PrismaClient;
- sisa impor `@/core/*` dari sebelum pemisahan.


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
Docker stack milik engine (`packages/core/docker-compose.yml`). Kalau gagal, user
kamu belum di grup `docker`:
```bash
sudo usermod -aG docker $USER
newgrp docker   # atau logout & login
```

### Ollama pull lambat / gagal
- Pastikan container running: `docker ps | grep ollama`
- Manual pull: `docker exec -it karirku-ollama ollama pull llama3.1:8b`
- Model ~5GB — butuh koneksi stabil

### Embedding dimension mismatch
Dev memakai `nomic-embed-text` (dim 768). Kalau ganti ke BGE-M3 (1024), semua
perubahannya ada di package core: edit `packages/core/src/ai/models.ts` **dan**
`packages/core/prisma/schema.prisma` (semua `vector(768)` → `vector(1024)`), lalu
re-migrate + re-embed semua data.

## Deploy

Satu repo → tetap dua artefak yang di-deploy terpisah:

| Artefak | Dari | Proses |
| --- | --- | --- |
| Web app | root | `pnpm build` → `pnpm start` (Next.js server) |
| Worker | `packages/core` | `pnpm core:build` → `pnpm --filter @devnolife/karirku-core worker:start` |
| Migrasi DB | `packages/core` | `pnpm db:deploy` — dijalankan **sekali**, sebelum web/worker rilis |
| Infra | `packages/core` | `docker-compose.yml` (Postgres/pgvector, Redis, MinIO, Ollama) |

Urutan rilis yang aman saat schema berubah:

1. `pnpm db:deploy`.
2. Deploy worker.
3. Deploy web.

Karena core kini package workspace, build web **tidak** lagi butuh token registry —
`pnpm build` sudah membangun engine lebih dulu. Token `write:packages` hanya
dibutuhkan kalau core diterbitkan ke GitHub Packages untuk konsumen lain
(tag `v*` → workflow `core-release`).

### Checklist sebelum go-live

- [ ] Semua secret di-generate ulang — tidak ada nilai dari `.env.example`.
- [ ] `OAUTH_TOKEN_ENCRYPTION_KEY` ≠ `AUTOFILL_TOKEN_SECRET`, keduanya ≥ 32 karakter.
      Mengganti yang pertama membuat semua token OAuth tersimpan tidak bisa
      didekripsi lagi; user harus connect ulang.
- [ ] `NEXTAUTH_URL` = domain publik, `https://`, dan sama persis dengan
      callback URL di GitHub OAuth App.
- [ ] Reverse proxy dengan TLS aktif di depan port `3030`.
- [ ] Backup terjadwal untuk volume `postgres-data`.
- [ ] `GET /api/health` mengembalikan `200`. Status `degraded` (Redis atau LLM
      mati) tetap `200` karena halaman masih render — hanya database yang
      menentukan `503`.

## Memisahkan web dan engine ke VM berbeda

Bisa. Sudah diuji: aplikasi di-boot tanpa satu pun env engine-lokal
(`HUNTER_*`, `TESSERACT_BIN`, `FIRECRAWL_SERVICE_URL`), dengan `REDIS_URL` dan
`OLLAMA_BASE_URL` menunjuk alamat jaringan — landing page `HTTP 200`,
`/api/auth/session` `HTTP 200`, log tanpa satu pun error Prisma atau koneksi.

Alasannya semua yang dipakai web dari core adalah klien jaringan: Prisma
bicara TCP ke Postgres, BullMQ ke Redis, modul AI lewat HTTP ke Ollama, upload
lewat HTTP ke S3/MinIO. Dari seluruh `src/` core, **hanya `src/ocr.ts`** yang
menyentuh `node:fs`. Sisanya (`match/*`, `roles`, `mode`, `location`,
`content/*`) logika murni tanpa I/O yang ikut ter-bundle saat build.

Dua hal yang harus dibereskan dulu: konfigurasi jaringan Postgres/MinIO/Redis
(di bawah), dan rute Hunter (paling bawah).

### Env per VM

| Variabel | VM web | VM engine | Catatan |
| --- | --- | --- | --- |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_CLIENT_*` | ✅ | — | auth hanya urusan web |
| `DATABASE_URL` | ✅ | ✅ | arahkan ke host Postgres, bukan `localhost` |
| `REDIS_URL` | ✅ | ✅ | web ikut enqueue job |
| `OLLAMA_BASE_URL`, `OLLAMA_API_KEY`, `AI_MODEL_*` | ✅ | ✅ | web memanggil AI langsung di beberapa route |
| `S3_*` | ✅ | ✅ | penyimpanan berkas |
| `OAUTH_TOKEN_ENCRYPTION_KEY`, `AUTOFILL_TOKEN_SECRET` | ✅ | ✅ | **nilainya wajib identik di kedua VM** |
| `GOOGLE_CLIENT_*` | ✅ | ✅ | OAuth Gmail |
| `TESSERACT_BIN`, `FIRECRAWL_SERVICE_URL` | — | ✅ | OCR & scraping cuma jalan di engine |
| `HUNTER_*` | — | ✅ | lihat batasan di bawah |

Jebakan paling gampang terlewat: `OAUTH_TOKEN_ENCRYPTION_KEY` dan
`AUTOFILL_TOKEN_SECRET` harus **sama persis** di kedua VM. Kalau beda, token
yang dienkripsi satu sisi tidak bisa didekripsi sisi lain, dan gejalanya baru
muncul saat runtime.

### Prasyarat infra — kerjakan ini dulu

Layanan data harus bisa dijangkau VM web. Periksa dengan `ss -ltn`:

```
127.0.0.1:5432   ← Postgres: TIDAK terjangkau dari VM lain
127.0.0.1:9000   ← MinIO:    TIDAK terjangkau dari VM lain
0.0.0.0:6379     ← Redis:    terjangkau
0.0.0.0:11434    ← Ollama:   terjangkau
```

Yang perlu dilakukan sebelum memisahkan VM:

1. **Postgres** — set `listen_addresses` di `postgresql.conf` dan tambahkan
   baris `pg_hba.conf` untuk subnet VM web (pakai `scram-sha-256`, jangan
   `trust`). Perlu restart.
2. **MinIO** — bind ke alamat yang terjangkau, atau ganti ke S3 terkelola.
3. **Redis** — saat ini menerima koneksi dari jaringan **tanpa password**
   (`redis-cli ping` dari mana saja menjawab `PONG`). Set `requirepass` dan
   masukkan kredensialnya ke `REDIS_URL` **sebelum** VM lain diberi akses.
   Queue BullMQ berisi payload pekerjaan, jadi ini bukan sekadar formalitas.
4. Batasi keempatnya lewat firewall/VPC ke IP VM web saja — jangan ke internet.

Catatan: `docker-compose.yml` di repo core adalah stack pengembangan. Di mesin
ini layanan tersebut berjalan sebagai instalasi native, jadi konfigurasinya
diubah lewat berkas config sistem, bukan lewat compose.

### Satu batasan: Hunter

Hunter tidak bisa dipisah, karena web memakainya secara lokal:

- `src/app/api/hunter/actions/route.ts` memanggil `spawnHunter()` — men-spawn
  proses Node di mesin yang sama.
- 10 file membaca `hunterDb()`, yaitu berkas **SQLite lokal** (`HUNTER_DB`).

Jadi kalau web dipindah ke VM sendiri, rute `/hunter/*` **tidak error — justru
itu masalahnya.** `hunter/db.js` memanggil `fs.mkdirSync()` lalu
`new Database(DB_PATH)`, dan better-sqlite3 **membuat berkas baru** kalau belum
ada, lengkap dengan seed. Sudah diverifikasi: menunjuk `HUNTER_DB` ke path
kosong menghasilkan `runs: 0` tapi `accounts: 5` akun demo hasil seed.

Artinya di VM web, halaman Hunter akan tampak berfungsi sambil menyajikan
database kosong berisi akun contoh — gagal diam-diam, bukan gagal berisik.

Kabar baiknya, ketergantungan ini **terisolasi penuh** di `src/app/hunter/**`
dan `src/app/api/hunter/**` — tidak ada layout, nav, atau komponen global yang
menyentuhnya. Pilihannya:

1. **Biarkan Hunter di VM engine**, dan **blokir `/hunter/*` serta
   `/api/hunter/*` di reverse proxy VM web.** Pemblokiran ini wajib, bukan
   opsional — tanpa itu rute tersebut menyajikan data seed yang menyesatkan.
   Tidak butuh perubahan kode.
2. **Proxy lewat control API core** — engine sudah menyediakan
   `/api/hunter/status`, `/api/hunter/runs`, dan `/api/hunter/actions`
   (lihat `CORE_URL` + `CORE_API_KEY` di bawah). Route Hunter di sini perlu
   diubah memanggil endpoint itu, dan core perlu tambahan endpoint untuk
   settings/applications/accounts/jobs.

Catatan kecil: `isOcrAvailable()` di halaman apply-assistant akan mengembalikan
`false` di VM web karena tesseract tidak terpasang di sana — hanya memengaruhi
tampilan, tidak menggagalkan apa pun.

## Mengendalikan engine dari jarak jauh

Web app memakai core secara **in-process**, jadi kalau web dan engine ada di
mesin yang sama tidak perlu apa-apa lagi. Untuk mengoperasikan engine dari luar
mesin itu — pause queue, memicu scrape, menjalankan Hunter — core punya HTTP
control API sendiri:

```bash
# di mesin engine
pnpm --filter @devnolife/karirku-core serve --public    # http://<ip>:4310
pnpm --filter @devnolife/karirku-core serve --tunnel    # https://<sub>.trycloudflare.com, tanpa buka port
```

Lalu dari mana pun:

```bash
export CORE_URL=http://<ip>:4310
export CORE_API_KEY=<kunci yang dicetak serve.sh>
pnpm --filter @devnolife/karirku-core ctl status
```

Semua endpoint kecuali `/health` butuh `Authorization: Bearer <key>`, dan
server **menolak start** kalau di-bind ke luar loopback tanpa `CORE_API_KEYS`.
Daftar endpoint lengkap ada di [README core](./packages/core/README.md).

## Lisensi

Private — internal Karir.ai.
