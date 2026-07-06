"use client";

import { useState, useTransition } from "react";
import { applyAction } from "@/server/actions/apply";

/**
 * Tombol Lamar. Native → catat (state jadi "Sudah dilamar"). Eksternal →
 * server action me-redirect ke URL asli (tab sama). `alreadyApplied` awal dari
 * server agar konsisten saat reload.
 */
export function ApplyButton({
  jobId,
  alreadyApplied,
  isExternal,
}: {
  jobId: string;
  alreadyApplied: boolean;
  isExternal: boolean;
}) {
  const [applied, setApplied] = useState(alreadyApplied);
  const [pending, startTransition] = useTransition();

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669]">
        ✓ Sudah dilamar
      </span>
    );
  }

  function onApply() {
    startTransition(async () => {
      const res = await applyAction(jobId);
      // Untuk eksternal, action redirect (tidak balik ke sini). Native → update state.
      if (res.status === "applied" || res.status === "already") setApplied(true);
    });
  }

  return (
    <button
      type="button"
      onClick={onApply}
      disabled={pending}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--act-blue)] hover:underline disabled:opacity-50"
    >
      {pending ? "Memproses…" : "Lamar"}
      {!pending && isExternal && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 17L17 7M7 7h10v10" />
        </svg>
      )}
    </button>
  );
}
