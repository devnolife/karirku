# 01 — Saldo Aman

- **Tingkat:** Easy
- **Topik:** kondisional, state berjalan

## Cerita

Kamu menjaga satu rekening. Saldo awal diketahui. Lalu datang serangkaian
transaksi **berurutan**:

- angka **positif** = setoran (selalu diterima),
- angka **negatif** = penarikan.

Penarikan **hanya boleh** jika saldo **tidak menjadi negatif** setelahnya.
Kalau sebuah penarikan akan membuat saldo `< 0`, transaksi itu **ditolak**
(saldo tidak berubah, lanjut ke transaksi berikutnya).

## Tugas

Cetak **saldo akhir** dan **berapa banyak penarikan yang ditolak**, dipisah spasi.

## Format Input

- Baris 1: dua bilangan bulat `B N` — saldo awal dan jumlah transaksi.
- Baris 2: `N` bilangan bulat, transaksi berurutan.

## Format Output

Satu baris: `<saldo_akhir> <jumlah_penolakan>`

## Contoh

```
Input:
100 5
-30 50 -200 -20 10

Output:
110 1
```

Penjelasan: 100 → (−30) 70 → (+50) 120 → (−200 **ditolak**, 120 < 200) →
(−20) 100 → (+10) 110. Penolakan = 1.

## Uji nalarmu (ubah input.txt untuk coba)

- Penarikan tepat sebesar saldo **boleh** (saldo jadi 0).
- Semua setoran → tidak ada penolakan.
