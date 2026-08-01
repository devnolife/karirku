# KUMPULAN TES USER / TES TEKNIS SEBELUMNYA — Persiapan Interview User GSI (AI Engineer)

> Interview User Offline — Selasa, 21 Juli 2026, 14.00 WITA
> Head Office PT GSI, Jl. A. P. Pettarani No.80, Makassar. **Bawa laptop!**

Rekap semua tes/screening teknis yang pernah kamu hadapi, apa isinya, dan pelajarannya untuk besok.

---

## 1. InterOpera Pte. Ltd. (Singapura) — Take-Home DevOps/MLOps ⭐ PALING RELEVAN
- **Posisi**: DevOps / MLOps Engineer · **Bentuk**: take-home project 7 hari (estimasi 22–28 jam)
- **Skenario**: klien fiktif "Meridian Asset Management" — deploy LLM model-server dengan *gated delivery*:
  - Model v1.0 baseline, v1.1 quantized (~40% lebih cepat, akurasi sama → gate harus PROMOTE), v2.0 fine-tune regresi (jawaban salah + stall 2.5s → gate harus ROLLBACK)
  - Diminta: canary deployment → evaluasi otomatis → promote/rollback, RAG service (Qdrant + embedding lokal), monitoring/healthz/readyz
- **Hasil kerjaanmu**: https://github.com/devnolife/interopera-platform (private, 38 file)
  - Lokasi lokal: `studio\devops\interopera-platform\` + brief: `studio\devops\homework_brief_devops.pdf`
- **Kenapa relevan untuk GSI**: ini bukti konkret kamu bisa RAG + eval + deployment AI end-to-end. **Buka repo ini di laptop besok — bisa jadi bahan demo.**

## 2. Taiwan Mobile Indonesia (ORBIT) — Survey 32 Soal + Technical & Coding Test
- **Posisi**: Remote Developer · **Bentuk**: survei seleksi 32 pertanyaan → lolos → tes teknis 2 sesi
- **Isi survei**: pengalaman, gaji, penggunaan AI dalam SDLC (Copilot/Cursor/Claude — kamu jawab lengkap workflow-nya), 3 proyek terkompleks (jawabanmu: SINTEKMu, SaaS Guru Pintar, +1), kesediaan Technical & Coding Test
- **Format tesnya**: 2 sesi, aturan **no-AI/no-internet**, gaya algoritma + praktik
- **Artefak**: dulu ada `SURVEY-taiwan-mobile.md` & `persiapan-test.html` (app persiapan 6 tab: briefing, rencana 6 hari, latihan) — file sudah tidak ada di studio (kemungkinan terhapus saat reorganisasi)
- **Pelajaran untuk GSI**: siapkan cerita 3 proyek terkompleks versi lisan; kalau tes coding on-site kemungkinan tanpa AI — latih menulis kode polos.

## 3. AVOWS Technologies — Interview Golang (prep lengkap masih ada)
- **Bentuk**: interview teknis Golang
- **Artefak MASIH ADA**: `karirku\data\interview-prep-avows.html` — 21 seksi materi (goroutine, channel, dll) dengan format "Bilang begini" (skrip jawaban lisan) + analogi
- **Pelajaran untuk GSI**: formatnya bagus ditiru — jawaban teknis yang siap diucapkan, bukan cuma teori.

## 4. APAC VLA Project (Freelancer) — Screening Chat Berantai
- **Bentuk**: pertanyaan screening satu-per-satu via chat (Inggris): pemahaman proyek (anotasi video untuk training model VLA/robotik), kecocokan skill, pengalaman data-labeling (jawabanmu jujur: developer dengan pengalaman labeling via Aethra), lokasi/timezone
- **Pelajaran untuk GSI**: pola jawab jujur + kaitkan ke portofolio nyata selalu berhasil melewati screening.

## 5. Atech Solution (HK) — Screening Senior SWE / Tech Lead
- **Bentuk**: pertanyaan via chat (Nova): rating English Oral (kamu jawab 6/10) & Written (7/10), konfirmasi semua kode/dokumentasi berbahasa Inggris
- **Pelajaran untuk GSI**: interview GSI kemungkinan Bahasa Indonesia (perusahaan Makassar), tapi siapkan istilah teknis Inggris.

## 6. Cyber Olympus — Python Developer (via Threads)
- **Bentuk**: lamaran email + balasan HR; sesi lama juga mencakup edukasi deteksi scam untuk tawaran seperti ini
- **Pelajaran**: verifikasi legitimasi perusahaan — GSI sudah terverifikasi (kantor fisik Pettarani, domain gsicorp.co.id ✓).

## 7. Screening ringan lainnya (JobStreet/LinkedIn)
- Jackson Ventures (AI Engineer — Automation Systems) — applied, tanpa tes
- ASTRO (Senior Backend Go) — pertanyaan gaji (jawaban: Rp 18–25 jt, negotiable)
- Pola pertanyaan berulang: tahun pengalaman (5 thn dev, 4 thn mobile), pendidikan (S1), gaji (floor 10 jt), English proficiency

---

# PREDIKSI INTERVIEW USER GSI BESOK — berdasarkan pola di atas

**Yang hampir pasti ditanya (deep-dive portofolio):**
1. "Ceritakan proyek AI yang pernah kamu bangun" → **fokusngajar.id + core-llm**: Go 1.25, chi v5, RAG pipeline (PDF ingestion → chunking → embedding → retrieval), go-openai, rate limiting, metrics, Docker multi-stage. LIVE production.
2. "Apa itu RAG? Kenapa tidak fine-tuning?" → jawab dari pengalaman nyata core-llm + InterOpera (kamu pernah bikin gate yang menolak fine-tune v2.0 yang regresi!)
3. "Bagaimana menangani hallucination / jawaban salah?" → retrieval grounding, eval otomatis (pengalaman InterOpera), guardrail prompt
4. "Bagaimana kontrol biaya token?" → rate limiting x/time, caching, pemilihan model
5. Full-stack pendukung: SINTEKMu (dashboard multi-peran), Saku Sultan (mobile live 2 store)

**Kemungkinan praktik di laptop:**
- Demo aplikasi → siapkan **fokusngajar.id (live)** + repo core-llm & interopera-platform (login GitHub dulu!)
- Live coding kecil (Python/Go/JS) — kemungkinan tanpa AI assistant
- Studi kasus: "bangun chatbot/AI untuk bisnis GSI" → tanya dulu use case-nya, jawab dengan arsitektur RAG standar yang sudah kamu kuasai

**Checklist H-1 (malam ini):**
- [ ] Charge laptop + bawa charger
- [ ] Hotspot HP siap (jangan andalkan WiFi kantor)
- [ ] Login GitHub, buka tab: core-llm, interopera-platform, sakti-dashboard, fokusngajar.id live
- [ ] Baca ulang `karirku\data\interview-prep-avows.html` (format jawaban lisan)
- [ ] Cerita 3 proyek terkompleks siap diucapkan (SINTEKMu, Saku Sultan, core-llm/fokusngajar)
- [ ] Jawaban gaji siap: sesuai pola lama → sebutkan range, jangan angka mati
- [ ] Berangkat lebih awal — target tiba 13.30 WITA
