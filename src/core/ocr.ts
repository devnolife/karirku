/**
 * OCR gambar poster/screenshot lowongan → teks. Server-only.
 *
 * Memakai binary `tesseract` yang sudah terpasang (bahasa ind+eng). Node process
 * tidak selalu memuat ~/.local/bin di PATH, jadi kita deteksi lokasi binary
 * secara eksplisit. Kalau tesseract tidak ada, lempar error yang jelas supaya
 * caller bisa menyarankan user menempel teks.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

let cachedBin: string | null | undefined;

/** Cari binary tesseract di PATH & lokasi umum. null bila tak ditemukan. */
function resolveTesseract(): string | null {
  if (cachedBin !== undefined) return cachedBin;
  const candidates = [
    process.env.TESSERACT_BIN,
    join(homedir(), ".local", "bin", "tesseract"),
    "/usr/local/bin/tesseract",
    "/usr/bin/tesseract",
    "/bin/tesseract",
  ].filter((p): p is string => !!p);

  for (const p of candidates) {
    if (existsSync(p)) {
      cachedBin = p;
      return p;
    }
  }
  cachedBin = null;
  return null;
}

export function isOcrAvailable(): boolean {
  return resolveTesseract() !== null;
}

export class OcrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OcrError";
  }
}

/**
 * Jalankan OCR pada buffer gambar. Mengembalikan teks hasil baca (mungkin ada
 * salah eja kecil — LLM downstream yang merapikan). Membaca dari stdin agar
 * tak perlu file sementara.
 */
export function ocrImage(image: Buffer, lang = "ind+eng"): Promise<string> {
  const bin = resolveTesseract();
  if (!bin) {
    return Promise.reject(
      new OcrError(
        "OCR (tesseract) tidak tersedia di server. Coba tempel teks lowongan secara manual.",
      ),
    );
  }

  return new Promise<string>((resolve, reject) => {
    // `tesseract stdin stdout -l <lang> --psm 3` → baca gambar dari stdin, teks ke stdout.
    const proc = spawn(bin, ["stdin", "stdout", "-l", lang, "--psm", "3"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let out = "";
    let err = "";
    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new OcrError("OCR melebihi batas waktu."));
    }, 30_000);

    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("error", (e) => {
      clearTimeout(timeout);
      reject(new OcrError(`Gagal menjalankan OCR: ${e.message}`));
    });
    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0 && !out.trim()) {
        reject(new OcrError(err.trim() || `OCR keluar dengan kode ${code}.`));
        return;
      }
      resolve(out.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim());
    });

    proc.stdin.on("error", () => {
      /* diabaikan: bila proc keburu tutup, error close yang menangani */
    });
    proc.stdin.write(image);
    proc.stdin.end();
  });
}
