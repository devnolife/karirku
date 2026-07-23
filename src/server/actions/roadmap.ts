"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  regenerateUserPath,
  setMilestoneStatus,
  type MilestoneStatusValue,
} from "@/server/services/learning-path";

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

export type MilestoneStatusActionResult = { ok: boolean; reason?: string };

const ALLOWED_STATUSES: MilestoneStatusValue[] = ["pending", "in_progress", "done"];

/**
 * Server action: ubah status milestone (mulai/selesai/batal) milik user aktif.
 * Progres path & readiness score ikut tersinkron di service.
 */
export async function setMilestoneStatusAction(
  milestoneId: string,
  status: MilestoneStatusValue,
): Promise<MilestoneStatusActionResult> {
  if (!ALLOWED_STATUSES.includes(status)) return { ok: false, reason: "invalid_status" };
  const user = await requireUser();
  const res = await setMilestoneStatus(user.id, milestoneId, status);
  if (res.ok) {
    revalidatePath("/roadmap");
    revalidatePath("/dashboard");
    return { ok: true };
  }
  return { ok: false, reason: res.reason };
}
