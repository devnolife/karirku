/**
 * Store DEMO MODE berbasis cookie — supaya interaksi (simpan goal, apply job)
 * tetap terasa nyata tanpa Postgres. Mengikuti pola entitlements-store.ts:
 * cookie JSON kecil + toleran korupsi.
 */

import { cookies } from "next/headers";
import type { UserGoal } from "@/server/queries/goal";

const GOAL_COOKIE = "kai_demo_goal";
const APPLIED_COOKIE = "kai_demo_applied";
const MAX_APPLIED = 50;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/* ---------------- Goal ---------------- */

export async function readDemoGoal(): Promise<UserGoal | null> {
  const raw = (await cookies()).get(GOAL_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as UserGoal;
    return parsed && typeof parsed.targetRole === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeDemoGoal(goal: UserGoal): Promise<void> {
  const jar = await cookies();
  jar.set(GOAL_COOKIE, encodeURIComponent(JSON.stringify(goal)), COOKIE_OPTS);
}

/* ---------------- Applied job ids ---------------- */

export async function readDemoAppliedIds(): Promise<Set<string>> {
  const raw = (await cookies()).get(APPLIED_COOKIE)?.value;
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

export async function addDemoAppliedId(jobId: string): Promise<void> {
  const ids = await readDemoAppliedIds();
  ids.add(jobId);
  const jar = await cookies();
  jar.set(
    APPLIED_COOKIE,
    encodeURIComponent(JSON.stringify([...ids].slice(-MAX_APPLIED))),
    COOKIE_OPTS,
  );
}
