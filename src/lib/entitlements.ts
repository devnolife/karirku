/**
 * Entitlements — akses fitur premium per user, DUAL MODE.
 *
 * Satu-satunya pintu masuk yang boleh dipakai kode lain (admin page, nanti
 * dashboard Hunter) — pemanggil tidak perlu tahu mode aktif.
 *
 *  - production: baca/tulis tabel Prisma `entitlements`.
 *  - mock: baca/tulis cookie via src/lib/mock/entitlements-store.ts.
 *
 * Feature key pertama: "hunter_auto_apply" (add-on premium terpisah dari
 * tier Pro — lihat docs/superpowers/specs/2026-07-06-hunter-premium-foundation-design.md).
 */

import { prisma } from "./db";
import { isProductionMode } from "./mode";
import {
  applyGrant,
  applyRevoke,
  checkEntitlement,
  readMockEntitlements,
  writeMockEntitlements,
} from "./mock/entitlements-store";

export const FEATURE_HUNTER_AUTO_APPLY = "hunter_auto_apply" as const;

export async function hasEntitlement(userId: string, feature: string): Promise<boolean> {
  if (isProductionMode()) {
    const row = await prisma.entitlement.findUnique({
      where: { userId_feature: { userId, feature } },
    });
    if (!row || row.status !== "active") return false;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return false;
    return true;
  }
  const map = await readMockEntitlements();
  return checkEntitlement(map, userId, feature);
}

export async function grantEntitlement(
  userId: string,
  feature: string,
  notes?: string,
): Promise<void> {
  if (isProductionMode()) {
    await prisma.entitlement.upsert({
      where: { userId_feature: { userId, feature } },
      create: { userId, feature, status: "active", notes },
      update: { status: "active", notes, activatedAt: new Date(), expiresAt: null },
    });
    return;
  }
  const map = await readMockEntitlements();
  await writeMockEntitlements(applyGrant(map, userId, feature));
}

export async function revokeEntitlement(userId: string, feature: string): Promise<void> {
  if (isProductionMode()) {
    await prisma.entitlement.updateMany({
      where: { userId, feature },
      data: { status: "revoked" },
    });
    return;
  }
  const map = await readMockEntitlements();
  await writeMockEntitlements(applyRevoke(map, userId, feature));
}
