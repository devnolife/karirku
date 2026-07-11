/**
 * POST /api/autofill/token — tukar sesi login karirku → extension token.
 * Dipanggil background worker extension dengan credentials: "include"
 * (cookie sesi ikut terkirim karena host_permissions).
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  bearerFromRequest,
  hashToken,
  issueToken,
  TOKEN_SCOPE,
} from "@/lib/autofill/token";
import { corsJson, corsPreflight, userFromRequest } from "../_lib";

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

  // Dalam DB mode pencatatan wajib berhasil karena row ini juga menjadi
  // sumber revocation. Jangan menerbitkan token yang langsung tidak valid.
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$transaction([
        prisma.extensionToken.deleteMany({
          where: { userId: user.id, expiresAt: { lte: new Date() } },
        }),
        prisma.extensionToken.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            scope: TOKEN_SCOPE,
            expiresAt,
          },
        }),
      ]);
    } catch (err) {
      console.error(
        `[autofill] gagal menerbitkan extension token: ${err instanceof Error ? err.message : String(err)}`,
      );
      return corsJson(
        {
          error: "token_store_failed",
          message: "Token extension tidak dapat disimpan. Coba lagi.",
        },
        { status: 503 },
      );
    }
  }

  return corsJson({
    token,
    expiresAt: expiresAt.toISOString(),
    user: { id: user.id, name: user.name, email: user.email },
  });
}

/** Revoke seluruh token extension milik user yang sedang login. */
export async function DELETE(req: Request) {
  const bearer = bearerFromRequest(req);

  // Extension disconnect: revoke exactly the presented token. The browser may
  // currently be logged into another account, so never prefer that cookie.
  if (bearer) {
    const tokenUserId = await userFromRequest(req);
    if (!tokenUserId) {
      return corsJson(
        { error: "unauthenticated", message: "Token extension tidak valid." },
        { status: 401 },
      );
    }
    if (!process.env.DATABASE_URL) {
      return corsJson({ ok: true, revoked: 0 });
    }
    const result = await prisma.extensionToken.deleteMany({
      where: { userId: tokenUserId, tokenHash: hashToken(bearer) },
    });
    return corsJson({ ok: true, revoked: result.count });
  }

  // Website account settings: without bearer, revoke every token for session.
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) {
    return corsJson(
      { error: "unauthenticated", message: "Login diperlukan." },
      { status: 401 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return corsJson({ ok: true, revoked: 0 });
  }

  const result = await prisma.extensionToken.deleteMany({
    where: { userId },
  });
  return corsJson({ ok: true, revoked: result.count });
}
