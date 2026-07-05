# Desain: Auto-Fill Form Lamaran via Browser Extension

**Tanggal:** 2026-07-06
**Status:** Disetujui

## Ringkasan

Fitur produk untuk semua user karirku: AI mengisi form lamaran kerja secara otomatis
menggunakan data profil user dari database. Auto-fill berjalan lewat **browser
extension** di browser milik user, sehingga portal ber-login (LinkedIn, JobStreet,
Glints) dan CAPTCHA tertangani secara natural. AI mengisi; **user selalu me-review
dan menekan submit sendiri** — extension tidak pernah men-submit form.

## Keputusan Kunci

| Keputusan | Pilihan |
|---|---|
| Tingkat otomatisasi | Isi otomatis, user review sebelum submit |
| Pemakai | Semua user karirku (fitur produk) |
| Target portal | Semua portal (ATS publik + portal ber-login) |
| Kanal eksekusi | Browser extension karirku (Chrome MV3) |
| Strategi mapping | Adapter deterministik per portal + LLM fallback |

MCP browser tidak dipakai: MCP adalah tool lokal untuk agent developer, tidak bisa
didistribusikan ke end-user produksi.

## Arsitektur

```
┌─────────────────────┐         ┌──────────────────────────┐
│  Browser User        │         │  Server karirku (Next.js) │
│                      │  HTTPS  │                          │
│  Extension karirku   │◄───────►│  API /api/autofill/*     │
│  - content script    │         │  - auth (extension token)│
│  - deteksi form      │         │  - profile data provider │
│  - isi field + UI    │         │  - adapter registry      │
│    review highlight  │         │  - LLM mapper (fallback) │
└─────────────────────┘         │  - Prisma → PostgreSQL   │
                                 └──────────────────────────┘
```

### Alur Kerja

1. User membuka halaman form lamaran (dari tombol Apply di karirku via `sourceUrl`,
   atau membuka URL apa pun secara langsung).
2. Content script mendeteksi form lamaran (heuristik: input nama/email + tombol
   submit/apply, atau URL cocok pola ATS) → menampilkan tombol "Isi dengan Karirku".
3. User klik → extension mengekstrak struktur form: URL, label, `name`, `type`,
   `required`, opsi select/radio.
4. Struktur dikirim ke `POST /api/autofill/map` dengan extension token.
5. Server memilih strategi: URL cocok adapter dikenal → adapter deterministik;
   tidak cocok atau field tersisa → LLM mapper.
6. Server membalas mapping `{ fieldSelector → value }` + `confidence` per field.
7. Extension mengisi form. Field hasil LLM / confidence rendah di-highlight kuning;
   field hasil adapter diberi badge hijau.
8. User memeriksa, mengedit jika perlu, lalu submit sendiri.
9. Extension melapor ke `POST /api/autofill/report` → status tercatat di `Application`.

### Prinsip

- Data profil tidak pernah dikirim mentah ke halaman pihak ketiga — hanya nilai
  yang sudah dipetakan per field.
- Submit selalu oleh user, tidak pernah oleh extension.
- Field tanpa mapping meyakinkan dibiarkan kosong (penanda merah), tidak menebak.

## Komponen 1: Browser Extension

**Teknologi:** Chrome Extension Manifest V3 (kompatibel Edge), TypeScript,
build dengan WXT atau Vite. Lokasi: folder `extension/` di monorepo karirku.

| Komponen | Tugas |
|---|---|
| Content script | Deteksi form, ekstraksi struktur field, pengisian via `element.value` + dispatch event `input`/`change` (agar form React/Vue portal mendeteksi perubahan) |
| Overlay UI | Tombol floating, panel ringkasan hasil, highlight kuning (review), badge hijau (yakin), penanda merah (kosong/gagal) |
| Background service worker | Komunikasi API karirku, penyimpanan token, antrian request |
| Popup | Status login, toggle on/off, link ke profil karirku |

**Autentikasi:** login sekali via popup → redirect OAuth-style ke karirku → server
menerbitkan extension token ber-scope terbatas (baca profil, tulis status aplikasi).
Token disimpan di `chrome.storage.local`.

**Upload CV:** `<input type="file">` diisi lewat `DataTransfer` API — extension
mengunduh file resume user dari `GET /api/autofill/resume` (sumber: tabel
`Resume`/MinIO) lalu menyuntikkan ke input. Jika gagal, panel menampilkan tombol
unduh manual.

**Field esai:** jawaban dibuat LLM di server dari profil user + deskripsi job,
ditandai "✨ dibuat AI — mohon review" dan selalu highlight kuning.

## Komponen 2: Server API

Lokasi: `src/app/api/autofill/`.

| Endpoint | Fungsi |
|---|---|
| `POST /api/autofill/token` | Tukar sesi login → extension token (scope terbatas) |
| `POST /api/autofill/map` | Struktur form + URL → mapping field→value + confidence |
| `POST /api/autofill/report` | Lapor hasil (terisi/disubmit) → update `Application` |
| `GET /api/autofill/resume` | Unduh file CV user untuk injeksi file input |

## Komponen 3: Adapter Registry

Lokasi: `src/lib/autofill/adapters/`, mengikuti pola `src/lib/scraper/providers/`.

```
adapters/
├── greenhouse.ts   // match: boards.greenhouse.io/*/jobs/*
├── lever.ts        // match: jobs.lever.co/*
├── ashby.ts        // match: jobs.ashbyhq.com/*
├── jobstreet.ts
├── glints.ts
└── index.ts        // registry: cari adapter by URL pattern
```

Tiap adapter = peta statis `namaField → path data profil`
(mis. `first_name → profile.firstName`, `linkedin → profile.linkedinUrl`).
Deterministik, tanpa LLM, confidence = 1.0.

## Komponen 4: LLM Mapper (Fallback)

Lokasi: `src/lib/autofill/mapper.ts`. Menggunakan client yang sudah ada di
`src/lib/ai/client.ts` (Ollama dev / vLLM prod).

- Input prompt: struktur form + profil user (JSON).
- Output: JSON mapping + confidence per field.
- Field esai: draf jawaban dibuat dari profil + deskripsi job.

## Perubahan Database (Prisma)

- **Baru** `ExtensionToken`: `userId`, `tokenHash`, `scope`, `expiresAt`.
- **Baru** `AutofillLog`: `userId`, `url`, `portal`, `fieldsTotal`, `fieldsFilled`,
  `method` (adapter/llm), `status` — untuk analitik & debugging.
- **Dipakai ulang** `Application`: pencatatan status lamaran.

## Error Handling

| Kondisi | Penanganan |
|---|---|
| Adapter match sebagian | Sisa field dilempar ke LLM, bukan gagal total |
| LLM timeout/error | Field hasil adapter tetap diisi; sisanya kosong + penanda merah |
| Mapping tidak meyakinkan | Field dibiarkan kosong, tidak menebak |
| Token expired | Popup meminta login ulang |
| Injeksi file gagal | Tombol unduh CV manual di panel |

## Testing

- Unit test adapter dengan fixture HTML form asli (snapshot Greenhouse/Lever/Ashby).
- Test LLM mapper dengan mock client.
- E2E: Playwright memuat fixture form lokal + extension, verifikasi field terisi benar.

## Di Luar Scope Versi Ini

- Auto-submit tanpa review user.
- Firefox/Safari (menyusul setelah Chrome/Edge stabil).
- Bypass CAPTCHA atau anti-bot dalam bentuk apa pun.
- Apply massal/batch otomatis.
