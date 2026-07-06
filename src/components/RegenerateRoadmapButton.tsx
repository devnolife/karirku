"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { regeneratePathAction } from "@/server/actions/roadmap";

/**
 * Tombol generate/regenerate roadmap AI. Menampilkan loading (LLM bisa
 * beberapa puluh detik), lalu refresh halaman saat selesai.
 */
export function RegenerateRoadmapButton({ hasPath }: { hasPath: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await regeneratePathAction();
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.reason === "no_goal" ? "Atur target role di Goal dulu." : "Gagal generate. Coba lagi.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={onClick} disabled={pending} className="act-pill !text-sm disabled:opacity-60">
        {pending ? "Menyusun roadmap… (±30 detik)" : hasPath ? "Regenerate roadmap (AI)" : "Generate roadmap (AI)"}
      </button>
      {error && <span className="text-xs text-[var(--act-magenta)]">{error}</span>}
    </div>
  );
}
