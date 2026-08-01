// Baca seluruh STDIN lalu proses (gaya HackerRank).
let raw = ''
process.stdin.on('data', (chunk) => (raw += chunk))
process.stdin.on('end', () => {
  const lines = raw.split(/\r?\n/)
  const tokens = raw.split(/\s+/).filter(Boolean)

  // Pilih cara baca sesuai soal:
  //   lines[0]                          -> baris pertama (string)
  //   Number(lines[0])                  -> satu angka
  //   lines[1].split(' ').map(Number)   -> deretan angka di satu baris
  //   tokens                            -> semua token
  //
  // Contoh: baris pertama n, lalu n angka di baris kedua
  //   const n = Number(lines[0])
  //   const arr = lines[1].split(' ').map(Number)

  // TODO: tulis logikamu, cetak hasil dengan console.log()
})
