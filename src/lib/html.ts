/**
 * Bersihkan HTML jadi teks polos. Urutan PENTING:
 * 1. Decode entity (&lt; → <) DULU — sumber seperti Greenhouse mengirim konten
 *    yang ter-entity-encode, jadi tag baru kelihatan setelah decode.
 * 2. Ubah <br>, </p>, </li> jadi newline agar struktur paragraf tetap terbaca.
 * 3. Strip sisa tag.
 * 4. Decode entity sekali lagi (untuk entity di dalam teks) + rapikan whitespace.
 */

/** Decode entity HTML (&lt; → <, &amp; → &, dst). Berguna utk parsing tag yg ter-encode. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&bull;/g, "•")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, " ");
}

/** Teks polos satu baris (rapat) — untuk preview/embedding. */
export function cleanText(html: string): string {
  if (!html) return "";
  const decoded = decodeEntities(html);
  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/<[^>]*$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Teks polos dengan struktur paragraf dipertahankan (newline antar blok) —
 * untuk ditampilkan di halaman detail.
 */
export function cleanRichText(html: string): string {
  if (!html) return "";
  const decoded = decodeEntities(html);
  return decoded
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/<[^>]*$/g, "") // tag terpotong di akhir (mis. truncation) — buang.
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim();
}
