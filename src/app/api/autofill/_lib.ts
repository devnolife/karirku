/**
 * Helper bersama route /api/autofill/* — CORS untuk extension + resolusi
 * user dari bearer token.
 *
 * Catatan CORS: fetch dari background service worker extension dengan
 * host_permissions tidak terkena CORS, tapi header tetap dikirim agar
 * pengembangan (mis. dari popup/devtools) tidak tersandung preflight.
 */

import { NextResponse } from "next/server";
import { prisma } from "@devnolife/karirku-core/db";
import {
  bearerFromRequest,
  hashToken,
  tokenRecordIsActive,
  verifyToken,
} from "@devnolife/karirku-core/autofill/token";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function corsJson(body: unknown, init?: { status?: number }): NextResponse {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: CORS_HEADERS,
  });
}

export function corsPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Ambil userId dari bearer token. Dalam DB mode, token juga wajib masih
 * tercatat di `extension_tokens`; menghapus row tersebut langsung merevoke.
 */
export async function userFromRequest(req: Request): Promise<string | null> {
  const token = bearerFromRequest(req);
  const userId = verifyToken(token);
  if (!token || !userId) return null;
  if (!process.env.DATABASE_URL) return userId;

  const stored = await prisma.extensionToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, scope: true, expiresAt: true },
  });
  return tokenRecordIsActive(userId, stored) ? userId : null;
}

export function unauthorized(): NextResponse {
  return corsJson(
    { error: "unauthorized", message: "Extension token tidak valid atau kedaluwarsa" },
    { status: 401 },
  );
}
