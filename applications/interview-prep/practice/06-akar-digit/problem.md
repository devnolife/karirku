# 06 — Akar Digit

- **Tingkat:** Medium
- **Topik:** loop sampai kondisi, olah digit

## Cerita

"Akar digit" sebuah bilangan didapat dengan **menjumlahkan semua digitnya**,
lalu mengulangi proses itu pada hasilnya, sampai tersisa **satu digit**.

## Tugas

Diberi bilangan `N` (bisa sangat besar), cetak akar digitnya.

## Format Input

- Satu baris berisi `N`. Anggap sebagai untaian digit — bisa **lebih panjang**
  dari jangkauan integer biasa.

## Format Output

- Satu digit (0–9).

## Contoh

```
Input:
9875

Output:
2
```

Penjelasan: 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2.

## Uji nalarmu

- `0` → `0`.
- Bilangan satu digit → dirinya sendiri.
- Karena `N` bisa sangat panjang, kenapa membacanya **per-digit** lebih aman
  daripada langsung mengubahnya jadi satu angka raksasa?
