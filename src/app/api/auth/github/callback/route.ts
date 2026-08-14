/**
 * GET /api/auth/github/callback — tukar code → token, upsert user + account,
 * buat sesi, lalu sync skill dari bahasa repo publik (best-effort).
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@devnolife/karirku-core/db";
import { createSessionForUser } from "@/lib/auth";
import { homeForRole, type UserRole } from "@devnolife/karirku-core/roles";
import { syncGithubSkills } from "@/server/services/github-skills";
import { STATE_COOKIE } from "../route";

type GithubUser = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

/** Perbandingan panjang-konstan agar waktu balasan tidak membocorkan isi state. */
function stateMatches(received: string, expected: string): boolean {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function failRedirect(origin: string, reason: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return failRedirect(origin, "github_env");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !expectedState || !stateMatches(state, expectedState)) {
    return failRedirect(origin, "github_state");
  }

  // 1. Tukar authorization code → access token.
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: new URL("/api/auth/github/callback", origin).toString(),
    }),
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string; scope?: string };
  const accessToken = tokenJson.access_token;
  if (!accessToken) return failRedirect(origin, "github_token");

  const ghHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "craftworks-app",
  };

  // 2. Profil + email utama (email bisa null di profil publik).
  const userRes = await fetch("https://api.github.com/user", { headers: ghHeaders });
  if (!userRes.ok) return failRedirect(origin, "github_user");
  const ghUser = (await userRes.json()) as GithubUser;

  let email = ghUser.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers: ghHeaders });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      email =
        emails.find((e) => e.primary && e.verified)?.email ??
        emails.find((e) => e.verified)?.email ??
        null;
    }
  }
  if (!email) email = `${ghUser.login}@users.noreply.github.com`;

  // 3. Upsert user (role existing dipertahankan; user baru = jobseeker).
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: ghUser.name ?? ghUser.login,
      image: ghUser.avatar_url,
      role: "jobseeker",
      emailVerified: new Date(),
    },
    update: {
      name: ghUser.name ?? ghUser.login,
      image: ghUser.avatar_url,
    },
  });

  // 4. Upsert baris Account (Auth.js-compatible) — simpan token untuk sync.
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "github",
        providerAccountId: String(ghUser.id),
      },
    },
    create: {
      userId: user.id,
      type: "oauth",
      provider: "github",
      providerAccountId: String(ghUser.id),
      access_token: accessToken,
      token_type: "bearer",
      scope: tokenJson.scope ?? "read:user user:email",
    },
    update: { userId: user.id, access_token: accessToken },
  });

  // 5. Sesi + cookie.
  await createSessionForUser(user.id, user.role as UserRole);

  // 6. Sync skill dari repo publik — best-effort, jangan blokir login.
  try {
    await syncGithubSkills(user.id, accessToken);
  } catch (err) {
    console.warn("[github-callback] skill sync gagal:", err);
  }

  const res = NextResponse.redirect(new URL(homeForRole(user.role as UserRole), origin));
  res.cookies.delete(STATE_COOKIE);
  return res;
}
