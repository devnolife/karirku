# 05 — Deret Kemenangan

- **Tingkat:** Medium
- **Topik:** penghitung berjalan, reset

## Cerita

Sebuah tim mencatat hasil pertandingan sebagai untaian huruf: `W` (menang)
dan `L` (kalah), tanpa spasi.

## Tugas

Cari **deret kemenangan beruntun terpanjang** — jumlah `W` berturut-turut
yang paling panjang. Cetak panjangnya.

## Format Input

- Satu baris berisi untaian `W`/`L`.

## Format Output

- Satu bilangan: panjang deret `W` beruntun terpanjang.

## Contoh

```
Input:
WWLWWWLW

Output:
3
```

Penjelasan: potongan `WW` (2), `WWW` (3), `W` (1). Terpanjang = 3.

## Uji nalarmu

- Semua `L` → `0`.
- Untaian yang **berakhir** dengan deret `W` terpanjang (jangan lupa cek di
  ujung, bukan cuma saat ketemu `L`).
