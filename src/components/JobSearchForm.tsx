"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

/**
 * Form pencarian lowongan — submit mengubah query string `q` (server
 * component mengulang query dengan filter baru). Param lain dipertahankan.
 */
export function JobSearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    startTransition(() => router.push(`/jobs?${next.toString()}`));
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-full border border-[rgba(15,23,42,0.12)] bg-[var(--act-mist)] px-4 py-2.5 transition-colors focus-within:border-[var(--act-blue)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none text-[var(--act-graphite)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Cari judul, perusahaan, skill, atau lokasi…"
          className="w-full bg-transparent text-sm text-[var(--act-ink)] outline-none placeholder:text-[var(--act-graphite)]"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--act-onyx)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "…" : "Cari"}
      </button>
    </form>
  );
}
