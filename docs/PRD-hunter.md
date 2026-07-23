# PRD — Hunter: Job Hunt Automation System

| | |
|---|---|
| **Owner** | Andi Agung Dwi Arya (devnolife) |
| **Status** | MVP shipped (v1) |
| **Lokasi** | repo `studio` — engine `hunter/`, dashboard `/hunter`, API `/api/hunter/*` |
| **Terakhir diperbarui** | Juli 2026 |

## 1. Visi & Latar Belakang

devnolife melamar kerja/proyek di 4 platform (JobStreet, Freelancer, LinkedIn, Upwork) memakai skrip otomasi ad-hoc yang dibuang setelah dipakai. Masalahnya:

1. **Tidak ada satu tempat** untuk melihat semua akun terhubung dan status login-nya.
2. **Tidak ada pelacakan balasan** — dari 35+ lamaran JobStreet dan 5 bid Freelancer, tidak diketahui mana yang dibalas, mana yang sunyi.
3. **Scan lowongan manual** — lowongan remote baru harus dicari ulang tiap hari di tiap platform.
4. **Aturan lamaran tersebar** — aturan gaji ("jangan tawar di bawah minimum lowongan"), jawaban screening standar, dan daftar keyword hidup di kepala/di chat, bukan di sistem.

**Hunter** = sistem permanen di dalam repo `studio`: engine Node/Playwright + SQLite + dashboard Next.js yang men-scan lowongan, menghitung skor kecocokan, melamar otomatis dengan aturan yang aman, meng-import riwayat lamaran, dan melacak balasan via Gmail API.

## 2. Riset pendahuluan: OpenClaw & Hermes

Sebelum membangun, dua framework agent dievaluasi sebagai alternatif fondasi:

- **OpenClaw** — framework agent open-source self-hosted (eks Clawdbot/Moltbot) dengan sistem skill (ClawHub) dan integrasi messaging. Sudah terpasang di mesin ini (`~/.openclaw/skills`: firecrawl, whatsapp-automation, webapp-testing, dll).
- **Hermes** (Nous Research) — agent pesaing yang self-improving: menulis skill-nya sendiri mengikuti standar **agentskills.io**, memori persisten, ±97 skill bawaan.

**Keputusan: build native di studio.** Alasan:
1. Alur apply per-platform (JobStreet Quick Apply, Freelancer REST bid) sudah terbukti jalan di sesi otomasi sebelumnya — porting ke skill framework menambah lapisan tanpa nilai.
2. Data (SQLite) dan dashboard perlu hidup berdampingan dengan Next.js studio.
3. Framework agent tetap bisa menunggangi Hunter nanti: CLI `node hunter/run.js` mudah dibungkus jadi skill agentskills.io (fase 2).

## 3. Persona & Use Case

**Persona tunggal**: devnolife sendiri (single-user, jalan lokal di Windows, tidak di-deploy publik).

Use case utama:
1. *"Pagi-pagi saya buka `/hunter`, klik Scan All, lihat lowongan baru ber-skor tinggi, klik Apply pada yang saya setujui."*
2. *"Seminggu sekali saya klik Sync Email dan langsung lihat lamaran mana yang dibalas/interview/ditolak."*
3. *"Kalau saya sudah percaya sistemnya, saya ganti mode ke `auto` dan Hunter melamar sendiri saat match ≥ threshold."*

## 4. Ruang Lingkup

### MVP (sudah dibangun — v1)

| Fitur | Detail | Status |
|---|---|---|
| SQLite data layer | `hunter/db.js` — accounts, jobs, applications, emails, runs, settings | ✅ |
| Browser engine | `hunter/browser.js` — attach/launch Chrome CDP (profile `~/.copilot/form-bot/chrome-profile` berisi login hidup) | ✅ |
| Scan Freelancer | REST API projects/active + auto-relogin via Google GSI | ✅ (80 lowongan) |
| Bid Freelancer | POST `/api/projects/0.1/bids/` dgn header `freelancer-auth-v2` dari cookie | ✅ |
| Scan JobStreet | 6 URL kategori remote, parse salary_min (juta) | ✅ (56 lowongan) |
| Quick Apply JobStreet | resume → cover letter → screening (salary-aware) → review → submit; deteksi "sudah dilamar" | ✅ |
| Scan LinkedIn | search URL f_AL=true f_WT=2 (remote) — **scan-only** | ✅ (15 lowongan) |
| Scan Upwork | nx/search — **scan-only**; deteksi sesi expired → tulis ke accounts | ✅ |
| Match scoring | `matcher.js` 0–100: keyword judul +18, deskripsi +6, avoid −35, remote +10 | ✅ |
| Apply engine | `apply-engine.js`: aturan gaji, jawaban screening standar, skip pertanyaan judgment | ✅ |
| Import riwayat | `import-applied` dari halaman my-activity JobStreet (17 lamaran ter-import) | ✅ |
| Gmail tracker | `email/gmail.js` OAuth readonly → classify (interview/rejected/offer/reply) → match ke applications | ✅ modul; ⏳ butuh OAuth client sekali (lihat §8) |
| CLI | `run.js`: scan, apply --job/--auto, bid, sync-email, gmail-auth, import-applied, status, full | ✅ |
| API routes | `/api/hunter/{accounts,jobs,applications,runs,settings,actions}` | ✅ |
| Dashboard | `/hunter` (overview), `/hunter/jobs` (queue + Apply/Skip), `/hunter/applications` (reply badges), `/hunter/settings` | ✅ |

### Fase 2 (belum dibangun)

- **Scheduler** — Windows Task Scheduler / cron menjalankan `node hunter/run.js full` tiap X jam.
- **Notifikasi** — WhatsApp/Telegram saat ada balasan interview atau lowongan match ≥ 80.
- **IMAP fallback** — bila admin Workspace kampus memblokir OAuth app eksternal (app-password + IMAP).
- **Integrasi OpenClaw/Hermes** — bungkus CLI sebagai skill agentskills.io (`SKILL.md` + contoh perintah) agar agent lain bisa memanggil Hunter.
- **Auto-bid Freelancer** — bid otomatis dengan template proposal per-kategori (saat ini bid manual via CLI).
- **Import lengkap** — pagination riwayat JobStreet (baru halaman pertama) + riwayat bid Freelancer via API.

## 5. Arsitektur

```
studio/
├── src/app/hunter/               # dashboard (Next.js App Router, server components)
│   ├── layout.tsx                #   nav + noindex
│   ├── page.tsx                  #   overview: akun, statistik, recent runs
│   ├── jobs/page.tsx             #   antrean lowongan: filter, Apply/Skip/Restore
│   ├── applications/page.tsx     #   lamaran + badge reply_status
│   ├── settings/page.tsx         #   form aturan
│   └── actions-client.tsx        #   client components (tombol aksi → POST /actions)
├── src/app/api/hunter/*/route.ts # REST: baca SQLite, PATCH settings/jobs, POST actions
├── src/lib/hunter.ts             # bridge: createRequire → hunter/db.js (native module
│                                 #   tidak dibundel; next.config: serverExternalPackages)
├── hunter/                       # engine CommonJS (jalan tanpa build: node hunter/run.js)
│   ├── db.js  browser.js  matcher.js  apply-engine.js  run.js
│   ├── platforms/{freelancer,jobstreet,linkedin,upwork}.js
│   ├── email/gmail.js
│   └── secrets/                  # gmail-oauth.json + gmail-token.json (gitignored)
└── data/hunter.db                # SQLite WAL (gitignored)
```

**Alur data**: scan → upsert `jobs` (dedupe platform+external_id) + skor → user approve di dashboard (atau mode auto) → `apply` menulis `applications` → `sync-email` mencocokkan email masuk ke applications → `reply_status` berubah → dashboard menampilkan.

**Aksi dari dashboard** di-spawn sebagai proses detached (`node hunter/run.js …`) — engine butuh Chrome CDP; hasil dicatat di tabel `runs` yang tampil di overview.

## 6. Skema Data (inti)

- `accounts` — platform (unique), username, profile_url, can_auto_apply, login_status (ok|expired|unknown), last_checked, notes
- `jobs` — platform+external_id (unique), title, company, url, salary_min/max (juta IDR; USD utk freelancer), remote, match_score 0–100, status (new|queued|applied|skipped|expired), skip_reason
- `applications` — job_id (nullable utk import), platform, title, company, channel (auto|manual|imported), applied_at, salary_offered, cover_letter, reply_status (silent|replied|interview|rejected|offer), last_reply_at, last_reply_snippet
- `emails` — gmail_id (unique), from_addr, subject, snippet, received_at, application_id, classification
- `runs` — type, platform, started_at, finished_at, ok, stats_json, log
- `settings` — key/value: apply_mode, salary_floor_juta, match_threshold, keywords (JSON), avoid_keywords (JSON)

## 7. Aturan Bisnis (hard requirements)

1. **Gaji**: JANGAN PERNAH menawar di bawah minimum yang tercantum di lowongan. Jawaban = opsi terkecil ≥ max(minimum lowongan, floor Rp 10 jt). Contoh: lowongan "10–15 jt" → jawab 10 jt; tanpa minimum → 10 jt.
2. **Screening standar**: 5 tahun developer, 4 tahun React Native, S1 Sarjana, Bahasa Inggris "Menulis dengan mahir", bahasa EN+ID.
3. **Pertanyaan tak dikenal / judgment** → **skip lowongan** dengan `skip_reason`, jangan menebak.
4. **LinkedIn**: scan-only. Easy Apply terblokir untuk otomasi (6+ teknik gagal) — shortlist manual.
5. **Upwork**: scan-only. Apply butuh Connects berbayar + identity verification.
6. **Mode default `manual`** — user approve tiap lamaran di dashboard; `auto` opt-in via settings.

## 8. Setup Gmail (aksi user, sekali)

1. [Google Cloud Console](https://console.cloud.google.com) → buat project → aktifkan **Gmail API**.
2. OAuth consent screen: External, test user = akun sendiri, scope `gmail.readonly`.
3. Credentials → **OAuth client ID (Desktop app)** → download JSON → simpan sebagai `hunter/secrets/gmail-oauth.json`.
4. `node hunter/run.js gmail-auth` → buka URL, login, paste code → token tersimpan.
5. `node hunter/run.js sync-email` — email diklasifikasi & dicocokkan ke lamaran.

> ⚠️ Akun `andi_agung@student.unismuh.ac.id` adalah Workspace kampus — admin bisa memblokir OAuth app eksternal. Fallback fase 2: IMAP + app password.

## 9. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **ToS platform** melarang otomasi | Akun dibatasi/banned | Rate rendah (aksi manual-paced), mode manual default, tidak paralel, profile Chrome asli (bukan headless farm) |
| Sesi login kedaluwarsa | Scan gagal | `login_status` per akun di DB + tampil merah di dashboard; Freelancer punya auto-relogin GSI |
| Selector/DOM platform berubah | Apply gagal | Kegagalan tercatat di `runs.log`; apply mengembalikan reason, tidak silent-fail |
| OAuth Workspace diblokir admin | Email tracker mati | IMAP fallback (fase 2); klasifikasi tetap jalan dari platform notification email apa pun yang bisa diakses |
| Salah jawab screening | Reputasi | Aturan §7: hanya jawab pertanyaan yang dikenali, sisanya skip |
| DB/token bocor ke git | Kredensial | `.gitignore`: `data/`, `hunter/secrets/`; tidak ada kredensial di kode |

## 10. Metrik Sukses

- **Aktivasi**: scan harian < 2 menit untuk 4 platform (baseline manual: ±30 menit). ✅ terukur ~90 detik.
- **Volume**: ≥ 20 lamaran/bid per minggu dengan effort < 15 menit/hari.
- **Visibilitas**: 100% lamaran punya reply_status; tidak ada lagi "kirim lalu lupa".
- **Kualitas**: 0 lamaran dengan tawaran gaji di bawah minimum lowongan (aturan #1 dijaga mesin).
- **North star**: interview yang didapat per bulan.

## 11. Cara Pakai (ringkas)

```bash
# CLI
node hunter/run.js status                 # akun + counter
node hunter/run.js scan [platform|all]    # scan lowongan
node hunter/run.js apply --job 123        # quick-apply 1 lowongan JobStreet
node hunter/run.js apply --auto --limit 3 # auto-apply match tertinggi
node hunter/run.js bid --project 39x --amount 250 # bid Freelancer
node hunter/run.js import-applied         # import riwayat JobStreet
node hunter/run.js gmail-auth             # OAuth sekali
node hunter/run.js sync-email --days 30   # tarik & cocokkan email
node hunter/run.js full                   # scan all + sync email

# Dashboard
npm run dev  →  http://localhost:3030/hunter
```
