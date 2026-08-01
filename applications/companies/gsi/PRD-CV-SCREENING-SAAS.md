# PRD — SaaS AI CV Screening ("CandidAI" — nama kerja)

> Draft v1 · 21 Juli 2026 · Andi Agung Dwi Arya (devnolife)
> Konteks: hasil interview user GSI (PT Gunung Samudera Internasional) — mereka ingin aplikasi rekrutmen AI berbentuk SaaS yang saat HR me-review CV langsung tahu kandidat mana yang bagus.

---

## 1. Ringkasan Produk

**Masalah:** HR menerima ratusan CV per lowongan. Screening manual lambat (2–5 menit/CV), tidak konsisten antar reviewer, dan kandidat bagus sering terlewat.

**Solusi:** Platform SaaS di mana HR membuat lowongan (job description + kriteria), meng-upload CV massal, dan sistem AI otomatis:
1. Mem-parse CV (PDF/DOCX/gambar) menjadi data terstruktur
2. Menilai kecocokan CV terhadap JD → **skor 0–100 + alasan + red flags**
3. Menampilkan **ranking kandidat** yang bisa difilter, dibandingkan, dan di-shortlist

**Nilai jual utama:**
- Self-hosted LLM → data CV kandidat **tidak keluar ke pihak ketiga** (privasi = selling point kuat untuk perusahaan Indonesia)
- Biaya inference ≈ nol (GPU sendiri), margin SaaS sehat
- Penjelasan skor transparan (bukan black box) → HR tetap pegang keputusan akhir

## 2. Target Pengguna & Persona

| Persona | Kebutuhan |
|---|---|
| **HR Recruiter** (pengguna harian) | Upload CV cepat, lihat ranking, filter, catatan, ubah status kandidat |
| **Hiring Manager** (user teknis) | Review shortlist, compare kandidat side-by-side, beri feedback |
| **HR Admin / Owner** (per perusahaan) | Kelola anggota tim, template rubrik, branding, billing |
| **Super Admin** (kita/operator SaaS) | Kelola tenant, kuota, monitoring, model management |

## 3. Fitur

### MVP (fase 1 — target 3–4 minggu efektif)
| # | Fitur | Detail |
|---|---|---|
| F1 | Auth & multi-tenant | Register org → workspace terisolasi. Login email+password, role: admin/recruiter. |
| F2 | Manajemen lowongan | CRUD job: judul, deskripsi, requirement, bobot kriteria (skill, pengalaman, pendidikan, dll). |
| F3 | Upload CV massal | Drag-drop multi file (PDF/DOCX), progress per file, dedup by hash. |
| F4 | Parsing CV → profil terstruktur | Nama, kontak, ringkasan, skills[], pengalaman[] (perusahaan, posisi, durasi), pendidikan[], sertifikasi[], bahasa. |
| F5 | **AI Scoring** | Skor total 0–100 + breakdown per kriteria + alasan naratif + red flags (gap karir, job-hopping, mismatch lokasi/gaji) + confidence. |
| F6 | Dashboard ranking | Tabel kandidat sortable by skor, filter (skor min, skill wajib, pendidikan), status pipeline (new → shortlist → interview → offer → reject). |
| F7 | Detail kandidat | Split view: CV asli (PDF viewer) ↔ hasil ekstraksi + skor. HR bisa koreksi/override skor. |
| F8 | Kuota & paket | Free trial (mis. 50 CV), paket bulanan by jumlah CV/bulan. Enforcement kuota. |

### Fase 2 (post-MVP)
- Semantic search kandidat lintas lowongan ("cari yang pernah pakai Kafka") — pakai embeddings (pgvector)
- Talent pool: kandidat lama otomatis dicocokkan ke lowongan baru
- Email otomatis ke kandidat (terima/tolak/undang interview) — template + SMTP
- Public job page + apply form (kandidat upload sendiri → langsung terskor)
- Compare 2–4 kandidat side-by-side dengan analisis LLM
- Export laporan PDF/Excel
- Integrasi: webhook, API publik, (nanti) job board

### Non-goals (v1)
- Video interview / asesmen psikometri
- Auto-reject tanpa review manusia (etika + regulasi: AI hanya *assist*)
- Mobile app

## 4. Arsitektur

### 4.1 Topologi (memakai infra existing)

```
                    Internet
                       │
        ┌──────────────▼──────────────┐
        │  VPS (103.151.145.21)       │
        │  nginx (SSL, domain baru)   │
        │  ┌─────────────────────┐    │
        │  │ Next.js App (pm2)   │    │  ← dashboard HR + API routes
        │  └──────────┬──────────┘    │
        │  ┌──────────▼──────────┐    │
        │  │ PostgreSQL 16       │    │  ← multi-tenant data + pgvector
        │  │ + pgvector          │    │
        │  └─────────────────────┘    │
        │  ┌─────────────────────┐    │
        │  │ Worker (BullMQ/     │    │  ← antrian parsing & scoring
        │  │ Redis)              │    │
        │  └──────────┬──────────┘    │
        └─────────────┼───────────────┘
                      │ SSH tunnel permanen (autossh+systemd, SUDAH ADA)
        ┌─────────────▼───────────────┐
        │  hc-ai (10.33.33.11)        │
        │  Ubuntu 22.04, 64 core,     │
        │  251 GiB RAM                │
        │  2× NVIDIA L40S (92GB VRAM) │
        │  ┌─────────────────────┐    │
        │  │ vLLM (OpenAI-compat)│    │  ← Qwen2.5-32B-Instruct (GPU 0)
        │  │  /v1/chat/completions   │
        │  ├─────────────────────┤    │
        │  │ TEI / embedding svc │    │  ← bge-m3 (share GPU 1)
        │  ├─────────────────────┤    │
        │  │ (opsional) OCR svc  │    │  ← PaddleOCR utk CV hasil scan
        │  └─────────────────────┘    │
        └─────────────────────────────┘
```

Kenapa vLLM (bukan Ollama saja): batch scoring puluhan CV paralel butuh continuous batching + throughput; vLLM expose API OpenAI-compatible → kode klien standar. Ollama tetap bisa dipakai untuk eksperimen model.

### 4.2 Pipeline scoring (per CV)

```
Upload → simpan file (disk VPS / MinIO)
  → [Q] extract-text     : pdf-parse / mammoth; kalau hasil kosong → OCR
  → [Q] parse-structured  : LLM call #1 → JSON profil (schema ketat, temperature 0)
  → [Q] score             : LLM call #2 → input: profil JSON + JD + rubrik bobot
                            output: { total, per_criteria[], reasons[], red_flags[], confidence }
  → [Q] embed             : bge-m3 → vector profil → pgvector (untuk search, fase 2)
  → update status kandidat + push notif realtime ke dashboard (SSE)
```

Prinsip penting:
- **2 LLM call terpisah** (parse dulu, baru score) → lebih akurat & hasil parse reusable lintas lowongan
- **Structured output** (JSON schema / grammar-constrained di vLLM) → tidak ada parsing regex rapuh
- **Skor bukan angka tunggal dari LLM**: LLM menilai per kriteria (0–10) → total dihitung deterministik dari bobot rubrik → konsisten & auditable
- Simpan prompt + raw response per scoring → audit trail (penting untuk kepercayaan HR)

### 4.3 Data model inti (multi-tenant, semua tabel ber-`org_id`)

```
orgs(id, name, plan, quota_cv_month, ...)
users(id, org_id, email, role, ...)
jobs(id, org_id, title, description, status, rubric_json, ...)
candidates(id, org_id, name, email, phone, profile_json, embedding vector, file_url, file_hash, ...)
applications(id, job_id, candidate_id, score_total, score_breakdown_json,
             red_flags_json, ai_reasons, status, reviewer_note, scored_at, ...)
scoring_logs(id, application_id, model, prompt_tokens, output_tokens, latency_ms, raw_response, ...)
usage_counters(org_id, month, cv_processed)
```

Isolasi tenant: filter `org_id` di level query + Postgres RLS sebagai lapis kedua.

### 4.4 Model AI

| Tugas | Model | Penempatan |
|---|---|---|
| Parse CV → JSON | Qwen2.5-32B-Instruct (AWQ/GPTQ) — kuat bahasa Indonesia + JSON | L40S #0, vLLM |
| Scoring vs JD | model yang sama (satu deployment, beda prompt) | L40S #0 |
| Embedding | bge-m3 (multilingual, 1024 dim) | L40S #1 (sisa VRAM banyak) |
| OCR CV scan | PaddleOCR / docTR | CPU (64 core) atau L40S #1 |

Kapasitas kasar: Qwen 32B AWQ di 1× L40S ≈ 30–60 CV scoring/menit dengan batching — jauh di atas kebutuhan pilot.
⚠️ Prasyarat: **bersihkan disk hc-ai dulu** (78% terpakai; butuh ±25 GB untuk model 32B AWQ + embedding).

## 5. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend + API | **Next.js 15 (full-stack, App Router)** | 1 codebase, cepat MVP, pola sudah terbukti (fokusngajar, sakti-dashboard) |
| ORM | Prisma | familiar, migrasi rapi |
| Queue | BullMQ + Redis | job async parsing/scoring, retry, prioritas |
| DB | PostgreSQL 16 + pgvector | multi-tenant + vector search |
| Auth | NextAuth / Lucia (credentials + invite) | |
| Storage file CV | disk VPS (MVP) → MinIO (scale) | |
| LLM serving | vLLM (OpenAI-compatible) di hc-ai | throughput + structured output |
| Realtime | SSE | progress upload & scoring |
| Deploy | pm2 + nginx di VPS (pola existing) | |

> Alternatif Go backend (pola core-llm) tetap terbuka — tapi untuk MVP, Next.js full-stack lebih cepat; worker BullMQ bisa diganti service Go nanti tanpa ubah kontrak.

## 6. Keamanan & Privasi
- CV = PII. Enkripsi at-rest disk, HTTPS, akses file lewat signed URL ber-expiry
- Data tidak pernah keluar infra sendiri (LLM self-hosted) → tulis eksplisit di marketing
- Retensi: auto-delete CV setelah N hari (configurable per org) — selaras UU PDP
- Rate limit per org; audit log aksi user
- Disclaimer produk: skor AI = alat bantu, keputusan tetap di manusia (mitigasi bias)

## 7. Model Bisnis (draf)

| Paket | Harga/bln | CV/bulan | Fitur |
|---|---|---|---|
| Trial | Rp 0 | 50 | 1 job aktif |
| Starter | Rp 500rb | 300 | 5 job, 3 user |
| Growth | Rp 1,5jt | 1.500 | unlimited job, 10 user, API |
| Enterprise | custom | custom | on-premise/deploy khusus, SLA |

Biaya operasional ≈ VPS existing (sudah dibayar) + listrik/akses hc-ai → **hampir semua revenue = margin**. Kalau GSI jadi klien pertama → paket Enterprise/custom.

## 8. Roadmap MVP (estimasi kerja efektif)

| Minggu | Deliverable |
|---|---|
| 1 | Skeleton Next.js + Prisma + auth + multi-tenant, CRUD jobs, upload CV + storage, deploy dasar (subdomain + pm2) |
| 2 | Worker pipeline: extract → parse LLM → JSON profil; setup vLLM + model di hc-ai; scoring engine + rubrik |
| 3 | Dashboard ranking + detail kandidat (PDF viewer + hasil AI), status pipeline, SSE progress |
| 4 | Kuota/paket, polishing UX, seed data demo, pengujian dengan CV nyata, landing page |

**Demo target:** upload 30 CV dummy ke 1 lowongan "AI Engineer" → ranking muncul < 2 menit dengan alasan per kandidat.

## 9. Metrik Sukses
- Parsing accuracy: field utama (nama, skill, pengalaman) benar ≥ 95% pada sampel 50 CV
- Scoring agreement: korelasi ranking AI vs ranking HR manusia ≥ 0,7 (uji dengan HR sungguhan)
- Latensi: 1 CV terskor < 20 detik p95; batch 50 CV < 3 menit
- Uptime pipeline ≥ 99% (fallback: kalau hc-ai down, job antri — tidak hilang)

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Tunnel VPS↔hc-ai putus / hc-ai maintenance kampus | Queue persisten (job antri, auto-resume); opsional fallback API cloud sebagai emergency switch |
| Disk hc-ai penuh (78%) | Bersihkan sebelum mulai; model & cache di path termonitor; alert disk >85% |
| CV format aneh (scan, kolom 2, bahasa campur) | OCR fallback + eval set 50 CV beragam sejak minggu 2 |
| Bias AI terhadap kandidat | Skor per kriteria transparan, tidak pakai atribut sensitif (gender/umur/foto) dalam prompt scoring |
| Ketergantungan server kampus untuk produk komersial | Jangka panjang: L40S sewa/colo atau GPU cloud on-demand saat revenue masuk; arsitektur sudah OpenAI-compatible jadi portabel |
```

---

*Dokumen hidup — revisi setelah diskusi lanjutan dengan GSI / validasi kebutuhan nyata HR.*
