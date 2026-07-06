"use client";

import { useState, useTransition } from "react";
import { updateStageAction } from "@/server/actions/pipeline";
import { PIPELINE_OPTIONS, type PipelineStatus } from "@/lib/pipeline";

/**
 * Dropdown untuk mengubah stage lamaran kandidat. Optimistic: update label
 * lokal lalu panggil server action; revert kalau gagal.
 */
export function StageControl({
  applicationId,
  current,
}: {
  applicationId: string;
  current: PipelineStatus;
}) {
  const [value, setValue] = useState<PipelineStatus>(current);
  const [pending, startTransition] = useTransition();

  function onChange(next: PipelineStatus) {
    const prev = value;
    setValue(next);
    startTransition(async () => {
      const res = await updateStageAction(applicationId, next);
      if (!res.ok) setValue(prev);
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => onChange(e.target.value as PipelineStatus)}
      className="act-field !h-9 !w-auto !px-3 !py-1 text-xs font-semibold disabled:opacity-50"
      aria-label="Ubah stage kandidat"
    >
      {PIPELINE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
