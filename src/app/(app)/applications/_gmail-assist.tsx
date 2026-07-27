"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { statusLabel } from "@devnolife/karirku-core/applications/status";
import {
  decideGmailSuggestionAction,
  disconnectGmailAction,
} from "@/server/actions/gmail-outcomes";
import type { GmailOutcomeAssistView } from "@/server/queries/gmail-outcomes";

export function GmailOutcomeAssist({
  assist,
}: {
  assist: GmailOutcomeAssistView;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function sync() {
    setMessage("Membaca metadata email terbaru…");
    const response = await fetch("/api/applications/gmail/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 30 }),
    });
    const data = (await response.json()) as {
      suggested?: number;
      message?: string;
    };
    setMessage(
      response.ok
        ? `${data.suggested ?? 0} saran status ditemukan.`
        : data.message ?? "Sinkronisasi gagal.",
    );
    if (response.ok) router.refresh();
  }

  function decide(id: string, decision: "confirm" | "dismiss") {
    startTransition(async () => {
      const result = await decideGmailSuggestionAction(id, decision);
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  if (!assist.connected) {
    return (
      <section className="act-card-2 p-5">
        <span className="act-kicker">Outcome assistant</span>
        <h2 className="act-heading mt-2 text-xl">Hubungkan Gmail read-only</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--act-graphite)]">
          Karirku membaca metadata minimum untuk menyarankan perubahan status.
          Tidak pernah mengubah status tanpa konfirmasi dan tidak dapat mengirim email.
        </p>
        <Link
          href="/api/auth/gmail"
          prefetch={false}
          className="act-pill mt-4 !text-sm"
        >
          Hubungkan Gmail
        </Link>
      </section>
    );
  }

  return (
    <section className="act-card-2 space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="act-kicker">Outcome assistant · read-only</span>
          <p className="mt-1 text-sm text-[var(--act-charcoal)]">
            {assist.email ?? "Gmail terhubung"}
            {assist.lastSyncedAt ? ` · sync ${assist.lastSyncedAt}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => void sync()}
            className="act-pill !text-sm disabled:opacity-60"
          >
            Sync 30 hari
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await disconnectGmailAction();
                router.refresh();
              })
            }
            className="act-pill-ghost !text-sm disabled:opacity-60"
          >
            Putuskan
          </button>
        </div>
      </div>

      {message && <p role="status" className="text-sm text-[var(--act-graphite)]">{message}</p>}

      {assist.suggestions.length > 0 && (
        <div className="space-y-2">
          <span className="act-kicker">Perlu konfirmasi</span>
          {assist.suggestions.map((suggestion) => (
            <div key={suggestion.id} className="rounded-xl border border-[rgba(15,23,42,0.1)] p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--act-ink)]">
                    {suggestion.jobTitle} · {suggestion.company}
                  </p>
                  <p className="mt-1 text-xs text-[var(--act-graphite)]">
                    Saran: <strong>{statusLabel(suggestion.suggestedStatus)}</strong>
                    {" · "}confidence {Math.round(suggestion.confidence * 100)}%
                    {suggestion.senderDomain ? ` · ${suggestion.senderDomain}` : ""}
                  </p>
                  {suggestion.subjectPreview && (
                    <p className="mt-1 max-w-2xl truncate text-xs text-[var(--act-graphite)]">
                      {suggestion.subjectPreview}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => decide(suggestion.id, "confirm")}
                    className="act-pill !px-3 !py-1.5 !text-xs"
                  >
                    Konfirmasi
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => decide(suggestion.id, "dismiss")}
                    className="act-pill-ghost !px-3 !py-1.5 !text-xs"
                  >
                    Abaikan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
