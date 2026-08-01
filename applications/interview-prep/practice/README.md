# Latihan Logika — Ruang Kerja

Tujuan: nguatin logika sebelum tes ngoding (tanpa AI yang nyuapin jawaban).
Alur: **tempel soal → kerja sendiri → tanya yang nggak paham.**
Mentor (AI) **cuma kasih petunjuk, bukan jawaban**.

---

## Bank Soal (kerjakan sendiri — belum ada solusi)

Soal-soal bikinan sendiri, fokus **logika**. Statement bersih, sample bisa
diverifikasi otomatis lewat `run.ps1`.

| # | Soal                  | Tingkat | Latihan apa                          |
| - | --------------------- | ------- | ------------------------------------ |
| 1 | `01-saldo-aman`       | Easy    | kondisional + state berjalan         |
| 2 | `02-tangga-bintang`   | Easy    | loop bersarang + perataan            |
| 3 | `03-waktu-24jam`      | Medium  | percabangan + kasus tepi (jam 12)    |
| 4 | `04-lompat-kanguru`   | Medium  | penalaran logika/matematika          |
| 5 | `05-deret-kemenangan` | Medium  | penghitung berjalan + reset          |
| 6 | `06-akar-digit`       | Medium  | loop sampai kondisi + olah digit     |

```powershell
cd practice
# baca soal di <folder>/problem.md, tulis kodemu di <folder>/solution.py
.\run.ps1 01-saldo-aman      # cek PASS/FAIL
```

Mentok? Tanya mentor — dapat **hint**, bukan jawaban.

---

## Kontrak Mentoring

**Yang AKAN mentor lakukan:**
- Ajukan pertanyaan balik biar kamu nemu sendiri
- Bantu pahami soal, format input/output, dan contoh kasus
- Tunjukkan arah / nama konsep / pola yang relevan
- Tanya soal edge case & kompleksitas (Big-O)
- Review pendekatanmu: "ini bakal kena masalah di kasus X"

**Yang TIDAK mentor lakukan:**
- Nulis solusi jadi atau nempel kode jawaban
- Kasih algoritma lengkap langkah demi langkah di awal
- Benerin kodemu baris per baris biar langsung lolos

**Hint ladder** (kalau mentok, petunjuk dinaikkan bertahap — kamu yang minta naik):
1. Klarifikasi soal & pola input/output
2. Pertanyaan pengarah
3. Nama teknik / struktur data yang cocok
4. Sketsa pseudo-langkah (paling jauh, hanya kalau kamu minta)

---

## Alur 1 Soal

```powershell
cd practice

# 1. Bikin folder soal (default Python; pakai -Lang js untuk JavaScript)
.\new.ps1 two-sum
.\new.ps1 parse-logs -Lang js

# 2. Isi:
#    problem.md   <- tempel pernyataan soal
#    input.txt    <- sample input dari HackerRank
#    expected.txt <- expected output dari HackerRank
#    solution.py / solution.js <- tulis kodemu (baca STDIN, cetak STDOUT)

# 3. Jalankan + bandingkan otomatis
.\run.ps1 two-sum     # PASS / FAIL + diff
.\run.ps1             # tanpa argumen = folder soal yang terakhir kamu ubah
```

`run.ps1` menjalankan `solution.*` dengan isi `input.txt` sebagai STDIN, lalu
membandingkan STDOUT (di-`trim`) dengan `expected.txt`. Kalau `expected.txt`
kosong, dia cuma menampilkan output mentah.

---

## Cara Baca Input (gaya HackerRank)

Lihat `_template/solution.py` dan `_template/solution.js` — sudah ada pola
umum: baca satu angka, baca deretan angka satu baris, atau baca semua token.

---

## Tips Tempo Tes

- Baca soal **2x**, tulis 1 contoh manual sebelum ngoding
- Pikirkan **brute-force dulu** (yang penting jalan), baru optimasi
- Cek edge case: input kosong, 1 elemen, duplikat, negatif, batas atas
- Sebutkan kompleksitas akhir (waktu & memori)

---

## Catatan

Folder `_template/`, `python/`, `javascript/` di-skip oleh `run.ps1` saat
mencari "soal terbaru". Jangan menaruh soal di situ.
