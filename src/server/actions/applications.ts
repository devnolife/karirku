"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isApplicationStatus } from "@/core/applications/status";
import { updateApplicationStatus } from "@/server/queries/applications";

export type UpdateApplicationStatusActionResult = {
  ok: boolean;
  message: string;
};

export async function updateApplicationStatusAction(
  applicationId: string,
  status: string,
  note?: string,
): Promise<UpdateApplicationStatusActionResult> {
  const user = await requireUser();
  if (!isApplicationStatus(status)) {
    return { ok: false, message: "Status tidak valid." };
  }
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(applicationId)) {
    return { ok: false, message: "ID lamaran tidak valid." };
  }

  const result = await updateApplicationStatus(
    user.id,
    applicationId,
    status,
    note,
  );
  if (!result.ok) {
    return { ok: false, message: "Lamaran tidak ditemukan." };
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  return { ok: true, message: "Status diperbarui." };
}
