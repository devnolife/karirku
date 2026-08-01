# Ide: Ruang Latihan Logika Anti-AI

Dokumen ini menyimpan **konsep** latihan ngoding untuk persiapan tes teknis
(skenario: wawancara coding **tanpa bantuan AI**). Tujuannya nguatin **logika
murni**, bukan menghafal jawaban.

---

## Masalah yang diselesaikan

- Mau latihan logika, tapi AI cenderung langsung kasih jawaban → otak nggak
  terlatih.
- Soal yang di-copy dari HackerRank sering **rusak formatnya** pas di-paste
  (tanda `<`, `>`, kata hilang) → bikin bingung.

## Solusi

1. **Bank soal bikinan sendiri** bergaya HackerRank — statement bersih, fokus
   logika (kondisional, loop, penalaran), bukan algoritma/struktur data berat.
2. **Loop kerja cepat berbasis file**: tulis kode → jalankan → langsung lihat
   PASS/FAIL + diff.
3. **Kontrak mentoring ketat**: AI berperan sebagai mentor Socratic — hanya
   **petunjuk pengarah**, tidak pernah memberi solusi jadi.

---

## Aturan Mentoring (inti dari ide ini)

**Mentor BOLEH:**
- Mengajukan pertanyaan balik agar penanya menemukan sendiri.
- Menjelaskan maksud soal, format I/O, dan membedah contoh.
- Menyebut nama konsep / teknik / struktur data yang relevan.
- Memancing soal edge case & kompleksitas (Big-O).
- Menunjukkan "pendekatanmu bakal bermasalah di kasus X".

**Mentor TIDAK BOLEH:**
- Menulis solusi jadi atau menempel kode jawaban.
- Memberi algoritma lengkap langkah demi langkah di awal.
- Membenarkan kode baris-per-baris supaya langsung lolos.

**Hint ladder** (naik bertahap, hanya saat diminta):
1. Klarifikasi soal & pola input/output
2. Pertanyaan pengarah
3. Nama teknik / struktur data yang cocok
4. Sketsa pseudo-langkah (paling jauh — hanya kalau benar-benar mentok)

---

## Alur Kerja

```powershell
cd practice

# Bikin soal kosong dari template (atau pakai bank soal yang sudah ada)
.\new.ps1 nama-soal            # default Python
.\new.ps1 nama-soal -Lang js   # JavaScript

# Isi: problem.md (soal), input.txt (sample), expected.txt (jawaban benar)
# Tulis kode di solution.py / solution.js (baca STDIN, cetak STDOUT)

.\run.ps1 nama-soal            # jalankan + bandingkan -> PASS/FAIL + diff
.\run.ps1                      # tanpa argumen = folder soal terakhir diubah
```

**Struktur tiap soal:**

| File           | Isi                                          |
| -------------- | -------------------------------------------- |
| `problem.md`   | Pernyataan soal + contoh + "Uji nalarmu"     |
| `input.txt`    | Sample input (jadi STDIN)                     |
| `expected.txt` | Output benar (pembanding)                     |
| `solution.py`  | Tempat menulis kode (kosong)                  |
| `notes.md`     | Coretan ide, edge case, kompleksitas          |

---

## Bank Soal Saat Ini

Semua **tanpa solusi**; sample output sudah diverifikasi benar.

| # | Soal                  | Tingkat | Latihan apa                       |
| - | --------------------- | ------- | --------------------------------- |
| 1 | `01-saldo-aman`       | Easy    | kondisional + state berjalan      |
| 2 | `02-tangga-bintang`   | Easy    | loop bersarang + perataan         |
| 3 | `03-waktu-24jam`      | Medium  | percabangan + kasus tepi (jam 12) |
| 4 | `04-lompat-kanguru`   | Medium  | penalaran logika/matematika       |
| 5 | `05-deret-kemenangan` | Medium  | penghitung berjalan + reset       |
| 6 | `06-akar-digit`       | Medium  | loop sampai kondisi + olah digit  |

---

## Cara Menambah Soal Baru (untuk mentor)

1. Pilih satu **konsep logika** sebagai fokus (hindari yang butuh struktur data
   berat kecuali diminta).
2. Tulis statement **bersih** bergaya HackerRank: cerita singkat, Tugas, Format
   Input, Format Output, Contoh, lalu "Uji nalarmu" (daftar edge case untuk
   dipikirkan sendiri — **tanpa** membocorkan jawaban).
3. **Verifikasi** `expected.txt` dengan menjalankan solusi referensi di script
   sekali-pakai, lalu **hapus** script itu (jangan tinggalkan jawaban).
4. Kirim hanya: `problem.md`, `input.txt`, `expected.txt`, `solution.py` kosong.

---

## Topik yang Bisa Dikembangkan

- **String**: anagram, palindrom, run-length encoding, caesar cipher.
- **Array**: rotasi, running sum, sliding window sederhana.
- **Math/logic**: FizzBuzz bervariasi, GCD/LCM, bilangan prima, jam/sudut.
- **Simulasi**: antrian tiket, lampu lalu lintas, permainan papan kecil.
- **Parsing**: hitung kata, olah log, validasi format.

---

## Mode Lanjutan: Simulasi Tes Bertimer

Untuk latihan **tempo nyata**, ada CodeForge (`../codeforge`) dengan halaman
**Interview** — tes bertimer, beberapa soal sekaligus, progres tersimpan di
localStorage. Pakai ini saat ingin mensimulasikan tekanan waktu wawancara.
