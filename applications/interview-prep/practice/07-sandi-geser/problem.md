# 07 — Sandi Geser

- **Tingkat:** Medium
- **Topik:** string, aritmetika modular

## Cerita

Sandi Caesar menggeser tiap huruf maju sejauh angka tertentu di sepanjang
alfabet. Kalau geserannya melewati `z`, hitungan **berputar** kembali ke `a`
(seperti jarum jam). Contoh geser 1: `a→b`, `b→c`, ..., `z→a`.

## Tugas

Diberi sebuah angka geser `K` dan sebuah untaian huruf kecil, cetak untaian
hasil setelah **setiap huruf** digeser maju sejauh `K`, dengan perputaran
`a..z`.

## Format Input

- Baris 1: bilangan bulat tak-negatif `K` — besar geseran (bisa lebih dari 26).
- Baris 2: untaian huruf kecil `a`–`z` (tanpa spasi).

## Format Output

- Satu baris: untaian hasil geseran.

## Contoh

```
Input:
3
xyzabc

Output:
abcdef
```

Penjelasan: tiap huruf maju 3 langkah. `x→a`, `y→b`, `z→c` berputar melewati
ujung alfabet; lalu `a→d`, `b→e`, `c→f`.

## Uji nalarmu

- `K = 0` → untaian tidak berubah.
- `K = 26` (atau kelipatannya) → kenapa hasilnya sama dengan aslinya?
- `K` besar seperti `29` → samakah hasilnya dengan `K = 3`? Apa peran sisa bagi
  (modulo) di sini?
