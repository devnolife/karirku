"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { regenerateUserPath } from "@/server/services/learning-path";

export type RegenerateActionResult = { ok: boolean; reason?: string };

/**
 * Server action: generate/regenerate roadmap belajar AI untuk user aktif.
 * Bisa lama (LLM gemma3:27b) — tombol pemicu menampilkan loading state.
 */
export async function regeneratePathAction(): Promise<RegenerateActionResult> {
  const user = await requireUser();
  const res = await regenerateUserPath(user.id);
  if (res.ok) {
    revalidatePath("/roadmap");
    revalidatePath("/dashboard");
    return { ok: true };
  }
  return { ok: false, reason: res.reason };
}
