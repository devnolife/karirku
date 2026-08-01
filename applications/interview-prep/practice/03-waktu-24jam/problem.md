# 03 — Waktu 24 Jam

- **Tingkat:** Medium
- **Topik:** percabangan & kasus tepi

## Tugas

Ubah waktu format **12 jam** `hh:mm:ssAM` / `hh:mm:ssPM` menjadi format
**24 jam** `hh:mm:ss`.

Aturan yang sering bikin keliru:

- Tengah malam `12:..:..AM` menjadi `00:..:..`.
- Siang `12:..:..PM` tetap `12:..:..`.
- Selain jam 12: **AM** → jam tetap; **PM** → jam + 12.

Jam keluaran selalu **dua digit**.

## Format Input

- Satu baris, misal `07:05:45PM`.

## Format Output

- Satu baris waktu 24 jam, misal `19:05:45`.

## Contoh

```
Input:
07:05:45PM

Output:
19:05:45
```

## Uji nalarmu

- `12:00:00AM` → `00:00:00`
- `12:00:00PM` → `12:00:00`
- `06:40:03AM` → `06:40:03`
