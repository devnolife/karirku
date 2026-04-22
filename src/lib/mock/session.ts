import { cookies } from "next/headers";
import { MOCK_GOAL, MOCK_USER, type MockGoal, type MockUser } from "./data";

const DEMO_COOKIE = "kai_demo";
const GOAL_COOKIE = "kai_demo_goal";

export type MockSession = {
  user: MockUser;
};

/** Selalu kembalikan mock session — tidak ada auth di mode demo. */
export async function getMockSession(): Promise<MockSession> {
  return { user: MOCK_USER };
}

/** Tandai bahwa user sudah "masuk" (demo) — dipakai oleh halaman login. */
export async function signInDemo(): Promise<void> {
  const jar = await cookies();
  jar.set(DEMO_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function signOutDemo(): Promise<void> {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
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
