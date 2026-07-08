"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setMilestoneStatusAction } from "@/server/actions/roadmap";

type Status = "done" | "in_progress" | "upcoming";

/**
 * Tombol aksi status milestone di roadmap:
 * upcoming → "Mulai" · in_progress → "Tandai selesai" · done → "Batalkan".
 * Menyinkronkan progres path + readiness score di server, lalu refresh.
 */
export function MilestoneStatusButton({
  milestoneId,
  status,
}: {
  milestoneId: string;
  status: Status;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const next =
    status === "upcoming"
      ? { target: "in_progress" as const, label: "Mulai" }
      : status === "in_progress"
        ? { target: "done" as const, label: "Tandai selesai" }
        : { target: "in_progress" as const, label: "Batalkan" };

  function onClick() {
    setError(false);
    startTransition(async () => {
      const res = await setMilestoneStatusAction(milestoneId, next.target);
      if (res.ok) router.refresh();
      else setError(true);
    });
  }

  return (
    <span className="flex flex-col items-end gap-0.5">
      <button
        onClick={onClick}
        disabled={pending}
        className={`act-chip cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 ${status === "in_progress" ? "act-chip-green" : "act-chip-mute"
          }`}
      >
        {pending ? "…" : next.label}
      </button>
      {error && <span className="text-[10px] text-[var(--act-magenta)]">Gagal, coba lagi</span>}
    </span>
  );
}
