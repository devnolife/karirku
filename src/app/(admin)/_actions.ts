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
import { getMockSession, signOutDemo } from "@/lib/mock/session";
import { readAdminOverrides, writeAdminOverrides } from "./_overrides";
import { auth } from "@/lib/auth";
import { isProductionMode } from "@/lib/mode";
import {
  FEATURE_HUNTER_AUTO_APPLY,
  grantEntitlement,
  hasEntitlement,
  revokeEntitlement,
} from "@/lib/entitlements";

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

/**
 * Guard ganda untuk aksi sensitif: pastikan session AKTIF adalah admin,
 * dicek ulang di server (bukan cuma disembunyikan di UI). Dual-mode: pakai
 * session Prisma/NextAuth asli di production, mock session sekarang.
 */
async function requireAdminUserId(): Promise<void> {
  if (isProductionMode()) {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "admin") throw new Error("Hanya admin yang boleh mengubah entitlement.");
    return;
  }
  const session = await getMockSession();
  if (session.user.role !== "admin") {
    throw new Error("Hanya admin yang boleh mengubah entitlement.");
  }
}

/**
 * Aktifkan/cabut add-on premium "Auto-Apply" (Hunter) untuk satu user.
 * Guard ganda: hanya session admin yang boleh menjalankan ini, dicek ulang
 * di server (bukan cuma disembunyikan di UI).
 */
export async function toggleAutoApplyEntitlement(userId: string): Promise<void> {
  await requireAdminUserId();
  if (!isProductionMode() && !MOCK_ADMIN_USERS.some((u) => u.id === userId)) return;

  const active = await hasEntitlement(userId, FEATURE_HUNTER_AUTO_APPLY);
  if (active) {
    await revokeEntitlement(userId, FEATURE_HUNTER_AUTO_APPLY);
  } else {
    await grantEntitlement(userId, FEATURE_HUNTER_AUTO_APPLY, "toggled manual via /admin/users");
  }
  revalidatePath("/admin/users");
}
