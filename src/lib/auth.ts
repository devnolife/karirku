/**
 * MOCK MODE — NextAuth diganti stub ringan.
 * File asli di-backup sebagai referensi di comment kalau mau dipakai ulang:
 *   - adapter: PrismaAdapter(prisma)
 *   - providers: [Google(...)]
 * Di mode UI/UX demo, semua auth di-handle via src/lib/mock/session.ts.
 */

import { NextResponse } from "next/server";
import {
  getMockSession,
  signInDemo,
  signOutDemo,
  type MockSession,
} from "./mock/session";
import { redirect } from "next/navigation";

export async function auth(): Promise<MockSession> {
  return getMockSession();
}

export async function signIn(
  _provider?: string,
  options?: { redirectTo?: string },
): Promise<never> {
  await signInDemo();
  redirect(options?.redirectTo ?? "/dashboard");
}

export async function signOut(options?: { redirectTo?: string }): Promise<never> {
  await signOutDemo();
  redirect(options?.redirectTo ?? "/");
}

/** Stub handlers untuk route `/api/auth/[...nextauth]`. */
export const handlers = {
  GET: async () => NextResponse.json({ mock: true, mode: "ui-ux-demo" }),
  POST: async () => NextResponse.json({ mock: true, mode: "ui-ux-demo" }),
};
