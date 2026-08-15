"use client";

import { useState } from "react";

/* ------------------------------- icons ------------------------------- */

export const AuthIcon = {
  Eye: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.2A9.6 9.6 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.2 6.2A17 17 0 002 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6" />
    </svg>
  ),
  GitHub: (
    <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  ),
  Arrow: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
};

export function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------- password field ---------------------------- */

/**
 * Input password dengan tombol lihat/sembunyi.
 *
 * Bisa melihat apa yang diketik menurunkan kesalahan ketik, yang justru
 * mendorong orang memilih password panjang alih-alih yang pendek & mudah.
 */
export function PasswordField({
  name,
  label,
  autoComplete,
  placeholder,
  hint,
  autoFocus,
}: {
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  hint?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="act-eyebrow !text-[11px]">{label}</span>
      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          name={name}
          required
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="act-field !pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--act-graphite)] transition-colors hover:text-[var(--act-ink)]"
        >
          {show ? AuthIcon.EyeOff : AuthIcon.Eye}
        </button>
      </div>
      {hint && <span className="mt-1.5 block text-[11.5px] text-[var(--act-graphite)]">{hint}</span>}
    </label>
  );
}

/* ------------------------------ error box ------------------------------ */

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium leading-relaxed text-red-800"
    >
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M12 8v5M12 16.5v.5M12 3l9 16H3z" />
      </svg>
      {message}
    </p>
  );
}

/* ------------------------------ github btn ------------------------------ */

export function GitHubButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        // Navigasi penuh (bukan <Link>): tujuannya route handler yang membalas
        // redirect lintas-origin ke GitHub, yang tidak bisa diikuti router klien.
        window.location.href = "/api/auth/github";
      }}
      className="inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-[rgba(15,23,42,0.12)] bg-[#0f172a] text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      {AuthIcon.GitHub}
      {label}
    </button>
  );
}

/* ------------------------------- divider ------------------------------- */

export function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-[rgba(15,23,42,0.1)]" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--act-graphite)]">
        {text}
      </span>
      <span className="h-px flex-1 bg-[rgba(15,23,42,0.1)]" />
    </div>
  );
}
