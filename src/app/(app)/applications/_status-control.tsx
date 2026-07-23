"use client";

import { useState, useTransition } from "react";
import {
  APPLICATION_STATUSES,
  statusLabel,
  type ApplicationStatusValue,
} from "@/lib/applications/status";
import { updateApplicationStatusAction } from "@/server/actions/applications";

export function ApplicationStatusControl({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const initial = APPLICATION_STATUSES.includes(
    currentStatus as ApplicationStatusValue,
  )
    ? (currentStatus as ApplicationStatusValue)
    : "applied";
  const [status, setStatus] = useState<ApplicationStatusValue>(initial);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function update() {
    setMessage("");
    startTransition(async () => {
      const result = await updateApplicationStatusAction(
        applicationId,
        status,
        note,
      );
      if (result.ok) setNote("");
      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-1.5">
      <select
        value={status}
        disabled={pending}
        aria-label="Status lamaran"
        onChange={(event) =>
          setStatus(event.target.value as ApplicationStatusValue)
        }
        className="w-full rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-2 py-1.5 text-xs font-semibold text-[var(--act-ink)] disabled:opacity-60"
      >
        {APPLICATION_STATUSES.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </select>
      <input
        value={note}
        disabled={pending}
        maxLength={2_000}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Catatan opsional"
        aria-label="Catatan status lamaran"
        className="w-full rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-2 py-1.5 text-[11px] text-[var(--act-ink)] disabled:opacity-60"
      />
      <button
        type="button"
        disabled={pending}
        onClick={update}
        className="act-pill !w-full !px-2 !py-1.5 !text-[11px] disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan status"}
      </button>
      {message && (
        <p
          className="text-[10px] text-[var(--act-graphite)]"
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
}
