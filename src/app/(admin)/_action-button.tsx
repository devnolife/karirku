"use client";

/**
 * Tombol aksi baris tabel admin — memanggil server action dengan status
 * pending (disabled + label proses) via useTransition.
 */

import { useTransition } from "react";

export function ActionButton({
  action,
  label,
  pendingLabel = "Menyimpan…",
}: {
  action: () => Promise<void>;
  label: string;
  pendingLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => action())}
      className="text-xs font-semibold text-[var(--act-blue)] hover:underline disabled:cursor-wait disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
