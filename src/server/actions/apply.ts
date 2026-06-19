"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { applyToJob } from "@/server/queries/applications";

export type ApplyActionResult =
  | { status: "applied" }
  | { status: "already" }
  | { status: "error" };

/**
 * Server action dipanggil dari tombol Lamar. Native → catat + revalidate.
 * Eksternal → catat lalu redirect ke URL lamaran asli.
 */
export async function applyAction(jobId: string): Promise<ApplyActionResult> {
  const user = await requireUser();
  const res = await applyToJob(user.id, jobId);

  if (!res.ok) {
    if (res.reason === "already_applied") return { status: "already" };
    return { status: "error" };
  }

  revalidatePath("/jobs");
  revalidatePath("/applications");

  if (res.mode === "external") {
    redirect(res.redirectUrl);
  }
  return { status: "applied" };
}
