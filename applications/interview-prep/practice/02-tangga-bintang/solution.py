import sys


def main() -> None:
    raw = sys.stdin.read()
    lines = raw.splitlines()
    tokens = raw.split()

    # Pilih cara baca sesuai soal:
    #   lines[0]                          -> baris pertama (string)
    #   int(lines[0])                     -> satu angka
    #   list(map(int, lines[1].split()))  -> deretan angka di satu baris
    #   tokens                            -> semua angka/kata jadi satu list

    # TODO: tulis logikamu, cetak hasil dengan print()
    pass


if __name__ == "__main__":
    main()
