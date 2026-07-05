/**
 * POST /api/autofill/token — tukar sesi login karirku → extension token.
 * Dipanggil background worker extension dengan credentials: "include"
 * (cookie sesi ikut terkirim karena host_permissions).
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashToken, issueToken, TOKEN_SCOPE } from "@/lib/autofill/token";
import { corsJson, corsPreflight } from "../_lib";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    return corsJson(
      { error: "unauthenticated", message: "Login ke karirku dulu di tab browser" },
      { status: 401 },
    );
  }

  const { token, expiresAt } = issueToken(user.id);

  // Best-effort: catat hash token untuk audit/revocation (skip di mock mode).
  if (process.env.DATABASE_URL) {
    try {
      await prisma.extensionToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          scope: TOKEN_SCOPE,
          expiresAt,
        },
      });
    } catch (err) {
      console.warn(
        `[autofill] gagal mencatat extension token: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return corsJson({
    token,
    expiresAt: expiresAt.toISOString(),
    user: { id: user.id, name: user.name, email: user.email },
  });
}
