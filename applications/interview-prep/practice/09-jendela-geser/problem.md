# 09 — Jendela Geser

- **Tingkat:** Medium
- **Topik:** array, sliding window

## Cerita

Sebuah "jendela" selebar `K` digeser di sepanjang deret angka, satu langkah
demi satu langkah, menutupi `K` angka bersebelahan tiap kali. Di setiap posisi,
jendela punya satu nilai: **jumlah** angka di dalamnya.

## Tugas

Diberi `N` angka dan lebar jendela `K`, cetak **jumlah terbesar** di antara
semua jendela `K` angka bersebelahan.

## Format Input

- Baris 1: dua bilangan bulat `N K` — banyak angka dan lebar jendela (`1 ≤ K ≤ N`).
- Baris 2: `N` bilangan bulat dipisah spasi.

## Format Output

- Satu bilangan: jumlah jendela terbesar.

## Contoh

```
Input:
7 3
2 1 5 1 3 2 4

Output:
9
```

Penjelasan: jumlah tiap jendela 3-angka berturut-turut adalah `8, 7, 9, 6, 9`.
Yang terbesar `9` (mis. dari potongan `5 1 3`).

## Uji nalarmu

- `K = N` → cuma ada satu jendela: seluruh deret.
- Ada angka **negatif** → jangan mengasumsikan jawaban mulai dari 0; jendela
  pertama sendiri sudah jadi calon terbesar.
- Kalau `N` sangat besar, bisakah kamu hitung jumlah jendela berikutnya dari
  jumlah sebelumnya **tanpa** menjumlah ulang semua `K` angka?
