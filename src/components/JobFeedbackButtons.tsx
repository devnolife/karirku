"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Tombol feedback lowongan: simpan / sembunyikan / tidak relevan.
 * Feedback jadi sinyal ranking — rekomendasi belajar dari data, bukan menebak.
 */
export function JobFeedbackButtons({ jobId, saved }: { jobId: string; saved?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(!!saved);

  async function send(action: "saved" | "hidden" | "irrelevant" | "clear") {
    await fetch(`/api/jobs/${jobId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    startTransition(() => router.refresh());
  }

  const base =
    "rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 transition-colors disabled:opacity-50";

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        title={isSaved ? "Hapus dari tersimpan" : "Simpan lowongan"}
        onClick={() => {
          const next = !isSaved;
          setIsSaved(next);
          void send(next ? "saved" : "clear");
        }}
        className={`${base} ${isSaved
            ? "bg-[rgba(245,158,11,0.10)] text-[var(--act-magenta)] ring-[rgba(245,158,11,0.25)]"
            : "bg-[var(--act-mist)] text-[var(--act-graphite)] ring-[rgba(15,23,42,0.08)] hover:text-[var(--act-magenta)]"
          }`}
      >
        {isSaved ? "★ Tersimpan" : "☆ Simpan"}
      </button>
      <button
        type="button"
        disabled={pending}
        title="Sembunyikan lowongan ini"
        onClick={() => void send("hidden")}
        className={`${base} bg-[var(--act-mist)] text-[var(--act-graphite)] ring-[rgba(15,23,42,0.08)] hover:text-[var(--act-ink)]`}
      >
        ✕
      </button>
      <button
        type="button"
        disabled={pending}
        title="Tidak relevan — rekomendasi serupa akan dikurangi"
        onClick={() => void send("irrelevant")}
        className={`${base} bg-[var(--act-mist)] text-[var(--act-graphite)] ring-[rgba(15,23,42,0.08)] hover:text-[var(--act-ink)]`}
      >
        Tidak relevan
      </button>
    </span>
  );
}
