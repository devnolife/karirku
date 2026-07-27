import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@devnolife/karirku-core/db";
import {
  GMAIL_READONLY_SCOPE,
  gmailOAuthClient,
} from "@devnolife/karirku-core/gmail/oauth";

export const GMAIL_STATE_COOKIE = "gmail_oauth_state";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  let client;
  try {
    client = gmailOAuthClient(req.nextUrl.origin);
  } catch {
    return NextResponse.json(
      { error: "Google OAuth belum dikonfigurasi." },
      { status: 501 },
    );
  }

  const existing = await prisma.gmailConnection.findUnique({
    where: { userId: session.user.id },
    select: { encryptedRefreshToken: true },
  });
  const state = randomBytes(24).toString("hex");
  const stateHash = createHash("sha256").update(state).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60_000);
  await prisma.$transaction([
    prisma.oAuthState.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: new Date() } },
          { userId: session.user.id, provider: "gmail" },
        ],
      },
    }),
    prisma.oAuthState.create({
      data: {
        userId: session.user.id,
        provider: "gmail",
        stateHash,
        expiresAt,
      },
    }),
  ]);
  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    scope: [GMAIL_READONLY_SCOPE],
    state,
    ...(existing?.encryptedRefreshToken ? {} : { prompt: "consent" }),
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(GMAIL_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return response;
}
