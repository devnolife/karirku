# Full-Stack Developer Intern (Remote) — via lowongan@emailkerja.com

> **Status: ✅ TERKIRIM — 1 Agustus 2026, 23:04 WITA.**
> Terverifikasi: tepat **1 salinan** di folder Terkirim Gmail (tidak dobel).
> Tercatat di `data/hunter.db` → job **2236** (`applied`), application **45** (`silent`).

**Dikirim dari:** `andi_agung@student.unismuh.ac.id` ⚠️ (lihat catatan di bawah)
**Tujuan:** lowongan@emailkerja.com
**Subjek:** `Fullstack Intern – Andi Agung Dwi Arya` (format persis diminta posting)
**Lampiran:** `CV-Andi-Agung-Dwi-Arya.pdf` (277 KB) ✅
**Draft:** `applications/letters/emailkerja-fullstack-intern.mail.json`
**Bukti:** `data/mail-emailkerja-fullstack-intern.png` (sebelum kirim) · `-sent.png` (sesudah)

---

## ⚠️ Tindak lanjut yang WAJIB kamu lakukan

Email terkirim dari **akun kampus** (`andi_agung@student.unismuh.ac.id`) karena
Gmail pribadi belum login dan kamu memilih "send saja".

Inbox itu punya **24.012 email belum dibaca** — balasan mereka sangat mungkin
terkubur. Mitigasi yang sudah dipasang di badan email:

> "Catatan kecil: email ini terkirim dari alamat kampus saya. Untuk balasan,
> mohon diarahkan ke andiagung193@gmail.com — alamat itu yang tercantum di CV
> saya dan yang saya pantau setiap hari."

**Tetap lakukan salah satu ini:**
1. Pasang **filter/forward** di Gmail kampus: dari `@emailkerja.com` → teruskan ke `andiagung193@gmail.com` (paling aman), **atau**
2. Cek manual inbox kampus dengan pencarian `from:emailkerja.com` dalam 3–7 hari ke depan.

emailkerja.com adalah **SaaS pengelola email lamaran masuk** dengan fitur
auto-konfirmasi ke pengirim — jadi balasan otomatis kemungkinan besar sudah masuk
ke inbox kampus sekarang.

Untuk lamaran berikutnya: login `andiagung193@gmail.com` di Chrome otomasi supaya
`_mail.js` mengirim dari alamat yang benar.

---

## Cara mengirim (untuk draft berikutnya)

```bash
node _mail.js list                                   # lihat semua draft
node _mail.js whoami                                 # akun Gmail yang aktif
node _mail.js compose <draft>                        # buka compose + lampirkan CV (tidak mengirim)
node _mail.js send <draft> --yes                     # KIRIM + verifikasi folder Terkirim + catat ke hunter.db
```

`compose`/`send` **menolak jalan** kalau akun Gmail yang login berbeda dari field
`from` di draft. Override sadar: `--any-account`. `send` juga menolak tanpa `--yes`,
dan hanya mencatat ke `applications` setelah email benar-benar ditemukan di folder
Terkirim (bukan sekadar toast).

---

## Keputusan akun pengirim (untuk referensi)

Akun kampus **tidak punya alias "Kirim email sebagai"** ke Gmail pribadi
(Setelan → Akun hanya `andi_agung@student.unismuh.ac.id`), jadi tidak ada jalan
pintas — harus login ke akun yang mau dipakai.

| | `andiagung193@gmail.com` | `andi_agung@student.unismuh.ac.id` |
|---|---|---|
| Cocok dengan alamat di CV | ✅ ya | ❌ tidak |
| Balasan kebaca | ✅ inbox aktif | ❌ **24.012 belum dibaca** |
| Sinyal ke recruiter | profesional | "mahasiswa" — melawan posisi 5+ tahun |
| Umur alamat | permanen | mati setelah lulus |

---

## Isi email

Posting hanya minta CV + portofolio, tanpa form. Sudut yang diambil: **jujur di
depan bahwa levelnya di atas intern**, tapi tetap terbuka — supaya tidak terbuang
oleh filter "overqualified" dan sekaligus membuka pintu ke slot full-time.

Bukti yang dicantumkan (semua publik/live, sesuai aturan repo — repo privat hanya
disebut "bisa didemokan"):
- **Saku Sultan** — link Play Store + App Store (bukti submit dua store, fintech)
- **SINTEKMu** — https://simtekmu.teknik.unismuh.ac.id (link resmi, bukan mirror vercel)
- **Backend Go + RAG** — disebut sebagai pengalaman, tanpa link (repo privat)
- **GitHub** devnolife + repo publik: `saas-whatsapp-dashboard`, `turnitin-dashboard-nextjs`, `whatsapp-api`

Ekspektasi gaji **tidak disebut** — posting tidak memintanya dan tidak
mencantumkan range. Bahas nanti setelah tahu levelnya (intern vs full-time).

