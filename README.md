# Karir.ai

> **AI Career Copilot** untuk pasar kerja Indonesia — dari assess skill, roadmap belajar, course recommendation, sampai bantu apply ke lowongan/project.
>
> Blueprint produk lengkap ada di [`plan.md`](./plan.md).

---

## Dua repo

Produk ini dipecah jadi **dua repository**:

| Repo | Isi | Dipublikasikan sebagai |
| --- | --- | --- |
| **`devnolife/karirku`** (repo ini) | Aplikasi Next.js: UI, routing, server actions, query layer, session/auth | — |
| [`devnolife/karirku-core`](https://github.com/devnolife/karirku-core) | Engine: LLM, OCR, matching, scraper, queue, workers, Hunter, **dan seluruh akses data** (Prisma schema + migrations + seed) | `@devnolife/karirku-core` di GitHub Packages |

Arah dependensi **satu arah**: web → core, tidak pernah sebaliknya.

```
devnolife/karirku  ──depends on──▶  @devnolife/karirku-core
```

Konsekuensi praktis:

- **Database dimiliki core.** `prisma migrate`, `db:seed`, dan `prisma studio`
  dijalankan dari repo core, bukan dari sini. Alasannya: engine yang
  *menghasilkan* data lowongan (scraper, embedding, market stats), jadi
  kepemilikan schema mengikuti penulisnya — penjelasan lengkap ada di bagian
  "Why the database lives here" pada README core. Ini berbeda dari guru-pintar,
  di mana Prisma ada di frontend karena service Go-nya murni teks-masuk-teks-keluar
  dan tidak menyimpan apa pun.
- **Worker dijalankan dari core** (`pnpm worker`), bukan dari sini.
- Repo ini mengimpor engine lewat subpath publik saja, mis.
  `@devnolife/karirku-core/db`. ESLint memblokir impor ke `dist/`, `src/`, atau
  `generated/` milik package, dan memblokir `@prisma/client` langsung supaya
  tidak pernah ada dua instance PrismaClient.

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
# 1) engine + infra + database (repo tetangga)
git clone https://github.com/devnolife/karirku-core.git ../karirku-core
cd ../karirku-core
pnpm install
cp .env.example .env.local   # isi DATABASE_URL, REDIS_URL, OLLAMA_*, dst.
docker compose up -d         # Postgres + Redis + MinIO + Ollama
pnpm db:deploy
pnpm db:seed                 # skill taxonomy + 4 user (1/role) + marketplace + admin
pnpm embed:all               # generate embedding (768d) untuk jobs/courses/profiles
pnpm market:intel            # enqueue snapshot pasar harian
pnpm build                   # wajib: web mengimpor dist/ milik core

# 2) aplikasi web (repo ini)
cd -
pnpm install
cp .env.example .env.local
pnpm dev                     # → http://localhost:3030
```

Atau jalankan `./scripts/dev-setup.sh` yang melakukan semuanya sekaligus.

### Lowongan live (data asli)

Selain seed, aplikasi bisa menarik **lowongan asli** dari job board publik
(Greenhouse) lengkap dengan deskripsi + URL lamaran nyata:

```bash
pnpm ingest:live   # dijalankan dari repo karirku-core
```

Lowongan live (`source=greenhouse`) tampil di `/jobs` dengan tombol **Lamar**
ke URL asli. Tambah/ubah perusahaan target di `scripts/ingest-live.ts` atau lewat
pipeline BullMQ (`src/scraper/portals.ts` + `pnpm worker` + `pnpm scan`) — semuanya
di repo [`karirku-core`](https://github.com/devnolife/karirku-core).

Login page punya tombol **"Masuk sebagai {role}"** (jobseeker / freelancer /
company / admin) untuk user hasil seed, serta GitHub OAuth untuk akun nyata.
Gmail OAuth terpisah dan hanya meminta `gmail.readonly` untuk menyarankan status
lamaran; user tetap wajib mengonfirmasi. Konten editorial (panduan & bank soal interview) bersifat
statis di `src/content/` pada repo core.

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
# satu kali — setup engine repo, docker stack, migrate, seed, pull AI models
./scripts/dev-setup.sh

# development (repo ini)
pnpm dev              # Next.js di http://localhost:3030
pnpm typecheck        # TypeScript check
pnpm test
pnpm lint
pnpm build
pnpm recommendation:evaluate  # evaluasi V1 vs V2 shadow

# development (repo karirku-core, terminal terpisah)
cd ../karirku-core
pnpm worker           # BullMQ workers
pnpm ai:smoke         # test koneksi AI
pnpm scan             # enqueue scan lowongan (portal ATS) → scraperQueue
pnpm market:intel     # enqueue agregasi RoleMarketStat harian
pnpm db:studio        # Prisma Studio GUI
```

### Mengerjakan web dan engine bersamaan

Menerbitkan versi core setiap kali ada perubahan itu menyakitkan. Untuk dev
lokal, `package.json` repo ini memakai override yang menautkan checkout core
tetangga:

```json
{
  "pnpm": {
    "overrides": {
      "@devnolife/karirku-core": "link:../karirku-core"
    }
  }
}
```

Alurnya: ubah kode di `../karirku-core` → `pnpm build` di sana → perubahan
langsung terpakai di sini. **Hapus blok `overrides` itu** begitu package sudah
terbit di GitHub Packages, supaya `pnpm install` menarik versi rilis
(`"@devnolife/karirku-core": "^0.1.0"`) alih-alih symlink lokal.

Autentikasi registry (butuh token dengan `read:packages`):

```bash
npm config set //npm.pkg.github.com/:_authToken <TOKEN>
```

`.npmrc` di repo ini sudah memetakan scope `@devnolife` ke GitHub Packages.

## Job scanner (portal ATS)

Scanner "zero-token" menarik daftar lowongan langsung dari JSON API publik
**Greenhouse / Ashby / Lever** — tanpa scraping HTML, tanpa token AI. Career
page lain dapat memakai provider Firecrawl lokal. Registry sumber berada di
tabel `job_sources` dan dikelola dari `/admin/scraper`; seed/fallback
deterministik ada di `src/scraper/source-seed.ts` pada repo core.

```bash
# 1) aktifkan sumber dari /admin/scraper atau seed JobSource
# 2) sisanya dijalankan dari repo karirku-core:
cd ../karirku-core
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
karirku/                      [repo ini — aplikasi Next.js]
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
├── extension/                browser extension (bicara ke API web)
└── tests/                    entitlements, gmail, hunter (access), match (v2)

karirku-core/                 [repo terpisah — @devnolife/karirku-core]
├── src/
│   ├── ai/                   client + models + prompts + embeddings + extractors
│   ├── ocr.ts                OCR poster/screenshot lowongan (tesseract)
│   ├── match/                scoring, readiness, composite, evaluation
│   ├── scraper/              providers/ (Greenhouse/Ashby/Lever) + portal ID
│   ├── queue/                BullMQ queue definitions
│   ├── workers/              BullMQ workers entrypoint
│   ├── autofill/             engine autofill + adapters ATS
│   ├── content/              konten statis (panduan, roadmap reference)
│   ├── db.ts                 Prisma client (pemilik tunggal DB)
│   └── redis.ts
├── prisma/                   schema + migrations + seed
├── hunter/                   engine CommonJS (job automation)
└── docker-compose.yml        Postgres/pgvector, Redis, MinIO, Ollama
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
Docker stack ada di repo `karirku-core`. Kalau gagal, user kamu belum di grup
`docker`:
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
perubahannya ada di repo [`karirku-core`](https://github.com/devnolife/karirku-core):
edit `src/ai/models.ts` **dan** `prisma/schema.prisma` (semua `vector(768)` →
`vector(1024)`), lalu re-migrate + re-embed semua data, dan rilis versi core baru.

## Deploy

### Dengan Docker (direkomendasikan)

Seluruh stack produksi dijalankan dari repo ini lewat
[`docker-compose.prod.yml`](./docker-compose.prod.yml). Kedua repo harus
di-clone bersebelahan, karena engine dibuild dari checkout tetangga:

```
karirku/
  karirku-core/   ← engine
  web/            ← repo ini
```

```bash
cd web
cp .env.production.example .env.production

# Isi semua secret. Empat nilai berikut wajib dan harus berbeda satu sama lain:
for k in POSTGRES_PASSWORD NEXTAUTH_SECRET OAUTH_TOKEN_ENCRYPTION_KEY AUTOFILL_TOKEN_SECRET S3_SECRET_KEY; do
  echo "$k=$(openssl rand -base64 32)"
done

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Yang terjadi saat `up`:

1. Postgres, Redis, dan MinIO start dan menunggu sampai `healthy`.
2. Container `migrate` jalan sekali (`prisma migrate deploy`) lalu keluar.
   Migrasi **tidak** dijalankan oleh app saat boot, supaya dua replika web yang
   start bersamaan tidak berebut migrasi yang sama.
3. `web` dan `worker` start hanya setelah migrasi selesai sukses.

Container web mem-*validasi seluruh env di boot*
([`src/instrumentation.ts`](./src/instrumentation.ts)). Secret yang salah bikin
container gagal start dengan daftar masalahnya, bukan jadi error 500 saat user
pertama mencoba login.

| Image | Isi | Perintah |
| --- | --- | --- |
| `karirku-web` | Next.js server | `next start -p 3030` |
| `karirku-core` | BullMQ workers + Chromium (Playwright) + Tesseract | `node dist/workers/index.js` |
| `karirku-core-migrate` | Prisma CLI saja, sekali pakai | `prisma migrate deploy` |

Beberapa keputusan yang perlu diketahui sebelum mengubahnya:

- **Port hanya di-bind ke `127.0.0.1`.** TLS diterminasi reverse proxy
  (Caddy/Nginx) di depannya. `NEXTAUTH_URL` wajib `https://` — cookie sesi
  di-set `Secure`, jadi login tidak akan pernah berhasil lewat plain HTTP.
- **Postgres/Redis/MinIO tidak diekspos ke host** (`expose`, bukan `ports`).
  Hanya container di network yang sama bisa menghubunginya.
- **Ollama ada di profile `ai`** dan tidak ikut start secara default. Model 27B
  butuh GPU; di VPS biasa arahkan `OLLAMA_BASE_URL` ke mesin ber-GPU, atau pakai
  `AI_PROVIDER=github`. Untuk menjalankannya di sini: tambahkan `--profile ai`.
- **Hunter tidak ada di image.** Ia attach lewat CDP ke profil Chrome yang sudah
  login manual — tidak ada artinya di dalam container.

Rilis berikutnya:

```bash
git -C ../karirku-core pull && git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Set `IMAGE_TAG` per rilis (mis. `IMAGE_TAG=2026.08.13`) kalau ingin rollback
cukup dengan menurunkan tag.

### Tanpa Docker

Dua repo → dua artefak yang di-deploy terpisah:

| Artefak | Dari repo | Proses |
| --- | --- | --- |
| Web app | `karirku` | `pnpm build` → `pnpm start` (Next.js server) |
| Worker | `karirku-core` | `pnpm build` → `pnpm worker:start` (proses Node) |
| Migrasi DB | `karirku-core` | `pnpm db:deploy` — dijalankan **sekali**, sebelum web/worker rilis |
| Infra | `karirku-core` | `docker-compose.yml` (Postgres/pgvector, Redis, MinIO, Ollama) |

Urutan rilis yang aman saat schema berubah:

1. Rilis versi baru `@devnolife/karirku-core` (tag → GitHub Actions publish).
2. Jalankan `pnpm db:deploy` dari core.
3. Deploy worker (core).
4. Bump dependency di repo ini, lalu deploy web.

Build web butuh token registry dengan `read:packages` (`NODE_AUTH_TOKEN` /
`npm config set //npm.pkg.github.com/:_authToken`).

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
2. **Proxy lewat control API core** — `karirku-core` sudah menyediakan
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
# di mesin engine (repo karirku-core)
pnpm serve --public    # http://<ip>:4310
pnpm serve --tunnel    # https://<sub>.trycloudflare.com, tanpa buka port
```

Lalu dari mana pun:

```bash
export CORE_URL=http://<ip>:4310
export CORE_API_KEY=<kunci yang dicetak serve.sh>
cd ../karirku-core && pnpm ctl status
```

Semua endpoint kecuali `/health` butuh `Authorization: Bearer <key>`, dan
server **menolak start** kalau di-bind ke luar loopback tanpa `CORE_API_KEYS`.
Daftar endpoint lengkap ada di README `karirku-core`.

## Lisensi

Private — internal Karir.ai.
