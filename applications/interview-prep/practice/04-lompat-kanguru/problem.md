# 04 — Lompat Kanguru

- **Tingkat:** Medium
- **Topik:** penalaran logika / matematika

## Cerita

Dua kanguru di garis bilangan. Kanguru-1 mulai di posisi `x1` dan melompat
sejauh `v1` tiap lompatan. Kanguru-2 mulai di `x2` dan melompat sejauh `v2`
tiap lompatan. Keduanya melompat **bersamaan** (jumlah lompatan sama).

## Tugas

Tentukan apakah ada saat **kedua kanguru berada di posisi yang sama persis**
(setelah jumlah lompatan yang sama, termasuk 0 lompatan). Cetak `YES` jika
bisa, `NO` jika tidak.

## Format Input

- Satu baris: `x1 v1 x2 v2` (empat bilangan bulat).

## Format Output

- `YES` atau `NO`.

## Contoh

```
Input:
0 3 4 2

Output:
YES
```

Penjelasan: Posisi kanguru-1: 0, 3, 6, 9, **12**. Kanguru-2: 4, 6, 8, 10, **12**.
Bertemu di lompatan ke-4.

## Uji nalarmu

- `0 2 5 3` → `NO` (yang di belakang justru lebih lambat, tak akan menyusul).
- Pikirkan: kapan **mustahil** bertemu — supaya kamu tak perlu mensimulasikan
  lompatan sampai tak terhingga?
