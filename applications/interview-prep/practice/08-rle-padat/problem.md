# 08 — RLE Padat

- **Tingkat:** Medium
- **Topik:** string, pengelompokan & penghitungan

## Cerita

Run-Length Encoding (RLE) memadatkan untaian dengan menuliskan **tiap huruf**
diikuti **berapa kali ia muncul berturut-turut**. Huruf sama yang
bersebelahan dihitung sebagai satu kelompok.

## Tugas

Diberi sebuah untaian huruf kecil, cetak bentuk RLE-nya: untuk setiap kelompok
huruf beruntun, tulis hurufnya lalu jumlah kemunculannya. Angka **selalu
ditulis**, termasuk untuk kelompok berisi satu huruf.

## Format Input

- Satu baris: untaian huruf kecil `a`–`z` (tanpa spasi).

## Format Output

- Satu baris: untaian hasil RLE.

## Contoh

```
Input:
aaabbc

Output:
a3b2c1
```

Penjelasan: kelompok `aaa` → `a3`, `bb` → `b2`, `c` → `c1`. Disambung jadi
`a3b2c1`.

## Uji nalarmu

- Satu huruf saja (mis. `z`) → hasilnya `z1`.
- Tidak ada huruf kembar bersebelahan (mis. `abc`) → tiap kelompok berisi 1.
- Kelompok panjang (mis. 12 huruf `a` beruntun) → angkanya jadi **dua digit**;
  apakah cara menyambung huruf+angka tetap benar?
