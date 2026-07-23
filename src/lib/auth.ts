/**
 * Auth — DUAL MODE.
 *
 * Production (`DATABASE_URL` di-set): sesi ber-DB. Login (dev/demo) memilih
 * user real per role dari tabel `users`, membuat baris `sessions` + cookie
 * `authjs.session-token` (httpOnly). `auth()` memvalidasi token ke DB.
 *
 * Demo (`DATABASE_URL` kosong): sesi cookie murni — token `demo:<role>` +
 * user statis dari DEMO_USERS. Tanpa Postgres, alur login/logout tetap utuh.
 *
 * Middleware (`proxy.ts`) memakai cookie `cw_role` non-httpOnly hanya untuk
 * routing (bukan batas keamanan — `auth()` + query ber-scope user adalah
 * batas sebenarnya). Google OAuth opsional terpisah (butuh kredensial).
 */

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import { isProductionMode } from "./mode";
import { homeForRole, isValidRole, type UserRole } from "./roles";

export const SESSION_COOKIE = "authjs.session-token";
export const ROLE_COOKIE = "cw_role";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DEMO_TOKEN_PREFIX = "demo:";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
};

export type Session = { user: SessionUser };

/** Sesi demo dari token `demo:<role>` (tanpa DB). */
async function demoSession(token: string): Promise<Session | null> {
  if (!token.startsWith(DEMO_TOKEN_PREFIX)) return null;
  const role = token.slice(DEMO_TOKEN_PREFIX.length);
  if (!isValidRole(role)) return null;
  const { DEMO_USERS } = await import("./mock/demo");
  return { user: DEMO_USERS[role] };
}

/** Validasi cookie sesi. `null` kalau tidak ada / kedaluwarsa. */
export async function auth(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  if (!isProductionMode()) return demoSession(token);

  const row = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });
  if (!row || row.expires < new Date()) return null;

  const u = row.user;
  return {
    user: {
      id: u.id,
      name: u.name ?? u.email,
      email: u.email,
      image: u.image,
      role: u.role as UserRole,
    },
  };
}

/** User aktif atau redirect ke /login. Dipakai halaman di balik middleware. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session) redirect("/login");
  return session.user;
}

/** Bentuk { user } non-null (redirect kalau belum login). Pengganti getMockSession. */
export async function getSession(): Promise<Session> {
  const user = await requireUser();
  return { user };
}

/** Role aktif, atau null kalau belum login. */
export async function getRole(): Promise<UserRole | null> {
  const session = await auth();
  return session?.user.role ?? null;
}

/** Login sebagai user untuk sebuah role (dev/demo). */
export async function signInAs(role: UserRole): Promise<void> {
  const jar = await cookies();
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  const base = { sameSite: "lax" as const, path: "/", expires };

  if (!isProductionMode()) {
    // Demo: token cookie murni, tanpa baris DB.
    jar.set(SESSION_COOKIE, `${DEMO_TOKEN_PREFIX}${role}`, { ...base, httpOnly: true });
    jar.set(ROLE_COOKIE, role, { ...base, httpOnly: false });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { role },
    orderBy: { createdAt: "asc" },
  });
  if (!user) {
    throw new Error(
      `signInAs: tidak ada user real untuk role "${role}". Jalankan \`pnpm db:seed\`.`,
    );
  }

  await createSessionForUser(user.id, user.role as UserRole);
}

/** Buat sesi DB + cookie untuk user tertentu (dipakai dev login & OAuth). */
export async function createSessionForUser(
  userId: string,
  role: UserRole,
): Promise<void> {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { sessionToken, userId, expires },
  });

  const jar = await cookies();
  const base = { sameSite: "lax" as const, path: "/", expires };
  jar.set(SESSION_COOKIE, sessionToken, { ...base, httpOnly: true });
  jar.set(ROLE_COOKIE, role, { ...base, httpOnly: false });
}

/** Logout: hapus baris sesi (kalau ada DB) + cookie. */
export async function signOut(options?: { redirectTo?: string }): Promise<never> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && isProductionMode() && !token.startsWith(DEMO_TOKEN_PREFIX)) {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(ROLE_COOKIE);
  redirect(options?.redirectTo ?? "/");
}

/** Server action helper: login lalu redirect ke home role. */
export async function signIn(role: UserRole): Promise<never> {
  await signInAs(role);
  redirect(homeForRole(role));
}

/**
 * Handler untuk route `/api/auth/[...nextauth]`. Google OAuth belum diaktifkan
 * (butuh kredensial); endpoint melaporkan status agar tidak 404.
 */
export const handlers = {
  GET: async () => NextResponse.json({ ok: true, strategy: "db-session" }),
  POST: async () => NextResponse.json({ ok: true, strategy: "db-session" }),
};
