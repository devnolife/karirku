import { google } from "googleapis";
import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gmailOAuthClient, GMAIL_READONLY_SCOPE } from "@/lib/gmail/oauth";
import { encryptSecret } from "@/lib/security/secrets";
import { GMAIL_STATE_COOKIE } from "../route";

function redirectResult(origin: string, value: string) {
  const url = new URL("/applications", origin);
  url.searchParams.set("gmail", value);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const session = await auth();
  if (!session?.user) return redirectResult(origin, "unauthenticated");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = req.cookies.get(GMAIL_STATE_COOKIE)?.value;
  if (!code || !state || !expected || state !== expected) {
    return redirectResult(origin, "state-error");
  }

  try {
    const stateHash = createHash("sha256").update(state).digest("hex");
    const consumed = await prisma.oAuthState.deleteMany({
      where: {
        userId: session.user.id,
        provider: "gmail",
        stateHash,
        expiresAt: { gt: new Date() },
      },
    });
    if (consumed.count !== 1) {
      return redirectResult(origin, "state-user-mismatch");
    }

    const client = gmailOAuthClient(origin);
    const { tokens } = await client.getToken(code);
    const existing = await prisma.gmailConnection.findUnique({
      where: { userId: session.user.id },
    });
    client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    const gmailEmail = profile.data.emailAddress?.toLowerCase() ?? null;
    const sameMailbox =
      Boolean(gmailEmail) &&
      existing?.email?.toLowerCase() === gmailEmail;
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptSecret(tokens.refresh_token)
      : sameMailbox
        ? existing?.encryptedRefreshToken
        : null;
    if (!encryptedRefreshToken) {
      return redirectResult(origin, "refresh-token-missing");
    }
    const scopes = (tokens.scope ?? GMAIL_READONLY_SCOPE)
      .split(/\s+/)
      .filter(Boolean);

    await prisma.gmailConnection.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        email: gmailEmail,
        encryptedAccessToken: tokens.access_token
          ? encryptSecret(tokens.access_token)
          : null,
        encryptedRefreshToken,
        tokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        scopes,
      },
      update: {
        email: gmailEmail,
        encryptedAccessToken: tokens.access_token
          ? encryptSecret(tokens.access_token)
          : existing?.encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : existing?.tokenExpiresAt,
        scopes,
      },
    });

    const response = redirectResult(origin, "connected");
    response.cookies.delete(GMAIL_STATE_COOKIE);
    return response;
  } catch (error) {
    console.error(
      `[gmail-oauth] callback gagal: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return redirectResult(origin, "callback-error");
  }
}
