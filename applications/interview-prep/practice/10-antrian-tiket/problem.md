# 10 — Antrian Tiket

- **Tingkat:** Medium
- **Topik:** simulasi, antrian (queue)

## Cerita

`N` orang mengantre di satu loket, bernomor `1..N` sesuai posisi awal (orang
`1` paling depan). Orang ke-`i` ingin membeli `t_i` tiket. Aturan loket:

- Loket selalu melayani orang **paling depan**. Sekali dilayani, ia membeli
  **tepat 1 tiket** (sisa kebutuhannya berkurang 1).
- Sesudah membeli 1 tiket itu:
  - jika ia **masih butuh** tiket (sisa > 0), ia pindah ke **paling belakang**
    antrean;
  - jika kebutuhannya **sudah lunas** (sisa = 0), ia **keluar** dari antrean
    (selesai).

Proses berulang sampai antrean kosong.

## Tugas

Cetak **nomor orang sesuai urutan mereka selesai** (keluar dari antrean),
dipisah spasi.

## Format Input

- Baris 1: bilangan bulat `N` — banyak orang.
- Baris 2: `N` bilangan bulat `t_1 t_2 ... t_N` — kebutuhan tiap orang
  (masing-masing `≥ 1`).

## Format Output

- Satu baris: nomor orang menurut urutan selesai, dipisah spasi.

## Contoh

```
Input:
4
2 3 2 1

Output:
4 1 3 2
```

Penjelasan: tiap giliran satu orang beli 1 tiket, lalu (kalau masih kurang)
balik ke belakang. Orang `4` cuma butuh 1 tiket → selesai paling dulu. Berikutnya
orang `1` (butuh 2) lunas, lalu orang `3`, dan terakhir orang `2` (butuh 3).

## Uji nalarmu

- Semua orang butuh 1 tiket → urutan selesai = urutan antre semula
  (`1 2 3 ... N`).
- Dua orang punya sisa kebutuhan sama di satu titik — siapa yang selesai lebih
  dulu, dan kenapa posisi di antrean menentukan?
- `N = 1` → outputnya hanya satu nomor.
