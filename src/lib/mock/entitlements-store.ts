/**
 * Entitlement store — MOCK MODE (pola sama seperti `_overrides.ts` admin).
 *
 * Disimpan sebagai cookie JSON, path "/" (bukan "/admin") supaya bisa dibaca
 * dari halaman mana pun (mis. nanti dashboard Hunter), bukan cuma panel admin.
 *
 * Saat `isProductionMode()` aktif, `src/lib/entitlements.ts` tidak memakai
 * modul ini sama sekali — baca/tulis langsung ke tabel Prisma `entitlements`.
 */

import { cookies } from "next/headers";

const COOKIE = "kai_entitlements";
/** Cap jumlah user tercatat di cookie supaya tidak membengkak. */
const MAX_USERS = 100;

/** userId -> daftar feature key yang aktif untuknya. */
export type MockEntitlementMap = Record<string, string[]>;

const EMPTY: MockEntitlementMap = {};

export async function readMockEntitlements(): Promise<MockEntitlementMap> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as MockEntitlementMap;
    return parsed && typeof parsed === "object" ? parsed : EMPTY;
  } catch {
    // cookie korup → anggap tidak ada entitlement
    return EMPTY;
  }
}

function trim(map: MockEntitlementMap): MockEntitlementMap {
  const entries = Object.entries(map);
  if (entries.length <= MAX_USERS) return map;
  return Object.fromEntries(entries.slice(entries.length - MAX_USERS));
}

export async function writeMockEntitlements(next: MockEntitlementMap): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, encodeURIComponent(JSON.stringify(trim(next))), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// ---------------------------------------------------------------------------
// Fungsi murni (tidak menyentuh cookies/Next.js) — dipakai oleh
// src/lib/entitlements.ts dan diuji langsung di tests/entitlements/*.test.ts
// tanpa perlu request context Next.js.
// ---------------------------------------------------------------------------

export function checkEntitlement(
  map: MockEntitlementMap,
  userId: string,
  feature: string,
): boolean {
  return (map[userId] ?? []).includes(feature);
}

export function applyGrant(
  map: MockEntitlementMap,
  userId: string,
  feature: string,
): MockEntitlementMap {
  const set = new Set(map[userId] ?? []);
  set.add(feature);
  return { ...map, [userId]: [...set] };
}

export function applyRevoke(
  map: MockEntitlementMap,
  userId: string,
  feature: string,
): MockEntitlementMap {
  return { ...map, [userId]: (map[userId] ?? []).filter((f) => f !== feature) };
}
