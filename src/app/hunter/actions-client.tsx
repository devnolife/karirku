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
          ? `▶ queued${data.pid ? ` (pid ${data.pid})` : ""}`
          : `✗ ${data.message ?? data.error ?? `HTTP ${res.status}`}`,
      );
      if (res.ok) setTimeout(() => router.refresh(), 4000);
    } catch (e) {
      setMsg("✗ " + (e as Error).message);
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
          "px-3 py-1.5 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition " +
          className
        }
      >
        {busy ? "…" : label}
      </button>
      {msg && <span className="text-xs text-slate-400">{msg}</span>}
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
      className={"px-2 py-1 rounded text-xs font-medium disabled:opacity-50 transition " + className}
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
      className="!px-2 !py-1 !text-xs bg-emerald-600 hover:bg-emerald-500"
    />
  );
}
