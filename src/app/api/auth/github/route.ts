/**
 * GET /api/auth/github — mulai OAuth GitHub (Authorization Code flow).
 *
 * Scope minimal: `read:user user:email` — hanya profil publik + email.
 * TIDAK meminta scope `repo` (akses repo privat); data repo publik cukup
 * untuk sync skill dan memang sudah publik.
 */

import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export const STATE_COOKIE = "gh_oauth_state";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID belum diset di env." },
      { status: 501 },
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/github/callback", req.nextUrl.origin);

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri.toString());
  authorize.searchParams.set("scope", "read:user user:email");
  authorize.searchParams.set("state", state);

  const res = NextResponse.redirect(authorize);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
