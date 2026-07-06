"use client";

import Link from "next/link";
import { useEffect } from "react";

/* Shared error panel — used by every error.tsx boundary so failures
   render inside the active shell with the same "Clean Paper Desk" language. */
export function ErrorPanel({
  error,
  reset,
  homeHref = "/dashboard",
  homeLabel = "Ke dashboard",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  useEffect(() => {
    // Surface for observability; swap with a reporter later.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1200px] items-center px-6 py-8 md:px-10">
      <div className="act-rise act-card-2 act-rail act-rail-magenta w-full max-w-lg p-8 md:p-10">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(242,0,202,0.1)] text-[var(--act-magenta)]">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M10.3 4.6 2.9 17.4a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </span>

        <span className="act-kicker mt-6 block">Terjadi kesalahan</span>
        <h1 className="act-display mt-2 text-3xl leading-[1.06] md:text-4xl">
          Halaman ini <span className="text-[var(--act-magenta)]">tersandung.</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--act-charcoal)]">
          Bukan salah kamu — ada yang gagal saat memuat bagian ini. Coba ulang;
          kalau masih terjadi, kembali ke halaman utama dulu.
        </p>

        {error.digest && (
          <p className="mt-4 inline-block rounded-lg bg-[var(--act-mist)] px-3 py-1.5 font-mono text-xs text-[var(--act-graphite)]">
            ref: {error.digest}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reset} className="act-pill !text-sm">
            Coba lagi
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
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <Link href={homeHref} className="act-pill-ghost !text-sm">
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
