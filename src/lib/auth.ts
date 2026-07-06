/**
 * Auth — sesi ber-DB (Postgres), offline-friendly. Bukan mock.
 *
 * Login (dev/demo) memilih user real per role dari tabel `users`, lalu membuat
 * baris `sessions` + cookie `authjs.session-token` (httpOnly). `auth()`
 * memvalidasi token ke DB dan mengembalikan user real. Middleware (`proxy.ts`)
 * memakai cookie `cw_role` non-httpOnly hanya untuk routing (bukan batas
 * keamanan — `auth()` + query ber-scope user adalah batas sebenarnya).
 *
 * Google OAuth bisa diaktifkan terpisah (butuh kredensial); jalur dev login di
 * sini cukup untuk demo penuh tanpa internet.
 */

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import { homeForRole, type UserRole } from "./roles";

export const SESSION_COOKIE = "authjs.session-token";
export const ROLE_COOKIE = "cw_role";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
};

export type Session = { user: SessionUser };

/** Validasi cookie sesi ke DB. `null` kalau tidak ada / kedaluwarsa. */
export async function auth(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

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

/** Login sebagai user real untuk sebuah role (dev/demo). */
export async function signInAs(role: UserRole): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { role },
    orderBy: { createdAt: "asc" },
  });
  if (!user) {
    throw new Error(
      `signInAs: tidak ada user real untuk role "${role}". Jalankan \`pnpm db:seed\`.`,
    );
  }

  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  const jar = await cookies();
  const base = { sameSite: "lax" as const, path: "/", expires };
  jar.set(SESSION_COOKIE, sessionToken, { ...base, httpOnly: true });
  jar.set(ROLE_COOKIE, role, { ...base, httpOnly: false });
}

/** Logout: hapus baris sesi + cookie. */
export async function signOut(options?: { redirectTo?: string }): Promise<never> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
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
