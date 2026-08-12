"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AiEvalButton({
  jobId,
  limit,
  label,
  className = "",
}: {
  jobId?: number;
  limit?: number;
  label: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/hunter/ai-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, limit }),
      });
      const data = (await res.json()) as { pid?: number; message?: string; error?: string };
      setMsg(res.ok ? `[EVAL RUNNING]${data.pid ? ` pid ${data.pid}` : ""}` : `[FAIL] ${data.message ?? data.error ?? res.status}`);
      if (res.ok) setTimeout(() => router.refresh(), 8000);
    } catch (e) {
      setMsg("[FAIL] " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={run}
        disabled={busy}
        className={
          "border border-[#FF6B1A] bg-[#FF6B1A] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D0F0C] transition-colors duration-150 ease-out hover:border-[#FF8140] hover:bg-[#FF8140] active:scale-[0.97] disabled:opacity-40 " +
          className
        }
      >
        {busy ? "…" : label}
      </button>
      {msg && <span className="[font-family:var(--font-hunter-mono)] text-[11px] text-[#8A9088]">{msg}</span>}
    </span>
  );
}
