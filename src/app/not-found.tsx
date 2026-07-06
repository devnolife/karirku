import Link from "next/link";

/* Global 404 — renders inside the root layout only, so it carries
   its own canvas. Split-personality copy: big wayfinding numeral,
   quiet paths back. */
export default function NotFound() {
  return (
    <main className="app-canvas act-sans flex min-h-[100dvh] items-center justify-center px-6 text-[var(--act-ink)]">
      <div className="act-rise w-full max-w-xl">
        <span className="act-tag">404 — halaman tidak ditemukan</span>
        <h1 className="act-display mt-6 text-5xl leading-[1.02] md:text-6xl">
          Rute ini belum{" "}
          <span className="act-sky-text">terpetakan.</span>
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Alamat yang kamu buka tidak ada — mungkin sudah pindah, atau salah
          ketik satu huruf. Peta karirmu tetap aman.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className="act-pill !text-sm">
            Ke beranda
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/dashboard" className="act-pill-ghost !text-sm">
            Buka dashboard
          </Link>
        </div>
        <p className="act-script mt-10 text-2xl text-[var(--act-iris)]">
          — tersesat itu bagian dari navigasi
        </p>
      </div>
    </main>
  );
}
