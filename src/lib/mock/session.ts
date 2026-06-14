import { cookies } from "next/headers";
import {
  MOCK_GOAL,
  MOCK_USERS,
  ROLE_LABEL,
  type MockGoal,
  type MockUser,
  type UserRole,
} from "./data";

const DEMO_COOKIE = "kai_demo";
const ROLE_COOKIE = "kai_demo_role";
const GOAL_COOKIE = "kai_demo_goal";

export type MockSession = {
  user: MockUser;
};

const VALID_ROLES: UserRole[] = ["jobseeker", "freelancer", "company", "admin"];

export function isValidRole(value: string | undefined | null): value is UserRole {
  return !!value && (VALID_ROLES as string[]).includes(value);
}

/** Home route default per role. */
export function homeForRole(role: UserRole): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

export { ROLE_LABEL };

/** Ambil role aktif dari cookie. Default jobseeker. */
export async function getRole(): Promise<UserRole> {
  const jar = await cookies();
  const raw = jar.get(ROLE_COOKIE)?.value;
  return isValidRole(raw) ? raw : "jobseeker";
}

/** Kembalikan mock session sesuai role yang dipilih saat login (demo). */
export async function getMockSession(): Promise<MockSession> {
  const role = await getRole();
  return { user: MOCK_USERS[role] };
}

/** Tandai user "masuk" (demo) sebagai role tertentu — dipakai halaman login. */
export async function signInDemo(role: UserRole = "jobseeker"): Promise<void> {
  const jar = await cookies();
  const opts = {
    httpOnly: false,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
  jar.set(DEMO_COOKIE, "1", opts);
  jar.set(ROLE_COOKIE, role, opts);
}

export async function signOutDemo(): Promise<void> {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  jar.delete(ROLE_COOKIE);
  jar.delete(GOAL_COOKIE);
}

export async function isSignedInDemo(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(DEMO_COOKIE)?.value === "1";
}

/** Ambil goal dari cookie kalau ada; fallback ke MOCK_GOAL. */
export async function getGoal(): Promise<MockGoal | null> {
  const jar = await cookies();
  const raw = jar.get(GOAL_COOKIE)?.value;
  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as MockGoal;
      if (parsed && typeof parsed.targetRole === "string") return parsed;
    } catch {
      // fallthrough
    }
  }
  // kalau demo user, anggap sudah punya goal default agar dashboard langsung rich
  return MOCK_GOAL;
}

export async function saveGoal(goal: MockGoal): Promise<void> {
  const jar = await cookies();
  jar.set(GOAL_COOKIE, encodeURIComponent(JSON.stringify(goal)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
