# Karir.ai — SaaS Blueprint

> **AI Career Copilot** untuk Indonesia — nemenin user dari "gak tau mau kemana" sampai dapat kerja/project pertama. Guidance loop: *assess → gap → roadmap → course → ready → apply*. Berbasis AI server sendiri (2× NVIDIA L40S).
>
> **Positioning singkat:** Duolingo-for-Career × Upwork × LinkedIn — disesuaikan konteks Indonesia.

---

## Daftar Isi

1. [Gambaran Produk](#1-gambaran-produk)
2. [Spesifikasi Server & Keunggulan Kompetitif](#2-spesifikasi-server--keunggulan-kompetitif)
3. [Target Pengguna](#3-target-pengguna)
4. [Fitur Core (MVP)](#4-fitur-core-mvp)
5. [Strategi Pengambilan Data](#5-strategi-pengambilan-data)
6. [Arsitektur Teknis](#6-arsitektur-teknis)
7. [AI Stack & Model](#7-ai-stack--model)
8. [Database Schema](#8-database-schema)
9. [Pipeline Data (ETL)](#9-pipeline-data-etl)
10. [Monetisasi](#10-monetisasi)
11. [Go-to-Market Indonesia](#11-go-to-market-indonesia)
12. [Roadmap MVP](#12-roadmap-mvp)

---

## 1. Gambaran Produk

**Karir.ai** adalah **AI Career Copilot** — bukan sekadar job board atau resume builder, tapi pelatih karir AI yang mendampingi user sepanjang perjalanan:

```
User masuk
   ↓
[1] AI ASSESS — skill saat ini + aspirasi karir
   ↓
[2] MARKET SCAN — AI analisis pasar real-time dari scraped jobs
    "Posisi X butuh skill [A,B,C], gaji Rp Y, demand +Z%"
   ↓
[3] GAP ANALYSIS — apa yang kurang vs target role
   ↓
[4] PERSONALIZED ROADMAP — step-by-step path + course recommendation
    (Dicoding, Coursera, YouTube, Prakerja, BuildWithAngga, dll)
   ↓
[5] PROGRESS TRACKING — milestone, gamification, adaptive re-plan
   ↓
[6] READINESS SCORE — "kamu siap apply?" → auto-match ke job/project
   ↓
[7] APPLY — resume tailored + cover letter + proposal freelance
   ↓
[8] LOOP — feedback dari hasil apply kembali ke roadmap
```

### Tiga Segmen Pengguna

- **Fresh graduate & jobseeker** — dituntun dari nol: assess skill, buat roadmap belajar, rekomendasi course, lalu bantu apply ke lowongan yang relevan
- **Freelancer (Upwork-style)** — dipandu membangun portofolio, naik level skill, dapat project sesuai kemampuan, generate proposal otomatis
- **Startup & tim kecil** — posting lowongan gratis + AI screening kandidat (fitur sekunder, support monetisasi)

### Diferensiasi Inti

Kompetitor eksisting hanya menyelesaikan *satu slice*:

| Produk | Fokus | Gap |
|--------|-------|-----|
| Jobstreet / Kalibrr | Listing lowongan | Tidak ada guidance, tidak ada upskilling |
| LinkedIn Learning | Course | Tidak tersambung ke pasar kerja real-time Indonesia |
| Coursera / Dicoding | Course | Tidak tahu course mana yang dibutuhkan pasar user |
| Upwork / Sribulancer | Project freelance | Tidak bantu user *sampai ke* titik siap freelance |
| ChatGPT | Nasihat generik | Tidak ada data pasar, tidak ada progress tracking |

**Karir.ai menyambungkan semuanya dalam 1 loop personal yang data-driven.**

### Keunggulan Teknis

Seluruh AI inference berjalan di **server sendiri** — tidak ada biaya API per-token, data user tidak keluar ke cloud asing, margin bisa 70–80%, dan bisa jalankan enrichment pipeline yang kompetitor kecil tidak mampu.

---

## 2. Spesifikasi Server & Keunggulan Kompetitif

| Komponen | Spesifikasi |
|----------|-------------|
| CPU | 2× Intel Xeon Gold 5418Y (64 cores) |
| RAM | 251 GB |
| GPU | 2× NVIDIA L40S (96 GB VRAM total) |
| Storage | 2 TB SSD |
| OS | Ubuntu 22.04 LTS |

### Apa artinya untuk produk ini?

- Bisa menjalankan **LLaMA 3.3 70B** secara penuh (quantized ~140GB atau tensor parallelism di 2× 48GB)
- Serve **ratusan concurrent users** dengan vLLM + PagedAttention
- **Gross margin tinggi** — tidak ada OpenAI/Anthropic API cost per request
- **Data sovereignty** — nilai jual ke perusahaan yang sensitif terhadap data masuk ke server asing
- Bisa jalankan **enrichment pipeline** yang tidak mampu dilakukan kompetitor kecil

---

## 3. Target Pengguna

### 3.1 Fresh Graduate / Jobseeker

**Pain point:** Tidak tahu cara buat resume yang lolos ATS, tidak tahu harus mulai dari mana, bingung skill apa yang dibutuhkan pasar.

**Value proposition:** AI buatkan resume yang disesuaikan per lowongan + roadmap belajar personal + matching lowongan yang relevan secara semantik.

### 3.2 Freelancer

**Pain point:** Susah cari project yang sesuai skill, tidak tahu harga pasaran, platform existing (Sribulancer, dll) tidak punya fitur matching yang cerdas.

**Value proposition:** AI matching berdasarkan portofolio + skill + riwayat project, bukan sekadar keyword.

### 3.3 Startup / Tim Kecil

**Pain point:** Tidak punya HR, proses screening manual memakan waktu, budget terbatas untuk platform rekrutmen enterprise.

**Value proposition:** Free tier posting lowongan + AI screening kandidat otomatis + ATS ringan yang tidak butuh setup rumit.

---

## 4. Fitur Core (MVP)

> **Prinsip desain:** Semua fitur di bawah adalah *bagian dari satu loop guidance* — bukan fitur terpisah. User seharusnya dituntun dari fitur 4.1 → 4.7 secara natural.

### 4.1 Career Assessment & Goal Setting *(pintu masuk)*

Onboarding adaptif yang menangkap:
- **Status saat ini** — mahasiswa / fresh grad / kerja / freelance / career switch
- **Skill inventory** — self-report + verifikasi via mini-quiz AI + parse CV/LinkedIn PDF
- **Aspirasi** — target role, target timeline, preferensi (remote/onsite, full-time/freelance, gaji)
- **Learning style** — visual/reading/hands-on, budget course (gratis-only vs berbayar), waktu per minggu

**Output:** profil karir awal + vector embedding user.

**Model:** Mistral 7B (wizard interaktif, fast) + nomic-embed/BGE-M3 (profile embedding).

### 4.2 Market Intelligence & Skill Gap Analyzer *(jantung produk)*

Fitur yang membuat Karir.ai berbeda dari kompetitor.

**Cara kerja:**
1. Pipeline scraping + AI enrichment menghasilkan database job terstruktur (skill, level, gaji, lokasi)
2. Saat user set target role (misal "Data Engineer di Jakarta"), sistem agregasi data:
   - Top skill paling sering diminta untuk role tsb (dari ratusan/ribuan lowongan)
   - Median gaji per level (junior/mid/senior)
   - Trend demand 3 bulan terakhir
   - Perusahaan yang sering hiring
3. AI bandingkan skill user vs kebutuhan pasar → **ranked skill gap** dengan:
   - Prioritas (skill A wajib, skill B nice-to-have)
   - Estimasi waktu belajar
   - Impact terhadap readiness score

**UX:** Dashboard "Market Snapshot" — update mingguan, berisi data nyata pasar Indonesia.

**Model:** LLaMA 3.3 70B untuk ekstraksi skill dari job description + aggregasi statistik via SQL.

### 4.3 Personalized Learning Roadmap + Course Recommender

Setelah gap diidentifikasi, AI generate **learning path multi-fase**:

```
Fase 1 (Minggu 1–4): Foundation
  ├─ Skill: Python basics
  ├─ Course pilihan:
  │   · Dicoding "Belajar Dasar Python" (gratis, 20 jam) ⭐ Recommended
  │   · Kelas Terbuka YouTube Playlist (gratis, 15 jam)
  │   · Coursera Python for Everybody (audit gratis)
  ├─ Project latihan: Build CLI todo app
  └─ Milestone check: quiz AI + code review

Fase 2 (Minggu 5–8): ...
Fase 3: Ready to apply
```

**Sumber course yang di-index:**

| Kategori | Sumber |
|----------|--------|
| Gratis ID | YouTube (Kelas Terbuka, Web Programming UNPAS, Sandhika Galih), freeCodeCamp, Dicoding gratis |
| Berbayar ID | Dicoding Pro, BuildWithAngga, Hacktiv8, Binar Academy, RevoU, Purwadhika, MySkill |
| Government | **Prakerja** (subsidized, bisa jadi killer integration) |
| International | Coursera, Udemy, edX, Pluralsight, Scrimba |

**Matching logic:** embedding-based — course di-embed dari (title + skill + deskripsi + level), lalu dicocokkan dengan gap user via cosine similarity. Re-ranking mempertimbangkan budget, rating, durasi, dan learning style.

**Model:** LLaMA 3.3 70B (roadmap synthesis) + embedding (course matching).

### 4.4 Progress Tracker & Adaptive Re-planning

- Weekly check-in: "Sudah selesai modul X?" (push via web + WhatsApp via Fonnte/Wablas)
- Gamification: XP, streak, badge per skill tercapai
- **Adaptive:** kalau user behind schedule, AI rekomendasi cut scope. Kalau ahead, AI tambah advanced material atau mulai job-hunt lebih cepat
- Skill verification: mini-project submission → AI review → skill "verified" tag di profil
- Integration opsional: Coursera/Udemy webhook atau self-report completion + screenshot

**Model:** Mistral 7B (chat check-in) + LLaMA 70B (project review & feedback).

### 4.5 Readiness Score & Smart Job/Project Matching

Gabungan dari konsep job board (4.5) + assessment kesiapan:

- **Readiness Score 0–100** dihitung dari: skill match % + experience relevance + portfolio depth + completed milestones
- Saat user *browse* lowongan, setiap job punya badge "Kamu ready 78%" — bukan sekadar match
- Jika <70%: AI saran "selesaikan course X dulu (3 minggu lagi kamu siap)"
- Jika ≥70%: unlock fitur apply + resume auto-tailor
- Matching tetap berbasis pgvector cosine similarity, tapi di-filter/re-rank oleh readiness

**Model:** Embedding (matching) + LLaMA 70B (penjelasan kenapa cocok / kurang cocok).

### 4.6 Resume, Cover Letter & Proposal Generator

Komponen "apply" dari loop:

- **Mode Job (full-time):** resume tailored per lowongan + cover letter + ATS score
- **Mode Freelance (Upwork-style):** proposal writer untuk project freelance + rate calculator (berapa user harus charge berdasarkan skill, level, durasi, pasar)
- **Mode Portfolio:** compile project-project dari learning path jadi portfolio publik (karirku.ai/@username)
- Output: PDF + shareable link + ATS keyword report

**Model:** LLaMA 3.3 70B (generasi teks panjang & terstruktur).

### 4.7 Feedback Loop & Career Graph

Setelah user apply:
- Track hasil (invited to interview / rejected / ghosted / offered)
- AI analisis pola: "Kamu sering ditolak di role X — kemungkinan gap skill Y"
- Roadmap auto-update berdasarkan hasil nyata
- Data agregat (anonim) jadi insight market: "Conversion rate Data Engineer junior = 12%"

Ini yang bikin produk makin pintar seiring waktu — **compound learning**.

### 4.8 Talent ATS untuk Startup *(fitur sekunder, fase 2)*

Untuk monetisasi sisi employer, bukan fokus utama MVP:

- Startup post lowongan gratis
- Kandidat yang apply otomatis di-screen AI berdasarkan requirements
- Ranking kandidat + summary kelebihan/kekurangan
- Dashboard pipeline sederhana (Applied → Screening → Interview → Offer)

**Catatan:** fitur ini di-geser ke Sprint 7–8 supaya tidak distract dari loop utama guidance.

---

## 5. Strategi Pengambilan Data

### 5.1 Jalur 1 — Scraping Otomatis (Bootstrap, mulai dari sini)

**Tools:** Playwright, Crawlee (Node.js), atau Scrapy (Python)

**Sumber data lowongan formal:**

| Platform | URL | Frekuensi |
|----------|-----|-----------|
| Jobstreet Indonesia | jobstreet.co.id | Harian |
| Kalibrr | kalibrr.com | Harian |
| Glints | glints.com | Harian |
| Karir.com | karir.com | Harian |
| LinkedIn Jobs | linkedin.com/jobs | Harian (rate-limited) |

**Sumber data project freelance:**

| Platform | URL | Frekuensi |
|----------|-----|-----------|
| Sribulancer | sribulancer.com | Harian |
| Projects.co.id | projects.co.id | Harian |
| Fastwork | fastwork.id | Harian |
| Freelancer.co.id | freelancer.co.id | Harian |

**Catatan legal:** Scraping konten publicly visible berada di grey area hukum Indonesia. Mitigasi risiko:
- Rate limit wajar (jangan agresif, max 1 req/2 detik per domain)
- Tidak bypass login/paywall
- Simpan source URL di database
- Tambahkan `User-Agent` yang jelas dan `robots.txt` compliance check

### 5.2 Jalur 2 — Sumber Data Course *(kritis untuk guidance loop)*

Course recommendation butuh database course yang selalu fresh. Sumber:

| Platform | Tipe Akses | Prioritas |
|----------|-----------|-----------|
| **Prakerja** (dashboard.prakerja.go.id) | Open API + katalog | ⭐ Tier 1 — subsidi pemerintah, integration value tinggi |
| Dicoding | Scrape katalog + affiliate | ⭐ Tier 1 — pemain lokal terbesar |
| YouTube (kanal edu ID) | YouTube Data API (playlist) | Tier 1 — konten gratis berkualitas |
| Coursera | Scrape katalog / affiliate API | Tier 2 |
| Udemy | Affiliate API | Tier 2 |
| BuildWithAngga, Hacktiv8, Binar, RevoU, Purwadhika, MySkill | Scrape katalog + partnership outreach | Tier 2 |
| freeCodeCamp, Scrimba, edX | Scrape / public data | Tier 3 |

**Enrichment course (mirror dari enrichment job):** ekstrak skill yang diajarkan, level, prerequisite, durasi, bahasa, lalu embed untuk matching.

**Monetisasi sekunder:** affiliate revenue dari course platform (Dicoding, Udemy, Coursera punya program affiliate 10-30%).

### 5.3 Jalur 3 — Official API & Feed (Medium Term)

| Sumber | Tipe | Catatan |
|--------|------|---------|
| LinkedIn Jobs API | REST API | Perlu apply sebagai partner |
| Sisnaker (Kemnaker) | Open data gov | Data resmi pemerintah |
| Prakerja API | Open API | Data pelatihan & sertifikasi |
| Indeed RSS | RSS Feed | Legal, stabil, gratis |
| Tech in Asia Jobs | RSS/Sitemap | Fokus startup & tech |
| Glints API | Partnership | Butuh negosiasi B2B |

### 5.4 Jalur 4 — User-Generated Content (Long Term Flywheel)

Begitu ada traction, platform sendiri jadi sumber data:

- **Company self-posting** — startup & UMKM posting lowongan gratis, subsidi dengan fitur AI premium
- **Freelancer collab request** — freelancer post "butuh rekan untuk project X"
- **User profile data** — skill, pengalaman, dan preferensi yang diisi user menjadi training signal untuk meningkatkan kualitas matching

**Flywheel effect:** lebih banyak user → lebih banyak data → matching makin akurat → lebih banyak user.

### 5.5 AI Enrichment Pipeline (Keunggulan Utama)

Setiap job/project posting yang masuk diproses otomatis:

```
Raw posting masuk
      ↓
Normalisasi (clean HTML, deduplikasi, ekstrak field)
      ↓
LLaMA extract: skill requirements, level seniority, kategori industri
      ↓
AI score: "skill rarity" di pasar Indonesia
      ↓
Embedding model: generate vector representation
      ↓
pgvector index: siap untuk semantic search & matching
```

---

## 6. Arsitektur Teknis

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND                        │
│         Next.js 15 (App Router)                 │
│     React · TailwindCSS · shadcn/ui             │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                 API GATEWAY                      │
│         Next.js API Routes / tRPC               │
│   Auth (NextAuth) · Rate Limit · Queue          │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              AI ORCHESTRATOR                     │
│   Route task → model yang sesuai (by cost/type) │
│         LangChain / custom router               │
└──────┬───────────────┬───────────────┬──────────┘
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼───────┐
│ LLaMA 3.3   │ │  Embedding  │ │ Mistral 7B  │
│    70B      │ │   Model     │ │  / Phi-4    │
│ Text gen    │ │ nomic-embed │ │ Fast tasks  │
│ Resume, CL  │ │    BGE-M3   │ │ Roadmap     │
└──────┬──────┘ └──────┬──────┘ └─────┬───────┘
       └───────────────▼───────────────┘
┌──────────────────────────────────────────────────┐
│           vLLM Inference Server                  │
│   2× NVIDIA L40S · OpenAI-compatible API        │
│      PagedAttention · Tensor Parallelism        │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│                 DATA LAYER                       │
│  PostgreSQL + pgvector · Redis · MinIO          │
│  BullMQ (job queue) · Prisma ORM               │
└──────────────────────────────────────────────────┘
```

### Stack Lengkap

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15, TailwindCSS, shadcn/ui |
| Backend API | Next.js API Routes / tRPC |
| Auth | NextAuth.js (OAuth Google, GitHub + email) |
| AI Serving | vLLM (self-hosted) |
| AI Orchestration | LangChain.js atau custom router |
| LLM Utama | LLaMA 3.3 70B |
| Embedding | nomic-embed-text / BGE-M3 |
| Fast Inference | Mistral 7B / Phi-4 |
| Database | PostgreSQL 16 |
| Vector Search | pgvector extension |
| Cache & Queue | Redis + BullMQ |
| Storage | MinIO (self-hosted S3-compatible) |
| ORM | Prisma |
| Scraper | Crawlee + Playwright |
| Payment | Midtrans |
| Monitoring | Grafana + Prometheus |
| Deployment | PM2 + Nginx (server sendiri) |

---

## 7. AI Stack & Model

### 7.1 Model Setup di Server

**vLLM installation:**

```bash
pip install vllm
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.3-70B-Instruct \
  --tensor-parallel-size 2 \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.85
```

**Alokasi VRAM (96GB total):**

| Model | VRAM | Kegunaan |
|-------|------|----------|
| LLaMA 3.3 70B (Q4) | ~42GB | Resume gen, cover letter, enrichment |
| nomic-embed-text | ~500MB | Embedding & indexing |
| Mistral 7B | ~8GB | Roadmap, chatbot, fast tasks |
| Buffer | ~45GB | KV cache, concurrent requests |

### 7.2 Endpoint AI (OpenAI-compatible)

```
POST http://localhost:8000/v1/chat/completions   → LLaMA 70B
POST http://localhost:8001/v1/embeddings          → nomic-embed
POST http://localhost:8002/v1/chat/completions   → Mistral 7B
```

### 7.3 Prompt Strategy untuk Resume Builder

```
System: Kamu adalah AI career coach yang ahli membuat resume ATS-friendly 
untuk pasar kerja Indonesia. Format output selalu JSON terstruktur.

User: 
[PROFIL USER]
Nama: {name}
Pengalaman: {experience}
Skill: {skills}

[JOB DESCRIPTION]
{job_description}

Tugas:
1. Analisis kecocokan profil vs job description (0-100)
2. Generate resume yang di-tailor untuk posisi ini
3. List keyword yang perlu dimasukkan (ATS optimization)
4. Generate cover letter 3 paragraf
```

---

## 8. Database Schema

### 8.1 Tabel Utama

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255),
  role        VARCHAR(50) DEFAULT 'jobseeker', -- jobseeker | freelancer | company
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Profile (jobseeker/freelancer)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  headline    TEXT,
  summary     TEXT,
  skills      TEXT[],          -- array of skill names
  experience  JSONB,           -- [{title, company, duration, description}]
  education   JSONB,
  embedding   vector(768),     -- nomic-embed-text dimension
  updated_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON profiles USING ivfflat (embedding vector_cosine_ops);

-- Jobs
CREATE TABLE jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        VARCHAR(100),        -- 'jobstreet' | 'kalibrr' | 'manual'
  source_url    TEXT UNIQUE,
  title         VARCHAR(255) NOT NULL,
  company       VARCHAR(255),
  location      VARCHAR(255),
  type          VARCHAR(50),         -- full-time | part-time | remote | hybrid
  level         VARCHAR(50),         -- junior | mid | senior | lead
  description   TEXT,
  requirements  TEXT[],              -- extracted by AI
  skills        TEXT[],              -- extracted by AI
  salary_min    INTEGER,
  salary_max    INTEGER,
  embedding     vector(768),
  is_active     BOOLEAN DEFAULT true,
  posted_at     TIMESTAMP,
  scraped_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON jobs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON jobs (is_active, posted_at DESC);

-- Projects (freelance)
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        VARCHAR(100),
  source_url    TEXT UNIQUE,
  title         VARCHAR(255) NOT NULL,
  client        VARCHAR(255),
  budget_min    INTEGER,
  budget_max    INTEGER,
  duration_days INTEGER,
  skills        TEXT[],
  description   TEXT,
  embedding     vector(768),
  is_active     BOOLEAN DEFAULT true,
  posted_at     TIMESTAMP,
  scraped_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON projects USING ivfflat (embedding vector_cosine_ops);

-- Applications
CREATE TABLE applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  job_id        UUID REFERENCES jobs(id),
  resume_used   JSONB,          -- snapshot resume yang dipakai
  cover_letter  TEXT,
  status        VARCHAR(50) DEFAULT 'applied',
  applied_at    TIMESTAMP DEFAULT NOW()
);

-- Generated Resumes
CREATE TABLE resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  job_id      UUID REFERENCES jobs(id),  -- null jika general
  content     JSONB,
  ats_score   INTEGER,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Roadmaps (legacy sederhana — tetap dipertahankan untuk output cepat)
CREATE TABLE roadmaps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  goal        TEXT,
  content     JSONB,  -- [{week, tasks, resources}]
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- GUIDANCE LOOP TABLES (inti produk: assess → gap → course → ready)
-- ============================================================

-- Taksonomi skill terstandar (diisi dari hasil enrichment job + kurasi manual)
CREATE TABLE skill_taxonomy (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) UNIQUE NOT NULL,
  slug            VARCHAR(100) UNIQUE,
  category        VARCHAR(50),       -- programming | design | data | marketing | ...
  aliases         TEXT[],            -- 'JS', 'Javascript', 'ECMAScript'
  related_skills  UUID[],            -- graph of skill relationships
  demand_score    FLOAT,             -- computed dari frekuensi di jobs aktif
  avg_salary_idr  INTEGER,
  embedding       vector(1024)       -- BGE-M3 dimension (lihat catatan §7)
);
CREATE INDEX ON skill_taxonomy USING ivfflat (embedding vector_cosine_ops);

-- Skill yang dimiliki user + level & verifikasi
CREATE TABLE user_skills (
  user_id        UUID REFERENCES users(id),
  skill_id       UUID REFERENCES skill_taxonomy(id),
  proficiency    SMALLINT,           -- 1 (pemula) – 5 (expert)
  verified       BOOLEAN DEFAULT false,
  verified_by    VARCHAR(50),        -- 'quiz' | 'project' | 'certificate' | 'self'
  evidence_url   TEXT,
  acquired_at    TIMESTAMP,
  PRIMARY KEY (user_id, skill_id)
);

-- Goal karir user
CREATE TABLE career_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  target_role     VARCHAR(255),      -- 'Data Engineer', 'UI/UX Designer'
  target_track    VARCHAR(50),       -- 'fulltime' | 'freelance' | 'both'
  target_city     VARCHAR(100),
  target_date     DATE,              -- "siap apply" dalam ... bulan
  why             TEXT,
  weekly_hours    SMALLINT,          -- komitmen belajar user per minggu
  budget_idr      INTEGER,           -- budget course per bulan
  status          VARCHAR(30) DEFAULT 'active',  -- active | paused | achieved | abandoned
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Katalog course dari berbagai provider
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          VARCHAR(50),       -- 'dicoding' | 'prakerja' | 'youtube' | 'coursera' | 'udemy' | ...
  source_url      TEXT UNIQUE,
  title           VARCHAR(500) NOT NULL,
  provider        VARCHAR(255),      -- 'Dicoding', 'BuildWithAngga', kanal YouTube, dll
  language        VARCHAR(20),       -- 'id' | 'en'
  level           VARCHAR(30),       -- beginner | intermediate | advanced
  skills_taught   UUID[],            -- references skill_taxonomy
  prerequisites   UUID[],
  duration_hours  FLOAT,
  price_idr       INTEGER,           -- 0 untuk gratis
  is_prakerja     BOOLEAN DEFAULT false,
  affiliate_url   TEXT,              -- link revenue share jika ada
  rating          FLOAT,
  enrollment      INTEGER,
  description     TEXT,
  embedding       vector(1024),
  scraped_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON courses USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON courses (is_prakerja, price_idr);

-- Learning path yang di-generate AI untuk user
CREATE TABLE learning_paths (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id),
  goal_id          UUID REFERENCES career_goals(id),
  phases           JSONB,            -- [{phase, weeks, skill_ids, course_ids, project_brief}]
  total_weeks      INTEGER,
  progress_pct     FLOAT DEFAULT 0,
  readiness_score  INTEGER DEFAULT 0,  -- 0-100
  status           VARCHAR(30) DEFAULT 'active',
  generated_by_model VARCHAR(50),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Milestone dalam learning path (granular tracking)
CREATE TABLE path_milestones (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id        UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  week_number    INTEGER,
  title          VARCHAR(255),
  skill_ids      UUID[],
  course_ids     UUID[],
  project_brief  TEXT,
  status         VARCHAR(30) DEFAULT 'pending',   -- pending | in_progress | done | skipped
  submission_url TEXT,
  ai_feedback    TEXT,
  completed_at   TIMESTAMP
);

-- Market intelligence snapshot per role (di-refresh mingguan)
CREATE TABLE role_market_stats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name         VARCHAR(255),
  city              VARCHAR(100),
  snapshot_date     DATE,
  top_skills        JSONB,           -- [{skill_id, frequency, demand_score}]
  salary_p25        INTEGER,
  salary_p50        INTEGER,
  salary_p75        INTEGER,
  open_positions    INTEGER,
  trend_3mo         FLOAT,           -- % change
  top_companies     TEXT[],
  UNIQUE(role_name, city, snapshot_date)
);

-- Hasil apply (feedback loop)
CREATE TABLE application_outcomes (
  application_id  UUID REFERENCES applications(id) PRIMARY KEY,
  stage_reached   VARCHAR(50),       -- applied | screened | interview | offer | rejected | ghosted
  feedback        TEXT,
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

**Catatan dimensi vector:** Schema lama memakai `vector(768)` (nomic-embed). Jika menggunakan **BGE-M3** (lebih kuat Bahasa Indonesia, dim 1024), seluruh kolom embedding harus `vector(1024)`. Pilih satu model sejak awal — re-embed semua data kalau ganti di tengah jalan sangat mahal.

### 8.2 Fungsi Semantic Search

```sql
-- Cari job yang cocok untuk profil user
CREATE OR REPLACE FUNCTION match_jobs(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 20
)
RETURNS TABLE (id UUID, title TEXT, company TEXT, similarity FLOAT)
LANGUAGE SQL AS $$
  SELECT 
    j.id, j.title, j.company,
    1 - (j.embedding <=> query_embedding) AS similarity
  FROM jobs j
  WHERE j.is_active = true
    AND 1 - (j.embedding <=> query_embedding) > match_threshold
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## 9. Pipeline Data (ETL)

### 9.1 Scraper Service

```typescript
// lib/scraper/jobstreet.ts
import { PlaywrightCrawler } from 'crawlee';

export async function scrapeJobstreet() {
  const crawler = new PlaywrightCrawler({
    requestHandlerTimeoutSecs: 30,
    async requestHandler({ page, request }) {
      await page.waitForSelector('.job-card');
      
      const jobs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.job-card')).map(card => ({
          title: card.querySelector('.job-title')?.textContent?.trim(),
          company: card.querySelector('.company-name')?.textContent?.trim(),
          location: card.querySelector('.location')?.textContent?.trim(),
          url: card.querySelector('a')?.href,
        }));
      });
      
      for (const job of jobs) {
        await processJob(job);
      }
    },
  });

  await crawler.run(['https://www.jobstreet.co.id/jobs']);
}
```

### 9.2 AI Enrichment Service

```typescript
// lib/ai/enrichJob.ts
import { openai } from './client'; // OpenAI-compatible client → vLLM

export async function enrichJob(rawJob: RawJob): Promise<EnrichedJob> {
  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b',
    messages: [{
      role: 'user',
      content: `Ekstrak informasi dari job posting ini. 
      Return JSON dengan format:
      {
        "skills": ["skill1", "skill2"],
        "level": "junior|mid|senior|lead",
        "category": "engineering|design|marketing|...",
        "salary_estimate": {"min": 0, "max": 0},
        "requirements": ["requirement1", ...]
      }
      
      Job posting:
      ${rawJob.description}`
    }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

export async function embedJob(job: Job): Promise<number[]> {
  const text = `${job.title} ${job.company} ${job.skills.join(' ')} ${job.description}`;
  
  const response = await openai.embeddings.create({
    model: 'nomic-embed-text',
    input: text,
  });
  
  return response.data[0].embedding;
}
```

### 9.3 Queue Processing (BullMQ)

```typescript
// lib/queue/jobQueue.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis({ host: 'localhost', port: 6379 });

// Queue scraping harian
export const scraperQueue = new Queue('scraper', { connection: redis });
export const enrichQueue = new Queue('enrich', { connection: redis });

// Worker enrichment
const enrichWorker = new Worker('enrich', async (job) => {
  const rawJob = job.data;
  
  // 1. Normalize
  const normalized = normalizeJob(rawJob);
  
  // 2. AI Enrich
  const enriched = await enrichJob(normalized);
  
  // 3. Embed
  const embedding = await embedJob({ ...normalized, ...enriched });
  
  // 4. Save to DB
  await db.jobs.upsert({
    where: { source_url: normalized.source_url },
    create: { ...normalized, ...enriched, embedding },
    update: { ...enriched, embedding },
  });
}, { connection: redis, concurrency: 5 });

// Jadwal scraping harian jam 06:00 WIB
scraperQueue.add('daily-scrape', {}, {
  repeat: { cron: '0 6 * * *' }
});
```

### 9.4 Market Intelligence Aggregator *(refresh mingguan)*

Job penting untuk mem-power fitur Skill Gap Analyzer & Market Snapshot:

```typescript
// lib/ai/marketIntel.ts
export async function refreshRoleStats(role: string, city: string) {
  // 1. Ambil semua job aktif untuk role+city 3 bulan terakhir
  const jobs = await db.jobs.findMany({
    where: {
      title: { contains: role, mode: 'insensitive' },
      location: { contains: city, mode: 'insensitive' },
      is_active: true,
      posted_at: { gte: threeMonthsAgo }
    }
  });

  // 2. Flatten & count frekuensi skill
  const skillFrequency = countSkills(jobs);

  // 3. Hitung percentile gaji
  const salaries = jobs.filter(j => j.salary_min).map(j => j.salary_min);
  const [p25, p50, p75] = percentiles(salaries, [25, 50, 75]);

  // 4. Trend vs 3 bulan sebelumnya
  const trend = await calcTrend(role, city);

  // 5. Upsert snapshot
  await db.role_market_stats.upsert({
    where: { role_name_city_snapshot_date: { role, city, date: today } },
    create: { role_name: role, city, top_skills: skillFrequency,
              salary_p25: p25, salary_p50: p50, salary_p75: p75,
              trend_3mo: trend, open_positions: jobs.length },
    update: { /* ... */ }
  });
}

// Scheduled weekly: refresh untuk top 50 role × 10 kota utama
marketQueue.add('weekly-market-refresh', {}, {
  repeat: { cron: '0 2 * * 1' }  // Senin jam 2 pagi
});
```

### 9.5 Skill Gap & Learning Path Generator

```typescript
// lib/ai/generatePath.ts
export async function generateLearningPath(userId: string, goalId: string) {
  const [user, goal, userSkills, marketStats] = await Promise.all([
    db.users.findUnique({ where: { id: userId }, include: { profile: true } }),
    db.career_goals.findUnique({ where: { id: goalId } }),
    db.user_skills.findMany({ where: { user_id: userId }, include: { skill: true } }),
    db.role_market_stats.findFirst({
      where: { role_name: goal.target_role, city: goal.target_city },
      orderBy: { snapshot_date: 'desc' }
    })
  ]);

  // 1. Identifikasi gap: skill yang ada di marketStats.top_skills tapi tidak di userSkills
  const gaps = calculateGaps(userSkills, marketStats.top_skills);

  // 2. Untuk tiap skill gap, retrieve top-K course via vector search
  const courseCandidates = await Promise.all(
    gaps.map(g => retrieveCourses(g, { budget: goal.budget_idr, language: 'id' }))
  );

  // 3. LLaMA 70B synthesize roadmap struktur fase + milestone + project
  const roadmap = await llm.generate({
    model: 'llama-3.3-70b',
    systemPrompt: CAREER_COACH_SYSTEM,
    userPrompt: buildRoadmapPrompt({ user, goal, gaps, courseCandidates }),
    responseFormat: { type: 'json_object' }
  });

  // 4. Simpan ke learning_paths + path_milestones
  return await savePath(userId, goalId, roadmap);
}
```

**Prompt strategy (singkat):**
```
System: Kamu career coach AI Indonesia. Buat learning path realistis
berdasarkan (a) gap skill user, (b) course yang tersedia dari KATALOG,
(c) komitmen waktu & budget user. WAJIB hanya pilih course dari
KATALOG yang diberikan (anti-hallucination). Output JSON.

User: [konteks user] [gap skill] [katalog course top-20 per skill]
[constraint: 10 jam/minggu, budget 200rb/bulan, bahasa Indonesia]
```

**Anti-hallucination:** AI hanya boleh refer course yang di-retrieve dari DB (RAG pattern). Validasi output: cek setiap `course_id` yang disebut AI benar-benar ada di katalog.

---

## 10. Monetisasi

### 10.1 Pricing Tiers

| Tier | Harga | Target | Fitur |
|------|-------|--------|-------|
| **Free** | Rp 0 | Semua | 3 resume gen/bulan, job search, basic matching |
| **Pro** | Rp 99.000/bulan | Jobseeker aktif | Unlimited resume & CL gen, roadmap personal, priority matching |
| **Freelancer** | Rp 149.000/bulan | Freelancer | Pro + project matching advanced, portofolio AI review |
| **Startup S** | Rp 499.000/bulan | Startup 1-10 org | 5 job posting, AI screening, ATS basic |
| **Startup M** | Rp 1.500.000/bulan | Tim 10-50 org | 20 job posting, AI screening advanced, talent search |
| **Enterprise** | Custom | Perusahaan besar | Unlimited, custom integration, dedicated support |

### 10.2 Revenue Streams Tambahan

- **API Access (B2B)** — perusahaan lain bisa akses AI resume/matching via API (token-based billing)
- **Featured listing** — startup bisa boost lowongan mereka di hasil pencarian
- **Talent sourcing** — HR perusahaan bayar per kontak freelancer/jobseeker yang dihubungi

### 10.3 Unit Economics (Estimasi)

| Metric | Nilai |
|--------|-------|
| Server cost/bulan | ~Rp 5–8 juta (listrik + bandwidth) |
| Break-even (Pro plan) | ~80 subscriber Pro |
| Target MRR bulan ke-6 | Rp 15–25 juta |
| Target MRR bulan ke-12 | Rp 50–100 juta |

---

## 11. Go-to-Market Indonesia

### 11.1 Phase 1 — Makassar & Sulawesi (Bulan 1–3)

- **Distribusi:** Komunitas kampus Unhas, Unismuh, UMI, UIN Alauddin
- **Channel:** Instagram, LinkedIn, Telegram grup mahasiswa IT Sulawesi
- **Tactic:** Free workshop "Cara Buat Resume yang Lolos ATS" → upsell ke Pro
- **Target:** 500 user pertama, 30 subscriber Pro

### 11.2 Phase 2 — Indonesia Timur (Bulan 4–6)

- Ekspansi ke Manado, Palu, Kendari via komunitas digital lokal
- Partnership dengan bootcamp coding & kampus vokasi
- Konten LinkedIn/Instagram tentang tips karir → organic traffic
- **Target:** 5.000 user, 200 subscriber berbayar

### 11.3 Phase 3 — Nasional (Bulan 7–12)

- SEO konten karir + resume tips dalam Bahasa Indonesia
- Partnership dengan platform LMS (Dicoding, Buildwithangga)
- Outreach ke startup-startup yang butuh hiring tool murah
- **Target:** 25.000 user, 1.000+ subscriber berbayar

### 11.4 Positioning vs Kompetitor

| Platform | Kelemahan | Karir.ai Menang Di |
|----------|-----------|-------------------|
| Jobstreet | Tidak ada AI, hanya listing | Smart matching, resume tailoring |
| LinkedIn | Mahal, tidak lokal | Harga terjangkau, konteks Indonesia |
| Glints | Tidak ada resume builder | Full-stack karir tool |
| Kalibrr | Tidak ada freelance | Cover semua segmen |
| Sribulancer | Tidak ada job formal | Bridge formal + freelance |

---

## 12. Roadmap MVP

> **Prinsip roadmap:** bangun **guidance loop minimal end-to-end** di sprint awal (meski kasar), baru polish. Hindari build resume builder yang cantik tapi tanpa loop — user akan pakai sekali lalu pergi.

### Sprint 1–2 (Minggu 1–4) — Foundation

- [ ] Setup server: Ubuntu 22.04, Nginx, PostgreSQL + pgvector, Redis, MinIO
- [ ] Deploy vLLM dengan LLaMA 3.3 70B + Mistral 7B (benchmark concurrent users riil)
- [ ] Setup Next.js 15 project + NextAuth (Google OAuth + email)
- [ ] Database schema lengkap + Prisma migrations (termasuk guidance loop tables)
- [ ] Scraper v1: Jobstreet + Kalibrr + Glints
- [ ] Scraper v1 course: Dicoding + Prakerja + YouTube playlist edukasi

### Sprint 3–4 (Minggu 5–8) — Guidance Loop MVP (end-to-end)

- [ ] Onboarding wizard: skill inventory + goal setting (fitur 4.1)
- [ ] AI enrichment pipeline: ekstrak skill dari job & course
- [ ] Embedding pipeline (BGE-M3 atau nomic) + pgvector index
- [ ] Market Intelligence aggregator (skill frequency + gaji stats)
- [ ] **Skill Gap Analyzer** — view "apa yang kamu kurang"
- [ ] **Learning Path Generator** v1 (fitur 4.3) — output roadmap + course list
- [ ] Dashboard user: profil, goal, path aktif

### Sprint 5–6 (Minggu 9–12) — Tracking & Apply

- [ ] Progress tracker + milestone check-in (fitur 4.4)
- [ ] Skill verification mini-quiz (AI-generated)
- [ ] WhatsApp notification integration (Fonnte/Wablas) — weekly nudge
- [ ] Readiness Score calculation (fitur 4.5)
- [ ] Smart job matching berbasis readiness + embedding
- [ ] Resume Builder + Cover Letter tailored per job (fitur 4.6)
- [ ] Application tracker + outcome logging (feedback loop fitur 4.7)

### Sprint 7–8 (Minggu 13–16) — Freelance Path & Monetisasi

- [ ] Scraper freelance: Sribulancer, Projects.co.id, Fastwork
- [ ] Proposal writer + rate calculator (freelance side fitur 4.6)
- [ ] Portfolio publik (karirku.ai/@username)
- [ ] Midtrans integration + QRIS/GoPay/VA/ShopeePay
- [ ] Paywall Pro tier + trial flow
- [ ] Referral program
- [ ] Beta launch: 50–100 user onboarded manual, NPS survey

### Sprint 9–10 (Minggu 17–20) — Startup/Employer Side (monetisasi kedua)

- [ ] Company registration + job posting form (fitur 4.8)
- [ ] AI candidate screening + ranking
- [ ] Basic ATS pipeline
- [ ] Featured listing (boost berbayar)
- [ ] Security audit + load test + legal review sebelum public launch
- [ ] Public launch Sulawesi

### Kriteria "Go / No-Go" per sprint

- **Setelah Sprint 4:** minimal 1 user internal bisa jalan full loop (onboard → gap → roadmap). Jika tidak, STOP & simplifikasi.
- **Setelah Sprint 6:** 10 beta tester close-loop (apply dan dapat feedback). Jika retention Week-2 <30%, re-evaluasi guidance quality.
- **Setelah Sprint 8:** Conversion free→Pro ≥3%. Jika tidak, pricing/packaging salah.

---

## Referensi & Resource

### Model AI
- [LLaMA 3.3 70B](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- [nomic-embed-text](https://huggingface.co/nomic-ai/nomic-embed-text-v1)
- [BGE-M3](https://huggingface.co/BAAI/bge-m3) — support Bahasa Indonesia
- [vLLM Docs](https://docs.vllm.ai)

### Infrastruktur
- [pgvector](https://github.com/pgvector/pgvector)
- [BullMQ](https://docs.bullmq.io)
- [Crawlee](https://crawlee.dev)
- [MinIO](https://min.io)

### Indonesia Job Market
- [Sisnaker API](https://sisnaker.kemnaker.go.id)
- [Data Prakerja](https://dashboard.prakerja.go.id)

---

*Dokumen ini dibuat sebagai blueprint awal. Setiap bagian akan diiterasi berdasarkan feedback pengguna dan validasi pasar.*

*Versi: 1.0 | Dibuat: April 2026*
