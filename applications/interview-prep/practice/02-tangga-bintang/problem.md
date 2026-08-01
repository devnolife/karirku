# 02 — Tangga Bintang

- **Tingkat:** Easy
- **Topik:** loop bersarang, perataan

## Tugas

Diberi tinggi `N`. Cetak tangga setinggi `N` baris memakai karakter `#`,
**rata kanan**. Baris ke-`i` (mulai dari 1) berisi `i` buah `#` dengan spasi
di depan supaya lebar tiap baris pas `N`. **Tidak ada spasi di belakang** `#`.

## Format Input

- Satu bilangan bulat `N`.

## Format Output

- `N` baris membentuk tangga rata kanan.

## Contoh

```
Input:
4

Output:
   #
  ##
 ###
####
```

Baris 1 = 3 spasi + 1 `#`. Baris 4 = 0 spasi + 4 `#`.

## Uji nalarmu

- `N = 1` → satu `#`.
- Spasi ada di **depan**, bukan belakang.
