"use server";

/**
 * Server actions panel admin.
 *
 * MOCK MODE: status disimpan sebagai cookie override (lihat _overrides.ts).
 * Saat DATABASE_URL aktif nanti, ganti isi fungsi ke prisma.job.update /
 * prisma.user.update — signature dan UI tidak perlu berubah.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MOCK_ADMIN_JOBS, MOCK_ADMIN_USERS } from "@/lib/mock/data";
import { signOutDemo } from "@/lib/mock/session";
import { readAdminOverrides, writeAdminOverrides } from "./_overrides";

/** active ⇄ nonaktif (draft/expired → active; active → expired). */
export async function toggleJobStatus(jobId: string): Promise<void> {
  const job = MOCK_ADMIN_JOBS.find((j) => j.id === jobId);
  if (!job) return;

  const overrides = await readAdminOverrides();
  const current = overrides.jobs[jobId] ?? job.status;
  overrides.jobs[jobId] = current === "active" ? "expired" : "active";
  await writeAdminOverrides(overrides);
  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
}

/** active ⇄ suspended (pending/suspended → active; active → suspended). */
export async function toggleUserStatus(userId: string): Promise<void> {
  const user = MOCK_ADMIN_USERS.find((u) => u.id === userId);
  if (!user) return;

  const overrides = await readAdminOverrides();
  const current = overrides.users[userId] ?? user.status;
  overrides.users[userId] = current === "active" ? "suspended" : "active";
  await writeAdminOverrides(overrides);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

/** Keluar dari panel admin — dipakai sidebar desktop & drawer mobile. */
export async function signOutAdmin(): Promise<void> {
  await signOutDemo();
  redirect("/login");
}
