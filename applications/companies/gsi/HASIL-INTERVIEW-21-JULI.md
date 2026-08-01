# Hasil Interview User GSI — Selasa, 21 Juli 2026

**Status: BERHASIL / positif** ✅

## Proyek yang mau dibangun GSI
**SaaS AI CV Screening / Recruitment**
- Aplikasi rekrutmen berbasis AI
- Saat HR review CV, sistem langsung menilai & menunjukkan kandidat mana yang bagus (scoring/ranking otomatis)
- Konsep SaaS (multi-tenant, bisa dipakai banyak perusahaan/HR)

## Relevansi dengan portofolio devnolife
- `core-llm` (Go) — pipeline RAG: PDF ingestion → chunk → embed → retrieve. CV parsing pakai pola yang sama.
- fokusngajar.id — bukti bisa bangun & operasikan produk LLM production + hitung biayanya (/cost).
- Strategi biaya yang dibahas di interview: VPS ~Rp 4jt/bln, inference bisa pakai open model (HPC kampus) → biaya AI hampir nol.

## Kemungkinan arsitektur kasar (buat diskusi lanjutan)
1. Upload CV (PDF/DOCX) → parse & extract terstruktur (nama, skill, pengalaman, pendidikan)
2. Job description → kriteria/rubrik penilaian
3. LLM scoring: match CV vs JD → skor + alasan + red flags
4. Dashboard HR: ranking kandidat, filter, compare, shortlist
5. Multi-tenant SaaS: org/workspace, kuota, billing

## Next steps
- Tunggu kabar offering/tahap berikutnya dari HR (hr.recruitment@gsicorp.co.id, cc zaha@gsicorp.co.id)
- Kalau diminta: bisa siapkan prototipe/proposal arsitektur CV screening
