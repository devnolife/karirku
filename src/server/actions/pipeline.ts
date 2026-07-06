"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateApplicationStatus } from "@/server/queries/company";
import type { PipelineStatus } from "@/lib/pipeline";

export type StageUpdateResult = { ok: boolean };

/** Server action: perusahaan mengubah stage lamaran kandidat. */
export async function updateStageAction(
  applicationId: string,
  status: PipelineStatus,
): Promise<StageUpdateResult> {
  const user = await requireUser();
  const ok = await updateApplicationStatus(user.id, applicationId, status);
  if (ok) {
    revalidatePath("/company/candidates");
    revalidatePath("/dashboard");
  }
  return { ok };
}
