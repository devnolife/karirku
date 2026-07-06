/**
 * Admin overrides — penyimpanan status hasil aksi admin di MOCK MODE.
 *
 * Pola sama dengan saveGoal di src/lib/mock/session.ts: cookie JSON.
 * Saat DATABASE_URL aktif nanti, ganti isi server action di _actions.ts ke
 * prisma.job.update / prisma.user.update — modul ini dan UI tidak berubah.
 */

import { cookies } from "next/headers";
import type { AdminJob, AdminUser } from "@/lib/mock/data";

const COOKIE = "kai_admin_overrides";
/** Cap jumlah id per tipe agar cookie tidak membengkak. */
const MAX_ENTRIES = 100;

export type AdminOverrides = {
  jobs: Record<string, AdminJob["status"]>;
  users: Record<string, AdminUser["status"]>;
};

const EMPTY: AdminOverrides = { jobs: {}, users: {} };

export async function readAdminOverrides(): Promise<AdminOverrides> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<AdminOverrides>;
    return {
      jobs: parsed.jobs ?? {},
      users: parsed.users ?? {},
    };
  } catch {
    // cookie korup → anggap tidak ada override
    return EMPTY;
  }
}

function trim<T extends string>(map: Record<string, T>): Record<string, T> {
  const entries = Object.entries(map);
  if (entries.length <= MAX_ENTRIES) return map;
  return Object.fromEntries(entries.slice(entries.length - MAX_ENTRIES));
}

export async function writeAdminOverrides(next: AdminOverrides): Promise<void> {
  const jar = await cookies();
  jar.set(
    COOKIE,
    encodeURIComponent(
      JSON.stringify({ jobs: trim(next.jobs), users: trim(next.users) }),
    ),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 30,
    },
  );
}

/** Terapkan override status ke daftar jobs mock. */
export function applyJobOverrides(
  jobs: AdminJob[],
  overrides: AdminOverrides,
): AdminJob[] {
  return jobs.map((j) =>
    overrides.jobs[j.id] ? { ...j, status: overrides.jobs[j.id] } : j,
  );
}

/** Terapkan override status ke daftar users mock. */
export function applyUserOverrides(
  users: AdminUser[],
  overrides: AdminOverrides,
): AdminUser[] {
  return users.map((u) =>
    overrides.users[u.id] ? { ...u, status: overrides.users[u.id] } : u,
  );
}
