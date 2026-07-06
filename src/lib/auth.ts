/**
 * Auth — DUAL MODE (pola sama seperti src/lib/db.ts).
 *
 * - `isProductionMode()` true  → NextAuth v5 asli: PrismaAdapter(prisma) +
 *   Google provider. Session diperkaya `user.id` + `user.role` dari tabel
 *   `users` (lihat prisma/schema.prisma).
 * - `isProductionMode()` false → fallback ke mock session yang sudah ada
 *   (src/lib/mock/session.ts) — perilaku demo tidak berubah sama sekali.
 *
 * Signature export (`auth`, `signIn`, `signOut`, `handlers`) sengaja
 * dipertahankan sama bentuknya di kedua mode supaya pemanggil (mis.
 * src/app/api/auth/[...nextauth]/route.ts, src/app/api/autofill/token/route.ts)
 * tidak perlu tahu/berubah saat mode berpindah.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextResponse, type NextRequest } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "./db";
import { isProductionMode } from "./mode";
import {
  getMockSession,
  signInDemo,
  signOutDemo,
  type MockSession,
} from "./mock/session";

/** Bentuk session yang dipakai konsumen di kedua mode. `null` = belum login. */
export type AppSession = MockSession | null;

// ---------------------------------------------------------------------------
// Production mode: NextAuth v5 asli, dibangun sekali di module scope kalau
// env lengkap. Kalau tidak, `real` tetap `null` dan semua fungsi di bawah
// otomatis jatuh ke jalur mock.
// ---------------------------------------------------------------------------
const real = isProductionMode()
  ? NextAuth({
      adapter: PrismaAdapter(prisma),
      providers: [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ],
      session: { strategy: "database" },
      pages: { signIn: "/login" },
      callbacks: {
        async session({ session, user }) {
          if (session.user) {
            const u = user as { id: string; role?: string };
            (session.user as { id?: string }).id = u.id;
            (session.user as { role?: string }).role = u.role ?? "jobseeker";
          }
          return session;
        },
      },
    })
  : null;

export async function auth(): Promise<AppSession> {
  if (real) {
    const session = await real.auth();
    return session ? (session as unknown as MockSession) : null;
  }
  return getMockSession();
}

export async function signIn(
  provider?: string,
  options?: { redirectTo?: string },
): Promise<never> {
  if (real) {
    return real.signIn(provider, options) as Promise<never>;
  }
  await signInDemo();
  redirect(options?.redirectTo ?? "/dashboard");
}

export async function signOut(options?: { redirectTo?: string }): Promise<never> {
  if (real) {
    return real.signOut(options) as Promise<never>;
  }
  await signOutDemo();
  redirect(options?.redirectTo ?? "/");
}

/** Handlers untuk route `/api/auth/[...nextauth]`. */
export const handlers: {
  GET: (req: NextRequest) => Promise<Response> | Response;
  POST: (req: NextRequest) => Promise<Response> | Response;
} = real
  ? real.handlers
  : {
      GET: async () => NextResponse.json({ mock: true, mode: "ui-ux-demo" }),
      POST: async () => NextResponse.json({ mock: true, mode: "ui-ux-demo" }),
    };
