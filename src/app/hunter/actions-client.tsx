"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ActionButton({
  action,
  body,
  label,
  className = "",
}: {
  action: string;
  body?: Record<string, unknown>;
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
      const res = await fetch("/api/hunter/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = (await res.json()) as {
        pid?: number;
        error?: string;
        message?: string;
      };
      setMsg(
        res.ok
          ? `[QUEUED]${data.pid ? ` pid ${data.pid}` : ""}`
          : `[FAIL] ${data.message ?? data.error ?? `HTTP ${res.status}`}`,
      );
      if (res.ok) setTimeout(() => router.refresh(), 4000);
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
          "border border-[#FF6B1A] bg-[#FF6B1A] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0D0F0C] transition-colors duration-150 ease-out hover:bg-[#FF8140] hover:border-[#FF8140] active:scale-[0.97] disabled:opacity-40 " +
          className
        }
      >
        {busy ? "…" : label}
      </button>
      {msg && <span className="[font-family:var(--font-hunter-mono)] text-[11px] text-[#8A9088]">{msg}</span>}
    </span>
  );
}

export function JobStatusButton({
  jobId,
  status,
  label,
  className = "",
}: {
  jobId: number;
  status: string;
  label: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function run() {
    setBusy(true);
    await fetch("/api/hunter/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: jobId, status }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      className={"border px-2 py-1 [font-family:var(--font-hunter-mono)] text-[10px] uppercase tracking-[0.1em] transition-colors duration-150 ease-out active:scale-[0.97] disabled:opacity-40 " + className}
    >
      {busy ? "…" : label}
    </button>
  );
}

export function ApplyButton({ jobId }: { jobId: number }) {
  return (
    <ActionButton
      action="apply"
      body={{ jobId }}
      label="Apply"
      className="!px-2 !py-1 !text-[10px] !bg-transparent !text-[#5FBF6E] !border-[#2C4A31] hover:!bg-[#142116]"
    />
  );
}
