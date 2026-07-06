"use server";

/**
 * Admin-only server actions — entitlement (fitur premium) management.
 * Pola sama seperti src/server/actions/apply.ts: requireUser() untuk sesi,
 * lalu re-check role di server (bukan cuma disembunyikan di UI/layout).
 */

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  FEATURE_HUNTER_AUTO_APPLY,
  grantEntitlement,
  hasEntitlement,
  revokeEntitlement,
} from "@/lib/entitlements";

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("Hanya admin yang boleh menjalankan aksi ini.");
  }
  return user;
}

/**
 * Aktifkan/cabut add-on premium "Auto-Apply" (Hunter) untuk satu user.
 */
export async function toggleAutoApplyEntitlementAction(userId: string): Promise<void> {
  await requireAdmin();

  const active = await hasEntitlement(userId, FEATURE_HUNTER_AUTO_APPLY);
  if (active) {
    await revokeEntitlement(userId, FEATURE_HUNTER_AUTO_APPLY);
  } else {
    await grantEntitlement(userId, FEATURE_HUNTER_AUTO_APPLY, "toggled manual via /admin/users");
  }
  revalidatePath("/admin/users");
}
